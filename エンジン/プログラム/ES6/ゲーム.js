
READY('Player', 'View', 'Sound').then( ({Util}) => {
	'use strict'

	//var {R} = Util.overrides

	var message = (_ => {
		var abort = Util.NOP
		return text => {
			abort()
			View.changeModeIfNeeded('NOVEL')
			View.nextPage('システム', {sys: true})
			var p = View.addSentence(text, { weight: 10 })
			abort = p.abort
			return p
		}
	})()



	var setup = Util.co(function* () {

		Player.init()

		setSysBG()

		//message('作品一覧を読み込んでいます...')
		var setting = yield Player.fetchSettingData(Data.URL.ContentsSetting)

		View.on('menu').then(setup)

		message('再生する作品を選んでください')
		var scenario = yield new Promise( (ok, ng) => {

			var novels = setting['作品']

			if (!novels || !novels.length) return message('再生できる作品がありません。\n『データ/作品.txt』を確認してください。')
			if (novels.length === 1) return ok(novels[0])

			var opts = novels.reduce( (opts, name) => {
				opts.push({ name })
				return opts
			}, [])

			View.setChoiceWindow(opts, {sys: true}).then(ok, ng)
		})

		yield Player.setScenario(scenario)

		//message('作品情報を読み込んでいます...')
		var setting = yield Player.fetchSettingData(`データ/${scenario}/設定.txt`)

		message('『'+scenario+'』開始メニュー')
		var script = yield new Promise( (ok, ng) => {

			var opts = ['初めから', '続きから', '任意の場所から', 'データ全消去'].map( name => ({name}) )

			return View.setChoiceWindow(opts, {sys: true, closeable: true}).then( kind => {

				//message('シナリオを読み込んでいます...')
				var base = setting['開始シナリオ']
				if (!base || !(base = base[0])) return ng('開始シナリオが見つかりません。\n開始シナリオの設定は必須です。')

				switch (kind) {
					case '初めから': Player.fetchScriptData(base).then(ok, ng) ; break

					case '続きから': Player.loadSaveData().then(ok, ng) ; break

					case '任意の場所から':
						var name = prompt('『<スクリプト名>』または『<スクリプト名>#<マーク名>』の形式で指定します。\n開始シナリオから始める場合は『#<マーク名>』の形式も使えます。')
						if (!name) return message('作品選択メニューに戻ります。').delay(1000).then(resetup)
						Player.fetchScriptData(name, base).check().then(ok, err => {
							message('指定されたファイルを読み込めません。').delay(1000).then(resetup)
						})
					break

					case 'データ全消去':
						Player.deleteSaveData().check().then(f => {
							if (f) message('全消去しました').delay(1000).then(resetup)
							else message('作品選択メニューに戻ります。').delay(1000).then(resetup)
						}, err => { message('消去中にエラーが発生しました。').delay(1000).then(resetup) })
					break

					case '閉じる': resetup() ; break

					default: ng('想定外の機能が呼び出されました。')

				}

			})

		})

		if (!script) return resetup()

		return load(script)
	})


	var load = Util.co(function* (script) {

		message('キャッシュ中…')
		yield Player.cacheScript(script)

	/*
		yield message('再生準備が完了しました。\nクリック、タップ、エンターキー、スペースキーで進みます。').on('go').then( _ => {
			//Player.setRunPhase('再生')
			return Player.runScript(script, scenario)
		})
	*/

		yield message('').then( _ => {
			//View.nextPage('')
			View.clean()
			return Player.runScript(script)
		})

		View.clean()
		//Player.cacheClear()

		Player.setRunPhase('準備')

		yield message('再生が終了しました。\n作品選択メニューに戻ります。').delay(1000)

		return setup().catch(restart)

	})




	var restart = Util.co(function* (err) {

		LOG(err)
		if (typeof err !== 'string') err = '致命的なエラーが発生したため再生を継続できません。' 
		View.clean()
		Player.setRunPhase('エラー解決')

		yield message(err + '\n作品選択メニューに戻ります。').delay(1000)
		return resetup()

	})


	var resetup = _ => setup().catch(restart)


	var start = Util.co(function* () {

		Player.setRunPhase('起動')

		var setting = yield Player.fetchSettingData(Data.URL.EngineSetting)

		Data.SystemVersion = setting['システムバージョン'][0]
		var startSE = new Sound('sysSE', '起動')

		View.changeMode('NOVEL')

		yield Promise.all([
			setSysBG(false),
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



	function setSysBG(view = true) {
		var p = Util.toBlobURL('画像', '背景', 'png', true)
		return view ? p.then( url => View.setBGImage({ url }) ) : p	
	}


	start().check()

	READY.Game.ready({

		reset() {
			resetup()
		},

		loadSaveData() {
			var defer = Promise.defer()
			Player.loadSaveData().then( script => {
				if (!script) return defer.resolve()
				Player.init()
				Player.setScenario(script.scenario)
				load(script)
			} ).check()
			return defer.promise
		},

	})

}).check()




/* TODO
	・Worker分離
	・エフェクト
	・画像面のCanvas化
	・選択肢ウィンドウ調整
	・音声

*/