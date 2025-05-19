<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:param name="selected_table_id" select="0"/>
	<xsl:param name="items_per_page" select="5"/>
	<xsl:param name="page" select="1"/>
	
	<xsl:key name="categ_key" match="ITEM" use="TABLE-LABEL"/>

	<xsl:template match="/">
		<HTML>
			<BODY STYLE="font-family: Tahoma; font-size:10pt; background-color:#ECE9D8">
				<!--
				<font size="4">Searched for: <b><xsl:value-of select="ROOT/KEYWORD" /></b></font>
				<br/><br/>
				-->
				<xsl:apply-templates select="ROOT/ITEM-LIST" mode="GRP_TABLE_LABEL"/>
			</BODY>
		</HTML>
	</xsl:template>
	
	<xsl:template match="ITEM-LIST" mode="GRP_TABLE_LABEL">
		
		<xsl:choose>
			<xsl:when test="count( ITEM[count(. | key('categ_key', TABLE-LABEL)[1])=1] ) = 0">				
				<P align="center">No Items found!</P>
			</xsl:when>
			<xsl:otherwise>
				<b>
				|
				<A>
					<xsl:attribute name="href">MenuItemDisplay://SysSearchFormHandleUserActions+TableId:0;FormKey:<xsl:value-of select="/ROOT/FORM-KEY" />;</xsl:attribute>
					Home
				</A>
				| 
				</b>			
			</xsl:otherwise>
		</xsl:choose>
		
		<!-- BEGIN TOP LIST OF CATEGORIES --><!-- TODO: I need to add here error message that no items found! -->
			<xsl:for-each select="ITEM[count(. | key('categ_key', TABLE-LABEL)[1])=1]">
				<b>
				<A>
					<xsl:attribute name="href">MenuItemDisplay://SysSearchFormHandleUserActions+TableId:<xsl:value-of select="TABLE-ID" />;Page:1;FormKey:<xsl:value-of select="/ROOT/FORM-KEY" />;</xsl:attribute>
					<xsl:value-of select="TABLE-LABEL" />
				</A>
				| 
				</b>
			</xsl:for-each>
		<!-- END TOP LIST OF CATEGORIES -->
		
		<br/>
		<!-- ALSO ADDED CONDITION ON WHICH TABLE ID ITEMS MUST BE SHOWN -->
		<xsl:for-each select="ITEM[ (count(. | key('categ_key', TABLE-LABEL)[1])=1) and ( ($selected_table_id = 0) or ($selected_table_id = ./TABLE-ID) ) ]">
			<!-- BEGIN CATEGORY NAME WITH TOTAL ITEMS NUMBER -->
				<br/><b><xsl:value-of select="TABLE-LABEL" /> (<xsl:value-of select="count(. | key('categ_key', TABLE-LABEL))"/>)
				<xsl:if test="($selected_table_id != 0)">
					[Page: <xsl:value-of select="$page" /> of <xsl:value-of select="ceiling( count(. | key('categ_key', TABLE-LABEL)) div $items_per_page )"/>]
				</xsl:if>
				</b>
			<!-- END CATEGORY NAME WITH TOTAL ITEMS NUMBER -->
			<!-- SHOW ALL ITEMS LIST DEPENDING ON ITEMS PER PAGE-->
			<TABLE>
				<xsl:for-each select="key('categ_key', TABLE-LABEL)[ (position() &gt; $items_per_page * ($page - 1) ) and (position() &lt;= $items_per_page * $page) ]">
					<xsl:sort select="TABLE-LABEL"/>
					<tr>
						<td>
							<font size="2">
								> 
								<A>
									<xsl:attribute name="href">
										<xsl:value-of select="LINK" />
									</xsl:attribute>
									<xsl:value-of select="REC-CAPTION" />
								</A>			
							</font>
						</td>
					</tr>
					<!-- ADD SHOW ALL BUTTON WHEN SHOW HOME PAGE -->
						<xsl:if test="(position() mod 5 = 0) and ($selected_table_id = 0)">
							<tr>
								<td>
									<font size="2">
										<b>
										[
										<A>
											<xsl:attribute name="href">MenuItemDisplay://SysSearchFormHandleUserActions+TableId:<xsl:value-of select="TABLE-ID" />;Page:1;FormKey:<xsl:value-of select="/ROOT/FORM-KEY" />;</xsl:attribute>
											All...
										</A>
										]
										</b>
									</font>
								</td>
							</tr>
						</xsl:if>					
					<!-- END OF ADD SHOW ALL BUTTON WHEN SHOW HOME PAGE -->
				</xsl:for-each>				
			</TABLE>
			<!-- ADD PAGE NAVIGATION WHEN SHOW SPECIFIC ITEM (PREVIOS) -->
				<xsl:if test="($selected_table_id = ./TABLE-ID) and ( ($page &gt; 1) and ($page &lt;= (ceiling( count(. | key('categ_key', TABLE-LABEL)) div $items_per_page )) ) )">
					<font size="2">
						<b>
						[
						<A>
							<xsl:attribute name="href">MenuItemDisplay://SysSearchFormHandleUserActions+TableId:<xsl:value-of select="TABLE-ID" />;Page:<xsl:value-of select="($page - 1)"/>;FormKey:<xsl:value-of select="/ROOT/FORM-KEY" />;</xsl:attribute>
							Previos
						</A>
						]
						</b>
					</font>
				</xsl:if>
			<!-- END OF ADD PAGE NAVIGATION WHEN SHOW SPECIFIC ITEM -->
			<!-- ADD PAGE NAVIGATION WHEN SHOW SPECIFIC ITEM (NEXT) -->
				<xsl:if test="( ($selected_table_id = ./TABLE-ID) and ( $page &lt; ceiling( count(. | key('categ_key', TABLE-LABEL)) div $items_per_page ) ) )">
					<font size="2">
						<b>
						[
						<A>
							<xsl:attribute name="href">MenuItemDisplay://SysSearchFormHandleUserActions+TableId:<xsl:value-of select="TABLE-ID" />;Page:<xsl:value-of select="($page + 1)"/>;FormKey:<xsl:value-of select="/ROOT/FORM-KEY" />;</xsl:attribute>
							Next
						</A>
						]
						</b>
					</font>
				</xsl:if>
			<!-- END OF ADD PAGE NAVIGATION WHEN SHOW SPECIFIC ITEM -->
		</xsl:for-each>
	</xsl:template>
	
</xsl:stylesheet>