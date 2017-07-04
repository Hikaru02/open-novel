
export const log = ( ...args ) => console.log( ...args )

export function Deferred ( ) {
	let resolve, reject
	let promise = new Promise( ( ok, ng ) => { resolve = ok, reject = ng } )
	return { promise, resolve, reject }
}
