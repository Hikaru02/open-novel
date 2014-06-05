
READY('Player', 'View').next('待機', _ => {
	'use strict'

	//var {Promise} = Util.overrides

	Player.print('準備が完了しました。\nクリック（orエンターキー　orスペースキー）で次のページに進みます。')

	View.on('go').next('作品設定読込', Player.fetchSettingData).next('スクリプト読込', START)


	function START(setting) {

		var hideLodingMessade = View.setLoadingMessage('Loading...')

		function fetchFirstScriptData(setting) {
			return Player.fetchScriptData(setting['初期スクリプト'][0])
		}
		
		fetchFirstScriptData(setting).next('実行', script => {

			hideLodingMessade()

			Player.runScript(script).next('待機', _ => {

				Player.print('再生が終了しました。\nクリックするともう一度最初から再生します。')

			}).on('go').next('スクリプト読込', _ => START(setting) )

		})

	}


})


