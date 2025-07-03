import { supabase } from "../supabaseClient.js";
const BUCKET_NAME = process.env.SUPABASE_BUCKET;

export const addCourse = async (req, res) => {
  try {
    const { title, description, modules_count, duration } = req.body;
    const thumbnailFile = req.file;
    let thumbnail_url = "";

    if (thumbnailFile) {
      const filePath = `thumbnails/${title.replace(/ /g, "_")}_${thumbnailFile.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, thumbnailFile.buffer, {
          contentType: thumbnailFile.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      thumbnail_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          modules_count: parseInt(modules_count),
          duration: parseInt(duration),
          thumbnail_url,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to add course: ${err.message}` });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { userid, email } = req.query;
    if (!userid) {
      return res.status(400).json({ error: "User ID is required to update streak" });
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    let lastvisit = null;

    const { data: candidate, error: canerror } = await supabase
      .from("users")
      .select("*")
      .eq("user_sub", userid)
      .single();

    if (!candidate) {
      // New user → insert
      const { error: inserterror } = await supabase.from("users").insert([{
        user_sub: userid,
        email: email,
        streak_count: 1,
        last_date: today
      }]);
      if (inserterror) throw inserterror;
    } else {
      // Existing user → calculate streak
      lastvisit = candidate.last_date?.split("T")[0]; // Fix: access field, not function

      if (lastvisit === yesterdayStr) {
        newStreak = candidate.streak_count + 1;
      } else if (lastvisit === today) {
        newStreak = candidate.streak_count;
      } else {
        newStreak = 1;
      }

      // Update only if not already today
      if (lastvisit !== today) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            streak_count: newStreak,
            last_date: today,
          })
          .eq("user_sub", userid);
        if (updateError) throw updateError;
      }
    }

    // Fetch courses
    const { data: courses, error } = await supabase.from("courses").select("*");
    if (error) throw error;

    // Fetch Latest article:
    const {data:article ,arterror}=await supabase.from("articles").select("*").order("created_at",{ ascending: false }).limit(1).single();
    console.log(article.title);


    // Return both courses and streak
    res.json({ courses, streak: newStreak,article });

  } catch (err) {
    res.status(500).json({ error: `Error fetching courses: ${err.message}` });
  }
};
