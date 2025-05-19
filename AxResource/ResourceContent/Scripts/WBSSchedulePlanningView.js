/*!
// <copyright file="WBSSchedulePlanningView.js" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
*/
(function (projectManagement, $) {
    "use strict";

    Globalize.addCultureInfo('en', {
        messages: {
            HierarchicalGridCommon_WBSID: "WBS ID",
            HierarchicalGridCommon_WBSSchedulePlanningTitle: "Project Planning View",
            HierarchicalGridCommon_WBSTask: "Task",
            HierarchicalGridCommon_WBSTaskEffort: "Effort (hours)",
            HierarchicalGridCommon_WBSTaskStartDate: "Start date",
            HierarchicalGridCommon_WBSTaskEndDate: "End date",
            HierarchicalGridCommon_WBSTaskDuration: "Duration (days)",
            HierarchicalGridCommon_WBSNumResources: "Number of resources",
            HierarchicalGridCommon_WBSResourceCategory: "Role",
            HierarchicalGridCommon_WBSCategory: "Category",
            HierarchicalGridCommon_WBSResource: "Resource",
            HierarchicalGridCommon_WBSResourceAssignment: "Resource assignments",
            HierarchicalGridCommon_WBSLaunchAssignmentForm: "Launch resource assignment form",
            HierarchicalGridCommon_WBSPleaseChoose: "Please choose",
            HierarchicalGridCommon_WBSAssignResources: "Assign resources",
            HierarchicalGridCommon_WBSAssignAccept: "Accept",
            HierarchicalGridCommon_WBSAssignCancel: "Cancel",
            HierarchicalGridCommon_WBSAssignAutomatically: "Assign automatically",
            HierarchicalGridCommon_WBSSchedulingStatus: "Scheduling status",
            HierarchicalGridCommon_WBSRemainingHours: "Unstaffed hours",
            HierarchicalGridCommon_WBSPredecessors: "Predecessors",
            HierarchicalGridCommon_WBSScheduleError: "Scheduling error",
            HierarchicalGridCommon_AutoScheduleOn: "Auto scheduling on",
            HierarchicalGridCommon_AutoScheduleOff: "Auto scheduling off",
            HierarchicalGridCommon_FixScheduleErrors: "Fix schedule discrepancies",
            HierarchicalGridCommon_ShowScheduleErrors: "Show schedule errors",
            HierarchicalGridCommon_HideScheduleErrors: "Hide schedule errors",
            HierarchicalGridCommon_InvalidIndent: "Indenting the selected tasks would cause invalid predecessor relationships.",
            HierarchicalGridCommon_ErrorIndentResourceExists: "Selected tasks can't be indented, because the task above %1 has resources assigned.",
            HierarchicalGridCommon_InvalidOutdent: "Outdenting the selected tasks would cause invalid predecessor relationships",
            HierarchicalGridCommon_ErrorOutdentResourceExists: "Selected tasks can't be outdented, because task %1 has resources assigned.",
            HierarchicalGridCommon_BlankCategoryWarning: "Category must be specified.",
            HierarchicalGridCommon_DateEmptyWarning: "Date fields cannot be empty.",
            HierarchicalGridCommon_StartDateInvalidWarning: "Start date should not be greater than end date.",
            HierarchicalGridCommon_PredecessorStartDateWarning: "A task's Start Date must be greater than that of it's predecessors",
            HierarchicalGridCommon_PredecessorCycleWarning: "One or more selected predecessors would cause cyclical dependencies.",
            HierarchicalGridCommon_PredecessorLagWarning: "A task's start date must align with its Predecessor's end dates",
            HierarchicalGridCommon_GetMoreDatesMsg: "Retrieving more dates from the calendar. One moment please",
            HierarchicalGridCommon_NotWorkingDay: "Date {0} is not a working day",
            HierarchicalGridCommon_InvalidDate: "Invalid date.",
            HierarchicalGridCommon_WBSTaskDiffType: "Diff type",
            HierarchicalGridCommon_WBSNote: "Note",
            HierarchicalGridCommon_AutoScheduling: "Auto scheduling",
            HierarchicalGridCommon_AutoGenerateTeam: "Auto generate team",
            HierarchicalGridCommon_FixAllScheduleErrors: "Fix all schedule errors",
            HierarchicalGridCommon_FixSelectedTasks: "Fix selected tasks",
            HierarchicalGridCommon_ErrorAssigningResource: "Error when assigning resource.",
            HierarchicalGridCommon_ErrorConfiguringGenericResource: "Error when configuring planned resource.",
            HierarchicalGridCommon_ErrorProposingGenericResource: "Error when proposing planned resource.",
            HierarchicalGridCommon_Details: "DetailsC",
            HierarchicalGridCommon_Import: "ImportC",
            HierarchicalGridCommon_Export: "ExportC",
            HierarchicalGridCommon_Attachments: "AttachmentsC",
            HierarchicalGridCommon_Restore: "RestoreC",            
            HierarchicalGridCommon_RoleChangeWarning: "Role cannot be updated because the task has resources assigned to it.",
            HierarchicalGridCommon_OkButton: "OK",
            HierarchicalGridCommon_CancelButton: "Cancel",
            HierarchicalGridCommon_SchedulingStatusNotStaffed: "Not staffed",
            HierarchicalGridCommon_SchedulingStatusPartiallyStaffed: "Partially staffed",
            HierarchicalGridCommon_SchedulingStatusFullyStaffed: "Fully staffed"
        }
    });

    var schedulingErrorTypes = {
        None: 0,
        InvalidDuration: 1,
        InvalidStartDate: 2,
        LagTime: 3,
        InvalidEffort: 4
    };

    var hierarchicalGrid = projectManagement.hierarchicalGrid || {};
    var publishState = false;
    var justImported = false;
    hierarchicalGrid.test = hierarchicalGrid.test || {};

    hierarchicalGrid.SchedulePlanningHGridView = function (model, refreshPage, controlElement, modeId) {
        var self = this;
        self._validatePredecessors = true;
        self._viewModel = self.createViewModel(model);
        self.columns = this.getColumns();
        var sessionContext = self._viewModel._model.getSessionContext();
        self.isTemplate = (sessionContext.projWBSType.toLowerCase() === self.wbsTemplate);
        self.isEnabled = sessionContext.enabled;
        hierarchicalGrid.HierarchicalGridView.apply(this, arguments);
    };

    hierarchicalGrid.SchedulePlanningHGridView.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridView.prototype, {

        createViewModel: function (model) {
            return new hierarchicalGrid.SchedulePlanningHierarchicalGridViewModel(model, this);
        },

        removeActivityResourcesInDraft : false,
        filterable: true,
        filterField: $dyn.observable($dyn.label('HierarchicalGridCommon_Task')),
        wbsTemplate: "template",
        wbsProject: "project",
        wbsProjectQuotation: "projectquotation",
        viewId: "SchedulePlanningView",
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
                
        rowSelectionChanged: function (lastRowData, nextRowData) {
            var self = this;
            var data = nextRowData;
            var sessionContext;
            var isPublished;
            
            if (data.__Level() === 1) {
                self.setRowEditable(false);
            } else if (!self.isLeaf(data)) {
                self.setRowEditable(false);
                sessionContext = self._model.getSessionContext();
                if (sessionContext && !sessionContext.isPublished) {
                    self.setColumnsEditable(["name"], true);
                }
            } else {
                sessionContext = self._model.getSessionContext();
                self.updateColumnStateForProject(sessionContext ? sessionContext.isPublished : false);
            }
            self.setColumnsStatus(['name', 'category', 'effort', 'startDate', 'endDate', 'duration', 'numResources', 'resourceCategoryStr', 'predecessorList'], $dyn.ui.StatusIndicator.none);
        },      
        
        updateColumnStateForProject: function(isPublished) {
            var self = this;
            var shouldEnabled = !isPublished;
            if (!self.isEnabled) {
                shouldEnabled = false;
            }
            var selectedRow = self.getSelectedRow();

            if (!selectedRow) {
                return;
            }

            self.setColumnsEditable(['name', 'category', 'effort', 'startDate', 'endDate', 'duration', 'numResources', 'resourceCategoryStr', 'predecessorList'], shouldEnabled);            
            self.updateResourceColumnState(selectedRow);
        },
        
        refreshSummaries: function (node, skipGridLoad) {
            var self = this;
            node = node || null;
            self._viewModel.recalcSummaries(node);  // TODO extract View code from View model code.
            if (skipGridLoad !== true) { 
             self._reloadGrid();
            }
        },
        
        
        updateUIPostload: function () {
            var self = this;
            self.disableButton("Refresh", false);
            if (!self.isPublished()) {
                self.disableButton("New", false);
            } else 
            {
                self.disableButton("New", true);
            }
        },

        updateUISelect: function () {
            var self = this;
            var curSelected = self.getSelectedRow();
            if (curSelected) {
                var isRootSelected = curSelected.__Level() === 1;
            }

            if (!self.isPublished()) {
                hierarchicalGrid.HierarchicalGridView.prototype.updateUISelect.apply(this, arguments);
                if (curSelected) {
                    self.disableButton("Delete", isRootSelected);
                    self.disableButton("Details", isRootSelected);
                }
                else {
                    self.disableButton("Delete", true);
                    self.disableButton("Details", true);
                }
            }
            else {
                if (curSelected) {
                    self.disableButton("Details", isRootSelected);
                }
                else {
                    self.disableButton("Details", true);
                }
            }
        },

        updateUIFilter: function () {
            var self = this;
            self.disableButtons(["New"],
                (self._filteredRows !== self._rows || self.isPublished()));
        },

        updateUI: function (action) {
            var self = this;

            if (!self.isEnabled) {
                self.disableButtons(["New",
                        "Delete", "Indent", "Outdent", "MoveUp", "MoveDown", "Import", "fixSelected", "fixAll", "ShowSchedulingErrors", "AutoScheduling", "ProposeGenericResource","Restore", "Details"],
                        true);
                return;
            }

            if (self._model.getSessionContext().showDifference == true) {
                self.disableButtons(["New","Delete", "Indent", "Outdent", "MoveUp", "MoveDown", "Import", "fixSelected", "fixAll", "ShowSchedulingErrors", "AutoScheduling", "ProposeGenericResource","attachments","ResourceAssignmentDetails"],
                true);
                self.disableButtons(["Restore"], false);
                return;
            }
            
            if (action !== "Draft" && action !== "Published") {
                hierarchicalGrid.HierarchicalGridView.prototype.updateUI.apply(this, arguments);
            }

            switch (action) {
                case "Edit":
                case "Delete":
                case "Add":
                    self._model.shouldPersistRoot = true;
                    break;
                case "Draft":
                    self.disableButtons(["New",
                        "Delete", "Indent", "Outdent", "MoveUp", "MoveDown", "Import", "fixSelected", "fixAll", "ShowSchedulingErrors", "AutoScheduling", "Details"],
                        false);
                   self.disableButtons(["ProposeGenericResource", "attachments", "Restore","ResourceAssignmentDetails"], true);
                    break;
                case "Published":
                    self.disableButtons(["New",
                        "Delete", "Indent", "Outdent", "MoveUp", "MoveDown", "Import", "fixSelected","fixAll", "AutoScheduling","Restore"],
                        true);
                   self.disableButtons(["ProposeGenericResource", "attachments","ResourceAssignmentDetails"], false);
                    break;
            }
        },

        _requestPopup: function (lookupElement, rowData, field) {
            var self = this;
            $dyn.async(function () {
                var inputElement = $(lookupElement).find("Input")[0];
                var lookupContext = $dyn.context(lookupElement);
                var popupForm = lookupContext.Popup()[0];

                $dyn.context(popupForm).IsFormReady(true);
                var lookup = self._populateLookup(popupForm, inputElement, rowData, field);
                $dyn.serverForm.interactionHandler._openForm(popupForm);

                $(popupForm).parent().on('keydown', function (e) {
                    // Get parent element by the target element id
                    var targetId = e.target.id;
                    var targetFieldArray = targetId.split("_");
                    var parentFieldPositon = parseInt(targetFieldArray[2]) - 1;
                    var parentFieldId = targetFieldArray[0] + "_" + targetFieldArray[1] + "_" + parentFieldPositon;
                    var parentDom = document.getElementById(parentFieldId);
                    // If parent element can be found, verify if this element is the resource field.  If so, ignore all keys input. 
                    if (parentDom) {
                        var parentDomAttr = parentDom.getAttribute("data-dyn-options");
                        if (parentDomAttr != null && parentDomAttr.indexOf("assignedResourcesStr") > 0) {
                            e.preventDefault();
                        }
                    }
                });
            });
        },

        sessionContextCallback: function (previousSessionContext, newSessionContext) {
            var self = this;
            if ((previousSessionContext.isPublished !== newSessionContext.isPublished)
                && (previousSessionContext.projWBSType.toLowerCase() === self.wbsProject)) {
                self.wbsStateChanged = true;
                publishState = newSessionContext.isPublished;
                self.updateColumnStateForProject(newSessionContext.isPublished);
                self.updateUI(newSessionContext.isPublished ? "Published" : "Draft");
            }
            if (previousSessionContext.showDifference !== newSessionContext.showDifference) {
                self.setColumnVisible("differenceDisplay", newSessionContext.showDifference);
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

        isPublished: function () {
            var self = this;
            var sessionContext = self._viewModel._model.getSessionContext();
            if (sessionContext.projWBSType.toLowerCase() === self.wbsProject) {
                return sessionContext.isPublished;
            }
            return false;
        },


        isValidDate: function(input){
            var self = this;
            if (input.trim() === "") {
                return false;
            }
            var benchmarkOldDate = new Date();
            benchmarkOldDate.setYear(benchmarkOldDate.getFullYear() - 15);
            if (self._viewModel.parseISOString(input) < benchmarkOldDate) {
                return false;
            }
            return true;
        },

        validateRange: function (event) {
            var self = this;
            var args = event.args;
            var rowData = args.rowData;
            var field = args.field;
            
            if (field === "category" && self._viewModel.categoryTypes.length === 2) { //if category validation is set to "Lookup" we need to allow users to type in categories that are valid, but do not appear in the lookup    
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
                        var valueRange = self._viewModel.categoryTypes[1];
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
                            }
                        }
                    }
                }
                return ret;
            }
            else { //otherwise validate as normal
                if (field === "category" && !(args.value.trim())) {
                    self._lastCellValid = false;
                    var fieldValue = rowData[field];
                }
                return hierarchicalGrid.HierarchicalGridView.prototype.validateRange.apply(this, arguments);
            }

        },

        validateCellValueChange: function (event) {
            var self = this;
            var args = event.args;
            var value = args.value;
            var oldValue = args.oldValue;
            var rowData = args.rowData;
            var tempDate = new Date();
            var field = args.field;
            var vm = self._viewModel;
            var sessContext = self._model.getSessionContext();
            var validated = true;

            var callBack = function () {
                rowData[field](value);
            }

            switch (field) {
                case "startDate":
                    if (!self.isTemplate) {
                        if (sessContext.projWBSType.toLowerCase() !== self.wbsTemplate) {
                            //Check if the date is beyond the date mapx
                            if (!self.isValidDate(value)) {
                                self._showMessage($dyn.label('HierarchicalGridCommon_InvalidDate'));
                                return false;
                            }

                            tempDate = vm.parseISOString(value);
                            if (!vm.checkDateInMap(tempDate, rowData, callBack)) {
                                return false;
                            }

                            if (!vm.isWorkingDay(tempDate)) {
                                self._showMessage($dyn.format($dyn.label('HierarchicalGridCommon_NotWorkingDay'), value));
                                return false;
                            }

                            validated = self.validateStartDateChanged(rowData);
                            if (!validated) {
                                if (self._viewModel.autoSchedule) {
                                    self._showMessage($dyn.label('HierarchicalGridCommon_PredecessorLagWarning'));
                                }
                                else {
                                    self._showMessage($dyn.label('HierarchicalGridCommon_PredecessorStartDateWarning'));
                                }
                            }
                        }
                    }
                    break;
                case "endDate":
                    if (!self.isTemplate) {
                        if (sessContext.projWBSType.toLowerCase() !== self.wbsTemplate) {
                            if (!self.isValidDate(value)) {
                                self._showMessage($dyn.label('HierarchicalGridCommon_InvalidDate'));
                                return false;
                            }

                            tempDate = vm.parseISOString(value);
                            if (tempDate < vm.parseISOString(rowData.startDate())) {
                                self._showMessage($dyn.label('HierarchicalGridCommon_StartDateInvalidWarning'));
                                return false;
                            }

                            if (!vm.checkDateInMap(tempDate, rowData, callBack)) {
                                return false;
                            }

                            if (!vm.isWorkingDay(tempDate)) {
                                self._showMessage($dyn.format($dyn.label('HierarchicalGridCommon_NotWorkingDay'), value));
                                return false;
                            }
                        }
                    }
                    break;
                case "numResources":
                    if (self.parseNumber(value, true) === "NAN" || value <= 0) {
                        validated = false;
                    }
                    break;
                case "effort":
                    if (self.parseNumber(value, true) === "NAN" || value < 0) {
                        validated = false;
                    }
                    break;
                case "duration":
                    if (!self.isTemplate) {
                        if (self.parseNumber(value, true) === "NAN" || value < 0) {
                            validated = false;
                        }
                    }
                    break;
                case "predecessorList":
                    if (self._validatePredecessors) {
                        validated = self.validatePredecessorList(rowData);
                    }
                    break;
                case "resourceCategoryStr":
                    validated = self.validateRoleChange(rowData);
                    break;
                default:
                    break;
            }
            if (validated) {
                self.setColumnStatus(field, $dyn.ui.StatusIndicator.none);
            }
            return validated;
        },

        validateRoleChange: function (rowData) {
            var self = this;
            if (rowData.assignedResourcesStr()) {
                self._showMessage($dyn.label('HierarchicalGridCommon_RoleChangeWarning'));
                return false;
            }
            return true;
        },

        cellValueChanged: function (event) {
            //TODO: Re-implement with the new data controlElement
            //Consider the missing pieces of this function from the initial changelist of 4915606.
            
            var self = this;
            var args = event.args;
            var value = args.value;
            var oldValue = args.oldValue;
            var rowData = args.rowData;
            var tempDate = new Date();
            var field = args.field;
            var vm = self._viewModel;
            var projCalendar = vm.projCalendar;
            var autoSchedule = self._viewModel.autoSchedule;

            var findEndDateCallback = function (date) {
                rowData.endDate(vm.dateToIsoString(date));
            }

            //$dyn.log("cell value changed");
            //This is possible when the user click on a lead transaction type with no estimates associated with it.
            if (oldValue === undefined && value === "") {
                return;
            }  

            if (projCalendar && projCalendar.isCalendarLoaded) {
               /*
               Duration = Working days between Start and End Date.  This rule is maintained even in Auto Scheduling Off mode. 
                    i.    When I update End date, duration gets re-calculated. 
                   ii.    When I update Duration, the end date gets re-calculated. 
                  iii.    When I update Start Date, Duration remains and the End Date gets re-calculated. 
               */

                /*
                d.    Effort = NoR * Duration * Working Hours in Calendar.
                    i.    When I update Effort, Duration gets recalculated and therefore End Date gets re-calculated. NoR remains the same.
                    ii.    When I update NoR, Duration gets recalculated and therefore End Date gets re-calculated. Effort remains the same. 
                    iii.When I update Enddate, Effort gets recalculated along with duration. //TODO
                */
                switch (field) {
                    case "schedulingErrors":
                        return;
                    case "effort":
                        if (autoSchedule) {
                            if (!self.isTemplate) {
                                //duration is recalculated
                                rowData.duration(projCalendar.calcDurationForEffortAndResource(self.parseNumber(value), rowData.numResources()));
                                //since duration changed, enddate is re-calculated
                                tempDate = vm.parseISOString(rowData.startDate());
                                projCalendar.findEndDateForStartDateAndDuration(tempDate, rowData.duration(), rowData, findEndDateCallback);
                                self._viewModel.computeResourceScedulingData(rowData);
                                self.notifySuccessorsOfDateChange(rowData);
                                self.updateResourceColumnState(rowData);
                                if (self.removeActivityResourcesInDraft) {
                                    rowData.deleteTask(false);
                                    self._viewModel.removeDraftActivityResources(rowData);
                                    self.removeActivityResourcesInDraft = false;
                                }
                            }
                        } 
                        break;
                    case "startDate": //change in start date, end date gets re-calculated.
                        if (!self.isTemplate) {
                            // For Importing the WBS Template, needs to calculate the duration before setting the Start date.
                            // That is the reason, added the following condtion for calculating the duration.
                            if (rowData.duration() == 0) {
                                var duration = Math.ceil(rowData.effort() / (rowData.numResources() * projCalendar.standardWorkdayHours));
                                if (isNaN(duration)) {
                                    duration = 0;
                                }
                                rowData.duration(duration);
                            }
                            projCalendar.findEndDateForStartDateAndDuration(vm.parseISOString(value), rowData.duration(), rowData, findEndDateCallback);
                            self.notifySuccessorsOfDateChange(rowData);
                        }
                        break;
                    case "endDate": //duration gets recalculated
                        if (!self.isTemplate) {
                            rowData.duration(projCalendar.calcDuration(vm.parseISOString(rowData.startDate()), vm.parseISOString(value), rowData.effort()));
                            if (autoSchedule) {
                                rowData.effort(projCalendar.standardWorkdayHours * rowData.duration());
                            }
                            self.notifySuccessorsOfDateChange(rowData);
                        }
                        break;
                    case "duration": //change in duration recalculates End date
                        if (!self.isTemplate) {
                            projCalendar.findEndDateForStartDateAndDuration(vm.parseISOString(rowData.startDate()), value, rowData, findEndDateCallback);
                            self.notifySuccessorsOfDateChange(rowData);
                        }
                        break;
                    case "numResources":
                        if (autoSchedule) {
                            if (!self.isTemplate) {
                                //duration is recalculated
                                rowData.duration(projCalendar.calcDurationForEffortAndResource(self.parseNumber(rowData.effort()), value));
                                if (!self.isTemplate) {
                                    //since duration changed, enddate is re-calculated
                                    projCalendar.findEndDateForStartDateAndDuration(vm.parseISOString(rowData.startDate()), rowData.duration(), rowData, findEndDateCallback);
                                }
                            }
                        }
                        break;
                    case "predecessorList":
                        self.updatePredecessorsForNode(rowData);
                        self.updateSuccessorsForNode(rowData);
                        if (!self.isTemplate) {
                            self.updateNodeDatesForPredecessors(rowData);
                        }
                        break;
                    case "assignedResourcesRecId":
                    case "assignedResourcesStr":
                    case "assignedResourcesOriginalRecId":
                    case "remainingHours":
                    case "schedulingStatus":
                    case "assignedHours":
                        self.updateResourceRefreshData(field, rowData, value);
                        break;
                    case "resourceCategoryStr":
                        var resourceCategoryStrToRecIdMap = self._viewModel.resourceCategoryStrToRecIdMap;
                        rowData.resourceCategoryRecId = resourceCategoryStrToRecIdMap[value];
                        rowData.resourceCategoryStr._last = value;
                    default:
                        break;
                }
            }
            else {
                switch (field) {
                    case "schedulingErrors":
                        return;
                    case "effort":
                        if (!self.isTemplate) {
                            //duration is recalculated
                            rowData.duration(Math.ceil(self.parseNumber(value) / (rowData.numResources() * vm.getWorkingHoursForDay())));
                            //since duration changed, enddate is re-calculated
                            tempDate = vm.parseISOString(rowData.startDate());
                            tempDate.setDate(tempDate.getDate() + rowData.duration() - 1);
                            rowData.endDate(vm.dateToIsoString(tempDate));
                            self._viewModel.computeResourceScedulingData(rowData);
                            self.notifySuccessorsOfDateChange(rowData);
                            self.updateResourceColumnState(rowData);
                        }
                        break;
                    case "startDate":
                        if (!self.isTemplate) {
                            tempDate = vm.parseISOString(value);
                            tempDate.setDate(tempDate.getDate() + rowData.duration() - 1);
                            rowData.endDate(vm.dateToIsoString(tempDate));
                            self.notifySuccessorsOfDateChange(rowData);
                        }
                        break;
                    case "endDate":
                        if (!self.isTemplate) {
                            rowData.duration(self._viewModel.diffDates(vm.parseISOString(rowData.startDate()),
                                                                       vm.parseISOString(rowData.endDate())) + 1);
                            //it should update Effort as well
                            rowData.effort(rowData.duration() * vm.getWorkingHoursForDay());
                            self.notifySuccessorsOfDateChange(rowData);
                        }
                        break;
                    case "duration":
                        if (!self.isTemplate) {
                            //change in duration recalculates End date
                            tempDate = self._viewModel.parseISOString(rowData.startDate());
                            tempDate.setDate(tempDate.getDate() + self._viewModel.parseNumber(value) - 1);
                            rowData.endDate(self._viewModel.dateToIsoString(tempDate));
                            //it should update Effort as well
                            rowData.effort(self.parseNumber(rowData.duration()) * vm.getWorkingHoursForDay());
                            self.notifySuccessorsOfDateChange(rowData);
                        }
                        break;
                    case "numResources":
                        if (!self.isTemplate) {
                            //duration is recalculated
                            rowData.duration(self.parseNumber(rowData.effort()) / (value * self._viewModel.getWorkingHoursForDay()));
                            if (!self.isTemplate) {
                                //since duration changed, enddate is re-calculated
                                tempDate = self._viewModel.parseISOString(rowData.startDate());
                                tempDate.setDate(tempDate.getDate() + rowData.duration() - 1);
                                rowData.endDate(self._viewModel.dateToIsoString(tempDate));
                                self.notifySuccessorsOfDateChange(rowData);
                            }
                        }
                        break;
                    case "predecessorList":
                        self.updatePredecessorsForNode(rowData);
                        self.updateSuccessorsForNode(rowData);
                        if (!self.isTemplate) {
                            self.updateNodeDatesForPredecessors(rowData);
                        }
                        break;
                    case "assignedResourcesRecId":
                    case "assignedResourcesStr":
                    case "assignedResourcesOriginalRecId":
                    case "remainingHours":
                    case "schedulingStatus":
                    case "assignedHours":
                        self.updateResourceRefreshData(field, rowData, value);
                        break;
                    case "resourceCategoryStr":
                            var resourceCategoryStrToRecIdMap = self._viewModel.resourceCategoryStrToRecIdMap;
                            rowData.resourceCategoryRecId = resourceCategoryStrToRecIdMap[value];
                            rowData.resourceCategoryStr._last = value;
                    default:
                        break;
                }
            }

            if (!self.isTemplate) {
                self._viewModel.checkSchedulingErrors(rowData, true);
                if (autoSchedule && rowData.schedulingErrorType() != schedulingErrorTypes.None) {
                    self.fixSchedulingErrors(rowData);
                    self.setColumnStatus(field, $dyn.ui.StatusIndicator.none);
                }
            }
        },

        updateResourceRefreshData: function (field, rowData, newValue) {
            var self = this;
            var rows = self._viewModel._model._rows();
            var rowDataId = rowData.id();
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (rowDataId === row.id) {
                    self._viewModel._model._rows()[i][field] = newValue;
                }
            }
        },

        updateResourceColumnState: function (rowData) {
            var self = this;
            var sessionContext = self._viewModel._model.getSessionContext();
            self.setColumnsEditable(['assignedResourcesStr'], (rowData.effort() > 0));
        },
        
        /*
            1. Duration * No of hours in a workday * # of resources != Effort
            2. Task is starting before its Predecessors can finish. Fix the start date to align with end dates of predecessors
            3. Task has time from is predecessors. Fix the task dates to remove the lag
        */
        fixSchedulingErrors: function (rowData) {
            var self = this;
            var projCalendar = self._viewModel.projCalendar;
            var tempDate;
            var findEndDateCallback = function (date) {
                rowData.endDate(self._viewModel.dateToIsoString(date));
            };

            if (!rowData.numResources()) {
                rowData.numResources(1);
            }

            switch (rowData.schedulingErrorType()) {
                case schedulingErrorTypes.InvalidDuration: //Duration is not correct
                    if (!self.isTemplate) {
                        //recalculate the duration
                        var duration = Math.ceil(rowData.effort() / (rowData.numResources() * projCalendar.standardWorkdayHours));
                        if (isNaN(duration)) {
                            duration = 0;
                        }
                        rowData.duration(duration);
                        //since duration changed, enddate is re-calculated
                        tempDate = self._viewModel.parseISOString(rowData.startDate());
                        projCalendar.findEndDateForStartDateAndDuration(tempDate, rowData.duration(), rowData, findEndDateCallback);
                    }
                    break;
                case schedulingErrorTypes.InvalidStartDate: //Task starts before is predecesosrs end
                case schedulingErrorTypes.LagTime: //Task has lag time between its predecessors
                    if (!self.isTemplate) {
                        //Re-align start date
                        var predecessors = rowData.predecessors();
                        var startDate = self._findStartDateBasedOnPredecessors(predecessors);
                        rowData.startDate(startDate);
                        //since the start date changed, enddate is re-calculated
                        tempDate = self._viewModel.parseISOString(rowData.startDate());
                        projCalendar.findEndDateForStartDateAndDuration(tempDate, rowData.duration(), rowData, findEndDateCallback);
                    }
                    break;
                case schedulingErrorTypes.InvalidEffort: //Effort is not correct
                    if (!self.isTemplate) {
                        //Recalculate effort
                        var effort = rowData.duration() * rowData.numResources() * projCalendar.standardWorkdayHours;
                        rowData.effort(effort);
                    }
                    break;
                default:
                    break;
            }
            rowData.schedulingErrors(false);
            rowData.schedulingErrorType(schedulingErrorTypes.None);
            self._viewModel.updateRow(rowData);
        },

        fixAllSchedulingErrors: function(rowData) {
            var self = this;
            if (rowData == undefined) {
                rowData = self._viewModel.treeRoot;
            }

            if (self.isLeaf(rowData)) {
                if (rowData.schedulingErrorType() != schedulingErrorTypes.None) {
                    self.fixSchedulingErrors(rowData);
                }
                return;
            }

            if (rowData.__Children != undefined) {
                var len = rowData.__Children.length;
                for (var i = 0; i < len; i++) {
                    self.fixAllSchedulingErrors(rowData.__Children[i]);
                }
            }
        },

        //This notifies a nodes successors of a change to their predecessors and triggers updates if necessary.
        notifySuccessorsOfDateChange: function (rowData) {
            var self = this;
            var taskMap = self._model.taskMap;
            var successors = rowData.successorList();

            for (var i = 0; i < successors.length; i++) {
                var curNode = taskMap[successors[i]];
                if (curNode !== undefined) {
                    self.updateNodeDatesForPredecessors(curNode);
                }
                else{
                    successors.splice(i, 1);
                }
                
            }

        },

        //This method updates a rows start and end date after adding predecessors
        //Should be called after predecessors are validated
        updateNodeDatesForPredecessors: function (rowData) {
            var self = this;
            var predecessors = rowData.predecessors();
            if (predecessors.length > 0) {
                var wasUpdatingValues = self.isUpdatingValues();
                self.setUpdatingValues(false);
                var startDate = self._findStartDateBasedOnPredecessors(predecessors);
                rowData.startDate(startDate);
                self.setUpdatingValues(wasUpdatingValues);
                if (rowData.__isNew !== true) {
                    self._viewModel.updateRow(rowData);
                }
            }
        },

        //This method takes a list of predecessors and returns the valid start date based on the latest
        //end date for a predecessor in the list.
        _findStartDateBasedOnPredecessors: function (predecessors) {
            var self = this;
            var taskMap = self._model.taskMap;
            var curEndDate = taskMap[predecessors[0]].endDate();

            for (var i = 0; i < predecessors.length; i++) {
                if (taskMap[predecessors[i]].endDate() > curEndDate) {
                    curEndDate = taskMap[predecessors[i]].endDate();
                }
            }
            var retDate = self._viewModel.parseISOString(curEndDate);
            retDate.setDate(retDate.getDate() + 1);
            retDate = self._viewModel.projCalendar.findNextWorkDay(retDate);
            return self._viewModel.dateToIsoString(retDate);
        },

        //This method updates the predecessors array containing task id's
        updatePredecessorsForNode: function (rowData) {
            var self = this;
            var taskList = self._model.taskMap;
            var predecessorList = self.getPredecessors(rowData);
            var oldPredecessors = [];
            var predecessors = [];

            if (rowData.predecessors()) {
                oldPredecessors = rowData.predecessors();
            }

            //add new predecessors to the array
            for (var j = 0; j < predecessorList.length ; j++) {
                var curPredecessor = self._model.findByTopologicalId(predecessorList[j]);
                if (curPredecessor) {
                    predecessors.push(parseInt(curPredecessor.id(), 10));
                }
            }

            //find any predecessor relationships that were removed.
            var diff = $(oldPredecessors).not(predecessors).get();
            //Remove rowData as a successor for those nodes
            for (var i = 0; i < diff.length; i++) {
                var curPred = taskList[diff[i]];
                var index = curPred.successorList().indexOf(rowData.id());
                if (index > -1) {
                    //Remove from the successor list
                    curPred.successorList().splice(index, 1);
                }
            }
            rowData.predecessors(predecessors);
        },

        //Adds or removes rowData from the successor lists of its predecessors
        updateSuccessorsForNode: function (rowData){
            var self = this;
            var toUpdate = rowData.predecessors();
            var taskList = self._model.taskMap;
            var rowId = rowData.id()

            //Cycle through nodes to update
            for (var i = 0; i < toUpdate.length; i++) {
                var curPredecessor = taskList[toUpdate[i]];
                var index = curPredecessor.successorList().indexOf(rowId);
                if (index === -1) {
                    curPredecessor.successorList().push(rowId);
                }
            }
        },

        //When a node is deleted this method removes it from any node who has it as a predecessor
        removeNodeFromSucessors: function (rowData) {
            var self = this;
            //Get the successor list and the task map
            var toUpdate = rowData.successorList(); 
            var taskList = self._model.taskMap;
            var wasUpdatingValues = self.isUpdatingValues();

            self.setUpdatingValues(true);

            //For every successor for the given row
            for (var i = 0; i < toUpdate.length; i++) {
                var curNode = taskList[toUpdate[i]];
                //Get the list of predecessors
                var curPredList = self.getPredecessors(curNode);
                //Get the index of "rowData" in the predecessors lists (WBS ID list and task ID list)
                var predIndex = curNode.predecessors().indexOf(parseInt(rowData.id(),10));
                var wbsIndex = curPredList.indexOf(rowData.topologicalId().trim());

                //remove the rowData node from each list.
                curPredList.splice(wbsIndex, 1);
                curNode.predecessorList(curPredList);
                curNode.predecessors().splice(predIndex, 1);
            }

            self.setUpdatingValues(wasUpdatingValues);
        },

        //returns an array of the WBS ID predecessor list for a row.
        getPredecessors: function (rowData) {
            var self = this;
            if (rowData.predecessorList() === undefined) {
                return [];
            }
            //Get the list of predecessors
            if (!$.isArray(rowData.predecessorList())) {
                return rowData.predecessorList().replace(/\s/g, '').split(",");
            }
            else if (rowData.predecessorList()) {
                return rowData.predecessorList();
            }
            return [];
        },

        //Thing to validate
        /*
            1. Make sure all the WBS Id's in the predecessor list are valid:
                A. Actually are WBS ID's and not letters or symbols
                B. Summary Tasks can't have Predecessors because they are inherently dependant on their children. 
            2. There is no cyclical dependencies
        */
        validatePredecessorList: function (rowData) {
            var self = this;
            var validList = true;
            var curPredecessors = [];

            //Check if the predecessor list is undefined.
            if (rowData.predecessorList() === undefined) {
                return true;
            }

            //Get the list of predecessors
            curPredecessors = self.getPredecessors(rowData);

            //Check for empty predecessor list or an array with an empty string in it.
            if (curPredecessors.length === 0 || curPredecessors[0].trim() === "") {
                return true;
            }

            //If the current row has children AND predecessors, that is invalid.
            if (rowData.__Children.length > 0 && curPredecessors.length > 0) {
                return false;
            }

            //cycle through the array of predecessors and check that they are valid
            for (var i = 0; i < curPredecessors.length; i++) {
                if (self._model.findByTopologicalId(curPredecessors[i]) === undefined) {
                    $dyn.log("Invalide WBS ID " + curPredecessors[i]);
                    return false;
                }
            }

            //Check for cyclical dependencies
            validList = self.predecessorCycleCheck(rowData);
            if (validList === false) {
                self._showMessage($dyn.label('HierarchicalGridCommon_PredecessorCycleWarning'));
            }
            return validList;
        },

        resourceAssignmentExistsCheck : function (rowData) {
            var self = this;
            if (rowData.assignedResourcesStr()) {
                return true;
            }
            return false;
        },

        predecessorCycleCheck: function (rowData, curChain) {
            var self = this;
            var curChain = curChain || [];

            var cycleCheck = function (row, chain) {
                var curPredecessors = [];
                var curChain = chain.slice();
                //add the current task ID to the chain
                curChain.push(row.id());

                //Get the list of predecessors
                curPredecessors = self.getPredecessors(row);
                //Get the list of children tasks
                var childrenTasks = self.getTopologicalIdsofChildTasks(row);
                //combine the two lists and filter out duplicates
                var combinedList = curPredecessors.concat(childrenTasks);
                var toCheck = combinedList.filter(function (item, pos) { return combinedList.indexOf(item) == pos });
                toCheck = toCheck.filter(function (e) { return e });
                //For each predecessor
                for (var i = 0; i < toCheck.length; i++) {
                    //get the actual task for the predecessor
                    
                    var curPred = self._model.findByTopologicalId(toCheck[i]);
                    //check if the task is in the curren Chain
                    if (curChain.indexOf(curPred.id()) >= 0) {
                        //if yes, return cycle detected
                        $dyn.log("CYCLE DETECTED ON TASK " + toCheck[i] + "  " + curChain);
                        
                        return false;
                    }
                    else
                    {
                        //call cycleCheck for this task.
                        if (!cycleCheck(curPred, curChain)) {
                            return false;
                        }
                    }
                }
                return true;
            }

            return cycleCheck(rowData, curChain);
        },

        //Returns an array of row Objects that are valid predecessors for the given row
        getValidPredecessors: function( rowData, taskList) {
            var self = this;
            var validPredecessors = [];
            var invalidPredecessors = {};

            invalidPredecessors[(rowData.topologicalId().trim())] = true;

            //My Children and Their Children
            var getChildren = function (curRow) {
                for (var i = 0; i < curRow.__Children.length; i++) {
                    invalidPredecessors[(curRow.__Children[i].topologicalId().trim())] = true;
                    getChildren(curRow.__Children[i]);
                }
            };
            //My Successors and Their Successors (including Parents)
            var getSuccessors = function (curRow) {
                var curSuccessorList = curRow.successorList();
                for (var x = 0; x < curSuccessorList.length; x++) {
                    invalidPredecessors[(taskList[curSuccessorList[x]].topologicalId().trim())] = true;
                    getSuccessors(taskList[curSuccessorList[x]]);
                }
                if (!self._viewModel.isTopLevelNode(curRow.__Parent)) {
                    invalidPredecessors[(curRow.__Parent.topologicalId().trim())] = true;
                    getSuccessors(curRow.__Parent);
                }
            };

            getChildren(rowData);
            getSuccessors(rowData);

            //In order tree traversal to make sure the predecessor list is sorted.
            var treeRoot = self._viewModel.treeRoot;
            var getTopologicallySortedValidPredecessors = function (curRoot, validList, invalidList) {
                if (!self._viewModel.isTopLevelNode(curRoot)) {
                    var wbsId = curRoot.topologicalId().trim();
                    if (invalidList[wbsId] === undefined) {
                        validList.push(curRoot);
                    }
                }
                for (var loop = 0; loop < curRoot.__Children.length; loop++) {
                    getTopologicallySortedValidPredecessors(curRoot.__Children[loop], validList, invalidList);
                }
                return validList;
            };

            return getTopologicallySortedValidPredecessors(treeRoot, validPredecessors, invalidPredecessors);
        },

        //The AX Date control already validates that the date is in the correct format
        //Here we need to validate that the date is acceptable according to its start date and predecessors
        validateStartDateChanged: function (rowData) {
            var self = this;
            var taskMap;

            if (self.isTemplate) {
                return true;
            }

            taskMap = self._model.taskMap;
            //if this node has predecessors
            if (rowData.predecessors().length > 0 && taskMap.length > 0) {
                var startDateBasedOnPredecessors = self._findStartDateBasedOnPredecessors(rowData.predecessors());
                if (self._viewModel.autoSchedule) {
                    return (rowData.startDate() === startDateBasedOnPredecessors);
                }
                return (rowData.startDate() >= startDateBasedOnPredecessors);
            }
            return true;
        },

        copyRows: function (rowsToCopy){
            var self = this;
            var retArray = [];

            for (var i = 0; i < rowsToCopy.length; i++) {
                var rowToCopy = rowsToCopy[i];               
                var copy = self._viewModel._unwrapRowData(rowToCopy);
                retArray.push(copy);
            }
            return retArray;
        },

        //This method should clean up a tasks predecessors after an action is taken
        cleanUpAfterAction: function (row, action) {
            var self = this;
            var taskList = self._model.taskMap;
            var computeTopologicalIds = self._viewModel.computeTopologicalIds;
            var curPred;

            switch (action) {
                case "Indent":
                    if (computeTopologicalIds) {
                        self._validatePredecessors = false;
                        self._viewModel.recalcTopologicalIdsForSubTree(row.__Parent.__Parent);
                        self._validatePredecessors = true;
                    }
                    //remove my new parents predecessors and update those tasks successor lists
                    var parent = row.__Parent;
                    parent.category('');
                    parent.resourceCategoryStr('');
                    if (parent.predecessors()) {
                        for (var i = 0; i < parent.predecessors().length; i++) {
                            //clear parent from sucessor list of its predecessors
                            curPred = taskList[parent.predecessors()[i]];
                            var index = curPred.successorList().indexOf(parent.id());
                            curPred.successorList().splice(index, 1);
                        }
                        //clear the parents predecessors
                        parent.predecessors([]);
                        parent.predecessorList([]);
                    }
                    break;
                case "Outdent":
                    if (computeTopologicalIds) {
                        self._validatePredecessors = false;
                        self._viewModel.recalcTopologicalIdsForSubTree(row.__Parent);
                        self._validatePredecessors = true;
                    }
                    var siblings = row.__Parent.__Children;
                    var oldParentIndex = siblings.indexOf(row) - 1;
                    var oldParent = siblings[oldParentIndex];
                    if (oldParent) {
                        if (oldParent.__Children.length === 0) {
                            oldParent.category(self._viewModel.defaultCategory);
                            oldParent.effort(0);
                            if (!self.isTemplate) {
                                oldParent.duration(0);
                                oldParent.endDate(oldParent.startDate());
                                self.notifySuccessorsOfDateChange(oldParent);
                            }
                            self._viewModel.checkForSchedulingErrors(oldParent, false);
                            self.fixSchedulingErrors(oldParent);
                        }
                    }
                    //If I became a parent, remove my predecessors and update those tasks successor lists
                    var children = row.__Children;
                    if (children.length > 0) {
                        row.category('');
                        for (var i = 0; i < row.predecessors().length; i++) {
                            //clear parent from sucessor list of its predecessors
                            curPred = taskList[row.predecessors()[i]];
                            var index = curPred.successorList().indexOf(row.id());
                            curPred.successorList().splice(index, 1);
                        }
                        //clear the parents predecessors
                        row.predecessors([]);
                        row.predecessorList([]);
                    }
                    break;
                case "Moveup":
                    if (computeTopologicalIds) {
                        self._validatePredecessors = false;
                        self._viewModel.recalcTopologicalIdsForSubTree(row.__Parent);
                        self._validatePredecessors = true;
                    }
                    break;
                case "Movedown":
                    if (computeTopologicalIds) {
                        self._validatePredecessors = false;
                        self._viewModel.recalcTopologicalIdsForSubTree(row.__Parent);
                        self._validatePredecessors = true;
                    }
                    break;
                case "Delete":
                    var subRoot;
                    if(computeTopologicalIds){
                        if (row.__Level() === 1) {
                            subRoot = row;
                        }
                        else {
                            subRoot = row.__Parent;
                        }
                        self._viewModel.recalcTopologicalIdsForSubTree(subRoot);
                    }
                    break;
                default:
                    break;
            }

        },

        getTopologicalIdsofChildTasks: function (row){
            var childTasks = []
            if (row.__Children == undefined) {
                return childTasks;
            }
            var len = row.__Children.length;
            for (var i = 0; i < len; i++) {
                childTasks.push(row.__Children[i].topologicalId().trim());
            }
            return childTasks;
        },        

        getColumns: function() {
            var self = this;
            var columnsArray;
            var sessionContext = self._viewModel._model.getSessionContext();            
            var wbsId = { text: $dyn.label('HierarchicalGridCommon_WBSID'), dataField: "topologicalId", width: 110, editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none)};
            var wbsTask = { text: $dyn.label('HierarchicalGridCommon_WBSTask'), dataField: "name", width: 150, editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none) };
            var wbsDiff = { text: $dyn.label('HierarchicalGridCommon_WBSTaskDiffType'), dataField: "differenceDisplay", width: 30, editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none), visible: $dyn.observable(false), cellRenderer: self.renderDiffCell.bind(self) };
            var wbsScheduleError = { text: $dyn.label('HierarchicalGridCommon_WBSScheduleError'), dataField: "schedulingErrors", width: 30, align: "center", cellsAlign: "right", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none), visible: $dyn.observable(true), cellRenderer: self.renderErrorCell.bind(self), extendedStyle: "cell-warning" };
            var wbsNote = { text: $dyn.label('HierarchicalGridCommon_WBSNote'), dataField: "notes", width: 20, align: "center", cellsAlign: "center", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none), visible: $dyn.observable(true), cellRenderer: self.renderNoteCell.bind(self), extendedStyle: "cell-note" };
            var wbsPredecessors = { text: $dyn.label('HierarchicalGridCommon_WBSPredecessors'), dataField: "predecessorList", status: $dyn.observable($dyn.ui.StatusIndicator.none), editable: $dyn.observable(false), width: 100, cellsAlign: "right"};
            var wbsCategory = { text: $dyn.label('HierarchicalGridCommon_WBSCategory'), dataField: "category", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none), width: 110, align: "center", cellsAlign: "left",  range: self.projCategoryRange.bind(self)};
            var wbsTaskEffort = { text: $dyn.label('HierarchicalGridCommon_WBSTaskEffort'), dataField: "effort", width: 110, cellsFormat: "f2", align: "center", cellsAlign: "right", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none) };
            var wbsTaskStartDate = { text: $dyn.label('HierarchicalGridCommon_WBSTaskStartDate'), dataField: "startDate", cellsFormat: "d", width: 100, align: "center", cellsAlign: "center", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none) };
            var wbsTaskEndDate = { text: $dyn.label('HierarchicalGridCommon_WBSTaskEndDate'), dataField: "endDate", cellsFormat: "d", width: 100, align: "center", cellsAlign: "center", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none) };
            var wbsTaskDuration = { text: $dyn.label('HierarchicalGridCommon_WBSTaskDuration'), dataField: "duration", width: 120, cellsFormat: "f2", align: "center", cellsAlign: "right", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none), cellRenderer: self.renderDurationCell.bind(self) };
            var wbsNumResources = { text: $dyn.label('HierarchicalGridCommon_WBSNumResources'), dataField: "numResources", width: 120, cellsFormat: "f2", align: "center", cellsAlign: "right", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none), cellRenderer: self.renderNumResourcesCell.bind(self) };
            var wbsResourceCategory = { text: $dyn.label("HierarchicalGridCommon_WBSResourceCategory"), dataField: "resourceCategoryStr", width: 150, align: "center", cellsAlign: "center", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none), range: self.resourceCategoryRange.bind(self) };
            var wbsResource = {
                text: $dyn.label("HierarchicalGridCommon_WBSResource"), dataField: "assignedResourcesStr", width: 150, align: "center", cellsAlign: "left", editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none)
            };                
            var wbsRemainingHours = { text: $dyn.label('HierarchicalGridCommon_WBSRemainingHours'), dataField: "remainingHours", width: 150, cellsFormat: "f2", align: "center", editable: $dyn.observable(false), cellsAlign: "right", status: $dyn.observable($dyn.ui.StatusIndicator.none) };
            var wbsSchedulingStatus = { text: $dyn.label('HierarchicalGridCommon_WBSSchedulingStatus'), dataField: "schedulingStatus", width: 150, editable: $dyn.observable(false), status: $dyn.observable($dyn.ui.StatusIndicator.none) };
            if (sessionContext.projWBSType.toLowerCase() === self.wbsTemplate) {
                columnsArray = [wbsId, wbsTask, wbsNote, wbsPredecessors, wbsCategory, wbsTaskEffort, wbsNumResources, wbsResourceCategory];
            }
            else {
                columnsArray = [wbsId, wbsDiff, wbsScheduleError, wbsNote, wbsTask, wbsPredecessors, wbsCategory, wbsTaskEffort, wbsTaskStartDate, wbsTaskEndDate, wbsTaskDuration, wbsNumResources,
                    wbsResourceCategory, wbsResource,wbsSchedulingStatus, wbsRemainingHours];
            }
            return columnsArray;            
        },
        
        renderNumResourcesCell: function(cell, column, rowData) {
            var self = this;
            if (rowData.__Children.length > 0) {
                $(cell).find("input").css("visibility", "hidden");
            } else {
                $(cell).find("input").css("visibility", "");
            }
        },

        renderDurationCell: function (cell, column, rowData){
            var self = this;
            if (self.isTemplate && rowData.__Children.length > 0) {
                $(cell).find("input").css("visibility", "hidden");
            } else {
                $(cell).find("input").css("visibility", "");
            }
        },

        renderDiffCell: function (cell, column, rowData){
            var self = this;
            if (self._model.getSessionContext().showDifference) {
                var value = rowData.differenceType();
                if (value == 1) {
                    $(cell).find("input").css({ "backgroundColor": "lightgreen", "text-align": "center" }); //Added
                } else if (value == 3) {
                    $(cell).find("input").css({ "backgroundColor": "lightcoral", "text-align": "center" }); //Deleted
                } else if (value == 4) {
                    $(cell).find("input").css({"backgroundColor": "orange", "text-align": "center" });//DeletedWithActuals
                } else {
                    $(cell).find("input").css("backgroundColor", "");//Modified
                }
            }
        },

        
        renderErrorCell: function (cell, column, rowData){
            var self = this;
            if (rowData.schedulingErrors()) {
                $(cell).find(".checkBox").css("visibility", "visible");
            }
            else {
                $(cell).find(".checkBox").css("visibility", "hidden");
            }
        },

        renderNoteCell: function (cell, column, rowData) {
            var self = this;
            if (rowData.userMemo()) {
                $(cell).find(".checkBox").css("visibility", "visible");
            }
            else {
                $(cell).find(".checkBox").css("visibility", "hidden");
            }
        },

        createAutoScheduleButton: function (modeId) {
            var self = this;

            var menuButtonOption = {
                label: $dyn.label('HierarchicalGridCommon_AutoScheduling'),
                name: "AutoSchedulingMenu"
            };

            var autoSchedule = self.createAutoSchedulingButtonTemplate(modeId, "_autoScheduleButtonClick");
            var showHideErrors = self.createShowSchedulingErrorSelectButtonTemplate(modeId, "_showSchedulingErrosButtonClick");

            var fixAllOption = self._templateFactory.createButtonTemplate(modeId, "fixAll", $dyn.label('HierarchicalGridCommon_FixAllScheduleErrors'), "", "_fixAllScheduleErrorsButtonClick", {});
            var fixSelectedOption = self._templateFactory.createButtonTemplate(modeId, "fixSelected", $dyn.label('HierarchicalGridCommon_FixSelectedTasks'), "", "_fixSelectScheduleErrorsButtonClick", {});
            fixSelectedOption.addClass("hgrid-dropMenuButton");

            var options = [autoSchedule, showHideErrors, fixAllOption, fixSelectedOption];

            return self._templateFactory.createMenuButtonFromButtonList(modeId, menuButtonOption, options);
        },

        createFixScheduleButtonTemplate: function (modeId) {
            var self = this;

            var menuButtonOption = {
                label: $dyn.label('HierarchicalGridCommon_FixScheduleErrors'),
                name: "fixScheduleErrors"
            };

            var fixAllOption = {
                label: $dyn.label('HierarchicalGridCommon_FixAllScheduleErrors'),
                name: "fixAll"
            };
            fixAllOption["onclickMethodName"] = "_fixAllScheduleErrorsButtonClick";

            var fixSelectedOption = {
                label: $dyn.label('HierarchicalGridCommon_FixSelectedTasks'),
                name: "fixSelected"
            };
            fixSelectedOption["onclickMethodName"] = "_fixSelectScheduleErrorsButtonClick";

            
            var options = [fixAllOption, fixSelectedOption];
            
            return self._templateFactory.createMenuButtonTemplate(modeId, menuButtonOption, options);
        },
        
        createAutoSchedulingButtonTemplate: function (modeId, methodName) {
            var self = this;
            var mode1 = {}, mode2 = {};
            mode2.label = $dyn.label('HierarchicalGridCommon_AutoScheduleOff');
            mode1.label = $dyn.label('HierarchicalGridCommon_AutoScheduleOn');
            mode1.imageName = '';
            return self._templateFactory.createToggleButtonTemplate(modeId, "AutoScheduling", methodName, mode1, mode2);
        },

        createShowSchedulingErrorSelectButtonTemplate: function (modeId, methodName) {
            var self = this;
            var mode1 = {}, mode2 = {};
            mode1.label = $dyn.label('HierarchicalGridCommon_HideScheduleErrors');
            mode2.label = $dyn.label('HierarchicalGridCommon_ShowScheduleErrors');
            mode1.imageName = ''
            return self._templateFactory.createToggleButtonTemplate(modeId, "ShowSchedulingErrors", methodName, mode1, mode2)
        },
        
        _initToolbarContainer: function (container, toTheme) {
            var self = this;
            hierarchicalGrid.HierarchicalGridView.prototype._initToolbarContainer.apply(this, arguments);            
                      
            container.append(self._detailsButton);
            container.append(self._exportButton);

            var sessionContext = self._viewModel._model.getSessionContext();
                       
            if (sessionContext.projWBSType.toLowerCase() !== self.wbsTemplate) {
                container.append(self._importButton);
                container.append(self._restoreButton);
                container.append(self._autoScheduleButton);
                container.append(self._resourceAssignmentDetailsButton);
                container.append(self._attachmentsButton);
            }

            if (sessionContext.projWBSType.toLowerCase() === self.wbsProject) {
                container.append(self._proposeGenericResourceButton);                
            }

            
        },

        createLookup: function (popupForm, inputElement, rowData, field) {
            var self = this;
            switch (field) {
                case "category":
                    return self.createProjCategoryLookup(popupForm, inputElement, rowData);
                    break;
                case "resourceCategoryStr":
                    return self.createResourceCategoryLookup(popupForm, inputElement);
                    break;
                case "assignedResourcesStr":
                    return self.createResourceLookup(popupForm, inputElement, rowData, field);
                    break;
                case "predecessorList":
                    return self.createPredecessorGridLookup(popupForm, inputElement, rowData);
                default:
                    break;
            }
            return null;
        },

        createPredecessorGridLookup: function (popupForm, inputElement, rowData, field) {
            var self = this;
            var predecessors = [];
            var taskList = self._model.taskMap;
            var columns = [
                { text: 'WBS Id', columntype: 'textbox', dataField: 'topologicalId', width: 100, editable: false },
                { text: 'Task', columntype: 'textbox', dataField: 'name', width: 150, editable: false }
            ];

            var dataFields = [
                { name: "topologicalId", type: "string" },
                { name: "name", type: "string" }
            ];
            var validPredecessors = self.getValidPredecessors(rowData, taskList);
            for (var loop = 0; loop < validPredecessors.length; loop++) {
                var predecessor = {};
                predecessor["topologicalId"] = validPredecessors[loop].topologicalId().trim();
                predecessor["name"] = validPredecessors[loop].name();
                predecessors.push(predecessor);
            }

            return self._createGridLookup(popupForm, inputElement, columns, dataFields, "topologicalId", predecessors, true);
        },

        projCategoryRange: function() {
            var self = this;
            return self._viewModel.categoryTypes[0].map(function (categoryType) { return categoryType.category });
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
            return self._createGridLookup(popupForm, inputElement, columns, dataFields, "category", self._viewModel.categoryTypes[0], false);
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

        createResourceLookup: function (popupForm, inputElement, rowData, field) {
            var self = this;
            
            var tableContent = self.getResourceAssignmentContent(rowData);
            var element = $(tableContent);

            var resourceAssignmentForm = element.find("#resourceAssignmentForm");
            resourceAssignmentForm.click(function () {
                if (!self.hasInvalidPendingChanges) {
                    $dyn.context(popupForm).Close()();
                    self.saveButtonClick();
                    self._viewModel.launchAvailabilityView(rowData);
                    self.refreshData();
                }
            });

            var assignAcceptInput = element.find("#assignAcceptInput");
            assignAcceptInput.click(function () {
                var assignedResourcesRecId = "";
                var windowContent = $("#assignmentWindowContent").children();
                var windowContentCheckBoxes = windowContent.find("input:checkbox");
                if (windowContentCheckBoxes) {
                    for (var i = 0; i < windowContentCheckBoxes.length; i++) {
                        if (windowContentCheckBoxes[i].checked === true) {
                            if (assignedResourcesRecId) {
                                assignedResourcesRecId += "," + windowContentCheckBoxes[i].getAttribute("data-value");
                            }
                            else {
                                assignedResourcesRecId = windowContentCheckBoxes[i].getAttribute("data-value");
                            }
                        }
                    }
                }
                $dyn.context(popupForm).Close()();
                self.saveButtonClick();
                self._viewModel.updateResourceAssignment(rowData, assignedResourcesRecId);
                self.refreshData();
            });

            var assignCancelInput = element.find("#assignCancelInput");
            assignCancelInput.click(function () {
                $dyn.context(popupForm).Close()();
            });

            var assignAutoInput = element.find("#assignAutoInput");
            assignAutoInput.click(function () {
                $dyn.context(popupForm).Close()();
                self._viewModel.autoAssignResource(rowData);
            });

            return element[0];
        },

        getResourceAssignmentContent: function (rowData) {
            var self = this;
            var projectTeamResources = self._viewModel.projectTeamResources;
            var disabledStyle = projectTeamResources.length > 0 ? "" : "opacity: 0.6; pointer-events: none;";

            var sessionContext = self._model.getSessionContext();
            var isQuotation = (sessionContext.projWBSType.toLowerCase() === self.wbsProjectQuotation);

            var assignAutoInputVisibility = "";
            if (isQuotation || !publishState) {
                assignAutoInputVisibility = "hidden";
            }

            var launchResourceAssignmentFormVisibility = "";
            if (!isQuotation && !publishState) {
                launchResourceAssignmentFormVisibility = "hidden";
            }

            var tableContent = "<div id='assignmentWindowContent'>";
            tableContent += "<div style='overflow-y:auto; max-height:150px'>";

            for (var i = 0; i < projectTeamResources.length; i++) {
                var projectTeamResource = projectTeamResources[i];
                var checkedStyle = "";
                if (rowData.assignedResourcesRecId && rowData.assignedResourcesRecId().indexOf(projectTeamResource.activityResource) != -1) {
                    checkedStyle = "checked='yes'";
                }
                tableContent += ("<div style='margin:6px 0px 0px 6px'><input type='checkbox' id='checkboxInput' " + checkedStyle + "data-value='" +
                    projectTeamResource.activityResource + "' style='margin:2px 6px 0px 0px'>" + "<span id='resourceName' style='vertical-align:top; margin-right:6px'>" +
                    self.htmlEncode(projectTeamResource.activityResourceName) + "</span><span id='resourceCategory' style='vertical-align:top; margin-right:6px'>" +
                    self.htmlEncode(projectTeamResource.resourceCategoryName) + "</span></div>");                
            }
            tableContent += "</div>";
            tableContent += "<div id='resourceAssignmentForm' style='margin:6px 0px 0px 6px; cursor:pointer; color:blue; visibility: " + launchResourceAssignmentFormVisibility + "'>" + $dyn.label("HierarchicalGridCommon_WBSLaunchAssignmentForm") + "</div>";
            tableContent += "<div style='margin:6px 0px 6px 6px'>";
            tableContent += "<button type='button' id='assignAcceptInput' style='margin-right:6px; padding:4px 8px; " + disabledStyle + "'>" + $dyn.label("HierarchicalGridCommon_WBSAssignAccept") + "</button>";
            tableContent += "<button type='button' id='assignCancelInput' style='margin-right:6px; padding:4px 8px; '>" + $dyn.label("HierarchicalGridCommon_WBSAssignCancel") + "</button>";
            tableContent += "<button type='button' id='assignAutoInput' style='margin-right:6px; padding:4px 8px; visibility: " + assignAutoInputVisibility + "'>" + $dyn.label("HierarchicalGridCommon_WBSAssignAutomatically") + "</button>";
            tableContent += "</div>";

            tableContent += "</div>";
            return tableContent;
        },

        getProjCategorySource: function () {
            var self = this;
            var source;
            source = self._viewModel.categoryTypes[0];
            return source;
        },

        _initButtons: function () {
            var self = this;
            hierarchicalGrid.HierarchicalGridView.prototype._initButtons.apply(self, arguments);
            
            self._detailsButton = self._templateFactory.createButtonTemplate(self._modeId, 'Details', $dyn.label('HierarchicalGridCommon_Details'), '', '_detailsButtonClick');
            self._autoScheduleButton = self.createAutoScheduleButton(self._modeId);
            self._restoreButton = self._templateFactory.createButtonTemplate(self._modeId, 'Restore', $dyn.label('HierarchicalGridCommon_Restore'), 'Restore', '_restoreWBSButtonClick');
            self._importButton = self._templateFactory.createButtonTemplate(self._modeId, 'Import', $dyn.label('HierarchicalGridCommon_Import'), 'Import', '_importWBSButtonClick');
            self._exportButton = self._templateFactory.createButtonTemplate(self._modeId, 'Export', $dyn.label('HierarchicalGridCommon_Export'), 'Export', '_exportWBSButtonClick');
            self._proposeGenericResourceButton = self._templateFactory.createButtonTemplate(self._modeId, 'ProposeGenericResource', $dyn.label('HierarchicalGridCommon_AutoGenerateTeam'), 'ManyPeople', '_proposeGenericResourceButtonClick');
            self._resourceAssignmentDetailsButton = self._templateFactory.createButtonTemplate(self._modeId, 'ResourceAssignmentDetails', $dyn.label('HierarchicalGridCommon_WBSResourceAssignment'), 'Details', '_resourceAssignmentDetailsButtonClick');
            self._attachmentsButton = self._templateFactory.createButtonTemplate(self._modeId, 'attachments', $dyn.label('HierarchicalGridCommon_Attachments'), '', '_attachmentsButtonClick');
        },

        addButtonClick: function (event) {
            var self = this;
            hierarchicalGrid.HierarchicalGridView.prototype.addButtonClick.apply(self, arguments);
            var selectedRow = self.getSelectedRow();
            var subRoot;
            if (selectedRow.__Level() === 1) {
                subRoot = selectedRow;
            }
            else {
                subRoot = selectedRow.__Parent;
            }
            self._viewModel.recalcTopologicalIdsForSubTree(subRoot);
        },

        _exportWBSButtonClick: function (event) {
            var self = this;
            if (!self.hasInvalidPendingChanges) {
                self._viewModel.exportImportWBSTemplate(true);
            }
            $dyn.log("export wbsbutton click called");
        },

        _restoreWBSButtonClick: function (event) {
            var self = this;
            
            var selectedRows = self.getSelectedRows(false);
            var numRows = selectedRows.length;
            var ignoreList = [];
            //var showDiff = self._model.getSessionContext().showDifference;
            var currRow;
            
            //TODO: Do we need to do this?
            /*
            if (!showDiff) {
                return;
            }
            */
            
            //Remove the rows that are not deleted and hence cannot be restored
            while (numRows--) {
                currRow = selectedRows[numRows];
                if (currRow.differenceType() != "3" && currRow.differenceType() != "4" ) {
                    selectedRows.splice(numRows,1)        
                }
            }

            //if only non-deleted rows were selected, don't do anything
            if (selectedRows.length == 0) {
                return;
            }
            
            if (!self.hasInvalidPendingChanges) {
                
                //For multiple nodes that belong to same subtree, select the top-most node
                for (numRows = 0; numRows < selectedRows.length; numRows++) {
                    currRow = selectedRows[numRows];
                    self._viewModel.postorderVisit(function(ignoredRow) {
                            ignoreList.push(ignoredRow);
                        },
                        currRow.__Children
                    );
                }
                selectedRows = selectedRows.filter(function(someRow){return ignoreList.indexOf(someRow) < 0 });
                
                self._viewModel.restoreTask(selectedRows);
            }
            $dyn.log("restore wbsbutton click called");
        },

        _importWBSButtonClick: function (event) {
            var self = this;
            if (!self.hasInvalidPendingChanges) {
                self._viewModel.exportImportWBSTemplate(false, self.getSelectedRow());
            }
            $dyn.log("import wbsbutton click called");
        },

        _proposeGenericResourceButtonClick: function (event) {
            var self = this;
            if (publishState) {
                self._viewModel.proposeGenericResource();
            }
        },
        
        _resourceAssignmentDetailsButtonClick: function (event) {
            var self = this;
            if (!self.hasInvalidPendingChanges) {
                self.saveButtonClick();
                self._viewModel.resourceAssignmentDetails(self.getSelectedRow());
            }
        },        
        
        indentButtonClick: function (event) {
            var self = this;
            var preActions = self._undoManager.operationEntries.length;
            var selectedRowsData = self.getSelectedRows();
            var selectedRowsFutureParents = [];
            //deep copy of the parents just in case
            var needToUndo = false;
            for (var x = 0; x < selectedRowsData.length; x++) {
                var parent = selectedRowsData[x].__Parent;
                var prevSiblingPosition = parent.__Children.indexOf(selectedRowsData[x]) - 1;
                if (prevSiblingPosition > -1) {
                    var prevSibling = parent.__Children[prevSiblingPosition];
                    if (prevSibling.__Children.length === 0) {
                        if (self.resourceAssignmentExistsCheck(prevSibling)) {
                            // If the above task has resource assigned to it, then indent should not be allowed
                            self._showMessage($dyn.label('HierarchicalGridCommon_ErrorIndentResourceExists').replace('%1', prevSibling.name().trim()));
                            needToUndo = true; 
                            break;
                        }
                        selectedRowsFutureParents.push(prevSibling);
                    }
                }
            }
            if (!needToUndo) {
                var copyOfParents = self.copyRows(selectedRowsFutureParents);
                hierarchicalGrid.HierarchicalGridView.prototype.indentButtonClick.apply(this, arguments);
                var postActions = self._undoManager.operationEntries.length;
                for (var i = 0; i < selectedRowsData.length; i++) {
                    var rowData = selectedRowsData[i];
                    if (!self.predecessorCycleCheck(rowData)) {
                        self._showMessage($dyn.label('HierarchicalGridCommon_InvalidIndent'));
                        needToUndo = true; //If the cycle check returns false we need to undo this operation
                        break;
                    }
                }
                if (needToUndo) { //Undo all the actions performed in this indent
                    var undoTimes = postActions - preActions;
                    self.undoActionCausingInvalidPredecessors(undoTimes, "Indent", selectedRowsData, copyOfParents);
                }
                else { //Update scheduling status for the root
                    self._viewModel.updateRow(self._viewModel.treeRoot);
                }
            }
        },

        outdentButtonClick: function (event) {
            var self = this;
            var preActions = self._undoManager.operationEntries.length;
            var selectedRowsData = self.getSelectedRows();
            hierarchicalGrid.HierarchicalGridView.prototype.outdentButtonClick.apply(this, arguments);
            var postActions = self._undoManager.operationEntries.length;
            var needToUndo = false;
            for (var i = 0; i < selectedRowsData.length; i++) {
                var rowData = selectedRowsData[i];
                if (!self.predecessorCycleCheck(rowData)) {
                    self._showMessage($dyn.label('HierarchicalGridCommon_InvalidOutdent'));
                    needToUndo = true; //If the cycle check returns false we need to undo this operation
                    break;
                }
                else if (self.resourceAssignmentExistsCheck(rowData)) {
                    // If this row has resource assigned, then outdent will only be allowed if it won't have children
                    var numOfChildren = rowData.__Children.length;
                    if (numOfChildren != 0) {
                        self._showMessage($dyn.label('HierarchicalGridCommon_ErrorOutdentResourceExists').replace('%1', rowData.name().trim()));
                        needToUndo = true;
                        break;
                    }
                }
            }
            if (needToUndo) {//Undo all the actions performed in this outdent
                var undoTimes = postActions - preActions;
                self.undoActionCausingInvalidPredecessors(undoTimes, "Outdent", selectedRowsData);
            }
            else { //Update scheduling status for root.
                self._viewModel.updateRow(self._viewModel.treeRoot);
            }
        },

        undoActionCausingInvalidPredecessors: function(actionsToUndo, action, selectedRows, parentsArray){
            var self = this;
            while (actionsToUndo > 0) {
                self._undo();
                actionsToUndo--;
            }
            var wasUpdatingValues = self.isUpdatingValues();
            self.setUpdatingValues(true); //Skip cell value changed
            self._validatePredecessors = false; //Skip Predecessor Validation since we're reverting back to a valid state
            if (selectedRows.length === 1) {
                self._viewModel.recalcTopologicalIdsForSubTree(selectedRows[0].__Parent);
            } else {
                self._viewModel.recalcTopologicalIdsForSubTree(self._viewModel.treeRoot);
            }
            
            switch (action) {
                case "Indent":
                    var taskList = self._model.taskMap;
                    if (parentsArray) {
                        var oldSkipCellValueChanged = self._viewModel.skipCellValueChanged;
                        self._viewModel.skipCellValueChanged = true;
                        for (var i = 0; i < parentsArray.length; i++) {
                            var curParent = parentsArray[i];
                            var curTask = taskList[curParent.id];
                            curTask.category(curParent.category);
                            curTask.predecessors(curParent.predecessors);
                            curTask.predecessorList(curParent.predecessorList);
                            curTask.assignedResourcesStr(curParent.assignedResourcesStr);
                            curTask.numResources(curParent.numResources);
                            self.updateSuccessorsForNode(curTask);
                        }
                        self._viewModel.skipCellValueChanged = oldSkipCellValueChanged;
                    }
                    break;
                case "Outdent":
                    break;
                default:
                    break;
            }
            self._validatePredecessors = true;
            self.setUpdatingValues(wasUpdatingValues);
            self.refreshSummaries();
        },

        enableCustomKeyboardShortcuts: true,

        get _detailColumns() {
            return ["effort", "startDate", "endDate", "duration", "numResources", "resourceCategoryStr",
                "assignedResourcesStr", "remainingHours", "schedulingStatus"];
        },

        init: function () {
            var self = this;
            $dyn.async(function () {                
                self.retrieveResourceCategories();
                self._viewModel.retrieveProjectTeamResources();
                self._viewModel.getCategoryTypes();
                self._viewModel.getDefaultProjCategory();
                self._viewModel.getStandardWorkingDayHours();
                hierarchicalGrid.HierarchicalGridView.prototype.init.call(self);
            });
            $dyn.log("init scheduleplanningview");
        },

        retrieveResourceCategories: function () {
            var self = this;

            return self._viewModel.retrieveResourceCategories(function () {
                if (self._viewModel.resourceCategoryStrGenerationMissed) {
                    self.refreshSummaries();
                    self._viewModel.resourceCategoryStrGenerationMissed = false;
                }
            });
        },

        _attachmentsButtonClick: function (event) {
            var self = this;
            var selectedRow = self.getSelectedRow();
            self._viewModel.openAttachmentsForm(selectedRow);
        },

        _detailsButtonClick: function (event) {
            var self = this;
            if (!self.hasInvalidPendingChanges) {
                self.saveButtonClick();
                var selectedRow = self.getSelectedRow();
                self._viewModel.openDetailsForm(selectedRow);
            }
            self.refreshData();
            self.updateUI("Save");
        },
        
        _autoScheduleButtonClick: function (event) {
            var self = this;
            self._viewModel.setAutoSchedule(event);
        },

        _showSchedulingErrosButtonClick: function (event) {
            var self = this;
            if (event === $dyn.label('HierarchicalGridCommon_ShowScheduleErrors') ) {
                // Hide Column
                self.setColumnVisible("schedulingErrors", false);
            }
            else {
                // Show Column
                self.setColumnVisible("schedulingErrors", true);
            }
        },

        _fixAllScheduleErrorsButtonClick: function (event) {
            var self = this;
            self.fixAllSchedulingErrors();
            self.refreshSummaries();
        },

        _fixSelectScheduleErrorsButtonClick: function (event) {
            var self = this;
            var selectedRows = self.getSelectedRows();

            for (var i = 0; i < selectedRows.length; i++) {
                self.fixSchedulingErrors(selectedRows[i]);
            }
            self.refreshSummaries();
        },

        preTreeGridLoad: function (treeGridInitData) {
            var self = this;
            self._model._taskMap = [];
        },
        
        treeGridLoaded: function () {
            var self = this;
            var wasUpdatingValues = self.isUpdatingValues();
            self.setUpdatingValues(true);
            var sessContext = self._model.getSessionContext();
            if (sessContext.projWBSType.toLowerCase() !== self.wbsTemplate) {
                self._viewModel.getCalendarDetails();
            }
            self._viewModel.buildRowDataMap();
            self._viewModel.convertPredecessors(self._model.tasksWithPredecessors);
            self.setUpdatingValues(wasUpdatingValues);

            if (sessContext.projWBSType.toLowerCase() === self.wbsProject) {
                publishState = sessContext.isPublished;
                self.updateColumnStateForProject(publishState);
                self.updateUI(publishState ? "Published" : "Draft");
            }

            var selectedRow = self.getSelectedRow();

            if (!selectedRow) {
                return;
            }

            if (selectedRow.__Level() == 1) {
                self.setRowEditable(false);
            }


        },

    });

    hierarchicalGrid.SchedulePlanningHierarchicalGridViewModel = function (model, controlElement, treeGridSelector) {
        var self = this;
        hierarchicalGrid.HierarchicalGridViewModel.apply(self, arguments);
        self.projCalendar = null;
        self.autoSchedule = true;
        self.updatingDateMap = false;
        self._model.preSave = self.updateRoot.bind(self);
    };

    hierarchicalGrid.SchedulePlanningHierarchicalGridViewModel.prototype = $dyn.extendPrototype(hierarchicalGrid.HierarchicalGridViewModel.prototype, {
        enableSummarization: true,

        newRowData: function (row, parent, relativePosition) {
            var self = this;
            var grandParent;
            if (parent && parent.__Parent && parent.__Parent.__Level() !== 0) {
                grandParent = parent.__Parent;
                relativePosition = grandParent.__Children.indexOf(parent) + 1;
                parent = grandParent;
            }

            parent.__Expanded(true);
            row.category = $dyn.observable(self.defaultCategory);
            row.startDate = $dyn.observable(parent.startDate());
            row.endDate = $dyn.observable(parent.endDate());
            row.duration = $dyn.observable(0);
            row.numResources = $dyn.observable(1);
            row.effort = $dyn.observable(0);
            row.predecessorList = $dyn.observable([]);
            row.predecessors = $dyn.observable([]);
            row.successorList = $dyn.observable([]);
            row.__Parent = parent;
            if (self._view.isTemplate) {
                row.startDate = $dyn.observable(self.dateToIsoString(new Date()));
                row.endDate = $dyn.observable(self.dateToIsoString(new Date()));
            }

            if (self.projCalendar && self.projCalendar.isCalendarLoaded) {
                var duration = self.projCalendar.calcDuration(self.parseISOString(row.startDate()), self.parseISOString(row.endDate()), row.effort());
                row.duration = $dyn.observable(duration);

                if (self.autoSchedule) {
                    row.effort(self.projCalendar.standardWorkdayHours * row.duration());
                }
            }

            return { newRow: row, relativePosition: relativePosition };
        },

        get defaultCategory() {
            var self = this;
            return self._model._defaultCategory[0];
        },
        
        dataFields: [
                { name: "id", type: "string" },
                { name: "parentId", type: "string" },
                { name: "topologicalId", type:"string" },
                { name: "name", type: "string" },
                { name: "differenceType", type: "string" },
                { name: "differenceDisplay", type: "string" },
                { name: "category", type: "lookup" },
                { name: "effort", type: "number" },
                { name: "startDate", type: "date" },
                { name: "endDate", type: "date" },
                { name: "duration", type: "number" },
                { name: "numResources", type: "number" },
                { name: "resourceCategoryStr", type: "lookup" },
                { name: "assignedResourcesStr", type: "lookup" },
                { name: "assignedResourcesRecId", type: "string" },
                { name: "assignedResourcesOriginalRecId", type: "string" },
                { name: "remainingHours", type: "number" },
                { name: "schedulingStatus", type: "string" },
                { name: "hasDraftAssignment", type: "boolean" },
                { name: "deleteTask", type: "boolean" },
                { name: "totalAssignedActivityResources", type: "number" },
                { name: "totalAssignedPlannedResources", type: "number" },
                { name: "schedulingErrors", type: "boolean" },
                { name: "predecessors", type: "array" },
                { name: "predecessorList", type: "lookup" },
                { name: "successorList", type: "array" },
                { name: "assignedHours", type: "number" },
                { name: "schedulingErrorType", type: "number" },
                { name: "siblingNumber", type: "number" },
                { name: "notes", type: "boolean" },
                { name: "userMemo", type: "string" },
        ],
        
        get taskMap() {
            var self = this;
            return self._model.taskMap;
        },

        addRow: function (rowData, bypassModel) {
            var self = this;

            //Add row to task Map
            self._model._taskMap[rowData.id()] = rowData;

            var retVal = hierarchicalGrid.HierarchicalGridViewModel.prototype.addRow.apply(this, arguments);
            return retVal;
        },

        updateRow: function (rowData) {
            var self = this;
            self._model.updateRow(self._unwrapRowData(rowData));
        },

        deleteRow: function (rowData, bypassModel) {
            var self = this;
            if (rowData.__Level === 1) {
                return
            }
            //Remove this node from its successors
            self._view.removeNodeFromSucessors(rowData);

            //Remove draft assignment records if they were created.
            if (!publishState) {
                rowData.deleteTask(true);
                self.removeDraftActivityResources(rowData);
            }

            //Check if I am the last sibling and if so add category to parent
            var oldParent = rowData.__Parent;
            if (oldParent.__Children.length === 0) {
                oldParent.category(self.defaultCategory);
                oldParent.effort(0);
                if (!self._view.isTemplate) {
                    oldParent.endDate(oldParent.startDate());
                    oldParent.duration(0);
                    self._view.notifySuccessorsOfDateChange(oldParent);
                    self.checkForSchedulingErrors(oldParent, false);
                    self._view.fixSchedulingErrors(oldParent);
                }
            }

            return hierarchicalGrid.HierarchicalGridViewModel.prototype.deleteRow.apply(this, arguments);
        },

        validateModifiedRow: function (rowData) {
            var self = this;
            var result =  new hierarchicalGrid.ValidationResult(true, []);
            var category; 
            
            //short circuit validation for new project with only a root node.
            if (rowData.__Parent.__Level() === 0) { 
                return result;
            }

            
            if (self.isLeaf(rowData)) {
                category = rowData.category();
                
                if (category)
                {
                    category = category.trim();
                }
                
                if (!category) {
                    result.success = false;
                    result.messages.push($dyn.label('HierarchicalGridCommon_BlankCategoryWarning'));
                    self._view.setColumnStatus("category", $dyn.ui.StatusIndicator.mandatory);
                }
            }
            
            if (!self._view.isTemplate) {
                var startDate = rowData.startDate();
                var endDate = rowData.endDate();

                if (startDate === "" || endDate === "") {
                    result.success = false;
                    result.messages.push($dyn.label('HierarchicalGridCommon_DateEmptyWarning'));
                }

                if (startDate && endDate) {
                    startDate = self.parseISOString(startDate);
                    endDate = self.parseISOString(endDate);
                    if (endDate < startDate) {
                        result.success = false;
                        result.messages.push($dyn.label('HierarchicalGridCommon_StartDateInvalidWarning'));
                    }
                }
            }
            
            return result;
        },


        isWorkingDay: function(date) {
            var self = this;

            if (self.projCalendar) {
                return self.projCalendar.isWorkingDay(date);
            }

            return true;
        },

        //Should check if the date is in the current Date map in the current ProjectCalendar.
        //If it is, do nothing. 
        //If its not, we need to call the server to get more dates in the map.
        checkDateInMap: function (date, rowData, callBack){
            var self = this;

            if (self.projCalendar) {
                if (!self.projCalendar.isDateInMap(date) && !self.updatingDateMap) {
                    self._view._showMessage($dyn.label('HierarchicalGridCommon_GetMoreDatesMsg'));
                    self.updatingDateMap = true;
                    self.getMoreCalendarDates(date, rowData, callBack);
                    return false;
                }
                
            }
            return true;
        },

        openAttachmentsForm: function (rowData) {
            var self = this;
            self._model.openAttachmentsForm(rowData);
        },

        openDetailsForm: function (rowData) {
            var self = this;
            self._model.openDetailsForm(rowData);
        },
        
        getCalendarDetails: function () {
            var self = this;
            var treeRoots = self.treeRoots;
            var rowData;
            

            if (treeRoots && treeRoots.length > 0) {
                rowData = treeRoots[0];
                var startDate = self.parseISOString(rowData.startDate());
                var endDate = self.parseISOString(rowData.endDate());

                startDate.setDate(startDate.getDate() - 150);
                endDate.setDate(endDate.getDate() + 365);
                return self._model.getCalendarDetails(startDate, endDate, function () {
                    self.projCalendar = new hierarchicalGrid.ProjectCalendar(rowData.startDate, rowData.endDate, self.getWorkingHoursForDay(),
                                            self._model.calendarDetails, self._view._viewModel);
                    //Check scheduling
                    self.checkSchedulingErrors(rowData, false);
                    if (justImported) {
                        self._view.fixAllSchedulingErrors();
                        justImported = false;
                    }
                    self._view.refreshSummaries();
                });
            }
        },

        getMoreCalendarDates: function (newDate, rowData, callBack) {
            var self = this;
            var startDate;
            var endDate;
            var lastDate = self.parseISOString(self.projCalendar.lastDateInMap);
            var firstDate = self.parseISOString(self.projCalendar.firstDateInMap);
            var newerDate = self.parseISOString(newDate);
            if (newerDate < firstDate) {
                newerDate.setDate(newerDate.getDate() - 150);
                startDate = newerDate;
                endDate = firstDate;
            }
            else {
                newerDate.setDate(newerDate.getDate() + 150);
                startDate = lastDate;
                endDate = newerDate;
            }

            return self._model.getCalendarDetails(startDate, endDate, function () {
                self.projCalendar.createDateMap(self._model.calendarDetails);
                //Check scheduling
                self.checkSchedulingErrors(rowData, false);
                self._view.refreshSummaries();
                self.updatingDateMap = false;
                if (callBack) {
                    callBack();
                }
            });
        },

        //This will build the map to associate taskId's with a reference to the rowData
        buildRowDataMap: function () {
            var self = this;
            var treeRoot = self.treeRoot;
            var taskMap = [];
            var predMap = [];

            var traverseFromRoot = function (root, map, predMap) {
                if (root.__Children != undefined) {
                    for (var i = 0; i < root.__Children.length; i++) {
                        var curChild = root.__Children[i];
                        traverseFromRoot(curChild, map, predMap);
                    }
                }
                map[root.id()] = root;
                if ($dyn.value(root.predecessors) && $dyn.value(root.predecessors).length) {
                    predMap.push(root);
                }
                else{
                    root.predecessors([]);
                    root.predecessorList([]);
                }
                return map;
            }
            
            self._model._taskMap = traverseFromRoot(treeRoot, taskMap, predMap);
            self._model.tasksWithPredecessors = predMap;
        },

        //Converts task Id's from the server into WBS ID's
        convertPredecessors: function (predecessorArray) {
            var self = this;
            var taskList = self._model.taskMap;
           

            for (var i = 0; i < predecessorArray.length; i++) {
                var rowData = predecessorArray[i];
                var predecessors = rowData.predecessors();
                var predecessorList = [];

                for (var x = 0; x < predecessors.length; x++) {
                    var curPredecessor = taskList[predecessors[x]];
                    predecessorList[x] = curPredecessor.topologicalId().trim();
                    //Add the current rowData object to the list of successors for curPredecessor here saving the need for another map/method/call
                    var successorList = curPredecessor.successorList();
                    successorList.push(rowData.id());
                    curPredecessor.successorList(successorList);
                }
                rowData.predecessorList(predecessorList.sort());
            }

        },

        //updates a rows successors after its position in the WBS has changed.
        updateSucessors: function (rowData) {
            var self = this;
            var curChild;
            var newWBSId = self._model.getTopologicalId(rowData).trim();
            var taskList = self._model.taskMap;

            //for each successor in the rows sucessor list
            for (var i = 0; i < rowData.successorList().length; i++) {
                //get current successor
                curChild = taskList[rowData.successorList()[i]];
                if (curChild !== undefined) {
                    var indexOfSucessor = curChild.predecessors().indexOf(parseInt(rowData.id(),10)); //index of the task ID in the predecessors array
                    var myPredecessors;
                    if (!$.isArray(curChild.predecessorList())) {
                        myPredecessors = curChild.predecessorList().replace(/\s/g, '').split(",");
                    }
                    else {
                        myPredecessors = curChild.predecessorList();
                    }
                    myPredecessors[indexOfSucessor] = newWBSId.toString(); //set that index in the converted predecessor list to the new WBS ID
                    var wasUpdating = self._view.isUpdatingValues();
                    self._view.setUpdatingValues(true);
                    curChild.predecessorList(myPredecessors.toString());
                    self._view.setUpdatingValues(wasUpdating);
                }
                else {
                    rowData.successorList().splice(i, 1);
                }
            }
        },

        setAutoSchedule: function (event) {
            var self = this;

            if (event === $dyn.label('HierarchicalGridCommon_AutoScheduleOn') ) {
                self.autoSchedule = true;
            }
            else {
                self.autoSchedule = false;
            }
        },

        getWorkingHoursForDay: function (date) {
            var self = this;
            if (self.projCalendar && self.projCalendar.isCalendarLoaded) { //Check the ProjCalendar first
                return self.projCalendar.standardWorkdayHours;
            } else if (self._model._standardWorkingDayHours && self._model._standardWorkingDayHours.length === 1) { //Otherwise get what was loaded from the server on init
                var workingHours = self._model._standardWorkingDayHours[0] ? self._model._standardWorkingDayHours[0] : 8;
                return workingHours;
            }
            return 8; //Default if details weren't pulled from the server.
        },

        getStandardWorkingDayHours: function (){
            var self = this;
            self._model.getStandardWorkingDayHours();
        },

        exportImportWBSTemplate: function (exportTemplate, selectedRow){
            var self = this;
            var elemNumber = " ";

            var updateRoot = function() {
                if (exportTemplate === false) {
                    self.updateRow(self.treeRoot);
                    $dyn.async(function () { 
                        self.save();
                    });
                }
            }

            
            if (!exportTemplate) {
                elemNumber = selectedRow.id();
            }

            return self._model.exportImportWBSTemplate(exportTemplate, elemNumber, updateRoot);
        },
       
        restoreTask: function (selectedRows) {
            var self = this;
            var elemNumbers = [];
            
            for (var num = 0; num < selectedRows.length; num++) {
                elemNumbers.push(selectedRows[num].id())
            }
           
            return self._model.restoreTask(elemNumbers);
        },

        launchAvailabilityView: function (rowData) {
            var self = this;
            self._model.launchAvailabilityView(rowData,
                function (launchResult) {
                    var launchItems = self._model.getItemsFromDataCollection(launchResult);
                    rowData.assignedResourcesRecId(launchItems[0].assignedResourcesRecId);
                    rowData.assignedResourcesStr(launchItems[0].assignedResourcesStr);
                    rowData.assignedResourcesOriginalRecId(launchItems[0].assignedResourcesOriginalRecId);
                    rowData.remainingHours(launchItems[0].remainingHours);
                    rowData.schedulingStatus(launchItems[0].schedulingStatus);
                    rowData.assignedHours(rowData.effort() - rowData.remainingHours());
                    self.updateRow(rowData);

                    $dyn.async(function () {
                        self.retrieveProjectTeamResources();
                    });
                });           
        },

        resourceAssignmentDetails: function (rowData) {
            var self = this;
            self._model.resourceAssignmentDetails(rowData);
        },

        updateResourceAssignment: function (rowData, assignedResourcesRecId) {
            var self = this;
            self._model.updateResourceAssignment(rowData, assignedResourcesRecId,
                function (resourceAssignmentResult) {
                    var resourceAssignmentItems = self._model.getItemsFromDataCollection(resourceAssignmentResult);
                    rowData.assignedResourcesRecId(resourceAssignmentItems[0].assignedResourcesRecId);
                    rowData.assignedResourcesStr(resourceAssignmentItems[0].assignedResourcesStr);
                    rowData.assignedResourcesOriginalRecId(resourceAssignmentItems[0].assignedResourcesOriginalRecId);
                    rowData.remainingHours(resourceAssignmentItems[0].remainingHours);
                    rowData.schedulingStatus(resourceAssignmentItems[0].schedulingStatus);
                    rowData.assignedHours(resourceAssignmentItems[0].assignedHours);
                    rowData.hasDraftAssignment(resourceAssignmentItems[0].hasDraftAssignment);
                    rowData.totalAssignedActivityResources(resourceAssignmentItems[0].totalAssignedActivityResources);
                    rowData.totalAssignedPlannedResources(resourceAssignmentItems[0].totalAssignedPlannedResources);
                    self.updateRow(rowData);
                    
                    $dyn.async(function () {
                        self.retrieveProjectTeamResources();
                    });
                });
        },

        autoAssignResource: function (rowData) {
            var self = this;
            self._model.autoAssignResource(rowData, 
                function (assignResult) {
                    var assignItems = self._model.getItemsFromDataCollection(assignResult);
                    if (!assignItems[0].succeed) {
                        $dyn.errorMessageBox({ Text: assignItems[0].message, Label: 'HierarchicalGridCommon_ErrorAssigningResource', showCloseButton: true });
                    }
                    else {
                        rowData.assignedResourcesRecId(assignItems[0].assignedResourcesRecId);
                        rowData.assignedResourcesStr(assignItems[0].assignedResourcesStr);
                        rowData.assignedResourcesOriginalRecId(assignItems[0].assignedResourcesOriginalRecId);
                        rowData.remainingHours(assignItems[0].remainingHours);
                        rowData.schedulingStatus(assignItems[0].schedulingStatus);
                        rowData.assignedHours(rowData.effort() - rowData.remainingHours());
                        self.updateRow(rowData);

                        $dyn.async(function () {
                            self.retrieveProjectTeamResources();
                        });
                    }
                });
        },

        removeDraftActivityResources: function (rowData) {
            var self = this;
            self._model.removeDraftActivityResources(rowData);
        },

        proposeGenericResource: function () {
            var self = this;
            self._model.proposeGenericResource(function (proposeResult) {
                var proposeItems = self._model.getItemsFromDataCollection(proposeResult);
                if (proposeItems[0].succeed) {
                    $dyn.showMessageBox({
                        showYesButton: true, showNoButton: true,
                        Text: proposeItems[0].message,
                        callback: function (btn) {
                            if (btn === $dyn.controls.MessageBox.Button.Yes) {
                                self.configureGenericResource(function (configureResult) {
                                    var configureItems = self._model.getItemsFromDataCollection(configureResult);
                                    if (!configureItems[0].succeed) {
                                        $dyn.errorMessageBox({ Text: configureItems[0].message, Label: 'HierarchicalGridCommon_ErrorConfiguringGenericResource', showCloseButton: true });
                                    }
                                    else {
                                        $dyn.async(function () {
                                            self.retrieveProjectTeamResources()
                                        });
                                    }
                                }
                            )
                            }
                        }
                    });
                }
                else {
                    $dyn.errorMessageBox({ Text: proposeItems[0].message, Label: 'HierarchicalGridCommon_ErrorProposingGenericResource', showCloseButton: true });
                }
            });
        },

        configureGenericResource: function (callBack) {
            var self = this;
            self._model.retrieveRows();
            return self._model.configureGenericResource(callBack);
        },

        get resourceCategories() {
            var self = this;
            return self._model.resourceCategories;
        },

        retrieveResourceCategories: function (callback) {
            var self = this;
            return self._model.retrieveResourceCategories(callback);
        },

        get resourceCategoryStrToRecIdMap() {
            var self = this;
            return self._model.resourceCategoryStrToRecIdMap;
        },

        get categoryTypes() {
            var self = this;
            return self._model.categoryTypes;
        },

        get projectTeamResources() {
            var self = this;
            return self._model.projectTeamResources;
        },

        retrieveProjectTeamResources: function () {
            var self = this;
            return self._model.retrieveProjectTeamResources();
        },

        getCategoryTypes: function () {
            var self = this;
            return self._model.getCategoryTypes();
        },

        getDefaultProjCategory: function () {
            var self = this;
            return self._model.getDefaultProjCategory();
        },

        diffDates: function (startDate, endDate) {
            var startDateNoTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            var endDateNoTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            var diffInMilliSecs = endDateNoTime.getTime() - startDateNoTime.getTime();
            return diffInMilliSecs / projectManagement.dayInMilliSecs;
        },

        checkSchedulingErrors: function (rowData, showUiErrors) {
            var self = this;
            var oldSkipCellValueChanged = self.skipCellValueChanged;
            self.skipCellValueChanged = true;

            if (rowData.__Children != undefined) {
                var len = rowData.__Children.length;
                if (self.isLeaf(rowData) && !self.isTopLevelNode(rowData)) {
                    if (self.checkForSchedulingErrors(rowData, showUiErrors)) {
                        rowData.schedulingErrors(true);
                    }
                    else {
                        rowData.schedulingErrors(false);
                    }
                    self.skipCellValueChanged = oldSkipCellValueChanged;
                    return;
                }

                for (var i = 0; i < len; i++) {
                    self.checkSchedulingErrors(rowData.__Children[i], showUiErrors);
                }
            }

            self.skipCellValueChanged = oldSkipCellValueChanged;
        },

        //This method checks for scheduling errors for a given row.
        //<returns> true if scheduling errors; false if none are found </returns>
        checkForSchedulingErrors: function (rowData, showUiErrors) {
            var self = this;
            var errorsFound = false;
            var column = [];
            var wasUpdatingValues = self._view.isUpdatingValues();
            self._view.setUpdatingValues(true);

            if (!self._view.isTemplate) {
                // 1. Duration * No of hours in a workday * # of resources != Effort
                var maxExpectedEffort = rowData.duration() * self.projCalendar.standardWorkdayHours * rowData.numResources();
                var minExpectedEffort = ((rowData.duration() - 1) * self.projCalendar.standardWorkdayHours * rowData.numResources());
                var expectedDurationBasedOnDates = self.projCalendar.calcDuration(self.parseISOString(rowData.startDate()), self.parseISOString(rowData.endDate()), self._view.parseNumber(rowData.effort()));
                var expectedDurationBasedOnEffort = self.projCalendar.calcDurationForEffortAndResource(self._view.parseNumber(rowData.effort()), rowData.numResources());

                if (minExpectedEffort > 0) { //This allows a task to have 0 effort with 1 day duration.
                    minExpectedEffort++; //The minimum duration should be 1 hour more than the maximum for a task with duration 1 day less.
                }

                if (rowData.duration() != expectedDurationBasedOnDates && rowData.duration() != expectedDurationBasedOnEffort) {
                    errorsFound = true;
                    rowData.schedulingErrorType(schedulingErrorTypes.InvalidDuration);
                    //$dyn.log(rowData.name() + " has Schedule Error. Duration is not correct");
                    column.push("duration");
                }
                else if (maxExpectedEffort < rowData.effort() || minExpectedEffort > rowData.effort()) {
                    errorsFound = true;
                    rowData.schedulingErrorType(schedulingErrorTypes.InvalidEffort);
                    $dyn.log(rowData.name() + " has Schedule Error. Effort is not correct");
                    column.push("effort");
                }

                //This block only matters if a row has predecessors
                if (rowData.predecessors().length > 0) {
                    // 2. Task is starting before its Predecessors can finish. Fix the start date to align with end dates of predecessors
                    var expectedStartDate = self._view._findStartDateBasedOnPredecessors(rowData.predecessors());
                    if (rowData.startDate() < expectedStartDate) {
                        errorsFound = true;
                        rowData.schedulingErrorType(schedulingErrorTypes.InvalidStartDate);
                        $dyn.log(rowData.name() + " has Schedule Error. Start date starts before Predecessors end");
                        column.push("startDate");
                    }

                    // 3. Task has time from is predecessors. Fix the task dates to remove the lag
                    if (rowData.startDate() > expectedStartDate) {
                        errorsFound = true;
                        rowData.schedulingErrorType(schedulingErrorTypes.LagTime);
                        $dyn.log(rowData.name() + " has Schedule Error. Lag between start date and predecessors");
                        column.push("startDate");
                    }
                }
            }
            if (showUiErrors) {
                self._view.setColumnsStatus(column, $dyn.ui.StatusIndicator.warning);
            }
            self._view.setUpdatingValues(wasUpdatingValues);
            return errorsFound;
        },
        
        updateRoot: function() {
            var self = this;
            if (self._model.shouldPersistRoot === true) {
                self._view.refreshSummaries(undefined, true);
                self.updateRow(self.treeRoot)
                self._model.shouldPersistRoot = false;
            }
        },
        
        computeTopologicalIds: true,
        
        isTaskDeletedFromPublished: function(rowData) {
            var self = this;
            
            return  ( rowData.differenceType() == "3" ||
                      rowData.differenceType() == "4" );
        },
        
        summarize: function (rowData) {
            var self = this;
            var children = rowData.__Children;
            var firstChildIndex;
            var showDiff = self._model.getSessionContext().showDifference;
            
            //initialize the successor and predecessor list
            if (rowData.successorList() === undefined) {
                rowData.successorList([]);
            }
            if (rowData.predecessorList() === undefined) {
                rowData.predecessorList([]);
            }

            if (children) {
                //initialize the variables that will store the roll-ups for parent task        
                var totalEffort = 0;
                var totalAssignedHours = 0;
                var minStartDate = new Date();
                var maxEndDate = new Date();
                var childrenCount = children.length;
                var i;
                //find the 1st legitimate non-deleted child
                if (childrenCount > 0) {
                    for (i =0; i< childrenCount; i++) {
                        firstChildIndex = i;
                        if (showDiff && self.isTaskDeletedFromPublished(children[i])) {
                            continue;
                        }
                        if (!self._view.isTemplate) {
                            minStartDate = self.parseISOString(children[i].startDate());
                            maxEndDate = self.parseISOString(children[i].endDate());
                        }
                        break;
                    }
                }

                // All children are deleted.
                if (i >= childrenCount) {
                    return;
                }

                // Clear the category only if non-deleted children exist.
                rowData.category('');

                // Compute the roll-ups.
                for (i = firstChildIndex; i < childrenCount; i++) {
                    var childItem = children[i];
                    if (showDiff && self.isTaskDeletedFromPublished(childItem)) {
                        continue;
                    }
                    totalEffort += Number(childItem.effort());
                    totalAssignedHours += Number(childItem.assignedHours());
                    //}
                    if (!self._view.isTemplate) {
                        var childStartDate = self.parseISOString(children[i].startDate());
                        var childEndDate = self.parseISOString(children[i].endDate());
                        if (childStartDate && (!minStartDate || childStartDate < minStartDate)) {
                            minStartDate = childStartDate;
                        }
                        if (childEndDate && (!maxEndDate || childEndDate > maxEndDate)) {
                            maxEndDate = childEndDate;
                        }
                    }
                }

                //assign computed roll-ups to parent                
                if (!self._view.isTemplate) {
                    if (minStartDate && maxEndDate) {
                        if (self.projCalendar && self.projCalendar.isCalendarLoaded) {
                            rowData.duration(self.projCalendar.calcDuration(minStartDate, maxEndDate, totalEffort));
                        } else {
                            rowData.duration(self.diffDates(minStartDate, maxEndDate) + 1);
                        }
                        minStartDate = self.dateToIsoString(minStartDate);
                        maxEndDate = self.dateToIsoString(maxEndDate);
                        rowData.startDate(minStartDate);
                        rowData.endDate(maxEndDate);

                    } else {
                        rowData.duration(0);
                    }
                }

                rowData.effort(totalEffort);
                rowData.assignedHours(totalAssignedHours);
                self.computeResourceScedulingData(rowData);
                if (rowData.successorList().length > 0 && !self._view.isTemplate) {
                    self.isSummarizing = false;
                    self._view.notifySuccessorsOfDateChange(rowData);
                    self.issummarizing = true;
                }
            }
        },

        computeResourceScedulingData: function (rowData) {
            var self = this;
            var assignedHoursValue = Number(rowData.assignedHours());
            var effortValue = Number(rowData.effort());
            var remainingEffortValue = effortValue - assignedHoursValue;
            var children = rowData.__Children;
            if (!publishState && children && !children.length) {
                if (rowData.hasDraftAssignment() || (effortValue < rowData.effort._last)) {
                    var totalAssignedActivityResourcesValue = Number(rowData.totalAssignedActivityResources());
                    var totalAssignedPlannedResourcesValue = Number(rowData.totalAssignedPlannedResources());
                    if (totalAssignedActivityResourcesValue > 0) {
                      remainingEffortValue = effortValue / totalAssignedActivityResourcesValue * totalAssignedPlannedResourcesValue;
                    } else {
                        remainingEffortValue = effortValue;
                    }
                }
                assignedHoursValue = effortValue - remainingEffortValue;
                rowData.assignedHours(effortValue - remainingEffortValue);
                //If effort is reduced to 0, then remove assigned resources.
                var varEffort = rowData.effort();
                if ((effortValue === 0) && (effortValue < rowData.effort._last)) {
                    self._view.removeActivityResourcesInDraft = true;
                    rowData.assignedResourcesStr('');
                    rowData.assignedResourcesRecId('');
                    rowData.assignedResourcesOriginalRecId('');
                    rowData.hasDraftAssignment(false);
                }
            }
            if (rowData.assignedHours() > 0 && remainingEffortValue < 0.1) {
                rowData.remainingHours(0);
                rowData.schedulingStatus($dyn.label('HierarchicalGridCommon_SchedulingStatusFullyStaffed'));
            } else if (rowData.assignedHours() > 0 && remainingEffortValue >= 0.1) {
                rowData.remainingHours(remainingEffortValue);
                rowData.schedulingStatus($dyn.label('HierarchicalGridCommon_SchedulingStatusPartiallyStaffed'));
            } else {
                rowData.remainingHours(effortValue);
                rowData.schedulingStatus($dyn.label('HierarchicalGridCommon_SchedulingStatusNotStaffed'));
            }
        },
        
        processLeaf: function (row) {
            var self = this;
            var projCalendar = self.projCalendar;

            if (row.successorList() === undefined) {
                row.successorList([]);
            }
           
            if (row.resourceCategoryRecId) {
                var resourceCategoryStrToRecIdMap = self._model.resourceCategoryStrToRecIdMap;
                if (!jQuery.isEmptyObject(resourceCategoryStrToRecIdMap)) {
                    for (var resourceCategory in resourceCategoryStrToRecIdMap) {
                        if (resourceCategoryStrToRecIdMap[resourceCategory] === row.resourceCategoryRecId) {
                            row.resourceCategoryStr(resourceCategory);
                            row.resourceCategoryStr._last = resourceCategory;
                            break;
                        }
                    }
                } else {
                    self.resourceCategoryStrGenerationMissed = true;
                }
            }

            self.computeResourceScedulingData(row);
            self.computeDifference(row);
        },

        computeDifference: function (row) {
            var self = this;
            if (self._model.getSessionContext().showDifference) {
                var value = row.differenceType();
                if (value == 1) {
                    row.differenceDisplay("+"); //Added
                } else if (value == 3 || value == 4) {
                    row.differenceDisplay("-"); //Deleted
                }             
            }
        },

        recalcTopologicalIdsForSubTree: function (subRoot) {
            var self = this;
            var computeTopologicalIds = self.computeTopologicalIds;

            var postTraverse = function (node, topologicalId, nodesWithSucessors) {
                if (node) {
                    var children = node.__Children;
                    if (computeTopologicalIds) {
                        node.topologicalId(topologicalId);
                    }
                    if (children && children.length > 0) {
                        var childrenCount = children.length;
                        if (computeTopologicalIds && topologicalId) {
                            topologicalId += self.topologicalIDSeparator;
                        }
                        for (var i = 0; i < childrenCount; i++) {
                            postTraverse(children[i], topologicalId + (i + 1), nodesWithSucessors);
                        }
                    }
                    if (node.successorList().length > 0) {
                        nodesWithSucessors.push(node);
                    }  
                }
            }
            var nodesWithSucessors = [];
            if (subRoot && subRoot.__Level() > 0) {
                postTraverse(subRoot, subRoot.topologicalId(), nodesWithSucessors);
                var nodesWithSucessorsCount = nodesWithSucessors.length;
                for (var i = 0; i < nodesWithSucessorsCount; i++) {
                    var row = nodesWithSucessors[i];
                    self.updateSucessors(row);
                }
            }
            
        },

    });

    hierarchicalGrid.SchedulePlanningModel = function (data, modelId) {
        hierarchicalGrid.Model.apply(this, arguments);
        self._taskMap = [];
        self._tasksWithPredecessors = [];
    };

    hierarchicalGrid.SchedulePlanningModel.prototype = $dyn.extendPrototype(hierarchicalGrid.Model.prototype, {

        autogenerateID: true,
        autoSave: true,
        autoSync: true,
        
        launchAvailabilityView: function (rowData, callback) {
            var self = this;
            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("launchAvailabilityView",
                        [rowData.id()],
                        callback);
                });
            };
            self.save(saveCallback);
        },
        
        resourceAssignmentDetails: function (rowData) {
            var self = this;
            var saveCallback = function () {
                $dyn.async(function () {    
                    self._callService("resourceAssignmentDetails",
                        [rowData.id()]);
                });
            };
            self.save(saveCallback);
        },

        updateResourceAssignment: function (rowData, assignedResourcesRecId, callback) {
            var self = this;
            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("updateResourceAssignment",
                        [rowData.id(),
                        assignedResourcesRecId,
                        rowData.assignedResourcesOriginalRecId(),
                        rowData.effort()],
                        callback);
                });
            };
            self.save(saveCallback);
        },

        autoAssignResource: function (rowData, callback) {
            var self = this;
            
            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("autoAssignResource", [rowData.id()], callback);
                });
            };
            self.save(saveCallback);
        },
       
        removeDraftActivityResources: function (rowData) {
            var self = this;

            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("removeDraftActivityResources",
                        [rowData.id(),
                        rowData.deleteTask()]);
                });
            };
            self.save(saveCallback);
        },

        proposeGenericResource: function (callback) {
            var self = this;

            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("proposeGenericResource", [], callback);
                });
            };
            self.save(saveCallback);
        },

        configureGenericResource: function (callback) {
            var self = this;
            self._callService("configureGenericResource", [], callback);
        },

        get resourceCategories() {
            var self = this;
            return self._resourceCategories || [];
        },

        get categoryTypes() {
            var self = this;
            return self._categoryTypes || [];
        },

        get taskMap() {
            var self = this;
            return self._taskMap || [];
        },

        set taskMap(map){
            var self = this;
            self._taskMap = map;
        },

        get tasksWithPredecessors() {
            var self = this;
            return self._tasksWithPredecessors || [];
        },

        set tasksWithPredecessors(map) {
            var self = this;
            self._tasksWithPredecessors = map;
        },

        retrieveResourceCategories: function (callback) {
            var self = this;
            self._callService("getResourceCategories", [],
                function (resourceCategoriesDataCollection) {
                    self._resourceCategories = self.getItemsFromDataCollection(resourceCategoriesDataCollection);
                    self._resourceCategoryStrToRecIdMap = self.computeResourceCategoryStrToRecIdMap(self._resourceCategories);
                    if (callback) {
                        callback();
                    }
                }
            );
        },

        computeResourceCategoryStrToRecIdMap: function (resourceCategories) {
            var self = this;
            var resourceCategoryStrToRecIdMap = {};
            for (var i = 0; i < resourceCategories.length; i++) {
                resourceCategoryStrToRecIdMap[resourceCategories[i].id] = resourceCategories[i].recId;
            }
            return resourceCategoryStrToRecIdMap;
        },

        get resourceCategoryStrToRecIdMap() {
            var self = this;
            return self._resourceCategoryStrToRecIdMap || {};
        },

        openAttachmentsForm: function (rowData, callBack) {
            var self = this;
            var args = [rowData.id()];
            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("openAttachmentsForm",
                                            args,
                                            callBack
                                            );
                });
            };

            self.save(saveCallback);
        },

        openDetailsForm: function (rowData, callBack) {
            var self = this;
            var args = [rowData.id()];
            var saveCallback = function () {
                $dyn.async(function () {
                    self._callService("openDetailsForm",
                                            args,
                                            callBack
                                            );
                });
            };

            self.save(saveCallback);
        },

        getCategoryTypes: function () {
            var self = this;
            self._callService("getCategoryTypes", [],
                                function (categoryTypesDataCollection) {
                                    self._categoryTypes = self.getItemsFromDataCollection(categoryTypesDataCollection);
                                }
                              );
        },

        getDefaultProjCategory: function () {
            var self = this;
            self._callService("defaultProjCategory", [],
                                function (categoryTypesDataCollection) {
                                    self._defaultCategory = self.getItemsFromDataCollection(categoryTypesDataCollection);
                                }
                              );
        },

        getStandardWorkingDayHours: function () {
            var self = this;
            self._callService("getStandardWorkingDayHours", [],
                function (workingDayHoursDataCollection) {
                    self._standardWorkingDayHours = self.getItemsFromDataCollection(workingDayHoursDataCollection);
                }
            );
        },

        get projectTeamResources() {
            var self = this;
            return self._projectTeamResources || [];
        },

        retrieveProjectTeamResources: function () {
            var self = this;
            self._callService("getProjectTeamResources", [],
                function (projectTeamResourcesDataCollection) {
                    self._projectTeamResources = self.getItemsFromDataCollection(projectTeamResourcesDataCollection);
                }
            );
        },
          
        get calendarDetails() {
            var self = this;
            return self._calendarDetails || [];
        },

        getCalendarDetails: function (startDate, endDate, callback) {
            var self = this;
            var getFormattedDate = hierarchicalGrid.ProjectCalendar.getFormattedDate;
            var formattedStartDate = getFormattedDate(startDate);
            var formattedEndDate = getFormattedDate(endDate);

            $dyn.async(function () {
                self.data.GetData()({
                    _action: JSON.stringify(
                        {
                            name: "getCalendarDetails",
                            args: [formattedStartDate, formattedEndDate]
                        }),
                    _interactionContext: JSON.stringify({ modeId: self._modeId })
                },
                    function (calendarDetailsDataCollection) {
                        self._calendarDetails = self.getItemsFromDataCollection(calendarDetailsDataCollection);
                        if (callback) {
                            callback();
                        }
                    }
                );
            });
        },

        exportImportWBSTemplate: function (exportTemplate, elemNumber, updateRoot) {
            var self = this;

            var exportCallback = function () {
                self.retrieveRows(updateRoot);
                self.isDirty = true;
                justImported = true;
            };

            var saveCallback = function () {
                $dyn.async(
                    function () {
                        self._callService("exportImportWBSTemplate", [exportTemplate, elemNumber],
                        exportCallback)
                    });
            };

            self.save(saveCallback);
        },

        restoreTask: function (elemNumbers) {
            var self = this;

            var restoreCallback = function () {
                self.retrieveRows(false);
                self.isDirty = true;
            };

            var saveCallback = function () {
                $dyn.async(
                    function () {
                        self._callService("restoreTask", elemNumbers,
                        restoreCallback)
                    });
            };

            self.save(saveCallback);
        },

        _dateInSecsSinceEpoch: function (date) {
            var dateInMilliSecsSinceEpoch = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
            return dateInMilliSecsSinceEpoch / 1000;
        },

        //Searches the Tree to find the row given the topological ID
        findByTopologicalId: function (topologicalId) {
            var self = this;
            var strippedId = topologicalId.trim();
            var idArray = strippedId.split(".");
            var curChild = self.taskMap[1];

            var findNthChild = function (parent, n) {
                if (isNaN(n)) { //check for invalid id
                    return undefined;
                }
                return parent.__Children[n - 1];
            }

            for (var i = 0; i < idArray.length; i++) {
                if (curChild === undefined) { //check for invalid ID
                    break;
                }
                curChild = findNthChild(curChild, idArray[i]);
            }
            return curChild;
        },

        //calculates the topological ID for a given row
        getTopologicalId: function (rowData) {
            var self = this;
            var parent = rowData.__Parent;
            var count = 0;
            var separator = ".";
            if (parent.__Level() > 0) {
                for (var i = 0; i < parent.__Children.length; i++) {
                    count++;
                    if (rowData.id() == parent.__Children[i].id()) {
                        break;
                    }
                }
                if (parent.__Level() === 1) {
                    return count + "";
                }
                else {
                    return parent.topologicalId() + "." + count;
                }
            }
            return "";

        },

        getSiblingNumberFromTopologicalId: function(topologicalId) {
            var self = this;
            var idArray = topologicalId.split(".");
            var length = idArray.length;
            return idArray[(length - 1)];
        },

        //returns an array of the WBS ID predecessor list for a row.
        getPredecessors: function (rowData) {
            var self = this;
            if (rowData.predecessorList === undefined) {
                return [];
            }
            //Get the list of predecessors
            if (!$.isArray(rowData.predecessorList)) {
                return rowData.predecessorList.replace(/\s/g, '').split(",").slice(0);
            }
            else if (rowData.predecessorList) {
                return rowData.predecessorList.slice(0);
            }
            return [];
        },

        updateRow: function (rowData) {
            var self = this;
            var predecessors = [];
            var startDate = rowData.startDate;
            var endDate = rowData.endDate;

            startDate = self._dateInSecsSinceEpoch(startDate);
            endDate = self._dateInSecsSinceEpoch(endDate);
            predecessors = self.getPredecessors(rowData);

            var siblingNumber = self.getSiblingNumberFromTopologicalId(rowData.topologicalId.trim());
                       
            //Convert the WBS Id's back into task numbers for the server to process.
            for (var i = 0; i < predecessors.length; i++) {
                var predRow = self.findByTopologicalId(predecessors[i]);
                if (predRow !== undefined) {
                    predecessors[i] = predRow.id();
                }
            }

            self._batchServiceCall("updateTask",
                    [rowData.id,
                     rowData.name,
                     rowData.effort,
                     startDate,
                     endDate,
                     rowData.duration,
                     rowData.numResources,
                     rowData.resourceCategoryRecId || rowData.resourceCategoryStr,
                     rowData.category,
                     siblingNumber,
                     predecessors]
            );
        },
        
        indentRow: function (row, aboveSiblingRow) {
            var self = this;
            var clearParent = false;
            
            if (aboveSiblingRow.__Children.length === 1) {
                clearParent = true;
            }
            
            self._undoManager.registerAction(
                hierarchicalGrid.actionTypes.Indent,
                row.id,
                self._batchServiceCall("indent", [row.id, aboveSiblingRow.id, clearParent])
            );
        },        
        

        addRow: function (rowData) {
            var self = this;
            var startDate = rowData.startDate;
            var endDate = rowData.endDate;
            var predecessors;
            var clearRoot = "0";

            startDate = self._dateInSecsSinceEpoch(startDate);
            endDate = self._dateInSecsSinceEpoch(endDate);
            predecessors = self.getPredecessors(rowData);

            var siblingNumber = self.getSiblingNumberFromTopologicalId(rowData.topologicalId.trim());

            //Convert the WBS Id's back into task numbers for the server to process.
            for (var i = 0; i < predecessors.length; i++) {
                var predRow = self.findByTopologicalId(predecessors[i]);
                if (predRow !== undefined) {
                    predecessors[i] = predRow.id();
                }
            }

            //Check if we need to clear the root of its estimate lines on the server side.
            if (rowData.__Parent.__Level() === 1 && rowData.__Parent.__Children.length === 1) {
                clearRoot = "1";
            }

            self._undoManager.registerAction(
                hierarchicalGrid.actionTypes.Create,
                rowData.id,
                self._batchServiceCall("addTask", 
                       [rowData.id,
                        rowData.__Parent.id(), //rowData.parentId is set to 0 for a new WBS.
                        rowData.name,
                        rowData.effort || "0",
                        startDate,
                        endDate,
                        rowData.duration,
                        rowData.numResources,
                        rowData.resourceCategoryRecId || rowData.resourceCategoryStr,
                        rowData.category,
                        siblingNumber,
                        clearRoot,
                        predecessors]
                 )
            );
        },

        deleteRow: function (rowId) {
            var self = this;
            //Remove this task from the task Map
            self._taskMap[rowId] = undefined;
            self._undoManager.registerAction(
                hierarchicalGrid.actionTypes.Delete,
                rowId,
                self._batchServiceCall("deleteTasks", [rowId])
            );
        },
    });

    hierarchicalGrid.SchedulePlanningMode = function (data, controlElement, output, onReady) {
        var self = this;
        hierarchicalGrid.Mode.apply(self, arguments);

        if (data.SessionContext && data.SessionContext() && data.SessionContext()[0].hideDetailColumns === true) {
            $(self).on("postModeFirstLoad", function (event) { self.hierarchicalGridView.showExtraColumns(false) });
        }
    };

    hierarchicalGrid.SchedulePlanningMode.prototype = $dyn.extendPrototype(hierarchicalGrid.Mode.prototype, {
        id: "SchedulePlanning",

        title: $dyn.label("HierarchicalGridCommon_WBSSchedulePlanningTitle"),

        load: function () {
            var self = this;
            self.hierarchicalGridView = new hierarchicalGrid.SchedulePlanningHGridView(self._model, self.refresh.bind(self), self._controlElement, self.id);
            self.hierarchicalGridView.init();
        },

        createModel: function (data, modelId) {
            return new hierarchicalGrid.SchedulePlanningModel(data, modelId);
        }
    });

    hierarchicalGrid.ProjectCalendar = function (startDate, endDate, standardWorkdayHours, calendar, viewModel) {
        var self = this;
        self.startDate = startDate;
        self.endDate = endDate;
        self.lastDateInMap = null;
        self.firstDateInMap = null;
        self.standardWorkdayHours = standardWorkdayHours;
        self.map = {};
        self.createDateMap(calendar);
        self.calendarLoaded = true;
        self.viewModel = viewModel;
    };

    hierarchicalGrid.ProjectCalendar.getFormattedDate = function (date) {
        var formattedDate = " ";

        if (date) {
            formattedDate = (date.getMonth() + 1) + "/" +
                            date.getDate() + "/" +
                            date.getFullYear();
        }

        return formattedDate;
    },

    hierarchicalGrid.ProjectCalendar.getDateFromFormattedDate = function (value) {
        var res = value.split("/", 3);
        var date = new Date();
        
        if (res.length < 3) {
            return null;
        }

        //new Date(year, month, day, hours, minutes, seconds, milliseconds);
        return new Date(res[2] , res[1], res[0], 0, 0, 0,0);
    },

    
    hierarchicalGrid.ProjectCalendar.prototype = {

        get isCalendarLoaded() {
            var self = this;
            return self.calendarLoaded;
        },

        setCalendarArray: function (calendar) {
            var self = this;
            self.calendar = calendar;
        },

        //TODO in all places where we call this function re-work how effort is being parsed and passed to possibly just pass in effort as it is
        // and then a funtion pointer to a parse function that calcDurationForEffortAndResource can use.
        calcDurationForEffortAndResource: function (effort, numOfResources) {
            var self = this;
            if (effort === 0) {
                return 0;
            } else if (effort && numOfResources) {
                return Math.ceil(effort / (numOfResources * self.standardWorkdayHours));
            }
            return 0;
        },

        createDateMap: function (calendar) {
            var self = this;
            var map = self.map;
            var item;
            var getDate = hierarchicalGrid.ProjectCalendar.getDateFromFormattedDate;
            
            
            if (calendar && calendar.length) {
                var itemsCount = calendar.length;
                item = calendar[0];

                
                if (!self.firstDateInMap || getDate(item.projDate) < getDate(self.firstDateInMap)) {
                    self.firstDateInMap = item.projDate;
                }
                
                for (var i = 0; i < itemsCount; i++) {    
                    item = calendar[i];
                    self.map[item.projDate] = item.isWorkingDay;
                }
                
                if (!self.lastDateInMap || getDate(item.projDate) > getDate(self.lastDateInMap)) {
                    self.lastDateInMap = item.projDate;
                    //trim the map to remove the non-working days
                    itemsCount--;
                    while(!map[self.lastDateInMap] && itemsCount >= 0) {
                        delete map[self.lastDateInMap];
                        self.lastDateInMap = calendar[itemsCount].projDate;
                        itemsCount--;
                    }
                }
            }
        },

        // effort parameter is deprecated because it is not required for this calculation. It is required for this call but its value is not used.
        calcDuration: function (startDate, endDate, effort) {
            var self = this;
            var getFormattedDate = hierarchicalGrid.ProjectCalendar.getFormattedDate;
            var map = self.map;
            var tempDate;

            if (!(startDate && endDate)) {
                return 0;
            }

            var numOfDays = 0;
            tempDate = new Date(startDate.getTime());

            while (tempDate <= endDate) {
                if (map[getFormattedDate(tempDate)]) {
                    numOfDays++;
                }
                tempDate.setDate(tempDate.getDate() + 1);
            }
            if (numOfDays === 0) {
                numOfDays++;
            }
            return numOfDays;
        },

        findEndDateForStartDateAndDuration: function (startDate, duration, rowData, callback) {
            var self = this;
            var getFormattedDate = hierarchicalGrid.ProjectCalendar.getFormattedDate;
            var localDuration = duration;
            var projectCalendarUpdateCallback = function () {
                self.findEndDateForStartDateAndDuration(startDate, duration, rowData, callback);
            };

            if (isNaN(startDate)) {
                startDate = new Date();
            }

            if (!localDuration) {
                localDuration = 1;
            }

            var tempDate = new Date(startDate.getTime());

            localDuration -= 1;

            while (localDuration > 0) {
                if (self.viewModel.checkDateInMap(tempDate, rowData, projectCalendarUpdateCallback)) {
                    if (self.map[getFormattedDate(tempDate)] || self.map[getFormattedDate(tempDate)] === undefined) {
                        localDuration -= 1;
                    }
                }
                else {
                    return;
                }

                tempDate.setDate(tempDate.getDate() + 1);
            }

            var workingDayFound = false;

            while (!workingDayFound) {
                if (self.viewModel.checkDateInMap(tempDate, rowData, projectCalendarUpdateCallback)) {
                    if ((!self.map[getFormattedDate(tempDate)] && self.map[getFormattedDate(tempDate)] != undefined)) {
                        tempDate.setDate(tempDate.getDate() + 1);
                    }
                    else {
                        workingDayFound = true;
                    }
                }
                else {
                    // Date was not in the map.
                    return;
                }
            }

            callback(tempDate);
        },

        findNextWorkDay: function (nextWorkingDate) {
            var self = this;
            var getFormattedDate = hierarchicalGrid.ProjectCalendar.getFormattedDate;

            nextWorkingDate = new Date(nextWorkingDate.getTime());
            if (!nextWorkingDate) {
                nextWorkingDate = new Date();
            }

            while (!self.map[getFormattedDate(nextWorkingDate)] && self.map[getFormattedDate(nextWorkingDate)] != undefined) {
                nextWorkingDate.setDate(nextWorkingDate.getDate() + 1);
            }

            return nextWorkingDate;
        },

        findStartDateForEndDateAndDuration: function (endDate, duration) {
            var self = this;
            if (!(self.calendarId && effort && numOfResources)) {
                return null;
            }

            var tempDate = new Date(endDate.getTime());

            duration -= 1;

            while (duration > 0) {
                if (self.map[tempDate] || self.map[tempDate] === undefined) {
                    duration -= 1;
                }
                tempDate.setDate(tempDate.getDate() - 1);
            }

            while (!self.map[tempDate] && self.map[tempDate] != undefined) {
                tempDate.setDate(tempDate.getDate() - 1);
            }

            return tempDate;
        },

        //Checks if a date is in the current map.
        isDateInMap: function (date) {
            var self = this;
            var getFormattedDate = hierarchicalGrid.ProjectCalendar.getFormattedDate;

            if (self.map[getFormattedDate(date)] === undefined) {
                return false;
            }
            return true;
        },

        //isWorking Date
        isWorkingDay: function(date) {
            var self = this;
            var formattedDate = hierarchicalGrid.ProjectCalendar.getFormattedDate(date);

            if (self.map[formattedDate]) {
                return true;
            }
            
            return false;
        }

    };

    hierarchicalGrid.modeManager.addMode(hierarchicalGrid.SchedulePlanningMode, true);

})($dyn.projectManagement = $dyn.projectManagement || {}, jQuery);

