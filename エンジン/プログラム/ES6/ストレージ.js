READY().then( _ => {
	'use strict'

	var db, scenario

	var Storage = {
		add(key, val) {
			return new Promise ( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.add(val, key)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
			})
		},

		put(key, val) {
			return new Promise ( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.put(val, key)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
			})
		},

		get(key) {
			return new Promise ( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')
				var rq = os.get(key)
				ts.oncomplete = _ => ok(rq.result)
				ts.onabort = _ => ng(`ストレージのkey『${key}』の読込に失敗（${ts.error.message})`)
			})
		},

		getSaveData(no) {
			return new Promise ( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')
				var rq = os.get(no)
				ts.oncomplete = _ => ok(rq.result || [])
				ts.onabort = _ => ng(`ストレージのkey『${key}』の読込に失敗（${ts.error.message})`)
			})
		},

		getSaveDatas(from, to) {
			return new Promise ( (ok, ng) => { 
				var saves = new Array(to - from + 1)
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')

				for (var no = from; no <= to; ++no) {
					var rq = os.get(scenario+'/'+no)
					rq.onsuccess = ((rq, no) => _ => {
						saves[no - from] = rq.result
					})(rq, no)
				}

				ts.oncomplete = _ => ok(saves)
				ts.onabort = _ => ng(`ストレージの読込に失敗（${ts.error.message})`)
			})
		},

		setSaveData(no, data) {
			return new Promise ( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.put(data, scenario+'/'+no)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージのkey『${key}』の読込に失敗（${ts.error.message})`)
			})
		},

		delete(key) {
			return new Promise ( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.delete(key)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージのkey『${key}』の削除に失敗（${ts.error.message})`)
			})
		},

		init() {

			scenario = Player.data.scenarioName

			return new Promise( (ok, ng) => { 
				var rq = indexedDB.open(`open-novel`, 4)
				rq.onupgradeneeded = evt => {
					var db = rq.result
					var ov = evt.oldVersion
					if (ov < 3) db.createObjectStore('savedata')
				} 
				rq.onsuccess = _ => ok(rq.result)
				rq.onerror = err => ng(`ストレージが開けない（${err.message})`)

			}).then( val => db = val )

		}


	}



	READY.Storage.ready(Storage)

}).catch(LOG)