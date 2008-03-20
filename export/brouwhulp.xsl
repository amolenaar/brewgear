<?xml version='1.0'?>
<!DOCTYPE xsl:stylesheet [
  <!ENTITY deg "&#xB0;">
]>
<!-- vim:sw=2:et
  -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:exsl="http://exslt.org/common"
                version="1.0">
<!--
   Converts BeerXML and BrouwHulpXML files into nice looking HTML.

   Written by Arjan J. Molenaar.

   Colors in BeerXML are measured in SRM.
   To convert from SRM to EBC: 
     color_ebc = (color_srm - .46) / .375

   The color impact of each fermentable is calculated as (SRM):
     color_ferm = amount * (color_srm / batch-size) * 8.34436

   To calculate the final beer color (SRM):  
     color_daniels = 0.2 * sum(color_ferm) + 8.4
     color_mosher = 0.3 * sum(color_ferm) + 4.7
     color_morey = 1.49 * sum(color_ferm)^0.69 (not implemented)

   Bitterness is calculated in IBU's.

   The bitterness calculated according to Daniels is:
     ibu_hop_daniels = aa * u * x, where 
       aa = amount * 1000 * aa% * 0.1 / (volume[after boil] * 
            (1 + (OG[before boil] - 1.05) / 0.2))
       u = -(0.0041 * time^2) + (0.6261 * time) + 1.5779
       x = 0.9 for First Wort hopping, 0.7 for Mash hopping, otherewise 1
     ibu_daniels = sum(ibu_hop_daniels)
  
   Change log:
   2007-04-24: AJM
     - added more number-format()'ing to printed values (SG's and amounts)
     - added alternative method for calculating OG before boil, when
       OG_BEFORE_BOIL is not defined in XML.
  -->

  <xsl:output method="html" omit-xml-declaration="yes" />

  <!--
     =======================
      Configuration section
     =======================
    -->

  <!--
     Method used to calculate beverage color: Daniels or Mosher.
    -->
  <xsl:variable name="color-method" select="'Daniels'" />

  <!--
     Method to calculate hop bitterness: Daniels
    -->
  <xsl:variable name="bitterness-method" select="'Daniels'" />

  <!-- decimal format for Europe -->
  <xsl:decimal-format
    NaN="-"
    decimal-separator=","
    grouping-separator="." />

  <!-- Settings for formating numbers (prefixed by f_) -->
  <xsl:variable name="f_vol" select="'#,0'" /> <!-- Volume (liters) -->
  <xsl:variable name="f_ph" select="'#,0'" /> <!-- pH -->
  <xsl:variable name="f_w" select="'#'" /> <!-- weight (grams) -->
  <xsl:variable name="f_ww" select="'#,0'" /> <!-- weight (grams), one decimal -->
  <xsl:variable name="f_c" select="'#'" /> <!-- color (EBC) -->
  <xsl:variable name="f_g" select="'#'" /> <!-- gravity (OG/FG) -->
  <xsl:variable name="f_p" select="'#,0'" /> <!-- gravity (OG/FG) in 'Plato -->
  <xsl:variable name="f_vw" select="'#,00'" /> <!-- volume/weight (l/kg) -->
  <xsl:variable name="f_t" select="'#'" /> <!-- temperature (degC) -->
  <xsl:variable name="f_dur" select="'#'" /> <!-- duration (minutes) -->
  <xsl:variable name="f_ibu" select="'#'" /> <!-- bitterness (IBU) -->
  <xsl:variable name="f_aa" select="'#,00'" /> <!-- Alpha acid % -->
  <xsl:variable name="f_abv" select="'#,0'" /> <!-- Alcohol (by volume) -->

  <xsl:variable name="css">
    @import url(brouwhulp.css);
  </xsl:variable>

  <xsl:variable name="print-css">
    @import url(brouwhulp-print.css);
  </xsl:variable>

  <!--
     ==============================
      End of Configuration section
     ==============================
    -->

  <xsl:variable name="total-bitterness">
    <xsl:apply-templates select="//HOPS/HOP[1]" mode="total.bitterness" />
  </xsl:variable>

  <xsl:variable name="color-ebc">
    <xsl:choose>
      <xsl:when test="$color-method = 'Daniels'">
        <xsl:call-template name="color-ebc-daniels" />
      </xsl:when>
      <xsl:when test="$color-method = 'Mosher'">
        <xsl:call-template name="color-ebc-mosher" />
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="total-extract">
    <xsl:apply-templates select="//FERMENTABLES/FERMENTABLE[1]" mode="total.extract" />
  </xsl:variable>

  <xsl:variable name="brewhouse-efficiency">
    <xsl:value-of select="(//VOLUME_AFTER_BOIL * (//OG - 1)) div (//BATCH_SIZE * (//PLANNED_OG - 1)) * //EFFICIENCY div 100" />
  </xsl:variable>

  <xsl:template match="/RECIPES">
    <html>
      <head>
        <title><xsl:value-of select="RECIPE/NAME" /></title>
        <style type="text/css">
         <xsl:value-of select="$css" />
        </style>
        <style type="text/css" media="print" title="Printer-Friendly Style">
         <xsl:value-of select="$print-css" />
        </style>
      </head>
      <body>
        <div id="wrapper">
          <xsl:apply-templates select="RECIPE" />
          <br class="clear" />
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="RECIPE">
    <xsl:call-template name="header" />
    <xsl:variable name="og_plato">
      <xsl:call-template name="plato">
        <xsl:with-param name="sg" select="OG * 1000" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="fg_plato">
      <xsl:call-template name="plato">
        <xsl:with-param name="sg" select="FG * 1000" />
      </xsl:call-template>
    </xsl:variable>
    <div id="style">
      <xsl:apply-templates select="STYLE" />
    </div>
    <div id="batch">
      <xsl:call-template name="color-box-rgb" />
      <div class="left">
        <p>Brouwdatum: <xsl:value-of select="DATE" /> </p>
        <p>Botteldatum: <xsl:value-of select="DATE_BOTTLING" /> </p>
        <p>Kleur: <xsl:value-of select="format-number($color-ebc, $f_c)" /> EBC (<xsl:value-of select="$color-method" />)</p>
        <p>Bitterheid: <xsl:value-of select="format-number($total-bitterness, $f_ibu)" /> IBU (<xsl:value-of select="$bitterness-method" />)</p>
        <p>Alcohol: <xsl:value-of select="format-number((//OG - //FG) * 131, $f_abv)" /> %Vol</p>
      </div>
      <div class="middle">
        <p>Batch: <xsl:value-of select="format-number(BATCH_SIZE, $f_vol)" /> liter</p>
        <p>SG: <xsl:value-of select="format-number(OG * 1000, $f_g)" /> (<xsl:value-of select="format-number($og_plato, $f_p)" />&deg;P; gepland: <xsl:value-of select="format-number(PLANNED_OG * 1000, $f_g)" />)</p>
        <p>Eind-SG: <xsl:value-of select="format-number(FG * 1000, $f_g)" /> (<xsl:value-of select="format-number($fg_plato, $f_p)" />&deg;P)</p>
        <p>Schijnbare vergistingsgraad: <xsl:call-template name="svg" /></p>
        <p>Brouwzaalrendement: <xsl:value-of select="format-number($brewhouse-efficiency, '#%')" /></p>
      </div>
    </div>
    <div id="mash">
      <h2>Maisching</h2>
      <p>Volume water voor maisch: <xsl:value-of select="format-number(//MASH_STEPS[1]/MASH_STEP[1]/INFUSE_AMOUNT, $f_vol)" /> l (beslagdikte: <xsl:value-of select="format-number((//MASH_STEPS[1]/MASH_STEP[1]/INFUSE_AMOUNT) div (sum(//FERMENTABLE/AMOUNT)), $f_vw)" /> l/kg mout)</p>
      <div id="fermentables">
        <xsl:apply-templates select="FERMENTABLES" />
      </div>
      <div id="mashsteps">
        <xsl:apply-templates select="MASH" />
      </div>
      <br class="clear" />
    </div>
    <div id="filter">
      <h2>Filteren</h2>
      <div class="left">
        <p>Volume water voor filteren: <xsl:value-of select="format-number(//MASH_STEPS[1]/MASH_STEP[1]/INFUSE_AMOUNT, $f_vol)" /> l</p>
        <p>SG laatste afloop: <xsl:value-of select="format-number(//SPARGE_SG * 1000, $f_g)" /></p>
      </div>
      <div class="right">
        <p>Begin filteren: <xsl:value-of select="//SPARGE_START" /></p>
        <p>Eind filteren: <xsl:value-of select="//SPARGE_END" /></p>
      </div>
    </div>
    <div id="boil">
      <h2>Koken</h2>
      <div id="boilstats">
        <dl>
          <dt>Volume begin koken:</dt><dd><xsl:value-of select="format-number(VOLUME_BEFORE_BOIL, $f_vol)" /></dd>
          <dt>pH voor koken:</dt><dd><xsl:value-of select="format-number(PH_BEFORE_BOIL, $f_ph)" /></dd>
          <dt>SG voor koken:</dt><dd><xsl:value-of select="format-number(OG_BEFORE_BOIL * 1000, $f_g)" /></dd>
          <dt>Volume na koken:</dt><dd><xsl:value-of select="format-number(VOLUME_AFTER_BOIL, $f_vol)" /></dd>
          <dt>pH na koken:</dt><dd><xsl:value-of select="format-number(PH_AFTER_BOIL, $f_ph)" /></dd>
          <dt>SG na koken:</dt><dd><xsl:value-of select="format-number(OG * 1000, $f_g)" /></dd>
        </dl>
        <br class="clear" />
      </div>
      <xsl:apply-templates select="HOPS" />
      <p class="clear">Kooktijd: <em><xsl:value-of select="format-number(BOIL_TIME, $f_dur)" /></em> minuten</p>
    </div>
    <div id="fermentation">
      <h2>Fermentatie</h2>
      <div class="left">
        <p>Volume in vergistingsvat: <em><xsl:value-of select="format-number(VOLUME_FERMENTER, $f_vol)" /></em> liter</p>
        <p>Gist: <em><xsl:value-of select="YEASTS[1]/YEAST[1]/NAME" /></em></p>
      </div>
      <div class="right">
        <p>Primaire vergisting: <em><xsl:value-of select="PRIMARY_AGE" /></em> dagen op <em><xsl:value-of select="format-number(PRIMARY_TEMP, $f_t)" /></em> &deg;C</p>
        <xsl:choose>
          <xsl:when test="SECONDARY_AGE and SECONDARY_AGE != '-'">
            <p>Secundaire vergisting: <em><xsl:value-of select="SECONDARY_AGE" /></em> dagen op <em><xsl:value-of select="format-number(SECONDARY_TEMP, $f_t)" /></em>  &deg;C</p>
          </xsl:when>
          <xsl:otherwise>
            <p>Geen secundaire vergisting</p>
          </xsl:otherwise>
        </xsl:choose>
      </div>
    </div>
    <div id="bottling">
      <h2>Bottelen</h2>
      <p>Gebotteld op <em><xsl:value-of select="DATE_BOTTLING" /></em>
        met <em><xsl:value-of select="format-number(AMOUNT_PRIMING * 1000.0, $f_ww)" /></em> gram 
      <!-- <xsl:value-of select="PRIMING_SUGAR_NAME" /> --> suiker per liter
      bij een SG van <em><xsl:value-of select="format-number(FG * 1000, $f_g)" /></em>.</p>
    </div>
    <div id="notes">
      <h2>Notities</h2>
      <xsl:call-template name="notes">
        <xsl:with-param name="text" select="NOTES" />
      </xsl:call-template>
      <table>
        <tr><td /><td class="fillin" /></tr>
        <tr><td /><td class="fillin" /></tr>
      </table>
    </div>
    <div id="judgement">
      <h2>Beoordeling</h2>
      <table>
        <tbody>
         <tr><td>Proefdatum:</td><td class="fillin" /></tr>
         <tr><td>Kleur:</td><td class="fillin" /></tr>
         <tr><td>Helderheid:</td><td class="fillin" /></tr>
         <tr><td>Schuim:</td><td class="fillin" /></tr>
         <tr><td>Geur:</td><td class="fillin" /></tr>
         <tr><td>Smaak:</td><td class="fillin" /></tr>
         <tr><td>Mondgevoel:</td><td class="fillin" /></tr>
         <tr><td>Nasmaak:</td><td class="fillin" /></tr>
         <tr><td>Opmerkingen:</td><td class="fillin" /></tr>
         <tr><td></td><td class="fillin" /></tr>
        </tbody>
      </table>
    </div>
  </xsl:template>

  <!--
     STYLE
    -->

  <xsl:template name="header">
    <h1>
      <span id="recipe-number"><xsl:value-of select="NR_RECIPE" /></span>
      <xsl:value-of select="NAME" />
      (<xsl:value-of select="STYLE/NAME" />)
    </h1>
    <!--
    <p id="brewer">brouwer: <xsl:value-of select="BREWER" /></p>
      -->
    <p id="brewer"></p>
  </xsl:template>

  <xsl:template match="STYLE">
    <h3>Stijldefinitie</h3>
    <dl>
      <dt>Stijl:</dt><dd><xsl:value-of select="NAME" /></dd>
      <dt>Klasse:</dt><dd><xsl:value-of select="STYLE_LETTER" /></dd>
      
      <dt>Begindichtheid:</dt><dd><xsl:value-of select="OG_MIN" /> - <xsl:value-of select="OG_MAX" /></dd>
      <dt>Vergistingsgraad:</dt>
        <dd><xsl:value-of select="format-number((OG_MIN - FG_MAX) div (OG_MIN - 1), '##%')" />
        - <xsl:value-of select="format-number((OG_MAX - FG_MIN) div (OG_MAX - 1), '##%')" /></dd>
      <dt>Alcohol (vol%):</dt><dd><xsl:value-of select="ABV_MIN" /> - <xsl:value-of select="ABV_MAX" /></dd>
      <dt>Kleur (EBC):</dt><dd><xsl:value-of select="COLOR_MIN" /> - <xsl:value-of select="COLOR_MAX" /></dd>
      <dt>Bitterheid (IBU):</dt><dd><xsl:value-of select="IBU_MIN" /> - <xsl:value-of select="IBU_MAX" /></dd>
      <dt>CO<sub>2</sub> (vol):</dt><dd><xsl:value-of select="CARB_MIN" /> - <xsl:value-of select="CARB_MAX" /></dd>
    </dl>
  </xsl:template>

  <!--
     FERMENTABLES
    -->
  <xsl:template match="FERMENTABLES">
    <h3>Granen, suikers</h3>
    <table>
      <thead>
        <tr>
          <th>naam</th><th>EBC</th><th>gewicht (g)</th><th>%</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td id="total-ferm-title" colspan="2">
            Totale stort:
          </td>
          <td id="total-ferm" class="num"><xsl:value-of select="format-number(sum(FERMENTABLE/AMOUNT) * 1000, $f_w)" /></td>

        </tr>
      </tfoot>
      <tbody>
        <xsl:for-each select="FERMENTABLE">
          <tr>
            <td><xsl:value-of select="NAME" /></td>
            <td class="num"><xsl:value-of select="format-number((COLOR - .46) div .375, $f_c)" /></td>
            <td class="num"><xsl:value-of select="format-number(AMOUNT * 1000, $f_w)" /></td>
            <td class="num"><xsl:value-of select="format-number(AMOUNT div sum(../FERMENTABLE/AMOUNT) * 100, $f_c)" /></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>

  <xsl:template name="color-ebc-mosher">
    <!-- color in EBC -->
    <xsl:variable name="srm">
      <xsl:apply-templates select="//FERMENTABLE[1]" mode="color" />
    </xsl:variable>
    <xsl:value-of select="((0.3 * $srm + 4.7) - .46) div .375" />
  </xsl:template>

  <xsl:template name="color-ebc-daniels">
    <!-- color in EBC -->
    <xsl:variable name="srm">
      <xsl:apply-templates select="//FERMENTABLE[1]" mode="color" />
    </xsl:variable>
    <xsl:value-of select="((0.2 * $srm + 8.4) - .46) div .375" />
  </xsl:template>

  <xsl:template match="FERMENTABLE" mode="color">
    <!-- returns color in SRM (!) -->
    <xsl:param name="tot" select="0" /> <!-- in litres -->
    <xsl:param name="amount" select="AMOUNT" /> <!-- in litres -->
    <xsl:param name="color" select="COLOR" /> <!-- in SRM -->
    <xsl:param name="volume" select="/RECIPES/RECIPE/BATCH_SIZE" />

    <xsl:variable name="c" select="$amount * ($color div $volume) * 8.34436" />
    <xsl:choose>
      <xsl:when test="following-sibling::*[1]">
        <xsl:apply-templates select="following-sibling::*[1]" mode="color">
          <xsl:with-param name="tot" select="$tot + $c" />
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$tot + $c" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!--
     MASH
    -->
  <xsl:template match="MASH">
    <h3>Maisch schema</h3>
    <xsl:for-each select="MASH_STEPS">
      <table>
        <thead>
          <tr>
            <th>stap</th><th>T (&deg;C)</th><th>tijd (min)</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="MASH_STEP">
            <tr>
              <td><xsl:value-of select="NAME" /></td>
              <td class="num"><xsl:value-of select="format-number(STEP_TEMP, $f_t)" /></td>
              <td class="num"><xsl:value-of select="format-number(STEP_TIME, $f_dur)" /></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </xsl:for-each>
  </xsl:template>

  <!--
     HOP
    -->
  <xsl:template match="HOPS">
    <h3>Hop</h3>
    <table>
      <thead>
        <tr>
          <th>naam</th><th>alpha%</th><th>gewicht (g)</th><th>type</th><th>tijd</th><th>IBU</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td colspan="5" id="total-ibu-title">Totale bitterheid:</td>
          <td id="total-ibu" class="num">
            <xsl:value-of select="format-number($total-bitterness, $f_ibu)" />
          </td>
        </tr>
      </tfoot>
      <tbody>
        <xsl:for-each select="HOP">
          <tr>
            <td><xsl:value-of select="NAME" /></td>
            <td class="num"><xsl:value-of select="format-number(ALPHA, $f_aa)" /></td>
            <td class="num"><xsl:value-of select="format-number(AMOUNT * 1000, $f_ww)" /></td>
            <!-- TODO: add form: Pellet/Leaf/Plug -->
            <td>
              <xsl:choose>
                <xsl:when test="FORM = 'Plug'">
                  Plugs
                </xsl:when>
                <xsl:when test="FORM = 'Pellet'">
                  Pellets
                </xsl:when>
                <xsl:otherwise>
                  Hopbellen
                </xsl:otherwise>
              </xsl:choose>
            </td>
            <td class="num">
              <xsl:choose>
                <xsl:when test="USE = 'Boil'">
                  <xsl:value-of select="TIME" />
                </xsl:when>
                <xsl:when test="USE = 'First Wort'">
                  FWH
                </xsl:when>
                <xsl:when test="USE = 'Mash'">
                  MH
                </xsl:when>
                <xsl:when test="USE = 'Dry Hop'">
                  DRY
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="USE" />
                </xsl:otherwise>
              </xsl:choose>
            </td>
            <td class="ibu num">
              <xsl:call-template name="bitterness-formatted" />
            </td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>

  <xsl:template name="bitterness-formatted">
    <xsl:variable name="ibu">
      <xsl:call-template name="bitterness-daniels" />
    </xsl:variable>
    <xsl:value-of select="format-number($ibu, $f_ibu)" />
  </xsl:template>

  <xsl:template name="hop-boil-time">
    <xsl:choose>
      <xsl:when test="USE = 'First Wort'">
        <xsl:value-of select="//BOIL_TIME" />
      </xsl:when>
      <xsl:when test="USE = 'Mash'">
        <xsl:value-of select="//BOIL_TIME" />
      </xsl:when>
      <xsl:when test="USE = 'Dry Hop'">
        <xsl:value-of select="0" />
      </xsl:when>
      <xsl:when test="string-length(TIME) &gt; 0">
        <xsl:value-of select="TIME" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="0" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="bitterness-daniels">
    <xsl:variable name="vol" select="../../VOLUME_AFTER_BOIL * 0.96" />
    <xsl:variable name="og">
      <xsl:choose>
        <xsl:when test="../../OG_BEFORE_BOIL">
          <xsl:value-of select="../../OG_BEFORE_BOIL" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="((../../VOLUME_AFTER_BOIL * (../../OG - 1) * 1000) div ../../VOLUME_BEFORE_BOIL) div 1000 + 1" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="aa" select="AMOUNT * 1000 * ALPHA * 0.1 div ($vol * (1 + ($og - 1.05) div 0.2))" />
    <xsl:variable name="time">
      <xsl:call-template name="hop-boil-time" />
    </xsl:variable>
    <xsl:variable name="u">
      <xsl:value-of select="-(0.0041 * $time * $time) + (0.6261 * $time) + 1.5779" />
    </xsl:variable>
    <xsl:variable name="x">
      <xsl:choose>
        <xsl:when test="USE = 'First Wort'">
          <xsl:value-of select=".9" />
        </xsl:when>
        <xsl:when test="USE = 'Mash'">
          <xsl:value-of select=".7" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="1" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="ibu" select="$aa * $u * $x" />
    <xsl:value-of select="$ibu" />
  </xsl:template>

  <xsl:template name="bitterness-tinseth">
  </xsl:template>

  <xsl:template name="bitterness-rager">
  </xsl:template>

  <xsl:template name="bitterness-garetz">
  </xsl:template>

  <xsl:template match="HOP" mode="total.bitterness">
    <xsl:param name="tot" select="0" />

    <xsl:variable name="b">
      <xsl:call-template name="bitterness-daniels" />
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="following-sibling::*[1]">
        <xsl:apply-templates select="following-sibling::*[1]" mode="total.bitterness">
          <xsl:with-param name="tot" select="$tot + $b" />
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$tot + $b" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!--
     NOTES
    -->
  <xsl:template name="notes">
    <xsl:param name="text" select="." />
    <xsl:choose>
      <xsl:when test="substring-before($text, '&#10;')">
        <p><xsl:value-of select="substring-before($text, '&#10;')" /></p>
        <xsl:call-template name="notes">
          <xsl:with-param name="text" select="substring-after($text, '&#10;')" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <p><xsl:value-of select="$text" /></p>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*">
    <!-- ignore -->
  </xsl:template>


  <!--
     Utility functions:
      svg - calculate schijnbare vergistingsgraad
      color-rgb - calculate color in RGB, return as 'rgb(r, g, b)'
    -->

  <xsl:template match="FERMENTABLE" mode="total.extract">
    <xsl:param name="total" select="0" />
    <!-- total extract in grams -->
    <xsl:variable name="y" select="AMOUNT * YIELD * 10" />
    <xsl:choose>
      <xsl:when test="following-sibling::*[1]">
        <xsl:apply-templates select="following-sibling::*[1]" mode="total.extract">
          <xsl:with-param name="total" select="$total + $y" />
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$total + $y" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="svg">
    <!-- schijnbare vergistingsgraad -->
    <xsl:value-of select="format-number((OG - FG) div (OG - 1), '##%')" />
  </xsl:template>

  <xsl:template name="color-box-rgb">
    <xsl:param name="id" select="'color-box-rgb'" />
    <xsl:element name="div">
      <xsl:attribute name="id">
        <xsl:value-of select="$id" />
      </xsl:attribute>
      <xsl:attribute name="style">
        <xsl:text>background-color:</xsl:text>
        <xsl:call-template name="color-rgb">
        </xsl:call-template>
      </xsl:attribute>
    </xsl:element>
  </xsl:template>

  <xsl:template name="color-rgb">
    <xsl:param name="ebc" select="$color-ebc" />
    <xsl:param name="ebc2rgbfile" select="'./ebc2rgb.xml'" />
    <xsl:variable name="color" select="document($ebc2rgbfile)/substitution/ebc[@value &gt; $ebc]/color[1]" />
    <xsl:text>rgb(</xsl:text>
    <xsl:value-of select="$color/@r" />
    <xsl:text>, </xsl:text>
    <xsl:value-of select="$color/@g" />
    <xsl:text>, </xsl:text>
    <xsl:value-of select="$color/@b" />
    <xsl:text>)</xsl:text>
  </xsl:template>

  <xsl:template name="plato">
    <!-- convert SG (in g/l) to degrees Plato -->
    <xsl:param name="sg" />
    <xsl:value-of select="-0.0002030586 * $sg * $sg + 0.663958589 * $sg - 460.89746" />
  </xsl:template>
</xsl:stylesheet>
