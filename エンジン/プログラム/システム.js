/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import * as Scenario from './シナリオ.js'
import * as Action from './アクション.js'
import * as Renderer from './レンダラー.js'


let ctx = null

async function init ( canvas ) {


	ctx = canvas.getContext( '2d' )

	await Action.initAction( ctx )



	await playSystemOpening( )


}


async function playSystemOpening ( ) {

	let systemSetting = {
		baseURL: './'
	}

	await Action.showBGImage( systemSetting, 'エンジン/画像/背景.png' )
	
	await Action.showText( '', 'openノベルプレイヤー 0.9α', 50 )

	Action.showText( '', '開始する作品を選んで下さい', 50 )

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


