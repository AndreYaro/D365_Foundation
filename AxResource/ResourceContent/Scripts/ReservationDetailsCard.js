// ---------------------------------------------------------------------
// <copyright file="ReservationDetailsCard.js" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Scripts/jquery-1.7.2.js" />
/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Scripts/Controls/Inputs.js" />

(function () {
    "use strict";

    Globalize.addCultureInfo("en", {
        messages: {
            labelBooked : "Booked",
            labelAssigned: "Assigned",
            labelHard: "Hard",
            labelSoft: "Soft",
        },
    });

    $dyn.controls.ReservationDetailsCardHTM = function (data) {
        $dyn.ui.avChartItem.apply(this, arguments);
    };

    $dyn.controls.ReservationDetailsCardHTM.prototype = $dyn.extendPrototype($dyn.ui.avChartItem.prototype, {
        Capacity: undefined,                        // int. Total capacity available for reservation
        HardBooked: undefined,                      // int. Total hard booked capacity due to reservations
        SoftBooked: undefined,                      // int. Total soft booked capacity due to reservations
        HardAssigned: undefined,
        SoftAssigned: undefined,
        Status: undefined,                          // string. Reservation status
        IsSelected: undefined,                      // boolean. Determines if the chart item is selected
        IsExpanded: undefined,                      // booleam. Determines if the chart item is expanded
        Defaults: {
            isSelected: false,
            isExpanded: false,
            showUtilBar: false,
            showSchedCap: false,
            showSchedDesc: false,
        },

        init: function (data, element) {
            $dyn.ui.avChartItem.prototype.init.apply(this, arguments);

            this.Capacity = $dyn.observable(undefined);
            this.HardBooked = $dyn.observable(undefined);
            this.SoftBooked = $dyn.observable(undefined);
            this.HardAssigned = $dyn.observable(undefined);
            this.SoftAssigned = $dyn.observable(undefined);
            this.Remaining = $dyn.observable(undefined);
            this.CapacityContent = $dyn.observable(undefined);
            this.Status = $dyn.observable(undefined);

            this.IsSelected = $dyn.observable(this.Defaults.isSelected);
            this.IsExpanded = $dyn.observable(this.Defaults.isExpanded);
            this.ShowScheduleCapacity = $dyn.observable(this.Defaults.showSchedCap);
            this.ShowScheduleDescription = $dyn.observable(this.Defaults.showSchedDesc);

            this.HasText = $dyn.computed(function () {
                return $dyn.value(this.ShowScheduleCapacity) || $dyn.value(this.ShowScheduleDescription);
            }.bind(this));

            this.ShowHardBookIndicator = $dyn.computed(function () {
                return $dyn.value(this.HasText) && $dyn.value($dyn.value(this.Status) != 'Available');
            }.bind(this));

            this.HasHardAndSoftbook = $dyn.computed(function () {
                return $dyn.value(this.SoftBooked) && $dyn.value(this.ShowHardBookIndicator);
            }.bind(this));

            if (this.ControlContext && this.ControlContext.Context) {
                var ctx = this.ControlContext.Context;
                this.ShowScheduleCapacity(ctx.showSchedCap);
                this.ShowScheduleDescription(ctx.showSchedDesc);
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

                chartItem.Capacity != undefined && this.Capacity(chartItem.Capacity);
                chartItem.HardBooked != undefined && this.HardBooked(chartItem.HardBooked);
                chartItem.SoftBooked != undefined && this.SoftBooked(chartItem.SoftBooked);
                chartItem.HardAssigned != undefined && this.HardAssigned(chartItem.HardAssigned);
                chartItem.SoftAssigned != undefined && this.SoftAssigned(chartItem.SoftAssigned);
                chartItem.Remaining != undefined && this.Remaining(chartItem.Remaining);
                chartItem.CapacityContent != undefined && this.CapacityContent(chartItem.CapacityContent);
                chartItem.Status != undefined && this.Status(chartItem.Status);

                this.IsSelected(chartItem.IsSelected != undefined ? chartItem.IsSelected : this.Defaults.isSelected);
                chartItem.IsExpanded != undefined && this.IsExpanded(chartItem.IsExpanded);
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
// SIG // MIIoOQYJKoZIhvcNAQcCoIIoKjCCKCYCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // g6xiH/4zq/auglMkHFZ3fffVGwHp1UpK2JVrYt0eBfOg
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
// SIG // ghoMMIIaCAIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBXNREWvGno0jw0
// SIG // ZH+zTfWl1sdJz7hOjrUBUN5CxIJjwzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBACs4XnUKzEKVHJQEOBRZjfSGwX3OUlIn
// SIG // Y/lNwVmvDadmWjwNbv9RhbVfYqzEIPbnqi+9MzlZGgUZ
// SIG // 13ijhT+naSzC/ckb97IYOwie5774J5khdr1N5okzvu9s
// SIG // 6kdlGuut/eVmPbTjD7Ikls9EhMCY+e1hFCsJQyFbdv4M
// SIG // 5KoxmWAkJKuFqYw4wPXE867+RyeVj2Fwr1NogHgJAjkI
// SIG // htPDDoCVWPrsMSkt64ygfpLkWEK/vywi3yutYMO1VM9P
// SIG // V3DoO9fdWJ8QFeISNoo9Z6Kxud0JQoM9NJr6akHZEDS9
// SIG // ikW0LpnoNzNXcfipOWN0WYp9jYrOEtMrkdNnpKbkSXr3
// SIG // jOGhgheWMIIXkgYKKwYBBAGCNwMDATGCF4Iwghd+Bgkq
// SIG // hkiG9w0BBwKgghdvMIIXawIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUQYLKoZIhvcNAQkQAQSgggFABIIBPDCCATgC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // bebciBr0hfWuwMyeeNfM84JYTRxm02X+261DaUJ8oRIC
// SIG // BmcakD+1bhgSMjAyNDExMDUyMTQzMTEuNDhaMASAAgH0
// SIG // oIHRpIHOMIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYD
// SIG // VQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046RTAwMi0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghHtMIIHIDCCBQigAwIBAgIT
// SIG // MwAAAe4F0wIwspqdpwABAAAB7jANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MzEyMDYxODQ1NDRaFw0yNTAzMDUxODQ1NDRaMIHLMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3Nv
// SIG // ZnQgQW1lcmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5u
// SIG // U2hpZWxkIFRTUyBFU046RTAwMi0wNUUwLUQ5NDcxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQC+8byl16KEia8xKS4vVL7REOOR7LzYCLXEtWgeqyOV
// SIG // lrzuEz+AoCa4tBGESjbHTXECeMOwP9TPeKaKalfTU5XS
// SIG // GjpJhpGx59fxMJoTYWPzzD0O2RAlyBmOBBmiLDXRDQJL
// SIG // 1RtuAjvCiLulVQeiPI8V7+HhTR391TbC1beSxwXfdKJq
// SIG // Y1onjDawqDJAmtwsA/gmqXgHwF9fZWcwKSuXiZBTbU5f
// SIG // cm3bhhlRNw5d04Ld15ZWzVl/VDp/iRerGo2Is/0Wwn/a
// SIG // 3eGOdHrvfwIbfk6lVqwbNQE11Oedn2uvRjKWEwerXL70
// SIG // OuDZ8vLzxry0yEdvQ8ky+Vfq8mfEXS907Y7rN/HYX6cC
// SIG // sC2soyXG3OwCtLA7o0/+kKJZuOrD5HUrSz3kfqgDlmWy
// SIG // 67z8ZZPjkiDC1dYW1jN77t5iSl5Wp1HKBp7JU8RiRI+v
// SIG // Y2i1cb5X2REkw3WrNW/jbofXEs9t4bgd+yU8sgKn9MtV
// SIG // nQ65s6QG72M/yaUZG2HMI31tm9mooH29vPBO9jDMOIu0
// SIG // LwzUTkIWflgd/vEWfTNcPWEQj7fsWuSoVuJ3uBqwNmRS
// SIG // pmQDzSfMaIzuys0pvV1jFWqtqwwCcaY/WXsb/axkxB/z
// SIG // CTdHSBUJ8Tm3i4PM9skiunXY+cSqH58jWkpHbbLA3Ofs
// SIG // s7e+JbMjKmTdcjmSkb5oN8qU1wIDAQABo4IBSTCCAUUw
// SIG // HQYDVR0OBBYEFBCIzT8a2dwgnr37xd+2v1/cdqYIMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwFgYDVR0lAQH/BAww
// SIG // CgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQDAgeAMA0GCSqG
// SIG // SIb3DQEBCwUAA4ICAQB3ZyAva2EKOWSVpBnYkzX8f8GZ
// SIG // jaOs577F9o14Anh9lKy6tS34wXoPXEyQp1v1iI7rJzZV
// SIG // G7rpUznay2n9csfn3p6y7kYkHqtSugCGmTiiBkwhFfSB
// SIG // yKPI08MklgvJvKTZb673yGfpFwPjQwZeI6EPj/OAtpYk
// SIG // T7IUXqMki1CRMJKgeY4wURCccIujdWRkoVv4J3q/87KE
// SIG // 0qPQmAR9fqMNxjI3ZClVxA4wiM3tNVlRbF9SgpOnjVo3
// SIG // P/I5p8Jd41hNSVCx/8j3qM7aLSKtDzOEUNs+ZtjhznmZ
// SIG // gUd7/AWHDhwBHdL57TI9h7niZkfOZOXncYsKxG4gryTs
// SIG // hU6G6sAYpbqdME/+/g1uer7VGIHUtLq3W0Anm8lAfS9P
// SIG // qthskZt54JF28CHdsFq/7XVBtFlxL/KgcQylJNnia+an
// SIG // ixUG60yUDt3FMGSJI34xG9NHsz3BpqSWueGtJhQ5ZN0K
// SIG // 8ju0vNVgF+Dv05sirPg0ftSKf9FVECp93o8ogF48jh8C
// SIG // T/B32lz1D6Truk4Ezcw7E1OhtOMf7DHgPMWf6WOdYnf+
// SIG // HaSJx7ZTXCJsW5oOkM0sLitxBpSpGcj2YjnNznCpsEPZ
// SIG // at0h+6d7ulRaWR5RHAUyFFQ9jRa7KWaNGdELTs+nHSlY
// SIG // jYeQpK5QSXjigdKlLQPBlX+9zOoGAJhoZfrpjq4nQDCC
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
// SIG // cGNTTY3ugm2lBRDBcQZqELQdVTNYs6FwZvKhggNQMIIC
// SIG // OAIBATCB+aGB0aSBzjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OkUwMDItMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQCIo6bVNvflFxbUWCDQ3YYKy6O+k6CBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBCwUAAgUA6tTf2DAiGA8yMDI0MTEwNTE4MTgw
// SIG // MFoYDzIwMjQxMTA2MTgxODAwWjB3MD0GCisGAQQBhFkK
// SIG // BAExLzAtMAoCBQDq1N/YAgEAMAoCAQACAiE+AgH/MAcC
// SIG // AQACAhUrMAoCBQDq1jFYAgEAMDYGCisGAQQBhFkKBAIx
// SIG // KDAmMAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAI
// SIG // AgEAAgMBhqAwDQYJKoZIhvcNAQELBQADggEBAFh2i8aG
// SIG // EISbp2i7xxkRkHn9BVGiB3G/ikfgU0sroo9/ZMM7BNdW
// SIG // PmW7hxZhVgliOD+S5Y31RMvMIlKfRdjl3O95s5LtoXBa
// SIG // YIdIejLAwge1COECvZ8g9kGXBqc0C5w6Uka8SxH76mTn
// SIG // JVKLO6cRsyClk6PIkBNwz1nrWwp6wrSkVISOIh8riISt
// SIG // NFycYo7j7u6XThFN4pl+6P6PCcqwA3jbWq/6C0hg3B7j
// SIG // KXtrJPTtgAsymasBLdmfAK54JouKjV/KS4dh4qBcjdoD
// SIG // 76LKRu2B3J21btkGZSMwDC1ct/8e2nWucirt4pbOlz3G
// SIG // iCWlcidHKySovmb8SB+EHWYyKOIxggQNMIIECQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // Ae4F0wIwspqdpwABAAAB7jANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCD9g2MwxhxIuStNFNyrc0GmLG9+
// SIG // 2qGf+0XDulAkdyMjnDCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIE9QdxSVhfq+Vdf+DPs+5EIkBz9oCS/O
// SIG // QflHkVRhfjAhMIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAHuBdMCMLKanacAAQAAAe4w
// SIG // IgQghSZhKLWv4HWnUYyoQMpdm5ZXcxeeenQgOwoxDNLH
// SIG // D8AwDQYJKoZIhvcNAQELBQAEggIAolpMi5BtkG9R6pKb
// SIG // LyN3/Ieu8L5FkmEinh0yceLtQJa/iv8m28qdBjc4AaIP
// SIG // hS/y7XsnzbSaCA1fZQroIw7UEw5S4odlY8piK2UJiVQL
// SIG // YMg5e535uCPRixL790OB4doktyEZ0SF9clmfky0WJbsh
// SIG // no/1Xwa4xZ8+yiQ7PbpkNXGcFSfDLvm8r0hTcQdvoOSb
// SIG // ZLnk/IMYTYc9u//cbQc9oNeKBBTakJy2EnJGwzLBmCWm
// SIG // fm/XS1VkNVdsbe/sFyC3Z8OtZb9Pajh0rV8TLj58Gvy/
// SIG // YKWIKgeDM1Yh2Yxii3HMmoKgKdittVjFbd+kbBup1rd5
// SIG // iGmQkRRImgahlhQ69FvUWPlpLHDc5NCtUXTQrfb8C8Qr
// SIG // V0DWnsejP41tX7m65GUmFM3HUiZxKGcTuusal4gEhTNi
// SIG // S+/eoso3R0wfh68zoPrS12L09WkZAne2lqrq+RUkNcr6
// SIG // BSHrSWFy6onfQmKpKH1sQ1tyY1Wix3SX6oRCh25eeW5N
// SIG // k9IXV0GBv/XIb0aodvokwM02Fag+fk59cPwgduP/b5Sa
// SIG // UlQVzhl4Iocpv3wNDrgTC+YJ7MRZoi9ybB3IiA8/fyhh
// SIG // BF8Y82aN1jj9GIS5tBq7jL8vo3Fp3yJRZxm7a6Nl47Bg
// SIG // Ehf5rdWZXNlcf5IsC81xbkFAHoMWTRe/RTde5UKJwHn9
// SIG // cndb+w0=
// SIG // End signature block
