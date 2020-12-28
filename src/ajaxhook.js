/*
Hook AJAX(XMLHttpRequest) functions, and do what you like.

* Zero dependency;
* Simple and small, only 60+ lines;
* No ES5/ES6 needed, so it has wide compatibility;
* Can be used with any js lib(jquery, react, vue...),or any minigame enviroment(Wechat minigame/miniprogram,Facebook Instant Games...);
* Only for js client environment, which 'XMLHttpRequest' is available, not for node.js;
* Support all official API: https://developer.mozilla.org/docs/Web/API/XMLHttpRequest;
* Author: Keel(https://github.com/keel);
 */
function __ajax_hook(hookConfig) {
  var __orgXhr = '__xhr_org';
  window[__orgXhr] = window[__orgXhr] || XMLHttpRequest;
  XMLHttpRequest = function() {
    var xhr = new window[__orgXhr]();
    this.xhr = xhr;
    this.hookConfig = hookConfig;
    var me = this;
    me.isHook = 1; //hooked xhr's tag
    me.DONE = 4;
    me.HEADERS_RECEIVED = 2;
    me.LOADING = 3;
    me.OPENED = 1;
    me.UNSENT = 0;
    var i = 0;
    var len = 0;
    var props = ['readyState', 'response', 'responseText', 'responseType', 'responseURL', 'responseXML', 'status', 'statusText', 'timeout', 'upload', 'withCredentials'];
    me.syncProps = function() {
      for (i = 0, len = props.length; i < len; i++) {
        var p = props[i];
        me[p] = me.xhr[p];
      }
    };
    me.updateProps = function() {
      me.xhr.responseType = me['responseType'] || me.xhr.responseType;
      me.xhr.timeout = me['timeout'] || me.xhr.timeout;
      me.xhr.withCredentials = me['withCredentials'] || me.xhr.withCredentials;
    };
    me.regEvent = function(evName) {
      evName = 'on' + evName;
      me.xhr[evName] = function(event) {
        if (me[evName]) {
          me.syncProps();
          if (me.hookConfig && me.hookConfig[evName]){
            return me.hookConfig[evName].apply(me, [me, event]);
          }
          me[evName](event);
        }
      };
    };
    me.regFun = function(fnName) {
      me[fnName] = function() {
        me.updateProps();
        var args = [].slice.call(arguments);
        if (me.hookConfig && me.hookConfig[fnName]) {
          args.unshift(me.xhr);
          return me.hookConfig[fnName].apply(me, args);
        }
        // console.log('====> __ajax_hook[' + fnName + '],args:', args);
        return me.xhr[fnName].apply(me.xhr, args);
      };
    };
    me.doReg = function(regFnName, regArr) {
      for (i = 0, len = regArr.length; i < len; i++) {
        me[regFnName](regArr[i]);
      }
    };
    var funs = ['abort', 'send', 'getResponseHeader', 'getAllResponseHeaders', 'overrideMimeType', 'setRequestHeader', 'open'];
    var events = ['readystatechange', 'loadstart', 'load', 'loadend', 'progress', 'error', 'abort', 'timeout'];
    me.doReg('regFun', funs);
    me.doReg('regEvent', events);
  };
}

function __ajax_unhook() {
  XMLHttpRequest = window['__xhr_org'];
}

// Usage:
//
// __ajax_hook({
//   //hook function(like "open"): rxhr is the real orginal XMLHttpRequest, other paras is the original function's paras;
//   'open': function(rxhr, method, url, async, user, password) {
//     console.log('====> _hook[open]:', method, url, async, user, password);
//     console.log('====> this:', this.isHook); // "this" is the new xhr which replaced the orginal XMLHttpRequest;
//     return rxhr.open(method, url, async, user, password);
//   },
//   //hook event(like "onXXX"): xhr is the replaced xhr object, other paras is the original event's paras;
//   'onload': function(xhr, event) {
//     console.log('====> _hook[onload]');
//     console.log('====> this:', this.isHook); // "this" is the new xhr which replaced the orginal XMLHttpRequest;
//     xhr.responseText += '===hooked===';
//     return xhr.onload(event);
//   },
// });


// __ajax_hook({
//   'open': function(rxhr, method, url, async, user, password) {
//     console.log('====> _hook[open]:', method, url, async, user, password);
//     // "this" is the new xhr which replaced the orginal XMLHttpRequest;
//     // use "this.newProps" to save open's paras;
//     if (!this.newProps) {
//       this.newProps = {
//         'headers': {}
//       };
//     }
//     this.newProps.method = method;
//     this.newProps.url = url;
//     this.newProps.async = async;
//     this.newProps.user = user;
//     this.newProps.password = password;
//     //continue open function or not
//     return rxhr.open(method, url, async, user, password);
//   },
//   'setRequestHeader': function(rxhr, key, val) {
//     console.log('====> _hook[setRequestHeader]:', key, val);
//     this.newProps.headers[key] = val;
//     return rxhr.setRequestHeader(key, val);
//   },
//   'send': function(rxhr, data) {
//     console.log('====> _hook[send]',this.newProps);
//     if(this.newProps.url === 'https://www.google.com'){
//       // change the specific url to another url:
//       rxhr.open(this.newProps.method,'https://www.apple.com',true);
//     }
//     for(var i in this.newProps.headers){
//       rxhr.setRequestHeader(i,this.newProps.headers[i]);
//     }
//     return rxhr.send(data);
//   },
// });