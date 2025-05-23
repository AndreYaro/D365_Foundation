// ---------------------------------------------------------------------
// <copyright file="CreditCardControl.js" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------
(function () {
    'use strict';

    $dyn.ui.defaults.CreditCardControl = {
        // Src attribute value of the iframe
        IframeSrc: '',
        TokenizationContent: '',

        // Data bound properties
        TokenizationPageUrl: '',
        TokenizationPageSubmitUrl: '',
        TokenizationMessageOrigin: '',
        ReadyForSubmit: '',
        ReadyForCancel: ''
    };

    $dyn.controls.CreditCardControl = function (props, element) {
        var self = this;
        $dyn.ui.Control.apply(this, arguments);
        $dyn.ui.applyDefaults(this, props, $dyn.ui.defaults.CreditCardControl);

        self.$controlElement = $(element);

        // New iframe contents loader
        var iframeContents = $dyn.value(self.TokenizationContent);

        if (iframeContents) {
            var iframe = self.$controlElement.find('.creditCardControl-frame')[0];

            iframe.addEventListener("load", function () {
                iframe.contentWindow.document.write(iframeContents);
            });

            iframe.height = "320px";
        }
        else {
            // Compose iframe src URL, append extra parameters to suggest styles inside iframe
            var openURL = $dyn.value(self.TokenizationPageUrl);
            var theme = $dyn.ui.theme.get();
            if ($dyn.value(self.TokenizationPageSubmitUrl) == "") {
                // When a separate submit URL is provided, do not append anything to the open URL. Most likely, these parameters will be ignored anyway.

                if (openURL.indexOf("?") == -1) {
                    openURL += "?";
                }

                openURL += "&fontsize=" + encodeURIComponent(theme.defaultFontSize)
                    + "&labelcolor=" + encodeURIComponent(theme.labelTextColor)
                    + "&textbackgroundcolor=" + encodeURIComponent(theme.formBackground)
                    + "&textcolor=" + encodeURIComponent(theme.fieldTextColor)
                    + "&disabledtextbackgroundcolor=" + encodeURIComponent(theme.fieldViewColor);
            }

            self.IframeSrc = $dyn.observable('');
            self.IframeSrc(openURL);

            // Set margin of the control based on the theme
            element.style.marginLeft = theme.margin;

            // When the opening URL has a different origin from the messaging origin,
            // The accepting page probably won't send its height. Set iframe height to a hardcode value to fit the page.
            // Different payment accepting pages need different height values when they don't support height message.
            if (!(openURL.indexOf($dyn.value(self.TokenizationMessageOrigin)) === 0)) {
                var iframe = self.$controlElement.find('.creditCardControl-frame')[0];
                iframe.height = "320px";
            }
        }

        // When tokenization page is ready for submit, submit the page.
        $dyn.observe(self.ReadyForSubmit, function (readyForSubmit) {
            if (readyForSubmit == "true") {

                var tokenizationPageSubmitUrl = $dyn.value(self.TokenizationPageSubmitUrl);
                var tokenizationMessageOrigin = $dyn.value(self.TokenizationMessageOrigin);
                if (tokenizationPageSubmitUrl != "") {
                    // If present, use submit URL to trigger submit
                    var d = new Date();
                    tokenizationPageSubmitUrl = tokenizationPageSubmitUrl + "#" + d.getTime();
                    self.IframeSrc(tokenizationPageSubmitUrl);
                } 
                else if (tokenizationMessageOrigin != "") {
                    // Do nothing if the origin of the tokenization page (i.e. child page) is unavailable.
                    // Send a message to the tokenization page to trigger it submit.
                    var messageObject = new Object();
                    messageObject.type = "msax-cc-submit";
                    messageObject.value = "true";

                    var iframe = self.$controlElement.find('.creditCardControl-frame')[0];
                    iframe.contentWindow.postMessage(JSON.stringify(messageObject), tokenizationMessageOrigin);
                }
            }
        });

        // When tokenization is cancelled, unregister event listener for "message".
        $dyn.observe(self.ReadyForCancel, function (readyForCancel) {
            if (readyForCancel == "true") {
                // Unregister event listener
                window.removeEventListener("message", self.ReceiveMessage, false);

                // Trigger OnCancelled event
                $dyn.async(function () { $dyn.callFunction(self.OnCancelled, self, {}) });
            }
        });


        // When a message is received from the tokenization page (i.e. child page).
        self.ReceiveMessage = function (event) {
            // Validate origin of the message.
            // Make sure the message is sent from the card tokenization page that we are expecting.
            // If it's a message from an unexpected origin, we simply ignore it.
            var tokenizationMessageOrigin = $dyn.value(self.TokenizationMessageOrigin);
            if (event.origin != tokenizationMessageOrigin)
                return;

            // Parse messages
            var message = event.data;
            if (typeof message == "string" && message.length > 0) {

                // Parse message
                var messageObject;
                try {
                    messageObject = JSON.parse(message);
                }
                catch (e) {
                    // Ignore the invalid messsage
                    return;
                }

                if (messageObject.type === undefined || messageObject.value === undefined) {
                    return;
                }

                // Handle various messages from the tokenization page
                switch (messageObject.type) {
                    case "msax-cc-height":
                        // Set height of the iframe
                        self.$controlElement.find('.creditCardControl-frame')[0].height = messageObject.value;
                        break;
                    case "msax-cc-error":
                        // Show input errors
                        var paymentErrors = messageObject.value;
                        for (var i = 0; i < paymentErrors.length; i++) {
                            $dyn.callFunction(self.ShowErrorMessage, self, { code: paymentErrors[i].Code, message: paymentErrors[i].Message });
                        }
                        break;
                    case "msax-cc-result":
                        // Unregister event listener
                        window.removeEventListener("message", self.ReceiveMessage, false);

                        // Triggers OnTokenized event
                        $dyn.callFunction(self.OnTokenized, self, { tokenAccessCode: messageObject.value });
                        break;
                    default:
                        // Unexpected message, just ignore it.
                }
            }
        }

        // Do nothing if the origin of the tokenization page (i.e. child page) is unavailable
        var tokenizationMessageOrigin = $dyn.value(self.TokenizationMessageOrigin);
        if (tokenizationMessageOrigin != "") {
            // Register event to listen message from the tokenization page.
            window.addEventListener("message", self.ReceiveMessage, false);
        }
    };

    $dyn.controls.CreditCardControl.prototype = $dyn.extendPrototype($dyn.ui.Control.prototype, {
    });
})();

