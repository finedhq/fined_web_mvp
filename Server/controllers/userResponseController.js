import { supabase } from "../supabaseClient.js";

// Save user response
export const saveUserResponse = async (req, res) => {
  try {
    const data = req.body;

    const { data: inserted, error } = await supabase
      .from("user_responses")
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(inserted);
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ error: `Failed to save response: ${err.message}` });
  }
};