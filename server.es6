const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const request = require('request');
const app = express();

const POPULATED_CARD_LIST_FILE_PATH = 'card-data-population/populated-card-list.json';
const ALL_TYPES = 'All-types', NONLANDS = 'Nonland', LAND = 'Land';

const fileExists = function(path) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
  } catch (e) {
    return false;
  }
  return true;
};

const existingCardList = fileExists(POPULATED_CARD_LIST_FILE_PATH) ?
  JSON.parse(fs.readFileSync(POPULATED_CARD_LIST_FILE_PATH, 'utf8')) : null;

const colorsSatisfyColorRules = function(colorString, colorRuleText) {
  // for some reason ''.split(',') returns [ '' ], which throws off the logic
  if (!colorRuleText.length) { return true; }

  const colors = colorString.split(''); // turn into an array
  const colorRules = colorRuleText.split(',');

  for (const colorRule of colorRules) {
    // colorRules can be either of the form 'X', or the form 'X/Y', where X,Y are color symbols
    // so, check if colorRule[0] OR colorRule[2] is contained in colors; otherwise, return false
    const colorRuleIsSatisfied = colors.includes(colorRule[0]) ||
      (colorRule[2] && colors.includes(colorRule[2]));

    if (!colorRuleIsSatisfied) { return false; }
  }

  return true;
};

const getCardsForParams = function(allCards, {format, type, colors}) {
  // params: {format: String, type: String, colors: String}
  return _(allCards[format]).filter((card) => {
    const typeIsSatisfied = type === ALL_TYPES ||
      (type === NONLANDS && _.isArray(card.types) && !card.types.includes(LAND)) ||
      (_.isArray(card.types) && card.types.includes(type));

    return typeIsSatisfied && colorsSatisfyColorRules(colors, card.colorRules);
  }).map('name');
};

app.use('/', express.static('./client'));

app.all('/api/*', (req, res, next) => {
  console.log(`Request received for ${req.originalUrl} at ${new Date()}`);
  next();
});

app.get('/api/cards', (req, res) => {
  if (!existingCardList) {
    return res.status(501).send({error: 'Card list not found!'});
  }

  const format = _.upperFirst(req.query.format); //format is mandatory for now
  const type = req.query.type ? _.upperFirst(req.query.type) : ALL_TYPES;
  const colors = req.query.colors ? _.toUpper(req.query.colors) : '';

  const cards = getCardsForParams(existingCardList, {format, type, colors});
  res.json({cards});
});

app.get('/api/allFormats', (req, res) => {
  if (!existingCardList) {
    return res.status(501).send({error: 'Card list not found!'});
  }

  const formats = Object.keys(existingCardList);
  res.json({formats});
});

app.get('/api/cardImage', (req, res) => {
  const name = req.query.name;
  const url = `http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=${name}`;
  request(url).pipe(res);
});

app.set('port', (process.env.PORT || 5000));
// app.set('port', (3000));

app.listen(app.get('port'), function() {
  console.log(`App listening on port ${app.get('port')}`);
});
