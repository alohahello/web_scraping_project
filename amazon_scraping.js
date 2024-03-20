// Importing necessary modules
import puppeteer from "puppeteer"; // Importing Puppeteer for web scraping
import fs from "fs/promises"; // Helps to write date in JSON file 

// Function to scrape Amazon Best Sellers Books data
async function amazonBestSellersBooks() {
    let browser; // Declaring a variable to hold the browser instance
    let extractionTimestamp; // Declaring a variable to hold the extraction timestamp

    try { // Try block to handle potential errors
        // Launching Puppeteer and creating a new page
        browser = await puppeteer.launch({
            headless: false, // Setting headless mode to false for browser visibility
            //Slow down the Puppeteer operations by a specified amount of milliseconds. 
            // Useful for debugging and observing the behavior of automated browser interactions in a more human-readable pace.
            slowMo: 1000, 
        });
        const page = await browser.newPage(); // Creating a new page instance

        // Navigating to the Amazon Best Sellers Books page and taking a screenshot
        await page.goto('https://www.amazon.com/gp/bestsellers/books/ref=zg_bs_nav_books_0');
        await page.screenshot({ path: 'amazon.png' }); // Taking a screenshot of the page

        // Capturing the timestamp for data extraction
        extractionTimestamp = new Date().toLocaleString();

        // Extracting data from the page using evaluate function
        const results = await page.evaluate((extractionTimestamp) => { // Executing code in the browser context
            // Selecting all book elements on the page
            const books = document.querySelectorAll('._cDEzb_iveVideoWrapper_JJ34T');
            
            // Mapping each book element to extract relevant information
            const data = [...books].map(book => {
                const bookTitle = book.querySelector('._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y').innerText; // Extracting book title
                const sellerElement = book.querySelector('.a-size-small'); // Extracting seller element
                const seller = sellerElement ? sellerElement.textContent.trim() : null; // Extracting seller information
                const ratingElement = book.querySelector('.a-icon-row .a-icon-alt'); // Extracting rating element
                const rating = ratingElement ? ratingElement.textContent.trim() : null; // Extracting rating information
                const numReviewsElement = book.querySelector('.a-icon-row .a-size-small'); // Extracting number of reviews element
                const numReviews = numReviewsElement ? numReviewsElement.textContent.trim() : null; // Extracting number of reviews
                const paperTypeElement = book.querySelector('.a-size-small.a-color-secondary.a-text-normal'); // Extracting paper type element
                const bookFormat = paperTypeElement ? paperTypeElement.textContent.trim() : null; // Extracting paper type information
                const priceElement = book.querySelector('._cDEzb_p13n-sc-price_3mJ9Z'); // Extracting price element
                const price = priceElement ? priceElement.textContent.trim() : null; // Extracting price information

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
    } catch (error) { // Catching and handling errors
        // Handling errors and logging error message
        console.error('An error occurred:', error.message);
    } finally { // Executing cleanup code
        // Closing the browser instance in the finally block
        if (browser) {
            await browser.close();
        }
    }
}

// Calling the main function to initiate the scraping process
amazonBestSellersBooks();
