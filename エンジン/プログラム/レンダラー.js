/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'

let ctx = null

let [ W, H ] = [ 1, 1 ]

let layerRoot = null

let HRCanvas = new OffscreenCanvas( W, H, { alpha: false } )
let HRCtx = HRCanvas.getContext( '2d' )

async function init ( context ) { 

	ctx = context || ctx
	return await initLayer( )
}


export let { target: initRanderer, register: nextInit } = new $.AwaitRegister( init )


const registrants = new Map

class Node {

	constructor ( opt ) {

		const def = { name: 'undefined', x: 0, y: 0, w: 1, h: 1, o: 1,
			fill: '', stroke: '', shadow: true, region: '', children: [ ] }

		Object.assign( this, def, opt )

		for ( let [ key, look ] of [ [ 'x', 'w' ], [ 'y', 'h' ] ] ) {
			let val = this[ key ]
			if ( ! Number.isFinite( val ) ) continue
			if ( 1 / val == -Infinity ) {
				this[ key ] = val = 1 - this[ look ] + val
				if ( val < 0 || Object.is( val, -0 ) || 1 < val )
					$.warn( `"${ val }" 不正な範囲の数値です` )
			}
		}

	}

	draw ( ) { }

	
	drawHR ( { x, y, w, h }, style ) {

		HRCtx.fillStyle = style
		HRCtx.fillRect( x, y, w, h )
	
	}

	append ( node ) {

		node.parent = this
		this.children.push( node )

		let that = this
		do {
			that[ node.name ] = that[ node.name ] === undefined ? 
				node : $.warn( `"${ node.name }"　同名のノードが同時に定義されています` ) || null
			that = that.parent
		} while ( that ) 

	}

	removeChildren ( ) {
		
		for ( let node of this.children ) {
			let that = this
			do {
				that[ node.name ] = undefined
				that = that.parent
			} while ( that ) 
		}

		this.children.length = [ ]

	}

	fire ( type ) {
		if ( type == 'up' ) {
			let obj = registrants.get( this )
			if ( ( ! obj ) || ( ! obj.click.resolve ) ) return
			obj.click.resolve( Infinity )
		}

	}

	nextClick ( ) {
		let obj = registrants.get( this )
		if ( ! obj ) {
			obj = {
				click: { resolve: null }
			}
			registrants.set( this, obj )
		}
		let { promise, resolve } = new $.Deferred
		obj.click.resolve = resolve
		return promise
	}

	show ( ) { this.o = 1 }

	hide ( ) { this.o = 0 }

}


export class GroupNode extends Node {

}


export class RectangleNode extends Node {

	draw ( { x, y, w, h } ) {

		let { fill, shadow } = this

		if ( fill ) {
			if ( shadow ) {
				ctx.shadowColor = 'rgba( 0, 0, 0, .5)' 
				ctx.shadowOffsetX = ctx.shadowOffsetY = H * .01
				ctx.shadowBlur = 5
			}
			ctx.fillStyle = this.fill
			ctx.fillRect( x, y, w, h )
			ctx.shadowColor = 'rgba( 0, 0, 0, 0 )' 
		}


	}

}

export class TextNode extends Node {

	constructor ( opt ) {
		const def = { size: 0, text: '', pos: 'start' }
		opt = Object.assign( def, opt )
		super ( opt )
	}

	set( text ) { this.text = text }

	draw ( { x, y, w, h } ) { 
		let { fill, shadow, text, size, pos } = this

		ctx.font = `${ h * size }px "Hiragino Kaku Gothic ProN", Meiryo`
		ctx.textBaseline = 'top'
		ctx.textAlign = pos
		if ( pos == 'center' ) x += w / 2 

		let b = h * size * .075

		if ( fill ) {
			if( shadow ) {
				ctx.shadowColor = 'rgba( 0, 0, 0, .9)' 
				ctx.shadowOffsetX = ctx.shadowOffsetY = b
				ctx.shadowBlur = 5
			}
			ctx.fillStyle = fill
			ctx.fillText( text, x, y, w - b )
			ctx.shadowColor = 'rgba( 0, 0, 0, 0 )' 
		}


	}

}

