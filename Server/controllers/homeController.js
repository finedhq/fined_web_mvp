import { supabase } from "../supabaseClient.js";

export const fetchData = async (req, res) => {
    const { email, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = 1;
        let userData = null;

        const { data: candidate, error: userFetchError } = await supabase
            .from("users")
            .select("*")
            .eq("user_sub", userId)
            .single();

        if (userFetchError && userFetchError.code !== "PGRST116") throw userFetchError;

        if (!candidate) {
            const { data: insertData, error: insertError } = await supabase
                .from("users")
                .insert([{
                    user_sub: userId,
                    email: email,
                    streak_count: 1,
                    last_date: today,
                    fin_stars: 0,
                    ongoing_course_id: null,
                    ongoing_module_id: null
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            userData = insertData;
        } else {
            const lastvisit = candidate.last_date?.split("T")[0];

            if (lastvisit === yesterdayStr) {
                newStreak = candidate.streak_count + 1;
            } else if (lastvisit === today) {
                newStreak = candidate.streak_count;
            } else {
                newStreak = 1;
            }

            if (lastvisit !== today) {
                const { data: updatedUser, error: updateError } = await supabase
                    .from("users")
                    .update({
                        streak_count: newStreak,
                        last_date: today,
                    })
                    .eq("user_sub", userId)
                    .select()
                    .single();

                if (updateError) throw updateError;

                userData = updatedUser;
            } else {
                userData = candidate;
            }
        }

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
                ongoing_module_id: userData.ongoing_module_id
            },
            ongoingCourseData
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

