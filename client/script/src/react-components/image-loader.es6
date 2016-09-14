import React from 'react';
import _ from 'lodash';

const ImageLoader = ({imageUrls}) => {
  const images = _.map(imageUrls, (imageUrl) => {
    return (<img className='hidden' src={imageUrl} />);
  });

  return (
    <div className='image-loader'>
      {images}
    </div>
  );
};

export default ImageLoader;
