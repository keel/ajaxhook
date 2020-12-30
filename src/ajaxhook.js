/* eslint-disable object-shorthand,prefer-const,no-var */
/*
Hook AJAX(XMLHttpRequest) functions, and do what you like.

* Replace the original XMLHttpRequest object to hook all xhr functions, so you can modify all ajax requests of your app;
* Support modifing the read only xhr props, like responseText;
* Support all official API: https://developer.mozilla.org/docs/Web/API/XMLHttpRequest ;
* Zero dependency;
* Simple and small, source code only 70+ lines, mini file only 1K(not gzip);
* Friendly hook api, just like the orginal functions;
* No ES5/ES6 needed, so it has wide compatibility;
* Can be used with any js lib(jquery, react, vue...),or any minigame enviroment(Wechat minigame/miniprogram,Facebook Instant Games...);
* Only for js client environment, which 'XMLHttpRequest' is available, not for node.js;
* Author: [Keel](https://github.com/keel) ;
 */
function __ajax_hook(hookConfig) {
  window['__xhr_org'] = window['__xhr_org'] || XMLHttpRequest;
  XMLHttpRequest = function() {
    var xhr = new window['__xhr_org']();
    this.xhr = xhr;
    this.hookConfig = hookConfig;
    var me = this;
    me.isHook = 1; /* add a hooked tag */
    me.DONE = 4;
    me.LOADING = 3;
    me.HEADERS_RECEIVED = 2;
    me.OPENED = 1;
    me.UNSENT = 0;
    var i = 0;
    var len = 0;
    var props = ['readyState', 'response', 'responseType', 'responseText', 'responseURL', 'responseXML', 'status', 'statusText', 'timeout', 'upload', 'withCredentials'];
    me.newPropMap = {};
    me.syncProps = function() {
      for (i = 0, len = props.length; i < len; i++) {
        var p = props[i];
        if (!me.newPropMap[p]) {
          if (p === 'responseText' && me.xhr.responseType !== 'text' && me.xhr.responseType !== '') {
            continue;
          } else if (p === 'responseXML' && me.xhr.responseType !== 'document' && me.xhr.responseType !== '') {
            continue;
          }
          me[p] = me.xhr[p];
        }
      }
    };
    me.updateProps = function() {
      if (me.xhr.readyState < 2) {
        me.xhr.responseType = me['responseType'] || me.xhr.responseType;
        me.xhr.timeout = me['timeout'] || me.xhr.timeout;
        me.xhr.withCredentials = me['withCredentials'] || me.xhr.withCredentials;
      }
    };
    me.regEvent = function(evName) {
      evName = 'on' + evName;
      me.xhr[evName] = function(event) {
        me.syncProps();
        if (me.hookConfig && me.hookConfig[evName]) {
          return me.hookConfig[evName].apply(me, [event]);
        }
        if (me[evName]) {
          me[evName](event);
        }
      };
    };
    me.regFun = function(fnName) {
      me[fnName] = function() {
        me.updateProps(); /* update the props which are not read-only before the function called. */
        var args = [].slice.call(arguments);
        if (me.hookConfig && me.hookConfig[fnName]) {
          return me.hookConfig[fnName].apply(me, args);
        }
        return me.xhr[fnName].apply(me.xhr, args);
      };
    };
    me.doReg = function(regFnName, regArr) {
      for (i = 0, len = regArr.length; i < len; i++) {
        me[regFnName](regArr[i]);
      }
    };
    me.updateXhr = function(key, val) { /* use updateXhr to update XHR props */
      me[key] = val;
      me.newPropMap[key] = 1;
    };
    var funs = ['abort', 'send', 'getResponseHeader', 'getAllResponseHeaders', 'overrideMimeType', 'setRequestHeader', 'open'];
    var events = ['readystatechange', 'loadstart', 'load', 'loadend', 'progress', 'error', 'abort', 'timeout'];
    me.doReg('regFun', funs);
    me.doReg('regEvent', events);
  };
}

function __ajax_unhook() {
  XMLHttpRequest = window['__xhr_org'] || XMLHttpRequest;
  window['__xhr_org'] = null;
}