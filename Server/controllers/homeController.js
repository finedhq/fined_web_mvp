import { supabase } from "../supabaseClient.js";
import { sendNotification } from "../notifications.js";

export const fetchData = async (req, res) => {
    const { email, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const currentMonth = now.toLocaleString("default", { month: "long" });
        const year = now.getFullYear();
        const lastDayOfMonth = new Date(year, now.getMonth() + 1, 0).toISOString().split("T")[0];

        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        const currentWeekStr = currentWeekStart.toISOString().split("T")[0];

        // Parallel fetch: feedback + user
        const [feedbackRes, userRes] = await Promise.all([
            supabase.from("user_feedbacks").select("id").eq("email", email).maybeSingle(),
            supabase.from("users").select("*").eq("user_sub", userId).maybeSingle()
        ]);

        if (feedbackRes.error && feedbackRes.error.code !== "PGRST116") throw feedbackRes.error;

        let showFeedback = !feedbackRes.data && userRes.data;

        let userData = userRes.data;
        if (!userData) {
            const { data, error } = await supabase.from("users").insert([{
                user_sub: userId,
                email,
                streak_count: 1,
                last_date: todayStr,
                fin_stars: 0
            }]).select().single();
            if (error) throw error;
            userData = data;
        }

        // Streak Management
        let newStreak = userData.streak_count || 1;
        const lastVisit = userData.last_date?.split("T")[0];

        if (lastVisit === yesterdayStr) {
            newStreak++;
            if (newStreak === 3) sendNotification(email, "🔥 You're on a 3-day streak!");
        } else if (lastVisit !== todayStr) {
            newStreak = 1;
            sendNotification(email, "⚠️ Streak reset. Try to be more consistent.");
        }

        const updateFields = { streak_count: newStreak, last_date: todayStr };

        // Weekly Logic
        let {
            active_days_this_week = 0,
            week_start_date,
            weekly_streak_count = 0,
            last_active_date,
            inactivity_days = 0,
            consistency_rewarded_this_week = false,
            consistency_score = 0,
            article_score = 0,
            expense_score = 0,
            course_score = 0
        } = userData;

        const oldTotal = article_score + expense_score + consistency_score + course_score;
        const reasons = [];

        if (week_start_date !== currentWeekStr) {
            active_days_this_week = 0;
            week_start_date = currentWeekStr;
            consistency_rewarded_this_week = false;
        }

        if (last_active_date !== todayStr) {
            const lastActive = new Date(last_active_date || todayStr);
            const diff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
            active_days_this_week++;
            last_active_date = todayStr;
            inactivity_days += diff;
        }

        if (active_days_this_week === 5 && !consistency_rewarded_this_week) {
            consistency_score += 10;
            weekly_streak_count++;
            consistency_rewarded_this_week = true;
            reasons.push("+10 for 5 active days this week");
        }

        if (weekly_streak_count === 4) {
            consistency_score += 20;
            weekly_streak_count = 0;
            reasons.push("+20 for 4-week consistency streak");
        }

        if (inactivity_days >= 7) {
            const penalty = Math.floor(inactivity_days / 7);
            consistency_score -= 10 * penalty;
            inactivity_days %= 7;
            reasons.push(`-${10 * penalty} for inactivity`);
        }

        consistency_score = Math.max(0, Math.min(200, consistency_score));
        const newTotal = article_score + expense_score + consistency_score + course_score;

        // Score Log
        const updateUser = supabase
            .from("users")
            .update({
                ...updateFields,
                active_days_this_week,
                week_start_date,
                weekly_streak_count,
                last_active_date,
                inactivity_days,
                consistency_rewarded_this_week,
                consistency_score
            })
            .eq("user_sub", userId);

        const insertLog = newTotal !== oldTotal
            ? supabase.from("finScoreLogs").insert({
                email,
                old_score: oldTotal,
                new_score: newTotal,
                change: newTotal - oldTotal,
                description: reasons.join(" | ")
            })
            : null;

        // Parallel: Rank + Content + Ongoing course (if any)
        const [allUsersRes, articleRes, courseRes, ongoingCourseRes] = await Promise.all([
            supabase.from("users").select("user_sub, fin_stars").order("fin_stars", { ascending: false }),
            supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(1).single(),
            supabase.from("courses").select("*").order("created_at", { ascending: false }).limit(8),
            userData.ongoing_course_id
                ? supabase.from("courses").select("*").eq("id", userData.ongoing_course_id).single()
                : Promise.resolve({ data: null })
        ]);

        const allUsers = allUsersRes.data || [];
        let rank = 1, userRank = null, lastStars = null;
        for (let i = 0; i < allUsers.length; i++) {
            const currentStars = allUsers[i].fin_stars;
            if (currentStars !== lastStars) {
                rank = i + 1;
                lastStars = currentStars;
            }
            if (allUsers[i].user_sub === userId) {
                userRank = rank;
                break;
            }
        }

        // Await pending updates
        await Promise.all([updateUser, insertLog]);

        res.json({
            showFeedback,
            featuredArticle: articleRes.data,
            recommendedCourses: courseRes.data,
            userData: {
                fin_stars: userData.fin_stars,
                streak_count: newStreak,
                rank: userRank,
                ongoing_course_id: userData.ongoing_course_id,
                ongoing_module_id: userData.ongoing_module_id,
                fin_score: newTotal
            },
            ongoingCourseData: ongoingCourseRes.data
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to fetch data: ${err.message}` });
    }
};

export const fetchLeaderBoard = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("user_sub, email, fin_stars")
            .order("fin_stars", { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
};

export const fetchNotifications = async (req, res) => {
    const { email } = req.body
    try {
        const { data, error } = await supabase
            .from("notifications")
            .select("email, content, seen, created_at")
            .match({ email })
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const updateNotifications = async (req, res) => {
    const { email } = req.body
    try {
        const { data, error } = await supabase
            .from("notifications")
            .update({ "seen": true })
            .match({ email, seen: false })

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
};

export const hasUnseen = async (req, res) => {
    const { email } = req.body
    try {
        const { data, error } = await supabase
            .from("notifications")
            .select("seen")
            .match({ email })
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        const hasUnseen = data?.some(notif => notif.seen === false) || false;

        res.json(hasUnseen);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const fetchFinScoreLogs = async (req, res) => {
    const { email } = req.body
    try {
        const { data, error } = await supabase
            .from("finScoreLogs")
            .select("*")
            .match({ email })
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch fin score history." });
    }
};

export const saveFeedback = async (req, res) => {
    const { form } = req.body;

    if (!form) {
        return res.status(400).json({ error: "Missing feedback data." });
    }

    try {
        const { error } = await supabase
            .from("user_feedbacks")
            .insert(form);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ message: "Feedback saved successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to save feedback." });
    }
};

const getCombinations = (arr, size) => {
    const result = [];
    const combine = (start, path) => {
        if (path.length === size) return result.push([...path]);
        for (let i = start; i < arr.length; i++) combine(i + 1, [...path, arr[i]]);
    };
    combine(0, []);
    return result;
};

const normalizeTag = (tag) =>
    tag.toLowerCase().replace(/\s*:\s*/g, ":").replace(/\s+/g, "").trim();

export const getRecommendations = async (req, res) => {
    const { email, course_id } = req.body;

    try {
        // === CASE 1: course_id is null -> return stored recommendations from user profile ===
        if (!course_id) {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("recommended_schemes")
                .eq("email", email)
                .single();

            if (userError) throw userError;

            const fallbackIds = (userData?.recommended_schemes || [])
                .map(id => parseInt(id)) // convert strings like '7' to numbers like 7
                .filter(id => Number.isInteger(id));

            const { data: fallbackSchemes, error: fallbackError } = await supabase
                .from("allSchemes")
                .select("*")
                .in("id", fallbackIds);

            if (fallbackError) throw fallbackError;

            return res.status(200).json({ recommendations: fallbackSchemes });
        }

        // === CASE 2: course_id is present -> compute fresh recommendations ===
        const [progressRes, schemesRes] = await Promise.all([
            supabase
                .from("userCourses")
                .select("answer_tags")
                .match({ email, course_id, progress_type: "card", status: "completed" }),
            supabase.from("allSchemes").select("*")
        ]);

        if (progressRes.error) throw progressRes.error;
        if (schemesRes.error) throw schemesRes.error;

        const userTagFrequency = new Map();

        for (const row of progressRes.data) {
            const tags = row.answer_tags;
            if (Array.isArray(tags)) {
                tags.forEach(tag => {
                    const norm = normalizeTag(tag);
                    if (norm) userTagFrequency.set(norm, (userTagFrequency.get(norm) || 0) + 1);
                });
            } else if (typeof tags === 'string') {
                tags.split(";").forEach(tag => {
                    const norm = normalizeTag(tag);
                    if (norm) userTagFrequency.set(norm, (userTagFrequency.get(norm) || 0) + 1);
                });
            }
        }

        const sortedUserTags = Array.from(userTagFrequency.entries()).sort((a, b) => b[1] - a[1]);
        const importantUserTags = sortedUserTags.filter(([tag, freq], index) => freq >= 2 || index < 8);
        const allImportantTags = importantUserTags.map(([tag]) => tag);

        const parsedSchemes = schemesRes.data.map(scheme => {
            let rawTags = [];
            if (Array.isArray(scheme.tags)) rawTags = scheme.tags;
            else if (typeof scheme.tags === "string") {
                try {
                    rawTags = JSON.parse(scheme.tags);
                } catch {
                    rawTags = scheme.tags.split(/[;,]/);
                }
            }

            const normalizedTags = new Set(rawTags.map(tag => normalizeTag(tag)).filter(Boolean));
            return { ...scheme, normalizedTags };
        });

        const matchedSchemesSet = new Set();
        for (let size = Math.min(5, allImportantTags.length); size >= 1; size--) {
            const combos = getCombinations(allImportantTags, size);
            for (const combo of combos) {
                for (const scheme of parsedSchemes) {
                    if (combo.every(tag => scheme.normalizedTags.has(tag))) {
                        matchedSchemesSet.add(scheme);
                    }
                }
            }
            if (matchedSchemesSet.size > 0) break;
        }

        const finalSchemes = matchedSchemesSet.size > 0
            ? Array.from(matchedSchemesSet)
            : parsedSchemes;

        const scoredSchemes = finalSchemes.map(scheme => {
            let score = 0;
            const matchedTags = [];

            importantUserTags.forEach(([tag, freq], index) => {
                const weight = Math.pow((importantUserTags.length - index), 2);
                if (scheme.normalizedTags.has(tag)) {
                    score += freq * weight;
                    matchedTags.push(tag);
                }
            });

            return { ...scheme, matchCount: score, matchedTags };
        });

        const topSchemes = scoredSchemes
            .filter(s => s.matchCount > 0)
            .sort((a, b) => b.matchCount - a.matchCount)
            .slice(0, 5);

        if (topSchemes.length > 0) {
            const schemeIds = topSchemes.map(s => s.id).filter(id => Number.isInteger(id));
            const { error: updateError } = await supabase
                .from("users")
                .update({ recommended_schemes: schemeIds })
                .eq("email", email);

            if (updateError) throw updateError;

            return res.status(200).json({ recommendations: topSchemes });
        }

        // fallback if scoring fails (optional)
        return res.status(200).json({ recommendations: [] });

    } catch (err) {
        console.error("Recommendation Error:", err.message);
        return res.status(500).json({ error: "Failed to fetch recommendations" });
    }
};


// if (today === lastDayOfMonth) {
//     const { data: budgetData, error: budgetError } = await supabase
//         .from("budgets")
//         .select("email, limit")
//         .match({ month, year, category: "Monthly" });

//     if (budgetError) throw budgetError;

//     for (const { email: userEmail, limit } of budgetData) {

//         const { data: spentData, error: spentError } = await supabase
//             .from("transaction_summary")
//             .select("expense")
//             .match({ email: userEmail, month, year })
//             .maybeSingle();

//         if (spentError) throw spentError

//         const expense = spentData?.expense || 0;
//         const bonus = expense <= limit ? 20 : 0;

//         const { data: scoreData, error: scoreError } = await supabase
//             .from("users")
//             .select("expense_score")
//             .match({ email: userEmail })
//             .maybeSingle();

//         if (scoreError) throw scoreError;

//         const currentScore = scoreData?.expense_score || 0;
//         const updatedScore = Math.max(0, Math.min(150, currentScore + bonus))

//         const { error: updateError } = await supabase
//             .from("users")
//             .update({ "expense_score": updatedScore })
//             .match({ email: userEmail })

//         if (updateError) throw updateError

//         if (bonus > 0) {
//             const content = `🎉 You stayed within your monthly budget for ${month} and earned +20 Fin Score! Great job!`;

//             const sevenDaysAgo = new Date();
//             sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//             const { data: existing, error: existingError } = await supabase
//                 .from("notifications")
//                 .select("id")
//                 .eq("email", userEmail)
//                 .eq("content", content)
//                 .gte("created_at", sevenDaysAgo.toISOString())
//                 .maybeSingle();

//             if (existingError) throw existingError;

//             if (!existing) {
//                 await sendNotification(userEmail, content);
//             }
//         }
//     }
// }