import puppeteer from "puppeteer";
import convertPrice from "../utils/convertPrice.js";
import { chromeConfig } from "../config/config.js";
const ScrapeFlipkart = async (url) => {
  if (!url) {
    return Error("URL is required");
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const productTitle = await page.$eval(
      "span.VU-ZEz",
      (el) => el.textContent
    );

    const productPriceString = await page.$eval(
      "div.Nx9bqj.CxhGGd",
      (el) => el.textContent
    );

    const productPrice = convertPrice(productPriceString);

    // Get all the <li> elements in the <ul>
    const listItems = await page.$$("ul.ZqtVYK > li");

    const imageSources = new Set();

    for (let i = 0; i < listItems.length; i++) {
      // Click on each <li> element one by one
      await listItems[i].click();

      // Wait for the image or video to appear (or timeout if not found)
      try {
        await page.waitForSelector("div._8id3KM img", {
          timeout: 5000,
        });
        const imageSrc = await page.$eval("div._8id3KM img", (img) => img.src);
        imageSources.add(imageSrc);
      } catch (err) {
        console.log(`No image found for <li> ${i + 1}, it might be a video.`);
      }

      if (imageSources.size === 3) {
        break;
      }
      // Optionally, wait for some time between clicks to avoid issues
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
    }

    await browser.close();
    return {
      name: productTitle,
      price: productPrice,
      images: Array.from(imageSources),
    };
  } catch (error) {
    console.error("Error:", error);
  }
};

export default { ScrapeFlipkart };
