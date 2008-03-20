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

  <xsl:template match="fac">
    <li>factorial <xsl:value-of select="text()" /> is
      <xsl:call-template name="fac">
        <xsl:with-param name="x" select="." />
      </xsl:call-template>
    </li>
  </xsl:template>

  <xsl:template match="pow">
    <!-- do x^y -->
    <li>power <xsl:value-of select="x" />^<xsl:value-of select="y" /> is
      <xsl:call-template name="pow">
        <xsl:with-param name="x" select="x" />
        <xsl:with-param name="y" select="y" />
      </xsl:call-template>
    </li>
  </xsl:template>

  <xsl:template match="exp">
    <!-- do e^x -->
    <li>exp e^<xsl:value-of select="text()" /> is
      <xsl:call-template name="exp">
        <xsl:with-param name="x" select="text()" />
      </xsl:call-template>
    </li>
  </xsl:template>

</xsl:stylesheet>
