import React from 'react';
import _ from 'lodash';

import keyPressHelper from '../util/key-press-helper.es6';

class CardList extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
  }

  static propTypes = {
    cardNames: React.PropTypes.array.isRequired,
    onSelectCard: React.PropTypes.func.isRequired,
    pageSize: React.PropTypes.number.isRequired
  }

  componentDidMount() {
    keyPressHelper.registerKeyListener('ArrowRight', this.pageForward);
    keyPressHelper.registerKeyListener('ArrowLeft', this.pageBack);
    keyPressHelper.registerKeyListener('ArrowUp', this.upDownArrowPressed);
    keyPressHelper.registerKeyListener('ArrowDown', this.upDownArrowPressed);
  }

  componentWillReceiveProps(nextProps) {
    if (_.isEqual(this.props.cardNames, nextProps.cardNames)) { return ; }

    this.setState(this.getDefaultState());
  }

  getDefaultState() {
    return {
      currentPage: 0,
      selectedCardIndex: null
    };
  }

  isAtFirstPage = () => {
    return this.state.currentPage === 0;
  }

  isAtLastPage = () => {
    return (this.state.currentPage + 1) * this.props.pageSize >= this.props.cardNames.length;
  }

  getTopCellIndex = () => {
    return this.props.pageSize * this.state.currentPage;
  }

  getBottomCellIndex = () => {
    return (this.state.currentPage + 1) * this.props.pageSize - 1;
  }

  pageBack = () => {
    if (this.isAtFirstPage()) { return null; }
    this.setState({
      currentPage: this.state.currentPage - 1,
      selectedCardIndex: null
    });
  }

  pageForward = () => {
    if (this.isAtLastPage()) { return null; }
    this.setState({
      currentPage: this.state.currentPage + 1,
      selectedCardIndex: null
    });
  }

  cardSelected = (index) => {
    if (index < this.getTopCellIndex() || index > this.getBottomCellIndex()) { return; }

    this.setState({
      selectedCardIndex: index
    }, () => {
      const card = this.props.cardNames[index];
      this.props.onSelectCard(card);
    });
  }

  upDownArrowPressed = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') { return; }
    e.preventDefault();

    let selectedCardIndex = e.key === 'ArrowDown' ?
      this.state.selectedCardIndex + 1 : this.state.selectedCardIndex - 1;

    if (e.key === 'ArrowDown' && this.state.selectedCardIndex === null) {
      selectedCardIndex = this.getTopCellIndex();
    } else if (e.key === 'ArrowUp' && this.state.selectedCardIndex === null) {
      selectedCardIndex = this.getBottomCellIndex();
    }

    this.cardSelected(selectedCardIndex);
  }

  getCardList() {
    const sliceStart = this.props.pageSize * this.state.currentPage;
    return _(this.props.cardNames)
      .slice(sliceStart, sliceStart + this.props.pageSize)
      .map((cardName, index) => {
        const translatedIndex = index + sliceStart;
        let classNames = translatedIndex === this.state.selectedCardIndex ?
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
      <div className='page-buttons-cntnr justify-spc-btwn-cntnr'>
        <div className={pageBackClasses} onClick={this.pageBack}>
          Previous
        </div>
        <p className='page-number'>{this.state.currentPage + 1}</p>
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
