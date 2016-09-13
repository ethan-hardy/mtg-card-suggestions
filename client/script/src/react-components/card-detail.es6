import React from 'react';

const NO_CARD_SELECTED_IMG_URL = '../../../resources/mtgsymbol.png';

const CardDetail = (props) => {
  // props: {cardName}
  const imageUrl = props.cardName ?
    `http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name=${props.cardName}` : NO_CARD_SELECTED_IMG_URL;
  return (
    <div className='card-detail-cntnr'>
      <div className='card-detail--content-cntnr'>
        <h1 className='card-title'>{props.cardName || 'Click a card to show it here'}</h1>
        <a href={`http://gatherer.wizards.com/Pages/Card/Details.aspx?name=${props.cardName}`}>
          <img className='card-image' src={imageUrl} />
        </a>
      </div>
    </div>
  );
};

export default CardDetail;
