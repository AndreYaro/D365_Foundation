// ---------------------------------------------------------------------
// <copyright file="ActivityReservationCard.js" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Scripts/jquery-1.7.2.js" />
/// <reference path="https://usnconeboxax1aos.cloud.onebox.dynamics.com/Scripts/Controls/Inputs.js" />

(function () {
    "use strict";

    Globalize.addCultureInfo("en", {
        messages: {
        },
    });

    $dyn.controls.ActivityReservationCard = function (data) {
        $dyn.ui.avChartItem.apply(this, arguments);
    };

    $dyn.controls.ActivityReservationCard.prototype = $dyn.extendPrototype($dyn.ui.avChartItem.prototype, {
        Capacity: undefined,                        // int. Total capacity available for reservation
        HardBooked: undefined,                      // int. Total hard booked capacity due to reservations
        SoftBooked: undefined,                      // int. Total soft booked capacity due to reservations
        Status: undefined,                          // string. Reservation status
        IsSelected: undefined,                      // boolean. Determines if the chart item is selected
        IsExpanded: undefined,                      // booleam. Determines if the chart item is expanded
        Defaults: {
            isSelected: false,
            isExpanded: false,
            showSchedCap: false,
            showSchedDesc: false,
        },

        init: function (data, element) {
            $dyn.ui.avChartItem.prototype.init.apply(this, arguments);
            var self = this;

            this.Capacity = $dyn.observable(undefined);
            this.HardBooked = $dyn.observable(undefined);
            this.SoftBooked = $dyn.observable(undefined);
            this.Status = $dyn.observable(undefined);

            this.IsSelected = $dyn.observable(this.Defaults.isSelected);
            this.IsExpanded = $dyn.observable(this.Defaults.isExpanded);
            this.ShowScheduleCapacity = $dyn.observable(this.Defaults.showSchedCap);
            this.ShowScheduleDescription = $dyn.observable(this.Defaults.showSchedDesc);

            this.HasText = $dyn.computed(function () {
                return $dyn.value(self.ShowScheduleCapacity) || $dyn.value(self.ShowScheduleDescription);
            });

            this.ShowHardBookIndicator = $dyn.computed(function () {
                return $dyn.value(self.HasText) && $dyn.value($dyn.value(self.Status) != 'Available');
            });

            this.HasHardAndSoftbook = $dyn.computed(function () {
                return $dyn.value(self.SoftBooked) && $dyn.value(self.ShowHardBookIndicator);
            });

            this.HardBookedContent = $dyn.computed(function () {
                return $dyn.format("{0} {1}", Globalize.format($dyn.value(self.HardBooked), 'n2'), "hardbooked");
            });

            this.SoftBookedContent = $dyn.computed(function () {
                return $dyn.format("{0} {1}", Globalize.format($dyn.value(self.SoftBooked), 'n2'), "softbooked");
            });

            if (this.ControlContext) {
                $dyn.observe(this.ControlContext.ShowSchedCap, function (show) {
                    self.ShowScheduleCapacity(show);
                });

                $dyn.observe(this.ControlContext.ShowSchedDesc, function (show) {
                    self.ShowScheduleDescription(show);
                });
            }

            $dyn.observe(this.DataSource, function (ds) {
                ds && self.refresh(ds);
            });
        },

        refresh: function (chartItem) {
            if (chartItem && chartItem.id == this.id) {

                chartItem.Capacity != undefined && this.Capacity(chartItem.Capacity);
                chartItem.HardBooked != undefined && this.HardBooked(chartItem.HardBooked);
                chartItem.SoftBooked != undefined && this.SoftBooked(chartItem.SoftBooked);
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
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // SxvxA/m9/IZsxfy7le/6mhjKrXNtLZHqdcflER9QE8ug
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCC2pguZiw73g+tI
// SIG // FGzX6Ag2rt9NDxkxfkKzISB1cunBtjBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAHBIEfX9Mvnf9nHL6wgDylhW0pm13aNe
// SIG // PN3flesbNwL4m0Ce/jRW8Pxv3L2dypQp2BuEBByHVyeB
// SIG // 9Wxfmg1gu6NmIuaEH+EO+eARZfrjjTOMtnW3MSLZeaUh
// SIG // 1wED9dtXl1wzpyrSqnJ9ohch4eNgyXyzlajvPBIowPhI
// SIG // z/mflKbHDaY/+TTqVNOvBD2xUPkaUkXYSXkFEKn44dhH
// SIG // CpnbV5QuvPkGdwEw7/D05FhAWqbtTfqA7ipGwgUSG+An
// SIG // 6PziTQLA42vofbMK5ahdWV/hRzdbV9qkCRfqDfdS3Z/T
// SIG // kWD7/ddFWPOfKz4EN2uy363x/PNTcJE8pVSQvr+8ZDf6
// SIG // BvyhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // xSyuWmD6zbsfLTxRM71AQZ1fwkOK72JbhgX7fhprddcC
// SIG // BmcahDnQQBgTMjAyNDExMDUyMTQzMTAuNTIxWjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjdGMDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAHwKnwdWTvmH60AAQAAAfAwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjMxMjA2MTg0NTUxWhcNMjUwMzA1MTg0NTUxWjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjdGMDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAtR4tU6M4dztHMxPMX0Z68ppSTQmhlqJpj8tHiDX/
// SIG // uBCa+63/LUs5YBPCJeGY+PE+X00zgIepyE0X9pSu/rqX
// SIG // J2f8YNACqA2KQUDlqy/TmxUocpSB36/w0OD7EV/BkbSJ
// SIG // 7ibDJMEoOt23weENlIpDBD/wrWR4vMVuV7QCqfeXLN5r
// SIG // 1AjLyAAPNya/1MgAwAiV1VOJmmIrHM1M+ydddXg9Sqxv
// SIG // ZkPiE4J0Uf19sUwzAs/oqPGWRRxsBGYPnN75j6fO5uDq
// SIG // jilsoXKjFLqT73jv4EAvUb+LMyzRg2qHj3iuiFNCanBo
// SIG // 16sW3BKEv7NYQoD3e1MemFnlq1F2sW2/iaLIDms1IFBr
// SIG // NWqqZy489GCn1Kp/IuU25kdXahJUeEAPjmX3lYaU6J6z
// SIG // OLBPzJSdSS6UdhcACB1HjH6LVzUIsrWH0QVDiRxXiWBH
// SIG // 5WYFZNF8f+JGQXc4BUDzln1XdjaM15QtnqRrVI2pbgNq
// SIG // LDr0B2cxjqCk71lD1/fTLLBjmztMSR3dA8oD/yQFafm0
// SIG // RiamtruwKi5tvrQE9usiOb3nHA5jWbIN7w4dR3KQiWvU
// SIG // KUVvzA92vgBdsoFdbEZxlVFRt1Tg19wYRk/EzFPxolMt
// SIG // 4ewpVzsZmfsHgriDswpEw2yuTpQEvKkj6YKflxpTixD2
// SIG // jN9TIH+mE6aQGnj9KKYcd+OaIbcCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBTQgrKnV0cvzJo2RlUwL8e2BVqbJTAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAOCL0m56+IxD4KOVuMY9//tHQ
// SIG // hsLM/Ot0BmdpgfWeEsLRhizL8H7EVLNzSJTw/y7FgMXV
// SIG // WB5JQM8C08EOTPj0Xcvdgxn7chDhjB37rexqvC90VHL6
// SIG // 769AC/zTbXxKWwBJAhc7HnsbWObN4c49619sL6AWZtsr
// SIG // YcHC3mZjIB0Apo2af9tHx1iYK4z2I7HukQybVE5b1LI6
// SIG // /vO/P7fr60BCKpZnmwnhIvlUFcXO8BdC7jE8P4AlnXKh
// SIG // 6Ki+diaLcSs2PI2UkO3HDR4QuHhxhUaWinokkNBl7ZWx
// SIG // iGz+JFtTtyc5So38ButjQkr35jNYjw/dF2IhZu//JoEd
// SIG // egJqnnw7H4wQlsH96oXiDH4Gc1qnhM/JWhZjPA3ZF47j
// SIG // gkBP9i9E8Ya41LXTJAE313WY2EZbHAQ8q/MxjJaaxQuy
// SIG // 3Magl5YcYbXdgjPpqXE3PEQdg9xKK9FHaD9+kPa+F1gl
// SIG // Vf9ip9AF7b1sbyH8jhZuWi5dHhM5IX7/15lJQXjghJUu
// SIG // 43XXVqQZUIybhx1B4zlRl5ayU+1+IYnBdaNt8eVPo+6j
// SIG // ygXHq8j9v9aMX5h3OrgV5VwSrpFf0AmQVQIgTGCYZ5LW
// SIG // pFh6aPbiHkp2E+kMe8H9kWrmByBEfEi0Zm5TMzzrPiR0
// SIG // M674e8Urcd9dCzqftA2jl7PMY2b4aZ/lrmYo+UZmYoww
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
// SIG // Tjo3RjAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAwigGSir+ZbHQtsqDBimIkMu/af+ggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOrU088wIhgPMjAyNDExMDUxNzI2
// SIG // MzlaGA8yMDI0MTEwNjE3MjYzOVowdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA6tTTzwIBADAHAgEAAgIiuDAHAgEA
// SIG // AgIUQDAKAgUA6tYlTwIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQB9rFBhQjKe
// SIG // SQfG4872v5YLWhZ9Rn7xTbQfPoDN1Q6stwgtXFm8rxRY
// SIG // n2tJgmKnbQMCMFePuZFdiGOJv/2y9W9ImlPjnKIzNuF8
// SIG // jMdO8KuvYptw9TCHZQ8rLAiF6O7ixT6FXcbUv56x458r
// SIG // yBSlw7mVxtP39Rtwt3x/MUAj56rzhM/vhihuOrn+kjED
// SIG // lDB4+P2iKK9iAZZ6KDWPkeXBc74HchVVP8WnTZ7mDi4A
// SIG // XevcqW/Wgu9o8AwNui9H/WWQRgVWzUI64JwB0r9y2Kvj
// SIG // VZbp6+/OuQNph/5qLHJFTU2XmYJd8qK+qQmpl6u2IucE
// SIG // VNVijIh7Gx9F70/ssO7N9u8MMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAHw
// SIG // KnwdWTvmH60AAQAAAfAwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQgiHFPRf6JGIn0brh0J+QzgTUNztE1
// SIG // 0VukXzgJvMShL/UwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCBcAZqjpXL95FO5gAebFke+EBQIkupm/gjO
// SIG // mrJxQGVLizCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAAB8Cp8HVk75h+tAAEAAAHwMCIE
// SIG // IKfFz3TU+Suf03S3bhaeNmCRoFZKqjTMZkQwmt0FCYtR
// SIG // MA0GCSqGSIb3DQEBCwUABIICAKb8GB0MoYAFxopkbdb7
// SIG // pUkKRZWBz19k9iyB0ngTerB0r9SdE+KgJ6rlbfTNXlA3
// SIG // fakAwTu3ijCU3XNhnOO13fKR1cyWKKje+V93p9CtfDp7
// SIG // RcYNEnTcixvEZicLSijpKy6TJKoednvivORvWh+y8RxJ
// SIG // g/njXdN+BoLcBUjRfudluH0E9g5us2RHbQfRERGf3mYO
// SIG // GhSkuYm1rZyRw7IzMWKz3NdvoTEUjADs5BkaAByezSoz
// SIG // IZiCvm9RM/vfZWRpSJ7zH1745HGhpDBxwW6FnQVUtzS2
// SIG // L4Lv+//uZguaTMzbFVW8EiSjBbyfQoHbA61dk6v1xdIj
// SIG // Z8HQR7BP6im2E/voF6IMsJOprcfBhxfIr7cyK4WCPaQa
// SIG // 5Lntt2DfTxb2vQlbz5c7iiQOU/fqrBxR6BVYEGz2jKIq
// SIG // UF3fRPEsRDMaE9i/keHdPbrnkt+fWc2ReA18k0NsC7x+
// SIG // F4+fd9D1eEbp4nzWzdpk9u/1yUIhhqmn7dKFCrEZVbdS
// SIG // UnIXt0Tlpk8UDkODWRYAUI5KKbuYupUgHO5t+HGEpbuK
// SIG // stDsy9cm3YElvguQM1y9mptk/GcUBtCkLWPYgHHL5qOn
// SIG // fGv5W9+i8r2HoUqVzjGLTCvsBTYMALDk9WfaP9UKkioY
// SIG // zk+eNc/yDqGyBVKigtwh2L2TPlkndNgFVRf7nnrEJE1n
// SIG // R+hi
// SIG // End signature block
