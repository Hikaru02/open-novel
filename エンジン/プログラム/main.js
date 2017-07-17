System.registerModule("ES6/ヘルパー.js", [], function() {
  "use strict";
  var __moduleName = "ES6/ヘルパー.js";
  ;
  ((function(_) {
    'use strict';
    var global = (1, eval)('this');
    var Promise = global.Promise;
    var LOG = console.log.bind(console);
    var Data = {
      debug: true,
      current: {}
    };
    var Util = {
      setDefaults: function() {
        var obj = arguments[0] !== (void 0) ? arguments[0] : {};
        var props = arguments[1];
        if (arguments.length !== 2)
          throw 'illegal arguments length';
        Object.keys(props).forEach((function(key) {
          if (!(key in obj))
            obj[key] = props[key];
        }));
        return obj;
      },
      setProperties: function() {
        var obj = arguments[0] !== (void 0) ? arguments[0] : {};
        var props = arguments[1];
        Object.keys(props).forEach((function(key) {
          return obj[key] = props[key];
        }));
        return obj;
      },
      isNoneType: function(str) {
        return (typeof str === 'string') && (str == '' || /^(無し|なし)$/.test(str));
      },
      forceName: function(kind, name, type) {
        if (!name || !type)
          throw 'name特定不能エラー';
        if (!name.match(/\.[^\.]+$/))
          name = (name + "." + type);
        return (kind + "/" + name);
      },
      toHalfWidth: function() {
        var str = arguments[0] !== (void 0) ? arguments[0] : '';
        var table = {
          '。': '.',
          '―': '-',
          '！': '!',
          '≧': '>=',
          '≦': '<=',
          '≠': '!=',
          '×': '*',
          '✕': '*',
          '✖': '*',
          '☓': '*',
          '＊': '*',
          '％': '%',
          '／': '/',
          '｜': '|',
          '”': '"',
          '’': "'"
        };
        return str.replace(/./g, (function(char) {
          return (char in table ? table[char] : char);
        })).replace(/[\uff0b-\uff5a]/g, (function(char) {
          return String.fromCharCode(char.charCodeAt(0) - 65248);
        }));
      },
      toSize: function(str) {
        if (!str)
          return null;
        str = Util.toHalfWidth(str);
        var n = +(str.match(/[\d.]+/) || [0])[0];
        return ((!(/[\d.]+%/.test(str)) && n < 10) ? n * 100 : n) + '%';
      },
      NOP: function() {},
      error: function(message) {
        alert(message);
      },
      Default: undefined,
      co: function(gen) {
        return function() {
          for (var args = [],
              $__2 = 0; $__2 < arguments.length; $__2++)
            args[$__2] = arguments[$__2];
          var $__0 = this;
          return new Promise((function(ok, ng) {
            var iter = gen.apply($__0, args);
            var chain = (function(v) {
              var $__3 = iter.next(v),
                  value = $__3.value,
                  done = $__3.done;
              Promise.resolve(value).then(done ? ok : chain).catch((function(err) {
                LOG('co', err);
                ng(err);
              }));
            });
            chain();
          }));
        };
      },
      updateDebugWindow: function() {
        if (!Data.debug)
          return;
        var params = {};
        Util.paramForEach((function(value, key) {
          params[key] = value;
        }), false);
        Util.paramForEach((function(value, key) {
          params[key] = value;
        }), true);
        var cacheSizeMB = ((Util.cacheGet('$size') || 0) / 1024 / 1024).toFixed(1);
        var mark = Data.current.mark || '（無し）';
        var obj = {
          キャッシュサイズ: cacheSizeMB + 'MB',
          現在のマーク: mark,
          パラメータ: params
        };
        View.updateDebugWindow(obj);
      },
      toBlobEmogiURL: function(name) {
        return Util.toBlobURL('絵文字', name, 'svg');
      },
      toBlobSysPartsURL: function(name) {
        return Util.toBlobURL('画像', name, 'svg', true);
      },
      toBlobScriptURL: function(name) {
        return Util.toBlobURL('シナリオ', name, 'txt');
      },
      toBlobURL: function(kind, name, type) {
        var sys = arguments[3] !== (void 0) ? arguments[3] : false;
        var root = sys ? 'エンジン' : '作品';
        var sub = Util.forceName(kind, name, type);
        var subkey = sys ? ("" + sub) : (Data.scenarioName + "/" + sub);
        if (Util.isNoneType(name))
          return Promise.resolve(null);
        if (Util.cacheHas(subkey))
          return Promise.resolve(Util.cacheGet(subkey));
        var defer = Promise.defer();
        Util.cacheSet(subkey, defer.promise);
        var hide = View.setLoadingMessage('Loading...');
        return new Promise((function(ok, ng) {
          Util.find((root + "/" + subkey)).catch((function(_) {
            return (root + "/[[共通素材]]/" + sub);
          })).then((function(url) {
            return ok(url);
          }), ng);
        })).then(Util.loadBlob).then((function(blob) {
          var blobURL = URL.createObjectURL(blob);
          defer.resolve(blobURL);
          Util.cacheSizeUpdate(blob.size);
          hide();
          return blobURL;
        })).through(hide);
      },
      loadText: function(url) {
        return Util.load(url, 'text');
      },
      loadBlob: function(url) {
        return Util.load(url, 'blob');
      },
      load: function(url, type) {
        return new Promise(function(ok, ng) {
          var xhr = new XMLHttpRequest();
          xhr.onloadend = (function(_) {
            if (xhr.status < 300 && xhr.response)
              ok(xhr.response);
            else
              ng(new Error(("ファイルURL『" + url + "』のロードに失敗")));
          });
          xhr.open('GET', url);
          if (type)
            xhr.responseType = type;
          xhr.send();
        });
      },
      find: function(url) {
        return new Promise(function(ok, ng) {
          var xhr = new XMLHttpRequest();
          xhr.onload = (function(_) {
            if (xhr.status < 300)
              ok(url);
            else
              ng(new Error(("ファイルURL『" + url + "』が見つからない")));
          });
          xhr.onerror = (function(_) {
            return ng(new Error(("ファイルURL『" + url + "』のロードに失敗")));
          });
          xhr.open('HEAD', url);
          xhr.send();
        });
      }
    };
    var BitArray = function BitArray() {};
    ($traceurRuntime.createClass)(BitArray, {}, {
      create: function(len) {
        return new Uint32Array(Math.ceil(len / 32));
      },
      get: function(ba, no) {
        var i = no / 32 | 0,
            n = ba[i],
            p = no % 32;
        return (n & 1 << p) >>> p;
      },
      set: function(ba, no) {
        var i = no / 32 | 0,
            n = ba[i],
            p = no % 32;
        ba[i] = n | 1 << p;
      }
    });
    Util.setProperties(Util, ((function(_) {
      var cacheMap = new Map;
      cacheInit();
      function cacheInit() {
        cacheMap.clear();
        cacheMap.set('$size', 0);
      }
      return {
        cacheClear: function() {
          cacheMap.forEach((function(_, p) {
            if (p.then)
              p.then((function(url) {
                return URL.revokeObjectURL(url);
              }));
          }));
          cacheInit();
          Util.updateDebugWindow();
        },
        cacheHas: function(key) {
          return cacheMap.has(key);
        },
        cacheGet: function(key) {
          return cacheMap.get(key);
        },
        cacheSet: function(key, val) {
          cacheMap.set(key, val);
        },
        cacheSizeUpdate: function(n) {
          cacheMap.set('$size', cacheMap.get('$size') + n);
          Util.updateDebugWindow();
        }
      };
    }))());
    Util.setProperties(Util, ((function(_) {
      var paramMap = new Map;
      var configMap = new Map;
      function normalizeKey(key) {
        key = key.replace(/＄/g, '$');
        return key;
      }
      var my = {
        paramSet: function(key, val) {
          var sFlag = arguments[2] !== (void 0) ? arguments[2] : true;
          key = normalizeKey(key);
          if (key[0] == '$') {
            configMap.set(key, val);
            if (!sFlag)
              return;
            var globalParams = {};
            my.paramForEach((function(value, key) {
              globalParams[key] = value;
            }), true);
            Data.current.setting.params = globalParams;
            Storage.setGlobalData(Data.current.setting).check();
          } else {
            paramMap.set(key, val);
          }
          Util.updateDebugWindow();
        },
        paramGet: function(key) {
          key = normalizeKey(key);
          var map = (key[0] == '$') ? configMap : paramMap;
          if (!map.has(key)) {
            my.paramSet(key, 0);
            Util.updateDebugWindow();
          }
          return map.get(key);
        },
        paramClear: function(gFlag) {
          paramMap.clear();
          if (gFlag)
            configMap.clear();
          Util.updateDebugWindow();
        },
        paramForEach: function(func, gFlag) {
          if (gFlag)
            configMap.forEach(func);
          else
            paramMap.forEach(func);
        }
      };
      return my;
    }))());
    Util.setDefaults(String.prototype, {repeat: function repeat(num) {
        return new Array(num + 1).join(this);
      }});
    Util.setDefaults(Promise, {
      defer: function() {
        var resolve,
            reject;
        var promise = new Promise((function(ok, ng) {
          resolve = ok, reject = ng;
        }));
        return {
          promise: promise,
          resolve: resolve,
          reject: reject
        };
      },
      delay: function(time) {
        return Promise.resolve().delay(time);
      }
    });
    Util.setProperties(Promise.prototype, {
      on: function on(type) {
        var onFulfilled = arguments[1] !== (void 0) ? arguments[1] : (function(result) {
          return result;
        });
        var onRejected = arguments[2];
        return this.then((function(result) {
          return View.on(type).then((function(_) {
            return onFulfilled(result);
          })).catch(onRejected);
        }));
      },
      and: function and(func, arg) {
        return this.then((function(_) {
          return func(arg);
        }));
      },
      delay: function delay(time) {
        if (!+time)
          throw 'illegal time number';
        return this.then((function(_) {
          return new Promise((function(resolve) {
            return setTimeout(resolve, time);
          }));
        }));
      },
      through: function through(onFulfilled, onRejected) {
        return this.then((function(val) {
          if (onFulfilled)
            onFulfilled(val);
          return Promise.resolve(val);
        }), (function(err) {
          if (onRejected)
            onRejected(err);
          return Promise.reject(err);
        }));
      },
      check: function check() {
        return this.catch((function(err) {
          LOG(err);
          return Promise.reject(err);
        }));
      },
      'throw': function(err) {
        return this.then((function(_) {
          return Promise.reject(err);
        }));
      }
    });
    Object.defineProperty(Promise.prototype, '$', {
      enumerable: true,
      configurable: true,
      get: function() {
        var _p = this;
        var $p = function() {
          for (var args = [],
              $__2 = 0; $__2 < arguments.length; $__2++)
            args[$__2] = arguments[$__2];
          var len = args.length;
          if (len === 0)
            return $p;
          var $__3 = args,
              arg0 = $__3[0],
              arg1 = $__3[1],
              arg2 = $__3[2];
          if (typeof arg0 == 'function') {
            switch (args.length) {
              case 1:
              case 2:
                return _p.then(arg0).$;
            }
          } else {
            switch (args.length) {
              case 1:
                return _p.on(arg0).$;
              case 2:
              case 3:
                return _p.next(arg0, arg1, arg2).$;
            }
          }
          throw 'illegal arguments length';
        };
        Util.setProperties($p, {
          then: (function(res, rej) {
            return _p.then(res, rej).$;
          }),
          catch: (function(rej) {
            return _p.catch(rej).$;
          })
        });
        Object.defineProperty($p, '_', {
          enumerable: true,
          configurable: true,
          get: (function(_) {
            return _p;
          })
        });
        $p.__proto__ = _p;
        return $p;
      }
    });
    function $Promise(func) {
      return new Promise(func).$;
    }
    Util.setProperties($Promise, {
      defer: (function(_) {
        var defer = Promise.defer();
        defer.promise = defer.promise.$;
        return defer;
      }),
      resolve: (function(val) {
        return Promise.resolve(val).$;
      }),
      reject: (function(val) {
        return Promise.reject(val).$;
      }),
      all: (function(ary) {
        return Promise.all(ary).$;
      }),
      race: (function(ary) {
        return Promise.race(ary).$;
      })
    });
    Util.overrides = {
      Util: Util,
      $Promise: $Promise,
      Res: Promise.resolve()
    };
    var READY = ((function(_) {
      function READY(type) {
        var types = (arguments.length != 1) ? [].slice.call(arguments) : (Array.isArray(type)) ? type : [type];
        types.push('Util');
        return $Promise.all(types.map((function(type) {
          if (!(type in READY))
            throw 'illegal READY type "' + type + '"';
          return READY[type];
        }))).then((function(_) {
          return Util.overrides;
        }));
      }
      ;
      ['Util', 'DOM', 'Player', 'View', 'Storage', 'Sound', 'Game'].forEach((function(type) {
        global[type] = null;
        var defer = Promise.defer();
        READY[type] = defer.promise;
        READY[type].ready = (function(obj) {
          if (obj)
            global[type] = obj;
          defer.resolve();
        });
      }));
      return READY;
    }))();
    window.addEventListener('DOMContentLoaded', READY.DOM.ready);
    Util.setDefaults(global, {
      global: global,
      READY: READY,
      LOG: LOG,
      Data: Data,
      BitArray: BitArray
    });
    Util.load('エンジン/設定.json', 'json').then((function(obj) {
      var Config = Object.freeze(obj);
      global.Config = Config;
      READY.Util.ready(Util);
    })).check();
  }))();
  return {};
});
System.get("ES6/ヘルパー.js" + '');
System.registerModule("ES6/ストレージ.js", [], function() {
  "use strict";
  var __moduleName = "ES6/ストレージ.js";
  READY().then((function($__0) {
    'use strict';
    var Util = $__0.Util;
    var db,
        scenario,
        VERSION = 7;
    var Storage = {
      add: function(key, val) {
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readwrite');
          var os = ts.objectStore('savedata');
          var rq = os.add(val, key);
          ts.oncomplete = (function(_) {
            return ok();
          });
          ts.onabort = (function(_) {
            return ng(("ストレージのkey『" + key + "』の書込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      put: function(key, val) {
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readwrite');
          var os = ts.objectStore('savedata');
          var rq = os.put(val, key);
          ts.oncomplete = (function(_) {
            return ok();
          });
          ts.onabort = (function(_) {
            return ng(("ストレージのkey『" + key + "』の書込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      get: function(key) {
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readonly');
          var os = ts.objectStore('savedata');
          var rq = os.get(key);
          ts.oncomplete = (function(_) {
            return ok(rq.result);
          });
          ts.onabort = (function(_) {
            return ng(("ストレージのkey『" + key + "』の読込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      delete: function(key) {
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readwrite');
          var os = ts.objectStore('savedata');
          var rq = os.delete(key);
          ts.oncomplete = (function(_) {
            return ok();
          });
          ts.onabort = (function(_) {
            return ng(("ストレージのkey『" + key + "』の削除に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      getSaveDatas: function(from, to) {
        if (typeof from != 'number' || from < 0)
          throw 'ロード用番号が不正';
        if (typeof to != 'number' || to < 0)
          throw 'ロード用番号が不正';
        var name = getSaveName();
        return new Promise((function(ok, ng) {
          var saves = new Array(to + 1);
          var ts = db.transaction('savedata', 'readonly');
          var os = ts.objectStore('savedata');
          for (var no = from; no <= to; ++no) {
            var rq = os.get(name + '/' + no);
            rq.onsuccess = ((function(rq, no) {
              return (function(_) {
                saves[no] = rq.result;
              });
            }))(rq, no);
          }
          ts.oncomplete = (function(_) {
            return ok(saves);
          });
          ts.onabort = (function(_) {
            return ng(("ストレージの読込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      setSaveData: function(no, data) {
        if (typeof no != 'number' || no < 0)
          throw 'セーブ用番号が不正';
        if (!data)
          throw 'セーブ用データが不正';
        var name = getSaveName();
        data.systemVersion = VERSION;
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readwrite');
          var os = ts.objectStore('savedata');
          var rq = os.put(data, name + '/' + no);
          ts.oncomplete = (function(_) {
            return ok();
          });
          ts.onabort = (function(_) {
            return ng(("ストレージの書込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      getGlobalData: function() {
        var name = getSaveName();
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readonly');
          var os = ts.objectStore('savedata');
          var rq = os.get(name + '/global');
          ts.oncomplete = (function(_) {
            return ok(rq.result);
          });
          ts.onabort = (function(_) {
            return ng(("ストレージの読込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      setGlobalData: function(data) {
        if (!data)
          throw 'セーブ用データが不正';
        var name = getSaveName();
        data.systemVersion = VERSION;
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readwrite');
          var os = ts.objectStore('savedata');
          var rq = os.put(data, name + '/global');
          ts.oncomplete = (function(_) {
            return ok();
          });
          ts.onabort = (function(_) {
            return ng(("ストレージの書込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      deleteSaveDatas: function(con) {
        if (!(con === true))
          throw '誤消去防止セーフティ';
        var name = getSaveName();
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readwrite');
          var os = ts.objectStore('savedata');
          var rg = IDBKeyRange.bound((name + "/"), (name + "/{"));
          var rq = os.openCursor(rg);
          rq.onsuccess = (function(_) {
            var cs = rq.result;
            if (!cs)
              return;
            cs.delete();
            cs.continue();
          });
          ts.oncomplete = (function(_) {
            return ok();
          });
          ts.onabort = (function(_) {
            return ng(("ストレージの消去に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      getSetting: function(key, def) {
        return new Promise((function(ok, ng) {
          var ts = db.transaction('setting', 'readonly');
          var os = ts.objectStore('setting');
          var rq = os.get(key);
          ts.oncomplete = (function(_) {
            return ok(rq.result);
          });
          ts.onabort = (function(_) {
            return ng(("ストレージのkey『" + key + "』の書込に失敗（" + ts.error.message + ")"));
          });
        })).then((function(val) {
          return (val === undefined) ? Storage.setSetting(key, def) : val;
        }));
      },
      setSetting: function(key, val) {
        return new Promise((function(ok, ng) {
          var ts = db.transaction('setting', 'readwrite');
          var os = ts.objectStore('setting');
          var rq = os.put(val, key);
          ts.oncomplete = (function(_) {
            return ok(val);
          });
          ts.onabort = (function(_) {
            return ng(("ストレージのkey『" + key + "』の書込に失敗（" + ts.error.message + ")"));
          });
        }));
      },
      VERSION: VERSION
    };
    function getSaveName() {
      return Data.dataSaveName || Data.scenarioName;
    }
    new Promise((function(ok, ng) {
      var rq = indexedDB.open("open-novel", 8);
      rq.onupgradeneeded = (function(evt) {
        var db = rq.result,
            ts = rq.transaction,
            ov = evt.oldVersion;
        if (ov <= 7)
          if (confirm('データベースの初期化が必要です。')) {
            ;
            [].slice.call(db.objectStoreNames).forEach((function(n) {
              return db.deleteObjectStore(n);
            }));
            db.createObjectStore('setting');
            db.createObjectStore('savedata');
            alert('初期化が完了しました。');
          } else {
            ts.abort();
            alert('初期化を行わないと起動できません。');
          }
      });
      rq.onsuccess = (function(_) {
        return ok(rq.result);
      });
      rq.onerror = (function(err) {
        return ng(("ストレージが開けない（" + err.message + ")"));
      });
    })).then((function(val) {
      Storage.DB = db = val;
      READY.Storage.ready(Storage);
    }));
  })).check();
  return {};
});
System.get("ES6/ストレージ.js" + '');
System.registerModule("ES6/ビュー.js", [], function() {
  "use strict";
  var __moduleName = "ES6/ビュー.js";
  READY('Storage', 'Player', 'DOM', 'Sound').then((function($__2) {
    'use strict';
    var Util = $__2.Util;
    var View = null;
    var clickSE = new Sound.SE('選択', {sys: true});
    var focusSE = new Sound.SE('フォーカス', {sys: true});
    var EP = Element.prototype;
    Util.setDefaults(EP, {
      on: EP.addEventListener,
      requestFullscreen: EP.webkitRequestFullscreen || EP.mozRequestFullScreen,
      removeChildren: function() {
        var ch = this.childNodes,
            len = ch.length;
        for (var i = len - 1; i >= 0; --i)
          ch[i].remove();
        return this;
      },
      setStyles: function(styles) {
        var $__0 = this;
        styles = styles || {};
        Object.keys(styles).forEach((function(key) {
          if (styles[key] != null)
            $__0.style[key] = styles[key];
        }), this);
        return this;
      }
    });
    EP.append = function( elm ) { EP.appendChild( elm ); return elm }
    if (!document.onfullscreenchange)
      Object.defineProperty(document, 'onfullscreenchange', {set: (function(val) {
          if ('onwebkitfullscreenchange' in document)
            document.onwebkitfullscreenchange = val;
          else
            document.onmozfullscreenchange = val;
        })});
    if (!document.fullscreenElement)
      Object.defineProperty(document, 'fullscreenElement', {get: (function(_) {
          return document.webkitFullscreenElement || document.mozFullScreenElement;
        })});
    var $isWebkit = !!EP.webkitRequestFullscreen;
    function DOM(tagName, styles) {
      if (tagName == 'text')
        return document.createTextNode(styles);
      var el = document.createElement(tagName);
      return el.setStyles(styles);
    }
    var query = document.querySelector.bind(document),
        queryAll = document.querySelectorAll.bind(document);
    var el_root = query('#ONPwrapper'),
        el_wrapper = new DOM('div'),
        el_player = new DOM('div', {backgroundColor: 'black'}),
        el_context = new DOM('div');
    el_wrapper.id = 'ONP';
    el_root.removeChildren();
    el_root.append(el_wrapper).append(el_player).append(el_context);
    function adjustScale(height, ratio, full) {
      var p = Promise.resolve();
      if (!full) {
        el_player.style.height = '100%';
        if (height * devicePixelRatio < 480)
          p = View.showNotice('表示領域が小さ過ぎるため\n表示が崩れる場合があります');
      }
      var ratio = ratio || 16 / 9;
      var width = height * ratio;
      el_player.style.fontSize = height / 25 + 'px';
      el_wrapper.style.height = height + 'px';
      el_wrapper.style.width = width + 'px';
      el_debug.style.width = width - 10 + 'px';
      if (full) {
        el_player.style.height = height + 'px';
        if (el_fullscreen)
          el_fullscreen.style.height = height + 'px';
      } else
        fitScreen = Util.NOP;
      return p;
    }
    var el_debug = el_root.append(new DOM('div', {
      width: '320px',
      textAlign: 'center',
      fontSize: '1em',
      padding: '5px'
    }));
    var bs = {
      height: '3em',
      margin: '5px'
    };
    var createDdebugSub = (function(_) {
      return el_debug.append(new DOM('div', {display: 'inline-block'}));
    });
    var el_debugSub = createDdebugSub();
    ;
    [360, 540, 720, 1080].forEach((function(size) {
      var el = el_debugSub.append(new DOM('button', bs));
      el.append(new DOM('text', size + 'p'));
      el.on('click', (function(_) {
        return adjustScale(size / devicePixelRatio);
      }));
    }));
    var el_debugSub = createDdebugSub();
    var el = el_debugSub.append(new DOM('button', bs));
    el.append(new DOM('text', 'フルウィンドウ(横)'));
    el.on('click', (function(_) {
      fitScreen = (function(_) {
        var ratio = 16 / 9;
        var width = document.body.clientWidth;
        var height = width / ratio;
        adjustScale(height, 0, true);
      });
      fitScreen();
    }));
    var el_fullscreen;
    var el = el_debugSub.append(new DOM('button', bs));
    el.append(new DOM('text', 'フルスクリーン(横)'));
    el.on('click', (function(_) {
      el_fullscreen = new DOM('div', {
        width: '100%',
        height: '100%',
        fontSize: '100%'
      });
      el_player.remove();
      el_wrapper.append(el_fullscreen).append(el_player);
      el_fullscreen.requestFullscreen();
      fitScreen = (function(_) {
        var ratio = 16 / 9;
        var width = screen.width,
            height = screen.height;
        if (height * ratio > width)
          height = width / ratio;
        adjustScale(height, 0, true);
      });
      fitScreen();
      View.showNotice('この機能はブラウザにより\n表示の差があります');
    }));
    var el_debugSub = createDdebugSub();
    var el = el_debugSub.append(new DOM('button', bs));
    el.append(new DOM('text', 'サウンド有無'));
    el.on('click', (function(_) {
      var f = !Sound.soundEnabled;
      Sound.changeSoundEnabled(f);
      Storage.setSetting('soundEnabled', f).check();
      if (Sound.soundAvailability)
        View.showNotice(("サウンドを" + (f ? '有' : '無') + "効に設定しました"));
      else
        View.showNotice(("サウンドを" + (f ? '有' : '無') + "効に設定しました") + '\nただしお使いの環境では音が出せません');
    }));
    var el = el_debugSub.append(new DOM('button', bs));
    el.append(new DOM('text', 'キャシュ削除'));
    el.on('click', (function(_) {
      Util.cacheClear();
      View.showNotice('キャッシュを削除しました');
    }));
    var el = el_debugSub.append(new DOM('button', bs));
    el.append(new DOM('text', 'リセット'));
    el.on('click', (function(_) {
      Game.reset();
    }));
    var el = new DOM('div');
    var el_debugWindow = el_debug.append(el).append(new DOM('pre', {
      textAlign: 'left',
      whiteSpace: 'pre-wrap'
    }));
    el_debugWindow.textContent = 'デバッグ情報\n（無し）';
    function setAnimate(func) {
      var start = performance.now();
      var cancelled = false;
      var paused = false;
      return new Promise((function(ok) {
        var complete = (function(_) {
          cancelled = true;
          ok();
        });
        var pause = (function(_) {
          paused = true;
          return (function(_) {
            return requestAnimationFrame(loop);
          });
        });
        var loop = (function(now) {
          now = performance.now();
          if (cancelled)
            return;
          var delta = now - start;
          if (delta < 0)
            delta = 0;
          if (!paused)
            requestAnimationFrame(loop);
          func(delta, complete, pause);
        });
        requestAnimationFrame(loop);
      }));
    }
    function setFadeIn(el) {
      var msec = arguments[1] !== (void 0) ? arguments[1] : Config.fadeDuration;
      el.style.opacity = 0;
      el.hidden = false;
      el.style.pointerEvents = 'none';
      return setAnimate((function(delay, complete, pause) {
        var lv = delay / msec;
        if (lv >= 1) {
          lv = 1;
          complete();
        }
        el.style.opacity = lv;
      })).then((function(_) {
        el.style.pointerEvents = '';
      }));
    }
    function setFadeOut(el) {
      var msec = arguments[1] !== (void 0) ? arguments[1] : Config.fadeDuration;
      el.style.opacity = 1;
      el.style.pointerEvents = 'none';
      return setAnimate((function(delay, complete, pause) {
        var lv = 1 - delay / msec;
        if (lv <= 0) {
          lv = 0;
          complete();
        }
        el.style.opacity = lv;
      })).then((function(_) {
        el.style.pointerEvents = '';
        el.hidden = true;
      }));
    }
    function cancelEvent(evt) {
      if (!(evt instanceof Event))
        return;
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    function reverseWindow() {
      var del = arguments[0] !== (void 0) ? arguments[0] : false;
      Object.keys(View.windows).forEach((function(key) {
        var el = View.windows[key];
        if (el.hidden) {
          if (del)
            setFadeIn(el);
        } else {
          if (!del)
            setFadeOut(el);
        }
      }));
      return Promise.delay(Config.fadeDuration);
    }
    var fitScreen = Util.NOP;
    window.onresize = (function(_) {
      return fitScreen();
    });
    document.onfullscreenchange = (function(_) {
      var full = document.fullscreenElement == el_fullscreen;
      if (!full) {
        el_fullscreen.remove();
        el_fullscreen.removeChildren();
        el_wrapper.append(el_player);
        adjustScale($scale, $ratio);
      }
    });
    function on(kind, onFulfilled, onRejected) {
      var weak = arguments[3] !== (void 0) ? arguments[3] : false;
      var rehook = (function(_) {
        return on(kind, onFulfilled, onRejected, weak);
      });
      return new Promise((function(resolve) {
        return hookInput(kind, resolve, weak);
      })).then((function(_) {
        return rehook;
      })).then(onFulfilled).check().catch(onRejected);
    }
    var View = {
      init: function() {
        View.initDisplay();
      },
      on: function(kind, onFulfilled, onRejected) {
        var weak = arguments[3] !== (void 0) ? arguments[3] : true;
        return on(kind, onFulfilled, onRejected, weak);
      },
      initDisplay: function() {
        var opt = arguments[0] !== (void 0) ? arguments[0] : {};
        hookClear();
        stopAuto();
        View.on('menu').then((function(_) {
          return View.showMenu();
        })).check();
        View.on('Uwheel').then((function(_) {
          return View.showLog();
        }));
        Util.setDefaults(opt, {
          color: 'rgba(255,255,255,0.9)',
          textShadow: 'rgba(0,0,0,0.9) 0.1em 0.1em 0.1em',
          background: 'black',
          margin: 'auto',
          position: 'relative',
          hidth: '100%',
          height: '100%',
          overflow: 'hidden'
        });
        var height = opt.HEIGHT || 480;
        opt.height = opt.width = '100%';
        el_context = new DOM('div');
        el_player.removeChildren();
        el_player.append(el_context);
        el_wrapper.setStyles({
          overflow: 'hidden',
          maxHeight: '100%',
          maxWidth: '100%'
        });
        if (!document.fullscreenElement)
          el_player.setStyles({
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            width: '100%'
          });
        el_context.setStyles(opt);
        View.logs = [];
        View.windows = {};
        View.fake = null;
        View.mainMessageWindow = View.addMessageWindow();
        View.imageFrame = View.addImageFrame();
      },
      showNotice: function(message, show_time) {
        var delay_time = arguments[2] !== (void 0) ? arguments[2] : 250;
        if (!message)
          throw 'illegal message string';
        if (!show_time)
          show_time = message.split('\n').length * 500;
        message = '【！】\n' + message;
        var noticeWindow = new DOM('div', {
          fontSize: '2em',
          color: 'rgba(0,0,0,0.75)',
          textShadow: 'rgba(0,0,0,0.75) 0.01em 0.01em 0.01em',
          backgroundColor: 'rgba(255,255,0,0.75)',
          boxShadow: 'rgba(100,100,0,0.5) 0px 0px 5px 5px',
          borderRadius: '2% / 10%',
          textAlign: 'center',
          lineHeight: '1.5',
          opacity: '0',
          position: 'absolute',
          left: 'calc((100% - 90%) / 2)',
          top: '20%',
          zIndex: '5000',
          width: '90%',
          fontFamily: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
          letterSpacing: '0.1em'
        });
        el_player.append(noticeWindow).append(new DOM('pre', {margin: '5%'})).append(new DOM('text', message));
        return new Promise(function(ok, ng) {
          var opacity = 0;
          setAnimate(function(delta, complete) {
            opacity = delta / delay_time;
            if (opacity >= 1) {
              opacity = 1;
              vibrate([100, 100, 100]);
              complete();
            }
            noticeWindow.style.opacity = opacity;
          }).delay(show_time).and(setAnimate, (function(delta, complete) {
            opacity = 1 - delta / delay_time;
            if (opacity <= 0) {
              opacity = 0;
              complete();
              noticeWindow.remove();
            }
            noticeWindow.style.opacity = opacity;
          })).then(ok, ng);
        });
      },
      setLoadingMessage: function(message) {
        var loadingWindow = new DOM('div', {
          fontSize: '1em',
          color: 'rgba(255,255,255,0.25)',
          textShadow: 'rgba(0,0,0,0.5) 0.1em 0.1em 0.1em',
          position: 'absolute',
          right: '0%',
          bottom: '0%',
          zIndex: '4000',
          fontFamily: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
          letterSpacing: '0.1em'
        });
        var defer = Promise.defer();
        Promise.delay(500).then(defer.resolve).delay(10000).then(hide);
        defer.promise.then((function(_) {
          return el_player.append(loadingWindow).append(new DOM('pre', {margin: '0%'})).append(new DOM('text', message));
        }));
        function hide() {
          defer.reject();
          loadingWindow.remove();
        }
        return hide;
      },
      adjustScale: adjustScale,
      setAnimate: setAnimate,
      updateDebugWindow: function(obj) {
        el_debugWindow.textContent = 'デバッグ情報\n' + JSON.stringify(obj, null, 4);
      },
      messageWindowProto: {
        nextPage: function(name) {
          var $__5,
              $__6;
          var $__4 = arguments[1] !== (void 0) ? arguments[1] : {},
              sys = ($__5 = $__4.sys) === void 0 ? false : $__5,
              visited = ($__6 = $__4.visited) === void 0 ? false : $__6;
          View.logs.push(View.windows.message.cloneNode(true));
          if (View.logs.length > 100)
            View.logs.shift();
          View.windows.message.setStyles({
            background: sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)',
            boxShadow: (sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)') + ' 0 0 0.5em 0.5em',
            color: visited ? 'rgba(255,255,150,0.9)' : 'rgba(255,255,255,0.9)'
          });
          name = !name || name.match(/^\s+$/) ? '' : '【' + name + '】';
          this.el_title.textContent = name;
          this.el_body.removeChildren();
        },
        addSentence: function(text) {
          var $__5,
              $__6;
          var $__4 = arguments[1] !== (void 0) ? arguments[1] : {},
              weight = ($__5 = $__4.weight) === void 0 ? 25 : $__5,
              visited = ($__6 = $__4.visited) === void 0 ? false : $__6;
          text += '\n';
          var length = text.length;
          var at = 0,
              nl = 0;
          var el = this.el_body;
          var $__7 = [false, false],
              aborted = $__7[0],
              cancelled = $__7[1];
          var $__8 = [(function(_) {
            return aborted = true;
          }), (function(_) {
            return cancelled = true;
          })],
              abort = $__8[0],
              cancel = $__8[1];
          View.on('go').then(cancel);
          function mul(str, n) {
            return (str || '100%').match(/[\d.]+/)[0] * n / 100 + 'em';
          }
          var css = {};
          var p = setAnimate((function(delay, complete, pause) {
            if (aborted)
              return complete();
            if (cancelled) {
              nl = length;
            }
            while (delay / weight >= at - nl) {
              var str = text[at];
              if (!str)
                return complete();
              if (str == '\\') {
                var sub = text.slice(at + 1);
                if (/^.\[.*?\]/.test(sub)) {
                  var nat = text.indexOf(']', at);
                  var name = text.slice(at + 3, nat).trim();
                  switch (sub[0]) {
                    case 'e':
                      if ($isWebkit) {
                        var img = el.append(new DOM('img', {
                          height: mul(css.fontSize, 0.8),
                          margin: '0 0.05em'
                        }));
                        ;
                        ((function(img, name) {
                          return Util.toBlobEmogiURL(name).then((function(url) {
                            img.src = url;
                          })).check();
                        }))(img, name);
                      } else {
                        var img = el.append(new DOM('object', {
                          height: mul(css.fontSize, 0.8),
                          margin: '0 0.05em'
                        }));
                        img.type = 'image/svg+xml';
                        ;
                        ((function(img, name) {
                          return Util.toBlobEmogiURL(name).then((function(url) {
                            img.data = url;
                          })).check();
                        }))(img, name);
                      }
                      break;
                    case 'c':
                      css.color = name || '';
                      break;
                    case 's':
                      css.fontSize = Util.toSize(name) || '100%';
                      break;
                    default:
                      LOG(("サポートされていないキーワードタイプ『" + sub[0] + "』"));
                  }
                } else {
                  var nat = at + 1;
                  switch (sub[0]) {
                    case 'n':
                      el.append(new DOM('br'));
                      break;
                    case 'C':
                      css.color = '';
                      break;
                    case 'S':
                      css.fontSize = '100%';
                      break;
                    case 'b':
                      css.fontWeight = 'bold';
                      break;
                    case 'B':
                      css.fontWeight = '';
                      break;
                    default:
                      LOG(("サポートされていないキーワードタイプ『" + sub[0] + "』"));
                  }
                }
                nl += nat - at;
                at = nat;
              } else {
                if (str == '\n')
                  el.append(new DOM('br'));
                else if (str != '\u200B')
                  el.append(new DOM('span', css)).append(new DOM('text', str));
              }
              if (++at >= length)
                return complete();
            }
          }));
          setAuto(p, {visited: visited});
          p.abort = abort;
          p.cancel = cancel;
          return p;
        }
      },
      addMessageWindow: function() {
        var opt = {
          background: 'rgba(50,50,50,0.5)',
          boxShadow: 'rgba(50,50,50,0.5) 0 0 0.5em 0.5em',
          borderRadius: '1% / 1%',
          width: 'calc(100% - 0.5em - (1% + 1%))',
          height: 'calc( 20% - 0.5em - (2% + 1%))',
          fontSize: '100%',
          lineHeight: '1.5',
          padding: '2% 1% 1%',
          whiteSpace: 'nowrap',
          position: 'absolute',
          bottom: '0.25em',
          left: '0.25em',
          zIndex: '1500',
          fontFamily: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
          letterSpacing: '0.1em'
        };
        var el = new DOM('div', opt);
        View.windows.message = el;
        el_context.append(el);
        var el_title = el.append(new DOM('div', {
          display: 'inline-block',
          marginRight: '4%',
          textAlign: 'right',
          verticalAlign: 'top',
          width: '15%',
          height: '100%'
        }));
        var el_body = el.append(new DOM('div', {
          display: 'inline-block',
          width: 'auto',
          height: '100%'
        })).append(new DOM('span', {}));
        var mw = {
          __proto__: View.messageWindowProto,
          el: el,
          el_title: el_title,
          el_body: el_body
        };
        return mw;
      },
      addImageFrame: function() {
        var fr = new DOM('div', {
          position: 'absolute',
          left: '0',
          top: '0',
          height: '100%',
          width: '100%',
          zIndex: '1000',
          backgroundColor: 'black'
        });
        el_context.append(fr);
        return fr;
      },
      setConfirmWindow: function(name) {
        var $__7;
        var $__4 = arguments[1] !== (void 0) ? arguments[1] : {},
            sys = ($__7 = $__4.sys) === void 0 ? true : $__7;
        return View.setChoiceWindow([{
          name: name,
          value: true
        }, {
          name: 'キャンセル',
          value: false
        }], {sys: sys});
      },
      setChoiceWindow: function(ary) {
        var $__7,
            $__8,
            $__5,
            $__6;
        var $__4 = arguments[1] !== (void 0) ? arguments[1] : {},
            sys = ($__7 = $__4.sys) === void 0 ? false : $__7,
            closeable = ($__8 = $__4.closeable) === void 0 ? false : $__8,
            half = ($__5 = $__4.half) === void 0 ? false : $__5,
            plus = ($__6 = $__4.plus) === void 0 ? false : $__6;
        var defer = Promise.defer();
        var focusbt;
        var focusindex = -10000;
        var bts = [];
        var cw = new DOM('div', {
          position: 'absolute',
          left: 'calc((100% - 85%) / 2 - 2%)',
          width: '85%',
          top: '3%',
          boxShadow: sys ? 'rgba(100, 255, 150, 0.5) 0 0 5em' : 'rgba(100, 100, 255, 0.3) 0 0 5em',
          borderRadius: '2% / 4%',
          background: sys ? 'rgba(100, 255, 150, 0.5)' : 'rgba(100, 100, 255, 0.3)',
          padding: '1% 2%',
          overflowY: ary.length > (plus ? 4 : 3) * (half ? 2 : 1) ? 'scroll' : 'hidden',
          overflowX: 'hidden',
          maxHeight: plus ? '90%' : '70%',
          zIndex: '2500'
        });
        if (!sys) {
          if (View.windows.choice)
            View.windows.choice.remove();
          View.windows.choice = cw;
        } else {
          if (View.windows.choiceBack)
            View.windows.choiceBack.remove();
          View.windows.choiceBack = cw;
        }
        ary.forEach(function(opt, i) {
          if (!('value' in opt))
            opt.value = opt.name;
          var bt = new DOM('button', {
            display: 'inline-block',
            fontSize: '1.5em',
            boxShadow: 'inset 0 1px 3px #F1F1F1, inset 0 -15px ' + (sys ? 'rgba(0,116,116,0.2)' : 'rgba(0,0,223,0.2)') + ', 1px 1px 2px #E7E7E7',
            background: sys ? 'rgba(0,100,50,0.8)' : 'rgba(0,0,100,0.8)',
            color: 'white',
            borderRadius: (half ? 5 : 2.5) + '% / 25%',
            width: half ? '45%' : '95%',
            height: '2.5em',
            margin: '2.5%',
            textShadow: 'rgba(0,0,0,0.9) 0em 0em 0.5em',
            fontFamily: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
            letterSpacing: '0.1em'
          });
          bt.disabled = !!opt.disabled;
          bt.append(new DOM('text', opt.name));
          bt.onfocus = bt.onmouseover = (function(_) {
            focusSE.play();
            bt.setStyles({background: sys ? 'rgba(100,200,150,0.8)' : 'rgba(100,100,200,0.8)'});
            var elm = bts[focusindex];
            if (elm)
              elm.blur();
            focusindex = index;
          });
          bt.onblur = bt.onmouseout = (function(_) {
            bt.setStyles({background: sys ? 'rgba(0,100,50,0.8)' : 'rgba(0,0,100,0.8)'});
            var elm = bts[focusindex];
            if (elm)
              elm.blur();
          });
          bt.onclick = (function(evt) {
            clickSE.play();
            vibrate([50]);
            close(evt, opt.value);
          });
          bt.onmousedown = cancelEvent;
          cw.append(bt);
          if (!opt.disabled)
            var index = bts.push(bt) - 1;
        });
        function close(evt, val) {
          cancelEvent(evt);
          if (img)
            img.remove();
          setFadeOut(cw).then((function(_) {
            if (!sys)
              delete View.windows.choice;
            else
              delete View.windows.choiceBack;
            cw.remove();
          }));
          defer.resolve(val);
        }
        if (half) {
          on('up', (function(rehook) {
            return focusmove(rehook, -2);
          }));
          on('down', (function(rehook) {
            return focusmove(rehook, +2);
          }));
          on('left', (function(rehook) {
            return focusmove(rehook, -1);
          }));
          on('right', (function(rehook) {
            return focusmove(rehook, +1);
          }));
        } else {
          on('up', (function(rehook) {
            return focusmove(rehook, -1);
          }));
          on('down', (function(rehook) {
            return focusmove(rehook, +1);
          }));
          on('left', (function(rehook) {
            return focusmove(rehook, -10);
          }));
          on('right', (function(rehook) {
            return focusmove(rehook, +10);
          }));
        }
        on('enter', focusenter);
        function focusmove(rehook, n) {
          if (!cw.parentNode)
            return;
          var fi = focusindex;
          var si = fi + n;
          var last = bts.length - 1;
          if (fi < 0)
            si = n > 0 ? 0 : last;
          else if (si < 0)
            si = fi == 0 ? last : 0;
          else if (si > last)
            si = fi == last ? 0 : last;
          bts[si].focus();
          Promise.delay(100).then(rehook);
        }
        function focusenter(rehook) {
          if (!cw.parentNode)
            return;
          if (focusindex >= 0)
            return bts[focusindex].click();
          Promise.delay(100).then(rehook);
        }
        if (closeable) {
          var img = new DOM('img', {
            position: 'absolute',
            right: '4%',
            top: '0%',
            width: '3em',
            height: '3em',
            opacity: '0.75',
            zIndex: '3000'
          });
          if (!sys) {
            if (View.windows.choiceClose)
              View.windows.choiceClose.remove();
            View.windows.choiceClose = img;
          } else {
            if (View.windows.choiceBackClose)
              View.windows.choiceBackClose.remove();
            View.windows.choiceBackClose = img;
          }
          if ($isWebkit) {
            Util.toBlobSysPartsURL('閉じるボタン').then((function(url) {
              img.src = url;
              el_context.append(img);
            })).check();
          } else {
            img.src = 'エンジン/画像/閉じるボタン.svg';
            el_context.append(img);
          }
          img.onmousedown = (function(evt) {
            close(evt, '閉じる');
          });
          on('menu').then((function(_) {
            return close(null, '閉じる');
          }));
        }
        setFadeIn(cw);
        el_context.append(cw);
        return defer.promise;
      },
      setBGImage: function(opt) {
        var $__7,
            $__8,
            $__5;
        var $__4 = arguments[1] !== (void 0) ? arguments[1] : {},
            sys = ($__7 = $__4.sys) === void 0 ? false : $__7,
            fade = ($__8 = $__4.fade) === void 0 ? false : $__8,
            visited = ($__5 = $__4.visited) === void 0 ? false : $__5;
        var defer = Promise.defer();
        Util.setDefaults(opt, {
          backgroundPosition: (opt.left + " " + opt.top),
          backgroundRepeat: 'no-repeat',
          backgroundSize: opt.height ? ("auto " + opt.height) : 'cover',
          backgroundImage: ("url(" + opt.url + ")")
        });
        Util.setProperties(opt, {
          left: null,
          top: null,
          height: null,
          width: null
        });
        var url = opt.url;
        var fr = View.imageFrame;
        new Promise((function(ok) {
          if (url) {
            var img = new Image;
            img.onload = (function(_) {
              return ok(opt);
            });
            img.src = url;
            if (!sys)
              Data.current.active.BGImage = opt;
          } else {
            ok({
              backgroundImage: 'none',
              backgroundSize: 'cover'
            });
          }
        })).then((function(opt) {
          var temp = fr.cloneNode(true);
          el_context.append(temp);
          fr.setStyles(opt);
          var end = (function(_) {
            temp.remove();
            defer.resolve();
          });
          if (View.fake)
            return end();
          var pl = temp.animate({opacity: 0}, {
            duration: Config.fadeDuration,
            fill: 'forwards'
          });
          View.on('go').then((function(_) {
            return pl.finish();
          }));
          pl.onfinish = end;
        }));
        return defer.promise;
      },
      setFDImages: function(ary) {
        var $__6,
            $__7,
            $__8;
        var $__4 = arguments[1] !== (void 0) ? arguments[1] : {},
            sys = ($__6 = $__4.sys) === void 0 ? false : $__6,
            fade = ($__7 = $__4.fade) === void 0 ? false : $__7,
            visited = ($__8 = $__4.visited) === void 0 ? false : $__8;
        var defer = Promise.defer();
        var fr = View.imageFrame;
        Promise.all(ary.map((function(opt) {
          return new Promise((function(ok) {
            Util.setDefaults(opt, {
              left: null,
              right: null,
              top: null,
              bottom: null
            });
            var mar = parseInt(opt.top) || parseInt(opt.bottom) || 0;
            var height = opt.height ? opt.height : ((100 - mar) + "%");
            var img = new DOM('img', {
              position: 'absolute',
              left: opt.left,
              right: opt.right,
              top: opt.top,
              bottom: opt.bottom,
              height: height
            });
            img.onload = (function(_) {
              return ok(img);
            });
            img.src = opt.url;
          }));
        }))).then((function(els) {
          var temp = fr.cloneNode(true);
          el_context.append(temp);
          fr.removeChildren();
          els.forEach((function(el) {
            return fr.append(el);
          }));
          var end = (function(_) {
            temp.remove();
            defer.resolve();
          });
          if (View.fake)
            return end();
          var pl = temp.animate({opacity: 0}, {
            duration: Config.fadeDuration,
            fill: 'forwards'
          });
          View.on('go').then((function(_) {
            return pl.finish();
          }));
          pl.onfinish = end;
        }));
        if (!sys)
          Data.current.active.FDImages = ary;
        return defer.promise;
      },
      prepare: function() {
        if (View.fake)
          return Promise.reject('２重にエフェクトの準備をしようとした');
        var fr = View.imageFrame;
        var fake = View.fake = fr.cloneNode(true);
        el_context.append(fake);
        Data.saveDisabled = true;
        return Promise.resolve();
      },
      fade: function() {
        var $__6,
            $__7;
        var $__4 = arguments[0] !== (void 0) ? arguments[0] : {},
            msec = ($__6 = $__4.msec) === void 0 ? 1000 : $__6,
            visited = ($__7 = $__4.visited) === void 0 ? false : $__7;
        if (!View.fake)
          return Promise.reject('フェードエフェクトには準備が必要');
        var fr = View.imageFrame,
            fake = View.fake;
        var cancelled = false;
        if (visited)
          setAuto(null, {visited: true});
        return new Promise((function(ok, ng) {
          var player = fake.animate({opacity: 0}, {
            duration: msec,
            fill: 'forwards'
          });
          View.on('go').then((function(_) {
            return player.finish();
          }));
          player.onfinish = ok;
        })).then((function(_) {
          fake.remove();
          View.fake = null;
          Data.saveDisabled = false;
        }));
      },
      trans: function() {
        var $__6,
            $__7;
        var $__4 = arguments[0] !== (void 0) ? arguments[0] : {},
            msec = ($__6 = $__4.msec) === void 0 ? 1000 : $__6,
            visited = ($__7 = $__4.visited) === void 0 ? false : $__7;
        if (!View.fake)
          return Promise.reject('スクロールエフェクトには準備が必要');
        var fr = View.imageFrame,
            fake = View.fake;
        if (visited)
          setAuto(null, {visited: true});
        return new Promise((function(ok, ng) {
          var anims = [].map.call(fake.getElementsByTagName('img'), (function(el) {
            var tar = fr.querySelector('[src="' + el.src + '"]');
            if (!tar)
              return null;
            return new Animation(el, {
              left: tar.style.left,
              right: tar.style.right,
              top: tar.style.top,
              bottom: tar.style.bottom,
              height: tar.style.height
            }, {
              duration: msec,
              fill: 'forwards'
            });
          })).filter((function(obj) {
            return !!obj;
          }));
          anims.push(new Animation(fake, {backgroundPosition: fr.style.backgroundPosition}, {
            duration: msec,
            fill: 'forwards'
          }));
          var player = document.timeline.play(new AnimationGroup(anims));
          View.on('go').then((function(_) {
            return player.finish();
          }));
          player.onfinish = ok;
        })).then((function(_) {
          fake.remove();
          View.fake = null;
          Data.saveDisabled = false;
        }));
      },
      flash: function() {
        var $__6,
            $__7,
            $__8;
        var $__4 = arguments[0] !== (void 0) ? arguments[0] : {},
            msec = ($__6 = $__4.msec) === void 0 ? 300 : $__6,
            color = ($__7 = $__4.color) === void 0 ? 'white' : $__7,
            visited = ($__8 = $__4.visited) === void 0 ? false : $__8;
        var fake = View.imageFrame.cloneNode(false);
        fake.style.background = '';
        fake.style.backgroundColor = color;
        fake.style.opacity = '0';
        el_context.append(fake);
        var cancelled = false;
        View.on('go').then((function(_) {
          return cancelled = true;
        }));
        if (visited)
          setAuto(null, {visited: true});
        return setAnimate((function(delay, complete, pause) {
          var per = delay / msec;
          if (per >= 1 || cancelled) {
            per = 1;
            complete();
          }
          fake.style.opacity = per < 0.5 ? per * 2 : 2 - per * 2;
        })).then((function(_) {
          fake.remove();
        }));
      },
      nextPage: function(name, opt) {
        View.mainMessageWindow.nextPage(name, opt);
      },
      addSentence: function(text, opt) {
        return View.mainMessageWindow.addSentence(text, opt);
      },
      showMenu: function() {
        if (Data.phase != 'play' || View.menuIndex > 0)
          return View.on('Rclick').then((function(_) {
            return View.showMenu();
          }));
        View.menuIndex = (View.menuIndex || 0) + 1;
        eventBlock();
        var ary = ['セーブ', 'ロード', 'ウィンドウ消去', 'ログ表示', 'オート', '既読スキップ', 'リセット'].map((function(name) {
          return ({name: name});
        }));
        if (Data.saveDisabled)
          ary[0].disabled = true;
        reverseWindow();
        View.setChoiceWindow(ary, {
          sys: true,
          closeable: true,
          half: true,
          plus: true
        }).then((function(kind) {
          switch (kind) {
            case 'セーブ':
              Player.saveSaveData().check().through(close).then((function(f) {
                return f && View.showNotice('セーブしました。');
              }), (function(err) {
                return View.showNotice('セーブに失敗しました。');
              }));
              break;
            case 'ロード':
              Game.loadSaveData().then(close);
              break;
            case 'ウィンドウ消去':
              eventBlock();
              on('*', (function(_) {
                close();
                eventAllow();
              }));
              break;
            case 'ログ表示':
              close();
              eventFire('Uwheel');
              break;
            case 'オート':
              close();
              startAuto();
              break;
            case '既読スキップ':
              close();
              startSkip();
              break;
            case 'リセット':
              View.setConfirmWindow('リセットする').then((function(f) {
                if (f) {
                  close();
                  Game.reset();
                } else
                  close();
              }));
              break;
            case '閉じる':
              close();
              break;
            default:
              throw 'illegal choice type';
          }
        }));
        function close(evt) {
          if (!View.menuIndex)
            return;
          --View.menuIndex;
          eventAllow();
          View.on('menu').then((function(_) {
            return View.showMenu();
          }));
          reverseWindow(true);
        }
      },
      showLog: function(text) {
        if (Data.phase != 'play' || View.windows.log)
          return;
        eventBlock();
        reverseWindow();
        var el = new DOM('div', {
          position: 'absolute',
          left: '1em',
          top: '1em',
          width: 'calc(100% - 1em * 2)',
          height: 'calc(100% - 1em * 2)',
          overflowX: 'hidden',
          overflowY: 'scroll',
          background: 'rgba(50,50,50,0.9)',
          boxShadow: 'rgba(50,50,50,0.9) 0 0 1em 1em',
          zIndex: '2500'
        });
        var img = new DOM('img', {
          position: 'absolute',
          right: '4%',
          top: '0%',
          width: '3em',
          height: '3em',
          opacity: '0.75',
          zIndex: '3000'
        });
        if ($isWebkit) {
          Util.toBlobSysPartsURL('閉じるボタン').then((function(url) {
            img.src = url;
            el_context.append(img);
          })).check();
        } else {
          img.src = 'エンジン/画像/閉じるボタン.svg';
          el_context.append(img);
        }
        function close(evt) {
          cancelEvent(evt);
          img.remove();
          reverseWindow(true);
          setFadeOut(el).then((function(_) {
            if (View.windows.log) {
              View.windows.log.remove();
              delete View.windows.log;
            }
            eventAllow();
            View.on('Uwheel').then((function(_) {
              return View.showLog();
            }));
          }));
        }
        img.onmousedown = close;
        on('menu').then(close);
        on('up', (function(rehook) {
          el.scrollByLines(-1);
          rehook();
        }));
        on('down', (function(rehook) {
          el.scrollByLines(+1);
          rehook();
        }));
        View.logs.forEach((function(log) {
          log.setStyles({
            position: '',
            height: '',
            padding: '',
            borderRadius: '',
            width: '',
            background: '',
            boxShadow: '',
            marginBottom: '0.5em'
          });
          el.append(log);
        }));
        View.windows.log = el;
        setFadeIn(el);
        el_context.append(el);
        el.scrollTop = 1 << 15 - 1;
      }
    };
    var $__4 = ((function(_) {
      var enabled = false;
      var delay = 0;
      var wait = true;
      var my = {
        setAuto: function(p) {
          var $__7;
          var $__6 = arguments[1] !== (void 0) ? arguments[1] : {},
              visited = ($__7 = $__6.visited) === void 0 ? false : $__7;
          if (!enabled)
            return;
          if (wait && p)
            p.delay(delay).then((function(_) {
              if (enabled)
                eventFire('go');
            })).check();
          else if (visited) {
            eventFire('go');
            if (p)
              p.delay(delay).then((function(_) {
                if (enabled)
                  eventFire('go');
              })).check();
          }
        },
        startAuto: function() {
          enabled = true;
          wait = true;
          delay = 1500;
          View.on('*', stopAuto);
          setAuto(Promise.resolve());
        },
        stopAuto: function() {
          enabled = false;
        },
        startSkip: function() {
          enabled = true;
          wait = false;
          delay = 150;
          View.on('*', stopAuto);
          setAuto(null, {visited: 1});
        }
      };
      Util.setProperties(View, my);
      return my;
    }))(),
        setAuto = $__4.setAuto,
        startAuto = $__4.startAuto,
        stopAuto = $__4.stopAuto,
        startSkip = $__4.startSkip;
    var $__6 = ((function(_) {
      var keyboardTable = {
        8: 'backspace',
        13: 'enter',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
      };
      var hooks = [];
      var sysOnly = false;
      document.addEventListener('keydown', (function(evt) {
        var type = keyboardTable[evt.keyCode];
        if (type)
          onEvent(type, evt);
      }), true);
      el_wrapper.addEventListener('mousedown', (function(evt) {
        var type = 'LMR'[evt.button];
        if (type)
          onEvent(type + 'click', evt);
      }));
      var wheeling = false;
      el_wrapper.addEventListener('wheel', (function(evt) {
        if (wheeling)
          return;
        wheeling = true;
        setTimeout((function(_) {
          wheeling = false;
        }), 50);
        var type = evt.deltaY < 0 ? 'U' : 'D';
        if (type)
          onEvent(type + 'wheel', evt);
      }));
      el_wrapper.addEventListener('contextmenu', (function(evt) {
        onEvent('contextmenu', evt);
      }), true);
      el_wrapper.addEventListener('onselect', (function(evt) {
        onEvent('select', evt);
      }), true);
      function onEvent(type, evt, sys) {
        cancelEvent(evt);
        if (sysOnly && !sys)
          return;
        hooks = hooks.reduce((function(ary, hook) {
          if (hook.indexOf(type) === -1 || hook.blocked > 0)
            ary.push(hook);
          else
            hook.resolve();
          return ary;
        }), []);
      }
      function toHook(kind) {
        switch (kind) {
          case '*':
            return ['*', 'Lclick', 'Rclick', 'Uwheel', 'Dwheel', 'enter', 'space', 'backspace'];
          case 'go':
            return ['go', 'Lclick', 'Dwheel', 'enter', 'space'];
          case 'menu':
            return ['menu', 'Rclick', 'backspace'];
          default:
            return [kind];
        }
      }
      var blocked = 0;
      var my = {
        hookInput: function(kind, resolve) {
          var weak = arguments[2] !== (void 0) ? arguments[2] : true;
          var hook = toHook(kind);
          hook.resolve = resolve;
          hook.blocked = weak ? blocked : 0;
          hooks.push(hook);
        },
        hookClear: function() {
          hooks.length = 0;
          blocked = 0;
          eventSysOnly(false);
        },
        eventBlock: function() {
          ++blocked;
          hooks.forEach((function(hook) {
            return ++hook.blocked;
          }));
        },
        eventAllow: function() {
          --blocked;
          hooks.forEach((function(hook) {
            return --hook.blocked;
          }));
        },
        eventFire: function(type) {
          var sys = arguments[1] !== (void 0) ? arguments[1] : true;
          onEvent(type, null, sys);
        },
        eventSysOnly: function(flag) {
          sysOnly = flag;
        }
      };
      Util.setProperties(View, my);
      return my;
    }))(),
        hookInput = $__6.hookInput,
        hookClear = $__6.hookClear,
        eventBlock = $__6.eventBlock,
        eventAllow = $__6.eventAllow,
        eventFire = $__6.eventFire,
        eventSysOnly = $__6.eventSysOnly;
    function vibrate() {
      var $__9;
      for (var args = [],
          $__1 = 0; $__1 < arguments.length; $__1++)
        args[$__1] = arguments[$__1];
      if (typeof navigator.vibrate == 'function')
        ($__9 = navigator).vibrate.apply($__9, $traceurRuntime.spread(args));
    }
    window.onbeforeunload = (function(_) {
      if (Data.phase == 'play')
        return 'セーブされていないデータは失われます。';
    });
    Util.setProperties(View, {
      fadeIn: function(msec) {
        return setFadeIn(el_context, msec);
      },
      fadeOut: function(msec) {
        return setFadeOut(el_context, msec);
      }
    });
    var $full = false;
    var $ratio = 16 / 9;
    var width = document.body.clientWidth * devicePixelRatio;
    var $scale = (width / $ratio >= 540 ? 540 : width / $ratio) / devicePixelRatio;
    var p = adjustScale($scale, $ratio);
    p.then((function(_) {
      return READY.View.ready(View);
    }));
  })).check();
  return {};
});
System.get("ES6/ビュー.js" + '');
System.registerModule("ES6/サウンド.js", [], function() {
  "use strict";
  var __moduleName = "ES6/サウンド.js";
  READY('Storage', 'Player').then((function($__2) {
    'use strict';
    var Util = $__2.Util;
    var init = Util.co(function*() {
      var soundEnabled = yield Storage.getSetting('soundEnabled', true);
      return setup({soundEnabled: soundEnabled});
    });
    var setup = (function(config) {
      var soundEnabled = config.soundEnabled;
      var ctx = null;
      var bufferMap = new Map;
      var GainChanger = function GainChanger(gain) {
        this.gain = gain;
      };
      ($traceurRuntime.createClass)(GainChanger, {
        up: function() {
          var duration = arguments[0] !== (void 0) ? arguments[0] : 0.5;
          var t0 = ctx.currentTime,
              gain = this.gain.gain;
          gain.cancelScheduledValues(t0);
          gain.setValueAtTime(gain.value, t0);
          gain.linearRampToValueAtTime(1, t0 + duration);
        },
        mute: function() {
          var t0 = ctx.currentTime,
              gain = this.gain.gain;
          gain.cancelScheduledValues(t0);
          gain.setValueAtTime(0, t0);
        }
      }, {});
      var soundAvailability = !!global.AudioContext;
      if (soundAvailability) {
        ctx = new AudioContext();
        var gainRoot = ctx.createGain();
        gainRoot.connect(ctx.destination);
        var compMaster = ctx.createDynamicsCompressor();
        compMaster.connect(gainRoot);
        var gainMaster = ctx.createGain();
        gainMaster.connect(compMaster);
        gainMaster.gain.value = 0.5;
        var gainSysSE = ctx.createGain();
        gainSysSE.connect(gainMaster);
        var gainUserBGM = ctx.createGain();
        gainUserBGM.connect(gainMaster);
        var gainBGM = ctx.createGain();
        gainBGM.connect(gainMaster);
        var rootVolume = new GainChanger(gainRoot);
        document.addEventListener('visibilitychange', muteOrUp);
        muteOrUp();
      }
      function muteOrUp() {
        if (document.hidden || !soundEnabled)
          rootVolume.mute();
        else
          rootVolume.up();
      }
      function changeSoundEnabled(f) {
        Sound.soundEnabled = soundEnabled = f;
        muteOrUp();
      }
      function canplay() {
        return soundAvailability && ctx;
      }
      var SEnBGN = function SEnBGN() {};
      ($traceurRuntime.createClass)(SEnBGN, {fadeout: function() {
          var duration = arguments[0] !== (void 0) ? arguments[0] : 0.5;
          if (!canplay())
            return;
          var t0 = ctx.currentTime,
              gain = this.gain.gain;
          gain.cancelScheduledValues(t0);
          gain.setValueAtTime(gain.value, t0);
          gain.linearRampToValueAtTime(0, t0 + duration);
        }}, {});
      var SE = function SE(name) {
        var $__6;
        var $__5 = arguments[1] !== (void 0) ? arguments[1] : {},
            sys = ($__6 = $__5.sys) === void 0 ? false : $__6;
        if (!name)
          throw '名前が未指定';
        if (!soundAvailability)
          return;
        var url = ("エンジン/効果音/" + name + ".ogg");
        var des = gainSysSE;
        var gain = ctx.createGain();
        gain.connect(des);
        this.url = url;
        this.buf = null;
        this.src = null;
        this.gain = gain;
        this.prepare();
      };
      ($traceurRuntime.createClass)(SE, {
        load: function() {
          var $__0 = this;
          var url = (this).url;
          var buf = bufferMap.get(url);
          if (buf)
            return Promise.resolve(buf);
          return Util.load(url, 'arraybuffer').then((function(buf) {
            bufferMap.set(url, buf);
            $__0.buf = buf;
          }));
        },
        prepare: function() {
          var $__0 = this;
          var buf = (this).buf;
          if (!buf)
            return this.load().then((function(_) {
              return $__0.prepare();
            }));
          return new Promise((function(ok, ng) {
            ctx.decodeAudioData(buf.slice(), (function(buf) {
              var src = ctx.createBufferSource();
              src.buffer = buf;
              src.connect($__0.gain);
              $__0.src = src;
              ok();
            }), ng);
          }));
        },
        play: function() {
          var $__0 = this;
          if (!canplay())
            return Promise.resolve(null);
          var src = (this).src;
          if (!src)
            return this.prepare().then((function(_) {
              return $__0.play();
            }));
          src.start();
          this.src = null;
          this.prepare();
          return new Promise((function(ok) {
            src.onended = ok;
          }));
        }
      }, {}, SEnBGN);
      var BGM = function BGM(name) {
        var $__6;
        var $__5 = arguments[1] !== (void 0) ? arguments[1] : {},
            sys = ($__6 = $__5.sys) === void 0 ? false : $__6;
        if (!name)
          throw '名前が未指定';
        if (!soundAvailability)
          return;
        var type = 'BGM';
        var url = 'not use';
        var des = gainUserBGM;
        var gain = ctx.createGain();
        gain.connect(des);
        this.name = name;
        this.url = url;
        this.buf = null;
        this.src = null;
        this.gain = gain;
      };
      ($traceurRuntime.createClass)(BGM, {
        prepare: function() {
          var $__0 = this;
          return Util.toBlobURL('BGM', this.name, 'ogg').then((function(url) {
            var a = new Audio(url);
            a.loop = true;
            $__0.src = a;
            ctx.createMediaElementSource(a).connect($__0.gain);
          }));
        },
        play: function() {
          var $__0 = this;
          if (!canplay())
            return Promise.resolve(null);
          var src = (this).src;
          if (!src)
            return this.prepare().then((function(_) {
              return $__0.play();
            }));
          var t0 = ctx.currentTime,
              gain = this.gain.gain;
          src.play();
          return new Promise((function(ok) {
            src.onended = ok;
          }));
        },
        fadein: function() {
          var duration = arguments[0] !== (void 0) ? arguments[0] : 0.5;
          var $__0 = this;
          if (!canplay())
            return Promise.resolve(null);
          var src = (this).src;
          if (!src)
            return this.prepare().then((function(_) {
              return $__0.play();
            }));
          var t0 = ctx.currentTime,
              gain = this.gain.gain;
          gain.cancelScheduledValues(t0);
          gain.setValueAtTime(0, t0);
          src.play();
          gain.linearRampToValueAtTime(1, t0 + duration);
          return new Promise((function(ok) {
            src.onended = ok;
          }));
        }
      }, {}, SEnBGN);
      var changeBGM = ((function(_) {
        var currentBGM = null;
        return (function(name) {
          var duration = 0.5;
          return new Promise((function(ok) {
            if (currentBGM) {
              currentBGM.fadeout(duration);
              Promise.delay(duration).then(ok);
            } else
              ok();
          })).then((function(_) {
            if (!name)
              return;
            currentBGM = new Sound.BGM(name);
            Data.current.active.BGM = name;
            currentBGM.fadein(duration);
            return Promise.delay(duration);
          }));
        });
      }))();
      var init = (function(_) {
        changeBGM(null);
      });
      READY.Sound.ready({
        soundEnabled: soundEnabled,
        soundAvailability: soundAvailability,
        CTX: ctx,
        rootVolume: rootVolume,
        SE: SE,
        BGM: BGM,
        changeBGM: changeBGM,
        changeSoundEnabled: changeSoundEnabled,
        init: init
      });
    });
    init().check();
  })).check();
  return {};
});
System.get("ES6/サウンド.js" + '');
System.registerModule("ES6/プレーヤー.js", [], function() {
  "use strict";
  var __moduleName = "ES6/プレーヤー.js";
  READY().then((function($__1) {
    'use strict';
    var Util = $__1.Util;
    function parseScript(text) {
      text = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\n/g, '\r\n') + '\r\n';
      text = text.replace(/^\/\/.*/gm, '');
      text = text.replace(/^\#(.*)/gm, (function(_, str) {
        return ("・マーク\r\n\t" + str);
      }));
      function parseOne(base, text) {
        var chanks = text.match(/[^\n]+?\n(\t+[\s\S]+?\n)+/g) || [];
        chanks.forEach((function(chank) {
          var blocks = chank.replace(/^\t/gm, '').replace(/\n$/, '').match(/.+/g);
          var act = blocks.shift().trim();
          var data = '\n' + blocks.join('\n') + '\n';
          var ary = [];
          if (act[0] !== '・') {
            base.push(['会話', [[act, blocks]]]);
            return;
          } else
            act = act.slice(1);
          if (data.match(/\t/)) {
            base.push([act, ary]);
            parseOne(ary, data);
          } else
            base.push([act, blocks]);
        }));
      }
      var base = [];
      cacheEmogi(text);
      parseOne(base, text);
      return base;
    }
    function copyObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    function otherName(name) {
      return function() {
        return this[name].apply(this, arguments);
      };
    }
    function cacheEmogi(text) {
      ;
      (text.match(/\\\[.+\]/g) || []).forEach((function(eff) {
        var name = eff.slice(2, -1);
        Util.toBlobEmogiURL(name);
      }));
    }
    var preloadAppend = ((function(_) {
      var buffer = [];
      var max = 2;
      var n = 0;
      function next() {
        while (n < max) {
          var func = buffer.shift();
          if (!func)
            return;
          ++n;
          Promise.resolve(func()).through((function(_) {
            --n;
            next();
          })).check();
        }
      }
      function append(func) {
        buffer.push(func);
        next();
      }
      return append;
    }))();
    function flattenScript(script) {
      var buf = [];
      function flatten(script) {
        var bk = [];
        var q = 0;
        script.forEach((function(prog) {
          bk.forEach((function(n) {
            buf[n] = buf.length - (q ? 1 : 0);
          }));
          bk = [];
          if (q)
            buf[q] = buf.length;
          q = 0;
          var $__3 = prog,
              act = $__3[0],
              data = $__3[1];
          switch (act) {
            case '繰返':
            case '繰返し':
            case '繰り返し':
              q = buf.length + 2;
            case '選択':
            case '選択肢':
            case '分岐':
              var cp = buf.push(act, null) - 1;
              if (q)
                buf.push(-1);
              buf[cp] = data.map((function($__4) {
                var $__5 = $__4,
                    lab = $__5[0],
                    val = $__5[1];
                if (Array.isArray(val[0])) {
                  var p = buf.length;
                  bk.push(flatten(val));
                  val = p;
                }
                return [lab, val];
              }));
              if (q) {
                buf[cp].unshift(q);
                buf.push(cp - 1);
              }
              break;
            default:
              buf.push(act, data);
          }
        }));
        return buf.push(-1) - 1;
      }
      flatten(script);
      return buf;
    }
    function cacheScript(script) {
      var sname = arguments[1] !== (void 0) ? arguments[1] : script.sname;
      if (!Array.isArray(script)) {
        LOG('不正なスクリプトのためキャッシュできない');
        LOG(script);
        return Promise.reject('不正なスクリプトのためキャッシュできない');
      }
      if (!sname)
        LOG('!!!sname');
      script = copyObject(script);
      var defer = Promise.defer();
      var caching = 0;
      function append(args) {
        var toURL = arguments[1] !== (void 0) ? arguments[1] : Util.toBlobURL;
        ++caching;
        preloadAppend((function(_) {
          return toURL.apply(null, $traceurRuntime.spread(args)).through((function(_) {
            if (--caching <= 0)
              defer.resolve();
          })).check();
        }));
      }
      for (var po = 0; po < script.length; po++) {
        try {
          var act = script[po];
          if (!act)
            continue;
          if (typeof act != 'string')
            continue;
          var data = script[++po];
          switch (act) {
            case '背景':
              var name = data[0];
              if (typeof name == 'object')
                name = name[1][0];
              if (Util.isNoneType(name))
                return;
              append(['背景', name, 'jpg']);
              break;
            case '立絵':
            case '立ち絵':
              data.forEach((function(ary) {
                if (Util.isNoneType(ary))
                  return;
                var $__3 = ary,
                    position = $__3[0],
                    names = $__3[1];
                if (!position)
                  return;
                if (!names)
                  return;
                var name = names[0];
                append(['立ち絵', name, 'png']);
              }));
              break;
            case 'BGM':
            case 'ＢＧＭ':
              var name = data[0];
              if (Util.isNoneType(name))
                return;
              append(['BGM', name, 'ogg']);
              break;
            case '繰返':
            case '繰返し':
            case '繰り返し':
            case '選択':
            case '選択肢':
            case '分岐':
              data = data.reduce((function(base, ary) {
                var val = ary[1];
                if (val && typeof val[0] == 'string')
                  base.push(val[0]);
                return base;
              }), []);
            case 'ジャンプ':
              data.forEach((function(to) {
                var $__4;
                if (!to)
                  return;
                var name = to,
                    base = sname;
                var $__3 = name.replace(/＃/g, '#').split('#'),
                    name = $__3[0],
                    mark = ($__4 = $__3[1]) === void 0 ? '' : $__4;
                if (!name)
                  name = base.replace(/＃/g, '#').split('#')[0];
                var subkey = (Data.scenarioName + "/" + Util.forceName('シナリオ', name, 'txt'));
                if (!Util.cacheHas(subkey))
                  fetchScriptData(to, base).then((function(script) {
                    return cacheScript(script);
                  })).check();
              }));
              break;
          }
        } catch (err) {
          LOG(("キャッシュ中にコマンド『" + act + "』で『" + err + "』が起きた"));
          --caching;
        }
      }
      if (caching < 0)
        defer.resolve();
      return Promise.race([Promise.defer(5000), defer.promise]);
    }
    function runScript(script) {
      var sname = arguments[1] !== (void 0) ? arguments[1] : script.sname;
      var masterComp = arguments[2];
      var $__0;
      if (!sname)
        LOG('!!!sname');
      sname = sname.split('#')[0];
      Data.phase = 'play';
      var run = Promise.defer();
      if (!masterComp)
        masterComp = run.resolve;
      var $__3 = script,
          mark = $__3.mark,
          hash = $__3.hash,
          params = $__3.params,
          scenario = $__3.scenario,
          active = $__3.active;
      if (mark)
        Data.current.mark = mark;
      var searching = !!hash;
      if (params)
        Object.keys(params).forEach((function(name) {
          return Util.paramSet(name, params[name]);
        }));
      script = copyObject(script);
      var gsave = Data.current.setting;
      var visited = gsave.visited;
      if (!visited)
        gsave.visited = visited = {};
      var vBA = visited[sname];
      if (!vBA)
        visited[sname] = vBA = BitArray.create(script.length);
      function runChildScript(script) {
        return runScript(script, undefined, masterComp);
      }
      var actHandlers = ($__0 = {}, Object.defineProperty($__0, "会話", {
        value: function(data, done, failed, $__5) {
          var visited = $__5.visited;
          var isNone = Util.isNoneType(data[0]);
          View.mainMessageWindow.el.style.opacity = isNone ? '0' : '';
          if (isNone)
            return done();
          save();
          function nextPage() {
            var ary = data.shift();
            if (!ary) {
              autosave(false);
              return done();
            }
            var name = ary[0],
                texts = ary[1];
            if (Util.isNoneType(name))
              name = '';
            name = replaceEffect(name);
            View.nextPage(name, {visited: visited});
            function nextSentence() {
              var text = texts.shift();
              if (!text)
                return nextPage();
              text = text.replace(/\\w\[(\d*)\]/g, (function(_, num) {
                return '\u200B'.repeat(+num || 1);
              }));
              text = replaceEffect(text);
              View.addSentence(text, {visited: visited}).on('go', nextSentence, failed);
            }
            nextSentence();
          }
          nextPage();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "背景", {
        value: function(data, done, failed) {
          var $__6,
              $__7;
          if (typeof data[0] == 'object') {
            var name = replaceEffect(data[0][1][0]);
            var pos = Util.toHalfWidth(replaceEffect(data[0][0])).match(/[+\-0-9.]+/g);
            if (!pos)
              return failed('不正な位置検出');
            var $__5 = pos,
                left = $__5[0],
                top = ($__6 = $__5[1]) === void 0 ? '0' : $__6,
                height = ($__7 = $__5[2]) === void 0 ? null : $__7;
          } else {
            var name = replaceEffect(data[0]);
            var $__8 = ['0', '0', null],
                left = $__8[0],
                top = $__8[1],
                height = $__8[2];
          }
          left += '%', top += '%';
          height = Util.toSize(height);
          Util.toBlobURL('背景', name, 'jpg').then((function(url) {
            return View.setBGImage({
              name: name,
              url: url,
              left: left,
              top: top,
              height: height
            });
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "立絵", {
        value: otherName('立ち絵'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "立ち絵", {
        value: function(data, done, failed) {
          Promise.all(data.reduce((function(base, ary) {
            var $__7,
                $__9;
            if (!base)
              return;
            if (Util.isNoneType(ary))
              return base;
            var $__5 = ary,
                position = $__5[0],
                names = $__5[1];
            if (!position)
              return failed('不正な位置検出');
            if (!names)
              return failed('不正な画像名検出');
            position = replaceEffect(position);
            var name = replaceEffect(names[0]);
            var a_type = ['left', 'right']['左右'.indexOf(position)];
            var v_type = 'top';
            var $__8 = [0, 0],
                a_per = $__8[0],
                v_per = $__8[1];
            var height = null;
            if (!a_type) {
              var pos = Util.toHalfWidth(position).match(/[+\-0-9.]+/g);
              if (!pos)
                return failed('不正な位置検出');
              var $__6 = pos,
                  a_pos = $__6[0],
                  v_pos = ($__7 = $__6[1]) === void 0 ? '0' : $__7,
                  height = ($__9 = $__6[2]) === void 0 ? null : $__9;
              a_per = Math.abs(+a_pos);
              v_per = Math.abs(+v_pos);
              a_type = a_pos.match('-') ? 'right' : 'left';
              v_type = v_pos.match('-') ? 'bottom' : 'top';
              height = Util.toSize(height);
            }
            base.push(Util.toBlobURL('立ち絵', name, 'png').then((function(url) {
              var $__0;
              return (($__0 = {}, Object.defineProperty($__0, "name", {
                value: name,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__0, "url", {
                value: url,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__0, "height", {
                value: height,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__0, a_type, {
                value: (a_per + "%"),
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__0, v_type, {
                value: (v_per + "%"),
                configurable: true,
                enumerable: true,
                writable: true
              }), $__0));
            })));
            return base;
          }), [])).then((function(ary) {
            return View.setFDImages(ary);
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "ＢＧＭ", {
        value: otherName('BGM'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "BGM", {
        value: function(data, done, failed) {
          var name = replaceEffect(data[0]);
          if (Util.isNoneType(name))
            name = null;
          Sound.changeBGM(name).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "効果", {
        value: otherName('エフェクト'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "エフェクト", {
        value: function(data, done, failed, $__5) {
          var visited = $__5.visited;
          data.forEach((function(prog) {
            switch (prog) {
              case '準備':
                return View.prepare().then(done, failed);
            }
            var act = prog[0],
                opt = Util.toHalfWidth(replaceEffect(prog[1][0])).split(/\s+/);
            var msec = opt[0].match(/[\d.]+/) * 1000;
            switch (act) {
              case 'フェード':
                return View.fade({
                  msec: msec,
                  visited: visited
                }).then(done, failed);
              case 'トランス':
                return View.trans({
                  msec: msec,
                  visited: visited
                }).then(done, failed);
              case 'フラッシュ':
                var color = opt[1];
                return View.flash({
                  msec: msec,
                  color: color,
                  visited: visited
                }).then(done, failed);
              default:
                failed('想定外のエフェクトタイプ');
            }
          }));
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "選択", {
        value: otherName('選択肢'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "選択肢", {
        value: function(data, done, failed) {
          View.setChoiceWindow(data.map((function(ary) {
            return {
              name: replaceEffect(ary[0]),
              value: ary[1]
            };
          }))).then((function(value) {
            if (typeof value[0] == 'string')
              actHandlers['ジャンプ'](value, done, failed);
            else {
              po = value;
              done();
            }
          }));
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "ジャンプ", {
        value: function(data, done, failed) {
          var to = replaceEffect(data[0]);
          fetchScriptData(to, sname).then((function(script) {
            return runChildScript(script);
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "変数", {
        value: otherName('パラメータ'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "パラメーター", {
        value: otherName('パラメータ'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "パラメータ", {
        value: function(data, done, failed) {
          data.forEach((function(str) {
            str = Util.toHalfWidth(str);
            str = str.match(/(.+)\:(.+)/);
            if (!str)
              return failed('不正なパラメータ指定検出');
            var name = replaceEffect(str[1]);
            var effect = str[2];
            if (!name)
              return failed('不正なパラメータ指定検出');
            var eff = evalEffect(effect, failed);
            Util.paramSet(name, eff);
          }));
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "入力", {
        value: function(data, done, failed) {
          str = Util.toHalfWidth(data[0]);
          if (!str)
            return failed('不正なパラメータ指定検出');
          var str = /.+\:/.test(str) ? str.match(/(.+)\:(.*)/) : [, str, '""'];
          var name = replaceEffect(str[1]);
          var effect = str[2];
          var eff = evalEffect(effect, failed);
          var rv = prompt('', eff) || eff;
          Util.paramSet(name, rv);
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "繰返", {
        value: otherName('繰り返し'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "繰返し", {
        value: otherName('繰り返し'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "繰り返し", {
        value: function(data, done, failed) {
          var q = data[0];
          data = data.slice(1);
          if (!data.some((function($__5) {
            var $__8 = $__5,
                effect = $__8[0],
                acts = $__8[1];
            if (!effect)
              return failed('不正なパラメータ指定検出');
            var flag = !!evalEffect(effect, failed);
            if (flag)
              po = acts;
            return flag;
          })))
            po = q;
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "分岐", {
        value: function(data, done, failed) {
          data.some((function($__5) {
            var $__8 = $__5,
                effect = $__8[0],
                acts = $__8[1];
            if (!effect)
              return failed('不正なパラメータ指定検出');
            var flag = !!evalEffect(effect, failed);
            if (flag)
              po = acts;
            return flag;
          }));
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "マーク", {
        value: function(data, done, failed) {
          Data.current.mark = data[0];
          autosave(true);
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "スクリプト", {
        value: function(data, done, failed) {
          var act = data[0];
          if (Util.isNoneType(act))
            return done();
          switch (act) {
            case '戻る':
            case 'もどる':
            case '帰る':
            case 'かえる':
              run.resolve();
              break;
            case '終わる':
            case '終る':
            case 'おわる':
              masterComp();
              break;
            default:
              failed(("不正なスクリプトコマンド『" + act + "』"));
          }
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__0, "コメント", {
        value: function(data, done, failed) {
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), $__0);
      function save() {
        var params = {};
        var globalParams = {};
        Util.paramForEach((function(value, key) {
          params[key] = value;
        }));
        var cp = {
          script: sname,
          params: params,
          active: Data.current.active,
          point: po - 2,
          mark: Data.current.mark,
          date: new Date
        };
        Data.current.point = cp;
      }
      function autosave(full) {
        var p = Storage.setGlobalData(Data.current.setting);
        if (!full)
          return p;
        save();
        return Promise.all([p, Storage.getSaveDatas(101, 110).then((function(saves) {
          saves.pop();
          saves.splice(101, 0, Data.current.point);
          saves.forEach((function(save, i) {
            if (save)
              Storage.setSaveData(i, save);
          }));
        }))]);
      }
      function main_loop() {
        var act,
            loop = new Promise((function(resolve, reject) {
              act = script[po];
              if (!act) {
                return searching ? run.reject(("マーク『" + hash + "』が見つかりません。")) : run.resolve();
              }
              if (!searching && typeof act == 'number') {
                if (searching && (+hash === po))
                  searching = false;
                else
                  po = act;
                return resolve();
              }
              if (searching) {
                if (+hash === po) {
                  searching = false;
                } else if (act == 'マーク') {
                  var data = script[++po];
                  ++po;
                  var mark = data[0];
                  if (mark == hash) {
                    searching = false;
                    return actHandlers['マーク']([mark], resolve, reject);
                  }
                } else
                  ++po;
                resolve();
              } else if (act in actHandlers) {
                var visited = BitArray.get(vBA, po) === 1;
                var visit = BitArray.set.bind(BitArray, vBA, po);
                var data = script[++po];
                ++po;
                actHandlers[act](data, (function(_) {
                  visit();
                  resolve();
                }), reject, {visited: visited});
              } else {
                Util.error('サポートされていないコマンド『' + act + '』を検出しました。\n\nこのコマンドを飛ばして再生が継続されます。');
                ++po;
                resolve();
              }
            })).then(main_loop, (function(err) {
              var message = err ? ("コマンド『" + (act ? act : '(不明)') + "』で『" + err + "』が起こりました。") : ("コマンド『" + act + "』が原因かもしれません。");
              Util.error('スクリプトを解析中にエラーが発生しました。\n\n' + message + '\n\nこのコマンドを保証せず再生が継続されます。');
              return main_loop();
            }));
      }
      var po = 0;
      new Promise((function(ok) {
        if (active) {
          var p = [];
          var obj = active.BGImage;
          if (obj && obj.name) {
            p.push(Util.toBlobURL('背景', obj.name, 'jpg').then((function(url) {
              obj.url = url;
              return obj;
            })).then((function(obj) {
              return View.setBGImage(obj);
            })));
          }
          var ary = active.FDImages;
          if (ary) {
            p.push(Promise.all(ary.map((function(obj) {
              return obj.name ? Util.toBlobURL('立ち絵', obj.name, 'png').then((function(url) {
                obj.url = url;
                return obj;
              })) : 1;
            }))).then((function(opts) {
              return View.setFDImages(opts);
            })));
          }
          var name = active.BGM;
          if (name)
            p.push(Sound.changeBGM(name));
          Promise.all(p).then(ok).check();
        } else
          ok();
      })).then(main_loop);
      return run.promise;
    }
    function replaceEffect(str) {
      return str.replace(/\\{(.+?)}/g, (function(_, efect) {
        return evalEffect(efect);
      }));
    }
    function evalEffect(effect, failed) {
      effect = effect.trim();
      if (Util.isNoneType(effect))
        return true;
      effect = Util.toHalfWidth(effect).replace(/\\/g, '\\\\').replace(/\=\=/g, '=').replace(/[^!><=]\=/g, (function(str) {
        return str.replace('=', '==');
      })).replace(/\&\&/g, '&').replace(/[^!><&]\&/g, (function(str) {
        return str.replace('&', '&&');
      })).replace(/\|\|/g, '|').replace(/[^!><|]\|/g, (function(str) {
        return str.replace('|', '||');
      })).replace(/^ー/, '-').replace(/([\u1-\u1000\s])(ー)/g, '$1-').replace(/(ー)([\u1-\u1000\s])/g, '-$2');
      if (!effect)
        return failed('不正なパラメータ指定検出');
      if (/\'/.test(effect))
        return failed('危険な記号の検出');
      effect = effect.replace(/[^+\-*/%><!=?:()&|\s]+/g, (function(str) {
        if (/^[0-9.]+$/.test(str))
          return str;
        if (/^"[^"]*"$/.test(str))
          return str;
        return ("Util.paramGet('" + str + "')");
      }));
      return eval(effect);
    }
    function loadSaveData() {
      return Util.co(function*() {
        var saves = yield Storage.getSaveDatas(1, 110);
        var opts = saves.map((function(save, i) {
          if (!save)
            var mark = '------------';
          else if (save.systemVersion !== Storage.VERSION) {
            save = null;
            mark = '--old data--';
          } else
            mark = save.mark || '(no name)';
          var name = i > 100 ? 'A' + (i - 100) : i;
          return {
            name: (name + "．" + mark),
            value: save,
            disabled: !save
          };
        }));
        var save = yield View.setChoiceWindow(opts, {
          sys: true,
          closeable: true,
          plus: true
        });
        if (save == '閉じる')
          return false;
        var $__3 = save,
            params = $__3.params,
            script = $__3.script,
            point = $__3.point,
            active = $__3.active,
            mark = $__3.mark;
        Util.paramClear();
        return Player.fetchScriptData((script + "#" + point)).then((function(script) {
          script.params = params;
          script.scenario = Data.scenarioName;
          script.active = active;
          script.mark = mark;
          return script;
        }));
      })();
    }
    function saveSaveData() {
      return Util.co(function*() {
        var saves = yield Storage.getSaveDatas(1, 100);
        var opts = saves.map((function(save, i) {
          if (!save)
            var mark = '----------';
          else if (save.systemVersion !== Storage.VERSION) {
            mark = '--old data--';
          } else
            mark = save.mark || '(no name)';
          var name = i;
          return {
            name: (name + "．" + mark),
            value: i
          };
        }));
        var no = yield View.setChoiceWindow(opts, {
          sys: true,
          closeable: true,
          plus: true
        });
        if (no == '閉じる')
          return false;
        var con = saves[no] ? yield View.setConfirmWindow('上書きする') : true;
        if (!con)
          return false;
        var params = {};
        Util.paramForEach((function(value, key) {
          return params[key] = value;
        }));
        var save = Data.current.point;
        save.scenarioVersion = Data.current.scenarioVersion;
        save.systemVersion = Storage.VERSION;
        yield Storage.setSaveData(no, save);
        yield Storage.setGlobalData(Data.current.setting);
        return true;
      })();
    }
    function deleteSaveData() {
      return Util.co(function*() {
        var con = yield View.setConfirmWindow('初期化する');
        if (!con)
          return false;
        yield Storage.deleteSaveDatas(true);
        yield Storage.setGlobalData({scenarioVersion: Data.current.scenarioVersion});
      })();
    }
    function init() {
      Data.phase = 'pause';
      document.title = 'openノベルプレーヤー';
      Util.paramClear(true);
      View.init();
    }
    function setSetting(scenario, setting) {
      return Util.co(function*() {
        document.title = ("【" + scenario + "】 - openノベルプレーヤー");
        Data.dataSaveName = (setting['データ保存名'] || [undefined])[0];
        Data.scenarioName = scenario;
        Data.settingData = setting;
        var gsave = yield Storage.getGlobalData();
        if (!gsave) {
          gsave = {};
          yield Storage.setGlobalData(gsave);
        }
        Data.current = {
          setting: gsave,
          active: {}
        };
        var gparams = gsave.params || {};
        Object.keys(gparams).forEach((function(key) {
          Util.paramSet(key, gparams[key], false);
        }));
        var v = Data.current.scenarioVersion = Util.toHalfWidth((setting['バージョン'] || ['0'])[0]);
        if (Data.current.setting.scenarioVersion != v || gsave.systemVersion != Storage.VERSION)
          return true;
      })();
    }
    function fetchSettingData(url) {
      return Util.loadText(url).then((function(text) {
        var setting = parseScript(text);
        var data = {};
        setting.forEach((function(ary) {
          data[ary[0]] = ary[1];
        }));
        return data;
      }));
    }
    function fetchScriptData(name, base) {
      var $__4;
      if (!name)
        return Promise.reject('子スクリプト名が不正');
      var $__3 = name.replace(/＃/g, '#').split('#'),
          name = $__3[0],
          hash = ($__4 = $__3[1]) === void 0 ? '' : $__4;
      if (!name) {
        if (!base)
          return Promise.reject('親スクリプト名が必要');
        name = base.replace(/＃/g, '#').split('#')[0];
      }
      return Util.toBlobScriptURL(name).then(Util.loadText).then(parseScript).then(flattenScript).then((function(script) {
        script.hash = hash;
        script.sname = name;
        return script;
      }));
    }
    READY.Player.ready({
      fetchSettingData: fetchSettingData,
      fetchScriptData: fetchScriptData,
      runScript: runScript,
      loadSaveData: loadSaveData,
      saveSaveData: saveSaveData,
      deleteSaveData: deleteSaveData,
      evalEffect: evalEffect,
      init: init,
      setSetting: setSetting,
      cacheScript: cacheScript
    });
  })).check();
  return {};
});
System.get("ES6/プレーヤー.js" + '');
System.registerModule("ES6/ゲーム.js", [], function() {
  "use strict";
  var __moduleName = "ES6/ゲーム.js";
  READY('Player', 'View', 'Sound').then((function($__0) {
    'use strict';
    var Util = $__0.Util;
    var message = ((function(_) {
      var abort = Util.NOP;
      return (function(text) {
        abort();
        View.nextPage('システム', {sys: true});
        var p = View.addSentence(text, {weight: 10});
        abort = p.abort;
        return p;
      });
    }))();
    var setup = Util.co(function*() {
      var $__2;
      Player.init();
      Sound.init();
      yield fadeIn();
      var setting = yield Player.fetchSettingData(Config.URL.ContentsSetting);
      message('再生する作品を選んでください');
      var scenario = yield new Promise((function(ok, ng) {
        var novels = setting['作品'];
        if (!novels || !novels.length)
          return message('再生できる作品がありません\n『作品/設定.txt』を確認してください');
        if (novels.length === 1)
          return ok(novels[0]);
        var opts = novels.reduce((function(opts, name) {
          opts.push({name: name});
          return opts;
        }), []);
        View.setChoiceWindow(opts, {
          sys: true,
          half: true
        }).then(ok, ng);
      }));
      var setting = yield Player.fetchSettingData(("作品/" + scenario + "/設定.txt"));
      var reqNew = yield Player.setSetting(scenario, setting);
      if (reqNew) {
        yield message('セーブデータの初期化が必要です');
        yield ($__2 = Player.deleteSaveData()).then.apply($__2, $traceurRuntime.spread(deleteAfter));
        return;
      }
      message('『' + scenario + '』開始メニュー');
      var script = yield new Promise((function(ok, ng) {
        var opts = ['初めから', '続きから', '任意の場所から', '初期化する'].map((function(name) {
          return ({name: name});
        }));
        return View.setChoiceWindow(opts, {
          sys: true,
          closeable: true,
          half: true
        }).then((function(kind) {
          var $__3;
          var base = setting['開始シナリオ'];
          if (!base || !(base = base[0]))
            return ng('設定項目「開始シナリオ」が見つかりません');
          switch (kind) {
            case '初めから':
              Player.fetchScriptData(base).then(ok, ng);
              break;
            case '続きから':
              View.mainMessageWindow.el.hidden = true;
              Player.loadSaveData().then(ok, ng);
              break;
            case '任意の場所から':
              var name = prompt('『<スクリプト名>』または『<スクリプト名>#<マーク名>』の形式で指定します。\n開始シナリオから始める場合は『#<マーク名>』の形式も使えます。');
              if (!name)
                return message('作品選択メニューに戻ります').delay(1000).then(resetup);
              Player.fetchScriptData(name, base).check().then(ok, (function(err) {
                message('指定されたファイルを読み込めません').delay(1000).then(resetup);
              }));
              break;
            case '初期化する':
              ($__3 = Player.deleteSaveData().check()).then.apply($__3, $traceurRuntime.spread(deleteAfter));
              break;
            case '閉じる':
              resetup();
              break;
            default:
              ng('想定外の機能が呼び出されました');
          }
        }));
      }));
      if (!script)
        return resetup();
      return load(script);
    });
    var deleteAfter = [(function(_) {
      return message('初期化しました').delay(1000).then(resetup);
    }), (function(err) {
      return message('消去中にエラーが発生しました').delay(1000).then(resetup);
    })];
    var load = Util.co(function*(script) {
      message('キャッシュ中…');
      yield Player.cacheScript(script);
      yield fadeOut();
      yield Player.runScript(script);
      View.init();
      Sound.init();
      yield message('再生が終了しました\n作品選択メニューに戻ります').delay(1000);
      return setup().catch(restart);
    });
    var restart = Util.co(function*(err) {
      LOG(err);
      if (typeof err !== 'string')
        err = '致命的なエラーが発生したため再生を継続できません';
      View.init();
      yield message(err + '\n作品選択メニューに戻ります').delay(1000);
      return resetup();
    });
    var fading = false;
    function fadeIn() {
      fading = true;
      return Util.co(function*() {
        View.fadeIn().through((function(_) {
          fading = false;
        }));
        yield Util.toBlobURL('画像', '背景', 'png', true).then((function(url) {
          return View.setBGImage({url: url}, {sys: true});
        }));
      })();
    }
    function fadeOut() {
      fading = true;
      return Util.co(function*() {
        yield View.fadeOut();
        View.init();
      })().through((function(_) {
        fading = false;
      }));
    }
    function resetup() {
      if (fading)
        return LOG('システムフェード中です');
      fadeOut().through(setup).catch(restart);
    }
    var start = Util.co(function*() {
      var startSE = new Sound.SE('起動', {sys: true});
      View.init();
      yield Promise.all([setSysBG(), Promise.race([Promise.all([startSE.play(), View.addSentence('openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Config.systemVersion, {weight: 0}).delay(3000)]), View.on('go')]).through((function(_) {
        return startSE.fadeout();
      }))]).check();
      return resetup();
    });
    function setSysBG() {
      return Util.toBlobURL('画像', '背景', 'png', true);
    }
    start().check();
    READY.Game.ready({
      reset: function() {
        resetup();
      },
      loadSaveData: Util.co(function*() {
        var $__2;
        var script = yield Player.loadSaveData();
        if (!script)
          return;
        var scenario = Data.scenarioName;
        var setting = Data.settingData;
        Player.init();
        Player.setSetting(scenario, setting);
        var reqNew = yield Player.setSetting(scenario, setting);
        if (reqNew) {
          yield message('セーブデータの初期化が必要です');
          yield ($__2 = Player.deleteSaveData()).then.apply($__2, $traceurRuntime.spread(deleteAfter));
          return;
        }
        load(script);
      })
    });
  })).check();
  return {};
});
System.get("ES6/ゲーム.js" + '');
