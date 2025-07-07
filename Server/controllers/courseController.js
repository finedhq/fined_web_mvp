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

// export const getAllCourses = async (req, res) => {
//   try {
//     const { userid, email } = req.query;
//     if (!userid) {
//       return res.status(400).json({ error: "User ID is required to update streak" });
//     }

//     const today = new Date().toISOString().split("T")[0];
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     const yesterdayStr = yesterday.toISOString().split("T")[0];

//     let newStreak = 1;
//     let lastvisit = null;

//     const { data: candidate, error: canerror } = await supabase
//       .from("users")
//       .select("*")
//       .eq("user_sub", userid)
//       .single();

//     if (!candidate) {
//       // New user → insert
//       const { error: inserterror } = await supabase.from("users").insert([{
//         user_sub: userid,
//         email: email,
//         streak_count: 1,
//         last_date: today
//       }]);
//       if (inserterror) throw inserterror;
//     } else {
//       // Existing user → calculate streak
//       lastvisit = candidate.last_date?.split("T")[0]; // Fix: access field, not function

//       if (lastvisit === yesterdayStr) {
//         newStreak = candidate.streak_count + 1;
//       } else if (lastvisit === today) {
//         newStreak = candidate.streak_count;
//       } else {
//         newStreak = 1;
//       }

//       // Update only if not already today
//       if (lastvisit !== today) {
//         const { error: updateError } = await supabase
//           .from("users")
//           .update({
//             streak_count: newStreak,
//             last_date: today,
//           })
//           .eq("user_sub", userid);
//         if (updateError) throw updateError;
//       }
//     }

//     // Fetch courses
//     const { data: courses, error } = await supabase.from("courses").select("*");
//     if (error) throw error;

//     // Fetch Latest article:
//     const {data:article ,arterror}=await supabase.from("articles").select("*").order("created_at",{ ascending: false }).limit(1).single();
//     console.log(article.title);


//     // Return both courses and streak
//     res.json({ courses, streak: newStreak,article });

//   } catch (err) {
//     res.status(500).json({ error: `Error fetching courses: ${err.message}` });
//   }
// };

export const getAllCourses = async (req, res) => {
  try {
    const { data:courses, error } = await supabase.from("courses").select("*");

    if (error) throw error;
    res.json({courses});
  } catch (err) {
    res.status(500).json({ error: `Error fetching courses: ${err.message}` });
  }
};

export const updatestreak=async (req,res) => {
  try {
    const { userid, email } = req.query;
    if (!userid) {
      return res.status(400).json({ error: "User ID is required to update streak" });
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    let lastvisit = null;

    const { data: candidate, error: canerror } = await supabase
      .from("users")
      .select("*")
      .eq("user_sub", userid)
      .single();

    if (!candidate) {
      // New user → insert
      const { error: inserterror } = await supabase.from("users").insert([{
        user_sub: userid,
        email: email,
        streak_count: 1,
        last_date: today
      }]);
      if (inserterror) throw inserterror;
    } else {
      // Existing user → calculate streak
      lastvisit = candidate.last_date?.split("T")[0]; // Fix: access field, not function

      if (lastvisit === yesterdayStr) {
        newStreak = candidate.streak_count + 1;
      } else if (lastvisit === today) {
        newStreak = candidate.streak_count;
      } else {
        newStreak = 1;
      }

      // Update only if not already today
      if (lastvisit !== today) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            streak_count: newStreak,
            last_date: today,
          })
          .eq("user_sub", userid);
        if (updateError) throw updateError;
      }
    }
    // Fetch Latest article:
    const {data:article ,arterror}=await supabase.from("articles").select("*").order("created_at",{ ascending: false }).limit(1).single();
    console.log(article.title);


    // Return both courses and streak
    res.json({streak: newStreak,article });
  } catch (error) {
    res.status(500).json({ error: `Error fetching courses: ${error.message}` });
  }
  
}




