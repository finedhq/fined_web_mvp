import { chromium } from "playwright";

export default async function scrapeBasicICICISavings () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://groww.in/savings-account/icici-bank-savings-account",
    { waitUntil: "domcontentloaded" }
  );

  const overview =
    "The ICICI Bank Basic Savings Bank Deposit Account (BSBDA) is a zero balance savings account designed to promote financial inclusion. It offers essential banking services without requiring a minimum balance. The account comes with a free RuPay debit card, access to internet and mobile banking, and allows a limited number of monthly withdrawals as per RBI guidelines. This account is ideal for individuals seeking a simple, no-frills banking option with zero maintenance cost.";

  await page.waitForSelector(".cs81Heading", { timeout: 10000 });

  const eligibility = [
    "Should be a resident of India.",
    "Should be 18 years or above.",
    "Individuals belonging to HUV Kartas are not eligible for this savings account.",
    "NRIs are not eligible for this account.",
    "To be eligible for this account, the applicant should not hold any other savings account with ICICI Bank.",
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

      if (text.includes("basic savings")) result.features = items;
    });

    return result;
  });

  await browser.close();

  return {
    bank_name: "ICICI",
    product_name: "ICICI Basic Savings Account",
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

scrapeBasicICICISavings()

