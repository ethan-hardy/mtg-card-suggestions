import React from 'react';

const URL_BASE = window.location.hostname;

const getColorSymbolImageUrl = function(symbol) {
  return `https://${URL_BASE}/api/symbolImage?name=${symbol}`;
};

const ColorSymbolToggle = ({colorSymbol, isSelected, onToggle}) => {
  const imageUrl = getColorSymbolImageUrl(colorSymbol);
  const classNames = isSelected ?
    'color-symbol' : 'color-symbol color-symbol--unselected';
  return (
    <img className={classNames}
      src={imageUrl}
      onClick={onToggle.bind(null, colorSymbol)}/>
  );
};

export default ColorSymbolToggle;
