const _ = require('lodash');
const fs = require('fs');
const request = require('request');

const CARD_LIST_FILE_PATH = 'web-scraper/card-list.json';
const POPULATED_CARD_LIST_FILE_PATH = 'populated-card-list.json';
const HTTP_REQ_URL_PREFIX = 'https://api.magicthegathering.io/v1/';
const HTTP_STATUS_CODE_OK = 200;

const pullDataForCardName = function(cardName) {
  return new Promise(function(resolve, reject) {
    const url = `${HTTP_REQ_URL_PREFIX}cards?name="${cardName}"&pageSize=1`;

    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode !== HTTP_STATUS_CODE_OK) {
        reject(`Bad response code ${response.statusCode}`);
      } else {
        resolve(body);
      }
    });
  });
};

const get

const getPopulatedDataForCardList = function(cardList) {
  const populatedCardPromises = _.map(cardList, (card) => {
    // card format is {card, percent} -- see web-scraper/scraper.es6:33
    return pullDataForCardName(card.name);
  });

  Promise.all(populatedCardPromises).then((cardList) => {

  });
};

const writePopulatedCardList = function(cardList) {
  fs.writeFile(cardList, POPULATED_CARD_LIST_FILE_PATH, (error) => {
    if (error) { throw error; }
    console.log(`Done! Saved populated card data at ${__dirname}/${POPULATED_CARD_LIST_FILE_PATH}`);
  });
};

const populateCardList = function() {
  const fullCardList = fs.readFileSync(CARD_LIST_FILE_PATH);
  const fullPopulatedList = _.mapValues(fullCardList, getPopulatedDataForCardList);

  writePopulatedCardList(fullPopulatedList);
};

populateCardList();
