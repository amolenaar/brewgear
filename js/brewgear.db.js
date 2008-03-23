
// global property 'db'
var db;

/*
 * Initialize the database
 */
$(function() {
  // Skip this part if Google Gears is not present
  if (!(window.google && google.gears)) {
    return;
  }

  var db_version = 0;
  
  db = google.gears.factory.create('beta.database', '1.0');
   
  db.open('brewgear');
  
  $(window).unload(function() {
    db.close();
  });
  
  function load_ddl(filename) {
    $.ajax({ url: filename,  dataType: "plain", async: false, success:
      function(doc) {
        var queries = doc.replace(/--.*\n/g, "").split(';');
        for (i in queries) {
          var q = $.trim(queries[i]);
          if (q.length > 0) {
            if (window.console) {
              console.log('creating table: ' + q);
            }
            db.execute(q);
          }
        }
      }
    });
  }

  try {
    rs = db.execute("SELECT value FROM brewgear WHERE key = 'db'");
    if (rs.isValidRow()) {
        db_version = rs.field(0);
    }
    rs.close();
  } catch (exc) {
    db_version = 0;
  }
  
  if (window.console) {
    console.log('Current data version: ', db_version);
  }

  if (db_version < 1) {
    // No DB. Create one.
    load_ddl("data/brewgear.ddl");
    db_version = 1;
  }

  rs = db.execute('SELECT count(*) FROM style');
  c = rs.field(0);
  rs.close();
  if (c === 0) {
    // Next import data from the XML resources into the database
    $.ajax({ url: "data/beerstyles.xml", dataType: "xml", async: false, success:
      function(xml) {
        // xml is a Document
        db.execute('BEGIN TRANSACTION');
        $('class', xml).each(function() {
          tag = $(this).attr('tag');
          $('beerstyle', this).each(function() {
            if (window.console) {
              console.log('creating style: ' + $('name', this).text());
            }
            db.execute('INSERT INTO style (class, name, description, gravity_min, gravity_max,' +
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
        db.execute('COMMIT');
      }
    }); // ajax
  }
  
  rs = db.execute('SELECT count(*) FROM fermentable');
  c = rs.field(0);
  rs.close();
  if (c === 0) {
    // Next import data from the XML resources into the database
    $.ajax({ url: "data/fermentables.xml", dataType: "xml", async: false, success:
      function(xml) {
        // xml is a Document
        db.execute('BEGIN TRANSACTION');
        $('category', xml).each(function() {
          var category = $(this).attr('name');
          $('product', this).each(function() {
            if (window.console) {
              console.log('inserting product ', $('name', this).text());
            }
            db.execute('INSERT INTO fermentable (category, name, yield, moisture, ebc)' +
                      'VALUES (?,?, ?, ?, ?)',
                      [ category, $('name', this).text(), $('yield', this).text(), 
                        $('moisture', this).text(), $('ebc', this).text() ]);
          }); // product
        }); // category
        db.execute('COMMIT');
      }
    }); // ajax
  }
  

  if (db_version < 2) {
    load_ddl("data/brewgear_2.ddl");
    db_version = 2;
  }

  if (db_version < 3) {
    load_ddl("data/brewgear_3.ddl");
    db_version = 3;
  }

});

