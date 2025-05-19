<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:wt="http://schemas.microsoft.com/dynamics/2011/01/documents/Message" version="1.0">
<xsl:output method="xml" encoding="utf-16"/>
<xsl:template match ="/" >	
		<xsl:apply-templates select ="wt:Envelope/wt:Body/wt:MessageParts"/>
</xsl:template>
<xsl:template match ="MessageParts" >
	<xsl:copy-of select ="*"/>
</xsl:template>
</xsl:stylesheet>