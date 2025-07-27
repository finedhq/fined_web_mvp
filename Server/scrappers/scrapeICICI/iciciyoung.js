import { chromium } from "playwright";

export default async function scrapeYoungICICISavings () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/savings-account/icici-bank-savings-account",
    { waitUntil: "domcontentloaded" }
  );

  const overview =
    "ICICI Bank Young Stars Savings Account is for children from 1 day to 18 years of age. In this case, the minor’s parent or guardian can operate the account, and build wealth. The child can use internet banking to surf its sections and fun zones. You can also transfer pocket money to the kid’s account. Enjoy facilities such as multicity cheque book, e-statements, fund transfer, Money Multiplier Scheme, Debit Card, personal accident insurance, purchase protection cover, and more.";

  await page.waitForSelector(".cs81Heading", { timeout: 10000 });

  const eligibility = [
     "This is a savings bank account for kids in the age group of 1 day to 18 years",
     "But only the parent or guardian can open the account on their child's behalf",
  ];

  const sections = await page.$$eval(".cs81Heading", (headings) => {
    const result = {
      features: [],
    };

    headings.forEach((heading) => {
      const text = heading.innerText.trim().toLowerCase();
      const next = heading.nextElementSibling;

      if (!next || !next.classList.contains("cs81ContentDiv")) return;

      const items = Array.from(next.querySelectorAll("ul li, p"))
        .map((el) => el.innerText.trim())
        .filter(Boolean);

      if (text.includes("young stars")) result.features = items;
    });

    return result;
  });

  await browser.close();

  return {
    bank_name: "ICICI",
    product_name: "ICICI Young Stars Savings Account",
    category: "Savings Account",
    description: overview,
    features: sections.features,
    eligibility: eligibility,
    fees_and_charges: [],
    interest_rate: null,
    source_url: page.url(),
    goal: "Easy Savings",
    risk_profile: "Low",
  };
};

scrapeYoungICICISavings()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

