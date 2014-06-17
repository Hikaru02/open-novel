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
    Util.overrides = {
      Promise: $Promise,
      R: Promise.resolve()
    };
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
      Data: Data
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
        scenario;
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
        var scenario = Player.data.scenarioName;
        return new Promise((function(ok, ng) {
          var saves = new Array(to - from + 1);
          var ts = db.transaction('savedata', 'readonly');
          var os = ts.objectStore('savedata');
          for (var no = from; no <= to; ++no) {
            var rq = os.get(scenario + '/' + no);
            rq.onsuccess = ((function(rq, no) {
              return (function(_) {
                saves[no - from] = rq.result;
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
        var scenario = Player.data.scenarioName;
        return new Promise((function(ok, ng) {
          var ts = db.transaction('savedata', 'readwrite');
          var os = ts.objectStore('savedata');
          var rq = os.put(data, scenario + '/' + no);
          ts.oncomplete = (function(_) {
            return ok();
          });
          ts.onabort = (function(_) {
            return ng(("ストレージの書込に失敗（" + ts.error.message + ")"));
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
      }
    };
    new Promise((function(ok, ng) {
      var rq = indexedDB.open("open-novel", 5);
      rq.onupgradeneeded = (function(evt) {
        var db = rq.result;
        var ov = evt.oldVersion;
        if (ov < 3)
          db.createObjectStore('savedata');
        if (ov < 5)
          db.createObjectStore('setting');
      });
      rq.onsuccess = (function(_) {
        return ok(rq.result);
      });
      rq.onerror = (function(err) {
        return ng(("ストレージが開けない（" + err.message + ")"));
      });
    })).then((function(val) {
      db = val;
      READY.Storage.ready(Storage);
    }));
  })).check();
  return {};
});
System.get("ES6/ストレージ" + '');
System.register("ES6/プレーヤー", [], function() {
  "use strict";
  var __moduleName = "ES6/プレーヤー";
  READY().then((function(_) {
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
    function runScript(script, scenario, parentComp, masterComp) {
      var $__4;
      var $__2;
      View.changeModeIfNeeded('NOVEL');
      Player.data.phase = 'play';
      document.title = ("【" + Player.data.scenarioName + "】");
      var run = Promise.defer();
      if (!parentComp)
        parentComp = run.resolve;
      if (!masterComp)
        masterComp = run.resolve;
      var hashmark = script.mark;
      var searching = !!hashmark;
      script = copyObject(script);
      if (scenario) {
        var $__3 = $traceurRuntime.assertObject(scenario.replace(/＃/g, '#').split('#')),
            name = $__3[0],
            mark = ($__4 = $__3[1]) === void 0 ? '' : $__4;
        if (!name)
          name = Player.data.currentScriptName.replace(/＃/g, '#').split('#')[0];
        scenario = mark ? name + '#' + mark : name;
        Player.data.currentScriptName = scenario;
      }
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
            name = replaceEffect(name);
            View.nextPage(name);
            Player.data.currentSpeakerName = name;
            function nextSentence() {
              var text = texts.shift();
              if (!text)
                return nextPage();
              text = text.replace(/\\w(\d+)/g, (function(_, num) {
                return '\u200B'.repeat(num);
              })).replace(/\\n/g, '\n');
              text = replaceEffect(text);
              Player.data.currentSentence = text;
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
          var name = replaceEffect(data[0]);
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
            position = replaceEffect(position);
            var name = replaceEffect(names[0]);
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
              name: replaceEffect(ary[0]),
              value: ary[1]
            };
          }))).then((function(value) {
            if (typeof value[0] == 'string')
              actHandlers['ジャンプ'](value, done, failed);
            else
              runScript(value, null, parentComp, masterComp).then(done, failed);
          }));
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "ジャンプ", {
        value: function(data, done, failed) {
          var to = replaceEffect(data[0]);
          fetchScriptData(to).then((function(script) {
            return runScript(script, to, null, masterComp);
          })).then(done, failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "変数", {
        value: otherName('パラメータ'),
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
            var name = replaceEffect(str[1]);
            var effect = str[2];
            if (!name)
              return failed('不正なパラメータ指定検出');
            var eff = evalEffect(effect, failed);
            paramSet(name, eff);
          }));
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "入力", {
        value: function(data, done, failed) {
          LOG(data);
          str = Util.toHalfWidth(data[0]);
          if (!str)
            return failed('不正なパラメータ指定検出');
          var str = /.+\:/.test(str) ? str.match(/(.+)\:(.*)/) : [, str, '""'];
          var name = replaceEffect(str[1]);
          var effect = str[2];
          var eff = evalEffect(effect, failed);
          LOG(name, effect, eff);
          var rv = prompt('', eff) || eff;
          paramSet(name, rv);
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "繰返", {
        value: otherName('繰り返し'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "繰返し", {
        value: otherName('繰り返し'),
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "繰り返し", {
        value: function(data, done, failed) {
          var i = arguments[3] !== (void 0) ? arguments[3] : 0;
          i++;
          if (i > 10000)
            return failed('繰り返し回数が多すぎる(10000回超え)');
          new Promise((function(ok, ng) {
            if (!data.some((function($__3) {
              var effect = $__3[0],
                  acts = $__3[1];
              if (!effect)
                return failed('不正なパラメータ指定検出');
              var flag = !!evalEffect(effect, ng);
              if (flag)
                runScript(acts, null, parentComp, masterComp).then(ok, ng);
              return flag;
            })))
              done();
          })).then((function(_) {
            return actHandlers['繰り返し'](data, done, failed, i);
          })).catch(failed);
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "分岐", {
        value: function(data, done, failed) {
          if (!data.some((function($__3) {
            var effect = $__3[0],
                acts = $__3[1];
            if (!effect)
              return failed('不正なパラメータ指定検出');
            var flag = !!evalEffect(effect, failed);
            if (flag)
              runScript(acts, null, parentComp, masterComp).then(done, failed);
            return flag;
          })))
            done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "マーク", {
        value: function(data, done, failed) {
          if (parentComp != run.resolve)
            return failed('このコマンドはトップレベルにおいてください');
          var params = {};
          paramForEach((function(value, key) {
            return params[key] = value;
          }));
          var cp = {
            script: Player.data.currentScriptName,
            speakerName: Player.currentSpeakerName,
            sentence: Player.currentSentence,
            mark: data[0],
            params: params
          };
          Player.data.currentPoint = cp;
          done();
        },
        configurable: true,
        enumerable: true,
        writable: true
      }), Object.defineProperty($__2, "スクリプト", {
        value: function(data, done, failed) {
          var act = data[0];
          if (Util.isNoneType(act))
            return done();
          switch (act) {
            case '抜ける':
            case 'ぬける':
              run.resolve();
              break;
            case '戻る':
            case 'もどる':
            case '帰る':
            case 'かえる':
              parentComp();
              break;
            case '終わる':
            case '終る':
            case 'おわる':
              masterComp();
              break;
            default:
              failed(("制御コマンド『" + act + "』"));
          }
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
              if (!prog) {
                return searching ? run.reject(("マーク『" + hashmark + "』が見つかりません。")) : run.resolve();
              }
              act = prog[0].trim();
              var data = prog[1];
              if (searching) {
                if (act == 'マーク') {
                  var mark = data[0];
                  if (mark == hashmark) {
                    searching = false;
                    return actHandlers['マーク']([mark], resolve, reject);
                  }
                }
                resolve();
              } else if (act in actHandlers) {
                actHandlers[act](data, resolve, reject);
              } else {
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
        return ("paramGet('" + str + "')");
      }));
      return eval(effect);
    }
    function updateDebugWindow() {
      if (!Data.debug)
        return;
      var params = {};
      paramForEach((function(value, key) {
        return params[key] = value;
      }));
      var cacheSizeMB = ((cacheBlobMap.get('$size') || 0) / 1024 / 1024).toFixed(1);
      var mark = Player.data.currentPoint && Player.data.currentPoint.mark || '（無し）';
      var obj = {
        キャッシュサイズ: cacheSizeMB + 'MB',
        直近のマーク: mark,
        パラメータ: params
      };
      View.updateDebugWindow(obj);
    }
    function toBlobEmogiURL(name) {
      return toBlobURL('絵文字', name, 'svg');
    }
    function toBlobScriptURL(name) {
      return toBlobURL('シナリオ', name, 'txt');
    }
    function toBlobURL(kind, name, type) {
      var sys = arguments[3] !== (void 0) ? arguments[3] : false;
      var root = sys ? 'エンジン' : 'データ';
      var sub = Util.forceName(kind, name, type);
      var subkey = sys ? ("" + sub) : (Player.data.scenarioName + "/" + sub);
      if (Util.isNoneType(name))
        return Promise.resolve(null);
      if (cacheBlobMap.has(subkey))
        return Promise.resolve(cacheBlobMap.get(subkey));
      var hide = View.setLoadingMessage('Loading...');
      return new Promise((function(ok, ng) {
        find((root + "/" + subkey)).catch((function(_) {
          return (root + "/[[共通素材]]/" + sub);
        })).then((function(url) {
          return ok(url);
        }), ng);
      })).then(loadBlob).then((function(blob) {
        var blobURL = URL.createObjectURL(blob);
        cacheBlobMap.set(subkey, blobURL);
        cacheBlobMap.set('$size', (cacheBlobMap.get('$size') || 0) + blob.size);
        hide();
        return blobURL;
      })).through(hide);
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
    function fetchScriptData(name, scenarioBind) {
      var $__4;
      if (!name)
        return Promise.reject('スクリプト名が不正');
      var $__3 = $traceurRuntime.assertObject(name.replace(/＃/g, '#').split('#')),
          name = $__3[0],
          mark = ($__4 = $__3[1]) === void 0 ? '' : $__4;
      if (!name)
        name = Player.data.currentScriptName.replace(/＃/g, '#').split('#')[0];
      if (scenarioBind)
        Player.data.currentScriptName = name;
      return toBlobScriptURL(name).then(loadText).then((function(text) {
        return parseScript(text);
      })).then((function(script) {
        script.unshift(['マーク', ['']]);
        script.mark = mark;
        return script;
      }));
    }
    function fetchSEData(name, sys) {
      return toBlobURL('効果音', name, 'wav', sys);
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
    function print(message) {
      if (!View.print)
        View.changeMode('TEST');
      View.print(message);
    }
    function save(no) {
      var cp = Player.data.currentPoint;
      if (!cp)
        return Promise.reject('直近のセーブポイントが見つかりません。');
      return Storage.setSaveData(no, cp);
    }
    function loadSaveData() {
      return Util.co($traceurRuntime.initGeneratorFunction(function $__6() {
        var saves,
            opts,
            save,
            $__3,
            mark,
            params,
            script,
            $__7,
            $__8,
            $__9;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return Storage.getSaveDatas(0, 100);
              case 2:
                saves = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                opts = saves.map((function(save, i) {
                  var mark = save ? save.mark : '----------';
                  var name = i === 0 ? 'Q' : i;
                  return {
                    name: (name + "．" + mark),
                    value: save,
                    disabled: !save
                  };
                }));
                $ctx.state = 18;
                break;
              case 18:
                $ctx.state = 6;
                return View.setChoiceWindow(opts, {sys: true});
              case 6:
                save = $ctx.sent;
                $ctx.state = 8;
                break;
              case 8:
                $__3 = $traceurRuntime.assertObject(save), mark = $__3.mark, params = $__3.params, script = $__3.script;
                Object.keys(params).forEach((function(name) {
                  return Player.paramSet(name, params[name]);
                }));
                $ctx.state = 20;
                break;
              case 20:
                $__7 = Player.fetchScriptData;
                $__8 = $__7.call(Player, (script + "#" + mark), true);
                $ctx.state = 14;
                break;
              case 14:
                $ctx.state = 10;
                return $__8;
              case 10:
                $__9 = $ctx.sent;
                $ctx.state = 12;
                break;
              case 12:
                $ctx.returnValue = $__9;
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__6, this);
      }))();
    }
    function saveSaveData() {
      return Util.co($traceurRuntime.initGeneratorFunction(function $__6() {
        var saves,
            opts,
            no,
            params,
            save,
            $__10,
            $__11,
            $__12,
            $__13,
            $__14,
            $__15;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return Storage.getSaveDatas(0, 100);
              case 2:
                saves = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                opts = saves.map((function(save, i) {
                  var mark = save ? save.mark : '----------';
                  var name = i === 0 ? 'Q' : i;
                  return {
                    name: (name + "．" + mark),
                    value: i
                  };
                }));
                $ctx.state = 22;
                break;
              case 22:
                $__10 = View.setChoiceWindow;
                $__11 = $__10.call(View, opts, {sys: true});
                $ctx.state = 10;
                break;
              case 10:
                $ctx.state = 6;
                return $__11;
              case 6:
                $__12 = $ctx.sent;
                $ctx.state = 8;
                break;
              case 8:
                no = $__12 + 0;
                $ctx.state = 12;
                break;
              case 12:
                params = {};
                paramForEach((function(value, key) {
                  return params[key] = value;
                }));
                save = Player.data.currentPoint;
                $ctx.state = 24;
                break;
              case 24:
                $__13 = Storage.setSaveData;
                $__14 = $__13.call(Storage, no, save);
                $ctx.state = 18;
                break;
              case 18:
                $ctx.state = 14;
                return $__14;
              case 14:
                $__15 = $ctx.sent;
                $ctx.state = 16;
                break;
              case 16:
                $ctx.returnValue = $__15;
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__6, this);
      }))();
    }
    function init() {
      Player.data = {};
      Player.data.phase = 'pause';
      Player.setRunPhase('準備');
      Player.paramClear();
      View.clean();
    }
    function setScenario(scenario) {
      var _scenario = Player.data.scenarioName;
      Player.data.scenarioName = scenario ? scenario : _scenario;
    }
    var cacheBlobMap = new Map;
    function cacheClear() {
      cacheBlobMap.forEach((function(subURL, blobURL) {
        URL.revokeObjectURL(blobURL);
      }));
      cacheBlobMap.clear();
      cacheBlobMap.set('$size', 0);
      updateDebugWindow();
    }
    var $__3 = $traceurRuntime.assertObject(((function(_) {
      var paramMap = new Map;
      return [(function(key, val) {
        paramMap.set(key, val);
        updateDebugWindow();
      }), (function(key) {
        if (!paramMap.has(key)) {
          paramMap.set(key, 0);
          updateDebugWindow();
        }
        return paramMap.get(key);
      }), (function(_) {
        paramMap.clear();
        updateDebugWindow();
      }), (function(func) {
        paramMap.forEach(func);
      })];
    }))()),
        paramSet = $__3[0],
        paramGet = $__3[1],
        paramClear = $__3[2],
        paramForEach = $__3[3];
    READY.Player.ready({
      setRunPhase: setRunPhase,
      setErrorPhase: setErrorPhase,
      fetchSettingData: fetchSettingData,
      fetchScriptData: fetchScriptData,
      fetchSEData: fetchSEData,
      runScript: runScript,
      print: print,
      cacheClear: cacheClear,
      paramClear: paramClear,
      toBlobURL: toBlobURL,
      toBlobEmogiURL: toBlobEmogiURL,
      find: find,
      save: save,
      data: {},
      loadSaveData: loadSaveData,
      saveSaveData: saveSaveData,
      paramSet: paramSet,
      paramGet: paramGet,
      evalEffect: evalEffect,
      init: init,
      setScenario: setScenario
    });
  })).check();
  return {};
});
System.get("ES6/プレーヤー" + '');
System.register("ES6/ビュー", [], function() {
  "use strict";
  var __moduleName = "ES6/ビュー";
  READY('Storage', 'Player', 'DOM').then((function(_) {
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
        var $__16 = this;
        styles = styles || {};
        Object.keys(styles).forEach((function(key) {
          if (styles[key] != null)
            $__16.style[key] = styles[key];
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
    [360, 480, 720, 1080].forEach((function(size) {
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
    el.append(new DOM('text', '右クリック'));
    el.on('click', (function(_) {
      fireEvent('Rclick');
    }));
    var el = el_debugSub.append(new DOM('button', bs));
    el.append(new DOM('text', 'サウンド有無'));
    el.on('click', (function(_) {
      var e = !Sound.soundEnabled;
      Sound.soundEnabled = e;
      Storage.setSetting('soundEnabled', e).check();
      View.showNotice(("サウンドを" + (e ? '有' : '無') + "効にしました"));
    }));
    var el_debugSub = createDdebugSub();
    var el = el_debugSub.append(new DOM('button', bs));
    el.append(new DOM('text', 'キャシュ削除'));
    el.on('click', (function(_) {
      Player.cacheClear();
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
          var $__16 = this;
          Util.setDefaults(opt, {
            color: 'rgba(255,255,255,0.9)',
            textShadow: 'rgba(0,0,0,0.9) 0.1em 0.1em 0.1em',
            overflow: 'hidden'
          });
          this.__proto__.__proto__.initDisplay(opt);
          this.mainMessageWindow = this.addMessageWindow({z: 10});
          this.imageFrame = this.addImageFrame({z: 20});
          View.on('menu').then((function(_) {
            return $__16.showMenu();
          })).check();
        },
        messageWindowProto: {
          nextPage: function(name) {
            var $__18;
            var $__17 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
                sys = ($__18 = $__17.sys) === void 0 ? false : $__18;
            View.windows.message.setStyles({
              background: sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)',
              boxShadow: (sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)') + ' 0 0 0.5em 0.5em'
            });
            name = !name || name.match(/^\s+$/) ? '' : '【' + name + '】';
            this.el_title.textContent = name;
            this.el_body.removeChildren();
          },
          addSentence: function(text, opt) {
            text += '\n';
            opt = Util.setDefaults(opt, {weight: 25});
            var length = text.length;
            var at = 0,
                nl = 0;
            var el = this.el_body;
            var weight = opt.weight;
            var $__17 = [false, false],
                aborted = $__17[0],
                cancelled = $__17[1];
            var $__17 = [(function(_) {
              return aborted = true;
            }), (function(_) {
              return cancelled = true;
            })],
                abort = $__17[0],
                cancel = $__17[1];
            View.on('go').then(cancel);
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
                if (str == '\\' && /\[.+\]/.test(text.slice(at))) {
                  var nat = text.indexOf(']', at);
                  var name = text.slice(at + 2, nat).trim();
                  if ($isWebkit) {
                    var img = el.append(new DOM('img', {
                      height: '0.75em',
                      width: '0.75em'
                    }));
                    ;
                    ((function(img, name) {
                      return Player.toBlobEmogiURL(name).then((function(url) {
                        img.src = url;
                      })).catch(LOG);
                    }))(img, name);
                  } else {
                    var img = el.append(new DOM('object', {
                      height: '0.75em',
                      width: '0.75em'
                    }));
                    img.type = 'image/svg+xml';
                    ;
                    ((function(img, name) {
                      return Player.toBlobEmogiURL(name).then((function(url) {
                        img.data = url;
                      })).catch(LOG);
                    }))(img, name);
                  }
                  nl += nat - at;
                  at = nat;
                } else if (str != '\u200B')
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
            background: 'rgba(50,50,50,0.5)',
            boxShadow: 'rgba(50,50,50,0.5) 0 0 0.5em 0.5em',
            borderRadius: '1% / 1%',
            width: 'calc(100% - 0.5em - (2% + 2%))',
            height: 'calc( 25% - 0.5em - (4% + 2%))',
            fontSize: '100%',
            lineHeight: '1.5em',
            fontWeight: 'bold',
            padding: '4% 2% 2% 2%',
            whiteSpace: 'nowrap',
            position: 'absolute',
            bottom: '0.25em',
            left: '0.25em',
            zIndex: opt.z || 1400
          });
          var el = new DOM('div', opt);
          this.windows.message = el;
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
          var $__18;
          var $__17 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
              sys = ($__18 = $__17.sys) === void 0 ? false : $__18;
          var defer = Promise.defer();
          var removed = false;
          var focusbt;
          var focusindex = -10000;
          var bts = [];
          var cw = new DOM('div', {
            position: 'absolute',
            left: 'calc((100% - 70%) / 2 - 5%)',
            width: '70%',
            top: '5%',
            boxShadow: sys ? 'rgba(100, 255, 150, 0.5) 0 0 5em' : 'rgba(100, 100, 255, 0.3) 0 0 5em',
            borderRadius: '3% / 5%',
            background: sys ? 'rgba(100, 255, 150, 0.5)' : 'rgba(100, 100, 255, 0.3)',
            padding: '0% 5%',
            overflowY: opts.length > 3 ? 'scroll' : 'hidden',
            maxHeight: '70%'
          });
          if (!sys) {
            if (this.windows.choice)
              this.windows.choice.remove();
            this.windows.choice = cw;
          } else {
            if (this.windows.choiceBack)
              this.windows.choiceBack.remove();
            this.windows.choiceBack = cw;
          }
          opts.forEach(function(opt) {
            var $__16 = this;
            if (!('value' in opt))
              opt.value = opt.name;
            var bt = new DOM('button', {
              display: 'block',
              fontSize: '1.5em',
              boxShadow: 'inset 0 1px 3px #F1F1F1, inset 0 -15px ' + (sys ? 'rgba(0,116,116,0.2)' : 'rgba(0,0,223,0.2)') + ', 1px 1px 2px #E7E7E7',
              background: sys ? 'rgba(0,100,50,0.8)' : 'rgba(0,0,100,0.8)',
              color: 'white',
              borderRadius: '5% / 50%',
              width: '100%',
              height: '2.5em',
              margin: '5% 0%',
              textShadow: 'rgba(0,0,0,0.9) 0em 0em 0.5em'
            });
            bt.disabled = !!opt.disabled;
            bt.append(new DOM('text', opt.name));
            bt.onfocus = bt.onmouseover = (function(_) {
              Sound.playSysSE('フォーカス');
              focusindex = index;
              bt.setStyles({background: sys ? 'rgba(100,200,150,0.8)' : 'rgba(100,100,200,0.8)'});
            });
            bt.onblur = bt.onmouseout = (function(_) {
              bt.setStyles({background: sys ? 'rgba(0,100,50,0.8)' : 'rgba(0,0,100,0.8)'});
            });
            bt.onclick = (function(_) {
              removed = true;
              Sound.playSysSE('選択');
              defer.resolve(opt.value);
              if (!sys)
                delete $__16.windows.choice;
              else
                delete $__16.windows.choiceBack;
              cw.remove();
            });
            cw.append(bt);
            if (!opt.disabled)
              var index = bts.push(bt) - 1;
          }, this);
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
            Promise.delay(200).then(rehook);
          }
          function focusenter(rehook) {
            if (removed)
              return;
            if (focusindex >= 0)
              return bts[focusindex].click();
            Promise.delay(200).then(rehook);
          }
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
        },
        showMenu: function() {
          var $__16 = this;
          if (Player.data.phase != 'play' || View.menuIndex > 0)
            return View.on('Rclick').then((function(_) {
              return View.showMenu();
            }));
          View.menuIndex = (View.menuIndex || 0) + 1;
          blockEvent();
          View.on('menu').then((function(_) {
            if ($__16.windows.choiceBack)
              $__16.windows.choiceBack.remove();
            View.hideMenu();
          })).check();
          Object.keys(View.windows).forEach((function(key) {
            var el = View.windows[key];
            el.hidden = !el.hidden;
          }));
          View.setChoiceWindow([{name: 'セーブ'}, {name: 'ロード'}], {sys: true}).then((function(kind) {
            switch (kind) {
              case 'セーブ':
                Player.saveSaveData().check().through(View.hideMenu).then((function(_) {
                  return View.showNotice('セーブしました。');
                }), (function(err) {
                  return View.showNotice('セーブに失敗しました。');
                }));
                break;
              case 'ロード':
                Player.loadSaveData().through((function(_) {
                  View.hideMenu();
                  Player.init();
                })).then(Player.runScript);
                break;
              default:
                throw 'illegal choice type';
            }
          }));
        },
        hideMenu: function() {
          if (!View.menuIndex)
            return;
          --View.menuIndex;
          allowEvent();
          View.on('menu').then((function(_) {
            return View.showMenu();
          }));
          Object.keys(View.windows).forEach((function(key) {
            var el = View.windows[key];
            el.hidden = !el.hidden;
          }));
        }
      }
    };
    var $__17 = $traceurRuntime.assertObject(((function(_) {
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
      document.addEventListener('keydown', (function(evt) {
        var type = keyboardTable[evt.keyCode];
        if (type)
          onEvent(type, evt);
      }), true);
      el_wrapper.addEventListener('mousedown', (function(evt) {
        var type = 'LMR'[evt.button];
        if (type)
          onEvent(type + 'click', evt);
      }), true);
      el_wrapper.addEventListener('contextmenu', (function(evt) {
        onEvent('contextmenu', evt);
      }), true);
      function onEvent(type, evt) {
        if (evt) {
          evt.preventDefault();
          evt.stopImmediatePropagation();
        }
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
          case 'go':
            return ['Lclick', 'enter', 'space'];
          case 'menu':
            return ['Rclick', 'backspace'];
          case 'Rclick':
          case 'left':
          case 'up':
          case 'right':
          case 'down':
          case 'enter':
            return [kind];
          default:
            throw 'illegal hook event type';
        }
      }
      return [function hookInput(kind, resolve) {
        var hook = toHook(kind);
        hook.resolve = resolve;
        hook.blocked = 0;
        hooks.push(hook);
      }, function hookClear() {
        hooks.length = 0;
      }, function blockEvent() {
        hooks.forEach((function(hook) {
          return ++hook.blocked;
        }));
      }, function allowEvent() {
        hooks.forEach((function(hook) {
          return --hook.blocked;
        }));
      }, function fireEvent(type) {
        onEvent(type);
      }];
    }))()),
        hookInput = $__17[0],
        hookClear = $__17[1],
        blockEvent = $__17[2],
        allowEvent = $__17[3],
        fireEvent = $__17[4];
    var $full = false;
    var $ratio = 16 / 9;
    var $mode = '';
    var width = document.body.clientWidth * devicePixelRatio;
    var $scale = width / $ratio >= 480 ? 480 : width / $ratio;
    METHODS.TEST.changeMode('TEST');
    var p = adjustScale($scale / devicePixelRatio, $ratio);
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
  READY('Storage', 'View').then(Util.co($traceurRuntime.initGeneratorFunction(function $__21() {
    var soundEnabled,
        sysSEMap,
        R;
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
            sysSEMap = new Map;
            R = $traceurRuntime.assertObject(Util.overrides).R;
            READY.Sound.ready({
              playSysSE: function(name, opt) {
                if (!this.soundEnabled)
                  return R;
                var defer = Promise.defer();
                var a = sysSEMap.get(name);
                if (!a) {
                  a = new Audio(("エンジン/効果音/" + name + ".ogg"));
                  sysSEMap.set(name, a);
                  a.oncanplaythrough = (function(_) {
                    a.oncanplaythrough = null;
                    Sound.playSysSE(name, opt).then(defer.resolve);
                  });
                } else {
                  a.currentTime = 0;
                  a.volume = 0.5;
                  a.onplay = (function(_) {
                    return defer.resolve({ended: new Promise((function(ok) {
                        return a.onended = ok;
                      }))});
                  });
                  a.play();
                }
                return defer.promise;
              },
              fadeoutSysSE: function(name) {
                var $__20;
                var opt = arguments[1] !== (void 0) ? arguments[1] : {};
                if (!this.soundEnabled)
                  return R;
                var defer = Promise.defer();
                var a = sysSEMap.get(name);
                if (!a) {
                  LOG(("対象のサウンド『" + name + "』が未登録"));
                  return R;
                }
                var volume = a.volume;
                var $__19 = $traceurRuntime.assertObject(opt),
                    duration = ($__20 = $__19.duration) === void 0 ? 500 : $__20;
                View.setAnimate((function(delay, complete, pause) {
                  var newvolume = volume * (1 - delay / duration);
                  if (newvolume <= 0) {
                    newvolume = 0;
                    complete();
                  }
                  a.volume = newvolume;
                })).then(defer.resolve);
                return defer.promise;
              },
              soundEnabled: soundEnabled
            });
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__21, this);
  }))).check();
  return {};
});
System.get("ES6/サウンド" + '');
System.register("ES6/ゲーム", [], function() {
  "use strict";
  var __moduleName = "ES6/ゲーム";
  READY('Player', 'View', 'Sound').then((function(_) {
    'use strict';
    var R = $traceurRuntime.assertObject(Util.overrides).R;
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
    var setup = Util.co($traceurRuntime.initGeneratorFunction(function $__23() {
      var setting,
          scenario,
          script;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              Player.init();
              setSysBG();
              $ctx.state = 28;
              break;
            case 28:
              $ctx.state = 2;
              return Player.fetchSettingData(Data.URL.ContentsSetting);
            case 2:
              setting = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              View.on('menu').then(setup);
              message('再生する作品を選んでください');
              $ctx.state = 30;
              break;
            case 30:
              $ctx.state = 6;
              return new Promise((function(ok, ng) {
                var novels = setting['作品'];
                if (!novels || !novels.length)
                  return message('再生できる作品がありません。\n『データ/作品.txt』を見なおしてください');
                if (novels.length === 1)
                  return ok(novels[0]);
                var opts = novels.reduce((function(opts, name) {
                  opts.push({name: name});
                  return opts;
                }), []);
                View.setChoiceWindow(opts, {sys: true}).then(ok, ng);
              }));
            case 6:
              scenario = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              Player.setScenario(scenario);
              $ctx.state = 32;
              break;
            case 32:
              $ctx.state = 10;
              return Player.fetchSettingData(("データ/" + scenario + "/設定.txt"));
            case 10:
              setting = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              message('『' + scenario + '』の\nどこから開始するか選んでください');
              $ctx.state = 34;
              break;
            case 34:
              $ctx.state = 14;
              return new Promise((function(ok, ng) {
                var opts = ['初めから', '続きから', '任意の場所から'].reduce((function(opts, name) {
                  opts.push({name: name});
                  return opts;
                }), []);
                return View.setChoiceWindow(opts, {sys: true}).then((function(kind) {
                  switch (kind) {
                    case '初めから':
                      Player.fetchScriptData(setting['開始シナリオ'][0], true).then(ok, ng);
                      break;
                    case '続きから':
                      Player.loadSaveData().then(ok, ng);
                      break;
                    case '任意の場所から':
                      var name = prompt('『<スクリプト名>』または『<スクリプト名>#<マーク名>』の形式で指定します');
                      if (!name)
                        return message('作品選択メニューに戻ります。').delay(1000).then(setup);
                      Player.fetchScriptData(name, true).then(ok, (function(err) {
                        message('指定されたファイルを読み込めません。').delay(1000).then(setup);
                      }));
                      break;
                    default:
                      throw 'illegal start type';
                  }
                }));
              }));
            case 14:
              script = $ctx.sent;
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = 18;
              return message('').then((function(_) {
                View.clean();
                return Player.runScript(script);
              }));
            case 18:
              $ctx.maybeThrow();
              $ctx.state = 20;
              break;
            case 20:
              View.clean();
              Player.setRunPhase('準備');
              $ctx.state = 36;
              break;
            case 36:
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
      }, $__23, this);
    }));
    var restart = Util.co($traceurRuntime.initGeneratorFunction(function $__24(err) {
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
      }, $__24, this);
    }));
    var start = Util.co($traceurRuntime.initGeneratorFunction(function $__25() {
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
              View.changeMode('NOVEL');
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 6;
              return Promise.all([setSysBG(false), Promise.race([Promise.all([Sound.playSysSE('起動').then((function() {
                var ended = $traceurRuntime.assertObject(arguments[0] !== (void 0) ? arguments[0] : {}).ended;
                return ended || R;
              })), View.addSentence('openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion, {weight: 0}).delay(3000)]), View.on('go')]).through((function(_) {
                return Sound.fadeoutSysSE('起動');
              }))]).check();
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
      }, $__25, this);
    }));
    function setSysBG() {
      var view = arguments[0] !== (void 0) ? arguments[0] : true;
      var p = Player.toBlobURL('画像', '背景', 'png', true);
      return view ? p.then((function(url) {
        return View.setBGImage({url: url});
      })) : p;
    }
    start();
    READY.Game.ready({reset: function() {
        setup();
      }});
  })).check();
  return {};
});
System.get("ES6/ゲーム" + '');

//# sourceMappingURL=メイン.map
