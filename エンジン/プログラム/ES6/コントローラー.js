
READY('Player', 'View').next('起動', _ => {
	'use strict'

	//var {Promise} = Util.overrides

	Player.fetchSettingData(Data.URL.EngineSetting).then(setting => {
		Data.SystemVersion = setting['システムバージョン'][0]
		return message( 'openノベルプレイヤー by Hikaru02\n\nシステムバージョン：　' + Data.SystemVersion)
	}).delay(1000).next('準備', setup)


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



	function setup() {

		message('作品一覧を読み込んでいます...')

		Player.fetchSettingData(Data.URL.ContentsSetting).then(setting => {

			message('再生する作品を選んでください')
			return View.setChoiceWindow(setting['作品'].reduce( (opts, name) => {
				opts.push({ name })
				return opts
			}, []))

		}).then(scenarioSetup)


	}


	function scenarioSetup(name) {

		message('作品情報を読み込んでいます...')
		//var hideLodingMessade = View.setLoadingMessage('Loading...')

		Player.baseURL = ''

		var url = Util.forceURL('設定', 'txt', name)
		
		Player.baseURL = name

		function fetchFirstScriptData(setting) {
			message('開始シナリオを読み込んでいます...')
			var url = setting['開始シナリオ'][0]
			return Player.fetchScriptData(url)
		}


		Player.fetchSettingData(url).then(fetchFirstScriptData).next('待機', script => {


			message('再生準備が完了しました。\nクリック、タップ、エンターキー、スペースキーで進みます。').delay(1000).next('実行', _ => {

				return Player.runScript(script)

			}).next('待機', _ => {

				View.clean()
				return message('再生が終了しました。\n作品選択メニューに戻ります。')

			}).delay(1000).next('準備', setup)

		})

	}


})


