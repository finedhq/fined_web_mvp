const { chromium } = require("playwright");

const scrapeICICIFD = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/fixed-deposit/icici-bank-fd-interest-rates",
    { waitUntil: "domcontentloaded" }
  );

  const overview ="ICICI Bank Fixed Deposit (FD) is a secure investment option that offers guaranteed returns at attractive interest rates. Customers can choose tenures ranging from 7 days to 10 years, with interest compounded quarterly. ICICI FDs provide flexible payout options—monthly, quarterly, or at maturity. Senior citizens enjoy higher interest rates. Investors can also avail of loans or overdraft facilities against the FD without breaking it."
  await page.waitForSelector(".bf66FeaturesTxt.headingLarge", { timeout: 10000 });

const sections = await page.$$eval(".bf66FeaturesTxt.headingLarge", (headings) => {
  const result = {
    features: [],
    
  };

  headings.forEach((heading) => {
    const text = heading.innerText.trim().toLowerCase();
    const next = heading.nextElementSibling;

    if (!next || !next.classList.contains("bf66AboutBankFeatures")) return;

    const items = Array.from(
      next.querySelectorAll("ul li, p")
    )
      .map((el) => el.innerText.trim())
      .filter(Boolean);

    if (text.includes("features")) result.features = items;
    
  });

  return result;
});

await page.waitForSelector(".fdbp01InfoSectionHeading.headingLarge", { timeout: 10000 });

const section2 = await page.$$eval(".fdbp01InfoSectionHeading.headingLarge", (headings) => {
  const result2 = {
    eligibility: [],
    
  };

  headings.forEach((heading) => {
    const text = heading.innerText.trim().toLowerCase();
    const next = heading.nextElementSibling;

    if (!next || !next.classList.contains("fdbp01InfoSectionContent")) return;

    const items = Array.from(
      next.querySelectorAll("ul li, p")
    )
      .map((el) => el.innerText.trim())
      .filter(Boolean);

    if (text.includes("eligibility")) result2.eligibility = items;
    
  });

  return result2;
});


  await browser.close();

  return {
    bank_name: "ICICI",
    product_name: "ICICI Fixed Deposit",
    category: "Fixed Deposit",
    description: overview,
    features: sections.features,
    eligibility: section2.eligibility,
    fees_and_charges: [],
    interest_rate: null,
    source_url: page.url(),
    goal: "Easy Savings",
    risk_profile: "Low",
  };
};

scrapeICICIFD()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

module.exports = scrapeICICIFD;
