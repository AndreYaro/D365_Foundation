<?xml version="1.0" encoding="UTF-16"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:var="http://schemas.microsoft.com/BizTalk/2003/var" exclude-result-prefixes="msxsl var s0 s1 userCSharp" version="1.0" xmlns:s0="http://schemas.microsoft.com/dynamics/2008/01/sharedtypes" xmlns:s1="http://schemas.microsoft.com/dynamics/2008/01/documents/VendPayments" xmlns:userCSharp="http://schemas.microsoft.com/BizTalk/2003/userCSharp">
  <xsl:output omit-xml-declaration="yes" method="text" version="1.0" indent="no"/>

  <xsl:template match="/s1:VendPayments">
    <Document>
      <xsl:variable name="var:faktura" select="'FAKTURA'" />
      <xsl:variable name="var:netto" select="'NETTO'" />
      <xsl:variable name="var:leveran" select="'LEVERANTÖRSBETALNINGAR'" />
      <xsl:variable name="var:abc" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'" />
      <xsl:variable name="var:WhiteSp" select="'                                                                                                   '" />
      <xsl:variable name="var:Zeroes" select="'0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'" />
      <xsl:variable name="var:Invoices" select="count(/s1:vendpayments/s1:LedgerJournalTrans/s1:SpecTrans)" />
      <xsl:variable name="var:tmp9_1" select="userCSharp:InitCumulativeSum(9)" />
      <xsl:variable name="var:tmp8_1" select="userCSharp:InitCumulativeSum(8)" />
      <!--Start Header-->
      <xsl:for-each select="s1:LedgerJournalTrans">
        <xsl:if test ="position()=1">
          <!--1-2-->
          <xsl:value-of select="'11'" />
          <!--3-12-->
          <xsl:for-each select="s1:BankAccountTable">
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length(s1:AccountNum))),s1:AccountNum)" />            
          </xsl:for-each>
          <!--13-18-->
          <xsl:value-of select="substring(msxsl:format-date(userCSharp:DateCurrentDate(),'yyMMdd'), 1,6)" />
          <!--19-59-->          
          <xsl:value-of select="substring(concat($var:leveran,string($var:WhiteSp)), 1,41)" />          
          <!--60-80-->
          <xsl:value-of select="substring(concat(s1:CurrencyCode,string($var:WhiteSp)), 1,21)" />
          <!--New Line-->
          <xsl:value-of select="'&#13;&#10;'" />
          <!--1-2-->
          <xsl:value-of select="'13'" />
          <!--3-34-->
          <xsl:value-of select="substring(concat($var:faktura,string($var:WhiteSp)), 1,32)" />
          <!--35-80-->          
          <xsl:value-of select="substring(concat($var:netto,string($var:WhiteSp)), 1,46)" />          
        </xsl:if>
                        
        <!--End Header-->
        <!--Payment account-->
        <xsl:variable name="var:tmp7_1" select="userCSharp:InitCumulativeConcat(7)" />
        <xsl:for-each select="s1:VendBankAccount">
          <xsl:variable name ="var:PaymAcc" select="translate(s1:AccountNum/text(),'0123456789', '0123456789')"/>
          <xsl:variable name="var:tmp7_2" select="userCSharp:AddToCumulativeConcat(7,string($var:PaymAcc),'Not used')" />          
        </xsl:for-each>
        
        <xsl:variable name="var:tmp7_3" select="userCSharp:GetCumulativeConcat(7)" />
        <xsl:variable name="var:PayAccNoS" select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length($var:tmp7_3))),$var:tmp7_3)" />
        
        <!--Senders identification of the reciever/VendAccount-->
        <xsl:variable name="var:tmp10_1" select="userCSharp:InitCumulativeConcat(10)" />
        <xsl:for-each select="s1:DimAttrLevVal">
          <xsl:for-each select="s1:VendTable">
            
            <xsl:variable name ="var:tmp10_2" select="translate(s1:AccountNum,'0123456789 ', '0123456789')"/>
            <xsl:variable name="var:tmp10_3" select="userCSharp:AddToCumulativeConcat(10,string($var:tmp10_2),string($var:tmp10_2))" />
          </xsl:for-each>
        </xsl:for-each>        
        <xsl:variable name="var:levnr10_1" select="userCSharp:GetCumulativeConcat(10)" />
        <xsl:variable name="var:levnrLen" select="string-length($var:levnr10_1)" />
        
        <xsl:variable name="var:levnr5_1" select="substring($var:levnr10_1,userCSharp:MathSubtract($var:levnrLen,5),userCSharp:MathAdd($var:levnrLen,5))" />
        <xsl:variable name="var:levnr5" select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(5, string-length($var:levnr5_1))),$var:levnr5_1)" />
        <xsl:variable name="var:levnr10" select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(9, string-length($var:levnr5_1))),$var:levnr5_1)" />        
        <!--Recievers bank account-->
        <xsl:variable name="var:tmp11_1" select="userCSharp:InitCumulativeConcat(11)" />
        <xsl:for-each select="s1:VendBankAccount">
            <xsl:variable name ="var:tmp11_2" select="translate(s1:AccountNum,'0123456789 ', '0123456789')"/>
            <xsl:variable name="var:tmp11_3" select="userCSharp:AddToCumulativeConcat(11,string($var:tmp11_2),string($var:tmp11_2))" />
          </xsl:for-each>
        
        <xsl:variable name="var:kontonummer" select="userCSharp:GetCumulativeConcat(11)" />
        <xsl:variable name="var:antal" select="string-length($var:kontonummer)" />
      <!--Payment mode-->
      <xsl:variable name="var:tmp12_1" select="userCSharp:InitCumulativeConcat(12)" />
        <xsl:for-each select="s1:PaymProcessingData">
          <xsl:if test="s1:Name/text() = 'Paym Mode'">
            <xsl:variable name="var:tmp12_2" select="userCSharp:AddToCumulativeConcat(12, s1:Value/text(),'unused')" />
          </xsl:if>
        </xsl:for-each>
        <xsl:variable name="var:PaymMode" select="userCSharp:GetCumulativeConcat(12)" />

        <!--vend Bank Account Type-->
        <xsl:variable name="var:tmp13_1" select="userCSharp:InitCumulativeConcat(13)" />
        <xsl:for-each select="s1:VendBankAccount">          
            <xsl:variable name="var:tmp13_2" select="userCSharp:AddToCumulativeConcat(13, s1:TypeOfAccount/text(),'unused')" />          
        </xsl:for-each>
        <xsl:variable name="var:TypeAcc" select="userCSharp:GetCumulativeConcat(13)" />
        
        <!--Paym Amount in foreign currency-->
        <xsl:variable name="var:tmp14_1" select="userCSharp:InitCumulativeConcat(14)" />

        <xsl:if test="userCSharp:LogicalNe(s1:AmountCurDebit/text(), '')">
          <xsl:variable name="var:tmp14_2" select="userCSharp:AddToCumulativeConcat(14,string(s1:AmountCurDebit/text()),string(s1:AmountCurDebit/text()))" />
        </xsl:if>
        <xsl:if test="userCSharp:LogicalEq(s1:AmountCurDebit/text(), '')">
          <xsl:variable name="var:tmp14_2" select="userCSharp:AddToCumulativeConcat(14,userCSharp:MathMultiply(s1:AmountCurCredit/text(), '-1'),'Not Used')" />
        </xsl:if>
        <xsl:variable name="var:PaymAmount" select="userCSharp:GetCumulativeConcat(14)" />
        
        <xsl:variable name ="var:PayAccZero" select ="$var:PayAccNoS='0000000000'"/>

        <!--PaymAdvice-->
        <xsl:variable name="var:tmp17_1" select="userCSharp:InitCumulativeConcat(17)" />
        <xsl:for-each select="s1:PaymProcessingData">
          <xsl:if test="s1:Name/text() = 'Spec'">
            <xsl:variable name="var:tmp17_2" select="userCSharp:AddToCumulativeConcat(17, s1:Value/text(),'unused')" />
            <xsl:variable name="var:tmp17_3" select="userCSharp:AddToCumulativeConcat(17, ' ','unused')" />
          </xsl:if>
        </xsl:for-each>
        <xsl:variable name="var:tmp17_3" select="userCSharp:AddToCumulativeConcat(17, s1:PaymentNotes,'unused')" />

        <!--Faktura OCR-->
        <xsl:variable name="var:tmp15_1" select="userCSharp:InitCumulativeConcat(15)" />
        <xsl:variable name="var:tmp15_2" select="userCSharp:LogicalAnd(s1:PaymId/text(), userCSharp:LogicalGt($var:PaymAmount,'0'))" />
        <xsl:variable name="var:tmp15_3" select="userCSharp:LogicalAnd(userCSharp:LogicalGt('9',$var:kontonummer),userCSharp:LogicalNe($var:PayAccNoS,'0000000000'))" />
        <xsl:if test="userCSharp:LogicalAnd($var:tmp15_2, $var:tmp15_3)">
          <xsl:variable name="var:tmp15_4" select="userCSharp:AddToCumulativeConcat(15,s1:PaymId/text(),s1:PaymId/text())" />
          <xsl:variable name="var:tmp17_4" select="userCSharp:InitCumulativeConcat(17)" />
        </xsl:if>
        <xsl:variable name="var:PaymAdvice" select="userCSharp:GetCumulativeConcat(17)" />
        <!--Rec Inv -->
        <xsl:variable name="var:tmp16_1" select="userCSharp:InitCumulativeConcat(16)" />
        <xsl:for-each select="s1:SpecTrans">
          <xsl:for-each select="s1:VendTransOpen">
            <xsl:for-each select="s1:VendTrans">              
              <xsl:variable name="var:tmp16_2" select="userCSharp:AddToCumulativeConcat(16,s1:Invoice/text(),'Not Used')" />
              <!--<xsl:if test="userCSharp:LogicalNe(position(), last())">-->
                <xsl:variable name="var:tmp16_3" select="userCSharp:AddToCumulativeConcat(16,',','Not Used')" />
              
            </xsl:for-each>
          </xsl:for-each>
        </xsl:for-each>
        <xsl:variable name="var:RecInv" select="userCSharp:GetCumulativeConcat(16)" />
        
        <xsl:if test="userCSharp:LogicalEq(userCSharp:LogicalAnd($var:tmp15_2, $var:tmp15_3), 'false')">
          <xsl:variable name="var:tmp15_4" select="userCSharp:AddToCumulativeConcat(15,$var:RecInv,'Not Used')" />
        </xsl:if>

        <xsl:variable name="var:Faktura" select="userCSharp:GetCumulativeConcat(15)" />
        
        <!--For Record 14-->
        <xsl:variable name="var:tmp18_1" select="userCSharp:InitCumulativeConcat(18)" />
        <xsl:variable name="var:tmp18_2" select="userCSharp:AddToCumulativeConcat(18, $var:PayAccNoS,'unused')" />
                
        

      <xsl:variable name="var:tmpCond1" select=" userCSharp:LogicalAnd(userCSharp:LogicalGt($var:antal,'8'),userCSharp:LogicalNe($var:PaymMode,s1:PaymMode))"/>
      <xsl:variable name="var:Type40" select="userCSharp:LogicalAnd(userCSharp:LogicalNe($var:TypeAcc,'2'),$var:tmpCond1)"/>
      <!--Record Type 40-->
      <xsl:if test="$var:Type40='true'">
        <!--New Line-->
        <xsl:value-of select="'&#13;&#10;'" />
        <!--1-6-->
        <xsl:value-of select="'400000'" />
        <!--7-11-->
        <xsl:value-of select="$var:levnr5" />
        <!--11-12-->
        <xsl:value-of select="' '" />
        <!--13-16-->
        <xsl:value-of select="substring($var:kontonummer,1,4)" />
        <xsl:variable name ="var:bankkonto" select ="substring($var:kontonummer, 5, 12)"/>
        <!--17-28-->
        <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length($var:bankkonto))),$var:bankkonto)" />
        <!--29-80-->
        <xsl:value-of select="substring($var:WhiteSp, 1,52)" />
      </xsl:if>
        
        
      <!--Record Type 26,27-->      
      <xsl:if test="userCSharp:LogicalOr($var:Type40, $var:PayAccZero)">
        <!--New Line-->
        <xsl:value-of select="'&#13;&#10;'" />
        <!--1-6-->
        <xsl:value-of select="'260000'" />
        <!--7-11-->
        <xsl:value-of select="$var:levnr5" />
        <!--11-12-->
        <xsl:value-of select="' '" />
        <!--13-80-->
        <xsl:for-each select="s1:DimAttrLevVal">
          <xsl:for-each select="s1:VendTable">
            <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1, 68)" />
          </xsl:for-each>
        </xsl:for-each>
      
    <!--New Line-->
        <xsl:value-of select="'&#13;&#10;'" />
        <!--1-6-->
        <xsl:value-of select="'270000'" />
        <!--7-11-->
        <xsl:value-of select="$var:levnr5" />
        <!--11-12-->
        <xsl:value-of select="' '" />
        <xsl:for-each select="s1:DimAttrLevVal">
          <xsl:for-each select="s1:VendTable">
            <xsl:for-each select="s1:DirPtyNmPriAddr">              
                  <!--13-47-->
                  <xsl:value-of select="substring(concat(translate(s1:Street/text(), '&#13;&#10;&#x0D;',''),string($var:WhiteSp)), 1, 35)" />                  
                  <!--48-52-->
                  <xsl:value-of select="substring(concat(s1:ZipCode/text(),string($var:WhiteSp)), 1, 5)" />
                  <!--53-80-->
                  <xsl:value-of select="substring(concat(s1:City/text(),string($var:WhiteSp)), 1, 28)" />                
                </xsl:for-each>
              </xsl:for-each>
            </xsl:for-each>
          </xsl:for-each>
        </xsl:for-each>
        <xsl:variable name="var:tmp18_3" select="userCSharp:InitCumulativeConcat(18)" />
        <xsl:variable name="var:tmp18_4" select="userCSharp:AddToCumulativeConcat(18, $var:levnr10,'unused')" />  
      </xsl:if>
        
        <xsl:variable name="var:tmp18_5" select="userCSharp:GetCumulativeConcat(18)" />
        <xsl:variable name="var:PayAccNo" select="substring(concat($var:tmp18_5, $var:WhiteSp),1,10)" />        
        <xsl:if test="userCSharp:LogicalGt($var:PaymAmount, '0')">
          <xsl:value-of select="'&#13;&#10;'" />
          <!--1-2-->
          <xsl:if test="userCSharp:LogicalOr(userCSharp:LogicalEq($var:PaymMode,s1:PaymMode), userCSharp:LogicalEq($var:TypeAcc,'2'))">
            <xsl:value-of select="'56'" />
          </xsl:if>
          <xsl:if test="userCSharp:LogicalAnd(userCSharp:LogicalNe($var:PaymMode,s1:PaymMode), userCSharp:LogicalNe($var:TypeAcc,'2'))">
            <xsl:value-of select="'14'" />
          </xsl:if>          
          <!--3-12-->
          <xsl:value-of select="$var:PayAccNo" />          
          <!--13-37-->
          <xsl:value-of select="substring(concat($var:Faktura,string($var:WhiteSp)), 1, 25)" />
          <!--38-49-->
          <xsl:variable name="var:TotalSum" select="userCSharp:MathMultiply($var:PaymAmount , '100')" />
          <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length($var:TotalSum))),$var:TotalSum)" />
          <!--50-61-->
          <xsl:if test="userCSharp:LogicalGt(userCSharp:DateCurrentDate(),s1:TransDate)">
            <xsl:value-of select="substring(concat(msxsl:format-date(userCSharp:DateCurrentDate(),'yyMMdd'), string($var:WhiteSp)), 1,12)" />
          </xsl:if>
          <xsl:if test="userCSharp:LogicalLte(userCSharp:DateCurrentDate(),s1:TransDate)">
            <xsl:value-of select="substring(concat(msxsl:format-date(s1:TransDate,'yyMMdd'),string($var:WhiteSp)), 1,12)" />
          </xsl:if>
          <!--61-70-->
          <xsl:value-of select="substring(concat(s1:JournalNum,string($var:WhiteSp)), 1, 10)" />
          <!--71-80-->
          <xsl:value-of select="substring(concat(s1:Voucher,string($var:WhiteSp)), 1, 9)" />
          <xsl:variable name="var:tmp9_2" select="userCSharp:AddToCumulativeSum(9,'1','Not Used')" />
        </xsl:if>

        <xsl:if test="userCSharp:LogicalLte($var:PaymAmount, '0')">
          <xsl:value-of select="'&#13;&#10;'" />
          <!--1-2-->         
          <xsl:value-of select="'16'" />
          <!--3-12-->
          <xsl:value-of select="$var:PayAccNo" />
          <!--13-37-->
          <xsl:value-of select="substring(concat($var:RecInv,string($var:WhiteSp)), 1, 25)" />
          <!--38-49-->
          <xsl:variable name="var:TotalSum" select="userCSharp:MathMultiply($var:PaymAmount , '-100')" />
          <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length($var:TotalSum))),$var:TotalSum)" />
          <!--50-61-->
          <xsl:value-of select="substring(concat(msxsl:format-date(userCSharp:DateAddDays(userCSharp:DateCurrentDate(),'365'),'yyMMdd'), string($var:WhiteSp)), 1,12)" />
          <!--61-70-->
          <xsl:value-of select="substring(concat(s1:JournalNum,string($var:WhiteSp)), 1, 10)" />
          <!--71-80-->
          <xsl:value-of select="substring(concat(s1:voucher,string($var:WhiteSp)), 1, 10)" />
          <xsl:variable name="var:tmp9_2" select="userCSharp:AddToCumulativeSum(9,'1','Not Used')" />
        </xsl:if>

        <xsl:if test="userCSharp:LogicalNe($var:PaymAdvice,'')">
          <xsl:value-of select="'&#13;&#10;'" />
          <!--1-2-->
          <xsl:if test="userCSharp:LogicalOr(userCSharp:LogicalEq($var:PaymMode,s1:PaymMode), userCSharp:LogicalEq($var:TypeAcc,'1'))">
            <xsl:value-of select="'65'" />
          </xsl:if>
          <xsl:if test="userCSharp:LogicalAnd(userCSharp:LogicalNe($var:PaymMode,s1:PaymMode), userCSharp:LogicalNe($var:TypeAcc,'1'))">
            <xsl:value-of select="'25'" />
          </xsl:if>
          <!--3-12-->
          <xsl:value-of select="$var:PayAccNo" />
          <!--13-80-->
          <xsl:value-of select="substring(concat($var:PaymAdvice,string($var:WhiteSp)), 1, 68)" />          
        </xsl:if>
        <xsl:variable name="var:tmp8_2" select="userCSharp:AddToCumulativeSum(8,$var:PaymAmount,'Not Used')" />
        
        <!--Last record-->
        <xsl:if test="position()=last()">
          <xsl:value-of select="'&#13;&#10;'" />
          <!--1-2-->
          <xsl:value-of select="'29'" />
          <!--3-12-->
          <xsl:for-each select="s1:BankAccountTable">
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length(s1:AccountNum/text()))),s1:AccountNum/text())" />            
          </xsl:for-each>
          <!--13-20-->
          <xsl:variable name="var:NumRecords" select="userCSharp:GetCumulativeSum(9)" />  
          <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(8, string-length($var:NumRecords))),$var:NumRecords)" />
          <!--21-32-->
          <xsl:variable name="var:Sum" select="userCSharp:GetCumulativeSum(8)" />
          <xsl:if test="userCSharp:LogicalGt($var:Sum,'0')">
            <xsl:variable name="var:SumAbs" select="userCSharp:MathMultiply($var:Sum, '100')" />
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length($var:SumAbs))),$var:SumAbs)" />            
          </xsl:if>
          <xsl:if test="userCSharp:LogicalGt('0',$var:Sum)">
            <xsl:variable name="var:SumAbs" select="userCSharp:MathMultiply($var:Sum, '-100')" />              
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length($var:SumAbs))),$var:SumAbs)" />
            <xsl:value-of select="'-'" />
          </xsl:if>
          <xsl:value-of select="substring(string($var:WhiteSp), 1, 48)" />
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
public bool LogicalEq(string val1, string val2)
{
	bool ret = false;
	double d1 = 0;
	double d2 = 0;
	if (IsNumeric(val1, ref d1) && IsNumeric(val2, ref d2))
	{
		ret = d1 == d2;
	}
	else
	{
		ret = String.Compare(val1, val2, StringComparison.Ordinal) == 0;
	}
	return ret;
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
public string MathAdd(string param0, string param1)
{
	System.Collections.ArrayList listValues = new System.Collections.ArrayList();
	listValues.Add(param0);
	listValues.Add(param1);
	double ret = 0;
	foreach (string obj in listValues)
	{
	double d = 0;
		if (IsNumeric(obj, ref d))
		{
			ret += d;
		}
		else
		{
			return "";
		}
	}
	return ret.ToString(System.Globalization.CultureInfo.InvariantCulture);
}

public bool IsDate(string val)
{
	bool retval = true;
	try
	{
		DateTime dt = Convert.ToDateTime(val, System.Globalization.CultureInfo.InvariantCulture);
	}
	catch (Exception)
	{
		retval = false;
	}
	return retval;
}


public string DateAddDays(string date, string days)
{
	string retval = "";
	double db = 0;
	if (IsDate(date) && IsNumeric(days, ref db))
	{
		DateTime dt = DateTime.Parse(date);
		int d = (int) db;
		dt = dt.AddDays(d);
		retval = dt.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
	}
	return retval;
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


]]>
  </msxsl:script>
</xsl:stylesheet>