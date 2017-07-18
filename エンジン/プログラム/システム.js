/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import * as Scenario from './シナリオ.js'
import * as Action from './アクション.js'
import * as Renderer from './レンダラー.js'


let ctx = null

let systemSetting = {
	baseURL: './'
}

async function init ( ctx ) {

	await Action.initAction( ctx )

	//await Action.showBGImage( systemSetting, 'エンジン/画像/背景.png' )
	
	await Action.showMessage( '', 'openノベルプレイヤー v1.0α', 50 )

	while ( true ) {

		let res = await playSystemOpening( ).catch( e => $.error( e ) || 'error' )

		await Action.initAction( ctx )

		if ( res == 'error' ) await Action.showMessage( '', '問題が発生しました', 50 )
		else await  Action.showMessage( '', '再生が終了しました', 50 )


	}

}


async function playSystemOpening ( ) {

	await Action.showBGImage( systemSetting, 'エンジン/画像/背景.png' )

	Action.showMessage( '', '開始する作品を選んで下さい', 50 )

	let titleList = $.parseSetting(
		await $.fetchFile( 'text', systemSetting, '作品/設定.txt' )
	) [ '作品' ]

	let title = await Action.showChoices( { }, titleList.map( title => [ title, title ] ) )



	let scenarioSetting =  $.parseSetting(
		await $.fetchFile( 'text', systemSetting, `作品/${ title }/設定.txt` )
	)
	scenarioSetting.baseURL = `./作品/${ title }`
	
	let text = await $.fetchFile( 'text', scenarioSetting, `シナリオ/${ scenarioSetting[ '開始シナリオ' ] }.txt` )

	let scenario = await Scenario.parse( text )

	await Scenario.play( scenario, scenarioSetting )

} 


export let { target: initPlayer, register: nextInit } = new $.AwaitRegister( init )


export function onInputEvent ( { type, x, y } ) {

	Renderer.onPointed( { type, x, y } )
}


