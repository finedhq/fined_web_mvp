import { google } from 'googleapis';
import { supabase } from "../supabaseClient.js";
import { sendNotification } from "../notifications.js"

const oauth2 = new google.auth.OAuth2(
  process.env.CLIENT_ID || "822410915737-7ljn7nvcdp97nqdd1a26t1mohure0iua.apps.googleusercontent.com",
  process.env.CLIENT_SECRET || "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",
  process.env.REDIRECT_URI || "https://finedwebmvp-production.up.railway.app/api/fin-tools/expensetracker/bank-callback"
);

export const bankAuth = (req, res) => {
  const rawState = req.query.state;
  const decodedState = decodeURIComponent(rawState);
  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    state: decodedState
  });
  res.redirect(authUrl);
};

export const bankCallback = async (req, res) => {
  const { code, state } = req.query;
  let userEmail = "";
  let status = "";
  try {
    const parsedState = JSON.parse(state);
    userEmail = parsedState.email;
    status = parsedState.status;
  } catch (err) {
    return res.status(400).json({ error: "Invalid state format" });
  }

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });

  const profile = await gmail.users.getProfile({ userId: 'me' });
  const bankEmail = profile.data.emailAddress;

  const { error } = await supabase
    .from('userToken')
    .upsert(
      [{ bankEmail, email: userEmail, tokens, autofetchStatus: Boolean(status) }],
      { onConflict: ['email'] }
    )

  res.redirect(`https://fined-web.vercel.app/fin-tools/expensetracker?email=${userEmail}`);
};

