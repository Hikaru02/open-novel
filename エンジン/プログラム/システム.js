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

		let bgimage = await ( await fetch( 'エンジン/画像/背景.png' ) ).blob( )

		await Action.showBGImage( bgimage )
		
		await Action.showText( '', 'openノベルプレイヤー 0.9α', 50 )
		
		await $.timeout( 200 )

		let text = await ( await fetch( '作品/デモ・基本/シナリオ/基本.txt' ) ).text( )

		let scenario = await Scenario.parse( text )

		await Scenario.play( scenario )


	}

} 


export let { target: initPlayer, register: nextInit } = new $.AwaitRegister( init )
