
READY('Storage', 'Player').then( ({Util}) => {
	'use strict'


	var init = Util.co(function* () {

		var soundEnabled = yield Storage.getSetting('soundEnabled', true)

		return setup ({soundEnabled})
	})


	var setup = config => {

		var {soundEnabled} = config

		var ctx = null
		var bufferMap = new Map
		//var {R} = Util.overrides

		class GainChanger {

			constructor(gain) {
				this.gain = gain
			}

			up(duration = 0.5) {
				var t0 = ctx.currentTime, gain = this.gain.gain
				gain.cancelScheduledValues(t0)
				gain.setValueAtTime(gain.value, t0)
				gain.linearRampToValueAtTime(1, t0 + duration)
			}

			mute() {
				var t0 = ctx.currentTime, gain = this.gain.gain
				gain.cancelScheduledValues(t0)
				gain.setValueAtTime(0, t0)
				//gain.value = 0
			}

		}

		var soundAvailability = !!global.AudioContext

		if (soundAvailability) {

			ctx = new AudioContext()
			
			var gainRoot    = ctx.createGain(); gainRoot.connect(ctx.destination)
			var compMaster  = ctx.createDynamicsCompressor(); compMaster.connect(gainRoot)

			var gainMaster  = ctx.createGain(); gainMaster.connect(compMaster); gainMaster.gain.value = 0.5
			var gainSysSE   = ctx.createGain(); gainSysSE.connect(gainMaster)
			var gainUserBGM = ctx.createGain(); gainUserBGM.connect(gainMaster)
			var gainBGM     = ctx.createGain(); gainBGM.connect(gainMaster)

			var rootVolume  = new GainChanger(gainRoot) 

			document.addEventListener('visibilitychange', muteOrUp)
			muteOrUp()

		}

		function muteOrUp() {
			if (document.hidden || !soundEnabled) rootVolume.mute() 
			else rootVolume.up()
		}

		function changeSoundEnabled(f) {
			Sound.soundEnabled = soundEnabled = f
			muteOrUp()
		}

		function canplay() {
			return soundAvailability && ctx //&& Sound.soundEnabled
		}




		class SEnBGN {

			fadeout(duration = 0.5) {
				if (!canplay()) return
				var t0 = ctx.currentTime, gain = this.gain.gain
				gain.cancelScheduledValues(t0)
				gain.setValueAtTime(gain.value, t0)
				gain.linearRampToValueAtTime(0, t0 + duration)
				//Promise.delay(duration).then( _ => {console.log(this.src);this.src.stop()} )
			}

		}


		class SE extends SEnBGN {

			constructor(name, {sys = false} = {}) {
				if (!name) throw '名前が未指定'
				if (!soundAvailability) return
				var url = `エンジン/効果音/${name}.ogg`
				var des = gainSysSE					
				var gain = ctx.createGain()
				gain.connect(des)

				this.url  = url
				this.buf  = null
				this.src  = null
				this.gain = gain
				this.prepare()
			}

			load() {
				var {url} = this
				var buf = bufferMap.get(url)
				if (buf) return Promise.resolve(buf)
				return Util.load(url, 'arraybuffer').then( buf => {
					bufferMap.set(url, buf)
					this.buf  = buf
				})
			}

			prepare() {
				var {buf} = this
				if (!buf) return this.load().then( _ => this.prepare() )
				return new Promise( (ok, ng) => {
					ctx.decodeAudioData(buf.slice(), buf => {
						var src = ctx.createBufferSource()
						src.buffer = buf
						src.connect(this.gain)
						this.src = src
						ok()
					}, ng)
				})
			}

			play() {
				if (!canplay()) return Promise.resolve(null)
				var {src} = this
				if (!src) return this.prepare().then( _ => this.play() )
				src.start()
				this.src = null
				this.prepare()
				return new Promise( ok => { src.onended = ok } )
			}

		}


		class BGM extends SEnBGN {

			constructor(name, {sys = false} = {}) {
				if (!name) throw '名前が未指定'
				if (!soundAvailability) return
				var type = 'BGM'
				var url = 'not use'
				var des = gainUserBGM
				var gain = ctx.createGain()
				gain.connect(des)

				this.name = name
				this.url  = url
				this.buf  = null
				this.src  = null
				this.gain = gain
				
			}

			prepare() {
				return Util.toBlobURL('BGM', this.name, 'ogg').then( url => {
					var a = new Audio(url)
					a.loop = true
					this.src = a
					ctx.createMediaElementSource(a).connect(this.gain)
				})

			}

			play() {
				if (!canplay()) return Promise.resolve(null)
				var {src} = this
				if (!src) return this.prepare().then( _ => this.play() )
				var t0 = ctx.currentTime, gain = this.gain.gain
				src.play()
				return new Promise( ok => { src.onended = ok } )
			}

			fadein(duration = 0.5) {
				if (!canplay()) return Promise.resolve(null)
				var {src} = this
				if (!src) return this.prepare().then( _ => this.play() )
				var t0 = ctx.currentTime, gain = this.gain.gain
				gain.cancelScheduledValues(t0)
				gain.setValueAtTime(0, t0)
				src.play()
				gain.linearRampToValueAtTime(1, t0 + duration)
				return new Promise( ok => { src.onended = ok } )
			}
			
		}


		var changeBGM = ( _ => {

			var currentBGM = null

			return name => {
				var duration = 0.5
				return new Promise( ok => {
					if (currentBGM) {
						currentBGM.fadeout(duration)
						Promise.delay(duration).then(ok)
					} else ok()
				}).then( _ => {
					if (!name) return
					currentBGM = new Sound.BGM(name)
					Data.current.active.BGM = name
					currentBGM.fadein(duration)
					return Promise.delay(duration)

				})
			}

		})()

		var init = _ => { changeBGM(null) }



		READY.Sound.ready({
			soundEnabled, soundAvailability, CTX: ctx, rootVolume,
			SE, BGM, changeBGM, changeSoundEnabled, init,
		})

	}


	init().check()

}).check()

