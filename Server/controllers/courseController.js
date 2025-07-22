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

export const deleteCourse = async (req, res) => {
  const { id } = req.params
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      throw error
    }
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
    // Fetch course, modules, cards, and progress in parallel
    const [courseRes, moduleRes, cardRes, progressRes] = await Promise.all([
      supabase.from("courses").select("title").eq("id", course_id).single(),
      supabase.from("modules").select("id, title").eq("course_id", course_id),
      supabase
        .from("cards")
        .select("card_id, module_id, title, content_text, content_type, order_index, image_url"),
      supabase
        .from("userCourses")
        .select("card_id, status")
        .eq("email", email)
        .eq("progress_type", "card")
    ]);

    // Check for errors
    if (courseRes.error) throw courseRes.error;
    if (moduleRes.error) throw moduleRes.error;
    if (cardRes.error) throw cardRes.error;
    if (progressRes.error) throw progressRes.error;

    const modules = moduleRes.data;
    const moduleIds = new Set(modules.map(m => m.id));
    const cards = cardRes.data.filter(card => moduleIds.has(card.module_id));

    // Create card progress map for O(1) access
    const progressMap = Object.fromEntries(
      progressRes.data.map(item => [item.card_id, item.status])
    );

    // Group cards by module
    const cardsByModule = {};
    for (const card of cards) {
      if (!cardsByModule[card.module_id]) {
        cardsByModule[card.module_id] = [];
      }
      cardsByModule[card.module_id].push({
        ...card,
        status: progressMap[card.card_id] || "incompleted"
      });
    }

    // Combine modules and their cards
    const data = modules.map(module => ({
      moduleTitle: module.title,
      moduleId: module.id,
      cards: (cardsByModule[module.id] || []).sort((a, b) => a.order_index - b.order_index)
    }));

    res.json({ title: courseRes.data.title, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error fetching course: ${err.message}` });
  }
};

export const getACard = async (req, res) => {
  try {
    const { course_id, module_id, card_id } = req.params;
    const { email } = req.body;

    // Fetch cards and user progress in parallel
    const [cardsResult, progressResult, updateUserResult] = await Promise.all([
      supabase.from("cards").select("*").eq("module_id", module_id).order("order_index"),
      supabase.from("userCourses").select("status, user_answer").match({
        email,
        module_id,
        card_id,
        progress_type: "card"
      }).single(),
      supabase.from("users").update({
        ongoing_module_id: module_id,
        ongoing_course_id: course_id
      }).eq("email", email)
    ]);

    if (cardsResult.error) throw cardsResult.error;
    if (updateUserResult.error) throw updateUserResult.error;

    const allCards = cardsResult.data;
    const currentIndex = allCards.findIndex((card) => card.card_id === card_id);
    if (currentIndex === -1) throw new Error("Card not found");

    const currentCard = allCards[currentIndex];
    const userProgress = progressResult.data;

    // Fetch all modules in course
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course_id)
      .order("order_index");

    if (modulesError) throw modulesError;

    const moduleIndex = modules.findIndex(m => m.id === module_id);
    const prevModule = modules[moduleIndex - 1];
    const nextModule = modules[moduleIndex + 1];

    let prevModuleFirstCard = null;
    let nextModuleFirstCard = null;

    if (prevModule) {
      const { data: prevCards, error: prevCardError } = await supabase
        .from("cards")
        .select("card_id")
        .eq("module_id", prevModule.id)
        .order("order_index")
        .limit(1);

      if (prevCardError) throw prevCardError;
      if (prevCards.length) {
        prevModuleFirstCard = {
          moduleId: prevModule.id,
          cardId: prevCards[0].card_id,
        };
      }
    }

    if (nextModule) {
      const { data: nextCards, error: nextCardError } = await supabase
        .from("cards")
        .select("card_id")
        .eq("module_id", nextModule.id)
        .order("order_index")
        .limit(1);

      if (nextCardError) throw nextCardError;
      if (nextCards.length) {
        nextModuleFirstCard = {
          moduleId: nextModule.id,
          cardId: nextCards[0].card_id,
        };
      }
    }

    res.json({
      ...currentCard,
      status: userProgress?.status || "incompleted",
      userAnswer: userProgress?.user_answer || null,
      prevCardId: currentIndex > 0 ? allCards[currentIndex - 1].card_id : null,
      nextCardId: currentIndex < allCards.length - 1 ? allCards[currentIndex + 1].card_id : null,
      module_total_cards: allCards.length,
      module_progress: currentCard.order_index + 1,
      isFirstCardInModule: currentIndex === 0,
      isLastCardInModule: currentIndex === allCards.length - 1,
      prevModuleFirstCard,
      nextModuleFirstCard
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to fetch card: ${err.message}` });
  }
};

