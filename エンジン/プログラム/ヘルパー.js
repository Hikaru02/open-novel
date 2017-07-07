/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

export const log = console.log.bind( console )

export const warn = console.warn.bind( console )

export function Deferred ( ) {
	let resolve, reject
	let promise = new Promise( ( ok, ng ) => { resolve = ok, reject = ng } )
	return { promise, resolve, reject }
}

export function timeout ( ms ) {
	
	let { promise, resolve } = new Deferred
	setTimeout( resolve, ms )
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

export async function fetchFile( type, { baseURL }, subURL ) {
	return await ( await fetch( baseURL + '/' + subURL ) )[ type ]( )
}


