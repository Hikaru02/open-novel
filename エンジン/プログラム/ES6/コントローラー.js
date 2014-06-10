
READY('Player', 'View').then( _ => {
	'use strict'



	//var {Promise} = Util.overrides

	var message = (_ => {
		var abort = Util.NOP
		return text => {
			abort()
			View.changeModeIfNeeded('NOVEL')
			View.nextPage('システム')
			var p = View.addSentence(text, { weight: 20 })
			abort = p.abort
			return p
		}
	})()



	var setup = Util.co(function* () {

		Player.setRunPhase('準備')

		var setting = yield message('作品一覧を読み込んでいます...').then( _ => {

			return Player.fetchSettingData(Data.URL.ContentsSetting)
		})

		var scenario = yield message('再生する作品を選んでください').then( _ => {

			var opts = setting['作品'].reduce( (opts, name) => {
				opts.push({ name })
				return opts
			}, [])

			return View.setChoiceWindow(opts)
		})

		var setting = yield message('作品情報を読み込んでいます...').then( _ => {

			Player.baseURL = ''

			var url = Util.forceURL('設定', 'txt', scenario)
		
			Player.baseURL = scenario

			return Player.fetchSettingData(url)
		})

		var script = yield message('開始シナリオを読み込んでいます...').then( _ => {

			var url = setting['開始シナリオ'][0]

			return Player.fetchScriptData(url)
		})

		yield message('再生準備が完了しました。\nクリック、タップ、エンターキー、スペースキーで進みます。').delay(1000).on('go').then( _ => {

			Player.setRunPhase('再生')

			return Player.runScript(script)
		})

		View.clean()

		Player.setRunPhase('準備')

		yield message('再生が終了しました。\n作品選択メニューに戻ります。').delay(1000).on('go')

		return setup()
	})



	var start = Util.co(function* () {

		Player.setRunPhase('起動')

		var setting = yield Player.fetchSettingData(Data.URL.EngineSetting)

		Data.SystemVersion = setting['システムバージョン'][0]

		yield message( 'openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion).delay(1000)

		return setup()
	})



	start()

})
