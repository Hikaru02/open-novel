/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'

export const Scenario = { 

	async start ( scenario, action ) {

		let { show } = action


		for ( let act of scenario ) {
			let { type, prop } = act

			switch ( type ) {

				case '会話': {

					let [ name, text ] = prop
					await show.text( name, text, 20 )
					await $.timeout( 500 )

				} ;break

				default :
					$.log( `The action "${ type }" was skiped.` )


			}

		}






	},


	async parse ( text ) {

		// 文の取り出しと、第一級アクションとその配下のグルーピング
		let actList = function firstParse ( ) {

			let statements = text.replace( /\r/g, '' ).split( '\n' )

			let actList = [ ], propTarget = null

			function addAct ( type ) {
				let act = { type: type.replace( '・', '' ).trim( ), children: [ ] }
				propTarget = act.children
				actList.push( act )
			}

			for ( let sta of statements ) {
				if ( sta.trim( ).length == 0 ) continue
				if ( sta[ 0 ] == '・' ) {
					addAct( sta )
				} else {
					if ( sta[ 0 ] != '\t' ) {
						addAct( '会話' )
					}
					propTarget.push( sta )
				}

			}

			$.log( actList )
			return actList
		} ( )

		// アクション種に応じた配下の処理と、一次元配列への展開
		let progList = function secondParse( ) { 

			let progList = [ ]

			let actRoot = { type: 'ルート', prop: '' }
			let prev = actRoot

			function addAct ( type, prop ) {
				let act = { type, prop } 
				let index = progList.push( act )

				prev.next = act
				prev = act
			}


			function subParse ( type, children ) {

				let tabs = '\t'.repeat( ( children[ 0 ].match( /^\t+/ ) || [ '' ] ) [ 0 ].length )
				children = children.map( child => child.replace( tabs, '' ) )

				let key = '', value = ''
				while ( children.length ) {
					let child = children.shift( )
					if ( child[ 0 ] != '\t' ) {
						if ( key ) addAct( type, [ key, value.trim( ) ] )
						key = child.replace( '・', '' )
					} else {
						if ( value ) value += '\\w'  // 『会話』用
						value += child
					}
				}
				if ( key ) addAct( type, [ key, value.trim( ) ] )

			}


			for ( let act of actList ) {
				let { type, children } = act
				switch ( type ) {

					case 'コメント': /* 何もしない */
					break

					case '会話':
					case '立ち絵': case '立絵':
					case '選択肢':
						subParse( type, children )
					break

					default :
						addAct( type, children[ 0 ].trim( ) )

				}

			}

			$.log( progList )
			return progList 
		} ( )

		return progList

	}





}
