'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var casper = require('casper').create({
  // verbose: true,
  // logLevel: 'debug'
});
var fs = require('fs');

var CARD_LIST_FILE_PATH = 'web-scraper/card-list.json';

var FORMATS = {
  STANDARD: 'Standard',
  MODERN: 'Modern',
  LEGACY: 'Legacy',
  VINTAGE: 'Vintage',
  COMMANDER: 'Commander',
  PAUPER: 'Pauper'
};

var FORMAT_LIST = (0, _keys2.default)(FORMATS).map(function (key) {
  return FORMATS[key];
});

var isAtLastPage = function isAtLastPage() {
  // Nav_PN is the enabled button class -- next would be disabled at the last page
  return $('.Nav_PN:contains(\'Next\')').length === 0;
};

var getCardDataOnCurrentPage = function getCardDataOnCurrentPage() {
  var cardRows = $('.chosen_tr, .hover_tr');
  var cardData = [];
  for (var i = 0; i < cardRows.length; i++) {
    var cardRow = cardRows[i];

    var rowChildren = $(cardRow).children();
    var cardName = $(rowChildren[0]).text();
    var cardPercentageText = $(rowChildren[1]).text();
    var percentString = cardPercentageText.split(' ')[0];
    var cardPercent = parseFloat(percentString);

    var cardDatum = { name: cardName, percent: cardPercent };
    cardData.push(cardDatum);
  }

  return cardData;
};

var clickNext = function clickNext() {
  $('.Nav_PN:contains(\'Next\')').click();
};

var writeCardData = function writeCardData(cardData) {
  if (!fs.exists(CARD_LIST_FILE_PATH)) {
    fs.touch(CARD_LIST_FILE_PATH);
  }

  fs.write(CARD_LIST_FILE_PATH, (0, _stringify2.default)(cardData), 'w');
};

var getCurrentFormatList = function getCurrentFormatList() {
  var existingData = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return new _promise2.default(function (resolve) {
    casper.waitForSelector('.chosen_tr', function () {
      var cardData = casper.page.evaluate(getCardDataOnCurrentPage);
      var lastPage = casper.page.evaluate(isAtLastPage);
      var newData = existingData.concat(cardData);

      if (lastPage) {
        resolve(newData);
      } else {
        casper.page.evaluate(clickNext);
        getCurrentFormatList(newData).then(resolve);
      }
    }, function () {
      casper.echo('getCurrentFormatList has timed out');
    }, 20000);
  });
};

var selectFormat = function selectFormat(format) {
  // select given format
  $('select[name=\'format\']').find('option:contains(\'' + format + '\')').attr('selected', true);
  // click GO
  $('input[value=\'GO\']').click();
};

casper.start('http://www.mtgtop8.com/topcards');

casper.options.onError = function (e) {
  casper.echo('Error has occurred in browser');
  casper.echo(e);
};

casper.options.onResourceRequested = function (casperInstance, requestData, networkRequest) {
  var urlBlacklist = ['http://match.rtbidder.net', '.png', 'showad.js', 'impl_v33.js', '.gif', 'AdServer', 'pagead2', 'ad.doubleclick.net'];

  urlBlacklist.forEach(function (urlToBlacklist) {
    if (requestData.url.indexOf(urlToBlacklist) > 0) {
      networkRequest.abort();
    }
  });
};

var formatData = {};
for (var i = 0; i < FORMAT_LIST.length; i++) {
  var formatParameter = FORMAT_LIST[i];
  (function (format) {
    casper.then(function () {
      casper.page.evaluate(selectFormat, format);

      getCurrentFormatList().then(function (newFormatList) {
        casper.echo(format + ' scrape complete');
        formatData[format] = newFormatList;
      });
    });
  })(formatParameter);
}

casper.then(function () {
  writeCardData(formatData);
  casper.echo('Web scrape complete!');
  casper.exit();
});

casper.run();
