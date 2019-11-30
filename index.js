const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: false });
  const [page] = await browser.pages();
  console.log("Launching Headless Browser");

  const books = [
    "9782845833173",
    "9782253194613",
    "9782290032237",
    "9782246612216",
    "9782265093577",
    "9782067139534",
    "9782253163954",
    "9782910188504",
    "9782038717235",
    
  ];

  // Go to Gilbert "Service après vente" page.
  await page.setViewport({ width: 500, height: 900 });
  await page.goto("https://www.gibert.com/sao");

  // Search the first Article
  await page.type("div.control input[name='codes']", books[0]);
  await page.click("#add_sao");
  console.log(`<-- Checking book n°0 - ${books[0]} -->`);

  // Bulk Search & Loop throught the books list
  for (let index = 1; index < books.length; index++) {
    const item = books[index];

    await page.waitForSelector("div.control input[name='codes']");
    await page.waitForSelector("#add_sao");

    await page.type("div.control input[name='codes']", item);
    await page.click("#add_sao");
    console.log(`<-- Checking book n°${index} - ${item} -->`);
  }

  // Wait for the results page to load and display the results.
  await page.waitForSelector("#product_list");

  const results = await page.evaluate(() => {
    const table = document.querySelector("#product_list");
    const list = [...table.rows];

    return list.map(row => {
      const rowTitle = row.cells[0].children[1].innerText;
      const rowId = parseInt(list[0].cells[0].children[2].innerText);
      const rowPrice =
        row.cells[1].innerText === "Non repris"
          ? new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR"
            }).format(0)
          : new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR"
            }).format(parseFloat(row.cells[1].innerText.replace(",", ".")));

      return { id: rowId, name: rowTitle, price: rowPrice, date: new Date().getFullYear() };
    });
  });

  console.log(results, `Total Books : ${results.length}`);

  // Extract the results from the page.
  // const links = await page.evaluate(resultsSelector => {
  //   const anchors = Array.from(document.querySelectorAll(resultsSelector));
  //   return anchors.map(anchor => {
  //     const title = anchor.textContent.split("|")[0].trim();
  //     return `${title} - ${anchor.href}`;
  //   });
  // }, resultsSelector);
  // console.log(links.join("\n"));

  // await browser.close();
})();
