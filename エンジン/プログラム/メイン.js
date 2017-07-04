/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import { Player } from './システム.js'

window.addEventListener( 'DOMContentLoaded', main )

async function main( ) {


	//Canvas要素の配置と準備

	const wrapper = document.querySelector( '#ONPWrapper' )

	const player = document.createElement( 'div' )

	Object.assign( player.style, {
		width: '960px',
		height: '540px',
		margin: '10px auto',
		boxShadow: '0px 0px 10px 1px blue',
	} )
	wrapper.appendChild( player )

	const canvas = document.createElement( 'canvas' )
	Object.assign( canvas, {
		width: 960,
		height: 540,
	} )

	Array.from( wrapper.childNodes, node => node.remove( ) )
	player.appendChild( canvas )

	

	const onp = await Player.start( canvas )
	



}
