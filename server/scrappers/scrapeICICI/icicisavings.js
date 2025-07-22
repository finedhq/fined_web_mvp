const { chromium } = require("playwright");

const scrapeICICISavings = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/savings-account/icici-bank-savings-account",
    { waitUntil: "domcontentloaded" }
  );

  const overview =
    "ICICI Bank provides various savings accounts to meet the demands of various types of investors. The ICICI bank savings account interest rate might range between 3.0% and 3.50% per annum. The interest is calculated every day. However, the payments are made quarterly. ";
  

  await page.waitForSelector(".cs81Heading", { timeout: 10000 });
  
  const section1 = await page.$$eval(".cs81Heading", (headings) => {
    const result1 = {
      feature1: [],
    };

    headings.forEach((heading) => {
      const text = heading.innerText.trim().toLowerCase();
      const next = heading.nextElementSibling;

      if (!next || !next.classList.contains("cs81ContentDiv")) return;

      const items = Array.from(next.querySelectorAll("ul li, p"))
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      if (text.includes("characteristics")) result1.feature1 = items;
    });

    return result1;
  });


  const section2 = await page.$$eval(".cs81Heading", (headings) => {
    const result2 = {
      feature2: [],
    };

    headings.forEach((heading) => {
      const text = heading.innerText.trim().toLowerCase();
      const next = heading.nextElementSibling;

      if (!next || !next.classList.contains("cs81ContentDiv")) return;

      const items = Array.from(next.querySelectorAll("ul li, p"))
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      if (text.includes("minimum account balance")) result2.feature2 = items;
    });

    return result2;
  });


  const section3 = await page.$$eval(".cs81Heading", (headings) => {
    const result3 = {
      feature3: [],
    };

    headings.forEach((heading) => {
      const text = heading.innerText.trim().toLowerCase();
      const next = heading.nextElementSibling;

      if (!next || !next.classList.contains("cs81ContentDiv")) return;

      const items = Array.from(next.querySelectorAll("ul li, p"))
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      if (text.includes("atm card service")) result3.feature3 = items;
    });

    return result3;
  });

  const section4 = await page.$$eval(".cs81Heading", (headings) => {
    const result4 = {
      feature4: [],
    };

    headings.forEach((heading) => {
      const text = heading.innerText.trim().toLowerCase();
      const next = heading.nextElementSibling;

      if (!next || !next.classList.contains("cs81ContentDiv")) return;

      const items = Array.from(next.querySelectorAll("ul li, p"))
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      if (text.includes("fund transfer")) result4.feature4= items;
    });

    return result4;
  });

  
  const sections = await page.$$eval(".cs81Heading", (headings) => {
    const result = {
      eligibility: [],
    };

    headings.forEach((heading) => {
      const text = heading.innerText.trim().toLowerCase();
      const next = heading.nextElementSibling;

      if (!next || !next.classList.contains("cs81ContentDiv")) return;

      const items = Array.from(next.querySelectorAll("ul li, p"))
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      if (text.includes("who can opt")) result.eligibility= items;
    });

    return result;
  });

  const features = [
  ...section1.feature1,
  ...section2.feature2,
  ...section3.feature3,
  ...section4.feature4,
];


  await browser.close();

  return {
    bank_name: "ICICI",
    product_name: "ICICI Savings Account",
    category: "Savings Account",
    description: overview,
    features: features,
    eligibility: sections.eligibility,
    fees_and_charges: [],
    interest_rate: null,
    source_url: page.url(),
    goal: "Easy Savings",
    risk_profile: "Low",
  };
};

scrapeICICISavings()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

module.exports = scrapeICICISavings;
