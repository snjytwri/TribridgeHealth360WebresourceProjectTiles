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
        req.open("POST", SDK.SAMPLES._getServerUrl(), false);              // Make it asynchronous
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