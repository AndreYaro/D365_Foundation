<?xml version="1.0" encoding="UTF-16"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:var="http://schemas.microsoft.com/BizTalk/2003/var" exclude-result-prefixes="msxsl var s0 s1 userCSharp" version="1.0" xmlns="urn:sepade:xsd:pain.001.002.02" xmlns:s0="http://schemas.microsoft.com/dynamics/2008/01/sharedtypes" xmlns:s1="http://schemas.microsoft.com/dynamics/2008/01/documents/CustPayments" xmlns:userCSharp="http://schemas.microsoft.com/BizTalk/2003/userCSharp">
  <xsl:output omit-xml-declaration="yes" method="xml" version="1.0" />
  <xsl:template match="/">
    <xsl:apply-templates select="/s1:CustPayments" />
  </xsl:template>
  <xsl:template match="/s1:CustPayments">
    <Document>
      <pain.001.001.02>
          <GrpHdr>
          <xsl:for-each select="s1:LedgerJournalTrans">
          <xsl:if test="position()=1">
          <xsl:variable name="var:v1" select="userCSharp:DateCurrentDateTime()" />
          <xsl:variable name="var:v2" select="count(/s1:CustPayments/s1:LedgerJournalTrans)" />
            <xsl:if test="s1:JournalNum">
              <MsgId>
                <xsl:value-of select="s1:JournalNum/text()" />
              </MsgId>
            </xsl:if>
            <CreDtTm>
              <xsl:value-of select="$var:v1" />
            </CreDtTm>
            <NbOfTxs>
              <xsl:value-of select="$var:v2" />
            </NbOfTxs>
            <xsl:variable name="var:v3" select="userCSharp:InitCumulativeSum(0)" />
            <xsl:for-each select="/s1:CustPayments/s1:LedgerJournalTrans">
              <xsl:variable name="var:v4" select="string(s1:AmountCurCredit/text())" />
              <xsl:variable name="var:v6" select="string(s1:AmountCurDebit/text())" />              
              <xsl:variable name="var:v7" select="userCSharp:AddToCumulativeSum(0,string($var:v4),string($var:v6))" />
			        <xsl:variable name="var:v7_1" select="userCSharp:AddToCumulativeSum(0,string($var:v6),'not used')" />				
            </xsl:for-each>
            <xsl:variable name="var:v8" select="userCSharp:MathAbs(userCSharp:GetCumulativeSum(0))" />
            <CtrlSum>
              <xsl:value-of select="$var:v8" />
            </CtrlSum>
              <Grpg>MIXD</Grpg>
            <xsl:for-each select="s1:CompanyInfo">              
                <InitgPty>
                  <xsl:if test="s1:Name">
                    <Nm>
                      <xsl:value-of select="s1:Name/text()" />
                    </Nm>
                  </xsl:if>
                  <xsl:for-each select="s1:DirPartyPosAddr">
                        <xsl:variable name="var:v9" select="userCSharp:StringConcat(string(s1:Address/text()) , string(/text()))" />
                        <PstlAdr>
                          <AdrLine>
                            <xsl:value-of select="$var:v9" />
                          </AdrLine>
                          <xsl:if test="s1:CountryRegionId">
                            <Ctry>
                              <xsl:value-of select="s1:CountryRegionId/text()" />
                            </Ctry>
                          </xsl:if>
                        </PstlAdr>
                  </xsl:for-each>
			            <Id>
                        <OrgId>
                        <xsl:for-each select="../../s1:BankAccountTable">
				                  <xsl:if test="s1:CompanyPaymId">
                            <BkPtyId>
                              <xsl:value-of select="s1:CompanyPaymId/text()" />
                            </BkPtyId>
                          </xsl:if>
				                </xsl:for-each>
                        <xsl:if test="../s1:CoRegNum">
                          <TaxIdNb>
                            <xsl:value-of select="../s1:CoRegNum/text()" />
                          </TaxIdNb>
                        </xsl:if>
                        </OrgId>
                  </Id>
                </InitgPty>
            
            </xsl:for-each>
		        </xsl:if>
            </xsl:for-each>
          </GrpHdr>
         <xsl:for-each select="s1:LedgerJournalTrans">
           <xsl:variable name="var:AlphaNumeric" select="'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'" />
           <!--Validate payment journal currency-->
           <xsl:if test="s1:CurrencyCode/text()!='EUR'">
             <xsl:value-of select="userCSharp:throwOutException('The payment amount currency should always be EUR.')" />
           </xsl:if>
           <PmtInf>
             <xsl:if test="s1:JournalNum">
               <PmtInfId>
                 <xsl:value-of select="s1:JournalNum/text()" />
               </PmtInfId>
             </xsl:if>
                <PmtMtd>TRF</PmtMtd>
              <PmtTpInf>
                <SvcLvl>
                    <Cd>SEPA</Cd>
                </SvcLvl>
              </PmtTpInf>
          <xsl:for-each select="s1:PaymProcessingData">
              <xsl:if test="s1:Name/text()='Processing date'">
                <xsl:variable name="var:v10" select="s1:Value/text()" />
                <ReqdColltnDt>
                  <xsl:value-of select="$var:v10" />
                </ReqdColltnDt>
              </xsl:if>
           </xsl:for-each>
              <xsl:for-each select="s1:CompanyInfo">                
                  <Cdtr>
                    <xsl:if test="s1:Name">
                      <Nm>
                        <xsl:value-of select="s1:Name/text()" />
                      </Nm>
                    </xsl:if>
                    <xsl:for-each select="s1:DirPartyPosAddr">
                          <xsl:variable name="var:v11" select="string(s1:Address/text())" />
                          <PstlAdr>
                            <AdrLine>
                              <xsl:value-of select="$var:v11" />
                            </AdrLine>
                            <xsl:if test="s1:CountryRegionId">
                              <Ctry>
                                <xsl:value-of select="s1:CountryRegionId/text()" />
                              </Ctry>
                            </xsl:if>
                          </PstlAdr>
                        </xsl:for-each>
                      
                  </Cdtr>                
              </xsl:for-each>
             <xsl:for-each select="s1:BankAccountTable">
              <CdtrAcct>
                    <Id>
                      <xsl:choose>
                        <xsl:when test="s1:IBAN">
                          <IBAN>
                            <xsl:value-of select="translate(s1:IBAN/text(), translate(s1:IBAN/text(), $var:AlphaNumeric, ''), '')" />
                          </IBAN>
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:value-of select="userCSharp:throwOutException('IBAN Number is not specified for payment bank account.')" />
                        </xsl:otherwise>
                      </xsl:choose>
                    </Id>
              </CdtrAcct>
              <CdtrAgt>
                    <FinInstnId>
                      <xsl:choose>
                        <xsl:when test="s1:SWIFTNo">
                          <BIC>
                            <xsl:value-of select="translate(s1:SWIFTNo/text(), translate(s1:SWIFTNo/text(), $var:AlphaNumeric, ''), '')" />
                          </BIC>
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:value-of select="userCSharp:throwOutException('SWIFT Number is not specified for payment bank account.')" />
                        </xsl:otherwise>
                      </xsl:choose>
                    </FinInstnId>
              </CdtrAgt>
                </xsl:for-each>
                <ChrgBr>SLEV</ChrgBr>
              <DrctDbtTxInf>
                <PmtId>
                  <xsl:if test="s1:PaymId">
                    <EndToEndId>
                      <xsl:choose>
                        <xsl:when test="s1:PaymId">
                          <xsl:value-of select="s1:PaymId/text()" />
                        </xsl:when>
                        <xsl:otherwise>Not-Provided</xsl:otherwise>
                      </xsl:choose>
                    </EndToEndId>
                  </xsl:if>
                </PmtId>
                  <InstdAmt Ccy="EUR">
                    <xsl:if test="s1:AmountCurCredit">
                      <xsl:value-of select="s1:AmountCurCredit/text()" />
                    </xsl:if>
                  </InstdAmt>
                <xsl:for-each select="s1:DimAttrLevVal">
                  <xsl:for-each select="s1:CustTable">                    
                      <xsl:for-each select="s1:DirPtyNmPriAddr">
                          <Dbtr>
                          <Nm>
                            <xsl:value-of select="s1:Name/text()" />
                          </Nm>
                            <xsl:variable name="var:v13" select="string(s1:Address/text())" />
                            <PstlAdr>
                              <AdrLine>
                                <xsl:value-of select="$var:v13" />
                              </AdrLine>
                              <xsl:if test="s1:CountryRegionId">
                                <Ctry>
                                  <xsl:value-of select="s1:CountryRegionId/text()" />
                                </Ctry>
                              </xsl:if>
                            </PstlAdr>
                          </Dbtr>
                          </xsl:for-each>                                            
                  </xsl:for-each>
                </xsl:for-each>
                <DbtrAcct>
                  <xsl:for-each select="s1:CustBankAccount">
                    <Id>
                      <xsl:choose>
                        <xsl:when test="s1:BankIBAN">
                          <IBAN>
                            <xsl:value-of select="translate(s1:BankIBAN/text(), translate(s1:BankIBAN/text(), $var:AlphaNumeric, ''), '')" />
                          </IBAN>
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:value-of select="userCSharp:throwOutException('IBAN Number is not specified for customer bank account.')" />
                        </xsl:otherwise>
                      </xsl:choose>
                    </Id>
                  </xsl:for-each>
                </DbtrAcct>
                <RmtInf>
                  <xsl:variable name="var:v16" select="userCSharp:InitCumulativeConcat(0)" />
                  <xsl:for-each select="s1:SpecTrans/s1:CustTransOpen/s1:CustTrans">
			          <xsl:if test="s1:Invoice">				
                    <xsl:variable name="var:v17" select="userCSharp:StringConcat(string(s1:Invoice/text()) , &quot;,&quot;)" />
                    <xsl:variable name="var:v18" select="userCSharp:AddToCumulativeConcat(0,string($var:v17),&quot;1000&quot;)" />
			          </xsl:if>
                  </xsl:for-each>
                  <xsl:variable name="var:v19" select="userCSharp:GetCumulativeConcat(0)" />
                 <xsl:for-each select="s1:PaymProcessingData">
                  <xsl:if test="s1:Value/text()='Ustrd'">
                  <Ustrd>
                    <xsl:value-of select="substring($var:v19,1,string-length($var:v19)-1)" />
                  </Ustrd>
                  </xsl:if>
                  <xsl:if test="s1:Value/text()='Strd'">
                  <Strd>
                    <xsl:for-each select="../s1:SpecTrans">
                      <xsl:for-each select="s1:CustTransOpen">
                        <xsl:for-each select="s1:CustTrans">
                          <RfrdDocInf>
                            <xsl:if test="s1:Invoice">
                            <RfrdDocTp>
                                <Cd>CINV</Cd>
                            </RfrdDocTp>
                              <RfrdDocNb>
                                <xsl:value-of select="s1:Invoice/text()" />
                              </RfrdDocNb>
                            </xsl:if>
                          </RfrdDocInf>
                        </xsl:for-each>
                      </xsl:for-each>
                    </xsl:for-each>
                  </Strd>
                  </xsl:if>
                  </xsl:for-each>
                </RmtInf>
              </DrctDbtTxInf>
            </PmtInf>
        </xsl:for-each>
      </pain.001.001.02>
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


