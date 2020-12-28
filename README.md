# ajaxHook
Hook AJAX(XMLHttpRequest) functions, and modify or log all ajax requests.
[中文说明](README_cn.md)

# Description:
* Replace the original XMLHttpRequest object to hook all xhr functions, so you can modify all ajax requests of your app;
* Zero dependency;
* Simple and small, only 60+ lines;
* Friendly hook api, just like the orginal functions;
* No ES5/ES6 needed, so it has wide compatibility;
* Can be used with any js lib(jquery, react, vue...),or any minigame enviroment(Wechat minigame/miniprogram,Facebook Instant Games...);
* Only for js client environment, which 'XMLHttpRequest' is available, not for node.js;
* Support all official API: https://developer.mozilla.org/docs/Web/API/XMLHttpRequest ;
* Author: Keel(https://github.com/keel) ;

## Install
```
<script src="yourJsPath/ajaxhook.min.js"></script>
```

or:

```
npm install hook-ajax
```

## Useage
### hook xhr functions and events:
```
__ajax_hook({
  //Hook functions(like "open"): rxhr is the real orginal XMLHttpRequest, other paras are the original function's paras;
  'open': function(rxhr, method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    console.log('====> this:', this.isHook); // "this" is the new xhr which replaced the orginal XMLHttpRequest;
    return rxhr.open(method, url, async, user, password);
  },

  //Hook events(like "onXXX"): xhr is the replaced xhr object, other paras are the original event's paras;
  'onload': function(xhr, event) {
    console.log('====> _hook[onload]');
    console.log('====> this:', this.isHook); // "this" is the new xhr which replaced the orginal XMLHttpRequest;
    xhr.responseText += '===hooked===';
    return xhr.onload(event);
  },
});
```

### unkook:
```
__ajax_unhook();
```


## Sample

```
__ajax_hook({
  'open': function(rxhr, method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    // change the specific url to another url:
    if(method === 'GET' && url === 'https://www.google.com'){
      url = 'https://www.apple.com';
    }
    //"this" is the new XHR which replaced the orginal XMLHttpRequest;
    this.newUrl = 'google'; //add a changed tag;
    //continue open function or not, "rxhr" is the original XMLHttpRequest(when hook functions);
    return rxhr.open(method, url, async, user, password);
  },
  'setRequestHeader': function(rxhr, key, val) {
    console.log('====> _hook[setRequestHeader]:', key, val);
    if(this.newUrl === 'google' && key === 'someHeader'){
      // ignore some header's set, just don't call the rxhr.setRequestHeader;
      return;
    }
    return rxhr.setRequestHeader(key, val);
  },
  'onload': function(xhr, event) {
    console.log('====> _hook[onload]');
    if(xhr.newUrl === 'google'){ // xhr is the new XHR(when hook events), same as "this";
      // change the responseText:
      xhr.responseText += '===hooked===';
    }
    return xhr.onload(event);
  },
  'send': function(rxhr, data) {
    console.log('====> _hook[send]',this.newProps);
    if(this.newUrl === 'google'){
      // change the post data:
      data += '&hooked=true';
    }
    return rxhr.send(data);
  },
});
```


