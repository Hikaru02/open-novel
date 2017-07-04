/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'

export const Layer = { create: async function create ( ctx ) {

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
			
			ctx.font = `${ h * this.size }px serif`

			if ( this.fill ) {
				ctx.fillStyle = this.fill
				ctx.fillText( this.text, x, y )
			}

			if ( this.stroke ) {
				ctx.strokeStyle = this.stroke
				ctx.strokeText( this.text, x, y )
			}


		}

	}


	const root = new Node( { name: 'root' } ) 

	initTree( )


	function initTree ( ) {

		let mesBox = new RectangleNode( { name: 'messageBox', y: .75, h: .25, fill: 'rgba(0,0,0,0.1)' } ) 
		root.append( mesBox )
		let textArea = new TextNode( { name: 'textArea', x: .1, y: .4, size: .2, fill: 'white' } )
		mesBox.append( textArea )

	}


	function drawCanvas ( ) {

		let W = ctx.canvas.width
		let H = ctx.canvas.height

		ctx.clearRect( 0, 0, W, H )

		draw( root, { x: 0, y: 0, w: W, h: H } )

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





return { root, drawCanvas }

} }
