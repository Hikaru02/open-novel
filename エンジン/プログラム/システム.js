/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import * as Scenario from './シナリオ.js'
import * as Action from './アクション.js'


async function init ( canvas ) {


	const ctx = canvas.getContext( '2d' )

	await Action.initAction( ctx )



	await playSystemOpening( )


	async function playSystemOpening ( ) {

		let systemSetting = {
			baseURL: './エンジン'
		}

		await Action.showBGImage( systemSetting, '画像/背景.png' )
		
		await Action.showText( '', 'openノベルプレイヤー 0.9α', 50 )
		
		await $.timeout( 200 )

		let scenarioSetting = {
			baseURL: './作品/デモ・基本'
		}

		let text = await $.fetchFile( 'text', scenarioSetting, 'シナリオ/基本.txt' )

		let scenario = await Scenario.parse( text )

		await Scenario.play( scenario, scenarioSetting )


	}

} 


export let { target: initPlayer, register: nextInit } = new $.AwaitRegister( init )


export function onInputEvent( { type, x, y } ) {
	
	//$.log( { type, x, y } )
}


