const { chromium } = require("playwright");

const scrapeHDFCDigiSavings = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/savings-account/hdfc-bank-savings-account",
    { waitUntil: "domcontentloaded" }
  );

  const overview ="The DigiSave Youth Account is tailored for young customers aged 18–25, offering digital-first banking with cashback, insurance, and lifestyle benefits designed for students and young earners. It comes with minimal maintenance requirements and various perks such as rewards, debit card benefits, and flexible investment options."
  const eligibility=[
    "Resident Individuals (sole or joint account)",
    "Individual should of age 18 years to 25 years",
  ]

  await page.waitForSelector(".cs81Heading", { timeout: 10000 });

const sections = await page.$$eval(".cs81Heading", (headings) => {
  const result = {
    features: [],
  };

  headings.forEach((heading) => {
    const text = heading.innerText.trim().toLowerCase();
    const next = heading.nextElementSibling;

    if (!next || !next.classList.contains("cs81ContentDiv")) return;

    const items = Array.from(
      next.querySelectorAll("ul li, p")
    )
      .map((el) => el.innerText.trim())
      .filter(Boolean);

    if (text.includes("digi saving")) result.features = items;
  });

  return result;
});


  await browser.close();

  return {
    bank_name: "HDFC",
    product_name: "HDFC DigiSave Youth Account",
    category: "Savings Account",
    description: overview,
    features: sections.features,
    eligibility:eligibility,
    fees_and_charges: [],
    interest_rate: null,
    source_url: page.url(),
    goal: "Easy Savings",
    risk_profile: "Low",
  };
};

scrapeHDFCDigiSavings()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

module.exports = scrapeHDFCDigiSavings;