export const getACourse = async (req, res) => {
  const { course_id } = req.params;
  const { email } = req.body;

  try {
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("title")
      .eq("id", course_id)
      .single();

    if (courseError) throw courseError;

    const { data: modules, error: moduleError } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course_id);

    if (moduleError) throw moduleError;

    const moduleIds = modules.map(m => m.id);

    const { data: cards, error: cardError } = await supabase
      .from("cards")
      .select("card_id, module_id, content_text, content_type, order_index, image_url")
      .in("module_id", moduleIds)
      .order("order_index");

    if (cardError) throw cardError;
    const { data: progressData, error: progressError } = await supabase
      .from("userCourses")
      .select("card_id, status")
      .eq("email", email)
      .eq("progress_type", "card");

    if (progressError) throw progressError;
    const progressMap = {}
    for (const item of progressData) {
      progressMap[item.card_id] = item.status;
    }

    const data = modules.map(module => ({
      moduleTitle: module.title,
      moduleId: module.id,
      cards: cards
        .filter(card => card.module_id === module.id)
        .map(card => ({
          ...card,
          status: progressMap[card.card_id] || "incompleted"
        }))
    }));

    res.json({ title: courseData.title, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error fetching course: ${err.message}` });
  }
};

export const getACard = async (req, res) => {
  try {
    const { module_id, card_id } = req.params;
    const { email } = req.body;

    const { data: allCards, error: allCardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("module_id", module_id)
      .order("order_index");

    const currentIndex = allCards.findIndex((card) => card.card_id === card_id);
    if (currentIndex === -1) throw new Error("Card not found");

    const currentCard = allCards[currentIndex];

    const { data: userProgress } = await supabase
      .from("userCourses")
      .select("status, user_answer")
      .match({
        email,
        module_id,
        card_id,
        progress_type: "card",
      })
      .single();

    const prevCardId = currentIndex > 0 ? allCards[currentIndex - 1].card_id : null;
    const nextCardId = currentIndex < allCards.length - 1 ? allCards[currentIndex + 1].card_id : null;

    res.json({
      ...currentCard,
      status: userProgress?.status || "incompleted",
      userAnswer: userProgress?.user_answer || null,
      prevCardId,
      nextCardId,
      module_total_cards: allCards.length,
      module_progress: currentCard.order_index + 1
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: `Failed to fetch card: ${err.message}` });
  }
};

export const updateACard = async (req, res) => {
  try {
    const { course_id, module_id, card_id } = req.params;
    const { status, userAnswer, email, finStars } = req.body;

    const { data: existingProgress, error: checkError } = await supabase
      .from("userCourses")
      .select("*")
      .match({
        email,
        module_id,
        card_id,
        progress_type: "card",
      })
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    const payload = {
      status,
      user_answer: userAnswer || null,
      completion_date: status === "completed" ? new Date().toISOString() : null,
    };

    let progressUpdate;
    if (existingProgress) {
      const { data, error } = await supabase
        .from("userCourses")
        .update(payload)
        .eq("id", existingProgress.id)
        .select()
        .single();
      if (error) throw error;
      progressUpdate = data;
    } else {
      const { data, error } = await supabase
        .from("userCourses")
        .insert([
          {
            email,
            course_id,
            module_id,
            card_id,
            status,
            user_answer: userAnswer || null,
            completion_date: status === "completed" ? new Date().toISOString() : null,
            progress_type: "card",
          },
        ])
        .select()
        .single();
      if (error) throw error;
      progressUpdate = data;
    }

    // Update FinStars
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("fin_stars")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    const currentStars = userData?.fin_stars || 0;
    const newStars = currentStars + (finStars || 0);

    const { error: updateError } = await supabase
      .from("users")
      .update({ fin_stars: newStars })
      .eq("email", email);

    if (updateError) throw updateError;

    // 🆕 Fetch the card again (with content + module progress)
    const { data: allCards, error: allCardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("module_id", module_id)
      .order("order_index");

    if (allCardsError) throw allCardsError;

    const currentCard = allCards.find((card) => card.card_id === card_id);
    const currentIndex = allCards.findIndex((card) => card.card_id === card_id);
    const prevCardId = currentIndex > 0 ? allCards[currentIndex - 1].card_id : null;
    const nextCardId = currentIndex < allCards.length - 1 ? allCards[currentIndex + 1].card_id : null;

    // Progress in this module
    const { data: moduleProgressData, error: progressError } = await supabase
      .from("userCourses")
      .select("status")
      .match({
        email,
        module_id,
        progress_type: "card",
      });

    if (progressError) throw progressError;

    const module_progress = moduleProgressData.filter(p => p.status === "completed").length;
    const module_total_cards = allCards.length;

    res.json({
      ...currentCard,
      status: "completed",
      userAnswer,
      prevCardId,
      nextCardId,
      module_progress,
      module_total_cards
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to update progress or FinStars: ${err.message}` });
  }
};
