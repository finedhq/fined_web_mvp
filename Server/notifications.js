import { supabase } from "./supabaseClient.js";

export const sendNotification = async (email, content, seen = false) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .insert({
        email,
        content,
        seen,
      });

    if (error) {
      console.error("❌ Failed to send notification:", error.message);
    }
  } catch (err) {
    console.error("❌ Unexpected error sending notification:", err.message);
  }
};
