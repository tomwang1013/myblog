---
title: CSRF和XSS扫盲
date: 2018-09-02 12:49:24
categories:
- programming
tags: 
- 安全
---
关于CSRF和XSS的文章非常多，相信很多人也看过了，笔者也看了一些，但总是记不住，这个做个非常简单的总结，让大家有个直观的印象

## CSRF

全称：Cross-Site Request Forgery，以用户的名义发起一个恶意请求，简单过程如下：

1. 用户登录正常网站A
2. 用户同时不小心打开黑客的网站B
3. 网站B自动或由用户触发发起一个恶意的指向A服务器的请求
4. A服务器处理这个恶意请求，坏事发生

这里有幅网上找的图可以看出这个过程：

![img](../images/csrf.png)

### 如何避免？

避免的关键是如何区分甄别出恶意请求：目前比较好的一种做法是为每个请求带上一个随机的token，这个token是服务器端和浏览器端通过某种方式约定好的，服务器端通过检查这个token来验证请求的合法性，这个很多后端框架都做了支持。

## XSS

全称：Cross-site Scripting，想方设法在用户浏览的网页上植入恶意脚本，既然是脚本，就可以做任何事：获取隐私(cookie等)、打开其他网站、修改页面内容等等

怎么植入恶意脚本呢？举两个例子：

1. 下面是一段JSP脚本，将来自当前页面url中的一个参数展示在页面上：

   ```jsp
   <% String eid = request.getParameter("eid"); %> 
   Employee ID: <%= eid %>
   ```

   攻击者可以先准备一个url，在eid参数中存入恶意脚本：

   ```
   http://webpage.com/?eid=<script>alert(1)</script>
   ```

   然后引诱用户点击这个url，引诱的方式很多，如email，SNS等。用户一点击，脚本执行

2. 又是一段JSP脚本，在数据库中查找一个名称，然后展示出来：

   ```jsp
   <%
    Statement stmt = conn.createStatement();
   	ResultSet rs = stmt.executeQuery("select * from emp where id=" + id);
   	if (rs != null) {
       	rs.next(); 
      	String name = rs.getString("name");
    }
   %>
   
   Employee Name: <%= name %>
   ```

   如果这个名称是用户输入的，且正常情况下其他用户可以通过浏览网页看到这个信息，那么攻击者可以输入一段恶意脚本作为名称，这个名称被存入数据库中，所有用户都可能看到，所以很多用户都会受到攻击

由此可以看到，XSS一般是外部输入直接展示在页面上导致的，所以解决的办法就是对外部输入进行严格的验证，必要时对输入内容进行转码，如：

```
<script>alert(1)</script> => &lt;script&gt;alert(1)&lt;/script&gt; // html entity encode
```