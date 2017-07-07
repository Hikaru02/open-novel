/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import * as Renderer from './レンダラー.js'


let layer, backgroundImage, conversationBox, nameArea, textArea



export function init ( ctx ) {
	
	Renderer.initRanderer( ctx )

}


export let { target: initAction, register: nextInit } = new $.AwaitRegister( init )


;( async function updatingLayerCache ( ) {
	while ( true ) layer = await Renderer.nextInit( )
} )( )


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

	layer.nameArea.set( name )

	let time = 0 

	while ( time = await anime.nextFrame( ) ) {
		let to = speed * time / 1000 | 0
		layer.textArea.set( text.slice( 0,  to ) )
		anime.ready( )
		if ( to >= text.length ) anime.cancal( )
	}

}


async function getImage( blob ) {
	let img = new Image
	let { promise, resolve } = new $.Deferred
	img.onload = resolve
	img.src = URL.createObjectURL( blob )
	await promise
	return img
}


export async function showBGImage ( setting, subURL ) {

	let blob = await $.fetchFile( 'blob', setting, subURL )
	let img = await getImage( blob )
	layer.backgroundImage.img = img

}


export async function showPortraits( setting, subURL, pos ) {
	
	let blob = await $.fetchFile( 'blob', setting, subURL )
	let img = await getImage( blob )
	let portrait = new Renderer.ImageNode( { name: 'portrait' })
	portrait.img = img
	layer.portraitGroup.removeChildren( )
	layer.portraitGroup.append( portrait )

}


