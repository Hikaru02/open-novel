System.register("ES6/ヘルパー", [], function() {
  "use strict";
  var __moduleName = "ES6/ヘルパー";
  ;
  ((function(_) {
    'use strict';
    var global = (1, eval)('this');
    var LOG = console.log.bind(console);
    var Util = ((function(_) {
      return {
        setDefalts: function() {
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
        }
      };
    }))();
    Util.setDefalts(String.prototype, {repeat: function repeat(num) {
        return new Array(num + 1).join(this);
      }});
    Util.setDefalts(Promise, {defer: function() {
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
          Player.setPhase(kind + '中...');
          return onFulfilled(result);
        }), onRejected).catch((function(err) {
          LOG(kind + 'エラー', err);
          Player.setPhase(kind + 'エラー');
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
    var READY = ((function(_) {
      function READY(type) {
        var types = (arguments.length != 1) ? [].slice.call(arguments) : (Array.isArray(type)) ? type : [type];
        return Promise.all(types.map((function(type) {
          if (!(type in READY))
            throw 'illegal READY type "' + type + '"';
          return READY[type];
        })));
      }
      ;
      ['DOM', 'Player', 'View'].forEach((function(type) {
        global[type] = null;
        var defer = Promise.defer();
        READY[type] = defer.promise;
        READY[type].ready = (function(obj) {
          global[type] = obj;
          defer.resolve();
        });
      }));
      return READY;
    }))();
    window.addEventListener('DOMContentLoaded', READY.DOM.ready);
    Util.setDefalts(global, {
      global: global,
      READY: READY,
      Util: Util,
      LOG: LOG,
      NOP: function() {},
      ERROR: function(message) {
        alert(message);
      },
      URLs: {SettingData: 'データ/作品設定.txt'}
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
    function parseScript(text) {
      text = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\n/g, '\r\n');
      function parseOne(base, text) {
        var chanks = text.match(/[^\n]+?\n(\t+[\s\S]+?\n)+/g) || [];
        chanks.forEach(function(chank) {
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
        });
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
    function preloadImage(url, result) {
      var hide = View.setLoadingMessage('Loadind...');
      return new Promise(function(ok, ng) {
        if (isNoneType(url))
          return ok();
        url = forceImageURL(url);
        var img = new Image;
        img.onload = function() {
          ok(result);
        };
        img.onerror = function(evt) {
          ng('画像URL『' + url + '』のキャッシュに失敗');
        };
        img.src = url;
      }).then(function(result) {
        hide();
        return result;
      });
    }
    function runScript(script) {
      var run = Promise.defer();
      script = copyObject(script);
      var actHandlers = {
        '会話': function(data, done, failed) {
          function nextPage() {
            var ary = data.shift();
            if (!ary)
              return done();
            var name = ary[0],
                texts = ary[1];
            View.nextPage(name);
            function nextSentence() {
              var text = texts.shift();
              if (!text)
                return nextPage();
              text = text.replace(/\\w(\d+)/g, function(_, num) {
                return '\u200B'.repeat(num);
              }).replace(/\\n/g, '\n');
              View.addSentence(text).on('go', nextSentence, failed);
            }
            nextSentence();
          }
          nextPage();
        },
        '背景': function(data, done, failed) {
          var url = data[0];
          preloadImage(url).then(View.setBGImage.bind(View, {url: forceCSSURL(url)})).then(done, failed);
        },
        '立絵': otherName('立ち絵'),
        '立ち絵': function(data, done, failed) {
          Promise.all(data.reduce(function(base, ary) {
            if (isNoneType(ary))
              return base;
            var type = ['left', 'right']['左右'.indexOf(ary[0])];
            var url = ary[1][0];
            if (!type)
              failed('不正な位置検出');
            var ro = {url: forceImageURL(url)};
            ro[type] = '0px';
            base.push(preloadImage(url, ro));
            return base;
          }, [])).then(View.setFDImages.bind(View)).then(done, failed);
        },
        '選択': otherName('選択肢'),
        '選択肢': function(data, done, failed) {
          View.setChoiceWindow(data.map(function(ary) {
            return {
              name: ary[0],
              value: ary[1][0]
            };
          })).then(function(url) {
            url = forceScriptURL(url);
            getScriptData(url).then(runScript).then(done, failed);
          });
        },
        'コメント': function(data, done, failed) {
          done();
        }
      };
      function main_loop() {
        var act,
            loop = new Promise(function(resolve, reject) {
              var prog = script.shift();
              if (!prog)
                return run.resolve();
              act = prog[0];
              var data = prog[1];
              if (act in actHandlers)
                actHandlers[act](data, resolve, reject);
              else {
                ERROR('サポートされていないコマンド『' + act + '』を検出しました。\n\nこのコマンドを飛ばして再生が継続されます。');
                resolve();
              }
            }).then(main_loop, function(err) {
              var message = err ? 'コマンド『' + act + '』で『' + err + '』が起こりました。' : 'コマンド『' + act + '』が原因かもしれません。';
              ERROR('スクリプトを解析中にエラーが発生しました。\n\n' + message + '\n\nこのコマンドを保証せず再生が継続されます。');
              return main_loop();
            });
      }
      main_loop();
      return run.promise;
    }
    function isNoneType(str) {
      return (typeof str === 'string') && /^(無し|なし)$/.test(str);
    }
    function forceCSSURL(url, type, root) {
      if (!url)
        throw 'URL特定不能エラー';
      return isNoneType(url) ? 'none' : 'url(' + forceImageURL(url, type, root) + ')';
    }
    function forceImageURL(url, type, root) {
      type = type || 'png';
      root = root || '画像';
      return forceURL(url, type, root);
    }
    function forceScriptURL(url, type, root) {
      type = type || 'txt';
      root = root || 'テキスト';
      return forceURL(url, type, root);
    }
    function forceURL(url, type, root) {
      if (!url)
        throw 'URL特定不能エラー';
      if (!url.match(/\.[^\.]+$/))
        url += '.' + type;
      if (root && (!url.match(root)))
        url = 'データ/' + root + '/' + url;
      return url;
    }
    function getSettingData() {
      return loadText(URLs.SettingData).then(function(text) {
        var setting = parseScript(text);
        var data = {};
        setting.forEach(function(ary) {
          data[ary[0]] = ary[1];
        });
        return data;
      });
    }
    function getScriptData(url) {
      url = forceScriptURL(url);
      return loadText(url).then(function(text) {
        var script = parseScript(text);
        var data = script;
        return data;
      });
    }
    function loadText(url) {
      return load(url, 'text');
    }
    function load(url, type) {
      return new Promise(function(ok, ng) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          ok(xhr.response);
        };
        xhr.onerror = ng;
        xhr.open('GET', url);
        if (type)
          xhr.responseType = type;
        xhr.send();
      });
    }
    READY.Player.ready({
      setPhase: setPhase,
      getSettingData: getSettingData,
      getScriptData: getScriptData,
      runScript: runScript
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
    Util.setDefalts(EP, {
      on: EP.addEventListener,
      requestFullscreen: EP.webkitRequestFullscreen || EP.mozRequestFullScreen,
      append: EP.appendChild,
      removeChildren: function() {
        this.innerHTML = '';
        return this;
      },
      setStyles: function(styles) {
        var $__0 = this;
        styles = styles || {};
        Object.keys(styles).forEach((function(key) {
          $__0.style[key] = styles[key];
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
    var el_root = query('#playerwrapper'),
        el_wrapper = new DOM('div'),
        el_player = new DOM('div'),
        el_context = new DOM('div');
    el_root.removeChildren();
    el_root.append(el_wrapper).append(el_player).append(el_context);
    function adjustScale(height, ratio, full) {
      if (!full)
        el_player.style.height = '100%';
      var ratio = ratio || 16 / 9;
      var width = height * ratio;
      el_player.style.fontSize = height / 20 + 'px';
      el_wrapper.style.height = height + 'px';
      el_wrapper.style.width = width + 'px';
      if (full)
        el_player.style.height = height + 'px';
      else
        fitScreen = NOP;
    }
    var el_debug = new DOM('div', {
      width: '640px',
      textAlign: 'center'
    });
    ;
    [240, 360, 480, 640, 720, 960, 1080].forEach((function(size) {
      var el = el_root.append(el_debug).append(new DOM('button'));
      el.append(new DOM('text', size + 'p'));
      el.on('click', (function(_) {
        return adjustScale(size);
      }));
    }));
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
    var el = el_root.append(el_debug).append(new DOM('button'));
    el.append(new DOM('text', 'フルスクリーン（横）'));
    el.on('click', (function(_) {
      el_player.requestFullscreen();
      fitScreen = (function(_) {
        var ratio = 16 / 9;
        var width = screen.width,
            height = screen.height;
        if (height * ratio > width)
          height = width / ratio;
        adjustScale(height, 0, true);
      });
      fitScreen();
      if (document.onmozfullscreenchange)
        View.showNotice('お使いのブラウザでは\n表示が崩れる場合があります', 3000);
      else
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
    var $scale = 480;
    var $ratio = 16 / 9;
    adjustScale($scale, $ratio);
    var fitScreen = NOP;
    window.onresize = (function(_) {
      return fitScreen();
    });
    document.onfullscreenchange = (function(_) {
      var full = document.fullscreenElement == el_player;
      if (!full)
        adjustScale($scale, $ratio);
    });
    var METHODS = {};
    METHODS = {COMMON: {
        initDisplay: function(opt) {
          Util.setDefalts(opt, {
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
          Util.setDefalts(opt, {
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
          this.el_test.textContent = text;
        }
      },
      NOVEL: {
        __proto__: METHODS.COMMON,
        initDisplay: function(opt) {
          Util.setDefalts(opt, {
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
            opt = Util.setDefalts(opt, {weight: 33});
            var length = text.length;
            var at = 0;
            var el = this.el_body;
            var weight = opt.weight;
            var cancelled = false;
            View.on('go').then((function(_) {
              return cancelled = true;
            }));
            return setAnimate((function(delay, complete) {
              if (cancelled) {
                el.append(new DOM('text', text.slice(at).replace(/\u200B/g, '')));
                return complete();
              }
              if (delay / weight < at)
                return;
              var str = text[at];
              if (str != '\u200B')
                el.append(new DOM('text', str));
              if (++at >= length)
                complete();
            }));
          }
        },
        addMessageWindow: function(opt) {
          Util.setDefalts(opt, {
            background: 'rgba(0,0,100,0.5)',
            boxShadow: 'rgba(0,0,100,0.5) 0px 0px 5px 5px',
            borderRadius: '1% / 1%',
            width: 'calc(100% - 10px - (2% + 2%))',
            height: 'calc( 30% - 10px - (4% + 2%))',
            fontSize: '100%',
            lineHeight: '1.3em',
            fontWeight: 'bold',
            padding: '4% 2% 2% 2%',
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
            width: '20%',
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
            left: 'calc((100% - 60%) / 2 - 10%)',
            width: '60%',
            top: '10%',
            boxShadow: 'rgba(100, 100, 255, 0.5) 0 0 2em',
            borderRadius: '3% / 5%',
            background: 'rgba(100, 100, 255, 0.3)',
            padding: '5% 10%'
          });
          opts.forEach(function(opt) {
            var bt = new DOM('button', {
              display: 'block',
              fontSize: '100%',
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
          el_context.style.backgroundImage = opt.url;
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
    var ViewProto = {
      __proto__: METHODS.COMMON,
      fresh: function() {
        View = {__proto__: ViewProto};
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
        ViewProto.__proto__ = METHODS[type];
        View.init(opt);
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
  READY('Player').next('設定読み込み', (function(_) {
    'use strict';
    Player.getSettingData().then((function(setting) {
      return Player.getScriptData(setting['初期スクリプト'][0]);
    })).next('待機', (function(script) {
      return READY('View').then((function(_) {
        View.changeMode('TEST');
        View.print('準備が完了しました。\nクリック（orエンターキー　orスペースキー）で次のページに進みます。');
        return script;
      }));
    })).on('go').next('実行', START);
    function START(script) {
      View.changeMode('NOVEL');
      Player.runScript(script).next('待機', (function(_) {
        View.changeMode('TEST');
        View.print('再生が終了しました。\nクリックするともう一度最初から再生します。');
      })).on('go').next('実行', (function(_) {
        return START(script);
      }));
    }
  }));
  return {};
});
System.get("ES6/コントローラー" + '');

//# sourceMappingURL=メイン.map
