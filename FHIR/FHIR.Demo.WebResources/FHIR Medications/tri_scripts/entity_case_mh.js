// JavaScript source code
var ODATA_ENDPOINT = "/XRMServices/2011/OrganizationData.svc";
var SOAP_ENDPOINT = "/XRMServices/2011/Organization.svc/web";

var emptyGuid = "00000000-0000-0000-0000-000000000000";

var autoAssignFieldName = "tri_autoassign";
var territoryFieldName = "tri_territoryid";
var fetchXml;

// FUNCTION: formOnLoad
function form_onload() {

}

function autoAssign_onchange() {
    var autoAssign = Xrm.Page.getAttribute(autoAssignFieldName).getValue();
    if (autoAssign == true) {
        var valid = resetOwner();
        if (valid == false)
            Xrm.Page.getAttribute(autoAssignFieldName).setValue(false);
    }

}

function resetOwner () {
    var returnValue = false;
    var patient = Xrm.Page.getAttribute("customerid");
    if (patient == null)
        displayError("You must select a Patient");
    else {
        var patientER = patient.getValue();
        if (patientER != null && patientER[0].id != null && patientER[0].id != "") {
            setOwner (patientER[0].id);
            returnValue = true;
        } else {
            displayError("You must select a Patient");
        }
    }
    return returnValue;
}

function displayError(errMsg) {
    Xrm.Utility.alertDialog(errMsg);
}


function setOwner(patientId) {
    // find all associated users 
    var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>" +
                        "<entity name='contact'>" +
                            "<filter type='and'>" +
                               "<condition attribute='contactid' operator='eq' value='" + patientId + "' />" +
                            "</filter>" +
                            "<link-entity name='territory' from='territoryid' to='tri_territoryid' alias='terr' link-type='inner'>" +
                               "<link-entity name='systemuser' from='territoryid' to='territoryid' alias='usr' link-type='inner'>" +
                                  "<attribute name='systemuserid'/> " +
                                  "<attribute name='fullname'/> " +
                                  "<attribute name='tri_mhcaseload'/> " +
                                  "<order attribute='tri_mhcaseload' descending='false' />" +
                                  "<link-entity name='position' from='positionid' to='positionid' alias='aa' link-type='inner'>" +
                                     "<filter type='and'>" +
                                        "<condition attribute='positionid' operator='under' uiname='Mental Health Management' uitype='position' value='{F8ADFC0B-89D5-E511-80CE-005056817225}' />" +
                                     "</filter>" +
                                  "</link-entity>" +
                               "</link-entity>" +
                            "</link-entity>" +
                         "</entity>" +
                      "</fetch>";
    retrieveRecordUsingFetchXml(fetchXml, processFetchResults, errorHandlerFetch);

}

function processFetchResults(req) {

    var resultXml = req.responseText;
    if (resultXml != null) {
        var textValue = GetAliasResponse(resultXml, "usr.fullname", "fullnamesystemuser");
        var newOwner = GetResponseAliasERItems(resultXml, "usr.systemuserid", textValue);
        populateERField("ownerid", newOwner);
    }
}

// General Function - General.js

function jsEntityReference(gID, sLogicalName, sName) {
    this.guid = gID;
    this.logicalName = sLogicalName;
    this.name = sName;
    this.type = 'EntityReference';
}

function ChangeSectionDisplayState(tabName, sectionName, isDisplay) {
    var tab = Xrm.Page.ui.tabs.get(tabName);
    var section = tab.sections.get(sectionName);
    section.setVisible(isDisplay);
}

function ChangeSectionDisableState(tabName, sectionName, isDisable) {
    var tab = Xrm.Page.ui.tabs.get(tabName);
    var section = tab.sections.get(sectionName);
    var sectionControls = section.controls.get();
    for (var i in sectionControls) {
        ctrl = sectionControls[i];
        ctrl.setDisabled(isDisable);
    }
}

function ChangeTabDisplayState(tabName, isDisplay) {
    var tab = Xrm.Page.ui.tabs.get(tabName);
    tab.setVisible(isDisplay);
}

function populateERField(fieldName, fieldValue) {
    if ((fieldValue != null)) {
        var textValue = fieldValue.name;
        var idValue = fieldValue.guid;
        var typevalue = fieldValue.logicalName;
        Xrm.Page.getAttribute(fieldName).setValue([{ id: idValue, name: textValue, entityType: typevalue }]);
    }
    else {
        Xrm.Page.getAttribute(fieldName).setValue(null);
    }
    Xrm.Page.getAttribute(fieldName).setSubmitMode("always");
}

