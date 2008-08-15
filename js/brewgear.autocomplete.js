/*
 * Build autocomplete boxes with database content
 */
$(function() {

  // Skip this part if Google Gears is not present
  if (!(window.openDatabase)) {
    return;
  }

  $('#style').autocomplete(function(term, callback) {
    storage.findStyles(term, function(rows) {
      var data = [];
      for (var i = 0; i < rows.length; i++) {
        var field = rows[i];
        data.push({
          value: field.name,
          style_id: field.style_id
        });
      }
      callback(data);
    });
  }, {
    matchContains: true,
    mustMatch: true,
    moreItems: false
  }); // autocomplete

  $('#style').result(function(event, style) {
    storage.loadStyle(style.style_id, function() {
      $(event.target).change();
    });
  });


  // Autocompleter for fermentables:
  $('input[name=malt-name]').autocomplete(function(term, callback) {
    storage.findFermentables(term, function(rows) {
      var data = [];
      for (var i = 0; i < rows.length; i++) {
        var field = rows[i];
        data.push({
          value: field.name,
          id: field.fermentable_id,
          name: field.name,
          category: field.category,
          yield: field.yield,
          moisture: field.moisture,
          ebc: field.ebc
        });
      }
      callback(data);
    });
  }, {
    matchContains: true,
    mustMatch: true,
    moreItems: false,
    formatItem: function(row, i, max) {
      return row.name + '<br /><span class="descr">' + row.category + ' [' + row.ebc + ' EBC]</span>';
    }
  }); // autocomplete

  // Update 
  $('input[name=malt-name]').result(function(event, fermentable) {
    var ferm = event.target.parentNode.parentNode;
    $('[name=malt-id]', ferm).val(fermentable.id);
    $('[name=malt-yield]', ferm).val(fermentable.yield);
    $('[name=malt-moisture]', ferm).val(fermentable.moisture);
    $('[name=malt-ebc]', ferm).val(fermentable.ebc);

    $('[name=malt-yield]', ferm).change();
    $('[name=malt-moisture]', ferm).change();
    $('[name=malt-ebc]', ferm).change();
    
    $(event.target).change();
  });

  $('input[name=priming-name]').autocomplete(function(term, callback) {
    storage.findPrimingFermentables(term, function(field) {
      var data = [];
      for (var i = 0; i < rows.length; i++) {
        var field = rows[i];
        data.push({
          value: field.name,
          id: field.fermentable_id,
          name: field.name,
          priming: field.priming
        });
      }
      callback(data);
    });
  }, {
    matchContains: true,
    mustMatch: true,
    moreItems: false,
    formatItem: function(row, i, max) {
      return row.name;
    }
  }); // autocomplete

  $('input[name=priming-name]').result(function(event, fermentable) {
    $('#priming-id').val(fermentable.id);
    $('#priming-factor').val(fermentable.priming);
    
    $('#priming-id').change();
    $('#priming-factor').change();
  });

  // TODO: autocomplete for hops.
});

/**
 * Fallback using simple AJAX. - initialize auto-completion
 */
$(function() {

  // Skip this part if HTML 5 storage is present
  if (window.openDatabase) {
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
