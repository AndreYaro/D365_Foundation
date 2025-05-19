/*!
// <copyright file="WBSTrackingView.js" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
*/
(function (projectManagement, $) {
    "use strict";

    Globalize.addCultureInfo('en', {
        messages: {
            HierarchicalGridCommon_TrackingTitle: "Tracking View",
            HierarchicalGridCommon_CostPercent: "Cost percent",
            HierarchicalGridCommon_ActualCost: "Actual cost",
            HierarchicalGridCommon_RemainingCost: "Remaining cost",
            HierarchicalGridCommon_CostAtComplete: "Cost at complete",
            HierarchicalGridCommon_PlannedCost: "Planned cost",
            HierarchicalGridCommon_CostVariance: "Cost variance",
            HierarchicalGridCommon_CostTracking: "Cost tracking",
            HierarchicalGridCommon_EffortTracking: "Effort tracking",
            HierarchicalGridCommon_ProgressPercent: "Progress percent",
            HierarchicalGridCommon_ActualEffort: "Actual effort",
            HierarchicalGridCommon_RemainingEffort: "Remaining effort",
            HierarchicalGridCommon_EffortAtComplete: "Effort at complete",
            HierarchicalGridCommon_PlannedEffort: "Planned effort",
            HierarchicalGridCommon_EffortVariance: "Effort variance",
            HierarchicalGridCommon_MarkAsComplete: "Mark as complete",
            HierarchicalGridCommon_ViewTransactions: "View transactions",
            HierarchicalGridCommon_HourTransactions: "Hour transactions",
            HierarchicalGridCommon_ItemTransactions: "Item transactions",
            HierarchicalGridCommon_ExpenseTransactions: "Expense transactions",
            HierarchicalGridCommon_MarkInProgress: "Mark as in-progress",
            HierarchicalGridCommon_ConfirmUpdatingDescendentsCost: "Cost projections will be overwritten in all descendent tasks. Proceed?",
            HierarchicalGridCommon_ConfirmUpdatingDescendentsEffort: "Schedule projections will be overwritten in all descendent tasks. Proceed?",
            HierarchicalGridCommon_ConfirmBillingMilestone: "This task has a billing milestone assigned to it. Do you want to mark the milestone as complete to make it available for invoicing? If you select No, you can mark the milestone complete on the Manage contract status form.",
            HierarchicalGridCommon_WarnBillingMilestone: "There are billing milestones assigned to this task. Review and update the completion status of the assigned billing milestone if required, so that there is no unintended impact to invoicing",
            HierarchicalGridCommon_Closed: "Closed",
            HierarchicalGridCommon_Details: "Details",
        }
    });
	
	var ActivityTaskTypeEnum = {
	  NOTSTARTED: 0,
	  INPROGRESS: 1,
	  COMPLETED : 2,
	  WAITING	: 3,
	  DEFERRED	: 4		
	};
	
	var TransactionType = {
		HOUR    : 0, 
		EXPENSE : 1,
		ITEM    : 2
	}; 

	/*Remaining:
	 3) Get the actual for efforts asynchronously. Use init() of the view like we do in planning views
	 4) Get the values from the server	
	*/	
	
    var hierarchicalGrid = projectManagement.hierarchicalGrid || {};
    hierarchicalGrid.test = hierarchicalGrid.test || {};

    var isPageLoading = true;

    hierarchicalGrid.TrackingHGridView = function (model, refreshPage, controlElement, modeId) {

        var self = this;
        self.showCostTrackingView = $dyn.observable(true);
        self.showEffortTrackingView = $dyn.observable(!self.showCostTrackingView);
        self.columns = [
              { text: $dyn.label('HierarchicalGridCommon_WBSID'), dataField: "topologicalId", width: 110, editable: $dyn.observable(false) },
              { text: $dyn.label('HierarchicalGridCommon_WBSTask'), dataField: "name", editable: $dyn.observable(false), width: 300 },
              { text: $dyn.label('HierarchicalGridCommon_CostPercent'), dataField: "costPercent", editable: $dyn.observable(false), width: 150, visible: self.showCostTrackingView },
              { text: $dyn.label('HierarchicalGridCommon_ActualCost'), dataField: "actualCost", editable: $dyn.observable(false), width: 150, visible: self.showCostTrackingView },
              { text: $dyn.label('HierarchicalGridCommon_RemainingCost'), dataField: "remainingCost", width: 150, editable: $dyn.observable(true), visible: self.showCostTrackingView, cellRenderer: self.renderEditableCells.bind(self) },
              { text: $dyn.label('HierarchicalGridCommon_CostAtComplete'), dataField: "costAtComplete", editable: $dyn.observable(false), width: 150, visible: self.showCostTrackingView },
              { text: $dyn.label('HierarchicalGridCommon_PlannedCost'), dataField: "cost", editable: $dyn.observable(false), width: 150, visible: self.showCostTrackingView },
              { text: $dyn.label('HierarchicalGridCommon_CostVariance'), dataField: "costVariance", editable: $dyn.observable(false), width: 150, visible: self.showCostTrackingView },
              { text: "", dataField: "costVarianceIndicator", width: 20, align: "center", cellsAlign: "right", editable: $dyn.observable(false), visible: self.showCostTrackingView, cellRenderer: self.renderCostVarianceIndicator.bind(self), extendedStyle: "cell-status" },
              /*=================================*/
              { text: $dyn.label('HierarchicalGridCommon_ProgressPercent'), dataField: "progressPercent", width: 150, editable: $dyn.observable(true), visible: self.showEffortTrackingView, cellRenderer: self.renderEditableCells.bind(self) },
              { text: $dyn.label('HierarchicalGridCommon_ActualEffort'), dataField: "actualEffort", editable: $dyn.observable(false), width: 150, visible: self.showEffortTrackingView },
              { text: $dyn.label('HierarchicalGridCommon_RemainingEffort'), dataField: "remainingEffort", width: 150, editable: $dyn.observable(true), visible: self.showEffortTrackingView, cellRenderer: self.renderEditableCells.bind(self) },
              { text: $dyn.label('HierarchicalGridCommon_EffortAtComplete'), dataField: "effortAtComplete", editable: $dyn.observable(false), width: 150, visible: self.showEffortTrackingView },
              { text: $dyn.label('HierarchicalGridCommon_PlannedEffort'), dataField: "effort", editable: $dyn.observable(false), width: 150, visible: self.showEffortTrackingView },
              { text: $dyn.label('HierarchicalGridCommon_EffortVariance'), dataField: "effortVariance", editable: $dyn.observable(false), width: 150, visible: self.showEffortTrackingView },
              { text: "", dataField: "effortVarianceIndicator", width: 20, align: "center", cellsAlign: "right", editable: $dyn.observable(false), visible: self.showEffortTrackingView, cellRenderer: self.renderEffortVarianceIndicator.bind(self), extendedStyle: "cell-status" },
              /*=================================*/
              { text: $dyn.label('HierarchicalGridCommon_Closed'), dataField: "closed", editable: $dyn.observable(false), width: 45, cellRenderer: self.renderClosedIndicator.bind(self) },

        ];

        hierarchicalGrid.HierarchicalGridView.apply(this, arguments);
    };


    hierarchicalGrid.TrackingHGridView.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridView.prototype, {
        
        showCostTrackingView : true,
		multiSelect: false,
		taskMarkedComplete : false,
		
		filterable: true,
		filterField: $dyn.observable($dyn.label('HierarchicalGridCommon_WBSTask')),
		viewId: "TrackingView",

		get stateId() {
			var self = this;
			var id = null;
			var rootRow = self._rows[0];
			if (rootRow) {
				id = $dyn.value(rootRow.hierarchyId);
			}	
			return id;
		},
		
		saveState: function(){
			var self = this;
			var id = self.stateId;
			if (id){
				self._saveState(self.viewId, id);
			}
		},
		
		loadState: function(doneLoadCallback) {
			var self = this;
			var id = self.stateId;
			if (id){
				self._loadState(self.viewId, id, doneLoadCallback);
			} else {
				doneLoadCallback();
			}
		},
		
        createViewModel: function (model) {
            return new hierarchicalGrid.TrackingHierarchicalGridViewModel(model, this);
        },
		
		init: function () {
            var self = this;
			var sessContext = self._viewModel._model.getSessionContext();
			self.isEnabled = sessContext.enabled;
            hierarchicalGrid.HierarchicalGridView.prototype.init.call(self);
        },
		
		_initToolbarContainer: function (container, toTheme) {
			var self = this;
			container.append(self._trackingViewSelectButton);
			container.append(self._saveButton);
			container.append(self._refreshButton);
			container.append(self._levelButton);
			container.append(self._markAsCompleteButton);
			container.append(self._viewTransactionsButton);
			container.append(self._detailsButton);
			return container;
		},
		
		renderEditableCells: function(cell, column, rowData) {
			var self = this;
			if(self.isEnabled) {
				$(cell).find("input").css("font-weight", "bold");
			}
		},
		
		renderCostVarianceIndicator: function (cell, column, rowData){
		    var self = this;
		    if (rowData.remainingCost() < 0) {
		        $(cell).find(".checkBox").css("visibility", "visible");
		        if (rowData.costVarianceIndicator()) {
		            $(cell).find(".checkBox").prop('checked', true);
		        }
		        else {
		            $(cell).find(".checkBox").prop('checked', false);
		        }
		    }
		    else {
		        $(cell).find(".checkBox").css("visibility", "hidden");
		    }
		},
		
		renderEffortVarianceIndicator: function (cell, column, rowData){
		    var self = this;
		    if (rowData.remainingEffort() < 0) {
		        $(cell).find(".checkBox").css("visibility", "visible");
		        if (rowData.effortVarianceIndicator()) {
		            $(cell).find(".checkBox").prop('checked', true);
		        }
		        else {
		            $(cell).find(".checkBox").prop('checked', false);
		        }
		    }
		    else {
		        $(cell).find(".checkBox").css("visibility", "hidden");
		    }
		},
		
		renderClosedIndicator: function (cell, column, rowData) {
		    var self = this;
		    $(cell).find(".checkBox").css("visibility", "visible");
		    if (rowData.closed()) {
		        $(cell).find(".checkBox").prop('checked', true);
		    }
		    else {
		        $(cell).find(".checkBox").prop('checked', false);
		    }
		},

		renderRow: function (rowElement, rowData) {
			// overridden to prevent setting the summaries as bold.
		},

		detailsButtonClick: function(event) {
		    var self = this;
		    if (!self.hasInvalidPendingChanges) {
		        var selectedRow = self.getSelectedRow();
		        self.openDetailsForm(selectedRow);
		    }
        },
		
		markasCompleteButtonClick: function(event) {
			var self = this;
			var selectedRow = self.getSelectedRow();
			var wasUpdatingValues = self._updatingValues;
			if (selectedRow.taskType() === ActivityTaskTypeEnum.COMPLETED) {
			    $dyn.context(self._markAsCompleteButton[0]).Label = $dyn.label('HierarchicalGridCommon_MarkAsComplete');
			}else {
			    $dyn.context(self._markAsCompleteButton[0]).Label = $dyn.label('HierarchicalGridCommon_MarkInProgress');
			}	
			self.setUpdatingValues(true);
			if (selectedRow.taskType() === ActivityTaskTypeEnum.COMPLETED) {
			    selectedRow.taskType(ActivityTaskTypeEnum.INPROGRESS);
			    self._viewModel.propagateTaskType(selectedRow);
			    self.setUpdatingValues(wasUpdatingValues);
			    selectedRow.remainingCost(selectedRow.cost() - selectedRow.costAtComplete());
			    if (selectedRow.billingMilestoneExists === '1') {
			        self._showMessage($dyn.label('HierarchicalGridCommon_WarnBillingMilestone'));
			    }
				return;
			}
			
			self.markActivityTaskTypeAsComplete(selectedRow, wasUpdatingValues);
			selectedRow.__isModified = true;
			
			if (selectedRow.taskType() === ActivityTaskTypeEnum.COMPLETED &&
                selectedRow.billingMilestoneExists === '1' &&
                selectedRow.billingMilestoneComplete === '0' &&
                selectedRow.canBillingMilestoneComplete === '0') {
			        $dyn.showMessageBox({
			        showYesButton: true, showNoButton: true,
			        Text: $dyn.label('HierarchicalGridCommon_ConfirmBillingMilestone'),
			        callback: function (btn) {
			            selectedRow.canBillingMilestoneComplete = (btn === $dyn.controls.MessageBox.Button.Yes) ? '1' : '0';
			        }
			    });
			}
		},

		markActivityTaskTypeAsComplete: function (currentRow, oldUpdatingValues) {
		    var self = this;
		    self.taskMarkedComplete = true; 
		    currentRow.taskType(ActivityTaskTypeEnum.COMPLETED);
		    self.setUpdatingValues(false);
		    currentRow.remainingCost(0);
		    currentRow.remainingEffort(0);
		    self.setUpdatingValues(oldUpdatingValues);
		},
		
		trackingViewSelectButtonClick: function(event) {
			var self = this;
			var i;
			self.showCostTrackingView(!self.showCostTrackingView());
			self.showEffortTrackingView(!self.showCostTrackingView());
			self._viewModel.doAction("UpdateSubHeader"); 
		},
		
		createTrackingViewSelectButtonTemplate: function(modeId, methodName) {
			var self = this;
			var mode1 = {} , mode2 = {};
			mode2.label = $dyn.label('HierarchicalGridCommon_CostTracking'); 
			mode1.label = $dyn.label('HierarchicalGridCommon_EffortTracking'); 
			mode1.imageName = 'ToggleList'
			return self._templateFactory.createToggleButtonTemplate(modeId, "Trackingviewselect", methodName, mode1, mode2)
		},
		
		_hourTransactionsButtonClick: function (event) {
			var self = this;
            if (!self.hasInvalidPendingChanges) {
                self.openTransactionsForm(TransactionType.HOUR);
            }
        },
		
		_expenseTransactionsButtonClick: function (event) {
			var self = this;
            if (!self.hasInvalidPendingChanges) {
                self.openTransactionsForm(TransactionType.EXPENSE);
            }
        },
		
		_itemTransactionsButtonClick: function (event) {
			var self = this;
            if (!self.hasInvalidPendingChanges) {
                self.openTransactionsForm(TransactionType.ITEM);
            }
        },
		
		createViewTransactionsButtonTemplate: function (modeId) {
		    var self = this;

		    var menuButtonOption = {
		        label: $dyn.label('HierarchicalGridCommon_ViewTransactions'),
		        name: "viewTransactions"
		    };

		    var hourTransactionsOption = {
		        label: $dyn.label('HierarchicalGridCommon_HourTransactions'),
		        name: "hourTransactions"
		    };
		    hourTransactionsOption["onclickMethodName"] = "_hourTransactionsButtonClick";

		    var expenseTransactionsOption = {
		        label: $dyn.label('HierarchicalGridCommon_ExpenseTransactions'),
		        name: "hourTransactions"
		    };
		    expenseTransactionsOption["onclickMethodName"] = "_expenseTransactionsButtonClick";

			var itemTransactionsOption = {
			    label: $dyn.label('HierarchicalGridCommon_ItemTransactions'),
		        name: "itemTransactions"
		    };
			itemTransactionsOption["onclickMethodName"] = "_itemTransactionsButtonClick";
		    
		    var options = [hourTransactionsOption, expenseTransactionsOption, itemTransactionsOption];
		    
		    return self._templateFactory.createMenuButtonTemplate(modeId, menuButtonOption, options);
		},
		
		openTransactionsForm: function (transactionType) {
		    var self = this;
		    if (!self.hasInvalidPendingChanges) {
		        var selectedRow = self.getSelectedRow();
		        self._viewModel.openTransactionsForm(selectedRow, transactionType, function () {
		        });
		    }
		},

		openDetailsForm: function (rowData) {
		    var self = this;		    
		    self._viewModel.openDetailsForm(rowData, function () {
		    });
		    
		},

		createMarkAsCompleteButtonTemplate: function(modeId, methodName) {
			var self = this;
			return self._templateFactory.createButtonTemplate(modeId, 'Markascomplete', $dyn.label('HierarchicalGridCommon_MarkAsComplete'), 'AssignCompleted', methodName);
		},

		createDetailsButtonTemplate: function (modeId, methodName) {
		    var self = this;
		    return self._templateFactory.createButtonTemplate(modeId, 'Details', $dyn.label('HierarchicalGridCommon_Details'), '', methodName);
		},
		
		_initButtons: function () {
            var self = this; 
			var parent = hierarchicalGrid.HierarchicalGridView.prototype; 
			parent._initButtons.call(this);            
			self._markAsCompleteButton      = self.createMarkAsCompleteButtonTemplate(self._modeId, "markasCompleteButtonClick");			
			self._trackingViewSelectButton 	= self.createTrackingViewSelectButtonTemplate(self._modeId, "trackingViewSelectButtonClick"); 
			self._viewTransactionsButton = self.createViewTransactionsButtonTemplate(self._modeId);
			self._detailsButton = self.createDetailsButtonTemplate(self._modeId, "detailsButtonClick");
        },
		
		//Should not need the following anymore: USe cellValueChangeValidate 
		revertToGivenValue: function(field, rowData, oldValue) {
			var self = this; 
			if(self._model._actions.length == 0) {
				self.disableButton("Save", true);
			}
			rowData.__isModified = false; 
			var wasUpdatingValues = self._updatingValues;
			self.setUpdatingValues(true);

			switch(field) {
				case "remainingCost":
					rowData.remainingCost (oldValue);
					break;
				case "remainingEffort":
					rowData.remainingEffort (oldValue); 				
					break;
				default:
					break;
			}
			
			self.setUpdatingValues(wasUpdatingValues);
		},
		
		rowSelectionChanged: function (lastRowData, nextRowData) {
		    var self = this;
		    var data = nextRowData;

		    if (!self.isEnabled || data.__Level() === 1) {
		        $dyn.context(self._markAsCompleteButton[0]).Label = $dyn.label('HierarchicalGridCommon_MarkAsComplete');
		        self.setRowEditable(false);
		        self.disableButtons(["Markascomplete", "Details"], true);
		        return;
		    }
		    if (!self.isLeaf(data)) {
		        self.setRowEditable(false);
		    }

		    self.disableButtons(["Markascomplete", "Details"], false);
            
		    if (data) {
		        // Closing a task is only allowed for leaf tasks.
		        self.setColumnsEditable(["closed"], self.isLeaf(data));
            
		        if (data.taskType() === ActivityTaskTypeEnum.COMPLETED) {
		            $dyn.context(self._markAsCompleteButton[0]).Label = $dyn.label('HierarchicalGridCommon_MarkInProgress');
		            self.setColumnsEditable(["remainingCost", "remainingEffort", "progressPercent"], false);
		            if (data.closed._current === 'Yes' || data.closed._current === true) {
		                self.disableButtons(["Markascomplete"], true);
		            }
		        }
		        else {
		            $dyn.context(self._markAsCompleteButton[0]).Label = $dyn.label('HierarchicalGridCommon_MarkAsComplete');
		            if (self.isLeaf(data)) {
		                self.setColumnsEditable(["remainingCost", "remainingEffort", "progressPercent"], true);
		            }
		        }
		    }
		},

		preTreeGridLoad: function () {
		    var self = this;
			self._viewModel.treeSummarizedOnLoad = false;
		},
		
		validateCellValueChange: function (event) {
            var self = this;
            var args = event.args;
            var rowData = args.rowData;
            var field = args.field;
			var value = args.value;
			
            switch (field) {
				case "progressPercent":
				    if ((rowData.actualEffort() && value <= 0) || value > 100) {
						if(!rowData.progressPercent._last) 
						    rowData.progressPercent._last = 0;
						return false;
					}	
					break;
				default:
					break;
			}
			return true; 
		},
		
        cellValueChanged: function (event) {
            var self = this;
            var args = event.args;
            args.oldValue = (args.oldValue === 'Yes' ? true : (args.oldValue === 'No' ? false : args.oldValue));

            var value = self.parseNumber(args.value);
            var oldValue = self.parseNumber(args.oldValue);
            var rowData = args.rowData;
            var field = args.field;		

			if(oldValue === value)
			{
				rowData.__isModified = false;
				return;
			}
			
			var callBack = function (btn) 	{
				if (btn === $dyn.controls.MessageBox.Button.Yes) {
					self.handleUpdate(field,rowData, value, oldValue);
				}
				else {
				    self.revertToGivenValue(field, rowData, oldValue);
				    if (rowData.taskType() === ActivityTaskTypeEnum.COMPLETED) {
				        $dyn.context(self._markAsCompleteButton[0]).Label = $dyn.label('HierarchicalGridCommon_MarkAsComplete');
				        self.refreshData();
				    }
				}
			};

			switch (field) {
			    case "closed":
			        if (rowData.closed()) {
			            var selectedRow = self.getSelectedRow();
			            var oldUpdatingValues = self._updatingValues;

			            $dyn.context(self._markAsCompleteButton[0]).Label = $dyn.label('HierarchicalGridCommon_MarkInProgress');
			            self.setUpdatingValues(true);
			            self.markActivityTaskTypeAsComplete(selectedRow, oldUpdatingValues);
			            self._viewModel.propagateTaskType(selectedRow);
			            self.disableButtons(["Markascomplete"], true);
			        }
			        break;
			    default:
			        break;
			}
			
			if(self.isLeaf(rowData) === false && !self.taskMarkedComplete){
				self.taskMarkedComplete = false; 
				$dyn.showMessageBox({
					showYesButton: true, showNoButton: true,
					Text: $dyn.label('HierarchicalGridCommon_ConfirmUpdatingDescendentsCost'),
					callback: function (btn) {
					    if (btn === $dyn.controls.MessageBox.Button.Yes) {
					        var currentRow = self.getSelectedRow();
					        self._viewModel.propagateTaskType(currentRow);
					        self._viewModel.propagateConfirmUser(currentRow);
					    }
					    callBack.bind(self);
					}
				})
			}
			else{
				self.handleUpdate(field, rowData, value, oldValue);
			}

        },

		handleUpdate: function (field, rowData, value, oldValue) {
		    var self = this; 
		    var oldRemainingCost;
		    var oldRemainingEffort;
		    var actualEffort;
		    var actualCost;

		    var wasUpdatingValues = self.isUpdatingValues();
		    self.setUpdatingValues(true);
		    switch (field) {
			
		        case "remainingCost":
		            actualCost = self.parseNumber(rowData.actualCost());
		            //changing remaining cost changes the costAtComplete using actual cost and remaining
		            //this value will be persisted and will be used to load the data next time.
		            rowData.costAtComplete(value + actualCost);
		            rowData.remainingCost(value);
		            rowData.costVariance(self._viewModel.getCostVariance(rowData));
		            rowData.costPercent(self._viewModel.getCostPercent(rowData));
		            if (actualCost > 0) {
		                rowData.costPercent(self._viewModel.getCostPercent(rowData));
		            }
		            self._viewModel.propagateRemainingCost(rowData, value - oldValue);
		            rowData.costVarianceIndicator(self._viewModel.getCostVarianceIndicator(rowData));
		            actualEffort = self.parseNumber(rowData.actualEffort());
		            oldRemainingEffort = self.parseNumber(rowData.remainingEffort());
		            if (rowData.cost() > 0 && rowData.effort() > 0) {
		                rowData.remainingEffort(value / (rowData.cost() / rowData.effort()));
		            }    
		            else if (!rowData.cost() && !rowData.effort() && value && rowData.costPrice() > 0) {
		                rowData.remainingEffort(value / rowData.costPrice());
		            }
		            rowData.effortAtComplete(self.parseNumber(rowData.remainingEffort()) + self.parseNumber(rowData.actualEffort()));
		            rowData.effortVariance(self._viewModel.getEffortVariance(rowData));
		            rowData.progressPercent(self._viewModel.getProgressPercent(rowData));
		            self._viewModel.propagateRemainingEffort(rowData, self.parseNumber(rowData.remainingEffort()) - oldRemainingEffort);
		            rowData.effortVarianceIndicator(self._viewModel.getEffortVarianceIndicator(rowData));
		            break;

		        case "progressPercent":
		            actualEffort = self.parseNumber(rowData.actualEffort());

		            if (actualEffort > 0 || value === 100) {
		                rowData.progressPercent(value);
		                oldRemainingEffort = self.parseNumber(rowData.remainingEffort());
		                oldRemainingCost = rowData.remainingCost();
		                actualCost = self.parseNumber(rowData.actualCost());

		                //remaining effort needs to be updated before calling propagateRemainingEffort
		                rowData.remainingEffort(self.parseNumber((100 * actualEffort) / value - actualEffort));
		                if (!rowData.effort()) {
		                    rowData.remainingCost(0);
		                }
		                else {
		                    rowData.remainingCost(rowData.remainingCost() + ((rowData.cost() / rowData.effort()) * (rowData.remainingEffort() - oldRemainingEffort)));
		                }
		                rowData.costAtComplete(actualCost + rowData.remainingCost());
		                rowData.costVariance(self._viewModel.getCostVariance(rowData));
		                rowData.costPercent(self._viewModel.getCostPercent(rowData));
		                rowData.effortVariance(self._viewModel.getEffortVariance(rowData));
		                rowData.effortAtComplete(self.parseNumber(rowData.remainingEffort()) + self.parseNumber(rowData.actualEffort()));
		                self._viewModel.propagateRemainingEffort(rowData, self.parseNumber(rowData.remainingEffort()) - oldRemainingEffort)
		                self._viewModel.propagateRemainingCost(rowData, (rowData.remainingCost() - oldRemainingCost));
		            }
		            else {
		                rowData.progressPercent(0);
		            }
		            rowData.effortVariance(self._viewModel.getEffortVariance(rowData))
		            rowData.effortVarianceIndicator(self._viewModel.getEffortVarianceIndicator(rowData));
		            rowData.costVarianceIndicator(self._viewModel.getCostVarianceIndicator(rowData));
		            self._executeOperation(self._viewModel.updateRow,
						[rowData],
						"Update",
						self._updateButton);

		            break;
					
		        case "remainingEffort":
		            oldValue = self.parseNumber(oldValue);
		            value = self.parseNumber(value);
		            oldRemainingCost = rowData.remainingCost();
		            //changing remaining effort changes the effortAtComplete using actual effort and remaining
		            //this value will be persisted and will be used to load the data next time.
		            rowData.effortAtComplete(self.parseNumber((value + self.parseNumber(rowData.actualEffort()))));
		            rowData.remainingEffort(value);
		            rowData.effortVariance(self._viewModel.getEffortVariance(rowData));
		            rowData.progressPercent(self._viewModel.getProgressPercent(rowData));
		            if (rowData.taskType() != ActivityTaskTypeEnum.COMPLETED) {
		                actualCost = self.parseNumber(rowData.actualCost());
		                if ((!rowData.effort() && !rowData.remainingEffort()) || rowData.costPrice() <= 0) {
		                    rowData.remainingCost(0);
		                }
		                else if (rowData.effort()) {
		                    rowData.remainingCost(rowData.remainingCost() + (rowData.costPrice() * (value - oldValue)));
		                } 
		                else {
		                    rowData.remainingCost(rowData.costPrice() * rowData.remainingEffort());
		                }
		                rowData.costAtComplete(actualCost + rowData.remainingCost());
		                rowData.costVariance(self._viewModel.getCostVariance(rowData));
		                rowData.costPercent(self._viewModel.getCostPercent(rowData));
		                self._viewModel.propagateRemainingCost(rowData, (rowData.remainingCost() - oldRemainingCost));
		            }
		            self._viewModel.propagateRemainingEffort(rowData, value - oldValue);
		            rowData.costVarianceIndicator(self._viewModel.getCostVarianceIndicator(rowData));
		            rowData.effortVarianceIndicator(self._viewModel.getEffortVarianceIndicator(rowData));
		            break;
					
                default: break;
            }
		    self.setUpdatingValues(wasUpdatingValues);
		    self.taskMarkedComplete = false;
		},

		updateUI: function (action) {
		    var self = this;
		    //Disable the columns and buttons by default when the page is loading.
		    if (isPageLoading){
		        isPageLoading = false;
		        self.setColumnsEditable(["remainingCost", "remainingEffort", "progressPercent", "closed"], false);
		        self.disableButtons(["Markascomplete", "Details"], true);
		        return;
		    }

		    hierarchicalGrid.HierarchicalGridView.prototype.updateUI.apply(this, arguments);
		}

    });	

    //Cost Tracking Mode
    hierarchicalGrid.TrackingMode = function (data, controlElement, output, onReady) {
        hierarchicalGrid.Mode.apply(this, arguments);
    };

    hierarchicalGrid.TrackingMode.prototype = $dyn.extendPrototype(hierarchicalGrid.Mode.prototype, {
        id: "Tracking",

        title: $dyn.label('HierarchicalGridCommon_TrackingTitle'),

        createModel: function (data, modeId) {
            return new hierarchicalGrid.TrackingModel(data, modeId);
        },

        load: function () {
            var self = this;
            self.hierarchicalGridView = new hierarchicalGrid.TrackingHGridView(self._model, self.refresh.bind(self), self._controlElement, self.id);
            self.hierarchicalGridView.init();
        }
    });

    hierarchicalGrid.TrackingModel = function (data, modeId) {
        hierarchicalGrid.Model.apply(this, arguments);
    };

    hierarchicalGrid.TrackingModel.prototype = $dyn.extendPrototype(hierarchicalGrid.Model.prototype, {
        updateRowInternal: function (rowDataObservable) {
            var self = this;
            self._batchServiceCall("updateRow", [rowDataObservable.costAtComplete(), rowDataObservable.effortAtComplete(), rowDataObservable.recId(), rowDataObservable.taskType(), rowDataObservable.activityNumber(), rowDataObservable.closed(), rowDataObservable.canBillingMilestoneComplete]);
		},
		
		isLeaf: function(rowData) {
			return !(rowData.__Children && rowData.__Children.length > 0) 
		},
		
		updateRow: function (rowData) {
            var self = this;
            self._batchServiceCall("updateRow", [rowData.costAtComplete, rowData.effortAtComplete, rowData.recId, rowData.taskType, rowData.activityNumber, rowData.closed, rowData.canBillingMilestoneComplete]);
			if (!self.isLeaf(rowData)) {			
                self.updateChildren(rowData.__Children);
			}
		},
		
		updateChildren: function(nodes) {
			var self = this;
			var nodesCount = nodes.length;
			var currentNode;
			for (var i = 0; i < nodesCount; i++) {
				currentNode = nodes[i];
				self.updateRowInternal(currentNode);
				if (!self.isLeaf(currentNode)) {
					self.updateChildren(currentNode.__Children);
				}
			}
		},
		
		openTransactionsForm: function (rowData, transactionType, callBack) {
            var self = this;
            var args = [rowData.recId(), transactionType];
            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("openTransactionsForm",
                                            args,
                                            callBack);
                });
            };
			self.save(saveCallback);
		},

		openDetailsForm: function (rowData, callBack) {
		    var self = this;
		    var args = [rowData.recId()];
		    var saveCallback = function () {
		        $dyn.async(function () {
		            self._callService("openDetailsForm",
                                            args,
                                            callBack);
		        });
		    };
		    self.save(saveCallback);
		}
	});

    //Tracking Hierarchical Grid View Model
    hierarchicalGrid.TrackingHierarchicalGridViewModel = function (data) {
        hierarchicalGrid.HierarchicalGridViewModel.apply(this, arguments);
    };

    hierarchicalGrid.TrackingHierarchicalGridViewModel.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridViewModel.prototype, {
        enableSummarization: true,
		
		taskTypeToEnum : {
			"NotStarted": ActivityTaskTypeEnum.NOTSTARTED,
			"InProgress": ActivityTaskTypeEnum.INPROGRESS,
			"Completed": ActivityTaskTypeEnum.COMPLETED,
			"Waiting": ActivityTaskTypeEnum.WAITING,
			"Deferred": ActivityTaskTypeEnum.DEFERRED
		},

        //needed this flag as control is calling recalcSummaries twice. TODO for Daniel to fix it. Or override refreshSummaries to take control.
        treeSummarizedOnLoad: false,

        dataFields: [
            { name: "id", type: "string" },
            { name: "parentId", type: "string" },
            { name: "taskType", type: "number" },
            { name: "topologicalId", type: "string" },
            { name: "activityNumber", type: "string" },
            { name: "name", type: "string" },
            { name: "costPercent", type: "real" }, //calculated
            { name: "actualCost", type: "real" },
            { name: "remainingCost", type: "real" }, //calculated
            { name: "costAtComplete", type: "real" },
            { name: "costPrice", type: "real" },
            { name: "cost", type: "real" },
            { name: "costVariance", type: "real" }, //calculated
            { name: "costVarianceIndicator", type: "boolean" },
            { name: "progressPercent", type: "real" }, //calculated
            { name: "actualEffort", type: "real" },
            { name: "remainingEffort", type: "real" },
            { name: "effortAtComplete", type: "real" },
            { name: "effort", type: "real" },
            { name: "effortVariance", type: "real" }, //calculated
            { name: "effortVarianceIndicator", type: "boolean" }, //calculated
            { name: "closed", type: "boolean" },
            { name: "recId", type: "string" }
        ],

        getCostVariance: function (rowData) {
            //if new Record
            //return 0;
            //planned vs new
            var self = this;
            return self.parseNumber(rowData.cost()) - self.parseNumber(rowData.costAtComplete());
        },

        getEffortVariance: function (rowData) {
            //if new Record
            //return 0;
            //planned vs new
            var self = this;
            return self.parseNumber(rowData.effort()) - self.parseNumber(rowData.effortAtComplete());
        },

		
        getCostPercent: function (rowData) {
            var self = this;
            var costAtComplete = self.parseNumber(rowData.costAtComplete());
            var actualCost = self.parseNumber(rowData.actualCost());
            var plannedCost;

            if (costAtComplete > 0) {
                return self.parseNumber(actualCost / costAtComplete * 100);
            }

            var plannedCost = self.parseNumber(rowData.cost());
            if (plannedCost === 0) {
                return 0;
            }

            return 100;
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
		
		getCostVarianceIndicator: function (rowData) {
			if (rowData.remainingCost < 0) {
				return 1;  // "Bad" icon.
			}
			else {
				return 0;  // "Good" icon.
			}
		},
		
		getEffortVarianceIndicator: function (rowData) {
			if (rowData.remainingEffort < 0) {
				return 1;  // "Bad" icon.
			}
			else {
				return 0;  // "Good" icon.
			}
		},
	
		computeTopologicalIds: true,

		preserveOldValues: function(node) {
			var self = this;
			node.remainingCost._last = node.remainingCost(); 
			node.remainingEffort._last = node.remainingEffort(); //TODO: Will need to move as it can be calculated later
		},

		setCalculatedValues: function(node) {
			var self = this;
			node.costVariance(self.getCostVariance(node));
			node.costPercent(self.getCostPercent(node));
			node.progressPercent(self.getProgressPercent(node));			
			node.effortVariance(self.getEffortVariance(node));
		},
		
		processLeaf: function(node) {
			var self = this;
			node.taskType(self.taskTypeToEnum[node.taskType()]);
			node.cost(self.parseNumber(node.cost()) || 0);
			node.effort(self.parseNumber(node.effort())||0);
			node.actualCost(self.parseNumber(node.actualCost()) || 0); //TODO: This is definitely not the aggregate as we can have cost assigned to summary tasks. Keeping it simple for now.
			node.actualEffort(self.parseNumber(node.actualEffort()) || 0);
			if (node.taskType() != ActivityTaskTypeEnum.COMPLETED) {
			    node.effortAtComplete(self.parseNumber(node.effortAtComplete() || self.parseNumber(node.effort())));
			    node.costAtComplete(self.parseNumber(node.costAtComplete()) || self.parseNumber(node.cost()));
			    node.remainingCost(self.parseNumber(node.costAtComplete()) - self.parseNumber(node.actualCost()));
			    node.remainingEffort(self.parseNumber(node.effortAtComplete() - node.actualEffort()));
			}
			else {
			    node.remainingCost(0);
			    node.remainingEffort(0);
			    node.costAtComplete(self.parseNumber(node.actualCost()));
			    node.effortAtComplete(self.parseNumber(node.actualEffort()));
			}
			node.costVarianceIndicator(self.getCostVarianceIndicator(node));
			node.effortVarianceIndicator(self.getEffortVarianceIndicator(node));
			self.preserveOldValues(node);
			self.setCalculatedValues(node);
		},

		summarize: function(node) {
			var self = this;
			var children = node.__Children;
			node.cost(0); //calculate from children
			node.actualCost(self.parseNumber(node.actualCost()) || 0);
			node.costAtComplete(0); //calculate from children
			node.remainingCost(self.parseNumber(node.costAtComplete()) - self.parseNumber(node.actualCost()));
			node.effort (0); //calculate from children
			node.actualEffort (self.parseNumber(node.actualEffort()) || 0)
			node.effortAtComplete (0); //calculate from children
			node.remainingEffort (self.parseNumber(node.effortAtComplete()) - self.parseNumber(node.actualEffort()));
			node.taskType(self.taskTypeToEnum[node.taskType()]);
			var childrenCount = children.length;
			for (var i = 0; i < childrenCount; i++) {
				node.cost(node.cost() + self.parseNumber(children[i].cost()));
				node.actualCost(node.actualCost() + self.parseNumber(children[i].actualCost()));
				node.costAtComplete(node.costAtComplete() + self.parseNumber(children[i].costAtComplete()));
				node.remainingCost(node.remainingCost() + self.parseNumber(children[i].remainingCost()));
				node.effort (node.effort() + self.parseNumber(children[i].effort()));
				node.actualEffort (node.actualEffort() + self.parseNumber(children[i].actualEffort()));
				node.effortAtComplete (node.effortAtComplete() + self.parseNumber(children[i].effortAtComplete()));
				node.remainingEffort (node.remainingEffort() + self.parseNumber(children[i].remainingEffort()));
			}
			node.costVarianceIndicator(self.getCostVarianceIndicator(node));
			node.effortVarianceIndicator(self.getEffortVarianceIndicator(node));
			self.preserveOldValues(node);
			self.setCalculatedValues(node);
		},		
		
		recalcSummaries: function(shouldLockSummaries) {
			var self = this;				
			if (self.treeSummarizedOnLoad) { return; }
			self.isSummarizing = true;
			self._recalcSummaries(shouldLockSummaries);
			self.treeSummarizedOnLoad = true;
			self.isSummarizing = false;			
		},	

        propagateRemainingCost: function (data, diff) {
            var self = this;
            self.propagateRemainingCostToAncestors(data, diff);
            self.propagateRemainingCostToChildren(data, diff);
            self._view._reloadGrid(undefined, true);
        },

        propagateRemainingCostToAncestors: function (data, diff) {
            var self = this;
            data = data.__Parent;
            while (data && data.__Parent) {
                data.costAtComplete(data.costAtComplete() + diff);
                data.remainingCost(data.remainingCost() + diff);
                data.costPercent(self.getCostPercent(data))
                data.costVariance(self.getCostVariance(data));
				data.costVarianceIndicator(self.getCostVarianceIndicator(data));
                data = data.__Parent;
            }
        },
		
		openTransactionsForm: function (row, transactionType, callBack) {
            var self = this;
            self._model.openTransactionsForm(row, transactionType, callBack);
		},

		openDetailsForm: function (row, callBack) {
		    var self = this;
		    self._model.openDetailsForm(row, callBack);
		},

        propagateRemainingCostToChildren: function (data, diff) {
            var self = this;
            var postTraverse = function (parent, nodes, parentOldValue, parentNewValue) {
                var nodesCount = nodes.length;
                var oldValue;
                var currentNode;
                for (var i = 0; i < nodesCount; i++) {
                    currentNode = nodes[i];
                    oldValue = currentNode.remainingCost();

                    if (parentOldValue === 0) {
                        currentNode.remainingCost(0);
                    } else {
                        currentNode.remainingCost(self.parseNumber(parentNewValue / parentOldValue * oldValue));
                    }
					if (self.isLeaf(currentNode) === false) {
                        postTraverse(currentNode, currentNode.__Children, oldValue, currentNode.remainingCost());
                    }
                    currentNode.costAtComplete(currentNode.remainingCost() + currentNode.actualCost());
                    currentNode.costVariance(self.getCostVariance(currentNode));
                    currentNode.costPercent(self.getCostPercent(currentNode));
					currentNode.costVarianceIndicator(self.getCostVarianceIndicator(currentNode)); 
                }
            }

            if (self.isLeaf(data) === false) {
				var oldRemainingCost = self.parseNumber(data.remainingCost()) - diff;
                postTraverse(data, data.__Children, oldRemainingCost, self.parseNumber(data.remainingCost()));
            }
        },

        propagateConfirmUser: function (data) {
            var self = this;
            if (!self.isLeaf(data)) {
                self.propagateConfirmUserToChildren(data);
            }
        },

        propagateConfirmUserToChildren: function (data) {
            var self = this;
            var postTraverse = function (parent, nodes) {
                var nodesCount = nodes.length;
                var currentNode;
                for (var i = 0; i < nodesCount; i++) {
                    currentNode = nodes[i];
                    currentNode.canBillingMilestoneComplete = parent.canBillingMilestoneComplete;
                    if (self.isLeaf(currentNode) === false) {
                        postTraverse(currentNode, currentNode.__Children);
                    }
                }
            }

            if (self.isLeaf(data) === false) {
                postTraverse(data, data.__Children);
            }
        },

        propagateTaskType: function (data) {
            var self = this;
            if (!self.isLeaf(data)) {
                self.propagateTaskTypeToChildren(data);
                self._view._reloadGrid(undefined, true);
            }
        },

        propagateTaskTypeToChildren: function (data) {
            var self = this;
            var postTraverse = function (parent, nodes) {
                var nodesCount = nodes.length;                
                var currentNode;
                for (var i = 0; i < nodesCount; i++) {
                    currentNode = nodes[i];
                    currentNode.taskType(parent.taskType());
                    if (self.isLeaf(currentNode) === false) {
                        postTraverse(currentNode, currentNode.__Children);
                    }                    
                }
            }

            if (self.isLeaf(data) === false) {
                postTraverse(data, data.__Children);
            }
        },

		propagateRemainingEffort: function (data, diff) {
            var self = this;
			diff = self.parseNumber(diff)
            self.propagateRemainingEffortToAncestors(data, diff);
            self.propagateRemainingEffortToChildren(data, diff);
            self._view._reloadGrid(undefined, true);
        },

        propagateRemainingEffortToAncestors: function (data, diff) {
            var self = this;
            data = data.__Parent;
            while (data && data.__Parent) {
                data.effortAtComplete(self.parseNumber(data.effortAtComplete() + diff));
                data.remainingEffort(self.parseNumber(data.remainingEffort() + diff));
                data.effortVariance(self.getEffortVariance(data));
				data.progressPercent(self.getProgressPercent(data));
				data.effortVarianceIndicator(self.getEffortVarianceIndicator(data)); 
                data = data.__Parent;
            }
        },

        propagateRemainingEffortToChildren: function (data, diff) {
            var self = this;
            var postTraverse = function (parent, nodes, parentOldValue, parentNewValue) {
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

                    if (parent.taskType() === ActivityTaskTypeEnum.COMPLETED) {
                        currentNode.taskType(ActivityTaskTypeEnum.COMPLETED);
                    }
                   
                    if (self.isLeaf(currentNode) === false) {
                        postTraverse(currentNode, currentNode.__Children, oldValue, currentNode.remainingEffort());
                    }
                    currentNode.effortAtComplete(self.parseNumber(currentNode.remainingEffort() + currentNode.actualEffort()));
					currentNode.progressPercent(self.getProgressPercent(currentNode)); 
                    currentNode.effortVariance(self.getEffortVariance(currentNode));
					currentNode.effortVarianceIndicator(self.getCostVarianceIndicator(currentNode)); 
                }
            }

            if (self.isLeaf(data) === false) {
                postTraverse(data, data.__Children, self.parseNumber(data.remainingEffort() - diff), self.parseNumber(data.remainingEffort()));
            }
        },

    });

    hierarchicalGrid.modeManager.addMode(hierarchicalGrid.TrackingMode);

})($dyn.projectManagement = $dyn.projectManagement || {}, jQuery);

