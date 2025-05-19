/*!
// <copyright file="WBSEffortTrackingView.js" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
*/
(function (projectManagement, $) {
    "use strict";

    Globalize.addCultureInfo('en', {
        messages: {
            WBSEffortTrackingTitle: "Effort Tracking View",
            WBSID: "WBS ID",
            Task: "Task",
            ProgressPercent: "Progress percent",
            ActualEffort: "Actual effort",
            RemainingEffort: "Remaining effort",
            EffortAtComplete: "Effort at complete",
            PlannedEffort: "Planned effort",
            EffortVariance: "Effort variance",
			ConfirmUpdatingDescendents: "Schedule projections will be overwritten in all descendent tasks. Proceed?"
        }
    });

    var hierarchicalGrid = projectManagement.hierarchicalGrid || {};
    hierarchicalGrid.test = hierarchicalGrid.test || {};

    hierarchicalGrid.EffortTrackingHGridView = function (model, refreshPage, controlElement, modeId) {
        var self = this;
        self.columns = [
              { text: $dyn.label('WBSID'), dataField: "topologicalId", width: 110, editable: $dyn.observable(false) },
              { text: $dyn.label('Task'), dataField: "name", editable: $dyn.observable(false), width: 300 },
              { text: $dyn.label("ProgressPercent"), dataField: "progressPercent", width: 150, editable: $dyn.observable(true) },
              { text: $dyn.label("ActualEffort"), dataField: "actualEffort", editable: $dyn.observable(false), width: 150 },
              { text: $dyn.label("RemainingEffort"), dataField: "remainingEffort", width: 150, editable: $dyn.observable(true) },
              { text: $dyn.label("EffortAtComplete"), dataField: "effortAtComplete", editable: $dyn.observable(false), width: 150 },
              { text: $dyn.label("PlannedEffort"), dataField: "effort", editable: $dyn.observable(false), width: 150 },
              { text: $dyn.label("EffortVariance"), dataField: "effortVariance", editable: $dyn.observable(false), width: 150 },
            ]
        hierarchicalGrid.HierarchicalGridView.apply(this, arguments);
    };

    hierarchicalGrid.EffortTrackingHGridView.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridView.prototype, {

        createViewModel : function (model, controlElement,treeGridSelector) {
            return new hierarchicalGrid.EffortTrackingHierarchicalGridViewModel(model, this);
        },  
		
		_initToolbarContainer: function (container, toTheme) {
			var self = this;
			container.append(self._saveButton);
			container.append(self._refreshButton);
			container.append(self._levelButton);
			return container;
		},
		
		handleUpdate: function (field, rowData,value,oldValue) {
			var self = this; 
			var wasUpdatingValues = self.isUpdatingValues();
			self.setUpdatingValues(true);
			switch(field)
			{
				case "progressPercent":
					if (value > 100){
						self.revertToGivenValue(field, rowData, oldValue);
						return;
					}
					oldValue    = self.parseNumber(oldValue);
					value       = self.parseNumber(value);

					var actualEffort = self.parseNumber(rowData.actualEffort());
					var tempRemainingEffort;
					if (actualEffort > 0 || value === 100) {
						rowData.progressPercent(value);
						tempRemainingEffort = self.parseNumber(rowData.remainingEffort());
						//remaining effort needs to be updated before calling propagateRemainingEffort
						rowData.remainingEffort (self.parseNumber((100 * actualEffort) / value - actualEffort));
						self._viewModel.propagateRemainingEffort (rowData, self.parseNumber(rowData.remainingEffort()) - tempRemainingEffort)
						rowData.effortAtComplete(self.parseNumber (rowData.remainingEffort()) + self.parseNumber(rowData.actualEffort()));
					}
					else {
						rowData.progressPercent(0);
					}
					rowData.effortVariance(self._viewModel.getEffortVariance(rowData)) 
					self._executeOperation(self._viewModel.updateRow,
						[rowData],
						"Update",
						self._updateButton);

					break;

				case "remainingEffort":
					oldValue = self.parseNumber(oldValue);
					value = self.parseNumber(value);

					self._viewModel.propagateRemainingEffort(rowData, value - oldValue)

					//changing remaining effort changes the effortAtComplete using actual effort and remaining
					//this value will be persisted and will be used to load the data next time.
					rowData.effortAtComplete(self.parseNumber((value + self.parseNumber(rowData.actualEffort()))));
					rowData.remainingEffort(value); 
					rowData.effortVariance(self._viewModel.getEffortVariance(rowData));
					rowData.progressPercent(self._viewModel.getProgressPercent(rowData));
					break;

				default: break;
			}
			self.setUpdatingValues(wasUpdatingValues);
		},
		
		revertToGivenValue: function(field, rowData, oldValue) {
			var self = this; 
			var wasUpdatingValues = self._updatingValues;
			self._updatingValues = true;
			switch(field)
			{
				case "remainingEffort":
				{
					rowData.remainingEffort (oldValue); 				
					break;
				}
				case "progressPercent":
				{
					rowData.progressPercent (oldValue)
					break;
				}
				default:
					break;
			}
			self._updatingValues = wasUpdatingValues;
		},

        cellValueChanged: function(event) {
            var self        = this;
            var args        = event.args;
            var value       = self.parseNumber(args.value);
            var oldValue    = self.parseNumber(args.oldValue);
            var rowKey      = args.key;
            var rowData     = args.rowData;
            var field       = args.field;

            if (oldValue === value) {
				return;
            }		
			var callBack = function (btn) {
				if (btn === $dyn.controls.MessageBox.Button.Yes) {
					self.handleUpdate(field,rowData, value, oldValue);
				}
				else {
					self.revertToGivenValue(field, rowData, oldValue); 
				}
			};
			
			if(self.isLeaf(rowData) === false) {
				$dyn.showMessageBox({
					showYesButton: true, showNoButton: true,
					Text: $dyn.label("ConfirmUpdatingDescendents"),
					callback: callBack.bind(self)
				})
			}
			else {
				self.handleUpdate(field,rowData, value, oldValue);
			}
        },

    });

    //Effort Tracking Mode
    hierarchicalGrid.EffortTrackingMode = function (data, controlElement, output, onReady) {
        hierarchicalGrid.Mode.apply(this, arguments);
    };

    hierarchicalGrid.EffortTrackingMode.prototype = $dyn.extendPrototype(hierarchicalGrid.Mode.prototype, {
        id: "EffortTracking",

        title: $dyn.label("WBSEffortTrackingTitle"),

        createModel: function (data, modeId) {
            return new hierarchicalGrid.EffortTrackingModel(data, modeId);
        },

        load: function () {
            var self = this;
            self.hierarchicalGridView = new hierarchicalGrid.EffortTrackingHGridView(self._model, self.refresh.bind(self), self._controlElement, self.id);
            self.hierarchicalGridView.init();
        }
    });

    hierarchicalGrid.EffortTrackingModel = function (data, modeId) {
        hierarchicalGrid.Model.apply(this, arguments);
    };

    hierarchicalGrid.EffortTrackingModel.prototype = $dyn.extendPrototype(hierarchicalGrid.Model.prototype, {
        updateRow: function (rowData) {
            var self = this;
            self._batchServiceCall( "updateRow", [rowData.effortAtComplete, rowData.recId]);
        },

    });


    //Effort Tracking Hierarchical Grid View Model
    hierarchicalGrid.EffortTrackingHierarchicalGridViewModel = function (data) {
        hierarchicalGrid.HierarchicalGridViewModel.apply(this, arguments);
    };

    hierarchicalGrid.EffortTrackingHierarchicalGridViewModel.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridViewModel.prototype, {
        enableSummarization: true,

        //needed this flag as control is calling recalcSummaries twice. TODO for Daniel to fix it. Or override refreshSummaries to take control.
        treeSummarizedOnLoad: false,

        dataFields: [
            //{ name: "activityNumber", type: "string" }, //TODO: figure out if we need it
            { name: "topologicalId", type: "string" },
            { name: "id", type: "string" },
            { name: "parentId", type: "string" },
            { name: "name", type: "string" },
            { name: "progressPercent", type: "string" },
            { name: "actualEffort", type: "string" },
            { name: "remainingEffort", type: "string" },
            { name: "effortAtComplete", type: "string" },
            { name: "effort", type: "string" },
            { name: "effortVariance", type: "number" },
            { name: "recId", type: "string" }
        ],

        getEffortVariance: function (rowData) {
            //if new Record
            //return 0;
            //planned vs new
            var self = this;
            return self.parseNumber(rowData.effort()) - self.parseNumber(rowData.effortAtComplete());
        },

        getProgressPercent: function (rowData) {
            var self = this;
            var effortAtComplete = self.parseNumber(rowData.effortAtComplete());
            var actualEffort = self.parseNumber(rowData.actualEffort());
            var plannedEffort;

            if ( effortAtComplete > 0){
                return self.parseNumber(actualEffort / effortAtComplete * 100);
            }

            var plannedEffort = self.parseNumber(rowData.effort());
            if (plannedEffort === 0) {
                return 0;
            }

            return 100;
        },

        _recalcSummaries: function (shouldLockSummaries) {
            var self = this;

            if (self.treeSummarizedOnLoad) { return; }

            var rootItem = self.treeRoot;
            var postTraverse = function (node, topologicalId) {
                if (node) {
                    var children = node.__Children;
                    node.topologicalId(topologicalId);
                    if (topologicalId) {
                        topologicalId += self.topologicalIDSeparator;
                    }
                    //TODO: Investigate if effort (plannedEffort), effortAtComplete and remaining effort for summary tasks are aggregate of children;
                    if (!children || (children && children.length === 0)) {
                        node.effort (node.effort() || 0);
                        node.actualEffort (node.actualEffort() || 0); //TODO: This is definitely not the aggregate as we can have effort assigned to summary tasks. Keeping it simple for now.
                        node.effortAtComplete (self.parseNumber(node.effortAtComplete() || node.effort())); //TODO: Should the second condition be 0 or node.effort?
                        node.remainingEffort(self.parseNumber(node.effortAtComplete() - node.actualEffort())); 
                    } else {
                        node.effort (0); //calculate from children
                        node.actualEffort (self.parseNumber(node.actualEffort()) || 0)
                        node.effortAtComplete (0); //calculate from children
                        node.remainingEffort (self.parseNumber(node.effortAtComplete()) - self.parseNumber(node.actualEffort()));
                        var childrenCount = children.length;
                        for (var i = 0; i < childrenCount; i++) {
                            postTraverse (children[i], topologicalId + (i + 1));
                            node.effort (node.effort() + self.parseNumber(children[i].effort()));
                            node.actualEffort (node.actualEffort() + self.parseNumber(children[i].actualEffort()));
                            node.effortAtComplete (node.effortAtComplete() + self.parseNumber(children[i].effortAtComplete()));
                            node.remainingEffort (node.remainingEffort() + self.parseNumber(children[i].remainingEffort()));
                        }
                    }
					node.remainingEffort._last = node.remainingEffort(); 				
                    node.effortVariance(self.getEffortVariance(node));
                    node.progressPercent(self.getProgressPercent(node));
					node.progressPercent._last = node.progressPercent(); 
                }
            }

            if (rootItem) {  postTraverse(rootItem, ""); }

            self.treeSummarizedOnLoad = true;
        },

        propagateRemainingEffort: function (data, diff) {

            var self = this;
			diff = self.parseNumber(diff)
            self.propagateRemainingEffortToAncestors(data, diff);
            self.propagateRemainingEffortToChildren(data, diff);
            self._view._reloadGrid(false, true);
        },

        propagateRemainingEffortToAncestors: function (data, diff) {
            var self = this;
            data = data.__Parent;
            while (data && data.__Parent) {
                data.effortAtComplete(self.parseNumber(data.effortAtComplete() + diff));
                data.remainingEffort(self.parseNumber(data.remainingEffort() + diff));
                data.effortVariance(self.getEffortVariance(data));
                data = data.__Parent;
            }
        },

        propagateRemainingEffortToChildren: function (data, diff) {
            var self = this;
            var postTraverse = function (nodes, parentOldValue, parentNewValue) {
                var nodesCount = nodes.length;
                var oldValue;
                var currentNode;
                for (var i = 0; i < nodesCount; i++) {
                    currentNode = nodes[i];
                    oldValue = currentNode.remainingEffort();

                    if (parentOldValue === 0) {
                        currentNode.remainingEffort(0);
                    }  
					else {
                        currentNode.remainingEffort(self.parseNumber(parentNewValue / parentOldValue * oldValue));
                    }
                   
                    if (self.isLeaf(currentNode) === false) {
                        postTraverse(currentNode.__Children, oldValue, currentNode.remainingEffort());
                    }
                    currentNode.effortAtComplete(self.parseNumber(currentNode.remainingEffort() + currentNode.actualEffort()));
					currentNode.progressPercent(self.getProgressPercent(currentNode)); 
                    currentNode.effortVariance(self.getEffortVariance(currentNode));
                }
            }

            if (self.isLeaf(data) === false) {
                postTraverse(data.__Children, data.remainingEffort() - diff, data.remainingEffort());
            }
        },
    });

    hierarchicalGrid.modeManager.addMode(hierarchicalGrid.EffortTrackingMode, true);

})($dyn.projectManagement = $dyn.projectManagement || {}, jQuery);

