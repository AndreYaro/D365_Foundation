/*!
// <copyright file="WBSCostPlanningView.js" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
*/
(function (projectManagement, $) {
    "use strict";

    Globalize.addCultureInfo('en', {
        messages: {
            HierarchicalGridCommon_WBSCostPlanningTitle: "Estimated Costs and Revenue",
            HierarchicalGridCommon_WBSID: "WBS ID",
            HierarchicalGridCommon_WBSTask: "Task",
            HierarchicalGridCommon_DeleteWarning: "This will delete all estimate lines for the selected task and any child tasks. Are you sure you want to continue?",
            HierarchicalGridCommon_TransType: "Transaction type",
            HierarchicalGridCommon_Description: "Description",
            HierarchicalGridCommon_WBSCategory: "Category",
            HierarchicalGridCommon_WBSResourceCategory: "Role",
            HierarchicalGridCommon_WBSResource: "Resource",
            HierarchicalGridCommon_SalesCategory: "Sales category",
            HierarchicalGridCommon_ItemNumber: "Item number",
            HierarchicalGridCommon_LineProperty: "Line property",
            HierarchicalGridCommon_Quantity: "Quantity",
            HierarchicalGridCommon_UnitCost: "Unit cost price",
            HierarchicalGridCommon_UnitSales: "Unit sales price",
            HierarchicalGridCommon_TotalCost: "Total cost price",
            HierarchicalGridCommon_TotalSales: "Total sales price",
            HierarchicalGridCommon_InvalidProjTransType: "Invalid value for project transaction type",
            HierarchicalGridCommon_CategoryMissingError: "Field 'Category' must be specified.",
            HierarchicalGridCommon_ItemIdMissingError: "Field 'Item ID' should not be empty",
            HierarchicalGridCommon_ValidNumber: "Please enter a valid number.",
            HierarchicalGridCommon_PositiveNumber: "Please enter a positive number.",
            HierarchicalGridCommon_LinePropertyMissing: "Field 'Line Property' must be filled",
            HierarchicalGridCommon_ProductDimension: "Product dimension",
            HierarchicalGridCommon_TransTypeHour: "Hour",
            HierarchicalGridCommon_TransTypeFee: "Fee",
            HierarchicalGridCommon_TransTypeItem: "Item",
            HierarchicalGridCommon_TransTypeExpense: "Expense",
            HierarchicalGridCommon_RoleChangeWarning: "Role cannot be updated because the task has resources assigned to it.",
            HierarchicalGridCommon_DeleteConfirmationMessage: "Are you sure you want to delete all marked records?"
        }
    });

    var publishState = false;
    var hierarchicalGrid = projectManagement.hierarchicalGrid || {};
    hierarchicalGrid.test = hierarchicalGrid.test || {};

    hierarchicalGrid.CostPlanningHGridView = function (model, refreshPage, controlElement, modeId) {
        var self = this;
        self._viewModel = self.createViewModel(model);
        self.columns = [
          { text: $dyn.label('HierarchicalGridCommon_WBSID'), dataField: "topologicalId", width: 80, editable: $dyn.observable(false) },
          { text: $dyn.label('HierarchicalGridCommon_WBSTask'), dataField: "name", editable: $dyn.observable(false), width: 250, align: "center", cellsAlign: "left" },
          { text: $dyn.label('HierarchicalGridCommon_TransType'), dataField: "projTransType", editable: $dyn.observable(true), width: 100, range: self.projTransTypeRange.bind(self) },
          { text: $dyn.label('HierarchicalGridCommon_Description'), dataField: "description", editable: $dyn.observable(true), width: 250, align: "center", cellsAlign: "left"},
          { text: $dyn.label('HierarchicalGridCommon_WBSCategory'), dataField: "projCategoryId", editable: $dyn.observable(true), width: 110, align: "center", cellsAlign: "left",range: self.projCategoryRange.bind(self) },
          { text: $dyn.label('HierarchicalGridCommon_WBSResourceCategory'), dataField: "resourceCategoryStr", width: 150, align: "center", cellsAlign: "center", editable: $dyn.observable(false), range: self.resourceCategoryRange.bind(self) },		 
          { text: $dyn.label('HierarchicalGridCommon_Quantity'), dataField: "quantity", editable: $dyn.observable(true), width: 90, cellsFormat: "f2", align: "center", cellsAlign: "right", cellRenderer: self.renderDecimalCell.bind(self) },
          { text: $dyn.label('HierarchicalGridCommon_UnitCost'), dataField: "unitCostPrice", editable: $dyn.observable(true), width: 120, cellsFormat: "f2", align: "right", cellsAlign: "right", cellRenderer: self.renderDecimalCell.bind(self) },
          { text: $dyn.label('HierarchicalGridCommon_UnitSales'), dataField: "unitSalesPrice", editable: $dyn.observable(true), width: 120, cellsFormat: "f2", align: "center", cellsAlign: "right", cellRenderer: self.renderDecimalCell.bind(self) },
          { text: $dyn.label('HierarchicalGridCommon_TotalCost'), dataField: "totalCostPrice", editable: $dyn.observable(false), width: 120, cellsFormat: "f2", align: "center", cellsAlign: "right" },
          { text: $dyn.label('HierarchicalGridCommon_TotalSales'), dataField: "totalSalesPrice", editable: $dyn.observable(false), width: 120, cellsFormat: "f2", align: "center", cellsAlign: "right" },
          { text: $dyn.label('HierarchicalGridCommon_ItemNumber'), dataField: "itemId", editable: $dyn.observable(true), width: 120, align: "center", cellsAlign: "left", range: self.itemNumberRange.bind(self)},
          { text: $dyn.label('HierarchicalGridCommon_SalesCategory'), dataField: "salesCategory", editable: $dyn.observable(true), width: 100, align: "center", cellsAlign: "left" },
          { text: $dyn.label('HierarchicalGridCommon_LineProperty'), dataField: "projLinePropertyId", editable: $dyn.observable(true), width: 110, align: "center", cellsAlign: "left", range: self.projLinePropertyIdRange.bind(self) },
        ];
        var sessContext = self._viewModel._model.getSessionContext();
        self.isEnabled = sessContext.enabled;
        hierarchicalGrid.HierarchicalGridView.apply(this, arguments);
    };

    hierarchicalGrid.CostPlanningHGridView.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridView.prototype, {

        createViewModel: function (model) {
            return new hierarchicalGrid.CostPlanningHierarchicalGridViewModel(model, this);
        },

        filterable: true,
        filterField: $dyn.observable($dyn.label('HierarchicalGridCommon_Task')),
        lastSelectedRowId: null,
        wbsProject: "project",
        viewId: "CostPlanningView",
        wbsStateChanged: false,

        get stateId() {
            var self = this;
            var id = null;
            var rootRow = self._rows[0];
            if (rootRow) {
                id = $dyn.value(rootRow.hierarchyId);
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

        sessionContextCallback: function (previousSessionContext, newSessionContext) {
            var self = this;
            if ((previousSessionContext.isPublished !== newSessionContext.isPublished)
                && (previousSessionContext.projWBSType.toLowerCase() === self.wbsProject)) {
                self.wbsStateChanged = true;
                self.updateColumnStateForProject(newSessionContext.isPublished);
                self.updateUI(newSessionContext.isPublished ? "Published" : "Draft");
            }
			
            if (previousSessionContext.showDifference !== newSessionContext.showDifference) {
                self.updateUI();
            }
			
            return false;
        },

        preReloadRows: function() {
            var self = this;
            if (self.wbsStateChanged) {
                self.preRefreshRows = 0;
                self._viewModel.pageIndex = 0;
                self.wbsStateChanged = false;
            } else  {
                self.preRefreshRows = self._getSelectedRowIndex();
                if (self.preRefreshRows < 0) {
                    self.preRefreshRows = 0;
                }
            }
        },

		
        updateColumnStateForProject: function (isPublished) {
            var self = this;
            var shouldEnabled = !isPublished;
            var selectedRow = self.getSelectedRow();
            if (!self.isEnabled) {
                shouldEnabled = false;
            }
            if (!selectedRow) {
                return;
            }
            self.setColumnsEditable(['projTransType', 'description', 'projCategoryId', 'resourceCategoryStr', 'quantity', 'unitCostPrice', 'unitSalesPrice', 'itemId', 'salesCategory', 'projLinePropertyId'], shouldEnabled);
        },

        validateProjTransType: function (value) {
            var self = this;
            if (value !== $dyn.label('HierarchicalGridCommon_TransTypeHour') &&
                value !== $dyn.label('HierarchicalGridCommon_TransTypeExpense') &&
                value !== $dyn.label('HierarchicalGridCommon_TransTypeFee') &&
                value !== $dyn.label('HierarchicalGridCommon_TransTypeItem')) {
                return { message: $dyn.label('HierarchicalGridCommon_InvalidProjTransType'), result: false };
            }

            return true;
        },

        validateRange: function (event) {
            var self = this;
            var args = event.args;
            var rowData = args.rowData;
            var field = args.field;

            if (field === "projCategoryId" && self._viewModel.categoryTypes.length === 8) { //if category validation is set to "Lookup" we need to allow users to type in categories that are valid, but do not appear in the lookup    
                var value = args.value;
                var ret = true;
                if (value) {
                    //If entered value was something other than blank.
                    var column = self.column(field);
                    if (column) {
                        //If view defined the proper range.
                        ret = false;
                        //Use begin with match
                        var beginWithRegex = new RegExp('^' + value, 'i');
                        var match = undefined
                        var valueRange = self.getValidateRangeSource(rowData.projTransType());
                        for (var ci = 0; ci < valueRange.length; ci++) {
                            //locate best match.
                            var rangeValue = valueRange[ci]["category"];
                            if (rangeValue === value) {
                                //exact match found, should return true.
                                ret = true;
                                break;
                            } else if (!match && rangeValue.match(beginWithRegex)) {
                                //found an approximate match, continue looking
                                match = rangeValue;
                            }
                        }
                        if (!ret) {
                            if (match) {
                                rowData[field](match);
                            } else {
                                self._lastCellValid = false;
                                var fieldValue = rowData[field];
                                fieldValue(fieldValue._last || "");
                            }
                        }
                    }
                }
                return ret;
            }
            else { //otherwise validate as normal
                return hierarchicalGrid.HierarchicalGridView.prototype.validateRange.apply(this, arguments);
            }
        },

        validateCellValueChange: function (event) {
            var self = this;
            var args = event.args;
            var value = args.value;
            var field = args.field;
            var validated = true;
            
            switch (field) {
                case "quantity":
                case "unitCostPrice":
                case "unitSalesPrice":
                case "totalCostPrice":
                case "totalSalesPrice":
                    var parsedValue = self._viewModel.parseNumber(value, true);
                    if (parsedValue === "NAN" || parsedValue < 0) {
                        validated = false;
                    }
                    break;
                case "projTransType":
                    validated = self.validateProjTransType(value)
                    break;
                case "resourceCategoryStr":
                    var rowData = args.rowData;
                    validated = self.validateRoleChange(rowData);
                    break;
                default:
                    break;
            }

            return validated;
        },

        validateRoleChange: function (rowData) {
            var self = this;
            if (rowData.taskHasAnyResourceAssigned() === 1) {           
                self._showMessage($dyn.label('HierarchicalGridCommon_RoleChangeWarning'));
                return false;
            }
            return true;
        },

        renderDecimalCell: function (cell, column, rowData) {
            var self = this;
            var field = column.dataField;
            var value = rowData[field];
            if (rowData.__Children.length > 0) {
                $(cell).find("input").css("visibility", "hidden");
            } else {
                $(cell).find("input").css("visibility", "");
            }
        },

        deleteButtonClick: function () {
            var self = this;
            var selectedRows = self.getSelectedRows(true);
            var count = 0;

            $dyn.showMessageBox({
                showYesButton: true,
                showNoButton: true,
                Text: $dyn.label("HierarchicalGridCommon_DeleteConfirmationMessage"),
                callback: function (btn) {
                    if (btn === $dyn.controls.MessageBox.Button.Yes) {
                        self.setUpdatingValues(true);
                        for (var ri = 0; ri < selectedRows.length; ri++) {
                            var selectedRow = selectedRows[ri];
                            var shouldDelete = self.validateDelete(selectedRow);

                            if (shouldDelete) {
                                self._undoManager.beginEntry(hierarchicalGrid.actionTypes.Delete, selectedRow.id());
                                self._executeOperation(self._viewModel.deleteRow,
                                    [selectedRow],
                                    "Delete",
                                    self._deleteButton);
                                count += self._undoManager.endEntry();
                            }
                        }
                        self.setUpdatingValues(false);
                        self._reloadGrid(-1);
                        self.updateUI("Delete");
                    }
                }
            });
            
            return count;
        },

        itemNumberRange: function(){
            var self = this;
            return self._viewModel.itemNumbers.map(function(item){return item.itemNumber});
        },
		
        createItemIdLookup: function (popupForm, inputElement, rowData, field) {
            var self = this;
            var columns = [
				{ text: 'Item number', columntype: 'textbox', dataField: 'itemNumber', width: 100, editable: false },
				{ text: 'Search name', columntype: 'textbox', dataField: 'searchName', width: 120, editable: false },
				{ text: 'Item type', columntype: 'textbox', dataField: 'itemType', width: 100, editable: false },
				{ text: 'Product', columntype: 'textbox', dataField: 'product', width: 160, editable: false }
            ];

            var dataFields = [
				{ name: "itemNumber", type: "string" },
				{ name: "searchName", type: "string" },
				{ name: "itemType", type: "string" },
				{ name: "product", type: "string" }
            ];
            var itemNumbers = self._viewModel.itemNumbers;
            return self._createGridLookup(popupForm, inputElement, columns, dataFields, "itemNumber", self._viewModel.itemNumbers, false);
        },

        projTransTypeRange: function() {
            var self = this;
            return self._viewModel.transactionTypes;
        },
		
        createProjTransTypeLookup: function (popupForm, inputElement) {
            var self = this;
            var items = [];
            var tts = self._viewModel.transactionTypes;
            for (var loop = 0; loop < tts.length; loop++) {
                var item = {};
                item["Label"] = tts[loop];
                item["Value"] = tts[loop];
                items.push(item);
            }
            return self._createListLookup(popupForm, inputElement, items);
        },

        projLinePropertyIdRange: function() {
            var self = this;
            return self._viewModel.lineProperties;
        },
		
        createProjLinePropertyIdLookup: function (popupForm, inputElement) {
            var self = this;
            var items = [];
            var tts = self._viewModel.lineProperties;
            for (var loop = 0; loop < tts.length; loop++) {
                var item = {};
                item["Label"] = tts[loop];
                item["Value"] = tts[loop];
                items.push(item);
            }
            return self._createListLookup(popupForm, inputElement, items);
        },

        projCategoryRange: function(){
            var self = this;
            var selectedRow = self.getSelectedRow();
            var range = [];
            if (selectedRow){
                range = self.getEditorSource(selectedRow.projTransType());
                return range.map(function (categoryType) { return categoryType.category });
            }
            return range;
        },
		
        createProjCategoryLookup: function (popupForm, inputElement, rowData) {
            var self = this;
            var columns = [
				{ text: 'Category', columntype: 'textbox', dataField: 'category', width: 100, editable: false },
				{ text: 'Category name', columntype: 'textbox', dataField: 'categoryName', width: 170, editable: false }
            ];

            var dataFields = [
				{ name: "category", type: "string" },
				{ name: "categoryName", type: "string" }
            ];
            var categoryTypes = self.getEditorSource(rowData.projTransType());
            return self._createGridLookup(popupForm, inputElement, columns, dataFields, "category", categoryTypes, false);
        },

        createSalesCategoryLookup: function (popupForm, inputElement) {
            var self = this;
            return self._createTreeLookup(popupForm, inputElement, self._viewModel.salesCategories);
        },

        resourceCategoryRange: function() {
            var self = this;
            return Object.keys(self._viewModel.resourceCategoryStrToRecIdMap);
        },
		
        createResourceCategoryLookup: function (popupForm, inputElement) {
            var self = this;
            var items = [];
            var resourceCategoryStrToRecIdMap = self._viewModel.resourceCategoryStrToRecIdMap;
            for (var resourceCategory in resourceCategoryStrToRecIdMap) {
                var item = {};
                item["Label"] = resourceCategory;
                item["Value"] = resourceCategory;
                items.push(item);
            }
            return self._createListLookup(popupForm, inputElement, items);
        },

        createLookup: function (popupForm, inputElement, rowData, field) {
            var self = this;

            switch (field) {
                case "itemId":
                    return self.createItemIdLookup(popupForm, inputElement, rowData, field);
                    break;
                case "projTransType":
                    $dyn.log("projTranstype created");
                    return self.createProjTransTypeLookup(popupForm, inputElement);
                    break;
                case "projLinePropertyId":
                    return self.createProjLinePropertyIdLookup(popupForm, inputElement);
                    break;
                case "projCategoryId":
                    return self.createProjCategoryLookup(popupForm, inputElement, rowData);
                    break;
                case "salesCategory":
                    return self.createSalesCategoryLookup(popupForm, inputElement);
                    break;
                case "resourceCategoryStr":
                    return self.createResourceCategoryLookup(popupForm, inputElement);
                    break;
                default:
                    break;
            }
            return null;
        },

        getEditorSource: function (transType) {
            var self = this;
            var source;

            if (transType === $dyn.label('HierarchicalGridCommon_TransTypeHour')) {
                source = self._viewModel.categoryTypes[0];
            } else if (transType === $dyn.label('HierarchicalGridCommon_TransTypeFee')) {
                source = self._viewModel.categoryTypes[1];
            } else if (transType === $dyn.label('HierarchicalGridCommon_TransTypeItem')) {
                source = self._viewModel.categoryTypes[2];
            } else if (transType === $dyn.label('HierarchicalGridCommon_TransTypeExpense')) {
                source = self._viewModel.categoryTypes[3];
            } else {
                source = [];
            }
            return source;
        },

        getValidateRangeSource: function (transType) {
            var self = this;
            var source;

            if (transType === $dyn.label('HierarchicalGridCommon_TransTypeHour')) {
                source = self._viewModel.categoryTypes[4];
            } else if (transType === $dyn.label('HierarchicalGridCommon_TransTypeFee')) {
                source = self._viewModel.categoryTypes[5];
            } else if (transType === $dyn.label('HierarchicalGridCommon_TransTypeItem')) {
                source = self._viewModel.categoryTypes[6];
            } else if (transType === $dyn.label('HierarchicalGridCommon_TransTypeExpense')) {
                source = self._viewModel.categoryTypes[7];
            } else {
                source = [];
            }
            return source;
        },
		
        setControlEnabledState: function(projTransType, rowData) {
            var self = this;
            self.setColumnsEditable(["topologicalId", "name"], false);
            self.disableButtons(["ProductDimension"], true);
            switch (projTransType) {
                case $dyn.label('HierarchicalGridCommon_TransTypeItem'):
                    self.setColumnsEditable(["Resource"], false);
                    if (rowData.itemId().trim() != "") {
                        self.setColumnsEditable(["salesCategory"], false);
                    }
                    else if (rowData.salesCategory().trim() != "" && rowData.itemId().trim() === "") {
                        self.setColumnsEditable(["itemId"], false);
                    }
                    else {
                        self.setColumnsEditable(["itemId", "salesCategory"], true);
                    }
                    self.disableButtons(["ProductDimension"], false);
                    break;
                case $dyn.label('HierarchicalGridCommon_TransTypeHour'):
                    self.setColumnsEditable(["itemId", "salesCategory"], false);
                    break;
                case $dyn.label('HierarchicalGridCommon_TransTypeExpense'):
                    self.setColumnsEditable(["itemId", "salesCategory","resourceCategoryStr"], false);
                    break;
                case $dyn.label('HierarchicalGridCommon_TransTypeFee'):
                    self.setColumnsEditable(["itemId", "salesCategory", "quantity","unitCostPrice"], false);
                    break;
                default:
                    self.disableButtons(["ProductDimension"], true);
                    self.setColumnsEditable(["itemId", "salesCategory"], false);
                    break;
            }			
        },
		
        rowSelectionChanged: function (lastRowData, nextRowData) {
            var self = this;
            var data = nextRowData;
            var projTransType = data.projTransType();
            var sessionContext = self._model.getSessionContext();
			
            self.updateUI("Select", data);
			
            if (data.__Level() === 1 || !self.isLeaf(data)) {
                self.setRowEditable(false);
                self.disableButtons(["ProductDimension"], true);
            } else {
                self.updateColumnStateForProject(sessionContext ? sessionContext.isPublished : false);
                self.setControlEnabledState(projTransType, data);
            }			
        },

        _initToolbarContainer: function (container, toTheme) {
            var self = this;
            container.append(self._addButton);
            container.append(self._saveButton);
            container.append(self._deleteButton);
            container.append(self._refreshButton);
            container.append(self._levelButton);
            if (self._model.autoSync) {
                container.append(self._toggleSyncButton);
            }
            container.append(self._productDimButton);
        },

        updateEstimateCallback: function (rowKey, rowData, getFirstFromDataCollection, estimatesDataCollection) {
            const self = this;
            const estimate = getFirstFromDataCollection(estimatesDataCollection);
            var isUpdating;
            if (estimate) {
                if (estimate.projTransType === $dyn.label('HierarchicalGridCommon_TransTypeFee')) {
                    estimate.quantity = 1;
                }
                if (estimate.projTransType !== $dyn.label('HierarchicalGridCommon_TransTypeItem')) {
                    estimate.salesCategory = "";
                    estimate.itemId = "";
                }

                var isUpdating = self.isUpdatingValues();
                self.setUpdatingValues(true);
                rowData.projTransType(estimate.projTransType);
                rowData.projCategoryId(estimate.projCategoryId);
                rowData.resource(estimate.resource);
                rowData.resourceName(estimate.resourceName);
                rowData.projLinePropertyId(estimate.projLinePropertyId);
                rowData.description(estimate.description);
                rowData.salesCategory(estimate.salesCategory);
                rowData.itemId(estimate.itemId);
                rowData.quantity(estimate.quantity);
                rowData.unitCostPrice(estimate.unitCostPrice);
                rowData.unitSalesPrice(estimate.unitSalesPrice);
                rowData.totalCostPrice(estimate.totalCostPrice);
                rowData.totalSalesPrice(estimate.totalSalesPrice);
                self.setUpdatingValues(isUpdating);
                self._reloadGrid();
            }
        },

        updateEstimateRowTotals: function (rowKey, rowData, totalCostPrice, totalSalesPrice) {
            var self = this;
            if (!rowKey || !rowData) { return; }

            if (!totalCostPrice && totalCostPrice !== 0) {
                totalCostPrice = rowData.totalCostPrice();
            }

            if (!totalSalesPrice && totalSalesPrice !== 0) {
                totalSalesPrice = rowData.totalSalesPrice();
            }

            rowData.totalCostPrice(totalCostPrice);
            rowData.totalSalesPrice(totalSalesPrice);
        },

        isPublished: function () {
            var self = this;
            var sessionContext = self._viewModel._model.getSessionContext();
            if (sessionContext.projWBSType.toLowerCase() === self.wbsProject) {
                return sessionContext.isPublished;
            }
            return false;
        },

        updateUIPostload: function () {
            var self = this;
            self.disableButton("Refresh", false);
            if (!self.isPublished()) {
                self.disableButton("New", false);
            }
        },

        updateUISelect: function (rowData) {
            var self = this;
            if (!self.isPublished()) {
                hierarchicalGrid.HierarchicalGridView.prototype.updateUISelect.apply(this, arguments);
                if (rowData) {
                    if (self._viewModel.isEstimate(rowData) || self.isLeafTask(rowData)) {
                        self.disableButtons(["New"], false);
                    }
                    else {
                        self.disableButtons(["New"], true);
                    }
                }
            }
        },

        updateUIFilter: function () {
            var self = this;
            self.disableButtons(["New"],
                (self._filteredRows !== self._rows || self.isPublished()));
        },

        updateUI: function (action, rowData) {
            var self = this;
            
            if (!self.isEnabled || self._model.getSessionContext().showDifference == true) {
                self.disableButtons(["Save", "New", "Delete", "ProductDimension"], true);
                return;
            }

            if (action == "Select") {
                if (!rowData) {
                    rowData = self.getSelectedRow();
                }
                self.updateUISelect(rowData);
            } 
            else if (action !== "Draft" && action !== "Published") {
                hierarchicalGrid.HierarchicalGridView.prototype.updateUI.call(this, action);
            }
            switch (action) {
                case "Draft":
                    self.disableButtons(["New", "Delete"], false);
                    break;
                case "Published":
                    self.disableButtons(["New","Delete" ], true);                   
                    break;
            }
        },

        cellValueChanged: function (event) {
            var self = this;
            var args = event.args;
            var value = args.value;
            var oldValue = args.oldValue;
            var rowData = args.rowData;
            var field = args.field;
            var rowTotalSalesPrice = null;
            var rowTotalCostPrice = null;
            var priceDiff = null;


            $dyn.log("cell value changed");

            //This is possible when the user click on a lead transaction type with no estimates associated with it.
            if (oldValue === undefined && value === "") {
                return;
            }

            var transactionType = rowData.projTransType();
            var projCategoryId = rowData.projCategoryId();
            var hierarchyTaskId = rowData.hierarchyTaskId();
            var itemId = rowData.itemId();
            var quantity = rowData.quantity();
            var resourceRole = rowData.resourceCategoryRecId();
            var resource = rowData.resource();
            var rowKey = rowData.id();
            var unitCostPrice = rowData.unitCostPrice();
            var description = rowData.description();
            var projLineProperty = rowData.projLinePropertyId();
            var unitSalesPrice = rowData.unitSalesPrice();
            var salesCategory = rowData.salesCategory();

            switch (field) {
                case "projTransType":
                    transactionType = args.value;
                    self.setControlEnabledState(transactionType, rowData);
                    if (transactionType === $dyn.label('HierarchicalGridCommon_TransTypeExpense')) {
                        rowData.resourceCategoryRecId("");
                        rowData.resourceCategoryStr("");
                    }
                    self._viewModel.getEstimateDetails(rowKey,
                                                        rowData,
                                                        field,
                                                        hierarchyTaskId,
                                                        transactionType,
                                                        projCategoryId,
                                                        resourceRole,
                                                        resource,
                                                        itemId,
                                                        quantity,
                                                        unitCostPrice,
                                                        description,
                                                        projLineProperty,
                                                        unitSalesPrice,
                                                        salesCategory,
                                                        self.updateEstimateCallback.bind(self));
                    break;
                case "quantity":
                    self._viewModel.getEstimateDetails(rowKey,
                                                        rowData,
                                                        field,
                                                        hierarchyTaskId,
                                                        transactionType,
                                                        projCategoryId,
                                                        resourceRole,
                                                        resource,
                                                        itemId,
                                                        quantity,
                                                        unitCostPrice,
                                                        description,
                                                        projLineProperty,
                                                        unitSalesPrice,
                                                        salesCategory,
                                                        self.updateEstimateCallback.bind(self));
                    var quantityDiff = self._viewModel.parseNumber(value) - self._viewModel.parseNumber(oldValue);
                    rowTotalCostPrice = self._viewModel.parseNumber(rowData.totalCostPrice()) + quantityDiff * self._viewModel.parseNumber(rowData.unitCostPrice());
                    rowTotalSalesPrice = self._viewModel.parseNumber(rowData.totalSalesPrice()) + quantityDiff * self._viewModel.parseNumber(rowData.unitSalesPrice());
                    self.propagateTotalCost(rowData, quantityDiff * self._viewModel.parseNumber(rowData.unitCostPrice()), "cost");
                    self.propagateTotalCost(rowData, quantityDiff * self._viewModel.parseNumber(rowData.unitSalesPrice()), "sales");
                    self.updateEstimateRowTotals(rowKey, rowData, rowTotalCostPrice, rowTotalSalesPrice)
                    break;
                case "unitCostPrice":                                   
                    self._viewModel.getEstimateDetails(rowKey,
                                                        rowData,
                                                        field,
                                                        hierarchyTaskId,
                                                        transactionType,
                                                        projCategoryId,
                                                        resourceRole,
                                                        resource,
                                                        itemId,
                                                        quantity,
                                                        unitCostPrice,
                                                        description,
                                                        projLineProperty,
                                                        unitSalesPrice,
                                                        salesCategory,
                                                        self.updateEstimateCallback.bind(self));
                    break;
                case "unitSalesPrice":
                    priceDiff = (self._viewModel.parseNumber(value) - self._viewModel.parseNumber(oldValue)) * self._viewModel.parseNumber(rowData.quantity());
                    rowTotalSalesPrice = self._viewModel.parseNumber(rowData.totalSalesPrice()) + priceDiff;
                    self.propagateTotalCost(rowData, priceDiff, "sales");
                    self.updateEstimateRowTotals(rowKey, rowData, self._viewModel.parseNumber(rowData.totalCostPrice()), rowTotalSalesPrice);
                    self._reloadGrid();
                    break;
                case "projCategoryId":
                    projCategoryId = args.value;
                    self._viewModel.getEstimateDetails(rowKey,
                                                        rowData,
                                                        field,
                                                        hierarchyTaskId,
                                                        transactionType,
                                                        projCategoryId,
                                                        resourceRole,
                                                        resource,
                                                        itemId,
                                                        quantity,
                                                        unitCostPrice,
                                                        description,
                                                        projLineProperty,
                                                        unitSalesPrice,
                                                        salesCategory,
                                                        self.updateEstimateCallback.bind(self));
                    break;
                case "itemId":
                    itemId = args.value;
                    self.setControlEnabledState(transactionType, rowData);
                    self._viewModel.getEstimateDetails(rowKey,
                                                        rowData,
                                                        field,
                                                        hierarchyTaskId,
                                                        transactionType,
                                                        projCategoryId,
                                                        resourceRole,
                                                        resource,
                                                        itemId,
                                                        quantity,
                                                        unitCostPrice,
                                                        description,
                                                        projLineProperty,
                                                        unitSalesPrice,
                                                        salesCategory,
                                                        self.updateEstimateCallback.bind(self));
                    break;
                case "resourceCategoryStr":
                    var resourceRoleStr = args.value;
                    var resourceCategoryStrToRecIdMap = self._viewModel.resourceCategoryStrToRecIdMap;
                    rowData.resourceCategoryRecId(resourceCategoryStrToRecIdMap[resourceRoleStr]);
                    rowData.resourceCategoryStr._last = args.value;
                    self._viewModel.getEstimateDetails(rowKey,
                                                        rowData,
                                                        field,
                                                        hierarchyTaskId,
                                                        transactionType,
                                                        projCategoryId,
                                                        rowData.resourceCategoryRecId(),
                                                        resource,
                                                        itemId,
                                                        quantity,
                                                        unitCostPrice,
                                                        description,
                                                        projLineProperty,
                                                        unitSalesPrice,
                                                        salesCategory,
                                                        self.updateEstimateCallback.bind(self));

                    break;
                case "salesCategory":
                    self.setControlEnabledState(transactionType, rowData);
                    break;
                default:
                    break;
            }
        },

        propagateTotalCost: function (row, priceDiff, priceType) {
            var self = this;

            while (true) {
                if (row.__Level() === 0) {
                    break;
                }

                switch (priceType) {
                    case "cost":
                        row.totalCostPrice(self._viewModel.parseNumber(row.totalCostPrice()) + priceDiff);
                        break;

                    case "sales":
                        row.totalSalesPrice(self._viewModel.parseNumber(row.totalSalesPrice()) + priceDiff);
                        break;
                }

                row = row.__Parent;
            }

        },

        isLeafTask: function (rowData) {
            var self = this;

            if(self.isLeaf(rowData)) {
                return true;
            }
            if(self._viewModel.isEstimate(rowData.__Children[0])){
                return true;
            }
            return false;
        },

        isItemEstimate: function (rowData) {
            return rowData.projTransType() === $dyn.label('HierarchicalGridCommon_TransTypeItem');
        },

        treeGridLoaded: function () {
            var self = this;
            var treeRoot = self._root.__Children[0];
            publishState = self.isPublished();
            if (treeRoot.__Children.length > 0) {
                self.disableButtons(["New","ProductDimension"], true);
            }
            
            //self.updateColumnStateForProject(publishState ? "Published" : "Draft");
            self.setRowEditable(false);
            self.updateUI(publishState ? "Published" : "Draft");
        },

        _initButtons: function () {
            var self = this;
            hierarchicalGrid.HierarchicalGridView.prototype._initButtons.apply(self, arguments);
            self._productDimButton = self._templateFactory.createButtonTemplate(self._modeId, "ProductDimension", $dyn.label('HierarchicalGridCommon_ProductDimension'), "", "productDimButtonClick");
        },

        init: function () {
            var self = this;
            hierarchicalGrid.HierarchicalGridView.prototype.init.call(self);
            $dyn.async(function () {	
                self._viewModel.getTransactionTypes();
                self._viewModel.getCategoryTypes();
                self._viewModel.retrieveResourceCategories();
                self._viewModel.getLineProperties();
                self._viewModel.getItemNumbers();
                self._viewModel.getSalesCategories();
            });
        },

        productDimButtonClick: function (event) {
            var self = this;
            if (!self.hasInvalidPendingChanges) {
                self.openProductDimForm();
            }
        },

        openProductDimForm: function () {
            var self = this;
            var rowData = self.getSelectedRow();
            if (rowData) {
                self._viewModel.openProductDimForm(rowData, function () {
                    self._viewModel.getEstimateDetails(rowData.id(),
                                                        rowData,
                                                        "itemId",
                                                        rowData.hierarchyTaskId(),
                                                        rowData.projTransType(),
                                                        rowData.projCategoryId(),
                                                        rowData.resourceCategoryRecId(),
                                                        rowData.resource(),
                                                        rowData.itemId(),
                                                        rowData.quantity(),
                                                        rowData.unitCostPrice(),
                                                        rowData.description(),
                                                        rowData.projLinePropertyId(),
                                                        rowData.unitSalesPrice(),
                                                        rowData.salesCategory(),
                                                        self.updateEstimateCallback.bind(self))
                });
            }
        }
    });

    hierarchicalGrid.CostPlanningHierarchicalGridViewModel = function (model, controlElement, treeGridSelector) {
        hierarchicalGrid.HierarchicalGridViewModel.apply(this, arguments);
    };

    hierarchicalGrid.CostPlanningHierarchicalGridViewModel.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridViewModel.prototype, {
        dataFields: [
            { name: "hierarchyTaskId", type: "string" },
            { name: "elementId", type: "string" },
            { name: "id", type: "string" },
            { name: "parentId", type: "string" },
            { name: "topologicalId", type: "string" },
            { name: "name", type: "string" },
            { name: "projTransType", type: "lookup" },
            { name: "description", type: "string" },
            { name: "projCategoryId", type: "lookup" },
            { name: "resourceCategoryRecId", type: "number" },
            { name: "resourceCategoryStr", type: "lookup" },
            { name: "resource", type: "number" },
            { name: "resourceName", type: "string" },
            { name: "quantity", type: "number" },
            { name: "salesCategory", type: "lookup" },
            { name: "itemId", type: "lookup" },
            { name: "unitCostPrice", type: "number" },
            { name: "unitSalesPrice", type: "number" },
            { name: "totalCostPrice", type: "number" },
            { name: "totalSalesPrice", type: "number" },
            { name: "projLinePropertyId", type: "lookup" },
            { name: "recId", type: "string" },
            { name: "estimateNumber", type: "number" },
            { name: "taskHasAnyResourceAssigned", type: "number" },
            { name: '__PendingAsyncOps', type: 'integer', notObservable: true }
        ],

        newRowData: function (row, parent, relativePosition) {
            var self = this;
            var grandParent;

            if (self.isEstimate(parent)) {
                grandParent = parent.__Parent;
                relativePosition = grandParent.__Children.indexOf(parent) + 1;
                parent = grandParent;
            } else {
				parent.__Expanded(true);
			}

            row[self.dataParentIdField] = $dyn.observable($dyn.value(parent[self.dataParentIdField]));
            row.quantity = $dyn.observable(1);
            row.itemId = $dyn.observable("");
            row.salesCategory = $dyn.observable("");
            row.estimateNumber = $dyn.observable(self._getNewEstimateNumber(parent));
			row.__Parent = parent;
            row.hierarchyTaskId = $dyn.observable($dyn.value(parent.hierarchyTaskId()));
            return { newRow: row, relativePosition: relativePosition };
        },

        initializeRowData: function (rowData, parentRowData) {
            const self = this;
            rowData.__PendingAsyncOps = 0;
            return rowData;
        },

        isNonNegativeNumber: function (value) {
            var self = this;
            if (value != "") {
                var number = self.parseNumber(value, true);
                if (isNaN(number)) {
                    return { message: $dyn.label('HierarchicalGridCommon_ValidNumber'), result: false };
                } else if (number < 0)  {
                    return { message: $dyn.label('HierarchicalGridCommon_PositiveNumber'), result: false };
                }
            }
            return true;
        },

        propagateTotalCosts: function (rowData) {
            var self = this;
            self._view.propagateTotalCost(rowData, -1 * rowData.totalCostPrice(), "cost");
            self._view.propagateTotalCost(rowData, -1 * rowData.totalSalesPrice(), "sales");
        },

        deleteRow: function (rowData, bypassModel) {
            var self = this;

            self.deleteRows(rowData);
                        
            return true;
        },

        addRow: function (rowData, bypassModel) {
            const self = this;

            // If this row still has pending asynchronous operations, queue this to run again
            if (self.hasPendingAsyncOps(rowData)) {
                $dyn.async(self.addRow.bind(self, rowData, bypassModel));
                return true;
            }

            // Call the base implementation
            return hierarchicalGrid.HierarchicalGridViewModel.prototype.addRow.call(self, rowData, bypassModel);
        },

        updateRow: function (rowData, bypassModel) {
            const self = this;

            // If this row still has pending asynchronous operations, queue this to run again
            if (self.hasPendingAsyncOps(rowData)) {
                $dyn.async(self.updateRow.bind(self, rowData, bypassModel));
                return true;
            }

            // Call the base implementation
            return hierarchicalGrid.HierarchicalGridViewModel.prototype.updateRow.call(self, rowData, bypassModel);
        },
		

        deleteRows: function (rowData) {
            var self = this;
            var treeGrid = self._treeGrid;
            var keys = [];

            if (self.isLeaf(rowData) && self.isEstimate(rowData)) { //If the row selected is a single estimate
                self._model.deleteRow(rowData);
                self._view._deleteRow(rowData);
                self.propagateTotalCosts(rowData);
            }
            else{ //The row is not an estimate line, traverse through its children and delete all estimate lines.
                
                $dyn.showMessageBox({
                    showYesButton: true, showNoButton: true,
                    Text: $dyn.label('HierarchicalGridCommon_DeleteWarning'),
                    callback: function (btn) {
                        if (btn === $dyn.controls.MessageBox.Button.Yes) {
                            self._model.deleteRow(rowData);
                            self.deleteEstimatesUnderTask(rowData);
                        }
                    }
                });
            }
           
        },

        deleteEstimatesUnderTask: function (rowData) {
            var self = this;
            var toDelete =[];

            var findAndDeleteEstimates = function (rowData, rowToDelete) {
                if (self.isEstimate(rowData)) {
                    rowToDelete.push(rowData);                   
                }
                else
                {
                    var numChildren = rowData.__Children.length;
                    for (var i = 0; i < numChildren; i++){
                        findAndDeleteEstimates(rowData.__Children[i], rowToDelete);
                    }
                }
                return rowToDelete;
            };

            toDelete = findAndDeleteEstimates(rowData, toDelete);

            for (var x = 0; x < toDelete.length; x++) {
                self._view._deleteRow(toDelete[x]);
                self.propagateTotalCosts(toDelete[x]);
            }
            return true;
        },

        isEstimate: function (rowData) {
            //Estimate lines will have an actual estimate number and no children. Any line that is a task will have "0.00" as its estimate number
            return (rowData.estimateNumber() !== "0.00" && rowData.__Children.length === 0);
        },

        openProductDimForm: function (row, callBack) {
            var self = this;
            self._model.openProductDimForm(row, callBack);
        },

        get transactionTypes() {
            var self = this;
            return self._model.transactionTypes;
        },

        get categoryTypes() {
            var self = this;
            return self._model.categoryTypes;
        },

        get resourceCategories() {
            var self = this;
            return self._model.resourceCategories;
        },

        get lineProperties() {
            var self = this;
            return self._model.lineProperties;
        },

        get itemNumbers() {
            var self = this;
            return self._model.itemNumbers;
        },

        get salesCategories() {
            var self = this;
            return self._model.salesCategories;
        },

        set salesCategories(map) {
            var self = this;
            self._model.salesCategories = map;
        },

        get salesCategoryMap() {
            var self = this;
            return self._model._salesCategoryMap || [];
        },

        set salesCategoryMap(map){
            var self = this;
            self._model._salesCategoryMap = map;
        },

        getEstimateDetails: function (rowKey, rowData, fieldChanged, hierarchyTaskId, transactionType, projCategoryId, resourceRole, resource, itemNumber, quantity, unitCostPrice, description, projLineProperty, unitSalesPrice, salesCategory, updateEstimateCallback) {
            const self = this;
            self.incrementPendingAsyncOps(rowData);
            const callback = function () {
                self.decrementPendingAsyncOps(rowData);
                updateEstimateCallback.apply(null, arguments);
            };
            return self._model.getEstimateDetails(rowKey, rowData, fieldChanged, hierarchyTaskId, transactionType, projCategoryId, resourceRole, resource, itemNumber, quantity, unitCostPrice, description, projLineProperty, unitSalesPrice, salesCategory, callback);
        },

        getTransactionTypes: function () {
            var self = this;
            return self._model.getTransactionTypes();
        },

        getCategoryTypes: function () {
            var self = this;
            return self._model.getCategoryTypes();
        },

        get resourceCategoryStrToRecIdMap() {
            var self = this;
            return self._model.resourceCategoryStrToRecIdMap;
        },

        retrieveResourceCategories: function () {
            var self = this;
            return self._model.retrieveResourceCategories();
        },

        getLineProperties: function () {
            var self = this;
            return self._model.getLineProperties();
        },

        getItemNumbers: function () {
            var self = this;
            return self._model.getItemNumbers();
        },

        getSalesCategories: function () {
            var self = this;
            return self._model.getSalesCategories();
        },

        validateModifiedRow: function (rowData) {
            var self = this;
            var validationResult = new hierarchicalGrid.ValidationResult(true, []);
			var messages = validationResult.messages;

			if (!self.isEstimate(rowData)) {
			    return validationResult;
			}

			if (rowData.projLinePropertyId() === "") {
			    messages.push($dyn.label('HierarchicalGridCommon_LinePropertyMissing'));
			}

			switch (rowData.projTransType()) {
			    case $dyn.label('HierarchicalGridCommon_TransTypeHour'):
			    case $dyn.label('HierarchicalGridCommon_TransTypeExpense'):
			    case $dyn.label('HierarchicalGridCommon_TransTypeFee'):
                    if (!rowData.projCategoryId()) {
                        messages.push($dyn.label('HierarchicalGridCommon_CategoryMissingError'));
                    }
                    break;
			    case $dyn.label('HierarchicalGridCommon_TransTypeItem'):
					if (!rowData.salesCategory() && !rowData.itemId().trim()) { 
					    messages.push($dyn.label('HierarchicalGridCommon_ItemIdMissingError'));
					}
                    break;
                default:
                    messages.push($dyn.label('HierarchicalGridCommon_InvalidProjTransType'));
                    break;
			}


            if (messages.length != 0) {
				validationResult.success = false;
			}

            return validationResult;
        },

        renderResourceCategoryString: function (row){
            var self = this;
            if (row.resourceCategoryRecId()) {
                var resourceCategoryStrToRecIdMap = self._model.resourceCategoryStrToRecIdMap;
                if (!jQuery.isEmptyObject(resourceCategoryStrToRecIdMap)) {
                    for (var resourceCategory in resourceCategoryStrToRecIdMap) {
                        if (resourceCategoryStrToRecIdMap[resourceCategory] === row.resourceCategoryRecId()) {
                            row.resourceCategoryStr(resourceCategory);
                            row.resourceCategoryStr._last = resourceCategory;
                            break;
                        }
                    }
                }
            }
        },

        _recalcSummaries: function (node) {
            var self = this;

            var rootItem = self.treeRoot;
            var postTraverse = function (node, topologicalId) {
                var ret;

                if (!node) { return { "cp": 0, "sp": 0 }; }

                var children = node.__Children;
                node.topologicalId(topologicalId);
                if (!children || (children && children.length === 0)) {
                    if (!node.name()) { //no topological ids for estimates
                        node.topologicalId("");
                        self.renderResourceCategoryString(node);
                    } else {
                        node.totalCostPrice(0);
                        node.totalSalesPrice(0);
                    }
                    return { "cp": self.parseNumber(node.totalCostPrice()), "sp": self.parseNumber(node.totalSalesPrice()) };
                }
                if (topologicalId) {
                    topologicalId += self.topologicalIDSeparator;
                }

                node.totalCostPrice(0);
                node.totalSalesPrice(0);
                for (var i = 0; i < children.length; i++) {
                    ret = postTraverse(children[i], topologicalId + (i + 1));
                    node.totalCostPrice(node.totalCostPrice() + self.parseNumber(ret.cp));
                    node.totalSalesPrice(node.totalSalesPrice() + self.parseNumber(ret.sp));
                }
                return { "cp": node.totalCostPrice(), "sp": node.totalSalesPrice() };
            }

            if (rootItem) {
                postTraverse(rootItem, "");
            }
        },

        _getNewEstimateNumber: function (rowData) {
            var self = this;
            var estimateNumber = 0;
            for (var i = 0; i < rowData.__Children.length; i++) {
                if (rowData.__Children[i].estimateNumber() > estimateNumber) {
                    estimateNumber = rowData.__Children[i].estimateNumber();
                }
            }
            return (estimateNumber + 1);
        },

        hasPendingAsyncOps: function (rowData) {
            const self = this;
            return rowData.__PendingAsyncOps > 0;
        },

        incrementPendingAsyncOps: function (rowData) {
            const self = this;
            rowData.__PendingAsyncOps += 1;
        },

        decrementPendingAsyncOps: function (rowData) {
            const self = this;
            rowData.__PendingAsyncOps -= 1;
        },

    });

    hierarchicalGrid.CostPlanningModel = function (data, modelId) {
        var self = this;
        self._newRowMap = [];
        self._salesCategoryMap = [];
        hierarchicalGrid.Model.apply(this, arguments);
    };

    hierarchicalGrid.CostPlanningModel.prototype = $dyn.extendPrototype(hierarchicalGrid.Model.prototype, {
		autoSave: true,
		autoSync: true,
		get transactionTypes() {
            var self = this;
            return self._transactionTypes || [];
        },

        get categoryTypes() {
            var self = this;
            return self._categoryTypes || [];
        },

        get resourceCategories() {
            var self = this;
            return self._resourceCategories || [];
        },

        get lineProperties() {
            var self = this;
            return self._lineProperties || [];
        },

        get itemNumbers() {
            var self = this;
            return self._itemNumbers || [];
        },

        get salesCategories() {
            var self = this;
            return self._salesCategories || [];
        },

        set salesCategories(map) {
            var self = this;
            self._salesCategories = map;
        },

        get salesCategoryMap() {
            var self = this;
            return self._salesCategoryMap || [];
        },

        set salesCategoryMap(map) {
            var self = this;
            self._salesCategoryMap = map;
        },

        get resourceCategoryStrToRecIdMap() {
            var self = this;
            return self._resourceCategoryStrToRecIdMap || {};
        },

        computeResourceCategoryStrToRecIdMap: function (resourceCategories) {
            var self = this;
            var resourceCategoryStrToRecIdMap = {};
            for (var i = 0; i < resourceCategories.length; i++) {
                resourceCategoryStrToRecIdMap[resourceCategories[i].id] = resourceCategories[i].recId;
            }
            return resourceCategoryStrToRecIdMap;
        },
      
        getNewRowIndex: function (uid) {
            var self = this;
            if (uid !== undefined) {
                for (var i = 0; i < self._newRowMap.length; i++) {
                    if (self._newRowMap[i].rowId === uid) {
                        return i;
                    }
                }
            }
            return -1;
        },

        createSalesCategoryMap: function (categories) {
            var self = this;
            
            if (self.salesCategories.length === 0) {
                return;
            }

            if (self.salesCategories[0].Id === 1) {
                return;
            }

            var objMap = [];
            var nameMap = [];
            var recIdMap = [];

            for (var i = 0; i < categories.length; i++) {
                var recId = categories[i].Id;
                var name = categories[i].name;
                var newId = i + 1;
                recIdMap[recId] = newId;
                nameMap[name] = recId;

                var newParentId = recIdMap[categories[i].ParentId];
                if (newParentId === undefined) {
                    newParentId = 0;
                }

                objMap.push({ "name": name, "Id": newId, "ParentId": newParentId });
            }
            self.salesCategoryMap = nameMap;
            self.salesCategories = objMap;
        },

        openProductDimForm: function (rowData, callBack) {
            var self = this;
            var args = [rowData.recId(), rowData.estimateNumber(), rowData.hierarchyTaskId()];
            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("openProductDimForm",
                                            args,
                                            callBack
                                            );
                });
            };

            self.save(saveCallback);
        },

        updateRow: function (rowData) {
            var self = this;
            var salesCategory = self._salesCategoryMap[rowData.salesCategory];

            var args = [rowData.hierarchyTaskId, rowData.recId, rowData.estimateNumber,rowData.projTransType, rowData.projCategoryId, rowData.resourceCategoryRecId, rowData.resource,
                                         rowData.description, rowData.quantity, salesCategory, rowData.unitCostPrice, rowData.unitSalesPrice,
                                         rowData.totalCostPrice, rowData.totalSalesPrice, rowData.projLinePropertyId, rowData.itemId];
            var newRowIndex = self.getNewRowIndex(rowData.uid);
            if (newRowIndex >= 0) {
                self._actions[self._newRowMap[newRowIndex].actionIndex].args = self._dataServicesProvider.formatArgsArray(args);
            }
            else {
                self._batchServiceCall("update", args);
            }
        },

        addRow: function (rowData) {
            var self = this;
            var salesCategory = self._salesCategoryMap[rowData.salesCategory];
            self._newRowMap.push({ "rowId": rowData.uid, "actionIndex": self._actions.length });
            self._undoManager.registerAction(
				hierarchicalGrid.actionTypes.Create,
				rowData.id,
				self._batchServiceCall("add", [rowData.hierarchyTaskId, rowData.estimateNumber, rowData.projTransType, rowData.projCategoryId,
                                           rowData.resourceCategoryRecId, rowData.resource, rowData.description, rowData.quantity, salesCategory, rowData.unitCostPrice,
                                           rowData.unitSalesPrice, rowData.totalCostPrice, rowData.totalSalesPrice,
                                           rowData.projLinePropertyId, rowData.itemId])
		   );
        },

        deleteRow: function (rowData) {
            var self = this;
            var recId = rowData.recId();
            var isParent = false;
            if (rowData.__Children.length > 0) {
                isParent = true;
            }
            var newRowIndex = self.getNewRowIndex(rowData.uid);

            if (recId === undefined) {
                recId = "";
            }
            if (newRowIndex >= 0) {
                self._actions.splice(self._newRowMap[newRowIndex].actionIndex, 1);
                self._newRowMap.splice(newRowIndex, 1);
            }
            else {
				self._undoManager.registerAction(
					hierarchicalGrid.actionTypes.Delete,
					rowData.id,
					self._batchServiceCall("delete", [rowData.hierarchyTaskId(), recId, isParent])
				);
            }

        },

        save: function (successCallback) {
            var self = this;
            hierarchicalGrid.Model.prototype.save.apply(self, arguments);
            self._newRowMap.length = 0;
        },

        getEstimateDetails: function (rowKey, rowData, fieldChanged, hierarchyTaskId, transactionType, projCategoryId, resourceRole, resource, itemNumber, quantity, unitCostPrice, description, projLineProperty, unitSalesPrice, salesCategory, updateEstimateCallback) {
            var self = this;
            $dyn.async(function () {
                self._callService(
                    "updateEstimateDetails",
                    [fieldChanged, hierarchyTaskId, rowData.estimateNumber(), transactionType, projCategoryId, resourceRole, resource, itemNumber, quantity, unitCostPrice, description, projLineProperty, unitSalesPrice, salesCategory],
                    updateEstimateCallback.bind(null, rowKey, rowData, self.getFirstFromDataCollection)
                );
            });
        },

        getTransactionTypes: function () {
            var self = this;
            self._callService("getTransactionTypes",
                                [],
                                function (transactionTypesDataCollection) {
                                    self._transactionTypes = self.getItemsFromDataCollection(transactionTypesDataCollection);
                                }
                              );
        },

        getCategoryTypes: function () {
            var self = this;
            self._callService("getCategoryTypes",
                                [],
                                function (categoryTypesDataCollection) {
                                    self._categoryTypes = self.getItemsFromDataCollection(categoryTypesDataCollection);
                                }
                              );
        },

        retrieveResourceCategories: function () {
            var self = this;
            self._callService("getResourceCategories", [],
                function (resourceCategoriesDataCollection) {
                    self._resourceCategories = self.getItemsFromDataCollection(resourceCategoriesDataCollection);
                    self._resourceCategoryStrToRecIdMap = self.computeResourceCategoryStrToRecIdMap(self._resourceCategories);
                }
            );
        },

        getLineProperties: function () {
            var self = this;
            self._callService("getLineProperties",
                                [],
                                function (linePropertyDataCollection) {
                                    self._lineProperties = self.getItemsFromDataCollection(linePropertyDataCollection);
                                }
                              );
        },

        getItemNumbers: function () {
            var self = this;
            self._callService("getItemNumbers",
                                [],
                                function (itemNumbersDataCollection) {
                                    self._itemNumbers = self.getItemsFromDataCollection(itemNumbersDataCollection);
                                }
                              );
        },

        getSalesCategories: function () {
            var self = this;
            self._callService("getSalesCategories",
                                [],
                                function (salesCategoryDataCollection) {
                                    self._salesCategories = self.getItemsFromDataCollection(salesCategoryDataCollection);
                                    self.createSalesCategoryMap(self.salesCategories);
                                }
                              );
        }
    });

    hierarchicalGrid.CostPlanningMode = function (data, controlElement, output, onReady) {
        hierarchicalGrid.Mode.apply(this, arguments);
    };

    hierarchicalGrid.CostPlanningMode.prototype = $dyn.extendPrototype(hierarchicalGrid.Mode.prototype, {
        id: "CostPlanning",

        title: $dyn.label('HierarchicalGridCommon_WBSCostPlanningTitle'),

        load: function () {
            var self = this;
            self.hierarchicalGridView = new hierarchicalGrid.CostPlanningHGridView(self._model, self.refresh.bind(self), self._controlElement, self.id);
            self.hierarchicalGridView.init();
        },

        createModel: function (data, modelId) {
            return new hierarchicalGrid.CostPlanningModel(data, modelId);
        }
    });

    hierarchicalGrid.modeManager.addMode(hierarchicalGrid.CostPlanningMode, true);

})($dyn.projectManagement = $dyn.projectManagement || {}, jQuery);

