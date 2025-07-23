import { chromium } from "playwright";

export default async function scrapeHDFCSavings () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/savings-account/hdfc-bank-savings-account",
    { waitUntil: "domcontentloaded" }
  );

  const overview =
    "HDFC has a number of savings account programs, each with its own set of rewards and features that are easily accessible. The HDFC savings account includes cutting-edge banking features and services. Customers may compare and choose the account that best matches their needs, and a personal Relationship Manager is always ready to help them.";

  await page.waitForSelector(".cs81Heading", { timeout: 10000 });

const sections = await page.$$eval(".cs81Heading", (headings) => {
  const result = {
    features: [],
    eligibility: [],
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

    if (text.includes("feature")) result.features = items;
    else if (text.includes("who can open")) result.eligibility = items;
  });

  return result;
});


  await browser.close();

  return {
    bank_name: "HDFC",
    product_name: "HDFC Savings Account",
    category: "Savings Account",
    description: overview,
    features: sections.features,
    eligibility: sections.eligibility,
    fees_and_charges: [],
    interest_rate: null,
    source_url: page.url(),
    goal: "Easy Savings",
    risk_profile: "Low",
  };
};

scrapeHDFCSavings()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

