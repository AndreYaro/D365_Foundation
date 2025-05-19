<?xml version="1.0" encoding="GB18030"?>
<!-- This stylesheet converts the Batch-tagged Tax CSV file into a flat XML file
where each CSV record line is converted to its corresponding XML record structure. That
XML is then processed by another stylesheet to map to the AX Bank Statement Data Model
(TaxExternal* set of tables).
	-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt"
                version="1.0">
  <xsl:output method="xml" omit-xml-declaration="no" version="1.1" encoding="utf-16"/>

  <!-- This is the entry point to the transform -->
  <xsl:template match ="/" >
    <Batch>
      <Envelope>
        <Header>
        </Header>
        <Body>
          <MessageParts>
            <xsl:variable name="txtToPreProcess" select="/Batch"/>
            <xsl:variable name ="txtToProcess">
              <xsl:call-template name ="inputTxtPreprocessor">
                <xsl:with-param name ="inputTxt" select ="$txtToPreProcess"/>
              </xsl:call-template>
            </xsl:variable>
            <xsl:call-template name="main" >
              <xsl:with-param name="txt" select="$txtToProcess"/>
            </xsl:call-template>
          </MessageParts>
        </Body>
      </Envelope>
    </Batch>
  </xsl:template>

  <!-- This template is similar to the 'main' function in X++. It partitions the file into records
	and gives the record to the 'rowToFields' template which further partitions it into the corresponding 
	fields. Parameters:
	1) txt    - the text that would be handled by this template-->
  <xsl:template name="main">
    <xsl:param name="txt" select="''" />
    <xsl:variable name="left" select="substring-before($txt, '&#xA;')" />
    <xsl:variable name="right" select="substring-after($txt, '&#xA;')" />
    <xsl:choose>
      <xsl:when test="string-length($left)>1" >
        <xsl:call-template name="readInvoiceSet" >
          <xsl:with-param name="txt" select="$left" />
          <xsl:with-param name="rem" select="$right" />
        </xsl:call-template>
      </xsl:when>
      <!--skip the leading empty lines-->
      <xsl:when test="string-length($left)=0 and contains($right, '&#xA;')" >
        <xsl:call-template name="main" >
          <xsl:with-param name="txt" select="$right" />
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  

	<!--read the invoice set-->
  <xsl:template name ="readInvoiceSet" >
    <xsl:param name ="txt" select ="''" />
    <xsl:param name ="rem" select ="''" />
    <xsl:variable name="currentRecord" select="normalize-space(substring-before($txt, '~~'))" />
    <xsl:choose>
      <xsl:when test ="$currentRecord ='SJJK0201'">
        <!-- call invoiceHead recursively for the next record -->
        <xsl:call-template name="invoice" >
          <xsl:with-param name="txt" select="$rem"/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name ="invoice" >
    <xsl:param name ="txt" select ="''" />
    <!-- rowNum indicates different template -->
    <TaxImportLines_CN>
      <xsl:call-template name="scanInvoice" >
        <xsl:with-param name="txt" select="(substring-after($txt, '&#xA;'))"/>
      </xsl:call-template>
    </TaxImportLines_CN>
  </xsl:template>

  <xsl:template name="scanInvoice">
    <xsl:param name ="txt" select ="''" />
    <xsl:variable name="currentLine" select="normalize-space(substring-before($txt, '&#xA;'))" />
    <xsl:choose>
      <xsl:when test ="not(contains($currentLine, '//'))">
        <xsl:call-template name="invoiceBody" >
          <xsl:with-param name="txt" select="$txt"/>
        </xsl:call-template>
        <xsl:variable name="LineNum">
          <xsl:call-template name="getInvoiceNum" >
            <xsl:with-param name="txt" select="$txt"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="remaining">
          <xsl:call-template name="skipRecords" >
            <xsl:with-param name="txt" select="$txt"/>
            <xsl:with-param name="recordsToSkip" select="$LineNum + 1"/>            
          </xsl:call-template>
        </xsl:variable>
        <xsl:if test="string-length($currentLine)>1">
          <xsl:call-template name="scanInvoice" >
            <xsl:with-param name="txt" select="$remaining"/>
          </xsl:call-template>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="string-length($currentLine)>1">
          <xsl:call-template name="scanInvoice" >
            <xsl:with-param name="txt" select="(substring-after($txt, '&#xA;'))"/>
          </xsl:call-template>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
    
  </xsl:template>

  <xsl:template name ="invoiceBody" >
    <xsl:param name ="txt" select ="''" />
    <!--skip the //invoice line-->
    <xsl:variable name="InvoiceHeader" select="normalize-space(substring-before($txt, '&#xA;'))" />
    <xsl:if test="string-length($InvoiceHeader)>1">
      <TaxImportInvoiceTaxIntegrationEntity>
        <xsl:call-template name="invoicedata" >
          <xsl:with-param name="FieldNum" select="1"/>
          <xsl:with-param name ="StringToTransform" select ="$InvoiceHeader" />
        </xsl:call-template>
      </TaxImportInvoiceTaxIntegrationEntity>
    </xsl:if>
  </xsl:template>
  
  <xsl:template name ="getInvoiceNum" >
    <xsl:param name ="txt" select ="''" />
    <!--skip the //invoice line-->
    <xsl:variable name="InvoiceHeader" select="normalize-space(substring-before($txt, '&#xA;'))" />
    <xsl:if test="string-length($InvoiceHeader)>1">
        <xsl:call-template name="_doGetInvoiceLineNum" >
          <xsl:with-param name="FieldNum" select="1"/>
          <xsl:with-param name ="StringToTransform" select ="$InvoiceHeader" />
        </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- This template parses and stores invoicedata  -->
  <xsl:template name ="invoicedata" >
    <xsl:param name="FieldNum" select="1"/>
    <xsl:param name ="StringToTransform" select ="''" />
    <xsl:choose>
      <xsl:when test ="$FieldNum = 1">
        <TaxTxtFileVoidFlagValue>
          <xsl:value-of select ="substring-before($StringToTransform,'~~')" />
        </TaxTxtFileVoidFlagValue>
      </xsl:when>
      <xsl:when test ="$FieldNum = 5">
        <ExternalInvoiceId>
          <xsl:value-of select ="substring-before($StringToTransform,'~~')" />
        </ExternalInvoiceId>
      </xsl:when>
      <xsl:when test ="$FieldNum = 9">
        <Id>
          <xsl:choose>
          <xsl:when test ="contains($StringToTransform, '~~')">
            <xsl:value-of select ="substring-before($StringToTransform,'~~')" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select ="$StringToTransform" />
          </xsl:otherwise>
          </xsl:choose>
        </Id>
      </xsl:when>
    </xsl:choose>
    <xsl:variable name="text" select="substring-after($StringToTransform, '~~')" />
    <xsl:if test="string-length($text)>1" >
      <xsl:call-template name="invoicedata" >
        <xsl:with-param name="FieldNum" select="$FieldNum + 1" />
        <xsl:with-param name="StringToTransform" select="$text" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template name ="_doGetInvoiceLineNum" >
    <xsl:param name="FieldNum" select="1"/>
    <xsl:param name ="StringToTransform" select ="''" />
    <xsl:choose>
      <xsl:when test ="$FieldNum = 6">
          <xsl:value-of select ="substring-before($StringToTransform,'~~')" />
      </xsl:when>
    </xsl:choose>
    <xsl:variable name="text" select="substring-after($StringToTransform, '~~')" />
    <xsl:if test="string-length($text)>1" >
      <xsl:call-template name="_doGetInvoiceLineNum" >
        <xsl:with-param name="FieldNum" select="$FieldNum + 1" />
        <xsl:with-param name="StringToTransform" select="$text" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- This is a helper template that is used to skip records in a given line containing
	comma seperated fields. The parameters are:
	txt				    = The text to skip records in
	recordsToSkip	= The number of records to be skipped
	counter			  = A counter variable to keep track of currently skipped records 
					  in this recursive template. Helps us to get a base condition for recursion. -->
  <xsl:template name ="skipRecords">
    <xsl:param name="txt" select ="''"/>
    <xsl:param name ="recordsToSkip" select ="0"  />
    <xsl:param name ="counter" select ="1" />
    <xsl:choose>
      <xsl:when test="$counter &lt;= $recordsToSkip">
        <xsl:call-template name="skipRecords">
          <xsl:with-param name="txt" select="substring-after($txt,'&#xA;')" />
          <xsl:with-param name="recordsToSkip" select="$recordsToSkip" />
          <xsl:with-param name="counter" select="$counter + 1" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$txt" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- This template PreProcesses the input. PreProcessing involves:-->
  <xsl:template name="inputTxtPreprocessor">
    <xsl:param name ="inputTxt"/>

    <!-- Ensure that all extra redundant spaces are filtered off.-->
    <xsl:variable name="txtSpaceFilteredRecords">
      <xsl:call-template name="filterChars">
        <xsl:with-param name="txt" select="$inputTxt" />
        <xsl:with-param name="charsToFilter" select="'&#32;&#xA;'" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name ="txtCRFilteredRecords">
      <xsl:call-template name="filterChars">
        <xsl:with-param name="txt" select="$txtSpaceFilteredRecords" />
        <xsl:with-param name="charsToFilter" select="'&#xD;&#xA;'" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:value-of select ="$txtCRFilteredRecords"/>
  </xsl:template>

  <!-- Filter uncecessary characters around \n-->
  <xsl:template name="filterChars">
    <xsl:param name="txt" />
    <xsl:param name="charsToFilter" />
    <xsl:choose>
      <xsl:when test="contains($txt, $charsToFilter)">
        <xsl:call-template name="filterChars">
          <xsl:with-param name="txt" select="concat(substring-before($txt,$charsToFilter),'&#xA;')" />
          <xsl:with-param name="charsToFilter" select="$charsToFilter" />
        </xsl:call-template>
        <xsl:call-template name="filterChars">
          <xsl:with-param name="txt" select="substring-after($txt,$charsToFilter)" />
          <xsl:with-param name="charsToFilter" select="$charsToFilter" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise >
        <xsl:value-of select ="$txt"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