public string InitCumulativeSum(int index)
{
	if (index >= 0)
	{
		if (index >= myCumulativeSumArray.Count)
		{
			int i = myCumulativeSumArray.Count;
			for (; i<=index; i++)
			{
				myCumulativeSumArray.Add("");
			}
		}
		else
		{
			myCumulativeSumArray[index] = "";
		}
	}
	return "";
}

public System.Collections.ArrayList myCumulativeSumArray = new System.Collections.ArrayList();

public string AddToCumulativeSum(int index, string val, string notused)
{
	if (index < 0 || index >= myCumulativeSumArray.Count)
	{
		return "";
    }
	double d = 0;
	if (IsNumeric(val, ref d))
	{
		if (myCumulativeSumArray[index] == "")
		{
			myCumulativeSumArray[index] = d;
		}
		else
		{
			myCumulativeSumArray[index] = (double)(myCumulativeSumArray[index]) + d;
		}
	}
	return (myCumulativeSumArray[index] is double) ? ((double)myCumulativeSumArray[index]).ToString(System.Globalization.CultureInfo.InvariantCulture) : "";
}

public string GetCumulativeSum(int index)
{
	if (index < 0 || index >= myCumulativeSumArray.Count)
	{
		return "";
	}
	return (myCumulativeSumArray[index] is double) ? ((double)myCumulativeSumArray[index]).ToString(System.Globalization.CultureInfo.InvariantCulture) : "";
}

