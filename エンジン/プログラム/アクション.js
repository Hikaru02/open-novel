/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import { Renderer } from './レンダラー.js'

export const Action = { async start ( ctx ) {
	

const canvas = ctx.canvas
const renderer = await Renderer.start( ctx )

let { layerRoot } = renderer
let { backgroundImage, conversationBox } = layerRoot
let { nameArea, textArea } = conversationBox



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

} ) ( renderer.drawCanvas )






const show = {

	text: ( ( ) => {
		
		let anime = new Anime

		return async function showText ( name, text, speed ) {

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
	} ) ( ),

	async BGImage ( blob ) {

		let img = new Image
		let { promise, resolve } = new $.Deferred
		img.onload = resolve
		img.src = URL.createObjectURL( blob )
		await promise
		backgroundImage.img = img

	},
}






return { show }

} }