export const fetchExpenses = async (req, res) => {
  const { email } = req.body;

  const { data: user, error } = await supabase
    .from('userToken')
    .select('*')
    .eq('email', email)
    .single();

  if (!user || !user.tokens) {
    return res.status(401).json({ error: "User not authenticated. Login via /bank-auth" });
  }

  oauth2.setCredentials(user.tokens);
  oauth2.on('tokens', async (newTokens) => {
    const { data: existing } = await supabase
      .from('userToken')
      .select('tokens')
      .eq('email', email)
      .single();
    const oldTokens = existing?.tokens || {};
    const updatedTokens = newTokens.refresh_token
      ? { ...oldTokens, ...newTokens }
      : { ...oldTokens, access_token: newTokens.access_token };

    await supabase
      .from('userToken')
      .upsert([{ email, tokens: updatedTokens }], { onConflict: ['email'] });
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });

  const merchants = {
    Food: [
      "Swiggy", "Zomato", "Dominos", "McDonald", "Pizza Hut", "KFC", "Burger King",
      "Subway", "Cafe Coffee Day", "Barista", "Costa Coffee", "Starbucks", "Dunkin",
      "Chai Point", "Faasos", "Wow! Momo", "Haldiram's", "Bikanervala", "Giani's",
      "Gopal's Café", "McCafé", "Papa John's", "Taco Bell", "Hardee's", "Nando's",
      "Belgian Waffle Co.", "Keventers", "Natural's Ice Cream", "Cream Centre",
      "Sbarro", "Eden Bakery", "Foodpanda", "Behrouz Biryani", "LunchBox", "Sweet Truth"
    ],
    Travel: [
      "Uber", "Ola", "IRCTC", "Makemytrip", "RedBus", "Yatra", "Rapido", "BlaBlaCar",
      "EaseMyTrip", "Goibibo", "ClearTrip", "Airbnb", "Booking.com", "Expedia", "Trivago",
      "OYO Rooms", "Treebo", "FabHotels", "Stayzilla", "Couchsurfing", "Zoomcar", "Drivezy",
      "Vistara", "IndiGo", "Air India", "SpiceJet", "GoAir", "AirAsia India", "Jet Airways",
      "Akasa Air", "Indian Railways", "AbhiBus"
    ],
    Shopping: [
      "Amazon", "Flipkart", "Myntra", "Ajio", "Meesho", "Snapdeal", "TataCliq", "Nykaa",
      "Shopsy", "BigBasket", "Grofers", "Pepperfry", "Urban Ladder", "Lenskart", "FirstCry",
      "Croma", "Reliance Digital", "Decathlon", "Puma", "Nike", "Adidas", "Zara", "H&M",
      "Pantaloons", "Lifestyle", "Westside", "Levi's", "Max Fashion", "Fossil", "Jewels.in",
      "CaratLane", "Bewakoof", "Souled Store", "Mamaearth", "Boat", "Noise"
    ],
    "Bills & Utilities": [
      "Airtel", "Jio", "Vodafone", "BSNL", "Tata Power", "BESCOM", "MSEB",
      "Adani Electricity", "Reliance Energy", "Paytm", "PhonePe", "Mobikwik",
      "Freecharge", "Google Pay", "Amazon Pay", "Bharat BillPay", "Electricity Board",
      "ACT Fibernet", "Hathway", "You Broadband", "Den", "DigiCable", "Tata Sky",
      "Dish TV", "Sun Direct", "Airtel DTH", "Videocon D2H", "Gas Authority", "HP Gas",
      "Indane", "Bharat Gas", "BWSSB", "Mahanagar Gas", "Torrent Power"
    ],
    Education: [
      "Byjus", "Unacademy", "Coursera", "Udemy", "Vedantu", "Toppr", "WhiteHat Jr",
      "Khan Academy", "Simplilearn", "Skillshare", "edX", "Udacity", "Great Learning",
      "UpGrad", "LinkedIn Learning", "Coding Ninjas", "Scaler", "CodeChef", "Codeforces",
      "Brilliant.org", "MasterClass", "Duolingo", "Embibe", "Oliveboard", "Testbook",
      "Career Launcher", "Aakash", "FIITJEE", "Resonance", "Allen", "Physics Wallah"
    ],
    Entertainment: [
      "Google Play", "Google", "Supercell", "Clash of Clans", "Spotify", "Netflix",
      "Hotstar", "SonyLiv", "Zee5", "Amazon Prime", "YouTube", "ALTBalaji", "Gaana",
      "JioSaavn", "Cinepolis", "PVR", "INOX", "Twitch", "MX Player", "TVF", "Lionsgate",
      "Hungama", "Discovery+", "Voot", "Aha", "Eros Now", "Shemaroo", "Apple TV",
      "BookMyShow", "Nodwin Gaming", "Resso"
    ],
    Health: [
      "PharmEasy", "1mg", "NetMeds", "MedPlus", "Apollo", "Practo", "HealthifyMe",
      "Cure.fit", "DocsApp", "Zoylo", "Truemeds", "MyUpchar", "MediBuddy", "Dr. Lal PathLabs",
      "SRL Diagnostics", "Thyrocare", "Apollo Pharmacy", "Columbia Asia", "Fortis",
      "Max Healthcare", "Cloudnine", "Care Hospitals", "AIIMS", "Apollo Spectra",
      "Tata Health", "Healthians", "HealthKart", "ICICI Lombard", "Star Health"
    ],
    Apparel: [
      "Zara", "H&M", "Pantaloons", "Lifestyle", "Westside", "Levis", "Max Fashion",
      "Reliance Trends", "Biba", "W for Woman", "FabIndia", "Global Desi", "Allen Solly",
      "Van Heusen", "Peter England", "Arrow", "Jack & Jones", "Louis Philippe",
      "AND", "Only", "Forever 21", "Uniqlo", "Marks & Spencer", "U.S. Polo Assn.",
      "Pepe Jeans", "Spykar", "Wrangler", "Tommy Hilfiger", "Calvin Klein", "Mufti"
    ],
    Rent: [
      "NoBroker", "NestAway", "Stanza Living", "Housing.com", "Zolo", "Colive",
      "HelloWorld", "YourSpace", "OYO Life", "CoLive", "Square Yards", "Grexter",
      "Homigo", "FF21", "StayAbode", "ZiffyHomes", "Rentomojo", "Furlenco",
      "Rentickle", "CityFurnish", "Housr", "HomeLane", "Settl", "Cuckoo Homes",
      "HelloWorld", "PadShare", "Placio", "CoHo", "PG Life", "HelloStay"
    ],
    Transportation: [
      "Uber", "Ola", "Rapido", "RedBus", "IRCTC", "Metro", "Fastag", "Vogo", "Bounce",
      "Bikxie", "Yulu", "Shuttl", "BlaBlaCar", "Zoomcar", "Drivezy", "Indigo", "Vistara",
      "Air India", "SpiceJet", "GoAir", "AirAsia India", "Jet Airways", "Akasa Air",
      "Indian Railways", "Paytm Transit", "RailYatri", "AbhiBus", "MyFastag",
      "Savaari", "Oneway Cab", "MERU Cabs"
    ]
  };

  const extractTextFromParts = (parts) => {
    let body = "";
    for (let part of parts) {
      if (part.parts) {
        body += extractTextFromParts(part.parts);
      } else if (["text/plain", "text/html"].includes(part.mimeType) && part.body?.data) {
        body += Buffer.from(part.body.data, 'base64').toString();
      }
    }
    return body;
  };

  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const afterTimestamp = Math.floor(firstDayOfMonth.getTime() / 1000);

    const resMessages = await gmail.users.messages.list({
      userId: 'me',
      q: `subject:(Transaction OR transaction OR TRANSACTION OR Credited OR credited OR CREDITED OR Debited OR debited OR Upi OR upi OR UPI OR Payment OR payment OR PAYMENT OR ATM OR atm OR Atm OR Purchase OR purchase OR PURCHASE OR Hdfc OR hdfc OR HDFC) after:${afterTimestamp}`,
      maxResults: 100
    });

    const messages = resMessages.data.messages || [];
    const transactions = [];

    for (const message of messages) {
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      const payload = fullMessage.data.payload;
      const headers = payload.headers;

      const dateHeader = headers.find(h => h.name === "Date");
      const date = dateHeader ? new Date(dateHeader.value).toISOString().split('T')[0] : null;

      let body = "";
      if (payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString();
      } else if (payload.parts) {
        body = extractTextFromParts(payload.parts);
      }

      const match = body.match(/(?:Total:)?\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i);
      if (!match) continue;

      let type = null;
      const bodyLower = body.toLowerCase();
      if (
        bodyLower.includes("debited") ||
        bodyLower.includes("debit") ||
        bodyLower.includes("transaction") ||
        bodyLower.includes("purchase") ||
        bodyLower.includes("you've made a purchase")
      ) {
        type = "expense";
      } else if (
        bodyLower.includes("credited") ||
        bodyLower.includes("credit")
      ) {
        type = "income";
      }

      let category = null;
      for (const [cat, keywords] of Object.entries(merchants)) {
        if (keywords.some(keyword => bodyLower.includes(keyword.toLowerCase()))) {
          category = cat;
          break;
        }
      }

      let description = "";
      const bodyText = body.replace(/\r?\n/g, " ").replace(/\s+/g, " ");
      const amountPattern = match[1].replace(/[.,]/g, m => "\\" + m);
      const amountRegex = new RegExp(`(?:₹|Rs\\.?|INR)\\s*${amountPattern}`, "i");

      const fullTransactionRegex = new RegExp(
        `((?:₹|Rs\\.?|INR)\\s*${amountPattern}[^.\\n]+?to\\s+VPA\\s+[\\w.\\-@]+(?:\\s*\\([^\\)]+\\))?[^.\\n]*?(?:\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}))`,
        "i"
      );

      const fullMatch = bodyText.match(fullTransactionRegex);
      if (fullMatch) {
        description = fullMatch[1].trim();
      } else {
        const bodyLines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const keywords = ["debited", "credited", "payment", "purchase", "transaction", "received"];
        for (let i = 0; i < bodyLines.length; i++) {
          const line = bodyLines[i];
          if (amountRegex.test(line) && keywords.some(k => line.toLowerCase().includes(k))) {
            const next = bodyLines[i + 1] || "";
            description = (line + " " + next).trim();
            break;
          }
        }
      }
      if (!description) {
        description = `Transaction of ₹${match[1]}${category ? " under " + category : ""}`;
      }

      transactions.push({
        messageId: message.id,
        amount: match[1],
        date,
        type,
        category,
        description
      });
    }

    const { data: existingTransactions } = await supabase
      .from('transactions')
      .select('messageId')
      .eq('email', email);

    const existingIds = (existingTransactions || []).map(t => t.messageId).filter(Boolean);
    const uniqueTransactions = transactions.filter(txn => txn.messageId && !existingIds.includes(txn.messageId));

    res.json(uniqueTransactions);
  } catch (err) {
    console.error("Fetch Expense Error:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};


export const fetchBankEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const { data, error } = await supabase
      .from("userToken")
      .select("bankEmail, autofetchStatus")
      .eq("email", email)
    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Bank email fetched successfully", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: `Failed to save budgets: ${err.message}` });
  }
};

