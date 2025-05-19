<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="urn:oasis:names:specification:ubl:schema:xsd:Reminder-2 UBL-Reminder-2.0.xsd"
            xmlns="urn:oasis:names:specification:ubl:schema:xsd:Reminder-2"
						xmlns:body="http://schemas.microsoft.com/dynamics/2008/01/documents/CustECollectionLetter_NO"
						xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
						xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
						xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="abs">
    <xsl:param name="n"/>
    <xsl:if test="$n">
      <xsl:choose>
        <xsl:when test="number($n) >= 0">
          <xsl:value-of select="format-number($n, '0.00')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="format-number(0 - $n, '0.00')"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
    <xsl:if test="not($n)">
      <xsl:value-of select="format-number(0, '0.00')"/>
    </xsl:if>
  </xsl:template>

  <xsl:template name="OutputDate">
    <xsl:param name="ElementName"/>
    <xsl:param name="Date"/>
    <xsl:if test="$Date">
      <xsl:element name="{$ElementName}">
        <xsl:value-of select="$Date"/>
      </xsl:element>
    </xsl:if>
  </xsl:template>
<!--TODO-->
  <xsl:template name="CurrencyCode">
    <xsl:param name="CurrencyCode"/>
    <xsl:value-of select="//body:CustCollectionLetterJour/body:CurrencyCode"/>
  </xsl:template>

  <xsl:template name="OutputNote">
    <xsl:param name="ElementName"/>
    <xsl:element name="{$ElementName}">
      <xsl:attribute name="languageID">
        <xsl:value-of select="//body:CustCollectionLetterJour/body:LanguageId"/>
      </xsl:attribute>
      <xsl:value-of select="//body:CustCollectionLetterJour/body:Notes"/>
    </xsl:element>
  </xsl:template>

  <xsl:template name="OutputAmount">
    <xsl:param name="ElementName"/>
    <xsl:param name="Amount"/>
    <xsl:param name="CurrencyCode"/>
    <xsl:param name="NotAbs"/>
    <xsl:element name="{$ElementName}">
      <xsl:attribute name="currencyID">
        <xsl:call-template name="CurrencyCode">
          <xsl:with-param name ="CurrencyCode" select ="$CurrencyCode"/>
        </xsl:call-template>
      </xsl:attribute>
      <xsl:if test="not($NotAbs)">
        <xsl:call-template name="abs">
          <xsl:with-param name="n" select="$Amount"/>
        </xsl:call-template>
      </xsl:if>
      <xsl:if test="$NotAbs">
        <xsl:value-of select="format-number($Amount, '0.00')"/>
      </xsl:if>
    </xsl:element>
  </xsl:template>

  <xsl:template name="SellerAddress">
    <xsl:param name="ElementName"/>
    <xsl:element name="{$ElementName}">
      <cbc:AddressFormatCode listID="urn:oioubl:codelist:addressformatcode-1.1" listAgencyID="320">StructuredLax</cbc:AddressFormatCode>
      <cbc:StreetName>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:DirPartyPostalAddressView_2/body:Street"/>
      </cbc:StreetName>
      <cbc:CityName>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:DirPartyPostalAddressView_2/body:City"/>
      </cbc:CityName>
      <cbc:PostalZone>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:DirPartyPostalAddressView_2/body:ZipCode"/>
      </cbc:PostalZone>
      <cbc:CountrySubentity>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:DirPartyPostalAddressView_2/body:State"/>
      </cbc:CountrySubentity>
      <cac:Country>
        <cbc:IdentificationCode>
          <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:DirPartyPostalAddressView_2/body:ISOcode"/>
        </cbc:IdentificationCode>
      </cac:Country>
    </xsl:element>
  </xsl:template>

  <xsl:template name="BuyerAddress">
    <xsl:param name="ElementName"/>
    <xsl:element name="{$ElementName}">
      <cbc:AddressFormatCode listID="urn:oioubl:codelist:addressformatcode-1.1" listAgencyID="320">StructuredLax</cbc:AddressFormatCode>
      <cbc:StreetName>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:LogisticsPostalAddress_1/body:Street"/>
      </cbc:StreetName>
      <cbc:CityName>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:LogisticsPostalAddress_1/body:City"/>
      </cbc:CityName>
      <cbc:PostalZone>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:LogisticsPostalAddress_1/body:ZipCode"/>
      </cbc:PostalZone>
      <cbc:CountrySubentity>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:LogisticsPostalAddress_1/body:State"/>
      </cbc:CountrySubentity>
      <cac:Country>
        <cbc:IdentificationCode>
          <xsl:value-of select="//body:CustCollectionLetterJour/body:LogisticsPostalAddress_1/body:CountryRegionId"/>
        </cbc:IdentificationCode>
      </cac:Country>
    </xsl:element>
  </xsl:template>

  <xsl:template name="CustomerAddress">
    <xsl:param name="ElementName"/>
    <xsl:element name="{$ElementName}">
      <cbc:AddressFormatCode listID="urn:oioubl:codelist:addressformatcode-1.1" listAgencyID="320">StructuredLax</cbc:AddressFormatCode>
      <cbc:StreetName>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:DirPartyPostalAddressView_1/body:Street"/>
      </cbc:StreetName>
      <cbc:CityName>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:DirPartyPostalAddressView_1/body:City"/>
      </cbc:CityName>
      <cbc:PostalZone>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:DirPartyPostalAddressView_1/body:ZipCode"/>
      </cbc:PostalZone>
      <cbc:CountrySubentity>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:DirPartyPostalAddressView_1/body:State"/>
      </cbc:CountrySubentity>
      <cac:Country>
        <cbc:IdentificationCode>
          <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:DirPartyPostalAddressView_1/body:ISOcode"/>
        </cbc:IdentificationCode>
      </cac:Country>
    </xsl:element>
  </xsl:template>

  <xsl:template name="CalcTaxAmountFee">
    <xsl:param name="Amount"/>
    <xsl:param name="TaxValue"/>
    <xsl:variable name="FeeTaxPercent">
      <xsl:choose>
        <xsl:when test="//body:CustCollectionLetterJour/body:Fee and //body:CustCollectionLetterJour/body:TaxAmount ">
          <xsl:value-of select="format-number(round((//body:CustCollectionLetterJour/body:TaxAmount div //body:CustCollectionLetterJour/body:Fee) * 100), '0.00')"/>
        </xsl:when>
        <xsl:otherwise>0.00</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="//body:CustCollectionLetterJour/body:Fee">
      <xsl:if test="$FeeTaxPercent = $TaxValue">
        <xsl:value-of select="format-number($Amount,  '0.00')"/>
      </xsl:if>
    </xsl:if>
    <xsl:if test="not(//body:CustCollectionLetterJour/body:Fee)">
      <xsl:value-of select="0.00"/>
    </xsl:if>
    <xsl:if test="not($FeeTaxPercent = $TaxValue)">
      <xsl:value-of select="0.00"/>
    </xsl:if>
  </xsl:template>

  <xsl:template name="OutputTaxSubtotal">
    <xsl:param name="TaxValue"/>
    <xsl:param name="CurrencyCode"/>

    <xsl:variable name="CountLines">
      <xsl:if test="$TaxValue">
        <xsl:value-of select="count(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[body:TaxValue=$TaxValue])"/>
      </xsl:if>
      <xsl:if test="not($TaxValue)">
        <xsl:value-of select="count(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[not(body:TaxValue)])"/>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="TaxAmount">
      <xsl:if test="$TaxValue">
        <xsl:value-of select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[body:TaxValue=$TaxValue]/body:TaxAmount), '0.00')"></xsl:value-of>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="TaxableAmount">
      <xsl:if test="$TaxValue">
        <xsl:value-of select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[body:TaxValue=$TaxValue]/body:TaxBaseAmount), '0.00')"/>
      </xsl:if>
      <xsl:if test="not($TaxValue)">
        <xsl:value-of select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[not(body:TaxValue)]/body:TaxBaseAmount), '0.00')"/>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="TaxAmountFee">
      <xsl:call-template name="CalcTaxAmountFee">
        <xsl:with-param name="Amount" select="//body:CustCollectionLetterJour/body:TaxAmount"/>
        <xsl:with-param name="TaxValue" select="$TaxValue"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:variable name="TaxableAmountFee">
      <xsl:call-template name="CalcTaxAmountFee">
        <xsl:with-param name="Amount" select="//body:CustCollectionLetterJour/body:Fee"/>
        <xsl:with-param name="TaxValue" select="$TaxValue"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:if test ="($CountLines > 0) or ($TaxableAmountFee!=0)">
      <xsl:if test ="($CountLines > 0) or ($TaxAmountFee!=0)">
        <cac:TaxSubtotal>
          <xsl:call-template name="OutputAmount">
            <xsl:with-param name="ElementName" select="'cbc:TaxableAmount'"/>
            <xsl:with-param name="Amount" select="$TaxableAmount - $TaxableAmountFee"/>
            <xsl:with-param name="CurrencyCode" select="$CurrencyCode"/>
          </xsl:call-template>
          <xsl:call-template name="OutputAmount">
            <xsl:with-param name="ElementName" select="'cbc:TaxAmount'"/>
            <xsl:with-param name="Amount" select="$TaxAmount - $TaxAmountFee"/>
            <xsl:with-param name="CurrencyCode" select="$CurrencyCode"/>
          </xsl:call-template>

          <cac:TaxCategory>
            <cbc:ID schemeID="urn:oioubl:id:taxcategoryid-1.1" schemeAgencyID="320">
              <xsl:if test="not($TaxAmount)">ZeroRated</xsl:if>
              <xsl:if test="$TaxAmount">StandardRated</xsl:if>
            </cbc:ID>

            <cbc:Percent>
              <xsl:if test="$TaxAmount">
                <xsl:call-template name ="abs">
                  <xsl:with-param name="n" select="round(($TaxAmount div $TaxableAmount) * 100)"></xsl:with-param>
                </xsl:call-template>
              </xsl:if>
              <xsl:if test="not ($TaxAmount)">0.00</xsl:if>
            </cbc:Percent>

            <cac:TaxScheme>
              <cbc:ID schemeID="urn:oioubl:id:taxschemeid-1.1">63</cbc:ID>
              <cbc:Name>Moms</cbc:Name>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </xsl:if>
    </xsl:if>
  </xsl:template>

  <xsl:template name="OutputTaxSubtotalHeader">
    <xsl:param name="TaxValue"/>
    <xsl:param name="CountLines"/>
    <xsl:param name="CurrencyCode"/>

    <xsl:variable name="TaxAmount">
      <xsl:if test="$TaxValue">
        <xsl:value-of select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[body:TaxValue!=0.00]/body:TaxAmount), '0.00')"></xsl:value-of>
      </xsl:if>
      <xsl:if test="not($TaxValue)">
        <xsl:value-of select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[not(body:TaxValue)]/body:TaxAmount), '0.00')"></xsl:value-of>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="TaxableAmount">
      <xsl:if test="$TaxValue">
        <xsl:value-of select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[body:TaxValue!=0.00]/body:TaxBaseAmount), '0.00')"/>
      </xsl:if>
      <xsl:if test="not($TaxValue)">
        <xsl:value-of select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[not(body:TaxValue)]/body:TaxBaseAmount), '0.00')"/>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="TaxAmountFee">
      <xsl:choose>
        <xsl:when test="$TaxValue and //body:CustCollectionLetterJour/body:TaxAmount!=0.00">
          <xsl:value-of select="format-number(//body:CustCollectionLetterJour/body:TaxAmount,  '0.00')"/>
        </xsl:when>
        <xsl:when test="not($TaxValue) and //body:CustCollectionLetterJour/body:TaxAmount = 0.00">
          <xsl:value-of select="0.00"/>
        </xsl:when>
        <xsl:otherwise>0.00</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="TaxableAmountFee">
      <xsl:choose>
        <xsl:when test="$TaxValue and //body:CustCollectionLetterJour/body:TaxAmount!=0.00">
          <xsl:value-of select="format-number(//body:CustCollectionLetterJour/body:Fee,  '0.00')"/>
        </xsl:when>
        <xsl:when test="not($TaxValue) and not(//body:CustCollectionLetterJour/body:TaxAmount) and (//body:CustCollectionLetterJour/body:TaxGroup) and (//body:CustCollectionLetterJour/body:TaxItemGroup)">
          <xsl:value-of select="format-number(//body:CustCollectionLetterJour/body:Fee,  '0.00')"/>
        </xsl:when>
        <xsl:otherwise>0.00</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test ="$CountLines > 0 or $TaxableAmountFee!=0">
      <cac:TaxSubtotal>
        <xsl:call-template name="OutputAmount">
          <xsl:with-param name="ElementName" select="'cbc:TaxableAmount'"/>
          <xsl:with-param name="Amount" select="$TaxableAmount - $TaxableAmountFee"/>
          <xsl:with-param name="CurrencyCode" select="$CurrencyCode"/>
        </xsl:call-template>
        <xsl:call-template name="OutputAmount">
          <xsl:with-param name="ElementName" select="'cbc:TaxAmount'"/>
          <xsl:with-param name="Amount" select="$TaxAmount - $TaxAmountFee"/>
          <xsl:with-param name="CurrencyCode" select="$CurrencyCode"/>
        </xsl:call-template>

        <cac:TaxCategory>
          <cbc:ID schemeID="urn:oioubl:id:taxcategoryid-1.1" schemeAgencyID="320">
            <xsl:if test="not($TaxValue)">ZeroRated</xsl:if>
            <xsl:if test="$TaxValue">StandardRated</xsl:if>
          </cbc:ID>

          <cac:TaxScheme>
            <cbc:ID schemeID="urn:oioubl:id:taxschemeid-1.1">63</cbc:ID>
            <cbc:Name>Moms</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </xsl:if>
  </xsl:template>

  <xsl:template name="TaxTotalHeader">
    <xsl:param name="TaxAmountTotal"/>
    <xsl:param name="CurrencyCode"/>
    <cac:TaxTotal>
      <xsl:call-template name ="OutputAmount">
        <xsl:with-param name ="ElementName" select="'cbc:TaxAmount'"></xsl:with-param>
        <xsl:with-param name ="Amount" select ="$TaxAmountTotal"></xsl:with-param>
        <xsl:with-param name ="WithSign" select ="1"></xsl:with-param>
        <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
      </xsl:call-template>

      <xsl:variable name="CountTaxValueZero">
        <xsl:value-of select="count(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans) - count(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[body:TaxValue != 0.00])"/>
      </xsl:variable>
      <xsl:if test="$CountTaxValueZero or (//body:CustCollectionLetterJour/body:TaxItemGroup and //body:CustCollectionLetterJour/body:TaxGroup)">
        <xsl:call-template name="OutputTaxSubtotalHeader">
          <xsl:with-param name="TaxValue" select="0.00"/>
          <xsl:with-param name="CountLines" select="$CountTaxValueZero"/>
          <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
        </xsl:call-template>
      </xsl:if>

      <xsl:variable name="CountTaxValueNoZero">
        <xsl:value-of select="count(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans[body:TaxValue != 0.00])"/>
      </xsl:variable>
      <xsl:if test ="$CountTaxValueNoZero or //body:CustCollectionLetterJour/body:TaxAmount != 0.00">
        <xsl:call-template name="OutputTaxSubtotalHeader">
          <xsl:with-param name="TaxValue" select="1.00"/>
          <xsl:with-param name="CountLines" select="$CountTaxValueNoZero"/>
          <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
        </xsl:call-template>
      </xsl:if>

    </cac:TaxTotal>
  </xsl:template>

  <xsl:template name="TaxTotal">
    <xsl:param name="TaxAmountTotal"/>
    <xsl:param name="CurrencyCode"/>
    <cac:TaxTotal>
      <xsl:call-template name ="OutputAmount">
        <xsl:with-param name ="ElementName" select="'cbc:TaxAmount'"></xsl:with-param>
        <xsl:with-param name ="Amount" select ="$TaxAmountTotal"></xsl:with-param>
        <xsl:with-param name ="WithSign" select ="1"></xsl:with-param>
        <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
      </xsl:call-template>

      <xsl:call-template name="OutputTaxSubtotal">
        <xsl:with-param name="TaxValue" select="0.00"/>
        <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
      </xsl:call-template>

      <xsl:call-template name="OutputTaxSubtotal">
        <xsl:with-param name="TaxValue" select="8.00"/>
        <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
      </xsl:call-template>

      <xsl:call-template name="OutputTaxSubtotal">
        <xsl:with-param name="TaxValue" select="15.00"/>
        <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
      </xsl:call-template>

      <xsl:call-template name="OutputTaxSubtotal">
        <xsl:with-param name="TaxValue" select="25.00"/>
        <xsl:with-param name="CurrencyCode" select ="$CurrencyCode"/>
      </xsl:call-template>
    </cac:TaxTotal>
  </xsl:template>

  <xsl:template name ="CompanyID">
    <xsl:param name ="CompanyNum"/>
    <cbc:CompanyID schemeID="DK:CVR">
      <xsl:value-of select="$CompanyNum"/>
    </cbc:CompanyID>
  </xsl:template>

  <xsl:template name="RemainLine">
    <xsl:param name="RemainAmount"/>
    <xsl:param name="Note"/>
    <xsl:param name="DocumentNum"/>
    <xsl:param name="StartValueNumbering"/>
    <xsl:param name="CurrencyCode"/>
    <xsl:element name="cac:ReminderLine">
      <cbc:ID>
        <xsl:number value="position()+$StartValueNumbering"/>
      </cbc:ID>
      <xsl:choose>
        <xsl:when test="number($RemainAmount) &gt;= 0">
          <xsl:call-template name="OutputAmount">
            <xsl:with-param name="ElementName" select="'cbc:DebitLineAmount'"/>
            <xsl:with-param name="Amount" select="$RemainAmount"/>
            <xsl:with-param name="CurrencyCode" select="$CurrencyCode"/>
          </xsl:call-template>
        </xsl:when>
        <xsl:when test="number($RemainAmount) &lt; 0">
          <xsl:call-template name="OutputAmount">
            <xsl:with-param name="ElementName" select="'cbc:CreditLineAmount'"/>
            <xsl:with-param name="Amount" select="$RemainAmount"/>
            <xsl:with-param name="CurrencyCode" select="$CurrencyCode"/>
          </xsl:call-template>
        </xsl:when>
      </xsl:choose>
      <cac:BillingReference>
        <xsl:choose>
          <xsl:when test="number($RemainAmount) &gt; 0">
            <cac:InvoiceDocumentReference>
              <cbc:ID>
                <xsl:value-of select="$DocumentNum"/>
              </cbc:ID>
            </cac:InvoiceDocumentReference>
          </xsl:when>
          <xsl:otherwise>
            <cac:CreditNoteDocumentReference>
              <cbc:ID>
                <xsl:value-of select="$DocumentNum"/>
              </cbc:ID>
            </cac:CreditNoteDocumentReference>
          </xsl:otherwise>
        </xsl:choose>
      </cac:BillingReference>
    </xsl:element>
  </xsl:template>

  <xsl:template name="FeeAmount">
    <xsl:choose>
      <xsl:when test="//body:CustCollectionLetterJour/body:Fee">
        <xsl:value-of select="//body:CustCollectionLetterJour/body:Fee"/>
      </xsl:when>
      <xsl:otherwise>
        0.00
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="FeeTaxAmount">
    <xsl:choose>
      <xsl:when test="//body:CustCollectionLetterJour/body:TaxAmount">
        <xsl:value-of select="//body:CustCollectionLetterJour/body:TaxAmount"/>
      </xsl:when>
      <xsl:otherwise>
        0.00
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">
    <Reminder   xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
								xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
      <cbc:UBLVersionID>2.0</cbc:UBLVersionID>
      <cbc:CustomizationID>OIOUBL-2.02</cbc:CustomizationID>
      <cbc:ProfileID schemeID="urn:oioubl:id:profileid-1.2" schemeAgencyID="320">Procurement-BilSim-1.0</cbc:ProfileID>
      <cbc:ID>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CollectionLetterNum"/>
      </cbc:ID>
      <xsl:variable name="FeeAmount">
        <xsl:choose>
          <xsl:when test="//body:CustCollectionLetterJour/body:Fee">
            <xsl:value-of select="//body:CustCollectionLetterJour/body:Fee"/>
          </xsl:when>
          <xsl:otherwise>
            0.00
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="FeeTaxAmount">
        <xsl:choose>
          <xsl:when test="//body:CustCollectionLetterJour/body:TaxAmount">
            <xsl:value-of select="//body:CustCollectionLetterJour/body:TaxAmount"/>
          </xsl:when>
          <xsl:otherwise>
            0.00
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="TaxAmountTotal">
        <xsl:call-template name="abs">
          <xsl:with-param name="n" select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans/body:TaxAmount), '0.00')
																					- $FeeTaxAmount"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="CountTaxTransTotal">
        <xsl:value-of select="count(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:TaxTrans)"/>
      </xsl:variable>
      <xsl:variable name="SumAmount">
        <xsl:choose>
          <xsl:when test="//body:CustCollectionLetterJour/body:SumAmount">
            <xsl:call-template name="abs">
              <xsl:with-param name="n" select="format-number(//body:CustCollectionLetterJour/body:SumAmount, '0.00')"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:otherwise>0.00</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:call-template name="OutputDate">
        <xsl:with-param name="ElementName" select="'cbc:IssueDate'"/>
        <xsl:with-param name="Date" select="//body:CustCollectionLetterJour/body:CollectionLetterDate"/>
      </xsl:call-template>
      <cbc:ReminderTypeCode listID="urn:oioubl:codelist:remindertypecode-1.1" listAgencyID="320">Reminder</cbc:ReminderTypeCode>
      <!--check-->
      <cbc:ReminderSequenceNumeric>
        <xsl:value-of select="//body:ReminderSequenceNumeric"/>
      </cbc:ReminderSequenceNumeric>
      <!--Check Note-->
      <xsl:if test="//body:CustCollectionLetterJour/body:Notes">
        <xsl:call-template name="OutputNote">
          <xsl:with-param name="ElementName" select="'cbc:Note'"/>
        </xsl:call-template>
      </xsl:if>
      <cbc:DocumentCurrencyCode>
        <xsl:value-of select="//body:CustCollectionLetterJour/body:CurrencyCode"/>
      </cbc:DocumentCurrencyCode>
      <cac:AccountingSupplierParty>
        <cac:Party>
          <cbc:EndpointID schemeID="DK:CVR">
            <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:RegNum"/>
          </cbc:EndpointID>
          <cac:PartyIdentification>
            <cbc:ID schemeID="DK:CVR">
              <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:RegNum"/>
            </cbc:ID>
          </cac:PartyIdentification>
          <cac:PartyName>
            <cbc:Name>
              <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:Name"/>
            </cbc:Name>
          </cac:PartyName>
          <xsl:call-template name="SellerAddress">
            <xsl:with-param name="ElementName" select="'cac:PostalAddress'"/>
          </xsl:call-template>
          <cac:PartyTaxScheme>
            <cbc:CompanyID schemeID="DK:SE">
              <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:CoRegNum"/>
            </cbc:CompanyID>
            <cac:TaxScheme>
              <cbc:ID schemeID="urn:oioubl:id:taxschemeid-1.2">63</cbc:ID>
              <cbc:Name >Moms</cbc:Name>
            </cac:TaxScheme>
          </cac:PartyTaxScheme>
          <cac:PartyLegalEntity>
            <cbc:RegistrationName>
              <xsl:value-of select="//body:CustCollectionLetterJour/body:CompanyInfo/body:Name"/>
            </cbc:RegistrationName>
            <xsl:call-template name="CompanyID">
              <xsl:with-param name="CompanyNum"  select="//body:CustCollectionLetterJour/body:CompanyInfo/body:RegNum"/>
            </xsl:call-template>
          </cac:PartyLegalEntity>
          <xsl:if test ="//body:CustCollectionLetterJour/body:ContactPersonName">
            <cac:Contact>
              <!--Check it-->
              <xsl:if test="//body:CustCollectionLetterJour/body:ContactID">
                <cbc:ID>
                  <xsl:value-of select="//body:CustCollectionLetterJour/body:ContactID"/>
                </cbc:ID>
              </xsl:if>
              <cbc:Name>
                <xsl:value-of select="//body:CustCollectionLetterJour/body:ContactPersonName"/>
              </cbc:Name>
              <!--Check it-->
              <xsl:if test="//body:CustCollectionLetterJour/body:Phone">
                <cbc:Telephone>
                  <xsl:value-of select="//body:CustCollectionLetterJour/body:Phone"/>
                </cbc:Telephone>
              </xsl:if>
              <!--Check it-->
              <xsl:if test="//body:CustCollectionLetterJour/body:Email">
                <cbc:ElectronicMail>
                  <xsl:value-of select="//body:CustCollectionLetterJour/body:Email"/>
                </cbc:ElectronicMail>
              </xsl:if>
            </cac:Contact>
          </xsl:if>
        </cac:Party>
      </cac:AccountingSupplierParty>
      <cac:AccountingCustomerParty>
        <cac:Party>
          <cbc:EndpointID schemeID="GLN">
            <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:EinvoiceEANNum"/>
          </cbc:EndpointID>
          <cac:PartyIdentification >
            <cbc:ID schemeID="GLN">
              <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:EinvoiceEANNum"/>
            </cbc:ID>
          </cac:PartyIdentification>
          <cac:PartyName>
            <cbc:Name>
              <xsl:value-of select="//body:CustCollectionLetterJour/body:CustTable/body:Name"/>
            </cbc:Name>
          </cac:PartyName>
          <xsl:call-template name="BuyerAddress">
            <xsl:with-param name="ElementName" select="'cac:PostalAddress'"/>
          </xsl:call-template>
          <cac:Contact>
            <!--Check it-->
            <cbc:ID>
              <xsl:value-of select="//body:CustTable/body:ContactPersonId"/>
            </cbc:ID>
            <!--Check-->
            <xsl:if test="//body:CustTable/body:ContactPersonName">
              <cbc:Name>
                <xsl:value-of select="//body:CustTable/body:ContactPersonName"/>
              </cbc:Name>
            </xsl:if>
            <!--Check it-->
            <xsl:if test="//body:CustTable/body:Phone">
              <cbc:Telephone>
                <xsl:value-of select="//body:CustTable/body:Phone"/>
              </cbc:Telephone>
            </xsl:if>
            <!--Check it-->
            <xsl:if test="//body:CustTable/body:Email">
              <cbc:ElectronicMail>
                <xsl:value-of select="//body:CustTable/body:Email"/>
              </cbc:ElectronicMail>
            </xsl:if>
          </cac:Contact>
        </cac:Party>
      </cac:AccountingCustomerParty>

      <xsl:if test="$CountTaxTransTotal > 0 or //body:CustCollectionLetterJour/body:Fee">
        <xsl:call-template name="TaxTotalHeader">
          <xsl:with-param name="TaxAmountTotal" select="$TaxAmountTotal"/>
          <xsl:with-param name="CurrencyCode" select="//body:CustCollectionLetterJour/body:CustCollectionLetterTrans/body:TaxTrans/body:CurrencyCode"/>
        </xsl:call-template>
      </xsl:if>

      <cac:LegalMonetaryTotal>
        <xsl:call-template name="OutputAmount">
          <xsl:with-param name="ElementName" select="'cbc:LineExtensionAmount'"/>
          <xsl:with-param name="Amount" select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:RemainAmount), '0.00')
																				 +  format-number($FeeAmount, '0.00') + format-number($FeeTaxAmount, '0.00') - $TaxAmountTotal"/>
          <xsl:with-param name="NotAbs" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="OutputAmount">
          <xsl:with-param name="ElementName" select="'cbc:PayableAmount'"/>
          <xsl:with-param name="Amount" select="format-number(sum(//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']/body:RemainAmount), '0.00')
																				 +  format-number($FeeAmount, '0.00') + format-number($FeeTaxAmount, '0.00')"/>
          <xsl:with-param name="NotAbs" select="1"/>
        </xsl:call-template>
      </cac:LegalMonetaryTotal>
      <xsl:variable name="FeeExists">
        <xsl:choose>
          <xsl:when test="//body:CustCollectionLetterJour/body:Fee">
            1
          </xsl:when>
          <xsl:otherwise>
            0
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:if test="$FeeExists != 0">
        <xsl:call-template name="RemainLine">
          <xsl:with-param name="RemainAmount" select="$FeeAmount + $FeeTaxAmount"/>
          <xsl:with-param name="DocumentNum" select="//body:CustCollectionLetterJour/body:CollectionLetterNum"/>
          <xsl:with-param name="StartValueNumbering" select="0"/>
          <xsl:with-param name="CurrencyCode" select="//body:CustCollectionLetterJour/body:Currency/body:CurrencyCode"/>
        </xsl:call-template>
      </xsl:if>

      <xsl:for-each select="//body:CustCollectionLetterJour/body:CustCollectionLetterTrans[body:Fee='No']">
        <xsl:variable name="DocumentNum">
          <xsl:choose>
            <xsl:when test="body:Invoice">
              <xsl:value-of select="body:Invoice"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="body:Voucher"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:call-template name="RemainLine">
          <xsl:with-param name="RemainAmount" select="body:RemainAmount"/>
          <xsl:with-param name="Note" select="body:Txt"/>
          <xsl:with-param name="DocumentNum" select="$DocumentNum"/>
          <xsl:with-param name="StartValueNumbering" select="$FeeExists"/>
          <xsl:with-param name="CurrencyCode" select="body:CurrencyCode"/>
        </xsl:call-template>
      </xsl:for-each>
    </Reminder>
  </xsl:template>
</xsl:stylesheet>
