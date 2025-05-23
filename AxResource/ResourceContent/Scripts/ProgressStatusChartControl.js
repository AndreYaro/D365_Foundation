(function () {
    'use strict';

    var highChartsResources;
    const JmgJavaScriptLoadingFlight = "JmgJavaScriptLoadingFlight";

    if ($dyn.util.isFlightEnabled(JmgJavaScriptLoadingFlight)) {
        highChartsResources = ['resources/Scripts/highcharts-9.3.2.js', 'resources/Scripts/highcharts-more-9.3.2.js', 'resources/Scripts/highcharts-solid-gauge-9.3.2.js', 'resources/Scripts/highcharts-accessibility-9.3.2.js'];
    }
    else {
        highChartsResources = ['/resources/Scripts/highcharts-9.3.2.js', '/resources/Scripts/highcharts-more-9.3.2.js', '/resources/Scripts/highcharts-solid-gauge-9.3.2.js', '/resources/Scripts/highcharts-accessibility-9.3.2.js'];
    }

    var highChartsLoaded = $dyn.observable(false);

    if (window.Highcharts !== undefined) {
        highChartsLoaded(true);
    } else {
        $dyn.util.includeJavaScripts(highChartsResources, 0, highChartsLoaded);
    }

    $dyn.controls.ProgressStatusChartControl = function (props) {
        var self = this;
        self.rootElement = props._element;
        self.chartElement = self.rootElement;

        // Almost all controls 'extend' the Control base class.  This syntax is used to call the contructor for the base class.
        $dyn.ui.Control.apply(this, arguments);

        $dyn.ui.applyDefaults(this, props, $dyn.ui.defaults.ProgressStatusChartControl);

        self.isValidColor = function (strColor) {
            if (!strColor || strColor.length === 0) {
                return false;
            }                

            var s = new Option().style;
            s.color = strColor;
            return s.color !== '';
        };

        self.setColorValue = function (strColor, defaultColor) {
            if (self.isValidColor(strColor)) {
                return strColor;
            }

            return defaultColor;
        };
                
        self.adjustOnRedraw = true;

        self.setLabelFontSize = function (data) {
            var adjustOnRedrawValue = self.adjustOnRedraw;
            self.adjustOnRedraw = false;

            var series = self.chartObject.series[0];
            if (series) {
                series.update({
                    dataLabels: {
                        enabled: true,
                        y: - 2 - (Math.min(self.chartObject.plotHeight, self.chartObject.plotWidth) / 8),
                        style: {
                            fontSize: (Math.min(self.chartObject.plotHeight, self.chartObject.plotWidth) / 100) * 18 + 'px',
                            textOutline: 'none'
                        }
                    }
                });
            }
            
            self.adjustOnRedraw = adjustOnRedrawValue;
        };

        self.labelColor = '';
        self.completedAreaColor = '';
        self.baseColor = '';
        self.progressPercent = 0;

        self.setChartColor = function (data) {
            if ((self.labelColor === data.LabelColor) &&
                (self.completedAreaColor === data.CompletedAreaColor)) {
                return;
            }

            var adjustOnRedrawValue = self.adjustOnRedraw;
            self.adjustOnRedraw = false;

            var series = self.chartObject.series[0];
            if (series) {
                var seriesData = series.data[0];
                if (seriesData) {
                    self.labelColor = data.LabelColor;
                    self.completedAreaColor = data.CompletedAreaColor;

                    seriesData.update({
                        color: data.CompletedAreaColor,
                        dataLabels: {
                            color: data.LabelColor
                        }
                    });
                }            
            }

            self.adjustOnRedraw = adjustOnRedrawValue;
        };

        self.updatePoints = function (data) {
            if (self.progressPercent === data.ProgressPercent) {
                return;
            }

            var adjustOnRedrawValue = self.adjustOnRedraw;
            self.adjustOnRedraw = false;

            var series = self.chartObject.series[0];
            if (series) {
                var point = series.points[0];
                if (point) {
                    self.progressPercent = data.ProgressPercent;
                    point.update(data.ProgressPercent);
                }
            }
            self.adjustOnRedraw = adjustOnRedrawValue;
            self.chartObject.reflow();
        };

        self.isChartLoaded = false;

        self.renderChart = function (data) {
            self.baseColor = data.BaseColor;
            self.progressPercent = 0;
            var themeStyle = $dyn.ui.theme.get();
            self.chartObject = Highcharts.chart(self.chartElement, {
                chart: {
                    type: 'solidgauge',
                    backgroundColor: 'rgba(0,0,0,0)',
                    animation: Highcharts.svg, // don't animate in old IE
                    font: themeStyle.defaultFont,
                    fontSize: themeStyle.smallFontSize,
                    events: {
                        load: function () {
                            // set up the updating of the chart
                            setTimeout(function () {
                                self.setChartColor(data);
                                self.chartObject.reflow();
                                self.setLabelFontSize(data);
                                self.updatePoints(data);
                                self.isChartLoaded = true;
                            }, 1);
                        },
                        redraw: function () {
                            if (self.adjustOnRedraw) {
                                self.setLabelFontSize(data);
                            }

                        }
                    }
                },

                title: null,

                pane: {
                    startAngle: 0,
                    endAngle: 360,
                    background: [{
                        outerRadius: '112%',
                        innerRadius: '72%',
                        borderWidth: 0,
                        backgroundColor: data.BaseColor
                    }]
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    lineWidth: 0,
                    tickPositions: []
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            enabled: true,
                            format: '<span style="font-weight:300; text-shadow: 0 0 0px;"> {y}%</span>',
                            borderWidth: 0,
                            backgroundColor: 'none',
                            crop: true,
                            overflow: 'hidden'
                        },
                        linecap: 'round',
                        stickyTracking: false,
                        rounded: true
                    }
                },
                tooltip: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    name: 'Produced',
                    dataLabels: {
                        enabled: true,
                        style: {
                            font: themeStyle.defaultFont,
                            color: data.LabelColor
                        }
                    },
                    data: [
                        {
                            radius: '112%',
                            innerRadius: '72%',
                            y: 0
                        }]
                }],

                credits: {
                    enabled: false
                }
            });
            
        };

        self.updateChart = function (data) {
            // base color cannot be updated; so if base color needs to be changed, re-initialize the chart
            if (self.chartObject && (self.baseColor === data.BaseColor)) {

                if (self.isChartLoaded) {
                    self.setChartColor(data);
                    self.updatePoints(data);
                }
                else {
                    // Yield to allow the chart to be loaded
                    setTimeout(function () {
                        self.setChartColor(data);
                        self.updatePoints(data);
                    }, 1);
                }
            }
            else {
                self.isChartLoaded = false;
                self.renderChart(data);
            }
        };

        $dyn.observe(highChartsLoaded, function (isLoaded) {
            if (!isLoaded) {
                return;
            }

            var chartObserver = $dyn.computed(function () {
                var themeStyle = $dyn.ui.theme.get();

                return {
                    ProgressPercent: $dyn.value(props.ProgressPercent),
                    BaseColor: self.setColorValue($dyn.value(props.BaseColor), '#242833'),
                    CompletedAreaColor: self.setColorValue($dyn.value(props.CompletedAreaColor), themeStyle.accent),
                    LabelColor: self.setColorValue($dyn.value(props.LabelColor), themeStyle.accent)
                };
            });

            $dyn.observe(chartObserver, function (chartData) {
                self.updateChart(chartData);
            });
        });
    };

    $dyn.controls.ProgressStatusChartControl.prototype = $dyn.extendPrototype($dyn.ui.Control.prototype, {
    });

})();

