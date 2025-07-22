const { chromium } = require("playwright");

const scrapeSBITaxSaverFd = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://sbi.co.in/web/yono/tax-saver-fixed-deposit",
    { waitUntil: "domcontentloaded" }
  );

  let overview = "The Tax Saving Fixed Deposit of SBI allows individuals to earn a competitive rate of interest on lump-sum contributions while simultaneously providing tax benefits under Section 80C of the Income Tax Act. This type of fixed deposit comes with a lock-in period of five years with a maximum investment amount upto Rs.1.5 lakhs.";

  
  const extractSection = async (tabHref, contentSelector) => {
    try {
      const tab = await page.$(`a[href="${tabHref}"]`);
      if (tab) {
        await tab.click();
        // Wait for tab content to be visible
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
    product_name: "SBI Tax Saver Fixed Deposit",
    description: overview || "N/A",
    features: features || [],
    eligibility: eligibility || "Check website",
    fees_and_charges: [],
    interest_rate: null,
    source_url:"https://sbi.co.in/web/yono/tax-saver-fixed-deposit",
    income_type: "Any",
    goal: "Tax Savings",
    risk_profile: "Low",
  };
};

module.exports = scrapeSBITaxSaverFd;
