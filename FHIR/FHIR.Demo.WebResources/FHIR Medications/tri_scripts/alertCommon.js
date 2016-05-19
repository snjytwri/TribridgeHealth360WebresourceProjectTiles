var vitalEntitySetName = "tri_patientvitalsSet";
var vitalEntityName = "tri_patientvitals";
var advanceDirectiveEntitySetName = "tri_advancedirectiveSet";
var advanceDirectiveEntityName = "tri_advancedirective";

var alertEntitySetName = "tri_alertSet";
var alertEntityName = "tri_alert";

var vitalMeasurementFlag =
{
    high: 167410000,
    low: 167410001,
    medium: 167410002
}

var vitalObservation =
{
    systolic: 167410000,
    diastolic: 167410001,
    weight: 167410002,
    pulse: 167410003,
    glucose: 167410004,
    temperature: 167410005,
    a1c: 167410006
}

var householdIncome = {
    more100000: 1,
    from75000to99999: 2,
    from50000to74999: 3,
    from25000to49999: 4,
    lessthan25000: 5
}

var educationCode = {
    someHS: 1,
    HSGraduate: 167410000,
    someCollege: 167410001,
    Associates: 167410002,
    Bachelor: 167410003,
    Masters: 167410004,
    Doctoral: 167410005
}

var alertCategory = {
    Allergies: 100000000,
    MedicationChange: 167410000,
    DiagnosisChange: 167410001,
    UnplannedVisit: 167410002,
    TreatmentChange: 167410003,
}

var noShowRate = {
    Low: 167410000,
    Medium: 167410001,
    High: 167410002,
}

function setHref(link, clientUrl, entityName, id) {
    link.href = clientUrl + "/main.aspx?etn=" + entityName + "&id=%7b" + id + "%7d&pagetype=entityrecord";
    link.target = "_blank";
}

function showImage(thisImage, imageWidth, imageHeight, title) {
    showImage(thisImage, imageWidth, imageHeight, title, 0, 0);
}


function showImage(thisImage, imageWidth, imageHeight, title, leftMargin, rightMargin) {
    var newStyle = 'visibility:visible;  border:none; margin-left:' + leftMargin + 'px;  margin-right:' + rightMargin + 'px;';
    thisImage.setAttribute('style', newStyle);
    thisImage.setAttribute('width', imageWidth);
    thisImage.setAttribute('height', imageHeight);
    thisImage.setAttribute('title', title);
}

function showImage2(thisImage, title) {
    thisImage.setAttribute('style', 'visibility:visible;  border:none;');
    thisImage.setAttribute('title', title);
}

function hideImage(thisImage) {
    thisImage.setAttribute('width', 0);
    thisImage.setAttribute('height', 0);
    thisImage.setAttribute('style', 'visibility:hidden; border:none; margin-left:0; margin-right:0;');
}

// Retrieve Single record by its Id
function retrieveSingleRecordInfo(ODataURL, Id, filterFieldName, entitySetName, columns) {
    //Initialize the return value
    var recordInfo = null;
    var includedQuestion = false;

    // If Id does not exist we are done
    if (Id != null && Id != "") {
        try {
            //Construct the JSON Query
            if (filterFieldName == null || filterFieldName == "")
                var jsonQuery = ODataURL + entitySetName + "(guid'" + Id + "')";
            else {
                jsonQuery = ODataURL + entitySetName + "?$filter=(" + filterFieldName + " eq guid'" + Id + "')";
                includedQuestion = true;
            }
            // Add the Columns - Null or spaces means get them all
            if (columns != null && columns != "") {
                if (includedQuestion == false)
                    jsonQuery = jsonQuery + "?$select=" + columns;
                else
                    jsonQuery = jsonQuery + "&$select=" + columns;
            }

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: jsonQuery,
                beforeSend: function (XMLHttpRequest) {
                    //Specifying this header ensures that the results will be returned as JSON.
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                },
                success: function (data, textStatus, XmlHttpRequest) {
                    //Get the data values
                    recordInfo = data.d;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (errorThrown != null) {
                        if (errorThrown != "Not Found")
                            Xrm.Utility.alertDialog('Error in retrieve Single Record Info: ' + errorThrown);
                    } else {
                        Xrm.Utility.alertDialog('Post Retrieve Error in retrieve Single Record Info');
                    }
                },
                async: false
            });
        }
        catch (err) {
            Xrm.Utility.alertDialog("Function(retrieve Single Record Info) Error Detail: " + err.message);
            return null;
        }
    }
    return recordInfo;
}

