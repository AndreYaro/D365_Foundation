/*!
// <copyright file="ProjBudgetBalancesRevenueView.js" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
*/
(function (projectManagement, $) {
    "use strict";

    Globalize.addCultureInfo('en-us', {
        messages: {
            HierarchicalGridCommon_ProjBudgetBalancesRevenueTitle: "Revenues",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueTransName: "Transaction",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueOriginalBudget: "Original budget",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueRevisedBudget: "Approved budget",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueActualRevAndCosts: "Consumed budget",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueRemainingBudget: "Remaining budget",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueCommittedCosts: "Commitment",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueAmendedBudget: "Approved revisions",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueUnapprovedRevisions: "Unapproved revisions",
            HierarchicalGridCommon_ProjBudgetBalancesRevenueCarryForwardBudget: "Carry-forward",
            HierarchicalGridCommon_ProjBudgetBalancesType: "Type",
            HierarchicalGridCommon_ProjBudgetBalancesCategory: "Category",
            HierarchicalGridCommon_ProjBudgetBalancesCostLine: "Cost line"
        }
    });


    var hierarchicalGrid = projectManagement.hierarchicalGrid || {};
    hierarchicalGrid.test = hierarchicalGrid.test || {};

    hierarchicalGrid.ProjBudgetBalancesRevenueHGridView = function (model, refreshPage, controlElement, modeId) {

        var self = this;
        self.columns = [
          { text: $dyn.observable($dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueTransName')), dataField: "TransName", width: 150, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueOriginalBudget'), dataField: "OriginalBudget", width: 140, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueRevisedBudget'), dataField: "RevisedBudget", width: 140, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueActualRevAndCosts'), dataField: "ActualRevAndCosts", width: 140, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueRemainingBudget'), dataField: "RemainingBudget", width: 140, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueCommittedCosts'), dataField: "CommittedCosts", width: 140, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueAmendedBudget'), dataField: "AmendedBudget", width: 140, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueUnapprovedRevisions'), dataField: "UnapprovedRevisions", width: 140, editable: false },
            { text: $dyn.label('HierarchicalGridCommon_ProjBudgetBalancesRevenueCarryForwardBudget'), dataField: "CarryForwardBudget", width: 140, editable: false }
        ];

        hierarchicalGrid.HierarchicalGridView.apply(this, arguments);
    };

    hierarchicalGrid.ProjBudgetBalancesRevenueHGridView.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridView.prototype, {
        createViewModel: function (model) {
            return new hierarchicalGrid.ProjBudgetBalancesRevenueHierarchicalGridViewModel(model, this);
        },
        
        treeGridLoaded: function () {
            var self = this;
            $dyn.observe(self._model.data.SessionContext, function (sessionContext) {
                self.handleContextChange(sessionContext[0]);
            });
        },

        handleContextChange: function (sessionContext) {
            var self = this;
            var columns = self.columns;
            if (columns && columns.length > 0) {
                if (sessionContext
                    && sessionContext.GroupBy) {
                    switch (sessionContext.GroupBy)
                    {
                        case "ProjTransType":
                            columns[0].text($dyn.label('HierarchicalGridCommon_ProjBudgetBalancesType'));
                            break;
                        case "CategoryGroupId":
                        case "CategoryId":
                            columns[0].text($dyn.label('HierarchicalGridCommon_ProjBudgetBalancesCategory'));
                            break;
                        case "CostTemplate":
                            columns[0].text($dyn.label('HierarchicalGridCommon_ProjBudgetBalancesCostLine'));
                            break;
                    }
                }
            }
        },

        // No Toolbar
        _initToolbarContainer: function (container, toTheme) {
            return container;
        },
          
        enableCustomKeyboardShortcuts: false,

    });

    hierarchicalGrid.ProjBudgetBalancesRevenueHierarchicalGridViewModel = function (model, controlElement, treeGridSelector) {
        hierarchicalGrid.HierarchicalGridViewModel.apply(this, arguments);
    };

    hierarchicalGrid.ProjBudgetBalancesRevenueHierarchicalGridViewModel.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridViewModel.prototype, {
        enableSummarization: false,

        dataFields: [
            { name: "parentId", type: "string" },
            { name: "id", type: "string" },
            { name: "TransName", type: "string" },
            { name: "CategoryGroup", type: "string" },
            { name: "Category", type: "string" },
            { name: "OriginalBudget", type: "number" },
            { name: "RevisedBudget", type: "number" },
            { name: "ActualRevAndCosts", type: "number" },
            { name: "RemainingBudget", type: "number" },
            { name: "CommittedCosts", type: "number" },
            { name: "AmendedBudget", type: "number" },
            { name: "UnapprovedRevisions", type: "number" },
            { name: "CarryForwardBudget", type: "number" }
        ],

        summarize: function (row) {
            var self = this;
        }
    });

    hierarchicalGrid.ProjBudgetBalancesRevenueModel = function (data, modelId) {
        hierarchicalGrid.Model.apply(this, arguments);
        self._originalData = [];
    };

    hierarchicalGrid.ProjBudgetBalancesRevenueModel.prototype = $dyn.extendPrototype(hierarchicalGrid.Model.prototype, {

    });

    hierarchicalGrid.ProjBudgetBalancesRevenueMode = function (data, controlElement, output, onReady) {
        var self = this;
        hierarchicalGrid.Mode.apply(self, arguments);
    };

    hierarchicalGrid.ProjBudgetBalancesRevenueMode.prototype = $dyn.extendPrototype(hierarchicalGrid.Mode.prototype, {
        id: "ProjBudgetBalancesRevenue",

        title: $dyn.label("HierarchicalGridCommon_ProjBudgetBalancesRevenueTitle"),

        load: function () {
            var self = this;
            self.hierarchicalGridView = new hierarchicalGrid.ProjBudgetBalancesRevenueHGridView(self._model, self.refresh.bind(self), self._controlElement, self.id);
            self.hierarchicalGridView.init();
        },

        createModel: function (data, modelId) {
            return new hierarchicalGrid.ProjBudgetBalancesRevenueModel(data, modelId);
        },


    });

    hierarchicalGrid.modeManager.addMode(hierarchicalGrid.ProjBudgetBalancesRevenueMode);

})($dyn.projectManagement = $dyn.projectManagement || {}, jQuery);

