<?xml version="1.0" encoding="GB18030"?>
<!-- This stylesheet converts the root-tagged ICBC dlt file into a flat XML file
where each record line is converted to its corresponding XML record structure. That
XML is then processed by another stylesheet to map to the AX Bank Statement Data Model
(BankStmtISO* set of tables).
	-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt"
xmlns:bsiso="http://schemas.microsoft.com/dynamics/2008/01/services/BankStmtISOService/" version="1.0">
  <xsl:output method="xml" version="1.1"/>

  <!-- This is the entry point to the transform -->
  <xsl:template match="/">
    <BankStmtISO>
      <!-- Select all the text you need to PreProcess and send it to the PreProcessor  
			The PreProcessor returns the value in 'txtToProcess' -->
      <xsl:variable name="txtToPreProcess" select="/Batch"/>
      <xsl:variable name ="txtToProcess">
        <xsl:call-template name ="inputTxtPreprocessor">
          <xsl:with-param name ="inputTxt" select ="$txtToPreProcess"/>
        </xsl:call-template>
      </xsl:variable>
      
      <!-- Call the main template giving it the 'txtToProcess' as a parameter -->
      <xsl:call-template name="main">
        <xsl:with-param name="txt" select="$txtToProcess"/>
      </xsl:call-template>
    </BankStmtISO>
  </xsl:template>

  <!-- This template is similar to the 'main' function in X++. It gives all text you need to transfrom to 
  ProcessTransform template. Parameters:
	1) txt    - the text you need to transfrom.
	-->
  <xsl:template name="main">
    <xsl:param name="txt" select="''" />
    <xsl:call-template name="ProcessTransform">
      <xsl:with-param name="LineNum" select="1"/>
      <xsl:with-param name="allTxt" select="$txt"/>
    </xsl:call-template>
  </xsl:template>

  <!-- This template partitions the text into the single lines. Then take corresponding processing based 
  on the different LineNum. Parameters:
	1) LineNum  - to keep track of the lines parsed so far, so that we can take different processing for
                  different LineNum
  2) allTxt   - the text that would be handled by this template
	-->
  <xsl:template name="ProcessTransform">
    <xsl:param name="LineNum" select="1"/>
    <xsl:param name="allTxt" select="''"/>
    <xsl:variable name="rowSeperator" select="concat('&#xA;', '^')"/>
    <xsl:variable name="currentLine">
      <xsl:choose>
        <xsl:when test="contains($allTxt, $rowSeperator)">
          <!--If the param $allTxt contains $rowSeperator, the text before the first $rowSeperator is next line.-->
          <xsl:value-of select="substring-before($allTxt, $rowSeperator)"/>
        </xsl:when>
        <xsl:otherwise>
          <!--If the parameter $allTxt doesn't contain $rowSeperator, it shows that there only is a line 
          in the parameter $allTxt-->
          <xsl:value-of select="$allTxt"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$LineNum = 1">
        <!--The first line is file identification-->
        <FildHeader>
          <FileIdentification>
            <xsl:value-of select="$currentLine"/>
          </FileIdentification>
        </FildHeader>
      </xsl:when>
      <!--The second line is title line, skip it-->
      <xsl:when test="$LineNum &gt; 2">
        <!--When LineNum greater than 2, shows that the line is transaction line, here call 
        template LineToField to transform it-->
        <StatementLine>
          <xsl:call-template name="LineToFields">
            <xsl:with-param name="FieldNum" select="1"/>
            <xsl:with-param name="StringToTransform" select ="$currentLine"/>
          </xsl:call-template>
        </StatementLine>
      </xsl:when>
    </xsl:choose>
    <xsl:variable name="remLines" select="substring-after($allTxt, $rowSeperator)" />
    <xsl:if test="string-length($remLines)>1" >
      <xsl:call-template name="ProcessTransform" >
        <xsl:with-param name="LineNum" select="$LineNum + 1" />
        <xsl:with-param name="allTxt" select="$remLines" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- This template partitions each transaction line into the corresponding fields.
  Parameters:
	1) FieldNum           - to keep track of the fields parsed so far;
	2) StringToTransform  - the text that would be handled by this template
	-->
  <xsl:template name="LineToFields">
    <xsl:param name="FieldNum" select="1"/>
    <xsl:param name="StringToTransform" select="''"/>
    <xsl:variable name="fieldSeperator" select="'^'"/>
    <xsl:variable name="fieldText">
      <xsl:choose>
        <xsl:when test="contains($StringToTransform, $fieldSeperator)">
          <!--If the param StringToTransform contains '^', the text before the first '^' is next field.-->
          <xsl:value-of select="substring-before($StringToTransform, $fieldSeperator)"/>
        </xsl:when>
        <xsl:otherwise>
          <!--If the parameter StringToTransform doesn't contain '^', it shows that there only is a field 
          in the parameter StringToTransform-->
          <xsl:value-of select="$StringToTransform"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$FieldNum = 1">
        <EntryReference>
          <xsl:value-of select="$fieldText"/>
        </EntryReference>
      </xsl:when>
      <xsl:when test="$FieldNum = 2">
        <BankAccountNumber>
          <xsl:value-of select="$fieldText"/>
        </BankAccountNumber>
      </xsl:when>
      <xsl:when test="$FieldNum = 3">
        <RelatedBankAccountNumber>
          <xsl:value-of select="$fieldText"/>
        </RelatedBankAccountNumber>
      </xsl:when>
      <xsl:when test="$FieldNum = 4">
        <DateTime>
          <xsl:value-of select="$fieldText"/>
        </DateTime>
      </xsl:when>
      <xsl:when test="$FieldNum = 5">
        <Dicrection>
          <xsl:value-of select="substring-before($fieldText, '~')"/>
        </Dicrection>
          <xsl:variable name="amountText">
            <xsl:value-of select="substring-after($fieldText, '~')"/>
          </xsl:variable>
        <DebitAmount>
          <xsl:value-of select="substring-before($amountText, '~')"/>
        </DebitAmount>
        <CreditAmount>
          <xsl:value-of select="substring-after($amountText, '~')"/>
        </CreditAmount>  
      </xsl:when>
      <xsl:when test="$FieldNum = 6">
        <RelatedBank>
          <xsl:value-of select="$fieldText"/>
        </RelatedBank>
      </xsl:when>
      <xsl:when test="$FieldNum = 7">
        <Description>
          <xsl:value-of select="$fieldText"/>
        </Description>
      </xsl:when>
      <xsl:when test="$FieldNum = 8">
        <TransactionCode>
          <xsl:value-of select="$fieldText"/>
        </TransactionCode>
      </xsl:when>
      <xsl:when test="$FieldNum = 9">
        <TradingParty>
          <xsl:value-of select="$fieldText"/>
        </TradingParty>
      </xsl:when>
    </xsl:choose>
    <xsl:variable name="text" select="substring-after($StringToTransform, $fieldSeperator)" />
    <xsl:if test="string-length($text)>1" >
      <xsl:call-template name="LineToFields" >
        <xsl:with-param name="FieldNum" select="$FieldNum + 1" />
        <xsl:with-param name="StringToTransform" select="$text" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- This template PreProcesses the input. PreProcessing replaces all "'" with '^' so that all field seperators
  are the same.
  -->
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
    
    <!--Replace all "'" with "^"-->
    <xsl:variable name="txtWithAllSingleQuoteBeReplaced">
      <xsl:call-template name="strReplace">
        <xsl:with-param name="txt" select="$txtCRFilteredRecords"/>
        <xsl:with-param name="strToBeReplaced">'</xsl:with-param>
        <xsl:with-param name="strToReplace" select="'^'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:value-of select="$txtWithAllSingleQuoteBeReplaced"/>
  </xsl:template>

  <!-- This is a simple string replacement helper template. It had to be written since AIF does not
	support XSLT 2.0 and XSLT 1.0 does not have this function built in.
	Parameters:
	txt				      = The text on which replacement is to be performed
	strToBeReplaced = The string in 'txt' that needs replacement
	strToReplace	  = The string that replaces 'strToBeReplaced' in 'txt'-->
  <xsl:template name="strReplace">
    <xsl:param name="txt" />
    <xsl:param name="strToBeReplaced" />
    <xsl:param name="strToReplace" />
    <xsl:choose>
      <xsl:when test="contains($txt, $strToBeReplaced)">
        <xsl:value-of select="substring-before($txt,$strToBeReplaced)" />
        <xsl:value-of select="$strToReplace" />
        <xsl:call-template name="strReplace">
          <xsl:with-param name="txt" select="substring-after($txt,$strToBeReplaced)" />
          <xsl:with-param name="strToBeReplaced" select="$strToBeReplaced" />
          <xsl:with-param name="strToReplace" select="$strToReplace" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$txt" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
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