// Retrieve Single record by its Id
function retrievePatientVitalsInfo(ODataURL, Id) {
    //Initialize the return value
    var recordInfo = null;

    // If Id does not exist we are done
    if (Id != null && Id != "") {
        try {
            //Construct the JSON Query
            var jsonQuery = ODataURL + "/" + vitalEntitySetName + "?$filter=tri_PatientID/Id  eq guid'" + Id + "'";
            jsonQuery += "&$select=tri_MeasurementFlag,tri_ObservationValue,tri_ObservationValue2,tri_ObservationValue3,tri_ObservationDateandTime,tri_ObservationIdentifier,tri_ObservationIdentifier2,tri_ObservationIdentifier3,tri_patientvitalsId";
            jsonQuery += "&$orderby=tri_ObservationDateandTime desc";

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: jsonQuery,
                beforeSend: function (XMLHttpRequest) {
                    //Specifying this header ensures that the results will be returned as JSON.
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                },
                success: function (data, textStatus, XmlHttpRequest) {
                    //Get the data values
                    recordInfo = data.d.results;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (errorThrown != null) {
                        if (errorThrown != "Not Found")
                            Xrm.Utility.alertDialog('Error in retrieve Patient Vitals Info: ' + errorThrown);
                    } else {
                        Xrm.Utility.alertDialog('Post Retrieve Error in retrieve Patient Vitals Info');
                    }
                },
                async: false
            });
        }
        catch (err) {
            Xrm.Utility.alertDialog("Function(retrieve Patient Vitals Info) Error Detail: " + err.message);
            return null;
        }
    }
    return recordInfo;
}

function retrievePatientAlertsInfo(ODataURL, Id, lastDate) {
    //Initialize the return value
    var recordInfo = null;

    // If Id does not exist we are done
    if (Id != null && Id != "") {
        try {
            //Construct the JSON Query
            var jsonQuery = ODataURL + "/" + alertEntitySetName + "?$filter=tri_Regarding/Id  eq guid'" + Id + "'";
            if (lastDate != null && lastDate != "")
                jsonQuery += " and tri_AlertDate ge datetime'" + lastDate.toISOString() + "'";
            jsonQuery += "&$select=tri_AlertDate,tri_AlertCategory,tri_priority,tri_alertidentifier,tri_AlertDescription,tri_alertId";
            jsonQuery += "&$orderby=tri_AlertDate desc";

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: jsonQuery,
                beforeSend: function (XMLHttpRequest) {
                    //Specifying this header ensures that the results will be returned as JSON.
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                },
                success: function (data, textStatus, XmlHttpRequest) {
                    //Get the data values
                    recordInfo = data.d.results;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (errorThrown != null) {
                        if (errorThrown != "Not Found")
                            Xrm.Utility.alertDialog('Error in retrieve Patient Alerts Info: ' + errorThrown);
                    } else {
                        Xrm.Utility.alertDialog('Post Retrieve Error in retrieve Patient Alerts Info');
                    }
                },
                async: false
            });
        }
        catch (err) {
            Xrm.Utility.alertDialog("Function(retrieve Patient Alertss Info) Error Detail: " + err.message);
            return null;
        }
    }
    return recordInfo;
}

function retrieveAdvanceDirectiveInfo(ODataURL, Id, modifiedOn) {
    //Initialize the return value
    var recordInfo = null;

    // If Id does not exist we are done
    if (Id != null && Id != "") {
        try {
            //Construct the JSON Query
            var jsonQuery = ODataURL + "/" + advanceDirectiveEntitySetName + "?$filter=tri_patientid/Id  eq guid'" + Id + "'";
            if (modifiedOn != null && modifiedOn != "")
                jsonQuery += " and ModifiedOn ge datetime'" + modifiedOn.toISOString() + "'";
            jsonQuery += "&$select=tri_name,tri_additionalinstructions,tri_advancedirectiveId";
            jsonQuery += "&$orderby=ModifiedOn desc";
            
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: jsonQuery,
                beforeSend: function (XMLHttpRequest) {
                    //Specifying this header ensures that the results will be returned as JSON.
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                },
                success: function (data, textStatus, XmlHttpRequest) {
                    //Get the data values
                    recordInfo = data.d.results;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (errorThrown != null) {
                        if (errorThrown != "Not Found")
                            Xrm.Utility.alertDialog('Error in retrieve Advance Directive Info: ' + errorThrown);
                    } else {
                        Xrm.Utility.alertDialog('Post Retrieve Error in retrieve Advance Directive Info');
                    }
                },
                async: false
            });
        }
        catch (err) {
            Xrm.Utility.alertDialog("Function(retrieve Advance Directive Info) Error Detail: " + err.message);
            return null;
        }
    }
    return recordInfo;
}

