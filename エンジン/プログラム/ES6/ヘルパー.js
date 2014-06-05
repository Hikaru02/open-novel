;( _ => {
	'use strict'

	var global = (1,eval)('this')
	var Promise = global.Promise
	var LOG = console.log.bind(console)

	var Data = {
		URL: {
			SettingData: 'データ/作品設定.txt',
		},
	}

	var Util = ( _ => {

		return {
			//setDefalt(obj, name, value) {
			//	if (arguments.length !== 3) throw 'illegal arguments length'
			//	if (!(name in obj)) obj[name] = value
			//	return obj
			//},

			setDefalts(obj = {}, props) {
				if (arguments.length !== 2) throw 'illegal arguments length'
				Object.keys(props).forEach(key => { if (!(key in obj)) obj[key] = props[key] })
				return obj
			},

			setProperties(obj = {}, props) {
				Object.keys(props).forEach(key => obj[key] = props[key] )
				return obj
			},
			NOP() {},
			error(message) { alert(message) },
		}
	})()



	Util.setDefalts(String.prototype, {
		repeat: function repeat(num) {
			return new Array(num + 1).join(this)
		},
	})


	Util.setDefalts(Promise, {

		defer() {
			var resolve, reject
			var promise = new Promise((ok, ng) => {
		  		resolve = ok, reject = ng
			})
			return {promise, resolve, reject}
		},

	})



	Util.setProperties(Promise.prototype, {

		next: function next(kind, onFulfilled, onRejected) {
			return this.then( result => {
				Player.setRunPhase(kind)
				return onFulfilled(result)
			}, onRejected).catch(err => {
				LOG(kind + 'エラー', err)
				Player.setErrorPhase(kind)
				return Promise.reject(err)
			})
		},

		on: function on(type, onFulfilled = result => result, onRejected) {
			return this.then( result => View.on(type).then( _ => onFulfilled(result) ).catch(onRejected) )
		},

		and: function and(func, arg) {
			return this.then( _ => func(arg) )
		},

		delay: function delay(time) {
			if (!+time) throw 'illegal time number'
			return this.then( _ => new Promise( resolve => setTimeout(resolve, time) ) )
		},
	})

	Object.defineProperty(Promise.prototype, '$', {
		enumerable: true, configurable: true, 
		get: function () {
			var _p = this
			var $p = function (...args) {
	 			var len = args.length
	 			if (len === 0) return $p
	 			var [arg0, arg1, arg2] = args

	 			if (typeof arg0 == 'function') {
		 			switch (args.length) {
						case 1: 
						case 2: return _p.then(arg0).$
					}
				} else {
		 			switch (args.length) {
						case 1: return _p.on(arg0).$
						case 2:
						case 3: return _p.next(arg0, arg1, arg2).$
					}

				}
				throw 'illegal arguments length'
			}
			Util.setProperties($p, {
				then: (res, rej) => _p.then(res, rej).$ ,
				catch: rej => _p.catch(rej).$ ,
			})
			Object.defineProperty($p, '_', {
				enumerable: true, configurable: true,
				get: _ => _p
			})
			$p.__proto__ = _p
			return $p
		}
	})

	function $Promise(func) {
		return new Promise(func).$
	}

	Util.setProperties($Promise, {
		defer: _ => {
			var defer = Promise.defer()
			defer.promise = defer.promise.$
			return defer
		},
		resolve: val => Promise.resolve(val).$ ,
		reject : val => Promise.reject(val).$ ,
		all    : ary => Promise.all(ary).$ ,
		race   : ary => Promise.race(ary).$ ,
	})

	Util.overrides = { Promise }

	var READY = ( _ => {
		function READY(type) {
			var types = (arguments.length != 1) ? [].slice.call(arguments) : (Array.isArray(type)) ? type : [type]
			return $Promise.all(types.map(type => {
				if (!(type in READY)) throw 'illegal READY type "' +type+ '"'
				return READY[type]
			}))
		}
		;['DOM', 'Player', 'View'].forEach(type => {
			global[type] = null
			var defer = $Promise.defer()
			READY[type] = defer.promise
			READY[type].ready = obj => {
				global[type] = obj
				defer.resolve()
			} 
		})
		return READY
	})()

	window.addEventListener('DOMContentLoaded', READY.DOM.ready)


	Util.setDefalts(global, {
		global, READY, Util, LOG, Data,
	})

})();