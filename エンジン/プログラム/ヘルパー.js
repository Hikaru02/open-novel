/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

export const log	= console.log.bind( console )
export const info	= console.info.bind( console )
export const warn	= console.warn.bind( console )
export const error	= console.error.bind( console )


export function Deferred ( ) {
	let resolve, reject
	let promise = new Promise( ( ok, ng ) => { resolve = ok, reject = ng } )
	return { promise, resolve, reject }
}

export function timeout ( ms ) {
	
	let { promise, resolve } = new Deferred
	if ( ms != Infinity ) setTimeout( resolve, ms )
	return promise
}


export function AwaitRegister ( fn ) {
		
	let registrants = new Set

	return {

		target ( ...args ) {
			let v = fn( ...args )
			for ( let reg of registrants ) { reg( v ) }
			registrants.clear( )
			return v
		},

		register ( ) {
			let { promise, resolve } = new Deferred
			registrants.add( resolve )
			return promise
		}
	}

}

export async function fetchFile( type, url ) {
	return await ( await fetch( url ) )[ type ]( )
}

export async function fetchJSON( url ) {
	return await ( await fetch( url ) ).json( )
}

export function parseSetting ( text ) {
	
	let setting = { }
	let key = ''

	for ( let chunk of text.split( '\n' ) ) {
		chunk = chunk.trim( )
		if ( !chunk ) continue
		if ( chunk.match( /^・/ ) ) {
			key = chunk.replace( '・', '' )
			setting[ key ] = [ ]
		} else {
			setting[ key ].push( chunk )
		}
	}

	log( setting )
	return setting
}

