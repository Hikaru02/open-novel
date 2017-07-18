/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import * as Action from './アクション.js'


export async function play ( scenario, baseURL ) {

	for ( let act of scenario ) {
		let { type, prop } = act

		switch ( type ) {

			case '会話': {

				let [ name, text ] = prop

				await Action.showMessage( name, text, 20 )

				//await $.timeout( 500 )

			} break
			case '立絵': case '立ち絵': {

				let [ pos, name ] = prop

				if ( pos.match( /無し|なし/ ) ) {
					Action.removePortraits( )
					continue
				}

				if ( pos == '左' ) pos = [ 0, 0, 1 ]
				else if ( pos == '右' ) pos = [ -0, 0, 1 ]
				else { 
					pos = pos.match( /\-?\d+(?=\%)/g )
					$.log( pos )
					pos = pos.map( d => d / 100 )
				}

				let url = `${ baseURL }/立ち絵/${ name }.png`
				await Action.showPortraits( url, pos )


			} break
			case '背景': {

				let [ pos, name ] = prop
				if ( ! name ) [ name, pos ] = [ pos, name ]

				if ( name.match( /無し|なし/ ) ) {
					Action.removeBGImage( )
					continue
				}

				let url = `${ baseURL }/背景/${ name }.jpg`
				await Action.showBGImage( url )


			} break
			case '選択肢': {

				let name = await Action.showChoices( prop )
				$.log( name )

				let text = await $.fetchFile( 'text', `${ baseURL }/シナリオ/${ name }.txt` )
				let scenario = await parse( text )
				await play( scenario, baseURL )

			} break
			default : {
				$.warn( `"${ type }" このアクションは未実装です` )
			}

		}

	}

}



export async function parse ( text ) {

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
				if ( sta.slice( 0, 2 ) == '/\/' ) continue
				else if ( sta[ 0 ].match( /#|＃/ ) ) {
					addAct( 'マーク' )			
					sta = sta.slice( 1 )
				} else if ( sta[ 0 ] != '\t' ) {
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


		function subParse ( type, children, separatable ) {

			let tabs = '\t'.repeat( ( children[ 0 ].match( /^\t+/ ) || [ '' ] ) [ 0 ].length )
			children = children.map( child => child.replace( tabs, '' ) )

			let key = '', value = '', prop = [ ]
			children.push( '' )
			while ( children.length ) {
				let child = children.shift( )
				if ( child[ 0 ] != '\t' ) {
					if ( key ) {
						// \t以外から始まったときで初回以外（バッファを見て判断）
						if ( separatable ) addAct( type, [ key, value ] )
						  // 細かく分離する
						else prop.push( [ key, value ] )
						  // 配列に貯める
					}
					value = ''
					key = child.replace( '・', '' ).replace( '\s+$', '' )
				} else {
					if ( value ) value += '\\w\\n'  // 『会話』用
					value += child.replace( '\t', '' ).replace( '\s+$', '' )
				}
			}
			if ( ! separatable ) addAct( type, prop )


		}


		for ( let act of actList ) {
			let { type, children } = act

			if ( children.length == 0 ) {
				$.warn( `"${ type }" 子要素が空なので無視されました` )
				continue
			}

			switch ( type ) {

				case 'コメント': /* 何もしない */
				break

				case '立ち絵': case '立絵':
					type = '立ち絵'
					if ( progList[ progList.length -1 ].type != '立ち絵' ) addAct( '立ち絵', [ '無し', '' ] )
				case '会話':
				case '背景':
					subParse( type, children, true )
				break
				case '選択肢':
					subParse( type, children, false )
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



