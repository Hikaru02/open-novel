/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import * as Renderer from './レンダラー.js'


let layerRoot, backgroundImage, conversationBox, nameArea, textArea

updatingLayerCache( )


export function init ( ctx ) {
	
	Renderer.initRanderer( ctx )

}

export let { target: initAction, register: nextInit } = new $.AwaitRegister( init )


async function updatingLayerCache ( ) {
	
	while ( true ) {
		await Renderer.nextInit( )
		;( { backgroundImage, conversationBox } = layerRoot = Renderer.getLayerRoot( ) )
		;( { nameArea, textArea } = conversationBox ) 
	}

}


let Anime = null

{
	const registrants = new Set

	loop()
	function loop ( now ) {
		window.requestAnimationFrame( loop )

		let acts = [ ]

		for ( let reg of registrants ) {
			let { promise, resolve } = new $.Deferred
			acts.push( promise )
			reg.ready = resolve
			reg.resolve( now - reg.baseTime )
		}

		Promise.all( acts ).then( Renderer.drawCanvas )
	}



	class AnimationRegister {	

		constructor ( ) {
			this.baseTime = performance.now( )
			registrants.add( this )
			this.nextFrame( )
		}

		nextFrame ( ) {
			if ( ! registrants.has( this ) ) return Promise.resolve( 0 )
			let { promise, resolve } = new $.Deferred
			this.resolve = resolve
			return promise	
		}

		cancal ( ) {
			registrants.delete( this )
			this.resolve( 0 )
		}

	}

	Anime = AnimationRegister
}







let anime = new Anime
export async function showText( name, text, speed ) {
		
	anime.cancal( )
	anime = new Anime

	nameArea.text = name

	let time = 0 

	while ( time = await anime.nextFrame( ) ) {
		let to = speed * time / 1000 | 0
		textArea.text = text.slice( 0,  to )
		anime.ready( )
		if ( to >= text.length ) anime.cancal( )
	}

}


export async function showBGImage ( blob ) {

	let img = new Image
	let { promise, resolve } = new $.Deferred
	img.onload = resolve
	img.src = URL.createObjectURL( blob )
	await promise
	backgroundImage.img = img

}


