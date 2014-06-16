
READY('Player', 'DOM').then( _ => {
	'use strict'

	var View = null

	var EP = Element.prototype
	Util.setDefaults(EP, {
		on					: EP.addEventListener,
		requestFullscreen	: EP.webkitRequestFullscreen || EP.mozRequestFullScreen,
		append				: EP.appendChild,
		removeChildren		: function () { this.innerHTML = ''; return this },
		setStyles			: function (styles) {
			styles = styles || {}
			Object.keys(styles).forEach( key => { if (styles[key] != null) this.style[key] = styles[key] }, this)
			return this
		},
	})
	
	if (!document.onfullscreenchange) Object.defineProperty(document, 'onfullscreenchange', {
		set: val => {
			if ('onwebkitfullscreenchange' in document) document.onwebkitfullscreenchange = val
			else document.onmozfullscreenchange = val
		}
	})
	if (!document.fullscreenElement) Object.defineProperty(document, 'fullscreenElement', {
		get: _ => document.webkitFullscreenElement || document.mozFullScreenElement,
	})

	var $isWebkit = !!EP.webkitRequestFullscreen

	function DOM(tagName, styles) {
		if (tagName == 'text') return document.createTextNode(styles)
		var el = document.createElement(tagName)
		return el.setStyles(styles)
	}


	var query    = document.querySelector.bind(document),
	    queryAll = document.querySelectorAll.bind(document)

	var el_root    = query('#ONPwrapper'),
		el_wrapper = new DOM('div'),
	    el_player  = new DOM('div'),
	    el_context = new DOM('div')

		el_root.removeChildren()
		el_root.append(el_wrapper).append(el_player).append(el_context)

	//var RAF = requestAnimationFrame



	function adjustScale(height, ratio, full) {

		//LOG(arguments)
		var p = Promise.resolve()

		if (!full) {
			el_player.style.height = '100%'
			if (height * devicePixelRatio < 480) p = View.showNotice('表示領域が小さ過ぎるため\n表示が崩れる場合があります')
		}

		var ratio = ratio || 16 / 9

		var width = height * ratio


		el_player.style.fontSize = height / 25 + 'px'

		el_wrapper.style.height = height + 'px'
		el_wrapper.style.width  = width  + 'px'

		el_debug.style.width = width - 10 + 'px'

		if (full) {
			el_player.style.height = height + 'px'
			if (el_fullscreen) el_fullscreen.style.height = height + 'px'
		} else fitScreen = Util.NOP 

		return p

	}
	


	var el_debug = el_root.append(new DOM('div', {
		width		: '320px',
		textAlign	: 'center',
		fontSize	: '1em',
		padding		: '5px',
	}))


	var bs = {
		height: '2em',
		margin: '5px',
	}

	var createDdebugSub = _ => el_debug.append(new DOM('div', { display: 'inline-block' }))
	var el_debugSub = createDdebugSub()
	;[360, 480, 720, 1080].forEach( size => {
		var el = el_debugSub.append(new DOM('button', bs))
		el.append(new DOM('text', size + 'p'))
		el.on('click', _ =>	adjustScale(size / devicePixelRatio) )
	})
	
	var el_debugSub = createDdebugSub()
	var el = el_debugSub.append(new DOM('button', bs))
	el.append(new DOM('text', 'フルウィンドウ(横)'))
	el.on('click', _ => {
		fitScreen = _ => {
			var ratio = 16 / 9
			var width = document.body.clientWidth
			var height = width / ratio
			adjustScale(height, 0, true)
		}
		fitScreen()
	})
	var el_fullscreen
	var el = el_debugSub.append(new DOM('button', bs))
	el.append(new DOM('text', 'フルスクリーン(横)'))
	el.on('click', _ => {
		el_fullscreen = new DOM('div', {width: '100%', height: '100%', fontSize: '100%'})
		el_player.remove()
		el_wrapper.append(el_fullscreen).append(el_player)
		el_fullscreen.requestFullscreen()
		fitScreen = _ => {
			var ratio = 16 / 9
			var width = screen.width, height = screen.height
			if (height * ratio > width) height = width / ratio
			adjustScale(height, 0, true)
		}
		fitScreen()
		View.showNotice('この機能はブラウザにより\n表示の差があります', 1000)
	})


	var el_debugSub = createDdebugSub()
	var el = el_debugSub.append(new DOM('button', bs))
	el.append(new DOM('text', 'メニュー開閉'))
	el.on('click', _ => {
		fireEvent('Rclick')
	})

	var el_debugSub = createDdebugSub()
	var el = el_debugSub.append(new DOM('button', bs))
	el.append(new DOM('text', 'キャシュ削除'))
	el.on('click', _ => {
		Player.cacheClear()
		View.showNotice('キャッシュを削除しました', 500)
	})

	var el_debugSub = createDdebugSub()
	var el = el_debugSub.append(new DOM('button', bs))
	el.append(new DOM('text', 'リセット'))
	el.on('click', _ => {
		Game.reset()
	})


	var el = new DOM('div')
	var el_debugWindow = el_debug.append(el).append(new DOM('pre', { textAlign: 'left', whiteSpace: 'pre-wrap' }))
	el_debugWindow.textContent = 'デバッグ情報\n（無し）'



	function setAnimate(func) {
		var start = performance.now()
		var cancelled = false
		var paused = false
		return new Promise(ok => {
			var complete = _ => {
				cancelled = true
				ok()
			}
			var pause = _ => {
				paused = true
				return _ => requestAnimationFrame(loop)
			}
			var loop = now => {
				if (cancelled) return
				var delta = now - start
				if (delta < 0) delta = 0
				if (!paused) requestAnimationFrame(loop)
				func(delta, complete, pause)
			}
			requestAnimationFrame(loop)
		})

	}




	var fitScreen = Util.NOP
	window.onresize = _ => fitScreen()

	document.onfullscreenchange = _ => {
		var full = document.fullscreenElement == el_fullscreen
		//LOG(full)
		if (!full) {
			el_fullscreen.remove()
			el_fullscreen.removeChildren()
			el_wrapper.append(el_player)
			adjustScale($scale, $ratio)
		}
	}


	var METHODS = {}

	METHODS = {
		COMMON: {

			clean: function () {
				this.changeMode($mode)
			},

			init: function (opt) {
				this.initDisplay(opt.style || {})
			},

			changeMode: function (type, opt) {
				var type = type.toUpperCase()
				opt = opt || {}

				if (!(type in METHODS)) throw 'illegal ViewContext mode type'

				$mode = type
				global.View = View = { __proto__: METHODS[type] }
				View.init(opt)

			},

			changeModeIfNeeded: function (type, opt) {
				if ($mode != type) this.changeMode(type, opt)
			},

			on: function (kind, onFulfilled, onRejected) {
				return new Promise( resolve => hookInput(kind, resolve) ).then(onFulfilled).check().catch(onRejected)
			},

			initDisplay: function (opt) {
				Util.setDefaults(opt, {
					background		: 'black',
					margin			: 'auto',
					position		: 'relative',
					hidth			: '100%',
					height			: '100%',
					overflow		: 'hidden',
				//	$height			: 360,
				//	$raito			: 16 / 9,
				})

				hookClear()
				this.windows = {}

				var height = opt.HEIGHT || 480
				opt.height = opt.width = '100%'

				el_context = new DOM('div')
				el_player.removeChildren()
				el_player.append(el_context)
				el_wrapper.setStyles({ overflow	: 'hidden', maxHeight: '100%', maxWidth: '100%' })
				if (!document.fullscreenElement) el_player.setStyles({ position: 'relative', overflow: 'hidden', height: '100%', width: '100%' })
				el_context.setStyles(opt)
			},

			showNotice: function (message, show_time = 1000, delay_time = 250) {
				if (!message) throw 'illegal message string'
				message = '【！】\n' + message
				var noticeWindow = new DOM('div', {
					fontSize		: '2em',
					color			: 'rgba(0,0,0,0.75)',
					textShadow		: 'rgba(0,0,0,0.75) 0.01em 0.01em 0.01em',
					backgroundColor	: 'rgba(255,255,0,0.75)',
					boxShadow		: 'rgba(100,100,0,0.5) 0px 0px 5px 5px',
					borderRadius	: '2% / 10%',
					textAlign		: 'center',
					lineHeight		: '1.5em',
					opacity			: '0',
					position		: 'absolute',
					left			: 'calc((100% - 90%) / 2)',
					top				: '20%',
					zIndex			: '100',
					width			: '90%',
				})
				el_player.append(noticeWindow).append(new DOM('pre', {margin: '5%'})).append(new DOM('text', message))
				return new Promise(function (ok, ng) {
					var opacity = 0
					setAnimate(function (delta, complete) {
						opacity = delta / delay_time
						if (opacity >= 1) {
							opacity = 1
							if (typeof navigator.vibrate == 'function') navigator.vibrate([100,100,100])
							complete()
						}
						noticeWindow.style.opacity = opacity
					}).delay(show_time).and(setAnimate, (delta, complete) => {
						opacity = 1 - delta / delay_time
						if (opacity <= 0) {
							opacity = 0
							complete()
							noticeWindow.remove()
						}
						noticeWindow.style.opacity = opacity
					}).then(ok, ng)

				})
			},

			setLoadingMessage: function (message) {
				var loadingWindow = new DOM('div', {
					fontSize		: '2em',
					color			: 'rgba(255,255,255,0.5)',
					textShadow		: 'rgba(0,0,0,0.5) 0.01em 0.01em 0.01em',
				//	textAlign		: 'center',
					position		: 'absolute',
					right			: '0%',
					bottom			: '0%',
					zIndex			: '900',
				//	width			: 'auto',
				})

				var defer = Promise.defer()
				Promise.resolve().delay(100).then(defer.resolve)
				defer.promise.then( _ => el_player.append(loadingWindow).append(new DOM('pre', {margin: '0%'})).append(new DOM('text', message)) )
				function hide() { defer.reject(); loadingWindow.remove() }
				return hide

			},

			adjustScale: adjustScale,

			updateDebugWindow: function (obj) {
				el_debugWindow.textContent = 'デバッグ情報\n' + JSON.stringify(obj, null, 4)
			},
		},
	}

	METHODS = {
		TEST: { __proto__: METHODS.COMMON,
			initDisplay: function (opt) {
				Util.setDefaults(opt, {
					fontSize		: 'calc(100% * 2 / 3)',
					color			: 'white',
				})
				this.__proto__.__proto__.initDisplay(opt)
				var el = new DOM('div', {
					padding: '10px',
				})
				var el_body = new DOM('pre')
				this.el_test = el_body
				el_context.append(el).append(el_body)
			},
			print: function (text, opt) {
				this.el_test.textContent += text
			},
		},

		NOVEL: { __proto__: METHODS.COMMON,
			initDisplay: function (opt) {
				//LOG('initDisplay')
				Util.setDefaults(opt, {
					color			: 'rgba(255,255,255,0.9)',
				//	fontSize		: 'calc(480px / 20)',
					textShadow		: 'rgba(0,0,0,0.9) 0.1em 0.1em 0.1em',
					overflow		: 'hidden',
				})
				this.__proto__.__proto__.initDisplay(opt)

				this.mainMessageWindow = this.addMessageWindow({z:10})
				this.imageFrame = this.addImageFrame({z:20})

				View.on('Rclick').then(_ => this.showMenu()).check()
			},

			messageWindowProto: {
				nextPage: function (name, {sys = false} = {}) {		
					View.windows.message.setStyles({
						background		:  sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)',
						boxShadow		: (sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)') + ' 0 0 0.5em 0.5em',
					})
					name = !name || name.match(/^\s+$/) ? '' : '【' +name+ '】' 
					this.el_title.textContent = name
					this.el_body.removeChildren()

				},

				addSentence: function (text, opt) {
					text += '\n'
					opt = Util.setDefaults(opt, {
						weight: 25
					})
					
					var length = text.length
					var at = 0, nl = 0
					var el = this.el_body
					var weight = opt.weight
					var [aborted, cancelled] = [false, false]
					var [abort, cancel] = [_ => aborted = true, _ => cancelled = true]
					View.on('go').then(cancel)

					var p = setAnimate( (delay, complete, pause) => {
						if (aborted) return complete()
						if (cancelled) {
							//el.append(new DOM('text', text.slice(at).replace(/\u200B/g, '') ))
							//return complete()
							nl = length
						}
						while (delay / weight >= at - nl) {
							var str = text[at]
							if (!str) return complete()
							if (str == '\\' && /\[.+\]/.test(text.slice(at))) {
								var nat = text.indexOf(']', at)
								var name = text.slice(at+2, nat).trim()
								if ($isWebkit) {
									var img = el.append(new DOM('img', { height: '0.75em', width: '0.75em' }))
									;((img, name) => Player.toBlobEmogiURL(name).then( url => {img.src = url} ).catch(LOG))(img, name)
								} else {
									var img = el.append(new DOM('object', { height: '0.75em', width: '0.75em' }))
									img.type = 'image/svg+xml'
									;((img, name) => Player.toBlobEmogiURL(name).then( url => {img.data = url} ).catch(LOG))(img, name)
								/*
									;((img, name) => {
										var sub = Util.forceName('絵文字', name, 'svg')
										var subkey = `${Player.scenarioName}/${sub}`
										Player.find(`データ/${subkey}`).catch( _ => `データ/[[共通素材]]/${sub}` ).then( url => {img.src = url} ).catch(LOG)
									})(img, name)
								*/
								}
								nl += nat - at
								at = nat
							} else if (str != '\u200B') el.append(new DOM('text', str))
							if (++at >= length) return complete()
						}
					})

					p.abort = abort
					p.cancel = cancel
					return p
				},
			},

			addMessageWindow: function (opt) {
				Util.setDefaults(opt, {
					background		: 'rgba(50,50,50,0.5)',
					boxShadow		: 'rgba(50,50,50,0.5) 0 0 0.5em 0.5em',
					borderRadius	: '1% / 1%',
					width			: 'calc(100% - 0.5em - (2% + 2%))',
					height			: 'calc( 25% - 0.5em - (4% + 2%))',
					fontSize		: '100%',
					lineHeight		: '1.5em',
					fontWeight		: 'bold',
					padding			: '4% 2% 2% 2%',
					whiteSpace		: 'nowrap',
					position		: 'absolute',
					bottom			: '0.25em',
					left			: '0.25em',
					zIndex			: opt.z || 1400,

				})
				var el = new DOM('div', opt)
				this.windows.message = el
				el_context.append(el)

				var el_title = el.append(new DOM('div', {
					display			: 'inline-block',
					marginRight		: '5%',
				//	color			: 'blue',
					textAlign		: 'right',
					verticalAlign	: 'top',
					width			: '15%',
					height			: '100%',
				//	background		: 'rgba(255,100,200,0.5)',
				//	padding			: '5px',
				}))
				var el_body = el.append(new DOM('div', {
					display			: 'inline-block',
					width			: 'auto',
					height			: '100%',
				//	padding			: '15px',
				})).append(new DOM('pre', {
					margin			: '0',
				}))

				var mw = { __proto__: this.messageWindowProto,
					el				: el,
					el_title		: el_title,
					el_body			: el_body,
				}

				return mw
			},

			addImageFrame: function (opt) {

				var fr = new DOM('div', {
					height			: '100%',
					width			: '100%',
					zIndex			: opt.z || 1500,
				})

				el_context.append(fr)
				return fr

			},

			setChoiceWindow: function (opts, {sys = false} = {}) {

				var defer = Promise.defer()

				var cw = new DOM('div', {
					position		: 'absolute',
					left			: 'calc((100% - 70%) / 2 - 5%)',
					width			: '70%',
				//	height			: '70%',
					top				: '5%', 
					boxShadow		: sys ? 'rgba(100, 255, 150, 0.3) 0 0 5em' : 'rgba(100, 100, 255, 0.3) 0 0 5em',
					borderRadius	: '3% / 5%',
					background		: sys ? 'rgba(100, 255, 150, 0.3)' : 'rgba(100, 100, 255, 0.3)',
					padding			: '0% 5%',
					overflowY		: opts.length > 3 ? 'scroll' : 'hidden',
					maxHeight		: '70%',
				//	verticalAlign	: 'middle',
				})
				if (!sys) {
					if (this.windows.choice) this.windows.choice.remove()
					this.windows.choice = cw
				} else {
					if (this.windows.choiceBack) this.windows.choiceBack.remove()
					this.windows.choiceBack = cw
				}

				opts.forEach(function (opt) {
					if (!('value' in opt)) opt.value = opt.name
					var bt = new DOM('button', {
						display			: 'block',
						fontSize		: '1.5em',
						boxShadow		: 'inset 0 1px 3px #F1F1F1, inset 0 -15px ' + (sys ? 'rgba(0,116,116,0.2)' : 'rgba(0,0,223,0.2)') + ', 1px 1px 2px #E7E7E7',
						background		: sys ? 'rgba(0,100,50,0.8)' : 'rgba(0,0,100,0.8)',
						color			: 'white',
						borderRadius	: '5% / 50%',
						width			: '100%',
						height			: '2.5em',
						margin			: '5% 0%',
					})
					bt.disabled = !!opt.disabled
					bt.append(new DOM('text', opt.name))
					bt.onclick = _ => {
						defer.resolve(opt.value)
						if (!sys) delete this.windows.choice
						else delete this.windows.choiceBack
						cw.remove()
					}
					cw.append(bt)
				}, this)

				el_context.append(cw)


				return defer.promise

			},


			setBGImage: function (opt) {
				var url = opt.url ? `url(${opt.url})` : 'none'
				el_context.style.backgroundImage = url
				el_context.style.backgroundSize = 'cover'
			},

			setFDImages: function (opts) {
				var el = this.imageFrame
				el.removeChildren()
				opts.forEach( opt => {
					Util.setDefaults(opt, {
						left	: null,
						right	: null,
						top		: null,
						bottom	: null,
					})
					var mar = parseInt(opt.top) || parseInt(opt.bottom) || 0
					var height = opt.height ? opt.height : `${100-mar}%`
					var img = new DOM('img', {
						position		: 'absolute',
						left			: opt.left,
						right			: opt.right,
						top				: opt.top,
						bottom			: opt.bottom,
					//	maxWidth		: '50%',
						height			: height,
					})
					img.src = opt.url
					el.append(img)
				})
			},

			nextPage: function (name, opt) {
				this.mainMessageWindow.nextPage(name, opt)
			},

			addSentence: function (text, opt) {
				return this.mainMessageWindow.addSentence(text, opt)
			},

			showMenu: function () {
				if (Player.data.phase != 'play' || View.menuIndex > 0) return View.on('Rclick').then(_ => View.showMenu())
				//LOG('show')
				View.menuIndex = (View.menuIndex||0)+1
				blockEvent()
				View.on('Rclick').then( _ => {
					if (this.windows.choiceBack) this.windows.choiceBack.remove()
					View.hideMenu()
				} ).check()
				Object.keys(View.windows).forEach( key => {
					var el = View.windows[key]
					el.hidden = !el.hidden
				} )
				View.setChoiceWindow([
					{name: 'セーブ'}, {name: 'ロード'}
				], {sys: true}).then( kind => {

					switch (kind) {
						case 'セーブ':
							Player.saveSaveData().check().through(View.hideMenu).then( _ => View.showNotice('セーブしました。'),
								err => View.showNotice('セーブに失敗しました。') )

						break
						case 'ロード':
							Player.loadSaveData().through( _ => {
								View.hideMenu()
								Player.init()
							} ).then(Player.runScript)

						break
						default: throw 'illegal choice type'
					}
				})

			},

			hideMenu: function () {
				//LOG('hide')
				if (!View.menuIndex) return
				--View.menuIndex
				allowEvent()
				View.on('Rclick').then(_ => View.showMenu())
				Object.keys(View.windows).forEach( key => {
					var el = View.windows[key]
					el.hidden = !el.hidden
				} )
			},

		},

	}



	var [hookInput, hookClear, blockEvent, allowEvent, fireEvent] = (_ => {

		var keyboardTable = {
			13: 'enter',
			32: 'space',
		}

		var hooks = []
		//var blocks = new Set

		document.addEventListener('keydown', evt => {
			var type = keyboardTable[evt.keyCode]
			if (type) onEvent(type, evt)
		}, true)

		el_wrapper.addEventListener('mousedown', evt => {
			var type = 'LMR'[evt.button]
			if (type) onEvent(type + 'click', evt)
		}, true)

		el_wrapper.addEventListener('contextmenu', evt => {
			onEvent('contextmenu', evt)
		}, true)

		function onEvent(type, evt) {
			if (evt) {
				evt.preventDefault()
				evt.stopImmediatePropagation()
			}
			hooks = hooks.reduce( (ary, hook) => {
				if (hook.indexOf(type) === -1 || hook.blocked > 0) ary.push(hook)
				else hook.resolve()
				return ary
			}, [])
		}

		function toHook(kind) {
			switch (kind) {
				case 'go':
					return ['Lclick', 'enter', 'space']
				break;
				case 'Rclick':
					return [kind]
				break
				default: throw 'illegal hook event type'		
			}
		}

		return [function hookInput(kind, resolve) {
			var hook = toHook(kind)
			hook.resolve = resolve
			hook.blocked = 0
			hooks.push(hook)
		}, function hookClear() {
			hooks.length = 0
		}, function blockEvent() {
			hooks.forEach( hook => ++hook.blocked )
		}, function allowEvent() {
			hooks.forEach( hook => --hook.blocked )
		}, function fireEvent(type) {
			onEvent(type)
		}
		]
	})()


	var $full = false
	var $ratio = 16 / 9
	var $mode = ''
	var width = document.body.clientWidth
	var $scale = width / $ratio >= 480 ? 480 : width / $ratio
	//document.body.style.width = '100%'

	METHODS.TEST.changeMode('TEST')
	var p = adjustScale($scale, $ratio)

	p.then( _ => READY.View.ready(null) )

}).catch(LOG)