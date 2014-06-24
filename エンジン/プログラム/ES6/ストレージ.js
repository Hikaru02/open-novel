READY().then( _ => {
	'use strict'

	var db, scenario, VERSION = 4

	var Storage = {
		add(key, val) {
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.add(val, key)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
			})
		},

		put(key, val) {
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.put(val, key)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
			})
		},

		get(key) {
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')
				var rq = os.get(key)
				ts.oncomplete = _ => ok(rq.result)
				ts.onabort = _ => ng(`ストレージのkey『${key}』の読込に失敗（${ts.error.message})`)
			})
		},

		delete(key) {
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.delete(key)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージのkey『${key}』の削除に失敗（${ts.error.message})`)
			})
		},

		getSaveDatas(from, to) {
			if (typeof from != 'number' || from < 0) throw 'ロード用番号が不正'
			if (typeof to != 'number' || to < 0) throw 'ロード用番号が不正'
			var scenario = Data.scenarioName
			return new Promise( (ok, ng) => { 
				var saves = new Array(to + 1)
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')

				for (var no = from; no <= to; ++no) {
					var rq = os.get(scenario+'/'+no)
					rq.onsuccess = ((rq, no) => _ => {
						saves[no] = rq.result
					})(rq, no)
				}

				ts.oncomplete = _ => ok(saves)
				ts.onabort = _ => ng(`ストレージの読込に失敗（${ts.error.message})`)
			})
		},

		setSaveData(no, data) {
			if (typeof no != 'number' || no < 0) throw 'セーブ用番号が不正'
			if (!data) throw 'セーブ用データが不正'
			var scenario = Data.scenarioName
			data.version = VERSION
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.put(data, scenario+'/'+no)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージの書込に失敗（${ts.error.message})`)
			})
		},

		getGlobalData() {
			var scenario = Data.scenarioName
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')
				var rq = os.get(scenario+'/global')
				ts.oncomplete = _ => ok(rq.result)
				ts.onabort = _ => ng(`ストレージの読込に失敗（${ts.error.message})`)
			})
		},

		setGlobalData(data) {
			if (!data) throw 'セーブ用データが不正'
			var scenario = Data.scenarioName
			data.version = VERSION
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.put(data, scenario+'/global')
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージの書込に失敗（${ts.error.message})`)
			})
		},

		deleteSaveDatas(con) {
			if (!(con === true)) throw '誤消去防止セーフティ'
			var scenario = Data.scenarioName
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rg = IDBKeyRange.bound(`${scenario}/`, `${scenario}/{`)
				var rq = os.openCursor(rg)
				rq.onsuccess = _ => {
					var cs = rq.result
					if (!cs) return
					cs.delete()
					cs.continue()
				}
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージの消去に失敗（${ts.error.message})`)
			})
		},

		getSetting(key, def) {
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('setting', 'readonly')
				var os = ts.objectStore('setting')
				var rq = os.get(key)
				ts.oncomplete = _ => ok(rq.result)
				ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
			}).then( val => {
				return (val === undefined) ? Storage.setSetting(key, def) : val
			})
		},

		setSetting(key, val) {
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('setting', 'readwrite')
				var os = ts.objectStore('setting')
				var rq = os.put(val, key)
				ts.oncomplete = _ => ok(val)
				ts.onabort = _ => ng(`ストレージのkey『${key}』の書込に失敗（${ts.error.message})`)
			})
		},

		VERSION

	}


	new Promise( (ok, ng) => { 
		var rq = indexedDB.open(`open-novel`, 5)
		rq.onupgradeneeded = evt => {
			var db = rq.result
			var ov = evt.oldVersion
			if (ov < 3) db.createObjectStore('savedata')
			if (ov < 5) db.createObjectStore('setting')
		} 
		rq.onsuccess = _ => ok(rq.result)
		rq.onerror = err => ng(`ストレージが開けない（${err.message})`)

	}).then( val => {
		Storage.DB = db = val
		READY.Storage.ready(Storage)
	})

}).check()