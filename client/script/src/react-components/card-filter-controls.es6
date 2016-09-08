import React from 'react';
import _ from 'lodash';

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
      <option selected={format.selected}
        value={format.name}
        key={format.name}>
        {format.name}
      </option>
    );
  });
};

class CardFilterControls extends React.Component {
  // props {formats, submitNewFilters, selectedFormat}
  constructor(props) {
    super(props);
    this.state = {
      selectedColors: getInitialColorMap(),
      selectedFormat: props.selectedFormat
    };
  }

  colorSelected = (colorSymbol, e) => {
    const nextSelectedColors =
      Object.assign({}, this.state.selectedColors, {[colorSymbol]: e.target.checked});
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
    this.props.onSubmitNewFilters(this.state.selectedColors, this.state.selectedFormat);
  }

  render() {
    const formatOptions = getFormatOptions(this.props.formats);
    const colorCheckboxes = _.map(COLORS, (color) => {
      const checked = this.state.selectedColors[color.symbol];
      return (
        <div className='color-checkbox-cntnr' key={color.symbol}>
          <input type='checkbox'
            className='color-checkbox'
            onChange={this.colorSelected.bind(null, color.symbol)}
            checked={checked}
            value={color.displayName} />
          <p>{color.displayName}</p>
        </div>
      );
    });

    return (
      <div className='card-filter-cntnr'>
        <div className='format-cntnr'>
          <p>Select a format:</p>
          <select onChange={this.formatSelected}>
            {formatOptions}
          </select>
        </div>
        <div className='color-select-cntnr'>
          <p>Select the colors in your deck:</p>
          {colorCheckboxes}
        </div>
        <div className='go-button'
          onClick={this.submitNewFiltersClicked}>
          Go
        </div>
      </div>
    );
  }
}

export default CardFilterControls;
