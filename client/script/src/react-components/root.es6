import _ from 'lodash';
import React from 'react';
import CardList from './card-list.es6';
import CardDetail from './card-detail.es6';
import CardFilterControls, {TYPE_FILTERS} from './card-filter-controls.es6';

const PAGE_SIZE = 20;

const getTypeFilterUrlSection = function(typeFilter) {
  switch (typeFilter) {
  case TYPE_FILTERS.LANDS: return 'Land';
  case TYPE_FILTERS.NONLANDS: return 'Nonland';
  default: return ''; // TYPE_FILTERS.ALL -- with no type in the query, server will assume all types
  }
};

const urlForFilters = function(selectedFormat, selectedColors, selectedTypeFilter) {
  const colorStringUrlSection = _.reduce(selectedColors, (str, colorIsSelected, colorSymbol) => {
    return colorIsSelected ? str + colorSymbol : str;
  }, '');
  const typeFilter = getTypeFilterUrlSection(selectedTypeFilter);

  return `http://localhost:3000/api/cards?format=${selectedFormat}&colors=${colorStringUrlSection}&type=${typeFilter}`;
};

const pullCardsForFilters = function(selectedFormat, selectedColors, selectedTypeFilter) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    req.onload = function() {
      if (req.status !== 200) { reject(`Got bad response code ${req.status}`); }

      const json = JSON.parse(this.responseText);
      resolve(json.cards);
    };
    req.error = reject;

    const url = urlForFilters(selectedFormat, selectedColors, selectedTypeFilter);
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

  onSubmitNewFilters = (selectedFormat, selectedColors, selectedTypeFilter) => {
    pullCardsForFilters(selectedFormat, selectedColors, selectedTypeFilter)
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
      (<div className='bottom-cntnr justify-spc-btwn-cntnr'>
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
