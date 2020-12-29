# ajaxHook
Hook AJAX(XMLHttpRequest) functions, and modify or log all ajax requests.

[中文说明](README_cn.md)

# Description:
* Replace the original XMLHttpRequest object to hook all xhr functions, so you can modify all ajax requests of your app;
* Support modifing the read only xhr props, like responseText;
* Support all official API: https://developer.mozilla.org/docs/Web/API/XMLHttpRequest ;
* Zero dependency;
* Simple and small, only 70+ lines;
* Friendly hook api, just like the orginal functions;
* No ES5/ES6 needed, so it has wide compatibility;
* Can be used with any js lib(jquery, react, vue...),or any minigame enviroment(Wechat minigame/miniprogram,Facebook Instant Games...);
* Only for js client environment, which 'XMLHttpRequest' is available, not for node.js;
* Author: [Keel](https://github.com/keel) ;

## Install
```
//please load ajaxhook first
<script src="yourJsPath/ajaxhook.min.js"></script>
```

or:

```
npm install hook-ajax
```

## Useage
### hook XHR functions and events:
```
__ajax_hook({
  //Hook functions(like "open"):
  'open': function(method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    //"this" is the new XHR which replaced the orginal XMLHttpRequest;
    //"this.xhr" is the original XMLHttpRequest object, use it to call real XHR functions;

    // continue open function or change something, here use "this.xhr" to continue function;
    return this.xhr.open(method, url, async, user, password);
  },

  //Hook events(like "onXXX"):
  'onreadystatechange': function(event) {
    console.log('====> _hook[onreadystatechange]', this.xhr.readyState);
    //"this" is the new XHR which replaced the orginal XMLHttpRequest;
    //"this.xhr" is the original XMLHttpRequest object, use it to call real XHR functions;

    //when readyState is 4 and status is 200, change the responseText.
    if (this.xhr.readyState === 4 && this.xhr.status == 200) {
      //use "this.updateXhr" to modify XHR props, event the real XMLHttpRequest.responseText is "read only";
      this.updateXhr('responseText', '/* ===hooked=== */' + this.xhr.responseText); //keep the changed value is rignt data-type, or there's a "parsererror" will be throw.
    }

    // call the original event(other js set to XHR) if it existed, to make the original call continue, or stop call it if you like;
    if (this.onreadystatechange) {
      this.onreadystatechange(event);
    }
  },
});
```

### unkook:
```
__ajax_unhook();
```


## Sample
There's a "sample" directory for test;

```
__ajax_hook({
  'open': function(method, url, async, user, password) {
    console.log('====> _hook[open]:', method, url, async, user, password);
    // change the specific url to another url, to avoid domain cross, try to modify jquery 1.10.2 change to 3.2.1:
    if (method === 'GET' && url === 'https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js') {
      url = 'https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js';
      //"this" is the new XHR which replaced the orginal XMLHttpRequest;
      this.hookTag = 'getTest'; //add a changed tag if needed;
    }
    // continue open function or not
    return this.xhr.open(method, url, async, user, password);
  },
  'send': function(data) {
    console.log('====> _hook[send]', this.hookTag, data);
    if (this.hookTag === 'postTest') {
      // change post data if this is a POST request
      data += '&hooked=true';
    }
    return this.xhr.send(data);
  },
  'onreadystatechange': function(event) {
    console.log('====> _hook[onreadystatechange]', this.xhr.readyState);
    //when readyState is 4, change the responseText.
    if (this.xhr.readyState === 4 && this.xhr.status == 200) {
      //use "this.updateXhr" to update xhr props, event the real XMLHttpRequest.responseText is "read only";
      this.updateXhr('responseText', '/* ===hooked=== */' + this.xhr.responseText); //keep the changed value is rignt data-type, or there's a "parsererror" will be throw.
    }

    // call the original event(other js set to xhr) if it existed, or stop call it if you like
    if (this.onreadystatechange) {
      this.onreadystatechange(event);
    }
  },
});


//original app ajax functions
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


