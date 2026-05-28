import { chromium } from "playwright";

export default async function scrapeSBIFD () {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://sbi.co.in/web/personal-banking/investments-deposits/deposits/fixed-deposit",
    { waitUntil: "domcontentloaded" }
  );

const overview ="Invest your lump sum in an SBI Term Deposit and enjoy benefits such as assured returns, flexible interest payout options, and access to funds through overdraft or early withdrawal.";

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
    "Resident Indian individuals above 18 years with Aadhaar and PAN",
    "Mobile number must be linked with Aadhaar",
  ];

  

  await browser.close();

  return {
    bank_name: "SBI",
    category: "Fixed Deposit",
    product_name: "SBI Fixed Deposit",
    description: overview || "N/A",
    features: features || [],
    eligibility: eligibility || "Check website",
    fees_and_charges: [],
    interest_rate: null,
    source_url:"https://sbi.co.in/web/personal-banking/investments-deposits/deposits/fixed-deposit",
    income_type: "Any",
    goal: "Capital Growth",
    risk_profile: "Low",
  };
};
