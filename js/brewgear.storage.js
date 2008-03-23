
/**
 * Storage: load/save data to the local database (`db'). db is enhanced.
 */

storage = {

  recipe_id: undefined,
  
  setProperty: function(name, value) {
    if (!db) { return; }
    if (typeof value == "undefined")
      db.execute('DELETE FROM brewgear WHERE key = ?', [ name ]);
    else if (this.getProperty(name))
      db.execute('UPDATE brewgear SET value = ? where key = ?', [ value, name ]);
    else
      db.execute('INSERT INTO brewgear (key, value) VALUES (?, ?)', [ name, value ]);
  },
  
  getProperty: function(name, defaultValue) {
    if (!db) { return; }
    var rs = db.execute('SELECT value FROM brewgear WHERE key = ?', [ name ]);
    try {
      return rs.isValidRow() ? rs.field(0) : defaultValue;
    } finally {
      rs.close();
    }
  },
  
  saveNew: function() {
    this.recipe_id = undefined;
    return this.save();
  },
  
  /**
   * Save a recipe in the database. If no recipe_id was given a new recipe is
   * created. Returns the recipe id.
   */
  save: function(recipe_id) {
    var isNew = false;
    if (typeof recipe_id == "undefined")
      recipe_id = this.recipe_id;

    if (typeof recipe_id == "undefined")
      isNew = true;

    function F(s, e) {
      var v = $(s, e).val();
      if (typeof v == "undefined")
        return '';
      return v;
    }

    db.execute('BEGIN TRANSACTION');
    
    if (isNew) {
      db.execute("INSERT INTO recipe (name, batch, style_id, brew_date, target_gravity, target_volume, efficiency, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [ F('#name'), F('#batch'), F('#style-id'), F('#brew-date'), F('#planned-og'), F('#batch-size'), F('#brewhouse-efficiency'), F('#notes') ]);
      var rs = db.execute('SELECT recipe_id FROM recipe WHERE rowid=?', [ db.lastInsertRowId ]);
      recipe_id = rs.field(0);
      rs.close();
    } else {
      db.execute("UPDATE recipe SET name=?, batch=?, style_id=?, brew_date=?, target_gravity=?, target_volume=?, efficiency=?, notes=? WHERE recipe_id=?",
          [ F('#name'), F('#batch'), F('#style-id'), F('#brew-date'), F('#planned-og'), F('#batch-size'), F('#brewhouse-efficiency'), F('#notes'), recipe_id ]);
    }
  
    // Fermentables
    if (!isNew)
      db.execute('DELETE FROM recipe_fermentable where recipe_id = ?', [ recipe_id ]);
    $('.malt').each(function() {
      if (F('[name=malt-id]', this)) {
        db.execute('INSERT INTO recipe_fermentable ( recipe_id, fermentable_id, amount, added ) VALUES (?, ?, ?, ?)',
            [ recipe_id, F('[name=malt-id]', this), F('[name=malt-amount]', this), F('[name=malt-added]', this) ]);
      }
    });
    
    // Mash
    if (!isNew)
      db.execute('DELETE FROM mash where recipe_id = ?', [ recipe_id ]);
    $('.step').each(function() {
      if (F('[name=step-name]', this)) {
        db.execute('INSERT INTO mash ( recipe_id, name, temperature, water, duration ) VALUES (?, ?, ?, ?, ?)',
            [ recipe_id, F('[name=step-name]', this), F('[name=step-temp]', this), F('#volume-mash'), F('[name=step-time]', this) ]);
      }
    });
    
    // Hops
    if (!isNew)
      db.execute('DELETE FROM hop where recipe_id = ?', [ recipe_id ]);
    var step_id = 0;
    $('.hop').each(function() {
      if (F('[name=hop-name]', this)) {
        db.execute('INSERT INTO hop ( recipe_id, name, alpha, addition, amount, boiltime ) VALUES (?, ?, ?, ?, ?, ?)',
            [ recipe_id, F('[name=hop-name]', this), F('[name=hop-alpha]', this), 0, F('[name=hop-amount]', this), F('[name=hop-boiltime]', this) ]);
      }
    });
    
    // Filter 
    if (!isNew)
      db.execute('UPDATE filter SET water_added=?, og_before_boil=?, loss=? WHERE recipe_id=?',
          [ F('#volume-filter'), F('#og-before-boil'), F('#loss-after-filter'), recipe_id ]);
    else
      db.execute('INSERT INTO filter (recipe_id, water_added, og_before_boil, loss) VALUES (?, ?, ?, ?)',
          [ recipe_id, F('#volume-filter'), F('#og-before-boil'), F('#loss-after-filter') ]);

    // Boil 
    if (!isNew)
      db.execute('UPDATE boil SET boiltime=?, evaporation=?, volume_begin_boil=?, volume_after_boil=?, loss=? WHERE recipe_id=?',
          [ F('#boiltime'), F('#evaporation'), F('#volume-before-boil'), F('#volume-after-boil'), F('#loss-after-boil'), recipe_id ]);
    else
      db.execute('INSERT INTO boil (recipe_id, boiltime, evaporation, volume_begin_boil, volume_after_boil, loss) VALUES (?, ?, ?, ?, ?, ?)',
          [ recipe_id, F('#boiltime'), F('#evaporation'), F('#volume-before-boil'), F('#volume-after-boil'), F('#loss-after-boil') ]);

    // Fermentation 
    if (!isNew)
      db.execute('UPDATE fermentation SET volume=?, og=?, yeast=?, volume_starter=?, starter_t=?, primary_date=?, primary_fg=?, primary_t=?, primary_aeration=?,secundary_date=?, secundary_fg=?, secundary_t=? WHERE recipe_id=?',
          [ F('#volume-fermenter'), F('#og'), F('#yeast'), F('#starter'), F('#starter-temp'), F('[name=start-primary]'), F('[name=fg-primary]'), F('[name=temperature-primary]'), F('[name=aeration-primary]'), F('[name=start-secundary]'), F('[name=fg-secundary]'), F('[name=temperature-secundary]'), recipe_id ]);
    else
      db.execute('INSERT INTO fermentation (recipe_id, volume, og, yeast, volume_starter, starter_t, primary_date, primary_fg, primary_t, primary_aeration, secundary_date, secundary_fg, secundary_t) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [ recipe_id,F('#volume-fermenter'), F('#og'), F('#yeast'), F('#starter'), F('#starter-temp'), F('[name=start-primary]'), F('[name=fg-primary]'), F('[name=temperature-primary]'), F('[name=aeration-primary]'), F('[name=start-secundary]'), F('[name=fg-secundary]'), F('[name=temperature-secundary]') ]);
 
    // Bottling
    if (!isNew)
      db.execute('UPDATE bottling SET bottle_date=?, volume=?, fermentable_id=?, amount=? WHERE recipe_id=?',
          [ F('#bottle-date'), F('#bottle-volume'), F('#priming-id'), F('#priming-amount'), recipe_id ]);
    else
      db.execute('INSERT INTO bottling (recipe_id, bottle_date, volume, fermentable_id, amount) VALUES (?, ?, ?, ?, ?)',
          [ recipe_id, F('#bottle-date'), F('#bottle-volume'), F('#priming-id'), F('#priming-amount') ]);

    // Judgement
    /*
    if (!isNew)
      db.execute('UPDATE judgement SET date=?, name=?, color=?, clear=?, foam=?, aroma=?, taste=?, mouthfeel=?, after=?, remark=? WHERE recipe_id=?',
          [ F('#judge-date'), F('#judge-name'), F('#judge-color'), F('#judge-clear'), F('#judge-foam'), F('#judge-aroma'), F('#judge-taste'), F('#judge-mouthfeel'), F('#judge-after'), F('#judge-remark'), recipe_id ]);
    else
      db.execute('INSERT INTO judgement (recipe_id, date, name, color, clear, foam, aroma, taste, mouthfeel, after, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [ recipe_id, F('#judge-date'), F('#judge-name'), F('#judge-color'), F('#judge-clear'), F('#judge-foam'), F('#judge-aroma'), F('#judge-taste'), F('#judge-mouthfeel'), F('#judge-after'), F('#judge-remark') ]);
    */
    
    db.execute('COMMIT');
    
    this.recipe_id = recipe_id;
    
    return recipe_id;
  },

  /**
   * Returns an array of {recipe_id, name, brew_date } objects.
   */
  list: function () {
    if (typeof db == 'undefined')
      return;

    var rs = db.execute('SELECT recipe_id, batch, name, brew_date FROM recipe ORDER BY batch desc');
    var items = new Array();
    
    while (rs.isValidRow()) {
      items.push({ recipe_id: rs.field(0), name: rs.field(1) + ". " + rs.field(2), brew_date: rs.field(3) });
      rs.next();
    }
    rs.close();
    
    return items;
  },
  
  load: function (recipe_id) {
    var rs = db.execute('SELECT * FROM recipe WHERE recipe_id = ?', [ recipe_id ]);
    if (!rs.isValidRow()) {
      alert('unknown recipe with id: ' + recipe_id);
      return;
    }
    this.clear();
    
    function d(id, dbfield, context) {
      $(id, context).val(rs.fieldByName(dbfield));
    }
    d('#name', 'name');
    d('#batch', 'batch');
    d('#style-id', 'style_id');
    d('#brew-date', 'brew_date');
    d('#planned-og', 'target_gravity');
    d('#batch-size', 'target_volume');
    d('#brewhouse-efficiency', 'efficiency');
    d('#notes', 'notes');
    var style_id = rs.fieldByName('style_id');
    rs.close();
    
    rs = db.execute('SELECT * FROM style WHERE style_id = ?', [ style_id ]);
    d('#style', 'name');
    d('#klasse', 'class');
    $('#style-og-min').text(rs.fieldByName('gravity_min'));
    $('#style-og-max').text(rs.fieldByName('gravity_max'));
    $('#style-alcohol-min').text(rs.fieldByName('alcohol_min'));
    $('#style-alcohol-max').text(rs.fieldByName('alcohol_max'));
    $('#style-attenuation-min').text(rs.fieldByName('attenuation_min'));
    $('#style-attenuation-max').text(rs.fieldByName('attenuation_max'));
    $('#style-ebc-min').text(rs.fieldByName('ebc_min'));
    $('#style-ebc-max').text(rs.fieldByName('ebc_max'));
    $('#style-ibu-min').text(rs.fieldByName('ibu_min'));
    $('#style-ibu-max').text(rs.fieldByName('ibu_max'));
    $('#style-co2g-min').text(rs.fieldByName('co2g_min'));
    $('#style-co2g-max').text(rs.fieldByName('co2g_max'));
    $('#style-co2v-min').text(rs.fieldByName('co2v_min'));
    $('#style-co2v-max').text(rs.fieldByName('co2v_max'));

    rs.close();
    
    var added = $('[name=malt-added]:first').attr('rel').split(',');
    for (n in added) {
      p = added[n].split(':');
      added[p[0]] = p[1];
    }
    rs = db.execute('SELECT * FROM recipe_fermentable LEFT JOIN fermentable ON fermentable.fermentable_id = recipe_fermentable.fermentable_id WHERE recipe_id = ?', [ recipe_id ]);
    $('.malt').each(function() {
      if (rs.isValidRow()) {
        d('[name=malt-id]', 'fermentable_id', this);
        d('[name=malt-name]', 'name', this);
        d('[name=malt-yield]', 'yield', this);
        d('[name=malt-moisture]', 'moisture', this);
        d('[name=malt-ebc]', 'ebc', this);
        d('[name=malt-amount]', 'amount', this);
        // For malt-added, also update the text displayed on the button.
        $('[name=malt-added]', this)
          .val(rs.fieldByName('added'));
        $('[name=malt-added]', this)
          .text(added[rs.fieldByName('added')]);
        rs.next();
      }
    });
    rs.close();
    
    rs = db.execute('SELECT * FROM mash WHERE recipe_id = ?', [ recipe_id ]);
    $('.step').each(function() {
      if (rs.isValidRow()) {
        d('[name=step-name]', 'name', this);
        d('[name=step-temp]', 'temperature', this);
        d('#volume-mash', 'water');
        d('[name=step-time]', 'duration', this);
        rs.next();
      }
    });
    rs.close();
    
    rs = db.execute('SELECT * FROM hop WHERE recipe_id = ?', [ recipe_id ]);
    $('.hop').each(function() {
      if (rs.isValidRow()) {
        d('[name=hop-name]', 'name', this);
        d('[name=hop-alpha]', 'alpha', this);
        d('[name=hop-amount]', 'amount', this);
        d('[name=hop-boiltime]', 'boiltime', this);
        rs.next();
      }
    });
    rs.close();
    
    // Filter 
    rs = db.execute('SELECT * FROM filter WHERE recipe_id = ?', [ recipe_id ]);
    d('#volume-filter', 'water_added');
    d('#og-before-boil', 'og_before_boil');
    d('#loss-after-filter', 'loss');
    rs.close();

    // Boil 
    rs = db.execute('SELECT * FROM boil WHERE recipe_id = ?', [ recipe_id ]);
    d('#boiltime', 'boiltime');
    d('#evaporation', 'evaporation');
    d('#volume-before-boil', 'volume_begin_boil');
    d('#volume-after-boil', 'volume_after_boil');
    d('#loss-after-boil', 'loss');
    rs.close();

    // Fermentation 
    rs = db.execute('SELECT * FROM fermentation WHERE recipe_id = ?', [ recipe_id ]);
    d('#volume-fermenter', 'volume');
    d('#og', 'og');
    d('#yeast', 'yeast');
    d('#starter', 'volume_starter');
    d('#starter-temp', 'starter_t');
    d('[name=start-primary]', 'primary_date');
    d('[name=fg-primary]', 'primary_fg');
    d('[name=temperature-primary]', 'primary_t');
    d('[name=aeration-primary]', 'primary_aeration');
    d('[name=start-secundary]', 'secundary_date');
    d('[name=fg-secundary]', 'secundary_fg');
    d('[name=temperature-secundary]', 'secundary_t');
    rs.close();

    // Bottling
    rs = db.execute('SELECT * FROM bottling LEFT JOIN fermentable ON fermentable.fermentable_id = bottling.fermentable_id WHERE recipe_id = ?', [ recipe_id ]);
    d('#bottle-date', 'bottle_date');
    d('#bottle-volume', 'volume');
    d('#priming-id', 'fermentable_id');
    d('#priming-factor', 'priming');
    d('#priming-name', 'name');
    d('#priming-amount', 'amount');
    rs.close();

    // Judgement
    /*
    rs= db.execute('SELECT * FROM judgement WHERE recipe_id = ?', [ recipe_id ]);
    d('#judge-date', 'date');
    d('#judge-name', 'name');
    d('#judge-color', 'color');
    d('#judge-clear', 'clear');
    d('#judge-foam', 'foam');
    d('#judge-aroma', 'aroma');
    d('#judge-taste', 'taste');
    d('#judge-mouthfeel', 'mouthfeel');
    d('#judge-after', 'after');
    d('#judge-remark', 'remark');
    rs.close();
    */

    $('#stamwort,#klasse,#ebc,#total-yield,#color').update();

    $('#total-amount').update();
    $('#total-percentage').update();

    $('#beslagdikte,#volume-begin-mash').update();

    $('#hop').update();
    $('.malt,.hop,.step').update();

    $('#efficiency,#bu-gu-ratio,#svg,#co2v,#priming-total,#alcohol').update();

    $('#print-notes,#print-ebc,#print-color-method,#print-bitterness,#print-bitterness-method').update();

    this.recipe_id = recipe_id;
    
    return recipe_id;
  },

  prune: function(recipe_id) {
    var tables = [ 'recipe_fermentable', 'hop', 'mash', 'filter', 'boil', 'fermentation', 'bottling', 'judgement', 'recipe' ];

    db.execute('BEGIN TRANSACTION');
    
    for (i in tables) {
      db.execute('DELETE FROM ' + tables[i]+ ' WHERE recipe_id = ?', [ recipe_id ]);
    }

    db.execute('COMMIT');
    if (this.recipe_id == recipe_id)
      this.recipe_id = undefined;
  },

  clear: function () {
    $('input,textarea').val('');
    $('.malt,.hop').update();
    this.recipe_id = undefined;
  },

  add_style_from_xml: function(style_xml) {
    db.execute('BEGIN TRANSACTION');
    
            db.execute('INSERT INTO style (class, name, description, gravity_min, gravity_max,' +
                    'alcohol_min, alcohol_max, attenuation_min, attenuation_max, ebc_min, ebc_max,' +
                    'ibu_min, ibu_max, co2g_min, co2g_max, co2v_min, co2v_max, ph_min, ph_max)' +
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [$('STYLE_LETTER', style_xml).text(), $('NAME', style_xml).text(), $('NOTES', style_xml).text(),
                     $('OG_MIN', style_xml).text(), $('OG_MAX', style_xml).text(),
                     $('ABV_MIN', style_xml).text(), $('ABV_MAX', style_xml).text(),
                     0, 0, //$('attenuation', style_xml).attr('min'), $('attenuation', style_xml).attr('max'),
                     srm_to_ebc(parseFloat($('COLOR_MIN', style_xml).text())), 
                     srm_to_ebc(parseFloat($('COLOR_MAX', style_xml).text())),
                     $('IBU_MIN', style_xml).text(), $('IBU_MAX', style_xml).text(),
                     0, 0, //$('co2g', style_xml).attr('min'), $('co2g', style_xml).attr('max'),
                     $('CARB_MIN', style_xml).text(), $('CARB_MAX', style_xml).text(),
                     0, 0 ]); //$('ph', style_xml).attr('min'), $('ph', style_xml).attr('max')
	
    var rs = db.execute('SELECT style_id FROM style WHERE rowid=?', [ db.lastInsertRowId ]);
    style_id = rs.field(0);
    rs.close();

    db.execute('COMMIT');
  }
}

// vim:sw=2:et:ai
