
Promise.all([HELPER_READY, MODEL_READY]).next('設定読み込み', function () {

	return getSettingData().then(function (setting) {
		LOG(setting)
		return getScriptData(setting['初期スクリプト'][0])
	})

}).next('ビューテスト', function (script) {

	//LOG(script)

	return VIEW_READY.then(function () {


		View.changeMode('TEST')

		View.print('準備が完了しました。\nクリック（orエンターキー　orスペースキー）で次のページに進みます。')

		return script

	})

}).on('go', START)




function START(script) {
	
	//LOG(script)

	View.changeMode('NOVEL')

	runScript(script).next('実行', function () {

		View.changeMode('TEST')

		View.print('再生が終了しました。\nクリックするともう一度最初から再生します。')

	}).on('go', function　() {

		START(script)
	})

}


var CONTROLLER_READY = Promise.resolve()