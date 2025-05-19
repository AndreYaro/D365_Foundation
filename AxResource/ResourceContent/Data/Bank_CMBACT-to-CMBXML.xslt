<?xml version="1.0" encoding="GB18030"?>
<!-- This stylesheet converts the root-tagged CMB act file into a flat XML file
where each record line is converted to its corresponding XML record structure. That
XML is then processed by another stylesheet to map to the AX Bank Statement Data Model
(BankStmtISO* set of tables).
	-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt"
xmlns:cmb="http://schemas.microsoft.com/dynamics/2008/01/services/BankStmtISOService/" version="1.0">
  <xsl:output method="xml" version="1.0"/>

  <!-- This is the entry point to the transform -->
  <xsl:template match="/">
    <BankStmtISO>
      <!-- Select all the text after '#' in the bank reconciliation statement and send it to the PreProcessor  
			The PreProcessor returns the value in 'txtToProcess' -->
      <xsl:variable name="txtToPreProcess" select="substring-after(/Batch, '#')"/>
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

  <!-- This template is similar to the 'main' function in X++. It partitions the file into header line and 
  transaction line, the gives the header line to the 'headerToFields' template which further partitions it 
  into the corresponding header fields and gives the transaction lines to TransformLines template for further 
  processing. Parameters:
	1) txt    - the text that would be handled by this template
	-->
  <xsl:template name="main">
    <xsl:param name="txt" select="''"/>
    <xsl:variable name="rowSeperator" select="'&#xA;'"/>
    <xsl:variable name="header" select="substring-before($txt, $rowSeperator)" />
    <xsl:variable name="lines" select="substring-after($txt, $rowSeperator)" />
    <xsl:if test ="string-length($header)>0">
      <StatementHaeder>
        <xsl:call-template name="headerToFields">
          <xsl:with-param name="FieldNum" select="1"/>
          <xsl:with-param name ="StringToTransform" select="$header"/>
        </xsl:call-template>
      </StatementHaeder>
    </xsl:if>
    <xsl:if test="string-length($lines)>0">
      <Transactions>
        <xsl:call-template name="TransformLines">
          <xsl:with-param name="lineString" select="$lines"/>
        </xsl:call-template>
      </Transactions>
    </xsl:if>
  </xsl:template>

  <!-- This template partitions the header line into the corresponding header fields.
  Parameters:
	1) FieldNum           - to keep track of the fields parsed so far;
	2) StringToTransform  - the text that would be handled by this template
	-->
  <xsl:template name="headerToFields">
    <xsl:param name="StringToTransform" select="''"/>
    <xsl:variable name="fieldSeperator" select="' ;'"/>
    <xsl:variable name="fieldText">
      <xsl:choose>
        <xsl:when test="contains($StringToTransform, $fieldSeperator)">
          <!--If the param StringToTransform contains fieldSeperator, the text before the first fieldSeperator is next field.-->
          <xsl:value-of select="substring-before($StringToTransform, $fieldSeperator)"/>
        </xsl:when>
        <xsl:otherwise>
          <!--If the parameter StringToTransform doesn't contain fieldSeperator, it shows that there only is a field 
          in the parameter StringToTransform-->
          <xsl:value-of select="$StringToTransform"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="fieldName" select="substring-before($fieldText, '=')"/>
    <xsl:choose>
      <xsl:when test="$fieldName = 'BANKCODE'">
        <BankCode>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </BankCode>
      </xsl:when>
      <xsl:when test="$fieldName = 'VERSION'">
        <Version>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </Version>
      </xsl:when>
      <xsl:when test="$fieldName = 'TYPE'">
        <Type>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </Type>
      </xsl:when>
      <xsl:when test="$fieldName = 'ACCOUNT'">
        <Account>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </Account>
      </xsl:when>
      <xsl:when test="$fieldName = 'CURRENCY'">
        <Currency>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </Currency>
      </xsl:when>
      <xsl:when test="$fieldName = 'MAKEDATE'">
        <MakeDate>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </MakeDate>
      </xsl:when>
      <xsl:when test="$fieldName = 'OPERATOR'">
        <Operator>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </Operator>
      </xsl:when>
      <xsl:when test="$fieldName = 'SUMDEBIT'">
        <SumDebit>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </SumDebit>
      </xsl:when>
      <xsl:when test="$fieldName = 'TOTALDEBIT'">
        <TotalDebit>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </TotalDebit>
      </xsl:when>
      <xsl:when test="$fieldName = 'SUMCREDIT'">
        <SumCredit>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </SumCredit>
      </xsl:when>
      <xsl:when test="$fieldName = 'TOTALCREDIT'">
        <TotalCredit>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </TotalCredit>
      </xsl:when>
      <xsl:when test="$fieldName = 'BEGINBALANCE'">
        <BeginBalance>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </BeginBalance>
      </xsl:when>
      <xsl:when test="$fieldName = 'BALANCE'">
        <Balance>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </Balance>
      </xsl:when>
      <xsl:when test="$fieldName = 'BEGINDATE'">
        <BeginDate>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </BeginDate>
      </xsl:when>
      <xsl:when test="$fieldName = 'ENDDATE'">
        <EndDate>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </EndDate>
      </xsl:when>
      <xsl:when test="$fieldName = 'BANKAREA'">
        <BankArea>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </BankArea>
      </xsl:when>
      <xsl:when test="$fieldName = 'CORPNAME'">
        <CorpName>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </CorpName>
      </xsl:when>
    </xsl:choose>
    <xsl:variable name="text" select="substring-after($StringToTransform, $fieldSeperator)" />
    <xsl:if test="string-length($text)>1" >
      <xsl:call-template name="headerToFields" >
        <xsl:with-param name="StringToTransform" select="$text" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- This template partitions the transaction lines into single transaction record and gives the record
  to the 'lineToFields' template which further partitions it into the corresponding fields. 
  Parameters:
	1) lineString    - the text that would be handled by this template
	-->
  <xsl:template name="TransformLines">
    <xsl:param name="lineString" select="''"/>
    <xsl:variable name="rowSeperator" select="'&#xA;'"/>
    <xsl:variable name="currentLine">
      <xsl:choose>
        <xsl:when test="contains($lineString, $rowSeperator)">
          <!--If the param $lineString contains $rowSeperator, the text before the first $rowSeperator is next line.-->
          <xsl:value-of select="substring-before($lineString, $rowSeperator)"/>
        </xsl:when>
        <xsl:otherwise>
          <!--If the parameter $lineString doesn't contain $rowSeperator, it shows that there only is a line in the 
          parameter $allTxt-->
          <xsl:value-of select="$lineString"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="remLines" select="substring-after($lineString, $rowSeperator)"/>
    <StatementLine>
      <xsl:call-template name="lineToFields">
        <xsl:with-param name="FieldNum" select="1"/>
        <xsl:with-param name="StringToTransform" select="$currentLine"/>
      </xsl:call-template>
    </StatementLine>
    <xsl:if test="string-length($remLines)>1">
      <xsl:call-template name="TransformLines">
        <xsl:with-param name="lineString" select="$remLines"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- This template partitions transaction line into the corresponding fields.
  Parameters:
	1) FieldNum           - to keep track of the fields parsed so far;
	2) StringToTransform  - the text that would be handled by this template
	-->
  <xsl:template name="lineToFields">
    <xsl:param name="StringToTransform" select="''"/>
    <xsl:variable name="fieldSeperator" select="' ;'"/>
    <xsl:variable name="fieldText">
      <xsl:choose>
        <xsl:when test="contains($StringToTransform, $fieldSeperator)">
          <!--If the param StringToTransform contains fieldSeperator, the text before the first fieldSeperator is next field.-->
          <xsl:value-of select="substring-before($StringToTransform, $fieldSeperator)"/>
        </xsl:when>
        <xsl:otherwise>
          <!--If the parameter StringToTransform doesn't contain fieldSeperator, it shows that there only is a field 
          in the parameter StringToTransform-->
          <xsl:value-of select="$StringToTransform"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="fieldName" select="substring-before($fieldText, '=')"/>
    <xsl:choose>
      <xsl:when test="$fieldName = 'ETYDAT'">
        <ETYDAT>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </ETYDAT>
      </xsl:when>
      <xsl:when test="$fieldName = 'ETYTIM'">
        <ETYTIM>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </ETYTIM>
      </xsl:when>
      <xsl:when test="$fieldName = 'VLTDAT'">
        <VLTDAT>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </VLTDAT>
      </xsl:when>
      <xsl:when test="$fieldName = 'TRSCOD'">
        <TRSCOD>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </TRSCOD>
      </xsl:when>
      <xsl:when test="$fieldName = 'NARYUR'">
        <NARYUR>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </NARYUR>
      </xsl:when>
      <xsl:when test="$fieldName = 'TRSAMTD'">
        <TRSAMTD>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </TRSAMTD>
      </xsl:when>
      <xsl:when test="$fieldName = 'TRSAMTC'">
        <TRSAMTC>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </TRSAMTC>
      </xsl:when>
      <xsl:when test="$fieldName = 'TRSBLV'">
        <TRSBLV>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </TRSBLV>
      </xsl:when>
      <xsl:when test="$fieldName = 'REFNBR'">
        <REFNBR>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </REFNBR>
      </xsl:when>
      <xsl:when test="$fieldName = 'REQNBR'">
        <REQNBR>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </REQNBR>
      </xsl:when>
      <xsl:when test="$fieldName = 'BUSNAM'">
        <BUSNAM>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </BUSNAM>
      </xsl:when>
      <xsl:when test="$fieldName = 'NUSAGE'">
        <NUSAGE>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </NUSAGE>
      </xsl:when>
      <xsl:when test="$fieldName = 'YURREF'">
        <YURREF>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </YURREF>
      </xsl:when>
      <xsl:when test="$fieldName = 'BUSNAR'">
        <BUSNAR>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </BUSNAR>
      </xsl:when>
      <xsl:when test="$fieldName = 'OTRNAR'">
        <OTRNAR>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </OTRNAR>
      </xsl:when>
      <xsl:when test="$fieldName = 'C_RPYBBK'">
        <C_RPYBBK>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </C_RPYBBK>
      </xsl:when>
      <xsl:when test="$fieldName = 'RPYNAM'">
        <RPYNAM>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </RPYNAM>
      </xsl:when>
      <xsl:when test="$fieldName = 'RPYACC'">
        <RPYACC>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </RPYACC>
      </xsl:when>
      <xsl:when test="$fieldName = 'RPYBBN'">
        <RPYBBN>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </RPYBBN>
      </xsl:when>
      <xsl:when test="$fieldName = 'RPYBNK'">
        <RPYBNK>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </RPYBNK>
      </xsl:when>
      <xsl:when test="$fieldName = 'RPYADR'">
        <RPYADR>
          <xsl:value-of select="substring-after($fieldText, '=')" />
        </RPYADR>
      </xsl:when>
      <xsl:when test="$fieldName = 'C_GSBBBK'">
        <C_GSBBBK>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </C_GSBBBK>
      </xsl:when>
      <xsl:when test="$fieldName = 'GSBACC'">
        <GSBACC>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </GSBACC>
      </xsl:when>
      <xsl:when test="$fieldName = 'GSBNAM'">
        <GSBNAM>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </GSBNAM>
      </xsl:when>
      <xsl:when test="$fieldName = 'INFFLG'">
        <INFFLG>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </INFFLG>
      </xsl:when>
      <xsl:when test="$fieldName = 'C_ATHFLG'">
        <C_ATHFLG>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </C_ATHFLG>
      </xsl:when>
      <xsl:when test="$fieldName = 'CHKNBR'">
        <CHKNBR>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </CHKNBR>
      </xsl:when>
      <xsl:when test="$fieldName = 'RSVFLG'">
        <RSVFLG>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </RSVFLG>
      </xsl:when>
      <xsl:when test="$fieldName = 'NAREXT'">
        <NAREXT>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </NAREXT>
      </xsl:when>
      <xsl:when test="$fieldName = 'TRSANL'">
        <TRSANL>
          <xsl:value-of select="substring-after($fieldText, '=')"/>
        </TRSANL>
      </xsl:when>
    </xsl:choose>
    <xsl:variable name="text" select="substring-after($StringToTransform, $fieldSeperator)" />
    <xsl:if test="string-length($text)>1" >
      <xsl:call-template name="lineToFields">
        <xsl:with-param name="StringToTransform" select="$text" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- This template PreProcesses the input. Filter all potential redundant spaces.-->
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
    <xsl:value-of select="$txtCRFilteredRecords"/>
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
