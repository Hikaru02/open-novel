
READY('Storage', 'Player').then( ({Util}) => {
	'use strict'


	var init = Util.co(function* () {

		var soundEnabled = yield Storage.getSetting('soundEnabled', false)

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

			off() {
				var t0 = ctx.currentTime, gain = this.gain.gain
				gain.cancelScheduledValues(t0)
				gain.value = 0
			}

		}

		var soundAvailability = !!global.AudioContext

		if (soundAvailability) {

			ctx = new AudioContext()
			
			var gainRoot   = ctx.createGain(); gainRoot.connect(ctx.destination)
			var compMaster = ctx.createDynamicsCompressor(); compMaster.connect(gainRoot)

			var gainMaster = ctx.createGain(); gainMaster.connect(compMaster); gainMaster.gain.value = 0.5
			var gainSysSE  = ctx.createGain(); gainSysSE.connect(gainMaster)
			var gainBGM    = ctx.createGain(); gainBGM.connect(gainMaster)

			var rootVolume = new GainChanger(gainRoot) 
			document.addEventListener('visibilitychange', _ => {
				if (document.hidden) rootVolume.off() 
				else rootVolume.up()
			})
			if (document.hidden) rootVolume.off()

		}

		function canplay() {
			return ctx && soundAvailability && Sound.soundEnabled
		}


		class Sound {

			constructor(kind, name) {
				if (!kind) throw 'タイプが未指定'
				if (!name) throw '名前が未指定'
				if (!soundAvailability) return
				switch (kind) {
					case 'sysSE':
						var url = `エンジン/効果音/${name}.ogg`
						var des = gainSysSE
						var type = 'SE'
					break
					default: throw `想定外のタイプ『${kind}』`
				}
				var gain = ctx.createGain()
				gain.connect(des)
				this.readyState = 0
				this.type = type 
				this.url = url
				this.buf = null
				this.src = null
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

			fadeout(duration = 0.5) {
				if (!canplay()) return
				var t0 = ctx.currentTime, gain = this.gain.gain
				gain.cancelScheduledValues(t0)
				gain.setValueAtTime(gain.value, t0)
				gain.linearRampToValueAtTime(0, t0 + duration)
			}

		}

		Object.assign(Sound, {
			soundEnabled, soundAvailability, CTX: ctx, rootVolume,
		})

		READY.Sound.ready(Sound)

	}


	init().check()

}).check()

