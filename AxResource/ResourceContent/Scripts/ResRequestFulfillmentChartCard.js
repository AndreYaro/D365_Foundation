// ---------------------------------------------------------------------
// <copyright file="ResRequestFulfillmentChartCard.js" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Scripts/jquery-1.7.2.js" />
/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Scripts/Controls/Inputs.js" />

(function () {
    "use strict";

    Globalize.addCultureInfo("en", {
        messages: {
            FullfilmentCardHours: " hours"
        },
    });

    $dyn.controls.ResRequestFulfillmentChartCardHTM = function (data) {
        $dyn.ui.avChartItem.apply(this, arguments);
    };

    $dyn.controls.ResRequestFulfillmentChartCardHTM.prototype = $dyn.extendPrototype($dyn.ui.avChartItem.prototype, {
        Capacity: undefined,                        // int. Total capacity available for reservation
        HardBooked: undefined,                      // int. Total hard booked capacity due to reservations
        SoftBooked: undefined,                      // int. Total soft booked capacity due to reservations
        TotalBooked: undefined,                     // int. Hardbooked + Softbooked
        Remaining: undefined,                       // int. Total capacity - hardbooked (- softbooked)?
        Status: undefined,                          // string. Reservation status
        IsSelected: undefined,                      // boolean. Determines if the chart item is selected
        IsGeneric:  undefined,                      // boolean. Determines if the chart item represents the generic resource
        IsUnavailable: undefined,
        Defaults: {
            isSelected: false,
            isUnavailable: false,
            showSchedCap: false,
            showSchedDesc: false,
        },

        init: function (data, element) {
            $dyn.ui.avChartItem.prototype.init.apply(this, arguments);

            this.Capacity = $dyn.observable(0);
            this.HardBooked = $dyn.observable(0);
            this.SoftBooked = $dyn.observable(0);
            this.TotalBooked = $dyn.observable(0);
            this.Status = $dyn.observable(undefined);
            this.Remaining = $dyn.observable(0);

            this.IsGeneric = $dyn.observable(undefined);
            this.IsSelected = $dyn.observable(this.Defaults.isSelected);
            this.IsUnavailable = $dyn.observable(this.Defaults.isUnavailable);
            this.ShowScheduleCapacity = $dyn.observable(this.Defaults.showSchedCap);
            this.ShowScheduleDescription = $dyn.observable(this.Defaults.showSchedDesc);
            
            this.HasText = $dyn.computed(function () {
                return $dyn.value(this.ShowScheduleCapacity) || $dyn.value(this.ShowScheduleDescription);
            }.bind(this));

            this.ShowHardBookIndicator = $dyn.computed(function () {
                return ($dyn.value(this.ShowScheduleCapacity) || $dyn.value(this.ShowScheduleDescription))
                    && ($dyn.value(this.HardBooked) && !$dyn.value(this.SoftBooked));
            }.bind(this));
            
            if (this.ControlContext) {
                $dyn.observe(this.ControlContext.ShowSchedCap, function (show) {
                    this.ShowScheduleCapacity(show);
                }.bind(this));

                $dyn.observe(this.ControlContext.ShowSchedDesc, function (show) {
                    this.ShowScheduleDescription(show);
                }.bind(this));
            }

            $dyn.observe(this.DataSource, function (ds) {
                if (ds) {
                    var chartItem = ds;
                    chartItem.id = this.id;
                    this.refresh(chartItem);
                }
            }.bind(this));
        },

        refresh: function (chartItem) {
            if (chartItem && chartItem.id == this.id) {

                chartItem.Capacity != undefined && this.Capacity(chartItem.Capacity / 3600);
                chartItem.HardBooked != undefined && this.HardBooked(chartItem.HardBooked);
                chartItem.SoftBooked != undefined && this.SoftBooked(chartItem.SoftBooked);

                var totalBooked = this.HardBooked() + this.SoftBooked();
                this.TotalBooked(totalBooked / 3600);
                
                if (chartItem.CapacityContent != undefined) {
                    this.Remaining(chartItem.CapacityContent);
                    this.IsUnavailable(chartItem.CapacityContent <= 0);
                }

                chartItem.Status != undefined && this.Status(chartItem.Status);
                chartItem.IsGeneric != undefined && this.IsGeneric(chartItem.IsGeneric);

                if (this.ControlContext && this.ControlContext.selectionMap.chartItems[this.id] != undefined) {
                    chartItem.IsSelected = true;
                }

                this.IsSelected(chartItem.IsSelected != undefined ? chartItem.IsSelected : this.Defaults.isSelected);
            }
        },

        select: function (e) {
            if (this.SelectionType != $dyn.ui.SelectionType.none) {
                var newState = !$dyn.value(this.IsSelected);
                this.IsSelected(newState);

                $dyn.util.raiseEvent(this.element, $dyn.AvailabilityView.events.ChartItemSelectionStateChanged, {
                    chartItem: this,
                    selected: newState,
                });
            }
        },
    });
})();

// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // q/ClTNF2Qn6SzSF/gGKYre2eOdEV0Vj82Mg+0OwuoK2g
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
// SIG // ghoKMIIaBgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCDpK3uXyrgJcpjh
// SIG // og+89RSdkBf2Kyix2Z7Yjt5T5EXIETBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBACu7JG3uzQTZaLGh3/Y6SRxoNk8AQP20
// SIG // 6ur2pBNY+v8vpEPUluyatMfg1SCXj8No3aY6q6Zh23xj
// SIG // NgxK/aGWUM8aCJWL8GXMLlmGevSSvya7J/UwKyKicrcB
// SIG // bsobczhJ/8fSyuKFfiABlocXC8PrwB0SASZdZeLf4rXf
// SIG // 8PcWhTFZli0bxHD0HxYW7UA31+hNzYmMv8EJqSp0qSTn
// SIG // sHKSSW/tEfP5OmNLknP6MXkleClrZjBEWH8+NbLdYvBJ
// SIG // 7MDccxObGvnO9Whi2f39iP3udWJ0oFVT8cOhRfF3TEi2
// SIG // RiR+LqQ/A94CEFQ06pLxCDnGiDsKHGJKTg3qd3nXNEe5
// SIG // gt6hgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // A6ZsEcjWf7DwnxFz712N2bDItnIB//Ze9c3mGjU6OGQC
// SIG // BmcajflKlBgTMjAyNDExMDUyMTQzMTAuMzIzWjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkYwMDIt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAHyPjLXZKxwkZQAAQAAAfIwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjMxMjA2MTg0NTU4WhcNMjUwMzA1MTg0NTU4WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkYwMDItMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAvOXzyxcKaWIMcGMZEhHmL0AbZ2CU7Sio9hSscx8d
// SIG // H4Fel4CCK5glpqSpfSDs7znyf5Ooj9EZ6EaORfPQHdvX
// SIG // ncxnZVmwo9UMseR1BzWPMrvRJSTpnYHrjb0yuEVuMLvY
// SIG // gef89kngrmKsl/7/M+j6b9vYdbbTVrEnPyjznroc0gF6
// SIG // pANuuQUhU+ZMpMb8wdC8aMUuqFqF1iusMde9jUSUWHCD
// SIG // X1w4VEb1Hw+9I4qBPdq1vzoI3DisWZH0MS5cGhUq0pxr
// SIG // O14TK6fU7FIJsLMnExDgXRlZn9Rwg+1jms+RBHEMiEtg
// SIG // aUWGMLDzGwet7h4idefKjYdUiV7qC+cBg7v22VMzfgc3
// SIG // C4/eosQu8CRkDAYsVh/XfvlfG5ddEWHVw2ZZY0QL0uoh
// SIG // cDc62obuA62G+2/DO778IRC9MQjr2+1hTLLLbHF35HRO
// SIG // YPjUmnKYYBX3KH7UOajw9jzVZqxt/A5hw6GIYI/bqjyz
// SIG // +756F3+4+vi1vFaJ9efA9Fq5pOwrprnEE4h0cnqRGlQ5
// SIG // 5wNhpIiaHof6930oS+gh4D6Ewe6GFP3eiTp3EYqA2Kqk
// SIG // X1dsJaSlTvG/lWBy/IZ9dSURceqevZi/AUbUmenRvxhR
// SIG // FRPn1ZoMWHyAlK6YIckJREyTyExAUteSLGlLltBr15S0
// SIG // qHxn9reQwKA5Ligmwvt1XT5pWFUCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBSVW4cAJurQMQTOXB/AYNPmOuKGeTAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAPUunjuB7HwdNF6ToD2m3Dd0G
// SIG // XsoqYIpXEEg2fIOlQr/RVR83UqvV6QLJY2UijVkgpYSR
// SIG // M+TqN1Jv7Wj56GxfvApAHZHC0IS3ZEoX6/dZM8vbwz6z
// SIG // ppQgNhUPY1YRWmrdkDN989afhgj+bbr4qxWlFs1FlQxT
// SIG // qaPzucw6c6D2LU69HBYN7l2kS0+eFEN2OLj2F6p+sLp2
// SIG // bVEETIiTM8aVJb3X1hlLQr51t3gwYpA5IsdVxPfFXGCM
// SIG // 9vuX3XL6x1XlGqxl8uC0bcM5sKbArVIe7UesIQq1WJG+
// SIG // hbnQXVjO01b44u6RoH43rIJwEmg/woS7seujxsGiGhfs
// SIG // S85NGzcbAI9LoXekHVq+k09/Zv0jWdf1F1O5MxKHdLwG
// SIG // N5iJ/F+QOCPvf3tZwTaVESemIgykHeWFYMbLmQlr+EMG
// SIG // 9Jl4RyHvQrm30qmY7w2sH9iNtvTdy7LQyVEq9bxhQfIk
// SIG // OVvGSzOT8E/L7bChAcBxGJsLLlprMZIpiBeQUG0s4PcM
// SIG // 9Tuo3Vk8RhtDlLdXF1jjCVCc8hB+FkimRzsed6nALw/Y
// SIG // dFOoxBdn7gY7Sf0A61m2+Lq7wH676jZ/ZR+4FT6ZajTw
// SIG // yL0PA5Gd5b20LGKpc+te3u+oGu0mNMO9fkD9euQj3c1G
// SIG // N+nrdkpuKb7KRCvIZZatyGHMl9L/Pe/l/WHnnDNT29Yw
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
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDTTCC
// SIG // AjUCAQEwgfmhgdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9w
// SIG // ZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // TjpGMDAyLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAa4veN3BSx9k30BHwdOUiyAoO+AiggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOrU3ZEwIhgPMjAyNDExMDUxODA4
// SIG // MTdaGA8yMDI0MTEwNjE4MDgxN1owdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA6tTdkQIBADAHAgEAAgIxGzAHAgEA
// SIG // AgITvDAKAgUA6tYvEQIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQA/3AuQejKg
// SIG // J4orBWzpRD3YbgELzDwBCkh4D3qY4W274BUXBUtLxhlS
// SIG // IAMkgaaBHFrZ1OdRWWlamXOjUkMbEbV+iPhGE1fG6rtY
// SIG // 1MpD37VUGjSTR82/Rgy0L/IXloifhbVsXX/HLPuHhHJJ
// SIG // 9usFBM1/KfOGDUCJRPYILBiwpCTeQOqQrdx2lZI+01rq
// SIG // 2rIAgXLBo/cG0IoiMJI1KpOZuR5xwjes2Kyi9HYEuQpT
// SIG // q4xlHcZlNeuUS/a3bMedG03N56ALbchPAGT9StT+5AP8
// SIG // CkVvbGVZSpNi91gqBvqUF4IGpBMRIZtE0PObtIurPigK
// SIG // HY/e6G6jTSQcBX7I5rusroKqMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAHy
// SIG // PjLXZKxwkZQAAQAAAfIwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgo/9O7AGdXzin3eiyGQd/T23LilR+
// SIG // gfgOMYxHYlGWegwwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCD42j4dLjFSXNOPmOEbuQVFGxxOLLmep0R0
// SIG // lLtF10pDRDCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAAB8j4y12SscJGUAAEAAAHyMCIE
// SIG // IHqZ10/ldeGcqEs8xRw3EfI2rAE6Hj1s6Ac0Sj838Cvr
// SIG // MA0GCSqGSIb3DQEBCwUABIICAD9ds8TRg+2ZSjOLc8n7
// SIG // VGDqJo84ZrfaoDkGkeONurqRPfdkLMNC/btQqHEUJVb9
// SIG // Hlo6C3HWE4QatA9VLGExl4ueFXn4gr+ygl71maJ+NSLO
// SIG // KMB+tONRsiKbutPPPJM0nsrlFlEKFW3WVswOmxMzBDdp
// SIG // NAMoSs6dY9Gr68kjjEtMzTUDT3sxWVxqhLsk8JYCrbCq
// SIG // 3FhKNEwjSmqND4YCzpMWAZjK+v94y6iB1g9jr5vQsuNn
// SIG // XZwxN6dWvAy2E0Q0hn6e9QWeXTqReXx/R76KDOUZInO3
// SIG // 27vEpVEAg+//npMH4F5aRSWPUQFf8olN9FQaN/G6n0ze
// SIG // kEQP8bCFekROZ2lYDowsWUh/dKStRP/SEhVHGwwoD0pr
// SIG // Z3YcL7iKIFsjgEYXastxf8ZaMynJqCo7O3D1M7+uOCCU
// SIG // Q4Xuv3osgmO71YxitUL+T/zT836rFozZ6NAUFKNZ3OAT
// SIG // GtGmox0GG2Jzt5sn7cY6e4j2VDd3uHRtpoMW9yy3WAOA
// SIG // N12fAShle4ieJQPYcFInu2x/EOeGDUFiGEZKiDqkDlLr
// SIG // JX2gb7kjZ0adbf1dlBQ1xtcEUa6a//SeBDOeY8HdEas9
// SIG // Je2Yib7zI4i8SDerq9S0SZBauz48fDyH3wS0v/qkuwh7
// SIG // uQsONaxz+S8HWnXWExr3fgFycnvejqvKaI6i6Rr3ezyE
// SIG // BRZZ
// SIG // End signature block
