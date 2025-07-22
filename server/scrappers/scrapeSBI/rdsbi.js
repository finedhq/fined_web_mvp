const { chromium } = require("playwright");

const scrapeSBIRD = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://sbi.co.in/web/personal-banking/investments-deposits/deposits/recurring-deposit",
    { waitUntil: "domcontentloaded" }
  );

const overview ="SBI offers attractive RD interest rates to its customers with a minimum deposit amount starting from just Rs. 100. SBI allows opening an RD account for a period of 7 days to 10 years depending on the financial goals of the customer. The SBI RD interest rates offered by the bank on deposit less than Rs. 2 crores is 5.00% and 5.40%. Senior citizens are offered an additional interest of 0.50% on normal interest rates.";


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

  const eligibility = [
     "Only Indian residents or members of a Hindu Undivided Family can open a recurring deposit account.",
     "Non Residential Indians can also have a recurring deposit account with SBI provided they apply for Non-Resident External (NRE) or Non-Resident Ordinary (NRO) account.",
     "In the case of minors, individuals can open an RD account provided that their finances are monitored by their legal guardians.",
  ];

  

  await browser.close();

  return {
    bank_name: "SBI",
    category: "Recurring Deposit",
    product_name: "SBI Recurring Deposit",
    description: overview || "N/A",
    features: features || [],
    eligibility: eligibility || "Check website",
    fees_and_charges:[],
    interest_rate: null,
    source_url:"https://sbi.co.in/web/personal-banking/investments-deposits/deposits/recurring-deposit",
    income_type: "Any",
    goal: "Habitual Saving",
    risk_profile: "Low",
  };
};

module.exports = scrapeSBIRD;
