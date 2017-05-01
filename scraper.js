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
    const promises = [];
    for (let article of page.articles) {
        promises.push(new Promise(function(resolve, reject){
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
                console.log("First");
                resolve(true);
            });
        }));
    }
    Promise.all(promises).then(function() {
        console.log("Last");
    });
});
