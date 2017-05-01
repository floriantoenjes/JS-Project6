"use strict";

const fs = require("fs");
const json2csv = require("json2csv");
const scrapeIt = require("scrape-it");

const baseUrl = "http://www.shirts4mike.com";

const fields = ["Title", "Price", "ImageURL", "URL"];
const shirts = [];

scrapeIt(baseUrl + "/shirts.php", {
    articles: {
        listItem: ".products li",
        data: {
            src: {
                selector: "a",
                attr: "href"
            }
        }
    }
}, scrapeShirtCatalogue);

function scrapeShirtCatalogue(err, page) {
    const promises = [];
    for (let article of page.articles) {
        promises.push(new Promise(function (resolve, reject) {
            const shirtUrl = baseUrl + "/" + article.src;
            scrapeIt(shirtUrl, {
                title: {
                    selector: "img",
                    attr: "alt"
                },
                price: ".price",
                imgUrl: {
                    selector: "img",
                    attr: "src"
                }
            }, (er, shirtPage) => {
                const shirt = {
                    Title: shirtPage.title,
                    Price: shirtPage.price,
                    ImageURL: baseUrl + "/" + shirtPage.imgUrl,
                    URL: shirtUrl
                };
                shirts.push(shirt);
                resolve(true);
            });
        }));
    }
    Promise.all(promises).then(function () {
        writeCSVFile();
    });
}

function writeCSVFile() {
    const csv = json2csv({
        data: shirts,
        fields: fields
    });

    const date = (new Date()).toISOString().slice(0, 10);

    fs.writeFile(date + ".csv", csv, function (err) {
        if (err) throw err;
        console.log('file saved');
    });
}
