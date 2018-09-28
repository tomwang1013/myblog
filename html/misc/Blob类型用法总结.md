# Blob类型用法总结

Blob一般指的是二进制块`Binary Large Object`的简称，用来存储大块不透明的任何数据，如图片、视频、字符串等等。`Blob`作为一种js类型，只有下面很少的属性和方法：

- 属性

  `size`：blob的字节大小

  `type`：blob的[MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types)

- 方法

  `slice`：截取blob的一段返回一个新的blob，算是blob的一种创建方法

## Blob的构建

### 直接构建

- Blob构造函数：`var aBlob = new Blob( array[, options]);`

  ```javascript
  let aBlob = new Blob(['my name', new Uint8Array([1, 2, 3])], { type: 'text/plain' })
  aBlob.size // 10
  aBlob.type // 'text/plain'
  ```

- 通过BlobBuilder来构建(==已废弃，优先选择Blob构造函数==)

### 间接构建

- 从文件中读取：`<input type="file">`

  用户选择文件之后`input.files`就是一个`FileList`，里面的元素是`File`，`File`是`Blob`的子类型，具有其他一些额外的属性，如name，lastModifiedDate等：

  ```html
  <script>
      // Log information about a list of selected files
      function fileinfo(files) {
          for(var i = 0; i < files.length; i++) { // files is an array-like object
              var f = files[i];
              console.log(f.name, // Name only: no path
              f.size, f.type, // size and type are Blob properties
              f.lastModifiedDate); // another File property
          }
      }
  </script>
  
  <!-- Allow selection of multiple image files and pass them to fileinfo()-->
  <input type="file" accept="image/*" multiple onchange="fileinfo(this.files)"/>
  ```

- 从XHR下载

  可以通过ajax从服务器请求blob类型数据：

  ```javascript
  // GET the contents of the url as a Blob and pass it to the specified callback.
  // This code is untested: no browsers supported this API when it was written.
  function getBlob(url, callback) {
      var xhr = new XMLHttpRequest(); // Create new XHR object
      xhr.open("GET", url); // Specify URL to fetch
      xhr.responseType = "blob" // We'd like a Blob, please
      xhr.onload = function() { // onload is easier than onreadystatechange
      	callback(xhr.response); // Pass the blob to our callback
      } // Note .response, not .responseText
      xhr.send(null); // Send the request now
  }
  ```

## Blob的使用

得到一个blob后，该如何使用它呢？

### 直接发送给服务器端

```javascript
var xhr = new XMLHttpRequest();
xhr.open('POST', '/server', true);
xhr.onload = function(e) { };
xhr.send(blob);
```

### 转化为URL来使用

blob这个对象不能直接使用，可以转为为一个url，格式为：`blob:xxx`，使用这个url来引用这个blob。这个格式和`data:xxx`有点像，但是blob url没有包含任何编码信息，仅仅是作为一个唯一的key来引用这个blob；而data url则是编码后的数据本身。我们使用`URL.createObjectURL`来做转化，转化后的url可以用在一般的url可以使用的地方，如`img.src`：

```javascript
var img = document.createElement("img"); // Create an <img> element
img.src = URL.createObjectURL(file); // Use Blob URL with <img>
img.onload = function() { // When it loads
    this.width = 100; // adjust its size and
    document.body.appendChild(this); // insert into document.
    URL.revokeBlobURL(this.src); // But don't leak memory!
}
```

### 使用FileReader读取blob的真实内容

上面提到的url只是一个blob的引用，并不是真实的内容，我们可以使用`FileReader`通过下面几个方法读取blob的真实内容：

- `readAsArrayBuffer`：将blob读取为ArrayBuffer
- `readAsDataURL`：将blob读取为data url(注意：不是blob url)
- `readAsText`：将blob读取为字符串

下面是一个读取图片预览的例子，通过`readAsDataURL`将图片转化为base64编码：

```javascript
function previewFile() {
  var preview = document.querySelector('img');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    preview.src = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}
```



