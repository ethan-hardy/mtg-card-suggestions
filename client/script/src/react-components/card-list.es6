import React from 'react';
import _ from 'lodash';

class CardList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      selectedCardIndex: null
    };
  }

  static propTypes = {
    cardNames: React.PropTypes.array.isRequired,
    onSelectCard: React.PropTypes.func.isRequired,
    pageSize: React.PropTypes.number.isRequired
  }

  isAtFirstPage = () => {
    return this.state.currentPage === 0;
  }

  isAtLastPage = () => {
    return (this.state.currentPage + 1) * this.props.pageSize > this.props.cardNames.length;
  }

  pageBack = () => {
    if (this.isAtFirstPage()) { return null; }
    this.setState({
      currentPage: this.state.currentPage - 1
    });
  }

  pageForward = () => {
    if (this.isAtLastPage()) { return null; }
    this.setState({
      currentPage: this.state.currentPage + 1
    });
  }

  cardSelected = (index) => {
    this.setState({
      selectedCardIndex: index
    }, () => {
      const card = this.props.cardNames[index];
      this.props.onSelectCard(card);
    });
  }

  getCardList() {
    const sliceStart = this.props.pageSize * this.state.currentPage;
    return _(this.props.cardNames)
      .slice(sliceStart, sliceStart + this.props.pageSize)
      .map((cardName, index) => {
        const translatedIndex = index + sliceStart;
        const classNames = translatedIndex === this.state.selectedCardIndex ?
          'card-row card-row--selected' : 'card-row card-row--unselected';
        return (
          <div className={classNames}
            key={cardName}
            onClick={this.cardSelected.bind(null, translatedIndex)}>
            <p>{cardName}</p>
          </div>
        );
      })
      .value();
  }

  getPageButtonsContainer() {
    const pageBackClasses = this.isAtFirstPage() ?
      'button page-button disabled' : 'button page-button';
    const pageForwardClasses =  this.isAtLastPage() ?
      'button page-button disabled' : 'button page-button';

    return (
      <div className='page-buttons-cntnr'>
        <div className={pageBackClasses} onClick={this.pageBack}>
          Previous
        </div>
        <div className={pageForwardClasses} onClick={this.pageForward}>
          Next
        </div>
      </div>
    );
  }

  render() {
    const cardList = this.getCardList();
    const pageButtonsContainer = this.getPageButtonsContainer();

    return (
      <div className='card-list'>
        {cardList}
        {pageButtonsContainer}
      </div>
    );
  }
}

export default CardList;
