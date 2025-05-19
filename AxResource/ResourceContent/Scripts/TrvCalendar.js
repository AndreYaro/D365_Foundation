/*!
// <copyright file="TrvCalendar.js" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
*/

(function () {
    'use strict';

    Globalize.addCultureInfo('en', {
        messages: {
            TrvCalendar_MondayShort: 'Mo',
            TrvCalendar_TuesdayShort: 'Tu',
            TrvCalendar_WednesdayShort: 'We',
            TrvCalendar_ThursdayShort: 'Th',
            TrvCalendar_FridayShort: 'Fr',
            TrvCalendar_SaturdayShort: 'Sa',
            TrvCalendar_SundayShort: 'Su',
            TrvCalendar_PreviousWeek: 'Previous week',
            TrvCalendar_NextWeek: 'Next week',
            TrvCalendar_Total: 'Total',
            TrvCalendar_Itemized: 'Itemized',
            TrvCalendar_Remaining: 'Remaining',
            TrvCalendar_DayTotal: 'Day total',
            TrvCalendar_OverallTotal: 'Overall total',
            TrvCalendar_ItemizedTotal: 'Itemized total',
            TrvCalendar_RemainingTotal: 'Total remaining'
        }
    });

    $dyn.controls.TrvCalendarControl = function (data, element) {
        $dyn.ui.Control.apply(this, arguments);
    };

    $dyn.controls.TrvCalendarControl.prototype = $dyn.ui.extendPrototype($dyn.ui.Control.prototype, {
        TotalAmount: '',
        ItemizedAmount: '',
        DayDetail: '',
        CurrentDay: '',
        RemainingAmount: '',
        ObservableProperties: {
            SelectedDateLong: '',
            DatesToDisplay: []
        },
        init: function (data, element) {
            var self = this;

            $dyn.ui.Control.prototype.init.apply(self, arguments);

            self.daysOfTheWeek = [$dyn.label('TrvCalendar_SundayShort'), $dyn.label('TrvCalendar_MondayShort'),
                $dyn.label('TrvCalendar_TuesdayShort'), $dyn.label('TrvCalendar_WednesdayShort'),
                $dyn.label('TrvCalendar_ThursdayShort'), $dyn.label('TrvCalendar_FridayShort'),
                $dyn.label('TrvCalendar_SaturdayShort')];

            $dyn.observe(self.CurrentDay, function (currentDay) {
                if (currentDay !== null && currentDay !== undefined && currentDay !== '') {
                    self.setSelectedDate(currentDay);
                    self.populateDisplayedDates();
                }

                window.setTimeout(function () { self.updateAriaLabelOnDayChange() }, 0);
            });
        },
        updateAriaLabelOnDayChange: function () {
            var currentDay = $dyn.value(this.SelectedDateLong);
            if (currentDay !== undefined && currentDay !== '') {
                var label = $dyn.format('{0}', this.formatDateLong(currentDay));

                label = this.addToAriaLabel(label, $dyn.label('TrvCalendar_DayTotal'), $dyn.value(this.DayDetail));
                label = this.addToAriaLabel(label, $dyn.label('TrvCalendar_OverallTotal'), $dyn.value(this.TotalAmount));
                label = this.addToAriaLabel(label, $dyn.label('TrvCalendar_ItemizedTotal'), $dyn.value(this.ItemizedAmount));
                label = this.addToAriaLabel(label, $dyn.label('TrvCalendar_RemainingTotal'), $dyn.value(this.RemainingAmount));

                this.element.setAttribute('aria-busy', true);
                this.element.setAttribute('aria-label', label);
                this.element.setAttribute('aria-busy', false);
            }
        },
        addToAriaLabel: function (currentLabel, labelForValue, value) {
            if (value !== '') {
                currentLabel = $dyn.format('{0}, {1}: {2}', currentLabel, labelForValue, value);
            }

            return currentLabel;
        },
        previousWeekClicked: function (event) {
            this.setSelectedDate(this.getDateFromSelectedDate(-7), true);
            this.populateDisplayedDates();

            this.stopEventDefaultAndPropagation(event);
        },
        nextWeekClicked: function (event) {
            this.setSelectedDate(this.getDateFromSelectedDate(7), true);
            this.populateDisplayedDates();

            this.stopEventDefaultAndPropagation(event);
        },
        calendarDateClicked: function (event, newDate) {
            this.setSelectedDate(newDate, true);

            this.stopEventDefaultAndPropagation(event);
        },
        stopEventDefaultAndPropagation: function (event) {
            event.preventDefault();
            $dyn.log.stopPropagation && $dyn.log.stopPropagation('TrvCalendar');
            event.stopPropagation();
        },
        highlightCalendarCell: function () {
            var selectedDate = this.getSelectedDate();
            var datesDisplayed = $dyn.value(this.DatesToDisplay);
            var indexToHighlight = null;

            for (var i = 0; i < datesDisplayed.length; i++) {
                if (datesDisplayed[i].getDate() === selectedDate.getDate()) {
                    indexToHighlight = i;
                    break;
                }
            }

            var displayedDateCells = $('.trvCalendarControl-calendarCell-date', this.element);

            for (var i = 0; i < displayedDateCells.length; i++) {
                if (i === indexToHighlight) {
                    displayedDateCells[i].setAttribute('aria-selected', 'true');
                } else {
                    displayedDateCells[i].removeAttribute('aria-selected');
                }
            }
        },
        populateDisplayedDates: function () {
            var selectedDate = this.getSelectedDate();
            var firstDate = new Date(selectedDate.getTime() - selectedDate.getDay() * 86400000);

            //When Standard Timezone to Daylight Timezone change happens, additional one hour will be added from day on.
            //So one hour has been added to avoid the issue in 'Start Day' calculation.
            if (selectedDate.getTimezoneOffset() != firstDate.getTimezoneOffset()) {
                firstDate = new Date(firstDate.getTime() + 1 * 3600000);
            }

            var currentDatesDisplayed = $dyn.value(this.DatesToDisplay);
            if (currentDatesDisplayed === undefined
                || currentDatesDisplayed[0] === undefined
                || firstDate.getTime() !== currentDatesDisplayed[0].getTime()) {
                var newDates = [firstDate];

                for (var i = 1; i < 7; i++) {
                    var newDate = new Date(firstDate.getTime() + i * 86400000);

                    //When Daylight Timezone to Standard Timezone change happens, additional one hour will be added from day on.
                    //So one hour has been added to avoid the issue in 'Next Day' calculation.
                    if (newDate.getTimezoneOffset() > firstDate.getTimezoneOffset()) {
                        newDate = new Date(newDate.getTime() + 1 * 3600000);
                    }
                    newDates.push(newDate);
                }
                this.DatesToDisplay(newDates);
            }
        },
        formatDateLong: function (date) {
            return $dyn.date.format(date, Globalize.culture().calendar.patterns.D);
        },
        getSelectedDate: function () {
            return this.selectedDate;
        },
        setSelectedDate: function (newDate, updateServer) {
            this.selectedDate = this.getUTCDate(newDate);
            this.SelectedDateLong(this.formatDateLong(this.getSelectedDate()));
            this.highlightCalendarCell();

            if (updateServer === true) {
                this.updateCurrentDate();
            }
        },
        updateCurrentDate: function () {
            var dateForServer = this.getUTCDate(this.getSelectedDate());

            $dyn.function(this.SetFilterDate)({
                _targetDate: this.getUTCDateForServer(dateForServer)
            });
        },
        getDateFromSelectedDate: function (daysToAdd) {
            var newDate = this.getUTCDate(this.getSelectedDate());

            newDate.setDate(newDate.getDate() + daysToAdd);

            return newDate;
        },
        getUTCDate: function (date) {
            var UTCDate = new Date(date);

            if (UTCDate && UTCDate.getHours() != 0) {
                var offset = UTCDate.getTimezoneOffset();
                var hours = UTCDate.getHours() + (offset / 60);
                var minutes = UTCDate.getMinutes() + (offset % 60);
                UTCDate.setHours(hours, minutes);
            }

            return UTCDate;
        },
        getUTCDateForServer: function (date) {

            if (date) {
                var offset = date.getTimezoneOffset();
                var hours = date.getHours() + ((-offset) / 60);
                var minutes = date.getMinutes() + ((-offset) % 60);
                date.setHours(hours, minutes);
            }

            return date;
        }
    });
})();
// SIG // Begin signature block
// SIG // MIIoNwYJKoZIhvcNAQcCoIIoKDCCKCQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // wHuik7JiDF0MVg/MDrS8kn8vyGzFBmCUZjkPf4Yq+j+g
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAhicYIYdPGeh8q
// SIG // FqjqsHla0+NYKfajI7o0VXonKDB4NzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBACgdrVZIa+1N6yPJ+hBtsPQE+7k/K9ad
// SIG // Oev1LaNol5aXAeDX2nZ6MrwIr+6KwXQZe3gV9CyEvymV
// SIG // 654oXv3mZEBTwUumAeEaFAGhk+MF12PiDb7AslNj5BK1
// SIG // Fv6//gh3yZt167ASBJDp14ZO7z9AW0rYmlGrGZZhvR0a
// SIG // s3v8KdlW+B7sYV4rRDJmoiYQLVgOnpP21ZgdWt1fup6s
// SIG // uqTisOdw61HdmGs8PUIKikTmi87OxW510sauWfz2keco
// SIG // HkyrkxtVDGsA5tbdP4eiMAbS9crbR34OV1EcosoechWW
// SIG // 5k1QV49pg6B4pnuAp5G451B4WTJZComJeMLx6nqny4q0
// SIG // RqWhgheUMIIXkAYKKwYBBAGCNwMDATGCF4Awghd8Bgkq
// SIG // hkiG9w0BBwKgghdtMIIXaQIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBUgYLKoZIhvcNAQkQAQSgggFBBIIBPTCCATkC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // n4kOtUWbCr1BaBXU0tAhQKhM0xm4zHqUs/5yw5odSr4C
// SIG // Bmcac0X++BgTMjAyNDExMDUyMTQzMTAuNTY1WjAEgAIB
// SIG // 9KCB0aSBzjCByzELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNOOkE0MDAt
// SIG // MDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNloIIR6jCCByAwggUIoAMCAQIC
// SIG // EzMAAAHs4CukgtCRUoAAAQAAAewwDQYJKoZIhvcNAQEL
// SIG // BQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcN
// SIG // MjMxMjA2MTg0NTM4WhcNMjUwMzA1MTg0NTM4WjCByzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9z
// SIG // b2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMe
// SIG // blNoaWVsZCBUU1MgRVNOOkE0MDAtMDVFMC1EOTQ3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKC
// SIG // AgEAsEf0bgk24MVFlZv1XbpdtrsHRGZtCKABbOqCK9/V
// SIG // SvyLT/NHJ/vE5rT+u4mmweA5gCifRh+nSRoRDyaWOL0y
// SIG // kUjsK0TcVSCqDz3lBd3+FchxHKP7tUFGnZcA9d9jbmQs
// SIG // W54ejItpSxu6Q77M2ajBu0tzAotm5Np77RinXgCC/h++
// SIG // 4C+K9NU0lm+67BNiW9T/zemP1tQqg4tfyG9/80all7eM
// SIG // 8b3SBnD40uGSskBBd0hGQKuFyI4sqMDx2qjW2cXX9pFj
// SIG // v2o3X01PObfd+AlwIp29KPrkPSrWijS1VXDX+UKUuH+v
// SIG // zLFzryBbgmDEXSg46Zr6MAHi/tY9u2wsQgaQ0B61pHz8
// SIG // 2af1/m7fQuxOYTz+h1UaKgWEe7tYFH+RhKvua9RwNI2o
// SIG // 59EOjr32HJBNB3Tr+ilmvrAJiRuzw702Wnu+4aJs8eiD
// SIG // 6oIFaTWbgpO/Un1ZpyrvRefFAJ1OfE6gxxMxrEJzFECr
// SIG // LUt845+klNDSxBTQnrZbmipKlg0VSxFm7t9vSBId7alz
// SIG // 138ukYf8Am8HvUgiSKKrQXsQaz8kGANl2s9XyvcrE7Md
// SIG // JAPVdScFVeOCGvXPjMLQEerKinQIEaP27P17vILmvCw3
// SIG // uilsrve+HvZhlu2TvJ2qwxawE9RFxhw7nsoEir79iu8A
// SIG // fJQIDBiY+9wkL6/o6qFsMel3cnkCAwEAAaOCAUkwggFF
// SIG // MB0GA1UdDgQWBBT0WtBHZP4r9cIWELFfFIBH+EyFhjAf
// SIG // BgNVHSMEGDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBf
// SIG // BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBU
// SIG // aW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYI
// SIG // KwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQM
// SIG // MAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAkrzEpDEq745Qz2oPAEW9Dhaw
// SIG // ELUizA6TdFGNxY7z4cBig664sZp7jH465lY0atbvCIZA
// SIG // 7xhf2332xU6/iAJw0noPEwfc3xv+Mm5J7qKZJW3ho27e
// SIG // zC8aX4aJQhEchHNtDzGSic/Ur837jtZ+ca6yzi/JtJ5r
// SIG // +ZAXL/stQFyeUHC4nJoXtiKd/w+uxHeqD6kCNN5g42Gk
// SIG // tTUIQTbbue8Dyl2dRKDU6AZPGwOvN/cNdfW/mvVk6KiL
// SIG // JHURqD+cYwyL/pnNLwR4WRpCVb3yIZuAKfM6bQu8VQJc
// SIG // tI3jr+XVBjAmIGY76E5oHeOW6gMLp3Zj5Rrq+3pXlmHn
// SIG // S0H+7Ny+fqn2mP8RIf/bqNe0pzP4B1UhgM7563hoTqwd
// SIG // i7XSqFUnuS22KYoV3LQ3u+omLS/pocVzxKc3Wt2yZYT0
// SIG // zkNyjhGQKVREQaOcpbVozwlpV8cgqZeY4/Z2NJ33dO9W
// SIG // 3pp6LvAN61Ga3YCiGrrbB+0hzojnm2RqjbvuttrybWt3
// SIG // gGLAgGsQHAfQYiT5Wu12nfaq02HU+OVZQmE7QUmOKFUb
// SIG // HnUgA7/fY7/4mCABstWwsrbmtKP0Kr/Xqyps0Ak1TF2g
// SIG // 3NuQ0y3DBia0bmtytMYr3bZ6AXsc1Sa+sl6jPgWtsISF
// SIG // UbxnK4gZCl9BSRXlu69vV1/pNHuA5xuogRykI3nOlTcw
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
// SIG // TjpBNDAwLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsO
// SIG // AwIaAxUAjhz7YFXc/RFtIjzS/wV6iaKlTH+ggYMwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkq
// SIG // hkiG9w0BAQsFAAIFAOrUwtkwIhgPMjAyNDExMDUxNjE0
// SIG // MTdaGA8yMDI0MTEwNjE2MTQxN1owdDA6BgorBgEEAYRZ
// SIG // CgQBMSwwKjAKAgUA6tTC2QIBADAHAgEAAgIy6zAHAgEA
// SIG // AgITRjAKAgUA6tYUWQIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBCwUAA4IBAQAM+63MmHVe
// SIG // dway4NNYbUROWHLxj/wCcnzJDRXzmKpxVqkhOeE2KEQL
// SIG // r2WKNC8LDYcYnv0PtpGTgFzyRtOVjM+THjWHL1YY0s/h
// SIG // ydcUdm4xOK+4QvUdvv2v+f0jMWejnyGfiS4/Pkiy7W8L
// SIG // SHKgKinoomcgX7d+17At5f45aJTVsvTjhb4ew8JvmBU/
// SIG // XZKPZD0EgGlzbvQFPxoKTSdtT46o8CRvpzDH9pfTiFSv
// SIG // bN8SFRjkZZFD6IlZ/0tekM3/ODQ988+iNLba3Aal4pTO
// SIG // flpYofVGNJ44IVFGyOfgTSQCEhiguEL/0hJxoTDJXSNE
// SIG // GP0RmuxuBUZrE2gDPyGAY98MMYIEDTCCBAkCAQEwgZMw
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAHs
// SIG // 4CukgtCRUoAAAQAAAewwDQYJYIZIAWUDBAIBBQCgggFK
// SIG // MBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkq
// SIG // hkiG9w0BCQQxIgQg5Jm5Tzn/q1lXOhR1zlR2E3C/joti
// SIG // AykDcvTmzQRpmAkwgfoGCyqGSIb3DQEJEAIvMYHqMIHn
// SIG // MIHkMIG9BCAnCeb1an03yIcdtUAQWysqP8XIkCF2qDFl
// SIG // C3owBNUKgzCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwAhMzAAAB7OArpILQkVKAAAEAAAHsMCIE
// SIG // IMDpuEek2ZJaUJ7Xma9xxQwWbtVp0IQAExULA710cISb
// SIG // MA0GCSqGSIb3DQEBCwUABIICAFSQOTH5xShKEjmwhu5g
// SIG // yvG3mtwREJA4SG/9x2/gXL8Yc6kVU8oF5U5SLVQwgOQd
// SIG // QGClY1USRmQlfwfudeaBv2WjXjeyDZKth08rAEyPfGDZ
// SIG // paCKRHzKLFYPLL4An6lTuHaAHp/4x7FtT8+XlCJ9RDQp
// SIG // 0EP1ICEx2W01RJtfuZttVq+ugQrkSRz6HMCoRlxn9jFZ
// SIG // p1CwvvxHKJHgKQS4lUoz+CyccUGJtIOA5EnqHIn7/Vzy
// SIG // 2T7U/nFig3Iq82fNlNw3ojKM2cRLs8/MH2O2wPPIRR5e
// SIG // qR7Cn/BoJ5jNWA2Qd/FAskBUfTJujlT8k0kyqGN4PAyx
// SIG // spAou3UJ1QD65vv/feLXhecSj/cpqXMiTyqKH+wlhYKz
// SIG // aGUlO5tpnBkQkvEU7VUqVq9sKrfRvdVS5Jcp8YLmFkkt
// SIG // nf+njMcroGLKSq0q/AfHyTs1gwXwyM5PGyazTrtnvMbW
// SIG // jW35jIYuClcxqj4HJBYHSt7jiV2QmBNiqjQ+E8yQaiJm
// SIG // Fp0lWP1UdQvN/tE3DgN/frf1TdyovMF+Fz37Q7U1xD87
// SIG // 1ubrZje7bPR0RR+8PvZZexzZaZ3yo5mOzHfl4hoJdouL
// SIG // I5sQu/WNq2E83d7voSE8+OQzCTlezuzAxQLBIAtulq56
// SIG // 2SRqK+tMwjGY4VCCiyZUV2x+OE3Q+zvzkjQVUd66ZrAL
// SIG // hRU5
// SIG // End signature block
