const { chromium } = require("playwright");

const scrapeSBISimplySave = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://groww.in/credit-card/sbi-simplysave-credit-card", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const overview =
    "SBI Simply SAVE Credit Card is a simple credit card designed for everyday purchases. As the name implies, the card allows you to earn massive rewards on your daily expenses and other categories. You can earn more benefits with this credit card in various areas, such as supermarkets, department store purchases, dining, and movies.";

 
  const eligibility = await page.$$eval(".cs81Heading", (headings) => {
    for (const heading of headings) {
      if (
        heading.textContent.includes(
          "Eligibility Criteria for SBI Simply Save Credit Card"
        ) &&
        heading.nextElementSibling
      ) {
        return Array.from(
          heading.nextElementSibling.querySelectorAll("p")
        )
          .map((p) => p.textContent.trim())
          .filter(Boolean);
      }
    }
    return [];
  });

  const features = await page.$$eval(".cs81Heading", (headings) => {
  for (const heading of headings) {
    if (heading.textContent.includes("Features and Benefits of SBI Simply Save Credit Card")) {
      const nextDiv = heading.nextElementSibling;
      const table = nextDiv?.querySelector("table");
      if (!table) return [];

      return Array.from(table.querySelectorAll("tr"))
        .map(row => {
          const cells = row.querySelectorAll("td");
          if (cells.length === 2) {
            return [
              cells[0].innerText.trim().replace(/\s+/g, " "),
              cells[1].innerText.trim().replace(/\s+/g, " ")
            ];
          }
          return null;
        })
        .filter(Boolean);
    }
  }
  return [];
});

const fees_and_charges = await page.$$eval(".cs81Heading", (headings) => {
    for (const heading of headings) {
      if (
        heading.textContent.includes(
          "Annual Fee and Charges of SBI Simply Save Credit Card"
        ) &&
        heading.nextElementSibling
      ) {
        const rows =
          heading.nextElementSibling.querySelectorAll("table tr");
        return Array.from(rows)
          .map((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length === 2) {
              const key = cells[0].textContent.trim();
              const value = cells[1].textContent.trim();
              return [key, value];
            }
            return null;
          })
          .filter(Boolean);
      }
    }
    return [];
  });


  await browser.close();

  return {
    bank_name: "SBI",
    product_name: "SBI Simply Save Credit Card",
    category: "Credit Card",
    description: overview,
    features:features,
    eligibility,
    fees_and_charges,
    interest_rate: null,
    source_url: "https://groww.in/credit-card/sbi-simplysave-credit-card",
    goal: "Credit Utility",
    risk_profile: "Low",
  };
};

scrapeSBISimplySave()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scraping failed:", err));

module.exports = scrapeSBISimplySave;
