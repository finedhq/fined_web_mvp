const { chromium } = require("playwright");
 
const scrapeKotak811Account = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("", {
    waitUntil: "domcontentloaded",
  });

  // Extract Overview / Description
  const overview = await page.$eval("meta[name='description']", (el) => el.content).catch(() => null);
  const eligibility=[
    "Residents of Indian origin who are at least 18 years old can open a savings bank account.",
    "Submit all KYC documents, including the PAN card, and deposit the minimum balance amount required by the savings bank account.",
  ]
  // Extract Features
  const features = await page.$$eval(".feature-list li, .feature-section li", (elems) =>
    elems.map((el) => el.textContent.trim()).filter((f) => f.length > 0)
  ).catch(() => []);

  // Construct return object in EXACT format
  const data = {
    bank_name: "Kotak Mahindra Bank",
    category: "Zero Balance Savings",
    product_name: "Kotak 811 Digital Savings Account",
    description: overview || "N/A",
    features: features || [],
    eligibility: eligibility,
    interest_rate: "Up to 3.5%* p.a.",
    source_url: "https://www.kotak811.com/open-zero-balance-savings-account",
    income_type: "Any",
    goal: "Digital Banking, Easy Onboarding",
    risk_profile: "Low",
  };

  await browser.close();
  return data;
};

module.exports = scrapeKotak811Account;
