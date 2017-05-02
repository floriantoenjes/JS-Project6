"use strict";

const fs = require("fs");
const json2csv = require("json2csv");
const scrapeIt = require("scrape-it");

const shirts = [];
const path = "./data";
const baseUrl = "http://www.shirts4mike.com";

function scrapeShirtCatalogue() {
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

    const catalogueUrl = baseUrl + "/shirts.php";

    scrapeIt(catalogueUrl, catalogueQuery, scrapeShirtCatalogueCallback).catch(function () {});

}

function scrapeShirtCatalogueCallback(err, page) {
    if (err) {
        console.log(`There was an error connecting to "${baseUrl}".`)
        return;
    }

    const promises = [];
    for (let article of page.articles) {

        // Create promises for later collection of data
        promises.push(new Promise(function (resolve, reject) {
            scrapeShirtDetails(article, resolve);
        }));
    }

    // Write to csv after everything has been collected
    Promise.all(promises).then(function () {
        writeCSVFile();
    });

}

function scrapeShirtDetails(article, resolve) {
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

    const shirtUrl = baseUrl + "/" + article.src;

    scrapeIt(shirtUrl, shirtDetailsQuery,
        function (err, shirtPage) {
            scrapeShirtDetailsCallback(err, shirtPage, shirtUrl, resolve);
        });

}

function scrapeShirtDetailsCallback(err, shirtPage, shirtUrl, resolve) {
    const shirt = {
        Title: shirtPage.title,
        Price: shirtPage.price,
        ImageURL: baseUrl + "/" + shirtPage.imgUrl,
        URL: shirtUrl
    };
    shirts.push(shirt);

    // Resolve the promises for data collection here
    resolve(true);
}

function writeCSVFile() {
    createDirectory();
    const csvData = createCSVData();
    const fileName = createDate() + ".csv";
    const filePath = path + "/" + fileName;

    fs.writeFile(filePath, csvData, function (err) {
        if (err) {
            console.log("There was an error saving the CSV file.")
            return;
        }
        console.log(`CSV file "${fileName}" saved.`);
    });
}

function createDirectory() {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

function createCSVData() {
    const fields = ["Title", "Price", "ImageURL", "URL"];
    const csv = json2csv({
        data: shirts,
        fields: fields
    });
    return csv;
}

function createDate() {
    return (new Date()).toISOString().slice(0, 10);
}


scrapeShirtCatalogue();
