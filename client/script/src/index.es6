import React from 'react';
import ReactDOM from 'react-dom';
import Root from './react-components/root.es6';

import '../../style/app.css';

ReactDOM.render(
  React.createElement(Root),
  document.getElementById('root')
);
