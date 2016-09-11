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

const getInitialColorMap = function() {
  const colorMap = {};
  _.forEach(COLORS, (color) => {
    colorMap[color.symbol] = false;
  });
  return colorMap;
};

const getFormatOptions = function(formats) {
  return _.map(formats, (format) => {
    return (
      <option
        value={format}
        key={format}>
        {format}
      </option>
    );
  });
};

class CardFilterControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColors: getInitialColorMap(),
      selectedFormat: props.formats[0] || null
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

  submitNewFiltersClicked = () => {
    this.props.onSubmitNewFilters(this.state.selectedFormat, this.state.selectedColors);
  }

  render() {
    const formatOptions = getFormatOptions(this.props.formats);
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
          {colorSymbolToggles}
        </div>
        <div className='card-filter--right-content'>
          <div className='format-cntnr'>
            <h1>Select your format</h1>
            <select onChange={this.formatSelected}
              value={this.state.selectedFormat}>
              {formatOptions}
            </select>
          </div>
          <div className='button go-button'
            onClick={this.submitNewFiltersClicked}>
            Go
          </div>
        </div>
      </div>
    );
  }
}

export default CardFilterControls;
