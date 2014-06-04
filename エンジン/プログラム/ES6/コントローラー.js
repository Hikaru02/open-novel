
READY('Player').next('設定読み込み', _ => {
	'use strict'

	Player.getSettingData().then( setting => Player.getScriptData(setting['初期スクリプト'][0])

		).next('待機', script => READY('View').then( _ => {
			
			View.changeMode('TEST')
			View.print('準備が完了しました。\nクリック（orエンターキー　orスペースキー）で次のページに進みます。')
			return script
		})
	
	).on('go').next('実行', START)


	function START(script) {
		
		//LOG(script)

		View.changeMode('NOVEL')

		Player.runScript(script).next('待機', _ => {

			View.changeMode('TEST')
			View.print('再生が終了しました。\nクリックするともう一度最初から再生します。')

		}).on('go').next('実行', _ => START(script) )

	}


})

