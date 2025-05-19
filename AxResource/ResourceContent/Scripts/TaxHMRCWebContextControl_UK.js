// ---------------------------------------------------------------------
// <copyright file="TaxHMRCWebContextControl_UK.js" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

(function () {
    'use strict';

    const CookieNameDeviceID = 'Gov-Client-Device-ID';

    function setCookie(cookieName, cookieValue, expiresInDays) {
        var date = new Date();
        date.setTime(date.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + date.toUTCString();
        document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
    }

    function getCookie(cname) {
        var ret = '';
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                ret = c.substring(name.length, c.length);
                break;
            }
        }
        return ret;
    }

    function finishJSExecution(context) {
        $dyn.async(function () {
            $dyn.callFunction(context.setWebContext, context, { _context: JSON.stringify(context._context) });
        });
    }

    function setContextTimezone(context) {
        var timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1].replace('GMT', 'UTC');
        timezone = timezone.slice(0, 6) + ':' + timezone.slice(6, 8);
        context.timezone = timezone;
    }

    function getDateTimeNowFormatted() {
        var dateTimeFormatted = new Date().toISOString();
        return dateTimeFormatted;
    }

    function setContextScreen(context) {
        context.screenWidth = window.screen.width;
        context.screenHeight = window.screen.height;
        context.devicePixelRatio = window.devicePixelRatio;
        context.screenColorDepth = window.screen.colorDepth;
    }

    function setContextWindowSize(context) {
        context.innerWidth = window.innerWidth;
        context.innerHeight = window.innerHeight;
    }

    function setContextPlugins(context) {
        var plugins = '';
        if (navigator.plugins.length) {
            plugins += encodeURIComponent(navigator.plugins[0].name);
            for (var i = 1; i < navigator.plugins.length; i++) {
                plugins += ',' + encodeURIComponent(navigator.plugins[i].name);
            }
        }
        context.plugins = plugins;
    }

    function setContextUserAgent(context) {
        context.userAgent = navigator.userAgent;
    }

    function setContextDoNotTrack(context) {
        var doNotTrackValue;
        if (window.doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || 'msTrackingProtectionEnabled' in window.external) {
            // The browser supports Do Not Track
            if (window.doNotTrack === '1' || navigator.doNotTrack === 'yes' || navigator.doNotTrack === '1' || navigator.msDoNotTrack === '1' || window.external.msTrackingProtectionEnabled()) {
                doNotTrackValue = 'true';
            } else {
                doNotTrackValue = 'false';
            }
        } else {
            // Do Not Track is not supported
            doNotTrackValue = '';
        }
        context.doNotTrack = doNotTrackValue;
    }

    function setContextClientPublicIP(context, webResources) {
        setWebResponseByTemplate(context, webResources);
    }

    function setContextClientLocalIP(context) {
        setContextIPByWebRTC(context, "", "", true);
    }

    function setContextIPByWebRTC(context, stunServer, regex, isLocal) {
        if (!isLocal && !stunServer) return;

        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

        var server = "stun:" + stunServer;

        var iceServers = isLocal ? [] : [{ urls: server }];

        var pc = new RTCPeerConnection({ iceServers: iceServers });

        pc.onicecandidate = function (ice) {
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;

            if (isLocal) {
                if (!context.localIPs) {
                    context.localIPs = ice.candidate.address;
                } else {
                    context.localIPs += ',' + ice.candidate.address;
                }
            }

            if (!isLocal) {
                if (!context.publicIP) {
                    var resp_regex = regex ? new RegExp(regex) : /([0-9]{1,3}(\.[0-9]{1,3}){3})|(([0-9A-Fa-f]{0,4}:){2,7}([0-9A-Fa-f]{1,4}))/;
                    var respFmt = resp_regex.exec(ice.candidate.address);
                    if (respFmt) {
                        context.publicIP = respFmt[1];
                        pc.onicecandidate = null;
                    }
                }
            }
        };
        pc.createDataChannel("");
        pc.createOffer().then(function (offer) {
            pc.setLocalDescription(offer);
        });
    }

    function setWebResponseByTemplate(context, webResources) {
        if (webResources) {
            for (var i = 0; i < webResources.length; i++) {
                var webService = webResources[i];
                var url = webService.url;
                if (url.toLowerCase().startsWith("https://")) {
                    setContextByHttpsRequest(context, url, webService.regex);
                } else {
                    setContextIPByWebRTC(context, url, webService.regex, false);
                }
            }
        }
    }

    function setContextByHttpsRequest(context, url, regex) {
        if (url.toLowerCase().startsWith("https://")) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.timeout = 1000;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    var status = xhr.status;
                    if (status === 200) {
                        if (xhr.responseText) {
                            if (!context.publicIP) {
                                var resp_regex = regex ? new RegExp(regex) : /([0-9]{1,3}(\.[0-9]{1,3}){3})|(([0-9A-Fa-f]{0,4}:){2,7}([0-9A-Fa-f]{1,4}))/;
                                var respFmt = resp_regex.exec(xhr.responseText);
                                if (respFmt) {
                                    context.publicIP = respFmt[0];
                                }
                            }
                        }
                    }
                }
            };
            xhr.send(null);
        }
    }

    $dyn.controls.TaxHMRCWebContextControl_UK = function (data, element) {
        var self = this;
        $dyn.ui.Control.apply(this, arguments);

        self._context = {
            deviceID: '',
            timezone: '',
            screenWidth: '',
            screenHeight: '',
            devicePixelRatio: '',
            screenColorDepth: '',
            innerWidth: '',
            innerHeight: '',
            plugins: '',
            userAgent: '',
            doNotTrack: '',
            localIPs: '',
            localIPsTimestamp: '',
            publicIP: '',
            publicIPTimestamp: '',
        };

        setContextTimezone(self._context);
        setContextScreen(self._context);
        setContextWindowSize(self._context);
        setContextPlugins(self._context);
        setContextUserAgent(self._context);
        setContextDoNotTrack(self._context);

        var webResources = '';
        if ($dyn.value(data.WebResourcesJSON)) {
            webResources = JSON.parse($dyn.value(data.WebResourcesJSON));
        }

        setContextClientLocalIP(self._context);
        self._context.localIPsTimestamp = getDateTimeNowFormatted();

        var clientPublicIPWebResources = webResources["Gov-Client-Public-IP"] ? webResources["Gov-Client-Public-IP"] : [];
        setContextClientPublicIP(self._context, clientPublicIPWebResources);
        self._context.publicIPTimestamp = getDateTimeNowFormatted();

        var deviceID = getCookie(CookieNameDeviceID);
        var commandCallback = function (context) {
            return function (value) {
                var deviceIDtmp = value.toString().replace(/[^0-9a-f-]/gi, '');
                if (deviceIDtmp !== '' && deviceIDtmp !== null) {
                    setCookie(CookieNameDeviceID, deviceIDtmp, 180);
                }
                context._context.deviceID = getCookie(CookieNameDeviceID);
                finishJSExecution(context);
            }
        }

        setTimeout(function () {
            if (deviceID === '') {
                $dyn.async(function () {
                    $dyn.callFunction(self.getGuid, self, [], commandCallback(self));
                });
            }
            else {
                self._context.deviceID = deviceID;
                finishJSExecution(self);
            }
        }, 2000);
    };

    $dyn.controls.TaxHMRCWebContextControl_UK.prototype = $dyn.extendPrototype($dyn.ui.Control.prototype, {
    });

})();