// SIG // Begin signature block
// SIG // MIIoOQYJKoZIhvcNAQcCoIIoKjCCKCYCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // zxszE+o6RV4dyyXy5WzWkUKuipRGo+ReW3zwLsCAVKKg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCD4nvl3Om9EGnK6
// SIG // sG6YbQELVqnn+yU/8Hp5GQRauhoxwzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBADaZjahgFf3MT6fBZATnqJUG5iAWUVLv
// SIG // IvbCdgv6Gtl032BvuL58dv4ujGpwnvM/Sg//SiEioRED
// SIG // aUZtrCBgRh0ddy/zv+fStbQUYPGiIypgEeunyy56YVxU
// SIG // pjNyZuqpvPqP/xIfQYjwDaJAO18GjxuTUIGxNOsYRRJG
// SIG // hco2iNIrNfvd8VYoq/q+mp6VPh1AwyVYWemLSRqsX5wy
// SIG // pioQ87UKfY9feYGOyLvCIEiRUBZB23soyF1IMbdzqsSr
// SIG // EUpljjo9eEo1Fln/YnZ69pvDH0XzgMEPf7apa2SsDvac
// SIG // lwzQ+vLPPEo3DfbVXidNlFaHC16tRWUL+qcibCUvwc2w
// SIG // YY6hgheWMIIXkgYKKwYBBAGCNwMDATGCF4Iwghd+Bgkq
// SIG // hkiG9w0BBwKgghdvMIIXawIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUQYLKoZIhvcNAQkQAQSgggFABIIBPDCCATgC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // 6pe+OQ5XsK/9+0/Z97iiy1k5IxrQ7i+mufFgnHg80PoC
// SIG // BmcaitXAGhgSMjAyNDExMDUyMTQzMTAuMDhaMASAAgH0
// SIG // oIHRpIHOMIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYD
// SIG // VQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046OTYwMC0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghHtMIIHIDCCBQigAwIBAgIT
// SIG // MwAAAe+JP1ahWMyo2gABAAAB7zANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MzEyMDYxODQ1NDhaFw0yNTAzMDUxODQ1NDhaMIHLMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3Nv
// SIG // ZnQgQW1lcmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5u
// SIG // U2hpZWxkIFRTUyBFU046OTYwMC0wNUUwLUQ5NDcxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQCjC1jinwzgHwhOakZqy17oE4BIBKsm5kX4DUmCBWI0
// SIG // lFVpEiK5mZ2Kh59soL4ns52phFMQYGG5kypCipungwP9
// SIG // Nob4VGVE6aoMo5hZ9NytXR5ZRgb9Z8NR6EmLKICRhD4s
// SIG // ojPMg/RnGRTcdf7/TYvyM10jLjmLyKEegMHfvIwPmM+A
// SIG // P7hzQLfExDdqCJ2u64Gd5XlnrFOku5U9jLOKk1y70c+T
// SIG // wt04/RLqruv1fGP8LmYmtHvrB4TcBsADXSmcFjh0VgQk
// SIG // X4zXFwqnIG8rgY+zDqJYQNZP8O1Yo4kSckHT43XC0oM4
// SIG // 0ye2+9l/rTYiDFM3nlZe2jhtOkGCO6GqiTp50xI9ITpJ
// SIG // Xi0vEek8AejT4PKMEO2bPxU63p63uZbjdN5L+lgIcCNM
// SIG // CNI0SIopS4gaVR4Sy/IoDv1vDWpe+I28/Ky8jWTeed0O
// SIG // 3HxPJMZqX4QB3I6DnwZrHiKn6oE38tgBTCCAKvEoYOTg
// SIG // 7r2lF0Iubt/3+VPvKtTCUbZPFOG8jZt9q6AFodlvQnti
// SIG // olYIYtqSrLyXAQIlXGhZ4gNcv4dv1YAilnbWA9CsnYh+
// SIG // OKEFr/4w4M69lI+yaoZ3L/t/UfXpT/+yc7hS/FolcmrG
// SIG // FJTBYlS4nE1cuKblwZ/UOG26SLhDONWXGZDKMJKN53oO
// SIG // LSSk4ldR0HlsbT4heLlWlOElJQIDAQABo4IBSTCCAUUw
// SIG // HQYDVR0OBBYEFO1MWqKFwrCbtrw9P8A63bAVSJzLMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwFgYDVR0lAQH/BAww
// SIG // CgYIKwYBBQUHAwgwDgYDVR0PAQH/BAQDAgeAMA0GCSqG
// SIG // SIb3DQEBCwUAA4ICAQAYGZa3aCDudbk9EVdkP8xcQGZu
// SIG // IAIPRx9K1CA7uRzBt80fC0aWkuYYhQMvHHJRHUobSM4U
// SIG // w3zN7fHEN8hhaBDb9NRaGnFWdtHxmJ9eMz6Jpn6KiIyi
// SIG // 9U5Og7QCTZMl17n2w4eddq5vtk4rRWOVvpiDBGJARKiX
// SIG // WB9u2ix0WH2EMFGHqjIhjWUXhPgR4C6NKFNXHvWvXecJ
// SIG // 2WXrJnvvQGXAfNJGETJZGpR41nUN3ijfiCSjFDxamGPs
// SIG // y5iYu904Hv9uuSXYd5m0Jxf2WNJSXkPGlNhrO27pPxgT
// SIG // 111myAR61S3S2hc572zN9yoJEObE98Vy5KEM3ZX53cLe
// SIG // fN81F1C9p/cAKkE6u9V6ryyl/qSgxu1UqeOZCtG/iaHS
// SIG // KMoxM7Mq4SMFsPT/8ieOdwClYpcw0CjZe5KBx2xLa4B1
// SIG // neFib8J8/gSosjMdF3nHiyHx1YedZDtxSSgegeJsi0fb
// SIG // UgdzsVMJYvqVw52WqQNu0GRC79ZuVreUVKdCJmUMBHBp
// SIG // Tp6VFopL0Jf4Srgg+zRD9iwbc9uZrn+89odpInbznYrn
// SIG // PKHiO26qe1ekNwl/d7ro2ItP/lghz0DoD7kEGeikKJWH
// SIG // dto7eVJoJhkrUcanTuUH08g+NYwG6S+PjBSB/NyNF6bH
// SIG // a/xR+ceAYhcjx0iBiv90Mn0JiGfnA2/hLj5evhTcAjCC
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
// SIG // Ojk2MDAtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQBLcI81gxbea1Ex2mFbXx7ck+0g/6CBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBCwUAAgUA6tTabTAiGA8yMDI0MTEwNTE3NTQ1
// SIG // M1oYDzIwMjQxMTA2MTc1NDUzWjB3MD0GCisGAQQBhFkK
// SIG // BAExLzAtMAoCBQDq1NptAgEAMAoCAQACAiL7AgH/MAcC
// SIG // AQACAhNGMAoCBQDq1ivtAgEAMDYGCisGAQQBhFkKBAIx
// SIG // KDAmMAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAI
// SIG // AgEAAgMBhqAwDQYJKoZIhvcNAQELBQADggEBAFAtdGol
// SIG // lUv1bgkSD44AdAlariaSAIp42H5rbKbHB7wHqZqVvVNy
// SIG // 20NqyAc71ypTjEy9mehjaKm4Fqr9A/XYr0KO2by+9pm9
// SIG // I0oCoa4Kku1QNFFhUXzxsGtdTdAYhxhfy3N5ulOOT48m
// SIG // KhJ1GhWrg3+59PZGcppHUDs3Ww9QnQct3vJzYnwJHodh
// SIG // qH6AwiFfk/W0IhjUtfm1lxJj35+OMuBLq+zkXAQ5TZEa
// SIG // iIBdYKUBGtZRYjCNP5a5+u/zJTs8Z8Jup/UCJRVlielu
// SIG // 4jtzGdEBj8khDcMXhMJaKAQGqYuZxQkm23KyquWZ6dJ1
// SIG // 4YtAenAiUKUF/ziI9kkoXk2j+CQxggQNMIIECQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // Ae+JP1ahWMyo2gABAAAB7zANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCD+UxPkds+R6Xa2KNNK3hKE5bM0
// SIG // O6hsYxoR7gOJss7+ojCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIPBhKEW4Fo3wUz09NQx2a0DbcdsX8jov
// SIG // M5LizHmnyX+jMIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAHviT9WoVjMqNoAAQAAAe8w
// SIG // IgQgDFtbW1Jp+oiJObzQAfOguzJNPKh07V3rDI/590Ug
// SIG // XZ0wDQYJKoZIhvcNAQELBQAEggIAXoIaplOIPKiYlU8n
// SIG // n15PA8mNArxydzMjYXZVanK8+JrSUR+OZ4JBBvhqWT7L
// SIG // DDGcjWHlWO6Sb07AiRgt50QaeF0TcLMkVtfLG2bBR8lh
// SIG // 8eVX3NsjLEB+vy4bL8QD85iVwtDYAN8Nh9Yu5uXp2Bfy
// SIG // I7ekh0/618TMAuU9lWIbwhNMtUdOkkTbUuRmUaF61OaV
// SIG // OAoHKQD6elkflsdkJvnWgf7kmfX+naqt5t9e0rU5amx1
// SIG // S/ucyFPkkgnsMuBN+NYHNz1GKrjBDXihlwMI8dTg/GUF
// SIG // +jrN0g27mx620AS4Yoc1Zrb32Tku+rJXMH77KE1pGOoF
// SIG // cUSs2kfOLCBu8XaWbRFpya8MP/H65S+0oHi1N1Rsxxx1
// SIG // enhI/1+BNM50KNTivHVmPB0K1gYYhMC0EttM+HoX2MrR
// SIG // sErvPcEoz9INxRtTYZfKB6TCI4bEsoIb4a4iUC2muSO+
// SIG // u5hrdkG0ypfv1BXDELSH1/hF4hqe1iqXFk79vwc5NVmU
// SIG // I0zGuhTAHfQ5LmqZY5wqvRjV3jMCGE4gPvaFwtbMHIDo
// SIG // aTu3NBVo+AB6ckMw7palgLh2NaZX7TzqRf4ra24m8WvD
// SIG // 9XCBSZpC1If7AFWYFskKEqH6MwrF4XP/HA7gdD/2PXg9
// SIG // u4cyapF9rG74qXZBOpFaj1mg2IhH7cF1LISZExsn6V5R
// SIG // nhYd9IU=
// SIG // End signature block
