import { supabase } from "../supabaseClient.js";

const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET;

export const getAllArticles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Error fetching articles: ${err.message}` });
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
