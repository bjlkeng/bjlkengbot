import scrapy

class BlogSpider(scrapy.Spider):
    download_delay = 0.5
    name = "blog_spider"
    start_urls = ["https://briankeng.com/about/",
                  "https://briankeng.com/publications/",
                  "https://briankeng.com/worldly-wisdom/",
                  "https://briankeng.com/reading-list/",
                  "https://briankeng.com/2022/12/2022-year-in-review/",] 
    max_pages = 1000
    count = 0

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        if self.count < self.max_pages:
            self.count += 1
            if response.xpath('//div[contains(@class, "page-content")]'):
                yield from self.parse_page(response)
            else:
                yield from self.parse_blog(response)

    def parse_page(self, response):
        title = response.css("h1.page-title ::text").getall()
        title = '\n'.join(title)
        content = response.css("div.page-content ::text").getall()
        content = title + '\n'.join(content)
        url = response.url

        yield {"title": title, "content": content, "url": url}

    def parse_blog(self, response):
        title = response.css("h1.entry-title ::text").getall()
        title = '\n'.join(title)
        content = response.css("div.entry-content ::text").getall()
        content = title + '\n'.join(content)
        url = response.url

        yield {"title": title, "content": content, "url": url}

        for next_page in response.css("a[rel='prev']"):
            yield response.follow(next_page, callback=self.parse)