//# sourceURL=WBSEffortTrackingView.js

// SIG // Begin signature block
// SIG // MIIoQQYJKoZIhvcNAQcCoIIoMjCCKC4CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // MtEqXuYZ7lrrG6PJQaaIvsJJg7ynsi8AqGRtN+Chz5ug
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
// SIG // DQEJBDEiBCDdP5nm/lZCNp+fOqn+2UgTo+M14Yb5kObB
// SIG // dnDe0XH/qjBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAIMcXxl+
// SIG // FxUUaCbEGgQivpQZt6jIbjIIkk0jpYGKDvQjOxeE4GwV
// SIG // 1pGXBp/E1lbXqX1PzVlf1kEy17EHs3v2S+tg2uhe3FWj
// SIG // oVXtL824qMxqEfJaEKEYYvNJGJ9cnGcId3vYHZzN1AJx
// SIG // BZJrCOSKs7E4m8p0ImKZRSLC+YFTBN0sczk1EuXrTY9G
// SIG // QSFx8LJzPE/1lVDQtM4fKhgLd7onAKvmEAcQczkfg0Io
// SIG // OsBDOU4ZxP99hquqdkMmRWNslbLwu+WeCIG9V5xWeQ3/
// SIG // XH2Nd0MMTf6ng+rR0VP6uk0cNfpeRg4KFqsoc9dDX0On
// SIG // FezDnpDLcyE7HGyWKTI4H1ve1cShghetMIIXqQYKKwYB
// SIG // BAGCNwMDATGCF5kwgheVBgkqhkiG9w0BBwKggheGMIIX
// SIG // ggIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWgYLKoZIhvcN
// SIG // AQkQAQSgggFJBIIBRTCCAUECAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgcf+EYFrVwxKCIj9OXdps
// SIG // qI/wiegLD9av6NXPYtSofl4CBmbrQ3lu3RgTMjAyNDEx
// SIG // MDUyMTQzMDguODIzWjAEgAIB9KCB2aSB1jCB0zELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMScwJQYD
// SIG // VQQLEx5uU2hpZWxkIFRTUyBFU046NDAxQS0wNUUwLUQ5
// SIG // NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WgghH7MIIHKDCCBRCgAwIBAgITMwAAAf7Q
// SIG // qMJ7NCELAQABAAAB/jANBgkqhkiG9w0BAQsFADB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0yNDA3MjUx
// SIG // ODMxMThaFw0yNTEwMjIxODMxMThaMIHTMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
// SIG // Hm5TaGllbGQgVFNTIEVTTjo0MDFBLTA1RTAtRDk0NzEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBALy8IRcVpagON6JbBODwnoGeJkn7B9mE0ihGL/Bp
// SIG // 99+tgZmsnHX+U97UMaT9zVputmB1IniEF8PtLuKpWsuA
// SIG // DdyKJyPuOzaYvX6OdsXQFzF9KRq3NHqlvEVjd2381zyr
// SIG // 9OztfIth4w8i7ssGMigPRZlm3j42oX/TMHfEIMoJD7cA
// SIG // 61UBi8jpMjN1U4hyqoRrvQQhlUXR1vZZjzK61JT1omFf
// SIG // S1QgeVWHfgBFLXX6gHapc1cQOdxIMUqoaeiW3xCp03XH
// SIG // z+k/DIq9B68E07VdodsgwbY120CGqsnCjm+t9xn0ZJ9t
// SIG // eizgwYN+z/8cIaHV0/NWQtmhze3sRA5pm4lrLIxrxSZJ
// SIG // YtoOnbdNXkoTohpoW6J69Kl13AXqjW+kKBfI1/7g1bWP
// SIG // aby+I/GhFkuPYSlB9Js7ArnCK8FEvsfDLk9Ln+1VwhTR
// SIG // W4glDUU6H8SdweOeHhiYS9H8FE0W4Mgm6S4CjCg4gkbm
// SIG // +uQ4Wng71AACU/dykgqHhQqJJT2r24EMmoRmQy/71gFY
// SIG // 1+W/Cc4ZcvYBgnSv6ouovnMWdEvMegdsoz22X3QVXx/z
// SIG // Qaf9S5+8W3jhEwDp+zk/Q91BrdKvioloGONh5y48oZdW
// SIG // wLuR34K8gDtwwmiHVdrY75CWstqjpxew4I/GutCkE/UI
// SIG // HyX8F5692Som2DI2lGwjSA58c9spAgMBAAGjggFJMIIB
// SIG // RTAdBgNVHQ4EFgQUb857ifUlNoOZf+f2/uQgYm2xxd0w
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNVHSUBAf8E
// SIG // DDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMCB4AwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAIk+DVLztpcPtHQzLbAbsZl9
// SIG // qN5VUKp0JLiEwBiBgoCPrJe2amTkw3fC6sbB+Blgj087
// SIG // XN7a/AIAb7GCM1oxcIqAowkDg6taATFjcxLCs3JB8QM2
// SIG // KOUs3uzj5DANwwMVauEkkfMvk0QthnDndCUXmdZT5YZT
// SIG // 5fVyPs/DoLTj5kJyy4j/as6Ux8Bc3vrG6kp/HHpHbjGX
// SIG // S8hyZNzYsNwJ4JVP1k8xrEAHXIfUlVeCx4n1J5sE39It
// SIG // O4irU5TZKt28dYsloOze4xmQAUVk9pl/mAFR5Stu7fZ/
// SIG // lrWG5+nDiTV+i7B/MT1QUWACEVZFrDMhAHaD/Xan2mc8
// SIG // Fxpo7lUPd9TYcx44xvhH8NdfA145N1at6lCNa3t+MzDE
// SIG // 0c2WRMPNhbqRd74lzUdw1TpUvSR+MeXpnyDWtbrkmnOh
// SIG // eAniQg9RmpH0uw+WsjbGmdnvrAVIetilU5YRLEER2UcA
// SIG // k8W4sdWOIicPjwzS3NB39fal9l4l9LtkjPQlk047M/Ur
// SIG // woyCksQmRQjb/86SiJbB8e4UDUB0jGyodP8MJ/OroiAC
// SIG // xI2s1LMxNPl+q3Dmw31OIfzv9L5mxdwTEfuOawGTABEy
// SIG // bEQz8RyQqP+VxoVnYPy6CeV1gazgy+OGDazexUZxxAAK
// SIG // 9OrH5amfHnldxbgynT+YdfVlJxlsDtR/2Y1MzqFRold4
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
// SIG // ZWxkIFRTUyBFU046NDAxQS0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wi
// SIG // IwoBATAHBgUrDgMCGgMVAIRjRw/2u0NG0C1lRvSbhsYC
// SIG // 0V7HoIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwDQYJKoZIhvcNAQELBQACBQDq1QbIMCIYDzIw
// SIG // MjQxMTA1MjEwNDA4WhgPMjAyNDExMDYyMTA0MDhaMHQw
// SIG // OgYKKwYBBAGEWQoEATEsMCowCgIFAOrVBsgCAQAwBwIB
// SIG // AAICIF4wBwIBAAICE9cwCgIFAOrWWEgCAQAwNgYKKwYB
// SIG // BAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQAC
// SIG // AwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsFAAOC
// SIG // AQEAPDf6MBMjcDil0h+hYChw4fQQ3vkzyDFF/EEkpiH2
// SIG // oMDCU6YtrZ0ZhSxMdfvNPu8a0H68SsLpjmm7iW6PDYKD
// SIG // +XX1OpUImDz2QxM2rGYcIDnoCEPQ6lV+wDegQYsBqvs8
// SIG // WAy355r5nsCiuXPImJLVidnHyG/N44bGEEQkPLcyu7i0
// SIG // 2XwmdVnUoQxO5BxnckOSOvf+nXHRyYSWi0WtDoImk29Y
// SIG // NWjToRfFcTbs5NwQWbTyDvb3fMLUVLRB6+oe58JfnYti
// SIG // OQ2Iro+jOk/9UrjnAXTpXOOlSukrwEm0rkf++uylID6f
// SIG // bFclpD+ripYmy2j58YKyVl4v8WA6frM38tyWcDGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAAB/tCowns0IQsBAAEAAAH+MA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIPdcaFSVtmmSwcVW
// SIG // fAsB2OLc2+ms/nDwm/oN32kbB3yxMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgEYXM3fxTyJ8Y0fdptoT1
// SIG // qnPrxjhtfvyNFrZArLcodHkwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAf7QqMJ7NCEL
// SIG // AQABAAAB/jAiBCBGmAoGRqR4aWH1CbkHmo3YUjp8W5xB
// SIG // c7IbwJ0WNQJutzANBgkqhkiG9w0BAQsFAASCAgAAmxSM
// SIG // 77QDnBOQMes2s2IedelzQTtgQ/Iuhu82QyOmAmb3Ab2c
// SIG // t9diukmzor/Juq5gRzn8zwSHAR2fx6Pj9gcp6aV9pHaC
// SIG // L6HnAg47ifTYuMWpkGTnChq7qvepNX9oLVDRmjfWHnhC
// SIG // nIW3+0fBJcjlo7fg25d0R7Rkrz6Fu4TKFtMhBGgiAnMw
// SIG // c7hRVzFsm8U8UHyjMtK1nDaByP5afWQIU3DQVLPdS0NM
// SIG // OGuty3xCGgtEb9tFVeOtugTu8UVYXJ2NbFFo3UcgiCQ4
// SIG // 8KdLWFFODs1DuwnjGmxEFeUsdQ0IxFkMZeB00zX5gQ7s
// SIG // qB3qSMMCXYvhmyESWbSf4eERZJ3KUTHpQSNvmF6vAd5m
// SIG // e+h5iSBkDaRGHfMtaIfydjg9wPrYNOm6FbESqX4xJfmi
// SIG // ZSNTEbs+XoVcW6zoftGjjhG1F3/vwsvsVSOuAJWQOyzM
// SIG // 6SPXYy+cZEaWngtEuBgQ8ZoU9GQ6644qOf9mybOat89c
// SIG // 0JGgTEYdSiwYlmYcjsdoAoOOp4RUQHHcPvfwIpTpgwYQ
// SIG // Bn226QxwmfLS36M/5++C62BzcAlQvbzyZrMHA8Sd4Zm0
// SIG // bVTjOnSqWt42usXiiCeghGcnRyvEeSzZQGV8v4QrSVji
// SIG // Y6QH9szJddXjGScWJC5SL4GVMe85yHOR8zXu7SrVoFGp
// SIG // ujbh3MeShqIqFoPpkQ==
// SIG // End signature block
