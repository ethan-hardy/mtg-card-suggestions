const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const app = express();

const POPULATED_CARD_LIST_FILE_PATH = 'card-data-population/populated-card-list.json';
const ALL_TYPES = 'ALL_TYPES';

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
    const typeIsSatisfied = type === ALL_TYPES || (_.isArray(card.types) && card.types.includes(type));
    return typeIsSatisfied && colorsSatisfyColorRules(colors, card.colorRules);
  }).map('name');
};

app.get('/', (req, res) => {
  res.json({hello: 'world'});
});

app.get('/api/cards', (req, res) => {
  if (!existingCardList) {
    return app.status(501).send({error: 'Card list not found!'});
  }

  const format = _.upperFirst(req.query.format); //format is mandatory for now
  const type = req.query.type ? _.upperFirst(req.query.type) : ALL_TYPES;
  const colors = req.query.colors ? _.toUpper(req.query.colors) : '';

  const cards = getCardsForParams(existingCardList, {format, type, colors});
  res.json({cards});
});

app.listen(3000, undefined, undefined, () => {
  console.log('App listening on port 3000');
});
