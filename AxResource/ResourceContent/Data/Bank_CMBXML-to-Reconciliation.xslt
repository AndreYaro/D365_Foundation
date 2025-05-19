<?xml version="1.0" encoding="GB18030"?>
<!-- This stylesheet converts the CMB xml file to the schema of BankStmtISOService.
	-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl"
                xmlns:cmb="http://schemas.microsoft.com/dynamics/2008/01/services/BankStmtService/"
                xmlns="http://schemas.microsoft.com/dynamics/2008/01/documents/BankStmt">
  <xsl:output method="xml" omit-xml-declaration="no" version="1.0"/>

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
  <xsl:template match ="BankStmtISO">
    <BankStmt>
      <Document class="entity">
        <FormatName>CMB</FormatName>
        <FormatVersion>
          <xsl:value-of select="normalize-space(StatementHaeder/Version)"/>
        </FormatVersion>
        <Header class="entity">
          <xsl:call-template name="GroupHeader"/>
        </Header>
        <xsl:call-template name="AccountHeader"/>
      </Document>
    </BankStmt >
  </xsl:template>

  <!-- This template populates the 'GroupHeader'table (BankStmtISOGroupHeader) -->
  <xsl:template name="GroupHeader">
    <CreationDateTime>
      <xsl:call-template name="getDateTime">
        <xsl:with-param name="date" select="normalize-space(StatementHaeder/MakeDate)"/>
      </xsl:call-template>
    </CreationDateTime>
    <Sender class="entity">
      <xsl:variable name="bankCode" select="StatementHaeder/BankCode"/>
      <xsl:variable name="bankBranch" select="StatementHaeder/BankArea"/>
      <xsl:call-template name="PartyId">
        <xsl:with-param name="OrgId" select="normalize-space(concat($bankBranch, ' ', $bankCode))"/>
      </xsl:call-template>
    </Sender>
    <Recipient class="entity">
        <xsl:call-template name="PartyId">
          <xsl:with-param name="OrgId" select="normalize-space(StatementHaeder/CorpName)"/>
        </xsl:call-template>
      </Recipient>
  </xsl:template>

  <!-- This template populates the 'AccountStatement' table (BankStmtISOAccountStatement) -->
  <xsl:template name="AccountHeader">
    <AccountStatement class="entity">
      <AccountCurrency>
        <xsl:value-of select="cmb:getCurrencyCodeISO(normalize-space(StatementHaeder/Currency))"/>
      </AccountCurrency>
      <AccountIdOtherId>
        <xsl:value-of select="normalize-space(StatementHaeder/Account)"/>
      </AccountIdOtherId>
      <BankStatementType>Reconciliation</BankStatementType>
      <FromDateTime>
        <xsl:call-template name="getDateTime">
          <xsl:with-param name="date" select="normalize-space(StatementHaeder/BeginDate)"/>
          <xsl:with-param name="time" select="'00:00:00'"/>
        </xsl:call-template>
      </FromDateTime>
      <ToDateTime>
        <xsl:call-template name="getDateTime">
          <xsl:with-param name="date" select="normalize-space(StatementHaeder/EndDate)"/>
          <xsl:with-param name="time" select="'23:59:59'"/>
        </xsl:call-template>
      </ToDateTime>
      <TotalEntriesNumberOfEntries>
        <xsl:value-of select="StatementHaeder/TotalDebit + StatementHaeder/TotalCredit"/>
      </TotalEntriesNumberOfEntries>
      <!--Balance-->
      <xsl:call-template name="CashBalance">
        <xsl:with-param name="balanceAmount" select="StatementHaeder/BeginBalance"/>
        <xsl:with-param name="type" select="'Opening'"/>
      </xsl:call-template>
      <xsl:call-template name="CashBalance">
        <xsl:with-param name="balanceAmount">
          <xsl:value-of select="format-number(StatementHaeder/SumDebit - StatementHaeder/SumCredit, '####0.00')"/>
        </xsl:with-param>
        <xsl:with-param name="type" select="'NetAmount'"/>
      </xsl:call-template>
      <xsl:call-template name="CashBalance">
        <xsl:with-param name="balanceAmount" select="StatementHaeder/Balance"/>
        <xsl:with-param name="type" select="'Closing'"/>
      </xsl:call-template>
      <!--Transactions-->
      <xsl:call-template name="ReportEntry"/>
    </AccountStatement>
  </xsl:template>

  <!-- This template populates the table 'CashBalance' BankStatementISOCashBalance -->
  <xsl:template name="CashBalance">
    <xsl:param name="balanceAmount"/>
    <xsl:param name="type"/>
    <AccountStatementCashBalance class ="entity">
      <xsl:variable name="Amount">
        <xsl:call-template name="getAmount">
          <xsl:with-param name="amount" select="$balanceAmount"/>
        </xsl:call-template>
      </xsl:variable>
      <AmountCreditDebitIndicator>
        <xsl:call-template name="getCreditDebitIndicator">
          <xsl:with-param name="amount" select="$Amount"/>
        </xsl:call-template>
      </AmountCreditDebitIndicator>
      <BankStatementBalanceType>
        <xsl:value-of select="$type"/>
      </BankStatementBalanceType>
      <CashBalanceAmount>
        <xsl:value-of select="$Amount"/>
      </CashBalanceAmount>
    </AccountStatementCashBalance>
  </xsl:template>

  <!-- This template populates the table 'ReportEntry' (BankStatementISOReportEntry) -->
  <xsl:template name="ReportEntry">
    <xsl:for-each select="Transactions/StatementLine">
      <AccountStatementReportEntry class="entity">
        <AdditionalEntryInformation>
          <xsl:value-of select="normalize-space(concat(NARYUR, ' ', NUSAGE))"/>
        </AdditionalEntryInformation>
        <xsl:variable name="DebitAmount">
          <xsl:call-template name="getAmount">
            <xsl:with-param name="amount" select="normalize-space(TRSAMTD)"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="CreditAmount">
          <xsl:call-template name="getAmount">
            <xsl:with-param name="amount" select="normalize-space(TRSAMTC)"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="lineCreditDebitIndicator">
          <xsl:choose>
            <xsl:when test="$DebitAmount != 0">
              <xsl:value-of select="'Debit'"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="'Credit'"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <Amount>
          <xsl:choose>
            <xsl:when test="$lineCreditDebitIndicator = 'Debit'">
              <xsl:value-of select="$DebitAmount"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$CreditAmount"/>
            </xsl:otherwise>
          </xsl:choose>
        </Amount>
        <AmountCreditDebitIndicator>
          <xsl:value-of select="$lineCreditDebitIndicator"/>
        </AmountCreditDebitIndicator>
        <BankDocumentNumber>
          <xsl:value-of select="normalize-space(CHKNBR)"/>
        </BankDocumentNumber>
        <BookingDateTime>
          <xsl:call-template name="getDateTime">
            <xsl:with-param name="date" select="normalize-space(ETYDAT)"/>
            <xsl:with-param name="time" select="normalize-space(ETYTIM)"/>
          </xsl:call-template> 
        </BookingDateTime>
        <EntryReference>
          <xsl:value-of select="normalize-space(REFNBR)"/>
        </EntryReference>
        <ProprietaryBankTransactionCode>
          <xsl:value-of select="normalize-space(TRSCOD)"/>
        </ProprietaryBankTransactionCode>
        <ReferenceNumber>
          <xsl:value-of select="normalize-space(YURREF)"/>
        </ReferenceNumber>
        <RelatedBankAccount>
          <xsl:value-of select="normalize-space(RPYACC)"/>
        </RelatedBankAccount>
        <RelatedBankName>
          <xsl:value-of select="normalize-space(concat(RPYBNK, ' ', RPYBBN))"/>
        </RelatedBankName>
        <ReversalIndicator>
          <xsl:variable name="reversalFlag" select="normalize-space(RSVFLG)"/>
          <xsl:choose>
            <xsl:when test="$reversalFlag = '*'">Yes</xsl:when>
            <xsl:otherwise>No</xsl:otherwise>
          </xsl:choose>
        </ReversalIndicator>
      </AccountStatementReportEntry>
    </xsl:for-each>
  </xsl:template>

  <!-- This template populates the table 'PartyIdentification_*' (BankStatementISOPartyIdentification) -->
  <xsl:template name="PartyId">
    <xsl:param name ="OrgId" select ="''"/>
    <Name>
      <xsl:value-of select="$OrgId" />
    </Name>
    <PartyIdOrganisationGenericOrgId>
      <xsl:value-of select="$OrgId" />
    </PartyIdOrganisationGenericOrgId>
  </xsl:template>
  
  <xsl:template name="getCreditDebitIndicator">
    <xsl:param name="amount"/>
    <xsl:choose>
      <xsl:when test="$amount &lt; 0">Credit</xsl:when>
      <xsl:otherwise>Debit</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="getAmount">
    <xsl:param name="amount" select="''"/>
    <xsl:choose>
      <xsl:when test="$amount = ''">
        <xsl:value-of select="0"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$amount"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template name="getDateTime">
    <xsl:param name="date" select="''"/>
    <xsl:param name="time" select="''"/>
    <xsl:variable name="strDate">
      <xsl:value-of select="concat(substring($date, 1, 4), '-', substring($date, 5, 2), '-', substring($date, 7, 2))"/>
    </xsl:variable>
    <xsl:value-of select="cmb:convertToDateTime($strDate, $time)"/>
  </xsl:template>
  <msxsl:script language="C#" implements-prefix="cmb">
    <![CDATA[   
  public string convertToDateTime(string strDate, string strTime)
  {
    if (strDate == "")
    {
      return "1900-01-01T00:00:00Z";
      
    }
    string strTimeLocal = strTime;
    if (strTimeLocal == "")
    {
      strTimeLocal = "00:00:00";
    }
    
    string dateTimeString = strDate + " " + strTimeLocal;
    DateTime dateTime = DateTime.Parse(dateTimeString);
    return dateTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");
  }
  public string getCurrencyCodeISO(string cmbCurrencyCode)
  {
    string ret = string.Empty;
    
    switch(cmbCurrencyCode)
    {
      case "10": ret = "CNY"; break;
      case "21": ret = "HKD"; break;
      case "29": ret = "MOP"; break;
      case "32": ret = "USD"; break;
      case "35": ret = "EUR"; break;
      case "39": ret = "CAD"; break;
      case "43": ret = "GBP"; break;
      case "65": ret = "JPY"; break;
      case "69": ret = "SGD"; break;
      case "83": ret = "NOK"; break;
      case "85": ret = "DKK"; break;
      case "87": ret = "CHF"; break;
      case "88": ret = "SEK"; break;
    }
    
    return ret;
  }
     ]]>
  </msxsl:script>
</xsl:stylesheet>
