import { chromium } from "playwright";

export default async function scrapeAce () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/savings-account/kotak-mahindra-bank-savings-account",
    { waitUntil: "domcontentloaded" }
  );

  const overview =
    "Kotak Mahindra Bank provides its customers with a wide range of savings account alternatives to meet their specific needs. The possibilities range from premium savings accounts to basic or standard accounts, online savings accounts to offline accounts for youngsters to accounts for older folks. The rate of interest paid on Kotak Mahindra Bank savings accounts is higher than that offered by most of its competitors. Here are all the detailed information about Kotak savings account with interest rates, types of savings accounts, features, and more";

  await page.waitForSelector(".cs81Heading", { timeout: 10000 });

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

      if (text.includes("ace savings")) result.features = items;
    });

    return result;
  });
  const eligibility = [
    "Resident Indian (Sole or Joint Account)",
    "Hindu Undivided Families",
    "Foreign Nationals Residing in India",
  ];

  await browser.close();

  return {
    bank_name: "Kotak",
    product_name: "Kotak Ace Savings Account",
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

scrapeAce()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

