import { supabase } from "../supabaseClient.js";
import { sendNotification } from "../notifications.js";

export const fetchData = async (req, res) => {
    const { email, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const yesterdayStr = new Date(now.setDate(now.getDate() - 1)).toISOString().split("T")[0];
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();
        const lastDayOfMonth = new Date(year, new Date().getMonth() + 1, 0).toISOString().split("T")[0];

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

        const { data: userRecord, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("user_sub", userId)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

        let newStreak = 1;
        let userData = userRecord;

        if (!userData) {
            const { data, error } = await supabase
                .from("users")
                .insert([{
                    user_sub: userId,
                    email,
                    streak_count: 1,
                    last_date: today,
                    fin_stars: 0,
                    ongoing_course_id: null,
                    ongoing_module_id: null,
                    article_streak_count: null,
                    article_score: null
                }])
                .select()
                .single();

            if (error) throw error;

            userData = data;

            const { error: firstTaskError } = await supabase
                .from("user_tasks")
                .insert({
                    email,
                    date: today,
                    login: true
                });

            if (firstTaskError) throw firstTaskError;
        }
        else {
            const lastvisit = userData.last_date?.split("T")[0];

            if (lastvisit === yesterdayStr) {
                newStreak = userData.streak_count + 1;
                if (newStreak === 3) {
                    await sendNotification(email, "🔥 You're on a 3-day streak!");
                }
            } else if (lastvisit === today) {
                newStreak = userData.streak_count;
            } else {
                newStreak = 1;
                await sendNotification(email, "⚠️ Streak reset. Try to be more consistent.");
            }

            if (lastvisit !== today) {
                const { data, error } = await supabase
                    .from("users")
                    .update({
                        streak_count: newStreak,
                        last_date: today,
                    })
                    .eq("user_sub", userId)
                    .select()
                    .single();

                if (error) throw error;

                userData = data;

                await supabase
                    .from("user_tasks")
                    .delete()
                    .eq("email", email)
                    .neq("date", today);

                const { error: taskUpdateError } = await supabase
                    .from("user_tasks")
                    .upsert(
                        {
                            email,
                            date: today,
                            login: true,
                        },
                        { onConflict: ["email", "date"] }
                    );

                if (taskUpdateError) throw taskUpdateError;
            }
        }

        const { data: userTasksRaw, error: taskFetchError } = await supabase
            .from("user_tasks")
            .select("login, module, article, transaction")
            .eq("email", email)
            .eq("date", today)
            .maybeSingle();

        if (taskFetchError && taskFetchError.code !== "PGRST116") throw taskFetchError;

        const userTasks = userTasksRaw || {};

        const allTasksDone =
            userTasks.login &&
            userTasks.module &&
            userTasks.article &&
            userTasks.transaction;

        if (allTasksDone) {
            const content = "✅ You completed all your daily tasks today! Keep it up! 💪";

            const { data: existingNotif, error: notifError } = await supabase
                .from("notifications")
                .select("id")
                .eq("email", email)
                .eq("content", content)
                .gte("created_at", new Date().toISOString().split("T")[0])
                .maybeSingle();

            if (notifError) throw notifError;

            if (!existingNotif) {
                await sendNotification(email, content);
            }
        }

        const tasks = userTasks || {
            login: false,
            module: false,
            article: false,
            transaction: false
        };

        const isActiveToday = tasks.module || tasks.article || tasks.transaction;

        const todayDate = new Date();
        const todayStr = todayDate.toISOString().split("T")[0];
        const currentWeekStart = new Date(todayDate);
        currentWeekStart.setDate(todayDate.getDate() - todayDate.getDay());
        const currentWeekStr = currentWeekStart.toISOString().split("T")[0];

        let {
            active_days_this_week = 0,
            week_start_date,
            weekly_streak_count = 0,
            last_active_date,
            inactivity_days = 0,
            consistency_score = 0
        } = userData;

        // 2. Reset active_days if week has changed
        if (week_start_date !== currentWeekStr) {
            active_days_this_week = 0;
            week_start_date = currentWeekStr;
        }

        // 3. Update active_days_this_week
        if (isActiveToday && last_active_date !== todayStr) {
            active_days_this_week += 1;
            last_active_date = todayStr;
            inactivity_days = 0;
        } else if (!isActiveToday && last_active_date !== todayStr) {
            const last = new Date(last_active_date || todayStr);
            const diff = Math.floor((todayDate - last) / (1000 * 60 * 60 * 24));
            inactivity_days += diff;
        }

        // 4. Apply +10 for 5+ active days this week
        if (active_days_this_week === 5) {
            consistency_score += 10;
            weekly_streak_count += 1;
        }

        // 5. Apply +20 bonus for 4-week streak
        if (weekly_streak_count === 4) {
            consistency_score += 20;
            weekly_streak_count = 0; // reset streak
        }

        // 6. Apply -10 if inactivity reached 7
        if (inactivity_days >= 7) {
            const penaltyTimes = Math.floor(inactivity_days / 7);
            consistency_score -= 10 * penaltyTimes;
            inactivity_days = inactivity_days % 7;
        }

        // 7. Clamp consistency_score between 0–200
        consistency_score = Math.max(0, Math.min(200, consistency_score));

        await supabase
            .from("users")
            .update({
                active_days_this_week,
                week_start_date,
                weekly_streak_count,
                last_active_date,
                inactivity_days,
                consistency_score
            })
            .eq("user_sub", userId);

        const { data: allUsers, error: rankError } = await supabase
            .from("users")
            .select("user_sub, fin_stars")
            .order("fin_stars", { ascending: false });

        if (rankError) throw rankError;

        let rank = 1;
        let lastStars = null;
        let userRank = null;

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

        const { data: featuredArticle, error: articleError } = await supabase
            .from("articles")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (articleError) throw articleError;

        const { data: recommendedCourses, error: coursesError } = await supabase
            .from("courses")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(8);

        if (coursesError) throw coursesError;

        let ongoingCourseData = null;

        if (userData.ongoing_course_id) {
            const { data: courseInfo, error: courseInfoError } = await supabase
                .from("courses")
                .select("*")
                .eq("id", userData.ongoing_course_id)
                .single();

            if (courseInfoError) throw courseInfoError;

            ongoingCourseData = courseInfo;
        }

        res.json({
            featuredArticle,
            recommendedCourses,
            userData: {
                fin_stars: userData.fin_stars,
                streak_count: newStreak,
                rank,
                ongoing_module_id: userData.ongoing_course_id,
                ongoing_module_id: userData.ongoing_module_id,
                fin_score: (userData.article_score || 0) + (userData.consistency_score || 0) + (userData.expense_score || 0)
            },
            ongoingCourseData,
            tasks
        });

    } catch (err) {
        console.log(err)
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