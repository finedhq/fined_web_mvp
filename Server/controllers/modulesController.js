import { supabase } from "../supabaseClient.js";

// ✅ Get all modules for a course
export const getModulesByCourse = async (req, res) => {
  const { course_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course_id)
      .order("order_index");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Modules not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch modules: ${err.message}` });
  }
};

// ✅ Add a new module to a course
export const addModule = async (req, res) => {
  const { course_id } = req.params;
  const { title, description, order_index } = req.body;

  if (!title || !description || order_index === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newModule = {
      title,
      description,
      order_index: parseInt(order_index),
      course_id,
    };

    const { data, error } = await supabase
      .from("modules")
      .insert([newModule])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to add module: ${err.message}` });
  }
};
