/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'

let ctx = null

let [ W, H ] = [ 0, 0 ]

let layerRoot = null


async function init ( context ) { 

	ctx = context || ctx
	return await initLayer( )
}


export let { target: initRanderer, register: nextInit } = new $.AwaitRegister( init )



class Node {

	constructor ( opt ) {

		const def = { name: 'undefined', x: 0, y: 0, w: 1, h: 1, o: 1,
			fill: '', stroke: '' }

		Object.assign( this, def, opt )

		this.children = [ ]

	}

	draw ( ) { }

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

	removeChildren( ) {
		
		for ( let node of this.children ) {
			let that = this
			do {
				that[ node.name ] = undefined
				that = that.parent
			} while ( that ) 
		}

		this.children.length = [ ]

	}

}


class GroupNode extends Node { }


class RectangleNode extends Node {

	draw ( { x, y, w, h } ) {

		if ( this.fill ) {
			ctx.fillStyle = this.fill
			ctx.fillRect( x, y, w, h )
		}

		if ( this.stroke ) {
			ctx.strokeStyle = this.stroke
			ctx.strokeRect( x, y, w, h )
		}

	}

}

class TextNode extends Node {

	constructor ( opt ) {
		const def = { size: 0, text: '' }
		opt = Object.assign( def, opt )
		super ( opt )
	}

	set( text ) { this.text = text }

	draw ( { x, y, w, h } ) { 
		let { fill, stroke, text, size } = this

		let n = .075
		ctx.font = `${ h * size }px serif`


		if ( fill ) {
			ctx.fillStyle = fill
			ctx.fillText( text, x, y, w )
			ctx.strokeStyle = 'black'
			ctx.strokeText( text, x, y, w )
		}


	}

}

export class ImageNode extends Node {

	constructor ( opt ) {
		const def = { img: null }
		opt = Object.assign( def, opt )
		super ( opt )
	}

	draw ( ) { 
		let { img } = this
		if ( img ) ctx.drawImage( img, 0, 0, W, H )

	}

}



function initLayer ( ) {

	layerRoot = new GroupNode( { name: 'root' } )

	let bgImage = new ImageNode( { name: 'backgroundImage' } )
	layerRoot.append( bgImage )

	let portGroup = new GroupNode( { name: 'portraitGroup' } ) 
	layerRoot.append( portGroup )

	let convBox = new RectangleNode( { name: 'conversationBox', y: .75, h: .25, fill: 'rgba(0,0,0,0.1)' } ) 
	layerRoot.append( convBox )

	let nameArea = new TextNode( { name: 'nameArea', x: .1, w: .2, y: .4, size: .2, fill: 'white' } )
	convBox.append( nameArea )

	let textArea = new TextNode( { name: 'textArea', x: .3, w: .6, y: .4, size: .2, fill: 'white' } )
	convBox.append( textArea )

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

