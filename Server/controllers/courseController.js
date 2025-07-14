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

    // Get card tags and correct answer
    const { data: cardData, error: cardError } = await supabase
      .from("cards")
      .select("options_tags, correct_answer")
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

    // Check for existing progress
    const { data: existingProgress, error: checkError } = await supabase
      .from("userCourses")
      .select("*")
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
      await supabase.from("userCourses").insert([{
        email,
        course_id,
        module_id,
        card_id,
        ...payload,
        progress_type: "card",
      }]);
    }

    // Get user for stars and course count
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("fin_stars, course_count")
      .eq("email", email)
      .maybeSingle();
    if (userError) throw userError;

    const currentStars = userData?.fin_stars || 0;
    const courseCount = userData?.course_count || 0;

    await supabase.from("users").update({
      fin_stars: currentStars + (finStars || 0),
    }).eq("email", email);

    // Get all cards in current module
    const { data: allCards, error: allCardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("module_id", module_id)
      .order("order_index");
    if (allCardsError) throw allCardsError;

    const currentCard = allCards.find(c => c.card_id === card_id);
    const currentIndex = allCards.findIndex(c => c.card_id === card_id);
    const prevCardId = currentIndex > 0 ? allCards[currentIndex - 1].card_id : null;
    const nextCardId = currentIndex < allCards.length - 1 ? allCards[currentIndex + 1].card_id : null;

    const { data: moduleProgress, error: progressError } = await supabase
      .from("userCourses")
      .select("status")
      .match({ email, module_id, progress_type: "card" });
    if (progressError) throw progressError;

    const module_progress = moduleProgress.filter(p => p.status === "completed").length;
    const module_total_cards = allCards.length;

    // ✅ Module bonus
    if (module_progress === module_total_cards && courseCount < 5) {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("user_tasks").upsert({
        email, date: today, module: true
      }, { onConflict: ["email", "date"] });

      const { data: userRow, error: userFetchError } = await supabase
        .from("users")
        .select("course_score, consistency_score, article_score, expense_score")
        .eq("email", email)
        .maybeSingle();
      if (userFetchError) throw userFetchError;

      const oldTotalScore = (userRow?.course_score || 0) +
        (userRow?.consistency_score || 0) +
        (userRow?.article_score || 0) +
        (userRow?.expense_score || 0);

      const newCourseScore = Math.min((userRow?.course_score || 0) + 20, 500);
      const newTotalScore = newCourseScore +
        (userRow?.consistency_score || 0) +
        (userRow?.article_score || 0) +
        (userRow?.expense_score || 0);

      const change = newTotalScore - oldTotalScore;

      await supabase.from("users").update({
        course_score: newCourseScore
      }).eq("email", email);

      if (change !== 0) {
        await supabase.from("finScoreLogs").insert({
          email,
          old_score: oldTotalScore,
          new_score: newTotalScore,
          change,
          description: "+20 for completing module",
        });
      }
    }

    // ✅ Course completion and quiz bonus
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course_id);
    if (modulesError) throw modulesError;

    const moduleIds = modules.map(m => m.id);

    const { data: allCourseCards, error: allCourseError } = await supabase
      .from("cards")
      .select("card_id")
      .in("module_id", moduleIds);
    if (allCourseError) throw allCourseError;

    const { data: completedCards, error: completedError } = await supabase
      .from("userCourses")
      .select("card_id")
      .match({ email, course_id, progress_type: "card", status: "completed" });
    if (completedError) throw completedError;

    if (allCourseCards.length === completedCards.length && courseCount < 5) {
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

      const correctMap = Object.fromEntries(answerKeys.map(c => [
        c.card_id, c.correct_answer?.trim().toLowerCase()
      ]));

      let correct = 0, total = 0;
      for (const entry of courseAnswers) {
        const userAns = entry.user_answer?.trim().toLowerCase();
        const correctAns = correctMap[entry.card_id];
        if (correctAns != null) {
          total++;
          if (userAns === correctAns) correct++;
        }
      }

      const percent = (correct / total) * 100;
      let quizBonus = 0;
      let reason = "";
      if (percent >= 80) {
        quizBonus = 10;
        reason = "+10 for ≥80% in course quiz";
      } else if (percent >= 60) {
        quizBonus = 5;
        reason = "+5 for 60–79% in course quiz";
      } else {
        quizBonus = -5;
        reason = "-5 for <60% in course quiz";
      }

      const { data: userRow2, error: userError2 } = await supabase
        .from("users")
        .select("course_score, consistency_score, article_score, expense_score, course_count")
        .eq("email", email)
        .maybeSingle();
      if (userError2) throw userError2;

      const oldTotal = (userRow2?.course_score || 0) +
        (userRow2?.consistency_score || 0) +
        (userRow2?.article_score || 0) +
        (userRow2?.expense_score || 0);

      const newScore = Math.max(0, Math.min((userRow2?.course_score || 0) + quizBonus, 500));
      const newTotal = newScore +
        (userRow2?.consistency_score || 0) +
        (userRow2?.article_score || 0) +
        (userRow2?.expense_score || 0);

      const change = newTotal - oldTotal;

      await supabase.from("users").update({
        course_score: newScore,
        course_count: (userRow2?.course_count || 0) + 1
      }).eq("email", email);

      if (change !== 0) {
        await supabase.from("finScoreLogs").insert({
          email,
          old_score: oldTotal,
          new_score: newTotal,
          change,
          description: reason,
        });
      }
    }

    // Final response
    res.json({
      ...currentCard,
      status: "completed",
      userAnswer,
      prevCardId,
      nextCardId,
      module_progress,
      module_total_cards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to update progress or FinStars: ${err.message}` });
  }
};