/*
 * Brewing formulas
 * SG is always in g/l (e.g. 1050 in stead of 1.050)
 */


/* Gravity */ 

function sg_to_plato(sg) {
  return -0.0002030586 * sg * sg + 0.663958589 * sg - 460.89746;
}

function sg_to_brix(sg) {
  return -0.0002112789 * sg * sg + 0.6907289 * sg - 479.4467;
}

function brix_to_sg(brix) {
  return 0.01374 * brix * brix + 3.70502 * brix + 1000;
}

function brix_to_plato(brix) {
  return 0.9615 * brix;
}

function plato_to_brix(plato) {
  return 1.040009 * plato;
}

function max_og() {
  /*SGmaximaal = 1000 + (8,345 / Vwort) * SOM( Mx * (Px-1000)) */
}

function total_yield(og, volume) {
  return sg_to_brix(og) * volume * 10;
}

function total_og(yield, volume) {
  return brix_to_sg(yield / (volume * 10));
}

function abv(og, fg) {
  return 486.8693 * (og - fg) / (4749.804 - fg);
}


/* Color */

function srm_to_ebc(srm) {
  return (srm - 0.46) / 0.375;
}

function ebc_to_srm(ebc) {
  return (ebc * 0.375) + 0.46;
}

function color_impact(amount, color_ebc, volume) {
  return (amount / 1000.0) * (ebc_to_srm(color_ebc) / volume) * 8.34436;
}

function color_daniels(total_impact) {
  return srm_to_ebc( 0.2 * total_impact + 8.4 );
}

function color_morey(total_impact) {
  return srm_to_ebc(1.49 * Math.pow(total_impact, 0.69));
}

function color_mosher(total_impact) {
  return srm_to_ebc(0.3 * total_impact + 4.7);
}

/* Water */

function water_density(T) {
  return ((999.83952 + 16.945176 * T - 0.0079870401 * Math.pow(T, 2) - 0.000046170461 * Math.pow(T, 3) + 0.00000010556302 * Math.pow(T, 4) - 2.8054253E-10 * Math.pow(T, 5)) / (1 + 0.01687985 * T));
}

/* Bitterness */

var FACTOR_MALT_HOPPING = 0.5;
var FACTOR_FIRST_WORT_HOPPING = 0.9;
var FACTOR_BITTER_HOPPING = 1;
var FACTOR_AROMA_HOPPING = 1;
var FACTOR_DRY_HOPPING = 0;

function boiltime_to_utilization(boiltime) {
  if (boiltime == "DRY") {
    return FACTOR_DRY_HOPPING;
  }
  if (boiltime == "FWH") {
    return FACTOR_FIRST_WORT_HOPPING;
  }
  if (boiltime == "MASH") {
    return FACTOR_MASH_HOPPING;
  }
  boiltime = parseInt(boiltime);
  if (!isFinite(boiltime)) {
    return 1;
  }
  if (boiltime < 45) {
    return FACTOR_AROMA_HOPPING;
  }
  return FACTOR_BITTER_HOPPING;
    
}

function bitterness_tinseth(amount, hop, boiltime, volume, sg) {
  var sg_factor = 1.65 * Math.pow(0.000125, (sg / 1000.0) - 1);

  var boil_factor = hop.utilization * 0.240963855 * (1 - Math.exp(-0.04 * boiltime));

  var hop_r = sg_factor * boil_factor;
  if (hop.pellets) {
    hop_r = hop_r * 1.1;
  }
  var bitterness =  (amount * 10 * hop.alpha * hop_r) / volume;
  return bitterness;
}

function bitterness_rager(amount, hop, boiltime, volume, sg) {
  var boil_factor = hop.utilization * 18.11 + 13.86 * tanh((boiltime - 31.32) / 18.27);
  var sg_factor = (sg - 1050) / 200;
  if (sg_factor < 0) {
    sg_factor = 0;
  }
  var bitterness = (amount * hop.alpha * boil_factor * 0.1) / (volume * (1 + sg_factor));
  
  return bitterness;
}