// SIG // Begin signature block
// SIG // MIIoRAYJKoZIhvcNAQcCoIIoNTCCKDECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // qdNjAPCRft78Fz1gsR1jgtPaIySZkje2xukVejWTcOag
// SIG // gg12MIIF9DCCA9ygAwIBAgITMwAABARsdAb/VysncgAA
// SIG // AAAEBDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI0MDkxMjIwMTExNFoX
// SIG // DTI1MDkxMTIwMTExNFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // tCg32mOdDA6rBBnZSMwxwXegqiDEUFlvQH9Sxww07hY3
// SIG // w7L52tJxLg0mCZjcszQddI6W4NJYb5E9QM319kyyE0l8
// SIG // EvA/pgcxgljDP8E6XIlgVf6W40ms286Cr0azaA1f7vaJ
// SIG // jjNhGsMqOSSSXTZDNnfKs5ENG0bkXeB2q5hrp0qLsm/T
// SIG // WO3oFjeROZVHN2tgETswHR3WKTm6QjnXgGNj+V6rSZJO
// SIG // /WkTqc8NesAo3Up/KjMwgc0e67x9llZLxRyyMWUBE9co
// SIG // T2+pUZqYAUDZ84nR1djnMY3PMDYiA84Gw5JpceeED38O
// SIG // 0cEIvKdX8uG8oQa047+evMfDRr94MG9EWwIDAQABo4IB
// SIG // czCCAW8wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFPIboTWxEw1PmVpZS+AzTDwo
// SIG // oxFOMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDAx
// SIG // Mis1MDI5MjMwHwYDVR0jBBgwFoAUSG5k5VAF04KqFzc3
// SIG // IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBhBggr
// SIG // BgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAMBgNV
// SIG // HRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQCI5g/S
// SIG // KUFb3wdUHob6Qhnu0Hk0JCkO4925gzI8EqhS+K4umnvS
// SIG // BU3acsJ+bJprUiMimA59/5x7WhJ9F9TQYy+aD9AYwMtb
// SIG // KsQ/rst+QflfML+Rq8YTAyT/JdkIy7R/1IJUkyIS6srf
// SIG // G1AKlX8n6YeAjjEb8MI07wobQp1F1wArgl2B1mpTqHND
// SIG // lNqBjfpjySCScWjUHNbIwbDGxiFr93JoEh5AhJqzL+8m
// SIG // onaXj7elfsjzIpPnl8NyH2eXjTojYC9a2c4EiX0571Ko
// SIG // mhENF3RtR25A7/X7+gk6upuE8tyMy4sBkl2MUSF08U+E
// SIG // 2LOVcR8trhYxV1lUi9CdgEU2CxODspdcFwxdT1+G8YNc
// SIG // gzHyjx3BNSI4nOZcdSnStUpGhCXbaOIXfvtOSfQX/UwJ
// SIG // oruhCugvTnub0Wna6CQiturglCOMyIy/6hu5rMFvqk9A
// SIG // ltIJ0fSR5FwljW6PHHDJNbCWrZkaEgIn24M2mG1M/Ppb
// SIG // /iF8uRhbgJi5zWxo2nAdyDBqWvpWxYIoee/3yIWpquVY
// SIG // cYGhJp/1I1sq/nD4gBVrk1SKX7Do2xAMMO+cFETTNSJq
// SIG // fTSSsntTtuBLKRB5mw5qglHKuzapDiiBuD1Zt4QwxA/1
// SIG // kKcyQ5L7uBayG78kxlVNNbyrIOFH3HYmdH0Pv1dIX/Mq
// SIG // 7avQpAfIiLpOWwcbjzCCB3owggVioAMCAQICCmEOkNIA
// SIG // AAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290
// SIG // IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4XDTEx
// SIG // MDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t2G6q
// SIG // ghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7dN2vG
// SIG // EtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55JnOlo
// SIG // XtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJSJhIv
// SIG // 56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64DhkrG5k
// SIG // NXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ97/vj
// SIG // K1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+sYxd
// SIG // 6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4ftKd
// SIG // gCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf8NBS
// SIG // v4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOnqWbs
// SIG // YR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj43Bd
// SIG // D1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8GLhE
// SIG // fEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO3+xb
// SIG // n6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4X7Iv
// SIG // hNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXUpUMv
// SIG // dJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxGoGyY
// SIG // 0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3FQEE
// SIG // AwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVtqMp1
// SIG // ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYDVR0f
// SIG // BFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcBAQRS
// SIG // MFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0MjAx
// SIG // MV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGUMIGR
// SIG // BgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9jcy9w
// SIG // cmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIgHQBM
// SIG // AGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABhAHQA
// SIG // ZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // Z/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQwWVf
// SIG // Liw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZddZYSQ
// SIG // fYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9G6XU
// SIG // tR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKKELuk
// SIG // qQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP80Yr
// SIG // 3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ1h/D
// SIG // Mhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgycSca
// SIG // f7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6CPxNN
// SIG // ZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2l4bf
// SIG // 2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1HxS+
// SIG // YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9WfOX
// SIG // pQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpIlR+r
// SIG // +0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h15q/6
// SIG // /IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BXIqF4
// SIG // ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3ZbCoBI
// SIG // a/15n8G9bW1qyVJzEw16UM0xghomMIIaIgIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCC2jzlLuN4htVnbbSLey7vaeNlfbxmK9Efh
// SIG // AsVOIbxOTzBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAIPrr39r
// SIG // FuBOkHzzhvZgjrrYDrtf6huu9LZzXlBPEyWhD19Ra0b4
// SIG // /jT+0o9+aV85vKVgVGa8QLV7pmddrlRk3ZPeHtrdSVZj
// SIG // Y/1PGkZUhgveG4GOIfM+NA0MOz4GfukgbN5SEOM5K8eg
// SIG // 0Co3SqfgS607KC8yJFsSPJo88k52RvmiD+8zA3OQKJ74
// SIG // +Jf1jWeqFaxEHddZOfbjeRO0bXyo9lHM55T6KZghIxzI
// SIG // t5NZJapzUyv0rjRwKkUMxvHxm9E08GLczBv6N+eDgf2C
// SIG // iKHr+IDwjO+qZd4XtG2YmFekV3CoIeg5dxU9jv3s0sxS
// SIG // 87jPkOZbME6GaqBPHmf4VkQCET+hghewMIIXrAYKKwYB
// SIG // BAGCNwMDATGCF5wwgheYBgkqhkiG9w0BBwKggheJMIIX
// SIG // hQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWgYLKoZIhvcN
// SIG // AQkQAQSgggFJBIIBRTCCAUECAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgGyVmRLPIzLQ7mxz04go7
// SIG // 6Og6e3w6Ga+rdzYITcxUAmcCBmbraXi2mBgTMjAyNDEx
// SIG // MDUyMTQzMDkuMjA4WjAEgAIB9KCB2aSB1jCB0zELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMScwJQYD
// SIG // VQQLEx5uU2hpZWxkIFRTUyBFU046NTcxQS0wNUUwLUQ5
// SIG // NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WgghH+MIIHKDCCBRCgAwIBAgITMwAAAfvL
// SIG // y2w3Z+UwlQABAAAB+zANBgkqhkiG9w0BAQsFADB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0yNDA3MjUx
// SIG // ODMxMTNaFw0yNTEwMjIxODMxMTNaMIHTMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
// SIG // Hm5TaGllbGQgVFNTIEVTTjo1NzFBLTA1RTAtRDk0NzEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKjCVkHlgKuC8L0o2LIz9FL4b5tI9GgDiYjC4NLC
// SIG // 38SqE1wHSg+qDLquaxeaBIjsVfvaMdB/eUPH4aGat8fZ
// SIG // cYLmckziuJdsbXILSQrY10ZZTNm06YzoN+UVKwctHAJa
// SIG // AVPRiQbOywTa3Gx+qwYjr6g0DYnD0WcKtescozInVNSd
// SIG // QCbmrfci5+7Won6A+fG5WBHAb5I+XR9ZWvc1POOkA3jq
// SIG // ETujXKhy7A8fP81SmcT99JlumO0TLKrQfHBgoBsFVbqz
// SIG // p2jS17N9ak0U8lR1/KaTnaEooQl3qnm4CQkcxvMxv3v5
// SIG // NKGgYxRRpfvLhRC8AsoeMCvWefms0832thg+KeoobbJF
// SIG // 7N5Z1tOVCnwyYQAA7er4jnNEZP3PMzoqs4dJSqX/3llG
// SIG // NqP4b3Az2TYC2h78nw6m/AFmirzt+okWUl6oUsPEsSaN
// SIG // EwqbGwo5rcdC6R56m29VBe3KtPZAnH1kwz3DddqW2C6n
// SIG // JNGyCHzym3Ox565DUJLP5km1WU5w8k9zvMxfauAwn1nr
// SIG // Eq9WpMnA3bhsQnSgb4LSYdWMQ6tbJE8HmMeYgFl5weyj
// SIG // MpbN1kGW07m0wiy7fF5/LfrJXCpuQ5L6G7m5h0q4rkwN
// SIG // 8E8iMuBcWpkyptFQ7vZlnbPDLY1EiVcDVVZQV2kN2THF
// SIG // Y4o8laFDVbgWPTHMGHCECutsENtBAgMBAAGjggFJMIIB
// SIG // RTAdBgNVHQ4EFgQUR1UhmFDUN0cDpe9cyALlIyCoNSow
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNVHSUBAf8E
// SIG // DDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMCB4AwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAMM6CCjmNnZ1I31rjIhqM/6L
// SIG // 6HNXvOlcFmmTRXYEZjqELkXuJy3bWTjbUxzZN0o955Mg
// SIG // bM88Um2RENA3bsihxyOT/FfO4xbbRp5UdMDz9thQHm27
// SIG // wG7rZDDFUDBc4VQVolg9FQJ7vcdH44nyygwFVy8KLp+a
// SIG // whasG2rFxXOx/9Az4gvgwZ97VMXn73MVAsrOPgwt7PAm
// SIG // Ke1ll6WfFm/73QYQ5Yh5ge6VnJrAfN7nOPz9hpgCNxzJ
// SIG // DhLu3wmkmKEIaLljq9O5fyjOE53cpSIq5vH9lsF0HBRM
// SIG // 5lLyEjOpbnVMBpVTX00yVKtm0wxHd7ZQyrVfQFGN665x
// SIG // cB08Ca8i7U+CBYb4AXzQ95i9XnkmpCn+8UyCOCcrdeUl
// SIG // 4R3eaCP1xo0oMpICa1gOe6xpwAu67t/2WxTQjCvyY+l/
// SIG // F+C+pgTmGtjRisB+AN+2Bg63nCf6l11lGL3y2Khxn/E4
// SIG // WJddmINa8EiqVi6JQPwdXqgcOE0XL1WNCLzTYubJvv/x
// SIG // yfQMOjSbkf7g0e1+7w14nKVzJUTYBTMgA2/ABSL0D3R6
// SIG // nEaUaK2PmFBpb83icf9oDWMnswKJG6xYQArCdgX8ni8g
// SIG // hKOgLsBB5+ddTyhPHSuCb5Zi0qB4+1RUdzRw5N80ZMdB
// SIG // MZJhfGjnab6CobsAQsaGfyYW80s672e+BlYyiiMreRQN
// SIG // MIIHcTCCBVmgAwIBAgITMwAAABXF52ueAptJmQAAAAAA
// SIG // FTANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2Vy
// SIG // dGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMjEwOTMw
// SIG // MTgyMjI1WhcNMzAwOTMwMTgzMjI1WjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDCCAiIwDQYJKoZIhvcNAQEB
// SIG // BQADggIPADCCAgoCggIBAOThpkzntHIhC3miy9ckeb0O
// SIG // 1YLT/e6cBwfSqWxOdcjKNVf2AX9sSuDivbk+F2Az/1xP
// SIG // x2b3lVNxWuJ+Slr+uDZnhUYjDLWNE893MsAQGOhgfWpS
// SIG // g0S3po5GawcU88V29YZQ3MFEyHFcUTE3oAo4bo3t1w/Y
// SIG // JlN8OWECesSq/XJprx2rrPY2vjUmZNqYO7oaezOtgFt+
// SIG // jBAcnVL+tuhiJdxqD89d9P6OU8/W7IVWTe/dvI2k45GP
// SIG // sjksUZzpcGkNyjYtcI4xyDUoveO0hyTD4MmPfrVUj9z6
// SIG // BVWYbWg7mka97aSueik3rMvrg0XnRm7KMtXAhjBcTyzi
// SIG // YrLNueKNiOSWrAFKu75xqRdbZ2De+JKRHh09/SDPc31B
// SIG // mkZ1zcRfNN0Sidb9pSB9fvzZnkXftnIv231fgLrbqn42
// SIG // 7DZM9ituqBJR6L8FA6PRc6ZNN3SUHDSCD/AQ8rdHGO2n
// SIG // 6Jl8P0zbr17C89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLR
// SIG // vWoYWmEBc8pnol7XKHYC4jMYctenIPDC+hIK12NvDMk2
// SIG // ZItboKaDIV1fMHSRlJTYuVD5C4lh8zYGNRiER9vcG9H9
// SIG // stQcxWv2XFJRXRLbJbqvUAV6bMURHXLvjflSxIUXk8A8
// SIG // FdsaN8cIFRg/eKtFtvUeh17aj54WcmnGrnu3tz5q4i6t
// SIG // AgMBAAGjggHdMIIB2TASBgkrBgEEAYI3FQEEBQIDAQAB
// SIG // MCMGCSsGAQQBgjcVAgQWBBQqp1L+ZMSavoKRPEY1Kc8Q
// SIG // /y8E7jAdBgNVHQ4EFgQUn6cVXQBeYl2D9OXSZacbUzUZ
// SIG // 6XIwXAYDVR0gBFUwUzBRBgwrBgEEAYI3TIN9AQEwQTA/
// SIG // BggrBgEFBQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMG
// SIG // A1UdJQQMMAoGCCsGAQUFBwMIMBkGCSsGAQQBgjcUAgQM
// SIG // HgoAUwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMB
// SIG // Af8EBTADAQH/MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjR
// SIG // PZSQW9fOmhjEMFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6
// SIG // Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1
// SIG // Y3RzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNybDBa
// SIG // BggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMvTWlj
// SIG // Um9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQCdVX38Kq3hLB9nATEkW+Geckv8qW/q
// SIG // XBS2Pk5HZHixBpOXPTEztTnXwnE2P9pkbHzQdTltuw8x
// SIG // 5MKP+2zRoZQYIu7pZmc6U03dmLq2HnjYNi6cqYJWAAOw
// SIG // Bb6J6Gngugnue99qb74py27YP0h1AdkY3m2CDPVtI1Tk
// SIG // eFN1JFe53Z/zjj3G82jfZfakVqr3lbYoVSfQJL1AoL8Z
// SIG // thISEV09J+BAljis9/kpicO8F7BUhUKz/AyeixmJ5/AL
// SIG // aoHCgRlCGVJ1ijbCHcNhcy4sa3tuPywJeBTpkbKpW99J
// SIG // o3QMvOyRgNI95ko+ZjtPu4b6MhrZlvSP9pEB9s7GdP32
// SIG // THJvEKt1MMU0sHrYUP4KWN1APMdUbZ1jdEgssU5HLcEU
// SIG // BHG/ZPkkvnNtyo4JvbMBV0lUZNlz138eW0QBjloZkWsN
// SIG // n6Qo3GcZKCS6OEuabvshVGtqRRFHqfG3rsjoiV5PndLQ
// SIG // THa1V1QJsWkBRH58oWFsc/4Ku+xBZj1p/cvBQUl+fpO+
// SIG // y/g75LcVv7TOPqUxUYS8vwLBgqJ7Fx0ViY1w/ue10Cga
// SIG // iQuPNtq6TPmb/wrpNPgkNWcr4A245oyZ1uEi6vAnQj0l
// SIG // lOZ0dFtq0Z4+7X6gMTN9vMvpe784cETRkPHIqzqKOghi
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCA1kw
// SIG // ggJBAgEBMIIBAaGB2aSB1jCB0zELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMScwJQYDVQQLEx5uU2hp
// SIG // ZWxkIFRTUyBFU046NTcxQS0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wi
// SIG // IwoBATAHBgUrDgMCGgMVAARx5+zQhrrGc9kX1W8rsGMD
// SIG // 8pAVoIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwDQYJKoZIhvcNAQELBQACBQDq1IQLMCIYDzIw
// SIG // MjQxMTA1MTE0NjE5WhgPMjAyNDExMDYxMTQ2MTlaMHcw
// SIG // PQYKKwYBBAGEWQoEATEvMC0wCgIFAOrUhAsCAQAwCgIB
// SIG // AAICHHoCAf8wBwIBAAICE9wwCgIFAOrV1YsCAQAwNgYK
// SIG // KwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgC
// SIG // AQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsF
// SIG // AAOCAQEARlTJJd0aadguxnwoM5LlChJP3G4hU90O2872
// SIG // eTBOzE7rvT+yHKEFM1JCHv1Y0P/gBePzOn/tOpzo3qbA
// SIG // fntj1o6FZe+61bzX4qPsV0F5Br3jTZP9d9oxAgvkNTpD
// SIG // B7PeRIV+Pcpt9tJVYST0JmZLXm1QZoaENi0O1QSDSqIc
// SIG // MVZNDPtVKV9FN6RwcK7NnFqF8SpSjywTKvTueNa1gBDV
// SIG // 2fXjLM5RNlyC48cBpeUjRSzz8vAnSiv7kK3zXZB9sKM4
// SIG // b4tImijQVBQIVX3imJRicCaF2vSU9tXdGb8OsZTRjMZI
// SIG // s/ZGy9Y6zuE5RHAI3IH1SMAO+x+JHeBCYZxaV3dXwTGC
// SIG // BA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAAB+8vLbDdn5TCVAAEAAAH7MA0GCWCG
// SIG // SAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZI
// SIG // hvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEIIRGfh7Ua2Pu
// SIG // upnVkHYwf7M0Zo95dAWtJ7bXNUeVX1DxMIH6BgsqhkiG
// SIG // 9w0BCRACLzGB6jCB5zCB5DCBvQQgOdsCq/yghZVTWIlr
// SIG // Ai7AeKoYxGBD98R6mKg7tUkk5RgwgZgwgYCkfjB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAfvLy2w3
// SIG // Z+UwlQABAAAB+zAiBCAHs6M47lxOb7SlfR1XiVqLVK6o
// SIG // sZgsccjuZSKuIBjbEDANBgkqhkiG9w0BAQsFAASCAgAI
// SIG // 4VBkQdBOHMzat6jzZBh3U2R2GlXQh3r6NTsh3WKI3r2x
// SIG // lptBkJSELAUWX/wIlaMXYD0TqEx70FYlbYaiyv1xhMBV
// SIG // GzQx9BL5nubb4aXrdRTBPU0cAe7No7e+0kR5SFq+GY/X
// SIG // 8iA2kKrlD7HiiVBtQK+hMk3RghiTFLj1D3a82RTjEK15
// SIG // oHcl04kKhWj6rd1LR128jbN530A5awYFuyfRBE7mCc2A
// SIG // ggAM319oRjNduR9MsU+rbmRpE8lU0RB1VlblW10oC7vU
// SIG // KZcAvgchcIl2BtkRbQFYNJDR7qgSE9mwBiWy7Cwo8jCK
// SIG // PgF4Me2h76NB3Yb9lb5lF6b7QAs7QTrZsOuBLfGH5jnB
// SIG // Cq5MMiECUjV9UCip8v4NlxYMAZXvgOE6mkMZVA2k1TkH
// SIG // 34mCWgQirdtWjIJ2De3UJuDvGaP5haa5fsD+KwgVrkO2
// SIG // YBt0atSywGJ1qdDBzZ99svQaBetky5GieyALWUtde8i2
// SIG // OHSK8GHP/CJVtARikNvKS3LV7kSQByyONcE0GiwTScyH
// SIG // 1BWGFkc70fOKTLYE8cbCurkNZEA30QQ+e7HSkizRVEyB
// SIG // CuP+OlVERF0LP3/eUMRH6sXsZ7hgaXeI3JbQTkLySow1
// SIG // 3kQTeet3/MBD0lSCdG6Of2SLEgizrlfIP2dGjxfhvlNI
// SIG // h3NM4V+3NWIDoDJHHVdotg==
// SIG // End signature block
