<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:wt="http://schemas.microsoft.com/dynamics/2011/01/documents/Message" 
                xmlns:s1="http://schemas.microsoft.com/dynamics/2008/01/documents/VendPayments" 
                version="1.0">
  <xsl:output method="xml" encoding="iso-8859-1" />
  <!--Copy all nodes from source-->

  <xsl:template match="/">
    <xsl:text disable-output-escaping="yes">&lt;?xml version="1.0" encoding="utf-8"?&gt;</xsl:text>
    <xsl:copy-of select="wt:Envelope/wt:Body/wt:MessageParts/*" />
  </xsl:template>

</xsl:stylesheet>