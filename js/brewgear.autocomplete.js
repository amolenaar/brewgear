/*
 * Build autocomplete boxes with database content
 */
$(function() {

  // Skip this part if Google Gears is not present
  if (!(window.google && google.gears)) {
    return;
  }

  $('#style').autocomplete(function(term) {
    var rs = db.execute('select style_id, name from style where name like ?', [ '%' + term + '%' ]);
    var data = [];
    while (rs.isValidRow()) {
      data.push({
		data: [ rs.field(1), rs.field(0) ],
		value: rs.field(1),
		result: rs.field(1)
      });
      rs.next();
    }
    rs.close();
    return data;
  }, {
    matchContains: true,
    mustMatch: true,
    moreItems: false,
    max: -1
//    formatItem: function(row, i, max) {
//      console.log(String(row));
//      return row[0];
//    },
//    formatResult: function(row) {
//      console.log(String(row));
//      return row.name;
//    }
  }); // autocomplete

  $('#style').result(function(event, style) {
    var rs = db.execute('select * from style where style_id = ?', [ style[1] ]);
    //assert rs.isValidRow();
    $('#style-id').val(rs.fieldByName('style_id'));
    $('#klasse').val(rs.fieldByName('class'));
    $('#style-og-min').text(rs.fieldByName('gravity_min'));
    $('#style-og-max').text(rs.fieldByName('gravity_max'));
    $('#style-alcohol-min').text(rs.fieldByName('alcohol_max'));
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
    $(event.target).change();
  });

    
  // Autocompleter for fermentables:
  $('input[name=malt-name]').autocomplete(function(term) {
    var rs = db.execute('select fermentable_id, name, category, ebc from fermentable where name like ? and yield is not null', [ '%' + term + '%' ]);
    var data = [];
    while (rs.isValidRow()) {
      data.push({
		data: [ rs.field(1), rs.field(0), rs.field(2), rs.field(3) ],
		value: rs.field(1),
		result: rs.field(1)
      });
      rs.next();
    }
    rs.close();
    return data;
  }, {
    matchContains: true,
    mustMatch: true,
    moreItems: false,
    max: -1,
    formatItem: function(row, i, max) {
      return row[0] + '<br /><span class="descr">' + row[2] + ' [' + row[3] + ' EBC]</span>';
    }
  }); // autocomplete

  // Update 
  $('input[name=malt-name]').result(function(event, fermentable) {
    var ferm = event.target.parentNode.parentNode;
    var rs = db.execute('select * from fermentable where fermentable_id = ?', [ fermentable[1] ]);

    $('[name=malt-id]', ferm).val(rs.fieldByName('fermentable_id'));
    $('[name=malt-yield]', ferm).val(rs.fieldByName('yield'));
    $('[name=malt-moisture]', ferm).val(rs.fieldByName('moisture'));
    $('[name=malt-ebc]', ferm).val(rs.fieldByName('ebc'));
    rs.close();

    $('[name=malt-yield]', ferm).change();
    $('[name=malt-moisture]', ferm).change();
    $('[name=malt-ebc]', ferm).change();
    
    $(event.target).change();
  });
    
  $('input[name=priming-name]').autocomplete(function(term) {
    var rs = db.execute('select fermentable_id, name, priming from fermentable where name like ? and priming is not null', [ '%' + term + '%' ]);
    var data = [];
    while (rs.isValidRow()) {
      data.push({
		data: [ rs.field(1), rs.field(0), rs.field(2) ],
		value: rs.field(1),
		result: rs.field(1)
      });
      rs.next();
    }
    rs.close();
    return data;
  }, {
    matchContains: true,
    mustMatch: true,
    moreItems: false,
    max: -1,
    formatItem: function(row, i, max) {
      return row[0];
    }
  }); // autocomplete

  $('input[name=priming-name]').result(function(event, fermentable) {
    $('#priming-id').val(fermentable[1]);
    $('#priming-factor').val(fermentable[2]);
    $('#priming-id').change();
    $('#priming-factor').change();
  });

  // TODO: autocomplete for hops.
});

/**
 * Fallback using simple AJAX. - initialize auto-completion
 */
