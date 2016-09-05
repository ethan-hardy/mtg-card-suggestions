import React from 'react';
import CardList from './card-list';
import CardDetail from './card-detail';
import CardFilterControls from './card-filter-controls';

class Root extends React.Component {
  constructor() {
    super();
    this.onSelectCard = this.onSelectCard.bind(this);
    this.onFiltersChanged = this.onFiltersChanged.bind(this);

    return {
      filteredCards: [],
      displayedCard: null,
      selectedColors: [],
      selectedFormat: null
    };
  }

  componentDidMount() {

  }

  onSelectCard() {

  }

  onFiltersChanged() {

  }

  render() {
    const {filteredCards, displayedCard, selectedColors, selectedFormat} = this.state;
    return (
      <div className='app-cntnr'>
        <div className='top-cntnr'>
          <CardFilterControls
            selectedColors={selectedColors}
            selectedFormat={selectedFormat}
            onFiltersChanged={this.onFiltersChanged}
          />
        </div>
        <div className='bottom-cntnr'>
          <CardList cards={filteredCards} onSelectCard={this.onSelectCard} />
          <CardDetail card={displayedCard} />
        </div>
      </div>
    );
  }
}

export default Root;
