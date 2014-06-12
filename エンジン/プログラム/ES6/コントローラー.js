
READY('Player', 'View').then( _ => {
	'use strict'

	var message = (_ => {
		var abort = Util.NOP
		return text => {
			abort()
			View.changeModeIfNeeded('NOVEL')
			View.nextPage('システム')
			var p = View.addSentence(text, { weight: 10 })
			abort = p.abort
			return p
		}
	})()



	var setup = Util.co(function* () {

		Player.setRunPhase('準備')

		var setting = yield message('作品一覧を読み込んでいます...').then( _ => Player.fetchSettingData(Data.URL.ContentsSetting) )

		var scenario = yield message('再生する作品を選んでください').then( _ => {

			var opts = setting['作品'].reduce( (opts, name) => {
				opts.push({ name })
				return opts
			}, [])

			return View.setChoiceWindow(opts)
		})

		Player.scenarioName = scenario

		var setting = yield message('作品情報を読み込んでいます...').then( _ => Player.fetchSettingData(`データ/${scenario}/設定.txt`) )

		var script = yield message('開始シナリオを読み込んでいます...').then( _ => Player.fetchScriptData(setting['開始シナリオ'][0]) )

		Player.paramClear()

		yield message('再生準備が完了しました。\nクリック、タップ、エンターキー、スペースキーで進みます。').on('go').then( _ => {

			Player.setRunPhase('再生')

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

		return setup().catch(restart)
	})



	start()

}).catch(LOG)




/* TODO
	・画像面のCanvas化
	・事前キャッシュ
	・選択肢ウィンドウ調整
	・音声

*/