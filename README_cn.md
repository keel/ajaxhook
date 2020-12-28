# ajaxHook
Hook AJAX(XMLHttpRequest) 所有方法,在不影响原应用基础上进行全局的AJAX修改,或打日志进行分析.

# 描述:
* 通过替换原XMLHttpRequest对象来hook所有的XMLHttpRequest方法;
* 零依赖;
* 源码简单体积小, 只有 60+ 行;
* 友好的hook api,仅在原方法上添加第1个参数;
* 无ES5/ES6需求, 保持最大的适配性;
* 可以与其他的js库并存(jquery, react, vue...),或其他小程序,小游戏环境(微信小程序,小游戏,OPPO,VIVO,华为,字节等小程序或小游戏环境);
* 注意只兼容'XMLHttpRequest'有效的环境, 不支持node.js;
* 支持所有官方API: https://developer.mozilla.org/docs/Web/API/XMLHttpRequest ;
* Author: Keel(https://github.com/keel) ;

## 安装
```
<script src="yourJsPath/ajaxhook.min.js"></script>
```


## 使用方法
### hook xhr 方法和事件:
```
__ajax_hook({
  //Hook 方法(如: "open"): 在原方法参数前加上rxhr, 这个是真正的原XMLHttpRequest对象;
  'open': function(rxhr, method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    console.log('====> this:', this.isHook); // "this"是替换后的新的XMLHttpRequest对象;
    return rxhr.open(method, url, async, user, password);
  },

  //Hook 事件(如: "onXXX"): xhr是替换后的新的XMLHttpRequest对象;
  'onload': function(xhr, event) {
    console.log('====> _hook[onload]');
    console.log('====> this:', this.isHook); // "this"是替换后的新的XMLHttpRequest对象;
    xhr.responseText += '===hooked===';
    return xhr.onload(event);
  },
});
```

### 解除hook:
```
__ajax_unhook();
```


## 样例

```
__ajax_hook({
  'open': function(rxhr, method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    // 替换url地址:
    if(method === 'GET' && url === 'https://www.google.com'){
      url = 'https://www.apple.com';
    }
    //"this"是替换后的新的XMLHttpRequest对象;
    this.newUrl = 'google'; //add a changed tag;
    //继续执行原方法, "rxhr" 是原XMLHttpRequest(hook方法时);
    return rxhr.open(method, url, async, user, password);
  },
  'setRequestHeader': function(rxhr, key, val) {
    console.log('====> _hook[setRequestHeader]:', key, val);
    if(this.newUrl === 'google' && key === 'someHeader'){
      // 忽略特定的header设置, 直接返回, 不再调用rxhr.setRequestHeader;
      return;
    }
    return rxhr.setRequestHeader(key, val);
  },
  //hook onload事件
  'onload': function(xhr, event) {
    console.log('====> _hook[onload]');
    if(xhr.newUrl === 'google'){ // xhr是替换后的新的XMLHttpRequest对象(hook事件时), 与"this"相同;
      // 修改responseText:
      xhr.responseText += '===hooked===';
    }
    return xhr.onload(event);
  },
  'send': function(rxhr, data) {
    console.log('====> _hook[send]',this.newProps);
    if(this.newUrl === 'google'){
      // 修改post data:
      data += '&hooked=true';
    }
    return rxhr.send(data);
  },
});
```


