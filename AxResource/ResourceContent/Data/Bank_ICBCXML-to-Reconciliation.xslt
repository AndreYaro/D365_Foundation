<?xml version="1.0" encoding="GB18030"?>
<!-- This stylesheet converts the ICBC xml file to the schema of BankStmtISOService.
	-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl"
                xmlns:icbc="http://schemas.microsoft.com/dynamics/2008/01/services/BankStmtService/"
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
        <FormatName>ICBC</FormatName>
        <FormatVersion>1</FormatVersion>
        <!--The header is empty-->
        <Header class="entity"/>
        <xsl:call-template name="AccountHeader"/>
      </Document>
    </BankStmt >
  </xsl:template>

  <!-- This template populates the 'AccountStatement' table (BankStmtISOAccountStatement) -->
  <xsl:template name="AccountHeader">
    <AccountStatement  class="entity">
      <AccountIdOtherId>
        <xsl:value-of select="normalize-space(StatementLine/BankAccountNumber)"/>
      </AccountIdOtherId>
      <BankStatementType>Reconciliation</BankStatementType>
      <!--Transactions-->
      <xsl:call-template name="ReportEntry"/>
    </AccountStatement>
  </xsl:template>

  <!-- This template populates the table 'ReportEntry' (BankStatementISOReportEntry) -->
  <xsl:template name="ReportEntry">
    <xsl:for-each select="StatementLine">
      <AccountStatementReportEntry class="entity">
        <AdditionalEntryInformation>
          <xsl:value-of select="normalize-space(Description)"/>
        </AdditionalEntryInformation>
        <Amount>
          <xsl:choose>
            <xsl:when test="DebitAmount != ''">
              <xsl:call-template name="filterCommaInAmountText">
                <xsl:with-param name="amountText" select="normalize-space(DebitAmount)"/>
              </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
              <xsl:call-template name="filterCommaInAmountText">
                <xsl:with-param name="amountText" select="normalize-space(CreditAmount)"/>
              </xsl:call-template>
            </xsl:otherwise>
          </xsl:choose>
        </Amount>
        <AmountCreditDebitIndicator>
          <xsl:choose>
            <xsl:when test="DebitAmount != ''">Debit</xsl:when>
            <xsl:otherwise>Credit</xsl:otherwise>
          </xsl:choose>
        </AmountCreditDebitIndicator>
        <BookingDateTime>
          <xsl:value-of select="icbc:getDateTime(normalize-space(DateTime))"/>
        </BookingDateTime>
        <EntryReference>
          <xsl:value-of select="normalize-space(EntryReference)"/>
        </EntryReference>
        <ProprietaryBankTransactionCode>
          <xsl:value-of select="normalize-space(TransactionCode)"/>
        </ProprietaryBankTransactionCode>
        <RelatedBankAccount>
          <xsl:value-of select="normalize-space(RelatedBankAccountNumber)"/>
        </RelatedBankAccount>
        <RelatedBankName>
          <xsl:value-of select="normalize-space(RelatedBank)"/>
        </RelatedBankName>
        <xsl:if test="normalize-space(TradingParty) != ''">
          <ReportEntryTradingParty class="entity">
              <xsl:call-template name ="PartyId">
                <xsl:with-param name ="OrgId" select ="normalize-space(TradingParty)"></xsl:with-param>
              </xsl:call-template>
          </ReportEntryTradingParty>
        </xsl:if>
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

  <xsl:template name="filterCommaInAmountText">
    <xsl:param name="amountText" />
    <xsl:choose>
      <xsl:when test="contains($amountText, ',')">
        <xsl:call-template name="filterCommaInAmountText">
          <xsl:with-param name="amountText" select="substring-before($amountText, ',')" />
        </xsl:call-template>
        <xsl:call-template name="filterCommaInAmountText">
          <xsl:with-param name="amountText" select="substring-after($amountText, ',')" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise >
        <xsl:value-of select ="$amountText"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  

  <msxsl:script language="C#" implements-prefix="icbc">
    <![CDATA[
  public string getDateTime(string strDateTime)
  {
    if (strDateTime != "")
    {
      DateTime dateTime = DateTime.Parse(strDateTime);
      return dateTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");
    }
    else
    {
      return "1900-01-01T00:00:00Z";
    }
  }       
          ]]>
  </msxsl:script>
</xsl:stylesheet>
