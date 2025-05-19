<?xml version="1.0" encoding="utf-8"?>
<!--Version of the file 0002:2014-07-30-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                xmlns:p="http://www.fatturapa.gov.it/sdi/fatturapa/v1.0"
                xmlns:body="http://schemas.microsoft.com/dynamics/2008/01/documents/SalesInvoice_Einvoice"
                version="1.0">
  <xsl:output method="xml" indent="yes"/>
  <xsl:variable select="/" name="XML"/>

  <xsl:key name="InventTransDocumentIds-by-PackingSlipId-and-DatePhysical"
		   match="//body:CustInvoiceJour/body:CustInvoiceTrans/body:InventTransDocumentIds"
		   use="concat(body:PackingSlipId,body:DatePhysical)"/>

  <xsl:template match="/">
    <xsl:call-template name="eSalesInvoice"/>
  </xsl:template>

  <xsl:template name="eSalesInvoice">
    <p:FatturaElettronica versione="1.0"
                          xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                          xmlns:p="http://www.fatturapa.gov.it/sdi/fatturapa/v1.0"
                          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

      <FatturaElettronicaHeader>
        <DatiTrasmissione>
          <xsl:variable name="IdPaeseIdTrasmittente">
            <xsl:choose>
              <xsl:when test="//body:EInvoiceParameters_IT/body:TrnIsFilingForSameLegalEntity = 'Yes'">
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:CountryRegionId"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:TrnCountryCode"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:variable name="IdCodiceIdTrasmittente">
            <xsl:choose>
              <xsl:when test="//body:EInvoiceParameters_IT/body:TrnIsFilingForSameLegalEntity = 'Yes'">
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:CoRegNum"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:TrnTaxExempNumber"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <IdTrasmittente>
            <xsl:call-template name="setIdPaeseIdCodice">
              <xsl:with-param name="_IdPaese" select="$IdPaeseIdTrasmittente"/>
              <xsl:with-param name="_IdCodice" select="$IdCodiceIdTrasmittente"/>
            </xsl:call-template>
          </IdTrasmittente>

          <ProgressivoInvio>
            <xsl:value-of select="//body:EInvoiceRefCust_IT/body:EInvoice_IT/body:EInvoiceTransmissionName"/>
          </ProgressivoInvio>

          <FormatoTrasmissione>
            <xsl:value-of select="//body:EInvoiceParameters_IT/body:TrnTransmissionFormat"/>
          </FormatoTrasmissione>

          <CodiceDestinatario>
            <xsl:value-of select="//body:CustInvoiceJour/body:CustTable/body:AuthorityOffice_IT"/>
          </CodiceDestinatario>
              
          <xsl:variable name="TelefonoContattiTrasmittente">
            <xsl:choose>
              <xsl:when test="//body:EInvoiceParameters_IT/body:TrnIsFilingForSameLegalEntity = 'Yes'">
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:Phone"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:TrnPhone"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:variable name="EmailContattiTrasmittente">
            <xsl:choose>
              <xsl:when test="//body:EInvoiceParameters_IT/body:TrnIsFilingForSameLegalEntity = 'Yes'">
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:Email"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:TrnEmail"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>

          <ContattiTrasmittente>
            <xsl:call-template name="setTelefonoFaxEmail">
              <xsl:with-param name="_Telefono" select="$TelefonoContattiTrasmittente"/>
              <xsl:with-param name="_Email" select="$EmailContattiTrasmittente"/>
            </xsl:call-template>
          </ContattiTrasmittente>
        </DatiTrasmissione>

        <CedentePrestatore>
          <DatiAnagrafici>
            <IdFiscaleIVA>
              <xsl:call-template name="setIdPaeseIdCodice">
                <xsl:with-param name="_IdPaese" select="//body:CompanyInfo/body:DirPartyPostalAddressView/body:CountryRegionId"/>
                <xsl:with-param name="_IdCodice" select="//body:CompanyInfo/body:VATNum"/>
              </xsl:call-template>
            </IdFiscaleIVA>

            <xsl:if test="//body:EInvoiceParameters_IT/body:FiscalCode_IT">
              <CodiceFiscale>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:FiscalCode_IT"/>
              </CodiceFiscale>                
            </xsl:if>

      
            <Anagrafica>
              <xsl:call-template name="setDenomNome">
                <xsl:with-param name="_Denominazione" select="//body:EInvoiceParameters_IT/body:CompanyDesignation"/>
                <xsl:with-param name="_CodEORI" select="//body:EInvoiceParameters_IT/body:CodeEORI"/>
              </xsl:call-template>
            </Anagrafica>

            <xsl:if test="//body:EInvoiceParameters_IT/body:ProfRegName">
              <AlboProfessionale>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:ProfRegName"/>
              </AlboProfessionale>
            </xsl:if>
            
            <xsl:if test="//body:EInvoiceParameters_IT/body:ProfRegProvince">
              <ProvinciaAlbo>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:ProfRegProvince"/>
              </ProvinciaAlbo>
            </xsl:if>

            <xsl:if test="//body:EInvoiceParameters_IT/body:ProfRegNumber">
              <NumeroIscrizioneAlbo>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:ProfRegNumber"/>
              </NumeroIscrizioneAlbo>
            </xsl:if>

            <xsl:if test="//body:EInvoiceParameters_IT/body:ProfRegDate">
              <DataIscrizioneAlbo>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:ProfRegDate"/>
              </DataIscrizioneAlbo>
            </xsl:if>

            <RegimeFiscale>
              <xsl:value-of select="//body:EInvoiceParameters_IT/body:TaxSystem"/>
            </RegimeFiscale>
            
          </DatiAnagrafici>

          <Sede>
            <xsl:call-template name="setIndirizzoNumeroCivicoCAPComuneProvinciaNazione">
              <xsl:with-param name="_Indirizzo" select="//body:CompanyInfo/body:DirPartyPostalAddressView/body:Address"/>
              <xsl:with-param name="_NumeroCivico" select="//body:CompanyInfo/body:DirPartyPostalAddressView/body:Street"/>
              <xsl:with-param name="_CAP" select="//body:CompanyInfo/body:DirPartyPostalAddressView/body:ZipCode"/>
              <xsl:with-param name="_Comune" select="//body:CompanyInfo/body:DirPartyPostalAddressView/body:City"/>
              <xsl:with-param name="_Provincia" select="//body:CompanyInfo/body:DirPartyPostalAddressView/body:County"/>
              <xsl:with-param name="_Nazione" select="//body:CompanyInfo/body:DirPartyPostalAddressView/body:ISOcode"/>
            </xsl:call-template>
          </Sede>

          <!--StabileOrganizzazione>
            <xsl:call-template name="setIndirizzoNumeroCivicoCAPComuneProvinciaNazione">
              <xsl:with-param name="Indirizzo"/>
              <xsl:with-param name="NumeroCivico"/>
              <xsl:with-param name="CAP"/>
              <xsl:with-param name="Comune"/>
              <xsl:with-param name="Provincia"/>
              <xsl:with-param name ="Nazione"/>
            </xsl:call-template>
          </StabileOrganizzazione-->

          <xsl:if test="//body:EInvoiceParameters_IT/body:IsArt2250 = 'Yes'">
            <IscrizioneREA>
              <Ufficio>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:ArtProvince"/>
              </Ufficio>

              <NumeroREA>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:ArtRegistrationNum"/>
              </NumeroREA>

              <xsl:if test="//body:EInvoiceParameters_IT/body:ArtShareCapital">
                <CapitaleSociale>
                  <xsl:value-of select="//body:EInvoiceParameters_IT/body:ArtShareCapital"/>
                </CapitaleSociale>
              </xsl:if>

              <xsl:if test="//body:EInvoiceParameters_IT/body:ArtSoleShareholder">
                <SocioUnico>
                  <xsl:value-of select="//body:EInvoiceParameters_IT/body:ArtSoleShareholder"/>
                </SocioUnico>
              </xsl:if>

              <StatoLiquidazione>
                <xsl:value-of select="//body:EInvoiceParameters_IT/body:ArtLiquidation"/>
              </StatoLiquidazione>
              
            </IscrizioneREA>
          </xsl:if>

          <Contatti>
            <xsl:call-template name="setTelefonoFaxEmail">
              <xsl:with-param name="_Telefono" select="//body:EInvoiceParameters_IT/body:Phone"/>
              <xsl:with-param name="_Fax" select="//body:EInvoiceParameters_IT/body:TeleFax"/>
              <xsl:with-param name="_Email" select="//body:EInvoiceParameters_IT/body:Email"/>
            </xsl:call-template>
          </Contatti>

          <xsl:if test="//body:EInvoiceParameters_IT/body:IdentificatioinCode">
            <RiferimentoAmministrazione>
              <xsl:value-of select="//body:EInvoiceParameters_IT/body:IdentificatioinCode"/>
            </RiferimentoAmministrazione>
          </xsl:if>
          
        </CedentePrestatore>

        <xsl:if test="//body:EInvoiceParameters_IT/body:IsTaxRep = 'Yes'">
          <RappresentanteFiscale>
            <DatiAnagrafici>
              <IdFiscaleIVA>
                <xsl:call-template name="setIdPaeseIdCodice">
                  <xsl:with-param name="_IdPaese" select="//body:EInvoiceParameters_IT/body:TaxRepCountryCode"/>
                  <xsl:with-param name="_IdCodice" select="//body:EInvoiceParameters_IT/body:TaxRepTaxExempNumber"/>
                </xsl:call-template>
              </IdFiscaleIVA>

              <xsl:if test="//body:EInvoiceParameters_IT/body:TaxRepFiscalCode">
                <CodiceFiscale>
                  <xsl:value-of select="//body:EInvoiceParameters_IT/body:TaxRepFiscalCode"/>
                </CodiceFiscale>
              </xsl:if>
              
              <Anagrafica>
                <xsl:if test="//body:EInvoiceParameters_IT/body:TaxRepIsCompany = 'No'">
                  <xsl:call-template name="setDenomNome">
                    <xsl:with-param name="_Nome" select="//body:EInvoiceParameters_IT/body:TaxRepFirstName"/>
                    <xsl:with-param name="_Cognome" select="//body:EInvoiceParameters_IT/body:TaxRepLastName"/>
                    <xsl:with-param name="_Titolo" select="//body:EInvoiceParameters_IT/body:TaxRepTitle"/>
                    <xsl:with-param name="_CodEORI" select="//body:EInvoiceParameters_IT/body:TaxRepCodeEORI"/>
                  </xsl:call-template>
                </xsl:if>
                <xsl:if test="//body:EInvoiceParameters_IT/body:TaxRepIsCompany = 'Yes'">
                  <xsl:call-template name="setDenomNome">
                    <xsl:with-param name="_Denominazione" select="//body:EInvoiceParameters_IT/body:TaxRepCompanyDesignation"/>
                    <xsl:with-param name="_CodEORI" select="//body:EInvoiceParameters_IT/body:TaxRepCodeEORI"/>
                  </xsl:call-template>
                </xsl:if>
              </Anagrafica>
            </DatiAnagrafici>
          </RappresentanteFiscale>
        </xsl:if>

        <CessionarioCommittente>
          <DatiAnagrafici>

            <xsl:if test="//body:CustTable/body:VATNum">
              <IdFiscaleIVA>
                <xsl:call-template name="setIdPaeseIdCodice">
                  <xsl:with-param name="_IdPaese" select="//body:CustTable/body:PostalAddressViewCust/body:CountryRegionId"/>
                  <xsl:with-param name="_IdCodice" select="//body:CustTable/body:VATNum"/>
                </xsl:call-template>
              </IdFiscaleIVA>
            </xsl:if>
            
            <xsl:if test="//body:CustTable/body:FiscalCode">
              <CodiceFiscale>
                <xsl:value-of select="//body:CustTable/body:FiscalCode"/>
              </CodiceFiscale>
            </xsl:if>
            
            
            <Anagrafica>
              <xsl:call-template name="setDenomNome">
                <xsl:with-param name="_Denominazione" select="//body:CustTable/body:Name"/>
              </xsl:call-template>
            </Anagrafica>
          </DatiAnagrafici>

          <Sede>
            <xsl:call-template name="setIndirizzoNumeroCivicoCAPComuneProvinciaNazione">
              <xsl:with-param name="_Indirizzo" select="//body:CustTable/body:PostalAddressViewCust/body:Address"/>
              <xsl:with-param name="_NumeroCivico" select="//body:CustTable/body:PostalAddressViewCust/body:Street"/>
              <xsl:with-param name="_CAP" select="//body:CustTable/body:PostalAddressViewCust/body:ZipCode"/>
              <xsl:with-param name="_Comune" select="//body:CustTable/body:PostalAddressViewCust/body:City"/>
              <xsl:with-param name="_Provincia" select="//body:CustTable/body:PostalAddressViewCust/body:County"/>
              <xsl:with-param name="_Nazione" select="//body:CustTable/body:PostalAddressViewCust/body:CountryRegionId"/>
            </xsl:call-template>
          </Sede>
        </CessionarioCommittente>
      </FatturaElettronicaHeader>

      <FatturaElettronicaBody>
        <DatiGenerali>
          <DatiGeneraliDocumento>
            <xsl:variable name="TipoDocumento">
              <xsl:choose>
                <xsl:when test="//body:CustInvoiceJour/body:InvoiceAmount &gt; 0">TD01</xsl:when>
                <xsl:when test="//body:CustInvoiceJour/body:InvoiceAmount &lt; 0">TD04</xsl:when>
              </xsl:choose>
            </xsl:variable>
            <TipoDocumento>
              <xsl:value-of select="$TipoDocumento"/>
            </TipoDocumento>

            <Divisa>
              <xsl:value-of select="//body:CustInvoiceJour/body:CurrencyCode"/>
            </Divisa>

            <Data>
              <xsl:value-of select="//body:CustInvoiceJour/body:InvoiceDate"/>
            </Data>

            <Numero>
              <xsl:value-of select="//body:CustInvoiceJour/body:InvoiceId"/>
            </Numero>

            <xsl:if test="//body:EndDisc &gt; 0">
              <ScontoMaggiorazione>
                <xsl:call-template name="setTipoPercentualeImporto">
                  <xsl:with-param name="_Tipo">SC</xsl:with-param>
                  <!--Percentage element could be defined here-->
                  <!--Percentuale-->
                  <xsl:with-param name="_Importo" select="format-number(//body:EndDisc, '0.00')"/>
                </xsl:call-template>
              </ScontoMaggiorazione>
            </xsl:if>
            
            <xsl:if test="//body:SumMarkup &gt; 0">
              <ScontoMaggiorazione>
                <xsl:call-template name="setTipoPercentualeImporto">
                  <xsl:with-param name="_Tipo">MG</xsl:with-param>
                  <!--Percentage element could be defined here-->
                  <!--Percentuale-->
                  <xsl:with-param name="_Importo" select="format-number(//body:SumMarkup, '0.00')"/>
                </xsl:call-template>
              </ScontoMaggiorazione>
            </xsl:if>

            <xsl:if test="//body:CustInvoiceJour/body:InvoiceAmount">
              <ImportoTotaleDocumento>
                <xsl:value-of select="format-number(//body:CustInvoiceJour/body:InvoiceAmount, '0.00')"/>
              </ImportoTotaleDocumento>
            </xsl:if>
            
            <!--Arrotondamento>rounding up/down, if any, on the total of the document (this may also be negative)</Arrotondamento-->
            <!--Causale>description of the reason for the document</Causale-->
            <!--Art73>indicates whether the document has been issued according to methods and terms laid down in a ministerial decree pursuant to article 73 of Italian Presidential Decree 633/72</Art73-->
            
          </DatiGeneraliDocumento>

          <!--DatiFattureCollegate>??? block containing the information relative to the invoices previously transmitted and to which the present document is connected</DatiFattureCollegate-->

		  <!--transportation documents-->
		  <xsl:for-each select="//body:CustInvoiceJour/body:CustInvoiceTrans/body:InventTransDocumentIds[count(. | key('InventTransDocumentIds-by-PackingSlipId-and-DatePhysical', concat(body:PackingSlipId,body:DatePhysical))[1]) = 1]">
		    <xsl:if test="body:PackingSlipId != '' and body:DatePhysical != ''">
			  <DatiDDT>
			    <NumeroDDT>
				  <xsl:value-of select="body:PackingSlipId"/>
			    </NumeroDDT>
			    <DataDDT>
				  <xsl:value-of select="body:DatePhysical"/>
			    </DataDDT>
			  </DatiDDT>
			</xsl:if> 
		  </xsl:for-each>

          <!--DatiTrasporto>
            <DatiAnagraficiVettore>
              <IdFiscaleIVA>
                <xsl:call-template name="setIdPaeseIdCodice">
                  <xsl:with-param name="_IdPaese"/>
                  <xsl:with-param name="_IdCodice"/>
                </xsl:call-template>
              </IdFiscaleIVA>

              <CodiceFiscale></CodiceFiscale>

              <Anagrafica>
                <xsl:call-template name="setDenomNome">
                  <xsl:with-param name="Denominazione"/>
                  <xsl:with-param name="Nome"/>
                  <xsl:with-param name="Cognome"/>
                  <xsl:with-param name="Titolo"/>
                  <xsl:with-param name="CodEORI"/>
                </xsl:call-template>
              </Anagrafica>

              <NumeroLicenzaGuida></NumeroLicenzaGuida>
            </DatiAnagraficiVettore>

            <MezzoTrasporto></MezzoTrasporto>

            <CausaleTrasporto></CausaleTrasporto>

            <NumeroColli></NumeroColli>

            <Descrizione></Descrizione>

            <UnitaMisuraPeso></UnitaMisuraPeso>

            <PesoLordo></PesoLordo>

            <PesoNetto></PesoNetto>

            <DataOraRitiro></DataOraRitiro>

            <DataInizioTrasporto></DataInizioTrasporto>

            <TipoResa></TipoResa>

            <IndirizzoResa>
              <xsl:call-template name="setIndirizzoNumeroCivicoCAPComuneProvinciaNazione">
                <xsl:with-param name="Indirizzo"/>
                <xsl:with-param name="NumeroCivico"/>
                <xsl:with-param name="CAP"/>
                <xsl:with-param name="Comune"/>
                <xsl:with-param name="Provincia"/>
                <xsl:with-param name ="Nazione"/>
              </xsl:call-template>
            </IndirizzoResa>

            <DataOraConsegn></DataOraConsegn>
          </DatiTrasporto-->

        </DatiGenerali>
        
        <DatiBeniServizi>
          <xsl:for-each select="//body:CustInvoiceJour/body:CustInvoiceTrans">
            <DettaglioLinee>
              <NumeroLinea>
                <xsl:number value="body:LineNum"/>
              </NumeroLinea>

              <Descrizione>
                <xsl:value-of select="body:ItemName"/>
              </Descrizione>

              <xsl:if test="body:Qty">
                <Quantita>
                  <xsl:value-of select="format-number(body:Qty, '0.00')"/>
                </Quantita>
              </xsl:if>

              <xsl:if test="body:SalesUnit">
                <UnitaMisura>
                  <xsl:value-of select="body:SalesUnit"/>
                </UnitaMisura>
              </xsl:if>

              <PrezzoUnitario>
                <xsl:value-of select="format-number(body:SalesPrice, '0.00')"/>
              </PrezzoUnitario>
              
              <xsl:if test="body:AmountDiscAmount or body:DiscPercent">
                <ScontoMaggiorazione>
                  <xsl:call-template name="setTipoPercentualeImporto">
                    <xsl:with-param name="_Tipo">SC</xsl:with-param>
                    <xsl:with-param name="_Percentuale" select="format-number(body:DiscPercent, '0.00')"/>

                    <xsl:with-param name="_Importo" select="format-number(body:AmountDiscAmount, '0.00')"/>
                  </xsl:call-template>
                </ScontoMaggiorazione>
              </xsl:if>

              <xsl:for-each select="body:MarkupTransLine">
                <ScontoMaggiorazione>
                  <xsl:call-template name="setTipoPercentualeImporto">
                    <xsl:with-param name="_Tipo">MG</xsl:with-param>
                    <xsl:with-param name="_Percentuale" select="format-number(100 * body:CalculatedAmount div (../body:LineAmount), '0.00')"/>
                   <xsl:with-param name="_Importo" select="format-number(body:CalculatedAmount, '0.00')"/>
                  </xsl:call-template>
                </ScontoMaggiorazione>
              </xsl:for-each>
              
              <PrezzoTotale>
                <xsl:value-of select="format-number(body:LineAmount, '0.00')"/>
              </PrezzoTotale>
              
              <AliquotaIVA>
                <xsl:choose>
                  <xsl:when test="(body:LineAmount != 0) and (body:TaxAmount !=0)">
                    <xsl:value-of select="format-number(round(100 * body:TaxAmount div body:LineAmount), '0.00')"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="format-number(0, '0.00')"/>
                  </xsl:otherwise>
                </xsl:choose>
              </AliquotaIVA>
              
              <xsl:if test="not ((body:LineAmount != 0) and (body:TaxAmount !=0))">
                <Natura>N3</Natura>
              </xsl:if>
              
            </DettaglioLinee>
          </xsl:for-each>

          <xsl:for-each select="//body:CustInvoiceJour/body:TaxTrans">
            <DatiRiepilogo>
              <AliquotaIVA>
                <xsl:choose>
                  <xsl:when test="(body:TaxValue !=0)">
                    <xsl:value-of select="format-number(body:TaxValue, '0.00')"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="format-number(0, '0.00')"/>
                  </xsl:otherwise>
                </xsl:choose>
              </AliquotaIVA>

              
              <xsl:if test="not (body:TaxValue != 0)">
                <xsl:variable name="Natura">
                  <xsl:choose>
                    <!--xsl:when test="body:ExemptTax">N1</xsl:when--><!-- excluding ex Art.15 logic to be added here-->
                    <!--xsl:when test="body:ExemptTax">N2</xsl:when--><!--not subject-->
                    <xsl:when test="body:ExemptTax = 'Yes'">N4</xsl:when><!--exempt-->
                    <xsl:otherwise>N3</xsl:otherwise><!--not taxable-->
                  </xsl:choose>
                </xsl:variable>

                <Natura>
                  <xsl:value-of select="$Natura"/>
                </Natura>
              </xsl:if>
                
              <ImponibileImporto>
                <xsl:choose>
                  <xsl:when test="(body:TaxBaseAmount !=0)">
                    <xsl:value-of select="format-number((-1) * body:TaxBaseAmount, '0.00')"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="format-number(0, '0.00')"/>
                  </xsl:otherwise>
                </xsl:choose>
              </ImponibileImporto>

              <Imposta>
                <xsl:choose>
                  <xsl:when test="(body:TaxAmount !=0)">
                    <xsl:value-of  select="format-number((-1) * body:TaxAmount, '0.00')"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="format-number(0, '0.00')"/>
                  </xsl:otherwise>
                </xsl:choose>
              </Imposta>

              
              <xsl:variable name="EsigibilitaIVA">
                <xsl:choose>
                  <xsl:when test="body:UnrealizedTax = 'Yes'">D</xsl:when>
                  <xsl:otherwise>I</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <EsigibilitaIVA>
                <xsl:value-of select="$EsigibilitaIVA"/>
              </EsigibilitaIVA>
            </DatiRiepilogo>
          </xsl:for-each>
        </DatiBeniServizi>
        
        
        <!--??? not mandatroy block-->
        <DatiPagamento>

          <xsl:variable name="CondizioniPagamento">
            <xsl:choose>
              <xsl:when test="//body:CustInvoiceJour/body:PaymentSched">TP01</xsl:when>
              <xsl:when test="//body:CustInvoiceJour/body:CustTrans/body:Prepayment = 'Yes'">TP03</xsl:when>
              <xsl:otherwise>TP02</xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <CondizioniPagamento>
            <xsl:value-of select="$CondizioniPagamento"/>
          </CondizioniPagamento>

          <xsl:for-each select="//body:CustInvoiceJour/body:CustTrans">
            <DettaglioPagamento>
              <!--Beneficiario></Beneficiario-->

              <ModalitaPagamento>
                <xsl:value-of select="body:PaymMode"/>
              </ModalitaPagamento>

              <!--DataRiferimentoTerminiPagamento></DataRiferimentoTerminiPagamento-->

              <!--GiorniTerminiPagamento></GiorniTerminiPagamento-->

              <!--DataScadenzaPagamento></DataScadenzaPagamento-->

              <ImportoPagamento>
                <xsl:value-of select="format-number(body:AmountCur, '0.00')"/>
              </ImportoPagamento>

              <!--CodUfficioPostale></CodUfficioPostale-->

              <!--CognomeQuietanzante></CognomeQuietanzante-->

              <!--NomeQuietanzante></NomeQuietanzante-->

              <!--CFQuietanzante></CFQuietanzante-->

              <!--TitoloQuietanzante></TitoloQuietanzante-->

              <IstitutoFinanziario>
                <xsl:value-of select="//body:CustPaymModeTable/body:BankAccountTable/body:Name"/>
              </IstitutoFinanziario>

              <xsl:if test="//body:CustPaymModeTable/body:BankAccountTable/body:IBAN">
                <IBAN>
                  <xsl:value-of select="//body:CustPaymModeTable/body:BankAccountTable/body:IBAN"/>
                </IBAN>
              </xsl:if>

              <xsl:if test="//body:CustPaymModeTable/body:BankAccountTable/body:SWIFTNo">
                <BIC>
                  <xsl:value-of select="//body:CustPaymModeTable/body:BankAccountTable/body:SWIFTNo"/>
                </BIC>
              </xsl:if>

              <!--ScontoPagamentoAnticipato></ScontoPagamentoAnticipato>

              <DataLimitePagamentoAnticipato></DataLimitePagamentoAnticipato>

              <PenalitaPagamentiRitardati></PenalitaPagamentiRitardati>

              <DataDecorrenzaPenale></DataDecorrenzaPenale>

              <CodicePagamento></CodicePagamento-->
            </DettaglioPagamento>
          </xsl:for-each>
        </DatiPagamento>
      </FatturaElettronicaBody>
    </p:FatturaElettronica>
  </xsl:template>

  <xsl:template name="setIdPaeseIdCodice">
    <xsl:param name="_IdPaese"/>
    <xsl:param name="_IdCodice"/>
    <IdPaese>
      <xsl:value-of select="$_IdPaese"/>
    </IdPaese>

    <IdCodice>
      <xsl:value-of select="$_IdCodice"/>
    </IdCodice>
  </xsl:template>

  <xsl:template name="setDenomNome">
    <xsl:param name="_Denominazione"/>
    <xsl:param name="_Nome"/>
    <xsl:param name="_Cognome"/>
    <xsl:param name="_Titolo"/>
    <xsl:param name="_CodEORI"/>
    <xsl:if test="$_Denominazione">
      <Denominazione>
        <xsl:value-of select="$_Denominazione"/>
      </Denominazione>
    </xsl:if>

    <xsl:if test="$_Nome">
      <Nome>
        <xsl:value-of select="$_Nome"/>
      </Nome>
    </xsl:if>

    <xsl:if test="$_Cognome">
      <Cognome>
        <xsl:value-of select="$_Cognome"/>
      </Cognome>
    </xsl:if>

    <xsl:if test="$_Titolo">
      <Titolo>
        <xsl:value-of select="$_Titolo"/>
      </Titolo>
    </xsl:if>

    <xsl:if test="$_CodEORI">
      <CodEORI>
        <xsl:value-of select="$_CodEORI"/>
      </CodEORI>
    </xsl:if>
  </xsl:template>

  <xsl:template name="setIndirizzoNumeroCivicoCAPComuneProvinciaNazione">
    <xsl:param name="_Indirizzo"/>
    <xsl:param name="_NumeroCivico"/>
    <xsl:param name="_CAP"/>
    <xsl:param name="_Comune"/>
    <xsl:param name="_Provincia"/>
    <xsl:param name="_Nazione"/>
    <Indirizzo>
      <xsl:value-of select="$_Indirizzo"/>
    </Indirizzo>

    <xsl:if test="$_NumeroCivico">
      <NumeroCivico>
        <xsl:value-of select="$_NumeroCivico"/>
      </NumeroCivico>
    </xsl:if>
    
    <CAP>
      <xsl:value-of select="$_CAP"/>
    </CAP>

    <Comune>
      <xsl:value-of select="$_Comune"/>
    </Comune>

    <xsl:if test="$_Provincia">
      <Provincia>
        <xsl:value-of select="$_Provincia"/>
      </Provincia>
    </xsl:if>
    
    <Nazione>
      <xsl:value-of select="$_Nazione"/>
    </Nazione>
  </xsl:template>

  <xsl:template name="setTelefonoFaxEmail">
    <xsl:param name="_Telefono"/>
    <xsl:param name="_Fax"/>
    <xsl:param name="_Email"/>
    <Telefono>
      <xsl:value-of select="$_Telefono"/>
    </Telefono>

    <xsl:if test="_Fax">
      <Fax>
        <xsl:value-of select="$_Fax"/>
      </Fax>
    </xsl:if>

    <Email>
      <xsl:value-of select="$_Email"/>
    </Email>
  </xsl:template>

  <xsl:template name="setTipoPercentualeImporto">
    <xsl:param name="_Tipo"/>
    <xsl:param name="_Percentuale"/>
    <xsl:param name="_Importo"/>
    <Tipo>
      <xsl:value-of select="$_Tipo"/>
    </Tipo>

    <xsl:if test="$_Percentuale > 0">
      <Percentuale>
        <xsl:value-of select="$_Percentuale"/>
      </Percentuale>
    </xsl:if>

    <xsl:if test="$_Importo > 0">
      <Importo>
        <xsl:value-of select="$_Importo"/>
      </Importo>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>

