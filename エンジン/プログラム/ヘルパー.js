var LOG = console.log.bind(console)
var ERROR = function (message) { alert(message) }
var NOP = function () {}

var URLs = {
	SettingData: 'データ/作品設定.txt'
}


var Util = function () {

	return {
		//setDefalt: function setDefalt(obj, name, value) {
		//	if (arguments.length !== 3) throw 'illegal arguments length'
		//	if (!(name in obj)) obj[name] = value
		//	return obj
		//},

		setDefalts: function setDefalts(obj, props) {
			obj = obj || {}
			if (arguments.length !== 2) throw 'illegal arguments length'
			Object.keys(props).forEach(function (key) {
				if (!(key in obj)) obj[key] = props[key] 
			})
			return obj
		},

		setProperties: function setProperties(obj, props) {
			obj = obj || {}
			Object.keys(props).forEach(function (key) {
				obj[key] = props[key] 
			})
			return obj
		},
	}
}()



Util.setDefalts(String.prototype, {
	repeat: function (num) {
		new Array(num + 1).join(this)
	},
})


Util.setDefalts(Promise, {

	defer: function defer() {
		var resolve, reject
		var promise = new Promise(function (ok, ng) {
	  		resolve = ok, reject = ng
		})
		return {promise: promise, resolve: resolve, reject: reject}
	},

})


Util.setProperties(Promise.prototype, {

	next: function next(kind, onFulfilled, onRejected) {
		Player.setPhase(kind + '中...')
		return this.then(onFulfilled, onRejected).catch(function (err) {
			console.log(kind + 'エラー', err)
			Player.setPhase(kind + 'エラー')
			return Promise.reject(err)
		})
	},

	on: function on(type, onFulfilled, onRejected) {
		return this.then(function (val) {
			return View.on(type).then(function () {
				return onFulfilled(val)
			}).catch(onRejected)
		})
	},

	and: function and(func, arg) {
		return this.then(function () {
			return func(arg)
		})
	},

	delay: function delay(time) {
		if (!+time) throw 'illegal time number'
		return this.then(function () {
			return new Promise(function (resolve) {
				setTimeout(resolve, time)
			})
		})
	},

})



var READY = function () {
	function READY(type) {
		var types = (Array.isArray(type)) ? type : (arguments.length >= 2) ? [].slice.call(arguments) : [type]
		return Promise.all(types.map(function (type) { return READY[type] }))
	}
	;['DOM', 'MODEL', 'VIEW', 'CONTROLLER'].forEach(function (type) {
		var defer = Promise.defer()
		READY[type] = defer.promise
		READY[type].ready = defer.resolve 
	})
	return READY
}()

window.addEventListener('DOMContentLoaded', READY.DOM.ready)