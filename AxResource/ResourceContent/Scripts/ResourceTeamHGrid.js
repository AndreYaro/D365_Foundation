/*!
// <copyright file="ResourceTeamHGrid.js" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
*/
(function (projectManagement, $) {
    "use strict";

    Globalize.addCultureInfo('en-us', {
        messages: {
            HierarchicalGridCommon_ResourceTeamStaffingTitle: "Team",
            HierarchicalGridCommon_ResourceCategory: "Role",
            HierarchicalGridCommon_ResourceName: "Name",
            HierarchicalGridCommon_ResourceBookedHours: "Booked hours",
            HierarchicalGridCommon_ResourceAssignedHours: "Assigned hours",
            HierarchicalGridCommon_ResourceStartDate: "Start date",
            HierarchicalGridCommon_ResourceEndDate: "End date",
            HierarchicalGridCommon_WBSResourceTeamTitle: "Resource team"
        }
    });

    var hierarchicalGrid = projectManagement.hierarchicalGrid || {};
    hierarchicalGrid.test = hierarchicalGrid.test || {};

    hierarchicalGrid.ResourceTeamHGridView = function (model, refreshPage, controlElement, modeId) {

		var self = this;
		self.columns = [
		  { text: $dyn.label('HierarchicalGridCommon_ResourceName'), dataField: "name", editable: $dyn.observable(false) },
		  { text: $dyn.label('HierarchicalGridCommon_ResourceStartDate'), dataField: "startDate", editable: $dyn.observable(false) },
		  { text: $dyn.label('HierarchicalGridCommon_ResourceEndDate'), dataField: "endDate", editable: $dyn.observable(false) },
		  { text: $dyn.label('HierarchicalGridCommon_ResourceBookedHours'), dataField: "bookedHours", editable: $dyn.observable(false) },
		  { text: $dyn.label('HierarchicalGridCommon_ResourceAssignedHours'), dataField: "assignedHours", editable: $dyn.observable(false) }
		];
		hierarchicalGrid.HierarchicalGridView.apply(this, arguments);
    };

    hierarchicalGrid.ResourceTeamHGridView.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridView.prototype, {
		
        viewId: "ResourceTeamView",

        get stateId() {
            var self = this;
            var id = null;
            var rootRow = self._rows[0];
            if (rootRow) {
                id = 'Res' + rootRow.engagementId;
            }
            return id;
        },

        saveState: function () {
            var self = this;
            var id = self.stateId;
            if (id) {
                self._saveState(self.viewId, id);
            }
        },

        loadState: function (doneLoadCallback) {
            var self = this;
            var id = self.stateId;
            if (id) {
                self._loadState(self.viewId, id, doneLoadCallback);
            } else {
                doneLoadCallback();
            }
        },

		toLevelClick: function (event) {
			var self = this;
			self.setUpdatingValues(true);
			self._viewModel.toLevel(event.level);
			self.setUpdatingValues(false);
			self._reloadGrid(0);
		},
		
        treeGridLoaded: function () {
            var self = this;

            var openEditResourceDialog = function () {
				var rowData = self.getSelectedRow();
				if (rowData)
				{
					self._viewModel.openEditResourceDialog(rowData.id());
				}
            }

            var releaseResource = function () {
                
                var selectedRows = self.getSelectedRows();
                var rowIds = [];
                for (var i = 0; i < selectedRows.length; i++) {
                    var selectedRow = selectedRows[i];
                    var children = selectedRow.__Children;
                    if (children.length > 0) {
                        for (var ci = 0; ci < children.length; ci++) {
                            var childRow = children[ci];
                            rowIds.push(childRow.id());
                        }
                    }
                    else {
                        rowIds.push(selectedRow.id());
                    }
                    self._viewModel.releaseResource(rowIds);
                }

            }

            var confirmResource = function () {

                var selectedRows = self.getSelectedRows();
                var rowIds = [];
                for (var i = 0; i < selectedRows.length; i++) {
                    var selectedRow = selectedRows[i];
                    var children = selectedRow.__Children;
                    if (children.length > 0) {
                        for (var ci = 0; ci < children.length; ci++) {
                            var childRow = children[ci];
                            rowIds.push(childRow.id());
                        }
                    }
                    else {
                        rowIds.push(selectedRow.id());
                    }
                    self._viewModel.confirmResource(rowIds);
                }

            }

            var deleteResource = function () {
                var selectedRows = self.getSelectedRows();
                var rowIds = [];
                for (var i = 0; i < selectedRows.length; i++) {
					var selectedRow = selectedRows[i];
					var children = selectedRow.__Children;
					if (children.length > 0) {
						for (var ci=0;ci<children.length; ci++)
						{
							var childRow = children[ci];
							rowIds.push(childRow.id());
						}
					}
					else
					{
						rowIds.push(selectedRow.id());
					}
                    self._viewModel.deleteResource(rowIds);
                }
            }

            var btnEdit = new RegExp('ResEditResourceBtn', 'g');
            var btnDelete = new RegExp('ResDeleteResourceBtn', 'g');
            var btnRelease = new RegExp('ResReleaseResourceBtn', 'g');
            var btnConfirm = new RegExp('ResConfirmBtn', 'g');
            var btnExpand = new RegExp('Expand', 'g');
            var btnCollapse = new RegExp('Collapse', 'g');

            var elems = document.getElementsByTagName('button'), i = 0, el;
            while (el = elems[i++]) {
                if (el.id.match(btnEdit)) {
                    el.onclick = openEditResourceDialog;
                }
                if (el.id.match(btnDelete)) {
                    el.onclick = deleteResource;
                }
                if (el.id.match(btnRelease)) {
                    el.onclick = releaseResource;
                }
                if (el.id.match(btnConfirm)) {
                    el.onclick = confirmResource;
                }
                if (el.id.match(btnExpand)) {
                    el.onclick = self.toLevelClick.bind(self, { level: 16 });
                }
                if (el.id.match(btnCollapse)) {
                    el.onclick = self.toLevelClick.bind(self, { level: 0 });
                }
            }
        },

        editable: false,

        createViewModel: function (model, controlElement, treeGridSelector) {
            return new hierarchicalGrid.ResourceTeamHierarchicalGridViewModel(model, this);
        },

        _initToolbarContainer: function (container, toTheme) {
        },

        rowSelect: function (event) {
            var self = this;
        }
    });

    hierarchicalGrid.ResourceTeamMode = function (data, controlElement, output, onReady) {
        hierarchicalGrid.Mode.apply(this, arguments);
    };

    hierarchicalGrid.ResourceTeamMode.prototype = $dyn.extendPrototype(hierarchicalGrid.Mode.prototype, {
        id: "ResourceTeam",

        title: $dyn.label("HierarchicalGridCommon_WBSResourceTeamTitle"),

        createModel: function (data, modeId) {
            return new hierarchicalGrid.ResourceTeamModel(data, modeId);
        },

        load: function () {
            var self = this;
            self.hierarchicalGridView = new hierarchicalGrid.ResourceTeamHGridView(self._model, self.refresh.bind(self), self._controlElement, self.id);
            self.hierarchicalGridView.init();
        }
    });

    hierarchicalGrid.ResourceTeamModel = function (data, modeId) {
        hierarchicalGrid.Model.apply(this, arguments);
    };

    hierarchicalGrid.ResourceTeamModel.prototype = $dyn.extendPrototype(hierarchicalGrid.Model.prototype, {
        openEditResourceDialog: function (rowKey) {
            var self = this;
            self._callService("openEditResourceDialog", [rowKey], function () {
                var timeOutInMS = 10;
                setTimeout(function () { self.retrieveRows(); }, timeOutInMS);
            });
        },

        releaseResource: function (rowKey) {
        var self = this;
        self._callService("releaseResource", rowKey, function () {
            var timeOutInMS = 10;
            setTimeout(function () { self.retrieveRows(); }, timeOutInMS);
        });
        },

        deleteResource: function (rowKey) {
        var self = this;
        self._callService("deleteResource", rowKey, function () {
            var timeOutInMS = 10;
            setTimeout(function () { self.retrieveRows(); }, timeOutInMS);
        });
        },
        confirmResource: function (rowKey) {
            var self = this;
            self._callService("confirmResource", rowKey, function () {
                var timeOutInMS = 10;
                setTimeout(function () { self.retrieveRows(); }, timeOutInMS);
            });
        },
    });

    //Resource Team Hierarchical Grid View Model
    hierarchicalGrid.ResourceTeamHierarchicalGridViewModel = function (data) {
        hierarchicalGrid.HierarchicalGridViewModel.apply(this, arguments);
    };
    
    hierarchicalGrid.ResourceTeamHierarchicalGridViewModel.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridViewModel.prototype, {
        enableSummarization: true,

        enableSummariesLocking: true,

		dataFields: [
			{ name: "id", type: "string" },
			{ name: "parentId", type: "string" },
			{ name: "name", type: "string" },
			{ name: "categoryId", type: "string" },
			{ name: "startDate", type: "date" },
			{ name: "endDate", type: "date" },
			{ name: "hardBookedHours", type: "number" },
			{ name: "softBookedHours", type: "number" },
			{ name: "hardAssignedHours", type: "number" },
			{ name: "softAssignedHours", type: "number" },
			{ name: "bookedHours", type: "string" },
			{ name: "assignedHours", type: "string" },
            { name: "engagementId", type: "string" },
        ],
		
        summarize: function (row) {
            var self = this;
			var children = row.__Children;
			if (children && children.length > 0) {
				var minStartDate = children[0].startDate();
				var maxEndDate = children[0].endDate();

				var totalHardBookedHours = 0;
				var totalSoftBookedHours = 0;
				var totalHardAssignedHours = 0;
				var totalSoftAssignedHours = 0;
				var childrenCount = children.length;
				for (var i = 0; i < childrenCount; i++) {
					var childItem = children[i];
					totalHardBookedHours += Number(childItem.hardBookedHours());
					totalSoftBookedHours += Number(childItem.softBookedHours());
					totalHardAssignedHours += Number(childItem.hardAssignedHours());
					totalSoftAssignedHours += Number(childItem.softAssignedHours());
					if (childItem.startDate() && (!minStartDate || childItem.startDate() < minStartDate)) {
						minStartDate = childItem.startDate();
					}
					if (childItem.endDate() && (!maxEndDate || childItem.endDate() > maxEndDate)) {
						maxEndDate = childItem.endDate();
					}
				}
				row.hardBookedHours(totalHardBookedHours);
				row.softBookedHours(totalSoftBookedHours);
				row.hardAssignedHours(totalHardAssignedHours);
				row.softAssignedHours(totalSoftAssignedHours);
				row.bookedHours((totalHardBookedHours + totalSoftBookedHours).toFixed(2));
				if (totalSoftBookedHours > 0)
				{
					row.bookedHours(row.bookedHours() + ' *');
				}
				row.assignedHours((totalHardAssignedHours + totalSoftAssignedHours).toFixed(2));
				if (totalSoftAssignedHours > 0) {
					row.assignedHours(row.assignedHours() + ' *');
				}
				row.startDate(minStartDate);
				row.endDate(maxEndDate);
			}
        },

        openEditResourceDialog: function (rowKey) {
            var self = this;
            self._model.openEditResourceDialog(rowKey);
        },

        releaseResource: function (rowKey) {
            var self = this;
            self._model.releaseResource(rowKey);
        },

        deleteResource: function (rowKey) {
            var self = this;
            self._model.deleteResource(rowKey);
        },

        confirmResource: function (rowKey) {
        var self = this;
        self._model.confirmResource(rowKey);
    }

    });

    hierarchicalGrid.modeManager.addMode(hierarchicalGrid.ResourceTeamMode, true);

})($dyn.projectManagement = $dyn.projectManagement || {}, jQuery);

