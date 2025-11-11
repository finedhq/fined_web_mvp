import { supabase } from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET;

export const getAllArticles = async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.body;
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: `Error fetching articles: ${err.message}` });
  }
};

export const deleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Error fetching articles: ${err.message}` });
  }
};

export const saveEmail = async (req, res) => {
  const { email, enteredEmail } = req.body;

  if (!email || !enteredEmail) {
    return res.status(400).json({ error: "Both email and enteredEmail are required." });
  }

  try {
    const { data, error } = await supabase
      .from("newsletter_gmails")
      .upsert(
        [{ email, enteredEmail: enteredEmail }],
        { onConflict: ['email'] }
      );

    if (error) throw error;

    res.status(200).json({ message: "Email saved successfully", data });
  } catch (err) {
    res.status(500).json({ error: `Error saving email: ${err.message}` });
  }
};

export const removeEmail = async (req, res) => {
  const { email, enteredEmail } = req.body;

  if (!email || !enteredEmail) {
    return res.status(400).json({ error: "Both email and enteredEmail are required." });
  }

  try {
    const { data, error } = await supabase
      .from("newsletter_gmails")
      .delete()
      .match({ email, enteredEmail });

    if (error) throw error;

    res.status(200).json({ message: "Email removed successfully", data });
  } catch (err) {
    res.status(500).json({ error: `Error removing email: ${err.message}` });
  }
};

export const fetchEnteredEmail = async (req, res) => {
  const { email } = req.body
  try {
    const { data, error } = await supabase
      .from("newsletter_gmails")
      .select("enteredEmail")
      .eq("email", email);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: `Error fetching entered email: ${err.message}` });
  }
};

export const updateTask = async (req, res) => {
  const { email } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("article_streak_count, article_score, last_article_read_date, article_count_today, consistency_score, expense_score, course_score")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    const {
      article_streak_count: currentStreak = 0,
      last_article_read_date: lastReadDateRaw,
      article_score: articleScore = 0,
      article_count_today = 0,
      consistency_score = 0,
      expense_score = 0,
      course_score = 0
    } = userData;

    const lastReadDate = lastReadDateRaw?.split("T")[0] || null;
    const oldTotalScore = articleScore + consistency_score + expense_score + course_score;

    // If already read 3 articles today
    if (lastReadDate === today && article_count_today >= 3) {
      return res.json({ updated: false, message: "Daily article limit (3) reached." });
    }

    let bonus = 0;
    let penalty = 0;
    let newStreak = currentStreak;
    let todayScore = 2;
    let newCountToday = lastReadDate === today ? article_count_today + 1 : 1;

    if (lastReadDate !== today) {
      // New day logic
      if (lastReadDate === yesterday) {
        newStreak++;
      } else {
        if (currentStreak > 3) penalty = -5;
        newStreak = 1;
      }

      if (newStreak % 3 === 0) bonus = 5;
      todayScore += bonus + penalty;
    }

    const cappedTotal = Math.min(articleScore + todayScore, 150);
    const actualScoreToAdd = cappedTotal - articleScore;

    const updates = {
      article_score: cappedTotal,
      last_article_read_date: today,
      article_count_today: newCountToday,
    };

    if (lastReadDate !== today) {
      updates.article_streak_count = newStreak;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("email", email);

    if (updateError) throw updateError;

    const newTotalScore = cappedTotal + consistency_score + expense_score + course_score;
    const delta = newTotalScore - oldTotalScore;

    if (delta !== 0) {
      const parts = [
        `✅ Read article (${newCountToday}/3 today)`,
        bonus > 0 ? `🎉 Bonus: +${bonus} for 3-day streak` : "",
        penalty < 0 ? `⚠️ Penalty: ${penalty} for breaking streak` : ""
      ];
      const description = parts.filter(Boolean).join(" | ");

      const { error: logError } = await supabase
        .from("finScoreLogs")
        .insert({
          email,
          old_score: oldTotalScore,
          new_score: newTotalScore,
          change: delta,
          description
        });

      if (logError) throw logError;
    }

    res.json({
      updated: true,
      articleCount: newCountToday,
      pointsEarned: actualScoreToAdd,
      streak: newStreak,
      bonus,
      penalty,
      newScore: cappedTotal
    });

  } catch (err) {
    console.error("Article Task Error:", err);
    res.status(500).json({ error: `Error updating article task: ${err.message}` });
  }
};

export const fetchRating = async (req, res) => {
  const { email, articleId } = req.body;

  if (!email || !articleId) {
    return res.json({ error: "Missing data" });
  }

  try {
    const { data, error } = await supabase
      .from("article_ratings")
      .select("rating")
      .match({ email, article_id: articleId })
      .maybeSingle();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error while saving rating" });
  }
};

export const rate = async (req, res) => {
  const { email, articleId, rating } = req.body;

  if (!email || !articleId || !rating) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    const { error: upsertError } = await supabase
      .from("article_ratings")
      .upsert([{ email, article_id: articleId, rating }], { onConflict: ['email', 'article_id'] });

    if (upsertError) throw upsertError;

    const { data: allRatings, error: fetchError } = await supabase
      .from("article_ratings")
      .select("rating")
      .eq("article_id", articleId);

    if (fetchError) throw fetchError;

    const total = allRatings.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    const avg = allRatings.length ? total / allRatings.length : 0;
    const roundedAvg = parseFloat(avg.toFixed(2));

    const { error: updateError } = await supabase
      .from("articles")
      .update({ rating: roundedAvg })
      .eq("id", articleId);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Rating saved." });
  } catch (err) {
    res.status(500).json({ error: "Server error while saving rating" });
  }
};

export const addArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageFile = req.file;
    let image_url = "";

    const uploadToSupabase = async (file, folder) => {
      const ext = file.originalname.split(".").pop();
      const safeTitle = title ? title.replace(/[^a-zA-Z0-9_-]/g, "_") : "untitled";
      const path = `${folder}/${safeTitle}_${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(path);

      return publicUrlData.publicUrl;
    };

    if (imageFile) {
      image_url = await uploadToSupabase(imageFile, "articles");
    }

    const { data, error } = await supabase
      .from("articles")
      .insert([{ title, content, image_url }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Error adding article:", err);
    res.status(500).json({ error: `Failed to add article: ${err.message}` });
  }
};