// SIG // Begin signature block
// SIG // MIIoQQYJKoZIhvcNAQcCoIIoMjCCKC4CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 0ghyRPR36w2dYxKd7nQyBQbi96zTH3b4J0Z2MzVJaQOg
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
// SIG // a/15n8G9bW1qyVJzEw16UM0xghojMIIaHwIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCBI0oA0tZhct4MLP4S4KCnzOcTQBBXvUzTB
// SIG // tzYaoZkR8jBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAAEWkvg1
// SIG // IE7JgaYTQBXEiD9xRwbpJHPPg8UVDYtJOnBs5/Mkbgex
// SIG // ffkHn7WjZZD75y40AskAawzt/7vLuGUBfXgczthbDlns
// SIG // kdlLbiYHYKT1iH9Z5Lg21Xen5OUnlB4vM6q5aPLH8s1R
// SIG // 2DSTGtG/TrhEjaw76syMkYJYsgKU80fk7KHSt3l9CMzg
// SIG // ZfWCI1HWVKKAmmC0HZ8uDnT4SjCsIhQoDapEWPb7AY8d
// SIG // +y6DlL2WvBX/LOYc3+Kf6Yd7lFE94AlOY1n11krxMTNE
// SIG // IdK55QDWr8BuE4K+9RKh6G2afFW5thRVaYmoHi4nNOc+
// SIG // X7jMLE5mZGWpX1IbAtrknss26IGhghetMIIXqQYKKwYB
// SIG // BAGCNwMDATGCF5kwgheVBgkqhkiG9w0BBwKggheGMIIX
// SIG // ggIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWgYLKoZIhvcN
// SIG // AQkQAQSgggFJBIIBRTCCAUECAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgoAb4tpCnM4NbHj8Fzf8T
// SIG // n3v/iMI14x2MT+x9C5Zl3jICBmbrIphMexgTMjAyNDEx
// SIG // MDUyMTQzMDkuMjY5WjAEgAIB9KCB2aSB1jCB0zELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMScwJQYD
// SIG // VQQLEx5uU2hpZWxkIFRTUyBFU046MzYwNS0wNUUwLUQ5
// SIG // NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WgghH7MIIHKDCCBRCgAwIBAgITMwAAAfdY
// SIG // IHUEyvvC9AABAAAB9zANBgkqhkiG9w0BAQsFADB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0yNDA3MjUx
// SIG // ODMxMDZaFw0yNTEwMjIxODMxMDZaMIHTMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
// SIG // Hm5TaGllbGQgVFNTIEVTTjozNjA1LTA1RTAtRDk0NzEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBANDnR0wTaJuv7lymhCj/azyE5E+kMRddbY8wdDZN
// SIG // W8g6T6xUx4Wt4ccEnU3K/GNGt5OhEJcKsukTs+NntEeX
// SIG // g1vnQqEGqYqQyBVDmKd6DbqsF/8XqQExJGNezMlxceq0
// SIG // FtjXFlCVt0KNgLidBzrW5UqSLUGTxph5xqpLfwweORcM
// SIG // ZOlaEr8TXECoShE5Ls67fFOg0XHEJtRXYZjyoA84HHwz
// SIG // zOaPhp824jLustOvQOBB5izJpHnEpFbwZnGfFZ8xR0w5
// SIG // Bi3aZw1eRV41TmwIG0jNHJ6mEhn0ae1RhwUasqLHL0eG
// SIG // 3EPglfaQ42yekua2Z9bgPIUYY9PR7N9x0Xr7eKFgFWBi
// SIG // LYBLBvgawmG6YFjAxCFZwID2RIjwGiPMARnphOH3hJLs
// SIG // +0wMIJEQXFMy4EOLrz6kQ9QPiZLduvqQ6lmEp9DAPI9M
// SIG // 2nEJPavwL3Ij1w/SLdns/pqhM4BUUbCRi7XH/R5LLyvC
// SIG // bHeiOcxUoZaouW6c39WODTojToeUMFtaSLwOYq5Wpe6h
// SIG // YZAHnnmapqKfPrjcWV8RQkBt0d7OaV1vPRYgofa5l61a
// SIG // jgsIHFxSCUAEJJZSrCPlCahqva5kQASc+ZRykxWJhcHD
// SIG // Odillozcd8+qHcM9ofrMWsXsE6HvRqrQ8d/2lPsqjUXA
// SIG // fMNLUl1H/spTeLpOcRxKS6cfmTTbAgMBAAGjggFJMIIB
// SIG // RTAdBgNVHQ4EFgQU30akMz95vT2Vri39afP5nhX5Jpgw
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNVHSUBAf8E
// SIG // DDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMCB4AwDQYJ
// SIG // KoZIhvcNAQELBQADggIBADdGo2nyC3i+kkCDCDAFzNUH
// SIG // esWqHItpjq6UfLylssk7C92/NwO1xi4gG0MU66p171Vl
// SIG // njbLeWEA/LGjvlE4DiyXU3X1AA4S16CvkZcI353YpiCU
// SIG // /TB/bVGFy8yVyoWTNPaLj8DbK5/GDiyKXQIuUz8jfApd
// SIG // dThmUpT/a/CZ76JltNAKCeD5fa5YNBuZXEJJwF6h2vZ0
// SIG // HVqdWcV6jXftCbCppUfLXADV99wpTPTZ2gpSRMS0B4in
// SIG // h1FFrasizJeuU1usETO15Re2Pj05wvHbjVp+Li54Pjjf
// SIG // 2d/RjuqgY+yBGcaKuKN2rxIfW2uN1FOk4M1WWgZvFWgN
// SIG // MEsFHv6aqUzmBVjetly94JfyQtqc3yD8T+ul30SyMWn4
// SIG // wVV5vClQ59nDC/SL0StNrPeNWOfkUeIEgDoS4kEOgNN1
// SIG // TUbqfrKTGtJPl0zwIvtmjB+cWtWY2/yvLvX/TNOVNP21
// SIG // DCVyQz/vsrFqSW1UQ4hxu7M2nGvq9x4lD40CckJdjYjn
// SIG // GExlfw3C6ywgStsxudNxRm9ODeSn9dF4AMBWl5aHeQfX
// SIG // iofeT51ysdizQYC8BvOWp5YYRscQUOZhbCRpAZ9D2T7Q
// SIG // M2cn6/eqsc6adqR/QySXIygg6zJmc4l2s6WuVVTd+gjt
// SIG // ZA1OAAZEmE1zjPEZiV7kJu5lBd21po/oYwCW+Kc+oU+V
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
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCA1Yw
// SIG // ggI+AgEBMIIBAaGB2aSB1jCB0zELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMScwJQYDVQQLEx5uU2hp
// SIG // ZWxkIFRTUyBFU046MzYwNS0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wi
// SIG // IwoBATAHBgUrDgMCGgMVAG9vCgxv8V2zQY5jO/56sN24
// SIG // KxDmoIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwDQYJKoZIhvcNAQELBQACBQDq1OXmMCIYDzIw
// SIG // MjQxMTA1MTg0MzUwWhgPMjAyNDExMDYxODQzNTBaMHQw
// SIG // OgYKKwYBBAGEWQoEATEsMCowCgIFAOrU5eYCAQAwBwIB
// SIG // AAICNhgwBwIBAAICE1owCgIFAOrWN2YCAQAwNgYKKwYB
// SIG // BAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQAC
// SIG // AwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsFAAOC
// SIG // AQEAWg2NS6EPWDyXbENmA4y3CiSyLg72/oPx+TKWoWh8
// SIG // rVE8655i8O9yxtaf5YO6wVO2VvCrMcTAQJ73UXMeIbns
// SIG // 3G8Aa9W4TFte26tObiN8BDBFmu3QY2A1JUQOId6A7Qmr
// SIG // Wzcn9DcBatrTaf4bjq5nHn1FT4CeDS2LsfzyZJ9CUwYU
// SIG // JVS3rRppD+4cEw//uzHwQLzUA3WjCLyLqn7u677F3zbi
// SIG // 1Mz/STvwulMOeAgpY5S0IYFp+tu1zQykneheE9G6QTWS
// SIG // 1SelZ6mQjiclvKERGgJSKapcy1fA4hL6nSC8pGqTHqWp
// SIG // 9FvwXmdbG2cqLfsurJ1C7G75DC/YnSnzAyBV6zGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAAB91ggdQTK+8L0AAEAAAH3MA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIC5KN/n/iyDxZj0z
// SIG // /VhVEOO/fik3py3YnMcOq8QtnwWRMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgIdqY2mt3GtHnGLobutLm
// SIG // Bz/yCpz23nW1UCeUqCB+WeIwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAfdYIHUEyvvC
// SIG // 9AABAAAB9zAiBCByQTw4xbILU9ZwXQrg4tU8d7t6q65M
// SIG // WKmc2Hmz62GCJDANBgkqhkiG9w0BAQsFAASCAgCdhR1F
// SIG // BviMmBPlvT6/uqkY2ydGaCrgSu6eI+536p8XVYpOM9zZ
// SIG // TlA7AA10ZFq/zFRpPmD9WMSWHUXrVv7Tiiord2lxFv0/
// SIG // F/sZmbXChlcjEmerqai5rZde1oph0XnswMNRANjjQUa3
// SIG // X4pzkgDMqtMrfIqzRwlUr9rqysirDfS2Qbi/cN/DJOru
// SIG // hWVuqL8sFGKZQLC5fgf5vmI05PdwYKY3+SMeQ77sn//m
// SIG // 65mLtrjZoA1V2sD88EBOLV3ZO61X/3tDNA4j05CJI5Ly
// SIG // IkrpBmycHRTlzmVgowMzNmchOoZbaj9KoJLZJRitHi6O
// SIG // 3FFXcy1O3jnUktJPasA14sbUW35METTH5jUqRhoS0lU1
// SIG // PjhNlgcMFHWPhmo37NG7vP7XsQN2JZ4MTsNP0bFl5Ksc
// SIG // vgLacgIeGVcTAT6y/uUlhfpDaiftsBlzzeOTpWKQiu5k
// SIG // dOP353PPC9ymlE1Bv8DGcRvEM/7dXkOREZy2ls6+xeUG
// SIG // PtfhFAc7zLO+1nFzY8iBXVHjB5JvXU64gm9fMMiaNusY
// SIG // 1GqgOO8fTsdWfsLCaz2P2bfyjZonBP0b5HmxHuAzG6GX
// SIG // u21pxdCIk1kIlCzhRp7zrp/8Y477ZqCuZLoPD+BEslz+
// SIG // zK87nskG8tl68LtYBcx5nr6A/WYAqNA39T1qYQWnPM59
// SIG // ai/7eYGlfzFJYKi53w==
// SIG // End signature block
