<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:param name="selected_table_id" select="0"/>
	<xsl:param name="items_per_page" select="5"/>
	<xsl:param name="page" select="1"/>
	<xsl:param name="sort-key" select="'TABLE-LABEL'"/>
	<xsl:param name="sort-order" select="descending"/>
	
	<xsl:key name="categ_key" match="ITEM" use="TABLE-LABEL"/>

	<xsl:template match="/">
					
				<xsl:apply-templates select="ROOT/ITEM-LIST" mode="GRP_TABLE_LABEL"/>
		
	</xsl:template>
	
	<xsl:template match="ITEM-LIST" mode="GRP_TABLE_LABEL">		
					
			<xsl:if test="$selected_table_id = 0">			
				<xsl:for-each select="ITEM">
					<!-- Choose sorting -->
					<xsl:sort select="*[local-name(.)=$sort-key]" order="{$sort-order}"/>
					
					<!-- SHOW ALL ITEMS LIST DEPENDING ON ITEMS PER PAGE-->
					<xsl:if test="(position() &gt; $items_per_page * ($page - 1)) and (position() &lt;= $items_per_page * $page)">
					
						<LI> <A>
							<xsl:attribute name="href">
								<xsl:value-of select="LINK" />
							</xsl:attribute>
							<xsl:value-of select="REC-CAPTION" />
						</A> </LI>
						
					</xsl:if>
							
				</xsl:for-each>
			</xsl:if>
			
			<xsl:if test="$selected_table_id != 0">
				<xsl:for-each select="ITEM[ (count(. | key('categ_key', TABLE-LABEL)[1])=1) and ($selected_table_id = ./TABLE-ID) ]">
						
						<!-- SHOW ALL ITEMS LIST DEPENDING ON ITEMS PER PAGE-->
						<xsl:for-each select="key('categ_key', TABLE-LABEL)[ (position() &gt; $items_per_page * ($page - 1) ) and (position() &lt;= $items_per_page * $page) ]">
							<!-- Choose sorting -->
							<xsl:sort select="*[local-name(.)=$sort-key]" order="{$sort-order}"/>
							
							<LI> <A>
								<xsl:attribute name="href">
									<xsl:value-of select="LINK" />
								</xsl:attribute>
								<xsl:value-of select="REC-CAPTION" />
							</A> </LI>
							
						</xsl:for-each>
				</xsl:for-each>		
			</xsl:if>			
					
	</xsl:template>
</xsl:stylesheet>