export class ImageNode extends Node {

	constructor ( opt ) {
		const def = { img: null }
		opt = Object.assign( def, opt )
		super ( opt )
		//$.log( { x:this.x, y:this.y, w:this.w, h:this.h } )
	}

	draw ( { x, y, w, h } ) { 
		let { img } = this
		if ( img ) ctx.drawImage( img, x, y, w, h )

	}

}



function initLayer ( ) {

	layerRoot = new GroupNode( { name: 'root', region: 'opaque' } )

	let bgImage = new ImageNode( { name: 'backgroundImage' } )
	layerRoot.append( bgImage )

	let portGroup = new GroupNode( { name: 'portraitGroup' } ) 
	layerRoot.append( portGroup )

	let convBox = new RectangleNode( { name: 'conversationBox', y: .75, h: .25, shadow: false, fill: 'rgba( 0, 0, 100, .5 )' } ) 
	layerRoot.append( convBox )

	let nameArea = new TextNode( { name: 'nameArea', x: .1, w: .2, y: .2, size: .2, fill: 'rgba( 255, 255, 200, .9 )' } )
	convBox.append( nameArea )

	let mesArea = new TextNode( { name: 'messageArea', x: .3, w: .6, y: .2, size: .2, fill: 'rgba( 255, 255, 200, .9 )' } )
	convBox.append( mesArea )

	let inputBox = new RectangleNode( { name: 'inputBox', o: 0, x: .05, y: .05, w: .9, h: .65, fill: 'rgba( 200, 200, 255, .25 )' } ) 
	layerRoot.append( inputBox )

	$.log( layerRoot )

	return layerRoot
}


export function drawCanvas ( ) {

	if ( !ctx ) return

	let rect = ctx.canvas.getBoundingClientRect( )
	ctx.canvas.width = W = rect.width
	ctx.canvas.height = H = rect.height

	ctx.clearRect( 0, 0, W, H )

	draw( layerRoot, { x: 0, y: 0, w: W, h: H } )

	function draw ( node, base ) {
		
		let prop = {
			x: base.x + node.x * base.w,
			y: base.y + node.y * base.h,
			w: base.w * node.w,
			h: base.h * node.h,
		}

		// $.log( node.name, prop )

		ctx.globalAlpha = node.o

		node.draw( prop )
		for ( let childnode of node.children ) { draw( childnode, prop ) }
	}

}



export function onPointed ( { type, x, y } ) {
	
	let list = drawHRCanvas( )

	let d = HRCtx.getImageData( 0, 0, W, H ).data
	let i = ( x + y * W ) * 4
	let id = d[ i ] * 256**2 + d[ i + 1 ] * 256 + d[ i + 2 ]

	let node = list[ id ]

	//$.log( type, id, node )

	while ( node ) {
		if ( node.region ) node.fire( type )
		if ( node.region == 'opaque' ) break
		node = node.parent
	}

}


function drawHRCanvas( ) {
	
	HRCanvas.width = W, HRCanvas.height = H

	ctx.clearRect( 0, 0, W, H )

	let regionList = [ ]

	drawHR( layerRoot, { x: 0, y: 0, w: W, h: H }, 0 )

	function drawHR ( node, base, id ) {

		++id

		let prop = {
			x: base.x + node.x * base.w,
			y: base.y + node.y * base.h,
			w: base.w * node.w,
			h: base.h * node.h,
		}

		if ( node.region && node.o ) {

			regionList[ id ] = node
			node.drawHR( prop, `rgb(${ id/256**2|0 }, ${ (id/256|0)%256 }, ${ id%256 })` )
			//$.log( 'draw', id, node, regionList )
		}

		for ( let childnode of node.children ) { id = drawHR( childnode, prop, id ) }

		return id
	}

	return regionList

}

