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
			if ( reg.pauseTime ) continue
			let { promise, resolve } = new $.Deferred
			acts.push( promise )
			reg.ready = resolve
			reg.resolve( now - reg.baseTime )
		}

		Promise.all( acts ).then( Renderer.drawCanvas )
	}



	class AnimationRegister {	

		constructor ( ) {
			this.pauseTime = 0
			this.baseTime = performance.now( )
			registrants.add( this )
			this.nextFrameOr( )
		}

		nextFrameOr ( ...interrupters ) {
			if ( ! registrants.has( this ) ) return Promise.resolve( 0 )
			let { promise, resolve } = new $.Deferred
			this.resolve = resolve
			Promise.race( interrupters ).then( resolve )
			return promise 
		}

		async pauseUntil ( ...interrupters ) {
			this.ready( )
			this.pauseTime = performance.now( )
			await Promise.race( interrupters )
			this.baseTime += performance.now( ) - this.pauseTime
			this.pauseTime = 0
			this.resolve( performance.now( ) - this.baseTime )
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

	let decoList = text2decoList( text )

	$.log( decoList )

	layer.messageArea.clear( )

	let index = 0

	loop: while ( time = await anime.nextFrameOr( layer.nextClick( ) ) ) {
		let to = speed * time / 1000 | 0
		if ( time == Infinity ) to = decoList.length
		for ( ; index < to; index ++ ) {
			let deco = decoList[ index ], wait = deco.wait || 0 
			if ( wait ) {
				index ++
				await anime.pauseUntil( $.timeout( wait / speed * 1000 ), layer.nextClick( ) )
				continue loop
			}
			layer.messageArea.add( deco )
		}
		anime.ready( )
		if ( to >= decoList.length ) anime.cancal( )
	}

	await layer.nextClick( )

}


function text2decoList ( text ) {

	let decoList = [ ]

	let mag = 1, bold = false, color = undefined

	for ( let unit of text.match( /\\\w(\[\w+\])?|./g ) ) {
		let magic = unit.match( /\\(\w)\[?(\w+)?\]?/ )
		if ( magic ) {
			let [ , type, val ] = magic
			switch ( type ) {
						case 'w': decoList.push( { wait: val || Infinity } )
				break;	case 'b': bold = true
				break;	case 'B': bold = false
				break;	case 'c': color = val
				break;	case 's': mag = val				
				break;	default : $.warn( `"${ type }" このメタ文字は未実装です`　)
			}
		} else {
			decoList.push( { text: unit, mag, bold, color } )
		}

	}

	return decoList
	
}


async function getImage ( blob ) {
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


export async function removeBGImage ( ) {
	layer.backgroundImage.img = null
}


export async function showPortraits ( setting, subURL, [ x, y, h ] ) {
	
	let blob = await $.fetchFile( 'blob', setting, subURL )
	let img = await getImage( blob )
	let w = 9 / 16 * h * img.naturalWidth / img.naturalHeight
	//$.log( { x, y, w, h, img } )
	let portrait = new Renderer.ImageNode( { name: 'portrait', x, y, w, h } )
	portrait.img = img
	layer.portraitGroup.append( portrait )

}


export async function removePortraits ( ) {
	layer.portraitGroup.removeChildren( )
}


export async function showChoices ( setting, choices ) {
	
	let m = .05

	let inputBox = layer.inputBox
	let nextClicks = [ ]

	let len = choices.length
	let colLen = 1 + ( ( len - 1 ) / 3 | 0 )
	let w = ( ( 1 - m ) - m * colLen ) / colLen
	let h = ( ( 1 - m ) - m * 3 ) / 3

	for ( let i = 0; i < len; i++ ) {
		let [ key, val ] = choices[ i ]
		let row = i % 3, col = i / 3 | 0
		let [ x, y ] = [ m + ( w + m ) * col, m + ( h + m ) * row ]

		let choiceBox = new Renderer.RectangleNode( { name: 'choiceBox', 
			x, y, w, h, pos: 'center', region: 'opaque', fill: 'rgba( 100, 100, 255, .8 )' } ) 
		inputBox.append( choiceBox )

		let textArea = new Renderer.TextNode( { name: 'textArea',
			size: .7, y: .05, pos: 'center', fill: 'rgba( 255, 255, 255, .9 )' } )
		choiceBox.append( textArea )
		nextClicks.push( choiceBox.nextClick( ).then( _ => val ) )
		textArea.set( key )
	}

	inputBox.show( )
	let val = await Promise.race( nextClicks )
	inputBox.removeChildren( )
	inputBox.hide( )
	return val

}

