import { chromium } from "playwright";

export default async function scrapeHDFCRD () {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the page containing ICICI RD features
  await page.goto(
    "https://groww.in/recurring-deposit/hdfc-bank-rd-interest-rates",
    { waitUntil: "domcontentloaded" }
  );

  // Define a static overview based on the provided context
  const overview = "HDFC Bank offers recurring deposit schemes with attractive interest rates to its customers. Incorporated in 1994, HDFC Bank Ltd. is an Indian banking and financial services company and the second-largest private sector bank by assets. Usually, RD interest rates in HDFC range from 4.50% to 7% per annum. One can open an HDFC recurring deposit account with a minimum deposit of Rs. 1,000 to Rs. 14, 99, 900 with tenures ranging from 6 months to 10 years.";

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
        const ul = el.querySelector?.('ol');
        if (ul) {
          return Array.from(ul.querySelectorAll('li'))
            .map((li) => li.innerText.trim())
            .filter(Boolean);
        }

        // Edge case: the element itself is <ul>
        if (el.tagName.toLowerCase() === 'ol') {
          return Array.from(el.querySelectorAll('li'))
            .map((li) => li.innerText.trim())
            .filter(Boolean);
        }
      }
    }
  }
  return [];
});

const eligibility= await page.$$eval('h2', (headings) => {
  for (const heading of headings) {
    const text = heading.textContent?.trim().toLowerCase();

    // Try looser match
    if (text.includes('eligibility')) {
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



  // Wait for the features section to ensure it's loaded
  await page.waitForSelector("h2", { timeout: 10000 });

  await browser.close();

  return {
    bank_name: "HDFC",
    product_name: "HDFC Recurring Deposit",
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

scrapeHDFCRD()

