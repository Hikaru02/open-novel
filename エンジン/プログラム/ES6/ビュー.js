
READY('Storage', 'Player', 'DOM', 'Sound').then( ({Util}) => {
	'use strict'

	var View = null

	var clickSE = new Sound('sysSE', '選択')
	var focusSE = new Sound('sysSE', 'フォーカス')

	var EP = Element.prototype
	Util.setDefaults(EP, {
		on					: EP.addEventListener,
		requestFullscreen	: EP.webkitRequestFullscreen || EP.mozRequestFullScreen,
		append				: EP.appendChild,
		removeChildren		: function () {
			var ch = this.childNodes, len = ch.length
			for (var i = len - 1; i >= 0; --i) ch[i].remove()
			return this
		},
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
	;[360, 540, 720, 1080].forEach( size => {
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
		View.showNotice('この機能はブラウザにより\n表示の差があります')
	})


	var el_debugSub = createDdebugSub()
	var el = el_debugSub.append(new DOM('button', bs))
	el.append(new DOM('text', 'サウンド有無'))
	el.on('click', _ => {
		var e = !Sound.soundEnabled
		Sound.soundEnabled = e
		Storage.setSetting('soundEnabled', e).check()
		if (Sound.soundAvailability)
			View.showNotice(`サウンドを${e?'有':'無'}効に設定しました`)
		else
			View.showNotice(`サウンドを${e?'有':'無'}効に設定しました`+'\nただしお使いの環境では音が出せません')
	})
	var el = el_debugSub.append(new DOM('button', bs))
	el.append(new DOM('text', 'キャシュ削除'))
	el.on('click', _ => {
		Util.cacheClear()
		View.showNotice('キャッシュを削除しました')
	})
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


	function cancelEvent(evt) {
		if (!(evt instanceof Event)) return
		evt.preventDefault()
		evt.stopImmediatePropagation()
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
				//setAuto(kind)
				var rehook = _ => View.on(kind, onFulfilled, onRejected)
				return new Promise( resolve => hookInput(kind, resolve) ).then( _ => rehook ).then(onFulfilled).check().catch(onRejected)
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
				stopAuto()
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

			showNotice: function (message, show_time, delay_time = 250) {
				if (!message) throw 'illegal message string'
				if (!show_time) show_time = message.split('\n').length * 500
				message = '【！】\n' + message
				var noticeWindow = new DOM('div', {
					fontSize		: '2em',
					color			: 'rgba(0,0,0,0.75)',
					textShadow		: 'rgba(0,0,0,0.75) 0.01em 0.01em 0.01em',
					backgroundColor	: 'rgba(255,255,0,0.75)',
					boxShadow		: 'rgba(100,100,0,0.5) 0px 0px 5px 5px',
					borderRadius	: '2% / 10%',
					textAlign		: 'center',
					lineHeight		: '1.5',
					opacity			: '0',
					position		: 'absolute',
					left			: 'calc((100% - 90%) / 2)',
					top				: '20%',
					zIndex			: '5000',
					width			: '90%',
					fontFamily		: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
					letterSpacing	: '0.1em',
				})
				el_player.append(noticeWindow).append(new DOM('pre', {margin: '5%'})).append(new DOM('text', message))
				return new Promise(function (ok, ng) {
					var opacity = 0
					setAnimate(function (delta, complete) {
						opacity = delta / delay_time
						if (opacity >= 1) {
							opacity = 1
							vibrate([100,100,100])
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
					fontSize		: '1em',
					color			: 'rgba(255,255,255,0.25)',
					textShadow		: 'rgba(0,0,0,0.5) 0.1em 0.1em 0.1em',
				//	textAlign		: 'center',
					position		: 'absolute',
					right			: '0%',
					bottom			: '0%',
					zIndex			: '4000',
				//	width			: 'auto',
					fontFamily		: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
					letterSpacing	: '0.1em',
				})

				var defer = Promise.defer()
				Promise.resolve().delay(100).then(defer.resolve)
				defer.promise.then( _ => el_player.append(loadingWindow).append(new DOM('pre', {margin: '0%'})).append(new DOM('text', message)) )
				function hide() { defer.reject(); loadingWindow.remove() }
				return hide

			},

			adjustScale, setAnimate,

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

				this.mainMessageWindow = this.addMessageWindow()
				this.imageFrame = this.addImageFrame()
				this.logs = []

				View.on('menu').then(_ => this.showMenu()).check()
				View.on('Uwheel').then(_ => View.showLog())
			},

			messageWindowProto: {
				nextPage: function (name, {sys = false, visited = false} = {}) {
					View.logs.push(View.windows.message.cloneNode(true))
					if (View.logs.length > 100) View.logs.shift()	
					View.windows.message.setStyles({
						background		:  sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)',
						boxShadow		: (sys ? 'rgba(0,100,50,0.5)' : 'rgba(0,0,100,0.5)') + ' 0 0 0.5em 0.5em',
						color			: visited ? 'rgba(255,255,150,0.9)' : 'rgba(255,255,255,0.9)',
					})
					name = !name || name.match(/^\s+$/) ? '' : '【' +name+ '】' 
					this.el_title.textContent = name
					this.el_body.removeChildren()

				},

				addSentence: function (text, {weight = 25, visited = false} = {}) {
					text += '\n'
	
					var length = text.length
					var at = 0, nl = 0
					var el = this.el_body
					var [aborted, cancelled] = [false, false]
					var [abort, cancel] = [_ => aborted = true, _ => cancelled = true]
					View.on('go').then(cancel)

					function mul(str, n) { return (str||'100%').match(/[\d.]+/)[0]*n/100 + 'em' }

					var css = {} 

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
							if (str == '\\') {
								var sub = text.slice(at+1)
								if (/^.\[.*?\]/.test(sub)) {

									var nat = text.indexOf(']', at)
									var name = text.slice(at+3, nat).trim()
									switch (sub[0]) {

										case 'e':
											if ($isWebkit) {
												var img = el.append(new DOM('img', { height: mul(css.fontSize, 0.8), margin: '0 0.05em' }))
												;((img, name) => Util.toBlobEmogiURL(name).then( url => {img.src = url} ).check())(img, name)
											} else {
												var img = el.append(new DOM('object', { height: mul(css.fontSize, 0.8), margin: '0 0.05em' }))
												img.type = 'image/svg+xml'
												;((img, name) => Util.toBlobEmogiURL(name).then( url => {img.data = url} ).check())(img, name)
											}
										break

										case 'c': css.color = name || '' ; break
										case 's': css.fontSize = Util.toSize(name) || '100%' ; break

										default: LOG(`サポートされていないキーワードタイプ『${sub[0]}』`)

									}

								} else {

									var nat = at + 1
									switch (sub[0]) {

										case 'n': el.append(new DOM('br')) ; break
										case 'C': css.color = '' ; break
										case 'S': css.fontSize = '100%' ; break
										case 'b': css.fontWeight = 'bold' ; break
										case 'B': css.fontWeight = '' ; break
										

										default: LOG(`サポートされていないキーワードタイプ『${sub[0]}』`)
									}

								}

								nl += nat - at
								at = nat
							} else {
								if (str == '\n') el.append(new DOM('br'))
								else if (str != '\u200B') el.append(new DOM('span', css)).append(new DOM('text', str))
							}
							 
							if (++at >= length) return complete()
						}
					})

					setAuto(p, {visited})
					p.abort = abort
					p.cancel = cancel
					return p
				},
			},

			addMessageWindow: function (opt = {}) {
				Util.setDefaults(opt, {
					background		: 'rgba(50,50,50,0.5)',
					boxShadow		: 'rgba(50,50,50,0.5) 0 0 0.5em 0.5em',
					borderRadius	: '1% / 1%',
					width			: 'calc(100% - 0.5em - (1% + 1%))',
					height			: 'calc( 20% - 0.5em - (2% + 1%))',
					fontSize		: '100%',
					lineHeight		: '1.5',
					padding			: '2% 1% 1%',
					whiteSpace		: 'nowrap',
					position		: 'absolute',
					bottom			: '0.25em',
					left			: '0.25em',
					zIndex			: '1500',
					fontFamily		: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
					letterSpacing	: '0.1em',

				})
				var el = new DOM('div', opt)
				this.windows.message = el
				el_context.append(el)

				var el_title = el.append(new DOM('div', {
					display			: 'inline-block',
					marginRight		: '4%',
				//	color			: 'blue',
					textAlign		: 'right',
					verticalAlign	: 'top',
					width			: '15%',
					height			: '100%',
				//	background		: 'rgba(255,100,200,0.5)',
				//	padding			: '5px',
				}))

				/*
				el_title.onmousedown = evt => {
					evt.preventDefault()
					evt.stopImmediatePropagation()
					eventFire('menu', false)
				}
				*/

				var el_body = el.append(new DOM('div', {
					display			: 'inline-block',
					width			: 'auto',
					height			: '100%',
				//	padding			: '15px',
				})).append(new DOM('span', {
					//margin			: '0',
				}))

				var mw = { __proto__: this.messageWindowProto,
					el				: el,
					el_title		: el_title,
					el_body			: el_body,
				}

				return mw
			},

			addImageFrame: function (opt = {}) {

				var fr = new DOM('div', {
					position		: 'absolute',
					left			: '0',
					top				: '0',
					height			: '100%',
					width			: '100%',
					zIndex			: '1000',
					backgroundColor	: 'black',
				})

				el_context.append(fr)
				return fr

			},

			setConfirmWindow: function (name, {sys = true} = {}) {
				return View.setChoiceWindow([{name, value: true}, {name: 'キャンセル', value:false}], {sys})
			},

			setChoiceWindow: function (opts, {sys = false, closeable = false, half = false, plus = false} = {}) {

				var defer = Promise.defer()
				var removed = false
				var focusbt
				var focusindex = -10000
				var bts = []


				var cw = new DOM('div', {
					position		: 'absolute',
					left			: 'calc((100% - 85%) / 2 - 2%)',
					width			: '85%',
				//	height			: '70%',
					top				: '3%', 
					boxShadow		: sys ? 'rgba(100, 255, 150, 0.5) 0 0 5em' : 'rgba(100, 100, 255, 0.3) 0 0 5em',
					borderRadius	: '3% / 5%',
					background		: sys ? 'rgba(100, 255, 150, 0.5)' : 'rgba(100, 100, 255, 0.3)',
					padding			: '1% 2%',
					overflowY		: opts.length > (plus?4:3) * (half?2:1) ? 'scroll' : 'hidden',
					overflowX		: 'hidden',
					maxHeight		: plus ? '90%' : '70%',
					zIndex			: '2500',
				//	verticalAlign	: 'middle',
				})
				if (!sys) {
					if (View.windows.choice) View.windows.choice.remove()
					View.windows.choice = cw
				} else {
					if (View.windows.choiceBack) View.windows.choiceBack.remove()
					View.windows.choiceBack = cw
				}

				opts.forEach(function (opt, i) {
					if (!('value' in opt)) opt.value = opt.name
					var bt = new DOM('button', {
						display			: 'inline-block',
						fontSize		: '1.5em',
						boxShadow		: 'inset 0 1px 3px #F1F1F1, inset 0 -15px ' + (sys ? 'rgba(0,116,116,0.2)' : 'rgba(0,0,223,0.2)') + ', 1px 1px 2px #E7E7E7',
						background		: sys ? 'rgba(0,100,50,0.8)' : 'rgba(0,0,100,0.8)',
						color			: 'white',
						borderRadius	: '5% / 50%',
						width			: half ? '45%' : '95%',
						height			: '2.5em',
						margin			: '2.5%',
						textShadow		: 'rgba(0,0,0,0.9) 0em 0em 0.5em',
						fontFamily		: "'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
						letterSpacing	: '0.1em',
					})
					bt.disabled = !!opt.disabled
					bt.append(new DOM('text', opt.name))
					bt.onfocus = bt.onmouseover = _ => {
						focusSE.play()
						bt.setStyles({ background: sys ? 'rgba(100,200,150,0.8)' : 'rgba(100,100,200,0.8)' })
						var elm = bts[focusindex]
						if (elm) elm.blur()
						focusindex = index
					}
					bt.onblur = bt.onmouseout = _ => {
						bt.setStyles({ background: sys ? 'rgba(0,100,50,0.8)' : 'rgba(0,0,100,0.8)' })
						var elm = bts[focusindex]
						if (elm) elm.blur()
						//focusindex = -10000
					}
					bt.onclick = evt => {
						clickSE.play()
						vibrate([50])
						close(evt, opt.value)
					}
					bt.onmousedown = cancelEvent
					cw.append(bt)
					if (!opt.disabled) var index = bts.push(bt) - 1
				}, this)

				function close(evt, val) {
					cancelEvent(evt)
					removed = true
					defer.resolve(val)
					if (!sys) delete View.windows.choice
					else delete View.windows.choiceBack
					cw.remove()
					if (img) img.remove()
				}

				if (half) {
					View.on('up', rehook => focusmove(rehook, -2) )
					View.on('down', rehook => focusmove(rehook, +2) )
					View.on('left', rehook => focusmove(rehook, -1) )
					View.on('right', rehook => focusmove(rehook, +1) )
				} else {
					View.on('up', rehook => focusmove(rehook, -1) )
					View.on('down', rehook => focusmove(rehook, +1) )
					View.on('left', rehook => focusmove(rehook, -10) )
					View.on('right', rehook => focusmove(rehook, +10) )
				}
				View.on('enter', focusenter)

				function focusmove(rehook, n) {
					if (removed) return
					var fi = focusindex
					var si = fi + n
					var last = bts.length - 1
					
					if (fi < 0) si = n > 0 ? 0 : last
					else if (si < 0) si = fi == 0 ? last : 0
					else if (si > last) si = fi == last ? 0 : last
					bts[si].focus()
					Promise.delay(100).then(rehook)
				}

				function focusenter(rehook) {
					if (removed) return
					if (focusindex >= 0) return bts[focusindex].click()
					Promise.delay(100).then(rehook)
				}

				if (closeable) {
					var img = new DOM('img', {
						position		: 'absolute',
						right			: '2%',
						top				: '0%',
						width			: '3em',
						height			: '3em',
						opacity			: '0.75',
						zIndex			: '3000',
					})

					if (!sys) {
						if (View.windows.choiceClose) View.windows.choiceClose.remove()
						View.windows.choiceClose = img
					} else {
						if (View.windows.choiceBackClose) View.windows.choiceBackClose.remove()
						View.windows.choiceBackClose = img
					}

					if ($isWebkit) {
						Util.toBlobSysPartsURL('閉じるボタン').then( url => {img.src = url} ).check()
					} else {
						img.src = 'エンジン/画像/閉じるボタン.svg'
					}
					img.onmousedown = evt => {
						close(evt, '閉じる')
					}

					el_context.append(img)
				}


				el_context.append(cw)


				return defer.promise

			},


			setBGImage: function (opt) {
				var defer = Promise.defer()
				var {url, sys} = opt
				var fr = View.imageFrame
				if (url) {
					var img = new Image
					img.onload = _ => {
						fr.setStyles({
							backgroundImage: `url(${url})`,
							backgroundSize: 'cover',
						})
						defer.resolve()
					}
					img.src = url
					if (!sys) Data.current.active.BGImage = opt
				} else {
					fr.setStyles({
						backgroundImage: 'none',
						backgroundSize: 'cover',
					})
					defer.resolve()
				}
				return defer.promise
			},

			setFDImages: function (ary) {
				var defer = Promise.defer()
				var fr = View.imageFrame
				//var ch = [].slice.call(el.children)
				Promise.all(ary.map( opt => new Promise( ok => {
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
					img.onload = _ => ok(img)
					img.src = opt.url
					
				}) ) ).then( els => {
					fr.removeChildren()
					els.forEach( el => fr.append(el) )
					defer.resolve()
				})

				Data.current.active.FDImages = ary
				return defer.promise
			},


			// エフェクト
			prepareFade: function () {
				if (View.fake) return Promise.reject('２重にエフェクトの準備をしようとした')
				var fr = View.imageFrame
				var fake = View.fake = fr.cloneNode(true)
				el_context.append(fake)
				//fr.style.opacity = 0
				Data.saveDisabled = true
				return Promise.resolve()
			},

			fade: function ({msec = 1000, visited = false} = {}) {
				//debugger
				if (!View.fake) return Promise.reject('このエフェクトには事前準備が必要')
				var fr = View.imageFrame, fake = View.fake
				var cancelled = false
				View.on('go').then(_ => cancelled = true)
				if (visited) setAuto(null, {visited: true})
				return setAnimate( (delay, complete, pause) => {
					var per = delay/msec
					if (per >= 1 || cancelled) {
						per = 1
						complete()
					}
					fake.style.opacity = 1 - per
					//fr.style.opacity = per 
				}).then( _ => {
					fake.remove()
					delete View.fake
					Data.saveDisabled = false
				})
			},

			flash: function ({msec = 300, color = 'white', visited = false} = {}) {
				var fake = View.imageFrame.cloneNode(false)
				fake.style.background = ''
				fake.style.backgroundColor = color
				fake.style.opacity = '0'
				el_context.append(fake)
				var cancelled = false
				View.on('go').then(_ => cancelled = true)
				if (visited) setAuto(null, {visited: true})
				return setAnimate( (delay, complete, pause) => {
					var per = delay/msec
					if (per >= 1 || cancelled) {
						per = 1
						complete()
					}
					fake.style.opacity = per < 0.5 ? per*2 : 2-per*2 
				}).then( _ => {
					fake.remove()
				})
			},


			//会話
			nextPage: function (name, opt) {
				this.mainMessageWindow.nextPage(name, opt)
			},

			addSentence: function (text, opt) {
				return this.mainMessageWindow.addSentence(text, opt)
			},

			showMenu: function () {
				if (Data.phase != 'play' || View.menuIndex > 0) return View.on('Rclick').then(_ => View.showMenu())
				//LOG('show')
				View.menuIndex = (View.menuIndex||0)+1
				eventBlock()
				//eventSysOnly(true)
				View.on('menu').then( _ => {
					if (this.windows.choiceBack) this.windows.choiceBack.remove()
					close()
				} ).check()
				Object.keys(View.windows).forEach( key => {
					var el = View.windows[key]
					el.hidden = !el.hidden
				} )
				
				var ary = ['セーブ', 'ロード', 'ウィンドウ消去', 'ログ表示', 'オート', '既読スキップ', 'リセット'].map(name => ({name}))
				if (Data.saveDisabled) ary[0].disabled = true
				View.setChoiceWindow(ary, {sys: true, closeable: true, half: true, plus: true}).then( kind => {

					switch (kind) {
						case 'セーブ':
							Player.saveSaveData().check().through(close)
							.then(f => f && View.showNotice('セーブしました。'), err => View.showNotice('セーブに失敗しました。') )
						break

						case 'ロード': Game.loadSaveData().then(close) ; break

						case 'ウィンドウ消去':
							//eventSysOnly(false)
							eventBlock() 
							View.on('*', _ => {
								close()
								eventAllow()
							})
						break

						case 'ログ表示': close(); eventFire('Uwheel') ; break

						case 'オート': close(); startAuto() ; break

						case '既読スキップ': close(); startSkip() ; break

						case 'リセット': View.setConfirmWindow('リセットする').then(f => { if (f) Game.reset() ;else close() }) ; break

						case '閉じる': close(); break

						default: throw 'illegal choice type'
					}
				})

				function close(evt) {
					//LOG('hide')
					if (!View.menuIndex) return
					--View.menuIndex
					eventAllow()
					//eventSysOnly(false)
					View.on('menu').then(_ => View.showMenu())
					Object.keys(View.windows).forEach( key => {
						var el = View.windows[key]
						el.hidden = !el.hidden
					} )
				}

			},

			showLog: function (text) {

				if (Data.phase != 'play' || this.windows.log) return
				eventBlock()
				//eventSysOnly(true)

				Object.keys(View.windows).forEach( key => {
					var el = View.windows[key]
					el.hidden = !el.hidden
				} )

				var el = new DOM('div', {
					position		: 'absolute',
					left			: '1em',
					top				: '1em',
					width			: 'calc(100% - 1em * 2)',
					height			: 'calc(100% - 1em * 2)',
					overflowX		: 'hidden',
					overflowY		: 'scroll',
					background		: 'rgba(50,50,50,0.9)',
					boxShadow		: 'rgba(50,50,50,0.9) 0 0 1em 1em',
					zIndex			: '2500',
				})

				var img = new DOM('img', {
					position		: 'absolute',
					right			: '2%',
					top				: '0%',
					width			: '3em',
					height			: '3em',
					opacity			: '0.75',
					zIndex			: '3000'
				})
				if ($isWebkit) {
					Util.toBlobSysPartsURL('閉じるボタン').then( url => {img.src = url} ).check()
				} else {
					img.src = 'エンジン/画像/閉じるボタン.svg'
				}
				el_context.append(img)
 
				function close(evt) {
					cancelEvent(evt)
					img.remove()
					if (View.windows.log) {
						View.windows.log.remove()
						delete View.windows.log
					}
					Object.keys(View.windows).forEach( key => {
						var el = View.windows[key]
						el.hidden = !el.hidden
					} )
					//eventSysOnly(false)
					eventAllow()
					View.on('Uwheel').then(_ => View.showLog())
				}

				img.onmousedown = close
				View.on('menu').then(close)


				View.logs.forEach(log => {
					log.setStyles({
						position		: '',
						height			: '',
						padding			: '',
						borderRadius	: '',
						width			: '',
						background		: '',
						boxShadow		: '',
						marginBottom	: '0.5em',

					})
					el.append(log)
				})
				this.windows.log = el

				el_context.append(el)
				el.scrollTop = 1<<15-1

			},

		},

	}


	var {setAuto, startAuto, stopAuto, startSkip} = (_ => { 

		var enabled = false
		var delay = 0
		var wait = true

		return {
			setAuto(p, {visited = false} = {}) {
				if (!enabled) return
				if (wait && p) p.delay(delay).then(_ => { if (enabled) eventFire('go') }).check()
				else if (visited) {
					eventFire('go')
					if (p) p.delay(delay).then(_ => { if (enabled) eventFire('go') }).check()

				}
			},
			startAuto() {
				enabled = true
				wait = true
				delay = 1500
				View.on('*', stopAuto)
				setAuto(Promise.resolve())
			},
			stopAuto() {
				enabled = false
			},
			startSkip() {
				enabled = true
				wait = false
				delay = 150
				View.on('*', stopAuto)
				setAuto(null, {visited: 1})
			},
		}
	})()


	var {hookInput, hookClear, eventBlock, eventAllow, eventFire, eventSysOnly} = (_ => {

		var keyboardTable = {
			 8: 'backspace',
			13: 'enter',
			32: 'space',
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
		}

		var hooks = []
		var sysOnly = false
		//var blocks = new Set

		document.addEventListener('keydown', evt => {
			var type = keyboardTable[evt.keyCode]
			if (type) onEvent(type, evt)
		}, true)

		el_wrapper.addEventListener('mousedown', evt => {
			var type = 'LMR'[evt.button]
			if (type) onEvent(type + 'click', evt)
		})

		var wheeling = false
		el_wrapper.addEventListener('wheel', evt => {
			if (wheeling) return
			wheeling = true
			setTimeout( _ => { wheeling = false }, 50)
			var type = evt.deltaY < 0 ? 'U' : 'D'
			if (type) onEvent(type + 'wheel', evt)
		})

		el_wrapper.addEventListener('contextmenu', evt => {
			onEvent('contextmenu', evt)
		}, true)

		function onEvent(type, evt, sys) {
			cancelEvent(evt)
			if (sysOnly && !sys) return
			hooks = hooks.reduce( (ary, hook) => {
				if (hook.indexOf(type) === -1 || hook.blocked > 0) ary.push(hook)
				else hook.resolve()
				return ary
			}, [])
		}

		function toHook(kind) {
			switch (kind) {
				case '*':
					return ['*', 'Lclick', 'Rclick', 'Uwheel', 'Dwheel', 'enter', 'space', 'backspace']
				case 'go':
					return ['go', 'Lclick', 'Dwheel', 'enter', 'space']
				case 'menu':
					return ['menu', 'Rclick', 'backspace']
				default: 
					return [kind]	
			}
		}

		return {
			hookInput(kind, resolve) {
				var hook = toHook(kind)
				hook.resolve = resolve
				hook.blocked = 0
				hooks.push(hook)
			},
			hookClear() {
				hooks.length = 0
				eventSysOnly(false)
			},
			eventBlock() {
				hooks.forEach( hook => ++hook.blocked )
			},
			eventAllow() {
				hooks.forEach( hook => --hook.blocked )
			},
			eventFire(type, sys = true) {
				onEvent(type, null, sys)
			},
			eventSysOnly(flag) {
				sysOnly = flag
			}
		}
	})()


	function vibrate(...args) {
		if (typeof navigator.vibrate == 'function') navigator.vibrate(...args)
	}

	window.onbeforeunload = _ => {
		if (Data.phase == 'play') return 'セーブされていないデータは失われます。'
	}

	var $full = false
	var $ratio = 16 / 9
	var $mode = ''
	var width = document.body.clientWidth * devicePixelRatio
	var $scale = (width / $ratio >= 540 ? 540 : width / $ratio) / devicePixelRatio
	//document.body.style.width = '100%'

	METHODS.TEST.changeMode('TEST')
	var p = adjustScale($scale, $ratio)

	p.then( _ => READY.View.ready(null) )

}).check()