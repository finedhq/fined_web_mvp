const { chromium } = require("playwright");

const scrapeSBIInstaSaving = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://sbi.co.in/web/yono/insta-plus-savings-bank-account",
    { waitUntil: "domcontentloaded" }
  );

  let overview = "SBI Insta Plus Savings Account offers the convenience of digital onboarding with minimal documentation and instant account activation.";

  const extractSection = async (tabHref, contentSelector) => {
    try {
      const tab = await page.$(`a[href="${tabHref}"]`);
      if (tab) {
        await tab.click();
        await page.waitForSelector(`${contentSelector}.active ul li`, { timeout: 5000 });
        return await page.$$eval(
          `${contentSelector}.active ul li`,
          (items) => items.map((el) => el.innerText.trim())
        );
      }
    } catch (err) {
      console.warn(`Error extracting ${tabHref}:`, err.message);
    }
    return [];
  };

  const features = await extractSection("#menu_0", "#menu_0");
  const eligibility = await extractSection("#menu_1", "#menu_1");

  await browser.close();

  return {
    bank_name: "SBI",
    category: "Savings Account",
    product_name: "SBI Insta Saving Account",
    description: overview || "N/A",
    features: features || [],
    eligibility: eligibility || "Check website",
    fees_and_charges: [],
    interest_rate: null,
    source_url:"https://sbi.co.in/web/yono/insta-plus-savings-bank-account",
    income_type: "Basic Banking ",
    goal: "Easy Savings",
    risk_profile: "Low",
  };
};

module.exports = scrapeSBIInstaSaving;
