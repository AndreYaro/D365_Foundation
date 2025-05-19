<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0"
                xmlns:msxsl="urn:schemas-microsoft-com:xslt"
                xmlns:var="http://schemas.microsoft.com/BizTalk/2003/var"
                exclude-result-prefixes="msxsl var s1 userCSharp"
                xmlns:s1="http://schemas.microsoft.com/dynamics/2008/01/documents/VendPayments"
                xmlns:userCSharp="http://schemas.microsoft.com/BizTalk/2003/userCSharp">
  <xsl:output omit-xml-declaration="no" method="xml" version="1.0" indent ="yes"/>
  <xsl:variable name="var:Country" select="userCSharp:upperCase(/s1:VendPayments/s1:LedgerJournalTrans[1]/s1:PaymProcessingData[s1:Name = 'Country']/s1:Value)" />
  <xsl:variable name="var:MessageVariant" select="string(/s1:VendPayments/s1:LedgerJournalTrans[1]/s1:PaymProcessingData[s1:Name = 'Variant']/s1:Value)"/>
  <xsl:variable name="var:NsPrefix">urn:iso:std:iso:20022:tech:xsd:</xsl:variable>

  <xsl:variable name="var:Schema">
    <xsl:choose>
      <xsl:when test="$var:Country = 'DE'">
        <xsl:choose>
          <xsl:when test="$var:MessageVariant = '002' or $var:MessageVariant = '003'">
            <xsl:value-of select="concat('pain.001.', $var:MessageVariant, '.03')"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="userCSharp:throwOutException('The variant of the message is not specified or is incorrect. Specify the variant to generate the payment.')" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>pain.001.001.03</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="var:Namespace">
    <xsl:value-of select="concat($var:NsPrefix, $var:Schema)"/>
  </xsl:variable>
  
  <xsl:variable name="var:Apos">'</xsl:variable>

  <xsl:template match="/">
    <xsl:variable name="var:SEPAMessage">
      <xsl:apply-templates select="/s1:VendPayments" />
    </xsl:variable>
    <xsl:apply-templates select="msxsl:node-set($var:SEPAMessage)/*[namespace-uri()='']" />
  </xsl:template>

  <xsl:template match="*[namespace-uri()='']">
    <xsl:element name="{name()}" namespace="{$var:Namespace}">
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template name="AdrLines">
    <xsl:param name="AdrLine1"/>
    <xsl:param name="AdrLine2"/>
    <xsl:if test="$AdrLine1">
      <AdrLine>
        <xsl:value-of select="$AdrLine1"/>
      </AdrLine>
    </xsl:if>
    <xsl:if test="$AdrLine2">
      <AdrLine>
        <xsl:value-of select="$AdrLine2"/>
      </AdrLine>
    </xsl:if>
  </xsl:template>

  <xsl:template name="String-join">
    <xsl:param name="List"/>
    <xsl:param name="Delimiter"/>
    <xsl:for-each select="$List">
      <xsl:value-of select="."></xsl:value-of>
      <xsl:if test="position() != last()">
        <xsl:value-of select="$Delimiter"></xsl:value-of>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>
    
  <xsl:template match="/s1:VendPayments">
    <xsl:variable name="var:AlphaNumeric" select="'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'" />
    <xsl:variable name="var:Numeric" select="'0123456789'" />
    <xsl:variable name="var:Format" select="userCSharp:upperCase(s1:LedgerJournalTrans[1]/s1:PaymProcessingData[s1:Name = 'Format']/s1:Value)" />
    <xsl:variable name="var:ProcessingDate" select="s1:LedgerJournalTrans[1]/s1:PaymProcessingData[s1:Name = 'Processing date']/s1:Value" />
    <xsl:variable name="var:FileName" select="string(s1:LedgerJournalTrans[1]/s1:PaymProcessingData[s1:Name = 'AIFFileName']/s1:Value)" />
    <xsl:variable name="var:BatchBookingParameter" select="s1:LedgerJournalTrans[1]/s1:PaymProcessingData[s1:Name = 'Batch booking']" />
    <xsl:variable name="var:BatchBooking">
      <xsl:choose>
        <xsl:when test="not($var:BatchBookingParameter) or not($var:BatchBookingParameter/s1:Value)">false</xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="translate(string($var:BatchBookingParameter/s1:Value), 'TRUEFALS', 'truefals')" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="$var:BatchBooking != 'true' and $var:BatchBooking != 'false'">
      <xsl:value-of select="userCSharp:throwOutException('The Batch booking parameter is incorrect.')" />
    </xsl:if>
    <xsl:variable name="var:NumberOfTransactions" select="count(/s1:VendPayments/s1:LedgerJournalTrans)" />
    <xsl:variable name="var:DecimalFormat">
      <xsl:choose>
        <xsl:when test="$var:Country = 'ES'">0.00</xsl:when>
        <xsl:otherwise>0.##</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="var:TotalSum" select="sum(s1:LedgerJournalTrans/s1:AmountCurDebit) - sum(s1:LedgerJournalTrans/s1:AmountCurCredit)" />    
    <xsl:if test="$var:TotalSum &lt; 0">
      <xsl:value-of select="userCSharp:throwOutException(concat('You can', $var:Apos, 't generate the payment because the total payment amount for all of the ledger journal lines is negative.', 
    ' Modify the entries in the Journal voucher form to correct the total payment amount, and then generate the payment.'))" />
    </xsl:if>
    
    <xsl:variable name ="var:NameLength">
      <xsl:choose>
        <xsl:when test="$var:Country='DE' or $var:Country='AT'">70</xsl:when>
        <xsl:otherwise>140</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="var:ExtendedCharSetNum">
      <xsl:choose>
        <xsl:when test="$var:Country = 'AT'">1</xsl:when>
        <xsl:otherwise>0</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <Document xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <xsl:attribute name ="xsi:schemaLocation">
        <xsl:value-of select ="concat($var:NsPrefix, $var:Schema, ' ', $var:Schema, '.xsd')"/>
      </xsl:attribute>
      <xsl:if test="$var:FileName">
        <AIFFileName>
          <xsl:value-of select="$var:FileName" />
        </AIFFileName>
      </xsl:if>
      <CstmrCdtTrfInitn>
        <GrpHdr>
          <xsl:for-each select="s1:LedgerJournalTrans[1]">
            <MsgId>
              <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(s1:JournalNum/text()), 1, 35)" />
            </MsgId>
            <CreDtTm>
              <xsl:value-of select="userCSharp:DateCurrentDateTime()" />
            </CreDtTm>
            <NbOfTxs>
              <xsl:value-of select="$var:NumberOfTransactions" />
            </NbOfTxs>
            <CtrlSum>
              <xsl:value-of select="format-number($var:TotalSum, $var:DecimalFormat)" />
            </CtrlSum>
            <xsl:for-each select="s1:CompanyInfo">
              <InitgPty>
                <xsl:if test="not(s1:Name) and $var:Country = 'AT'">
                  <xsl:value-of select="userCSharp:throwOutException(concat('The legal entity name is not specified for the legal entity ', s1:DataArea, '. Specify the legal entity name in the Legal entities form to generate the payment.'))" />
                </xsl:if>
                <xsl:if test="s1:Name">
                  <Nm>
                    <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(s1:Name/text(), $var:ExtendedCharSetNum), 1, $var:NameLength)" />
                  </Nm>
                </xsl:if>
                <xsl:if test="$var:Country = 'FI'">
                  <xsl:for-each select="s1:DirPartyPosAddr[s1:IsPrimary = 'Yes']">
                    <!--FI addresses need to be on a single line-->
                    <xsl:variable name="var:v9_2" select="substring(userCSharp:ReplaceSpecialChars(concat(s1:Street/text(), ' ', s1:ZipCode/text(),' ', s1:City/text())), 1, 70)" />
                    <PstlAdr>
                      <xsl:choose>
                        <xsl:when test="s1:ISOcode/text()">
                          <Ctry>
                            <xsl:value-of select="s1:ISOcode/text()" />
                          </Ctry>
                        </xsl:when>
                        <xsl:otherwise>
                          <Ctry>
                            <xsl:value-of select="substring(s1:CountryRegionId/text(),1,2)" />
                          </Ctry>
                        </xsl:otherwise>
                      </xsl:choose>
                      <xsl:if test="$var:v9_2 != ''">
                        <AdrLine>
                          <xsl:value-of select="$var:v9_2" />
                        </AdrLine>
                      </xsl:if>
                    </PstlAdr>
                  </xsl:for-each>
                </xsl:if>
                <xsl:if test="$var:Country = 'IT' and s1:CUC_IT = ''">
                  <xsl:value-of select="userCSharp:throwOutException('The CBI Proprietary Unique Code (CUC) is not specified for the legal entity $var:CompanyName. Specify the CUC of the legal entity to generate the payment.')" />
                </xsl:if>
                <xsl:if test="$var:Country = 'IT' and s1:CUC_IT">
                  <Id>
                    <OrgId>
                      <Othr>
                        <Id>
                          <xsl:value-of select="s1:CUC_IT/text()"/>
                        </Id>
                        <Issr>CBI</Issr>
                      </Othr>
                    </OrgId>
                  </Id>
                </xsl:if>
                <xsl:if test="$var:Country = 'ES' and s1:CoRegNum">
                  <Id>
                    <OrgId>
                      <Othr>
                        <Id>
                          <xsl:value-of select="concat(s1:CoRegNum, ../s1:BankAccountTable/s1:BankSuffix)"/>
                        </Id>
                      </Othr>
                    </OrgId>
                  </Id>
                </xsl:if>
              </InitgPty>
            </xsl:for-each>
          </xsl:for-each>
        </GrpHdr>

        <PmtInf>
          <xsl:for-each select="s1:LedgerJournalTrans[1]">
            <PmtInfId>
              <xsl:choose>
                <xsl:when test="$var:Country = 'IT'">
                  <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(s1:JournalNum/text()), 1, 35)" />
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(concat(s1:JournalNum, translate($var:ProcessingDate, '-', ''))), 1, 35)" />
                </xsl:otherwise>
              </xsl:choose>
            </PmtInfId>
            <PmtMtd>TRF</PmtMtd>
            <BtchBookg>
              <xsl:value-of select="$var:BatchBooking"/>
            </BtchBookg>
            <NbOfTxs>
              <xsl:value-of select="$var:NumberOfTransactions" />
            </NbOfTxs>
            <CtrlSum>
              <xsl:value-of select="format-number($var:TotalSum, $var:DecimalFormat)" />
            </CtrlSum>
            <xsl:if test="$var:Country != 'IT'">
              <PmtTpInf>
                <SvcLvl>
                  <Cd>SEPA</Cd>
                </SvcLvl>
              </PmtTpInf>
            </xsl:if>
            <ReqdExctnDt>
              <xsl:value-of select="userCSharp:RequestedExecutionDate($var:ProcessingDate, $var:Country)" />
            </ReqdExctnDt>
            <xsl:for-each select="s1:CompanyInfo">
              <Dbtr>
                <xsl:if test="s1:Name">
                  <Nm>
                    <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(s1:Name/text(), $var:ExtendedCharSetNum), 1, $var:NameLength)" />
                  </Nm>
                </xsl:if>
                <xsl:for-each select="s1:DirPartyPosAddr[s1:IsPrimary = 'Yes']">
                  <!-- AT SEPA file does not contain the PstlAdr Tag -->
                  <xsl:if test="$var:Country != 'AT' and $var:Country != 'FR'">
                    <xsl:variable name ="var:v11_01" select="userCSharp:ReplaceSpecialChars(userCSharp:FlattenAddress(s1:Address))" />
                    <xsl:variable name ="var:v11_1" select="substring($var:v11_01,1,70)" />
                    <xsl:variable name ="var:v11_2" select="substring($var:v11_01,71,140)" />
                    <PstlAdr>
                      <Ctry>
                        <xsl:choose>
                          <xsl:when test="s1:ISOcode/text()">
                            <xsl:value-of select="s1:ISOcode/text()" />
                          </xsl:when>
                          <xsl:otherwise>
                            <xsl:value-of select="substring(s1:CountryRegionId/text(), 1, 2)" />
                          </xsl:otherwise>
                        </xsl:choose>
                      </Ctry>
                      <xsl:choose>
                        <xsl:when test="$var:Country = 'BE'">
                          <xsl:call-template name="AdrLines">
                            <xsl:with-param name="AdrLine1" select="substring($var:v11_1, 1, 35)" />
                            <xsl:with-param name="AdrLine2" select="substring($var:v11_1, 36, 70)" />
                          </xsl:call-template>
                        </xsl:when>
                        <xsl:when test="$var:Country = 'FI'">
                          <xsl:call-template name="AdrLines">
                            <xsl:with-param name="AdrLine1" select="substring(userCSharp:ReplaceSpecialChars(concat(s1:Street/text(), ' ', s1:ZipCode/text(),' ', s1:City/text())), 1, 70)" />
                          </xsl:call-template>
                        </xsl:when>
                        <xsl:when test="$var:Country = 'IT'">
                          <xsl:call-template name="AdrLines">
                            <xsl:with-param name="AdrLine1" select="userCSharp:ReplaceSpecialChars(substring(s1:Street, 1, 70))" />
                            <xsl:with-param name="AdrLine2" select="userCSharp:ReplaceSpecialChars(substring(concat(s1:ZipCode/text(), ' ', s1:City/text(), ' ', s1:CountryRegionId/text()), 1, 70))" />
                          </xsl:call-template>
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:call-template name="AdrLines">
                            <xsl:with-param name="AdrLine1" select="$var:v11_1" />
                            <xsl:with-param name="AdrLine2" select="$var:v11_2" />
                          </xsl:call-template>
                        </xsl:otherwise>
                      </xsl:choose>
                    </PstlAdr>
                  </xsl:if>
                  <xsl:if test="$var:Country = 'FI' and ../../s1:BankAccountTable/s1:CompanyPaymId/text()">
                    <Id>
                      <OrgId>
                        <Othr>
                          <Id>
                            <xsl:value-of select="../../s1:BankAccountTable/s1:CompanyPaymId/text()" />
                          </Id>
                          <SchmeNm>
                            <Cd>BANK</Cd>
                          </SchmeNm>
                        </Othr>
                      </OrgId>
                    </Id>
                  </xsl:if>
                  <xsl:if test="$var:Country = 'IT' and s1:ISOcode">
                    <CtryOfRes>
                      <xsl:value-of select="s1:ISOcode/text()" />
                    </CtryOfRes>
                  </xsl:if>
                </xsl:for-each>
              </Dbtr>
            </xsl:for-each>
            <xsl:for-each select="s1:BankAccountTable">
              <xsl:variable name ="var:DbtrIBAN" select="translate(s1:IBAN/text(), translate(s1:IBAN/text(), $var:AlphaNumeric, ''), '')" />
              <DbtrAcct>
                <Id>
                  <xsl:choose>
                    <xsl:when test="$var:DbtrIBAN">
                      <IBAN>
                        <xsl:value-of select="$var:DbtrIBAN" />
                      </IBAN>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:value-of select="userCSharp:throwOutException('IBAN Number is not specified for payment bank account.')" />
                    </xsl:otherwise>
                  </xsl:choose>
                </Id>
              </DbtrAcct>
              <xsl:if test="s1:SWIFTNo or $var:Country = 'IT'">
                <DbtrAgt>
                  <FinInstnId>
                    <xsl:if test="s1:SWIFTNo">
                      <BIC>
                        <xsl:value-of select="translate(s1:SWIFTNo/text(), translate(s1:SWIFTNo/text(), $var:AlphaNumeric, ''), '')" />
                      </BIC>
                    </xsl:if>
                    <xsl:if test="$var:Country = 'IT'">
                      <ClrSysMmbId>
                        <MmbId>
                          <xsl:value-of select="substring($var:DbtrIBAN, 6, 5)" />
                        </MmbId>
                      </ClrSysMmbId>
                    </xsl:if>
                  </FinInstnId>
                </DbtrAgt>
              </xsl:if>
            </xsl:for-each>
            <ChrgBr>SLEV</ChrgBr>
          </xsl:for-each>
          <xsl:for-each select="s1:LedgerJournalTrans">
            <CdtTrfTxInf>
              <xsl:if test="s1:CurrencyCode/text() != 'EUR'">
                <xsl:value-of select="userCSharp:throwOutException('The payment amount currency should always be EUR.')" />
              </xsl:if>
              <PmtId>
                <xsl:if test="$var:Country = 'FI'">
                  <InstrId>
                    <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(s1:JournalNum/text()), 1, 35)" />
                  </InstrId>
                </xsl:if>
                <EndToEndId>
                  <xsl:variable name="var:RecId" select="substring(s1:RecId, string-length(s1:RecId) + string-length(s1:Voucher) -33)" />
                  <xsl:value-of select="concat(userCSharp:ReplaceSpecialChars(s1:Voucher), '-', $var:RecId)"/>
                </EndToEndId>
              </PmtId>
              <xsl:if test="$var:Country = 'IT'">
                <PmtTpInf>
                  <SvcLvl>
                    <Cd>SEPA</Cd>
                  </SvcLvl>
                  <xsl:if test="substring(s1:VendBankAccount/s1:BankIBAN/text(), 1, 2) = 'IT'">
                    <CtgyPurp>
                      <Cd>TRAD</Cd>
                    </CtgyPurp>
                  </xsl:if>
                </PmtTpInf>
              </xsl:if>
              <xsl:variable name="var:TransactionAmount">
                <xsl:value-of select="sum(s1:AmountCurCredit/text()) + sum(s1:AmountCurDebit/text())" />
              </xsl:variable>
              <Amt>
                <InstdAmt Ccy="EUR">
                  <xsl:value-of select="format-number(userCSharp:abs($var:TransactionAmount), $var:DecimalFormat)" />
                </InstdAmt>
              </Amt>
              <xsl:if test="not(s1:VendBankAccount)">
                <xsl:value-of select="userCSharp:throwOutException('Vendor bank account is not specified.')" />
              </xsl:if>
              <xsl:if test="(not(s1:VendBankAccount/s1:BankIBAN) or not(s1:BankAccountTable/s1:IBAN) or 
                      substring(s1:VendBankAccount/s1:BankIBAN, 1, 2) != substring(s1:BankAccountTable/s1:IBAN, 1, 2)) and
                      (not(s1:VendBankAccount/s1:SWIFTNo) or not(s1:BankAccountTable/s1:SWIFTNo))">
                <xsl:value-of select="userCSharp:throwOutException('SWIFT Number is not specified for payment bank account.')" />
              </xsl:if>
              <xsl:for-each select="s1:VendBankAccount">
                <xsl:if test="s1:SWIFTNo">
                  <CdtrAgt>
                    <FinInstnId>
                      <BIC>
                        <xsl:value-of select="translate(s1:SWIFTNo/text(), translate(s1:SWIFTNo/text(), $var:AlphaNumeric, ''), '')" />
                      </BIC>
                    </FinInstnId>
                  </CdtrAgt>
                </xsl:if>
              </xsl:for-each>
              <xsl:for-each select="s1:DimAttrLevVal">
                <xsl:for-each select="s1:VendTable">
                  <Cdtr>
                    <Nm>
                      <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(s1:Name/text()), 1, $var:NameLength)" />
                    </Nm>
                    <xsl:for-each select="s1:DirPtyNmPriAddr">                      
                      <xsl:if test="$var:Country != 'AT' and $var:Country!='BE' and $var:Country!='ES' and $var:Country!='DE'">
                        <xsl:variable name ="var:v13_01" select="userCSharp:ReplaceSpecialChars(userCSharp:FlattenAddress(s1:Address))" />
                        <xsl:variable name ="var:v13_1" select="substring($var:v13_01,1,70)" />
                        <xsl:variable name ="var:v13_2" select="substring($var:v13_01,71,140)" />
                        <PstlAdr>
                          <Ctry>
                            <xsl:choose>
                              <xsl:when test="s1:ISOcode/text()">
                                <xsl:value-of select="s1:ISOcode/text()" />
                              </xsl:when>
                              <xsl:otherwise>
                                <xsl:value-of select="substring(s1:CountryRegionId/text(), 1, 2)" />
                              </xsl:otherwise>
                            </xsl:choose>
                          </Ctry>
                          <xsl:choose>
                            <xsl:when test="$var:Country = 'FI'">
                              <xsl:call-template name="AdrLines">
                                <xsl:with-param name="AdrLine1" select="substring(userCSharp:ReplaceSpecialChars(concat(s1:Street/text(), ' ', s1:ZipCode/text(), ' ', s1:City/text())), 1, 70)" />
                              </xsl:call-template>
                            </xsl:when>
                            <xsl:when test="$var:Country = 'IT'">
                              <xsl:call-template name="AdrLines">
                                <xsl:with-param name="AdrLine1" select="userCSharp:ReplaceSpecialChars(substring(s1:Street, 1, 70))" />
                                <xsl:with-param name="AdrLine2" select="userCSharp:ReplaceSpecialChars(substring(concat(s1:ZipCode/text(), ' ', s1:City/text(), ' ', s1:CountryRegionId/text()), 1, 70))" />
                              </xsl:call-template>
                            </xsl:when>
                            <xsl:otherwise>
                              <xsl:call-template name="AdrLines">
                                <xsl:with-param name="AdrLine1" select="$var:v13_1" />
                                <xsl:with-param name="AdrLine2" select="$var:v13_2" />
                              </xsl:call-template>
                            </xsl:otherwise>
                          </xsl:choose>
                        </PstlAdr>
                      </xsl:if>
                    </xsl:for-each>
                    <xsl:if test="$var:Country = 'FR' and s1:CompanyIdSiret">
                      <Id>
                        <OrgId>
                          <Othr>
                            <Id>
                              <xsl:value-of select="substring(s1:CompanyIdSiret/text(), 1, 35)" />
                            </Id>
                            <SchmeNm>
                              <Prtry>SIRET</Prtry>
                            </SchmeNm>
                          </Othr>
                        </OrgId>
                      </Id>
                    </xsl:if>
                    <xsl:if test="$var:Country = 'IT' and s1:DirPtyNmPriAddr/s1:ISOcode">
                      <CtryOfRes>
                        <xsl:value-of select="s1:DirPtyNmPriAddr/s1:ISOcode/text()" />
                      </CtryOfRes>
                    </xsl:if>
                  </Cdtr>
                </xsl:for-each>
              </xsl:for-each>
              <CdtrAcct>
                <xsl:for-each select="s1:VendBankAccount">
                  <Id>
                    <xsl:choose>
                      <xsl:when test="s1:BankIBAN">
                        <IBAN>
                          <xsl:value-of select="translate(s1:BankIBAN/text(), translate(s1:BankIBAN/text(), $var:AlphaNumeric, ''), '')" />
                        </IBAN>
                      </xsl:when>
                      <xsl:otherwise>
                        <xsl:value-of select="userCSharp:throwOutException('IBAN Number is not specified for vendor bank account.')" />
                      </xsl:otherwise>
                    </xsl:choose>
                  </Id>
                </xsl:for-each>
              </CdtrAcct>
              <xsl:variable name="var:VendIBANCountryCode" select="substring(s1:VendBankAccount/s1:BankIBAN/text(), 1, 2)" />
              <xsl:if test="(($var:Country = 'FR' or $var:Country = 'ES') and s1:BankCentralBankPurposeCode) or 
                             ($var:Country = 'IT' and $var:VendIBANCountryCode != 'IT')">
                <RgltryRptg>
                  <xsl:if test="$var:Country = 'ES' or $var:Country = 'IT'">
                    <DbtCdtRptgInd>DEBT</DbtCdtRptgInd>
                  </xsl:if>
                  <xsl:if test="s1:BankCentralBankPurposeCode">
                    <Dtls>
                      <xsl:variable name="var:CodeLength">
                        <xsl:choose>
                          <xsl:when test="$var:Country = 'ES' or $var:Country = 'IT'">3</xsl:when>
                          <xsl:otherwise>10</xsl:otherwise>
                        </xsl:choose>
                      </xsl:variable>
                      <Cd>
                        <xsl:value-of select="substring(s1:BankCentralBankPurposeCode/text(), 1, $var:CodeLength)" />
                      </Cd>
                      <xsl:if test="$var:Country = 'ES' or $var:Country = 'IT'">
                        <Amt Ccy="EUR">
                          <xsl:value-of select="format-number($var:TransactionAmount, $var:DecimalFormat)" />
                        </Amt>
                        <xsl:if test="s1:BankCentralBankPurposeText/text()">
                          <Inf>
                            <xsl:value-of select="substring(s1:BankCentralBankPurposeText/text(), 1, 35)" />
                          </Inf>
                        </xsl:if>
                      </xsl:if>
                    </Dtls>
                  </xsl:if>
                </RgltryRptg>
              </xsl:if>

              <xsl:variable name="var:VendTransInvoice" select="s1:SpecTrans/s1:VendTransOpen/s1:VendTrans[not(s1:VendTransPromissoryNoteInvoice)] | 
                            s1:SpecTrans/s1:VendTransOpen/s1:VendTrans/s1:VendTransPromissoryNoteInvoice/s1:VendSettlement/s1:VendTransInvoice" />
              <xsl:variable name="var:InvoiceIdsRaw">
                <xsl:call-template name="String-join">
                  <xsl:with-param name="List" select="$var:VendTransInvoice/s1:Invoice" />
                  <xsl:with-param name="Delimiter">,</xsl:with-param>
                </xsl:call-template>
              </xsl:variable>
              <xsl:variable name="var:InvoiceIds" select="substring(userCSharp:ReplaceSpecialChars($var:InvoiceIdsRaw), 1, 140)" />                      
              <xsl:variable name="var:PaymentId" select="substring(userCSharp:ReplaceSpecialChars(s1:PaymId/text(), $var:ExtendedCharSetNum), 1, 140)" />              
              <xsl:variable name="var:PaymentIdIncludesRemittanceInformation" select="$var:Country = 'BE' or $var:Country = 'DE' or $var:Country = 'AT'" />
              
              <!--FR/NL/DE/FI should always use Ustrd-->
              <xsl:variable name="var:UstrdCountry" select="$var:Country = 'FR' or $var:Country = 'NL' or $var:Country = 'DE' or $var:Country = 'FI'" />
              <xsl:variable name="var:ShowUstrd" select="($var:Format = 'USTRD' or $var:UstrdCountry or 
                            ($var:Country = 'BE' and not(userCSharp:isIsabelFormat(s1:PaymId/text())))) and 
                            ($var:InvoiceIds or $var:PaymentIdIncludesRemittanceInformation and $var:PaymentId)" />  
              
              <xsl:variable name="var:StrdCountry" select="$var:Country != 'FR' and $var:Country != 'NL' and $var:Country != 'DE' and $var:Country != 'BE'" />
              <xsl:variable name="var:ShowStrd" select="(($var:Format ='STRD' and $var:StrdCountry) or
                            ($var:Country = 'BE' and userCSharp:isIsabelFormat(s1:PaymId/text()) and ($var:Format ='STRD' or $var:Format =''))) and
                            $var:VendTransInvoice"/>

              <xsl:if test="$var:ShowUstrd or $var:ShowStrd">
                <RmtInf>                  
                  <xsl:if test="$var:ShowUstrd">
                    <Ustrd>
                      <xsl:choose>
                        <xsl:when test="$var:PaymentIdIncludesRemittanceInformation and $var:PaymentId != ''">
                          <xsl:value-of select="$var:PaymentId" />
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:value-of select="$var:InvoiceIds" />
                        </xsl:otherwise>
                      </xsl:choose>
                    </Ustrd>
                  </xsl:if>
                  <xsl:if test="$var:ShowStrd">
                    <!--FI, IT should always use a Strd tag for each referred document-->
                    <xsl:for-each select="$var:VendTransInvoice[$var:Country = 'FI' or $var:Country = 'IT' or position() = 1]">
                      <xsl:variable name="var:DocumentAmount" select="translate(s1:AmountCur, '+', '')" />
                      <xsl:variable name="var:DocumentType">
                        <xsl:choose>
                          <xsl:when test="$var:Country = 'FI' and $var:DocumentAmount &gt; 0">CREN</xsl:when>
                          <xsl:otherwise>CINV</xsl:otherwise>
                        </xsl:choose>
                      </xsl:variable>
                      <xsl:variable name="var:PaymentIdFI" select="substring(userCSharp:ReplaceSpecialChars(s1:PaymId/text(), $var:ExtendedCharSetNum), 1, 140)" />
                      <Strd>
                        <xsl:if test="$var:Country != 'BE' and $var:Country != 'AT'">
                          <RfrdDocInf>
                            <Tp>
                              <CdOrPrtry>
                                <Cd><xsl:value-of select="$var:DocumentType" /></Cd>
                              </CdOrPrtry>
                            </Tp>
                            <xsl:if test="s1:Invoice/text()">
                              <Nb>
                                <xsl:value-of select="substring(userCSharp:ReplaceSpecialChars(s1:Invoice/text()), 1, 35)" />
                              </Nb>
                            </xsl:if>
                          </RfrdDocInf>
                        </xsl:if>
                        <xsl:if test="$var:Country = 'FI'">
                          <!-- Implementation abs() in XSLT ver. 1 -->
                          <xsl:variable name="var:RemittanceAmount" select="(($var:DocumentAmount &gt;= 0) - ($var:DocumentAmount &lt; 0)) * $var:DocumentAmount" />
                          <RfrdDocAmt>
                            <xsl:if test= "$var:DocumentType = 'CINV'">
                              <RmtdAmt Ccy="EUR">
                                <xsl:value-of select="format-number($var:RemittanceAmount, $var:DecimalFormat)" />
                              </RmtdAmt>
                            </xsl:if>
                            <xsl:if test= "$var:DocumentType = 'CREN' ">
                              <CdtNoteAmt Ccy="EUR">
                                <xsl:value-of select="format-number($var:RemittanceAmount, $var:DecimalFormat)" />
                              </CdtNoteAmt>
                            </xsl:if>
                          </RfrdDocAmt>
                        </xsl:if>
                        <xsl:if test="$var:Country = 'FI' or $var:Country = 'BE' or $var:Country = 'AT'">
                          <CdtrRefInf>
                            <Tp>
                              <CdOrPrtry>
                                <Cd>SCOR</Cd>
                              </CdOrPrtry>
                              <xsl:variable name="var:CreditorReferenceIssuer">
                                <xsl:choose>
                                  <xsl:when test="$var:Country = 'BE'">BBA</xsl:when>
                                  <xsl:when test="$var:Country = 'FI'">ISO</xsl:when>
                                </xsl:choose>
                              </xsl:variable>
                              <xsl:if test="$var:CreditorReferenceIssuer != ''">
                                <Issr>
                                  <xsl:value-of select="$var:CreditorReferenceIssuer"/>
                                </Issr>
                              </xsl:if>
                            </Tp>
                            <xsl:if test="$var:Country = 'FI' and $var:PaymentIdFI != ''">
                              <CdtrRef>
                                <xsl:value-of select="$var:PaymentIdFI"/>
                              </CdtrRef>
                            </xsl:if>
                            <xsl:variable name="var:CreditorReference">
                              <xsl:choose>
                                <xsl:when test="$var:Country = 'BE'">
                                  <xsl:value-of select="substring(translate(../../../s1:PaymId/text(), translate(../../../s1:PaymId/text(), $var:Numeric, ''), ''), 1, 35)"/>
                                </xsl:when>
                                <xsl:otherwise>
                                  <xsl:value-of select="substring($var:PaymentId, 1, 35)" />
                                </xsl:otherwise>
                              </xsl:choose>
                            </xsl:variable>
                            <xsl:if test="$var:CreditorReference != ''">
                              <Ref>
                                <xsl:value-of select="$var:CreditorReference" />
                              </Ref>
                            </xsl:if>
                          </CdtrRefInf>
                        </xsl:if>
                      </Strd>
                    </xsl:for-each>
                  </xsl:if>
                </RmtInf>
              </xsl:if>
            </CdtTrfTxInf>
          </xsl:for-each>
        </PmtInf>
      </CstmrCdtTrfInitn>
    </Document>
  </xsl:template>
  <msxsl:script language="C#" implements-prefix="userCSharp">
    <![CDATA[
public string DateCurrentDateTime()
{
	DateTime dt = DateTime.Now;
	string curdate = dt.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
	string curtime = dt.ToString("T", System.Globalization.CultureInfo.InvariantCulture);
	string retval = curdate + "T" + curtime;
	return retval;
}

public string RequestedExecutionDate(string date, string country)
{
  DateTime dt;
  
  try
  {
      DateTime.ParseExact(date, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
  }
  catch (FormatException)
  {
      throw new System.Exception("Processing date should be in format YYYY-MM-DD");                                    
  }

  if (country == "NL")
  {
    dt = Convert.ToDateTime(date, System.Globalization.CultureInfo.InvariantCulture);

    if (dt > DateTime.Today.AddDays(30) || dt < DateTime.Today.AddDays(-5))
    {
        throw new System.Exception("Processing date must be between 5 days in the past and 30 days in the future");
    }
  }

  return date;
}
 
//We send the Error Text and the Record Type to the AIF Exception Log.
public string throwOutException(string errorText){
  throw new System.Exception(errorText);
}

public static string ReplaceSpecialChars(string s)
{
    return ReplaceSpecialChars(s, 0);
}

public static string ReplaceSpecialChars(string s, int charSetNum)
{
    var validCharacters = @"+,(/)-'(/)-?AAAAAAACEEEEIIIIDNOOOOOOUUUUYsaaaaaaaceeeeiiiidnoooooouuuuyty" +
                          @"AaAaAaCcCcCcDdDdEeEeEeEeGgGgGgIiIiIiIiKkLlLlLlLlNnNnNnOoOoRrRrSsSsSsTtTtUuUuUuUuYZzZzZzE";
    var specificCharacters = @"&;[\]_`{|}~¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ" +
                             @"ĀāĂăĄąĆćĊċČčĎďĐđĒēĖėĘęĚěĜĝĞğĢģĪīĮįİıĲĳĶķĹĺĻļĽľŁłŃńŅņŇňŐőŒœŔŕŘřŚśŞşŠšŢţŤťŪūŮůŰűŲųŸŹźŻżŽž€";
    // Recommended charset for SEPA
    string[] charSets = {@"A-Za-z0-9/\-\?:\(\)\.,'\+ ", 
    // Additional charset for Austria
    @"&><""\|€$§%!=#~;\*\{\}\[\]@\\_°\^"}; 
    var rx = new Regex("[^" + charSets[0] + (charSetNum != 0 ? charSets[charSetNum] : "") + "]");

    return rx.Replace(s, 
      x => 
      {
        var pos = specificCharacters.IndexOf(x.Value[0]);
        return pos == -1 ? "." : validCharacters.Substring(pos, 1);
      });
}

public static string FlattenAddress(string address)
{
  string result = string.Empty;

  foreach (var addressLine in address.Split('\n'))
  {
      string addressLineTrimmed = addressLine.Trim();
      if (addressLineTrimmed.Length > 0)
      {
          result = string.Format("{0}{1} ", result, addressLineTrimmed);
      }
  }

  if (result.Length > 0)
  {
      result = result.Remove(result.Length - 1);
  }

  return result;
}
public static bool isIsabelFormat(string paymentId)
{
  return Regex.IsMatch(paymentId, @"(\*{3}.*?\*{3})|(\+{3}.*?\+{3})");
}

public static double abs(double value)
{
  return Math.Abs(value);
}

public static string upperCase(string value)
{
  return value.ToUpper();
}
]]>
  </msxsl:script>
</xsl:stylesheet>