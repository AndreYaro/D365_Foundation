<!-- This stylesheet converts the root-tagged BAI2 CSV file into a flat XML file
where each CSV record line is converted to its corresponding XML record structure. That
XML is then processed by another stylesheet to map to the AX Bank Statement Data Model
(BankStmtISO* set of tables).
	-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt"
xmlns:bai2="http://schemas.microsoft.com/dynamics/2008/01/services/BankStmtISOService/" version="1.0">
  <xsl:output method="xml" omit-xml-declaration="no" version="1.1" encoding="utf-16"/>
  
  <msxsl:script implements-prefix="bai2" language="CSharp">
    <![CDATA[  
      public string replace(string text, string replace, string by)
      {
        return text.Replace(replace, by);
      }
    ]]>  
</msxsl:script>
	<!-- This is the entry point to the transform -->
	<xsl:template match ="/" >
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
			<xsl:call-template name="main" >
				<xsl:with-param name="txt"  select="$txtToProcess"/>
			</xsl:call-template>
		</BankStmtISO>
	</xsl:template>

	<!-- This template is similar to the 'main' function in X++. It partitions the file into records
	and gives the record to the 'rowToFields' template which further partitions it into the corresponding 
	fields. Parameters:
	1) rownum - to keep track of the rows parsed so far if required as part of some extension
	2) txt    - the text that would be handled by this template
	-->
	<xsl:template name="main">
		<xsl:param name="txt" select="''" />
		<xsl:variable name="left" select="substring-before($txt, '&#47;')" />
		<xsl:variable name="right" select="substring-after($txt, '&#47;')" />
		<xsl:if test="string-length($left)>1" >
			<xsl:call-template name="rowToFields" >
				<xsl:with-param name="txt" select="$left" />
				<xsl:with-param name="rem" select="$right" />
				<xsl:with-param name="accountGroup" select="1"/>
				<xsl:with-param name ="transactionGroup" select ="1" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template partitions each record into the corresponding fields based on the record type.
	fields. It also keeps track of the structure of the bank statement by attaching the same 'accountGroup' 
	attribute to all accounts in that accountGroup and the same 'transactionGroup' attribute to all 
	transactions in the same Account. Parameters:
	
	1) txt    - the text that would be handled by this template
	2) rem    - to keep track of the text remaining after the current record
	3) accountGroup - the current account group being traversed to poplate the 'accountGroup' attribute
	4) transactionGroup - the current transaction group being traversed to poplate the 'transactionGroup' atribute
	-->
	<xsl:template name ="rowToFields" >
		<xsl:param name ="txt" select ="''" />
		<xsl:param name ="rem" select ="''" />
		<xsl:param name ="accountGroup" select ="0"/>
		<xsl:param name ="transactionGroup" select="0"/>
		<xsl:param name ="rowNum" select="1"/>
		<xsl:variable name="currentRecord" select="normalize-space(substring-before($txt, ','))" />
		<xsl:variable name="nextRecord" select="substring-before($rem, ',')" />
		<xsl:choose>
			<xsl:when test ="$currentRecord = 01">
				<!-- Record Type '01' indicates file header -->
				<FileHeader>
					<xsl:call-template name="fileHeader" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="concat($txt,',,')" />
					</xsl:call-template>
				</FileHeader>
				<!-- call rowToFields recursively for the next record -->
				<xsl:call-template name="rowToFields" >
					<xsl:with-param name="txt" select="substring-before($rem, '&#47;')"/>
					<xsl:with-param name ="rem" select ="substring-after($rem,'&#47;')" />
					<xsl:with-param name="accountGroup" select="$accountGroup"/>
					<xsl:with-param name ="transactionGroup" select ="$transactionGroup" />
					<xsl:with-param name ="rowNum" select="$rowNum+1"/>
				</xsl:call-template>
			</xsl:when>

			<!-- Record Type '02' indicates group header -->
			<xsl:when test ="$currentRecord = 02">
				<GroupHeader>
					<xsl:attribute name="accountGroup">
						<xsl:value-of select="$accountGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:attribute name="transactionGroup">
						<xsl:value-of select="$transactionGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:call-template name="groupHeader" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="concat($txt,',,')" />
					</xsl:call-template>
				</GroupHeader>
				<!-- call rowToFields recursively for the next record -->
				<xsl:call-template name="rowToFields" >
					<xsl:with-param name="txt" select="substring-before($rem, '&#47;')"/>
					<xsl:with-param name ="rem" select ="substring-after($rem,'&#47;')" />
					<xsl:with-param name="accountGroup" select="$accountGroup"/>
					<xsl:with-param name ="transactionGroup" select ="$transactionGroup" />
					<xsl:with-param name ="rowNum" select="$rowNum+1"/>
				</xsl:call-template>
			</xsl:when>

			<!-- Record Type '03' indicates account info. for that account -->
			<xsl:when test ="$currentRecord = 03">
				<AccountIdentifierAndSummaryStatus>
					<xsl:attribute name="accountGroup">
						<xsl:value-of select="$accountGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:attribute name="transactionGroup">
						<xsl:value-of select="$transactionGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:call-template name="accountIdentifierAndSummaryStatus" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="concat($txt,',,')" />
					</xsl:call-template>
				</AccountIdentifierAndSummaryStatus>
				<!-- call rowToFields recursively for the next record -->
				<xsl:call-template name="rowToFields">
					<xsl:with-param name="txt" select="substring-before($rem, '&#47;&#xA;')"/>
					<xsl:with-param name ="rem" select ="substring-after($rem,'&#47;&#xA;')" />
					<xsl:with-param name="accountGroup" select="$accountGroup"/>
					<xsl:with-param name ="transactionGroup" select ="$transactionGroup" />
					<xsl:with-param name ="rowNum" select="$rowNum+1"/>
				</xsl:call-template>
			</xsl:when>

			<!-- Record Type '16' indicates transaction details info. for that account -->
			<xsl:when test ="$currentRecord = 16">
				<TransactionDetails>
					<xsl:attribute name="accountGroup">
						<xsl:value-of select="$accountGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:attribute name="transactionGroup">
						<xsl:value-of select="$transactionGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:call-template name="transactionDetails" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="concat($txt,',,')" />
					</xsl:call-template>
				</TransactionDetails>
				<!-- call rowToFields recursively for the next record -->
				<xsl:call-template name="rowToFields" >
					<xsl:with-param name="txt" select="substring-before($rem, '&#47;&#xA;')"/>
					<xsl:with-param name ="rem" select ="substring-after($rem,'&#47;&#xA;')" />
					<xsl:with-param name="accountGroup" select="$accountGroup"/>
					<xsl:with-param name ="transactionGroup" select ="$transactionGroup" />
					<xsl:with-param name ="rowNum" select="$rowNum+1"/>
				</xsl:call-template>
			</xsl:when>

			<xsl:when test ="$currentRecord = 49">
				<AccountTrailer>
					<xsl:attribute name="accountGroup">
						<xsl:value-of select="$accountGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:attribute name="transactionGroup">
						<xsl:value-of select="$transactionGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:call-template name="accountTrailer" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="concat($txt,',,')" />
					</xsl:call-template>
					<xsl:variable name="left" select="substring-before($rem, '&#47;')" />
				</AccountTrailer>
				<xsl:call-template name="rowToFields" >
					<xsl:with-param name="txt" select="substring-before($rem, '&#47;')"/>
					<xsl:with-param name ="rem" select ="substring-after($rem,'&#47;')" />
					<xsl:with-param name="accountGroup" select="$accountGroup"/>
					<xsl:with-param name ="transactionGroup" select ="$transactionGroup + 1" />
					<xsl:with-param name ="rowNum" select="$rowNum+1"/>
				</xsl:call-template>
			</xsl:when>

			<xsl:when test ="$currentRecord = 98">
				<GroupTrailer>
					<xsl:attribute name="accountGroup">
						<xsl:value-of select="$accountGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:attribute name="transactionGroup">
						<xsl:value-of select="$transactionGroup" ></xsl:value-of>
					</xsl:attribute>
					<xsl:call-template name="groupTrailer" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="concat($txt,',,')" />
					</xsl:call-template>
				</GroupTrailer>
				<xsl:call-template name="rowToFields" >
					<xsl:with-param name="txt" select="substring-before($rem, '&#47;')"/>
					<xsl:with-param name ="rem" select ="substring-after($rem,'&#47;')" />
					<xsl:with-param name="accountGroup" select="$accountGroup+1"/>
					<xsl:with-param name ="transactionGroup" select ="$transactionGroup+1" />
					<xsl:with-param name ="rowNum" select="$rowNum+1"/>
				</xsl:call-template>
			</xsl:when>

			<xsl:when test ="$currentRecord = 99">
				<FileTrailer>
					<xsl:call-template name="fileTrailer" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="concat($txt,',,')" />
					</xsl:call-template>
				</FileTrailer>
				<xsl:call-template name="rowToFields" >
					<xsl:with-param name="txt" select="substring-before($rem, '&#47;')"/>
					<xsl:with-param name ="rem" select ="substring-after($rem,'&#47;')" />
					<xsl:with-param name ="rowNum" select="$rowNum+1"/>
				</xsl:call-template>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

	<!-- This template parses and stores record type '01'- File Header  -->
	<xsl:template name ="fileHeader" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<RecordCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</RecordCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<SenderId>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Sender Id'"/>
          </xsl:call-template>					
				</SenderId>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<RecieverId>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Reciever Id'"/>
          </xsl:call-template>
				</RecieverId>
			</xsl:when>
			<xsl:when test ="$FieldNum = 4">
				<FileCreationDate>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Creation Date'"/>
          </xsl:call-template>
				</FileCreationDate>
			</xsl:when>
			<xsl:when test ="$FieldNum = 5">
				<FileCreationTime>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Creation Time'"/>
          </xsl:call-template>
				</FileCreationTime>
			</xsl:when>
			<xsl:when test ="$FieldNum = 6">
				<FileIdNumber>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'File Id Number'"/>
          </xsl:call-template>
				</FileIdNumber>
			</xsl:when>
			<xsl:when test ="$FieldNum = 7">
				<PhysicalRecordLength>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</PhysicalRecordLength>
			</xsl:when>
			<xsl:when test ="$FieldNum = 8">
				<BlockSize>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</BlockSize>
			</xsl:when>
			<xsl:when test ="$FieldNum = 9">
				<VersionNumber>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Version Number'"/>
          </xsl:call-template>
				</VersionNumber>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="bai2:throwOutOfPositionException('01', $StringToTransform)"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="fileHeader" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses and stores record type '02'- Group Header  -->
	<xsl:template name ="groupHeader" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<RecordCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</RecordCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<UltimateReceiverId>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</UltimateReceiverId>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<OriginatorId>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Originator Id'"/>
          </xsl:call-template>
				</OriginatorId>
			</xsl:when>
			<xsl:when test ="$FieldNum = 4">
				<GroupStatus>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Group Status'"/>
          </xsl:call-template>
				</GroupStatus>
			</xsl:when>
			<xsl:when test ="$FieldNum = 5">
				<AsOfDate>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'As of Date'"/>
          </xsl:call-template>
				</AsOfDate>
			</xsl:when>
			<xsl:when test ="$FieldNum = 6">
				<AsOfTime>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</AsOfTime>
			</xsl:when>
			<xsl:when test ="$FieldNum = 7">
				<CurrencyCode>
          <xsl:variable name ="currencyCode" select ="substring-before($StringToTransform,',')" />
          <xsl:choose>
            <xsl:when test ="$currencyCode = ''">
              USD
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select ="$currencyCode"/>
            </xsl:otherwise>
          </xsl:choose>
				</CurrencyCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 8">
				<AsOfDateModifier>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</AsOfDateModifier>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="bai2:throwOutOfPositionException('02', $StringToTransform)"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="groupHeader" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses and stores record type '03'- Account Identifier and Summary Status  -->
	<xsl:template name ="accountIdentifierAndSummaryStatus" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<RecordCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</RecordCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<CustomerAccountNumber>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Customer Account Number'"/>
          </xsl:call-template>
				</CustomerAccountNumber>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<CurrencyCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</CurrencyCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 4">
				<xsl:variable name ="remainingText">
					<xsl:call-template name="skipRecords">
						<xsl:with-param name="txt" select="$StringToTransform" />
						<xsl:with-param name="recordsToSkip" select="3" />
						<xsl:with-param name="counter" select="1" />
					</xsl:call-template>
				</xsl:variable>
				<xsl:variable name="fundType" select="substring-before($remainingText,',')"/>
				<xsl:variable name ="fieldsToSkip">
					<xsl:choose>
						<xsl:when test ="$fundType='S'">
							<xsl:value-of select="3"/>
						</xsl:when>
						<xsl:when test ="$fundType='V'">
							<xsl:value-of select="2"/>
						</xsl:when>
						<xsl:when test ="$fundType='D'">
							<xsl:variable name ="numberOfPairs" select="substring-before(substring-after($remainingText,','), ',')"/>
							<xsl:value-of select ="1 + 2*$numberOfPairs"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="0"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<SummaryItem>
					<xsl:call-template name="summaryItems" >
						<xsl:with-param name="FieldNum" select="1"/>
						<xsl:with-param name ="StringToTransform" select ="$StringToTransform" />
					</xsl:call-template>
					<FundAvailibility>
						<FundType>
							<xsl:value-of select="$fundType"/>
						</FundType>
						<xsl:choose >
							<xsl:when test ="$fundType='S'">
								<DistributedAvailibility>
									<xsl:call-template name="distributedAvailibility" >
										<xsl:with-param name="FieldNum" select="1" />
										<xsl:with-param name="StringToTransform" select="substring-after($remainingText,',')" />
									</xsl:call-template>
								</DistributedAvailibility>
							</xsl:when>
							<xsl:when test ="$fundType='V'">
								<ValueDatedAvailibility>
									<xsl:call-template name="valueDatedAvailibility" >
										<xsl:with-param name="FieldNum" select="1" />
										<xsl:with-param name="StringToTransform" select="substring-after($remainingText,',')" />
									</xsl:call-template>
								</ValueDatedAvailibility>
							</xsl:when>
							<xsl:when test ="$fundType='D'">
								<xsl:variable name="numberOfDistributions" select="substring-before(substring-after($remainingText, ','), ',')"/>
								<VariableDistributedAvailibility>
									<NumberOfDistributions>
										<xsl:value-of select="$numberOfDistributions"/>
									</NumberOfDistributions>
									<xsl:call-template name="variableDistributionAvailibility">
										<xsl:with-param name ="itemCounter" select ="1"/>
										<xsl:with-param name ="numberOfDistributions" select ="$numberOfDistributions"/>
										<xsl:with-param name ="stringToTransform" select ="substring-after(substring-after($remainingText,','),',')"/>
									</xsl:call-template>
								</VariableDistributedAvailibility>
							</xsl:when>
						</xsl:choose>
					</FundAvailibility>
				</SummaryItem>
				<xsl:variable name ="textToParse">
					<xsl:call-template name="skipRecords">
						<xsl:with-param name="txt" select="$StringToTransform" />
						<xsl:with-param name="recordsToSkip" select=" 3 + $fieldsToSkip" />
						<xsl:with-param name="counter" select="1" />
					</xsl:call-template>
				</xsl:variable>
				<xsl:if test="string-length(substring-after($textToParse,','))>1" >
					<xsl:call-template name="accountIdentifierAndSummaryStatus">
						<xsl:with-param name="FieldNum" select="4" />
						<xsl:with-param name="StringToTransform" select="substring-after($textToParse,',')" />
					</xsl:call-template>
				</xsl:if>
			</xsl:when>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:choose>
				<xsl:when test ="$FieldNum &lt;= 3">
					<xsl:call-template name="accountIdentifierAndSummaryStatus" >
						<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
						<xsl:with-param name="StringToTransform" select="$text" />
					</xsl:call-template>
				</xsl:when>
			</xsl:choose>
		</xsl:if>
	</xsl:template>

	<!-- There is a 1-to-many mapping between type '3' records and the summary-items it may contain.
	This template parses all Summary Items in a given type '03' record-->
	<xsl:template name ="summaryItems" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<TypeCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</TypeCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<Amount>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</Amount>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<ItemCount>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</ItemCount>
			</xsl:when>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="summaryItems" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses a type '16' transaction record -->
	<xsl:template name ="transactionDetails" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<RecordCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</RecordCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<TypeCode>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Type Code'"/>
          </xsl:call-template>
				</TypeCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<Amount>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</Amount>
			</xsl:when>
			<xsl:when test ="$FieldNum = 4">
				<xsl:variable name="fundType" select="substring-before($StringToTransform,',')"/>
				<xsl:variable name ="fieldsToSkip">
					<xsl:choose>
						<xsl:when test ="$fundType='S'">
							<xsl:value-of select="3"/>
						</xsl:when>
						<xsl:when test ="$fundType='V'">
							<xsl:value-of select="2"/>
						</xsl:when>
						<xsl:when test ="$fundType='D'">
							<xsl:variable name ="numberOfPairs" select="substring-before(substring-after($StringToTransform,','), ',')"/>
							<xsl:value-of select ="1 + 2*$numberOfPairs"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="0"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<FundAvailibility>
					<FundType>
						<xsl:value-of select="$fundType"/>
					</FundType>
					<xsl:choose >
						<xsl:when test ="$fundType='S'">
							<DistributedAvailibility>
								<xsl:call-template name="distributedAvailibility" >
									<xsl:with-param name="FieldNum" select="1" />
									<xsl:with-param name="StringToTransform" select="substring-after($StringToTransform,',')" />
								</xsl:call-template>
							</DistributedAvailibility>
						</xsl:when>
						<xsl:when test ="$fundType='V'">
							<ValueDatedAvailibility>
								<xsl:call-template name="valueDatedAvailibility" >
									<xsl:with-param name="FieldNum" select="1" />
									<xsl:with-param name="StringToTransform" select="substring-after($StringToTransform,',')" />
								</xsl:call-template>
							</ValueDatedAvailibility>
						</xsl:when>
						<xsl:when test ="$fundType='D'">
							<xsl:variable name="numberOfDistributions" select="substring-before(substring-after($StringToTransform, ','),',')"/>
							<VariableDistributedAvailibility>
								<NumberOfDistributions>
									<xsl:value-of select="$numberOfDistributions"/>
								</NumberOfDistributions>
								<xsl:call-template name="variableDistributionAvailibility">
									<xsl:with-param name ="itemCounter" select ="1"/>
									<xsl:with-param name ="numberOfDistributions" select ="$numberOfDistributions"/>
									<xsl:with-param name ="stringToTransform" select ="substring-after(substring-after($StringToTransform, ','),',')"/>
								</xsl:call-template>
							</VariableDistributedAvailibility>
						</xsl:when>
					</xsl:choose>
				</FundAvailibility>
				<xsl:variable name ="textToParse">
					<xsl:call-template name="skipRecords">
						<xsl:with-param name="txt" select="$StringToTransform" />
						<xsl:with-param name="recordsToSkip" select="$fieldsToSkip" />
						<xsl:with-param name="counter" select="1" />
					</xsl:call-template>
				</xsl:variable>
				<xsl:call-template name="otherTransactionDetails">
					<xsl:with-param name="FieldNum" select="1" />
					<xsl:with-param name="StringToTransform" select="substring-after($textToParse,',')" />
				</xsl:call-template>
			</xsl:when>
		</xsl:choose>
      <xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		  <xsl:if test="string-length($text)>1" >
			  <xsl:call-template name="transactionDetails" >
				  <xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				  <xsl:with-param name="StringToTransform" select="$text" />
			  </xsl:call-template>
		  </xsl:if>
	</xsl:template>

	<!-- This template parses the second half of the Type '16' records - Transaction  details. This has been
	seperated from the 'transactionDetails' template to keep the template size reasonably small-->
	<xsl:template name ="otherTransactionDetails" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<BankReferenceNumber>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</BankReferenceNumber>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<CustomerReferenceNumber>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</CustomerReferenceNumber>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<Text>
					<xsl:variable name ="actualTextString">
						<xsl:call-template name="strReplace">
							<xsl:with-param name="txt" select="$StringToTransform" />
							<xsl:with-param name="strToBeReplaced" select="concat('&#xA;',',')" />
							<xsl:with-param name="strToReplace" select="''" />
						</xsl:call-template>
					</xsl:variable>
					<xsl:variable name="lengthOfString" select="string-length($actualTextString)"/>
					<xsl:if test="$lengthOfString &gt; 2">
						<xsl:value-of select="substring($actualTextString,1,$lengthOfString - 2)"/>
					</xsl:if>
				</Text>
			</xsl:when>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1 and $FieldNum &lt; 3" >
			<xsl:call-template name="otherTransactionDetails" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses the details related to the Fund Availibility - specifically 'Distributed Availibility' 
	as specified in the 'FundType' field in	the account statement or transaction-->
	<xsl:template name ="distributedAvailibility">
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<Immediate>
					<xsl:value-of select="substring-before($StringToTransform, ',')"/>
				</Immediate>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<OneDay>
					<xsl:value-of select="substring-before($StringToTransform, ',')"/>
				</OneDay>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<MoreThanOneDay>
					<xsl:value-of select="substring-before($StringToTransform, ',')"/>
				</MoreThanOneDay>
			</xsl:when>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="distributedAvailibility" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses the details related to the Fund Availibility - specifically 'Value dated Availibility' 
	as specified in the 'FundType' field in	the account statement or transaction-->
	<xsl:template name ="valueDatedAvailibility">
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<ValueDate>
					<xsl:value-of select="substring-before($StringToTransform, ',')"/>
				</ValueDate>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<ValueTime>
					<xsl:value-of select="substring-before($StringToTransform, ',')"/>
				</ValueTime>
			</xsl:when>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="valueDatedAvailibility" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses the details related to the Fund Availibility - specifically 'Variable Distributed
	Availibility' as specified in the 'FundType' field in the account statement or transaction-->
	<xsl:template name ="variableDistributionAvailibility">
		<xsl:param name="itemCounter" select="1"/>
		<xsl:param name="numberOfDistributions" select ="1" />
		<xsl:param name ="stringToTransform" select ="''" />
    <xsl:if test="$itemCounter &lt;= $numberOfDistributions">
		  <Distribution>
			  <xsl:call-template name="dayAmountPairs" >
				  <xsl:with-param name="FieldNum" select="1" />
				  <xsl:with-param name="StringToTransform" select="$stringToTransform" />
			  </xsl:call-template>
		  </Distribution>
		  <xsl:if test="string-length($stringToTransform)>1" >
			  <xsl:variable name ="textToParse">
				  <xsl:call-template name="skipRecords">
					  <xsl:with-param name="txt" select="$stringToTransform" />
					  <xsl:with-param name="recordsToSkip" select="2" />
					  <xsl:with-param name="counter" select="1" />
				  </xsl:call-template>
			  </xsl:variable >
			  <xsl:if test="string-length($textToParse)>1">
				  <xsl:call-template name="variableDistributionAvailibility" >
					  <xsl:with-param name="itemCounter" select="$itemCounter + 1" />
					  <xsl:with-param name ="numberOfDistributions" select ="$numberOfDistributions"/>
					  <xsl:with-param name="stringToTransform" select="$textToParse" />
				  </xsl:call-template>
			  </xsl:if>
		  </xsl:if>
    </xsl:if>
	</xsl:template>

	<!-- This template parses the details related to the Day and Amount pairs in 'FundType' records
	with 'Variable Distributed Availibility' as specified in the 'FundType' field in the 
	account statement or transaction-->
	<xsl:template name="dayAmountPairs">
		<xsl:param name="FieldNum" select="''"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<NumberOfDays>
					<xsl:value-of select="substring-before($StringToTransform, ',')"/>
				</NumberOfDays>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<Amount>
					<xsl:value-of select="substring-before($StringToTransform, ',')"/>
				</Amount>
			</xsl:when>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="dayAmountPairs" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses a type '49' - 'Account Trailer' record -->
	<xsl:template name ="accountTrailer" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<RecordCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</RecordCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<AccountControlTotal>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Account Control Total'"/>
          </xsl:call-template>
				</AccountControlTotal>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<NumberOfRecords>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Number of Records'"/>
          </xsl:call-template>
				</NumberOfRecords>
			</xsl:when>
			<xsl:when test ="$FieldNum = 4">
				<FileIdNumber>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</FileIdNumber>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="bai2:throwOutOfPositionException('49',  $StringToTransform)"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="accountTrailer" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses a type '98' - 'Group Trailer' record -->
	<xsl:template name ="groupTrailer" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<RecordCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</RecordCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<GroupControlTotal>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Group Control Total'"/>
          </xsl:call-template>
				</GroupControlTotal>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<NumberOfAccounts>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Number of Accounts'"/>
          </xsl:call-template>
				</NumberOfAccounts>
			</xsl:when>
			<xsl:when test ="$FieldNum = 4">
				<NumberOfRecords>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Records in Group'"/>
          </xsl:call-template>
				</NumberOfRecords>
			</xsl:when>
			<xsl:when test ="$FieldNum = 5">
				<FileIdNumber>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</FileIdNumber>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="bai2:throwOutOfPositionException('98', $StringToTransform)"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="groupTrailer" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- This template parses a type '99' - 'File Trailer' record -->
	<xsl:template name ="fileTrailer" >
		<xsl:param name="FieldNum" select="1"/>
		<xsl:param name ="StringToTransform" select ="''" />
		<xsl:choose>
			<xsl:when test ="$FieldNum = 1">
				<RecordCode>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</RecordCode>
			</xsl:when>
			<xsl:when test ="$FieldNum = 2">
				<FileControlTotal>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'File Control Total'"/>
          </xsl:call-template>
				</FileControlTotal>
			</xsl:when>
			<xsl:when test ="$FieldNum = 3">
				<NumberOfGroups>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Number of Groups'"/>
          </xsl:call-template>
				</NumberOfGroups>
			</xsl:when>
			<xsl:when test ="$FieldNum = 4">
				<NumberOfRecords>
          <xsl:call-template name="checkMandatory">
            <xsl:with-param name ="txt" select ="substring-before($StringToTransform,',')"/>
            <xsl:with-param name="fieldName" select ="'Number of Records'"/>
          </xsl:call-template>
				</NumberOfRecords>
			</xsl:when>
			<xsl:when test ="$FieldNum = 5">
				<FileIdNumber>
					<xsl:value-of select ="substring-before($StringToTransform,',')" />
				</FileIdNumber>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="bai2:throwOutOfPositionException('99', $StringToTransform)"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:variable name="text" select="substring-after($StringToTransform, ',')" />
		<xsl:if test="string-length($text)>1" >
			<xsl:call-template name="fileTrailer" >
				<xsl:with-param name="FieldNum" select="$FieldNum + 1" />
				<xsl:with-param name="StringToTransform" select="$text" />
			</xsl:call-template>
		</xsl:if>
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

	<!-- This template PreProcesses the input. PreProcessing involves:
	1) Ensuring that all continuation ('88') type records are correcly appended to their parent records
	2) Ensuring that all records end with a consistent '/' as the end of record indicator-->
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

		<!-- Any records of type '88' with previous record ending with '/' are a continuation of
			the previous record beginning with a new field based on the BAI2 format spec.-->
		<xsl:variable name="txtContinuousRecords">
			<xsl:call-template name="strReplace">
				<xsl:with-param name="txt" select="$txtCRFilteredRecords" />
				<xsl:with-param name="strToBeReplaced" select="concat('&#47;&#xA;','88,')" />
				<xsl:with-param name="strToReplace" select="','"/>
			</xsl:call-template>
		</xsl:variable>

		<!-- Any records of type '88' that were not replaced in the previous step are a continuation
			of the previous field based on the BAI2 format spec.-->
		<xsl:variable name="txtContinuousFields">
			<xsl:call-template name="strReplace">
				<xsl:with-param name="txt" select="$txtContinuousRecords" />
				<xsl:with-param name="strToBeReplaced" select="concat('&#xA;','88,')" />
				<xsl:with-param name="strToReplace" select="''" />
			</xsl:call-template>
		</xsl:variable>

		<!-- Any records of type '49' or '16' with previous record ending with '/' indicate the beginning 
			of a new record. However, there might be other records that end with a text field which would not have
			a '/' in the end and hence we need to get all such records. We do that in a 2 step process.
			a) preProcess -replace all '/\n49' and '/\n16' with '\n49' and '\n16'
			b) process    -replace all '\n49' and '\n16'with '/\n49' and '/\n16' respectively
			the format is guarenteed not to have \n in its text fields or at other places-->
		<xsl:variable name="txtPreProcessTrailers">
			<xsl:call-template name="strReplace">
				<xsl:with-param name="txt" select="$txtContinuousFields" />
				<xsl:with-param name="strToBeReplaced" select="concat('&#47;&#xA;','49,')" />
				<xsl:with-param name="strToReplace" select="concat('&#xA;','49,')" />
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="txtPreProcessTransactions">
			<xsl:call-template name="strReplace">
				<xsl:with-param name="txt" select="$txtPreProcessTrailers" />
				<xsl:with-param name="strToBeReplaced" select="concat('&#47;&#xA;','16,')" />
				<xsl:with-param name="strToReplace" select="concat('&#xA;','16,')" />
			</xsl:call-template>
		</xsl:variable>

		<xsl:variable name="txtProcessTrailers">
			<xsl:call-template name="strReplace">
				<xsl:with-param name="txt" select="$txtPreProcessTransactions" />
				<xsl:with-param name="strToBeReplaced" select="concat('&#xA;','49,')" />
				<xsl:with-param name="strToReplace" select="concat('&#47;&#xA;','49,')" />
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="txtProcessTransactions">
			<xsl:call-template name="strReplace">
				<xsl:with-param name="txt" select="$txtProcessTrailers" />
				<xsl:with-param name="strToBeReplaced" select="concat('&#xA;','16,')" />
				<xsl:with-param name="strToReplace" select="concat('&#47;&#xA;','16,')" />
			</xsl:call-template>
		</xsl:variable>
		<xsl:value-of select ="$txtProcessTransactions"/>
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
        <xsl:value-of select="bai2:replace($txt, $strToBeReplaced, $strToReplace )" />
      </xsl:when>
	    <xsl:otherwise>
				<xsl:value-of select="$txt" />
			</xsl:otherwise>
		</xsl:choose>
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
					<xsl:with-param name="txt" select="substring-after($txt,',')" />
					<xsl:with-param name="recordsToSkip" select="$recordsToSkip" />
					<xsl:with-param name="counter" select="$counter + 1" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$txt" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>


  <!-- This is a helper template that is used to check for mandatory fields and throw an exception if missing
	txt				    = The text from which the first field is mandatory  
  fieldName     = The field name which is missing-->
  <xsl:template name ="checkMandatory">
    <xsl:param name="txt" select ="''"/>
    <xsl:param name="fieldName" select ="''"/>
    <xsl:choose>
      <xsl:when test="$txt != ''">
        <xsl:value-of select="$txt" />       
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select ="bai2:throwMissingFieldException($fieldName)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

	<msxsl:script language="C#" implements-prefix="bai2">
		<![CDATA[
	 //We send the Error Text and the Record Type to the AIF Exception Log.
     //AIF currently does not support parameters on localized exception labels. 
	 //Once it does we'll pass the errorText as parameter
     public string throwOutOfPositionException(string recordCode, string errorText){
		switch(recordCode)
		{
			case "01":
				throw new System.Exception("@SYS320582");
				break;
			
			case "02":
				throw new System.Exception("@SYS320588");
				break;
				
			case "03":
				throw new System.Exception("@SYS320589");
				break;
			
			case "16":
				throw new System.Exception("@SYS320590");
				break;
			
			case "49":
				throw new System.Exception("@SYS320591");
				break;
				
			case "98":
				throw new System.Exception("@SYS320592");
				break;
			
			case "99":
				throw new System.Exception("@SYS320593");
				break;
			
			default:
				throw new System.Exception("@SYS87988");
				break;
		}       
     }
     
     public string throwMissingFieldException(string errorText){
          throw new System.Exception("@SYS320594");
     }]]>
	</msxsl:script>
</xsl:stylesheet>
