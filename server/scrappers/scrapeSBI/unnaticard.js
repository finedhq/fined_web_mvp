const { chromium } = require("playwright");

const scrapeSBIUnnatiCard = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/credit-card/sbi-unnati-credit-card",
    { waitUntil: "domcontentloaded" }
  );

  const overview =
    "The State Bank of India launched a new credit card called the SBI Unnati Credit Card. The Unnati card is available to account holders having a balance of Rs.25,000 or more. SBI will not charge an annual card fee for the first 4 years. Furthermore, the card comes with a bevy of benefits. Due to its use at over 24 million outlets and excellent reward points, the Unnati card may be the right option for consumers who want to utilize a credit card for basic needs such as paying utility bills, making payments, shopping, and so on.";

  await page.waitForSelector(".cs81Heading", { timeout: 10000 });

  const features = await page.$$eval(".cs81ContentDiv li", (items) =>
    items.map((el) => el.textContent.trim()).filter(Boolean)
  );

  const eligibility = await page.$$eval(".cs81ContentDiv table tr", (rows) => {
    return rows.map((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length === 2) {
        const key = cells[0].textContent.trim().replace(":", "");
        const value = cells[1].textContent.trim();
        return `${key}: ${value}`;
      }
      return null;
    }).filter(Boolean);
  });

  const fees_and_charges = await page.$$eval(".cs81Heading", (headings) => {
    for (const heading of headings) {
      if (
        heading.textContent.includes("Fees and Charges") &&
        heading.nextElementSibling
      ) {
        const rows = heading.nextElementSibling.querySelectorAll("table tr");
        return Array.from(rows).map((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length === 2) {
            const key = cells[0].textContent.trim().replace(":", "");
            const value = cells[1].textContent.trim();
            return `${key}: ${value}`;
          }
          return null;
        }).filter(Boolean);
      }
    }
    return [];
  });

  await browser.close();

  return {
    bank_name: "SBI",
    product_name: "SBI Unnati Credit Card",
    category: "Credit Card",
    description: overview,
    features: features,
    eligibility: eligibility,
    fees_and_charges: fees_and_charges,
    interest_rate: null,
    source_url: page.url(),
    goal: "Credit Utility",
    risk_profile: "Low",
  };
};

scrapeSBIUnnatiCard()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err));

module.exports = scrapeSBIUnnatiCard;
