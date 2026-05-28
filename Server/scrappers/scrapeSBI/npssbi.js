import { chromium } from "playwright";

export default async function scrapeSBINPS () {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://sbi.co.in/web/personal-banking/investments-deposits/govt-schemes/nps",
    { waitUntil: "domcontentloaded" }
  );


  let overview = "The National Pension Scheme or NPS is a social security scheme introduced by the government of India. This scheme allows one to build a retirement fund and also get lifelong annuity incomes.When the scheme was launched, it was meant only for the Government employees but then the scheme was made accessible to all. Today, every individual can invest in the NPS Scheme if he/she fulfils some basic eligibility criteria prescribed by the scheme.Banks and post offices have been authorized to allow individuals to open an NPS scheme in their name. SBI, India’s largest public sector bank, also allows customers to open an SBI NPS account through it. Let’s understand the different aspects of the same and how you can invest in the National Pension Scheme in SBI.";

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
    category: "Pension",
    product_name: "SBI NPS(Tier-1)",
    description: overview || "N/A",
    features: features || [],
    eligibility: eligibility || "Check website",
    fees_and_charges: [],
    interest_rate: null,
    source_url:"https://sbi.co.in/web/personal-banking/investments-deposits/govt-schemes/nps",
    income_type: "Pension",
    goal: "Taxsaver flexible",
    risk_profile: "Low",
  };
};