export const budgets = async (req, res) => {
  const { budgets: incomingBudgets } = req.body;

  try {
    const cleanedBudgets = [];
    const today = new Date();
    const todayDate = today.getDate();
    const currMonth = today.toLocaleString("default", { month: "long" });
    const currYear = today.getFullYear();
    let score = 0;
    let userEmail = incomingBudgets?.[0]?.email || null;

    // 1. Fetch transactions in bulk for all categories
    const uniqueCategories = [...new Set(incomingBudgets.map(b => b.category))];
    const { data: allTx, error: txError } = await supabase
      .from("transactions")
      .select("amount, type, date, category, email")
      .in("category", uniqueCategories)
      .eq("email", userEmail);
    if (txError) throw txError;

    // 2. Fetch existing Monthly budget if applicable
    const needsMonthlyCheck = incomingBudgets.some(b => b.category === "Monthly" && b.month === currMonth && b.year === currYear);
    let existingMonthlyBudget = null;
    if (needsMonthlyCheck) {
      const { data, error } = await supabase
        .from("budgets")
        .select("limit")
        .match({ email: userEmail, category: "Monthly", month: currMonth, year: currYear })
        .maybeSingle();
      if (error) throw error;
      existingMonthlyBudget = data;
    }

    // 3. Prepare cleaned budgets
    for (const budget of incomingBudgets) {
      const { email, category, month, year, limit } = budget;

      const spent = allTx
        .filter(tx => {
          const txDate = new Date(tx.date);
          return (
            tx.email === email &&
            tx.category === category &&
            tx.type === "expense" &&
            txDate.getFullYear() === year &&
            txDate.toLocaleString("default", { month: "long" }) === month
          );
        })
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      cleanedBudgets.push({ email, category, month, year, limit, spent });

      // Score logic for Monthly budget
      if (category === "Monthly" && month === currMonth && year === currYear) {
        if (todayDate <= 5) {
          score += 10;
        } else if (!existingMonthlyBudget) {
          score -= 10;
        }
      }
    }

    // 4. Fetch user before update
    const { data: userData, error: fetchUserErr } = await supabase
      .from("users")
      .select("article_score, consistency_score, expense_score, course_score")
      .eq("email", userEmail)
      .single();
    if (fetchUserErr) throw fetchUserErr;

    const { article_score = 0, consistency_score = 0, expense_score = 0, course_score = 0 } = userData;
    const oldTotalScore = article_score + consistency_score + expense_score + course_score;
    const updatedExpenseScore = Math.max(0, Math.min(150, expense_score + score));

    // 5. Upsert budgets & userCategories in parallel
    const commonCategories = [
      "Food", "Travel", "Rent", "Apparel", "Health", "Education", "Transportation",
      "Bills & Utilities", "Shopping", "Entertainment", "Investments", "Savings", "Salary", "Monthly"
    ];
    const categoryPairs = Array.from(
      new Set(
        cleanedBudgets
          .filter(b => !commonCategories.includes(b.category))
          .map(b => `${b.email}|${b.category}`)
      )
    ).map(pair => {
      const [email, category] = pair.split("|");
      return { email, category };
    });

    const [upsertBudget, updateUser, upsertCategories] = await Promise.all([
      supabase.from("budgets").upsert(cleanedBudgets, {
        onConflict: ["email", "month", "year", "category"]
      }),
      supabase.from("users").update({ expense_score: updatedExpenseScore }).eq("email", userEmail),
      categoryPairs.length > 0
        ? supabase.from("userCategories").upsert(categoryPairs, {
            onConflict: ["email", "category"]
          })
        : Promise.resolve({ error: null }) // skip if no custom categories
    ]);

    if (upsertBudget.error) throw upsertBudget.error;
    if (updateUser.error) throw updateUser.error;
    if (upsertCategories.error) throw upsertCategories.error;

    // 6. Fetch new user score & log if score changed
    const { data: newUserData, error: newUserError } = await supabase
      .from("users")
      .select("article_score, consistency_score, expense_score, course_score")
      .eq("email", userEmail)
      .single();
    if (newUserError) throw newUserError;

    const { article_score: newArticle = 0, consistency_score: newConsistency = 0, expense_score: newExpense = 0, course_score: newCourse = 0 } = newUserData;
    const newTotalScore = newArticle + newConsistency + newExpense + newCourse;
    const delta = newTotalScore - oldTotalScore;

    if (delta !== 0) {
      const { error: logError } = await supabase.from("finScoreLogs").insert({
        email: userEmail,
        old_score: oldTotalScore,
        new_score: newTotalScore,
        change: delta,
        description:
          score > 0
            ? `🎯 Monthly budget set on time (+${score})`
            : `⚠️ Monthly budget not set in time (${score})`,
      });
      if (logError) throw logError;
    }

    res.json({ message: "Budgets, categories, and scores saved successfully", data: upsertBudget.data });

  } catch (err) {
    res.status(500).json({ error: `Failed to save budgets: ${err.message}` });
  }
};

