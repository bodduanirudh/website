import asyncio
import json
import math
import httpx
from urllib.parse import urlencode
from typing import List, Dict
from loguru import logger as log
from parsel import Selector

BASE_HEADERS = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate",
}

async def parse_search(html_text: str) -> List[Dict]:
    """Extract search results from the HTML response"""
    sel = Selector(text=html_text)
    data = sel.xpath('//script[@id="__NEXT_DATA__"]/text()').get()
    data = json.loads(data)
    results = data["props"]["pageProps"]["initialData"]["searchResult"]["itemStacks"][0]["items"]
    
    extracted_data = []
    for item in results:
        name = item.get("name", "N/A")
        
        # Accessing the linePrice from priceInfo
        price_info = item.get("priceInfo", {})
        price = price_info.get("linePrice", "N/A")
        
        extracted_data.append({
            "name": name,
            "price": price
        })
    return extracted_data

async def scrape_walmart_page(session: httpx.AsyncClient, query: str = "", page: int = 1) -> httpx.Response:
    """Scrape a single Walmart search page"""
    url = "https://www.walmart.com/search?" + urlencode(
        {
            "q": query,
            "page": page,
            "affinityOverride": "default",
        },
    )
    resp = await session.get(url)
    assert resp.status_code == 200, "Request was blocked or failed."
    return resp

async def scrape_search(search_query: str, session: httpx.AsyncClient, max_scrape_pages: int = 5) -> List[Dict]:
    """Scrape Walmart search pages"""
    log.info(f"Scraping Walmart search for the keyword: {search_query}")
    
    all_results = []
    for page in range(1, max_scrape_pages + 1):
        response = await scrape_walmart_page(query=search_query, session=session, page=page)
        results = await parse_search(response.text)
        all_results.extend(results)
        log.info(f"Scraped page {page}")
    
    log.success(f"Scraped {len(all_results)} products from Walmart search")
    return all_results

async def run_scraper():
    limits = httpx.Limits(max_keepalive_connections=5, max_connections=5)
    async with httpx.AsyncClient(headers=BASE_HEADERS, limits=limits) as session:
        data = await scrape_search(search_query="engine oil", session=session, max_scrape_pages=5)
        
        # Save the results into a CSV file
        with open("walmart_engine_oil_prices.csv", "w", encoding="utf-8") as file:
            file.write("Product Name,Price\n")
            for item in data:
                file.write(f"{item['name']},{item['price']}\n")

if __name__ == "__main__":
    asyncio.run(run_scraper())
