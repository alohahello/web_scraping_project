// Importing necessary modules
import puppeteer from "puppeteer";
import fs from "fs/promises";

// Function to scrape Amazon Best Sellers Books data
async function amazonBestSellersBooks() {
    let browser;
    let extractionTimestamp;

    try {
        // Launching Puppeteer and creating a new page
        browser = await puppeteer.launch({
            headless: false, // Set to true for headless mode
        });
        const page = await browser.newPage();

        // Navigating to the Amazon Best Sellers Books page and taking a screenshot
        await page.goto('https://www.amazon.com/gp/bestsellers/books/ref=zg_bs_nav_books_0');
        await page.screenshot({ path: 'amazon.png' });

        // Capturing the timestamp for data extraction
        extractionTimestamp = new Date().toLocaleString();

        // Extracting data from the page using evaluate function
        const results = await page.evaluate((extractionTimestamp) => {
            // Selecting all book elements on the page
            const books = document.querySelectorAll('._cDEzb_iveVideoWrapper_JJ34T');
            
            // Mapping each book element to extract relevant information
            const data = [...books].map(book => {
                const bookTitle = book.querySelector('._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y').innerText;
                const sellerElement = book.querySelector('.a-size-small');
                const seller = sellerElement ? sellerElement.textContent.trim() : null;
                const ratingElement = book.querySelector('.a-icon-row .a-icon-alt');
                const rating = ratingElement ? ratingElement.textContent.trim() : null;
                const numReviewsElement = book.querySelector('.a-icon-row .a-size-small');
                const numReviews = numReviewsElement ? numReviewsElement.textContent.trim() : null;
                const paperTypeElement = book.querySelector('.a-size-small.a-color-secondary.a-text-normal');
                const bookFormat = paperTypeElement ? paperTypeElement.textContent.trim() : null;
                const priceElement = book.querySelector('._cDEzb_p13n-sc-price_3mJ9Z');
                const price = priceElement ? priceElement.textContent.trim() : null;

                // Returning an object with extracted data for each book
                return {
                    bookTitle,
                    seller,
                    rating,
                    numReviews,
                    bookFormat,
                    price,
                };
            });

            // Returning an object with extraction timestamp and the extracted data
            return { extractionTimestamp, data };
        }, extractionTimestamp);

        // Converting the results to JSON format with indentation
        const jsonString = JSON.stringify(results, null, 2);

        // Creating a unique filename with a timestamp for the exported JSON file
        const filename = `amazonBooksData_${extractionTimestamp.replace(/[^\w]/g, '_')}.json`;

        // Writing the JSON data to a file
        await fs.writeFile(filename, jsonString);

        // Logging success message with the filename
        console.log(`Data extraction and export successful. File saved as: ${filename}`);
    } catch (error) {
        // Handling errors and logging error message
        console.error('An error occurred:', error.message);
    } finally {
        // Closing the browser instance in the finally block
        if (browser) {
            await browser.close();
        }
    }
}

// Calling the main function to initiate the scraping process
amazonBestSellersBooks();