export const fetchCategories = async (req, res) => {
  const { email } = req.body;
  try {
    const { data, error } = await supabase
      .from("userCategories")
      .select("category")
      .eq("email", email);

    if (error) throw error;

    const categories = data.map(item => item.category);
    res.json({ categories });
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Failed to fetch user categories." });
  }
};

export const categoryBudget = async (req, res) => {
  const { email, month, excludeMonthly } = req.body;
  const now = new Date();
  const year = now.getFullYear();

  try {
    let query = supabase
      .from("budgets")
      .select("*")
      .match({ email, month, year });

    if (excludeMonthly) {
      query = query.not("category", "eq", "Monthly");
    }

    const { data, error } = await query;
    if (error) throw error;

    const monthlyBudgetIndex = data.findIndex(b => b.category === "Monthly");

    if (monthlyBudgetIndex !== -1) {
      const { data: summary, error: summaryError } = await supabase
        .from("transaction_summary")
        .select("expense")
        .eq("email", email)
        .eq("month", month)
        .eq("year", year)
        .single();

      if (summaryError && summaryError.code !== "PGRST116") throw summaryError;

      data[monthlyBudgetIndex].spent = summary?.expense || 0;
    }

    const exceededCategories = data.filter(budget =>
      Number(budget.limit) > 0 &&
      Number(budget.spent) > Number(budget.limit)
    );

    for (const budget of exceededCategories) {
      const content = `⚠️ You exceeded your ${budget.category} budget for ${month}!`;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: existing, error: existingError } = await supabase
        .from("notifications")
        .select("id, created_at")
        .eq("email", email)
        .eq("content", content)
        .gte("created_at", sevenDaysAgo.toISOString())
        .maybeSingle();

      if (existingError) throw existingError;

      if (!existing) {
        await sendNotification(email, content);
      }
    }

    res.json({ message: "Budgets fetched successfully", data });

  } catch (err) {
    res.status(500).json({ error: `Failed to fetch budgets: ${err.message}` });
  }
};

