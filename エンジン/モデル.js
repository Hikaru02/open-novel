
function setPhase(phase) { document.title = '【' +phase+ '】' }


function parseScript(text) {
	text = text.replace(/\n+/g, '\n')
	function parseOne(base, text) {
		var chanks = text.match(/[^\n]+?\n(\t+[\s\S]+?\n)+/g) || []
		chanks.forEach(function (chank) {
			//chank.replace(/^\t/gm,'').replace(/\n$/, '').split(/\n(?!\t)/).forEach(function (chank) {
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
			//})

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
	return function () {
		return this[name].apply(this, arguments)
	}
}


function runScript(script) {
	'use strict'

	var run = Promise.defer()
	script = copyObject(script)	

	var actHandlers = {
		'会話': function (data, done, failed) {

			function nextPage() {

				var ary = data.shift()
				if (!ary) return done()

				var name = ary[0], texts = ary[1]
				View.nextPage(name)

				function nextSentence() {
					var text = texts.shift()
					if (!text) return nextPage()
					View.addSentence(text)
					View.on('go', nextSentence, failed)
				}
				nextSentence()
			}

			nextPage()
		},
		'背景': function (data, done, failed) {
			var url = data[0]
			url = forceCSSURL(url, 'png', '画像')
			View.setBGImage({ url: url })

			done()
		},
		'立絵': otherName('立ち絵'),
		'立ち絵': function (data, done, failed) {
			//LOG(data)

			View.setFDImages(data.reduce(function (base, ary) {

				if (isNoneType(ary)) return base

				var type = ['left','right']['左右'.indexOf(ary[0])]
				var url = ary[1][0]

				if (!type) failed('不正な位置検出')
				url = forceURL(url, 'png', '画像')
				var ro = { url: url }
				ro[type] = '0px'
				base.push(ro)
				return base
			}, []))
			done()
		},
		'選択': otherName('選択肢'),
		'選択肢': function (data, done, failed) {

			View.setChoiceWindow(data.map(function (ary) {
				return { name: ary[0], value: ary[1][0] }
			})).then(function (url) {
				url = forceURL(url, 'txt', 'テキスト')

				//LOG(url)
				getScriptData(url).then(runScript).then(done, failed)
				
			})
		},
		'コメント': function (data, done, failed) {
			done()
		},

	}

	function main_loop() {

		//var loop = Promise.defer()

		var act, loop = new Promise(function (resolve, reject) {

			var prog = script.shift()
			if (!prog) return run.resolve() 
			act = prog[0]
			var data = prog[1]

			if (act in actHandlers) actHandlers[act](data, resolve, reject)
			else {
				ERROR('サポートされていないコマンド『' +act+ '』を検出しました。\n\nこのコマンドを飛ばして再生が継続されます。')
				resolve()
			}

		}).then(main_loop, function (err) {
			var message = err ? 'コマンド『' +act+ '』で『' +err+ '』が起こりました。' : 'コマンド『' +act+ '』が原因かもしれません。'
			ERROR('スクリプトを解析中にエラーが発生しました。\n\n' +message+ '\n\nこのコマンドを保証せず再生が継続されます。')
			return main_loop()
		})
	}

	main_loop()
	return run.promise

}


function isNoneType(str) {
	return !!((typeof str === 'string') && str.match(/^(無し|なし)$/))
}

function forceCSSURL(url, type, root) {
	if (!url) throw 'URL特定不能エラー'
	return isNoneType(url) ? 'none' : 'url(' +forceURL(url, type, root)+ ')'
}


function forceURL(url, type, root) {
	if (!url) throw 'URL特定不能エラー'
	if (!url.match(/\.[^\.]+$/)) url += '.' + type
	if (root && (!url.match(root))) url = 'データ/' + root + '/' + url
	return url
}


function getSettingData() {
	return loadText(URLs.SettingData).then(function (text) {
		var setting = parseScript(text)
		var data = {}
		setting.forEach(function (ary) {
			data[ary[0]] = ary[1]
		})
		return data
	})
}


function getScriptData(url) {
	url = forceURL(url, 'txt', 'テキスト')
	return loadText(url).then(function (text) {
		var script = parseScript(text)
		var data = script
		return data
	})

}


function loadText(url) {
	return load(url, 'text')
}

function load(url, type) {
	return new Promise(function (ok, ng) {
		var xhr = new XMLHttpRequest()
		xhr.onload = function () { ok(xhr.response) }
		xhr.onerror = ng
		xhr.open('GET', url)
		if (type) xhr.responseType = type
		xhr.send()
	})
}


var MODEL_READY = Promise.resolve()