function setFieldValue(fieldName, fieldValue) {
    Xrm.Page.getAttribute(fieldName).setValue(fieldValue);
    Xrm.Page.getAttribute(fieldName).setSubmitMode("always");
}

function SetRequired(fieldname, level) {
    var fld = Xrm.Page.getAttribute(fieldname);
    fld.setRequiredLevel(level);
}

function DisableField(fieldName) {
    if (Xrm.Page.ui.controls.get(fieldName) != null) {
        Xrm.Page.ui.controls.get(fieldName).setDisabled(true);
    }
}
function EnableField(fieldName) {
    if (Xrm.Page.ui.controls.get(fieldName) != null) {
        Xrm.Page.ui.controls.get(fieldName).setDisabled(false);
    }
}

function doesControlHaveAttribute(control) {
    var controlType = control.getControlType();
    return controlType != "iframe" && controlType != "webresource" && controlType != "subgrid";
}

function HideField(fieldName) {
    if (Xrm.Page.ui.controls.get(fieldName) != null) {
        Xrm.Page.ui.controls.get(fieldName).setVisible(false);
    }
}

function ShowField(fieldName) {
    if (Xrm.Page.ui.controls.get(fieldName) != null) {
        Xrm.Page.ui.controls.get(fieldName).setVisible(true);
    }
}

function DisableHeaderField(attr) {
    var headerProcAttr = 'header_process_' + attr;
    var headControl = Xrm.Page.getControl(headerProcAttr);
    // If null it means the control is not currently displayed
    if (headControl != null) {
        headControl.setDisabled(true);  //Disabled
    } else {
        var headAttribute = Xrm.Page.getAttribute(headerProcAttr);
        if (headAttribute != null) {
            headAttribute.setDisabled(false);
        }
    }
}

function GetAliasResponse(responseXML, attributename, searchstring) {
    var keyValue = GetResponse(responseXML, attributename);
    var re = new RegExp(searchstring, 'g');
    var returnValue = keyValue.replace(re, '');
    return returnValue;
}

function GetResponse(responseXML, attributename) {
    var returnValue = "";
    try {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false"; xmlDoc.loadXML(responseXML);
        var x = xmlDoc.getElementsByTagName("a:KeyValuePairOfstringanyType");
        for (i = 0; i < x.length; i++) {
            if (x[i].childNodes[0].text == attributename) {
                returnValue = x[i].childNodes[1].text;
                break;
            }
        }
    }
    catch (e) {
        returnValue = "";
    }
    return returnValue;
}

function GetResponseER(responseXML, attributename) {
    var returnValue = null;
    try {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false"; xmlDoc.loadXML(responseXML);
        var x = xmlDoc.getElementsByTagName("a:KeyValuePairOfstringanyType");
        for (i = 0; i < x.length; i++) {
            if (x[i].childNodes[0].text == attributename) {
                returnValue = x[i].childNodes[1];
                break;
            }
        }
    }
    catch (e) {
        returnValue = null;
    }
    return returnValue;
}

function GetResponseERItems(responseXML, attributename) {
    var entRef = new jsEntityReference();
    try {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false"; xmlDoc.loadXML(responseXML);
        var x = xmlDoc.getElementsByTagName("a:KeyValuePairOfstringanyType");
        for (i = 0; i < x.length; i++) {
            // Find the Attribute Name
            var childAttriName = x[i].childNodes[0].text;
            if (x[i].childNodes[0].text == attributename) {
                var attr = x[i].childNodes[1];
                if (attr.attributes[0].baseName == 'type') {
                    sType = attr.attributes[0].text;
                }
                if (sType == "a:EntityReference") {
                    entRef.type = sType;
                    entRef.guid = attr.childNodes[0].text;
                    entRef.logicalName = attr.childNodes[1].text;
                    entRef.name = attr.childNodes[2].text;
                }
                break;
            }
        }
    }
    catch (e) {
        entRef = null;
    }
    return entRef;
}

