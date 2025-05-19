// ---------------------------------------------------------------------
// <copyright file="ResourceDetailsPreview.js" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Scripts/jquery-1.7.2.js" />
/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Resources/Scripts/AvailabilityView.js" />

(function () {
    "use strict";

    Globalize.addCultureInfo("en", {
        messages: {
            ResourceDetailsPreview_PhoneActionLabel: "Call",
            ResourceDetailsPreview_MailActionLabel: "Send mail",
            ResourceDetailsPreview_ConferenceActionLabel: "Meet",
            ResourceDetailsPreview_ChatActionLabel: "Chat",
            ResourceDetailsPreview_AvailableDatePrefix: "Available on",
            ResourceDetailsPreview_AvailableDateNone: "Not available in the near term",
            ResourceDetailsPreview_CompanyLabel: "Works in",
            ResourceDetailsPreview_EmploymentLabel: "Has employment type of",
            ResourceDetailsPreview_ResourceIdLabel: "Resource ID is",
            ResourceDetailsPreview_SalesPriceLabel: "Sales price is",
            ResourceDetailsPreview_CostPriceLabel: "Cost price is",
            ResourceDetailsPreview_PersonnelNumberLabel: "Personnel number is",
            ResourceDetailsPreview_OfficeLabel: "Has office located at",
        },
    });

    $dyn.controls.ResourceDetailsPreview = function (data) {
        $dyn.ui.Control.apply(this, arguments);
    };

    $dyn.controls.ResourceDetailsPreview.prototype = $dyn.extendPrototype($dyn.ui.Control.prototype, {
        Name: undefined,                        // resource name
        ResourceId: undefined,                  // resource id
        SalesPrice: undefined,                  // sales price
        CostPrice: undefined,                   // cost price
        Role: undefined,                        // resource default role
        AvailableDateTime: undefined,           // next available date time
        PhoneAddress: undefined,                // phone number
        EmailAddress: undefined,                // email address
        InstantMessengerAddress: undefined,     // instant messenger address
        MeetAddress: undefined,                 // meeting address
        LegalEntity: undefined,                 // legal entity
        Department: undefined,                  // department
        OfficeAddress: undefined,               // office address
        PersonnelNumber: undefined,             // personnel number
        EmploymentStatus: undefined,            // employment status
        PersonPhoto: undefined,                 // string. Image path

        Defaults: {
            imageType: "URL",
            unknownImage: "resources/images/unknown.jpg"
        },

        init: function (data, element) {
            $dyn.ui.Control.prototype.init.apply(this, arguments);
            var self = this;

            $dyn.observe(data.DataSource, function (ds) {
                var preview = ds ? JSON.parse(ds) : undefined;

                if (preview) {
                    self.PersonPhoto = $dyn.shell.rootPath.concat(self.Defaults.unknownImage);
                    self.Name = preview.name;
                    self.Role = preview.title;
                    self.AvailableDateTime = preview.availableDateTime
                        ? $dyn.format("{0} {1}", $dyn.label("ResourceDetailsPreview_AvailableDatePrefix"), preview.availableDateTime)
                        : $dyn.label("ResourceDetailsPreview_AvailableDateNone");

                    self.ResourceId = $dyn.format("{0} {1}", $dyn.label("ResourceDetailsPreview_ResourceIdLabel"), preview.resourceId);
                    self.SalesPrice = preview.salesPrice
                        ? $dyn.format("{0} {1}", $dyn.label("ResourceDetailsPreview_SalesPriceLabel"), Globalize.format($dyn.value(preview.salesPrice), 'n2'))
                        : undefined;

                    self.CostPrice = preview.costPrice
                        ? $dyn.format("{0} {1}", $dyn.label("ResourceDetailsPreview_CostPriceLabel"), Globalize.format($dyn.value(preview.costPrice), 'n2'))
                        : undefined;

                    self.PhoneAddress = preview.phoneNumber ? $dyn.format("tel:{0}", preview.phoneNumber) : undefined;
                    self.EmailAddress = preview.emailAddress ? $dyn.format("mailto:{0}", preview.emailAddress) : undefined;
                    preview.imAddress = preview.imAddress ? preview.imAddress : preview.emailAddress;
                    self.InstantMessengerAddress = preview.imAddress ? $dyn.format("sip:{0}", preview.imAddress) : undefined;
                    self.MeetAddress = preview.imAddress ? $dyn.format("meet:{0}", preview.imAddress) : undefined;

                    self.LegalEntity = $dyn.format("{0} {1} ({2})", $dyn.label("ResourceDetailsPreview_CompanyLabel"), preview.companyName, preview.company);
                    self.Department = preview.department;
                    self.OfficeAddress = $dyn.format("{0}\n{1}", $dyn.label("ResourceDetailsPreview_OfficeLabel"), preview.officeAddress);
                    self.PersonnelNumber = $dyn.format("{0} {1}", $dyn.label("ResourceDetailsPreview_PersonnelNumberLabel"), preview.personnelNumber);
                    self.EmploymentStatus = $dyn.format("{0} {1}", $dyn.label("ResourceDetailsPreview_EmploymentLabel"), preview.employmentType);
                }
            });
        },
    });
})();

