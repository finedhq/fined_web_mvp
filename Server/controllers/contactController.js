import { supabase } from "../supabaseClient.js";

export const saveQuery = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const { error } = await supabase
      .from("contact_us")
      .insert([{ name, email, message }]);

    if (error) throw error;

    res.status(200).json({ message: "Your message has been received!" });
  } catch (err) {
    res.status(500).json({ error: `Failed to save message: ${err.message}` });
  }
};