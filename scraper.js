"use strict";

const scrapeIt = require("scrape-it");

const baseUrl = "http://www.shirts4mike.com";

scrapeIt(baseUrl + "/shirts.php", {
    // Fetch the articles
    articles: {
        listItem: ".products li"
      , data: {
            src: {
              selector: "a"
              , attr: "href"
          }
        }
    }
}, (err, page) => {
    console.log(err || page);

    for (let article of page.articles) {
        console.log(article.src);

        scrapeIt(baseUrl + "/" + article.src, {
//            url and image url
            title: {
                selector: "img"
                , attr: "alt"
            },
            price: ".price",
            imgUrl: {
                selector: "img"
                , attr: "src"
            }
        }, (er, shirtPage) => {
            console.log(er || shirtPage);
        });
    }
});