//# sourceURL=WBSSchedulePlanningView.js

// SIG // Begin signature block
// SIG // MIIoQQYJKoZIhvcNAQcCoIIoMjCCKC4CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // JfeeKpSpRH+QN1K+8Bcg8chjfyL9xJybDHiT3F6MESeg
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
// SIG // DQEJBDEiBCAJnxp0LtsA0+Qw6Txn+k1S88ae7+WIwFaa
// SIG // Dx4Deie+6zBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBABeNIKLk
// SIG // pyuj9F43BN6lOtkb2e9aefFisnNXmMce2GVwAsuP5Lv5
// SIG // QOGA6ngXm79uOBnCo+S6QafeSyutzDHsFKZLQRAJ5BzD
// SIG // ZW4PBuRj0XcokLgeRvYFvEpqYyXrIoSX39RH7nxgJbw0
// SIG // V+u4ZTA9vF3EwurT5lna5laUsyk4dyn9iat2aLaPzTwd
// SIG // /fDq5XVrkccP/Rpo77H4SFvO8RRWpVEAH2mL2ourKQYG
// SIG // 1FLl1KmHUA6Wq1N9JAn6GK89xtK8eP0PawCWlrDiogpy
// SIG // IySQbhtecb1Z8tWvNLT+sbPuonPxDu1oQqmVkw6N4kjD
// SIG // X9tVJA7Bds7xtGdZ+YzG7fp4yMOhghetMIIXqQYKKwYB
// SIG // BAGCNwMDATGCF5kwgheVBgkqhkiG9w0BBwKggheGMIIX
// SIG // ggIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWgYLKoZIhvcN
// SIG // AQkQAQSgggFJBIIBRTCCAUECAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgP+3ojwTJXnnqLNmbaDVi
// SIG // KuXEocCR1HI914YC7VibDk4CBmbrWneWDBgTMjAyNDEx
// SIG // MDUyMTQzMTAuMzEyWjAEgAIB9KCB2aSB1jCB0zELMAkG
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
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEINDi4I0zejNviCDu
// SIG // P/04VC1p5YgUsvkF9QOBxLkMSLRwMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQg1Mjt7DWd27qwTQxlAleD
// SIG // XzNoB+GlrkbnSJP/SgJP2ScwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAgAL16p/GyoX
// SIG // VgABAAACADAiBCCbnsqmcd9g6l/E12zOXOrYnVibuUK6
// SIG // PZgDeiQ2VQpbMjANBgkqhkiG9w0BAQsFAASCAgBKcNPu
// SIG // KXDD1Uzmj/4HKiwEDOGqNxjRpN3rS5ICDT8S4wTOJli/
// SIG // zliJV2p/MUJ5cerR6h/eMt88SEP7kbjXTlXI8FQ3kxsX
// SIG // 1aN4gvPPZYmwUMWT38eguClQ348NR8QLL5P4IoaP4idR
// SIG // PcYIdKgNKQHNLeJXQ2wInFldZILw8zMDNG8xk039PLmU
// SIG // TpKuMiYvDuCj1tZWP246t30ANM4b1hhzRlfEuJOSBJDZ
// SIG // Pc1YahLSiDs03cA+6yEkvwXoWJMpQ1mgGlupfNjvUp7b
// SIG // rnBnrzgczEAlvfMVNPGuvwxnCh5Lc276aZZ75dhm48ym
// SIG // wCri1aaxvrPGmvWg5R9gfiACaac19h0XQryAcaA5EyBU
// SIG // Got7yx/vINTMB2lzZ3ERZYa68+0NGIdnw07jZ4cU6szF
// SIG // XoDG0hpMdJPmoNDPLgdI01GduWoSo0fuWTs+2+FM+x+f
// SIG // 7lRyWOmiNyhyjcQrSWSf0FEKYIbXWtiEnxpKFL3linX1
// SIG // LivkfUnBYemKvjSglU0BE99SCt31XUqk475XlXOX6aBk
// SIG // o4mi17Axyi8YgBQpKb5Cs8Dp3TqxqJgX3D6ruHrZZZl7
// SIG // JcJ21wTEvq4ojFDJzd5Hce0t4DNauztLY1HHyeCRfb+o
// SIG // 0jfQCEURYa2PuP7rvLReotU1U2snVHvn61YGnOLyuzAq
// SIG // 9B7d4RqWtK+kwoIxRw==
// SIG // End signature block
