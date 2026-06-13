import { supabase } from "../supabaseClient.js";
import { sendEmail } from "../email/email.js";

export const newsletter = async (req, res) => {
  const { data } = req.body;
  try {
    const { data: emails, error } = await supabase
      .from("newsletter_gmails")
      .select("enteredEmail");

    if (error) throw error;

    if (!emails || emails.length === 0) {
      return;
    }

    for (const { enteredEmail } of emails) {
      try {
        await sendEmail(enteredEmail, data);
      } catch (err) {
        console.log(`Failed for: ${enteredEmail}`, err.message);
      }
    }
    res.status(200).json({ message: "Newsletter sent to all." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send newsletter." });
  }
};
