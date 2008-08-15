(function() {

    if (window.openDatabase || !window.google) {
        return;
    }
    

	function Database(dbName, dbVersion) {
		this.version = dbVersion || 1;
        
        var db = google.gears.factory.create('beta.database', '1.0');
   
        db.open(dbName);
  
        $(window).unload(function() {
            db.close();
        });

		this.changeVersion = function(oldVersion, newVersion, callback) {
			// TODO: Implement changeVersion	
		}
		
		this.transaction = function(txCallback, errorCallback, successCallback) {
		
		    this.executeSql = function(sqlStmt, args, sqlCallback, errorCallback) {
			    //console.log(' HELP' + sqlStmt);
			    var rs;
			    
			    try {
			        rs = db.execute(sqlStmt, args);
                } catch (e) {
                 console.log("error in sql: " + sqlStmt, e);
                   if (errorCallback) {
                        errorCallback();
                    } else {
                        throw e;
                    }
                }
                if (sqlCallback) {
                    var rows = [];
                    while (rs.isValidRow()) {
                        var row = {};
                        for (var i = 0; i < rs.fieldCount(); i++) {
                            row[rs.fieldName(i)] = rs.field(i);
                        }
                        rows.push(row);
                        rs.next();
                    }
                    rs.close();
                    console.log(rows);
                    sqlCallback(this, new SQLResultSet(db.lastInsertRowId, rows));
                }
		    }

            try {
                //db.execute('BEGIN TRANSACTION');
                txCallback(this);
                //db.execute('COMMIT');

            } catch (e) {
                //db.execute('ROLLBACK');
                console.log("error in transaction: ", e);
                if (errorCallback) {
                    errorCallback({code: 1, messsage: e});
                }
                return;
            }
            if (successCallback) {
                successCallback();
            }
		}
		
	};
    
	function SQLResultSet(id, rows) {
		this.insertId = id;
		// TODO: Implement:
		// this.rowsAffected
		// this.errorCode
		// this.error
		
		this.rows = new SQLResultSetRowList(rows);
	}

	function SQLResultSetRowList(rows) {
		
		// TODO: Make read-only
		this.length = rows.length;
		
		this.item = function(i) {
			return rows[i];
		}
	}

	window.openDatabase = function(n, v) {
	  	return new Database(n, v);
	}

})();