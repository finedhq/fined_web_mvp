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
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Error fetching courses: ${err.message}` });
  }
};

export const getOngoingCourse = async (req, res) => {
  const { email } = req.body;

  try {
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("ongoing_course_id")
      .eq("email", email)
      .maybeSingle();

    if (userFetchError) throw userFetchError;

    const courseId = userData?.ongoing_course_id;

    if (!courseId) {
      return res.json({ error: "No ongoing course found for this user." });
    }

    const { data, error: courseFetchError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .maybeSingle();

    if (courseFetchError) throw courseFetchError;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Error fetching ongoing course: ${err.message}` });
  }
};

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
      .select("card_id, module_id, title, content_text, content_type, order_index, image_url")
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
    const { course_id, module_id, card_id } = req.params;
    const { email } = req.body;

    const { data: allCards, error: allCardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("module_id", module_id)
      .order("order_index");

    const currentIndex = allCards.findIndex((card) => card.card_id === card_id);
    if (currentIndex === -1) throw new Error("Card not found");

    const currentCard = allCards[currentIndex];

    const { error: updateError } = await supabase
      .from("users")
      .update({ ongoing_module_id: module_id, ongoing_course_id: course_id })
      .eq("email", email);

    if (updateError) throw updateError;

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
    const { status, userAnswer, email, finStars, userIndex } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // Fetch card info
    const { data: cardData, error: cardError } = await supabase
      .from("cards")
      .select("*")
      .eq("card_id", card_id)
      .single();
    if (cardError) throw cardError;

    let optionsTags = [];
    if (typeof cardData?.options_tags === "string") {
      try {
        optionsTags = JSON.parse(cardData.options_tags);
      } catch {}
    } else if (Array.isArray(cardData?.options_tags)) {
      optionsTags = cardData.options_tags;
    }
    const answer_tags = userIndex != null ? optionsTags[userIndex] : null;

    // Check for existing card progress
    const { data: existingProgress, error: checkError } = await supabase
      .from("userCourses")
      .select("id")
      .match({ email, module_id, card_id, progress_type: "card" })
      .maybeSingle();
    if (checkError) throw checkError;

    const payload = {
      status,
      user_answer: userAnswer || null,
      answer_tags,
      completion_date: status === "completed" ? new Date().toISOString() : null,
    };

    if (existingProgress) {
      await supabase.from("userCourses").update(payload).eq("id", existingProgress.id);
    } else {
      await supabase.from("userCourses").insert([{ email, course_id, module_id, card_id, progress_type: "card", ...payload }]);
    }

    // Fetch user info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("fin_stars, course_count, course_score, consistency_score, article_score, expense_score")
      .eq("email", email)
      .maybeSingle();
    if (userError) throw userError;

    // Update FinStars
    if (finStars) {
      await supabase.from("users").update({ fin_stars: (user?.fin_stars || 0) + finStars }).eq("email", email);
    }

    // Fetch all cards in module
    const { data: allCards, error: cardsError } = await supabase
      .from("cards")
      .select("card_id")
      .eq("module_id", module_id)
      .order("order_index");
    if (cardsError) throw cardsError;

    const currentIndex = allCards.findIndex(c => c.card_id === card_id);
    const prevCardId = allCards[currentIndex - 1]?.card_id || null;
    const nextCardId = allCards[currentIndex + 1]?.card_id || null;

    // Count completed cards in this module
    const { data: moduleProgress, error: progressError } = await supabase
      .from("userCourses")
      .select("card_id")
      .match({ email, module_id, progress_type: "card", status: "completed" });
    if (progressError) throw progressError;

    const module_progress = moduleProgress.length;
    const module_total_cards = allCards.length;

    // ✅ Module completion bonus
    if (module_progress === module_total_cards && user.course_count < 5) {
      await supabase.from("user_tasks").upsert({ email, date: today, module: true }, { onConflict: ["email", "date"] });

      const oldScore = user.course_score + user.consistency_score + user.article_score + user.expense_score;
      const newCourseScore = Math.min(user.course_score + 20, 500);
      const newTotal = newCourseScore + user.consistency_score + user.article_score + user.expense_score;
      const delta = newTotal - oldScore;

      await supabase.from("users").update({ course_score: newCourseScore }).eq("email", email);

      if (delta !== 0) {
        await supabase.from("finScoreLogs").insert({
          email,
          old_score: oldScore,
          new_score: newTotal,
          change: delta,
          description: "+20 for completing module",
        });
      }
    }

    // ✅ Course completion + Quiz bonus
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course_id);
    if (modulesError) throw modulesError;

    const moduleIds = modules.map(m => m.id);

    const [{ data: allCourseCards, error: allCourseError }, { data: completedCards, error: completedError }] = await Promise.all([
      supabase.from("cards").select("card_id").in("module_id", moduleIds),
      supabase.from("userCourses").select("card_id").match({ email, course_id, progress_type: "card", status: "completed" })
    ]);
    if (allCourseError) throw allCourseError;
    if (completedError) throw completedError;

    if (allCourseCards.length === completedCards.length && user.course_count < 5) {
      const { data: courseAnswers, error: courseAnsError } = await supabase
        .from("userCourses")
        .select("user_answer, card_id")
        .match({ email, course_id, progress_type: "card" });
      if (courseAnsError) throw courseAnsError;

      const { data: answerKeys, error: keyError } = await supabase
        .from("cards")
        .select("card_id, correct_answer")
        .in("module_id", moduleIds);
      if (keyError) throw keyError;

      const correctMap = Object.fromEntries(answerKeys.map(c => [c.card_id, c.correct_answer?.trim().toLowerCase()]));
      let correct = 0, total = 0;

      for (const { card_id, user_answer } of courseAnswers) {
        if (user_answer && correctMap[card_id] && user_answer.trim().toLowerCase() === correctMap[card_id]) {
          correct++;
        }
        if (correctMap[card_id]) total++;
      }

      const percent = (correct / total) * 100;
      let quizBonus = 0, reason = "";

      if (percent >= 80) {
        quizBonus = 10; reason = "+10 for ≥80% in course quiz";
      } else if (percent >= 60) {
        quizBonus = 5; reason = "+5 for 60–79% in course quiz";
      } else {
        quizBonus = -5; reason = "-5 for <60% in course quiz";
      }

      const updatedScore = Math.max(0, Math.min(user.course_score + quizBonus, 500));
      const newTotal = updatedScore + user.consistency_score + user.article_score + user.expense_score;
      const delta = newTotal - (user.course_score + user.consistency_score + user.article_score + user.expense_score);

      await supabase.from("users").update({
        course_score: updatedScore,
        course_count: user.course_count + 1
      }).eq("email", email);

      if (delta !== 0) {
        await supabase.from("finScoreLogs").insert({
          email,
          old_score: user.course_score + user.consistency_score + user.article_score + user.expense_score,
          new_score: newTotal,
          change: delta,
          description: reason,
        });
      }
    }

    // Final response
    res.json({
      ...cardData,
      status: "completed",
      userAnswer,
      prevCardId,
      nextCardId,
      module_progress,
      module_total_cards
    });

  } catch (err) {
    console.error("updateACard error:", err);
    res.status(500).json({ error: `Failed to update progress or FinStars: ${err.message}` });
  }
};