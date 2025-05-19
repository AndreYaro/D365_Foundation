﻿// ---------------------------------------------------------------------
// <copyright file="ReservationCard.js" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

(function () {
    "use strict";

    Globalize.addCultureInfo("en", {
        messages: {
        },
    });

    $dyn.controls.ReservationCardHTM = function (data) {
        $dyn.ui.avChartItem.apply(this, arguments);
    };

    $dyn.controls.ReservationCardHTM.prototype = $dyn.extendPrototype($dyn.ui.avChartItem.prototype, {
        Capacity: undefined,                        // int. Total capacity available for reservation
        HardBooked: undefined,                      // int. Total hard booked capacity due to reservations
        SoftBooked: undefined,                      // int. Total soft booked capacity due to reservations
        Status: undefined,                          // string. Reservation status
        StatusLabel: undefined,                     // string. Reservation status label
        Defaults: {
            showSchedCap: false,
            showSchedDesc: false,
        },
        IsFocused: undefined,                       // boolean. Determines if the cell in availability view is focused
        HasSoftBook: undefined,                     // boolean. Determines if the resource has softbooked
        IsSelected: undefined,                      // boolean. Determines if the chat item is selected

        init: function (data, element) {
            $dyn.ui.avChartItem.prototype.init.apply(this, arguments);
            var self = this;

            this.Capacity = $dyn.observable(undefined);
            this.HardBooked = $dyn.observable(undefined);
            this.SoftBooked = $dyn.observable(undefined);
            this.Remaining = $dyn.observable(undefined);
            this.CapacityContent = $dyn.observable(undefined);
            this.Status = $dyn.observable(undefined);
            this.StatusLabel = $dyn.observable(undefined);

            this.ShowScheduleCapacity = $dyn.observable(this.Defaults.showSchedCap);
            this.ShowScheduleDescription = $dyn.observable(this.Defaults.showSchedDesc);

            this.HasText = $dyn.computed(function () {
                return $dyn.value(self.ShowScheduleCapacity) || $dyn.value(self.ShowScheduleDescription);
            });

            this.ShowHardBookIndicator = $dyn.computed(function () {
                return $dyn.value($dyn.value(self.Status) != 'Available');
            });

            this.HasSoftBook = $dyn.computed(function () {
                return $dyn.value(self.SoftBooked) > 0;
            });

            this.IsFocused = $dyn.observable(false);

            this.IsSelected = $dyn.observable(false);

            if (this.controlContext) {
                $dyn.observe(this.controlContext.ShowSchedCap, function (show) {
                    self.ShowScheduleCapacity(show);
                });

                $dyn.observe(this.controlContext.ShowSchedDesc, function (show) {
                    self.ShowScheduleDescription(show);
                });
            }

            $dyn.observe(this.DataSource, function (ds) {
                ds && self.refresh(ds);
            });
        },

        gotFocus: function (e) {
            this.IsFocused(true);
        },

        lostFocus: function (e) {
            this.IsFocused(false);
        },

        refresh: function (chartItem) {
            if (chartItem && chartItem.id == this.id) {
                chartItem.Capacity != undefined && this.Capacity(chartItem.Capacity);
                chartItem.HardBooked != undefined && this.HardBooked(chartItem.HardBooked);
                chartItem.SoftBooked != undefined && this.SoftBooked(chartItem.SoftBooked);
                chartItem.Remaining != undefined && this.Remaining(chartItem.Remaining);
                chartItem.CapacityContent != undefined && this.CapacityContent(chartItem.CapacityContent);
                chartItem.Status != undefined && this.Status(chartItem.Status);
                chartItem.StatusLabel != undefined && this.StatusLabel(chartItem.StatusLabel);
            }
        }
    });
})();

