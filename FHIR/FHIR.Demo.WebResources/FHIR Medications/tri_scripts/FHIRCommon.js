var vitalEntitySetName = "tri_patientvitalsSet";
var parseXml;

if (typeof window.DOMParser != "undefined") {
    parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined" &&
       new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function (xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}

var FHIRSearch =
{
    MedicationStatement: 167410000,
    low: 167410001,
    medium: 167410002
}

function stringIsNullorEmpty(testString) {
    var result = false;
    if (testString == null || testString == "")
        result = true;

    return result;
}
function GetMedicationOrdersForPatient(FHIRURL, patientId, lastUpdated) {
    var medOrders = [];
    var numberEntries = 0;
    // First get Medication Statements from FHIR

    var jsonOrders = GetFHIRMedicationForPatientTablet(FHIRURL, patientId, lastUpdated);

    if (jsonOrders != null && jsonOrders.entry != null)
        numberEntries = jsonOrders.entry.length;
    else
        return jsonOrders;   // Send Error Message back
    
    // Merge the two and do not allow duplicates
    for (var i = 0; i < numberEntries; i++) {
        var thisOrder = jsonOrders.entry[i].resource;
        medOrders[i] = new Object;
        medOrders[i].id = thisOrder.id;
        medOrders[i].status = thisOrder.status;

        try {
            if (thisOrder.medicationReference != null && thisOrder.medicationReference.display != null)
                medOrders[i].name = thisOrder.medicationReference.display;
            else
                medOrders[i].name = thisOrder.medicationCodeableConcept.text;
        }
        catch (e) {}

        try {
            if (thisOrder.dosage[0] != null && thisOrder.dosage[0].text != null)
                medOrders[i].dosage = fillStringField(thisOrder.dosage[0].text);
        }
        catch (e1) {}

        try {
            if (thisOrder.dateAsserted != null)
                medOrders[i].date = getDateFromString(thisOrder.dateAsserted);
            else
                medOrders[i].date = getDateFromString(thisOrder.meta.lastUpdated);             
        }
        catch (e2) { }

        try {
            if (thisOrder.wasNotTaken != null)
                medOrders[i].taken = fillReverseBooleanField(thisOrder.wasNotTaken);
        }
        catch (e3) { }

        try {
            if (thisOrder.note != null)
                medOrders[i].note = fillStringField(thisOrder.note);
        }
        catch (e3) { }
    }
    if (medOrders.length > 0)
        medOrders.sort(sortOrdersByDate);
    return medOrders;
}

function sortOrdersByName(a, b) {
    // Sort 1 (o) = name
    var o1 = a["name"];
    var o2 = b["name"];

    if (o1 < o2) return -1;
    if (o1 > o2) return  1;

    return 0;
}

function sortOrdersByDate(a, b) {
    // Sort 1 (o) = date, DESC
    var o1 = new Date(a["date"]);
    var o2 = new Date(b["date"]);

    if (o1 < o2) return  1;  //-1;
    if (o1 > o2) return -1; // 1;

    return 0;
}

//function GetFHIRMedicationForPatientTablet(FHIRURL, patientId, lastUpdated) {
//    if (stringIsNullorEmpty(patientId) == true)
//        return null;

//    //Initialize the return value
//    var jsonData = null;
//    try {
//        //Get ProductSet Data       
//        //Construct the JSON Query
//        var jsonQuery = FHIRURL + "/Patient/" + patientId + "/MedicationStatement";
//        if (stringIsNullorEmpty(lastUpdated) == false) {
//            jsonQuery += "?_lastUpdated=" + lastUpdated;
//        }

//        var xhr = new XMLHttpRequest();
//        xhr.su
//        if (xhr.withCredentials == true) {
//            xhr.open("GET", jsonQuery, false);
//            xhr.setRequestHeader("Accept", "application/json");
//            xhr.send();
//            if (xhr.status === 200)
//                jsonData = JSON.parse(xhr.responseText);
//            else
//                jsonData = 'ERROR:Post Retrieve Error in GetMedicationOrdersForPatientTablet';
//        } else {
//            jsonData = 'ERROR:CORS is not supported';
//        }
//    }
//    catch (err) {
//        jsonData = 'ERROR:Script Failure: Function(GetMedicationOrdersForPatientTablet) Error Detail: ' + err.message;
//    }
//    return jsonData;
//}
function GetFHIRMedicationForPatientTablet(FHIRURL, patientId, lastUpdated) {
    if (stringIsNullorEmpty(patientId) == true)
        return null;

    //Initialize the return value
    var jsonData = null;
    var jsonQuery = "";
    try {
        //Get ProductSet Data       
        //Construct the JSON Query
        jsonQuery = FHIRURL + "/Patient/" + patientId + "/MedicationStatement";
        if (stringIsNullorEmpty(lastUpdated) == false) {
            jsonQuery += "?_lastUpdated=" + lastUpdated;
        }

        $.support.cors = true;
        $.mobile.allowCrossDomainPages = true;
        $.ajax({
            type: "GET",
            contentType: "application/json;",
            datatype: "json",
            url: jsonQuery,
            beforeSend: function (XMLHttpRequest) {
                //Specifying this header ensures that the results will be returned as JSON.
                XMLHttpRequest.setRequestHeader("Accept", "application/json");
            },
            success: function (data, textStatus, XmlHttpRequest) {
                //Get the data values
                jsonData = data;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (errorThrown != null) {
                    jsonData = 'ERROR:Error in GetMedicationOrdersForPatientTablet: ' + errorThrown + "<br/>" + jsonQuery + "<br/>Status: " + textStatus;
                } else {
                    jsonData = 'ERROR:Post Retrieve Error in GetMedicationOrdersForPatientTablet';
                }
            },
            async: false        // Synchronous
        });
    }
    catch (err) {
        jsonData = 'ERROR:Script Failure: Function(GetMedicationOrdersForPatientTablet) Error Detail: ' + err.message + "<br/>" + jsonQuery;
    }
    return jsonData;
}

function GetFHIRMedicationForPatient(FHIRURL, patientId, lastUpdated) {
    if (stringIsNullorEmpty(patientId) == true)
        return null;

    //Initialize the return value
    var jsonData = null;
    var jsonQuery = "";
    try {
        //Get ProductSet Data       
        //Construct the JSON Query
        jsonQuery = FHIRURL + "/Patient/" + patientId + "/MedicationStatement";
        if (stringIsNullorEmpty(lastUpdated) == false) {
            jsonQuery += "?_lastUpdated=" + lastUpdated;
        }

        $.support.cors = true;
        $.ajax({
            type: "GET",
            contentType: "application/json;",
            datatype: "json",
            url: jsonQuery,
            beforeSend: function (XMLHttpRequest) {
                //Specifying this header ensures that the results will be returned as JSON.
                XMLHttpRequest.setRequestHeader("Accept", "application/json");
            },
            success: function (data, textStatus, XmlHttpRequest) {
                //Get the data values
                jsonData = data;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (errorThrown != null) {
                    jsonData = 'ERROR:Error in GetMedicationOrdersForPatient: ' + errorThrown + "<br/>" + jsonQuery;
                } else {
                    jsonData = 'ERROR:Post Retrieve Error in GetMedicationOrdersForPatient';
                }
            },
            async: false        // Synchronous
        });
    }
    catch (err) {
        jsonData = 'ERROR:Script Failure: Function(GetMedicationOrdersForPatient) Error Detail: ' + err.message + "<br/>" + jsonQuery;
    }
    return jsonData;
}

function fillStringField(inputField) {
    var outputField = "";
    if (inputField != null && inputField != "null")
        outputField = inputField;
    return outputField;
}

function fillBooleanField(inputField) {
    var outputField = "No";
    if (inputField != null && inputField == true)
        outputField = "Yes";
    return outputField;
}

function fillReverseBooleanField(inputField) {
    var outputField = "Yes";
    if (inputField != null && inputField == true)
        outputField = "No";
    return outputField;
}

function getDateFromString(inputField) {
    var workingField = fillStringField(inputField);

    // ex: 2015-10-14T15:25:37.721-04:00
    //var isoDate = new Date(workingField).toISOString();  // new Date(workingField);
    //var workingDate = new Date(isoDate);
    var dd = workingField.substring(8, 10);  //workingDate.getDate();
    var mm = workingField.substring(5, 7);  //workingDate.getMonth() + 1
    var yyyy = workingField.substring(0, 4); //workingDate.getFullYear();
    return (mm + "/" + dd + "/" + yyyy);
}

//function createDateFromString(inputField) {
//    var workingField = fillStringField(inputField);
//    // 09/23/2015
//    var dd = workingField.substring(0,2);  
//    var mm = workingField.substring(3,5);  
//    var yyyy = workingField.substring(6, 10); 
//    return new Date.UTC(yyyy, mm, dd);
//}


// Create the XHR object.
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
    return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest(url) {
    // All HTML5 Rocks properties support CORS.
    //var url = 'http://updates.html5rocks.com';

    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function () {
        var text = xhr.responseText;
        var title = getTitle(text);
        alert('Response from CORS request to ' + url + ': ' + title);
    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}

function getFHIRFetch(patientID, searchType, successFetch, errorFetch) {
    var fetchXml = '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
      '<entity name="tri_fhircall">' +
          ' <all-attributes />' +
          '<filter type="and">' +
             '<condition attribute="tri_fhirid" operator="eq" value="' + patientID + '" />' +
             '<condition attribute="tri_data" operator="eq" value="' + searchType + '" />' +
          '</filter>' +
      '</entity>' +
    '</fetch>';
    retrieveRecordUsingFetchXml(fetchXml, successFetch, errorFetch);
}

function GetResponseOld(responseXML, attributename) {
    var returnValue = "";
    try {
        var xmlDoc = parseXml(responseXML);
        //var xmlDoc = responseXML;
        //try {
        //    var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        //    xmlDoc.async = "false";
        //    xmlDoc.loadXML(responseXML);
        //}
        //catch (e1) { }
        var x = xmlDoc.getElementsByTagName("a:KeyValuePairOfstringanyType");
        for (i = 0; i < x.length; i++) {
            if (x[i].childNodes[0].text == attributename) {
                returnValue = x[i].childNodes[1].text;
                break;
            }
        }
        // Try it without the prefix
        if (returnValue == "") {
            var x = xmlDoc.getElementsByTagName("KeyValuePairOfstringanyType");
            for (i = 0; i < x.length; i++) {
                if (x[i].childNodes[0].textContent == attributename) {
                    returnValue = x[i].childNodes[1].textContent;
                    break;
                }
            }
        }
    }
    catch (e) {
        returnValue = "";
    }
    return returnValue;
}

//function train00_UpdateTaskCount(XmlString) {
function GetResponse(XmlString, attributename) {
    //Find
    var returnValue = "";
    try {
        //Find the total result
        var $xmldata = $($.parseXML(XmlString));
        $xmldata.find("a\\:KeyValuePairOfstringanyType").children().each(function () {
            var $this = $(this);
            if ($this.find("b\\:key").text() == attributename) {
                returnValue = $this.find("b\\:value").text();
            }
        });

        // Try Chrome with no prefix
        if (returnValue == "") {
            $xmldata.find("KeyValuePairOfstringanyType").children().each(function () {
                var $this = $(this);
                if ($this.find("key").text() == attributename) {
                    returnValue = $this.find("value").text();
                }
            });
        }
    }
    catch (err) {
        //Display Error
        returnValue = "ERROR: Detail Message: " + err;
    }

    return returnValue;
}