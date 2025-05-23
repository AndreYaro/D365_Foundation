<?xml version="1.0" encoding="UTF-16"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:var="http://schemas.microsoft.com/BizTalk/2003/var" exclude-result-prefixes="msxsl var s0 s1 userCSharp" version="1.0" xmlns:s0="http://schemas.microsoft.com/dynamics/2008/01/sharedtypes" xmlns:s1="http://schemas.microsoft.com/dynamics/2008/01/documents/VendPayments" xmlns:userCSharp="http://schemas.microsoft.com/BizTalk/2003/userCSharp">
  <xsl:output omit-xml-declaration="yes" method="text" version="1.0" indent="no"/>

  <xsl:template match="/s1:VendPayments">
    <Document>
      <xsl:variable name="var:PC" select="'PC'" />
      <xsl:variable name="var:WhiteSp" select="'                                                                                                   '" />
      <xsl:variable name="var:Zeroes" select="'0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'" />
      <xsl:variable name="var:Invoices" select="count(/s1:vendpayments/s1:LedgerJournalTrans/s1:SpecTrans)" />
      <!--Start Header-->
      <xsl:for-each select="s1:LedgerJournalTrans">
        <xsl:if test ="position()=1">
          <!--1-1-->
          <xsl:value-of select="'&#xa; '" />
          <!--2-3-->
          <xsl:value-of select="substring($var:PC, 1,2)" />
          <xsl:for-each select="s1:CompanyInfo">
            <!--4-8-->
            <xsl:value-of select="substring(concat(s1:SiaCode/text(),string($var:WhiteSp)), 1, 5)" />
          </xsl:for-each>
          <!--9-13-->
          <xsl:for-each select="s1:BankAccountTable">
            <xsl:value-of select="substring(concat(s1:CompanyPaymId/text(),string($var:WhiteSp)), 1, 5)" />
          </xsl:for-each>
          <!--14-19-->
          <xsl:value-of select="substring(msxsl:format-date(userCSharp:DateCurrentDate(),'MMddyy'), 1,6)" />
          <!--20-39-->
          <xsl:for-each select="s1:CompanyInfo">
          <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1,20)" />
          </xsl:for-each>
          <!--40-113-->
          <xsl:value-of select="substring($var:WhiteSp, 1,73)" />
          <!--114-114-->
          <xsl:value-of select="'E'" />
          <!--115-120-->
          <xsl:value-of select="substring($var:WhiteSp, 1,6)" />
        </xsl:if>
      </xsl:for-each>
      <!--End Header-->

      <xsl:for-each select="s1:LedgerJournalTrans">
        <xsl:variable name="var:RecordNum" select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(7, string-length(position()))),position())" />
        <!--Start Record10-->        
        <!--1-1-->
        <xsl:value-of select="'&#xa; '" />
        <!--2-3-->
        <xsl:value-of select="10" />
        <!--4-10-->
        <xsl:value-of select="$var:RecordNum" />
        <!--11-16-->
        <xsl:value-of select="substring($var:WhiteSp, 1,5)" />
        <!--17-22-->
        <xsl:for-each select="s1:PaymProcessingData">
          <xsl:if test="s1:Name/text() = 'Creation Date'">
            <xsl:value-of select="substring(concat(msxsl:format-date(s1:Value/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />
          </xsl:if>
        </xsl:for-each>
        <!--23-28-->
        <xsl:for-each select="s1:PaymProcessingData">
          <xsl:if test="s1:Name/text() = 'Default Date'">
            <xsl:if test="s1:value/text()">
              <xsl:value-of select="substring(concat(msxsl:format-date(s1:Value/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />
            </xsl:if>
            <xsl:if test="msxsl:string-compare(s1:value/text(),'')=0">
              <xsl:value-of select="substring(concat(msxsl:format-date(../s1:DocumentDate/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />              
            </xsl:if>
          </xsl:if>
        </xsl:for-each>
        <!--29-33-->
        <xsl:value-of select="48000" />
        <!--34-46-->
        <xsl:if test="s1:AmountCurCredit/text()">
          <xsl:variable name="var:AmtCre" select="userCSharp:MathMultiply(userCSharp:MathAbs(s1:AmountCurCredit/text()), '100')" />
          <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length($var:AmtCre))),$var:AmtCre)" />
        </xsl:if>
        <xsl:if test="s1:AmountCurDebit/text()">
          <xsl:variable name="var:AmtDeb" select="userCSharp:MathMultiply(userCSharp:MathAbs(s1:AmountCurDebit/text()), '100')" />
          <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(13, string-length($var:AmtDeb))),$var:AmtDeb)" />
        </xsl:if>
        <!--47-47-->
        <xsl:value-of select="'+'" />
        <xsl:for-each select="s1:BankAccountTable">
          <!--48-57-->
          <xsl:if test="s1:RegistrationNum/text()">
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length(s1:RegistrationNum/text()))),s1:RegistrationNum/text())" />
          </xsl:if>
          <xsl:if test="msxsl:string-compare(s1:RegistrationNum/text(),'')='0'">
            <xsl:variable name="var:IBANRegNum" select="substring(s1:IBAN/text(),6,10)"/>
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length($var:IBANRegNum))),$var:IBANRegNum)" />
          </xsl:if>
          <!--58-69-->
          <xsl:if test="s1:AccountNum/text()">
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length(s1:AccountNum/text()))),s1:AccountNum/text())" />
          </xsl:if>
          <xsl:if test="msxsl:string-compare(s1:AccountNum/text(),'')='0'">
            <xsl:variable name="var:IBANAccNum" select="substring(s1:IBAN/text(),16,12)"/>
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length($var:IBANAccNum))),$var:IBANAccNum)" />
          </xsl:if>
        </xsl:for-each>

        <xsl:for-each select="s1:VendBankAccount">
          <!--70-79-->
          <xsl:if test="s1:RegistrationNum/text()">
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length(s1:RegistrationNum/text()))),s1:RegistrationNum/text())" />
          </xsl:if>
          <xsl:if test="msxsl:string-compare(s1:RegistrationNum/text(),'')='0'">
            <xsl:variable name="var:IBANRegNum" select="substring(s1:BankIBAN/text(),6,10)"/>
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length($var:IBANRegNum))),$var:IBANRegNum)" />
          </xsl:if>
          <!--80-91-->
          <xsl:if test="s1:AccountNum/text()">
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length(s1:AccountNum/text()))),s1:AccountNum/text())" />
          </xsl:if>
          <xsl:if test="msxsl:string-compare(s1:AccountNum/text(),'')='0'">
            <xsl:variable name="var:IBANAccNum" select="substring(s1:BankIBAN/text(),16,12)"/>
            <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(12, string-length($var:IBANAccNum))),$var:IBANAccNum)" />
          </xsl:if>
        </xsl:for-each>
        <!--92-96-->
        <xsl:for-each select="s1:CompanyInfo">
          <xsl:value-of select="substring(concat(s1:SiaCode/text(),string($var:WhiteSp)), 1, 5)" />
        </xsl:for-each>
        <!--97-97-->
        <xsl:value-of select="5"/>
        <xsl:for-each select="s1:DimAttrLevVal">
          <xsl:for-each select="s1:VendTable">
            <!--98-113-->
            <xsl:value-of select="substring(concat(s1:AccountNum/text(),string($var:WhiteSp)), 1, 16)" />
          </xsl:for-each>
        </xsl:for-each>
        <!--114-119-->
        <xsl:value-of select="substring(string($var:WhiteSp), 1, 6)" />
        <!--120-120-->
        <xsl:value-of select="'E'" />
        <!--End Record10-->

        <!--Start Record16-->
        <!--New Line-->
        <!--1-1-->
        <xsl:value-of select="'&#xa; '" />
        <!--2-3-->
        <xsl:value-of select="substring('16', 1,2)" />
        <!--4-10-->
        <xsl:value-of select="$var:RecordNum" />
        <!--11-37-->
        <xsl:for-each select="s1:BankAccountTable">
          <xsl:value-of select="substring(concat(s1:IBAN/text(),string($var:WhiteSp)), 1, 27)" />
        </xsl:for-each>
        <!--38-120-->
        <xsl:value-of select="substring($var:WhiteSp, 1,83)" />
        <!--End Record16-->

        <!--Start Record17-->
        <!--New Line-->        
        <!--1-1-->
        <xsl:value-of select="'&#xa; '" />
        <!--2-3-->
        <xsl:value-of select="substring('17', 1,2)" />
        <!--4-10-->
        <xsl:value-of select="$var:RecordNum" />
        <!--11-37-->
        <xsl:for-each select="s1:VendBankAccount">
          <xsl:value-of select="substring(concat(s1:BankIBAN/text(),string($var:WhiteSp)), 1, 27)" />
        </xsl:for-each>
        <!--38-120-->
        <xsl:value-of select="substring($var:WhiteSp, 1,83)" />
        <!--End Record17-->

        <!--Start Record20-->
        <!--New Line-->        
        <!--1-1-->
        <xsl:value-of select="'&#xa; '" />
        <!--2-3-->
        <xsl:value-of select="substring('20', 1,2)" />
        <!--4-10-->
        <xsl:value-of select="$var:RecordNum" />
        <xsl:for-each select="s1:CompanyInfo">
          <!--11-40-->
          <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1, 30)" />          
            <xsl:for-each select="s1:DirPartyPosAddr">
                  <!--41-70-->
                  <xsl:value-of select="substring(concat(translate(s1:Street/text(),'&#xa;',''),string($var:WhiteSp)), 1, 30)" />
                  <!--71-100-->
                  <xsl:value-of select="substring(concat(s1:City/text(),string($var:WhiteSp)), 1, 30)" />              
            </xsl:for-each>
          </xsl:for-each>
          <!--101-116-->
          <xsl:value-of select="substring(concat(s1:CoRegNum/text(),string($var:WhiteSp)), 1, 16)" />
        </xsl:for-each>
        <!--117-120-->
        <xsl:value-of select="substring($var:WhiteSp, 1,4)" />
        <!--End Record20-->

        <!--Start Record30-->
        <!--New Line-->        
        <!--1-1-->
        <xsl:value-of select="'&#xa; '" />
        <!--2-3-->
        <xsl:value-of select="substring('30', 1,2)" />
        <!--4-10-->
        <xsl:value-of select="$var:RecordNum" />
        <xsl:for-each select="s1:DimAttrLevVal">
          <xsl:for-each select="s1:VendTable">          
            <!--11-40-->
            <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1, 30)" />
            <!--41-70-->
            <xsl:value-of select="substring($var:WhiteSp, 1,30)" />
            <!--71-100-->
            <xsl:value-of select="substring($var:WhiteSp, 1,30)" />
            <!--101-116-->
            <xsl:value-of select="substring(concat(../s1:VatNum/text(),string($var:WhiteSp)), 1, 16)" />
          </xsl:for-each>
        </xsl:for-each>
        <!--117-120-->
        <xsl:value-of select="substring($var:WhiteSp, 1,4)" />
        <!--End Record30-->

        <!--Start Record40-->
        <!--New Line-->        
        <!--1-1-->
        <xsl:value-of select="'&#xa; '" />
        <!--2-3-->
        <xsl:value-of select="substring('40', 1,2)" />
        <!--4-10-->
        <xsl:value-of select="$var:RecordNum" />
        <xsl:for-each select="s1:DimAttrLevVal">
          <xsl:for-each select="s1:VendTable">
            <xsl:for-each select="s1:DirPtyNmPriAddr">
                  <!--11-40-->
                  <xsl:value-of select="substring(concat(translate(s1:Address/text(), '&#xa;',''),string($var:WhiteSp)), 1, 30)" />
                  <!--41-45-->
                  <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(10, string-length(s1:ZipCode/text()))),s1:ZipCode/text())" />
                  <!--46-73-->
                  <xsl:value-of select="substring(concat(s1:City/text(),string($var:WhiteSp)), 1, 28)" />
                  <!--74-75-->
                  <xsl:value-of select="substring(concat(s1:County/text(),string($var:WhiteSp)), 1, 2)" />
            </xsl:for-each>
          </xsl:for-each>
        </xsl:for-each>

        <!--76-120-->
        <xsl:value-of select="substring($var:WhiteSp, 1,45)" />
        <!--End Record40-->

        <!--Start Record50-->
        <xsl:if test="userCSharp:LogicalOr(userCSharp:LogicalLte($var:Invoices, '3'),userCSharp:LogicalGt($var:Invoices, '15'))">          
          <!--1-1-->
          <xsl:value-of select="'&#xa; '" />
          <!--2-3-->
          <xsl:value-of select="substring('50', 1,2)" />
          <!--4-10-->
          <xsl:value-of select="$var:RecordNum" />
          <xsl:variable name="var:InitConcat" select="userCSharp:InitCumulativeConcat(0)" />
          <xsl:if test="userCSharp:LogicalLte($var:Invoices, '3')">
            <xsl:for-each select="s1:SpecTrans">
              <xsl:for-each select="s1:VendTransOpen">
                <xsl:for-each select="s1:VendTrans">                  
                  <!--11-34-->
                  <xsl:variable name="var:Concat1" select="substring(concat(s1:Invoice/text(),string($var:WhiteSp)), 1, 24)" />
                  <!--35-40-->
                  <xsl:variable name="var:Concat2" select="substring(concat(msxsl:format-date(s1:DocumentDate/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />
                  <xsl:variable name="var:CumConcat1" select="userCSharp:AddToCumulativeConcat(0,string($var:Concat1),'1000')" />
                  <xsl:variable name="var:CumConcat2" select="userCSharp:AddToCumulativeConcat(0,string($var:Concat2),'1000')" />
                </xsl:for-each>
              </xsl:for-each>
            </xsl:for-each>
            <xsl:value-of select="substring(concat(userCSharp:GetCumulativeConcat(0), string($var:WhiteSp)), 1, 90)" />
          </xsl:if>
          <xsl:if test="userCSharp:LogicalGt($var:Invoices, '15')">
            <xsl:value-of select="substring(concat('Fatture diverse',$var:WhiteSp), 1,90)" />
          </xsl:if>
          <!--101-120-->
          <xsl:value-of select="substring($var:WhiteSp, 1,20)" />
        </xsl:if>
        <!--End Record50-->

        <!--Start Record60-->
        <xsl:if test="userCSharp:LogicalAnd(userCSharp:LogicalGt($var:Invoices, '3'),userCSharp:LogicalLte($var:Invoices, '15'))">
          <!--New Line-->
          <xsl:value-of select="'&#xa;'"/>
          <!--1-10-->
          <xsl:variable name="var:ConcatStart" select="concat('060',$var:RecordNum)" />

          <xsl:variable name="var:InitConcat" select="userCSharp:InitCumulativeConcat(0)" />
          <xsl:for-each select="s1:SpecTrans">
            <xsl:for-each select="s1:VendTransOpen">
              <xsl:for-each select="s1:VendTrans">

                <xsl:if test="userCSharp:LogicalLte($var:Invoices, '3')">
                  <!--11-34-->
                  <xsl:variable name="var:Concat1" select="substring(concat(s1:Invoice/text(),string($var:WhiteSp)), 1, 24)" />
                  <!--35-40-->
                  <xsl:variable name="var:CumConcat3" select="userCSharp:AddToCumulativeConcat(0,string($var:Concat1),'1000')" />
                  <xsl:if test="s1:DocumentDate/text()">
                    <xsl:variable name="var:Concat2" select="substring(concat(msxsl:format-date(s1:DocumentDate/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />
                    <xsl:variable name="var:CumConcat4" select="userCSharp:AddToCumulativeConcat(0,string($var:Concat2),'1000')" />
                  </xsl:if>
                  <xsl:if test="msxsl:string-compare(s1:DocumentDate/text(),'')">
                    <xsl:for-each select="../../s1:PaymProcessingData">
                      <xsl:if test="s1:Name/text() = 'Default Date'">
                        <xsl:variable name="var:Concat2" select="substring(concat(msxsl:format-date(s1:value/text(),'MMddyy'),string($var:WhiteSp)), 1, 6)" />
                        <xsl:variable name="var:CumConcat4" select="userCSharp:AddToCumulativeConcat(0,string($var:Concat2),'1000')" />
                      </xsl:if>
                    </xsl:for-each>
                  </xsl:if>
                </xsl:if>
              </xsl:for-each>
            </xsl:for-each>
            <xsl:if test="userCSharp:MathMod(position(), '3')">
              <xsl:value-of select="substring(concat($var:ConcatStart,userCSharp:GetCumulativeConcat(0), string($var:WhiteSp)), 1, 120)" />
              <xsl:variable name="var:InitConcat1" select="userCSharp:InitCumulativeConcat(0)" />
            </xsl:if>
          </xsl:for-each>
        </xsl:if>
        <!--End Record60-->

        <!--Start Record70-->
        <!--1-1-->
        <xsl:value-of select="'&#xa; '" />
        <!--2-3-->
        <xsl:value-of select="substring('70', 1,2)" />
        <!--4-10-->
        <xsl:value-of select="$var:RecordNum" />
        <!--11-100-->
        <xsl:value-of select="substring($var:WhiteSp, 1,100)" />

        <xsl:for-each select="s1:VendBankAccount">
          <xsl:if test="s1:BankIBAN/text()">
            <!--111-111-->
            <xsl:value-of select="substring(s1:BankIBAN/text(), 5, 1)" />
          </xsl:if>
          <xsl:if test="msxsl:string-compare(s1:BankIBAN/text(),'')='0'">
            <!--111-111-->
            <xsl:value-of select="substring(s1:BankCIN/text(), 5, 1)" />
          </xsl:if>
        </xsl:for-each>

        <xsl:value-of select="substring($var:WhiteSp, 1,9)" />
        <!--End Record70-->

        <xsl:variable name="var:v1" select="userCSharp:InitCumulativeSum(0)" />
        <xsl:variable name="var:v3" select="userCSharp:MathAbs(string(s1:AmountCurCredit/text()))" />
        <xsl:variable name="var:v4" select="string(s1:AmountCurDebit/text())" />
        <xsl:variable name="var:v5" select="userCSharp:MathAbs($var:v4)" />
        <xsl:variable name="var:v6" select="userCSharp:AddToCumulativeSum(0,string($var:v3),string($var:v5))" />
        <xsl:variable name="var:v7" select="userCSharp:AddToCumulativeSum(0,string($var:v5),string($var:v3))" />

        <xsl:variable name="var:T1" select="userCSharp:InitCumulativeSum(1)" />
        <xsl:if test="userCSharp:LogicalAnd(userCSharp:LogicalGt($var:Invoices, '3'),userCSharp:LogicalLte($var:Invoices, '15'))">
          <xsl:variable name="var:T2" select="userCSharp:AddToCumulativeSum(1,string(userCSharp:MathDivide($var:Invoices,'3')),string($var:T1))" />          
        </xsl:if>
        <xsl:if test="userCSharp:LogicalOr(userCSharp:LogicalLte($var:Invoices, '3'),userCSharp:LogicalGt($var:Invoices, '15'))">
          <xsl:variable name="var:T2" select="userCSharp:AddToCumulativeSum(1,1,string($var:T1))" />
        </xsl:if>        
        <xsl:variable name="var:T3" select="userCSharp:AddToCumulativeSum(1,7,7)" />
        
        <!--Start End-->
        <xsl:if test ="position()=last()">
          <!--1-1-->
          <xsl:value-of select="'&#xa; '" />
          <!--2-3-->
          <xsl:value-of select="'EF'" />
          <xsl:for-each select="s1:CompanyInfo">
            <!--4-8-->
            <xsl:value-of select="substring(concat(s1:SiaCode/text(),string($var:WhiteSp)), 1, 5)" />
          </xsl:for-each>
          <!--9-13-->
          <xsl:for-each select="s1:BankAccountTable">
            <xsl:value-of select="substring(concat(s1:CompanyPaymId/text(),string($var:WhiteSp)), 1, 5)" />
          </xsl:for-each>
          <!--14-19-->
          <xsl:value-of select="substring(msxsl:format-date(userCSharp:DateCurrentDate(),'MMddyy'), 1,6)" />
          <!--20-39-->
          <xsl:for-each select="s1:CompanyInfo">
            <xsl:value-of select="substring(concat(s1:Name/text(),string($var:WhiteSp)), 1,20)" />
          </xsl:for-each>
          <!--40-45-->
          <xsl:value-of select="substring($var:WhiteSp, 1,6)" />
          <!--46-52-->
          <xsl:value-of select="$var:RecordNum" />
          <!--53-67-->
          <xsl:value-of select="substring($var:Zeroes, 1,15)" />
          <!--68-82-->
          <xsl:variable name="var:TotalSum" select="userCSharp:MathMultiply(userCSharp:GetCumulativeSum(0) , '100')" />
          <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(15, string-length($var:TotalSum))),$var:TotalSum)" />
          <!--83-89-->
          <xsl:variable name="var:T4" select="userCSharp:AddToCumulativeSum(1,2,2)" />
          <xsl:variable name="var:TotalRecords" select="userCSharp:GetCumulativeSum(1)" />
          <xsl:value-of select="concat(substring(string($var:Zeroes),1,userCSharp:MathSubtract(7, string-length($var:TotalRecords))),$var:TotalRecords)" />
          <!--90-113-->
          <xsl:value-of select="substring($var:WhiteSp, 1,24)" />
          <!--114-114-->
          <xsl:value-of select="'E'" />
          <!--115-120-->
          <xsl:value-of select="substring($var:WhiteSp, 1,6)" />
        </xsl:if>
      </xsl:for-each>
      <!--End Header-->

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


]]>
  </msxsl:script>
</xsl:stylesheet>