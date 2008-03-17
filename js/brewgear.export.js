/**
 * Standard method to export BrewGear data as BeerXML/BrouwHulpXML
 */

function export_xml_to_new_window() {
  win = window.open('newfile'); //$('#name').val() + ".xml");
  doc = win.document;
  doc.open("text/plain");
  export_xml(function(txt) {
    doc.write(txt);
  });
}

function export_xml(write) {
  function F(q, context) {
    return $(q, context).field();
  }
  function date_format(d) {
    var date = '' + d.getDate();
    if (date.length < 2) { date = '0' + date; }
    var month = '' + (d.getMonth() + 1);
    if (month.length < 2) { month = '0' + month; }
    
    return date + '-' + month + '-' + (d.getYear() + 1900);
  }
  
  write("<?xml version='1.0' encoding='UTF-8'?>\n");
  write("<?xml-stylesheet type='text/xsl' href='brouwhulp.xsl'?>\n");
  write("<RECIPES>\n");
  write(" <RECIPE>\n");
  write("  <NAME>" + F('#name') + "</NAME>\n");
  write("  <VERSION>1</VERSION>\n");
  write("  <TYPE>All Grain</TYPE>\n");
  write("  <STYLE>\n");
  write("   <NAME>" + F('#style') + "</NAME>\n");
  write("   <CATEGORY>none</CATEGORY>\n");
  write("   <VERSION>1</VERSION>\n");
  write("   <CATEGORY_NUMBER>1</CATEGORY_NUMBER>\n");
  write("   <STYLE_LETTER>" + F('#klasse') + "</STYLE_LETTER>\n");
  write("   <STYLE_GUIDE>Biertypengids Derek Walsh</STYLE_GUIDE>\n");
  write("   <TYPE>beer</TYPE>\n");
  write("   <OG_MIN>1.065</OG_MIN>\n");
  write("   <OG_MAX>1.080</OG_MAX>\n");
  write("   <FG_MIN>1.008</FG_MIN>\n");
  write("   <FG_MAX>1.018</FG_MAX>\n");
  write("   <IBU_MIN>15</IBU_MIN>\n");
  write("   <IBU_MAX>40</IBU_MAX>\n");
  write("   <COLOR_MIN>4</COLOR_MIN>\n");
  write("   <COLOR_MAX>0</COLOR_MAX>\n");
  write("   <CARB_MIN>2.8</CARB_MIN>\n");
  write("   <CARB_MAX>4.1</CARB_MAX>\n");
  write("   <ABV_MIN>7.5</ABV_MIN>\n");
  write("   <ABV_MAX>9.5</ABV_MAX>\n");
  write("  </STYLE>\n");
  write("  <EQUIPMENT>\n");
  write("    <NAME>My equipment</NAME>\n");
  write("    <VERSION>1</VERSION>\n");
  write("    <BOIL_SIZE>" + F('#volume-before-boil') + "</BOIL_SIZE>\n");
  write("    <BATCH_SIZE>" + F('#batch-size') + "</BATCH_SIZE>\n");
  write("    <TRUB_CHILLER_LOSS>" + F('#loss-after-boil') + "</TRUB_CHILLER_LOSS>\n");
  write("    <EVAP_RATE>" + 3 + "</EVAP_RATE>\n");
  write("    <BOIL_TIME>" + F('#boiltime') + "</BOIL_TIME>\n");
  write("    <LAUTER_DEADSPACE>0.0</LAUTER_DEADSPACE>\n");
  //write("    <TYPE_ENERGY>Propane/butane</TYPE_ENERGY>\n");
  //write("    <COST_ENERGY>2.90</COST_ENERGY>\n");
  //write("    <AMOUNT_ENERGY>1.00</AMOUNT_ENERGY>\n");
  //write("    <VOLUME_BOTTLES>0.300</VOLUME_BOTTLES>\n");
  //write("    <COST_BOTTLE>0.12</COST_BOTTLE>\n");
  //write("   <DEBIT_INSTALLATION>13.00</DEBIT_INSTALLATION>\n");
  write("  </EQUIPMENT>\n");
  write("  <BREWER>Joe Sixpack</BREWER>\n");
  write("  <BATCH_SIZE>" + F('#batch-size') + "</BATCH_SIZE>\n");
  write("  <BOIL_SIZE>" + F('#volume-before-boil') + "</BOIL_SIZE>\n");
  write("  <BOIL_TIME>" + F('#boiltime') + "</BOIL_TIME>\n");
  write("  <EFFICIENCY>" + F('#brewhouse-efficiency') + "</EFFICIENCY>\n");
  write("  <HOPS>\n");
  $('.hop').each(function() {
    if (F('[name=hop-name]', this)) {
      write("    <HOP>\n");
      write("      <NAME>" + F('[name=hop-name]', this) + "</NAME>\n");
      write("      <VERSION>1</VERSION>\n");
      write("      <ALPHA>" + F('[name=hop-alpha]', this) + "</ALPHA>\n");
      write("      <AMOUNT>" + (F('[name=hop-amount]', this) / 1000) + "</AMOUNT>\n");
      write("      <USE>Boil</USE>\n");
      write("      <TIME>" + F('[name=hop-boiltime]', this) + "</TIME>\n");
      write("      <FORM>Pellet</FORM>\n");
      //write("      <COST>0.00</COST>\n");
      write("    </HOP>\n");
    }
  });
  write("  </HOPS>\n");
  write("  <FERMENTABLES>\n");
  $('.ferm').each(function() {
    if (F('[name=ferm-id]', this)) {
      write("    <FERMENTABLE>\n");
      write("      <NAME>" + F('[name=ferm-name]', this) + "</NAME>\n");
      write("      <VERSION>1</VERSION>\n");
      write("      <TYPE>Grain</TYPE>\n");
      write("      <AMOUNT>" + (F('[name=ferm-amount]', this) / 1000) + "</AMOUNT>\n");
      write("      <YIELD>" + F('[name=ferm-yield]', this) + "</YIELD>\n");
      write("      <COLOR>" + ebc_to_srm(F('[name=ferm-ebc]', this)) + "</COLOR>\n");
      //write("      <ORIGIN>Belgium</ORIGIN>\n");
      write("      <MOISTURE>" + F('[name=ferm-moisture]', this) + "</MOISTURE>\n");
      //write("      <COST>0.00</COST>\n");
      write("    </FERMENTABLE>\n");
    }
  });
  write("  </FERMENTABLES>\n");
  write("  <MISCS>\n");
  write("  </MISCS>\n");
  write("  <YEASTS>\n");
  write("    <YEAST>\n");
  write("      <NAME>" + F('#yeast') + "</NAME>\n");
  write("      <VERSION>1</VERSION>\n");
  //write("      <FORM>Liquid</FORM>\n");
  write("      <TYPE>Ale</TYPE>\n");
  write("      <AMOUNT>" + F('#starter') + "</AMOUNT>\n");
  //write("      <AMOUNT_IS_WEIGHT>FALSE</AMOUNT_IS_WEIGHT>\n");
  //write("      <STARTER_MADE>TRUE</STARTER_MADE>\n");
  //write("      <OG_STARTER>1.040</OG_STARTER>\n");
  write("      <DATE_MADE></DATE_MADE>\n");
  write("      <TIME_AERATED>0.0</TIME_AERATED>\n");
  write("      <TEMP>" + F('[name=starter-temp]') + "</TEMP>\n");
  //write("      <NUTRIENTS_ADDED>FALSE</NUTRIENTS_ADDED>\n");
  //write("      <NAME_NUTRIENTS></NAME_NUTRIENTS>\n");
  //write("      <AMOUNT_NUTRIENTS>0.0000</AMOUNT_NUTRIENTS>\n");
  //write("      <ZINC_ADDED>FALSE</ZINC_ADDED>\n");
  //write("      <NAME_ZINC></NAME_ZINC>\n");
  //write("      <AMOUNT_ZINC>0.00000</AMOUNT_ZINC>\n");
  //write("      <AMOUNT_PACKS>0.00</AMOUNT_PACKS>\n");
  //write("      <COST>0.00</COST>\n");
  //write("      <AMOUNT_EXTRACT>0.00</AMOUNT_EXTRACT>\n");
  //write("      <COST_EXTRACT>0.00</COST_EXTRACT>\n");
  write("    </YEAST>\n");
  write("  </YEASTS>\n");
  //write("  <WATERS>\n");
  //write("    <WATER>\n");
  //write("      <NAME>Original water</NAME>\n");
  //write("      <VERSION>1</VERSION>\n");
  //write("      <AMOUNT>27.08</AMOUNT>\n");
  //write("      <CALCIUM>34.0</CALCIUM>\n");
  //write("      <BICARBONATE>95.4</BICARBONATE>\n");
  //write("      <SULFATE>11.0</SULFATE>\n");
  //write("      <CHLORIDE>16.0</CHLORIDE>\n");
  //write("      <SODIUM>9.8</SODIUM>\n");
  //write("      <MAGNESIUM>3.2</MAGNESIUM>\n");
  //write("    </WATER>\n");
  //write("    <WATER>\n");
  //write("      <NAME>Treated water</NAME>\n");
  //write("      <VERSION>1</VERSION>\n");
  //write("      <AMOUNT>27.08</AMOUNT>\n");
  //write("      <CALCIUM>34.0</CALCIUM>\n");
  //write("      <BICARBONATE>95.4</BICARBONATE>\n");
  //write("      <SULFATE>11.0</SULFATE>\n");
  //write("      <CHLORIDE>16.0</CHLORIDE>\n");
  //write("      <SODIUM>9.8</SODIUM>\n");
  //write("      <MAGNESIUM>3.2</MAGNESIUM>\n");
  //write("    </WATER>\n");
  //write("   <DILUTION_FACTOR>0.00</DILUTION_FACTOR>\n");
  //write("   <CASO4>0.0000</CASO4>\n");
  //write("   <CACl2>0.0000</CACl2 >\n");
  //write("   <CACO3>0.0000</CACO3>\n");
  //write("   <MGSO4>0.0000</MGSO4>\n");
  //write("   <NACL>0.0000</NACL>\n");
  //write("   <HCl>0.0000</HCl>\n");
  //write("   <H3PO4>0.0000</H3PO4>\n");
  //write("   <LACTIC_ACID>0.0000</LACTIC_ACID>\n");
  //write("   <MHCl>0.00</MHCl>\n");
  //write("   <MH3PO4>0.00</MH3PO4>\n");
  //write("   <MLACTIC_ACID>0.00</MLACTIC_ACID>\n");
  //write("   <COST>1.19</COST>\n");
  //write("  </WATERS>\n");
  write("  <MASH>\n");
  write("    <NAME>My mash profile</NAME>\n");
  write("    <VERSION>1</VERSION>\n");
  //write("    <GRAIN_TEMP>18.0</GRAIN_TEMP>\n");
  write("    <MASH_STEPS>\n");
  $('.step').each(function() {
    if (F('[name=step-name]', this)) {
      write("      <MASH_STEP>\n");
      write("        <NAME>" + F('[name=step-name]', this) + "</NAME>\n");
      write("        <VERSION>1</VERSION>\n");
      write("        <TYPE>Infusion</TYPE>\n");
      write("        <INFUSE_AMOUNT>" + F('#volume-mash') + "</INFUSE_AMOUNT>\n");
      write("        <STEP_TEMP>" + F('[name=step-temp]', this) + "</STEP_TEMP>\n");
      write("        <STEP_TIME>" + F('[name=step-time]', this) + "</STEP_TIME>\n");
      //write("        <RAMP_TIME>1</RAMP_TIME>\n");
      //write("        <END_TEMP>60.0</END_TEMP>\n");
      write("      </MASH_STEP>\n");
    }
  });
  
  write("    </MASH_STEPS>\n");
  write("    <SPARGE_TEMP>75.0</SPARGE_TEMP>\n");
  write("  </MASH>\n");
  write("  <NOTES>" + escape(F('#notes')) + "</NOTES>\n");
  write("  <OG>" + F('#og') + "</OG>\n");
  write("  <FG>" + F('#fg-secundary') + "</FG>\n");

  age = F('[name=start-secundary]') - F('[name=start-primary]');
  age /= 24*60*60*1000;
  write("  <PRIMARY_AGE>" + (isFinite(age) ? age : 0) + "</PRIMARY_AGE>\n");
  age = F('#bottle-date') - F('[name=start-secundary');
  age /= 24*60*60*1000;
  write("  <SECONDARY_AGE>" + (isFinite(age) ? age : 0) + "</SECONDARY_AGE>\n");
  write("  <AGE_TEMP>23.0</AGE_TEMP>\n");
  write("  <DATE>" + date_format(F('#brew-date')) +  "</DATE>\n");
  write("  <PRIMING_SUGAR_NAME>" + F('#priming-name') + "</PRIMING_SUGAR_NAME>\n");
  write("  <CARBONATION>" + F('#co2v') + "</CARBONATION>\n");
  write("  <CARBONATION_TEMP>20.0</CARBONATION_TEMP>\n");
  write("  <PLANNED_OG>" + F('#planned-og') + "</PLANNED_OG>\n");
  write("  <VOLUME_AFTER_BOIL>" + F('#volume-after-boil') + "</VOLUME_AFTER_BOIL>\n");
  write("  <VOLUME_FERMENTER>" + F('#volume-fermenter') + "</VOLUME_FERMENTER>\n");
  write("  <DATE_BOTTLING>" + date_format(F('#bottle-date')) + "</DATE_BOTTLING>\n");
  write("  <AMOUNT_BOTTLING>" + F('#bottle-volume') + "</AMOUNT_BOTTLING>\n");
  write("  <AMOUNT_PRIMING>" + F('#priming-amount') + "</AMOUNT_PRIMING>\n");
  write(" </RECIPE>\n");
  write("</RECIPES>");

  close();
}


// vim: sw=2:et:ai
