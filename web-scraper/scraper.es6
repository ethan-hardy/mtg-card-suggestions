const casper = require('casper').create();
const fs = require('fs');

const CARD_DATA_JSON_PATH = 'cardData.json';
const FORMATS = {
  STANDARD: 'Standard',
  MODERN: 'Modern',
  LEGACY: 'Legacy',
  VINTAGE: 'Vintage',
  COMMANDER: 'Commander',
  PAUPER: 'Pauper'
};

casper.start('http://www.mtgtop8.com/topcards');

const getNumberFromPercentageText = function(text) {
  const percentString = text.split(' ')[0];
  return parseFloat(percentString);
};

const getCardDataOnCurrentPage = function() {
  const cardRows = $('.chosen_tr, .hover_tr');
  const cardData = [];
  for (const cardRow of cardRows) {
    const rowChildren = $(cardRow).children();
    const cardName = $(rowChildren[0]).text();
    const cardPercentageText = $(rowChildren[1]).text();
    const cardPercent = getNumberFromPercentageText(cardPercentageText);

    const cardDatum = {name: cardName, percent: cardPercent};
    cardData.push(cardDatum);
  }

  return cardData;
};

const getCardDataForFormat = function(format) {
  // select given format
  $('select[name=\'format\']').find('option:contains(\'' + format + '\')').attr('selected', true);
  // click GO
  $('input[value=\'GO\']').click();
  let cardData = [];

  // Nav_PN is the enabled button class -- next would be disabled at the last page
  let atLastPage = true;
  while (!atLastPage) {
    atLastPage = $('.Nav_PN:contains(\'Next\')').length === 0;

    const pageCardData = getCardDataOnCurrentPage();
    cardData = cardData.concat(pageCardData);

    $('.Nav_PN:contains(\'Next\')').click();
  }

  return cardData;
};

const getAllCardData = function() {
  const cardData = {};
  for (const format of FORMATS) {
    cardData[format] = getCardDataForFormat(format);
  }
};

casper.then(function() {
  casper.page.includeJs('https://code.jquery.com/jquery-3.1.0.min.js', function() {
    if (!fs.exists(CARD_DATA_JSON_PATH)) {
      fs.touch(CARD_DATA_JSON_PATH);
    }

    const cardData = casper.page.evaluate(getAllCardData);
    fs.write(CARD_DATA_JSON_PATH, JSON.stringify(cardData), 'w');
  });
});



casper.run();
