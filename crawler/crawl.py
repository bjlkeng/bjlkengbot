import scrapy

class BlogSpider(scrapy.Spider):
    download_delay = 0.5
    name = "blog_spider"
    start_urls = ["https://briankeng.com/2022/12/2022-year-in-review/"] 
    max_pages = 1000
    count = 0

    def parse(self, response):
        title = response.css("h1.entry-title ::text").getall()
        title = '\n'.join(title)
        content = response.css("div.entry-content ::text").getall()
        content = title + '\n'.join(content)
        url = response.url

        yield {"title": title, "content": content, "url": url}

        for next_page in response.css("a[rel='prev']"):
            if self.count < self.max_pages:
                self.count += 1
                yield response.follow(next_page, callback=self.parse)