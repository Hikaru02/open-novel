/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

export const log = ( ...args ) => console.log( ...args )

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

