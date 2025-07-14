import puppeteer from 'puppeteer';
import express from 'express';

const app = express();
const PORT = 3000;

async function scrapeWebsite(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(() => {
        return {
            title: document.title,
            h1: document.querySelector('h1')?.innerText || null,
            description: document.querySelector('meta[name="description"]')?.content || null,
            links: Array.from(document.querySelectorAll('a')).map(link => ({
                text: link.innerText.trim(),
                href: link.href
            }))
        };
    });

    await browser.close();
    return result;
}

app.get('/', async (req, res) => {
    try {
        const url = 'https://sonarqube.paltechops.org/dashboard?id=buzz-frontend-main_new&codeScope=new';
        const data = await scrapeWebsite(url);
        res.json(data); // Send data in JSON format
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scrape the website' });
    }
});

app.listen(PORT, () => {
    console.log(`JSON Scraper running at http://localhost:${PORT}`);
});
