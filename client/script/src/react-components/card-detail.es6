import React from 'react';

const NO_CARD_SELECTED_IMG_URL = 'todo-make-this-image';

const CardDetail = (props) => {
  // props: {cardName}
  const imageUrl = props.cardName ?
    `http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=${props.cardName}` : NO_CARD_SELECTED_IMG_URL;
  return (
    <div className='card-detail-cntnr'>
      <img className='card-image' src={imageUrl} />
    </div>
  );
};

export default CardDetail;
