## javascript优化之code splitting

`tree shaking`指的是去掉没用到的代码，减小js文件体积从而提高加载速度；而`code splitting`指的是如何将js代码分解成不同的js文件，使得页面在打开时只加载必要的js文件，从而提高页面加载速度。

大概有以下三种分解方式：

### Vendor splitting

将第三方代码(vendor code)和应用程序的代码分开来，使用不用的缓存策略，使得它们互不影响。我们**始终**都应该这么做

### Entry point splitting

对于多页面应用，应该按页面打包js，并将各个页面的公共js提取出来作为单独的js文件进行加载

### Dynamic splitting

使用动态js加载语法，在页面首次打开后，在后面的操作过程中按需加载js，比如根据用户状态或模块切换动态加载相关js，提高页面首屏渲染速度