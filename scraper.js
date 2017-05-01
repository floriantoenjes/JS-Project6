"use strict";

const scrapeIt = require("scrape-it");

const baseUrl = "http://www.shirts4mike.com";

const shirts = [];

scrapeIt(baseUrl + "/shirts.php", {
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

    for (let article of page.articles) {

        scrapeIt(baseUrl + "/" + article.src, {
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
            shirts.push(shirtPage);
        });
    }
});