function bitterness_daniels(amount, hop, boiltime, volume, og) {
  var boil_factor;
  
  if (hop.pellets) {
    boil_factor = -(0.0051 * boiltime * boiltime) + (0.7835 * boiltime) + 1.9348;
  } else {
    boil_factor = -(0.0041 * boiltime * boiltime) + (0.6162 * boiltime) + 1.5779;
  }
  var og_factor = (og - 1050) / 200.0;
  if (og_factor < 0) {
    og_factor = 0;
  }
  var bitterness = hop.utilization * ((amount * hop.alpha * boil_factor * 0.1) / volume * (1 + og_factor));
  
  return bitterness;
}

function bitterness_garetz(amount, hop, boiltime, volume, sg) {
  var boil_factor = hop.utilization * 6.03253 + 16.5289 * tanh((boiltime - 19.17323) / 26.8013);

  var concentration_factor = 0.94; //(Volume na koelen) / (Volume bij Koken)

  var boil_density = (concentration_factor * (sg-1000) / 1000) + 1;

  var sg_factor = (boil_density - 1.05) / 0.2 + 1;

  // In Brouwhulp & BrouwVisie the desired bitterness is calculated according to Tinseth.
  var desired_bitterness = bitterness_tinseth(amount, hop, boiltime, volume, sg);

  var hop_rate_factor = ((concentration_factor * desired_bitterness) / 260) + 1;

  var temp_factor = (32.8 / 550) * 0.02 + 1;

  var bitterness = (boil_factor * hop.alpha * amount * 0.1) / (volume * sg_factor * hop_rate_factor * temp_factor);

  return bitterness;
}

function bu_gu_ratio(bitterness, sg) {
  return bitterness / (sg - 1000);
}


/* carbonation */

function co2_weight_to_volume(w) {
  /* Co2 in volumes = w/100*1000/(12+2*16)*22.4 ~= N9*4.928 ==> N9 * 5.0909 */
  return w * 4.928;
}

/**
 * Returns the amount of CO2 volumes of one litre of fluid
 */
function co2_in_liquid(temperature) {
  return (Math.pow(0.000849151 * temperature, 2) - 0.0587512 * temperature + 1.71137);
}

/**
 * Return the amount of sugar (cristal) that has to be added to one
 * litre of beer before bottling in order to reach the desired carbonation
 * level.
 */
function co2_volume_to_sugar(co2_vol, temperature) {
  return (co2_vol - co2_in_liquid(temperature ? temperature : 20)) * 3.5;
}

function sugar_to_co2_volume(sugar, temperature) {
  return (sugar / 3.5) + co2_in_liquid(temperature ? temperature : 20);
}

/*
C02 to grammes
B6 = Temperatuur lagering bier
B7 = Gewenste hoeveelheid koolzuur (volumes CO2)
B8 = Volume te bottelen bier

Reeds opgelost koolzuur = (math.pow(0.000849151*B6, 2)-0.0587512*B6+1.71137)
nog toe te voegen: (gewenst - reeds opgelost) * 3.5 * factor

factor:
suiker(B10)=1/0.286 = 3.5              ==> 1
dextrose/glucose=1/0.27027 = 3.7       ==> .95
moutextract==200/115*1/0.286 = 6.1     ==> .58
honing==(1/0.286)/0,78 = 4.5           ==> .78 <--?
molasse=440/115*B10 = 13.4             ==> .26
*/

/* carbonation (alcohol): gram * 0.06 * factor
	1.00 // suiker
	0.95 // dextrose
	0.95 // glucose
	0.58 // moutextract
	0.56 // honing <-- fout?
	0.26 // molasse
 
*/


/* hard-core mathematics */

function tanh(a) {
  a = Math.exp(a);
  return (a - 1 / a) / (a + 1 / a);
}