$(function() {

  // Skip this part if Google Gears is not present
  if (window.google && google.gears) {
    return;
  }
    
  $.ajax({ url: "data/beerstyles.xml", dataType: "xml", async: false, success:
    function(xml) {
      // xml is a Document
      var styles = [];
      
      $('class', xml).each(function() {
        tag = $(this).attr('tag');
        $('beerstyle', this).each(function() {
          styles.push({
            klasse: tag,
            name: $('name', this).text(),
            description: $('description', this).text(),
            gravity: [ parseFloat($('gravity', this).attr('min')),
                       parseFloat($('gravity', this).attr('max')) ],
            alcohol: [ parseFloat($('alcohol', this).attr('min')),
                       parseFloat($('alcohol', this).attr('max')) ],
            attenuation: [ parseFloat($('attenuation', this).attr('min')),
                           parseFloat($('attenuation', this).attr('max')) ],
            ebc: [ parseFloat($('ebc', this).attr('min')),
                   parseFloat($('ebc', this).attr('max')) ],
            ibu: [ parseFloat($('ibu', this).attr('min')),
                    parseFloat($('ibu', this).attr('max')) ],
            co2g: [ parseFloat($('co2g', this).attr('min')),
                    parseFloat($('co2g', this).attr('max')) ],
            co2v: [ parseFloat($('co2v', this).attr('min')),
                    parseFloat($('co2v', this).attr('max')) ],
            ph: [ parseFloat($('ph', this).attr('min')),
                  parseFloat($('ph', this).attr('max')) ]
            });
        });
      }); // class
      
      $('#style').autocomplete(styles, {
        matchContains: true,
        moreItems: false,
        mustMatch: true,
        max: -1,
        formatItem: function(row, i, max) {
          return row.name;
        },
        formatResult: function(row) {
          return row.name;
        }
      }); // autocomplete

    }
  }); // ajax()

  $('#style').result(function(event, style) {
    $('#klasse').val(style.klasse);
    $('#style-og-min').text(style.gravity[0]);
    $('#style-og-max').text(style.gravity[1]);
    $('#style-alcohol-min').text(style.alcohol[0]);
    $('#style-alcohol-max').text(style.alcohol[1]);
    $('#style-attenuation-min').text(style.attenuation[0]);
    $('#style-attenuation-max').text(style.attenuation[1]);
    $('#style-ebc-min').text(style.ebc[0]);
    $('#style-ebc-max').text(style.ebc[1]);
    $('#style-ibu-min').text(style.ibu[0]);
    $('#style-ibu-max').text(style.ibu[1]);
    $('#style-co2g-min').text(style.co2g[0]);
    $('#style-co2g-max').text(style.co2g[1]);
    $('#style-co2v-min').text(style.co2v[0]);
    $('#style-co2v-max').text(style.co2v[1]);
    $(event.target).change();
  });


  $.ajax({ url: "data/fermentables.xml", dataType: "xml", async: false, success:
    function(xml) {
      // xml is a Document
      var fermentables = [];

      $('category', xml).each(function() {
        var category = $(this).attr('name');
        $('product', this).each(function() {
          fermentables.push({
            category: category,
            name: $('name', this).text(),
            yield: parseFloat($('yield', this).text()),
            moisture: parseFloat($('moisture', this).text()),
            ebc: parseFloat($('ebc', this).text())
            });
        }); // product
      }); // category

      $('input[name=malt-name]').autocomplete(fermentables, {
        matchContains: true,
        moreItems: false,
        max: -1,
        formatItem: function(row, i, max) {
          return row.name + '<br /><span class="descr">' + row.category + ' [' + row.ebc + ' EBC]</span>';
        },
        formatResult: function(row) {
          return row.name;
        }
      }); // autocomplete

      $('#priming-name').autocomplete(fermentables, {
        matchContains: true,
        moreItems: false,
        mustMatch: true,
        max: -1,
        formatItem: function(row, i, max) {
          return row.name;
        },
        formatResult: function(row) {
          return row.name;
        }
      }); // autocomplete

    }
  }); // ajax()

  // Update 
  $('input[name=malt-name]').result(function(event, fermentable) {
    var ferm = event.target.parentNode.parentNode;
    $('[name=malt-id]', ferm).val(-1);
    $('[name=malt-yield]', ferm).val(fermentable.yield);
    $('[name=malt-moisture]', ferm).val(fermentable.moisture);
    $('[name=malt-ebc]', ferm).val(fermentable.ebc);

    $('[name=malt-yield]', ferm).change();
    $('[name=malt-moisture]', ferm).change();
    $('[name=malt-ebc]', ferm).change();
    
    $(event.target).change();
  });

  $('input[name=priming-name]').result(function(event, fermentable) {
    $('#priming-id').val(-1);
  });

}); // (data loading)
