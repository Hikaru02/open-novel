
READY('Player', 'DOM').then( _ => {
	'use strict'

	//var {Promise} = Util.overrides
	var View = null

	var EP = Element.prototype
	Util.setDefaults(EP, {
		on					: EP.addEventListener,
		requestFullscreen	: EP.webkitRequestFullscreen || EP.mozRequestFullScreen,
		append				: EP.appendChild,
		removeChildren		: function () { this.innerHTML = ''; return this },
		setStyles			: function (styles) {
			styles = styles || {}
			Object.keys(styles).forEach( key => { this.style[key] = styles[key] }, this)
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

		if (!full) el_player.style.height = '100%'

		var ratio = ratio || 16 / 9

		var width = height * ratio

		el_player.style.fontSize = height / 25 + 'px'

		
		//width = screen.width < width ? screen.width : width

		el_wrapper.style.height = height + 'px'
		el_wrapper.style.width  = width  + 'px'
		if (full) {
			el_fullscreen.style.height = el_player.style.height = height + 'px'
		} else fitScreen = Util.NOP 

		//RAF(styleAdjustLoop) 
	}
	


	var el_debug = new DOM('div', {
		width		: '300px',
		textAlign	: 'center',
		fontSize	: '1em',
	})


	;[360, 480, 720, 1080].forEach( size => {

		var el = el_root.append(el_debug).append(new DOM('button'))
		el.append(new DOM('text', size + 'p'))
		el.on('click', _ =>	adjustScale(size / devicePixelRatio) )
	})
	
	el_root.append(el_debug).append(new DOM('br'))
	
	var el = el_root.append(el_debug).append(new DOM('button'))
	el.append(new DOM('text', 'フルウィンドウ（横）'))
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
	var el = el_root.append(el_debug).append(new DOM('button'))
	el.append(new DOM('text', 'フルスクリーン（横）'))
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
		View.showNotice('この機能はブラウザにより\n表示の差があります', 3000)
	})




	function setAnimate(func) {
		var start = performance.now()
		var cancelled = false
		return new Promise(ok => {
			var complete = _ => {
				cancelled = true
				ok()
			}
			var loop = now => {
				if (cancelled) return
				var delta = now - start
				if (delta < 0) delta = 0
				requestAnimationFrame(loop)
				func(delta, complete)
			}
			requestAnimationFrame(loop)
		})

	}


	var $full = false
	var $ratio = 16 / 9
	var width = document.body.clientWidth
	var $scale = width / $ratio >= 480 ? 480 : width / $ratio
	//document.body.style.width = '100%'

	adjustScale($scale, $ratio)

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
				var height = opt.HEIGHT || 480

				opt.height = opt.width = '100%'

				el_context = new DOM('div')
				el_player.removeChildren()
				el_player.append(el_context)
				el_wrapper.setStyles({ overflow	: 'hidden', maxHeight: '100%', maxWidth: '100%' })
				if (!document.fullscreenElement) el_player.setStyles({ position: 'relative', overflow: 'hidden', height: '100%', width: '100%' })
				el_context.setStyles(opt)
			},

			showNotice: function (message, show_time = 3000, delay_time = 500) {
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
		},
	}

	METHODS = {
		TEST: { __proto__: METHODS.COMMON,
			initDisplay: function (opt) {
				Util.setDefaults(opt, {
					fontSize		: 'calc(100% * 2 / 3)',
					color			: 'white',
				})
				this.__proto__.initDisplay(opt)
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
				Util.setDefaults(opt, {
					color			: 'rgba(255,255,255,0.9)',
				//	fontSize		: 'calc(480px / 20)',
					textShadow		: 'rgba(0,0,0,0.9) 0.1em 0.1em 0.1em',
					overflow		: 'hidden',
				})
				this.__proto__.initDisplay(opt)

				this.mainMessageWindow = this.addMessageWindow({z:10})
				this.imageFrame = this.addImageFrame({z:20})

			},

			messageWindowProto: {
				nextPage: function (name, opt) {
					name = !name || name.match(/^\s+$/) ? '' : '【' +name+ '】' 
					this.el_title.textContent = name
					this.el_body.removeChildren()

				},
				addSentence: function (text, opt) {
					text += '\n'
					opt = Util.setDefaults(opt, {
						weight: 33
					})
					
					var length = text.length
					var at = 0
					var el = this.el_body
					var weight = opt.weight
					var [aborted, cancelled] = [false, false]
					var [abort, cancel] = [_ => aborted = true, _ => cancelled = true]
					View.on('go').then(cancel)

					var p = setAnimate( (delay, complete) => {
						if (aborted) return complete()
						if (cancelled) {
							el.append(new DOM('text', text.slice(at).replace(/\u200B/g, '') ))
							return complete()
						}
						while (delay / weight >= at) {
							var str = text[at]
							if (str != '\u200B') el.append(new DOM('text', str))
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
					background		: 'rgba(0,0,100,0.5)',
					boxShadow		: 'rgba(0,0,100,0.5) 0px 0px 5px 5px',
					borderRadius	: '1% / 1%',
					width			: 'calc(100% - 10px - (2% + 2%))',
					height			: 'calc( 25% - 10px - (4% + 2%))',
					fontSize		: '100%',
					lineHeight		: '1.5em',
					fontWeight		: 'bold',
					padding			: '4% 2% 2% 2%',
					whiteSpace		: 'nowrap',
					position		: 'absolute',
					bottom			: '5px',
					left			: '5px',
					zIndex			: opt.z || 1400,

				})
				var el = new DOM('div', opt)
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

			setChoiceWindow: function (opts) {

				var defer = Promise.defer()

				var cw = new DOM('div', {
					position		: 'absolute',
					left			: 'calc((100% - 60%) / 2 - 5%)',
					width			: '60%',
					top				: '10%', 
					boxShadow		: 'rgba(100, 100, 255, 0.5) 0 0 2em',
					borderRadius	: '3% / 5%',
					background		: 'rgba(100, 100, 255, 0.3)',
					padding			: '3% 5%',

				})

				opts.forEach(function (opt) {
					if (!('value' in opt)) opt.value = opt.name
					var bt = new DOM('button', {
						display			: 'block',
						fontSize		: '1.5em',
						boxShadow		: 'inset 0 1px 3px #F1F1F1, inset 0 -15px rgba(0,0,223,0.2), 1px 1px 2px #E7E7E7',
						background		: 'rgba(0,0,100,0.8)',
						color			: 'white',
						borderRadius	: '5% / 50%',
						width			: '100%',
						height			: '2.5em',
						margin			: '5% 0%',
					})
					bt.append(new DOM('text', opt.name))
					bt.onclick = _ => {
						defer.resolve(opt.value)
						cw.remove()
					}
					cw.append(bt)
				})

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
					var img = new DOM('img', {
						position		: 'absolute',
						left			: opt.left  || '',
						right			: opt.right || '',
						maxWidth		: '50%',
						height			: '100%',
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

		},

	}


	var $MODE = ''


	var ViewProto = { __proto__: METHODS.COMMON,
		//get el_wrapper() { return el_wrapper },
		fresh: function () {
			View = { __proto__: ViewProto }
		},
		clean: function () {
			this.changeMode($MODE)
		},
		init: function (opt) {
			this.initDisplay(opt.style || {})
		},
		initDisplay: function (opt) {
			this.__proto__.initDisplay(opt)
		},
		changeMode: function (type, opt) {
			var type = type.toUpperCase()
			opt = opt || {}

			if (!type in METHODS) throw 'illegal ViewContext mode type'

			$MODE = type
			ViewProto.__proto__ = METHODS[type]
			View.init(opt)

		},
		changeModeIfNeeded: function (type, opt) {
			if ($MODE != type) this.changeMode(type, opt)
		},
		on: function (type, onFulfilled, onRejected) {

			 return new Promise( resolve => {
				
				switch (type) {

					case 'go':
						hookInput(['Lclick', 'enter', 'space'], resolve)
					break

					default: throw 'illegal hook event type'		
				}
			}).then(onFulfilled).catch(onRejected)

		},
	}

	ViewProto.fresh()



	var hookInput = (_ => {

		var keyboardTable = {
			13: 'enter',
			32: 'space',
		}

		var hooks = []

		document.addEventListener('keydown', evt => {
			var type = keyboardTable[evt.keyCode]
			if (type) onEvent(type, evt)
		})

		el_wrapper.addEventListener('mousedown', evt => {
			var type = 'LMR'[evt.button]
			if (type) onEvent(type + 'click', evt)
		})

		function onEvent(type, evt) {
			evt.preventDefault()
			hooks = hooks.reduce( (ary, hook, i) => {
				if (hook.indexOf(type) === -1) ary.push(hook)
				else hook.resolve()
				return ary
			}, [])
		}

		return function hookInput(hook, resolve) {
			hook.resolve = resolve
			hooks.push(hook)
		}
	})()


	READY.View.ready(View) 

})