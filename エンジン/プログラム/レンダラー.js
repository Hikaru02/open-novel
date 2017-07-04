/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'

export const Renderer = { async start ( ctx ) {

	let [ W, H ] = [ 0, 0 ]

	class Node {
	
		constructor ( opt ) {

			const def = { name: 'undefined', x: 0, y: 0, w: 1, h: 1, o: 1,
				fill: '', stroke: '' }

			Object.assign( this, def, opt )

			this.children = [ ]

		}

		draw ( ) { }

		append ( node ) {
			this.children.push( node )
			this[ node.name ] = node
		}

	}

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

		draw ( { x, y, w, h } ) { 
			let { fill, stroke, text, size } = this

			ctx.font = `${ h * size }px serif`

			if ( fill ) {
				ctx.fillStyle = 'black'
				ctx.fillText( text, x + h * size * .075, y + h * size * .075 )
				ctx.fillStyle = fill
				ctx.fillText( text, x, y )
			}

			if ( stroke ) {
				ctx.strokeStyle = 'black'
				ctx.strokeText( text, x + h * size * .1, y + h * size * .1 )
				ctx.strokeStyle = stroke
				ctx.strokeText( text, x, y )
			}


		}

	}

	class ImageNode extends Node {

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


	const layerRoot = new Node( { name: 'root' } ) 

	initTree( )


	function initTree ( ) {

		let bgImage = new ImageNode( { name: 'backgroundImage' } )
		layerRoot.append( bgImage )

		let convBox = new RectangleNode( { name: 'conversationBox', y: .75, h: .25, fill: 'rgba(0,0,0,0.1)' } ) 
		layerRoot.append( convBox )

		let nameArea = new TextNode( { name: 'nameArea', x: .1, w: .2, y: .4, size: .2, fill: 'white' } )
		convBox.append( nameArea )

		let textArea = new TextNode( { name: 'textArea', x: .3, y: .4, size: .2, fill: 'white' } )
		convBox.append( textArea )

	}


	function drawCanvas ( ) {

		W = ctx.canvas.width
		H = ctx.canvas.height

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





return { layerRoot, drawCanvas }

} }