export const monthlyBudget = async (req, res) => {
  const { email } = req.body
  const now = new Date()
  const month = now.toLocaleString('default', { month: 'long' })
  const year = now.getFullYear()
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .match({ email, month, year, category: "Monthly" })

    if (error) throw error
    res.json({ message: "Budgets fetched successfully", data })

  } catch (err) {
    res.status(500).json({ error: `Failed to fetch budget: ${err.message}` })
  }
};

export const transaction = async (req, res) => {
  const { transaction } = req.body;

  try {
    const email = transaction.email;
    const txnDate = new Date(transaction.date);
    const todayStr = new Date().toISOString().split("T")[0];
    const month = txnDate.toLocaleString("default", { month: "long" });
    const year = txnDate.getFullYear();
    const amount = Number(transaction.amount);
    const category = transaction.category;

    // 1. Save the transaction
    const { error: upsertError } = await supabase
      .from("transactions")
      .upsert(transaction);

    if (upsertError) {
      return res.status(400).json({ error: upsertError.message });
    }

    // 2. Fetch user's scoring-related data
    const { data: user, error: userFetchErr } = await supabase
      .from("users")
      .select("transaction_streak_count, last_transaction_date, last_transaction_score_date, expense_score, article_score, consistency_score, course_score")
      .eq("email", email)
      .single();

    if (userFetchErr) throw userFetchErr;

    let scoreDelta = 0;
    let streak = user.transaction_streak_count || 0;
    const lastDate = user.last_transaction_date ? new Date(user.last_transaction_date) : null;
    const lastScoreDate = user.last_transaction_score_date;
    const shouldScoreToday = lastScoreDate !== todayStr;
    let oldTotalScore = user.expense_score + user.article_score + user.consistency_score + user.course_score;

    if (shouldScoreToday) {
      streak = 1;
      scoreDelta = 3;

      if (lastDate) {
        const gapDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        if (gapDays === 1) {
          streak = (user.transaction_streak_count || 0) + 1;
          if (streak === 7) scoreDelta += 10;
        } else if (gapDays > 1) {
          const missed = Math.min(gapDays - 1, 7);
          scoreDelta -= missed;
          if (gapDays >= 7) scoreDelta -= 10;
        }
      }

      const newExpenseScore = Math.max(0, Math.min(150, (user.expense_score || 0) + scoreDelta));

      const { error: updateUserErr } = await supabase
        .from("users")
        .update({
          transaction_streak_count: streak,
          last_transaction_date: todayStr,
          last_transaction_score_date: todayStr,
          expense_score: newExpenseScore,
        })
        .eq("email", email);

      if (updateUserErr) throw updateUserErr;

      const newTotalScore = newExpenseScore + user.article_score + user.consistency_score + user.course_score;
      const delta = newTotalScore - oldTotalScore;

      if (delta !== 0) {
        const description = [
          scoreDelta > 0 && streak !== 7 ? `+${scoreDelta} for logging a transaction` : null,
          scoreDelta < 0 ? `${scoreDelta} penalty for missed days` : null,
          streak === 7 ? `+10 bonus for 7-day streak` : null
        ].filter(Boolean).join("; ");

        const { error: logErr } = await supabase
          .from("finScoreLogs")
          .insert({
            email,
            old_score: oldTotalScore,
            new_score: newTotalScore,
            change: delta,
            description,
          });

        if (logErr) throw logErr;
      }
    }

    // 3. Update budgets (only if expense)
    if (transaction.type === "expense") {
      const monthNum = txnDate.getMonth() + 1;
      const nextMonthStr = `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;
      const thisMonthStr = `${year}-${String(monthNum).padStart(2, "0")}-01`;

      const { data: totalSpentData, error: aggError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("email", email)
        .eq("category", category)
        .eq("type", "expense")
        .gte("date", thisMonthStr)
        .lt("date", nextMonthStr);

      if (aggError) throw aggError;

      const totalSpent = totalSpentData.reduce((acc, txn) => acc + Number(txn.amount), 0);

      const { error: updateError } = await supabase
        .from("budgets")
        .update({ spent: totalSpent })
        .match({ email, category, month, year });

      if (updateError) throw updateError;
    }

    // 4. Update transaction summary
    const { data: summary, error: summaryErr } = await supabase
      .from("transaction_summary")
      .select("*")
      .eq("email", email)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (summaryErr && summaryErr.code !== "PGRST116") {
      return res.status(400).json({ error: summaryErr.message });
    }

    const updatedSummary = {
      email,
      month,
      year,
      expense: summary?.expense || 0,
      income: summary?.income || 0,
      saving: summary?.saving || 0,
      investment: summary?.investment || 0,
    };

    if (transaction.type in updatedSummary) {
      updatedSummary[transaction.type] += amount;
    }

    const { error: summaryUpsertError } = await supabase
      .from("transaction_summary")
      .upsert([updatedSummary], { onConflict: ["email", "month", "year"] });

    if (summaryUpsertError) {
      return res.status(400).json({ error: summaryUpsertError.message });
    }

    // 5. Save uncommon category
    const commonCategories = [
      "Food", "Travel", "Rent", "Apparel", "Health", "Education", "Transportation",
      "Bills & Utilities", "Shopping", "Entertainment", "Investments", "Savings", "Salary",
    ];

    if (!commonCategories.includes(category)) {
      const { error: userCategoryError } = await supabase
        .from("userCategories")
        .upsert([{ email, category }], { onConflict: ["email", "category"] });

      if (userCategoryError) {
        return res.status(400).json({ error: userCategoryError.message });
      }
    }

    res.json({ message: "Transaction saved successfully" });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: `Failed to save transaction: ${err.message}` });
  }
};

export const transactionsBulk = async (req, res) => {
  const { transactions } = req.body;

  try {
    const { error } = await supabase
      .from("transactions")
      .insert(transactions);
    if (error) throw error;

    const uniqueUserDates = new Set();
    const todayDate = new Date().toISOString().split("T")[0];

    for (let txn of transactions) {
      const dateStr = new Date(txn.date).toISOString().split("T")[0];
      uniqueUserDates.add(`${txn.email}_${dateStr}`);
    }

    for (let pair of uniqueUserDates) {
      const [email, dateStr] = pair.split("_");

      // Use today's date for scoring
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const { data: userData, error: userFetchErr } = await supabase
        .from("users")
        .select("transaction_streak_count, last_transaction_date, last_transaction_score_date, article_score, consistency_score, expense_score, course_score")
        .eq("email", email)
        .single();

      if (userFetchErr) throw userFetchErr;

      let shouldScoreToday = false;

      if (!userData?.last_transaction_score_date || userData.last_transaction_score_date !== todayStr) {
        shouldScoreToday = true;
      }

      if (shouldScoreToday) {
        let streak = 1;
        let scoreDelta = 3;

        const lastDate = userData?.last_transaction_date
          ? new Date(userData.last_transaction_date)
          : null;

        const isYesterdayTracked = lastDate?.toDateString() === yesterday.toDateString();

        const gapDays = lastDate
          ? Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
          : null;

        if (gapDays && gapDays > 1) {
          const missedDays = Math.min(gapDays - 1, 7);
          scoreDelta -= missedDays;

          if (gapDays >= 7) {
            scoreDelta -= 10;
          }
        }

        if (isYesterdayTracked) {
          streak = (userData.transaction_streak_count || 1) + 1;
          if (streak === 7) scoreDelta += 10;
        } else if (lastDate && gapDays > 1) {
          streak = 1;
        }

        const oldTotalScore = (userData.expense_score || 0) + (userData.article_score || 0) + (userData.consistency_score || 0) + userData.course_score || 0;
        const updatedExpense = Math.max(0, Math.min(150, (userData.expense_score || 0) + scoreDelta));

        const { error: userUpdateErr } = await supabase
          .from("users")
          .update({
            transaction_streak_count: streak,
            last_transaction_date: todayStr,
            last_transaction_score_date: todayStr,
            transaction_scored: true,
            expense_score: updatedExpense,
          })
          .eq("email", email);

        if (userUpdateErr) throw userUpdateErr;

        const { data: updatedUser, error: fetchUpdatedErr } = await supabase
          .from("users")
          .select("expense_score, article_score, consistency_score, course_score")
          .eq("email", email)
          .single();

        if (fetchUpdatedErr) throw fetchUpdatedErr;

        const newTotalScore = (updatedUser.expense_score || 0) + (updatedUser.article_score || 0) + (updatedUser.consistency_score || 0) + (updatedUser.course_score || 0);
        const delta = newTotalScore - oldTotalScore;

        if (delta !== 0) {
          const descParts = [];

          if (scoreDelta > 0 && streak !== 7) {
            descParts.push(`+${scoreDelta} points for logging a transaction on ${todayStr}`);
          }

          if (scoreDelta < 0) {
            descParts.push(`${scoreDelta} points penalty due to missed days in streak`);
          }

          if (streak === 7) {
            descParts.push(`+10 bonus points for completing a 7-day transaction streak`);
          }

          const { error: logError } = await supabase
            .from("finScoreLogs")
            .insert({
              email,
              old_score: oldTotalScore,
              new_score: newTotalScore,
              change: delta,
              description: descParts.join("; "),
            });

          if (logError) throw logError;
        }
      }
    }

    // ========== Budget Update ==========
    const expenseTxns = transactions.filter(txn => txn.type === 'expense');

    const groups = {};
    for (let txn of expenseTxns) {
      const date = new Date(txn.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${txn.email}_${txn.category}_${month}_${year}`;

      if (!groups[key]) {
        groups[key] = {
          email: txn.email,
          category: txn.category,
          month,
          year,
          startDate: new Date(year, date.getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(year, date.getMonth() + 1, 1).toISOString().split('T')[0],
        };
      }
    }

    for (let group of Object.values(groups)) {
      const { email, category, month, year, startDate, endDate } = group;

      const { data: totalSpentData, error: aggError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("email", email)
        .eq("category", category)
        .eq("type", "expense")
        .gte("date", startDate)
        .lt("date", endDate);

      if (aggError) throw aggError;

      const totalSpent = totalSpentData.reduce((acc, txn) => acc + Number(txn.amount), 0);

      const { error: updateError } = await supabase
        .from("budgets")
        .update({ spent: totalSpent })
        .match({ email, category, month, year });

      if (updateError) throw updateError;
    }

    // ========== Monthly Summary Update ==========
    const summaryGroups = {};

    for (let txn of transactions) {
      const date = new Date(txn.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${txn.email}_${month}_${year}`;

      if (!summaryGroups[key]) {
        summaryGroups[key] = {
          email: txn.email,
          month,
          year,
          expense: 0,
          income: 0,
          saving: 0,
          investment: 0,
        };
      }

      if (txn.type === 'expense') summaryGroups[key].expense += Number(txn.amount);
      else if (txn.type === 'income') summaryGroups[key].income += Number(txn.amount);
      else if (txn.type === 'saving') summaryGroups[key].saving += Number(txn.amount);
      else if (txn.type === 'investment') summaryGroups[key].investment += Number(txn.amount);
    }

    for (const group of Object.values(summaryGroups)) {
      const { email, month, year } = group;

      const { data: existing, error: fetchError } = await supabase
        .from("transaction_summary")
        .select("*")
        .eq("email", email)
        .eq("month", month)
        .eq("year", year)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Summary fetch error:", fetchError);
        return res.status(500).json({ error: fetchError.message });
      }

      const updated = {
        email,
        month,
        year,
        expense: (existing?.expense || 0) + group.expense,
        income: (existing?.income || 0) + group.income,
        saving: (existing?.saving || 0) + group.saving,
        investment: (existing?.investment || 0) + group.investment,
      };

      const { error: summaryUpsertError } = await supabase
        .from("transaction_summary")
        .upsert([updated], {
          onConflict: ["email", "month", "year"]
        });

      if (summaryUpsertError) {
        console.error("Error updating summary:", summaryUpsertError);
        return res.status(500).json({ error: summaryUpsertError.message });
      }
    }

    // ========== Custom Category Save ==========
    const defaultCategories = [
      "Food", "Travel", "Rent", "Apparel", "Health", "Education", "Transportation",
      "Bills & Utilities", "Shopping", "Entertainment", "Investments", "Savings", "Salary"
    ];

    const categoryPairs = Array.from(
      new Set(
        transactions
          .filter(txn => !defaultCategories.includes(txn.category))
          .map(txn => `${txn.email}|${txn.category}`)
      )
    ).map(pair => {
      const [email, category] = pair.split("|");
      return { email, category };
    });

    if (categoryPairs.length > 0) {
      const { error: categoryError } = await supabase
        .from("userCategories")
        .upsert(categoryPairs, { onConflict: ["email", "category"] });

      if (categoryError) throw categoryError;
    }

    res.json({ message: "Transactions inserted, budgets and summaries updated, categories saved, scores applied." });

  } catch (err) {
    console.error("Server error in transactionsBulk:", err);
    res.status(500).json({ error: "Failed to insert transactions and update budgets." });
  }
};

export const expenses = async (req, res) => {
  const { email, monthsRange = 3 } = req.body;

  try {
    const now = new Date();
    const summaries = [];

    for (let i = 0; i < monthsRange; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      summaries.push({
        month: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear()
      });
    }

    const { data, error } = await supabase
      .from("transaction_summary")
      .select("*")
      .eq("email", email)
      .in("month", summaries.map(s => s.month))
      .in("year", summaries.map(s => s.year))
      .order("year", { ascending: false });

    if (error) throw error;

    res.json({ message: "Summary data fetched successfully", data });

  } catch (err) {
    res.status(500).json({ error: `Failed to fetch summary data: ${err.message}` });
  }
};

export const expensesPie = async (req, res) => {
  const { email, month } = req.body;

  if (!email || !month) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const targetDate = new Date(`1 ${month} ${year}`);

    if (isNaN(targetDate)) throw new Error("Invalid month format");

    const monthIndex = targetDate.getMonth();
    const fromDate = new Date(year, monthIndex, 1);
    const toDate = new Date(year, monthIndex + 1, 1);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .match({ email })
      .gte("date", fromDate.toISOString())
      .lt("date", toDate.toISOString())
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({ message: "Transactions fetched successfully", data });

  } catch (err) {
    res.status(500).json({ error: `Failed to fetch transactions: ${err.message}` });
  }
};

export const expensesNew = async (req, res) => {
  const { email, page = 0, limit = 30 } = req.body;
  const from = page * limit;
  const to = from + limit - 1;

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .match({ email })
      .order("date", { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({ message: "Transactions fetched successfully", data });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch transactions: ${err.message}` });
  }
};

export const deleteTransaction = async (req, res) => {
  const { email, transactionId } = req.body;

  if (!email || !transactionId) {
    return res.status(400).json({ error: "Email and transactionId are required." });
  }

  try {
    const { data: txnToDelete, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("email", email)
      .single();

    if (fetchError || !txnToDelete) {
      throw new Error("Transaction not found or failed to fetch.");
    }
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .match({ id: transactionId, email });

    if (deleteError) throw deleteError;
    if (txnToDelete.type === "expense") {
      const txnDate = new Date(txnToDelete.date);
      const month = txnDate.toLocaleString('default', { month: 'long' });
      const year = txnDate.getFullYear();

      const { data: remainingExpenses, error: aggError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("email", email)
        .eq("category", txnToDelete.category)
        .eq("type", "expense")
        .gte("date", `${year}-${String(txnDate.getMonth() + 1).padStart(2, '0')}-01`)
        .lt("date", `${year}-${String(txnDate.getMonth() + 2).padStart(2, '0')}-01`);

      if (aggError) throw aggError;

      const newSpent = remainingExpenses.reduce((acc, txn) => acc + Number(txn.amount), 0);

      const { error: updateError } = await supabase
        .from("budgets")
        .update({ spent: newSpent })
        .match({
          email,
          category: txnToDelete.category,
          month,
          year
        });

      if (updateError) throw updateError;
    }

    const txnDate = new Date(txnToDelete.date);
    const month = txnDate.toLocaleString('default', { month: 'long' });
    const year = txnDate.getFullYear();
    const amount = Number(txnToDelete.amount);

    const { data: summaryData, error: summaryFetchError } = await supabase
      .from("transaction_summary")
      .select("*")
      .eq("email", email)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (summaryFetchError && summaryFetchError.code !== "PGRST116") {
      throw new Error("Failed to fetch summary for update.");
    }

    if (summaryData) {
      const updatedSummary = { ...summaryData };

      if (txnToDelete.type === "expense") {
        updatedSummary.expense = Math.max(0, (updatedSummary.expense || 0) - amount);
      } else if (txnToDelete.type === "income") {
        updatedSummary.income = Math.max(0, (updatedSummary.income || 0) - amount);
      } else if (txnToDelete.type === "saving") {
        updatedSummary.saving = Math.max(0, (updatedSummary.saving || 0) - amount);
      } else if (txnToDelete.type === "investment") {
        updatedSummary.investment = Math.max(0, (updatedSummary.investment || 0) - amount);
      }

      const { error: summaryUpdateError } = await supabase
        .from("transaction_summary")
        .upsert([updatedSummary], {
          onConflict: ["email", "month", "year"]
        });

      if (summaryUpdateError) throw summaryUpdateError;
    }

    res.json({ message: "Transaction deleted, summary and budget updated successfully" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: `Failed to delete transaction: ${err.message}` });
  }
};

export const disconnect = async (req, res) => {
  const { email } = req.body
  try {
    const { data, error } = await supabase
      .from("userToken")
      .delete()
      .match({ email });

    if (error) throw error
    res.json({ message: "Disconnected and deleted token successfully." });
  } catch (err) {
    res.status(500).json({ error: `Failed to disconnect: ${err.message}` });
  }
};

export const statusChange = async (req, res) => {
  const { email, isAutoFetch } = req.body;

  try {
    const { data, error } = await supabase
      .from("userToken")
      .update({ autofetchStatus: isAutoFetch })
      .match({ email });

    if (error) throw error;

    res.json({ message: "Auto-fetch status updated successfully." });
  } catch (err) {
    res.status(500).json({ error: `Failed to update status: ${err.message}` });
  }
};