// SIG // Begin signature block
// SIG // MIIoNgYJKoZIhvcNAQcCoIIoJzCCKCMCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // V/cRytcrydz0JTLC9Vwgi8cBWXvxSYvJ5gd+W+f42Meg
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
// SIG // ghoJMIIaBQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCWsCsEncVusBXr
// SIG // MymzVPohjewyJ67i32Srs9oe+CAH4TBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBACdr+KwdN3EXQZelHrVmRvbMYOj3uxGj
// SIG // HUUKObnB4MPWduImkU0Av0zoJQHMGXN+BfKVlVtsLU86
// SIG // 5RQBDHs5yryQq2yLjSmiIJBnD9zFcVNMOUQ9BcmP/lNj
// SIG // sp1gJv75tW/AVWaJPze7AfngGakXJ78BTKrGASCA98OS
// SIG // oRe3AgBZqLYPmEAPH2qyZfmoDEjlJWhb8FVO9Anvv3T5
// SIG // bJQ34b9ct8Qs6GsmWrtDcA+kCkAgRNKhKuY0EJ6vSBU5
// SIG // tjMI4iDtHT7vyK0RC/qLWgqqoo73c8mJedFExG/zztYY
// SIG // vyfsyjEAFL5eGmBdkK3k6M/CayCaH43CD6Dww1UEEUFc
// SIG // NR6hgheTMIIXjwYKKwYBBAGCNwMDATGCF38wghd7Bgkq
// SIG // hkiG9w0BBwKgghdsMIIXaAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUQYLKoZIhvcNAQkQAQSgggFABIIBPDCCATgC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // IeWkV6rpeA1s3RLF6rNrN61x9VfVaxDAoNvY0Hd+kJcC
// SIG // BmcajflKnhgSMjAyNDExMDUyMTQzMTAuNzNaMASAAgH0
// SIG // oIHRpIHOMIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYD
// SIG // VQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046RjAwMi0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghHqMIIHIDCCBQigAwIBAgIT
// SIG // MwAAAfI+MtdkrHCRlAABAAAB8jANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MzEyMDYxODQ1NThaFw0yNTAzMDUxODQ1NThaMIHLMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3Nv
// SIG // ZnQgQW1lcmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5u
// SIG // U2hpZWxkIFRTUyBFU046RjAwMi0wNUUwLUQ5NDcxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQC85fPLFwppYgxwYxkSEeYvQBtnYJTtKKj2FKxzHx0f
// SIG // gV6XgIIrmCWmpKl9IOzvOfJ/k6iP0RnoRo5F89Ad29ed
// SIG // zGdlWbCj1Qyx5HUHNY8yu9ElJOmdgeuNvTK4RW4wu9iB
// SIG // 5/z2SeCuYqyX/v8z6Ppv29h1ttNWsSc/KPOeuhzSAXqk
// SIG // A265BSFT5kykxvzB0LxoxS6oWoXWK6wx172NRJRYcINf
// SIG // XDhURvUfD70jioE92rW/OgjcOKxZkfQxLlwaFSrSnGs7
// SIG // XhMrp9TsUgmwsycTEOBdGVmf1HCD7WOaz5EEcQyIS2Bp
// SIG // RYYwsPMbB63uHiJ158qNh1SJXuoL5wGDu/bZUzN+BzcL
// SIG // j96ixC7wJGQMBixWH9d++V8bl10RYdXDZlljRAvS6iFw
// SIG // Nzrahu4DrYb7b8M7vvwhEL0xCOvb7WFMsstscXfkdE5g
// SIG // +NSacphgFfcoftQ5qPD2PNVmrG38DmHDoYhgj9uqPLP7
// SIG // vnoXf7j6+LW8Von158D0Wrmk7CumucQTiHRyepEaVDnn
// SIG // A2GkiJoeh/r3fShL6CHgPoTB7oYU/d6JOncRioDYqqRf
// SIG // V2wlpKVO8b+VYHL8hn11JRFx6p69mL8BRtSZ6dG/GFEV
// SIG // E+fVmgxYfICUrpghyQlETJPITEBS15IsaUuW0GvXlLSo
// SIG // fGf2t5DAoDkuKCbC+3VdPmlYVQIDAQABo4IBSTCCAUUw
// SIG // HQYDVR0OBBYEFJVbhwAm6tAxBM5cH8Bg0+Y64oZ5MB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwFgYDVR0lAQH/BAww
// SIG // CgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQDAgeAMA0GCSqG
// SIG // SIb3DQEBCwUAA4ICAQA9S6eO4HsfB00XpOgPabcN3QZe
// SIG // yipgilcQSDZ8g6VCv9FVHzdSq9XpAsljZSKNWSClhJEz
// SIG // 5Oo3Um/taPnobF+8CkAdkcLQhLdkShfr91kzy9vDPrOm
// SIG // lCA2FQ9jVhFaat2QM33z1p+GCP5tuvirFaUWzUWVDFOp
// SIG // o/O5zDpzoPYtTr0cFg3uXaRLT54UQ3Y4uPYXqn6wunZt
// SIG // UQRMiJMzxpUlvdfWGUtCvnW3eDBikDkix1XE98VcYIz2
// SIG // +5fdcvrHVeUarGXy4LRtwzmwpsCtUh7tR6whCrVYkb6F
// SIG // udBdWM7TVvji7pGgfjesgnASaD/ChLux66PGwaIaF+xL
// SIG // zk0bNxsAj0uhd6QdWr6TT39m/SNZ1/UXU7kzEod0vAY3
// SIG // mIn8X5A4I+9/e1nBNpURJ6YiDKQd5YVgxsuZCWv4Qwb0
// SIG // mXhHIe9CubfSqZjvDawf2I229N3LstDJUSr1vGFB8iQ5
// SIG // W8ZLM5PwT8vtsKEBwHEYmwsuWmsxkimIF5BQbSzg9wz1
// SIG // O6jdWTxGG0OUt1cXWOMJUJzyEH4WSKZHOx53qcAvD9h0
// SIG // U6jEF2fuBjtJ/QDrWbb4urvAfrvqNn9lH7gVPplqNPDI
// SIG // vQ8DkZ3lvbQsYqlz617e76ga7SY0w71+QP165CPdzUY3
// SIG // 6et2Sm4pvspEK8hllq3IYcyX0v897+X9YeecM1Pb1jCC
// SIG // B3EwggVZoAMCAQICEzMAAAAVxedrngKbSZkAAAAAABUw
// SIG // DQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRp
// SIG // ZmljYXRlIEF1dGhvcml0eSAyMDEwMB4XDTIxMDkzMDE4
// SIG // MjIyNVoXDTMwMDkzMDE4MzIyNVowfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDk4aZM57RyIQt5osvXJHm9DtWC
// SIG // 0/3unAcH0qlsTnXIyjVX9gF/bErg4r25PhdgM/9cT8dm
// SIG // 95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLAEBjoYH1qUoNE
// SIG // t6aORmsHFPPFdvWGUNzBRMhxXFExN6AKOG6N7dcP2CZT
// SIG // fDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6GnszrYBbfowQ
// SIG // HJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v3byNpOORj7I5
// SIG // LFGc6XBpDco2LXCOMcg1KL3jtIckw+DJj361VI/c+gVV
// SIG // mG1oO5pGve2krnopN6zL64NF50ZuyjLVwIYwXE8s4mKy
// SIG // zbnijYjklqwBSru+cakXW2dg3viSkR4dPf0gz3N9QZpG
// SIG // dc3EXzTdEonW/aUgfX782Z5F37ZyL9t9X4C626p+Nuw2
// SIG // TPYrbqgSUei/BQOj0XOmTTd0lBw0gg/wEPK3Rxjtp+iZ
// SIG // fD9M269ewvPV2HM9Q07BMzlMjgK8QmguEOqEUUbi0b1q
// SIG // GFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoSCtdjbwzJNmSL
// SIG // W6CmgyFdXzB0kZSU2LlQ+QuJYfM2BjUYhEfb3BvR/bLU
// SIG // HMVr9lxSUV0S2yW6r1AFemzFER1y7435UsSFF5PAPBXb
// SIG // GjfHCBUYP3irRbb1Hode2o+eFnJpxq57t7c+auIurQID
// SIG // AQABo4IB3TCCAdkwEgYJKwYBBAGCNxUBBAUCAwEAATAj
// SIG // BgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6CkTxGNSnPEP8v
// SIG // BO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MFwGA1UdIARVMFMwUQYMKwYBBAGCN0yDfQEBMEEwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5Lmh0bTATBgNV
// SIG // HSUEDDAKBggrBgEFBQcDCDAZBgkrBgEEAYI3FAIEDB4K
// SIG // AFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/
// SIG // BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2U
// SIG // kFvXzpoYxDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYI
// SIG // KwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jv
// SIG // b0NlckF1dF8yMDEwLTA2LTIzLmNydDANBgkqhkiG9w0B
// SIG // AQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvhnnJL/Klv6lwU
// SIG // tj5OR2R4sQaTlz0xM7U518JxNj/aZGx80HU5bbsPMeTC
// SIG // j/ts0aGUGCLu6WZnOlNN3Zi6th542DYunKmCVgADsAW+
// SIG // iehp4LoJ7nvfam++Kctu2D9IdQHZGN5tggz1bSNU5HhT
// SIG // dSRXud2f8449xvNo32X2pFaq95W2KFUn0CS9QKC/GbYS
// SIG // EhFdPSfgQJY4rPf5KYnDvBewVIVCs/wMnosZiefwC2qB
// SIG // woEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU6ZGyqVvfSaN0
// SIG // DLzskYDSPeZKPmY7T7uG+jIa2Zb0j/aRAfbOxnT99kxy
// SIG // bxCrdTDFNLB62FD+CljdQDzHVG2dY3RILLFORy3BFARx
// SIG // v2T5JL5zbcqOCb2zAVdJVGTZc9d/HltEAY5aGZFrDZ+k
// SIG // KNxnGSgkujhLmm77IVRrakURR6nxt67I6IleT53S0Ex2
// SIG // tVdUCbFpAUR+fKFhbHP+CrvsQWY9af3LwUFJfn6Tvsv4
// SIG // O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmNcP7ntdAoGokL
// SIG // jzbaukz5m/8K6TT4JDVnK+ANuOaMmdbhIurwJ0I9JZTm
// SIG // dHRbatGePu1+oDEzfbzL6Xu/OHBE0ZDxyKs6ijoIYn/Z
// SIG // cGNTTY3ugm2lBRDBcQZqELQdVTNYs6FwZvKhggNNMIIC
// SIG // NQIBATCB+aGB0aSBzjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OkYwMDItMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQBri943cFLH2TfQEfB05SLICg74CKCBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBCwUAAgUA6tTdkTAiGA8yMDI0MTEwNTE4MDgx
// SIG // N1oYDzIwMjQxMTA2MTgwODE3WjB0MDoGCisGAQQBhFkK
// SIG // BAExLDAqMAoCBQDq1N2RAgEAMAcCAQACAjEbMAcCAQAC
// SIG // AhO8MAoCBQDq1i8RAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQELBQADggEBAD/cC5B6MqAn
// SIG // iisFbOlEPdhuAQvMPAEKSHgPepjhbbvgFRcFS0vGGVIg
// SIG // AySBpoEcWtnU51FZaVqZc6NSQxsRtX6I+EYTV8bqu1jU
// SIG // ykPftVQaNJNHzb9GDLQv8heWiJ+FtWxdf8cs+4eEckn2
// SIG // 6wUEzX8p84YNQIlE9ggsGLCkJN5A6pCt3HaVkj7TWura
// SIG // sgCBcsGj9wbQiiIwkjUqk5m5HnHCN6zYrKL0dgS5ClOr
// SIG // jGUdxmU165RL9rdsx50bTc3noAttyE8AZP1K1P7kA/wK
// SIG // RW9sZVlKk2L3WCoG+pQXggakExEhm0TQ85u0i6s+KAod
// SIG // j97obqNNJBwFfsjmu6yugqoxggQNMIIECQIBATCBkzB8
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNy
// SIG // b3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAfI+
// SIG // MtdkrHCRlAABAAAB8jANBglghkgBZQMEAgEFAKCCAUow
// SIG // GgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqG
// SIG // SIb3DQEJBDEiBCAnulTeEVQQ/S7AGQTFIB0X/fIdrCmH
// SIG // 0cM3IrELVWESRDCB+gYLKoZIhvcNAQkQAi8xgeowgecw
// SIG // geQwgb0EIPjaPh0uMVJc04+Y4Ru5BUUbHE4suZ6nRHSU
// SIG // u0XXSkNEMIGYMIGApH4wfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTACEzMAAAHyPjLXZKxwkZQAAQAAAfIwIgQg
// SIG // epnXT+V14ZyoSzzFHDcR8jasAToePWzoBzRKPzfwK+sw
// SIG // DQYJKoZIhvcNAQELBQAEggIAWDH/UZ4SLAXqVr06DgQH
// SIG // oHO6Kn8gs01sWKmPF6DZSs4iS3L8teEcSybVbpp1qFG/
// SIG // Lk96hPPkPyUwaZEDGcokaph6fhTUk9u7YtaxbnexfPW9
// SIG // qzcUXgSa3gMQJBOw2Vt4NOsTl3xJCFxV0/B+C0tCwzLk
// SIG // djYlYcHtv8I62yQJ1MQrUupjpSvr+R4XsI8ybaIxH5rY
// SIG // meIzzyljl0yOCW3eZdzA9lEF7Dc6N2XhuXfxMxqjJCEs
// SIG // sn7L1GDu2ajm4FypMbjJDDny6kfIHsa37s25DRPzfHSA
// SIG // 5ubsSZoZnqsZvoKmm5gDCZgR3OsG/r8JFCU9CZqFCtpr
// SIG // wPHayPTYQnw+9klp+K03pqHe5xcb8K0nPvpdhkPpfIeh
// SIG // ABH1uE0K1fM4YgmFKGlzMw8OqtdIDUlzp0oWvVF8IkZw
// SIG // PFsKYJZAxqw4c3ZnwmxLn+fbZmuCvYFNZv0Q3Ck75zVI
// SIG // JnEhQd8NOM9TdCywt5d8+tTp0nKzt/rarKHEoTHHnUpM
// SIG // RAO8X/Yr6cgGZmykRXDpiIzOtukR9FnqlxguW2AGXl7v
// SIG // QFQGe/AFzqdUMyDCKNad5q90Y9kBlHu+0S8flq6jNb24
// SIG // KYhdoMn4DljWsB3JqlGeIYm01gjuD7Fsvy1jA1hgDtiV
// SIG // fofItJcrOsnyre+mKMKVf5PyBD17X5i81v13UmVHq2VFMyI=
// SIG // End signature block
