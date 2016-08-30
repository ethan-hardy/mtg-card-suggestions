const casper = require('casper').create();
const fs = require('fs');

const CARD_LIST_FILE_PATH = 'card-list.json';

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
  const cardRows = $('.chosen_tr, .hover_tr');
  const cardData = [];
  for (let i = 0; i < cardRows.length; i++) {
    const cardRow = cardRows[i];

    const rowChildren = $(cardRow).children();
    const cardName = $(rowChildren[0]).text();
    const cardPercentageText = $(rowChildren[1]).text();
    const cardPercent = window.getNumberFromPercentageText(cardPercentageText);

    const cardDatum = {name: cardName, percent: cardPercent};
    cardData.push(cardDatum);
  }

  return cardData;
};

const clickNext = function() {
  $('.Nav_PN:contains(\'Next\')').click();
};

const writeCardData = function(cardData) {
  if (!fs.exists(CARD_LIST_FILE_PATH)) {
    fs.touch(CARD_LIST_FILE_PATH);
  }

  fs.write(CARD_LIST_FILE_PATH, JSON.stringify(cardData), 'w');
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

casper.start('http://www.mtgtop8.com/topcards');

casper.options.onError = (e) => {
  casper.echo('Error has occurred in browser');
  casper.echo(e);
};

casper.options.onResourceRequested = function(casperInstance, requestData, networkRequest) {
  const urlBlacklist = [
    'http://match.rtbidder.net',
    '.png',
    'showad.js',
    'impl_v33.js',
    '.gif',
    'AdServer',
    'pagead2',
    'ad.doubleclick.net'
  ];

  urlBlacklist.forEach(function(urlToBlacklist) {
    if (requestData.url.indexOf(urlToBlacklist) > 0) {
      networkRequest.abort();
    }
  });
};

casper.then(function() {
  casper.evaluate(function() {
    // set up helper fns in evaluate scope
    window.getNumberFromPercentageText = function(text) {
      const percentString = text.split(' ')[0];
      return parseFloat(percentString);
    };
  });
});

const formatData = {};
for (let i = 0; i < FORMAT_LIST.length; i++) {
  const formatParameter = FORMAT_LIST[i];
  (function(format) {
    casper.then(function () {
      casper.page.evaluate(selectFormat, format);

      getCurrentFormatList().then((newFormatList) => {
        casper.echo(`${format} scrape complete`);
        formatData[format] = newFormatList;
      });
    });
  })(formatParameter);
}

casper.then(() => {
  writeCardData(formatData);
  casper.echo('Web scrape complete!');
  casper.exit();
});

casper.run();
