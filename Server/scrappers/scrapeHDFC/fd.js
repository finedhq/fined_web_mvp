import { chromium } from "playwright";

export default async function scrapeHDFCFD () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/fixed-deposit/hdfc-bank-fd-interest-rates",
    { waitUntil: "domcontentloaded" }
  );

  const overview =
    "The HDFC Tax Saving FD is a form of the fixed deposit that combines the advantages of investing in an FD with tax savings. You can save income tax by investing in an HDFC Tax Saving FD under Section 80C.Section 80C allows for a Rs 1.5 lakh tax deduction for an investment in a tax-saving fixed deposit. Unlike other fixed deposits, the HDFC Tax Saving FD has a 5-year lock-in term. As a result, when investing in a tax-free FD, an investor must evaluate the liquidity of the investment.";

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
    bank_name: "HDFC",
    product_name: "HDFC Fixed Deposit",
    category: "Savings Account",
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

scrapeHDFCFD()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

