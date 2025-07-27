import { chromium } from "playwright";

export default async function scrapeICICIRD () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the page containing ICICI RD features
  await page.goto(
    "https://groww.in/recurring-deposit/icici-bank-rd-interest-rates",
    { waitUntil: "domcontentloaded" }
  );

  // Define a static overview based on the provided context
  const overview = "When it comes to opening an RD account, ICICI bank is one of the best banks to get started with. Owing to the attractive ICICI RD interest rates on deposits, one can rest assured of getting a handsome amount of deposit upon maturity. ICICI provides two types of recurring deposits, i.e. rd for regular citizens which offers an interest of 5.50%, and RD for senior citizens which offer 6.30% for senior citizens. The investment tenure ranges between 6 months to 10 years and the minimum amount needed is Rs. 500.";

  // Scrape the features section dynamically
 // Wait for the h2 heading text
await page.waitForSelector('h2');

// Get the <ul> after the exact "Features of ICICI Recurring Deposit Interest Rates" heading
const features = await page.$$eval('h2', (headings) => {
  for (const heading of headings) {
    const text = heading.textContent?.trim().toLowerCase();

    // Try looser match
    if (text.includes('features')) {
      let el = heading;
      
      // Loop over next siblings until we find a <ul>
      while (el && el.nextElementSibling) {
        el = el.nextElementSibling;

        // If a <ul> is found anywhere in the subtree, extract it
        const ul = el.querySelector?.('ul');
        if (ul) {
          return Array.from(ul.querySelectorAll('li'))
            .map((li) => li.innerText.trim())
            .filter(Boolean);
        }

        // Edge case: the element itself is <ul>
        if (el.tagName.toLowerCase() === 'ul') {
          return Array.from(el.querySelectorAll('li'))
            .map((li) => li.innerText.trim())
            .filter(Boolean);
        }
      }
    }
  }
  return [];
});

const eligibility=["The applicants need to be Indian residents"]


  // Wait for the features section to ensure it's loaded
  await page.waitForSelector("h2", { timeout: 10000 });

  await browser.close();

  return {
    bank_name: "ICICI",
    product_name: "ICICI Recurring Deposit",
    category: "Recurring Deposit",
    description: overview,
    features: features,
    eligibility: eligibility, // Not scraped as per request
    fees_and_charges: [], // Not scraped as per request
    interest_rate: null, // Not scraped as per request
    source_url: page.url(),
    goal: "Savings",
    risk_profile: "Low",
  };
};

scrapeICICIRD()

