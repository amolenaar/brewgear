/**
 * BrewGear - Google Gears based beer recipe tool.
 */

function set_status(msg) {
  $('#statusbar').text(msg);
  window.setTimeout(function() {
    $('#statusbar').text('');
  }, 15000);
}

$(function() {

  // Fix padding for FireFox
  if ($.browser.mozilla) {
    $('.multistate').css('padding', '0 3px');
  }

  if (window.openDatabase) {
    $('#no-database').css('display', 'none');
  }

  if (!db) {
    $('#load,#save,#copy').disable();
  }
  
  /*
   * Fill in some defaults.
   */
  $('#loss-after-filter,#loss-after-boil').val(0);
  $('#boiltime').val(60);
  $('#evaporation').val(4);

  /* Provide a default mash volume, so hop calculations
   * and stuff works out of the box.
   */
  $('#batch-size').change(function() {
   if (!$('#volume-mash').field()) {
     $('#volume-mash').val($(this).val());
   }
  });
  
  /*
   * Generic
   */

  $('.multistate').multistate();

  $('#s_style,#s_menu').easydrag();

  $('#s_style>h2,#s_menu>h2').dblclick(function() {
    $('>*:gt(0)', $(this).parent()).slideToggle('slow');
  });
  
  /*
   * General
   */
  $('#stamwort').update(function() {
    $('#stamwort').val(Math.round(sg_to_plato($('#planned-og').field())));
  }).observe('#planned-og');

  $('#total-yield').update(function() {
    var og = $('#planned-og').field();
    var volume = $('#batch-size').field();
    $(this).val(Math.round(total_yield(og, volume)));
  }).observe('#planned-og,#batch-size');
  
  $('#print-ebc').update(function() {
    $(this).val($('#ebc').val());
  }).observe('#ebc');
  
  $('#print-color-method').update(function() {
    $(this).text($('#color-method').text());
  }).observe('#color-method');
  
  $('#print-bitterness').update(function() {
    $(this).val($('#total-bitterness').val());
  }).observe('#total-bitterness,#hop');
  
  $('#print-bitterness-method').update(function() {
    $(this).text($('#bitterness-method').text());
  }).observe('#bitterness-method');
  
  /*
   * Fermentables and color
   */

  var color_method = color_daniels;
  $('[name=color-method]').change(function() {
    color_method = eval('color_' + $(this).val());
    storage.setProperty('color-method', $(this).val());
  });
  
  try {
    storage.getProperty('color-method', null, function(m) {
      if (m) {
        $('#color-method').multistate(m);
        color_method = eval('color_' + m);
        $('#print-color-method').update();
      }
    });
  } catch (e) {
  }
  
  // Calculate color impact for each fermentable
  $('#ebc').update(function() {
    var total_impact = 0;
    var volume = $('#batch-size').field();
    
    $('.malt').each(function() {
      var amount = $('input[name=malt-amount]', this).field();
      var ebc = $('input[name=malt-ebc]', this).field();
      var e = color_impact(amount, ebc, volume);
      if (isFinite(e)) {
        total_impact += e;
      }
    });
    var color_ebc = color_method(total_impact);
    $(this).val(Math.round(color_ebc));
  }).observe('#batch-size,input[name=malt-amount],input[name=malt-ebc],[name=color-method]');

  $('#color').update(function() {
    var colormap = EBC_TO_RGB; // from data/ebc2rgb.js
    ebc = parseFloat($('#ebc').val());
    if (!isFinite(ebc)) {
      $(this).css('background-color', 'transparent');
      return;
    }
    var rgb = colormap[0];

    for(c in colormap) {
      if (colormap[c][0] > ebc) {
        break;
      }
      rgb = colormap[c];
    }
    $(this).css('background-color', 'rgb(' + rgb[1] + ',' + rgb[2] + ',' + rgb[3] + ')'); // .css('opacity', rgb[4] / 255.);
  }).observe('#ebc');


  // Entring data on percentage or amount is mutally exclusive.
  var input_lock = 0;

  // Cache for the malt table. Key: .malt entry. Cached values are already jQuery objects.
  
  var malt_table = [];
  $('.malt').each(function() {
    malt_table.push({
      yield: $('[name=malt-yield]', this), 
      moisture: $('[name=malt-moisture]', this),
      ebc: $('[name=malt-ebc]', this),
      amount: $('[name=malt-amount]', this),
      percentage: $('[name=malt-percentage]', this),
      added: $('[name=malt-added]', this)
    });
  });

  
  /****
  Updating of malts
  =================
  Malt can be updated in two ways:
  1. By changing a percentage
  2. By changing an amount
  
  When external factors change (such as batch size (total-yield) and BHE) the percentages
  remain intacts and the amounts are changed.
  When an amount is changed. The total-yield (and planned-og) are changed.
   ****/

  // Calculate total percentage
  $('#total-percentage').update(function () {
    total_per = 0;
    $(malt_table).each(function() {
      var p = this.percentage.field();
      if (isFinite(p)) {
        total_per += p;
      }
    });
    $(this).val(total_per.toFixed(1));
  }).observe('[name=malt-percentage]');

/*
  // Divide yield in amounts for mash, boil and fermentation.
  $('#mash-yield').update(function() {
    var total_yield = $('#total-yield').field();
    
    // BHE is only used to calculate the mash factor.
    var bhe = $('#brewhouse-efficiency').field() / 100.0;
    var factor_mash = 0, factor_boil = 0, factor_ferm = 0;
    $(malt_table).each(function() {
      var e = (this.yield.field() / 100) * 
              ((100 - this.moisture.field()) / 100) * 
              (this.percentage.field() / 100);
      if (isFinite(e)) {
        var added = this.added.val();
        if (added == 'mash') { factor_mash += e * bhe;
        } else if (added == 'boil') { factor_boil += e;
        } else if (added == 'ferm') { factor_ferm += e;
        }
      }
    });
    var factor = factor_mash + factor_boil + factor_ferm;
    $('#mash-yield').val(Math.round(total_yield * (factor_mash / factor)));
    $('#boil-yield').val(Math.round(total_yield * (factor_boil / factor)));
    $('#ferm-yield').val(Math.round(total_yield * (factor_ferm / factor)));
  }).observe('#total-yield,#brewhouse-efficiency,[name=malt-yield],[name=malt-moisture],[name=malt-percentage],[name=malt-added]');
*/

  $('#malt').update(function () {
    var total_yield = $('#total-yield').field();
    // BHE is only used to calculate the mash factor.
    var bhe = $('#brewhouse-efficiency').field() / 100.0;
    var factor_mash = 0, factor_boil = 0, factor_ferm = 0;
    $(malt_table).each(function() {
      var e = (this.yield.field() / 100) * 
              ((100 - this.moisture.field()) / 100) * 
              (this.percentage.field() / 100);
      if (isFinite(e)) {
        var added = this.added.val();
        if (added == 'mash') { factor_mash += e * bhe;
        } else if (added == 'boil') { factor_boil += e;
        } else if (added == 'ferm') { factor_ferm += e;
        }
      }
    });
    var factor = factor_mash + factor_boil + factor_ferm;
    $('#mash-yield').val(Math.round(total_yield * (factor_mash / factor)));
    $('#boil-yield').val(Math.round(total_yield * (factor_boil / factor)));
    $('#ferm-yield').val(Math.round(total_yield * (factor_ferm / factor)));

    var total_amount = Math.round(total_yield / factor);
    var total_mash = 0, total_boil = 0, total_ferm = 0;

    // update amounts
    $(malt_table).each(function() {
      var m = Math.round(total_amount * (this.percentage.field() / 100));
      if (isFinite(m)) {
        this.amount.val(m);
        var added = this.added.val();
        if (added == 'mash') { total_mash += m;
        } else if (added == 'boil') { total_boil += m;
        } else if (added == 'ferm') { total_ferm += m;
        }
      } else {
        this.amount.val('');
      }
    });

    $('#mash-amount').val(total_mash);
    $('#boil-amount').val(total_boil);
    $('#ferm-amount').val(total_ferm);
    $('#total-amount').val(isFinite(total_amount) ? total_amount : '');

  }).observe('#brewhouse-efficiency,#total-yield,input[name=malt-yield],input[name=malt-moisture],input[name=malt-percentage],button[name=malt-added]')
  
  $('#malt').change(function () {
    if (input_lock > 0) { return; }
    input_lock++;
    $('#mash-yield').change();
    $('#boil-yield').change();
    $('#ferm-yield').change();

    $('#mash-amount').change();
    $('#boil-amount').change();
    $('#ferm-amount').change();
    $('#total-amount').change();

    // Does not cause deadlock due to input_lock.
    $('[name=malt-amount]', this.parentNode.parentNode).change();

    input_lock--;
  }); // >#malt


  // If you fill in the amount, everything works the other way around:
  // NOTE: malt-amount stored in the db, not the precentage.
  $('#total-amount').update(function () {
    var total_amount = 0;
    var total_mash = 0, total_boil = 0, total_ferm = 0;

    $(malt_table).each(function() {
      var a = this.amount.field();
      if (isFinite(a)) {
        total_amount += a;
        var added = this.added.val();
        if (added == 'mash') { total_mash += a;
        } else if (added == 'boil') { total_boil += a;
        } else if (added == 'ferm') { total_ferm += a;
        }
      }
    });

    // Update percentages. Use two decimal precision.
    $(malt_table).each(function() {
      var a = this.amount.field();
      if (isFinite(a)) {
        this.percentage.val(((a / total_amount) * 100).toFixed(2));
      }
    });
    
    $('#mash-amount').val(total_mash);
    $('#boil-amount').val(total_boil);
    $('#ferm-amount').val(total_ferm);
    $('#total-amount').val(isFinite(total_amount) ? total_amount : '');

    var bhe = $('#brewhouse-efficiency').field() / 100;
    var factor_mash = 0, factor_boil = 0, factor_ferm = 0;
    $(malt_table).each(function() {
      var e = (this.yield.field() / 100) * 
              ((100 - this.moisture.field()) / 100) * 
              (this.percentage.field() / 100);
      if (isFinite(e)) {
        var added = this.added.val();
        if (added == 'mash') { factor_mash += e * bhe;
        } else if (added == 'boil') { factor_boil += e;
        } else if (added == 'ferm') { factor_ferm += e;
        }
      }
    });
    var total_yield = Math.round(total_amount * (factor_mash + factor_boil + factor_ferm));
    var volume = $('#batch-size').val();

    $('#mash-yield').val(Math.round(total_amount * factor_mash));
    $('#boil-yield').val(Math.round(total_amount * factor_boil));
    $('#ferm-yield').val(Math.round(total_amount * factor_ferm));
    $('#total-yield').val(total_yield);
    $('#planned-og').val(Math.round(total_og(total_yield, volume)));
  });

  $('input[name=malt-amount]').change(function () {
    if (input_lock > 0) { return; }
    input_lock++;

    $(this).queue_for_update();

    $('#total-amount,#total-percentage').update();

    // Send change notifications after all values are set:
    $('#mash-yield').change();
    $('#boil-yield').change();
    $('#ferm-yield').change();
    $('#total-yield').change();
    $('#mash-amount').change();
    $('#boil-amount').change();
    $('#ferm-amount').change();
    $('#total-amount').change();
    $('#planned-og').change();
    // Does not cause deadlock due to input_lock.
    $('[name=malt-percentage]').change();

    input_lock--;
  }); // >malt-amount


  $('.malt a.delete').click(function() {
    var malt = this.parentNode.parentNode;
    $('input', malt).val('').change();
    //$('input[name=malt-percentage]', malt).change();
    //$(malt).queue_for_update();
    $(malt).change();
  }).removeAttr('href');


  /*
   * Mash
   */
   
  $('.step a.delete').click(function() {
    var step = this.parentNode.parentNode;
    $('input', step).val('').change();
    $(step).change();
  }).removeAttr('href');


  $('#beslagdikte').update(function() {
    $(this).val(($('#volume-mash').field() / ($('#mash-amount').field() / 1000.0)).toFixed(2));
  }).observe('#mash-amount,#volume-mash');

  $('#volume-begin-mash').update(function() {
    $(this).val(($('#volume-mash').field() + $('#mash-amount').field() * 0.000668).toFixed(1));
  }).observe('#mash-amount,#volume-mash');
  
  
  /*
   * Filter
   */

  $('#volume-filter').update(function() {
    var wort_after_filter = ($('#volume-before-boil').field() + ($('#loss-after-filter').field() || 0)) * 0.97;
    $('#volume-filter').val((wort_after_filter - 0.97 * ($('#volume-mash').field() - 0.00102 * $('#mash-amount').field())).toFixed(1));
  }).observe('#volume-before-boil,#loss-after-filter,#volume-mash,#mash-amount');

  $('#og-before-boil').update(function() {
    var brix = $('#mash-yield').field() / ($('#volume-before-boil').field() * 0.94) / 10;
    $(this).val(Math.round(brix_to_sg(brix)));
  }).observe('#mash-yield,#volume-before-boil');

  $('#efficiency').update(function() {
    // official: (volume (l) * extract (g/dl)) / grits (kg) (* 70%)
    // We compare the total yield with the actual yield
    // the potential extract is mash-yield / (bhe / 100);
    var potential = $('#mash-yield').field() / ($('#brewhouse-efficiency').field() / 100);
    // total extract (g)
    var extract = sg_to_plato($('#og-before-boil').field()) * 10 * $('#volume-before-boil').field();
    var e = (extract / potential) * 100;
    $(this).val(isFinite(e) ? Math.round(e) : '');
  }).observe('#mash-yield,#volume-before-boil,#og-before-boil,#brewhouse-efficiency');


  /*
   * Boil
   */

  $('#volume-after-boil').update(function() {
    $(this).val(($('#batch-size').field() / 0.94 + ($('#loss-after-boil').field() || 0)).toFixed(1));
  }).observe('#batch-size,#loss-after-boil');

  $('#volume-before-boil').update(function() {
    $(this).val($('#volume-after-boil').field() + ($('#boiltime').field() || 0) / 60.0 * ($('#evaporation').field() || 0).toFixed(1));
  }).observe('#volume-after-boil,#boiltime,#evaporation');

  $('#volume-fermenter').update(function() {
    $(this).val(($('#volume-after-boil').field() * 0.94 - ($('#loss-after-boil').field() || 0)).toFixed(1));
  }).observe('#volume-after-boil,#loss-after-boil');

  $('#og').update(function() {
    var brix = $('#boil-yield').field() / ($('#volume-after-boil').field() * 0.94) / 10;
    var boil_sg = brix_to_sg(brix);
    $(this).val(Math.round((($('#og-before-boil').field() - 1000) * $('#volume-before-boil').field()) / $('#volume-after-boil').field() + boil_sg));
  }).observe('#volume-before-boil,#volume-after-boil,#og-before-boil,#boil-yield');

  /*
   * Hops
   */

  $('#hop').update(function() {
    $('.hop', this).update();
    $('#total-bitterness').update();
  }).observe('#volume-after-boil,#og-before-boil,[name=bitterness-method]');

  $('#hop').change(function() {
    $(this).update();
    $('#total-bitterness').change();
  });

  var bitterness_method = bitterness_tinseth;
  $('[name=bitterness-method]').change(function() {
    bitterness_method = eval('bitterness_' + $(this).val());
    storage.setProperty('bitterness-method', $(this).val());
    $('#hop').change();
  });
  
  try {
    storage.getProperty('bitterness-method', null, function(m) {
      if (m) {
        $('#bitterness-method').multistate(m);
        bitterness_method = eval('bitterness_' + m);
        $('#print-bitterness-method').update();
      }
    });
  } catch (e) {
  }
  

  // update individual hop records (called from #hop)
  $('.hop').update(function() {
    alpha = $('input[name=hop-alpha]', this).val();
    
    amount = $('input[name=hop-amount]', this).val();
    boiltime = $('input[name=hop-boiltime]', this).val();
    volume = $('#volume-after-boil').field() * 0.96;
    og = $('#og-before-boil').val();
    
    var bitterness = bitterness_method(amount, 
            { alpha: alpha,
              utilization: boiltime_to_utilization(boiltime) },
              boiltime, volume, og);
    if (bitterness > 0) {
      $('input[name=hop-bitterness]', this).val(Math.round(bitterness));
    } else {
      $('input[name=hop-bitterness]', this).val('');
    }
  }); // .hop

  // update total hop bitterness (called from #hop)
  $('#total-bitterness').update(function() {
    var bitterness = 0;
    $('input[name=hop-bitterness]').each(function() {
      var b = $(this).field();
      if (isFinite(b)) {
        bitterness += b;
      }
    });
    $(this).val(bitterness);
  }); // #total-bitterness


  $('.hop a.delete').click(function() {
    var hop = this.parentNode.parentNode;
    $('input', hop).val('').change();
//    $(hop).queue_for_update();
//    $(hop).change();
  }).removeAttr('href');


  $('#bu-gu-ratio').update(function() {
    var og = $('#og').field();
    if (!isFinite(og)) {
      og = $('#planned-og').field();
    }
    var bu_gu = bu_gu_ratio($('#total-bitterness').field(), og);
    $(this).val(isFinite(bu_gu) ? bu_gu.toFixed(2) : '');
  }).observe('#total-bitterness,#planned-og,#og');

  /*
   * Fermentation
   */

  $('#svg').update(function() {
    var og = $('#og').field();
    // Add fermentables added during fermentation:
    var brix = $('#ferm-yield').field() / $('#volume-fermenter').field() / 10;
    og += Math.round(brix_to_sg(brix)) - 1000;
    var fg = $('#fg-secundary').field();
    var svg = Math.round( 100 * (og - fg) / (og - 1000));
    $(this).val(isFinite(svg) ? svg : '');
  }).observe('#og,#ferm-yield,#volume-fermenter,#fg-secundary,#priming-amount');
  
  $('#alcohol').update(function() {
    var og = $('#og').field();
    var brix = $('#ferm-yield').field() / $('#volume-fermenter').field() / 10;
    og += Math.round(brix_to_sg(brix)) - 1000;
    var fg = $('#fg-secundary').field();
    var priming = $('#priming-amount').field() || 0;
    var factor = $('#priming-factor').field() || 1;
    /*  1.00 // suiker
	0.95 // dextrose
	0.95 // glucose
	0.58 // moutextract
	0.56 // honing
	0.26 // molasse
     */
    var alc = (abv(og, fg) + (priming * 0.06 * factor)).toFixed(1);
    $(this).val(isFinite(alc) ? alc : '');
  }).observe('#og,#ferm-yield,#volume-fermenter,#fg-secundary,#priming-amount,#priming-factor');

  /*
   * Bottling
   */

  $('#priming-factor').change(function() {
    $('#priming-amount,#alcohol').queue_for_update();
    $('#priming-total').change()
  });
  
  $('#priming-amount').update(function() {
    var factor = $('#priming-factor').field() || 1;
    var sugar = co2_volume_to_sugar($('#co2v').field()) / factor;
    $(this).val(isFinite(sugar) ? sugar.toFixed(1) : '');
  }).observe('#co2v').change(function() {
    $('#co2v').queue_for_update();
  });
  
  $('#co2v').update(function() {
    var factor = $('#priming-factor').field() || 1;
    var co2 = sugar_to_co2_volume($('#priming-amount').field()) / factor;
    $(this).val(isFinite(co2) ? co2.toFixed(1) : '');
  });

  $('#priming-total').update(function () {
    var t = $('#priming-amount').field() * $('#bottle-volume').field();
    $(this).text(isFinite(t) ? t.toFixed(0) : '');
  }).observe('#priming-amount,#bottle-volume');
  
  $('#print-notes').update(function() {
    var parts = $('#notes').val().split(/\n\n/);
    $(this).empty();
    for(var i in parts) {
      var p = $.escape(parts[i]);
      $(this).append('<p>' + p + '</p>');
    }
  }).observe('#notes');
  
  /*
   * Usability: Input checks 
   */

  $('input.number').change(function() {
    var v = $(this).val();
    if (v === null || v === '') { return; }
    var x = parseInt(v);
    if (!isFinite(x)) {
      $(this).addClass('nfe');
    } else {
      $(this).removeClass('nfe');
    }
  });
 
  $('input.real').change(function() {
    var v = $(this).val();
    if (v === null || v === '') { return; }
    var x = parseFloat(v);
    if (!isFinite(x)) {
      $(this).addClass('nfe');
    } else {
      $(this).removeClass('nfe');
    }
  });
  
  $('input.date').change(function() {
  });

  /*
   * Interactive UI behaviour
   */
   
  $('.malt').update(function () {
    if ($('[name=malt-name]', this).val()) {
      $(this).removeClass('emptyrow');
    } else {
      $(this).addClass('emptyrow');
    }
  }).observe('[name=malt-name]');

  $('.hop').update(function () {
    if ($('[name=hop-name]', this).val()) {
      $(this).removeClass('emptyrow');
    } else {
      $(this).addClass('emptyrow');
    }
  }).observe('[name=hop-name]');
  
  $('.step').update(function () {
    if ($('[name=step-name]', this).val()) {
      $(this).removeClass('emptyrow');
    } else {
      $(this).addClass('emptyrow');
    }
  }).observe('[name=step-name]');
  
  $('.malt,.hop,.step').update();
  $('.malt input').val('');
  
  
  var changed = false;
  function set_changed() {
    if (!changed) {
      changed = true;
      $('#recipe').addClass('changed');
    }
  };
  $('input').change(set_changed);

  function set_unchanged() {
    changed = false;
    $('#recipe').removeClass('changed');
  }

  $('input').dblclick(function() {
    $(this).toggleClass('locked');
  });

  /*
   * Dialog windows, Mac style.
   */

  var current_recipe_id;
  
  $('.dialog').hide();

  $('#load').click(function() {
    var fileselect = $('#filedialog select');
    fileselect.empty();
    fileselect.append('<option value="">laden...</option>');

    $('#filedialog').showDialog(function() {
      storage.list(function(items) {
        fileselect.empty();
        $(items).each(function() {
          fileselect.append('<option value="' + this.recipe_id + '"' + 
            '>' + this.name + ' (' + this.brew_date + ')</option>');
        });
        $('option:first', fileselect).attr('selected', 'selected');
      });
    });
    
  });

  load_callback = function(recipe_id) {
    set_status('Recept geladen');
    set_unchanged();
    $('#filedialog').hideDialog();
    storage.after_load();
    current_recipe_id = recipe_id;
  }
  
  $('#filedialog button[name=open]').click(function() {
    storage.load($('#filedialog select').val(), load_callback);
  });

  $('#filedialog select').dblclick(function() {
    storage.load($(this).val(), load_callback);
  });

  $('#filedialog button[name=delete]').click(function() {
    if (confirm("Are you sure?")) {
      var s = $('#filedialog select');
      var recipe_id = s.val();
      storage.prune(recipe_id, function() {
        $('option[value=' + recipe_id + ']', s).remove();
      });
    }
  });

  $('#filedialog button[name=close]').click(function() {
    $('#filedialog').hideDialog();
  });


  $('#save').click(function() {
    var msg = 'Opgeslagen als nieuw recept';
    if (current_recipe_id) {
      msg = 'Recept bijgewerkt';
    }
    storage.save(current_recipe_id, function(recipe_id) {
      set_status(msg + ' (' + recipe_id + ')');
      set_unchanged();
      current_recipe_id = recipe_id;
    });
  });

  $('#copy').click(function() {
    storage.saveNew(function(recipe_id) {
      set_status('Recept opgeslagen als kopie (' + current_recipe_id + ')');
      set_unchanged();
      current_recipe_id = recipe_id;
    });
  });


  $('#import').click(function() {
    $('#importdialog').showDialog();
  });

  $('#importdialog button[name=import]').click(function() {
    var file_name = $('#importfile').val();
    var doc;
    
    // Step 1: import file
    if (!file_name) {
      return;
    }
    doc = load_document(file_name);
    
    storage.clear();
    
    // Step 2: import type and check with styles
    // Step 3: import FERMENTABLES and compare with malts in fermentable table
    // Step 4: change fermentables/import
    // Step 5: import recipe
    import_xml(doc);
    storage.after_load();
    $('#importdialog').hideDialog();
  });

  $('#importdialog button[name=close]').click(function() {
    $('#importdialog').hideDialog();
  });


  $('#print').click(function() {
    window.print();
  });


  $('#export').click(function() {
    var textarea = $('#exportdialog textarea');
    textarea.val("momentje...");
    $('#exportdialog').showDialog(function() {
      var exp = '';
      export_xml(function (txt) {
        exp += txt;
      });
      textarea.val(exp);
    });
  });

  $('#exportdialog button[name=close]').click(function() {
    $('#exportdialog').hideDialog();
  });


  $('#clear').click(function() {
    storage.clear();
    set_unchanged();
    current_recipe_id = undefined;
    $('#name').focus();
  });


  // Everything is loaded, hide the spinner.
  // (use visibility, so images are loaded)
  $('#spinner').css('display', 'none');
});

// vim:sw=2:et:ai
