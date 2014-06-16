
READY('Player', 'View').then( _ => {
	'use strict'

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

		Player.setRunPhase('準備')
		Player.data.phase = 'pause'

		//message('作品一覧を読み込んでいます...')
		var setting = yield Player.fetchSettingData(Data.URL.ContentsSetting)

		message('再生する作品を選んでください')
		var scenario = yield new Promise( (ok, ng) => {

			var novels = setting['作品']

			if (!novels || !novels.length) return message('再生できる作品がありません。\n『データ/作品.txt』を見なおしてください')
			if (novels.length === 1) return ok(novels[0])

			var opts = novels.reduce( (opts, name) => {
				opts.push({ name })
				return opts
			}, [])

			View.setChoiceWindow(opts, {sys: true}).then(ok, ng)
		})

		Player.init(scenario)
		Storage.init()


		//message('作品情報を読み込んでいます...')
		var setting = yield Player.fetchSettingData(`データ/${scenario}/設定.txt`)

		message('『'+scenario+'』の\nどこから開始するか選んでください')
		var script = yield new Promise( (ok, ng) => {

			var opts = ['初めから', '続きから', '任意の場所から'].reduce( (opts, name) => {
				opts.push({ name})
				return opts
			}, [])

			return View.setChoiceWindow(opts, {sys: true}).then( kind => {

				//message('シナリオを読み込んでいます...')
				switch (kind) {
					case '初めから': 
						Player.fetchScriptData(setting['開始シナリオ'][0], true).then(ok, ng)

					break
					case '続きから':
						Player.loadSaveData().then(ok, ng)

					break
					case '任意の場所から':
						var name = prompt('『<スクリプト名>』または『<スクリプト名>#<マーク名>』の形式で指定します')
						if (!name) return message('作品選択メニューに戻ります。').delay(1000).then(setup)
						Player.fetchScriptData(name, true).then(ok, ng)
					
					break
					default: throw 'illegal start type'


				}

			})

		})

	/*
		yield message('再生準備が完了しました。\nクリック、タップ、エンターキー、スペースキーで進みます。').on('go').then( _ => {
			//Player.setRunPhase('再生')
			return Player.runScript(script, scenario)
		})
	*/

		yield message('').then( _ => {
			View.nextPage('')
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
		View.clean()
		Player.setRunPhase('エラー解決')

		yield message('致命的なエラーが発生したため再生を継続できません。\n作品選択メニューに戻ります。').delay(3000)
		return setup().catch(restart)

	})




	var start = Util.co(function* () {

		Player.setRunPhase('起動')

		var setting = yield Player.fetchSettingData(Data.URL.EngineSetting)

		Data.SystemVersion = setting['システムバージョン'][0]

		yield message( 'openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion).delay(1000)

		Player.init()
		return setup().catch(restart)
	})



	start()

	READY.Game.ready({
		reset() {
			Player.init()
			setup()
		},
	})

}).catch(LOG)




/* TODO
	・セーブ
	・prompt　ー　一致率
	・事前キャッシュ、効率化
	・Worker分離
	・エフェクト
	・画像面のCanvas化
	・選択肢ウィンドウ調整
	・音声

*/