function GetResponseAliasERItems(responseXML, attributename, textValue) {
    var entRef = new jsEntityReference();
    try {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false"; xmlDoc.loadXML(responseXML);
        var x = xmlDoc.getElementsByTagName("a:KeyValuePairOfstringanyType");
        for (i = 0; i < x.length; i++) {
            // Find the Attribute Name
            var childAttriName = x[i].childNodes[0].text;
            if (x[i].childNodes[0].text == attributename) {
                var attr = x[i].childNodes[1];
                if (attr.attributes[0].baseName == 'type') {
                    sType = attr.attributes[0].text;
                }
                if (sType == "a:AliasedValue") {
                    entRef.type = "a:EntityReference";
                    // Now Check Type of the Second Child
                    var secChild = attr.childNodes[2];
                    var childType = secChild.attributes[0].text;
                    if (childType == "c:guid") {
                        entRef.guid = attr.childNodes[2].text;
                        entRef.logicalName = attr.childNodes[1].text;
                        entRef.name = textValue;
                    } else if (childType == "a:EntityReference") {
                        entRef.guid = secChild.childNodes[0].text;
                        entRef.logicalName = secChild.childNodes[1].text;
                        entRef.name = secChild.childNodes[2].text;
                    }
                }
                break;
            }
        }
    }
    catch (e) {
        entRef = null;
    }
    return entRef;
}

function setIntFieldValue(fieldName, fieldValue) {
    var intValue = parseInt(fieldValue);
    Xrm.Page.getAttribute(fieldName).setValue(intValue);
    Xrm.Page.getAttribute(fieldName).setSubmitMode("always");
}

function setMoneyFieldValue(fieldName, fieldValue) {
    //Xrm.Page.getAttribute(fieldName).setValue(parseFloat(eval(fieldValue)));
    Xrm.Page.data.entity.attributes.get(fieldName).setValue(fieldValue);
}


function setDateFieldValue(fieldName, fieldValue) {
    //var dateValue = new Date(fieldValue);
    var dt1 = parseInt(fieldValue.substring(8, 10));
    var mon1 = parseInt(fieldValue.substring(5, 7));
    var yr1 = parseInt(fieldValue.substring(0, 4));
    var dateValue = new Date(yr1, mon1 - 1, dt1);

    if (isNaN(dateValue.getTime()) == false) {
        //dateValue.setDate(fieldValue);
        Xrm.Page.getAttribute(fieldName).setValue(dateValue);
        Xrm.Page.getAttribute(fieldName).setSubmitMode("always");
    }
}

function GetBooleanResult(resultXml, fieldname) {
    var tempValue = GetResponse(resultXml, fieldname);
    var returnValue = false;
    if (tempValue == "true") {
        returnValue = true;
    }
    return returnValue;
}

function xmlEncode(strInput) {
    var c;
    var XmlEncode = '';
    if (strInput == null) {
        return null;
    }
    if (strInput == '') {
        return '';
    }
    for (var cnt = 0; cnt < strInput.length; cnt++) {
        c = strInput.charCodeAt(cnt);
        if (((c > 96) && (c < 123)) ||
			((c > 64) && (c < 91)) ||
			(c == 32) ||
			((c > 47) && (c < 58)) ||
			(c == 46) ||
			(c == 44) ||
			(c == 45) ||
			(c == 95)) {
            XmlEncode = XmlEncode + String.fromCharCode(c);
        }
        else {
            XmlEncode = XmlEncode + '&#' + c + ';';
        }
    }
    return XmlEncode;
};

