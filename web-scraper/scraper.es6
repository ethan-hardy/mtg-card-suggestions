const casper = require('casper').create({
  logLevel: 'debug'
});
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

const FORMAT_LIST = Object.keys(FORMATS).map((key) => { return FORMATS[key]; });

const isAtLastPage = function() {
  // Nav_PN is the enabled button class -- next would be disabled at the last page
  return $('.Nav_PN:contains(\'Next\')').length === 0;
};

const getCardDataOnCurrentPage = function() {
  const getNumberFromPercentageText = function(text) {
    const percentString = text.split(' ')[0];
    return parseFloat(percentString);
  };

  const cardRows = $('.chosen_tr, .hover_tr');
  const cardData = [];
  for (let i = 0; i < cardRows.length; i++) {
    const cardRow = cardRows[i];

    const rowChildren = $(cardRow).children();
    const cardName = $(rowChildren[0]).text();
    const cardPercentageText = $(rowChildren[1]).text();
    const cardPercent = getNumberFromPercentageText(cardPercentageText);

    const cardDatum = {name: cardName, percent: cardPercent};
    cardData.push(cardDatum);
  }

  return cardData;
};

const clickNext = function() {
  $('.Nav_PN:contains(\'Next\')').click();
};

const writeCardData = function(cardData) {
  if (!fs.exists(CARD_DATA_JSON_PATH)) {
    fs.touch(CARD_DATA_JSON_PATH);
  }

  fs.write(CARD_DATA_JSON_PATH, JSON.stringify(cardData), 'w');
};

const getCurrentFormatList = function(existingData = []) {
  return new Promise((resolve) => {
    casper.waitForSelector('.chosen_tr', () => {
      const cardData = casper.page.evaluate(getCardDataOnCurrentPage);
      const lastPage = casper.page.evaluate(isAtLastPage);
      const newData = existingData.concat(cardData);

      if (lastPage) {
        resolve(newData);
      } else {
        casper.page.evaluate(clickNext);
        getCurrentFormatList(newData).then(resolve);
      }
    }, () => {
      casper.echo('getCurrentFormatList has timed out');
    }, 20000);
  });
};

const selectFormat = function(format) {
  // select given format
  $('select[name=\'format\']').find(`option:contains('${format}')`).attr('selected', true);
  // click GO
  $('input[value=\'GO\']').click();
};

const pullFormatData = function(ind = 0, cardData = {}) {
  casper.then(() => {
    const currentFormat = FORMAT_LIST[ind];
    casper.page.evaluate(selectFormat, currentFormat);

    getCurrentFormatList().then((newFormatList) => {
      const updatedCardData = Object.assign({}, cardData, {[currentFormat]: newFormatList});

      if (ind >= FORMAT_LIST.length) {
        writeCardData(cardData);
        casper.exit();
      } else {
        pullFormatData(ind + 1, updatedCardData);
      }
    });
  });
};

casper.options.onError = (e) => {
  casper.echo('Error has occurred in browser');
  casper.echo(e);
};

casper.start('http://www.mtgtop8.com/topcards');

const formatData = {};
for (let i = 0; i < FORMAT_LIST.length; i++) {
  const formatParameter = FORMAT_LIST[i];
  (function(format) {
    casper.then(function () {
      casper.page.evaluate(selectFormat, format);

      getCurrentFormatList().then((newFormatList) => {
        casper.echo(`Format ${format} scrape complete`);
        formatData[format] = newFormatList;
      });
    });
  })(formatParameter);
}

casper.then(() => {
  writeCardData(formatData);
  casper.exit();
});

casper.run();
