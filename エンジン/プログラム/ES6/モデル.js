
READY().then(function () {
	'use strict'

	//var {Promise} = Util.overrides

	function setPhase(phase) { document.title = '【' +phase+ '】' }
	function setRunPhase(kind) { setPhase(`${kind}中...`) }
	function setErrorPhase(kind) { setPhase(`${kind}エラー`) }


	function parseScript(text) {
		text = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\n/g, '\r\n')
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

	function preloadImage(url, result) {
		var hide = View.setLoadingMessage('Loadind...')
		return new Promise((ok, ng) => {
			//LOG(url, isNoneType(url))
			if (isNoneType(url)) return ok()
			url = forceImageURL(url)
			var img = new Image
			img.onload = _ => ok(result)
			img.onerror = _ => ng(`画像URL『${url}』のキャッシュに失敗`)
			img.src = url
		}).then(result => {
			hide()
			return result
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
				var url = data[0]
				preloadImage(url).then( View.setBGImage.bind(View, { url: forceCSSURL(url) }) ).then(done, failed)
			},
			立絵: otherName('立ち絵'),
			立ち絵(data, done, failed) {
				//LOG(data)
				Promise.all(data.reduce((base, ary) => {

					if (isNoneType(ary)) return base

					var type = ['left','right']['左右'.indexOf(ary[0])]
					var url = ary[1][0]

					if (!type) failed('不正な位置検出')

					var ro = { url: forceImageURL(url) }
					ro[type] = '0px'
					base.push(preloadImage(url, ro))
					return base
				}, [])).then(View.setFDImages.bind(View)).then(done, failed)
			},
			選択: otherName('選択肢'),
			選択肢(data, done, failed) {

				View.setChoiceWindow(data.map(ary => {
					return { name: ary[0], value: ary[1][0] }
				})).then(url => {
					url = forceScriptURL(url)

					fetchScriptData(url).then(runScript).then(done, failed)
					
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


	function isNoneType(str) {
		return (typeof str === 'string') && /^(無し|なし)$/.test(str)
	}

	function forceCSSURL(url, type, root) {
		if (!url) throw 'URL特定不能エラー'
		return isNoneType(url) ? 'none' : `url(${forceImageURL(url, type, root)})`
	}

	function forceImageURL(url, type = 'png', root = '画像') {
		return forceURL(url, type, root)
	}

	function forceScriptURL(url, type = 'txt', root = 'テキスト') {
		return forceURL(url, type, root)
	}

	function forceURL(url, type, root) {
		if (!(url && type && root)) throw 'URL特定不能エラー'
		if (!url.match(/\.[^\.]+$/)) url += `.${type}`
		if (root && (!url.match(root))) url = `データ/${root}/${url}`
		return url
	}


	function fetchSettingData() {
		return loadText(Data.URL.SettingData).then( text => {
			var setting = parseScript(text)
			var data = {}
			setting.forEach( ary => {
				data[ary[0]] = ary[1]
			})
			return data
		} )
	}


	function fetchScriptData(url) {
		url = forceScriptURL(url)
		return loadText(url).then( text => parseScript(text) )
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


	function print(message) {
		View.changeMode('TEST')
		View.print(message)
	}

	READY.Player.ready({
		setRunPhase, setErrorPhase, fetchSettingData, fetchScriptData, runScript, print
	})

})