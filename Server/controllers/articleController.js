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

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("user_tasks")
      .select("article")
      .eq("email", email)
      .eq("date", today)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!existing || !existing.article) {
      const { error: updateError } = await supabase
        .from("user_tasks")
        .upsert(
          { email, date: today, article: true },
          { onConflict: ["email", "date"] }
        );

      if (updateError) throw updateError;

      return res.json({ updated: true });
    } else {
      return res.json({ updated: false });
    }

  } catch (err) {
    return res.status(500).json({ error: `Error updating task: ${err.message}` });
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