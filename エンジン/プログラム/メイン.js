System.register("ES6/ヘルパー", [], function() {
  "use strict";
  var __moduleName = "ES6/ヘルパー";
  ;
  ((function(_) {
    'use strict';
    var global = (1, eval)('this');
    var Promise = global.Promise;
    var LOG = console.log.bind(console);
    var Data = {URL: {
        ContentsSetting: 'データ/作品.txt',
        EngineSetting: 'エンジン/エンジン定義.txt'
      }};
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
        return (typeof str === 'string') && /^(無し|なし)$/.test(str);
      },
      forceImageURL: function(url) {
        var type = arguments[1] !== (void 0) ? arguments[1] : 'png';
        var kind = arguments[2];
        return Util.isNoneType(url) ? null : Util.forceURL(url, type, kind);
      },
      forceFDImageURL: function(url) {
        var type = arguments[1] !== (void 0) ? arguments[1] : 'png';
        var kind = arguments[2] !== (void 0) ? arguments[2] : '立ち絵';
        return Util.isNoneType(url) ? null : Util.forceURL(url, type, kind);
      },
      forceBGImageURL: function(url) {
        var type = arguments[1] !== (void 0) ? arguments[1] : 'png';
        var kind = arguments[2] !== (void 0) ? arguments[2] : '背景';
        return Util.isNoneType(url) ? null : Util.forceURL(url, type, kind);
      },
      forceScriptURL: function(url) {
        var type = arguments[1] !== (void 0) ? arguments[1] : 'txt';
        var kind = arguments[2] !== (void 0) ? arguments[2] : 'シナリオ';
        return Util.forceURL(url, type, kind);
      },
      forceURL: function(url, type, kind) {
        if (!url || arguments.length != 3)
          throw 'URL特定不能エラー';
        if (!url.match(/\.[^\.]+$/))
          url = (url + "." + type);
        var base = Player.baseURL || '';
        if (kind && (!url.match(kind)))
          url = ("データ/" + base + "/" + kind + "/" + url);
        url = url.replace(/\/+/g, '/');
        return url;
      },
      NOP: function() {},
      error: function(message) {
        alert(message);
      },
      Default: undefined
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
      next: function next(kind, onFulfilled, onRejected) {
        return this.then((function(result) {
          Player.setRunPhase(kind);
          return onFulfilled(result);
        }), onRejected).catch((function(err) {
          LOG(kind + 'エラー', err);
          Player.setErrorPhase(kind);
          return Promise.reject(err);
        }));
      },
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
    Util.overrides = {Promise: Promise};
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
      text = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\n/g, '\r\n');
      text = text.replace(/^\#.*\n/gm, '');
      function parseOne(base, text) {
        var chanks = text.match(/[^\n]+?\n(\t+[\s\S]+?\n)+/g) || [];
        chanks.forEach((function(chank) {
          var blocks = chank.replace(/^\t/gm, '').replace(/\n$/, '').match(/.+/g);
          var act = blocks.shift();
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
    function preloadImage(name, url, kind) {
      function loadImageTest(url) {
        return new Promise((function(ok, ng) {
          var img = new Image;
          img.onload = (function(_) {
            return ok(url);
          });
          img.onerror = (function(_) {
            return ng(("画像『" + name + "』のキャッシュに失敗"));
          });
          img.src = url;
        }));
      }
      var hide = View.setLoadingMessage('Loadind...');
      return new Promise((function(ok, ng) {
        if (Util.isNoneType(name))
          return ok(url);
        loadImageTest(url).catch((function(_) {
          var url = Util.forceImageURL(("データ/[[共通素材]]/" + kind + "/" + name), Util.Default, '');
          return loadImageTest(url);
        })).then(ok, ng);
      })).then((function(url) {
        hide();
        return url;
      }));
    }
    function runScript(script) {
      var $__2;
      View.changeMode('NOVEL');
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
          var name = data[0],
              url = Util.forceBGImageURL(name);
          preloadImage(name, url, '背景').then((function(url) {
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
            if (Util.isNoneType(ary))
              return base;
            var type = ['left', 'right']['左右'.indexOf(ary[0])];
            var name = ary[1][0],
                url = Util.forceFDImageURL(name);
            if (!type)
              failed('不正な位置検出');
            base.push(preloadImage(name, url, '立ち絵').then((function(url) {
              var $__2;
              return (($__2 = {}, Object.defineProperty($__2, "url", {
                value: url,
                configurable: true,
                enumerable: true,
                writable: true
              }), Object.defineProperty($__2, type, {
                value: '0px',
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
              value: ary[1][0]
            };
          }))).then((function(url) {
            url = Util.forceScriptURL(url);
            fetchScriptData(url).then(runScript).then(done, failed);
          }));
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
        var act,
            loop = new Promise((function(resolve, reject) {
              var prog = script.shift();
              if (!prog)
                return run.resolve();
              act = prog[0];
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
    function fetchScriptData(url) {
      url = Util.forceScriptURL(url);
      return loadText(url).then((function(text) {
        return parseScript(text);
      }));
    }
    function loadText(url) {
      return load(url, 'text');
    }
    function load(url, type) {
      return new Promise(function(ok, ng) {
        var xhr = new XMLHttpRequest();
        xhr.onload = (function(_) {
          return ok(xhr.response);
        });
        xhr.onerror = ng;
        xhr.open('GET', url);
        if (type)
          xhr.responseType = type;
        xhr.send();
      });
    }
    function print(message) {
      if (!View.print)
        View.changeMode('TEST');
      View.print(message);
    }
    READY.Player.ready({
      setRunPhase: setRunPhase,
      setErrorPhase: setErrorPhase,
      fetchSettingData: fetchSettingData,
      fetchScriptData: fetchScriptData,
      runScript: runScript,
      print: print
    });
  });
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
        var $__3 = this;
        styles = styles || {};
        Object.keys(styles).forEach((function(key) {
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
      if (!full) {
        el_player.style.height = '100%';
        if (height < 480)
          View.showNotice('表示領域が小さ過ぎるため\n表示が崩れる場合があります');
      }
      var ratio = ratio || 16 / 9;
      var width = height * ratio;
      el_player.style.fontSize = height / 25 + 'px';
      el_wrapper.style.height = height + 'px';
      el_wrapper.style.width = width + 'px';
      if (full) {
        el_fullscreen.style.height = el_player.style.height = height + 'px';
      } else
        fitScreen = Util.NOP;
    }
    var el_debug = new DOM('div', {
      width: '300px',
      textAlign: 'center',
      fontSize: '1em'
    });
    ;
    [360, 480, 720, 1080].forEach((function(size) {
      var el = el_root.append(el_debug).append(new DOM('button'));
      el.append(new DOM('text', size + 'p'));
      el.on('click', (function(_) {
        return adjustScale(size / devicePixelRatio);
      }));
    }));
    el_root.append(el_debug).append(new DOM('br'));
    var el = el_root.append(el_debug).append(new DOM('button'));
    el.append(new DOM('text', 'フルウィンドウ（横）'));
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
    var el = el_root.append(el_debug).append(new DOM('button'));
    el.append(new DOM('text', 'フルスクリーン（横）'));
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
    var $full = false;
    var $ratio = 16 / 9;
    var width = document.body.clientWidth;
    var $scale = width / $ratio >= 480 ? 480 : width / $ratio;
    adjustScale($scale, $ratio);
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
          var show_time = arguments[1] !== (void 0) ? arguments[1] : 3000;
          var delay_time = arguments[2] !== (void 0) ? arguments[2] : 500;
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
        adjustScale: adjustScale
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
            var $__4 = [false, false],
                aborted = $__4[0],
                cancelled = $__4[1];
            var $__4 = [(function(_) {
              return aborted = true;
            }), (function(_) {
              return cancelled = true;
            })],
                abort = $__4[0],
                cancel = $__4[1];
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
            top: '10%',
            boxShadow: 'rgba(100, 100, 255, 0.5) 0 0 2em',
            borderRadius: '3% / 5%',
            background: 'rgba(100, 100, 255, 0.3)',
            padding: '3% 5%'
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
            var img = new DOM('img', {
              position: 'absolute',
              left: opt.left || '',
              right: opt.right || '',
              maxWidth: '50%',
              height: '100%'
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
    var $MODE = '';
    var ViewProto = {
      __proto__: METHODS.COMMON,
      fresh: function() {
        View = {__proto__: ViewProto};
      },
      clean: function() {
        this.changeMode($MODE);
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
        $MODE = type;
        ViewProto.__proto__ = METHODS[type];
        View.init(opt);
      },
      changeModeIfNeeded: function(type, opt) {
        if ($MODE != type)
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
    READY.View.ready(View);
  }));
  return {};
});
System.get("ES6/ビュー" + '');
System.register("ES6/コントローラー", [], function() {
  "use strict";
  var __moduleName = "ES6/コントローラー";
  READY('Player', 'View').next('起動', (function(_) {
    'use strict';
    Player.fetchSettingData(Data.URL.EngineSetting).then((function(setting) {
      Data.SystemVersion = setting['システムバージョン'][0];
      return message('openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion);
    })).delay(1000).next('準備', setup);
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
    function setup() {
      message('作品一覧を読み込んでいます...');
      Player.fetchSettingData(Data.URL.ContentsSetting).then((function(setting) {
        message('再生する作品を選んでください');
        return View.setChoiceWindow(setting['作品'].reduce((function(opts, name) {
          opts.push({name: name});
          return opts;
        }), []));
      })).then(scenarioSetup);
    }
    function scenarioSetup(name) {
      message('作品情報を読み込んでいます...');
      Player.baseURL = '';
      var url = Util.forceURL('設定', 'txt', name);
      Player.baseURL = name;
      function fetchFirstScriptData(setting) {
        message('開始シナリオを読み込んでいます...');
        var url = setting['開始シナリオ'][0];
        return Player.fetchScriptData(url);
      }
      Player.fetchSettingData(url).then(fetchFirstScriptData).next('待機', (function(script) {
        message('再生準備が完了しました。\nクリック、タップ、エンターキー、スペースキーで進みます。').delay(1000).next('実行', (function(_) {
          return Player.runScript(script);
        })).next('待機', (function(_) {
          View.clean();
          return message('再生が終了しました。\n作品選択メニューに戻ります。');
        })).delay(1000).next('準備', setup);
      }));
    }
  }));
  return {};
});
System.get("ES6/コントローラー" + '');

//# sourceMappingURL=メイン.map
