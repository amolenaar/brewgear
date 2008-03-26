/*
 * Import BeerXML/BrouwHulpXML/BrouwVisieXML into the model.
 *
 */
 
function load_document(file_name) {
  var doc;
  $.ajax({ url: file_name, dataType: "xml", async: false, success:
    function(xml) {
      doc = xml;
    }
  });
  return doc;
}

/**
 * Match style defined in import XML with styles defined in the database
 * Returns the style ID or undefined if none found.
 */
function match_style(style) {
  rs = db.execute('SELECT style_id FROM style WHERE name = ?', [ $('NAME', style).text() ]);
  try {
    if (rs.isValidRow()) {
      return rs.field(0);  
    }
  } finally {
    rs.close();
  }
}

function match_fermentables(fermentable) {
}

function import_xml(doc) {
  function R(q, ctx) {
    if (typeof ctx == "undefined") ctx = doc;
    var v = $(q, ctx).text();
    return parseFloat(v);
  }
  
  function tag(rtag, xmltag) {
    var v = $(xmltag, doc).text();
    $(rtag).val(v);
  }

  function ftag(rtag, xmltag, fixed) {
    var t = $(xmltag, doc).text()
    var v = parseFloat(t);
    if (isFinite(v)) {
      $(rtag).val(v.toFixed(fixed || 0));
    } else {
      $(rtag).val();
    }
  }
  
  tag('#name', "RECIPE > NAME");
  
  tag('#klasse', "RECIPE > STYLE > STYLE_LETTER");
  tag('#style', "RECIPE > STYLE > NAME");
  //tag('#style-og-min', "RECIPE > STYLE > NAME");
  //tag('#style-og-max', "RECIPE > STYLE > NAME");
  
  /*
      if (F('#style')) {
        tag("STYLE", function() {
          tag("NAME", F('#style'));
          tag("CATEGORY", "none");
          tag("VERSION", 1);
          tag("CATEGORY_NUMBER", 1);
          tag("STYLE_LETTER", F('#klasse'));
          tag("STYLE_GUIDE", "Biertypengids Derek Walsh");
          tag("TYPE", "beer");
          tag("OG_MIN", format_number(T('#style-og-min') / 1000, 3));
          tag("OG_MAX", format_number(T('#style-og-max') / 1000, 3));
          tag("FG_MIN", '1.008');
          tag("FG_MAX", '1.018');
          tag("IBU_MIN", format_number(T('#style-ibu-min')));
          tag("IBU_MAX", format_number(T('#style-ibu-max')));
          tag("COLOR_MIN", format_number(ebc_to_srm(T('#style-ebc-min'))));
          tag("COLOR_MAX", format_number(ebc_to_srm(T('#style-ebc-max'))));
          tag("CARB_MIN", format_number(ebc_to_srm(T('#style-c02v-min')), 1));
          tag("CARB_MAX", format_number(ebc_to_srm(T('#style-c02v-max')), 1));
          tag("ABV_MIN", format_number(ebc_to_srm(T('#style-alcohol-min')), 1));
          tag("ABV_MAX", format_number(ebc_to_srm(T('#style-alcohol-max')), 1));
        });
      }
  */
  ftag('#volume-before-boil', 'EQUIPMENT > BOIL_SIZE', 1);
  ftag('#batch-size', 'EQUIPMENT > BATCH_SIZE', 1);
  ftag('#loss-after-boil', 'EQUIPMENT > TRUB_CHILLER_LOSS');
  var g = R("EQUIPMENT > EVAP_RATE") / 100 * R('EQUIPMENT > BOIL_SIZE');
  $('#evaporation').val(g.toFixed(1));
  ftag('#boiltime', "EQUIPMENT > BOIL_TIME");
  ftag('#brewhouse-efficiency', "RECIPE > EFFICIENCY");
  
  /*
      tag("EQUIPMENT", function() {
        tag("NAME", "My equipment");
        tag("VERSION", "1");
        tag("BOIL_SIZE", format_number(F('#volume-before-boil'), 1));
        tag("BATCH_SIZE", format_number(F('#batch-size'), 1));
        tag("TRUB_CHILLER_LOSS", format_number(F('#loss-after-boil'), 1));
        tag("EVAP_RATE", format_number(100 * F('#evaporation') / F('#volume-before-boil'), 1));
        tag("BOIL_TIME", format_number(F('#boiltime')));
        //tag("LAUTER_DEADSPACE", "0.0");
        //write("    <TYPE_ENERGY>Propane/butane</TYPE_ENERGY>\n");
        //write("    <COST_ENERGY>2.90</COST_ENERGY>\n");
        //write("    <AMOUNT_ENERGY>1.00</AMOUNT_ENERGY>\n");
        //write("    <VOLUME_BOTTLES>0.300</VOLUME_BOTTLES>\n");
        //write("    <COST_BOTTLE>0.12</COST_BOTTLE>\n");
        //write("   <DEBIT_INSTALLATION>13.00</DEBIT_INSTALLATION>\n");
      });
      tag("BREWER", "Joe Sixpack");
      tag("BATCH_SIZE", format_number(F('#batch-size'), 1));
      tag("BOIL_SIZE", format_number(F('#volume-before-boil'), 1));
      tag("BOIL_TIME", format_number(F('#boiltime')));
      tag("EFFICIENCY", format_number(F('#brewhouse-efficiency')));
      */
      
  var hops = $('HOPS > HOP', doc);
  var mine = $('.hop');
  for (var i = 0; i < hops.length; i++) {
    var h = hops.get(i);
    var m = mine.get(i);
    $('[name=hop-name]', m).val($('NAME', h).text());
    $('[name=hop-alpha]', m).val($('ALPHA', h).text());
    var g = R('AMOUNT', h) * 1000;
    $('[name=hop-amount]', m).val(g);
    // TODO: check <USE>: Boil, Aroma, Dry Hop
    $('[name=hop-boiltime]', m).val($('TIME', h).text());
  }
      /*
      tag("HOPS", function() {
        $('.hop').each(function() {
          if (F('[name=hop-name]', this)) {
            var hop = this;
            tag("HOP", function() {
              tag("NAME", F('[name=hop-name]', hop));
              tag("VERSION", "1");
              tag("ALPHA", format_number(F('[name=hop-alpha]', hop), 1));
              tag("AMOUNT", format_number(F('[name=hop-amount]', hop) / 1000, 1));
              tag("USE", "Boil");
              tag("TIME", format_number(F('[name=hop-boiltime]', hop)));
              tag("FORM", "Leaf");
              //write("      <COST>0.00</COST>\n");
            });
          }
        });
      });
      */
      
  var ferm = $('FERMENTABLES > FERMENTABLE', doc);
  var malt = $('.malt');
  for (var i = 0; i < ferm.length; i++) {
    var f = ferm.get(i);
    var m = malt.get(i);
    $('[name=malt-name]', m).val($('NAME', f).text());
    $('[name=malt-amount]', m).val(parseInt(1000 * $('AMOUNT', f).text()));
    $('[name=malt-yield]', m).val($('YIELD', f).text());
    $('[name=malt-ebc]', m).val(srm_to_ebc(parseFloat($('COLOR', f).text())).toFixed(0));
    $('[name=malt-moisture]', m).val($('MOISTURE', f).text());
  }
      /*
      tag("FERMENTABLES", function() {
        $('.malt').each(function() {
          if (F('[name=malt-id]', this)) {
            var malt = this;
            tag("FERMENTABLE", function() {
              tag("NAME", F('[name=malt-name]', malt));
              tag("VERSION", "1");
              tag("TYPE", "Grain");
              tag("AMOUNT", (F('[name=malt-amount]', malt) / 1000));
              tag("YIELD", F('[name=malt-yield]', malt));
              tag("COLOR", ebc_to_srm(F('[name=malt-ebc]', malt)));
              tag("MOISTURE", F('[name=malt-moisture]', malt));
              //write("      <ORIGIN>Belgium</ORIGIN>\n");
              //write("      <COST>0.00</COST>\n");
            });
          }
        });
      });
      */
      
  tag('#yeast', 'YEASTS > YEAST > NAME');
  tag('#starter', 'YEASTS > YEAST > AMOUNT');
  tag('[name=starter-temp]', 'YEASTS > YEAST > TEMP');
      /*
      tag("YEASTS", function() {
        tag("YEAST", function() {
          tag("NAME", F('#yeast'));
          tag("VERSION", "1");
          tag("TYPE", "Ale");
          tag("AMOUNT", format_number(F('#starter'), 1));
          g = F('[name=starter-temp]');
          tag("TEMP", isFinite(g) ? g : 20);
        });
      });
      */
  var mash = $('MASH > MASH_STEPS > MASH_STEP', doc);
  var step = $('.step');
  for (var i = 0; i < mash.length; i++) {
    var m = mash.get(i);
    var s = step.get(i);
    $('[name=step-name]', s).val($('NAME', m).text());
    $('[name=step-temp]', s).val($('STEP_TEMP', m).text());
    $('[name=step-time]', s).val($('STEP_TIME', m).text());
    if (i == 0) {
      $('#volume-mash').val($('INFUSE_AMOUNT', m).text());
    }
  }
      /*
      tag("MASH", function() {
        tag("NAME", "My mash profile");
        tag("VERSION", "1");
        //write("    <GRAIN_TEMP>18.0</GRAIN_TEMP>\n");
        tag("MASH_STEPS", function() {
          $('.step').each(function() {
            if (F('[name=step-name]', this)) {
              var step = this;
              tag("MASH_STEP", function() {
                tag("NAME", F('[name=step-name]', step));
                tag("VERSION", "1");
                tag("TYPE", "Infusion");
                tag("INFUSE_AMOUNT", format_number(F('#volume-mash'), 1));
                tag("STEP_TEMP", format_number(F('[name=step-temp]', step), 1));
                tag("STEP_TIME", format_number(F('[name=step-time]', step)));
                //write("        <RAMP_TIME>1</RAMP_TIME>\n");
                //write("        <END_TEMP>60.0</END_TEMP>\n");
              });
            }
          });
        });
        
        tag("SPARGE_TEMP", "75.0");
      });
      */
      
  tag('#notes', "RECIPE > NOTES");

  console.log('OG', $('RECIPE > OG', doc).text());
  g = R('RECIPE > OG') * 1000;
  $('#og').val(g);

  g = R('RECIPE > FG') * 1000;
  $('#fg-secundary').val(g);

  tag('#brew-date', "RECIPE > DATE");

  tag('#priming-name', "RECIPE > PRIMING_SUGAR_NAME");
  tag('#co2v', "RECIPE > CARBONATION");
  $('[name=start-primary]').val($('PRIMARY_AGE', doc).text() + ' dagen');
  $('[name=start-secundary]').val($('SECUNDARY_AGE', doc).text() + ' dagen');
  tag('[name=fg-primary]', 'SG_END_PRIMARY');
     /*
      age = F('[name=start-secundary]') - F('[name=start-primary]');
      age /= 24*60*60*1000;
    tag("PRIMARY_AGE", (isFinite(age) ? age : 0));
      age = F('#bottle-date') - F('[name=start-secundary');
      age /= 24*60*60*1000;
      tag("SECONDARY_AGE", (isFinite(age) ? age : 0));
      tag("AGE_TEMP", "23.0");
      tag("CARBONATION_TEMP", "20.0");
     */
  g = R('RECIPE > PLANNED_OG') * 1000;
  if (!isFinite(g)) {
    g = R('RECIPE > EST_OG') * 1000;
  }
  $('#planned-og').val(g.toFixed(0));
  g = R('RECIPE > OG_BEFORE_BOIL') * 1000;
  $('#og-before-boil').val(g.toFixed(0));
  
  tag('#bottle-date', 'DATE_BOTTLING');
  tag('#bottle-volume', 'AMOUNT_BOTTLING');
  tag('#amount-priming', 'AMOUNT_PRIMING');
  
  
  /*
   * Optional tags.
   */
  g = R('RECIPE > VOLUME_FILTER');
  if (isFinite(g)) {
    $('#volume-filter').val(g);
  } else {
    $('#volume-filter').update();
  }

  tag('#volume-fermenter', 'VOLUME_FERMENTER');
  g = parseFloat($('VOLUME_FERMENTER', doc));
  if (isFinite(g)) {
    $('#volume-fermenter').val(g.toFixed(1));
  } else{
    $('#volume-fermenter').update();
  }

  g = parseFloat($('VOLUME_AFTER_BOIL', doc));
  if (isFinite(g)) {
    $('#volume-after-boil').val(g.toFixed(1));
  } else{
    $('#volume-after-boil').update();
  }
     /*
      g = F('#planned-og') / 1000;
      tag("PLANNED_OG", (isFinite(g) ? g.toFixed(3) : ''));
      tag("VOLUME_AFTER_BOIL", F('#volume-after-boil'));
      tag("VOLUME_FERMENTER", F('#volume-fermenter'));
      tag("DATE_BOTTLING", format_date(F('#bottle-date')));
      g = F('#bottle-volume');
      tag("AMOUNT_BOTTLING", (isFinite(g) ? g : ''));
      g = F('#priming-amount') / 1000;
      tag("AMOUNT_PRIMING",  (isFinite(g) ? g : ''));
  */
}