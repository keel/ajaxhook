# ajaxHook
Hook AJAX(XMLHttpRequest) 所有方法,在不影响原应用基础上进行全局的AJAX修改,或打日志进行分析.

# 描述:
* 通过替换原 XMLHttpRequest 对象来hook所有的XMLHttpRequest方法, 本项目参考XMLHttpRequest的API实现, 不直接复制XMLHttpRequest所有属性和方法;
* 支持修改 XMLHttpRequest 只读属性,如responseText;
* 支持 XMLHttpRequest 所有官方API: https://developer.mozilla.org/docs/Web/API/XMLHttpRequest ;
* 零依赖;
* 源码简单体积小, 源码只有 70+ 行, mini后只有1K(未进行gzip);
* 友好的hook api, 保持简单性和可控性;
* 无ES5/ES6需求, 保持最大的适配性; 这里没有使用ES5的setter, getter, 完全使用XMLHttpRequest的原生API定义;
* 可以与其他的js库并存(jquery, react, vue...),或其他小程序,小游戏环境(微信,OPPO,VIVO,华为,字节,小米等小程序或小游戏环境);
* 注意只兼容'XMLHttpRequest'有效的环境, 不支持node.js;
* Author: [Keel](https://github.com/keel) ;

个人不太喜欢 [ajax-hook](https://github.com/wendux/Ajax-hook)的 API(API有点小复杂), 而且需要用到 ES5 的getter和setter, 所以造了这个轮子, 思路略有不同, API更有HOOK风格.


## 安装
```
//建议最先加载
<script src="yourJsPath/ajaxhook.min.js"></script>
```

或:

```
npm install hook-ajax
```

## 使用方法
### hook XHR 方法和事件:
```
__ajax_hook({
  //Hook 方法(如: "open"):
  'open': function(method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    //"this" 是替换后的新的XMLHttpRequest对象;
    //"this.xhr" 是真正的原XMLHttpRequest对象;

    // 继续调用 open 方法或者对相关参数进行修改, 注意这里使用 "this.xhr" 保持原方法继续执行;
    return this.xhr.open(method, url, async, user, password);
  },

  //Hook 事件(如: "onXXX"): 因为onreadystatechange在onload和onloadend之前, 所以这里hook onreadystatechange来修改responseText,不再需要hook "onload"方法
  'onreadystatechange': function(event) {
    console.log('====> _hook[onreadystatechange]', this.xhr.readyState);
    //"this" 是替换后的新的XMLHttpRequest对象;
    //"this.xhr" 是真正的原XMLHttpRequest对象;

    //当 readyState 为 4 且 status 为 200 时, 修改 responseText.
    if (this.xhr.readyState === 4 && this.xhr.status == 200) {
      //使用 "this.updateXhr" 方法修改 XHR 属性值, 这里支持修改原XMLHttpRequest的只读属性: responseText;
      this.updateXhr('responseText', '/* ===hooked=== */' + this.xhr.responseText); //注意保持修改后的内容仍然适合 data-type, 否则可能抛出 "parsererror" 错误.
    }

    // 如果有原监听事件(其他js代码设置到XHR的监听事件), 则继续执行原监听事件, 或者这里也可以停止继续执行
    if (this.onreadystatechange) {
      this.onreadystatechange(event);
    }
  },
});
```

### 解除hook:
```
__ajax_unhook();
```


## 样例
具体可查看sample目录.
```
__ajax_hook({
  'open': function(method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    // 将原url改为新url, 这里举例将jquery1.10.2修改为3.2.1, 为避免跨域问题, 使用了支持跨域的cdn地址:
    if (method === 'GET' && url === 'https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js') {
      url = 'https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js';
      //"this" 是替换后的新的XMLHttpRequest对象;
      this.hookTag = 'getTest'; //add a changed tag if needed;
    }
    // "this.xhr" 是真正的原XMLHttpRequest对象;
    // 修改后继续执行原方法, 这里的url已经是新的了
    return this.xhr.open(method, url, async, user, password);
  },
  'send': function(data) {
    console.log('====> _hook[send]', this.hookTag, data);
    if (this.hookTag === 'postTest') {
      // 如果是post请求,可在这里修改post数据,这里需要open的hook方法内有逻辑支持
      data += '&hooked=true';
    }
    return this.xhr.send(data);
  },
  'onreadystatechange': function(event) {
    console.log('====> _hook[onreadystatechange]', this.xhr.readyState);
    //当 readyState 为 4 且 status 为 200 时, 修改 responseText.
    if (this.xhr.readyState === 4 && this.xhr.status == 200) {
      //使用 "this.updateXhr" 更新XHR的属性, 即使是只读属性也可以;
      this.updateXhr('responseText', '/* ===hooked=== */' + this.xhr.responseText); //注意保持修改后的内容仍然适合 data-type, 否则可能抛出 "parsererror" 错误.
    }

    // 如果有原监听事件(其他js代码设置到XHR的监听事件), 则继续执行原监听事件, 或者这里也可以停止继续执行
    if (this.onreadystatechange) {
      this.onreadystatechange(event);
    }
  },
});


//原来的js代码
$('#testBt').click(function() {
  $('#reTxt').val('loading...');
  $.get('https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js', function(result) {
    console.log('Get done.');
    $('#reTxt').val(result);
  }).fail(function(e) {
    console.error('Fail!!!');
    console.error(e);
  });
});
```