function retrieveAdvanceDirectiveInfoAsync(ODataURL, Id, modifiedOn, successCallback, errorCallback) {
    //Initialize the return value
    var recordInfo = null;

    // If Id does not exist we are done
    if (Id != null && Id != "") {
        try {
            //Construct the JSON Query
            var jsonQuery = ODataURL + "/" + advanceDirectiveEntitySetName + "?$filter=tri_patientid/Id  eq guid'" + Id + "'";
            if (modifiedOn != null && modifiedOn != "")
                jsonQuery += " and ModifiedOn ge datetime'" + modifiedOn.toISOString() + "'";
            jsonQuery += "&$select=tri_name,tri_additionalinstructions,tri_advancedirectiveId";
            jsonQuery += "&$orderby=ModifiedOn desc";

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: jsonQuery,
                beforeSend: function (XMLHttpRequest) {
                    //Specifying this header ensures that the results will be returned as JSON.
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                },
                success: function (data, textStatus, XmlHttpRequest) {
                    if (successCallback) {
                        if (data && data.d && data.d.results) {
                            successCallback(data.d.results, textStatus, XmlHttpRequest);
                        } else if (data && data.d) {
                            successCallback(data.d, textStatus, XmlHttpRequest);
                        } else {
                            successCallback(data, textStatus, XmlHttpRequest);
                        }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (errorCallback)
                        errorCallback(XmlHttpRequest, textStatus, errorThrown);
                    else
                        errorHandler(XmlHttpRequest, textStatus, errorThrown);
                },
                async: true
            });
        }
        catch (err) {
            Xrm.Utility.alertDialog("Function(retrieve Advance Directive Info) Error Detail: " + err.message);
            return null;
        }
    }
    return recordInfo;
}

function retrievePatientVitalsInfoAsync(ODataURL, Id, successCallback, errorCallback) {
    //Initialize the return value
    var recordInfo = null;

    // If Id does not exist we are done
    if (Id != null && Id != "") {
        try {
            //Construct the JSON Query
            var jsonQuery = ODataURL + "/" + vitalEntitySetName + "?$filter=tri_PatientID/Id  eq guid'" + Id + "'";
            jsonQuery += "&$select=tri_MeasurementFlag,tri_ObservationValue,tri_ObservationValue2,tri_ObservationValue3,tri_ObservationDateandTime,tri_ObservationIdentifier,tri_ObservationIdentifier2,tri_ObservationIdentifier3,tri_patientvitalsId";
            jsonQuery += "&$orderby=tri_ObservationDateandTime desc";

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: jsonQuery,
                beforeSend: function (XMLHttpRequest) {
                    //Specifying this header ensures that the results will be returned as JSON.
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                },
                success: function (data, textStatus, XmlHttpRequest) {
                    if (successCallback) {
                        if (data && data.d && data.d.results) {
                            successCallback(data.d.results, textStatus, XmlHttpRequest);
                        } else if (data && data.d) {
                            successCallback(data.d, textStatus, XmlHttpRequest);
                        } else {
                            successCallback(data, textStatus, XmlHttpRequest);
                        }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (errorCallback)
                        errorCallback(XmlHttpRequest, textStatus, errorThrown);
                    else
                        errorHandler(XmlHttpRequest, textStatus, errorThrown);
                },
                async: true
            });
        }
        catch (err) {
            Xrm.Utility.alertDialog("Function(retrieve Patient Vitals Info) Error Detail: " + err.message);
            return null;
        }
    }
    return recordInfo;
}

function errorHandler(xmlHttpRequest, textStatus, errorThrow) {
    Xrm.Utility.alertDialog("Error : " + textStatus + ": " + xmlHttpRequest.statusText);
}