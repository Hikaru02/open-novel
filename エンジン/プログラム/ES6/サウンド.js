
READY('Storage', 'View').then(Util.co(function* () {

	var soundEnabled = yield Storage.getSetting('soundEnabled', false)
	var sysSEMap = new Map
	var {R} = Util.overrides

	READY.Sound.ready({

		playSysSE(name, opt) {
			if (!this.soundEnabled) return R
			var defer = Promise.defer()
			var a = sysSEMap.get(name)
			if (!a) {
				a = new Audio(`エンジン/効果音/${name}.ogg`)
				sysSEMap.set(name, a)
				a.oncanplaythrough = _ => {
					a.oncanplaythrough = null
					Sound.playSysSE(name, opt).then(defer.resolve)
				}
			} else {
				//a.pause()
				a.currentTime = 0
				a.volume = 0.5
				a.onplay = _ => defer.resolve( {ended: new Promise( ok => a.onended = ok )} )
				a.play()
			}
			return defer.promise
		},

		fadeoutSysSE(name, opt = {}) {
			if (!this.soundEnabled) return R
			var defer = Promise.defer()
			var a = sysSEMap.get(name)
			if (!a) {
				LOG(`対象のサウンド『${name}』が未登録`)
				return R
			}
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
			return defer.promise
		},

		soundEnabled,
	})

})).check()