//# sourceURL=resources/scripts/ResourceTeamHGrid.js

// SIG // Begin signature block
// SIG // MIIoOgYJKoZIhvcNAQcCoIIoKzCCKCcCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // t8jwKCVsgdksL2fgoj2kFHc+answkG2XsmFj8p24QNig
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBpUfeYufeeIGZ7
// SIG // cidpRmSmpLo8Li/6hDPOmRzFTBKiYzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBABID5HqqvRfFJQSOHjAoIrdcVyWusmAL
// SIG // W3D8tl7SrlzkpJ8fJTB+Qmy/zALgf9Hx7DJ1jJtzVu3W
// SIG // RWQRE53B+kURE4Ic6QD9n2grgnsMmolB/nbPTUG0cV/3
// SIG // rFwnw/qoQPuIS1rJ/kV5DQ51up2VTsOt9CIGXPmnWOl+
// SIG // h04PJ+wD73BFNwLDgTklI2qxpEphHeQpRB/Zqama+9HL
// SIG // Cfd4ijNeouGq15dAvNSJnv/CLAtw3AeY3WOUCHeryXi4
// SIG // PVxBLEXiraNyP0tMUXZSh3gvUnYvDNn/D+fQIAh4Mb0v
// SIG // rrUtDmWnOYvy1ceuLAEx/vh54iOes1PBs+PmOJrAOVRr
// SIG // AXWhgheXMIIXkwYKKwYBBAGCNwMDATGCF4Mwghd/Bgkq
// SIG // hkiG9w0BBwKgghdwMIIXbAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // EJLqWwSfqYMqJqO0/fMaufiCD8DlujDcK52GCc1hvVgC
// SIG // BmcafnlrKRgTMjAyNDExMDUyMTQzMDkuOTI0WjAEgAIB
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
// SIG // BgkqhkiG9w0BCQQxIgQglO+ICnFqsEtV8t9DDT1rct63
// SIG // xRafzUwHEYmtFSUrZZowgfoGCyqGSIb3DQEJEAIvMYHq
// SIG // MIHnMIHkMIG9BCAYvNk0i7bhuFZKfMAZiZP0/kQIfONb
// SIG // Bv2gzsMYOjti6DCBmDCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAAB88UKQ64DzB0xAAEAAAHz
// SIG // MCIEILcpjYx27t4TggYbzc4bzTNBCLYydUbJ5MvLkTpp
// SIG // 83pPMA0GCSqGSIb3DQEBCwUABIICAEpyFUurRDSyh49j
// SIG // /JdRns0kFwwDcNRPKUapPdmPi5U3QiFHEcXgCMLdRbYd
// SIG // BeyTtoB6ar0A1f8aOXiNCFGrQvSFMxPFTjx04Ek9fmdZ
// SIG // aXsFj7qBckr5bl6UU+4++pzLXMWOMhPSkGQmJTByhM0x
// SIG // IemlJsPWLW3FHoNIVvTcc0gI0EOFtor9KNUXHUF3emS4
// SIG // xTAHErp98a8HtzNoVUg7DRJZ+O0noR804EhEioXGnwv4
// SIG // YumvjirTYjgTFwWUNNe0e2xs5jDlINOOt80M55Zgq1+5
// SIG // V+ulqv6PybDf1d7UpIEnW99+XB2Dtq7aJV2/2qgByXNQ
// SIG // /zSBbrhl6GTAs7AVqe1ZFdzaWB/3ZZMy6RzHbZxeBSAD
// SIG // OedsSMWLbRv8l93kk+PLW6VbQp6T3eQLsm9c1GaRJJ35
// SIG // 3gXnvJTPjSnT5gnCmBGOfPf/H+Be2drwOVFq/yQxH4Fk
// SIG // 6tDh8Fby0nnLKygksKYzvhn9gJJWYVGh/dI85AQtT4jb
// SIG // fEua7bBKJPNOFIvl20hCFk1yoGAUkQ3F0oviRugibcUa
// SIG // 6frf8h7c0xqZ32+LFFoqSgjekda7p8Mk7c9c/kjcnTNC
// SIG // +igxtlV9+lPSh+21lxaWAgtAQxMNuRSKh2vMCWcSTaYz
// SIG // 5ROrmXAWwQ1Ih89BOzhJrQNkMzuE4F/ms/FKBBp48qwb
// SIG // ANdXa+ZO
// SIG // End signature block
