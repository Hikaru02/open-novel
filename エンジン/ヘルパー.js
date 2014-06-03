var LOG = console.log.bind(console)
var ERROR = function (message) { alert(message) }
var NOP = function () {}

var URLs = {
	SettingData: 'データ/作品設定.txt'
}



Promise.prototype.next = function next(kind, onFulfilled, onRejected) {
	Player.setPhase(kind + '中...')
	return this.then(onFulfilled, onRejected).catch(function (err) {
		console.log(kind + 'エラー', err)
		Player.setPhase(kind + 'エラー')
		return Promise.reject(err)
	})
}


Promise.prototype.on = function on(type, onFulfilled, onRejected) {
	return this.then(function (val) {
		return View.on(type).then(function () {
			return onFulfilled(val)
		}).catch(onRejected)
	})
}


Promise.defer = Promise.defer || function defer() {
	var resolve, reject
	var promise = new Promise(function (ok, ng) {
  		resolve = ok, reject = ng
	})
return {promise: promise, resolve: resolve, reject: reject}
}



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