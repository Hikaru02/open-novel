/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

import * as $ from './ヘルパー.js'
import * as Action from './アクション.js'


export async function play ( scenario, baseURL ) {


	let varMap = new Map

	let act = scenario[ 1 ]
	return await playAct( act )



	function textEval ( text ) {

		if ( typeof text != 'string' ) return text
		$.log( 'E', text )
		function $Get( key ) {
			if ( ! varMap.has( key ) ) {
				varMap.set( key, 0 ) 
				return 0
			} else return varMap.get( key )
		}
		return eval( text )
	}



	async function playAct( act ) {

		do {
			let { type, prop } = act

			switch ( type ) {

				case '会話': {

					let [ name, text ] = prop.map( textEval )

					await Action.showMessage( name, text, 20 )

					//await $.timeout( 500 )

				} break
				case '立絵': case '立ち絵': {

					let [ pos, name ] = prop.map( textEval )

					if ( ! pos ) {
						Action.removePortraits( )
						continue
					}

					if ( pos == '左' ) pos = [ 0, 0, 1 ]
					else if ( pos == '右' ) pos = [ -0, 0, 1 ]
					else if ( pos  ) { 
						pos = pos.match( /\-?\d+(?=\%|％)/g )
						if ( pos.length == 1 ) pos[ 1 ] = 0
						if ( pos.length == 2 ) pos[ 2 ] = 100
						pos = pos.map( d => d / 100 )
						$.log( pos )
					}

					let url = `${ baseURL }/立ち絵/${ name }.png`
					await Action.showPortraits( url, pos )


				} break
				case '背景': {

					let [ pos, name ] = prop.map( textEval )

					if ( ! name ) {
						Action.removeBGImage( )
						continue
					}

					let url = `${ baseURL }/背景/${ name }.jpg`
					await Action.showBGImage( url )


				} break
				case '選択肢': {

					let sel = await Action.showChoices( prop.map( c => c.map( textEval ) ) )
					$.log( sel )
					if ( typeof sel == 'object' ) await playAct( sel )
					else {
						let text = await $.fetchFile( 'text', `${ baseURL }/シナリオ/${ sel }.txt` )
						let scenario = await parse( text )
						await play( scenario, baseURL )
					}

				} break
				default : {
					//$.warn( `"${ type }" このアクションは未実装です` )
				}

			}

		} while ( act = act.next )

	}

}



