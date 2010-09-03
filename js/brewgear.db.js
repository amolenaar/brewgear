
// global property 'db'
var db = null;

var db_version = 0;

/*
 * Initialize the database
 */
$(function() {
  // Skip this part if Google Gears is not present
  if (window.openDatabase) {
    //var shortName = 'brewgear';
    //var version = '1.0';
    //var displayName = 'BrewGear recipe database';
    //var maxSize = 1024*1024; // 1Mb, in bytes
    try {
      db = openDatabase('brewgear', undefined, 'BrewGear recipe database', 65536);
    } catch (e) {
      // Error handling code goes here.
      if (e == 2) {
        // Version number mismatch.
        alert("Invalid database version.");
      } else {
        alert("Unknown error "+e+".");
      }
      return;
    }
  }

  if (!db) {
    return;
  }

  db.transaction(function(tx) {
    tx.executeSql("SELECT value FROM brewgear WHERE key = 'db'", [], function(tx, rs) {
      // Issue: no result set!
      console.log('checking DB version');
      if (rs.rows.length > 0) {
        var row = rs.rows.item(0);
        db_version = row.value;
        console.log('DB version = ' + db_version);
      }
      db_init();
    }, function(tx, err) {
      console.log('Error in DB version query: ' + err.code + ' - ' + err.message);
      db_version = 0;
      db_init();
    });
    //db_init(tx);
    //console.log('done checking');
  }, function(err) {
    console.log('Error in DB init: ' + err.code + ' - ' + err.message);
    if (err.code == 1) {
      // table 'brewgear' does not exist
      db_init();
    }
  });
//  db_init();
});

function load_ddl(tx, filename) {
  $.ajax({ url: filename,  dataType: "plain", async: false, success:
    function(doc) {
      var queries = doc.replace(/--.*\n/g, "").split(';');
      for (i in queries) {
        var q = $.trim(queries[i]);
        if (q.length > 0) {
          if (window.console) {
            console.log(' - performing database statement: ' + q);
          }
          tx.executeSql(q);
        }
      }
    }
  });
}


function db_init() {
  db.transaction(function(tx) {
    if (db_version < 1) {
      // No DB. Create one.
      load_ddl(tx, "data/brewgear.ddl");
      db_populate_style_table(tx);
      db_populate_fermentable_table(tx);
      db_version = 1;
    }
    db_upgrade_2(tx);
  }, function(err) {
    console.log('db_init failed: ' + err.code + ' - ' + err.message);
  });
}

function db_populate_style_table(tx) {
    tx.executeSql("SELECT count(*) FROM style", [], function(tx, rs) {
      if (rs.rows.length > 0) {
        var row = rs.rows.item(0);
        if (row[0] > 0)
          return;
        // Next import data from the XML resources into the database
        $.ajax({ url: "data/beerstyles.xml", dataType: "xml", async: false, success:
          function(xml) {
            // xml is a Document
            //db.transaction(function(tx) {
              $('class', xml).each(function() {
                tag = $(this).attr('tag');
                $('beerstyle', this).each(function() {
                  if (window.console) {
                    console.log('creating style: ' + $('name', this).text());
                  }
                  tx.executeSql('INSERT INTO style (class, name, description, gravity_min, gravity_max,' +
                        'alcohol_min, alcohol_max, attenuation_min, attenuation_max, ebc_min, ebc_max,' +
                        'ibu_min, ibu_max, co2g_min, co2g_max, co2v_min, co2v_max, ph_min, ph_max)' +
                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [tag, $('name', this).text(), $('description', this).text(),
                         $('gravity', this).attr('min'), $('gravity', this).attr('max'),
                         $('alcohol', this).attr('min'), $('alcohol', this).attr('max'),
                         $('attenuation', this).attr('min'), $('attenuation', this).attr('max'),
                         $('ebc', this).attr('min'), $('ebc', this).attr('max'),
                         $('ibu', this).attr('min'), $('ibu', this).attr('max'),
                         $('co2g', this).attr('min'), $('co2g', this).attr('max'),
                         $('co2v', this).attr('min'), $('co2v', this).attr('max'),
                         $('ph', this).attr('min'), $('ph', this).attr('max') ]);
                });
              }); // class
            //});
          }
        }); // ajax
      }
    });
}
 
function db_populate_fermentable_table(tx) {
    tx.executeSql("SELECT count(*) FROM fermentable", [], function(tx, rs) {
      if (rs.rows.length > 0) {
        var row = rs.rows.item(0);
        if (row[0] > 0)
            return;
        // Next import data from the XML resources into the database
        $.ajax({ url: "data/fermentables.xml", dataType: "xml", async: false, success:
          function(xml) {
            // xml is a Document
            //db.transaction(function(tx) {
              $('category', xml).each(function() {
                var category = $(this).attr('name');
                $('product', this).each(function() {
                  if (window.console) {
                    console.log('inserting fermentable ' + $('name', this).text());
                  }
                  tx.executeSql('INSERT INTO fermentable (category, name, yield, moisture, ebc, priming)' +
                          'VALUES (?, ?, ?, ?, ?, ?)',
                          [ category, $('name', this).text(), $('yield', this).text(), 
                            $('moisture', this).text(), $('ebc', this).text(),
                            $('priming', this).text() || null ]);
                }); // product
              }); // category
            //});
          }
        }); // ajax
      }
    });
}


function db_upgrade_2(tx) {
  if (db_version < 3) {
    load_ddl(tx, "data/brewgear_3.ddl");
    db_version = 3;
  }

}

