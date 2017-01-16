# Isomorphic Style component for React & Webpack

[![CircleCI](https://circleci.com/gh/kouhin/isomorphic-style/tree/develop.svg?style=svg)](https://circleci.com/gh/kouhin/isomorphic-style/tree/develop)
[![dependency status](https://david-dm.org/kouhin/isomorphic-style.svg?style=flat-square)](https://david-dm.org/kouhin/isomorphic-style)

## Installation

```
npm install --save isomorphic-style
```

```
$ npm install isomorphic-style --save-dev
```

## Usage

### 1. Webpack (webpack 2):

```js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'isomorphic-style/loader',
            options: {
              insertAt: 'istyle_loc',
              prefix: 'istyle_',
            },
          },
          {
            loader: `css-loader?modules&importLoaders=1&localIdentName=${CSS_IDENT_NAME}`,
          },
          {
            loader: 'postcss-loader', // for postcss, optional
          },
        ],
      }
    ]
  }
}
```

### 2. In React component

```css
// MyComponent.css
.Block {
  background-color: lightgray;
}
.Title {
  font-weight: bold;
  font-size: 20px;
}
```

```javascript
// MyComponent.js
import React from 'react';
import { Style } from 'isomorphic-style';
import style from './MyComponent.css';

export default class MyComponent extends React.Component {
  return (
    <div className={style.Block}>
      <Style style={style} />
      <h1 className={style.Title}>MyComponent!</h1>
    </div>
  );
}
```

### 3. Server side entry

```javascript
import { collectStyles } from 'isomorphic-style';

...
const [styles, body] = collectStyles(() => ReactDOMServer.renderToString(
    <Provider store={store}>
      <RouterContext {...renderProps} />
    </Provider>,
));

// res is express Response object
res.send(`
<html>
  <head>
    ${styles.join()}
    <style id="istyle_loc"></style>
    <link rel="stylesheet" href="skin.css" />
  </head>
  <body>
    <div id="App">
      ${body}
    </div>
    <script src="main.js"></script>
  </body>
</html>
`);
...
```
### License

The MIT License © 2017-2018 Bin Hou. All rights reserved.

Original isomorphic-style-loader code is Copyright © 2015-2016 Kriasoft, LLC. covered under MIT license. 