public string InitCumulativeConcat(int index)
{
	if (index >= 0)
	{
		if (index >= myCumulativeConcatArray.Count)
		{
			int i = myCumulativeConcatArray.Count;
			for (; i<=index; i++)
			{
				myCumulativeConcatArray.Add("");
			}
		}
		else
		{
			myCumulativeConcatArray[index] = "";
		}
	}
	return "";
}

public System.Collections.ArrayList myCumulativeConcatArray = new System.Collections.ArrayList();

public string AddToCumulativeConcat(int index, string val, string notused)
{
	if (index < 0 || index >= myCumulativeConcatArray.Count)
	{
		return "";
	}
	myCumulativeConcatArray[index] = (string)(myCumulativeConcatArray[index]) + val;
	return myCumulativeConcatArray[index].ToString();
}

public string GetCumulativeConcat(int index)
{
	if (index < 0 || index >= myCumulativeConcatArray.Count)
	{
		return "";
	}
	return myCumulativeConcatArray[index].ToString();
}

public string StringConcat(string param0, string param1)
{
   return param0 + param1;
}


public string StringConcat(string param0, string param1, string param2)
{
   return param0 + param1 + param2;
}


public string MathAbs(string val)
{
	string retval = "";
	double d = 0;
	if (IsNumeric(val, ref d))
	{
		double abs = Math.Abs(d);
		retval = abs.ToString(System.Globalization.CultureInfo.InvariantCulture);
	}
	return retval;
}


public bool IsNumeric(string val)
{
	if (val == null)
	{
		return false;
	}
	double d = 0;
	return Double.TryParse(val, System.Globalization.NumberStyles.AllowThousands | System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out d);
}

public bool IsNumeric(string val, ref double d)
{
	if (val == null)
	{
		return false;
	}
	return Double.TryParse(val, System.Globalization.NumberStyles.AllowThousands | System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out d);
}
//We send the Error Text and the Record Type to the AIF Exception Log.
     public string throwOutException(string errorText){
       throw new System.Exception("CUSTOM-EXCEPTION::SEPA Customer::" + errorText);
     }

]]></msxsl:script>
</xsl:stylesheet>