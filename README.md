# import-remote

a webpack plugin like html-webpack-plugin, but the template and output file is js file

## install

```bash
  npm install --save import-remote
```
or 
```bash
  yarn add import-remote
```

## usage

The plugin will generate an js entry file for you that includes all your `webpack`
bundles. Just add the plugin to your `webpack`
config as follows:

**webpack.config.js**
```js
const ImportRemotePlugin = require('import-remote/plugin')

module.exports = {
  entry: 'src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  externals: [
    'react',
    'react-dom',
    'lodash'
  ],
  optimization: {
    runtimeChunk: true,
  },
  plugins: [
    new ImportRemotePlugin()
  ]
}
```

**src/index.js**
```js
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash',

const test = {
  dosomething() {
    console.log('dosomething', React, ReactDOM, _);
  }
}

module.exports = test;
```

**host usage**
```js
import importRemote from 'import-remote';

const testIndex = await importRemote('http://localhost:3000/test/index.js', {
  // regisiter externals when call reomte
  externals: { 
    react: require('react'), 
    'react-dom': require('react-dom'),
    'lodash': require('lodash'),
  }
});
testIndex.dosomething();

// or register externals only once
Object.assign(remote.externals, { 
  react: require('react'), 
  'react-dom': require('react-dom'),
  'lodash': require('lodash'),
});
const testOther = await importRemote('http://localhost:3000/test/other.js');


testOther.dosomething();
```

or 

```js
import { RemoteModule } from 'import-remote';

const testModule = new RemoteModule('http://localhost:3000/test', {
  externals: { 
    react: require('react'), 
    'react-dom': require('react-dom'),
    'lodash': require('lodash'),
  }
});

const testIndex = await testModule.require('index');
const testOther = await testModule.require('other');

testIndex.dosomething();
testOther.dosomething();

```

## Options

You can pass a hash of configuration options to `import-remote/plugin`.
Allowed values are as follows

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`filename`**|`{String}`|`'index.js'`|The file to write the output entry file. Defaults to `index.js`. You can specify a subdirectory here too (eg: `assets/admin.js`)|
|**`templateParameters`**|`{Boolean\|Object\|Function}`|``| Allows to overwrite the parameters used in the template 
|**`hash`**|`{Boolean}`|`false`|If `true` then append a unique `webpack` compilation hash to all included scripts and CSS files. This is useful for cache busting|
|**`cache`**|`{Boolean}`|`true`|Emit the file only if it was changed|
|**`showErrors`**|`{Boolean}`|`true`|Errors details will be written into the HTML page|
|**`chunks`**|`{?}`|`?`|Allows you to add only some chunks (e.g only the unit-test chunk)|
|**[`chunksSortMode`](#plugins)**|`{String\|Function}`|`auto`|Allows to control how chunks should be sorted before they are included to the HTML. Allowed values are `'none' \| 'auto' \| 'dependency' \| 'manual' \| {Function}`|
|**`excludeChunks`**|`{Array.<string>}`|``|Allows you to skip some chunks (e.g don't add the unit-test chunk)|

Here's an example webpack config illustrating how to use these options

**webpack.config.js**
```js
{
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new ImportRemotePlugin({
      filename: 'assets/admin.js'
    })
  ]
}
```

### Generating Multiple Output Entry Files

To generate more than one output entry file, declare the plugin more than
once in your plugins array

**webpack.config.js**
```js
{
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new ImportRemotePlugin(), // Generates default index.js
    new ImportRemotePlugin({  // Also generate a test.js
      filename: 'test.js',
    })
  ]
}
```

### Filtering Chunks

To include only certain chunks you can limit the chunks being used

**webpack.config.js**
```js
plugins: [
  new ImportRemotePlugin({
    chunks: ['app']
  })
]
```

It is also possible to exclude certain chunks by setting the `excludeChunks` option

**webpack.config.js**
```js
plugins: [
  new ImportRemotePlugin({
    excludeChunks: [ 'dev-helper' ]
  })
]
```

### Long Term Caching

For long term caching add `contenthash/templatehash` to the filename.

**Example:**

```js
plugins: [
  new ImportRemotePlugin({
    filename: 'index.[contenthash].js'
  })
]
```

`contenthash/templatehash` is the hash of the content of the output file.

Optionally, You can configure like `[<hashType>:contenthash:<digestType>:<length>]`

* `hashType` - one of `sha1`, `md5`, `sha256`, `sha512`  or any other node.js supported hash type
* `digestType` - one of `hex`, `base26`, `base32`, `base36`, `base49`, `base52`, `base58`, `base62`, `base64`
* `maxlength` - maximum length of the generated hash in chars

**Defaults:** `[md5:contenthash:hex:9999]`



