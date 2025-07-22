const { chromium } = require("playwright");

const scrapeHDFCTax = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the page containing ICICI RD features
  await page.goto("https://groww.in/fixed-deposits/hdfc-tax-saving-fd", {
    waitUntil: "domcontentloaded",
  });

  // Define a static overview based on the provided context
  const overview =
    "The HDFC Tax Saving FD is a form of the fixed deposit that combines the advantages of investing in an FD with tax savings. You can save income tax by investing in an HDFC Tax Saving FD under Section 80C.Section 80C allows for a Rs 1.5 lakh tax deduction for an investment in a tax-saving fixed deposit. Unlike other fixed deposits, the HDFC Tax Saving FD has a 5-year lock-in term. As a result, when investing in a tax-free FD, an investor must evaluate the liquidity of the investment.";
  // Scrape the features section dynamically
  // Wait for the h2 heading text
  await page.waitForSelector("h2");

  // Get the <ul> after the exact "Features of ICICI Recurring Deposit Interest Rates" heading
  const features = await page.$$eval("h2", (headings) => {
    for (const heading of headings) {
      const text = heading.textContent?.trim().toLowerCase();

      // Try looser match
      if (text.includes("characteristics")) {
        let el = heading;

        // Loop over next siblings until we find a <ul>
        while (el && el.nextElementSibling) {
          el = el.nextElementSibling;

          // If a <ul> is found anywhere in the subtree, extract it
          const ul = el.querySelector?.("ul");
          if (ul) {
            return Array.from(ul.querySelectorAll("li"))
              .map((li) => li.innerText.trim())
              .filter(Boolean);
          }

          // Edge case: the element itself is <ul>
          if (el.tagName.toLowerCase() === "ul") {
            return Array.from(el.querySelectorAll("li"))
              .map((li) => li.innerText.trim())
              .filter(Boolean);
          }
        }
      }
    }
    return [];
  });

  const eligibility = [
    "Every Indian resident, including senior citizens and HUF Hindu Undivided Families, is eligible to invest in the HDFC Tax Saving FD.",
  ]

  // Wait for the features section to ensure it's loaded
  await page.waitForSelector("h2", { timeout: 10000 });

  await browser.close();

  return {
    bank_name: "HDFC",
    product_name: "HDFC Tax Saver Fixed Deposit",
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

scrapeHDFCTax()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err.message));

module.exports = scrapeHDFCTax;
