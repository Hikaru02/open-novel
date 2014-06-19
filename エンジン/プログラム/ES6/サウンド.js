
READY('Storage', 'Player').then(Util.co(function* () {

	var soundEnabled = yield Storage.getSetting('soundEnabled', false)

	return {soundEnabled}

})).then( config => {

	var {soundEnabled} = config

	var bufferMap = new Map
	//var {R} = Util.overrides

	var soundAvailability = !!global.AudioContext

	if (soundAvailability) {

		var ctx = new AudioContext()

		var comp = ctx.createDynamicsCompressor()
		var gainMaster = ctx.createGain()
		var gainSysSE = ctx.createGain()

		comp.connect(ctx.destination)
		gainMaster.connect(comp)
		gainSysSE.connect(gainMaster)

		gainMaster.gain.value = 0.5

	}

	function canplay() {
		return soundAvailability && soundEnabled
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
				break
				default: throw `想定外のタイプ『${kind}』`
			}
			var gain = ctx.createGain()
			gain.connect(des)
			this.readyState = 0
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
			return Player.load(url, 'arraybuffer').then( buf => {
				bufferMap.set(url, buf)
				this.buf  = buf
			})
		}

		prepare() {
			var {buf} = this
			if (!buf) return this.load().then( _ => this.prepare() )
			return new Promise( (ok, ng) => {
				ctx.decodeAudioData(buf, buf => {
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
			src.start(0)
			this.src = null
			this.prepare()
			return new Promise( ok => { src.onended = ok } )
		}

		fadeout(duration = 0.5) {
			var t0 = ctx.currentTime, gain = this.gain.gain
			gain.setValueAtTime(gain.value, t0)
			gain.linearRampToValueAtTime(0, t0 + duration)
		}

	}

	Object.assign(Sound, {
		soundEnabled, soundAvailability,
	})

	READY.Sound.ready(Sound)

}).check()

