/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import { Scenario } from './シナリオ.js'
import { Action } from './アクション.js'

export const Player = { async start ( canvas ) {
	



const ctx = canvas.getContext( '2d' )

let action = await Action.start( ctx )
let { show } = action




await playSystemOpening( )


async function playSystemOpening ( ) {

	let bgimage = await ( await fetch( 'エンジン/画像/背景.png' ) ).blob( )

	await show.BGImage( bgimage )
	
	await show.text( '', 'openノベルプレイヤー 0.9.0α', 100 )
	
	await $.timeout( 0 )

	let text = await ( await fetch( '作品/デモ・基本/シナリオ/基本.txt' ) ).text( )

	let scenario = await Scenario.parse( text )

	await Scenario.start( scenario, action )


}











} }
