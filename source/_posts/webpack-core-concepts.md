---
title: 对webpack的几个核心概念的理解
categories:
  - programming
date: 2018-11-22 10:08:42
tags:
  - webpack
---

webpack是公认的功能强大但是难用的工具，虽然文档很全，但是由于各种配置太多且很多配置只有经过测试才能发现其意义，虽然自己从两年前就开始使用了，但是也只是勉强能给出符合项目要求的配置而已。最近webpack4发布了，自己又从头开始仔细读了一下它的guide文档，并按照文档的示例跑了一遍，对webpack的几个核心概念终于有了稍微清晰的认识，这里记录一下

- **chunk**

  chunk大概是文档中出现最频繁的单词，它指的是webpack最终输出的文件。chunk有两种类型：

  - entry chunk

    就是在entry配置中的入口文件，最终输出的文件名由另一个配置项`output.filename`决定

  - 其他chunk

    除了entry chunk外，webpack会根据我们的配置及代码情况自动输出很多文件，如`optimization.splitChunks`提取出的公共文件，`dynamic.import`生成的延迟加载文件

    这种chunk的输出文件名由配置项`output.chunkFilename`决定

- **module**

  module就是我们代码中通过import或require引入的一个文件，可以是js，css或图片等等。注意它和chunk的不同：chunk是最终的输出文件，而module是编码时的内部引用

- **runtime & manifest**

  为了使得这一套打包系统能够正常工作，也就是浏览器引入我们最终生成的chunk文件后能运转起来，包括module的解析引用能顺利进行，webpack提供了一段支撑代码，就是runtime。runtime最主要的工作就是module依赖关系的解析及module的导入，所以，在runtime中我们还需要所有module的一些meta信息，如各个module的唯一标识id及关系等等，这些信息称为manifest

  这个runtime代码可以包含在entry chunk中，或者单独提取出来作为独立的**runtime chunk**；在html文件中，runtime chunk一般放在entry chunk前面

- **caching**

  提到caching，标准的做法是做[code splitting](https://webpack.js.org/guides/code-splitting/)，将runtime代码, 第三方库代码及自己的代码分离开来打成独立的chunk并在chunk的输出文件名中带上chunkhash：

  ```javascript
    output: {
      filename: '[name].bundle.[contenthash].js',
      chunkFilename: '[name].bundle.[contenthash].js',
      path: path.resolve(__dirname, 'dist')
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vender: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    }
  ```

  这样会打出三个chunk文件：

  ```
  ...
                             Asset       Size  Chunks                    Chunk Names
    vendor.a7561fb0e9a071baadb9.js     541 kB       0  [emitted]  [big]  vendor
      main.b746e3eb72875af2caa9.js    1.22 kB       1  [emitted]         main
  manifest.1400d5af64fc1b7b3a45.js    5.85 kB       2  [emitted]         manifest
                        index.html  352 bytes          [emitted]
  ...
  ```

  但是*这还不够*：如果这时候我们增加或删除一个module，这三个chunk的内容都可能发生变化；原因是**默认情况下module的id是按照引用顺序从0递增**，所以增加或删除module会导致其他module的id发生变化。要避免这种情况，就要让module的id只和自己有关，这个时候就要用到[HashedModuleIdsPlugin](https://webpack.js.org/plugins/hashed-module-ids-plugin)，它使得module的id和自己内容的hash绑定，只要内容不变，id就不变：

  ```javascript
  plugins: [
  	new webpack.HashedModuleIdsPlugin()
  ]
  ```

- 待续...