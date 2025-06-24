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
    const { data, error } = await supabase.from("courses").select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Error fetching courses: ${err.message}` });
  }
};