//# sourceURL=WBSCostPlanningView.js

// SIG // Begin signature block
// SIG // MIIoQQYJKoZIhvcNAQcCoIIoMjCCKC4CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // pSjjeNiQh7gL/sZ8iIIjlfxX7DVDFU+mgVw0tXkXXnug
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
// SIG // DQEJBDEiBCDgzvM7dptO7dtfjk7g9lt6HFMvQxnOkXHD
// SIG // 03J6LJXhUDBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAE2dHTa2
// SIG // qtmLNi1hdEkb29Z40q4aeGDWlp1yP8JrItpIQkdirAaU
// SIG // OCAVUe+W2C9bN0o6xR//K6GAbAAGj8pTEgSi8AwUBpLO
// SIG // muJZxiC5kC9tc7U1QaF5y/2uYGj/DV+HfKYUC3I7YqJd
// SIG // xYxS93IXkSW5dtC7op4sJ/9zdjFgXOGQpfhqkvLikRHY
// SIG // UgNcDT8rmIiJArN0ZS92XND6e3mpsb4UjTgNQ1C5BEQo
// SIG // AALl1JgnAkz0KAJYBJPQ69vktmPMTssuwvgR4WwT8ty8
// SIG // SBNBKO91B7CelncdYbn1MYa0Ntg2gYdu7CI6zGxwqo/K
// SIG // V5DIJTd0yADNPctgTGNWf0WpLUihghetMIIXqQYKKwYB
// SIG // BAGCNwMDATGCF5kwgheVBgkqhkiG9w0BBwKggheGMIIX
// SIG // ggIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWgYLKoZIhvcN
// SIG // AQkQAQSgggFJBIIBRTCCAUECAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgwDk6dWFZ/1NysMxbsVHi
// SIG // 4JzsiCAHlbVk4XBkmE3RtL0CBmbrWneV8hgTMjAyNDEx
// SIG // MDUyMTQzMDguNjI0WjAEgAIB9KCB2aSB1jCB0zELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMScwJQYD
// SIG // VQQLEx5uU2hpZWxkIFRTUyBFU046NTIxQS0wNUUwLUQ5
// SIG // NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WgghH7MIIHKDCCBRCgAwIBAgITMwAAAgAL
// SIG // 16p/GyoXVgABAAACADANBgkqhkiG9w0BAQsFADB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0yNDA3MjUx
// SIG // ODMxMjFaFw0yNTEwMjIxODMxMjFaMIHTMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
// SIG // Hm5TaGllbGQgVFNTIEVTTjo1MjFBLTA1RTAtRDk0NzEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAK9V2mnSpD9k5Lp6Exee9/7ReyiTPQ6Ir93HL9up
// SIG // qp1IZr9gzOfYpBE+Fp0X6OW4hSB3Oi6qyHqgoE/X0/xp
// SIG // LOVSjvdGUFtmr4fzzB55dJGX1/yOc3VaKFx23VFJD4mX
// SIG // zV7M1rMJi/VJVqPJs8r/S6fUwLcP6FzmEwMXWEqjgeVM
// SIG // 89UNwPLgqTZbpkDQyRg2OnEp9DJWLpF5JQKwoaupfimK
// SIG // 5eq/1pzql0pJwAaYIErCd96C96J5g4jfWFAKWcI5zYfT
// SIG // OpA2p3ks+/P2LQ/9qRqcffy1xC6GsxFBcYcoOCnZqFhj
// SIG // WMHUe/4nfNYHjhEevZeXSb+9Uv5h/i8W+i+vdp/LhJgF
// SIG // cOn1bxPnPMI4GGW5WQjTwMpwpw3bkS3ZNY7MAqo6jXN1
// SIG // /1iMwOxhrOB1EuGCKwFMfB9gPeLwzYgPAFmu2fx0sEws
// SIG // iIHlW5XV2DNgbcTCqt5J3kaE9uzUO2O5/GU2gI3uwZX4
// SIG // 7vN7KRj/0FmDWdcGM2FRkcjqXQPFpsauVfH+a+B2hvcz
// SIG // 3MpDsiaUWcvld0RooIRZrAiVwHDM4ju+h4p8AiIyJpwh
// SIG // ShifyGy4x+ie3yV6kT24Ph+q2C2fFwaZlwRR+D02pGVW
// SIG // MQfz/hEGy+SzcNGSDPnrn8QpY1eDvpx5DPs4EsfPtOwV
// SIG // WTwSrJaKHm7JoSHATtO+/ZHoXImDAgMBAAGjggFJMIIB
// SIG // RTAdBgNVHQ4EFgQUgCUk2r4JIyqoHucUDl59+X13dzow
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNVHSUBAf8E
// SIG // DDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMCB4AwDQYJ
// SIG // KoZIhvcNAQELBQADggIBACjwhvZ40bSKkPn7hAoMc1jL
// SIG // EDiNx71u7FfT5hFggjlpU7hgiMzYt4m3S2UtG9iAx4NM
// SIG // i67XVbgYtxcVXXrCF7s2MqHyHv2pUwXVeA4Yoy017Qez
// SIG // YDp6Oxtdojt7eo8tYT0qrsxi68v9phGQcCLEqEtg/h/t
// SIG // xwicTw8oczBaj/qZZbTwAgf0DcGe6vhxsmb97/Hrfq0G
// SIG // IPLBdz07lng4N3Uf85NTWsCf3XxQg2JVjXggQi7zT0AX
// SIG // HjGFxURSoXElMLO5hXSAw4WacasiCg9lg8BcjSBhHs5/
// SIG // p3eJF0bqXjRMfnkqSV8pUQ/tXeOYW+j8ziBewZHD7UbR
// SIG // VtsF4JIy6rU1lpQZL85drjX2Cdwj2VWg8jA2ml4Dvh+g
// SIG // 4q7CeCBvYpCHfeNfplg3o5I+WmJ/UDekTn6PxzR4NbYp
// SIG // sKRaFIr6gBbuoq1mRcOVfsi6/BS3O52zGtpRUosc7ves
// SIG // 3Zw7DyJs9HOkrW2MoSkpTN7g0YvVFsnUiqpxG7SejJPm
// SIG // Lsb86a5LlkCWFn6T77oPsE54qMpFcHNMkVXLHeMTM555
// SIG // 0bWQxjElBJfbTFZ3m2EbIcGSMiU7AYC2ZhzO6tkxSv1/
// SIG // feOEpCKsmNtgHLi3tBqqDXwEgiHGbc22f8z+JU9vzdKQ
// SIG // 259n3wM42ZISPkK6q/fN5kGVsGXa905NTGBJQ04c9g9D
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
// SIG // ZWxkIFRTUyBFU046NTIxQS0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wi
// SIG // IwoBATAHBgUrDgMCGgMVAIyTny2W94r4qS97Ei5VhWy6
// SIG // 1o5koIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwDQYJKoZIhvcNAQELBQACBQDq1HUFMCIYDzIw
// SIG // MjQxMTA1MTA0MjEzWhgPMjAyNDExMDYxMDQyMTNaMHQw
// SIG // OgYKKwYBBAGEWQoEATEsMCowCgIFAOrUdQUCAQAwBwIB
// SIG // AAICBBswBwIBAAICE1YwCgIFAOrVxoUCAQAwNgYKKwYB
// SIG // BAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQAC
// SIG // AwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsFAAOC
// SIG // AQEAKhM98/iBhCHmpksTUU4ZdF4/RSE4jAK6Htnsrzhg
// SIG // fvG/ED6mUUhHG84EzGpATP7TFWPbSpwRo5ZV9W6lQgGS
// SIG // Y54n/vZteIV46lvfCjHCSIJNf/uoFfA0FgO14JYrOtm2
// SIG // EZ9O56vZuOj3IVdDCdSl80rtKLnMMU3ltFtT1Unli7D5
// SIG // cfgvz4rhM5uJnrgIXJDXRq3pJ6ZYkJrZcmM9KkEU/x8h
// SIG // flU0iZsRF2zjrdp2pTjwIRojxzXo0+FA/0GGVtKpsgmq
// SIG // WFq6Bxm2ksh1zslxnzstbrjKACdib3QknicWv8BqDF3O
// SIG // fBnxaRi8bQZYUYiUS8ZQHz+z/PVXQhEXNGon2zGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAACAAvXqn8bKhdWAAEAAAIAMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIAZdRmlzIKsEiRSP
// SIG // GX32yPZ/L9/CD1GZf+KYUXsicEuOMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQg1Mjt7DWd27qwTQxlAleD
// SIG // XzNoB+GlrkbnSJP/SgJP2ScwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAgAL16p/GyoX
// SIG // VgABAAACADAiBCCbnsqmcd9g6l/E12zOXOrYnVibuUK6
// SIG // PZgDeiQ2VQpbMjANBgkqhkiG9w0BAQsFAASCAgCvFHwJ
// SIG // W9VsqncA0axKojuGcW0YUwG3OyEj+bn2hCX6XYnwrTcg
// SIG // 02vsj48QIGCItiwAkIZyOz6qposVZPf4ZJhvjaL3vCyH
// SIG // w4zYbbmmM06RsKLjxjdSRYBipMtf2bsXe9x2nuOGs6wK
// SIG // V9LUIME3/vDvSgusklh1VhiVe4JXvlzCUHDrrpQEG7/t
// SIG // MnRl9PvO0Iely15isxFNjXbcrcIfdf20YFt8WH4p3R6A
// SIG // SyVIoJDgDCLU4CyIie9p9kodsXDl+n1Krpnob/7oEKWW
// SIG // K6Euggq8pf8UX3Pi4F3zAFDaGdREbc3Uz1jbH/cSzJyf
// SIG // e57iBiNOJxtcUltL7/aPOflxBAhFsmyY9y3y0xyNlzmU
// SIG // I761aLlBg3UFX6TFZUHRz4iqCp2s+BK90qXy17aY+5BT
// SIG // 2Idu5eINvsub+nE2qItcfZEPpVbsdxKgDNmBbRxhuZ4w
// SIG // IAV9E8rI36mGs55xYlwsPvmwj4VHBBBQiNgKxpVK32vD
// SIG // /98O89qTCZxKv7oDvueUjPETiBfhWf/W1/0gg07eTkqU
// SIG // s0IFmxOf/mwvpbiKfvj4zBdgqV962qrs5h4dSPfRRkHy
// SIG // bGXbiVQaI2UlET+70jeXpeer0Jm2qKRWqH5bzKv/QKdT
// SIG // 0yxW9NU/8C4PHhZDhTrnAtO4MhUOyw3w6DYsFdvcKELG
// SIG // uDYfzSwlJubsJqCi9A==
// SIG // End signature block
