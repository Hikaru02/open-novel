
READY().then( ({Util}) => {
	'use strict'

	function setPhase(phase) { document.title = '【' +phase+ '】' }
	function setRunPhase(kind) { setPhase(`${kind}中...`) }
	function setErrorPhase(kind) { setPhase(`${kind}エラー`) }


	function parseScript(text) {
		text = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\n/g, '\r\n') + '\r\n'
		text = text.replace(/^\/\/.*/gm, '')
		text = text.replace(/^\#(.*)/gm, (_, str) => `・マーク\r\n\t${str}`)
		//LOG(text)
		//global.text = text
		function parseOne(base, text) {
			var chanks = text.match(/[^\n]+?\n(\t+[\s\S]+?\n)+/g) || []
			chanks.forEach(chank => {
			
				var blocks = chank.replace(/^\t/gm,'').replace(/\n$/, '').match(/.+/g)
				//LOG(blocks)
				var act = blocks.shift().trim()
				var data = '\n' +blocks.join('\n')+ '\n'
				var ary = []
				if (act[0] !== '・') {
					base.push(['会話', [[act, blocks]]])
					return
				} else act = act.slice(1)
 
				if (data.match(/\t/)) {
					base.push([act, ary])
					//LOG(data)
					parseOne(ary, data)
				} else base.push([act, blocks])
			})
		}

		var base = []
		cacheEmogi(text)
		parseOne(base, text)
		return base

	}



	function copyObject(obj) {
		return JSON.parse(JSON.stringify(obj))
	}


	function otherName(name) {
		return function () { return this[name].apply(this, arguments) }
	}



	function cacheEmogi(text) {
		;(text.match(/\\\[.+\]/g) || []).forEach( eff => {
			var name = eff.slice(2, -1)
			Util.toBlobEmogiURL(name)
		})
	}



	var preloadAppend = (_ => {

		var buffer = []
		var max = 2
		var n = 0

		function next() {
			while (n < max) {
				var func = buffer.shift()
				if (!func) return
				++n
				Promise.resolve(func()).through(_ => {
					--n
					next()
				}).check()
			}
		}

		function append(func) {
			buffer.push(func)
			next()
		}

		return append

	})()



	function cacheScript(script, sname = script.sname) {

		if (!Array.isArray(script)) {
			LOG('不正なスクリプトのためキャッシュできない')
			LOG(script)
			return Promise.reject('不正なスクリプトのためキャッシュできない')
		}

		var {hashmark} = script
		if (!sname) LOG('!!!sname')

		script = copyObject(script)	

		var cacheHandlers = {
			会話: otherName('何もしない'),

			背景(data) {
				var name = data[0]
				append(['背景', name, 'jpg'])
			},

			立絵: otherName('立ち絵'),
			立ち絵(data) {
				//LOG(data)
				data.forEach( ary => {

					if (Util.isNoneType(ary)) return
					var [position, names] = ary
					if (!position) return
					if(!names) return

					var name = names[0]

					append(['立ち絵', name, 'png'])
				})
			},

			分岐系(data) {

				data.forEach(ary => {
					var value = ary[1]
					if (typeof value[0] == 'string') cacheHandlers['ジャンプ'](value)
					else cacheScript(value, sname)
				} )
					
			},

			選択: otherName('選択肢'),
			選択肢: otherName('分岐系'),

			ジャンプ(data) {

				var to = data[0]
				if (!to) return
				var name = to, base = sname
				var [name, mark = ''] = name.replace(/＃/g,'#').split('#')
				if (!name) name = base.replace(/＃/g,'#').split('#')[0]
				var subkey = `${Data.scenarioName}/${Util.forceName('シナリオ', name, 'txt')}`
				//LOG(subkey)
				if (!Util.cacheHas(subkey)) fetchScriptData(to, base).then( script => cacheScript(script) ).check()
				
			},

			変数: otherName('パラメータ'),
			パラメーター: otherName('パラメータ'),
			パラメータ: otherName('何もしない'),

			入力: otherName('何もしない'),

			繰返: otherName('繰り返し'),
			繰返し: otherName('繰り返し'),
			繰り返し: otherName('分岐系'),

			分岐: otherName('分岐系'),

			マーク: otherName('何もしない'),

			スクリプト: otherName('何もしない'),

			コメント: otherName('何もしない'),

			何もしない() {
			},

		}


		var defer = Promise.defer()
		var caching = 0

		function append(args, toURL = Util.toBlobURL) {
			++caching
			preloadAppend( _ => {
				return toURL(...args).through( _ => {
					if (--caching <= 0) defer.resolve()
				}).check()
			})
			//.then( url => LOG(`キャッシュ：${url} ${toURL.name} ${args}`) ).
		}


		script.forEach( prog => {
			try {

				if (!prog) return
				var act = prog[0].trim()
				var data = prog[1]

				if (act in cacheHandlers) {
					cacheHandlers[act](data)
				} else {
					LOG('キャッシュ中にサポートされていないコマンド『' +act+ '』に遭遇')
				}

			} catch (err) {
				LOG(`キャッシュ中にコマンド『${act}』で『${err}』が起きた`)
			}

		})

		//LOG(caching)
		if (caching == 0) defer.resolve()

		return defer.promise


	}



	function runScript(script, sname = script.sname, parentComp, masterComp) {

		if (!sname) LOG('!!!sname')
		sname = sname.split('#')[0]

		View.changeModeIfNeeded('NOVEL')
		Data.phase = 'play'
		document.title = `【${Data.scenarioName}】`

		var run = Promise.defer()
		if (!parentComp) parentComp = run.resolve
		if (!masterComp) masterComp = run.resolve

		var {mark: hashmark, params, scenario} = script

		var searching = !!hashmark
		if (params) Object.keys(params).forEach(name => Util.paramSet(name, params[name]))
		if (scenario) Player.setScenario(scenario)
		
		script = copyObject(script)	

		function runSubScript(script) { return runScript(script, sname, parentComp, masterComp) }
		function runChildScript(script) { return runScript(script, undefined, undefined, masterComp) }
		
		var actHandlers = {
			会話(data, done, failed) {

				function nextPage() {

					var ary = data.shift()
					if (!ary) return done()

					var name = ary[0], texts = ary[1]
					if (Util.isNoneType(name)) name = ''
					name = replaceEffect(name)
					View.nextPage(name)
					//Data.currentSpeakerName = name

					function nextSentence() {
						var text = texts.shift()
						if (!text) return nextPage()
						text = text.replace(/\\w(\d+)/g, (_, num) => {
							return '\u200B'.repeat(num)
						}).replace(/\\n/g, '\n')
						text = replaceEffect(text)
						//Data.currentSentence = text
						View.addSentence(text).on('go', nextSentence, failed)
					}
					nextSentence()
				}

				nextPage()
			},

			背景(data, done, failed) {
				var name = replaceEffect(data[0])
				Util.toBlobURL('背景', name, 'jpg').then( url => View.setBGImage({ url }) ).then(done, failed)
			},

			立絵: otherName('立ち絵'),
			立ち絵(data, done, failed) {
				//LOG(data)
				Promise.all(data.reduce((base, ary) => {

					if (!base) return

					if (Util.isNoneType(ary)) return base

					var [position, names] = ary

					if (!position) return failed('不正な位置検出')
					if(!names) return failed('不正な画像名検出') 

					position = replaceEffect(position)
					var name = replaceEffect(names[0])

					var a_type = ['left','right']['左右'.indexOf(position)]
					var v_type = 'top'
					var [a_per, v_per] = [0, 0]
					var height = null

					if (!a_type) {
						var pos = Util.toHalfWidth(position).match(/[+\-0-9.]+/g)
						if (!pos) return failed('不正な位置検出')
						var [a_pos, v_pos='0', height = null] = pos
						a_per = Math.abs(+a_pos)
						v_per = Math.abs(+v_pos)
						a_type = a_pos.match('-') ? 'right' : 'left'
						v_type = v_pos.match('-') ? 'bottom' : 'top'
						height = height != null ? `${+height}%` : null
					}

					base.push(Util.toBlobURL('立ち絵', name, 'png').then( url => ({ url, height, [a_type]: `${a_per}%`, [v_type]: `${v_per}%` }) ))
					return base
				}, [])).then( opt => View.setFDImages(opt) ).then(done, failed)
			},

			選択: otherName('選択肢'),
			選択肢(data, done, failed) {

				View.setChoiceWindow(data.map(ary => {
					return { name: replaceEffect(ary[0]), value: ary[1] }
				})).then( value => {
					if (typeof value[0] == 'string') actHandlers['ジャンプ'](value, done, failed)
					else runSubScript(value).then(done, failed)
				} )
					
			},

			ジャンプ(data, done, failed) {
				var to = replaceEffect(data[0])
				fetchScriptData(to, sname).then( script => runChildScript(script) ).then(done, failed)
			},

			変数: otherName('パラメータ'),
			パラメーター: otherName('パラメータ'),
			パラメータ(data, done, failed) {
				//LOG(data)
				data.forEach(str => {
					str = Util.toHalfWidth(str)
					str = str.match(/(.+)\:(.+)/)
					if (!str) return failed('不正なパラメータ指定検出') 
					var name = replaceEffect(str[1])
					var effect = str[2]
				//	if (isNoneType(effect)) effect = '""'
					if (!name) return failed('不正なパラメータ指定検出') 
					var eff = evalEffect(effect, failed)
					//LOG(name, effect, eff)
					Util.paramSet(name, eff)

				})
				done()
			},

			入力(data, done, failed) {
				//LOG(data)
				str = Util.toHalfWidth(data[0])
				if (!str) return failed('不正なパラメータ指定検出') 
				var str = /.+\:/.test(str) ? str.match(/(.+)\:(.*)/) : [, str, '""']

				var name = replaceEffect(str[1])
				var effect = str[2]
				var eff = evalEffect(effect, failed)
				//LOG(name, effect, eff)
				var rv = prompt('', eff) || eff
				Util.paramSet(name, rv)

				done()
			},

			繰返: otherName('繰り返し'),
			繰返し: otherName('繰り返し'),
			繰り返し(data, done, failed, i = 0) {
				i++
				if (i > 10000) return failed('繰り返し回数が多すぎる(10000回超え)')
				new Promise( (ok, ng) => {
	 				if (!data.some(([effect, acts]) => {
	 					if (!effect) return failed('不正なパラメータ指定検出') 
						var flag = !!evalEffect(effect, ng)
						if (flag) runSubScript(acts).then(ok, ng)
						return flag
					}) ) done()
				}).then( _ => actHandlers['繰り返し'](data, done, failed, i) ).catch(failed)
			},

			分岐(data, done, failed) {
 				if (!data.some(([effect, acts]) => {
 					if (!effect) return failed('不正なパラメータ指定検出') 
					var flag = !!evalEffect(effect, failed)
					if (flag) runSubScript(acts).then(done, failed)
					return flag
				}) ) done()
			},

			マーク(data, done, failed) {

				if (parentComp != run.resolve) return failed('このコマンドはトップレベルにおいてください')
				var params = {}
				Util.paramForEach( (value, key) => params[key] = value )
				var cp = {
					script: sname, 
					mark: data[0],
					params,
				}
				//LOG(cp)
				Data.currentPoint = cp
				done()
				Util.updateDebugWindow()
			},

			スクリプト(data, done, failed) {
				var act = data[0]
				if (Util.isNoneType(act)) return done()
				switch (act) {
					case '抜ける':
					case 'ぬける':
						run.resolve()
					break
					case '戻る':
					case 'もどる':
					case '帰る':
					case 'かえる':
						parentComp()
					break
					case '終わる':
					case '終る':
					case 'おわる':
						masterComp()
					break
					default:
					failed(`制御コマンド『${act}』`)

				}
			},

			コメント(data, done, failed) {
				done()
			},

		}

		function main_loop() {

			var act, loop = new Promise( (resolve, reject) => {

				var prog = script.shift()
				if (!prog) {
					return searching ? run.reject(`マーク『${hashmark}』が見つかりません。`) : run.resolve() 
				}
				act = prog[0].trim()
				var data = prog[1]

				if (searching) {
					if (act == 'マーク') {
						var mark = data[0]
						if (mark == hashmark) {
							searching = false
							return actHandlers['マーク']([mark], resolve, reject)
						}
					}
					resolve()
				} else if (act in actHandlers) {
					actHandlers[act](data, resolve, reject)
				} else {
					Util.error('サポートされていないコマンド『' +act+ '』を検出しました。\n\nこのコマンドを飛ばして再生が継続されます。')
					resolve()
				}

			}).then(main_loop, err => {
				var message = err ? `コマンド『${act}』で『${err}』が起こりました。` : `コマンド『${act}』が原因かもしれません。`
				Util.error('スクリプトを解析中にエラーが発生しました。\n\n' +message+ '\n\nこのコマンドを保証せず再生が継続されます。')
				return main_loop()
			})
		}

		//cacheScript(script, sname, 1)
		main_loop()
		return run.promise

	}



	function replaceEffect(str) {
		return str.replace(/\\{(.+?)}/g, (_, efect) => evalEffect(efect) )
	}


	function evalEffect(effect, failed) {
		effect = effect.trim()
		if (Util.isNoneType(effect)) return true
		effect = Util.toHalfWidth(effect)
		.replace(/\\/g,'\\\\')
		.replace(/\=\=/g, '=').replace(/[^!><=]\=/g, str => str.replace('=', '==') )
		.replace(/\&\&/g, '&').replace(/[^!><&]\&/g, str => str.replace('&', '&&') )
		.replace(/\|\|/g, '|').replace(/[^!><|]\|/g, str => str.replace('|', '||') )
		.replace(/^ー/, '-').replace(/([\u1-\u1000\s])(ー)/g, '$1-').replace(/(ー)([\u1-\u1000\s])/g, '-$2')
		if (!effect) return failed('不正なパラメータ指定検出') 
		if (/\'/.test(effect)) return failed('危険な記号の検出') 
		effect = effect.replace(/[^+\-*/%><!=?:()&|\s]+/g, str => {
			if (/^[0-9.]+$/.test(str)) return str
			if (/^"[^"]*"$/.test(str)) return str
			return `Util.paramGet('${str}')`
		})
		//LOG(effect)
		return eval(effect)
	}





	function print(message) {
		if (!View.print) View.changeMode('TEST')
		View.print(message)
	}



	function loadSaveData() {
		return Util.co(function* () {
			var saves = yield Storage.getSaveDatas(0, 100)
			var opts = saves.map( (save, i) => {
				var mark = save ? save.mark : '----------'
				var name = i === 0 ? 'Q' : i
				return {name: `${name}．${mark}`, value: save, disabled: !save }
			})
			var save = yield View.setChoiceWindow(opts, {sys: true})
			var {mark, params, script} = save
			return Player.fetchScriptData(`${script}#${mark}`).then( script => {
				script.params = params
				script.scenario = Data.scenarioName
				return script
			})
		})()
	}

	function saveSaveData() {
		return Util.co(function* () {
			var saves = yield Storage.getSaveDatas(0, 100)
			var opts = saves.map( (save, i) => {
				var mark = save ? save.mark : '----------'
				var name = i === 0 ? 'Q' : i
				return {name: `${name}．${mark}`, value: i}
			})
			// 注意
			var no = (yield View.setChoiceWindow(opts, {sys: true})) + 0

			var params = {}
			Util.paramForEach( (value, key) => params[key] = value )
			var save = Data.currentPoint

			return yield Storage.setSaveData(no, save)
			
		})()
	}


	function init() {
		Data.phase = 'pause'
		Player.setRunPhase('準備')
		Util.paramClear()
		View.clean()
	}

	function setScenario(scenario) {
		Data.scenarioName = scenario
	}


	function fetchSettingData(url) {
		return Util.loadText(url).then( text => {
			var setting = parseScript(text)
			var data = {}
			setting.forEach( ary => {
				data[ary[0]] = ary[1]
			})
			return data
		} )
	}


	function fetchScriptData(name, base) {
		if (!name) return Promise.reject('子スクリプト名が不正')
		var [name, mark = ''] = name.replace(/＃/g,'#').split('#')
		if (!name) {
			if (!base) return Promise.reject('親スクリプト名が必要')
			name = base.replace(/＃/g,'#').split('#')[0]
		}
		return Util.toBlobScriptURL(name).then(Util.loadText).then( text => parseScript(text) ).then(script => {
			script.unshift(['マーク',['']])
			script.mark = mark
			script.sname = name
			return script
		})
	}

	
	READY.Player.ready({
		setRunPhase, setErrorPhase, fetchSettingData, fetchScriptData, runScript, print,
		loadSaveData, saveSaveData, evalEffect, init, setScenario, cacheScript,
	})

}).check()