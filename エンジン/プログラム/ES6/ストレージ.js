READY().then( ({Util}) => {
	'use strict'

	var db, scenario, VERSION = 6

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
			var name = getSaveName()
			return new Promise( (ok, ng) => { 
				var saves = new Array(to + 1)
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')

				for (var no = from; no <= to; ++no) {
					var rq = os.get(name+'/'+no)
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
			var name = getSaveName()
			data.systemVersion = VERSION
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.put(data, name+'/'+no)
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージの書込に失敗（${ts.error.message})`)
			})
		},

		getGlobalData() {
			var name = getSaveName()
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readonly')
				var os = ts.objectStore('savedata')
				var rq = os.get(name+'/global')
				ts.oncomplete = _ => ok(rq.result)
				ts.onabort = _ => ng(`ストレージの読込に失敗（${ts.error.message})`)
			})
		},

		setGlobalData(data) {
			if (!data) throw 'セーブ用データが不正'
			var name = getSaveName()
			data.systemVersion = VERSION
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rq = os.put(data, name+'/global')
				ts.oncomplete = _ => ok()
				ts.onabort = _ => ng(`ストレージの書込に失敗（${ts.error.message})`)
			})
		},

		deleteSaveDatas(con) {
			if (!(con === true)) throw '誤消去防止セーフティ'
			var name = getSaveName()
			return new Promise( (ok, ng) => { 
				var ts = db.transaction('savedata', 'readwrite')
				var os = ts.objectStore('savedata')
				var rg = IDBKeyRange.bound(`${name}/`, `${name}/{`)
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


	function getSaveName() {
		return Data.dataSaveName || Data.scenarioName
	}


	new Promise( (ok, ng) => { 
		var rq = indexedDB.open(`open-novel`, 8)
		rq.onupgradeneeded = evt => {
			var db = rq.result, ts = rq.transaction, ov = evt.oldVersion
			//if (ov <= 1) alert('※初めに※\nopenノベルプレーヤーでは Chrome　Firefox　Opera　の最新バージョンでの利用を推奨しています。')
			if (ov <= 7) if(confirm('データベースの初期化が必要です。')) {
				;[].slice.call(db.objectStoreNames).forEach( n => db.deleteObjectStore(n) )
				db.createObjectStore('setting')
				db.createObjectStore('savedata')
				alert('初期化が完了しました。')
			} else {
				ts.abort()
				alert('初期化を行わないと起動できません。')
			}
		} 
		rq.onsuccess = _ => ok(rq.result)
		rq.onerror = err => ng(`ストレージが開けない（${err.message})`)

	}).then( val => {
		Storage.DB = db = val
		READY.Storage.ready(Storage)
	})

}).check()