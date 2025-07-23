import { chromium } from "playwright";

export default async function scrapeSBIPPF () {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://sbi.co.in/web/personal-banking/investments-deposits/govt-schemes/ppf",
    { waitUntil: "domcontentloaded" }
  );

  let overview = "Public Provident Fund (PPF) schemes are one of the most popular long-term investment methods in India. This scheme is backed by the Government of India and hence provides substantial returns along with tax benefits.State Bank of India also offers the opportunity to open a PPF account easily. An SBI PPF Account can be opened across all the branches of the bank across the nation.";

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

  const features = await extractSection("#menu_1", "#menu_1");
  const eligibility = await extractSection("#menu_2", "#menu_2");

  await browser.close();

  return {
    bank_name: "SBI",
    category: "Government Savings",
    product_name: "SBI PPF Account",
    description: overview || "N/A",
    features: features || [],
    eligibility: eligibility || "Check website",
    fees_and_charges: [],
    interest_rate: null,
    source_url:"https://sbi.co.in/web/personal-banking/investments-deposits/govt-schemes/ppf",
    income_type: "any",
    goal: "Taxsaver Longterm",
    risk_profile: "Low",
  };
};