export function parse ( text ) {


	return thirdParse( secondParse( firstParse( text ) ) )



	// 文の取り出しと、第一級アクションとその配下のグルーピング
	function firstParse ( text ) {

		let stateList = text.replace( /\r/g, '' ).split( '\n' )
		let actList = [ ], propTarget = null

		function addAct ( type ) {
			let act = { type: type.replace( '・', '' ).trim( ), children: [ ] }
			propTarget = act.children
			actList.push( act )
		}

		for ( let sta of stateList ) {
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

		//$.log( actList )
		return actList
	}



	// アクション種に応じた配下の処理と、一次元配列への展開
	function secondParse ( actList ) { 

		let actRoot = { type: 'ルート', prop: '' }
		let progList = [ actRoot ]
		let prev = actRoot


		function addAct ( type, prop, { separate = false, subjump = false } = { } ) {

			let act = { type, prop } 

			if ( subjump ) {

				// [k,v]を[[k,v],[k,v],...]パターンと同様に扱えるように加工
				if ( separate ) prop = [ prop ]

				for ( let p of prop ) {
					let subList = secondParse( firstParse( p[ 1 ] ) )
					// もし要素がコマンド郡でなく、リンクなら飛ばす
					if ( subList.length == 2 && subList[ 1 ].type == '会話' &&
						subList[ 1 ].prop[ 1 ] == '' ) continue
					progList = progList.concat( subList )
					p[ 1 ] = subList[ 1 ] 
				}

			} 

			let index = progList.push( act )
			prev.next = act
			prev = act
		}


		function subParse ( type, children, { separate = false, subjump = false } = { } ) {

			let tabs = '\t'.repeat( ( children[ 0 ].match( /^\t+/ ) || [ '' ] ) [ 0 ].length )
			children = children.map( child => child.replace( tabs, '' ) )

			let key = '', value = '', prop = [ ]
			children.push( '' )
			while ( children.length ) {
				let child = children.shift( )
				if ( child[ 0 ] != '\t' ) {
					if ( key ) {
						// \t以外から始まったときで初回以外（バッファを見て判断）
						if ( separate ) addAct( type, [ key, value ], { separate, subjump } )
						  // 細かく分離する
						else prop.push( [ key, value ] )
						  // 配列に貯める
					}
					value = ''
					key = child.replace( '・', '' ).replace( '\s+$', '' )
				} else {
					if ( value ) {
						if ( subjump ) value += '\n'
						else value += '\\w\\n'  // 『会話』用
					}
					value += child.replace( '\t', '' ).replace( '\s+$', '' )
				}
			}
			if ( ! separate ) addAct( type, prop, { separate, subjump } )


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
					subParse( type, children, { separate: true } )
				break
				case '選択肢':
					subParse( type, children, { subjump: true } )
				break
				case '分岐':
					subParse( type, children, { separate: true, subjump: true } )
				break
				default :
					addAct( type, children[ 0 ].trim( ) )

			}

		}

		//$.log( 'PL', progList )
		return progList 
	}



	//実行時に最小限の処理で済むよう式などをできるだけパースする
	function thirdParse ( progList ) {
		//$.log( 'PL', progList )


		function parseText ( text ) {

			if ( typeof text != 'string' ) return text
	
			if ( ! text || text == '無し' || text == 'なし' ) text = ''

			text = text.replace( /\\{(.*?)}/g, ( _, t ) => `'+${ subParseText( t ) }+'` )

			$.log( `'${ text }'` )

			return `'${ text.replace( /\\/g, '\\\\' ) }'`
		}


		function subParseText ( str ) {
			
			//console.log( '式→', str )

			let res = '', prev = '', mode = 'any'

			for ( let c of str ) {

				if ( /\s/.test( c ) ) continue

				let now = ''

				if ( mode == 'str' ) switch ( c ) {

					       case '”': case '’': case '"': case'\'':
						if ( prev == '\\' ) now = c
						else mode = 'any'; now = '"'
					break; case '\\':
						if ( prev == '\\' ) now = '\\'
					break; default:
						now = c

				} else switch ( c ) {

					       case '＋': case '+':							now = '+'
					break; case 'ー': case '－':　case '―': case '-':		now = '-'
					break; case '×': case '✕': case '＊': case '*':		now = '*'
					break; case '÷': case '／': case '/':				now = '/'
					break; case '％': case '%':							now = '%'
					break; case '＝': case '=':
						if ( prev != '==' )
							if ( /[=!><]/.test( prev ) )				now = '='
							else										now = '=='
					break; case '≠':									now = '!='
					break; case '≧':									now = '>='
					break; case '≦':									now = '<='
					break; case '＞':									now = '>'
					break; case '＜':									now = '<'
					break; case '＆': case '&':
						if ( prev != '&&' )								now = '&&'
					break; case '｜': case '|':
						if ( prev != '||' )								now = '||'
					break; case '？': case '?':							now = '?'
					break; case '：': case ':':							now = ':'
					break; case '（': case '(':
						if ( !prev || /[+\-*/%=><&|?:(]/.test( prev ) )	now = '('
						else throw `"${ str }" 式が正しくありません（括弧の開始位置）`
					break; case '（': case '(':							now = ')'
					break; case '”': case '’': case '"': case'\'':
						mode = 'str'; now = '"'
					break; case '`':
						throw `"${ c }" この文字は式中で記号として使うことはできません`
					break; default:
						if ( mode != 'var_op' ) {
							let n = c.normalize('NFKC') // 数値の判定
							if ( n.match( /\d/ ) ) { now = n }  
							else { mode = 'var'; now = '$Get(`' + ( c == '＄' ? '$' : c ) }
						}
						else { mode = 'var'; now = c }

				}

				prev = now

				if ( mode == 'var_op' ) { mode = 'any'; now = '`)' + now }
				if ( mode == 'var' ) mode = 'var_op'

				
				res += now

			}


			if ( mode == 'var_op' ) res += '`)'


			//console.log( '→式', res )


			return res
		}


		for ( let act of progList ) {
			let { type, prop } = act

			switch ( type ) {

				case '会話': {

					act.prop = prop.map( parseText )
				
				} break
				case '立絵': case '立ち絵': {

					let [ pos, name ] = prop.map( parseText )
					pos = pos.normalize('NFKC')
					act.prop = [ pos, name ]	

				} break
				case '背景': {

					let [ pos, name ] = prop.map( parseText )
					if ( name == `''` ) [ name, pos ] = [ pos, name ]
					pos = pos.normalize('NFKC')
					act.prop = [ pos, name ]	

				} break
				case '選択肢': {

					act.prop = prop.map( c => c.map( parseText ) )

				} break
				default : {

					//$.warn( `"${ type }" このアクションは未実装です` )

				}

			}

		}




		return progList
	}

}