//# sourceURL=WBSCostTrackingView.js

// SIG // Begin signature block
// SIG // MIIoOgYJKoZIhvcNAQcCoIIoKzCCKCcCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // N3G4qfxK9so9y8qAwSskd4ZIfNH1SzOAQlN4IWkvR5qg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAO0wpGR6cZ1ooZ
// SIG // HZdQ0fLPI4gvyaAaQoK+JtppvQm/YTBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAI88AtQlsxWBX+yyTSzwn2qLODGvQRGK
// SIG // AW207w/zplzyvzg3edUx0Oja8eszfF2mJixC4dqKCpCt
// SIG // UCvkyLif94Was7LQBFc0x/DhDEbRkEENeXFQFLM1IfQ5
// SIG // L6sbp3rrDpX5z7wr4zp6wugT7a5yUUgsxJDwS8fEJYLr
// SIG // yoVN6p2GEfd4EkwVqtT1rIGEw9bKAgp6t0L5KAiK7OfG
// SIG // S65zYu4FnGnJOkp8PSLVEMAzPYpT6jTCAtJij57Cs2dA
// SIG // 7P2CZiw2zBg2ytPQ4LpHD0d5Yb1rPpbFROFVhL/GlxUK
// SIG // zKJBl8PLI+IysLpTINXIkfOrOiBWy/zdj7CxQ5rgd2LG
// SIG // Oz6hgheXMIIXkwYKKwYBBAGCNwMDATGCF4Mwghd/Bgkq
// SIG // hkiG9w0BBwKgghdwMIIXbAIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // 8UUwT/iwT+mwMTAyAb5uflDw2eHpyYxM3E0cRrFvVDUC
// SIG // BmcakHgaOBgTMjAyNDExMDUyMTQzMTAuMjYyWjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOjMzMDMt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR7TCCByAwggUIoAMCAQIC
// SIG // EzMAAAHm2UKe6gD4feEAAQAAAeYwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjMxMjA2MTg0NTE1WhcNMjUwMzA1MTg0NTE1WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOjMzMDMtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAvb6YfOLYJbhM5v8KTSpQI3BJRs35bygA2dQ/tnf4
// SIG // nmGBLRdhyjKyhhQzi6S1lhuQxMoim5WCqxNp7eeNDhrt
// SIG // +WcdIFyQRNM1mp2RAIwo7eHhgYvrmpGbJO9Mx00Bx8nz
// SIG // /gd5tgUkjRT4YLFSD6er6P/bejnjXsyMF+ROflcBBt+5
// SIG // 2YBHsUBdn0GWG8UNQGrqg70XV7EqStXYdVAbfRGjLM7r
// SIG // nGkeZzMEDerA4xvfRc3SvQLc25+EppbKC1LUQIf++vLC
// SIG // ndGNYTJilR8CF/P+CblEVAUWdCVrtDWEAafJIZLtfEPA
// SIG // gEOdNLRQe1R96Q/M6AOJXAOyZMUxqDyq7n5vpUWQAOIj
// SIG // IG3C2dj/8UnZyhcVPLy99UaDZWSYhi+TKk1778gS8/jE
// SIG // T+BJ/TcntTfMf5SQ9bLXTaOcCRvpoF7BP8384NhmlakH
// SIG // MxR4NDZfG6SKpzRVEXkEatwtY1WDAknHoDcx3mLcOTpm
// SIG // f+3lZ0Zo15QrC73bMTs3NWFZ+p2S5EA+ct9R2KwfYiB7
// SIG // rMIWjL9oSTTY1Z3ZKVsvd+DyGblkzJN+tJI1zxcJdlr9
// SIG // U85vbTqwqvPpeNPCiC+ifnn6BjZEfGAdzPrtbWHlQzv0
// SIG // 3Dmxh8WhhQekGcQFKZ3weTfzJgTcTDqsxtTfEIsFvILY
// SIG // 4zCYhQX+omGKwo7UcBeyD3UCxbUCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBTlBDF57TeePtdWTPkLu0Oa4NxXPTAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAYW7qIE2qUbLsEpGhTEOncrvG
// SIG // QmFKVkPIiK24uNLVNoSuqR4LtIY9M//cxUUceQ34bpI7
// SIG // 24wP3UuVWH8c9RCGz5bfPezCdrARjtmC2MGHpXyaQ8Gw
// SIG // dF0vWZK6qc6ul/5Zg0A59xub3GKWEAieeSy78hZSdfeQ
// SIG // FaOFsvFF+ae4PVtzIDR0DKTPhFeuPnLM4+B6OWkJnihr
// SIG // Ssu8O9nkWP71g7qba7867hTZigiLddlHAOQTrF6dT7ZI
// SIG // 8dskbAo++w0ppdM1WI6lvyElpKxo8nlSfpIc3LcWi5JJ
// SIG // VcAsYoKJA+n5Fm8tIQhCkzkzzM4boDyAHMXB7EdrMdNW
// SIG // EWvaR9s73XbLgRH0hRugo9EErxGfzPZifoeJomkEkewB
// SIG // G1Rg28kSpGJ/NEvtwJkZYd2TnvgRaieezl3XiA0h27x8
// SIG // ye6E6hvPepd3lIT7GYOvXzYMU8Zb0TZkRP/utWI+2dbg
// SIG // dF2ED+tK7DC3U5VWBMmVJeTC0y+S76haM2ZUtl6I4uAR
// SIG // D+nXVU85hyeKHTmTFk03kNCMJ1hvfL1r/66D3oAq9Rut
// SIG // RVa3VyxNwFyH7eGTeGZA056AIT8Ow2TT0ZUluE21Y/y8
// SIG // NF75y2DcDFAPaLmP8MfbXk2ifL05G4GMmjmChc+qzUV2
// SIG // eGn+ntyF8DAn3wmrKSlFwu9mDLuVvC/88k8bDVBIAW0w
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
// SIG // TjozMzAzLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUA4ljQXhSfY72hKzeuA9RvOni9JruggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOrU4BAwIhgPMjAyNDExMDUxODE4
// SIG // NTZaGA8yMDI0MTEwNjE4MTg1NlowdzA9BgorBgEEAYRZ
// SIG // CgQBMS8wLTAKAgUA6tTgEAIBADAKAgEAAgIOfwIB/zAH
// SIG // AgEAAgITTjAKAgUA6tYxkAIBADA2BgorBgEEAYRZCgQC
// SIG // MSgwJjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQow
// SIG // CAIBAAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQCCBUeu
// SIG // BidLoUfWDx0I3EqbDEew0fUrlNr9qvsOU02gwLbKvItg
// SIG // 6DPFWdKWepyw7U87ceJDstZtuw2yjkTTximRxIsz2uKb
// SIG // 5H9THrTUyQO7t8bLIayPZXmlWSJAAFiTamBu4BnXwnjQ
// SIG // R0h+KeVvXUUGuYrikbUCGha2ESeToe2ZJlWDZy+JTU1c
// SIG // 47LEUJK4lBbo5oy9RPD6/PDrxOTt166NpKdAFfQlFlrw
// SIG // RNMUDU4SSXKDWMxhqTsgt9YkewmrDzJsRzPMKAKVqcYN
// SIG // SjBzcWDUAPZo+3L+iB2sig7680j1zhr9MkVxGf49wtVt
// SIG // 008FS3Oj6ZR/1xg/kaKoRLkCvFVvMYIEDTCCBAkCAQEw
// SIG // gZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAHm2UKe6gD4feEAAQAAAeYwDQYJYIZIAWUDBAIBBQCg
// SIG // ggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAv
// SIG // BgkqhkiG9w0BCQQxIgQgzwMATrhhoWzBGL6CGegzst0A
// SIG // sIHudGE1lKyXktPT5bwwgfoGCyqGSIb3DQEJEAIvMYHq
// SIG // MIHnMIHkMIG9BCDPu6OGqB6zCWhvIJyztateoSGHEZ6M
// SIG // uhZzgm50g9LGWTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAAB5tlCnuoA+H3hAAEAAAHm
// SIG // MCIEIOlDC7OsK3fIHHbx0RP/EVOJ3v5Dp7cPKEw1viw1
// SIG // Gn1yMA0GCSqGSIb3DQEBCwUABIICAJ+hbRtPE5A8SJjY
// SIG // Kr3UTbntERslc3m28gqq5yfphwuPRx4IUHLY908x8uMV
// SIG // Dlj8p4rZiCNuxfAHm1ba+SPgXR9cIhWo0gKJeJUdKh51
// SIG // BmclqxrroDEhL7PBOkN2+Qbu3NsSSkDpZjpLr/ETGn9i
// SIG // muu2MzKeP/Div+ur9a3JPPYoky5Ns5/IajV4sVvX6Qpc
// SIG // kokQpjSSBQV4xmSlYcwn7CW1h7RF33mmHTuomr146lSM
// SIG // OUoGNkcPzgy2U6mySQ7oqdSvbEdL2cIrz+VqpCqHaYi1
// SIG // Pj5kTqBaP6u7I8h5g196XeoadUF4F3mL9wL4PhuqBort
// SIG // OR5BNu+twB2hpeOFrDUvf0GDTRQvznHVTguk2GXB/s3r
// SIG // 1u2XuUZitzY0RH6CLAr/tVnKzNNs6bCaxAVTbOVIa4ce
// SIG // tS3wOsr7LF4AdOYfbL3CL/YWw1VSPi4g813cfJjcloLm
// SIG // FEOtR+vvwcBuBMCzw/ObVxW8Ze3kKz6hOf74ImaOY3yE
// SIG // TLsNBvXxaRh9BhkNwEBY3Ge2WQYvjxOYYoj4wKyJbpQi
// SIG // oCR0TJNjEIyoVpqwHkNXFZ6gNj8EyHkhH8mtO47QB6vY
// SIG // za3NS8MGW/hnXLa7BnQ+HxZ/T4fn9XKmLow/U9Sa9l3d
// SIG // gUHSJuNFmxEpzHt6ZDMwvzvsJocOYukaDmVnavCdA5s7
// SIG // aMAvlbl5
// SIG // End signature block
