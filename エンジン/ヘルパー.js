
var LOG = console.log.bind(console)
var ERROR = function (message) { alert(message) }
var NOP = function () {}

Promise.prototype.next = function next(kind, onFulfilled, onRejected) {
	setPhase(kind + '中...')
	return this.then(onFulfilled, onRejected).catch(function (err) {
		console.log(kind + 'エラー', err)
		setPhase(kind + 'エラー')
		return Promise.reject(err)
	})
}


Promise.prototype.on = function on(type, onFulfilled, onRejected) {
	return this.then(function (val) {
		return View.on(type).then(function () {
			return onFulfilled(val)
		}).throw(onRejected)
	})
}


Promise.defer = Promise.defer || function defer() {
	var resolve, reject
	var promise = new Promise(function (ok, ng) {
  		resolve = ok, reject = ng
	})
return {promise: promise, resolve: resolve, reject: reject}
}

var URLs = {
	SettingData: 'データ/作品設定.txt'
}

var HELPER_READY = Promise.resolve()