//# sourceURL=ProjBudgetBalancesRevenueView.js

// SIG // Begin signature block
// SIG // MIIoUwYJKoZIhvcNAQcCoIIoRDCCKEACAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 73zrhVZYxHAXQsNO9tJa+WkH9SD9ne+/zS9sC06h5eOg
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
// SIG // ghomMIIaIgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEA73VlV0POxitAAAAAAQDMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBKykjJkcmpGInZ
// SIG // fcF3637yjdlMWhYoY16Ntv7pTOTMXjBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAFtxNQxcgM1EAIKKNZPhSxD9d1ROeH4A
// SIG // TymxXk+G4Wc21YqUpKVeYovGaqin/YmQ2N5f8B9KLJfG
// SIG // OmTLkIyhaAPWoIb/lSpxA26HqRt2PClr8qQTAxPKceda
// SIG // pjMEe0Oyf3HrH5PBlnmydx9MRuh+8+uqOih/WwkcV3lr
// SIG // a4TbIwzazhZO2TCdYSRMe7PYNXiE9NPjxj8FqMq5jXTt
// SIG // IrlzV91PARdassqOH5//xFFLIFYbLgwWORjoiNYN8M39
// SIG // Xn3JP760bpACbcZ3EOu52T3y3GiTFru7CJuNn98UswZ9
// SIG // OGesdTbX4dPIA6ZrlafaZNYR2GB/4jcotjjdHHOhQO61
// SIG // zbyhghewMIIXrAYKKwYBBAGCNwMDATGCF5wwgheYBgkq
// SIG // hkiG9w0BBwKggheJMIIXhQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // XdM8f0JpXYFPwWXIpsMbzakGRucZeDdVqZ6FZRXxTNoC
// SIG // BmbrOwgJShgTMjAyNDExMDUyMTQzMTMuMjE4WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046MkExQS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH+MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAfkfZ411q6TxsQABAAAB+TANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNDA3MjUxODMxMDlaFw0yNTEwMjIxODMx
// SIG // MDlaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjoy
// SIG // QTFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBALQ9TB98gB1hzVbJQvgg
// SIG // U4/zKXeeSwz7UK4Te1nqhYUXgvcSl0o6G1tWR8x1PFdg
// SIG // TiVImIO3wydgMRlRsqL1LYBmYNvhmrhSpN2Y47C0rKno
// SIG // WCLFEK4F/q/1QE2lvPzjVsupTshmcGacX1dhF+KgIepm
// SIG // 9oWnQLr3W0ZdUCtbXwZUd33XggUBvsm8/SRWeOSzdqbP
// SIG // DXNca+NTfEItylSS2F9ImxGwJJLEeG27Mws72Pr3Uq41
// SIG // sigI0emIGIWgWg8RNigydrEERRRf3oAsSoKIHRd1SCaA
// SIG // hP1rsvTLhIMqXmtR3ou5RRr3S0GR+SaNkEebjfIYjHPG
// SIG // eO0USbiFgjnsiCdWJ0Yoom6VGe9vsKb/C06L9Mh+guR0
// SIG // fw/PgE+L6rT+eyE17A/QzzqG/LY7bHnz3ECXm1DYqsn8
// SIG // ky+Y+fyftnfhjwnFxGKHlmfp67GUn63eQxzOKLwpg95Y
// SIG // n4GJ84zq8uIIUE/3L5nR8Ba+siRqYVvxxvBkHfnAeMO8
// SIG // BqToR1SW8uOJBlSvDM2PbN9g8tUx5yYPKe8tbBBs/wNc
// SIG // vOGbeoCLCE2GnHB4QSqeHDlTa36EVVMdhv9E6+w5N36Q
// SIG // lPLvuaJajz8CoGbOe45fpTq0VbF9QGBJgJ8gshq6kQM6
// SIG // Rl8pNR7zSAaUjTbkwUJOxQb7vmKYugO0tldk4+pc2FlQ
// SIG // b7hhAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUie2jupyV
// SIG // ySPXoo80uUJEdkZZ4AAwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBAGYg
// SIG // CYBW5H+434cf5pmZZxma6WnvhxqcVsbPCO/b1G/BkKLu
// SIG // dDNZ7O4sBtgnHaF2qu1YKVZDX9bryIaxmKSggV0Pkmid
// SIG // jtAb8LiUe1LIE2ijdI/8n936Rw9JLR/hJBLhl7PQwS8r
// SIG // e9YrrVZMKMPYkJkpOKCCvEvAKzRqUjs3rrvU3SYwY7Gr
// SIG // JriftquU45q4BCsj3t0wKQIqPHHcP29XAQJo7SO7aTWF
// SIG // eT8kSNytTYbg4HxI+ZMpxhf7osz9Tbh0sRf1dZLP9rQh
// SIG // KK4onDOJNTyU0wNEwozW5KZgXLADJcU8wZ1rKpwQrfXf
// SIG // lHfVWtyMPQbOHHK5IAYy7YN72BmGq+teaH2LVPnbqfi7
// SIG // lNHdsAQxBtZ4Ulh2jvrtsukotwGjSDbf6TjClOpeAFtL
// SIG // g1lB9/Thx9xKhR7U7LGV2gzo7ckYG6jBppH/CiN6iFQW
// SIG // Sdl0KZ4RLkW4fgIKZkZ/2uNdA5O1bT4NrguNtliwvB/C
// SIG // FZPxXqIkkuLxaHYZ3BXrSdGSt+sMQGtxYj4AXm0VslbW
// SIG // e+t6gw88Q29Jgehy/RxH02zfuKBwpGWtRypfAdLPEYhQ
// SIG // TH/1u/juxD2fsDB/MHZI2e0m7HXbXUYEQEakfCBT1rq0
// SIG // PrJ+37RIn2qI87ghGoUgHKvOso8EHkzzfWBvW9+EU7q5
// SIG // 5KQ/sDxkwdVnHDKbC5TNMIIHcTCCBVmgAwIBAgITMwAA
// SIG // ABXF52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgz
// SIG // MjI1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOTh
// SIG // pkzntHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2
// SIG // AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYj
// SIG // DLWNE893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFE
// SIG // yHFcUTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2
// SIG // vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6O
// SIG // U8/W7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUo
// SIG // veO0hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvr
// SIG // g0XnRm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdb
// SIG // Z2De+JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZ
// SIG // nkXftnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZN
// SIG // N3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEz
// SIG // OUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMY
// SIG // ctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5
// SIG // C4lh8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6
// SIG // bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17a
// SIG // j54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkr
// SIG // BgEEAYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQq
// SIG // p1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cV
// SIG // XQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwr
// SIG // BgEEAYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1Jl
// SIG // cG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMI
// SIG // MBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
// SIG // DwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQY
// SIG // MBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRP
// SIG // ME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYI
// SIG // KwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3h
// SIG // LB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnX
// SIG // wnE2P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03d
// SIG // mLq2HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27Y
// SIG // P0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfak
// SIG // Vqr3lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8
// SIG // F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4s
// SIG // a3tuPywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6
// SIG // MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1A
// SIG // PMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lU
// SIG // ZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtq
// SIG // RRFHqfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4K
// SIG // u+xBZj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLB
// SIG // gqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr
// SIG // 4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvp
// SIG // e784cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQ
// SIG // tB1VM1izoXBm8qGCA1kwggJBAgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046MkExQS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAKrO
// SIG // Vo1ju81QCpiHHcIaoGb8qelGoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDq1P5XMCIYDzIwMjQxMTA1MjAyODA3WhgPMjAy
// SIG // NDExMDYyMDI4MDdaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOrU/lcCAQAwCgIBAAICBMcCAf8wBwIBAAICErYw
// SIG // CgIFAOrWT9cCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQsFAAOCAQEAEVEKgWMuGry2DZYJ
// SIG // JvBIehsxjG5SWm3gMahuJ8jsagQQGQWl5m06ZiZgwUn+
// SIG // fb32IdxG7Mt6qLfKJEur43rDRxYuIkJ1yVDqmJWJQbqK
// SIG // xTFUB9EyY2hflhjmiDepYyFvDzQoGS/7xaT6kr6mhePT
// SIG // 0610H53NRVliC58zBsALvkqv/73K6ahADLRHxqSd6HaL
// SIG // XbSLPX7ITUJ3GfwfUN5yFTe75L9x9GmDknI03mSKNrZN
// SIG // Ndy3xSmOkCuusDu2PBLqYPnh10vL1Hmy0eZ++8qQpqM8
// SIG // sfzlD+ekZcUQ/OH90uZR3D7r5G/oaf/Wjk71THA5uQBh
// SIG // 1qSAk8SqWDCSS9SGoDGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB+R9njXWr
// SIG // pPGxAAEAAAH5MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEINpQeVeHpxlScqWODZYBVd4xyW3IimCfEEDi
// SIG // HoiNu3aqMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgOSOMyB7wjftk+ukVDiwma1BFXaCpSpfFXgjuUmxi
// SIG // 2BAwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAfkfZ411q6TxsQABAAAB+TAiBCAb2ZiU
// SIG // 0z/T3SQUuuRzyWHBglBRXJB8eKkigVk1eO+w4jANBgkq
// SIG // hkiG9w0BAQsFAASCAgAeBAC8cnEjGsGZFJca20v9LGmt
// SIG // doGkDwJtSK6xU8Zvn+8n/iO6EZeUaAtw9Z1rBnStUGK3
// SIG // SSvtsnVt5XLnTFDwAJVquaf9xvsKtO3rXsP4S0uDrSPO
// SIG // bSVbMuq05RgZ3ePty84MQaPtaqvatgHjJ1QfUYe5lJ0D
// SIG // W2RFDb01QwMtw2kx5xJU6F3WzLlnvwVMLYcpYy8MMmBJ
// SIG // BR0sxwhfa0vNhKFIevV+OHHWNiF+xhbbEo2N+vA91x6o
// SIG // 2Y26v4v4Zc/Xg7I9S5JnZxlZxftX4DjkvufwWPUY1ypU
// SIG // ezJNgVrxBSHHgcSG3uYuLlVrLhSnSoWINS7Qv1v/32jC
// SIG // JNLYm5Sm95Kswqh0jUiI4IAHCtSoEDGplxfPX7Q22bVT
// SIG // dOTYFsN/Hz+rE9on688SAFiLKQC3cJE9ifl6Kbvovn4p
// SIG // uYuJFgHroO95BbbRTTIG0i9nuienIZaDw9TxpYFMSeHK
// SIG // Crtfb2qJWWXb4zl+HJhHePlzkLZt1KxRxz8S60LdszzJ
// SIG // XmavIa+1G2TmvlELfCH9eFrG2eeXfIFhdqc9MLl0HcSG
// SIG // HVjPR+TWu5e2932sqMCNlGR5R/0w0hqn2BBcms9MvY79
// SIG // I1huAOFMaMBBahndkV5nJ03R2EcZlcX7b/LKYBXZoDWJ
// SIG // MkSFm4kKLUXMPF/+MrNOE/HNwK9+XCStAV1Ko0Sahw==
// SIG // End signature block
