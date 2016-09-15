import React from 'react';

const CardDetail = ({cardName, cardImageUrl}) => {
  return (
    <div className='card-detail-cntnr'>
      <div className='card-detail--content-cntnr'>
        <h1 className='card-title'>{cardName || 'Click a card to show it here'}</h1>
        <a href={`http://gatherer.wizards.com/Pages/Card/Details.aspx?name=${cardName}`}>
          <img className='card-image' src={cardImageUrl} />
        </a>
      </div>
    </div>
  );
};

export default CardDetail;
