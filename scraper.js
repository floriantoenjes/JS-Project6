"use strict";

const fs = require("fs");
const json2csv = require("json2csv");
const scrapeIt = require("scrape-it");

const shirts = [];
const path = "./data";

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

const catalogueUrl = baseUrl + "/shirts.php";

// Scrape the shirt catalogue
scrapeIt(catalogueUrl, catalogueQuery, scrapeShirtCatalogueCallback);

function scrapeShirtCatalogueCallback(err, page) {
    if (err) {
        console.log(`There was an error connecting to "${baseUrl}".`)
        return;
    }

    const promises = [];
    for (let article of page.articles) {

        // Create promises for later collection of data
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
    createDirectory();
    const csvData = createCSVData();
    const fileName = path + "/" + createDate() + ".csv";

    fs.writeFile(fileName, csvData, function (err) {
        if (err) {
            throw err;
        }
        console.log('file saved');
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
