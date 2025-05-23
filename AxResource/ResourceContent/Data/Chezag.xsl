<?xml version="1.0" encoding="UTF-16"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:var="http://schemas.microsoft.com/BizTalk/2003/var" exclude-result-prefixes="msxsl var s0 s1 userCSharp" version="1.0" xmlns:s0="http://schemas.microsoft.com/dynamics/2008/01/sharedtypes" xmlns:s1="http://schemas.microsoft.com/dynamics/2008/01/documents/VendPayments" xmlns:userCSharp="http://schemas.microsoft.com/BizTalk/2003/userCSharp">
<xsl:output omit-xml-declaration="yes" method="text" version="1.0" indent="no"/>
    
  <xsl:template match="/s1:VendPayments">
    <Document>
      <xsl:variable name="var:v36" select="036" />
      <xsl:variable name="var:v00001" select="00001" />
      <xsl:variable name="var:EightZeros" select="00000000" />
      <xsl:variable name="var:SixZeros" select="000000" />
      <xsl:variable name="var:CH" select="CH" />
      <xsl:variable name="var:v28" select="28" />
      <xsl:variable name="var:v27" select="27" />
      <xsl:variable name="var:v37" select="37" />
      <xsl:variable name="var:v97" select="97" />
      <xsl:variable name="var:BEN" select="BEN" />
      <xsl:variable name="var:N" select="N" />
      <xsl:variable name="var:WhiteSp" select="'                                                                                                   '" />
      <xsl:variable name="var:Zeroes" select="'0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'" />
      
      <xsl:for-each select="s1:LedgerJournalTrans">
      <!--Start Header-->
        <!--1-3-->
        <xsl:value-of select="'036'" />

      <xsl:for-each select="s1:PaymProcessingData">
      <!--4-10-->          
      <xsl:if test="s1:Name/text() = 'Due Date'">
        <xsl:value-of select="substring(concat(msxsl:format-date(s1:Value/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />   
          </xsl:if>
        </xsl:for-each>
        <!--11-15-->
        <xsl:value-of select="'00001'" />           
        <xsl:for-each select="s1:BankAccountTable">
          <!--16-24-->
          <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 9)" />            
          <!--25-33-->
          <xsl:if test="s1:FeeContractAccount/text()">
            <xsl:value-of select="substring(concat(s1:FeeContractAccount/text(),string($var:WhiteSp)), 1, 9)" />
            </xsl:if>
            <xsl:if test="msxsl:string-compare(s1:FeeContractAccount/text(),'')='0'">
              <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 9)" />
            </xsl:if>
          </xsl:for-each>
           <!--34-35-->
        <xsl:for-each select="s1:PaymProcessingData">
          <xsl:if test="s1:Name/text() = 'Order Number'">
            <xsl:value-of select="substring(concat(s1:Value/text(),string($var:WhiteSp)), 1, 2)" />
          </xsl:if>        
        </xsl:for-each>
        <!--36-43-->
        <xsl:value-of select="'00000000'" />
        <!--44-50-->
        <xsl:value-of select="'000000'" />

      </xsl:for-each>
      
      <xsl:for-each select="s1:LedgerJournalTrans">
        <xsl:variable name="var:RecordNum" select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(6, string-length(position()))),position())" />
        <xsl:variable name = "var:CHF" select = "s1:CurrencyCode/text() = 'CHF'"/>
        <xsl:variable name = "var:EUR" select = "s1:CurrencyCode/text() = 'EUR'"/>
        <xsl:variable name="var:CHFEUR" select="userCSharp:LogicalOr(string($var:CHF), string($var:EUR))" />
        <xsl:variable name="var:PaymIdNe" select="userCSharp:LogicalNe(string(s1:PaymId/text()) , '')" />        
        <xsl:variable name="var:Type28" select="userCSharp:LogicalAnd(string($var:PaymIdNe) , string($var:CHFEUR))" />
        <xsl:variable name="var:Type28Ne" select="userCSharp:LogicalNot(string($var:Type28))" />
        <xsl:for-each select = "s1:VendBankAccount">
          <xsl:variable name = "var:IsoCH" select = "s1:CountryRegionId/text() = 'CH'"/>
          <xsl:variable name="var:CHF28Ne" select="userCSharp:LogicalAnd(string($var:Type28Ne) , string($var:IsoCH))" />
          <xsl:variable name="var:CHFNe" select="userCSharp:LogicalNot(string($var:IsoCH))" />
          <xsl:variable name="var:Type37" select="userCSharp:LogicalAnd(string($var:Type28Ne) , string($var:CHFNe))" />
          <xsl:variable name="var:RegNum" select="userCSharp:LogicalNe(string(s1:RegistrationNum/text()) , '')" />
          <xsl:variable name="var:Type27" select="userCSharp:LogicalAnd(string($var:RegNum) , string($var:CHF28Ne))" />
          <xsl:variable name="var:RegNumNull" select="s1:RegistrationNum/text()=''" />
          <xsl:variable name="var:Type22" select="userCSharp:LogicalAnd(string($var:RegNumNull) , string($var:CHF28Ne))" />

          <xsl:variable name="var:InitConcat" select="userCSharp:InitCumulativeConcat(1)" />                    
          <xsl:variable name="var:Concat1" select="userCSharp:AddToCumulativeConcat(1,string($var:Type37),'1000')" />
           
          <!--1-3-->
          <xsl:value-of select="'036'" />

          <xsl:for-each select="../s1:PaymProcessingData">
            <!--4-10-->
            <xsl:if test="s1:Name/text() = 'Due Date'">
              <xsl:value-of select="substring(concat(msxsl:format-date(s1:Value/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />
            </xsl:if>
          </xsl:for-each>
          <!--11-15-->
          <xsl:value-of select="'00001'" />
          <xsl:for-each select="../s1:BankAccountTable">
              <!--16-24-->
              <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 9)" />
              <!--25-33-->
              <xsl:if test="s1:FeeContractAccount/text()">
                <xsl:value-of select="substring(concat(s1:FeeContractAccount/text(),string($var:WhiteSp)), 1, 9)" />
              </xsl:if>
              <xsl:if test="msxsl:string-compare(s1:FeeContractAccount/text(),'')='0'">
                <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 9)" />
              </xsl:if>
            </xsl:for-each>
            <!--34-35-->
            <xsl:for-each select="../s1:PaymProcessingData">
              <xsl:if test="s1:Name/text() = 'Order Number'">
                <xsl:value-of select="substring(concat(s1:Value/text(),string($var:WhiteSp)), 1, 2)" />
              </xsl:if>
            </xsl:for-each>
            
            <xsl:if test="$var:Type28 = 'true'">
              <!--36-37-->
              <xsl:value-of select="string($var:v28)" />
              <!--38-43-->
              <xsl:value-of select ="$var:RecordNum" />
              <!--44-50-->
              <xsl:value-of select="'000000'" />
              <xsl:if test="../s1:CurrencyCode">
              <!--51-53-->
              <xsl:value-of select="substring(concat(../s1:CurrencyCode/text(),string($var:WhiteSp)), 1, 3)" />
            </xsl:if>
            <!--54-67-->
             <xsl:if test="../s1:AmountCurCredit/text()">
              <xsl:variable name="var:AmtCre" select="userCSharp:MathMultiply(userCSharp:MathAbs(../s1:AmountCurCredit/text()), '100')" />
              <xsl:value-of select="concat('000', substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length($var:AmtCre))),$var:AmtCre)" />
            </xsl:if>
            <xsl:if test="../s1:AmountCurDebit/text()">
              <xsl:variable name="var:AmtDeb" select="userCSharp:MathMultiply(userCSharp:MathAbs(../s1:AmountCurDebit/text()), '100')" />
              <xsl:value-of select="concat('000', substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length($var:AmtDeb))),$var:AmtDeb)" />
            </xsl:if>
            <!--68-70-->
              <xsl:value-of select="substring(concat(../s1:CurrencyCode/text(),string($var:WhiteSp)), 1, 3)" />
            <!--71-72-->
              <xsl:value-of select="string($var:CH)" />
            <!--73-->
              <xsl:value-of select="substring(concat(../s1:PaymId/text(),string($var:WhiteSp)), 1, 23)" />             
          </xsl:if>
          
          <!--Trans type 27-->
          <xsl:if test="userCSharp:LogicalOr(string($var:Type27), string($var:Type37)) = 'true'">
            <!--36-37-->
            <xsl:if test="$var:Type27 = 'true'">
              <xsl:value-of select="string($var:v27)" />
            </xsl:if>
            <xsl:if test="$var:Type37 = 'true'">
              <xsl:value-of select="string($var:v37)" />
            </xsl:if>
            <!--38-43-->
            <xsl:value-of select ="$var:RecordNum" />
            <!--44-50-->
            <xsl:value-of select="'000000'" />

            <xsl:if test="../s1:CurrencyCode">
            <!--51-53-->
            <xsl:value-of select="substring(concat(../s1:CurrencyCode/text(),string($var:WhiteSp)), 1, 3)" />
          </xsl:if>
          <!--54-67-->
            <xsl:if test="../s1:AmountCurCredit/text()">
              <xsl:variable name="var:AmtCre" select="userCSharp:MathMultiply(userCSharp:MathAbs(../s1:AmountCurCredit/text()), '100')" />
              <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length($var:AmtCre))),$var:AmtCre)" />
            </xsl:if>
            <xsl:if test="../s1:AmountCurDebit/text()">
              <xsl:variable name="var:AmtDeb" select="userCSharp:MathMultiply(userCSharp:MathAbs(../s1:AmountCurDebit/text()), '100')" />
              <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length($var:AmtDeb))),$var:AmtDeb)" />
            </xsl:if>

            <!--68-70-->
          <xsl:value-of select="substring(concat(../s1:CurrencyCode/text(),string($var:WhiteSp)), 1, 3)" />
          <!--71-72-->
            <xsl:value-of select="string(s1:CountryRegionId/text())" />
          <!--73-->          
            <xsl:if test="$var:Type27 = 'true'">
              <xsl:value-of select="substring(string($var:WhiteSp), 1, 2)" />                            
            </xsl:if>            
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length(s1:RegistrationNum/text()))),s1:RegistrationNum/text())" />
            <xsl:if test="$var:Type27 = 'true'">
              <!--82-87-->
              <xsl:value-of select="substring(string($var:WhiteSp), 1, 6)" />
            </xsl:if>
            <xsl:if test="$var:Type37 = 'true'">
              <!--80-87-->
              <xsl:value-of select="substring(string($var:WhiteSp), 1, 8)" />
            </xsl:if>
            <!--88-122-->
              <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 35)" />

              <!--123-192-->
              <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1, 65)" />

              <!--193-227-->
              <xsl:value-of select="substring(concat(s1:Street/text(),string($var:WhiteSp)), 1, 35)" />

              <!--228-237-->
              <xsl:value-of select="substring(concat(s1:ZipCode/text(),string($var:WhiteSp)), 1, 10)" />

              <!--238-262-->
              <xsl:value-of select="substring(concat(s1:City/text(),string($var:WhiteSp)), 1, 25)" />

              <xsl:for-each select="../s1:DimAttrLevVal">
                <xsl:for-each select="s1:VendTable">
                  <!--263-332-->
                  <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1, 70)" />

                  <xsl:for-each select="s1:DirPtyNmPriAddr">
                        <!--333-367-->
                        <xsl:value-of select="substring(concat(translate(s1:Street/text(), '&#xa;',''),string($var:WhiteSp)), 1, 35)" />
                        <!--368-377-->
                        <xsl:value-of select="substring(concat(s1:ZipCode/text(),string($var:WhiteSp)), 1, 10)" />

                        <!--377-402-->
                        <xsl:value-of select="substring(concat(s1:City/text(),string($var:WhiteSp)), 1, 25)" />                    
                  </xsl:for-each>
                </xsl:for-each>
              </xsl:for-each>
            </xsl:if>
          
          <!--Trans type 22-->
          <xsl:if test="$var:Type22 = 'true'">
            <!--36-37-->
            <xsl:value-of select="string($var:v27)" />
            <!--38-43-->
            <xsl:value-of select ="$var:RecordNum" />
            <!--44-50-->
            <xsl:value-of select="'000000'" />

            <xsl:if test="../s1:CurrencyCode">
              <!--51-53-->
              <xsl:value-of select="substring(concat(../s1:CurrencyCode/text(),string($var:WhiteSp)), 1, 3)" />
            </xsl:if>
            <!--54-67-->
            <xsl:if test="../s1:AmountCurCredit/text()">
              <xsl:variable name="var:AmtCre" select="userCSharp:MathMultiply(userCSharp:MathAbs(../s1:AmountCurCredit/text()), '100')" />
              <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length($var:AmtCre))),$var:AmtCre)" />
            </xsl:if>
            <xsl:if test="../s1:AmountCurDebit/text()">
              <xsl:variable name="var:AmtDeb" select="userCSharp:MathMultiply(userCSharp:MathAbs(../s1:AmountCurDebit/text()), '100')" />
              <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length($var:AmtDeb))),$var:AmtDeb)" />
            </xsl:if>

            <!--68-70-->
            <xsl:value-of select="substring(concat(../s1:CurrencyCode/text(),string($var:WhiteSp)), 1, 3)" />
            <!--71-72-->
            <xsl:value-of select="string($var:CH)" />
            
            <!--73-122-->
            <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 50)" />

            <xsl:for-each select="../s1:DimAttrLevVal">
              <xsl:for-each select="s1:VendTable">
                <!--123-192-->
                <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1, 70)" />

                <xsl:for-each select="s1:DirPtyNmPriAddr">
                      <!--193-227-->
                      <xsl:value-of select="substring(concat(translate(s1:Street/text(), '&#xa;',''),string($var:WhiteSp)), 1, 35)" />

                      <!--228-237-->
                      <xsl:value-of select="substring(concat(s1:ZipCode/text(),string($var:WhiteSp)), 1, 10)" />

                      <!--238-402-->
                      <xsl:value-of select="substring(concat(s1:City/text(),string($var:WhiteSp)), 1, 160)" />                  
                </xsl:for-each>
              </xsl:for-each>
            </xsl:for-each>
          </xsl:if>
        </xsl:for-each>
        
        <!--Reason Calculation-->
        <xsl:variable name="var:InitConcat" select="userCSharp:InitCumulativeConcat(0)" />
        <xsl:for-each select="s1:DimAttrLevVal">
          <xsl:for-each select="s1:VendTable">
        <xsl:for-each select="../../s1:SpecTrans">
          <xsl:for-each select="s1:VendTransOpen">
            <xsl:for-each select="s1:VendTrans">
                  <xsl:if test="userCSharp:LogicalLte(string(../../s1:Balance01/text()) , '0')">
                    <xsl:variable name = "var:Reason" select = "substring(concat('Knd ',../../../s1:DimAttrLevVal/s1:VendTable/s1:YourAccountNum/text(), ' R ', s1:Invoice/text(), string($var:WhiteSp)),1,35)"/>
                    <xsl:variable name="var:Concat1" select="userCSharp:AddToCumulativeConcat(0,string($var:Reason),'1000')" />
                  </xsl:if>
                  <xsl:if test="userCSharp:LogicalGt(string(../../s1:Balance01/text()) , '0') ">
                    <xsl:variable name = "var:Reason" select = "substring(concat('Knd ',../../../s1:DimAttrLevVal/s1:VendTable/s1:YourAccountNum/text(), ' G ', s1:Invoice/text(), string($var:WhiteSp)),1,35)"/>
                    <xsl:variable name="var:Concat1" select="userCSharp:AddToCumulativeConcat(0,string($var:Reason),'1000')" />
                  </xsl:if>
                </xsl:for-each>
              </xsl:for-each>
          </xsl:for-each>
        </xsl:for-each>
      </xsl:for-each>
      <!--403-542-->
      <xsl:value-of select="substring(concat(userCSharp:GetCumulativeConcat(0), string($var:WhiteSp)), 1, 140)" />
      
        <!--Trans type 37-->
        <xsl:if test="userCSharp:GetCumulativeConcat(1) = 'true'">
          <!--543-545-->
          <xsl:value-of select="string('BEN')" />
          <!--546-546-->
          <xsl:value-of select="string('N')" />
        </xsl:if>
        <!--Total record-->
        <xsl:variable name="var:v1" select="userCSharp:InitCumulativeSum(0)" />
        <xsl:variable name="var:v3" select="userCSharp:MathAbs(string(s1:AmountCurCredit/text()))" />
        <xsl:variable name="var:v4" select="string(s1:AmountCurDebit/text())" />
        <xsl:variable name="var:v5" select="userCSharp:MathAbs($var:v4)" />
        <xsl:variable name="var:v6" select="userCSharp:AddToCumulativeSum(0,string($var:v3),string($var:v5))" />
        <xsl:variable name="var:v7" select="userCSharp:AddToCumulativeSum(0,string($var:v5),string($var:v3))" />

        <xsl:if test="last() = position()">
            <!--1-3-->
            <xsl:value-of select="'036'" />

            <xsl:for-each select="s1:PaymProcessingData">
              <!--4-10-->
              <xsl:if test="s1:Name/text() = 'Due Date'">
                <xsl:value-of select="substring(concat(msxsl:format-date(s1:Value/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />                
              </xsl:if>
            </xsl:for-each>
            <!--11-15-->
            <xsl:value-of select="'00001'" />
            <xsl:for-each select="s1:BankAccountTable">
                <!--16-24-->
                <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 9)" />
                <!--25-33-->
                <xsl:if test="s1:FeeContractAccount/text()">
                  <xsl:value-of select="substring(concat(s1:FeeContractAccount/text(),string($var:WhiteSp)), 1, 9)" />
                </xsl:if>
              <xsl:if test="msxsl:string-compare(s1:FeeContractAccount/text(),'')='0'">
                  <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 9)" />
                </xsl:if>
              </xsl:for-each>
              <!--34-35-->
              <xsl:for-each select="s1:PaymProcessingData">
                <xsl:if test="s1:Name/text() = 'Order Number'">
                  <xsl:value-of select="substring(concat(s1:Value/text(),string($var:WhiteSp)), 1, 2)" />
                </xsl:if>
              </xsl:for-each>
              <!--36-37-->
              <xsl:value-of select="'97'" />
              <!--38-43-->
              <xsl:value-of select ="$var:RecordNum" />
            <!--44-50-->
          <xsl:value-of select="'000000'" />
          <xsl:if test="s1:CurrencyCode">
              <!--51-53-->
              <xsl:value-of select="substring(concat(s1:CurrencyCode/text(),string($var:WhiteSp)), 1, 3)" />
            </xsl:if>
            <!--54-60-->
              <xsl:value-of select="$var:RecordNum" />
            <!--60-73-->
               <xsl:variable name="var:TotalSum" select="userCSharp:GetCumulativeSum(0)" />
              <xsl:variable name="var:TotalSum1" select="userCSharp:MathMultiply($var:TotalSum, '100')" />
              <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length($var:TotalSum1))),$var:TotalSum1)" />              
            <!--73-402-->
              <xsl:value-of select="substring(concat(string($var:Zeroes),string($var:Zeroes),string($var:Zeroes)), 1, 330)" />
            <!--403-722-->
              <xsl:value-of select="substring(concat(string($var:WhiteSp),string($var:WhiteSp),string($var:WhiteSp)), 1, 320)" />
          </xsl:if>

      </xsl:for-each>
    </Document>
  </xsl:template>

  <msxsl:script language="C#" implements-prefix="userCSharp">
  <![CDATA[
public string DateCurrentDate()
{
	DateTime dt = DateTime.Now;
	return dt.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
}

public string DateCurrentDateTime()
{
	DateTime dt = DateTime.Now;
	string curdate = dt.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
	string curtime = dt.ToString("T", System.Globalization.CultureInfo.InvariantCulture);
	string retval = curdate + "T" + curtime;
	return retval;
}
public string MathDivide(string val1, string val2)
{
	string retval = "";
	double d1 = 0;
	double d2 = 0;
	if (IsNumeric(val1, ref d1) && IsNumeric(val2, ref d2))
	{
		if (d2 != 0)
		{
			double ret = d1 / d2;
			retval = ret.ToString(System.Globalization.CultureInfo.InvariantCulture);
		}
	}
	return retval;
}

public bool LogicalOr(string param0, string param1) { return ValToBool(param0) || ValToBool(param1); return false; } 
public bool LogicalAnd(string param0, string param1) { return ValToBool(param0) && ValToBool(param1); return false; } 
public bool LogicalNot(string val) { return !ValToBool(val); } 
public bool LogicalNe(string val1, string val2)
{
	bool ret = false;
	double d1 = 0;
	double d2 = 0;
	if (IsNumeric(val1, ref d1) && IsNumeric(val2, ref d2))
	{
		ret = d1 != d2;
	}
	else
	{
		ret = String.Compare(val1, val2, StringComparison.Ordinal) != 0;
	}
	return ret;
}
public string MathMod(string val, string denominator)
{
	string retval = "";
	double v = 0;
	double d = 0;
	if (IsNumeric(val, ref v) && IsNumeric(denominator, ref d))
	{
		if (d != 0)
		{
			retval = Convert.ToString(v % d, System.Globalization.CultureInfo.InvariantCulture);
		}
	}
	return retval;
}


public bool ValToBool(string val)
{
	if (val != null)
	{
		if (string.Compare(val, bool.TrueString, StringComparison.OrdinalIgnoreCase) == 0)
		{
			return true;
		}
		if (string.Compare(val, bool.FalseString, StringComparison.OrdinalIgnoreCase) == 0)
		{
			return false;
		}
		val = val.Trim();
		if (string.Compare(val, bool.TrueString, StringComparison.OrdinalIgnoreCase) == 0)
		{
			return true;
		}
		if (string.Compare(val, bool.FalseString, StringComparison.OrdinalIgnoreCase) == 0)
		{
			return false;
		}
		double d = 0;
		if (IsNumeric(val, ref d))
		{
			return (d > 0);
		}
	}
	return false;
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
public string StringSubstring(string str, string left, string right)
{
	string retval = "";
	double dleft = 0;
	double dright = 0;
	if (str != null && IsNumeric(left, ref dleft) && IsNumeric(right, ref dright))
	{
		int lt = (int)dleft;
		int rt = (int)dright;
		lt--; rt--;
		if (lt >= 0 && rt >= lt && lt < str.Length)
		{
			if (rt < str.Length)
			{
				retval = str.Substring(lt, rt-lt+1);
			}
			else
			{
				retval = str.Substring(lt, str.Length-lt);
			}
		}
	}
	return retval;
}
public bool LogicalLte(string val1, string val2)
{
	bool ret = false;
	double d1 = 0;
	double d2 = 0;
	if (IsNumeric(val1, ref d1) && IsNumeric(val2, ref d2))
	{
		ret = d1 <= d2;
	}
	else
	{
		ret = String.Compare(val1, val2, StringComparison.Ordinal) <= 0;
	}
	return ret;
}


public bool LogicalGt(string val1, string val2)
{
	bool ret = false;
	double d1 = 0;
	double d2 = 0;
	if (IsNumeric(val1, ref d1) && IsNumeric(val2, ref d2))
	{
		ret = d1 > d2;
	}
	else
	{
		ret = String.Compare(val1, val2, StringComparison.Ordinal) > 0;
	}
	return ret;
}

public string MathSubtract(string param0, string param1)
{
	System.Collections.ArrayList listValues = new System.Collections.ArrayList();
	listValues.Add(param0);
	listValues.Add(param1);
	double ret = 0;
	bool first = true;
	foreach (string obj in listValues)
	{
		if (first)
		{
			first = false;
			double d = 0;
			if (IsNumeric(obj, ref d))
			{
				ret = d;
			}
			else
			{
				return "";
			}
		}
		else
		{
			double d = 0;
			if (IsNumeric(obj, ref d))
			{
				ret -= d;
			}
			else
			{
				return "";
			}
		}
	}
	return ret.ToString(System.Globalization.CultureInfo.InvariantCulture);
}

public string MathMultiply(string param0, string param1)
{
	System.Collections.ArrayList listValues = new System.Collections.ArrayList();
	listValues.Add(param0);
	listValues.Add(param1);
	double ret = 1;
	bool first = true;
	foreach (string obj in listValues)
	{
		double d = 0;
		if (IsNumeric(obj, ref d))
		{
			if (first)
			{
				first = false;
				ret = d;
			}
			else
			{
				ret *= d;
			}
		}
		else
		{
			return "";
		}
	}
	return ret.ToString(System.Globalization.CultureInfo.InvariantCulture);
}


]]></msxsl:script>
</xsl:stylesheet>