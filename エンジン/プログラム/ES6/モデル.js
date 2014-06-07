
READY().then(function () {
	'use strict'

	//var {Promise} = Util.overrides

	function setPhase(phase) { document.title = '【' +phase+ '】' }
	function setRunPhase(kind) { setPhase(`${kind}中...`) }
	function setErrorPhase(kind) { setPhase(`${kind}エラー`) }


	function parseScript(text) {
		text = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\n/g, '\r\n')
		text = text.replace(/^\#.*\n/gm, '')
		function parseOne(base, text) {
			var chanks = text.match(/[^\n]+?\n(\t+[\s\S]+?\n)+/g) || []
			chanks.forEach(chank => {
				
					var blocks = chank.replace(/^\t/gm,'').replace(/\n$/, '').match(/.+/g)
					//LOG(blocks)
					var act = blocks.shift()
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
		parseOne(base, text)
		return base

	}



	function copyObject(obj) {
		return JSON.parse(JSON.stringify(obj))
	}


	function otherName(name) {
		return function () { return this[name].apply(this, arguments) }
	}

	function preloadImage({name, url, kind, type = 'png'}) {

		function test(url) {
			return new Promise( (ok, ng) => {
				var img = new Image
				img.onload = _ => ok(url)
				img.onerror = _ => ng(`画像『${name}』のキャッシュに失敗`)
				img.src = url
			} )
		}

		return preload({name, url, kind, test, type})

	}

	function preloadScript({name, url, kind = 'シナリオ', type = 'txt'}) {

		function test(url) {
			return find(url).then( _ => url)
		}

		return preload({name, url, kind, test, type})

	}

	function preload({name, url, kind, type, test}) {
		var hide = View.setLoadingMessage('Loadind...')
		return new Promise((ok, ng) => {
			//LOG(url, Util.isNoneType(url))
			if (Util.isNoneType(name)) return ok(url)
			//url = Util.forceImageURL(url)
			test(url).catch( _ => { 
				var url = Util.forceURL(`データ/[[共通素材]]/${kind}/${name}`, type, '')
				return test(url)
			} ).then(ok, ng)
		}).then( url => {
			//LOG(url)
			hide()
			return url
		})
	}


	function runScript(script) {

		View.changeMode('NOVEL')

		var run = Promise.defer()
		script = copyObject(script)	

		var actHandlers = {
			会話(data, done, failed) {

				function nextPage() {

					var ary = data.shift()
					if (!ary) return done()

					var name = ary[0], texts = ary[1]
					if (Util.isNoneType(name)) name = ''
					View.nextPage(name)

					function nextSentence() {
						var text = texts.shift()
						if (!text) return nextPage()
						text = text.replace(/\\w(\d+)/g, (_, num) => {
							return '\u200B'.repeat(num)
						}).replace(/\\n/g, '\n')
						View.addSentence(text).on('go', nextSentence, failed)
					}
					nextSentence()
				}

				nextPage()
			},
			背景(data, done, failed) {
				var name = data[0], url = Util.forceBGImageURL(name)
				preloadImage({name, url, kind: '背景'}).then( url => View.setBGImage({ url }) ).then(done, failed)
			},
			立絵: otherName('立ち絵'),
			立ち絵(data, done, failed) {
				//LOG(data)
				Promise.all(data.reduce((base, ary) => {

					if (Util.isNoneType(ary)) return base

					var type = ['left','right']['左右'.indexOf(ary[0])]
					var name = ary[1][0], url = Util.forceFDImageURL(name)

					if (!type) failed('不正な位置検出')

					//var ro = { url }
					//ro[type] = '0px'
					base.push(preloadImage({name, url, kind: '立ち絵'}).then( url => ({ url, [type]: '0px' }) ))
					return base
				}, [])).then(View.setFDImages.bind(View)).then(done, failed)
			},
			選択: otherName('選択肢'),
			選択肢(data, done, failed) {

				View.setChoiceWindow(data.map(ary => {
					return { name: ary[0], value: ary[1][0] }
				})).then(name => {
					var url = Util.forceScriptURL(name)

					preloadScript({name, url}).then(fetchScriptData).then(runScript).then(done, failed)
					
				})
			},
			コメント(data, done, failed) {
				done()
			},

		}

		function main_loop() {

			//var loop = Promise.defer()

			var act, loop = new Promise( (resolve, reject) => {

				var prog = script.shift()
				if (!prog) return run.resolve() 
				act = prog[0]
				var data = prog[1]

				if (act in actHandlers) actHandlers[act](data, resolve, reject)
				else {
					Util.error('サポートされていないコマンド『' +act+ '』を検出しました。\n\nこのコマンドを飛ばして再生が継続されます。')
					resolve()
				}

			}).then(main_loop, err => {
				var message = err ? `コマンド『${act}』で『${err}』が起こりました。` : `コマンド『${act}』が原因かもしれません。`
				Util.error('スクリプトを解析中にエラーが発生しました。\n\n' +message+ '\n\nこのコマンドを保証せず再生が継続されます。')
				return main_loop()
			})
		}

		main_loop()
		return run.promise

	}





	function fetchSettingData(url) {
		return loadText(url).then( text => {
			var setting = parseScript(text)
			var data = {}
			setting.forEach( ary => {
				data[ary[0]] = ary[1]
			})
			return data
		} )
	}


	function fetchScriptData(name) {
		var url = Util.forceScriptURL(name)
		return preloadScript({name, url}).then(loadText).then( text => parseScript(text) )
	}


	function loadText(url) {
		return load(url, 'text')
	}

	function load(url, type) {
		return new Promise(function (ok, ng) {
			var xhr = new XMLHttpRequest()
			xhr.onload = _ => ok(xhr.response)
			xhr.onerror = ng
			xhr.open('GET', url)
			if (type) xhr.responseType = type
			xhr.send()
		})
	}

	function find(url) {
		return new Promise(function (ok, ng) {
			var xhr = new XMLHttpRequest()
			xhr.onload = _ => {
				if (xhr.status < 300) ok()
				else ng(new Error('Not Found')) 
			}
			xhr.onerror = ng
			xhr.open('HEAD', url)
			xhr.send()
		})

	}


	function print(message) {
		if (!View.print) View.changeMode('TEST')
		View.print(message)
	}

	READY.Player.ready({
		setRunPhase, setErrorPhase, fetchSettingData, fetchScriptData, runScript, print
	})

})