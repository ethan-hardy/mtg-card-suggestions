import React from 'react';

const getColorSymbolImageUrl = function(symbol) {
  return `http://gatherer.wizards.com/Handlers/Image.ashx?size=medium&name=${symbol}&type=symbol`;
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
