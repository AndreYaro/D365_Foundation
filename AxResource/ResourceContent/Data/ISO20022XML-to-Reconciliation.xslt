<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl"
                xmlns:bsiso="http://schemas.microsoft.com/dynamics/2008/01/services/BankStmtService/"
                xmlns="http://schemas.microsoft.com/dynamics/2008/01/documents/BankStmt"
                xmlns:message="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
                
  <xsl:output method="xml" omit-xml-declaration="no" version="1.0" encoding="utf-16"/>

  <xsl:template match ="/" >
    <Batch xmlns="http://schemas.microsoft.com/dynamics/2009/06/documents/Batch" xmlns:msxsl="urn:schemas-microsoft-com:xslt">
      <Envelope xmlns="http://schemas.microsoft.com/dynamics/2011/01/documents/Message">
        <Header>
          <Action>http://tempuri.org/BankStmtService/create</Action>
        </Header>
        <Body>
          <MessageParts>
            <xsl:apply-templates/>
          </MessageParts>
        </Body>
      </Envelope>
    </Batch>
  </xsl:template>

  <!-- This template populates the top level table 'Document' (BankStmtISODocument) -->
  <xsl:template match ="message:BkToCstmrStmt">
    <BankStmt>
      <Document  class="entity">
        <FormatName>ISO20022</FormatName>
        <FormatVersion>
          <xsl:value-of select="1"/>
        </FormatVersion>
        <Header class="entity">
          <xsl:call-template name="GroupHeader"/>
        </Header>
        <xsl:call-template name="AccountHeader"/>
      </Document>
    </BankStmt >
  </xsl:template>

  <xsl:template name="GroupHeader">
    <CreationDateTime>
      <xsl:call-template name="checkDateTime">
        <xsl:with-param name="dateTime" select="bsiso:getISODateTime('',normalize-space(message:GrpHdr/message:CreDtTm))"/>
      </xsl:call-template>
    </CreationDateTime>
    <MessageIdentification>
      <xsl:value-of select ="normalize-space(message:GrpHdr/message:MsgId)"/>
    </MessageIdentification>
    <Sender class="entity">
      <xsl:variable name="SenderId">
        <xsl:choose>
          <xsl:when test="message:Stmt[1]//message:Svcr/message:FinInstnId/message:BIC">
            <xsl:value-of select="message:Stmt[1]//message:Svcr/message:FinInstnId/message:BIC"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="message:Stmt[1]//message:Svcr/message:FinInstnId/message:Othr/message:Id"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:call-template name="PartyId">
        <xsl:with-param name ="OrgId">
          <xsl:value-of select="normalize-space($SenderId)"/>
        </xsl:with-param>
        <xsl:with-param name ="OrgName">
          <xsl:value-of select="normalize-space(message:Stmt[1]//message:Svcr/message:FinInstnId/message:Nm)"/>
        </xsl:with-param>
      </xsl:call-template>
    </Sender>
    <Recipient class="entity">
      <xsl:call-template name="PartyId">
        <xsl:with-param name ="OrgId">
          <xsl:value-of select="normalize-space(message:GrpHdr/message:MsgRcpt/message:Id)"/>
        </xsl:with-param>
        <xsl:with-param name ="OrgName">
          <xsl:value-of select="normalize-space(message:GrpHdr/message:MsgRcpt/message:Nm)"/>
        </xsl:with-param>
      </xsl:call-template>
    </Recipient>
  </xsl:template>
  <!-- This template populates the table 'PartyIdentification_*' (BankStatementISOPartyIdentification) -->
  <xsl:template name="PartyId">
    <xsl:param name ="OrgId" select ="''"/>
    <xsl:param name ="OrgName" select ="''"/>
    <Name>
      <xsl:value-of select="$OrgName" />
    </Name>
    <PartyIdOrganisationGenericOrgId>
      <xsl:value-of select="$OrgId" />
    </PartyIdOrganisationGenericOrgId>
  </xsl:template>

  <!-- This template populates the 'AccountStatement' table (BankStmtISOAccountStatement) -->
  <xsl:template name="AccountHeader">
    <xsl:for-each select="message:Stmt">
      <AccountStatement  class="entity">
        <AccountCurrency>
          <xsl:value-of select ="normalize-space(message:Acct/message:Ccy)"/>
        </AccountCurrency>
        <AccountIdOtherId>
          <xsl:value-of select ="normalize-space(message:Acct/message:Id//message:Id)"/>
        </AccountIdOtherId>
        <BankStatementType>Reconciliation</BankStatementType>
        <FromDateTime>
          <xsl:call-template name="checkDateTime">
            <xsl:with-param name="dateTime" select ="bsiso:getISODateTime('', normalize-space(message:FrToDt/message:FrDtTm))"/>
          </xsl:call-template>
        </FromDateTime>
        <IBAN>
          <xsl:value-of select ="normalize-space(message:Acct/message:Id/message:IBAN)"/>
        </IBAN>
        <Identification>
          <xsl:value-of select ="normalize-space(message:Id)"/>
        </Identification>
        <ToDateTime>
          <xsl:call-template name="checkDateTime">
            <xsl:with-param name="dateTime" select ="bsiso:getISODateTime('', normalize-space(message:FrToDt/message:ToDtTm))"/>
          </xsl:call-template>
        </ToDateTime>
        <TotalEntriesNumberOfEntries>
          <xsl:call-template name="checkAmount">
            <xsl:with-param name="amount" select ="normalize-space(message:TxsSummry/message:TtlNtries/message:NbOfNtries)"/>
          </xsl:call-template>
        </TotalEntriesNumberOfEntries>
        <!--Balance-->    
        <xsl:call-template name ="CashBalance">
        </xsl:call-template>
        <!--Transactions-->
        <xsl:call-template name ="ReportEntry">
        </xsl:call-template>
      </AccountStatement>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="CashBalance">
    <xsl:for-each select ="message:Bal">
      <xsl:variable name="TypeCode" select="normalize-space(message:Tp/message:CdOrPrtry/message:Cd)"/>
      <AccountStatementCashBalance class="entity">
        <AmountCreditDebitIndicator>
          <xsl:call-template name="GetCreditDebit">
            <xsl:with-param name="OriginCreditDebit" select="normalize-space(message:CdtDbtInd)"/>
          </xsl:call-template>
        </AmountCreditDebitIndicator>
        <BankStatementBalanceType>
          <xsl:choose>
            <xsl:when test="$TypeCode = 'CLBD'">
              <xsl:value-of select="'Closing'"/>
            </xsl:when>
            <xsl:when test="$TypeCode = 'OPBD'">
              <xsl:value-of select="'Opening'"/>
            </xsl:when>
            <xsl:when test="$TypeCode = 'PRCD'">
              <xsl:value-of select="'Opening'"/>
            </xsl:when>
            <xsl:when test="$TypeCode = 'ITBD'">
              <xsl:value-of select="'NetAmount'"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="'None'"/>
            </xsl:otherwise>
          </xsl:choose>
        </BankStatementBalanceType>
        <CashBalanceAmount>
          <xsl:call-template name="checkAmount">
            <xsl:with-param name="amount" select ="normalize-space(message:Amt)"/>
          </xsl:call-template>
        </CashBalanceAmount>
        <TypeCode>
          <xsl:value-of select ="normalize-space($TypeCode)"/>
        </TypeCode>
      </AccountStatementCashBalance>
    </xsl:for-each>
    
  </xsl:template>
  
  <xsl:template name="ReportEntry">
    <xsl:for-each select="message:Ntry">
      <AccountStatementReportEntry class="entity">
        <AccountServicerReference>
          <xsl:value-of select="normalize-space(message:AcctSvcrRef)"/>
        </AccountServicerReference>
        <AdditionalEntryInformation>
          <xsl:variable name="EndToEndIds">
            <xsl:for-each select=".//message:TxDtls//message:EndToEndId">
              <xsl:value-of select="concat(.,' ')"/>
            </xsl:for-each>
          </xsl:variable>
          <xsl:value-of select="normalize-space($EndToEndIds)"/>
        </AdditionalEntryInformation>
        <Amount>
          <xsl:call-template name="checkAmount">
            <xsl:with-param name="amount" select ="normalize-space(message:Amt)"/>
          </xsl:call-template>
        </Amount>
        <xsl:variable name="ReportEntryDebitCredit">
          <xsl:call-template name="GetCreditDebit">
            <xsl:with-param name="OriginCreditDebit" select="normalize-space(message:CdtDbtInd)"/>
          </xsl:call-template>
        </xsl:variable>
        <AmountCreditDebitIndicator>
          <xsl:value-of select="$ReportEntryDebitCredit"/>
        </AmountCreditDebitIndicator>
        <BankStatementCounterCurrency>
          <xsl:value-of select="normalize-space(.//message:TxDtls//message:CntrValAmt/message:Amt/@Ccy)"/>
        </BankStatementCounterCurrency>
        <BankStatementCounterCurrencyAmount>
          <xsl:call-template name="checkAmount">
            <xsl:with-param name="amount" select="normalize-space(.//message:TxDtls//message:CntrValAmt/message:Amt)"/>
          </xsl:call-template>
        </BankStatementCounterCurrencyAmount>
        <BankStatementCounterExchangeRate>
          <xsl:call-template name="checkAmount">
            <xsl:with-param name="amount" select="normalize-space(.//message:TxDtls//message:CntrValAmt//message:XchgRate)"/>
          </xsl:call-template>
        </BankStatementCounterExchangeRate>
        <BankStatementInstructedCurrency>
          <xsl:value-of select="normalize-space(.//message:TxDtls//message:InstdAmt/message:Amt/@Ccy)"/>
        </BankStatementInstructedCurrency>
        <BankStatementInstructedCurrencyAmt>
          <xsl:call-template name="checkAmount">
            <xsl:with-param name="amount" select="normalize-space(.//message:TxDtls//message:InstdAmt/message:Amt)"/>
          </xsl:call-template>
        </BankStatementInstructedCurrencyAmt>
        <BankStatementInstructedExchangeRate>
          <xsl:call-template name="checkAmount">
            <xsl:with-param name="amount" select="normalize-space(.//message:TxDtls//message:InstdAmt//message:XchgRate)"/>
          </xsl:call-template>
        </BankStatementInstructedExchangeRate>
        <BankStatementLineStatus>
          <xsl:call-template name="GetBookStatus">
            <xsl:with-param name="Status" select="normalize-space(message:Sts)"/>
          </xsl:call-template>
        </BankStatementLineStatus>
        <BookingDateTime>
          <xsl:call-template name="checkDateTime">
            <xsl:with-param name="dateTime" select="bsiso:getISODateTime(normalize-space(message:BookgDt/message:Dt), normalize-space(message:BookgDt/message:DtTm))"/>
          </xsl:call-template>
        </BookingDateTime>
        <CreditorReferenceInformation>
          <xsl:variable name="CreditorReferenceInformation">
            <xsl:for-each select="message:NtryDtls/message:TxDtls">
              <xsl:variable name="TransactionCreditorReferenceInformation">
                <xsl:for-each select="message:RmtInf/message:Strd/message:CdtrRefInf/message:Ref">
                  <xsl:value-of select="concat(normalize-space(.), ',')"/>
                </xsl:for-each>
              </xsl:variable>
              <xsl:value-of select="concat(substring($TransactionCreditorReferenceInformation, 1, string-length($TransactionCreditorReferenceInformation) - 1), ' ')"/>
            </xsl:for-each>
          </xsl:variable>
          <xsl:value-of select="normalize-space($CreditorReferenceInformation)"/>
        </CreditorReferenceInformation>
        <EntryReference>
          <xsl:value-of select="normalize-space(message:NtryRef)"/>
        </EntryReference>
        <ProprietaryBankTransactionCode>
          <xsl:choose>
            <xsl:when test="message:BkTxCd/message:Domn">
              <xsl:value-of select="normalize-space(concat(message:BkTxCd/message:Domn/message:Cd, message:BkTxCd/message:Domn/message:Fmly/message:Cd, message:BkTxCd/message:Domn/message:Fmly/message:SubFmlyCd))"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="normalize-space(message:BkTxCd/message:Prtry/message:Cd)"/>
            </xsl:otherwise>
          </xsl:choose>
        </ProprietaryBankTransactionCode>
        <ReferenceNumber>
          <xsl:variable name="ReferenceNumbers">
            <xsl:for-each select=".//message:TxDtls//message:RmtInf">
              <xsl:variable name="ReferenceNumberUnstructured">
                <xsl:value-of select="normalize-space(message:Ustrd)"/>
              </xsl:variable>
              <xsl:variable name="ReferenceNumberStructured">
                <xsl:value-of select ="normalize-space(.//message:RfrdDocInf/message:Nb)"/>
              </xsl:variable>
              <xsl:choose>
                <xsl:when test="$ReferenceNumberUnstructured != ''">
                  <xsl:value-of select="concat($ReferenceNumberUnstructured, ' ')"/>
                </xsl:when>
                <xsl:when test="$ReferenceNumberStructured != ''">
                  <xsl:value-of select="concat($ReferenceNumberStructured, ' ')"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="''"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:for-each>
          </xsl:variable>
          <xsl:value-of select="normalize-space($ReferenceNumbers)"/>
        </ReferenceNumber>
        <RelatedBankAccount>
          <xsl:choose>
            <xsl:when test="$ReportEntryDebitCredit = 'Credit'">
              <xsl:call-template name="GetRelatedBankAccount">
                <xsl:with-param name="CdtrDbtrAcct" select=".//message:RltdPties/message:CdtrAcct"/>
              </xsl:call-template>
            </xsl:when>
            <xsl:when test="$ReportEntryDebitCredit = 'Debit'">
              <xsl:call-template name="GetRelatedBankAccount">
                <xsl:with-param name="CdtrDbtrAcct" select=".//message:RltdPties/message:DbtrAcct"/>
              </xsl:call-template>
            </xsl:when>
          </xsl:choose>
        </RelatedBankAccount>
        <RelatedBankName>
          <xsl:variable name="RelatedBankName">
            <xsl:choose>
              <xsl:when test="$ReportEntryDebitCredit = 'Credit'">
                <xsl:value-of select="normalize-space(.//message:RltdAgts/message:CdtrAgt//message:Nm)"/>
              </xsl:when>
              <xsl:when test="$ReportEntryDebitCredit = 'Debit'">
                <xsl:value-of select="normalize-space(.//message:RltdAgts/message:DbtrAgt//message:Nm)"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="''"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:value-of select="normalize-space($RelatedBankName)"/>
        </RelatedBankName>
        <ReversalIndicator>
          <xsl:call-template name="GetNoYes">
            <xsl:with-param name="Boolean" select="normalize-space(message:RvslInd)"/>
          </xsl:call-template>
        </ReversalIndicator>
        <xsl:variable name="RelatedPartyId">
          <xsl:choose>
            <xsl:when test="$ReportEntryDebitCredit = 'Credit'">
              <xsl:value-of select="normalize-space(.//message:RltdPties/message:Cdtr/message:Id)"/>
            </xsl:when>
            <xsl:when test="$ReportEntryDebitCredit = 'Debit'">
              <xsl:value-of select="normalize-space(.//message:RltdPties/message:Dbtr/message:Id)"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="''"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="RelatedPartyName">
          <xsl:choose>
            <xsl:when test="$ReportEntryDebitCredit = 'Credit'">
              <xsl:value-of select="normalize-space(.//message:RltdPties/message:Cdtr/message:Nm)"/>
            </xsl:when>
            <xsl:when test="$ReportEntryDebitCredit = 'Debit'">
              <xsl:value-of select="normalize-space(.//message:RltdPties/message:Dbtr/message:Nm)"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="''"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:if test="$RelatedPartyName != ''">
          <ReportEntryTradingParty class="entity">
            <xsl:call-template name="PartyId">
              <xsl:with-param name ="OrgId">
                <xsl:value-of select="normalize-space($RelatedPartyId)"/>
              </xsl:with-param>
              <xsl:with-param name ="OrgName">
                <xsl:value-of select="normalize-space($RelatedPartyName)"/>
              </xsl:with-param>
            </xsl:call-template>
          </ReportEntryTradingParty>
        </xsl:if>
      </AccountStatementReportEntry>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="GetCreditDebit">
    <xsl:param name="OriginCreditDebit" select="''"/>
    <xsl:choose>
      <xsl:when test="$OriginCreditDebit = 'CRDT'">
        <xsl:value-of select="'Debit'"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="'Credit'"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="GetNoYes">
    <xsl:param name="Boolean" select="''"/>
    <xsl:choose>
      <xsl:when test="$Boolean = 'True'">
        <xsl:value-of select="'Yes'"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="'No'"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="GetBookStatus">
    <xsl:param name="Status" select="''"/>
    <xsl:choose>
      <xsl:when test="$Status = 'BOOK'">
        <xsl:value-of select="'Booked'"/>
      </xsl:when>
      <xsl:when test="$Status = 'INFO'">
        <xsl:value-of select="'Information'"/>
      </xsl:when>
      <xsl:when test="$Status = 'PDNG'">
        <xsl:value-of select="'Pending'"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="'Booked'"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="GetRelatedBankAccount">
    <xsl:param name="CdtrDbtrAcct" select="''"/>
    <xsl:choose>
      <xsl:when test="$CdtrDbtrAcct//message:IBAN">
        <xsl:value-of select="normalize-space($CdtrDbtrAcct//message:IBAN)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="normalize-space($CdtrDbtrAcct//message:Othr/message:Id)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template name="checkAmount">
    <xsl:param name="amount" select="''"/>
    <xsl:choose>
      <xsl:when test="$amount = ''">
        <xsl:value-of select="'0'"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$amount"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="checkDateTime">
    <xsl:param name="dateTime" select="''"/>
    <xsl:choose>
      <xsl:when test="$dateTime = ''">
        <xsl:value-of select="'1900-01-01T00:00:00Z'"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$dateTime"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <msxsl:script language="C#" implements-prefix="bsiso">
    <![CDATA[
  public string getISODateTime(string strDate, string strDateTime)
  {
    if (strDateTime != "")
    {
      DateTime dateTime = DateTime.Parse(strDateTime);
      return dateTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");
    }
    else if (strDate != "")
    {
      DateTime dateTime = DateTime.Parse(strDate + " " + "00:00:00");
      return dateTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");
    }
    
    return "1900-01-01T00:00:00Z";
    
  }       
          ]]>
  </msxsl:script>
</xsl:stylesheet>