export const updateACard = async (req, res) => {
  try {
    const { course_id, module_id, card_id } = req.params;
    const { status, userAnswer, email, finStars, userIndex } = req.body;
    const todayISO = new Date().toISOString();

    // Fetch card and user info in parallel
    const [{ data: cardData, error: cardError }, { data: user, error: userError }] = await Promise.all([
      supabase.from("cards").select("*").eq("card_id", card_id).single(),
      supabase.from("users").select("fin_stars, course_count, course_score, consistency_score, article_score, expense_score").eq("email", email).maybeSingle()
    ]);
    if (cardError) throw cardError;
    if (userError) throw userError;

    // Get answer tags
    let optionsTags = [];
    if (typeof cardData?.options_tags === "string") {
      try { optionsTags = JSON.parse(cardData.options_tags); } catch { }
    } else if (Array.isArray(cardData?.options_tags)) {
      optionsTags = cardData.options_tags;
    }
    const answer_tags = userIndex != null ? optionsTags[userIndex] : null;

    // Check existing card progress
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
      completion_date: status === "completed" ? todayISO : null,
    };

    if (existingProgress) {
      await supabase.from("userCourses").update(payload).eq("id", existingProgress.id);
    } else {
      await supabase.from("userCourses").insert([{ email, course_id, module_id, card_id, progress_type: "card", ...payload }]);
    }

    // Update FinStars if applicable
    if (finStars) {
      await supabase
        .from("users")
        .update({ fin_stars: (user?.fin_stars || 0) + finStars })
        .eq("email", email);
    }

    // Fetch all cards in the module
    const [{ data: allCards, error: cardsError }, { data: moduleProgress, error: progressError }] = await Promise.all([
      supabase.from("cards").select("card_id").eq("module_id", module_id).order("order_index"),
      supabase.from("userCourses").select("card_id").match({ email, module_id, progress_type: "card", status: "completed" })
    ]);
    if (cardsError) throw cardsError;
    if (progressError) throw progressError;

    const currentIndex = allCards.findIndex(c => c.card_id === card_id);
    const prevCardId = allCards[currentIndex - 1]?.card_id || null;
    const nextCardId = allCards[currentIndex + 1]?.card_id || null;
    const module_progress = moduleProgress.length;
    const module_total_cards = allCards.length;

    const logs = [];

    // ✅ Module completion bonus
    if (module_progress === module_total_cards && user.course_count < 5) {
      const oldScore = user.course_score + user.consistency_score + user.article_score + user.expense_score;
      const newCourseScore = Math.min(user.course_score + 20, 500);
      const newTotal = newCourseScore + user.consistency_score + user.article_score + user.expense_score;
      const delta = newTotal - oldScore;

      await supabase.from("users").update({ course_score: newCourseScore }).eq("email", email);

      if (delta !== 0) {
        logs.push({
          email,
          old_score: oldScore,
          new_score: newTotal,
          change: delta,
          description: "+20 for completing module",
        });
      }
    }

    // ✅ Course completion + quiz bonus
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course_id)
      .order("order_index");
    if (modulesError) throw modulesError;

    const moduleIds = modules.map(m => m.id);
    const [{ data: allCourseCards, error: allCourseError }, { data: completedCards, error: completedError }] = await Promise.all([
      supabase.from("cards").select("card_id").in("module_id", moduleIds),
      supabase.from("userCourses").select("card_id").match({ email, course_id, progress_type: "card", status: "completed" }),
    ]);
    if (allCourseError) throw allCourseError;
    if (completedError) throw completedError;

    if (allCourseCards.length === completedCards.length && user.course_count < 5) {
      const [{ data: courseAnswers, error: courseAnsError }, { data: answerKeys, error: keyError }] = await Promise.all([
        supabase.from("userCourses").select("user_answer, card_id").match({ email, course_id, progress_type: "card" }),
        supabase.from("cards").select("card_id, correct_answer").in("module_id", moduleIds),
      ]);
      if (courseAnsError) throw courseAnsError;
      if (keyError) throw keyError;

      const correctMap = Object.fromEntries(answerKeys.map(c => [c.card_id, c.correct_answer?.trim().toLowerCase()]));
      let correct = 0, total = 0;
      for (const { card_id, user_answer } of courseAnswers) {
        const ans = user_answer?.trim().toLowerCase();
        if (ans && correctMap[card_id] && ans === correctMap[card_id]) correct++;
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
        course_count: user.course_count + 1,
      }).eq("email", email);

      if (delta !== 0) {
        logs.push({
          email,
          old_score: user.course_score + user.consistency_score + user.article_score + user.expense_score,
          new_score: newTotal,
          change: delta,
          description: reason,
        });
      }
    }

    // Bulk insert logs if any
    if (logs.length) {
      await supabase.from("finScoreLogs").insert(logs);
    }

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
    res.status(500).json({ error: `Failed to update progress or FinStars: ${err.message}` });
  }
};