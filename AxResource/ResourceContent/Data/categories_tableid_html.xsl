
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:param name="show_all_text" select ="'Show All'"/>		
	<xsl:key name="categ_key" match="ITEM" use="TABLE-LABEL"/>

	<xsl:template match="/">
		<xsl:apply-templates select="ROOT/ITEM-LIST" mode="GRP_TABLE_LABEL"/>
	</xsl:template>

	<xsl:template match="ITEM-LIST" mode="GRP_TABLE_LABEL">		
		;<xsl:value-of select="$show_all_text"/>;
		<xsl:for-each select="ITEM[ (count(. | key('categ_key', TABLE-LABEL)[1])=1) ]"><xsl:value-of select="TABLE-LABEL" /> (<xsl:value-of select="count(. | key('categ_key', TABLE-LABEL))"/>),<xsl:value-of select="TABLE-ID"/>;</xsl:for-each>
	</xsl:template>
</xsl:stylesheet>