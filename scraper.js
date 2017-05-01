"use strict";

const fs = require("fs");
const json2csv = require("json2csv");
const scrapeIt = require("scrape-it");

const shirts = [];

const catalogueQuery = {
    articles: {
        listItem: ".products li",
        data: {
            src: {
                selector: "a",
                attr: "href"
            }
        }
    }
};

const shirtDetailsQuery = {
    title: {
        selector: "img",
        attr: "alt"
    },
    price: ".price",
    imgUrl: {
        selector: "img",
        attr: "src"
    }
};

const baseUrl = "http://www.shirts4mike.com";

// Scrape the shirt catalogue
scrapeIt(baseUrl + "/shirts.php", catalogueQuery, scrapeShirtCatalogueCallback);

function scrapeShirtCatalogueCallback(err, page) {
    const promises = [];
    for (let article of page.articles) {

        // Create promises for data collection later
        promises.push(new Promise(function (resolve, reject) {

            const shirtUrl = baseUrl + "/" + article.src;

            // Scrape the shirt details page
            scrapeIt(shirtUrl, shirtDetailsQuery,
                     function (err, shirtPage) {
                scrapeShirtDetailsPageCallback(err, shirtPage, shirtUrl, resolve);
            });

        }));
    }

    Promise.all(promises).then(function () {
        writeCSVFile();
    });

}

function scrapeShirtDetailsPageCallback(err, shirtPage, shirtUrl, resolve) {
    const shirt = {
        Title: shirtPage.title,
        Price: shirtPage.price,
        ImageURL: baseUrl + "/" + shirtPage.imgUrl,
        URL: shirtUrl
    };
    shirts.push(shirt);
    resolve(true);
}

function writeCSVFile() {
    const fields = ["Title", "Price", "ImageURL", "URL"];
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
