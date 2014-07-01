System.register("ES6/ヘルパー", [], function() {
  "use strict";
  var __moduleName = "ES6/ヘルパー";
  ;
  ((function(_) {
    'use strict';
    var global = (1, eval)('this');
    var Promise = global.Promise;
    var LOG = console.log.bind(console);
    var Data = {
      debug: true,
      URL: {
        ContentsSetting: 'データ/作品.txt',
        EngineSetting: 'エンジン/エンジン定義.txt'
      },
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
      co: function(func) {
        return function() {
          var defer = Promise.defer();
          var iter = func.apply(this, arguments);
          var loop = (function(val) {
            try {
              var $__2 = $traceurRuntime.assertObject(iter.next(val)),
                  value = $__2.value,
                  done = $__2.done;
              value = Promise.resolve(value);
              if (done)
                value.then(defer.resolve, defer.reject);
              else
                value.then(loop, defer.reject);
            } catch (err) {
              LOG(err);
              defer.reject(err);
            }
          });
          loop();
          return defer.promise;
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
        var root = sys ? 'エンジン' : 'データ';
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
          xhr.onload = (function(_) {
            return ok(xhr.response);
          });
          xhr.onerror = (function(_) {
            return ng(new Error(("ファイルURL『" + url + "』のロードに失敗")));
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
              $__1 = 0; $__1 < arguments.length; $__1++)
            args[$__1] = arguments[$__1];
          var len = args.length;
          if (len === 0)
            return $p;
          var $__2 = $traceurRuntime.assertObject(args),
              arg0 = $__2[0],
              arg1 = $__2[1],
              arg2 = $__2[2];
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
        return $Promise.all(types.map((function(type) {
          if (!(type in READY))
            throw 'illegal READY type "' + type + '"';
          return READY[type];
        }))).then((function(_) {
          return Util.overrides;
        }));
      }
      ;
      ['DOM', 'Player', 'View', 'Storage', 'Sound', 'Game'].forEach((function(type) {
        global[type] = null;
        var defer = $Promise.defer();
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
      Util: Util,
      LOG: LOG,
      Data: Data,
      BitArray: BitArray
    });
  }))();
  return {};
});
System.get("ES6/ヘルパー" + '');
System.register("ES6/ストレージ", [], function() {
  "use strict";
  var __moduleName = "ES6/ストレージ";
  READY().then((function(_) {
    'use strict';
    var db,
        scenario,
        VERSION = 6;
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
        if (ov == 0)
          alert('※初めに※\nopenノベルプレーヤーでは Chrome　Firefox　Opera　の最新バージョンでの利用を推奨しています。');
        if (ov <= 7)
          if (confirm('全セーブデータ及び全設定の初期化が必要です。')) {
            ;
            [].slice.call(db.objectStoreNames).forEach((function(n) {
              return db.deleteObjectStore(n);
            }));
            db.createObjectStore('setting');
            db.createObjectStore('savedata');
            alert('完了しました。');
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
System.get("ES6/ストレージ" + '');
System.register("ES6/ビュー", [], function() {
  "use strict";
  var __moduleName = "ES6/ビュー";
  READY('Storage', 'Player', 'DOM', 'Sound').then((function($__5) {
    'use strict';
    var Util = $traceurRuntime.assertObject($__5).Util;
    var View = null;
    var clickSE = new Sound('sysSE', '選択');
    var focusSE = new Sound('sysSE', 'フォーカス');
    var EP = Element.prototype;
    Util.setDefaults(EP, {
      on: EP.addEventListener,
      requestFullscreen: EP.webkitRequestFullscreen || EP.mozRequestFullScreen,
      append: EP.appendChild,
      removeChildren: function() {
        var ch = this.childNodes,
            len = ch.length;
        for (var i = len - 1; i >= 0; --i)
          ch[i].remove();
        return this;
      },
      setStyles: function(styles) {
        var $__3 = this;
        styles = styles || {};
        Object.keys(styles).forEach((function(key) {
          if (styles[key] != null)
            $__3.style[key] = styles[key];
        }), this);
        return this;
      }
    });
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
        el_player = new DOM('div'),
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
      height: '2em',
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
      var e = !Sound.soundEnabled;
      Sound.soundEnabled = e;
      Storage.setSetting('soundEnabled', e).check();
      if (Sound.soundAvailability)
        View.showNotice(("サウンドを" + (e ? '有' : '無') + "効に設定しました"));
      else
        View.showNotice(("サウンドを" + (e ? '有' : '無') + "効に設定しました") + '\nただしお使いの環境では音が出せません');
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
    function cancelEvent(evt) {
      if (!(evt instanceof Event))
        return;
      evt.preventDefault();
      evt.stopImmediatePropagation();
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
    var METHODS = {};
    METHODS = {COMMON: {
        clean: function() {
          this.changeMode($mode);
        },
        init: function(opt) {
          this.initDisplay(opt.style || {});
        },
        changeMode: function(type, opt) {
          var type = type.toUpperCase();
          opt = opt || {};
          if (!(type in METHODS))
            throw 'illegal ViewContext mode type';
          $mode = type;
          global.View = View = {__proto__: METHODS[type]};
          View.init(opt);
        },
        changeModeIfNeeded: function(type, opt) {
          if ($mode != type)
            this.changeMode(type, opt);
        },
        on: function(kind, onFulfilled, onRejected) {
          var rehook = (function(_) {
            return View.on(kind, onFulfilled, onRejected);
          });
          return new Promise((function(resolve) {
            return hookInput(kind, resolve);
          })).then((function(_) {
            return rehook;
          })).then(onFulfilled).check().catch(onRejected);
        },
        initDisplay: function(opt) {
          Util.setDefaults(opt, {
            background: 'black',
            margin: 'auto',
            position: 'relative',
            hidth: '100%',
            height: '100%',
            overflow: 'hidden'
          });
          hookClear();
          stopAuto();
          this.windows = {};
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
          Promise.resolve().delay(100).then(defer.resolve);
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
        }
      }};
    METHODS = {
      TEST: {
        __proto__: METHODS.COMMON,
        initDisplay: function(opt) {
          Util.setDefaults(opt, {
            fontSize: 'calc(100% * 2 / 3)',
            color: 'white'
          });
          this.__proto__.__proto__.initDisplay(opt);
          var el = new DOM('div', {padding: '10px'});
          var el_body = new DOM('pre');
          this.el_test = el_body;
          el_context.append(el).append(el_body);
        },
        print: function(text, opt) {
          this.el_test.textContent += text;
        }
      },
      NOVEL: {
        __proto__: METHODS.COMMON,
        initDisplay: function(opt) {
          var $__3 = this;
          Util.setDefaults(opt, {
            color: 'rgba(255,255,255,0.9)',
            textShadow: 'rgba(0,0,0,0.9) 0.1em 0.1em 0.1em',
            overflow: 'hidden'
          });
          this.__proto__.__proto__.initDisplay(opt);
          this.mainMessageWindow = this.addMessageWindow();
          this.imageFrame = this.addImageFrame();
          this.logs = [];
          View.on('menu').then((function(_) {
            return $__3.showMenu();
          })).check();
          View.on('Uwheel').then((function(_) {
            return View.showLog();
          }));
        },
        messageWindowProto: {
          nextPage: function(name) {
            var $__7,
                $__8;
            var $__6 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
                sys = ($__7 = $__6.sys) === void 0 ? false : $__7,
                visited = ($__8 = $__6.visited) === void 0 ? false : $__8;
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
            var $__8,
                $__6;
            var $__7 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
                weight = ($__8 = $__7.weight) === void 0 ? 25 : $__8,
                visited = ($__6 = $__7.visited) === void 0 ? false : $__6;
            text += '\n';
            var length = text.length;
            var at = 0,
                nl = 0;
            var el = this.el_body;
            var $__7 = [false, false],
                aborted = $__7[0],
                cancelled = $__7[1];
            var $__7 = [(function(_) {
              return aborted = true;
            }), (function(_) {
              return cancelled = true;
            })],
                abort = $__7[0],
                cancel = $__7[1];
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
          var opt = arguments[0] !== (void 0) ? arguments[0] : {};
          Util.setDefaults(opt, {
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
          });
          var el = new DOM('div', opt);
          this.windows.message = el;
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
            __proto__: this.messageWindowProto,
            el: el,
            el_title: el_title,
            el_body: el_body
          };
          return mw;
        },
        addImageFrame: function() {
          var opt = arguments[0] !== (void 0) ? arguments[0] : {};
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
          var $__6;
          var $__8 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
              sys = ($__6 = $__8.sys) === void 0 ? true : $__6;
          return View.setChoiceWindow([{
            name: name,
            value: true
          }, {
            name: 'キャンセル',
            value: false
          }], {sys: sys});
        },
        setChoiceWindow: function(opts) {
          var $__8,
              $__7,
              $__9,
              $__10;
          var $__6 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
              sys = ($__8 = $__6.sys) === void 0 ? false : $__8,
              closeable = ($__7 = $__6.closeable) === void 0 ? false : $__7,
              half = ($__9 = $__6.half) === void 0 ? false : $__9,
              plus = ($__10 = $__6.plus) === void 0 ? false : $__10;
          var defer = Promise.defer();
          var removed = false;
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
            overflowY: opts.length > (plus ? 4 : 3) * (half ? 2 : 1) ? 'scroll' : 'hidden',
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
          opts.forEach(function(opt, i) {
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
          }, this);
          function close(evt, val) {
            cancelEvent(evt);
            removed = true;
            defer.resolve(val);
            if (!sys)
              delete View.windows.choice;
            else
              delete View.windows.choiceBack;
            cw.remove();
            if (img)
              img.remove();
          }
          if (half) {
            View.on('up', (function(rehook) {
              return focusmove(rehook, -2);
            }));
            View.on('down', (function(rehook) {
              return focusmove(rehook, +2);
            }));
            View.on('left', (function(rehook) {
              return focusmove(rehook, -1);
            }));
            View.on('right', (function(rehook) {
              return focusmove(rehook, +1);
            }));
          } else {
            View.on('up', (function(rehook) {
              return focusmove(rehook, -1);
            }));
            View.on('down', (function(rehook) {
              return focusmove(rehook, +1);
            }));
            View.on('left', (function(rehook) {
              return focusmove(rehook, -10);
            }));
            View.on('right', (function(rehook) {
              return focusmove(rehook, +10);
            }));
          }
          View.on('enter', focusenter);
          function focusmove(rehook, n) {
            if (removed)
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
            if (removed)
              return;
            if (focusindex >= 0)
              return bts[focusindex].click();
            Promise.delay(100).then(rehook);
          }
          if (closeable) {
            var img = new DOM('img', {
              position: 'absolute',
              right: '2%',
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
              })).check();
            } else {
              img.src = 'エンジン/画像/閉じるボタン.svg';
            }
            img.onmousedown = (function(evt) {
              close(evt, '閉じる');
            });
            el_context.append(img);
          }
          el_context.append(cw);
          return defer.promise;
        },
        setBGImage: function(opt) {
          var defer = Promise.defer();
          var $__8 = $traceurRuntime.assertObject(opt),
              url = $__8.url,
              sys = $__8.sys;
          var fr = View.imageFrame;
          if (url) {
            var img = new Image;
            img.onload = (function(_) {
              fr.setStyles({
                backgroundImage: ("url(" + url + ")"),
                backgroundSize: 'cover'
              });
              defer.resolve();
            });
            img.src = url;
            if (!sys)
              Data.current.active.BGImage = opt;
          } else {
            fr.setStyles({
              backgroundImage: 'none',
              backgroundSize: 'cover'
            });
            defer.resolve();
          }
          return defer.promise;
        },
        setFDImages: function(ary) {
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
            fr.removeChildren();
            els.forEach((function(el) {
              return fr.append(el);
            }));
            defer.resolve();
          }));
          Data.current.active.FDImages = ary;
          return defer.promise;
        },
        prepareFade: function() {
          if (View.fake)
            return Promise.reject('２重にエフェクトの準備をしようとした');
          var fr = View.imageFrame;
          var fake = View.fake = fr.cloneNode(true);
          el_context.append(fake);
          Data.saveDisabled = true;
          return Promise.resolve();
        },
        fade: function() {
          var $__7,
              $__9;
          var $__8 = $traceurRuntime.assertObject(arguments[0] !== (void 0) ? arguments[0] : {}),
              msec = ($__7 = $__8.msec) === void 0 ? 1000 : $__7,
              visited = ($__9 = $__8.visited) === void 0 ? false : $__9;
          if (!View.fake)
            return Promise.reject('このエフェクトには事前準備が必要');
          var fr = View.imageFrame,
              fake = View.fake;
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
            fake.style.opacity = 1 - per;
          })).then((function(_) {
            fake.remove();
            delete View.fake;
            Data.saveDisabled = false;
          }));
        },
        flash: function() {
          var $__9,
              $__8,
              $__10;
          var $__7 = $traceurRuntime.assertObject(arguments[0] !== (void 0) ? arguments[0] : {}),
              msec = ($__9 = $__7.msec) === void 0 ? 300 : $__9,
              color = ($__8 = $__7.color) === void 0 ? 'white' : $__8,
              visited = ($__10 = $__7.visited) === void 0 ? false : $__10;
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
          this.mainMessageWindow.nextPage(name, opt);
        },
        addSentence: function(text, opt) {
          return this.mainMessageWindow.addSentence(text, opt);
        },
        showMenu: function() {
          var $__3 = this;
          if (Data.phase != 'play' || View.menuIndex > 0)
            return View.on('Rclick').then((function(_) {
              return View.showMenu();
            }));
          View.menuIndex = (View.menuIndex || 0) + 1;
          eventBlock();
          View.on('menu').then((function(_) {
            if ($__3.windows.choiceBack)
              $__3.windows.choiceBack.remove();
            close();
          })).check();
          Object.keys(View.windows).forEach((function(key) {
            var el = View.windows[key];
            el.hidden = !el.hidden;
          }));
          var ary = ['セーブ', 'ロード', 'ウィンドウ消去', 'ログ表示', 'オート', '既読スキップ', 'リセット'].map((function(name) {
            return ({name: name});
          }));
          if (Data.saveDisabled)
            ary[0].disabled = true;
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
                View.on('*', (function(_) {
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
                  if (f)
                    Game.reset();
                  else
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
            Object.keys(View.windows).forEach((function(key) {
              var el = View.windows[key];
              el.hidden = !el.hidden;
            }));
          }
        },
        showLog: function(text) {
          if (Data.phase != 'play' || this.windows.log)
            return;
          eventBlock();
          Object.keys(View.windows).forEach((function(key) {
            var el = View.windows[key];
            el.hidden = !el.hidden;
          }));
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
            right: '2%',
            top: '0%',
            width: '3em',
            height: '3em',
            opacity: '0.75',
            zIndex: '3000'
          });
          if ($isWebkit) {
            Util.toBlobSysPartsURL('閉じるボタン').then((function(url) {
              img.src = url;
            })).check();
          } else {
            img.src = 'エンジン/画像/閉じるボタン.svg';
          }
          el_context.append(img);
          function close(evt) {
            cancelEvent(evt);
            img.remove();
            if (View.windows.log) {
              View.windows.log.remove();
              delete View.windows.log;
            }
            Object.keys(View.windows).forEach((function(key) {
              var el = View.windows[key];
              el.hidden = !el.hidden;
            }));
            eventAllow();
            View.on('Uwheel').then((function(_) {
              return View.showLog();
            }));
          }
          img.onmousedown = close;
          View.on('menu').then(close);
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
          this.windows.log = el;
          el_context.append(el);
          el.scrollTop = 1 << 15 - 1;
        }
      }
    };
    var $__9 = $traceurRuntime.assertObject(((function(_) {
      var enabled = false;
      var delay = 0;
      var wait = true;
      return {
        setAuto: function(p) {
          var $__10;
          var $__8 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
              visited = ($__10 = $__8.visited) === void 0 ? false : $__10;
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
    }))()),
        setAuto = $__9.setAuto,
        startAuto = $__9.startAuto,
        stopAuto = $__9.stopAuto,
        startSkip = $__9.startSkip;
    var $__9 = $traceurRuntime.assertObject(((function(_) {
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
      return {
        hookInput: function(kind, resolve) {
          var hook = toHook(kind);
          hook.resolve = resolve;
          hook.blocked = 0;
          hooks.push(hook);
        },
        hookClear: function() {
          hooks.length = 0;
          eventSysOnly(false);
        },
        eventBlock: function() {
          hooks.forEach((function(hook) {
            return ++hook.blocked;
          }));
        },
        eventAllow: function() {
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
    }))()),
        hookInput = $__9.hookInput,
        hookClear = $__9.hookClear,
        eventBlock = $__9.eventBlock,
        eventAllow = $__9.eventAllow,
        eventFire = $__9.eventFire,
        eventSysOnly = $__9.eventSysOnly;
    function vibrate() {
      var $__11;
      for (var args = [],
          $__4 = 0; $__4 < arguments.length; $__4++)
        args[$__4] = arguments[$__4];
      if (typeof navigator.vibrate == 'function')
        ($__11 = navigator).vibrate.apply($__11, $traceurRuntime.spread(args));
    }
    window.onbeforeunload = (function(_) {
      if (Data.phase == 'play')
        return 'セーブされていないデータは失われます。';
    });
    var $full = false;
    var $ratio = 16 / 9;
    var $mode = '';
    var width = document.body.clientWidth * devicePixelRatio;
    var $scale = (width / $ratio >= 540 ? 540 : width / $ratio) / devicePixelRatio;
    METHODS.TEST.changeMode('TEST');
    var p = adjustScale($scale, $ratio);
    p.then((function(_) {
      return READY.View.ready(null);
    }));
  })).check();
  return {};
});
System.get("ES6/ビュー" + '');
System.register("ES6/サウンド", [], function() {
  "use strict";
  var __moduleName = "ES6/サウンド";
  READY('Storage', 'Player').then((function($__14) {
    'use strict';
    var Util = $traceurRuntime.assertObject($__14).Util;
    var init = Util.co($traceurRuntime.initGeneratorFunction(function $__16() {
      var soundEnabled;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return Storage.getSetting('soundEnabled', false);
            case 2:
              soundEnabled = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = setup({soundEnabled: soundEnabled});
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__16, this);
    }));
    var setup = (function(config) {
      var soundEnabled = $traceurRuntime.assertObject(config).soundEnabled;
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
        off: function() {
          var t0 = ctx.currentTime,
              gain = this.gain.gain;
          gain.cancelScheduledValues(t0);
          gain.value = 0;
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
        var gainBGM = ctx.createGain();
        gainBGM.connect(gainMaster);
        var rootVolume = new GainChanger(gainRoot);
        document.addEventListener('visibilitychange', (function(_) {
          if (document.hidden)
            rootVolume.off();
          else
            rootVolume.up();
        }));
        if (document.hidden)
          rootVolume.off();
      }
      function canplay() {
        return ctx && soundAvailability && Sound.soundEnabled;
      }
      var Sound = function Sound(kind, name) {
        if (!kind)
          throw 'タイプが未指定';
        if (!name)
          throw '名前が未指定';
        if (!soundAvailability)
          return;
        switch (kind) {
          case 'sysSE':
            var url = ("エンジン/効果音/" + name + ".ogg");
            var des = gainSysSE;
            var type = 'SE';
            break;
          default:
            throw ("想定外のタイプ『" + kind + "』");
        }
        var gain = ctx.createGain();
        gain.connect(des);
        this.readyState = 0;
        this.type = type;
        this.url = url;
        this.buf = null;
        this.src = null;
        this.gain = gain;
        this.prepare();
      };
      ($traceurRuntime.createClass)(Sound, {
        load: function() {
          var $__12 = this;
          var url = this.url;
          var buf = bufferMap.get(url);
          if (buf)
            return Promise.resolve(buf);
          return Util.load(url, 'arraybuffer').then((function(buf) {
            bufferMap.set(url, buf);
            $__12.buf = buf;
          }));
        },
        prepare: function() {
          var $__12 = this;
          var buf = this.buf;
          if (!buf)
            return this.load().then((function(_) {
              return $__12.prepare();
            }));
          return new Promise((function(ok, ng) {
            ctx.decodeAudioData(buf.slice(), (function(buf) {
              var src = ctx.createBufferSource();
              src.buffer = buf;
              src.connect($__12.gain);
              $__12.src = src;
              ok();
            }), ng);
          }));
        },
        play: function() {
          var $__12 = this;
          if (!canplay())
            return Promise.resolve(null);
          var src = this.src;
          if (!src)
            return this.prepare().then((function(_) {
              return $__12.play();
            }));
          src.start();
          this.src = null;
          this.prepare();
          return new Promise((function(ok) {
            src.onended = ok;
          }));
        },
        fadeout: function() {
          var duration = arguments[0] !== (void 0) ? arguments[0] : 0.5;
          if (!canplay())
            return;
          var t0 = ctx.currentTime,
              gain = this.gain.gain;
          gain.cancelScheduledValues(t0);
          gain.setValueAtTime(gain.value, t0);
          gain.linearRampToValueAtTime(0, t0 + duration);
        }
      }, {});
      Object.assign(Sound, {
        soundEnabled: soundEnabled,
        soundAvailability: soundAvailability,
        CTX: ctx,
        gainRoot: gainRoot,
        gainMaster: gainMaster
      });
      READY.Sound.ready(Sound);
    });
    init().check();
  })).check();
  return {};
});
System.get("ES6/サウンド" + '');
System.register("ES6/プレーヤー", [], function() {
  "use strict";
  var __moduleName = "ES6/プレーヤー";
  READY().then((function($__18) {
    'use strict';
    var Util = $traceurRuntime.assertObject($__18).Util;
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
          var $__19 = $traceurRuntime.assertObject(prog),
              act = $__19[0],
              data = $__19[1];
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
              buf[cp] = data.map((function($__19) {
                var $__20 = $traceurRuntime.assertObject($__19),
                    lab = $__20[0],
                    val = $__20[1];
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
              append(['背景', name, 'jpg']);
              break;
            case '立絵':
            case '立ち絵':
              data.forEach((function(ary) {
                if (Util.isNoneType(ary))
                  return;
                var $__19 = $traceurRuntime.assertObject(ary),
                    position = $__19[0],
                    names = $__19[1];
                if (!position)
                  return;
                if (!names)
                  return;
                var name = names[0];
                append(['立ち絵', name, 'png']);
              }));
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
                var $__20;
                if (!to)
                  return;
                var name = to,
                    base = sname;
                var $__19 = $traceurRuntime.assertObject(name.replace(/＃/g, '#').split('#')),
                    name = $__19[0],
                    mark = ($__20 = $__19[1]) === void 0 ? '' : $__20;
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
        }
      }
      if (caching == 0)
        defer.resolve();
      return defer.promise;
    }
    function runScript(script) {
      var sname = arguments[1] !== (void 0) ? arguments[1] : script.sname;
      var masterComp = arguments[2];
      var $__17;
      if (!sname)
        LOG('!!!sname');
      sname = sname.split('#')[0];
      View.changeModeIfNeeded('NOVEL');
      Data.phase = 'play';
      var run = Promise.defer();
      if (!masterComp)
        masterComp = run.resolve;
      var $__20 = $traceurRuntime.assertObject(script),
          mark = $__20.mark,
          hash = $__20.hash,
          params = $__20.params,
          scenario = $__20.scenario,
          active = $__20.active;
      if (mark)
        Data.current.mark = mark;
      var searching = !!hash;
      if (params)
        Object.keys(params).forEach((function(name) {
          return Util.paramSet(name, params[name]);
        }));
      script = copyObject(script);
      var gsave = Data.current.setting;
      var visited = $traceurRuntime.assertObject(gsave).visited;
      if (!visited)
        gsave.visited = visited = {};
      var vBA = visited[sname];
      if (!vBA)
        visited[sname] = vBA = BitArray.create(script.length);
      function runChildScript(script) {
        return runScript(script, undefined, masterComp);
      }
      var actHandlers = ($__17 = {}, Object.defineProperty($__17, "会話", {
        value: function(data, done, failed, $__20) {
          var visited = $traceurRuntime.assertObject($__20).visited;
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
      }), Object.defineProperty($__17, "背景", {
        value: function(data, done, failed) {
          var name = replaceEffect(data[0]);
          Util.toBlobURL('背景', name, 'jpg').then((function(url) {
            return View.setBGImage({
              name: name,
              url: url
            });
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "立絵", {
        value: otherName('立ち絵'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "立ち絵", {
        value: function(data, done, failed) {
          Promise.all(data.reduce((function(base, ary) {
            var $__19,
                $__21;
            if (!base)
              return;
            if (Util.isNoneType(ary))
              return base;
            var $__20 = $traceurRuntime.assertObject(ary),
                position = $__20[0],
                names = $__20[1];
            if (!position)
              return failed('不正な位置検出');
            if (!names)
              return failed('不正な画像名検出');
            position = replaceEffect(position);
            var name = replaceEffect(names[0]);
            var a_type = ['left', 'right']['左右'.indexOf(position)];
            var v_type = 'top';
            var $__20 = [0, 0],
                a_per = $__20[0],
                v_per = $__20[1];
            var height = null;
            if (!a_type) {
              var pos = Util.toHalfWidth(position).match(/[+\-0-9.]+/g);
              if (!pos)
                return failed('不正な位置検出');
              var $__20 = $traceurRuntime.assertObject(pos),
                  a_pos = $__20[0],
                  v_pos = ($__19 = $__20[1]) === void 0 ? '0' : $__19,
                  height = ($__21 = $__20[2]) === void 0 ? null : $__21;
              a_per = Math.abs(+a_pos);
              v_per = Math.abs(+v_pos);
              a_type = a_pos.match('-') ? 'right' : 'left';
              v_type = v_pos.match('-') ? 'bottom' : 'top';
              height = Util.toSize(height);
            }
            base.push(Util.toBlobURL('立ち絵', name, 'png').then((function(url) {
              var $__17;
              return (($__17 = {}, Object.defineProperty($__17, "name", {
                value: name,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__17, "url", {
                value: url,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__17, "height", {
                value: height,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__17, a_type, {
                value: (a_per + "%"),
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__17, v_type, {
                value: (v_per + "%"),
                configurable: true,
                enumerable: true,
                writable: true
              }), $__17));
            })));
            return base;
          }), [])).then((function(opt) {
            return View.setFDImages(opt);
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "効果", {
        value: otherName('エフェクト'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "エフェクト", {
        value: function(data, done, failed, $__19) {
          var visited = $traceurRuntime.assertObject($__19).visited;
          data.forEach((function(prog) {
            if (prog == 'フェード準備')
              return View.prepareFade().then(done, failed);
            var act = prog[0],
                opt = Util.toHalfWidth(replaceEffect(prog[1][0])).split(/\s+/);
            var msec = opt[0].match(/[\d.]+/) * 1000;
            switch (act) {
              case 'フェード':
                return View.fade({
                  msec: msec,
                  visited: visited
                }).then(done, failed);
                break;
              case 'フラッシュ':
                var color = opt[1];
                return View.flash({
                  msec: msec,
                  color: color,
                  visited: visited
                }).then(done, failed);
                break;
              default:
                failed('想定外のエフェクトタイプ');
            }
          }));
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "選択", {
        value: otherName('選択肢'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "選択肢", {
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
      }), Object.defineProperty($__17, "ジャンプ", {
        value: function(data, done, failed) {
          var to = replaceEffect(data[0]);
          fetchScriptData(to, sname).then((function(script) {
            return runChildScript(script);
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "変数", {
        value: otherName('パラメータ'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "パラメーター", {
        value: otherName('パラメータ'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "パラメータ", {
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
      }), Object.defineProperty($__17, "入力", {
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
      }), Object.defineProperty($__17, "繰返", {
        value: otherName('繰り返し'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "繰返し", {
        value: otherName('繰り返し'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "繰り返し", {
        value: function(data, done, failed) {
          var q = data[0];
          data = data.slice(1);
          if (!data.some((function($__19) {
            var $__21 = $traceurRuntime.assertObject($__19),
                effect = $__21[0],
                acts = $__21[1];
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
      }), Object.defineProperty($__17, "分岐", {
        value: function(data, done, failed) {
          data.some((function($__19) {
            var $__21 = $traceurRuntime.assertObject($__19),
                effect = $__21[0],
                acts = $__21[1];
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
      }), Object.defineProperty($__17, "マーク", {
        value: function(data, done, failed) {
          Data.current.mark = data[0];
          autosave(true);
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__17, "スクリプト", {
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
      }), Object.defineProperty($__17, "コメント", {
        value: function(data, done, failed) {
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), $__17);
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
          saves[101] = Data.current.point;
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
    function print(message) {
      if (!View.print)
        View.changeMode('TEST');
      View.print(message);
    }
    function loadSaveData() {
      return Util.co($traceurRuntime.initGeneratorFunction(function $__22() {
        var saves,
            opts,
            save,
            $__19,
            params,
            script,
            point,
            active,
            mark;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return Storage.getSaveDatas(1, 110);
              case 2:
                saves = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                opts = saves.map((function(save, i) {
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
                $ctx.state = 15;
                break;
              case 15:
                $ctx.state = 6;
                return View.setChoiceWindow(opts, {
                  sys: true,
                  closeable: true,
                  plus: true
                });
              case 6:
                save = $ctx.sent;
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = (save == '閉じる') ? 9 : 10;
                break;
              case 9:
                $ctx.returnValue = false;
                $ctx.state = -2;
                break;
              case 10:
                $__19 = $traceurRuntime.assertObject(save), params = $__19.params, script = $__19.script, point = $__19.point, active = $__19.active, mark = $__19.mark;
                Util.paramClear();
                $ctx.state = 17;
                break;
              case 17:
                $ctx.returnValue = Player.fetchScriptData((script + "#" + point)).then((function(script) {
                  script.params = params;
                  script.scenario = Data.scenarioName;
                  script.active = active;
                  script.mark = mark;
                  return script;
                }));
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__22, this);
      }))();
    }
    function saveSaveData() {
      return Util.co($traceurRuntime.initGeneratorFunction(function $__22() {
        var saves,
            opts,
            no,
            con,
            params,
            save,
            $__23,
            $__24,
            $__25,
            $__26,
            $__27;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return Storage.getSaveDatas(1, 100);
              case 2:
                saves = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                opts = saves.map((function(save, i) {
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
                $ctx.state = 41;
                break;
              case 41:
                $ctx.state = 6;
                return View.setChoiceWindow(opts, {
                  sys: true,
                  closeable: true,
                  plus: true
                });
              case 6:
                no = $ctx.sent;
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = (no == '閉じる') ? 9 : 10;
                break;
              case 9:
                $ctx.returnValue = false;
                $ctx.state = -2;
                break;
              case 10:
                $__23 = saves[no];
                $ctx.state = 24;
                break;
              case 24:
                $ctx.state = ($__23) ? 16 : 20;
                break;
              case 16:
                $__24 = View.setConfirmWindow;
                $__25 = $__24.call(View, '上書きする');
                $ctx.state = 17;
                break;
              case 17:
                $ctx.state = 13;
                return $__25;
              case 13:
                $__26 = $ctx.sent;
                $ctx.state = 15;
                break;
              case 15:
                $__27 = $__26;
                $ctx.state = 19;
                break;
              case 20:
                $__27 = true;
                $ctx.state = 19;
                break;
              case 19:
                con = $__27;
                $ctx.state = 26;
                break;
              case 26:
                $ctx.state = (!con) ? 27 : 28;
                break;
              case 27:
                $ctx.returnValue = false;
                $ctx.state = -2;
                break;
              case 28:
                params = {};
                Util.paramForEach((function(value, key) {
                  return params[key] = value;
                }));
                save = Data.current.point;
                save.scenarioVersion = Data.current.scenarioVersion;
                save.systemVersion = Storage.VERSION;
                $ctx.state = 43;
                break;
              case 43:
                $ctx.state = 31;
                return Storage.setSaveData(no, save);
              case 31:
                $ctx.maybeThrow();
                $ctx.state = 33;
                break;
              case 33:
                $ctx.state = 35;
                return Storage.setGlobalData(Data.current.setting);
              case 35:
                $ctx.maybeThrow();
                $ctx.state = 37;
                break;
              case 37:
                $ctx.returnValue = true;
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__22, this);
      }))();
    }
    function deleteSaveData() {
      return Util.co($traceurRuntime.initGeneratorFunction(function $__22() {
        var con;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return View.setConfirmWindow('初期化する');
              case 2:
                con = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                $ctx.state = (!con) ? 5 : 6;
                break;
              case 5:
                $ctx.returnValue = false;
                $ctx.state = -2;
                break;
              case 6:
                $ctx.state = 9;
                return Storage.deleteSaveDatas(true);
              case 9:
                $ctx.maybeThrow();
                $ctx.state = 11;
                break;
              case 11:
                $ctx.state = 13;
                return Storage.setGlobalData({scenarioVersion: Data.current.scenarioVersion});
              case 13:
                $ctx.maybeThrow();
                $ctx.state = 15;
                break;
              case 15:
                $ctx.returnValue = true;
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__22, this);
      }))();
    }
    function init() {
      Data.phase = 'pause';
      document.title = 'openノベルプレーヤー';
      Util.paramClear(true);
      View.clean();
    }
    function setSetting(scenario, setting) {
      return Util.co($traceurRuntime.initGeneratorFunction(function $__22() {
        var gsave,
            gparams,
            v;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                document.title = ("【" + scenario + "】 - openノベルプレーヤー");
                Data.dataSaveName = (setting['データ保存名'] || [undefined])[0];
                Data.scenarioName = scenario;
                Data.settingData = setting;
                $ctx.state = 16;
                break;
              case 16:
                $ctx.state = 2;
                return Storage.getGlobalData();
              case 2:
                gsave = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                $ctx.state = (!gsave) ? 9 : 8;
                break;
              case 9:
                gsave = {};
                $ctx.state = 10;
                break;
              case 10:
                $ctx.state = 6;
                return Storage.setGlobalData(gsave);
              case 6:
                $ctx.maybeThrow();
                $ctx.state = 8;
                break;
              case 8:
                Data.current = {
                  setting: gsave,
                  active: {}
                };
                gparams = gsave.params || {};
                Object.keys(gparams).forEach((function(key) {
                  Util.paramSet(key, gparams[key], false);
                }));
                v = Data.current.scenarioVersion = Util.toHalfWidth((setting['バージョン'] || ['0'])[0]);
                $ctx.state = 18;
                break;
              case 18:
                $ctx.state = (Data.current.setting.scenarioVersion != v || gsave.systemVersion != Storage.VERSION) ? 12 : -2;
                break;
              case 12:
                $ctx.returnValue = true;
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__22, this);
      }))();
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
      var $__21;
      if (!name)
        return Promise.reject('子スクリプト名が不正');
      var $__19 = $traceurRuntime.assertObject(name.replace(/＃/g, '#').split('#')),
          name = $__19[0],
          hash = ($__21 = $__19[1]) === void 0 ? '' : $__21;
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
      print: print,
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
System.get("ES6/プレーヤー" + '');
System.register("ES6/ゲーム", [], function() {
  "use strict";
  var __moduleName = "ES6/ゲーム";
  READY('Player', 'View', 'Sound').then((function($__28) {
    'use strict';
    var Util = $traceurRuntime.assertObject($__28).Util;
    var message = ((function(_) {
      var abort = Util.NOP;
      return (function(text) {
        abort();
        View.changeModeIfNeeded('NOVEL');
        View.nextPage('システム', {sys: true});
        var p = View.addSentence(text, {weight: 10});
        abort = p.abort;
        return p;
      });
    }))();
    var setup = Util.co($traceurRuntime.initGeneratorFunction(function $__32() {
      var $__30,
          setting,
          scenario,
          reqNew,
          script;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              Player.init();
              setSysBG();
              $ctx.state = 38;
              break;
            case 38:
              $ctx.state = 2;
              return Player.fetchSettingData(Data.URL.ContentsSetting);
            case 2:
              setting = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              View.on('menu').then(setup);
              message('再生する作品を選んでください');
              $ctx.state = 40;
              break;
            case 40:
              $ctx.state = 6;
              return new Promise((function(ok, ng) {
                var novels = setting['作品'];
                if (!novels || !novels.length)
                  return message('再生できる作品がありません\n『データ/作品.txt』を確認してください');
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
            case 6:
              scenario = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return Player.fetchSettingData(("データ/" + scenario + "/設定.txt"));
            case 10:
              setting = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 14;
              return Player.setSetting(scenario, setting);
            case 14:
              reqNew = $ctx.sent;
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = (reqNew) ? 17 : 26;
              break;
            case 17:
              $ctx.state = 18;
              return message('セーブデータの初期化が必要です');
            case 18:
              $ctx.maybeThrow();
              $ctx.state = 20;
              break;
            case 20:
              $ctx.state = 22;
              return ($__30 = Player.deleteSaveData()).then.apply($__30, $traceurRuntime.spread(deleteAfter));
            case 22:
              $ctx.maybeThrow();
              $ctx.state = 24;
              break;
            case 24:
              $ctx.state = -2;
              break;
            case 26:
              message('『' + scenario + '』開始メニュー');
              $ctx.state = 42;
              break;
            case 42:
              $ctx.state = 29;
              return new Promise((function(ok, ng) {
                var opts = ['初めから', '続きから', '任意の場所から', '初期化する'].map((function(name) {
                  return ({name: name});
                }));
                return View.setChoiceWindow(opts, {
                  sys: true,
                  closeable: true,
                  half: true
                }).then((function(kind) {
                  var $__31;
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
                      ($__31 = Player.deleteSaveData().check()).then.apply($__31, $traceurRuntime.spread(deleteAfter));
                      break;
                    case '閉じる':
                      resetup();
                      break;
                    default:
                      ng('想定外の機能が呼び出されました');
                  }
                }));
              }));
            case 29:
              script = $ctx.sent;
              $ctx.state = 31;
              break;
            case 31:
              $ctx.state = (!script) ? 32 : 33;
              break;
            case 32:
              $ctx.returnValue = resetup();
              $ctx.state = -2;
              break;
            case 33:
              $ctx.returnValue = load(script);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__32, this);
    }));
    var deleteAfter = [(function(f) {
      if (f)
        return message('初期化しました').delay(1000).then(resetup);
      else
        return message('作品選択メニューに戻ります').delay(1000).then(resetup);
    }), (function(err) {
      return message('消去中にエラーが発生しました').delay(1000).then(resetup);
    })];
    var load = Util.co($traceurRuntime.initGeneratorFunction(function $__33(script) {
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              message('キャッシュ中…');
              $ctx.state = 32;
              break;
            case 32:
              $ctx.state = 2;
              return Player.cacheScript(script);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return message('');
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              View.mainMessageWindow.el.hidden = true;
              $ctx.state = 34;
              break;
            case 34:
              $ctx.state = 10;
              return View.prepareFade();
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 14;
              return View.setBGImage({
                url: null,
                sys: true
              });
            case 14:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = 18;
              return View.fade({msec: 500});
            case 18:
              $ctx.maybeThrow();
              $ctx.state = 20;
              break;
            case 20:
              View.clean();
              $ctx.state = 36;
              break;
            case 36:
              $ctx.state = 22;
              return Player.runScript(script);
            case 22:
              $ctx.maybeThrow();
              $ctx.state = 24;
              break;
            case 24:
              View.clean();
              $ctx.state = 38;
              break;
            case 38:
              $ctx.state = 26;
              return message('再生が終了しました\n作品選択メニューに戻ります').delay(1000);
            case 26:
              $ctx.maybeThrow();
              $ctx.state = 28;
              break;
            case 28:
              $ctx.returnValue = setup().catch(restart);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__33, this);
    }));
    var restart = Util.co($traceurRuntime.initGeneratorFunction(function $__34(err) {
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              LOG(err);
              if (typeof err !== 'string')
                err = '致命的なエラーが発生したため再生を継続できません';
              View.clean();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 2;
              return message(err + '\n作品選択メニューに戻ります').delay(1000);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = resetup();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__34, this);
    }));
    var resetup = (function(_) {
      return setup().catch(restart);
    });
    var start = Util.co($traceurRuntime.initGeneratorFunction(function $__35() {
      var setting,
          startSE;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return Player.fetchSettingData(Data.URL.EngineSetting);
            case 2:
              setting = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              Data.SystemVersion = setting['システムバージョン'][0];
              startSE = new Sound('sysSE', '起動');
              View.changeMode('NOVEL');
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 6;
              return Promise.all([setSysBG(false), Promise.race([Promise.all([startSE.play(), View.addSentence('openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion, {weight: 0}).delay(3000)]), View.on('go')]).through((function(_) {
                return startSE.fadeout();
              }))]).check();
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = resetup();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__35, this);
    }));
    function setSysBG() {
      var view = arguments[0] !== (void 0) ? arguments[0] : true;
      var p = Util.toBlobURL('画像', '背景', 'png', true);
      return view ? p.then((function(url) {
        return View.setBGImage({
          url: url,
          sys: true
        });
      })) : p;
    }
    start().check();
    READY.Game.ready({
      reset: function() {
        resetup();
      },
      loadSaveData: Util.co($traceurRuntime.initGeneratorFunction(function $__36() {
        var $__30,
            script,
            scenario,
            setting,
            reqNew;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return Player.loadSaveData();
              case 2:
                script = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                $ctx.state = (!script) ? 5 : 6;
                break;
              case 5:
                $ctx.state = -2;
                break;
              case 6:
                scenario = Data.scenarioName;
                setting = Data.settingData;
                Player.init();
                Player.setSetting(scenario, setting);
                $ctx.state = 24;
                break;
              case 24:
                $ctx.state = 9;
                return Player.setSetting(scenario, setting);
              case 9:
                reqNew = $ctx.sent;
                $ctx.state = 11;
                break;
              case 11:
                $ctx.state = (reqNew) ? 12 : 21;
                break;
              case 12:
                $ctx.state = 13;
                return message('セーブデータの初期化が必要です');
              case 13:
                $ctx.maybeThrow();
                $ctx.state = 15;
                break;
              case 15:
                $ctx.state = 17;
                return ($__30 = Player.deleteSaveData()).then.apply($__30, $traceurRuntime.spread(deleteAfter));
              case 17:
                $ctx.maybeThrow();
                $ctx.state = 19;
                break;
              case 19:
                $ctx.state = -2;
                break;
              case 21:
                load(script);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__36, this);
      }))
    });
  })).check();
  return {};
});
System.get("ES6/ゲーム" + '');
