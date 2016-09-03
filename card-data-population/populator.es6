const _ = require('lodash');
const fs = require('fs');
const request = require('request');
const co = require('co');

const CARD_LIST_FILE_PATH = 'web-scraper/card-list.json';
const POPULATED_CARD_LIST_FILE_PATH = 'card-data-population/populated-card-list.json';

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
  const REPLACE_CHARS = [
    {find: /Æ/g, replace: '%C3%86'},
    {find: /û/g, replace: '%C3%BB'},
    {find: /ö/g, replace: '%C3%B6'},
    {find: / \/ .*/, replace: ''} // TODO: actually handle dual cards (ie far // away)
  ];
  const formatString = function(string) {
    let formattedString = string;
    for (const pair of REPLACE_CHARS) {
      formattedString = formattedString.replace(pair.find, pair.replace);
    }
    return formattedString;
  };

  return new Promise(function(resolve, reject) {
    const formattedCardName = formatString(cardName);
    const url = `${HTTP_REQ_URL_PREFIX}cards?name="${formattedCardName}"&pageSize=1`;

    request({url: url, timeout: 20000}, (error, response, body) => {
      numberOfRequests += 1;
      if (numberOfRequests % 1000 === 0) {
        console.log(`${numberOfRequests} requests made`);
      }
      if (error) {
        console.log(`error pulling from url ${url}`);
        console.log(error);
        reject(error);
      } else if (response.statusCode !== HTTP_STATUS_CODE_OK) {
        console.log(`error pulling from url ${url}`);
        console.log(`Bad response code ${response.statusCode}`);
        reject(new Error(`Bad response code ${response.statusCode}`));
      } else {
        const jsonBody = JSON.parse(body);
        resolve(jsonBody.cards[0]);
      }
    });
  });
};

const getRulesStringFromList = function(rulesList) {
  return _(rulesList).uniq()
    .sortBy()
    .reduce((rulesString, rule) => {
      return rulesString.length === 0 ? rule : `${rulesString},${rule}`;
    }, '');
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
  let match = rulesTextSymbolRegex.exec(cardData.text);
  while (!_.isNull(match)) {
    // match['1'] contains the first capture group, which is set to be the mana symbol
    rules.push(match['1']);
    match = rulesTextSymbolRegex.exec(cardData.text);
  }

  const isLand = _.isArray(cardData.types) && cardData.types.includes(LAND_CARD_TYPE);
  if (isLand) { return getRulesStringFromList(rules); }

  match = manaCostSymbolRegex.exec(cardData.manaCost);
  while (!_.isNull(match)) {
    // match['1'] contains the first capture group, which is set to be the mana symbol
    rules.push(match['1']);
    match = manaCostSymbolRegex.exec(cardData.manaCost);
  }

  return getRulesStringFromList(rules);
};

const getFormattedDataForCardData = function(cardData) {
  const baseProps = _.pick(cardData, CARD_DATA_KEYS_TO_SAVE);
  const colorRules = getColorRulesFromCardData(cardData);

  return Object.assign(baseProps, {colorRules});
};

const writePopulatedCardList = function(cardList) {
  fs.writeFile(POPULATED_CARD_LIST_FILE_PATH, JSON.stringify(cardList), (error) => {
    if (error) { throw error; }
    console.log(`Done! Saved populated card data at ${__dirname}/${POPULATED_CARD_LIST_FILE_PATH}`);
  });
};

const fileExists = function(path) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
  } catch (e) {
    return false;
  }
  return true;
};

const getPopulatedCardList = function*() {
  const fullFormatMapString = fs.readFileSync(CARD_LIST_FILE_PATH, 'utf8');
  const fullFormatMap = JSON.parse(fullFormatMapString);
  const existingCardListString = fileExists(POPULATED_CARD_LIST_FILE_PATH) ?
    fs.readFileSync(POPULATED_CARD_LIST_FILE_PATH, 'utf8') : '{}';
  const existingCardList = JSON.parse(existingCardListString);
  const populatedCardList = existingCardList.incomplete ?
    existingCardList : {};

  for (const format in fullFormatMap) {
    const formatList = fullFormatMap[format];
    populatedCardList[format] = populatedCardList[format] || [];
    for (let i = populatedCardList[format].length; i < formatList.length; i++) {
      const card = formatList[i];
      let cardData;
      try {
        cardData = yield pullDataForCardName(card.name);
      } catch (error) {
        console.log('Error encountered -- saving existing list as incomplete (will be resumed on next script run)');
        populatedCardList.incomplete = true;
        return populatedCardList;
      }
      const formattedCardData = getFormattedDataForCardData(cardData);
      console.log(`${cardData.name} added`);
      populatedCardList[format].push(formattedCardData);
    }
  }

  Reflect.deleteProperty(populatedCardList, 'incomplete');
  return populatedCardList;
};

co(getPopulatedCardList)
  .then(writePopulatedCardList)
  .catch((error) => { console.log(error); });