// SIG // Begin signature block
// SIG // MIIoOgYJKoZIhvcNAQcCoIIoKzCCKCcCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // KU6dN3wX8szmDX42pYjIBId9slXaVgBm0l6hnziXN+Wg
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAABAO91ZVdDzsYrQAA
// SIG // AAAEAzANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI0MDkxMjIwMTExM1oX
// SIG // DTI1MDkxMTIwMTExM1owdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // n3RnXcCDp20WFMoNNzt4s9fV12T5roRJlv+bshDfvJoM
// SIG // ZfhyRnixgUfGAbrRlS1St/EcXFXD2MhRkF3CnMYIoeMO
// SIG // MuMyYtxr2sC2B5bDRMUMM/r9I4GP2nowUthCWKFIS1RP
// SIG // lM0YoVfKKMaH7bJii29sW+waBUulAKN2c+Gn5znaiOxR
// SIG // qIu4OL8f9DCHYpME5+Teek3SL95sH5GQhZq7CqTdM0fB
// SIG // w/FmLLx98SpBu7v8XapoTz6jJpyNozhcP/59mi/Fu4tT
// SIG // 2rI2vD50Vx/0GlR9DNZ2py/iyPU7DG/3p1n1zluuRp3u
// SIG // XKjDfVKH7xDbXcMBJid22a3CPbuC2QJLowIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFOpuKgJKc+OuNYitoqxfHlrE
// SIG // gXAZMFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis1MDI5MjYwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBRaP+hOC1+dSKhbqCr1LIvNEMrRiOQ
// SIG // EkPc7D6QWtM+/IbrYiXesNeeCZHCMf3+6xASuDYQ+AyB
// SIG // TX0YlXSOxGnBLOzgEukBxezbfnhUTTk7YB2/TxMUcuBC
// SIG // P45zMM0CVTaJE8btloB6/3wbFrOhvQHCILx41jTd6kUq
// SIG // 4bIBHah3NG0Q1H/FCCwHRGTjAbyiwq5n/pCTxLz5XYCu
// SIG // 4RTvy/ZJnFXuuwZynowyju90muegCToTOwpHgE6yRcTv
// SIG // Ri16LKCr68Ab8p8QINfFvqWoEwJCXn853rlkpp4k7qzw
// SIG // lBNiZ71uw2pbzjQzrRtNbCFQAfmoTtsHFD2tmZvQIg1Q
// SIG // VkzM/V1KCjHL54ItqKm7Ay4WyvqWK0VIEaTbdMtbMWbF
// SIG // zq2hkRfJTNnFr7RJFeVC/k0DNaab+bpwx5FvCUvkJ3z2
// SIG // wfHWVUckZjEOGmP7cecefrF+rHpif/xW4nJUjMUiPsyD
// SIG // btY2Hq3VMLgovj+qe0pkJgpYQzPukPm7RNhbabFNFvq+
// SIG // kXWBX/z/pyuo9qLZfTb697Vi7vll5s/DBjPtfMpyfpWG
// SIG // 0phVnAI+0mM4gH09LCMJUERZMgu9bbCGVIQR7cT5YhlL
// SIG // t+tpSDtC6XtAzq4PJbKZxFjpB5wk+SRJ1gm87olbfEV9
// SIG // SFdO7iL3jWbjgVi1Qs1iYxBmvh4WhLWr48uouzCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghoNMIIaCQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCDGdeQfreJY6Gp6
// SIG // lqUgVR13MjHXODpjAbWNhzjyDRRAbzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAHihRguA5NhC6s8Rn2vmb9KBVXd5kb/k
// SIG // W4nyuFaeDiSJLSgbrOEyp4rjxNKTwgw8q6HRfsD8T9tr
// SIG // 3FKQLswlS7J2jo2q45KWe9+mUcYSObcrQq83bzT/Zl8b
// SIG // 6IG4O5+E8xkBWdDuaB1jmZ26CfNeigXLo8a9EoIOuRkW
// SIG // Ou1a8dx8S5vPlLBFe55iJsgvpdWxq24vj3rhuyJhBDy0
// SIG // iqIhUcGAfs9XI1xiXP405EUNZIh/2IhwldSJNJlxQncH
// SIG // 7YqgR9uJ/YNfJrRD7orVRWtMmpCyH8OZHnY3BY3oWH0o
// SIG // edjiuQ6q6nKrlKQmNIQa1FHMxZVkkUTy5Um9HXlJqYDR
// SIG // /QihgheXMIIXkwYKKwYBBAGCNwMDATGCF4Mwghd/Bgkq
// SIG // hkiG9w0BBwKgghdwMIIXbAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // XYydvmyxgmvD7W1aUlQGgVko8JLarNQD0FjwBadZOGcC
// SIG // BmcafnlrMRgTMjAyNDExMDUyMTQzMTAuMTk4WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjhEMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR7TCCByAwggUIoAMCAQIC
// SIG // EzMAAAHzxQpDrgPMHTEAAQAAAfMwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjMxMjA2MTg0NjAyWhcNMjUwMzA1MTg0NjAyWjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjhEMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEA/p+m2uErgfYkjuVjIW54KmAG/s9yH8zaWSFkv7IH
// SIG // 14ZS2Jhp7FLaxl9zlXIPvJKyXYsbjVDDu2QDqgmbF1Iz
// SIG // s/M3J9WlA+Q9q9j4c1Sox7Yr1hoBo+MecKlntUKL97zM
// SIG // /Fh7CrH2nSJVo3wTJ1SlaJjsm0O/to3OGn849lyUEEph
// SIG // PY0EaAaIA8JqmWpHmJyMdBJjrrnD6+u+E+v2Gkz4iGJR
// SIG // n/l1druqEBwJDBuesWD0IpIrUI4zVhwA3wamwRGqqaWr
// SIG // LcaUTXOIndktcVUMXEBl45wIHnlW2z2wKBC4W8Ps91Xr
// SIG // UcLhBSUc0+oW1hIL8/SzGD0m4qBy/MPmYlqN8bsN0e3y
// SIG // bKnu6arJ48L54j+7HxNbrX4u5NDUGTKb4jrP/9t/R+ng
// SIG // OiDlbRfMOuoqRO9RGK3EjazhpU5ubqqvrMjtbnWTnijN
// SIG // MWO9vDXBgxap47hT2xBJuvnrWSn7VPY8Swks6lzlTs3a
// SIG // gPDuV2txONY97OzJUxeEOwWK0Jm6caoU737iJWMCNgM3
// SIG // jtzor3HsycAY9hUIE4lR2nLzEA4EgOxOb8rWpNPjCwZt
// SIG // AHFuCD3q/AOIDhg/aEqa5sgLtSesBZAa39ko5/onjauh
// SIG // cdLVo/CKYN7kL3LoN+40mnReqta1BGqDyGo2QhlZPqOc
// SIG // J+q7fnMHSd/URFON2lgsJ9Avl8cCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBTDZBX2pRFRDIwNwKaFMfag6w0KJDAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEA38Qcj/zR/u/b3N5YjuHO51zP
// SIG // 1ChXAJucOtRcUcT8Ql0V5YjY2e7A6jT9A81EwVPbUuQ6
// SIG // pKkUoiFdeY+6vHunpYPP3A9279LFuBqPQDC+JYQOTAYN
// SIG // 8MynYoXydBPxyKnB19dZsLW6U4gtrIAFIe/jmZ2/U8CR
// SIG // O6WxATyUFMcbgokuf69LNkFYqQZov/DBFtniIuJifrxy
// SIG // OQwmgBqKE+ANef+6DY/c8s0QAU1CAjTa0tfSn68hDeXY
// SIG // eZKjhuEIHGvcOi+wi/krrk2YtEmfGauuYitoUPCDADlc
// SIG // XsAqQ+JWS+jQ7FTUsATVzlJbMTgDtxtMDU/nAboPxw+N
// SIG // wexNqHVX7Oh9hGAmcVEta4EXhndrqkMYENsKzLk2+cpD
// SIG // vqnfuJ4Wn//Ujd4HraJrUJ+SM4XwpK2k9Sp2RfEyN8nt
// SIG // Wd6Z3q9Ap/6deR+8DcA5AQImftos/TVBHmC3zBpvbxKw
// SIG // 1QQ0TIxrBPx6qmO0E0k7Q71O/s2cETxo4mGFBV0/lYJH
// SIG // 3R4haSsONl7JtDHy+Wjmt9RcgjNe/6T0yCk0YirAxd+9
// SIG // EsCMGQI1c4g//UIRBQbvaaIxVCzmb87i+YkhCSHKqKVQ
// SIG // MHWzXa6GYthzfJ3w48yWvAjE5EHkn0LEKSq/NzoQZhNz
// SIG // BdrM/IKnt5aHNOQ1vCTb2d9vCabNyyQgC7dK0DyWJzsw
// SIG // ggdxMIIFWaADAgECAhMzAAAAFcXna54Cm0mZAAAAAAAV
// SIG // MA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0
// SIG // aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAx
// SIG // ODIyMjVaFw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7V
// SIG // gtP97pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/H
// SIG // ZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cywBAY6GB9alKD
// SIG // RLemjkZrBxTzxXb1hlDcwUTIcVxRMTegCjhuje3XD9gm
// SIG // U3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36M
// SIG // EBydUv626GIl3GoPz130/o5Tz9bshVZN7928jaTjkY+y
// SIG // OSxRnOlwaQ3KNi1wjjHINSi947SHJMPgyY9+tVSP3PoF
// SIG // VZhtaDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJi
// SIG // ss254o2I5JasAUq7vnGpF1tnYN74kpEeHT39IM9zfUGa
// SIG // RnXNxF803RKJ1v2lIH1+/NmeRd+2ci/bfV+Autuqfjbs
// SIG // Nkz2K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afo
// SIG // mXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9
// SIG // ahhaYQFzymeiXtcodgLiMxhy16cg8ML6EgrXY28MyTZk
// SIG // i1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y
// SIG // 1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV
// SIG // 2xo3xwgVGD94q0W29R6HXtqPnhZyacaue7e3PmriLq0C
// SIG // AwEAAaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEw
// SIG // IwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/
// SIG // LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP05dJlpxtTNRnp
// SIG // cjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdMg30BATBBMD8G
// SIG // CCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL0RvY3MvUmVwb3NpdG9yeS5odG0wEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9
// SIG // lJBb186aGMQwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcN
// SIG // AQELBQADggIBAJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pc
// SIG // FLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27DzHk
// SIG // wo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AF
// SIG // vonoaeC6Ce5732pvvinLbtg/SHUB2RjebYIM9W0jVOR4
// SIG // U3UkV7ndn/OOPcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2
// SIG // EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8Atq
// SIG // gcKBGUIZUnWKNsIdw2FzLixre24/LAl4FOmRsqlb30mj
// SIG // dAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZM
// SIG // cm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQE
// SIG // cb9k+SS+c23Kjgm9swFXSVRk2XPXfx5bRAGOWhmRaw2f
// SIG // pCjcZxkoJLo4S5pu+yFUa2pFEUep8beuyOiJXk+d0tBM
// SIG // drVXVAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L
// SIG // +DvktxW/tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJ
// SIG // C4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU
// SIG // 5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDUDCC
// SIG // AjgCAQEwgfmhgdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9w
// SIG // ZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // Tjo4RDAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAbvoGLNi0YWuaRTu/YNy5H8CkZyiggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOrUzg8wIhgPMjAyNDExMDUxNzAy
// SIG // MDdaGA8yMDI0MTEwNjE3MDIwN1owdzA9BgorBgEEAYRZ
// SIG // CgQBMS8wLTAKAgUA6tTODwIBADAKAgEAAgIPtwIB/zAH
// SIG // AgEAAgITKzAKAgUA6tYfjwIBADA2BgorBgEEAYRZCgQC
// SIG // MSgwJjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQow
// SIG // CAIBAAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQBufNOs
// SIG // uirqsx4l8DPSJ2kqzsageCb9yRdG+xtBakpE9rAxcw7i
// SIG // 7fjlPXpfZW6uKLJzWSYsIm4qCDOzmfLIWgB0UOkc3sgN
// SIG // DGZdfg+tTEM7Lz0gJpzc9I+W9KBcwARTQF64eN0BNsbP
// SIG // 6jYKtbLB2Taxt+YF7phlQzXa8iDTwsF44GcIs5r3PSWd
// SIG // ip0gYn+CL/EALmnIQN5CjK19EDXqesCNF0HmrJmVx5Vq
// SIG // yxhmohMwU3gHCYxUtdlLGS0gXDxsM3Zsj3XGkiwr1x7f
// SIG // xsjlsdeV4L+qUOKM5V7YFnkV2WGJtE4QZA6j7muUyKf/
// SIG // OaNdHjvaBuCADdhhhekI9ZEkKGAnMYIEDTCCBAkCAQEw
// SIG // gZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAHzxQpDrgPMHTEAAQAAAfMwDQYJYIZIAWUDBAIBBQCg
// SIG // ggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAv
// SIG // BgkqhkiG9w0BCQQxIgQgmbwM2sa2sOC6IJtxyZ0VdGxH
// SIG // Wgzbcz52/YcD+N1vexIwgfoGCyqGSIb3DQEJEAIvMYHq
// SIG // MIHnMIHkMIG9BCAYvNk0i7bhuFZKfMAZiZP0/kQIfONb
// SIG // Bv2gzsMYOjti6DCBmDCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAAB88UKQ64DzB0xAAEAAAHz
// SIG // MCIEILcpjYx27t4TggYbzc4bzTNBCLYydUbJ5MvLkTpp
// SIG // 83pPMA0GCSqGSIb3DQEBCwUABIICANtPUu3vePkDm6qB
// SIG // 2kInzZKa8anrviN3DRwh+kEo6ZMi5zJhbl8Q3PANVRK+
// SIG // Dut+slHL3lC7zzv/bD4L0PmdAzNOBIRT8c8TkvEb+YxU
// SIG // AZNGeyw2pwyA+idfRTUyefGkPb7Gfhq+zSc1ZFoNM6CP
// SIG // SXW+eC5QUhrSdLAvr/e7Fg8njVwQrZYx66AisBf3sLfD
// SIG // 7zb7MtILPNeh+S1ImuRIZtqcHOMN0Orwmnb7Ncjtcp1R
// SIG // fFQKzsSF2/JpcV/nemUvLKWX74llzs3KN3ooVeJs3TlU
// SIG // 7679gBcrnmTgrK9DrFcCmDbnA22Yn8OatnMvEIGh5YUl
// SIG // XEhUatMaubq1c75g4UhsOYtNYqTGt2DdPRF94vAhrHga
// SIG // RJxW8SeoMyTif+5714OjLfjerNdQtLcbwDrJ6eqLPuqP
// SIG // aPl52rszjscubwkyvPtOtWvfHrF9aB4nOgJFs//uwjNo
// SIG // sY/8Okr3/ghezwu2s641cg7HCJKaCoBbUrpZaK29iX7P
// SIG // 6fXXFKMuMOeD8LN++jq/UVowpZA9TMzh+E5Rg4GoFnLz
// SIG // 3SwwAsbAy6MzCBPAW2Npxzjx9POrjEkd7VLzhBWg0yCT
// SIG // 3a+3rSA3DFP7P0axJv+gcsZnA3LIfLz+hwiNbcO/aXJ/
// SIG // FqgjBfKZscd4Pmtcm12KS3SWwMQlmmn8b7hTiHd0i6bU
// SIG // uqkpRCsy
// SIG // End signature block
