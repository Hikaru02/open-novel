
READY().then( ({Util}) => {
	'use strict'


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



	function flattenScript(script) {

		var buf = []


		function flatten(script) {

			var bk = []
			var q = 0

			script.forEach(prog => {

				bk.forEach( n => { buf[n] = buf.length - (q?1:0) } )
				bk = []
				if (q) buf[q] = buf.length 
				q = 0

				var [act, data] = prog


				switch (act) {
					
					case '繰返': case '繰返し': case '繰り返し':

						q = buf.length +2

					case '選択': case '選択肢':
					case '分岐':

						var cp = buf.push(act, null) -1

						if (q) buf.push(-1)

						buf[cp] = data.map( ([lab, val]) => {
							if (Array.isArray(val[0])) {
								var p = buf.length
								bk.push(flatten(val))
								val = p
							}
							return [lab, val]
						})

						if (q) {
							buf[cp].unshift(q)
							buf.push(cp -1)
						}

					break
					default:

						buf.push(act, data)

				}

			})

			return buf.push(-1) -1

		}

		flatten(script)
		return buf
	}



	function cacheScript(script, sname = script.sname) {

		if (!Array.isArray(script)) {
			LOG('不正なスクリプトのためキャッシュできない')
			LOG(script)
			return Promise.reject('不正なスクリプトのためキャッシュできない')
		}

		if (!sname) LOG('!!!sname')

		script = copyObject(script)	


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


		for (var po = 0; po < script.length; po++) {
			try {

				var act = script[po]

				if (!act) continue
				if (typeof act != 'string') continue

				var data = script[++po]

				switch (act) {

					case '背景':
						var name = data[0]
						append(['背景', name, 'jpg'])
					break

					case '立絵': case '立ち絵':
						data.forEach( ary => {

							if (Util.isNoneType(ary)) return
							var [position, names] = ary
							if (!position) return
							if(!names) return

							var name = names[0]

							append(['立ち絵', name, 'png'])
						})
					break

					case '繰返': case '繰返し': case '繰り返し':
					case '選択': case '選択肢':
					case '分岐':
						data = data.reduce( (base, ary) => {
							var val = ary[1]
							if (val && typeof val[0] == 'string') base.push(val[0])
							return base
						}, [] )

					case 'ジャンプ':
						data.forEach( to => {
							if (!to) return
							var name = to, base = sname
							var [name, mark = ''] = name.replace(/＃/g,'#').split('#')
							if (!name) name = base.replace(/＃/g,'#').split('#')[0]
							var subkey = `${Data.scenarioName}/${Util.forceName('シナリオ', name, 'txt')}`
							//LOG(subkey)
							if (!Util.cacheHas(subkey)) fetchScriptData(to, base).then( script => cacheScript(script) ).check()
						})
					break

				}


			} catch (err) {
				LOG(`キャッシュ中にコマンド『${act}』で『${err}』が起きた`)
			}

		}

		//LOG(caching)
		if (caching == 0) defer.resolve()

		return defer.promise


	}



	function runScript(script, sname = script.sname, masterComp) {


		if (!sname) LOG('!!!sname')
		sname = sname.split('#')[0]

		Data.phase = 'play'

		var run = Promise.defer()
		//if (!parentComp) parentComp = run.resolve
		if (!masterComp) masterComp = run.resolve

		var {mark, hash, params, scenario, active} = script
		if(mark) Data.current.mark = mark

		var searching = !!hash
		if (params) Object.keys(params).forEach(name => Util.paramSet(name, params[name]))
		//if (scenario) Player.setScenario(scenario)
		
		script = copyObject(script)
		var gsave = Data.current.setting
		var {visited} = gsave
		if (!visited) gsave.visited = visited = {}
		var vBA = visited[sname] 
		if (!vBA) visited[sname] = vBA = BitArray.create(script.length)

		//function runSubScript(script) { return runScript(script, sname, parentComp, masterComp) }
		function runChildScript(script) { return runScript(script, undefined, masterComp) }
		
		var actHandlers = {
			会話(data, done, failed, {visited}) {

				var isNone = Util.isNoneType(data[0])
				View.mainMessageWindow.el.style.opacity = isNone ? '0' : ''
				if (isNone) return done()

				save()

				function nextPage() {

					var ary = data.shift()
					if (!ary) {
						autosave(false)
						return done()
					}

					var name = ary[0], texts = ary[1]
					if (Util.isNoneType(name)) name = ''
					name = replaceEffect(name)
					View.nextPage(name, {visited}) 
					//Data.currentSpeakerName = name

					function nextSentence() {
						var text = texts.shift()
						if (!text) return nextPage()
						text = text.replace(/\\w\[(\d*)\]/g, (_, num) => {
							return '\u200B'.repeat(+num||1)
						})//.replace(/\\n/g, '\n')
						text = replaceEffect(text)
						//Data.currentSentence = text
						View.addSentence(text, {visited}).on('go', nextSentence, failed)
					}
					nextSentence()
				}

				nextPage()
			},

			背景(data, done, failed) {
				var name = replaceEffect(data[0])
				Util.toBlobURL('背景', name, 'jpg').then( url => View.setBGImage({ name, url }) ).then(done, failed)
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
						height = Util.toSize(height)
					}

					base.push(Util.toBlobURL('立ち絵', name, 'png').then( url => ({ name, url, height, [a_type]: `${a_per}%`, [v_type]: `${v_per}%` }) ))
					return base
				}, [])).then( opt => View.setFDImages(opt) ).then(done, failed)
			},

			効果: otherName('エフェクト'),
			エフェクト(data, done, failed, {visited}) {
				data.forEach( prog => {
					if (prog == 'フェード準備') return View.prepareFade().then(done, failed)
					var act = prog[0], opt = Util.toHalfWidth(replaceEffect(prog[1][0])).split(/\s+/)
					var msec = opt[0].match(/[\d.]+/)*1000
					switch (act) {
						case 'フェード':
							return View.fade({msec, visited}).then(done, failed)
						break
						case 'フラッシュ':
							var color = opt[1]
							return View.flash({msec, color, visited}).then(done, failed)
						break
						default: failed('想定外のエフェクトタイプ')
					}
				})
			},

			選択: otherName('選択肢'),
			選択肢(data, done, failed) {
				//save()

				View.setChoiceWindow(data.map(ary => {
					return { name: replaceEffect(ary[0]), value: ary[1] }
				})).then( value => {
					if (typeof value[0] == 'string') actHandlers['ジャンプ'](value, done, failed)
					else {
						po = value
						done()
					}
				} )
					
			},

			ジャンプ(data, done, failed) {
				//autosave(false)
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
			繰り返し(data, done, failed) {
				//if (i > 10000) return failed('繰り返し回数が多すぎる(10000回超え)')
				var q = data[0]
				data = data.slice(1)
 				if (!data.some(([effect, acts]) => {
 					if (!effect) return failed('不正なパラメータ指定検出') 
					var flag = !!evalEffect(effect, failed)
					if (flag) po = acts
					return flag
				}) ) po = q
				done()
			},

			分岐(data, done, failed) {
 				data.some(([effect, acts]) => {
 					if (!effect) return failed('不正なパラメータ指定検出') 
					var flag = !!evalEffect(effect, failed)
					if (flag) po = acts
					return flag
				})
				done()
			},

			マーク(data, done, failed) {

				Data.current.mark = data[0]
				autosave(true)
				done()
				
			},

			スクリプト(data, done, failed) {
				var act = data[0]
				if (Util.isNoneType(act)) return done()
				switch (act) {
					//case '抜ける':
					//case 'ぬける':
					//	run.resolve()
					//break
					case '戻る':
					case 'もどる':
					case '帰る':
					case 'かえる':
						run.resolve()
					break
					case '終わる':
					case '終る':
					case 'おわる':
						masterComp()
					break
					default:
					failed(`不正なスクリプトコマンド『${act}』`)

				}
			},

			コメント(data, done, failed) {
				done()
			},

		}



		function save() {

			var params = {}
			var globalParams = {}
			Util.paramForEach( (value, key) => { params[key] = value })
			var cp = {
				script: sname, 
				params,
				active: Data.current.active,
				point: po-2,
				mark: Data.current.mark,
				date: new Date,
			}

			Data.current.point = cp
		}


		function autosave(full) {
			var p = Storage.setGlobalData(Data.current.setting)
			if (!full) return p
			save()
			//Util.updateDebugWindow()

			return Promise.all([p,
				Storage.getSaveDatas(101, 110).then(saves => {
					saves.pop()
					saves.splice(101, 0, Data.current.point)
					saves.forEach( (save, i) => {
						if (save) Storage.setSaveData(i, save) 
					})
				
				})
			])
		}


		function main_loop() {

			var act, loop = new Promise( (resolve, reject) => {

				//LOG(po)

				act = script[po]
				if (!act) {
					return searching ? run.reject(`マーク『${hash}』が見つかりません。`) : run.resolve() 
				}

				if (!searching && typeof act == 'number') {
					if (searching && (+hash === po)) searching = false
					else po = act
					return resolve()
				}


				if (searching) {
					//LOG('マーク', hash, po)
					if (+hash === po) {
						searching = false
					} else if (act == 'マーク') {
						var data = script[++po]
						++po
						var mark = data[0]
						if (mark == hash) {
							searching = false
							return actHandlers['マーク']([mark], resolve, reject)
						}
					} else ++po
					resolve()
				} else if (act in actHandlers) {
					var visited = BitArray.get(vBA, po) === 1
					var visit = BitArray.set.bind(BitArray, vBA, po)
					var data = script[++po]
					++po
					actHandlers[act](data, _ => {
						visit()
						resolve()
					}, reject, {visited})
				} else {
					Util.error('サポートされていないコマンド『' +act+ '』を検出しました。\n\nこのコマンドを飛ばして再生が継続されます。')
					++po
					resolve()
				}


			}).then(main_loop, err => {
				var message = err ? `コマンド『${act?act:'(不明)'}』で『${err}』が起こりました。` : `コマンド『${act}』が原因かもしれません。`
				Util.error('スクリプトを解析中にエラーが発生しました。\n\n' +message+ '\n\nこのコマンドを保証せず再生が継続されます。')
				return main_loop()
			})
		}

		//cacheScript(script, sname, 1)
		var po = 0

		new Promise( ok => {

			if (active) {
				var p = []

				var obj = active.BGImage 
				if (obj && obj.name) {
					p.push( Util.toBlobURL('背景', obj.name, 'jpg').then( url => {obj.url = url; return obj} )
					.then( obj => View.setBGImage(obj) ) )
				}

				var ary = active.FDImages
				if (ary) {
					p.push( Promise.all(ary.map( obj => obj.name ? 
						Util.toBlobURL('立ち絵', obj.name, 'png').then( url => {obj.url = url; return obj} ) : 1 ))
					.then( opts => View.setFDImages(opts) ) )
				}

				Promise.all(p).then(ok).check()

			} else ok()

		}).then(main_loop)


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



	function loadSaveData() {
		return Util.co(function* () {

			var saves = yield Storage.getSaveDatas(1, 110)
			var opts = saves.map( (save, i) => {
				if (!save) var mark = '------------'
				else if (save.systemVersion !== Storage.VERSION) {
					save = null
					mark = '--old data--'
				} else mark = save.mark || '(no name)'
				var name = i > 100 ? 'A'+(i-100) : i
				return {name: `${name}．${mark}`, value: save, disabled: !save }
			})

			var save = yield View.setChoiceWindow(opts, {sys: true, closeable: true, plus: true})
			if (save == '閉じる') return false
			var {params, script, point, active, mark} = save
			Util.paramClear()
			return Player.fetchScriptData(`${script}#${point}`).then( script => {
				script.params = params
				script.scenario = Data.scenarioName
				script.active = active
				script.mark = mark
				return script
			})

		})()
	}

	function saveSaveData() {
		return Util.co(function* () {

			var saves = yield Storage.getSaveDatas(1, 100)

			var opts = saves.map( (save, i) => {
				if (!save) var mark = '----------'
				else if (save.systemVersion !== Storage.VERSION) {
					mark = '--old data--'
				} else mark = save.mark || '(no name)'
				var name = i
				return {name: `${name}．${mark}`, value: i}
			})
			var no = yield View.setChoiceWindow(opts, {sys: true, closeable: true, plus: true})

			if (no == '閉じる') return false

			var con = saves[no] ? yield View.setConfirmWindow('上書きする') : true
			if (!con) return false

			var params = {}
			Util.paramForEach( (value, key) => params[key] = value )
			var save = Data.current.point
			save.scenarioVersion = Data.current.scenarioVersion
			save.systemVersion = Storage.VERSION
			yield Storage.setSaveData(no, save)
			yield Storage.setGlobalData(Data.current.setting)
			return true
			
		})()
	}

	function deleteSaveData() {
		return Util.co(function* () {

			var con = yield View.setConfirmWindow('初期化する')
			if (!con) return false
			yield Storage.deleteSaveDatas(true)
			yield Storage.setGlobalData({scenarioVersion: Data.current.scenarioVersion})
			return true

		})()
	}

	function init() {
		Data.phase = 'pause'
		document.title = 'openノベルプレーヤー'
		Util.paramClear(true)
		View.init()
	}



	function setSetting(scenario, setting) {
		return Util.co(function* () {
			document.title = `【${scenario}】 - openノベルプレーヤー`
			Data.dataSaveName = (setting['データ保存名']||[undefined])[0]
			Data.scenarioName = scenario
			Data.settingData = setting

			var gsave = yield Storage.getGlobalData()
			if (!gsave) {
				gsave = {}
				yield Storage.setGlobalData(gsave)
			}
			
			Data.current = {
				setting: gsave,
				active: {},
			}

			var gparams = gsave.params || {}
			Object.keys(gparams).forEach( key => { Util.paramSet(key, gparams[key], false) })

			var v = Data.current.scenarioVersion = Util.toHalfWidth((setting['バージョン']||['0'])[0])
			if (Data.current.setting.scenarioVersion != v || gsave.systemVersion != Storage.VERSION) return true
		})()

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
		var [name, hash = ''] = name.replace(/＃/g,'#').split('#')
		if (!name) {
			if (!base) return Promise.reject('親スクリプト名が必要')
			name = base.replace(/＃/g,'#').split('#')[0]
		}
		return Util.toBlobScriptURL(name).then(Util.loadText).then(parseScript).then(flattenScript).then(script => {
			//script.unshift(['マーク',['']])
			script.hash = hash
			script.sname = name
			return script
		})
	}

	
	READY.Player.ready({
		fetchSettingData, fetchScriptData, runScript,
		loadSaveData, saveSaveData, deleteSaveData, evalEffect, init, setSetting, cacheScript,
	})

}).check()