import { supabase } from "../supabaseClient.js";

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
    res.status(500).json({ error: `Error fetching entered email: ${err.message}` });
  }
};

export const updateTask = async (req, res) => {
  const { email } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("article_streak_count, article_score, last_article_read_date, consistency_score, expense_score")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    let currentStreak = userData?.article_streak_count || 0;
    let lastReadDate = userData?.last_article_read_date?.split("T")[0] || null;
    let articleScore = userData?.article_score || 0;
    let consistencyScore = userData?.consistency_score || 0;
    let expenseScore = userData?.expense_score || 0;
    let newStreak = currentStreak;
    let bonus = 0;
    let penalty = 0;
    let shouldUpdateStreak = false;

    const oldTotalScore = articleScore + consistencyScore + expenseScore;

    const { data: existing, error: taskError } = await supabase
      .from("user_tasks")
      .select("article, article_count")
      .eq("email", email)
      .eq("date", today)
      .maybeSingle();

    if (taskError) throw taskError;

    let articleCount = existing?.article_count || 0;

    if (articleCount >= 3) {
      return res.json({ updated: false, message: "Daily article limit (3) reached." });
    }

    let todayScore = 2;

    if (!existing?.article) {
      shouldUpdateStreak = true;

      if (lastReadDate === yesterdayStr) {
        newStreak = currentStreak + 1;
      } else if (lastReadDate === today) {
        newStreak = currentStreak;
      } else {
        if (currentStreak > 3) penalty -= 5;
        newStreak = 1;
      }

      if (newStreak % 3 === 0) bonus += 5;

      todayScore += bonus + penalty;
    }

    const cappedTotal = Math.min(articleScore + todayScore, 150);
    const actualScoreToAdd = cappedTotal - articleScore;

    const { error: taskUpdateError } = await supabase
      .from("user_tasks")
      .upsert(
        {
          email,
          date: today,
          article: true,
          article_count: articleCount + 1,
        },
        { onConflict: ["email", "date"] }
      );

    if (taskUpdateError) throw taskUpdateError;

    if (shouldUpdateStreak || lastReadDate !== today) {
      const { error: streakUpdateError } = await supabase
        .from("users")
        .update({
          article_streak_count: newStreak,
          last_article_read_date: today,
          article_score: cappedTotal,
        })
        .eq("email", email);

      if (streakUpdateError) throw streakUpdateError;
    } else if (actualScoreToAdd > 0) {
      const { error: scoreOnlyUpdateError } = await supabase
        .from("users")
        .update({
          article_score: cappedTotal,
        })
        .eq("email", email);

      if (scoreOnlyUpdateError) throw scoreOnlyUpdateError;
    }

    const { data: updatedUserData, error: newFetchError } = await supabase
      .from("users")
      .select("article_score, consistency_score, expense_score")
      .eq("email", email)
      .single();

    if (newFetchError) throw newFetchError;

    const newTotalScore = (updatedUserData.article_score || 0) + (updatedUserData.consistency_score || 0) + (updatedUserData.expense_score || 0);

    const delta = newTotalScore - oldTotalScore;

    let articlePart = `✅ Read article (${articleCount + 1}/3 today)`;
    let bonusPart = bonus > 0 ? `🎉 Bonus: +${bonus} for ${newStreak % 3 === 0 ? "3-day streak" : "milestone"}` : "";
    let penaltyPart = penalty < 0 ? `⚠️ Penalty: ${penalty} for breaking streak` : "";

    let description = [articlePart, bonusPart, penaltyPart].filter(Boolean).join(" | ");

    if (delta !== 0) {
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
      articleCount: articleCount + 1,
      pointsEarned: actualScoreToAdd,
      streak: newStreak,
      bonus,
      penalty,
      newScore: cappedTotal
    });

  } catch (err) {
    return res.status(500).json({ error: `Error updating article task: ${err.message}` });
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

    if (imageFile) {
      const path = `articles/${title.replace(/ /g, "_")}_${imageFile.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, imageFile.buffer, {
          contentType: imageFile.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(path);

      image_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("articles")
      .insert([{ title, content, image_url }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to add article: ${err.message}` });
  }
};