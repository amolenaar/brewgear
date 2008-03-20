<?xml version='1.0'?>
<!-- vim:sw=2:et
  -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0">

  <xsl:import href="../brouwhulp.xsl" />

  <!--
     Test suite for mathematical functions fac, pow and exp
    -->
  <xsl:template match="/test">
    <html>
      <body style="background-color:#ffe;">
        <ul>
          <xsl:apply-templates />
        </ul>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="ebc">
    <li>EBC <xsl:value-of select="text()" /> is
      <xsl:call-template name="color-rgb">
        <xsl:with-param name="ebc" select="text()" />
      </xsl:call-template>
    </li>
  </xsl:template>

  <xsl:template name="fetch">
      <xsl:param name="ebc" />
      <xsl:param name="ebc2rgbfile" select="'../ebc2rgb.xml'" />
      <xsl:value-of select="document($ebc2rgbfile)/substitution/ebc[@value &gt; $ebc]/@value" />
  </xsl:template>

</xsl:stylesheet>