function UserHasRole(roleName) {
    var serverUrl = Xrm.Page.context.getClientUrl();

    var ODATA_URL = serverUrl + ODATA_ENDPOINT;
    var oDataEndpointUrl = ODATA_URL + "/RoleSet?$filter=Name eq '" + roleName + "'&$select=RoleId";


    var service = GetRequestObject();
    if (service != null) {
        service.open("GET", oDataEndpointUrl, false);
        service.setRequestHeader("X-Requested-Width", "XMLHttpRequest");
        service.setRequestHeader("Accept", "application/json, text/javascript, */*");
        service.send(null);
        //alert(service.responseText);

        var requestResults = eval('(' + service.responseText + ')').d;
        //alert(requestResults);
        if (requestResults != null && requestResults.results.length > 0) {

            for (var i = 0; i < requestResults.results.length; i++) {

                var role = requestResults.results[i];
                var id = role.RoleId;
                var currentUserRoles = Xrm.Page.context.getUserRoles();
                for (var j = 0; j < currentUserRoles.length; j++) {
                    var userRole = currentUserRoles[j];
                    if (GuidsAreEqual(userRole, id)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function GuidsAreEqual(guid1, guid2) {
    var isEqual = false;

    if (guid1 == null || guid2 == null) {
        isEqual = false;
    }
    else {
        isEqual = guid1.replace(/[{}]/g, "").toLowerCase() == guid2.replace(/[{}]/g, "").toLowerCase();
    }
    return isEqual;
}

function getFormattedID(fieldName) {
    var fieldID = Xrm.Page.getAttribute(fieldName).getValue();
    if (fieldID != null) {
        var baseID = fieldID[0].id;
        // Remove the {
        var actionID = baseID.replace("{", "");
        actionID = actionID.replace("}", "");
        return actionID
    } else {
        return null;
    }
}

function formatID(idValue) {
    if (idValue == null) {
        return null;
    }
    idValue = idValue.replace("%7b", "");
    idValue = idValue.replace("%7d", "");
    idValue = idValue.replace("{", "");
    idValue = idValue.replace("}", "");
    return idValue;
}

function errorHandler(xmlHttpRequest, textStatus, errorThrow) {
    alert("Error : " + textStatus + ": " + xmlHttpRequest.statusText);
}

function errorHandlerFetch(textStatus) {
    alert("Error : " + textStatus + ": ");
}

//main entry point
function retrieveRecord(parentid, entityName, columnNames, successCallback, errorCallback) {
    SDK.SAMPLES.RetrieveRequest(parentid, entityName, columnNames, successCallback, errorCallback);
}

function retrieveRecordUsingFetchXml(fetchXml, successCallback, errorCallback) {
    var fetchQuery = xmlEncode(fetchXml);
    SDK.SAMPLES.RetrieveRequestFetch(fetchQuery, successCallback, errorCallback)
}

if (typeof (SDK) == "undefined")
{ SDK = { __namespace: true }; }
//This will establish a more unique namespace for functions in this library. This will reduce the 
// potential for functions to be overwritten due to a duplicate name when the library is loaded.
SDK.SAMPLES = {
    _getServerUrl: function () {
        ///<summary>
        /// Returns the URL for the SOAP endpoint using the context information available in the form
        /// or HTML Web resource.
        ///</summary>
        var OrgServicePath = "/XRMServices/2011/Organization.svc/web";
        var serverUrl = "";
        if (typeof GetGlobalContext == "function") {
            var context = GetGlobalContext();
            serverUrl = context.getClientUrl(); // context.getServerUrl();
        }
        else {
            if (typeof Xrm.Page.context == "object") {
                serverUrl = Xrm.Page.context.getClientUrl(); // context.getServerUrl();
            }
            else { throw new Error("Unable to access the server URL"); }
        }
        if (serverUrl.match(/\/$/)) {
            serverUrl = serverUrl.substring(0, serverUrl.length - 1);
        }
        return serverUrl + OrgServicePath;
    },

    RetrieveRequest: function (parentid, entityName, columnNames, successCallback, errorCallback) {
        // First split columnNames and build column XML
        var columnsXML = "";
        var columns = columnNames.split(",");
        for (var i in columns) {
            columnsXML += "<c:string>" + columns[i] + "</c:string>";
        }

        var requestMain = ""
        requestMain += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        requestMain += "  <s:Body>";
        requestMain += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
        requestMain += "      <request i:type=\"a:RetrieveRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
        requestMain += "        <a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
        requestMain += "          <a:KeyValuePairOfstringanyType>";
        requestMain += "            <b:key>Target</b:key>";
        requestMain += "            <b:value i:type=\"a:EntityReference\">";
        requestMain += "              <a:Id>" + parentid + "</a:Id>";
        requestMain += "              <a:LogicalName>" + entityName + "</a:LogicalName>";
        requestMain += "              <a:Name i:nil=\"true\" />";
        requestMain += "            </b:value>";
        requestMain += "          </a:KeyValuePairOfstringanyType>";
        requestMain += "          <a:KeyValuePairOfstringanyType>";
        requestMain += "            <b:key>ColumnSet</b:key>";
        requestMain += "            <b:value i:type=\"a:ColumnSet\">";
        requestMain += "              <a:AllColumns>false</a:AllColumns>";
        requestMain += "              <a:Columns xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">";
        requestMain += columnsXML;
        requestMain += "              </a:Columns>";
        requestMain += "            </b:value>";
        requestMain += "          </a:KeyValuePairOfstringanyType>";
        requestMain += "        </a:Parameters>";
        requestMain += "        <a:RequestId i:nil=\"true\" />";
        requestMain += "        <a:RequestName>Retrieve</a:RequestName>";
        requestMain += "      </request>";
        requestMain += "    </Execute>";
        requestMain += "  </s:Body>";
        requestMain += "</s:Envelope>";
        var req = new XMLHttpRequest();
        req.open("POST", SDK.SAMPLES._getServerUrl(), false)               // Make it synchronous
        // Responses will return XML. It isn't possible to return JSON.
        req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        req.onreadystatechange = function () { SDK.SAMPLES.RetrieveResponse(req, successCallback, errorCallback); };
        req.send(requestMain);
        //work with response here
        //var strResponse = req.responseXML.xml;

    },
    RetrieveRequestFetch: function (fetchQuery, successCallback, errorCallback) {
        var requestMain = ""
        requestMain += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        requestMain += "  <s:Body>";
        requestMain += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
        requestMain += "      <request i:type=\"a:RetrieveMultipleRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
        requestMain += "        <a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
        requestMain += "          <a:KeyValuePairOfstringanyType>";
        requestMain += "            <b:key>Query</b:key>";
        requestMain += "            <b:value i:type=\"a:FetchExpression\">";
        requestMain += "              <a:Query>" + fetchQuery + "</a:Query>";
        requestMain += "            </b:value>";
        requestMain += "          </a:KeyValuePairOfstringanyType>";
        requestMain += "        </a:Parameters>";
        requestMain += "        <a:RequestId i:nil=\"true\" />";
        requestMain += "        <a:RequestName>RetrieveMultiple</a:RequestName>";
        requestMain += "      </request>";
        requestMain += "    </Execute>";
        requestMain += "  </s:Body>";
        requestMain += "</s:Envelope>";
        var req = new XMLHttpRequest();
        req.open("POST", SDK.SAMPLES._getServerUrl(), false)               // Make it synchronous
        // Responses will return XML. It isn't possible to return JSON.
        req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        req.onreadystatechange = function () { SDK.SAMPLES.RetrieveResponse(req, successCallback, errorCallback); };
        req.send(requestMain);
        //work with response here
        //var strResponse = req.responseXML.xml;

    },
    RetrieveResponse: function (req, successCallback, errorCallback) {
        ///<summary>
        /// Receives the assign response
        ///</summary>
        ///<param name="req" Type="XMLHttpRequest">
        /// The XMLHttpRequest response
        ///</param>
        ///<param name="successCallback" Type="Function">
        /// The function to perform when an successfult response is returned.
        /// For this message no data is returned so a success callback is not really necessary.
        ///</param>
        ///<param name="errorCallback" Type="Function">
        /// The function to perform when an error is returned.
        /// This function accepts a JScript error returned by the _getError function
        ///</param>
        if (req.readyState == 4) {
            if (req.status == 200) {
                if (successCallback != null) {
                    successCallback(req);
                } else {
                    if (errorCallback != null) {
                        errorCallback(SDK.SAMPLES._getError(req.responseXML));
                    }
                }
            }
            else {
                if (errorCallback != null) {
                    errorCallback(SDK.SAMPLES._getError(req.responseXML));
                }
            }
        }
    },
    _getError: function (faultXml) {
        ///<summary>
        /// Parses the WCF fault returned in the event of an error.
        ///</summary>
        ///<param name="faultXml" Type="XML">
        /// The responseXML property of the XMLHttpRequest response.
        ///</param>
        var errorMessage = "Unknown Error (Unable to parse the fault)";
        if (typeof faultXml == "object") {
            try {
                var bodyNode = faultXml.firstChild.firstChild;
                //Retrieve the fault node
                for (var i = 0; i < bodyNode.childNodes.length; i++) {
                    var node = bodyNode.childNodes[i];
                    //NOTE: This comparison does not handle the case where the XML namespace changes
                    if ("s:Fault" == node.nodeName) {
                        for (var j = 0; j < node.childNodes.length; j++) {
                            var faultStringNode = node.childNodes[j];
                            if ("faultstring" == faultStringNode.nodeName) {
                                errorMessage = faultStringNode.textContent;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            catch (e) { };
        }
        return new Error(errorMessage);
    },
    __namespace: true
};

function retrieveContactInfo(userId) {
    var contactInfo = null;
    var serverUrl = Xrm.Page.context.getClientUrl();

    var ODATA_URL = serverUrl + ODATA_ENDPOINT;
    // If User Id does not exist we are done
    if (userId != null && userId != "") {
        try {
            //Construct the JSON Query
            var jsonQuery = ODATA_URL + "/ContactSet?$select=FullName,ContactId&$filter=(OwnerId/Id eq guid'" + userId + "')";
            //Initialize the return value
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
                    contactInfo = data.d.results;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (errorThrown != null) {
                        alert('Error in retrieve Contact Info: ' + errorThrown);
                    } else {
                        alert('Post Retrieve Error in retrieve Contact Info');
                    }
                },
                async: false
            });
        }
        catch (err) {
            alert("Function(retrieve Contact Info) Error Detail: " + err.message);
            return null;
        }
    }
    return contactInfo;
}

function GetRequestObject() {
    if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest;
    } else {
        try {
            return new ActiveXObject("MSXML2.XMLHTTP.3.0");
        }
        catch (ex) {
            return null;
        }
    }
}

function GetCurrentUserTeams(userId, teamName) {
    if (teamName != null && teamName != "") {
        // build endpoint URL
        var serverUrl = Xrm.Page.context.getClientUrl();
        var oDataEndpointUrl = serverUrl + ODATA_ENDPOINT;
        // query to get the teams that match the name
        oDataEndpointUrl += "/TeamSet?$select=Name,TeamId&$filter=Name eq '" + teamName + "'";
        var service = GetRequestObject();
        if (service != null) {
            // execute the request
            service.open("GET", oDataEndpointUrl, false);
            service.setRequestHeader("X-Requested-Width", "XMLHttpRequest");
            service.setRequestHeader("Accept", "application/json,text/javascript, */*");
            service.send(null);
            // parse the results
            var requestResults = eval('(' + service.responseText + ')').d;
            if (requestResults != null && requestResults.results.length > 0) {
                var teamCounter;
                // iterate through all of the matching teams, checking to see if the current user has a membership
                for (teamCounter = 0; teamCounter < requestResults.results.length; teamCounter++) {
                    var team = requestResults.results[teamCounter];
                    var teamId = team.TeamId;
                    // get current user teams
                    var currentUserTeams = getUserTeams(userId, teamId);
                    // Check whether current user teams matches the target team
                    if (currentUserTeams != null) {
                        for (var i = 0; i < currentUserTeams.length; i++) {
                            var userTeam = currentUserTeams[i];
                            // check to see if the team guid matches the user team membership id
                            if (GuidsAreEqual(userTeam.TeamId, teamId)) {
                                return true;
                            }
                        }
                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                alert("Team with name '" + teamName + "' not found");
                return false;
            }
            return false;
        }
    }
    else {
        return false;
    }
}
function getUserTeams(userId, teamToCheckId) {
    // gets the current users team membership
    var serverUrl = Xrm.Page.context.getClientUrl();
    var oDataEndpointUrl = serverUrl + ODATA_ENDPOINT;
    oDataEndpointUrl += "/TeamMembershipSet?$filter=(SystemUserId eq guid'" + userId + "' and TeamId eq guid'" + teamToCheckId + "')";
    var service = GetRequestObject();
    if (service != null) {
        service.open("GET", oDataEndpointUrl, false);
        service.setRequestHeader("X-Requested-Width", "XMLHttpRequest");
        service.setRequestHeader("Accept", "application/json,text/javascript, */*");
        service.send(null);
        var requestResults = eval('(' + service.responseText + ')').d;
        if (requestResults != null && requestResults.results.length > 0) {
            return requestResults.results;
        }
    }
}

function ChangeSectionFieldDisplayState(tabName, sectionName, fieldName, isVisible) {
    var tab = Xrm.Page.ui.tabs.get(tabName);
    var section = tab.sections.get(sectionName);
    var sectionControls = section.controls.get();
    for (var i in sectionControls) {
        ctrl = sectionControls[i];
        var testName = ctrl.getAttribute().getName();
        if (testName == fieldName) {
            ctrl.setVisible(isVisible);
            break;
        }
    }
}

function whoIsDirty() {
    var message = "The following fields are dirty: \n";
    Xrm.Page.data.entity.attributes.forEach(function (attribute, index) {
        if (attribute.getIsDirty() == true) {
            message += "\u2219 " + attribute.getName() + "\n";
        }
    });

    alert(message);
}

function clearDirtyFlags() {
    var attributes = Xrm.Page.data.entity.attributes.get();
    for (var i in attributes) {
        attributes[i].setSubmitMode("never");
    }
}

function closeWithoutSave() {
    clearDirtyFlags();
    Xrm.Page.ui.close();
}



