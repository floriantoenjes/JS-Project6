"use strict";

const scrapeIt = require("scrape-it");
const json2csv = require("json2csv");
const fs = require("fs");

const baseUrl = "http://www.shirts4mike.com";

const fields = ["title", "price", "imgUrl", "url"];
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
}, scrapeShirtCatalogue);

function scrapeShirtCatalogue(err, page) {
    const promises = [];
    for (let article of page.articles) {
        promises.push(new Promise(function(resolve, reject){
            const shirtUrl = baseUrl + "/" + article.src;
            scrapeIt(shirtUrl, {
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
                const shirt = {
                    title: shirtPage.title,
                    price: shirtPage.price,
                    imgUrl: baseUrl + "/" + shirtPage.imgUrl,
                    url: shirtUrl
                };
                shirts.push(shirt);
                console.log(shirt);
                resolve(true);
            });
        }));
    }
    Promise.all(promises).then(function() {
        console.log("Last");
        writeCSVFile();
    });
}

function writeCSVFile() {
    const csv = json2csv({data: shirts, fields: fields});

    fs.writeFile('file.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
}
