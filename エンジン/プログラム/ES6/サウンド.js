
READY('Storage', 'Player', 'View').then(Util.co(function* () {

	var soundEnabled = yield Storage.getSetting('soundEnabled', false)

	return {soundEnabled}

})).then( config => {

	var {soundEnabled} = config

	var sourceMap = new Map
	var bufferMap = new Map
	//var {R} = Util.overrides

	var soundAvailability = !!global.AudioContext

	if (soundAvailability) {

		var ctx = new AudioContext()

		var gainMaster = ctx.createGain()
		var gainSysSE = ctx.createGain()

		gainMaster.connect(ctx.destination)
		gainSysSE.connect(gainMaster)

		gainMaster.gain.value = 0.5

	}

	function canplay() {
		return soundAvailability && soundEnabled
	}


	function useSound(url) {
		return Player.load(url, 'arraybuffer').then( buf => bufferMap.set(url, buf) )
	}

	function prepareSound(url) {
		var buf = bufferMap.get(url)
		if (!buf) {
			LOG(`サウンドURL『${url}』は未取得のため準備が延期されました`)
			return useSound(url).then( _ => prepareSound(url) )
		} 
		return new Promise( (ok, ng) => {
			ctx.decodeAudioData(buf, buf => {
				var src = ctx.createBufferSource()
				src.buffer = buf
				sourceMap.set(url, src)
				ok()
			}, ng )
		})
	}

	function playSound(url, node) {
		if (!canplay()) return Promise.resolve()
		var src = sourceMap.get(url)
		if (!src) {
			LOG(`サウンドURL『${url}』は未準備のため再生が延期されました`)
			return prepareSound(url).then( _ => playSound(url, node) )
		} 
		if (!node) {
			LOG('接続先のノードが不明なため再生が中止されました')
			return Promise.reject()
		}
		src.connect(node)
		src.start()
		sourceMap.delete(url)
		prepareSound(url)
		var defer = Promise.defer()
		src.onended = defer.resolve
		return defer.promise
	}



	READY.Sound.ready({

		playSysSE(name, opt) {
			var url = `エンジン/効果音/${name}.ogg`
			return playSound(url, gainSysSE)
		},

		fadeoutSysSE(name, opt = {}) {
			/*
			var defer = Promise.defer()
			var a = sysSEMap.get(name)
			if (!this.soundEnabled) defer.resolve()
			else if (!a) {
				LOG(`対象のサウンド『${name}』が未登録`)
				return R
			} else {
				var volume = a.volume
				var {duration = 500} = opt
				View.setAnimate( (delay, complete, pause) => {
					var newvolume = volume * (1 - delay / duration)
					if (newvolume <= 0) {
						newvolume = 0
						complete()
					}
					a.volume = newvolume
				}).then(defer.resolve)
			}
			return defer.promise
			*/
		},

		soundEnabled, soundAvailability,
	})

}).check()

