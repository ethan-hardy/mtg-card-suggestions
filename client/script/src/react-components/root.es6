import _ from 'lodash';
import React from 'react';
import CardList from './card-list.es6';
import CardDetail from './card-detail.es6';
import CardFilterControls from './card-filter-controls.es6';

const urlForFilters = function(selectedFormat, selectedColors) {
  // selectedFormat is required
  const colorStringUrlSection = _.reduce(selectedColors, (str, colorIsSelected, colorSymbol) => {
    return colorIsSelected ? str + colorSymbol : str;
  }, '');

  return `http://localhost:3000/api/cards?format=${selectedFormat}&colors=${colorStringUrlSection}`;
};

const pullCardsForFilters = function(selectedFormat, selectedColors = {}) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    req.onload = function() {
      if (req.status !== 200) { reject(`Got bad response code ${req.status}`); }

      const json = JSON.parse(this.responseText);
      resolve(json.cards);
    };
    req.error = reject;

    const url = urlForFilters(selectedFormat, selectedColors);
    req.open('GET', url);
    req.send();
  });
};

const pullAllFormats = function() {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    req.onload = function() {
      if (req.status !== 200) { reject(`Got bad response code ${req.status}`); }

      const json = JSON.parse(this.responseText);
      resolve(json.allFormats);
    };
    req.error = reject;

    req.open('GET', 'http://localhost:3000/api/allFormats');
    req.send();
  });
};

class Root extends React.Component {
  constructor() {
    super();
    this.state = {
      filteredCards: [],
      displayedCard: null,
      formats: []
    };
  }

  componentDidMount() {
    pullAllFormats().then((allFormats) => {
      this.setState({
        formats: allFormats
      });
    });
  }

  onSubmitNewFilters = (selectedFormat, selectedColors) => {
    pullCardsForFilters(selectedFormat, selectedColors)
      .then(this.onCardDataLoaded)
      .catch((error) => {
        window.alert(error);
      });
  }

  onCardListLoaded = (cardList) => {
    this.setState({
      filteredCards: cardList,
      displayedCard: null
    });
  }

  onSelectCard = (card) => {
    this.setState({displayedCard: card});
  }

  render() {
    const {filteredCards, displayedCard, selectedColors, formats} = this.state;
    return (
      <div className='app-cntnr'>
        <CardFilterControls
          selectedColors={selectedColors}
          onSubmitNewFilters={this.onSubmitNewFilters}
          formats={formats}
        />
        <div className='bottom-cntnr'>
          <CardList cards={filteredCards} onSelectCard={this.onSelectCard} />
          <CardDetail card={displayedCard} />
        </div>
      </div>
    );
  }
}

export default Root;
