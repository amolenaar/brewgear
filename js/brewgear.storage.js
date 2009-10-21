
/**
 * Storage: load/save data to the local database (`db'). db is enhanced.
 */

storage = {

  recipe_id: undefined,
  
  setProperty: function(name, value) {
    if (!db) { return; }
    if (typeof value == "undefined") {
      db.transaction(function(tx) {
        tx.executeSql('DELETE FROM brewgear WHERE key = ?', [ name ]);
      });
    } else {
      storage.getProperty(name, null, function(result) {
        db.transaction(function(tx) {    
          if (result === null) {
            tx.executeSql('INSERT INTO brewgear (key, value) VALUES (?, ?)', [ name, value ]);
          } else {
            tx.executeSql('UPDATE brewgear SET value = ? where key = ?', [ value, name ]);
          }
        });
      });
    }
  },
  
  getProperty: function(name, defaultValue, callback) {
    if (!db) { return; }
    db.transaction(function(tx) {
      tx.executeSql('SELECT value FROM brewgear WHERE key = ?', [ name ], function(tx, rs) {
        if (rs.rows.length > 0) {
          var result = rs.rows.item(0).value;
          callback(result);
        } else {
          callback(defaultValue);
        }
      }, function() {
        callback(defaultValue);
      });
    });
  },

  _find: function(query, term, callback) {
    db.transaction(function(tx) {
      tx.executeSql(query, [ '%' + term + '%' ], function(tx, rs) {
        rows = [];
        for (var i = 0; i < rs.rows.length; i++) {
          rows.push(rs.rows.item(i));
        }
        callback(rows);
      });
    });
  },

  /**
   * Find styles that match the given `term`. `callback` is called with
   * an array of style information (style_id, name).
   */
  findStyles: function(term, callback) {
    this._find('SELECT style_id, name FROM style WHERE name LIKE ?', term, callback);
  },

  /**
   * Find fermentables (malt, sugars) that match a given `term`. `callback`
   * is called with an array of fermentable information (fermentable_id,
   * name, category, yield, moisture, ebc).
   */
  findFermentables: function(term, callback) {
    this._find('SELECT fermentable_id, name, category, yield, moisture, ebc FROM fermentable WHERE name LIKE ? AND yield IS NOT NULL', term, callback);
  },
  
  findPrimingFermentables: function(term, callback) {
    this._find('SELECT fermentable_id, name, priming FROM fermentable WHERE name LIKE ? AND priming IS NOT NULL', term, callback);
  },

  saveNew: function(readyCallback) {
    return this.save(undefined, readyCallback);
  },
  
  /**
   * Save a recipe in the database. If no recipe_id was given a new recipe is
   * created. Returns the recipe id.
   */
  save: function(recipe_id, readyCallback) {
    var isNew = (typeof recipe_id == "undefined");

    function F(s, e) {
      var v = $(s, e).val();
      if (typeof v == "undefined")
        return '';
      return v;
    }

    // Use separate fiunction, as we need a recipe_id
    function save_the_rest(tx, recipe_id) {
      // Fermentables
      if (!isNew)
        tx.executeSql('DELETE FROM recipe_fermentable where recipe_id = ?', [ recipe_id ]);
      $('.malt').each(function() {
        if (F('[name=malt-id]', this)) {
          tx.executeSql('INSERT INTO recipe_fermentable ( recipe_id, fermentable_id, amount, added ) VALUES (?, ?, ?, ?)',
              [ recipe_id, F('[name=malt-id]', this), F('[name=malt-amount]', this), F('[name=malt-added]', this) ]);
        }
      });
      
      // Mash
      if (!isNew)
        tx.executeSql('DELETE FROM mash where recipe_id = ?', [ recipe_id ]);
      $('.step').each(function() {
        if (F('[name=step-name]', this)) {
          tx.executeSql('INSERT INTO mash ( recipe_id, name, temperature, water, duration ) VALUES (?, ?, ?, ?, ?)',
              [ recipe_id, F('[name=step-name]', this), F('[name=step-temp]', this), F('#volume-mash'), F('[name=step-time]', this) ]);
        }
      });
      
      // Hops
      if (!isNew)
        tx.executeSql('DELETE FROM hop where recipe_id = ?', [ recipe_id ]);
      var step_id = 0;
      $('.hop').each(function() {
        if (F('[name=hop-name]', this)) {
          tx.executeSql('INSERT INTO hop ( recipe_id, name, alpha, addition, amount, boiltime ) VALUES (?, ?, ?, ?, ?, ?)',
              [ recipe_id, F('[name=hop-name]', this), F('[name=hop-alpha]', this), 0, F('[name=hop-amount]', this), F('[name=hop-boiltime]', this) ]);
        }
      });
      
      // Filter 
      if (!isNew)
        tx.executeSql('UPDATE filter SET water_added=?, og_before_boil=?, loss=? WHERE recipe_id=?',
            [ F('#volume-filter'), F('#og-before-boil'), F('#loss-after-filter'), recipe_id ]);
      else
        tx.executeSql('INSERT INTO filter (recipe_id, water_added, og_before_boil, loss) VALUES (?, ?, ?, ?)',
            [ recipe_id, F('#volume-filter'), F('#og-before-boil'), F('#loss-after-filter') ]);

      // Boil 
      if (!isNew)
        tx.executeSql('UPDATE boil SET boiltime=?, evaporation=?, volume_begin_boil=?, volume_after_boil=?, loss=? WHERE recipe_id=?',
            [ F('#boiltime'), F('#evaporation'), F('#volume-before-boil'), F('#volume-after-boil'), F('#loss-after-boil'), recipe_id ]);
      else
        tx.executeSql('INSERT INTO boil (recipe_id, boiltime, evaporation, volume_begin_boil, volume_after_boil, loss) VALUES (?, ?, ?, ?, ?, ?)',
            [ recipe_id, F('#boiltime'), F('#evaporation'), F('#volume-before-boil'), F('#volume-after-boil'), F('#loss-after-boil') ]);

      // Fermentation 
      if (!isNew)
        tx.executeSql('UPDATE fermentation SET volume=?, og=?, yeast=?, volume_starter=?, starter_t=?, primary_date=?, primary_fg=?, primary_t=?, primary_aeration=?,secundary_date=?, secundary_fg=?, secundary_t=? WHERE recipe_id=?',
            [ F('#volume-fermenter'), F('#og'), F('#yeast'), F('#starter'), F('#starter-temp'), F('[name=start-primary]'), F('[name=fg-primary]'), F('[name=temperature-primary]'), F('[name=aeration-primary]'), F('[name=start-secundary]'), F('[name=fg-secundary]'), F('[name=temperature-secundary]'), recipe_id ]);
      else
        tx.executeSql('INSERT INTO fermentation (recipe_id, volume, og, yeast, volume_starter, starter_t, primary_date, primary_fg, primary_t, primary_aeration, secundary_date, secundary_fg, secundary_t) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [ recipe_id,F('#volume-fermenter'), F('#og'), F('#yeast'), F('#starter'), F('#starter-temp'), F('[name=start-primary]'), F('[name=fg-primary]'), F('[name=temperature-primary]'), F('[name=aeration-primary]'), F('[name=start-secundary]'), F('[name=fg-secundary]'), F('[name=temperature-secundary]') ]);
   
      // Bottling
      if (!isNew)
        tx.executeSql('UPDATE bottling SET bottle_date=?, volume=?, fermentable_id=?, amount=? WHERE recipe_id=?',
            [ F('#bottle-date'), F('#bottle-volume'), F('#priming-id'), F('#priming-amount'), recipe_id ]);
      else
        tx.executeSql('INSERT INTO bottling (recipe_id, bottle_date, volume, fermentable_id, amount) VALUES (?, ?, ?, ?, ?)',
            [ recipe_id, F('#bottle-date'), F('#bottle-volume'), F('#priming-id'), F('#priming-amount') ]);

      if (typeof readyCallback == "function") {
        readyCallback(recipe_id);
      }
    }
    

    // Make sure the recipe record is saved first, since we NEED a recipe_id!
    db.transaction(function(tx) {
      if (isNew) {
        tx.executeSql("INSERT INTO recipe (name, batch, style_id, brew_date, target_gravity, target_volume, efficiency, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [ F('#name'), F('#batch'), F('#style-id'), F('#brew-date'), F('#planned-og'), F('#batch-size'), F('#brewhouse-efficiency'), F('#notes') ],
            function(tx, rs) {
              tx.executeSql('SELECT recipe_id FROM recipe WHERE rowid=?', [ rs.insertId ], function(tx, rs2) {
                recipe_id = rs2.rows.item(0).recipe_id;
                console.log('recipe_id = ' + recipe_id);
                save_the_rest(tx, recipe_id);
              });
            }
        );
      } else {
        tx.executeSql("UPDATE recipe SET name=?, batch=?, style_id=?, brew_date=?, target_gravity=?, target_volume=?, efficiency=?, notes=? WHERE recipe_id=?",
            [ F('#name'), F('#batch'), F('#style-id'), F('#brew-date'), F('#planned-og'), F('#batch-size'), F('#brewhouse-efficiency'), F('#notes'), recipe_id ]);
        save_the_rest(tx, recipe_id);
      }
    
    }, function(err) {
      alert('Fout tijdens opslaan: ' + err.message);
    });
  },

  /**
   * Returns an array of { recipe_id, name, brew_date } objects.
   */
  list: function (readyCallback) {
    if (typeof db == 'undefined')
      return;
    
    db.transaction(function(tx) {
      tx.executeSql('SELECT recipe_id, batch, name, brew_date FROM recipe ORDER BY batch desc', [], function(tx, rs) {
        var items = new Array();
    
        for (var i = 0; i < rs.rows.length; i++) {
          var f = rs.rows.item(i);
          items.push({ recipe_id: f.recipe_id, name: f.batch + ". " + f.name, brew_date: f.brew_date });
        }
        readyCallback(items);
      });
    });
  },
  
  load: function (recipe_id, callback) {

    db.transaction(function(tx) {

      tx.executeSql('SELECT * FROM recipe WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          storage.clear();
          var f = rs.rows.item(0);
          $('#name').val(f.name);
          $('#batch').val(f.batch);
          $('#brew-date').val(f.brew_date);
          $('#planned-og').val(f.target_gravity);
          $('#batch-size').val(f.target_volume);
          $('#brewhouse-efficiency').val(f.efficiency);
          $('#notes').val(f.notes);
          var style_id = f.style_id;
          storage.loadStyle(style_id);
        }, function(tx, err) {
          alert('Can\'t load recipe with id ' + recipe_id + ':\n' + err.message);
        }
      );
      
      var added = $('[name=malt-added]:first').attr('data-multistate').split(',');
      for (n in added) {
        p = added[n].split(':');
        added[p[0]] = p[1];
      }

      tx.executeSql('SELECT * FROM recipe_fermentable LEFT JOIN fermentable ON fermentable.fermentable_id = recipe_fermentable.fermentable_id WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          if (rs.rows.length > 0) {
            var i = 0;
            $('.malt').each(function() {
              var f = rs.rows.item(i);
              $('[name=malt-id]', this).val(f.fermentable_id);
              $('[name=malt-name]', this).val(f.name);
              $('[name=malt-yield]', this).val(f.yield);
              $('[name=malt-moisture]', this).val(f.moisture);
              $('[name=malt-ebc]', this).val(f.ebc);
              $('[name=malt-amount]', this).val(f.amount);
              // For malt-added, also update the text displayed on the button.
              $('[name=malt-added]', this).val(f.added);
              $('[name=malt-added]', this).text(added[f.added]);
              i++;
              return i < rs.rows.length;
            });
          }
        }
      );

      tx.executeSql('SELECT * FROM mash WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          if (rs.rows.length > 0) {
            var i = 0;
            $('.step').each(function() {
              var f = rs.rows.item(i);
              $('[name=step-name]', this).val(f.name);
              $('[name=step-temp]', this).val(f.temperature);
              if (i == 0) {
                $('#volume-mash').val(f.water);
              }
              $('[name=step-time]', this).val(f.duration);
              i++;
              return i < rs.rows.length;
            });
          }
        }
      );
      
      tx.executeSql('SELECT * FROM hop WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          if (rs.rows.length > 0) {
            var i = 0;
            $('.hop').each(function() {
              var f = rs.rows.item(i);
              $('[name=hop-name]', this).val(f.name);
              $('[name=hop-alpha]', this).val(f.alpha);
              $('[name=hop-amount]', this).val(f.amount);
              $('[name=hop-boiltime]', this).val(f.boiltime);
              i++;
              return i < rs.rows.length;
            });
          }
        }
      );

      // Filter 
      tx.executeSql('SELECT * FROM filter WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          var f = rs.rows.item(0);
          $('#volume-filter').val(f.water_added);
          $('#og-before-boil').val(f.og_before_boil);
          $('#loss-after-filter').val(f.loss);
        }
      );

      // Boil 
      tx.executeSql('SELECT * FROM boil WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          var f = rs.rows.item(0);
          $('#boiltime').val(f.boiltime);
          $('#evaporation').val(f.evaporation);
          $('#volume-before-boil').val(f.volume_begin_boil);
          $('#volume-after-boil').val(f.volume_after_boil);
          $('#loss-after-boil').val(f.loss);
        }
      );

      // Fermentation 
      tx.executeSql('SELECT * FROM fermentation WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          var f = rs.rows.item(0);
          $('#volume-fermenter').val(f.volume);
          $('#og').val(f.og);
          $('#yeast').val(f.yeast);
          $('#starter').val(f.volume_starter);
          $('#starter-temp').val(f.starter_t);
          $('[name=start-primary]').val(f.primary_date);
          $('[name=fg-primary]').val(f.primary_fg);
          $('[name=temperature-primary]').val(f.primary_t);
          $('[name=aeration-primary]').val(f.primary_aeration);
          $('[name=start-secundary]').val(f.secundary_date);
          $('[name=fg-secundary]').val(f.secundary_fg);
          $('[name=temperature-secundary]').val(f.secundary_t);
        }
      );
      
      // Bottling
      tx.executeSql('SELECT * FROM bottling LEFT JOIN fermentable ON fermentable.fermentable_id = bottling.fermentable_id WHERE recipe_id = ?', [ recipe_id ],
        function(tx, rs) {
          var f = rs.rows.item(0);
          $('#bottle-date').val(f.bottle_date);
          $('#bottle-volume').val(f.volume);
          $('#priming-id').val(f.fermentable_id);
          $('#priming-factor').val(f.priming);
          $('#priming-name').val(f.name);
          $('#priming-amount').val(f.amount);

          // ensure updates are done after last query is done.
          storage.after_load();
          if (typeof callback == "function") {
            callback(recipe_id);
          }

        }
      );
      
      console.log('Recipe loaded');
    }, function(err) {
      alert('Error while loading recipe: ' + err.message);
    }); // transaction
  },
  
  loadStyle: function(style_id, callback) {
    db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM style WHERE style_id = ?', [ style_id ], function(tx, rs) {
        var field = rs.rows.item(0);

        $('#style-id').val(field.style_id);
        $('#klasse').val(field['class']);
        $('#style').val(field.name);
        $('#style-og-min').text(field.gravity_min);
        $('#style-og-max').text(field.gravity_max);
        $('#style-alcohol-min').text(field.alcohol_max);
        $('#style-alcohol-max').text(field.alcohol_max);
        $('#style-attenuation-min').text(field.attenuation_min);
        $('#style-attenuation-max').text(field.attenuation_max);
        $('#style-ebc-min').text(field.ebc_min);
        $('#style-ebc-max').text(field.ebc_max);
        $('#style-ibu-min').text(field.ibu_min);
        $('#style-ibu-max').text(field.ibu_max);
        $('#style-co2g-min').text(field.co2g_min);
        $('#style-co2g-max').text(field.co2g_max);
        $('#style-co2v-min').text(field.co2v_min);
        $('#style-co2v-max').text(field.co2v_max);

        if (typeof readyCallback == "function") {
          callback(field);
        }
      });
    });
  },

  after_load: function() {
    $('#stamwort,#klasse,#ebc,#total-yield,#color').update();

    $('#total-amount').update();
    $('#total-percentage').update();

    $('#beslagdikte,#volume-begin-mash').update();

    $('input[name=hop-bitterness],#total-bitterness').update();
    $('.malt,.hop,.step').update();

    $('#efficiency,#bu-gu-ratio,#svg,#co2v,#priming-total,#alcohol').update();

    $('#print-notes,#print-ebc,#print-color-method,#print-bitterness,#print-bitterness-method').update();
  },

  prune: function(recipe_id, callback) {
    var tables = [ 'recipe_fermentable', 'hop', 'mash', 'filter', 'boil', 'fermentation', 'bottling', 'judgement', 'recipe' ];

    db.transaction(function(tx) {
      for (i in tables) {
        tx.executeSql('DELETE FROM ' + tables[i]+ ' WHERE recipe_id = ?', [ recipe_id ]);
      }

      if (this.recipe_id == recipe_id) {
        this.recipe_id = undefined;
      }
      callback(recipe_id);
    });
  },

  clear: function () {
    $('input,textarea').val('');
    $('[name=malt-added]').multistate('_default_');
    $('.malt,.hop').update();
    this.recipe_id = undefined;
  }

}

// vim:sw=2:et:ai
