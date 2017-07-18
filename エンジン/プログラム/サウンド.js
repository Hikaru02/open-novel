/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'


let ctx

async function init ( opt ) {

	if ( ctx ) ctx.close( )
	ctx = new AudioContext( )

}

export let { target: initSound, register: nextInit } = new $.AwaitRegister( init )













