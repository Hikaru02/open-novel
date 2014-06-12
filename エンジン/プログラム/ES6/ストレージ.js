READY().then( _ => {
	'use strict'

	Util.co(function* () {

		var db = yield new Promise( (ok, ng) => { 
			var rq = indexedDB.open('open-novel', 1)
			rq.onupgradeneeded = evt => {
				var db = rq.result
				var ov = evt.oldVersion
				if (ov < 1) db.createObjectStore('test', { autoIncrement: true })
			} 
			rq.onsuccess = _ => ok(rq.result)
			rq.onerror = err => ng(`ストレージが開けない（${err.message})`)
		})

		var Storage = {
			testAdd(key, val) {
				return new Promise ( (ok, ng) => { 
					var ts = db.transaction('test', 'readwrite')
					var os = ts.objectStore('test')
					var rq = os.add(val, key)
					ts.oncomplete = _ => ok()
					ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
				})
			},
			testPut(key, val) {
				return new Promise ( (ok, ng) => { 
					var ts = db.transaction('test', 'readwrite')
					var os = ts.objectStore('test')
					var rq = os.put(val, key)
					ts.oncomplete = _ => ok()
					ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
				})
			},
			testGet(key) {
				return new Promise ( (ok, ng) => { 
					var ts = db.transaction('test', 'readwrite')
					var os = ts.objectStore('test')
					var rq = os.get(key)
					ts.oncomplete = _ => ok()
					ts.onabort = _ => ng(`ストレージのkey『${key}』の読込に失敗（${ts.error.message})`)
				})
			},
			testDelete(key) {
				return new Promise ( (ok, ng) => { 
					var ts = db.transaction('test', 'readwrite')
					var os = ts.objectStore('test')
					var rq = os.delete(key)
					ts.oncomplete = _ => ok()
					ts.onabort = _ => ng(`ストレージのkey『${key}』の削除に失敗（${ts.error.message})`)
				})
			},


		}

		READY.Storage.ready(Storage)

	})().catch(LOG)

}).catch(LOG)