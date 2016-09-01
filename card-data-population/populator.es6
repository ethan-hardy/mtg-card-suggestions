const _ = require('lodash');
const fs = require('fs');
const request = require('request');

const CARD_LIST_FILE_PATH = 'web-scraper/card-list.json';
const POPULATED_CARD_LIST_FILE_PATH = 'populated-card-list.json';

const HTTP_REQ_URL_PREFIX = 'https://api.magicthegathering.io/v1/';
const HTTP_STATUS_CODE_OK = 200;

const LAND_CARD_TYPE = 'Land';
const CARD_DATA_KEYS_TO_SAVE = [
  'name',
  'types'
];
/* Example mtg api card format (there are a lot more keys; these are the ones I'd use)
{
  "name":"Archangel Avacyn",
  "manaCost":"{3}{W}{W}",
  "cmc":5,
  "type":"Legendary Creature — Angel",
  "supertypes":[ "Legendary" ],
  "types":[ "Creature" ],
  "subtypes":[ "Angel" ],
  "text":"Flash\nFlying, vigilance\nWhen Archangel Avacyn ..."
}
*/

let numberOfRequests = 0;

const pullDataForCardName = function(cardName) {
  return new Promise(function(resolve, reject) {
    const url = `${HTTP_REQ_URL_PREFIX}cards?name="${cardName}"&pageSize=1`;

    request(url, (error, response, body) => {
      numberOfRequests += 1;
      if (numberOfRequests % 1000 === 0) {
        console.log(`${numberOfRequests} requests made`);
      }
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

const getRulesStringFromList = function(rulesList) {
  return _(rulesList).uniq
    .sortBy()
    .reduce((rulesString, rule) => {
      return rulesString.length === 0 ? rule : `${rulesString},${rule}`;
    }, '')
    .value();
};

const getColorRulesFromCardData = function(cardData) {
  // mana cost format is a comma separated list of restricting mana symbols
  // where optionals are separated by slashes. eg, kitchen finks is "G/W"
  // mantis rider is "W,R,U", Bant Sureblade is "U/G,W"
  // slash groups have implicit brackets around them
  // 'C' is used for diamond (colorless) mana
  // for lands, look through their rules text for mana symbols instead
  const manaCostSymbolRegex = /{([WGURBC]|(?:[WGURBC]\/[WGURBC]))}/g;
  const rulesTextSymbolRegex = /{([WGURBC]|(?:[WGURBC]\/[WGURBC]))}(?=[^a-z]*(?:\(|:|\n))/g;

  const rules = [];
  let match = null;
  do {
    match = rulesTextSymbolRegex.exec(cardData.text);
    // match['1'] contains the first capture group, which is set to be the mana symbol
    rules.push(match['1']);
  } while (!_.isNull(match));

  const isLand = _.contains(cardData.types, LAND_CARD_TYPE);
  if (isLand) { return getRulesStringFromList(rules); }

  do {
    match = manaCostSymbolRegex.exec(cardData.manaCost);
    // match['1'] contains the first capture group, which is set to be the mana symbol
    rules.push(match['1']);
  } while (!_.isNull(match));

  return getRulesStringFromList(rules);
};

const getFormattedDataForCardData = function(cardData) {
  const baseProps = _.pick(cardData, CARD_DATA_KEYS_TO_SAVE);
  const colorRules = getColorRulesFromCardData(cardData);

  return Object.merge(baseProps, {colorRules});
};

const pullPopulatedDataForCardList = function(cardList, format) {
  return new Promise(function(resolve, reject) {
    const populatedCardPromises = _.map(cardList, (card) => {
      // card format is {card, percent} -- see web-scraper/scraper.es6::getCardDataOnCurrentPage
      return pullDataForCardName(card.name).then(getFormattedDataForCardData);
    });

    Promise.all(populatedCardPromises).then((formattedList) => {
      resolve({cards: formattedList, format: format});
    }, reject);
  });
};

const writePopulatedCardList = function(cardList) {
  fs.writeFile(cardList, POPULATED_CARD_LIST_FILE_PATH, (error) => {
    if (error) { throw error; }
    console.log(`Done! Saved populated card data at ${__dirname}/${POPULATED_CARD_LIST_FILE_PATH}`);
  });
};

const populateCardList = function() {
  const fullFormatMapString = fs.readFileSync(CARD_LIST_FILE_PATH, 'utf8');
  const fullFormatMap = JSON.parse(fullFormatMapString);

  const fullPopulatedListPromises = _.map(fullFormatMap, pullPopulatedDataForCardList);
  Promise.all(fullPopulatedListPromises).then((fullPopulatedLists) => {
    const fullPopulatedFormatMap = {};
    for (const formatList of fullPopulatedLists) {
      fullPopulatedFormatMap[formatList.format] = formatList.cards;
    }

    writePopulatedCardList(fullPopulatedFormatMap);
  }).catch((error) => {
    console.log(error);
  });
};

populateCardList();
