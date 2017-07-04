
import * as $ from './ヘルパー.js'
import { Layer } from './レイヤー.js'

export const Player = { create: async function create ( canvas ) {
	



const ctx = canvas.getContext( '2d' )
$.log ( ctx )

const layer = await Layer.create( ctx )

let mesText = layer.root.messageBox.textArea



const Anime = ( drawCanvas => {


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

		Promise.all( acts ).then( drawCanvas )
	}



	return class AnimationRegister {	

		constructor ( ) {
			this.baseTime = performance.now( )
			registrants.add( this )
			this.nextFrame( )
		}

		nextFrame ( ) {
			let { promise, resolve } = new $.Deferred
			this.resolve = resolve
			return promise	
		}

		cancal ( ) {
			registrants.delete( this )
			this.resolve( 0 )
		}

	}

} ) ( layer.drawCanvas )






const showText = ( ( ) => {

	
	let anime = new Anime

	return async function showText ( text, speed ) {

		anime.cancal( )
		anime = new Anime

		let time = 0 

		while ( time = await anime.nextFrame( ) ) {
			let to = speed * time / 1000 | 0
			mesText.text = text.slice( 0,  to )
			anime.ready( )
			if ( to >= text.length ) anime.cancal( )
		}

	}
} ) ( ) 



await playSystemOpening( )



async function playSystemOpening ( ) {

	await showText( 'openノベルプレイヤー 0.9.0', 10 )
	$.log( 'DONE!' )

}











} }
