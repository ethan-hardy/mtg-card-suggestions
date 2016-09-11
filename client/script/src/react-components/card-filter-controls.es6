import React from 'react';
import _ from 'lodash';
import ColorSymbolToggle from './color-symbol-toggle.es6';

const COLORS = {
  RED: {symbol: 'R', displayName: 'Red'},
  WHITE: {symbol: 'W', displayName: 'White'},
  BLUE: {symbol: 'U', displayName: 'Blue'},
  BLACK: {symbol: 'B', displayName: 'Black'},
  GREEN: {symbol: 'G', displayName: 'Green'},
  COLORLESS: {symbol: 'C', displayName: 'Colorless'}
};

export const TYPE_FILTERS = {
  ALL: 'All',
  LANDS: 'Lands',
  NONLANDS: 'Nonlands'
};

const getInitialColorMap = function() {
  const colorMap = {};
  _.forEach(COLORS, (color) => {
    colorMap[color.symbol] = false;
  });
  return colorMap;
};

const getOptionsForCollection = function(collection) {
  return _.map(collection, (member) => {
    return (
      <option
        value={member}
        key={member}>
        {member}
      </option>
    );
  });
};

class CardFilterControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColors: getInitialColorMap(),
      selectedFormat: props.formats[0] || null,
      selectedTypeFilter: TYPE_FILTERS.ALL
    };
  }

  static propTypes = {
    formats: React.PropTypes.array.isRequired,
    onSubmitNewFilters: React.PropTypes.func.isRequired
  }

  colorToggled = (colorSymbol) => {
    const previousColorSelectedValue = this.state.selectedColors[colorSymbol];
    const nextSelectedColors = Object.assign(
      {},
      this.state.selectedColors,
      {[colorSymbol]: !previousColorSelectedValue}
    );
    this.setState({
      selectedColors: nextSelectedColors
    });
  }

  formatSelected = (e) => {
    this.setState({
      selectedFormat: e.target.value
    });
  }

  typeFilterSelected = (e) => {
    this.setState({
      selectedTypeFilter: e.target.value
    });
  }

  submitNewFiltersClicked = () => {
    this.props.onSubmitNewFilters(
      this.state.selectedFormat, this.state.selectedColors, this.state.selectedTypeFilter);
  }

  render() {
    const formatOptions = getOptionsForCollection(this.props.formats);
    const typeOptions = getOptionsForCollection(TYPE_FILTERS);
    const colorSymbolToggles = _.map(COLORS, (color) => {
      const isSelected = this.state.selectedColors[color.symbol];
      return (
        <ColorSymbolToggle colorSymbol={color.symbol}
          isSelected={isSelected}
          onToggle={this.colorToggled}
          key={color.displayName} />
      );
    });

    return (
      <div className='card-filter-cntnr'>
        <div className='color-select-cntnr'>
          <h1>Select your colors</h1>
          <div className='justify-spc-btwn-cntnr'>{colorSymbolToggles}</div>
        </div>
        <div className='format-cntnr'>
          <h1>Select your format</h1>
          <select onChange={this.formatSelected}
            value={this.state.selectedFormat}>
            {formatOptions}
          </select>
        </div>
        <div className='format-cntnr'>
          <h1>Filter types</h1>
          <select onChange={this.typeFilterSelected}
            value={this.state.selectedTypeFilter}>
            {typeOptions}
          </select>
        </div>
        <div className='button go-button'
          onClick={this.submitNewFiltersClicked}>
          Go
        </div>
      </div>
    );
  }
}

export default CardFilterControls;
