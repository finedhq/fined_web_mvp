import { chromium } from "playwright";

export default async function scrapeHDFCMoney () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://groww.in/credit-card/hdfc-moneyback-credit-card", {
    waitUntil: "domcontentloaded",
  });

  const overview =
    "HDFC MoneyBack is a popular entry-level credit card in India that provides cashback on all transactions. This is an excellent choice if you frequently shop online because it offers larger benefits on online purchases.If you are new to credit and want to get started, you can apply for this credit card. In comparison to the annual cost, the perks provided by this credit card are fairly excellent. Here is more information on the HDFC MoneyBack Credit Card to help you decide whether it is a suitable fit for you.";

  await page.waitForSelector(".cs81ContentDiv table", { timeout: 10000 });

const features = await page.$$eval(".cs81ContentDiv table tbody tr", (rows) => {
  const data = {};
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length === 2) {
      const keyElement = cells[0].innerText?.trim().replace(/\n/g, " ") || "";
      const valueElement = cells[1].innerText?.trim().replace(/\n/g, " ") || "";
      if (keyElement && valueElement) {
        data[keyElement] = valueElement;
      }
    }
  });
  return data;
});

console.log(features);


  const eligibility = [
    "Salaried Indian nationality Age: Min 21 yrs. & Max 60 Yrs.",
    "Salaried Income: Net Monthly Income> ₹20,000",
    "Self Employed Indian nationality: Age: Min 21 yrs. & Max 65 Yrs., Income: ITR > ₹6.0 Lakhs per annum",
  ];

  await browser.close();

  return {
    bank_name: "HDFC",
    product_name: "HDFC MoneyBack Credit Card",
    category: "Credit Card",
    description: overview,
    features: features,
    eligibility:eligibility,
    fees_and_charges: [],
    interest_rate: null,
    source_url: page.url(),
    goal: "Easy Savings",
    risk_profile: "Low",
  };
};

scrapeHDFCMoney()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

