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
      }
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
      toHalfWidth: function(str) {
        var table = {
          '。': '.',
          'ー': '-',
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
          '／': '/'
        };
        return str.replace(/./g, (function(char) {
          return (char in table ? table[char] : char);
        })).replace(/[\uff0b-\uff5a]/g, (function(char) {
          return String.fromCharCode(char.charCodeAt(0) - 65248);
        }));
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
            var $__1 = $traceurRuntime.assertObject(iter.next(val)),
                value = $__1.value,
                done = $__1.done;
            value = Promise.resolve(value);
            if (done)
              defer.resolve(value);
            else
              value.then(loop, defer.reject);
          });
          loop();
          return defer.promise;
        };
      }
    };
    Util.setDefaults(String.prototype, {repeat: function repeat(num) {
        return new Array(num + 1).join(this);
      }});
    Util.setDefaults(Promise, {defer: function() {
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
      }});
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
          onFulfilled(val);
          return Promise.resolve(val);
        }), (function(err) {
          onRejected(err);
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
              $__0 = 0; $__0 < arguments.length; $__0++)
            args[$__0] = arguments[$__0];
          var len = args.length;
          if (len === 0)
            return $p;
          var $__1 = $traceurRuntime.assertObject(args),
              arg0 = $__1[0],
              arg1 = $__1[1],
              arg2 = $__1[2];
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
    Util.overrides = {Promise: $Promise};
    var READY = ((function(_) {
      function READY(type) {
        var types = (arguments.length != 1) ? [].slice.call(arguments) : (Array.isArray(type)) ? type : [type];
        return $Promise.all(types.map((function(type) {
          if (!(type in READY))
            throw 'illegal READY type "' + type + '"';
          return READY[type];
        })));
      }
      ;
      ['DOM', 'Player', 'View'].forEach((function(type) {
        global[type] = null;
        var defer = $Promise.defer();
        READY[type] = defer.promise;
        READY[type].ready = (function(obj) {
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
      Data: Data
    });
  }))();
  return {};
});
System.get("ES6/ヘルパー" + '');
System.register("ES6/モデル", [], function() {
  "use strict";
  var __moduleName = "ES6/モデル";
  READY().then(function() {
    'use strict';
    function setPhase(phase) {
      document.title = '【' + phase + '】';
    }
    function setRunPhase(kind) {
      setPhase((kind + "中..."));
    }
    function setErrorPhase(kind) {
      setPhase((kind + "エラー"));
    }
    function parseScript(text) {
      text = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\n/g, '\r\n') + '\r\n';
      text = text.replace(/^\#.*\n/gm, '');
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
    function runScript(script) {
      var $__2;
      View.changeModeIfNeeded('NOVEL');
      var run = Promise.defer();
      script = copyObject(script);
      var actHandlers = ($__2 = {}, Object.defineProperty($__2, "会話", {
        value: function(data, done, failed) {
          function nextPage() {
            var ary = data.shift();
            if (!ary)
              return done();
            var name = ary[0],
                texts = ary[1];
            if (Util.isNoneType(name))
              name = '';
            View.nextPage(name);
            function nextSentence() {
              var text = texts.shift();
              if (!text)
                return nextPage();
              text = text.replace(/\\w(\d+)/g, (function(_, num) {
                return '\u200B'.repeat(num);
              })).replace(/\\n/g, '\n');
              View.addSentence(text).on('go', nextSentence, failed);
            }
            nextSentence();
          }
          nextPage();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "背景", {
        value: function(data, done, failed) {
          var name = data[0];
          toBlobURL('背景', name, 'jpg').then((function(url) {
            return View.setBGImage({url: url});
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "立絵", {
        value: otherName('立ち絵'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "立ち絵", {
        value: function(data, done, failed) {
          Promise.all(data.reduce((function(base, ary) {
            var $__4,
                $__5;
            if (!base)
              return;
            if (Util.isNoneType(ary))
              return base;
            var $__3 = $traceurRuntime.assertObject(ary),
                position = $__3[0],
                names = $__3[1];
            if (!position)
              return failed('不正な位置検出');
            if (!names)
              return failed('不正な画像名検出');
            var a_type = ['left', 'right']['左右'.indexOf(position)];
            var v_type = 'top';
            var $__3 = [0, 0],
                a_per = $__3[0],
                v_per = $__3[1];
            var height = null;
            if (!a_type) {
              var pos = Util.toHalfWidth(position).match(/[+\-0-9.]+/g);
              if (!pos)
                return failed('不正な位置検出');
              var $__3 = $traceurRuntime.assertObject(pos),
                  a_pos = $__3[0],
                  v_pos = ($__4 = $__3[1]) === void 0 ? '0' : $__4,
                  height = ($__5 = $__3[2]) === void 0 ? null : $__5;
              a_per = Math.abs(+a_pos);
              v_per = Math.abs(+v_pos);
              a_type = a_pos.match('-') ? 'right' : 'left';
              v_type = v_pos.match('-') ? 'bottom' : 'top';
              height = height != null ? (+height + "%") : null;
            }
            var name = names[0];
            base.push(toBlobURL('立ち絵', name, 'png').then((function(url) {
              var $__2;
              return (($__2 = {}, Object.defineProperty($__2, "url", {
                value: url,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__2, "height", {
                value: height,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__2, a_type, {
                value: (a_per + "%"),
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__2, v_type, {
                value: (v_per + "%"),
                configurable: true,
                enumerable: true,
                writable: true
              }), $__2));
            })));
            return base;
          }), [])).then(View.setFDImages.bind(View)).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "選択", {
        value: otherName('選択肢'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "選択肢", {
        value: function(data, done, failed) {
          View.setChoiceWindow(data.map((function(ary) {
            return {
              name: ary[0],
              value: ary[1]
            };
          }))).then((function(value) {
            if (typeof value[0] == 'string')
              actHandlers.ジャンプ(value, done, failed);
            else
              promise = runScript(value).then(done, failed);
          }));
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "ジャンプ", {
        value: function(data, done, failed) {
          var to = data[0];
          fetchScriptData(to).then(runScript).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "パラメーター", {
        value: otherName('パラメータ'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "パラメータ", {
        value: function(data, done, failed) {
          data.forEach((function(str) {
            str = Util.toHalfWidth(str);
            str = str.match(/(.+)\:(.+)/);
            if (!str)
              return failed('不正なパラメータ指定検出');
            var name = str[1];
            var effect = parseEffect(str[2]);
            if (!name)
              return failed('不正なパラメータ指定検出');
            paramMap.set(name, evalEffect(effect, failed));
          }));
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "分岐", {
        value: function(data, done, failed) {
          if (!data.some((function($__3) {
            var str = $__3[0],
                acts = $__3[1];
            if (!str)
              return failed('不正なパラメータ指定検出');
            var effect = parseEffect(str);
            if (Util.isNoneType(effect))
              effect = '1';
            var flag = !!evalEffect(effect, failed);
            if (flag)
              runScript(acts).then(done, failed);
            return flag;
          })))
            done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "コメント", {
        value: function(data, done, failed) {
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), $__2);
      function main_loop() {
        updateDebugWindow();
        var act,
            loop = new Promise((function(resolve, reject) {
              var prog = script.shift();
              if (!prog)
                return run.resolve();
              act = prog[0].trim();
              var data = prog[1];
              if (act in actHandlers)
                actHandlers[act](data, resolve, reject);
              else {
                Util.error('サポートされていないコマンド『' + act + '』を検出しました。\n\nこのコマンドを飛ばして再生が継続されます。');
                resolve();
              }
            })).then(main_loop, (function(err) {
              var message = err ? ("コマンド『" + act + "』で『" + err + "』が起こりました。") : ("コマンド『" + act + "』が原因かもしれません。");
              Util.error('スクリプトを解析中にエラーが発生しました。\n\n' + message + '\n\nこのコマンドを保証せず再生が継続されます。');
              return main_loop();
            }));
      }
      main_loop();
      return run.promise;
    }
    function parseEffect(str) {
      return Util.toHalfWidth(str).replace(/==/g, '=').replace(/[^!><=]=/g, (function(str) {
        return str.replace('=', '==');
      }));
    }
    function evalEffect(effect, failed) {
      var get = (function(key) {
        if (!paramMap.has(key))
          paramMap.set(key, 0);
        return paramMap.get(key);
      });
      effect = effect.trim();
      if (!effect)
        return failed('不正なパラメータ指定検出');
      if (/\"/.test(effect))
        return failed('危険な記号の検出');
      effect = effect.replace(/[^+\-*/%><!=\s\d.]+/, (function(str) {
        return ("get(\"" + str + "\")");
      }));
      return eval(effect);
    }
    function updateDebugWindow() {
      if (!Data.debug)
        return;
      var params = {};
      paramMap.forEach((function(value, key) {
        return params[key] = value;
      }));
      var caches = [];
      cacheBlobMap.forEach((function(value, key) {
        return caches.push(key);
      }));
      var obj = {
        パラメータ: params,
        キャッシュ: caches.sort()
      };
      View.updateDebugWindow(obj);
    }
    function toBlobScriptURL(name) {
      return toBlobURL('シナリオ', name, 'txt');
    }
    function toBlobURL(kind, name, type) {
      var sub = Util.forceName(kind, name, type);
      var subkey = (Player.scenarioName + "/" + sub);
      if (Util.isNoneType(name))
        return Promise.resolve(null);
      if (cacheBlobMap.has(subkey))
        return Promise.resolve(cacheBlobMap.get(subkey));
      var hide = View.setLoadingMessage('Loading...');
      return new Promise((function(ok, ng) {
        var url = ("データ/" + subkey);
        find(url).catch((function(_) {
          url = ("データ/[[共通素材]]/" + sub);
          return find(url);
        })).then((function(_) {
          return ok(url);
        }), ng);
      })).then(loadBlob).then(URL.createObjectURL).through((function(blobURL) {
        cacheBlobMap.set(subkey, blobURL);
        hide();
      }), hide);
    }
    function fetchSettingData(url) {
      return loadText(url).then((function(text) {
        var setting = parseScript(text);
        var data = {};
        setting.forEach((function(ary) {
          data[ary[0]] = ary[1];
        }));
        return data;
      }));
    }
    function fetchScriptData(name) {
      return toBlobScriptURL(name).then(loadText).then((function(text) {
        return parseScript(text);
      }));
    }
    function loadText(url) {
      return load(url, 'text');
    }
    function loadBlob(url) {
      return load(url, 'blob');
    }
    function load(url, type) {
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
    }
    function find(url) {
      return new Promise(function(ok, ng) {
        var xhr = new XMLHttpRequest();
        xhr.onload = (function(_) {
          if (xhr.status < 300)
            ok();
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
    function print(message) {
      if (!View.print)
        View.changeMode('TEST');
      View.print(message);
    }
    var cacheBlobMap = new Map;
    var paramMap = new Map;
    function cacheClear() {
      cacheBlobMap.forEach((function(subURL, blobURL) {
        URL.revokeObjectURL(blobURL);
      }));
      cacheBlobMap.clear();
      updateDebugWindow();
    }
    function paramClear() {
      paramMap.clear();
      updateDebugWindow();
    }
    READY.Player.ready({
      setRunPhase: setRunPhase,
      setErrorPhase: setErrorPhase,
      fetchSettingData: fetchSettingData,
      fetchScriptData: fetchScriptData,
      runScript: runScript,
      print: print,
      cacheClear: cacheClear,
      paramClear: paramClear
    });
  }).catch(LOG);
  return {};
});
System.get("ES6/モデル" + '');
System.register("ES6/ビュー", [], function() {
  "use strict";
  var __moduleName = "ES6/ビュー";
  READY('Player', 'DOM').then((function(_) {
    'use strict';
    var View = null;
    var EP = Element.prototype;
    Util.setDefaults(EP, {
      on: EP.addEventListener,
      requestFullscreen: EP.webkitRequestFullscreen || EP.mozRequestFullScreen,
      append: EP.appendChild,
      removeChildren: function() {
        this.innerHTML = '';
        return this;
      },
      setStyles: function(styles) {
        var $__6 = this;
        styles = styles || {};
        Object.keys(styles).forEach((function(key) {
          if (styles[key] != null)
            $__6.style[key] = styles[key];
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
      if (full) {
        el_player.style.height = height + 'px';
        if (el_fullscreen)
          el_fullscreen.style.height = height + 'px';
      } else
        fitScreen = Util.NOP;
      return p;
    }
    var el_debug = new DOM('div', {
      width: '300px',
      textAlign: 'center',
      fontSize: '1em',
      padding: '5px'
    });
    var bs = {
      height: '2em',
      margin: '5px'
    };
    ;
    [360, 480, 720, 1080].forEach((function(size) {
      var el = el_root.append(el_debug).append(new DOM('button', bs));
      el.append(new DOM('text', size + 'p'));
      el.on('click', (function(_) {
        return adjustScale(size / devicePixelRatio);
      }));
    }));
    el_root.append(el_debug).append(new DOM('br'));
    var el = el_root.append(el_debug).append(new DOM('button', bs));
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
    var el = el_root.append(el_debug).append(new DOM('button', bs));
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
      View.showNotice('この機能はブラウザにより\n表示の差があります', 3000);
    }));
    var el = el_root.append(el_debug).append(new DOM('button', bs));
    el.append(new DOM('text', 'キャシュ削除'));
    el.on('click', (function(_) {
      Player.cacheClear();
      View.showNotice('キャッシュを削除しました', 500);
    }));
    var el = new DOM('div');
    var el_debugWindow = el_debug.append(el).append(new DOM('pre', {textAlign: 'left'}));
    el_debugWindow.textContent = 'デバッグ情報\n（無し）';
    function setAnimate(func) {
      var start = performance.now();
      var cancelled = false;
      return new Promise((function(ok) {
        var complete = (function(_) {
          cancelled = true;
          ok();
        });
        var loop = (function(now) {
          if (cancelled)
            return;
          var delta = now - start;
          if (delta < 0)
            delta = 0;
          requestAnimationFrame(loop);
          func(delta, complete);
        });
        requestAnimationFrame(loop);
      }));
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
        initDisplay: function(opt) {
          Util.setDefaults(opt, {
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
        },
        showNotice: function(message) {
          var show_time = arguments[1] !== (void 0) ? arguments[1] : 1000;
          var delay_time = arguments[2] !== (void 0) ? arguments[2] : 250;
          if (!message)
            throw 'illegal message string';
          message = '【！】\n' + message;
          var noticeWindow = new DOM('div', {
            fontSize: '2em',
            color: 'rgba(0,0,0,0.75)',
            textShadow: 'rgba(0,0,0,0.75) 0.01em 0.01em 0.01em',
            backgroundColor: 'rgba(255,255,0,0.75)',
            boxShadow: 'rgba(100,100,0,0.5) 0px 0px 5px 5px',
            borderRadius: '2% / 10%',
            textAlign: 'center',
            lineHeight: '1.5em',
            opacity: '0',
            position: 'absolute',
            left: 'calc((100% - 90%) / 2)',
            top: '20%',
            zIndex: '100',
            width: '90%'
          });
          el_player.append(noticeWindow).append(new DOM('pre', {margin: '5%'})).append(new DOM('text', message));
          return new Promise(function(ok, ng) {
            var opacity = 0;
            setAnimate(function(delta, complete) {
              opacity = delta / delay_time;
              if (opacity >= 1) {
                opacity = 1;
                if (typeof navigator.vibrate == 'function')
                  navigator.vibrate([100, 100, 100]);
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
            fontSize: '2em',
            color: 'rgba(255,255,255,0.5)',
            textShadow: 'rgba(0,0,0,0.5) 0.01em 0.01em 0.01em',
            position: 'absolute',
            right: '0%',
            bottom: '0%',
            zIndex: '900'
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
          this.__proto__.initDisplay(opt);
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
          Util.setDefaults(opt, {
            color: 'rgba(255,255,255,0.9)',
            textShadow: 'rgba(0,0,0,0.9) 0.1em 0.1em 0.1em',
            overflow: 'hidden'
          });
          this.__proto__.initDisplay(opt);
          this.mainMessageWindow = this.addMessageWindow({z: 10});
          this.imageFrame = this.addImageFrame({z: 20});
        },
        messageWindowProto: {
          nextPage: function(name, opt) {
            name = !name || name.match(/^\s+$/) ? '' : '【' + name + '】';
            this.el_title.textContent = name;
            this.el_body.removeChildren();
          },
          addSentence: function(text, opt) {
            text += '\n';
            opt = Util.setDefaults(opt, {weight: 33});
            var length = text.length;
            var at = 0;
            var el = this.el_body;
            var weight = opt.weight;
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
            var p = setAnimate((function(delay, complete) {
              if (aborted)
                return complete();
              if (cancelled) {
                el.append(new DOM('text', text.slice(at).replace(/\u200B/g, '')));
                return complete();
              }
              while (delay / weight >= at) {
                var str = text[at];
                if (str != '\u200B')
                  el.append(new DOM('text', str));
                if (++at >= length)
                  return complete();
              }
            }));
            p.abort = abort;
            p.cancel = cancel;
            return p;
          }
        },
        addMessageWindow: function(opt) {
          Util.setDefaults(opt, {
            background: 'rgba(0,0,100,0.5)',
            boxShadow: 'rgba(0,0,100,0.5) 0px 0px 5px 5px',
            borderRadius: '1% / 1%',
            width: 'calc(100% - 10px - (2% + 2%))',
            height: 'calc( 25% - 10px - (4% + 2%))',
            fontSize: '100%',
            lineHeight: '1.5em',
            fontWeight: 'bold',
            padding: '4% 2% 2% 2%',
            whiteSpace: 'nowrap',
            position: 'absolute',
            bottom: '5px',
            left: '5px',
            zIndex: opt.z || 1400
          });
          var el = new DOM('div', opt);
          el_context.append(el);
          var el_title = el.append(new DOM('div', {
            display: 'inline-block',
            marginRight: '5%',
            textAlign: 'right',
            verticalAlign: 'top',
            width: '15%',
            height: '100%'
          }));
          var el_body = el.append(new DOM('div', {
            display: 'inline-block',
            width: 'auto',
            height: '100%'
          })).append(new DOM('pre', {margin: '0'}));
          var mw = {
            __proto__: this.messageWindowProto,
            el: el,
            el_title: el_title,
            el_body: el_body
          };
          return mw;
        },
        addImageFrame: function(opt) {
          var fr = new DOM('div', {
            height: '100%',
            width: '100%',
            zIndex: opt.z || 1500
          });
          el_context.append(fr);
          return fr;
        },
        setChoiceWindow: function(opts) {
          var defer = Promise.defer();
          var cw = new DOM('div', {
            position: 'absolute',
            left: 'calc((100% - 70%) / 2 - 5%)',
            width: '70%',
            top: '5%',
            boxShadow: 'rgba(100, 100, 255, 0.5) 0 0 2em',
            borderRadius: '3% / 5%',
            background: 'rgba(100, 100, 255, 0.3)',
            padding: '0% 5%'
          });
          opts.forEach(function(opt) {
            if (!('value' in opt))
              opt.value = opt.name;
            var bt = new DOM('button', {
              display: 'block',
              fontSize: '1.5em',
              boxShadow: 'inset 0 1px 3px #F1F1F1, inset 0 -15px rgba(0,0,223,0.2), 1px 1px 2px #E7E7E7',
              background: 'rgba(0,0,100,0.8)',
              color: 'white',
              borderRadius: '5% / 50%',
              width: '100%',
              height: '2.5em',
              margin: '5% 0%'
            });
            bt.append(new DOM('text', opt.name));
            bt.onclick = (function(_) {
              defer.resolve(opt.value);
              cw.remove();
            });
            cw.append(bt);
          });
          el_context.append(cw);
          return defer.promise;
        },
        setBGImage: function(opt) {
          var url = opt.url ? ("url(" + opt.url + ")") : 'none';
          el_context.style.backgroundImage = url;
          el_context.style.backgroundSize = 'cover';
        },
        setFDImages: function(opts) {
          var el = this.imageFrame;
          el.removeChildren();
          opts.forEach((function(opt) {
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
            img.src = opt.url;
            el.append(img);
          }));
        },
        nextPage: function(name, opt) {
          this.mainMessageWindow.nextPage(name, opt);
        },
        addSentence: function(text, opt) {
          return this.mainMessageWindow.addSentence(text, opt);
        }
      }
    };
    var ViewProto = {
      __proto__: METHODS.COMMON,
      fresh: function() {
        View = {__proto__: ViewProto};
      },
      clean: function() {
        this.changeMode($mode);
      },
      init: function(opt) {
        this.initDisplay(opt.style || {});
      },
      initDisplay: function(opt) {
        this.__proto__.initDisplay(opt);
      },
      changeMode: function(type, opt) {
        var type = type.toUpperCase();
        opt = opt || {};
        if (!type in METHODS)
          throw 'illegal ViewContext mode type';
        $mode = type;
        ViewProto.__proto__ = METHODS[type];
        View.init(opt);
      },
      changeModeIfNeeded: function(type, opt) {
        if ($mode != type)
          this.changeMode(type, opt);
      },
      on: function(type, onFulfilled, onRejected) {
        return new Promise((function(resolve) {
          switch (type) {
            case 'go':
              hookInput(['Lclick', 'enter', 'space'], resolve);
              break;
            default:
              throw 'illegal hook event type';
          }
        })).then(onFulfilled).catch(onRejected);
      }
    };
    ViewProto.fresh();
    var hookInput = ((function(_) {
      var keyboardTable = {
        13: 'enter',
        32: 'space'
      };
      var hooks = [];
      document.addEventListener('keydown', (function(evt) {
        var type = keyboardTable[evt.keyCode];
        if (type)
          onEvent(type, evt);
      }));
      el_wrapper.addEventListener('mousedown', (function(evt) {
        var type = 'LMR'[evt.button];
        if (type)
          onEvent(type + 'click', evt);
      }));
      function onEvent(type, evt) {
        evt.preventDefault();
        hooks = hooks.reduce((function(ary, hook, i) {
          if (hook.indexOf(type) === -1)
            ary.push(hook);
          else
            hook.resolve();
          return ary;
        }), []);
      }
      return function hookInput(hook, resolve) {
        hook.resolve = resolve;
        hooks.push(hook);
      };
    }))();
    var $full = false;
    var $ratio = 16 / 9;
    var $mode = '';
    var width = document.body.clientWidth;
    var $scale = width / $ratio >= 480 ? 480 : width / $ratio;
    View.changeMode('TEST');
    var p = adjustScale($scale, $ratio);
    p.then((function(_) {
      return READY.View.ready(View);
    }));
  })).catch(LOG);
  return {};
});
System.get("ES6/ビュー" + '');
System.register("ES6/コントローラー", [], function() {
  "use strict";
  var __moduleName = "ES6/コントローラー";
  READY('Player', 'View').then((function(_) {
    'use strict';
    var message = ((function(_) {
      var abort = Util.NOP;
      return (function(text) {
        abort();
        View.changeModeIfNeeded('NOVEL');
        View.nextPage('システム');
        var p = View.addSentence(text, {weight: 20});
        abort = p.abort;
        return p;
      });
    }))();
    var setup = Util.co($traceurRuntime.initGeneratorFunction(function $__8() {
      var setting,
          scenario,
          script;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              Player.setRunPhase('準備');
              $ctx.state = 28;
              break;
            case 28:
              $ctx.state = 2;
              return message('作品一覧を読み込んでいます...').then((function(_) {
                return Player.fetchSettingData(Data.URL.ContentsSetting);
              }));
            case 2:
              setting = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return message('再生する作品を選んでください').then((function(_) {
                var opts = setting['作品'].reduce((function(opts, name) {
                  opts.push({name: name});
                  return opts;
                }), []);
                return View.setChoiceWindow(opts);
              }));
            case 6:
              scenario = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              Player.scenarioName = scenario;
              $ctx.state = 30;
              break;
            case 30:
              $ctx.state = 10;
              return message('作品情報を読み込んでいます...').then((function(_) {
                return Player.fetchSettingData(("データ/" + scenario + "/設定.txt"));
              }));
            case 10:
              setting = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 14;
              return message('開始シナリオを読み込んでいます...').then((function(_) {
                return Player.fetchScriptData(setting['開始シナリオ'][0]);
              }));
            case 14:
              script = $ctx.sent;
              $ctx.state = 16;
              break;
            case 16:
              Player.paramClear();
              $ctx.state = 32;
              break;
            case 32:
              $ctx.state = 18;
              return message('再生準備が完了しました。\nクリック、タップ、エンターキー、スペースキーで進みます。').on('go').then((function(_) {
                Player.setRunPhase('再生');
                return Player.runScript(script);
              }));
            case 18:
              $ctx.maybeThrow();
              $ctx.state = 20;
              break;
            case 20:
              View.clean();
              Player.setRunPhase('準備');
              $ctx.state = 34;
              break;
            case 34:
              $ctx.state = 22;
              return message('再生が終了しました。\n作品選択メニューに戻ります。').delay(1000);
            case 22:
              $ctx.maybeThrow();
              $ctx.state = 24;
              break;
            case 24:
              $ctx.returnValue = setup().catch(restart);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__8, this);
    }));
    var restart = Util.co($traceurRuntime.initGeneratorFunction(function $__9(err) {
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              LOG(err);
              View.clean();
              Player.setRunPhase('エラー解決');
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 2;
              return message('致命的なエラーが発生したため再生を継続できません。\n作品選択メニューに戻ります。').delay(3000);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = setup().catch(restart);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__9, this);
    }));
    var start = Util.co($traceurRuntime.initGeneratorFunction(function $__10() {
      var setting;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              Player.setRunPhase('起動');
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 2;
              return Player.fetchSettingData(Data.URL.EngineSetting);
            case 2:
              setting = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              Data.SystemVersion = setting['システムバージョン'][0];
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 6;
              return message('openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion).delay(1000);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = setup().catch(restart);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    }));
    start();
  })).catch(LOG);
  return {};
});
System.get("ES6/コントローラー" + '');

//# sourceMappingURL=メイン.map
