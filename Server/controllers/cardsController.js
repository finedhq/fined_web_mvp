import { supabase } from "../supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = process.env.SUPABASE_BUCKET;

export const getCardsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch cards: ${err.message}` });
  }
};

export const deleteCard = async (req, res) => {
  const { id } = req.params
  try {
    const { data, error } = await supabase
      .from('cards')
      .delete()
      .eq('card_id', id);

    if (error) {
      throw error
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Error fetching card: ${err.message}` });
  }
};

export const addCard = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const body = req.body;

    const files = req.files || {};
    const media_urls = {};

    const uploadToSupabase = async (file, folder) => {
      const ext = file.originalname.split(".").pop();
      const path = `${folder}/${uuidv4()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      return publicUrlData.publicUrl;
    };

    if (files.image_file?.[0]) {
      media_urls.image_url = await uploadToSupabase(files.image_file[0], "images");
    }
    if (files.audio_file?.[0]) {
      media_urls.audio_url = await uploadToSupabase(files.audio_file[0], "audios");
    }
    if (files.video_file?.[0]) {
      media_urls.video_url = await uploadToSupabase(files.video_file[0], "videos");
    }

    const {
      title,
      content_type,
      content_text,
      question_type,
      correct_answer,
      allotted_finstars,
      order_index,
      answer_compulsory = false,
      feedback_type,
    } = body;

    const options = body.options
      ? typeof body.options === "string"
        ? [body.options]
        : Array.isArray(body.options)
          ? body.options
          : []
      : [];

    const options_tags = body.options_tags
      ? typeof body.options_tags === "string"
        ? [body.options_tags]
        : Array.isArray(body.options_tags)
          ? body.options_tags
          : []
      : [];

    const card_data = {
      title,
      module_id: moduleId,
      content_type,
      content_text,
      order_index: parseInt(order_index),
      allotted_finstars: parseInt(allotted_finstars),
      ...media_urls,
    };

    if (content_type === "question") {
      Object.assign(card_data, {
        question_type,
        options,
        options_tags,
        correct_answer,
        answer_compulsory: answer_compulsory === "true" || answer_compulsory === true,
        feedback_type,
        correct_answer_exists: Boolean(correct_answer),
        finstars_involved: true,
      });
    } else {
      Object.assign(card_data, {
        question_type: null,
        options: null,
        options_tags: null,
        correct_answer: null,
        answer_compulsory: null,
        feedback_type: null,
        correct_answer_exists: null,
        finstars_involved: null,
      });
    }

    const { data, error } = await supabase.from("cards").insert([card_data]).select().single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Error adding card:", err);
    res.status(500).json({ error: `Error adding card: ${err.message}` });
  }
};