
READY('Player', 'View', 'Sound').then( ({Util}) => {
	'use strict'

	//var {R} = Util.overrides

	var message = (_ => {
		var abort = Util.NOP
		return text => {
			abort()
			View.nextPage('システム', {sys: true})
			var p = View.addSentence(text, { weight: 10 })
			abort = p.abort
			return p
		}
	})()



	var setup = Util.co(function* () {

		Player.init()

		yield fadeIn()

		//message('作品一覧を読み込んでいます...')
		var setting = yield Player.fetchSettingData(Data.URL.ContentsSetting)

		message('再生する作品を選んでください')
		var scenario = yield new Promise( (ok, ng) => {

			var novels = setting['作品']

			if (!novels || !novels.length) return message('再生できる作品がありません\n『データ/作品.txt』を確認してください')
			if (novels.length === 1) return ok(novels[0])

			var opts = novels.reduce( (opts, name) => {
				opts.push({ name })
				return opts
			}, [])

			View.setChoiceWindow(opts, {sys: true, half: true}).then(ok, ng)
		})


		//message('作品情報を読み込んでいます...')
		var setting = yield Player.fetchSettingData(`データ/${scenario}/設定.txt`)

		var reqNew = yield Player.setSetting(scenario, setting)

		if (reqNew) {
			yield message('セーブデータの初期化が必要です')
			yield Player.deleteSaveData().then(...deleteAfter)
			return
		}

		message('『'+scenario+'』開始メニュー')
		var script = yield new Promise( (ok, ng) => {

			var opts = ['初めから', '続きから', '任意の場所から', '初期化する'].map( name => ({name}) )

			return View.setChoiceWindow(opts, {sys: true, closeable: true, half: true}).then( kind => {

				//message('シナリオを読み込んでいます...')
				var base = setting['開始シナリオ']
				if (!base || !(base = base[0])) return ng('設定項目「開始シナリオ」が見つかりません')

				switch (kind) {
					case '初めから': Player.fetchScriptData(base).then(ok, ng) ; break

					case '続きから':
						View.mainMessageWindow.el.hidden = true
						Player.loadSaveData().then(ok, ng)
					break

					case '任意の場所から':
						var name = prompt('『<スクリプト名>』または『<スクリプト名>#<マーク名>』の形式で指定します。\n開始シナリオから始める場合は『#<マーク名>』の形式も使えます。')
						if (!name) return message('作品選択メニューに戻ります').delay(1000).then(resetup)
						Player.fetchScriptData(name, base).check().then(ok, err => {
							message('指定されたファイルを読み込めません').delay(1000).then(resetup)
						})
					break

					case '初期化する':
						Player.deleteSaveData().check().then(...deleteAfter)
					break

					case '閉じる': resetup() ; break

					default: ng('想定外の機能が呼び出されました')

				}

			})

		})

		if (!script) return resetup()

		return load(script)
	})


	var deleteAfter = [
		f => {
			if (f) return message('初期化しました').delay(1000).then(resetup)
			else return message('作品選択メニューに戻ります').delay(1000).then(resetup)
		}, 
		err => {
			return message('消去中にエラーが発生しました').delay(1000).then(resetup)
		}
	]


	var load = Util.co(function* (script) {

		message('キャッシュ中…')
		yield Player.cacheScript(script)

		yield fadeOut()

		yield Player.runScript(script)
		View.init()

		yield message('再生が終了しました\n作品選択メニューに戻ります').delay(1000)

		return setup().catch(restart)

	})




	var restart = Util.co(function* (err) {

		LOG(err)
		if (typeof err !== 'string') err = '致命的なエラーが発生したため再生を継続できません' 
		View.init()

		yield message(err + '\n作品選択メニューに戻ります').delay(1000)
		return resetup()

	})



	var fading = false

	function fadeIn() {
		fading = true
		return Util.co(function* () {
			View.fadeIn().through(_ => { fading = false })
			yield Util.toBlobURL('画像', '背景', 'png', true).then( url => View.setBGImage({ url, sys: true }) )
		})()
	}

	function fadeOut() {
		fading = true
		return Util.co(function* () {
			yield View.fadeOut()
			View.init()
		})().through(_ => { fading = false })
	}



	function resetup() {
		if (fading) return LOG('システムフェード中です')
		fadeOut().through(setup).catch(restart)
	}

	var start = Util.co(function* () {

		var setting = yield Player.fetchSettingData(Data.URL.EngineSetting)

		Data.SystemVersion = setting['システムバージョン'][0]
		var startSE = new Sound('sysSE', '起動')

		View.init()

		yield Promise.all([
			setSysBG(),
			Promise.race([
				Promise.all([
					startSE.play(),
					View.addSentence('openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion, { weight: 0 }).delay(3000)
				]),
				View.on('go')
			]).through( _ => startSE.fadeout() )
		]).check()

		return resetup()
	})



	function setSysBG() {
		return Util.toBlobURL('画像', '背景', 'png', true)
	}


	start().check()

	READY.Game.ready({

		reset() {
			resetup()
		},

		loadSaveData: Util.co(function* () {
			var script = yield Player.loadSaveData()
			if (!script) return
			var scenario = Data.scenarioName
			var setting = Data.settingData
			Player.init()
			Player.setSetting(scenario, setting)
			var reqNew = yield Player.setSetting(scenario, setting)
			if (reqNew) {
				yield message('セーブデータの初期化が必要です')
				yield Player.deleteSaveData().then(...deleteAfter)
				return
			} 
			load(script)
		}),

	})

}).check()



/* TODO
	・エフェクト
	・効果音
	・BGM
	・Worker分離
	・ボイス
*/