import _ from 'lodash';
import React from 'react';
import CardList from './card-list.es6';
import CardDetail from './card-detail.es6';
import CardFilterControls from './card-filter-controls.es6';

const PAGE_SIZE = 20;

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
      resolve(json.formats);
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
      filteredCardNames: [],
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
      .then(this.onCardListLoaded)
      .catch((error) => {
        throw new Error(error);
      });
  }

  onCardListLoaded = (cardList) => {
    this.setState({
      filteredCardNames: cardList,
      displayedCard: null
    });
  }

  onSelectCard = (card) => {
    this.setState({displayedCard: card});
  }

  render() {
    const {filteredCardNames, displayedCard, selectedColors, formats} = this.state;
    if (!formats.length) { return <div className='app-cntnr' />; }

    const bottomContainer = filteredCardNames.length ?
      (<div className='bottom-cntnr'>
        <CardList cardNames={filteredCardNames}
          onSelectCard={this.onSelectCard}
          pageSize={PAGE_SIZE}/>
        <CardDetail cardName={displayedCard} />
      </div>) : <div className='bottom-cntnr' />;

    return (
      <div className='app-cntnr'>
        <div className='header-bar'>
          <h1 className='header-text'>Magic the Gathering Deck Suggestions</h1>
        </div>
        <div className='content-cntnr'>
          <CardFilterControls
            selectedColors={selectedColors}
            onSubmitNewFilters={this.onSubmitNewFilters}
            formats={formats}
          />
          {bottomContainer}
        </div>
      </div>
    );
  }
}

export default Root;
