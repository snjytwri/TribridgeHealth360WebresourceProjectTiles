if (typeof Tribridge == "undefined")
    Tribridge = {};
if (typeof Tribridge.CRMSDK == "undefined")
    Tribridge.CRMSDK = {};

/**
 * 
 */

Tribridge.CRMSDK.Private = {};
Tribridge.CRMSDK.AttributeType = {};
Tribridge.CRMSDK.ActionType = {};
Tribridge.CRMSDK.OperatorType = {};
Tribridge.CRMSDK.JoinOperator = {};


/**
 * @desc Retrieve an entity by id.  (QueryAttribute)
 *
 * @param entityid - The entity id.
 * @param entityname - The entity name.
 * @param columnsArr - The columns to retrieve as a string array. (Empty array for ALL Columns)
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 * 
 * @required entityid, entityname, columnsArr, successCallback
 * @return The entity json (successCallback(response,passthrough)).
 * @return The exception from the server (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.RetrieveByAttribute = function (entityid, entityname, columnsArr, successCallback, errorCallback, passthrough) {

    var allColumns = false;
    if (Tribridge.CRMSDK.IsNullOrEmpty(columnsArr))
        if (columnsArr != 'undefined' && columnsArr.length < 1) {
            allColumns = true;
        }

    // Prepare Attributes
    var attributes = Tribridge.CRMSDK.Private.ConvertAttributesToSoap(columnsArr);

    // Prepare request
    var request = [
		'<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">',
			'<soapenv:Body>',
				'<Retrieve xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
					'<entityName>' + entityname + '</entityName>',
					'<id>' + entityid + '</id>',
					'<columnSet xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">',
						'<a:AllColumns>' + allColumns + '</a:AllColumns>',
					     attributes,
					'</columnSet>',
				'</Retrieve>',
			'</soapenv:Body>',
		'</soapenv:Envelope>'].join("");

    // Retrieve entity
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Retrieve, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Retrieve, successCallback, errorCallback, passthrough);
};

/**
 * @desc Retrieve multiple entities by conditions. (QueryAttribute)
 *
 * @param entityname - The entity name.
 * @param columnsArr - The columns to retrieve as a string array.
 * @param conditionsJson - The conditions array with Tribridge.CRMSDK.KeyValuePair(s).
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 * 
 * @required entityname, columnsArr, conditionsJson, successCallback
 * @return The entities json (successCallback(response,passthrough)).
 * @return The exception from the server (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.RetrieveMultipleByAttribute = function (entityname, columnsArr, conditionsJson, successCallback, errorCallback, passthrough) {

    var allColumns = false;
    if (Tribridge.CRMSDK.IsNullOrEmpty(columnsArr))
        if (columnsArr != 'undefined' && columnsArr.length < 1) {
            allColumns = true;
        }

    // Prepare Attributes
    var attributes = Tribridge.CRMSDK.Private.ConvertAttributesToSoap(columnsArr);

    // Prepare Conditions
    var conditions = Tribridge.CRMSDK.Private.ConvertConditionsToSoap(conditionsJson);

    var conditionAtts = "";
    var conditionVal = "";

    if (conditions && conditions.length == 2) {
        conditionAtts = conditions[0];
        conditionVal = conditions[1];
    }

    // Prepare request
    var request = [
		'<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">',
			'<soapenv:Body>',
				'<RetrieveMultiple xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
					'<query i:type="a:QueryByAttribute" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">',
						'<a:Attributes xmlns:b="http://schemas.microsoft.com/2003/10/Serialization/Arrays">',
							conditionAtts,
						'</a:Attributes>',
						'<a:ColumnSet>',
						    '<a:AllColumns>' + allColumns + '</a:AllColumns>',
					         attributes,
						'</a:ColumnSet>',
						'<a:EntityName>' + entityname + '</a:EntityName>',
						'<a:Orders />',
						'<a:PageInfo>',
							'<a:Count>0</a:Count>',
							'<a:PageNumber>0</a:PageNumber>',
							'<a:PagingCookie i:nil="true" />',
							'<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>',
						'</a:PageInfo>',
						'<a:Values xmlns:b="http://schemas.microsoft.com/2003/10/Serialization/Arrays">',
							conditionVal,
						'</a:Values>',
						'<a:TopCount i:nil="true" />',
					'</query>',
				'</RetrieveMultiple>',
			'</soapenv:Body>',
		'</soapenv:Envelope>'].join("");

    // Retrieve entities
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.RetrieveMultiple, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.RetrieveMultiple, successCallback, errorCallback, passthrough);
};

/**
 * @desc Retrieve multiple entities by query expressions. (QueryExpression)
 *
 * @param entityname - The entity name.
 * @param columnsArr - The columns to retrieve as a string array.
 * @param criteriaJson - The criteria array with Tribridge.CRMSDK.KeyValuePair(s).
 * @param linkedEntities - The linked entities array with Tribridge.CRMSDK.LinkedEntity(s).
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 * 
 * @required entityname, columnsArr, conditionsJson, successCallback
 * @return The entities json (successCallback(response,passthrough)).
 * @return The exception from the server (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.RetrieveMultipleByExpression = function (entityname, columnsArr, criteriaJson, linkedEntitiesArr, successCallback, errorCallback, passthrough) {

    var allColumns = false;
    if (Tribridge.CRMSDK.IsNullOrEmpty(columnsArr))
        if (columnsArr != 'undefined' && columnsArr.length < 1) {
            allColumns = true;
        }

    // Prepare Attributes
    var attributes = '';
    if (!Tribridge.CRMSDK.IsNullOrEmpty(columnsArr))
        attributes = Tribridge.CRMSDK.Private.ConvertAttributesToSoap(columnsArr);

    // Prepare Conditions   
    var criterias = '';
    if (!Tribridge.CRMSDK.IsNullOrEmpty(criteriaJson))
        criterias = Tribridge.CRMSDK.Private.ConvertCriteriasToSoap(criteriaJson);

    // Prepare LinkedEntities
    var linkedEntities = '';
    if (!Tribridge.CRMSDK.IsNullOrEmpty(linkedEntitiesArr))
        linkedEntities = Tribridge.CRMSDK.Private.ConvertLinkedEntities(linkedEntitiesArr);

    // Prepare request
    var request = [
		'<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">',
			'<soapenv:Body>',
				'<RetrieveMultiple xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
					'<query i:type="a:QueryExpression" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">',
						'<a:ColumnSet>',
						    '<a:AllColumns>' + allColumns + '</a:AllColumns>',
					         attributes,
						'</a:ColumnSet>',
                        '<a:Criteria>',
                            '<a:Conditions>',
                                criterias,
                            '</a:Conditions>',
                            '<a:FilterOperator>And</a:FilterOperator>',
                            '<a:Filters />',
                        '</a:Criteria>',
                        '<a:Distinct>false</a:Distinct>',
						'<a:EntityName>' + entityname + '</a:EntityName>',
                        '<a:LinkEntities>',
                         linkedEntities,
                        '</a:LinkEntities>',
						'<a:Orders />',
						'<a:PageInfo>',
							'<a:Count>0</a:Count>',
							'<a:PageNumber>0</a:PageNumber>',
							'<a:PagingCookie i:nil="true" />',
							'<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>',
						'</a:PageInfo>',
						'<a:NoLock>false</a:NoLock>',
					'</query>',
				'</RetrieveMultiple>',
			'</soapenv:Body>',
		'</soapenv:Envelope>'].join("");

    // Retrieve entities
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.RetrieveMultiple, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.RetrieveMultiple, successCallback, errorCallback, passthrough);
};

/**
 * @desc Update an entity by id.
 *
 * @param entityid - The entity id.
 * @param entityname - The entity name.
 * @param updateFieldsJson - The update fields array with Tribridge.CRMSDK.KeyValuePair(s).
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 * 
 * @required entityid, entityname, updateFieldsJson
 * @return The success flag. (successCallback(response,passthrough)).
 * @return The exception from the server. (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.UpdateEntity = function (entityid, entityname, updateFieldsJson, successCallback, errorCallback, passthrough) {

    if (!updateFieldsJson || updateFieldsJson.length < 1)
        return;

    // Prepare Key Values
    var keyvalues = Tribridge.CRMSDK.Private.ConvertKeyValuesToSoap(updateFieldsJson);

    // Prepare request
    var request = [
		'<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">',
			'<soapenv:Body>',
				'<Update xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
					'<entity xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">',
						'<a:Attributes xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">',
							keyvalues,
						'</a:Attributes>',
						'<a:EntityState i:nil="true" />',
						'<a:FormattedValues xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic" />',
						'<a:Id>' + entityid + '</a:Id>',
						'<a:LogicalName>' + entityname + '</a:LogicalName>',
						'<a:RelatedEntities xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic" />',
					'</entity>',
				'</Update>',
			'</soapenv:Body>',
		'</soapenv:Envelope>'].join("");

    // Update entity
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Update, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Update, successCallback, errorCallback, passthrough);
};

/**
 * @desc Create an entity.
 *
 * @param entityname - The entity name.
 * @param createFieldsJson - The attributes fields array with Tribridge.CRMSDK.KeyValuePair(s).
 * @param successCallback - The callback method on success. 
 * @param errorCallback - The callback method on error. 
 * @param passthrough - The passthrough object. 
 *
 * @required entityname, createFieldsJson
 * @return The success flag. (successCallback(response,passthrough)).
 * @return The exception from the server. (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.CreateEntity = function (entityname, createFieldsJson, successCallback, errorCallback, passthrough) {

    if (!createFieldsJson || createFieldsJson.length < 1)
        return;

    // Prepare Key Values
    var keyvalues = Tribridge.CRMSDK.Private.ConvertKeyValuesToSoap(createFieldsJson);

    // Prepare request
    var request = [
		'<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">',
			'<soapenv:Body>',
				'<Create xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
					'<entity xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">',
						'<a:Attributes xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">',
							keyvalues,
						'</a:Attributes>',
						'<a:EntityState i:nil="true" />',
						'<a:FormattedValues xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic" />',
						'<a:LogicalName>' + entityname + '</a:LogicalName>',
						'<a:RelatedEntities xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic" />',
					'</entity>',
				'</Create>',
			'</soapenv:Body>',
		'</soapenv:Envelope>'].join("");

    // Update entity
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Create, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Create, successCallback, errorCallback, passthrough);
};

/**
 * @desc Delete an entity.
 *
 * @param entityid - The entity id.
 * @param entityname - The entity name.
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 *
 * @required entityid, entityname
 * @return The success flag. (successCallback(response,passthrough)).
 * @return The exception from the server. (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.DeleteEntity = function (entityid, entityname, successCallback, errorCallback, passthrough) {

    // Prepare request
    var request = [
		'<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">',
			'<soapenv:Body>',
				'<Delete xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
					'<entityName>' + entityname + '</entityName>',
					'<id>' + entityid + '</id>',
				'</Delete>',
			'</soapenv:Body>',
		'</soapenv:Envelope>'].join("");

    // Update entity
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Delete, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.Delete, successCallback, errorCallback, passthrough);
};


/**
 * @desc Execute a saved query
 *
 * @param savedQueryId - The entity id.
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 *
 * @required savedQueryId, successCallback
 * @return The success flag. (successCallback(response,passthrough)).
 * @return The exception from the server. (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.ExecuteSavedQuery = function (savedQueryId, successCallback, errorCallback, passthrough) {
    var request = [
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">',
          '<s:Body>',
            '<Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
              '<request i:type="b:ExecuteByIdSavedQueryRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">',
                '<a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">',
                  '<a:KeyValuePairOfstringanyType>',
                    '<c:key>EntityId</c:key>',
                    '<c:value i:type="d:guid" xmlns:d="http://schemas.microsoft.com/2003/10/Serialization/">' + savedQueryId + '</c:value>',
                  '</a:KeyValuePairOfstringanyType>',
                '</a:Parameters>',
                '<a:RequestId i:nil="true" />',
                '<a:RequestName>ExecuteByIdSavedQuery</a:RequestName>',
              '</request>',
            '</Execute>',
          '</s:Body>',
        '</s:Envelope>'
    ].join("");

    // Execute
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.ExecuteQuery, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.ExecuteQuery, successCallback, errorCallback, passthrough);
};

/**
 * @desc Execute a user query
 *
 * @param userQueryId - The entity id.
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 *
 * @required userQueryId, successCallback
 * @return The success flag. (successCallback(response,passthrough)).
 * @return The exception from the server. (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.ExecuteUserQuery = function (userQueryId, successCallback, errorCallback, passthrough) {
    var request = [
         '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">',
           '<s:Body>',
             '<Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
               '<request i:type="b:ExecuteByIdUserQueryRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">',
                 '<a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">',
                   '<a:KeyValuePairOfstringanyType>',
                     '<c:key>EntityId</c:key>',
                     '<c:value i:type="d:guid" xmlns:d="http://schemas.microsoft.com/2003/10/Serialization/">' + userQueryId + '</c:value>',
                   '</a:KeyValuePairOfstringanyType>',
                 '</a:Parameters>',
                 '<a:RequestId i:nil="true" />',
                 '<a:RequestName>ExecuteByIdUserQuery</a:RequestName>',
               '</request>',
             '</Execute>',
           '</s:Body>',
         '</s:Envelope>'
    ].join("");

    // Execute
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.ExecuteQuery, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.ExecuteQuery, successCallback, errorCallback, passthrough);
};

/**
 * @desc RetrieveMultipleByFetchXML
 *
 * @param fetchXml - The fetchXml
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 *
 * @required fetchXml, successCallback
 * @return The success flag. (successCallback(response,passthrough)).
 * @return The exception from the server. (errorCallback(errorxml,passthrough)).
 */
Tribridge.CRMSDK.RetrieveMultipleByFetchXML = function (fetchXml, successCallback, errorCallback, passthrough) {

    var request = [
         "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'>",
            "<s:Body>",
                "<RetrieveMultiple xmlns='http://schemas.microsoft.com/xrm/2011/Contracts/Services' xmlns:i='http://www.w3.org/2001/XMLSchema-instance'>",
                  "<query i:type='a:FetchExpression' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>",
                    "<a:Query>" + fetchXml + "</a:Query>",
                  "</query>",
                "</RetrieveMultiple>",
              "</s:Body>",
        "</s:Envelope>"
    ].join("");

    // RetrieveMultiple
    if (successCallback == null) {
        return Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.RetrieveMultiple, successCallback, errorCallback, passthrough);
    }
    Tribridge.CRMSDK.Private.SoapRequest(request, Tribridge.CRMSDK.ActionType.RetrieveMultiple, successCallback, errorCallback, passthrough);
};

// #################################### Private Methods #####################################

/**
 * @desc Create a soap request to the crm service.
 *
 * @param requestString - The soap request string.
 * @param actiontype - The Tribridge.CRMSDK.ActionType type.
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 *
 * @required requestString, actiontype
 */
Tribridge.CRMSDK.Private.SoapRequest = function (requestString, actiontype, successCallback, errorCallback, passthrough) {

    var req = new XMLHttpRequest();

    // Set the organization service url
    req.open("POST", Tribridge.CRMSDK.GetServerUrl(), (successCallback != null))
    // Responses will return XML. It isn't possible to return JSON.
    req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");

    // Set the request information
    switch (actiontype) {
        case Tribridge.CRMSDK.ActionType.Retrieve:
            req.setRequestHeader("SOAPAction", 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Retrieve');
            break;
        case Tribridge.CRMSDK.ActionType.RetrieveMultiple:
            req.setRequestHeader("SOAPAction", 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/RetrieveMultiple');
            break;
        case Tribridge.CRMSDK.ActionType.Update:
            req.setRequestHeader("SOAPAction", 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Update');
            break;
        case Tribridge.CRMSDK.ActionType.Create:
            req.setRequestHeader("SOAPAction", 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Create');
            break;
        case Tribridge.CRMSDK.ActionType.Delete:
            req.setRequestHeader("SOAPAction", 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Delete');
            break;
        case Tribridge.CRMSDK.ActionType.ExecuteQuery:
            req.setRequestHeader("SOAPAction", 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute');
            break;
    }
    if (successCallback != null) {
        req.onreadystatechange = function () {

            // Interpret the response
            Tribridge.CRMSDK.Private.SoapResponse(req, function () {
                var docText = req.responseText;
                var docXml = req.responseXML;

                // Parse and callback.
                switch (actiontype) {
                    case Tribridge.CRMSDK.ActionType.Retrieve:
                        successCallback(Tribridge.CRMSDK.Private.ParseSingleSoapResponse(docXml), passthrough);
                        break;
                    case Tribridge.CRMSDK.ActionType.RetrieveMultiple:
                        successCallback(Tribridge.CRMSDK.Private.ParseMultipleSoapResponse(docXml), passthrough);
                        break;
                    case Tribridge.CRMSDK.ActionType.Update:
                    case Tribridge.CRMSDK.ActionType.Create:
                    case Tribridge.CRMSDK.ActionType.Delete:
                        successCallback(Tribridge.CRMSDK.Private.ParseExecuteSoapResponse(docXml), passthrough);
                        break;
                    case Tribridge.CRMSDK.ActionType.ExecuteQuery:
                        successCallback(Tribridge.CRMSDK.Private.ParseExecuteSoapQueryResponse(docXml), passthrough);
                        break;
                }

            }, errorCallback, passthrough);
        };
        // Send the request
        req.send(requestString);
    }
    else {
        // Send the request
        req.send(requestString);
        // XML
        var docText = req.responseText;
        var docXml = req.responseXML;
        // Parse and return.
        switch (actiontype) {
            case Tribridge.CRMSDK.ActionType.Retrieve:
                return Tribridge.CRMSDK.Private.ParseSingleSoapResponse(docXml);
                break;
            case Tribridge.CRMSDK.ActionType.RetrieveMultiple:
                return Tribridge.CRMSDK.Private.ParseMultipleSoapResponse(docXml);
                break;
            case Tribridge.CRMSDK.ActionType.Update:
            case Tribridge.CRMSDK.ActionType.Create:
            case Tribridge.CRMSDK.ActionType.Delete:
                return Tribridge.CRMSDK.Private.ParseExecuteSoapResponse(docXml);
                break;
            case Tribridge.CRMSDK.ActionType.ExecuteQuery:
                return Tribridge.CRMSDK.Private.ParseExecuteSoapQueryResponse(docXml);
                break;
        }
    }

};


Tribridge.CRMSDK.Private.ParseExecuteSoapQueryResponse = function (responseXML) {
    var prefixA = 'a:';
    var prefixB = 'b:';
    var prefixC = 'c:';
    var prefixI = 'i:';

    //Chrome Workaround
    if (window.navigator.vendor == 'Google Inc.') {
        prefixA = '';
        prefixB = '';
        prefixC = '';
        prefixI = '';
    }

    var rootNode = responseXML.getElementsByTagName('ExecuteResult');
    var valueNode = responseXML.getElementsByTagName(prefixC + 'value');

    var xmlStr = Tribridge.CRMSDK.Private.GetTextPropertyXML(valueNode[0]);

    var xmlDoc;

    if (window.DOMParser) {
        var parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlStr, "text/xml");
    }
    else // code for IE
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlStr);
    }

    var results = xmlDoc.getElementsByTagName('result');
    var response = [];

    for (var i = 0; i < results.length; i++) {

        var conv = {};
        for (var j = 0; j < results[i].childNodes.length; j++) {

            conv[results[i].childNodes[j].tagName] = results[i].childNodes[j].text;

        }
        response.push(conv);
    }

    return response;

};

/**
 * @desc Retrieve a soap response.
 *
 * @param req - The request state.
 * @param successCallback - The callback method on success.
 * @param errorCallback - The callback method on error.
 * @param passthrough - The passthrough object.
 *
 * @required req
 */
Tribridge.CRMSDK.Private.SoapResponse = function (req, successCallback, errorCallback, passthrough) {
    if (req.readyState == 4) {
        if (req.status == 200) {
            if (successCallback != null) {
                successCallback();
            }
        }
        else {
            if (!errorCallback) {
                alert(req.responseText);
            }
            else {
                errorCallback(req.responseText, passthrough);
            }
        }
    }
};

/**
 * @desc Parse the execute soap response.
 *
 * @param responseXML - The repsonse xml.
 *
 * @required responseXML
 */
Tribridge.CRMSDK.Private.ParseExecuteSoapResponse = function (responseXML) {
    var createRespTag = responseXML.getElementsByTagName('CreateResponse');
    var execRespTag = responseXML.getElementsByTagName('ExecuteResponse');
    var updateRespTag = responseXML.getElementsByTagName('UpdateResponse');

    var result = { Status: true };

    if (!Tribridge.CRMSDK.IsNullOrEmpty(createRespTag)) {
        result.Value = createRespTag[0].textContent;
        result.Type = 'CreateResponse';
    }

    if (!Tribridge.CRMSDK.IsNullOrEmpty(updateRespTag)) {
        result.Value = updateRespTag[0].textContent;
        result.Type = 'UpdateResponse';
    }

    if (!Tribridge.CRMSDK.IsNullOrEmpty(execRespTag)) {
        result.Value = execRespTag[0].textContent;
        result.Type = 'ExecuteResponse';
    }
    return result;
};

/**
 * @desc Parse the single entity soap response.
 *
 * @param responseXML - The repsonse xml.
 *
 * @required responseXML
 */
Tribridge.CRMSDK.Private.ParseSingleSoapResponse = function (responseXML) {

    var entityId = '';
    var logicalName = '';
    var keyvaluepairs = '';
    var entitystate = '';
    var formattedValuesKeyPairs = '';

    var prefixA = 'a:';
    var prefixB = 'b:';
    var prefixC = 'c:';
    var prefixI = 'i:';

    //Chrome Workaround
    if (window.navigator.vendor == 'Google Inc.') {
        prefixA = '';
        prefixB = '';
        prefixC = '';
        prefixI = '';
    }

    var rootNode = responseXML.getElementsByTagName('RetrieveResult');
    var attributesNode = responseXML.getElementsByTagName(prefixA + 'Attributes');

    var results = [];

    // Get entity id and name
    entityId = Tribridge.CRMSDK.Private.GetTextPropertyXML(rootNode[0].getElementsByTagName(prefixA + 'Id')[0]);
    logicalName = Tribridge.CRMSDK.Private.GetTextPropertyXML(rootNode[0].getElementsByTagName(prefixA + 'LogicalName')[0]);
    entitystate = Tribridge.CRMSDK.Private.GetTextPropertyXML(rootNode[0].getElementsByTagName(prefixA + 'EntityState')[0]);

    // Get formattedValues
    var formattedValues = rootNode[0].getElementsByTagName(prefixA + 'FormattedValues');
    if (formattedValues && formattedValues.length > 0) {
        formattedValuesKeyPairs = formattedValues[0].getElementsByTagName(prefixA + 'KeyValuePairOfstringstring');
    }

    // Get keyvaluepairs
    keyvaluepairs = attributesNode[0].getElementsByTagName(prefixA + 'KeyValuePairOfstringanyType');

    var properties = [];
    // Check what type 
    for (var i = 0; i < keyvaluepairs.length; i++) {

        var name = Tribridge.CRMSDK.Private.GetTextPropertyXML(keyvaluepairs[i].childNodes[0]);
        var value = keyvaluepairs[i].childNodes[1];
        var type = value.getAttribute(prefixI + 'type');
        var transType = Tribridge.CRMSDK.AttributeType.Default;
        var transRelated = '';
        var transFormat = Tribridge.CRMSDK.Private.GetTextPropertyXML(value);
        var transVal = Tribridge.CRMSDK.Private.GetTextPropertyXML(value);
        // Set formatted value
        if (formattedValuesKeyPairs && formattedValuesKeyPairs.length > 0) {
            for (var f = 0; f < formattedValuesKeyPairs.length; f++) {
                if (Tribridge.CRMSDK.Private.GetTextPropertyXML(formattedValuesKeyPairs[f].childNodes[0]) == name) {
                    transFormat = Tribridge.CRMSDK.Private.GetTextPropertyXML(formattedValuesKeyPairs[f].childNodes[1]);
                }
            }
        }

        switch (type.toString().toLowerCase()) {
            case prefixC + 'guid':
                transType = Tribridge.CRMSDK.AttributeType.Guid;
                break;
            case prefixA + 'entityreference':
                transRelated = Tribridge.CRMSDK.Private.GetTextPropertyXML(value.getElementsByTagName(prefixA + 'LogicalName')[0]);
                transFormat = Tribridge.CRMSDK.Private.GetTextPropertyXML(value.getElementsByTagName(prefixA + 'Name')[0]);
                transVal = Tribridge.CRMSDK.Private.GetTextPropertyXML(value.getElementsByTagName('a:Id')[0]);
                transType = Tribridge.CRMSDK.AttributeType.EntityReference;
                break;
            case prefixC + 'string':
                transType = Tribridge.CRMSDK.AttributeType.String;
                break;
            case prefixC + 'datetime':
                transType = Tribridge.CRMSDK.AttributeType.DateTime;
                break;
            case prefixC + 'int':
                transType = Tribridge.CRMSDK.AttributeType.Number;
                transVal = parseInt(transVal);
                break;
            case prefixC + 'double':
            case prefixC + 'decimal':
                transType = Tribridge.CRMSDK.AttributeType.Double;
                transVal = parseFloat(transVal);
                break;
            case prefixA + 'optionsetvalue':
                transType = Tribridge.CRMSDK.AttributeType.OptionSetValue;
                break;
            case prefixC + 'boolean':
                transType = Tribridge.CRMSDK.AttributeType.Boolean;
                break;
            case prefixA + 'aliasedvalue':

                break;
            default:
                continue;
                break;
        }

        properties[name] = {
            Name: name,
            FormattedValue: transFormat,
            Value: transVal,
            ReferencedEntity: transRelated,
            Type: transType
        };
    }

    return {
        LogicalName: logicalName,
        Id: entityId,
        Properties: properties
    };
};

/**
 * @desc Parse the multiple entity soap response.
 *
 * @param responseXML - The repsonse xml.
 *
 * @required responseXML
 */
Tribridge.CRMSDK.Private.ParseMultipleSoapResponse = function (responseXML) {

    var entityId = '';
    var logicalName = '';
    var keyvaluepairs = '';
    var entitystate = '';
    var formattedValuesKeyPairs = '';

    var prefixA = 'a:';
    var prefixB = 'b:';
    var prefixC = 'c:';
    var prefixI = 'i:';

    //Chrome Workaround
    if (window.navigator.vendor == 'Google Inc.') {
        prefixA = '';
        prefixB = '';
        prefixC = '';
        //prefixI = '';
    }

    var rootNode = responseXML.getElementsByTagName(prefixA + 'Entity');

    var results = [];
    for (var x = 0; x < rootNode.length; x++) {

        var attributesNode = rootNode[x].getElementsByTagName(prefixA + 'Attributes')[0];

        var cleanRoot = rootNode[x];
        cleanRoot.removeChild(attributesNode);

        // Get entity id and name
        entityId = Tribridge.CRMSDK.Private.GetTextPropertyXML(cleanRoot.getElementsByTagName(prefixA + 'Id')[0]);
        logicalName = Tribridge.CRMSDK.Private.GetTextPropertyXML(cleanRoot.getElementsByTagName(prefixA + 'LogicalName')[0]);
        entitystate = Tribridge.CRMSDK.Private.GetTextPropertyXML(cleanRoot.getElementsByTagName(prefixA + 'EntityState')[0]);

        // Get formattedValues
        var formattedValues = cleanRoot.getElementsByTagName(prefixA + 'FormattedValues');
        if (formattedValues && formattedValues.length > 0) {
            formattedValuesKeyPairs = formattedValues[0].getElementsByTagName(prefixA + 'KeyValuePairOfstringstring');
        }

        // Get keyvaluepairs
        keyvaluepairs = attributesNode.getElementsByTagName(prefixA + 'KeyValuePairOfstringanyType');

        var properties = [];
        // Check what type 
        for (var i = 0; i < keyvaluepairs.length; i++) {

            var name = Tribridge.CRMSDK.Private.GetTextPropertyXML(keyvaluepairs[i].childNodes[0]);
            var value = keyvaluepairs[i].childNodes[1];
            var type = value.getAttribute(prefixI + 'type')
            var transType = Tribridge.CRMSDK.AttributeType.Default;
            var transRelated = '';
            var transFormat = Tribridge.CRMSDK.Private.GetTextPropertyXML(value);
            var transVal = Tribridge.CRMSDK.Private.GetTextPropertyXML(value);

            // Set formatted value
            if (formattedValuesKeyPairs && formattedValuesKeyPairs.length > 0) {
                for (var f = 0; f < formattedValuesKeyPairs.length; f++) {
                    if (Tribridge.CRMSDK.Private.GetTextPropertyXML(formattedValuesKeyPairs[f].childNodes[0]) == name) {
                        transFormat = Tribridge.CRMSDK.Private.GetTextPropertyXML(formattedValuesKeyPairs[f].childNodes[1]);
                    }
                }
            }
            //case prefixC + 'guid':
            //case prefixA + 'entityreference':
            // case prefixC + 'string':
            // case prefixC + 'datetime':
            //case prefixC + 'int':
            //case prefixC + 'double':
            // case prefixC + 'decimal':
            //case prefixA + 'optionsetvalue':
            //case prefixC + 'boolean':
            //case prefixA + 'aliasedvalue':

            switch (type.toString().toLowerCase()) {
                case 'c:guid':
                case 'guid':
                    transType = Tribridge.CRMSDK.AttributeType.Guid;
                    break;

                case 'a:entityreference':
                case 'entityreference':
                    transRelated = Tribridge.CRMSDK.Private.GetTextPropertyXML(value.getElementsByTagName(prefixA + 'LogicalName')[0]);
                    transFormat = Tribridge.CRMSDK.Private.GetTextPropertyXML(value.getElementsByTagName(prefixA + 'Name')[0]);
                    transVal = Tribridge.CRMSDK.Private.GetTextPropertyXML(value.getElementsByTagName(prefixA + 'Id')[0]);
                    transType = Tribridge.CRMSDK.AttributeType.EntityReference;
                    break;
                case 'c:string':
                case 'string':
                    transType = Tribridge.CRMSDK.AttributeType.String;
                    break;
                case 'c:datetime':
                case 'datetime':
                    transType = Tribridge.CRMSDK.AttributeType.DateTime;
                    break;
                case 'c:int':
                case 'int':
                    transType = Tribridge.CRMSDK.AttributeType.Number;
                    transVal = parseInt(transVal);
                    break;
                case 'c:double':
                case 'double':
                case 'c:decimal':
                case 'decimal':
                    transType = Tribridge.CRMSDK.AttributeType.Double;
                    transVal = parseFloat(transVal);
                    break;
                case 'a:optionsetvalue':
                case 'optionsetvalue':
                    transType = Tribridge.CRMSDK.AttributeType.OptionSetValue;
                    break;
                case 'c:boolean':
                case 'boolean':
                    transType = Tribridge.CRMSDK.AttributeType.Boolean;
                    break;
                case 'a:aliasedvalue':
                case 'aliasedvalue':

                    break;
                default:
                    continue;
                    break;
            }

            properties[name] = {
                Name: name,
                FormattedValue: transFormat,
                Value: transVal,
                ReferencedEntity: transRelated,
                Type: transType
            };

        }

        results.push({
            LogicalName: logicalName,
            Id: entityId,
            Properties: properties
        });
    }
    return results;
};

/**
 * @desc Get the text content from a xml node.
 *
 * @param node - The xml node.
 *
 * @required node
 * @return The string.
 */
Tribridge.CRMSDK.Private.GetTextPropertyXML = function (node) {
    if (typeof node == 'undefined' || node == null)
        return '';

    if (typeof node.text != 'undefined')
        return node.text;
    if (typeof node.textContent != 'undefined')
        return node.textContent;

    return '';
};

/**
 * @desc Convert an columnset array to the corresponding soap lines for the request.
 *
 * @param attributesArr - The attributes string array.
 *
 * @required attributesArr
 */
Tribridge.CRMSDK.Private.ConvertAttributesToSoap = function (attributesArr) {

    var attributes = "";
    if (!Tribridge.CRM.IsNullOrEmpty(attributesArr)) {
        attributes = attributes.concat('<a:Columns xmlns:b="http://schemas.microsoft.com/2003/10/Serialization/Arrays">');
        for (i = 0; i < attributesArr.length; i++) {
            var item = attributesArr[i];
            var att = '<b:string>' + item + '</b:string>';
            attributes = attributes.concat(att);
        };
        attributes = attributes.concat('</a:Columns>');
    }
    return attributes;
};

/**
 * @desc Convert an conditions array to the corresponding soap lines for the request.
 *
 * @param keyvaluepairsJson - The Tribridge.CRMSDK.KeyValuePair array.
 *
 * @required keyvaluepairsJson
 */
Tribridge.CRMSDK.Private.ConvertConditionsToSoap = function (keyvaluepairsJson) {

    var conditionAtts = "";
    var conditionVal = "";

    for (i = 0; i < keyvaluepairsJson.length; i++) {

        var item = keyvaluepairsJson[i];
        var valueSchema = 'http://www.w3.org/2001/XMLSchema';

        if (item.Type == Tribridge.CRMSDK.AttributeType.Guid) {
            valueSchema = 'http://schemas.microsoft.com/2003/10/Serialization/';
        }

        conditionAtts = conditionAtts.concat('<b:string>' + item.Key + '</b:string>');
        conditionVal = conditionVal.concat('<b:anyType i:type="c:' + item.Type + '" xmlns:c="' + valueSchema + '">' + item.Value + '</b:anyType>');
    };

    return [conditionAtts, conditionVal];
};


/**
 * @desc Convert an key value pairs array to the corresponding soap lines for the request.
 *
 * @param keyvaluepairsJson - The Tribridge.CRMSDK.KeyValuePair array.
 *
 * @required keyvaluepairsJson
 */
Tribridge.CRMSDK.Private.ConvertKeyValuesToSoap = function (keyvaluepairsJson) {

    var returnString = "";

    for (i = 0; i < keyvaluepairsJson.length; i++) {
        var item = keyvaluepairsJson[i];

        var valueSchema = 'http://www.w3.org/2001/XMLSchema';

        if (item.Type == Tribridge.CRMSDK.AttributeType.Guid) {
            valueSchema = 'http://schemas.microsoft.com/2003/10/Serialization/';
        }

        returnString = returnString.concat('<a:KeyValuePairOfstringanyType>');
        returnString = returnString.concat('<b:key>' + item.Key + '</b:key>');

        switch (item.Type) {
            case Tribridge.CRMSDK.AttributeType.EntityReference:
                returnString = returnString.concat('<b:value i:type="a:EntityReference">');
                returnString = returnString.concat('<a:Id>' + item.Value + '</a:Id>');
                returnString = returnString.concat('<a:LogicalName>' + item.EntityName + '</a:LogicalName>');
                returnString = returnString.concat('<a:Name i:nil="true" />');
                returnString = returnString.concat('</b:value>');
                break;
            case Tribridge.CRMSDK.AttributeType.OptionSetValue:
                returnString = returnString.concat('<b:value i:type="a:OptionSetValue">');
                returnString = returnString.concat('<a:Value>' + item.Value + '</a:Value>');
                returnString = returnString.concat('</b:value>');
                break;
            default:
                returnString = returnString.concat('<b:value i:type="c:' + item.Type + '" xmlns:c="' + valueSchema + '">' + item.Value + '</b:value>');
        }

        returnString = returnString.concat('</a:KeyValuePairOfstringanyType>');
    };

    return returnString;
};
// TODO Finish
Tribridge.CRMSDK.Private.ConvertLinkedEntities = function (linkedEntitiesArr) {

    var returnString = "";

    if (typeof linkedEntitiesArr == 'undefined' || linkedEntitiesArr == null)
        return returnString;

    for (i = 0; i < linkedEntitiesArr.length; i++) {

        var item = linkedEntitiesArr[i];

        var allColumns = false;
        if (Tribridge.CRMSDK.IsNullOrEmpty(item.ColumnSet))
            if (item.ColumnSet != 'undefined' && item.ColumnSet.length < 1) {
                allColumns = true;
            }

        returnString = returnString.concat('<a:LinkEntity>');
        // ColumnSet
        returnString = returnString.concat('<a:Columns>');
        returnString = returnString.concat('<a:AllColumns>' + allColumns + '</a:AllColumns>');
        returnString = returnString.concat(Tribridge.CRMSDK.Private.ConvertAttributesToSoap(item.ColumnSet));
        returnString = returnString.concat('</a:Columns>');

        // EntityAlias
        returnString = returnString.concat('<a:EntityAlias i:nil="true" />');
        // Join Operator
        returnString = returnString.concat('<a:JoinOperator>');

        if (typeof item.Operator != 'undefined' && item.Operator != null)
            returnString = returnString.concat(item.Operator);
        else
            returnString = Tribridge.CRMSDK.JoinOperator.Inner;

        returnString = returnString.concat('</a:JoinOperator>');

        // LinkCriteria
        returnString = returnString.concat('<a:LinkCriteria>');

        if (typeof item.LinkCriteria != 'undefined' && item.LinkCriteria != null) {
            returnString = returnString.concat('<a:Conditions>');
            returnString = returnString.concat(Tribridge.CRMSDK.Private.ConvertCriteriasToSoap(item.LinkCriteria));
            returnString = returnString.concat('</a:Conditions>');
        }
        returnString = returnString.concat('<a:FilterOperator>And</a:FilterOperator>');
        returnString = returnString.concat('<a:Filters />');
        returnString = returnString.concat('</a:LinkCriteria>');


        // LinkEntity
        returnString = returnString.concat('<a:LinkEntities />');

        returnString = returnString.concat('<a:LinkFromAttributeName>');
        returnString = returnString.concat(item.LinkFromAttributeName);
        returnString = returnString.concat('</a:LinkFromAttributeName>');

        returnString = returnString.concat('<a:LinkFromEntityName i:nil="true" />');

        returnString = returnString.concat('<a:LinkToAttributeName>');
        returnString = returnString.concat(item.LinkToAttributeName);
        returnString = returnString.concat('</a:LinkToAttributeName>');

        returnString = returnString.concat('<a:LinkToEntityName>');
        returnString = returnString.concat(item.LinkToEntityName);
        returnString = returnString.concat('</a:LinkToEntityName>');

        returnString = returnString.concat('</a:LinkEntity>');
    }
    return returnString;
};

/**
 * @desc Convert a criteria array to the corresponding soap lines for the request.
 *
 * @param criteriaJson - The Tribridge.CRMSDK.OperatorType array.
 *
 * @required criteriaJson
 */
Tribridge.CRMSDK.Private.ConvertCriteriasToSoap = function (criteriaJson) {

    var returnString = "";

    for (i = 0; i < criteriaJson.length; i++) {
        var item = criteriaJson[i];

        var valueSchema = 'http://www.w3.org/2001/XMLSchema';

        if (item.Type == Tribridge.CRMSDK.AttributeType.Guid) {
            valueSchema = 'http://schemas.microsoft.com/2003/10/Serialization/';
        }

        returnString = returnString.concat('<a:ConditionExpression>');
        returnString = returnString.concat('<a:AttributeName>' + item.LogicalName + '</a:AttributeName>');
        returnString = returnString.concat('<a:Operator>' + item.Operator + '</a:Operator>');
        returnString = returnString.concat('<a:Values xmlns:b="http://schemas.microsoft.com/2003/10/Serialization/Arrays">');

        if (typeof item.Values != 'undefined' && item.Values.length > 0) {
            for (j = 0; j < item.Values.length; j++) {
                returnString = returnString.concat('<b:anyType i:type="c:' + item.Type + '" xmlns:c="' + valueSchema + '">' + item.Values[j] + '</b:anyType>');
            }
        }

        returnString = returnString.concat('</a:Values>');
        returnString = returnString.concat('</a:ConditionExpression>');
    };

    return returnString;
};



// #################################### ENUM, Types #####################################

/*
*  Attribute Types, ENUM
*/
Tribridge.CRMSDK.AttributeType.prototype = {
    Default: 'string',
    String: 'string',
    Guid: 'guid',
    EntityReference: 'entityreference',
    Number: 'int',
    Double: 'double',
    Decimal: 'decimal',
    Money: 'money',
    DateTime: 'dateTime',
    OptionSetValue: 'optionsetvalue',
    Boolean: 'boolean'
};

Tribridge.CRMSDK.AttributeType.Default = 'string';
Tribridge.CRMSDK.AttributeType.String = 'string';
Tribridge.CRMSDK.AttributeType.Guid = 'guid';
Tribridge.CRMSDK.AttributeType.EntityReference = 'entityreference';
Tribridge.CRMSDK.AttributeType.Number = 'int';
Tribridge.CRMSDK.AttributeType.Double = 'double';
Tribridge.CRMSDK.AttributeType.Decimal = 'decimal';
Tribridge.CRMSDK.AttributeType.Money = 'money';
Tribridge.CRMSDK.AttributeType.DateTime = 'dateTime';
Tribridge.CRMSDK.AttributeType.OptionSetValue = 'optionsetvalue';
Tribridge.CRMSDK.AttributeType.Boolean = 'boolean';

Tribridge.CRMSDK.AttributeType.__enum = true;
Tribridge.CRMSDK.AttributeType.__flags = true;


/*
*  Action Types, ENUM
*/
Tribridge.CRMSDK.ActionType.prototype = {
    Default: 0,
    Retrieve: 0,
    RetrieveMultiple: 1,
    Create: 2,
    Update: 3,
    Delete: 4,
    Execute: 5,
    ExecuteQuery: 6
};

Tribridge.CRMSDK.ActionType.Default = 0;
Tribridge.CRMSDK.ActionType.Retrieve = 0;
Tribridge.CRMSDK.ActionType.RetrieveMultiple = 1;
Tribridge.CRMSDK.ActionType.Create = 2;
Tribridge.CRMSDK.ActionType.Update = 3;
Tribridge.CRMSDK.ActionType.Delete = 4;
Tribridge.CRMSDK.ActionType.Execute = 5;
Tribridge.CRMSDK.ActionType.ExecuteQuery = 6;

Tribridge.CRMSDK.ActionType.__enum = true;
Tribridge.CRMSDK.ActionType.__flags = true;

/*
*  JoinOperator, ENUM
*/
Tribridge.CRMSDK.JoinOperator.prototype = {
    Default: 'Inner',
    Inner: 'Inner',
    LeftOuter: 'LeftOuter',
    Natural: 'Natural'
};

Tribridge.CRMSDK.JoinOperator.Default = 'Inner';
Tribridge.CRMSDK.JoinOperator.Inner = 'Inner';
Tribridge.CRMSDK.JoinOperator.LeftOuter = 'LeftOuter';
Tribridge.CRMSDK.JoinOperator.Natural = 'Natural';

Tribridge.CRMSDK.JoinOperator.__enum = true;
Tribridge.CRMSDK.JoinOperator.__flags = true;



/*
*  Operator Type, ENUM
*/
Tribridge.CRMSDK.OperatorType.prototype = {
    Equal: 'Equal',
    NotEqual: 'NotEqual',
    GreaterThan: 'GreaterThan',
    LessThan: 'LessThan',
    GreaterEqual: 'GreaterEqual',
    LessEqual: 'LessEqual',
    Like: 'Like',
    NotLike: 'NotLike',
    In: 'In',
    NotIn: 'NotIn',
    Between: 'Between',
    NotBetween: 'NotBetween',
    Null: 'Null',
    NotNull: 'NotNull',
    Yesterday: 'Yesterday',
    Today: 'Today',
    Tomorrow: 'Tomorrow',
    Last7Days: 'Last7Days',
    Next7Days: 'Next7Days',
    LastWeek: 'LastWeek',
    ThisWeek: 'ThisWeek',
    NextWeek: 'NextWeek',
    LastMonth: 'LastMonth',
    ThisMonth: 'ThisMonth',
    NextMonth: 'NextMonth',
    ThisWeek: 'ThisWeek',
    On: 'On',
    OnOrBefore: 'OnOrBefore',
    OnOrAfter: 'OnOrAfter',
    LastYear: 'LastYear',
    ThisYear: 'ThisYear',
    NextYear: 'NextYear',
    LastXHours: 'LastXHours',
    NextXHours: 'NextXHours',
    LastXDays: 'LastXDays',
    NextXDays: 'NextXDays',
    LastXWeeks: 'LastXWeeks',
    NextXWeeks: 'NextXWeeks',
    LastXMonths: 'LastXMonths',
    NextXMonths: 'NextXMonths',
    LastXYears: 'LastXYears',
    NextXYears: 'NextXYears',
    EqualUserId: 'EqualUserId',
    NotEqualUserId: 'NotEqualUserId',
    EqualBusinessId: 'EqualBusinessId',
    NotEqualBusinessId: 'NotEqualBusinessId',
    ChildOf: 'ChildOf',
    Mask: 'Mask',
    NotMask: 'NotMask',
    MasksSelect: 'MasksSelect',
    Contains: 'Contains',
    DoesNotContain: 'DoesNotContain',
    EqualUserLanguage: 'EqualUserLanguage',
    NotOn: 'NotOn',
    OlderThanXMonths: 'OlderThanXMonths',
    BeginsWith: 'BeginsWith',
    DoesNotBeginWith: 'DoesNotBeginWith',
    EndsWith: 'EndsWith',
    DoesNotEndWith: 'DoesNotEndWith',
    ThisFiscalYear: 'ThisFiscalYear',
    ThisFiscalPeriod: 'ThisFiscalPeriod',
    NextFiscalYear: 'NextFiscalYear',
    NextFiscalPeriod: 'NextFiscalPeriod',
    LastFiscalYear: 'LastFiscalYear',
    LastFiscalPeriod: 'LastFiscalPeriod',
    LastXFiscalYears: 'LastXFiscalYears',
    LastXFiscalPeriods: 'LastXFiscalPeriods',
    NextXFiscalYears: 'NextXFiscalYears',
    NextXFiscalPeriods: 'NextXFiscalPeriods',
    InFiscalYear: 'InFiscalYear',
    InFiscalPeriod: 'InFiscalPeriod',
    InFiscalPeriodAndYear: 'InFiscalPeriodAndYear',
    InOrBeforeFiscalPeriodAndYear: 'InOrBeforeFiscalPeriodAndYear',
    InOrAfterFiscalPeriodAndYear: 'InOrAfterFiscalPeriodAndYear',
    EqualUserTeams: 'EqualUserTeams'
};

Tribridge.CRMSDK.OperatorType.Equal = 'Equal';
Tribridge.CRMSDK.OperatorType.NotEqual = 'NotEqual';
Tribridge.CRMSDK.OperatorType.GreaterThan = 'GreaterThan';
Tribridge.CRMSDK.OperatorType.LessThan = 'LessThan';
Tribridge.CRMSDK.OperatorType.GreaterEqual = 'GreaterEqual';
Tribridge.CRMSDK.OperatorType.LessEqual = 'LessEqual';
Tribridge.CRMSDK.OperatorType.Like = 'Like';
Tribridge.CRMSDK.OperatorType.NotLike = 'NotLike';
Tribridge.CRMSDK.OperatorType.In = 'In';
Tribridge.CRMSDK.OperatorType.NotIn = 'NotIn';
Tribridge.CRMSDK.OperatorType.Between = 'Between';
Tribridge.CRMSDK.OperatorType.NotBetween = 'NotBetween';
Tribridge.CRMSDK.OperatorType.Null = 'Null';
Tribridge.CRMSDK.OperatorType.NotNull = 'NotNull';
Tribridge.CRMSDK.OperatorType.Yesterday = 'Yesterday';
Tribridge.CRMSDK.OperatorType.Today = 'Today';
Tribridge.CRMSDK.OperatorType.Tomorrow = 'Tomorrow';
Tribridge.CRMSDK.OperatorType.Last7Days = 'Last7Days';
Tribridge.CRMSDK.OperatorType.Next7Days = 'Next7Days';
Tribridge.CRMSDK.OperatorType.LastWeek = 'LastWeek';
Tribridge.CRMSDK.OperatorType.ThisWeek = 'ThisWeek';
Tribridge.CRMSDK.OperatorType.NextWeek = 'NextWeek';
Tribridge.CRMSDK.OperatorType.LastMonth = 'LastMonth';
Tribridge.CRMSDK.OperatorType.ThisMonth = 'ThisMonth';
Tribridge.CRMSDK.OperatorType.NextMonth = 'NextMonth';
Tribridge.CRMSDK.OperatorType.ThisWeek = 'ThisWeek';
Tribridge.CRMSDK.OperatorType.On = 'On';
Tribridge.CRMSDK.OperatorType.OnOrBefore = 'OnOrBefore';
Tribridge.CRMSDK.OperatorType.OnOrAfter = 'OnOrAfter';
Tribridge.CRMSDK.OperatorType.LastYear = 'LastYear';
Tribridge.CRMSDK.OperatorType.ThisYear = 'ThisYear';
Tribridge.CRMSDK.OperatorType.NextYear = 'NextYear';
Tribridge.CRMSDK.OperatorType.LastXHours = 'LastXHours';
Tribridge.CRMSDK.OperatorType.NextXHours = 'NextXHours';
Tribridge.CRMSDK.OperatorType.LastXDays = 'LastXDays';
Tribridge.CRMSDK.OperatorType.NextXDays = 'NextXDays';
Tribridge.CRMSDK.OperatorType.LastXWeeks = 'LastXWeeks';
Tribridge.CRMSDK.OperatorType.NextXWeeks = 'NextXWeeks';
Tribridge.CRMSDK.OperatorType.LastXMonths = 'LastXMonths';
Tribridge.CRMSDK.OperatorType.NextXMonths = 'NextXMonths';
Tribridge.CRMSDK.OperatorType.LastXYears = 'LastXYears';
Tribridge.CRMSDK.OperatorType.NextXYears = 'NextXYears';
Tribridge.CRMSDK.OperatorType.EqualUserId = 'EqualUserId';
Tribridge.CRMSDK.OperatorType.NotEqualUserId = 'NotEqualUserId';
Tribridge.CRMSDK.OperatorType.EqualBusinessId = 'EqualBusinessId';
Tribridge.CRMSDK.OperatorType.NotEqualBusinessId = 'NotEqualBusinessId';
Tribridge.CRMSDK.OperatorType.ChildOf = 'ChildOf';
Tribridge.CRMSDK.OperatorType.Mask = 'Mask';
Tribridge.CRMSDK.OperatorType.NotMask = 'NotMask';
Tribridge.CRMSDK.OperatorType.MasksSelect = 'MasksSelect';
Tribridge.CRMSDK.OperatorType.Contains = 'Contains';
Tribridge.CRMSDK.OperatorType.DoesNotContain = 'DoesNotContain';
Tribridge.CRMSDK.OperatorType.EqualUserLanguage = 'EqualUserLanguage';
Tribridge.CRMSDK.OperatorType.NotOn = 'NotOn';
Tribridge.CRMSDK.OperatorType.OlderThanXMonths = 'OlderThanXMonths';
Tribridge.CRMSDK.OperatorType.BeginsWith = 'BeginsWith';
Tribridge.CRMSDK.OperatorType.DoesNotBeginWith = 'DoesNotBeginWith';
Tribridge.CRMSDK.OperatorType.EndsWith = 'EndsWith';
Tribridge.CRMSDK.OperatorType.DoesNotEndWith = 'DoesNotEndWith';
Tribridge.CRMSDK.OperatorType.ThisFiscalYear = 'ThisFiscalYear';
Tribridge.CRMSDK.OperatorType.ThisFiscalPeriod = 'ThisFiscalPeriod';
Tribridge.CRMSDK.OperatorType.NextFiscalYear = 'NextFiscalYear';
Tribridge.CRMSDK.OperatorType.NextFiscalPeriod = 'NextFiscalPeriod';
Tribridge.CRMSDK.OperatorType.LastFiscalYear = 'LastFiscalYear';
Tribridge.CRMSDK.OperatorType.LastFiscalPeriod = 'LastFiscalPeriod';
Tribridge.CRMSDK.OperatorType.LastXFiscalYears = 'LastXFiscalYears';
Tribridge.CRMSDK.OperatorType.LastXFiscalPeriods = 'LastXFiscalPeriods';
Tribridge.CRMSDK.OperatorType.NextXFiscalYears = 'NextXFiscalYears';
Tribridge.CRMSDK.OperatorType.NextXFiscalPeriods = 'NextXFiscalPeriods';
Tribridge.CRMSDK.OperatorType.InFiscalYear = 'InFiscalYear';
Tribridge.CRMSDK.OperatorType.InFiscalPeriod = 'InFiscalPeriod';
Tribridge.CRMSDK.OperatorType.InFiscalPeriodAndYear = 'InFiscalPeriodAndYear';
Tribridge.CRMSDK.OperatorType.InOrBeforeFiscalPeriodAndYear = 'InOrBeforeFiscalPeriodAndYear';
Tribridge.CRMSDK.OperatorType.InOrAfterFiscalPeriodAndYear = 'InOrAfterFiscalPeriodAndYear';
Tribridge.CRMSDK.OperatorType.EqualUserTeams = 'EqualUserTeams';

Tribridge.CRMSDK.OperatorType.__enum = true;
Tribridge.CRMSDK.OperatorType.__flags = true;

// #################################### Helpers #####################################

/**
 * @desc Create a key value pair.
 *
 * @param key - The unique key.
 * @param value - The value.
 * @param type - The Tribridge.CRMSDK.AttributeType.
 *
 * @required key, value, type
 */
Tribridge.CRMSDK.KeyValue = function (key, value, type, entity) {
    return { Key: key, Value: value, Type: type, EntityName: entity };
};

/**
 * @desc Create a key value pair.
 *
 * @param logicalName - The logical attribute name.
 * @param operator - The Tribridge.CRMSDK.OperatorType.
 * @param valuesArr - The values array.
 * @param type - The Tribridge.CRMSDK.AttributeType.
 *
 * @required key, value, type
 */
Tribridge.CRMSDK.Criteria = function (logicalName, operator, valuesArr, type) {

    return { LogicalName: logicalName, Operator: operator, Values: valuesArr, Type: type };
};

/**
 * @desc Create a key value pair.
 *
 * @param criterias - The criterias (Tribridge.CRMSDK.Criteria).
 * @param operator - The operator (Tribridge.CRMSDK.JoinOperator).
 * @param columnSet - The columnset as string array.
 * @param fromAttributeName - From attribute name.
 * @param toAttributeName - To attribute name.
 * @param toEntityName - To Entity name.
 *
 * @required operator, columnSet, fromAttributeName, toAttributeName, toEntityName
 */
Tribridge.CRMSDK.LinkedEntity = function (criterias, columnSet, operator, fromAttributeName, toAttributeName, toEntityName) {

    return { LinkCriteria: criterias, Operator: operator, ColumnSet: columnSet, LinkFromAttributeName: fromAttributeName, LinkToAttributeName: toAttributeName, LinkToEntityName: toEntityName };
};

/**
 * @desc Returns the crm service url.
 *
 */
Tribridge.CRMSDK.GetServerUrl = function () {

    var OrgServicePath = "/XRMServices/2011/Organization.svc/web";

    var pathArray = window.location.pathname.split('/');
    //var serverUrl = window.location.protocol + "//" + window.location.host + "/" + pathArray[1];
    var serverUrl = window.location.protocol + "//" + window.location.host;

    if (typeof Xrm != 'undefined') {
        if (typeof Xrm.Page.context == "object") {
            if (typeof Xrm.Page.context.getClientUrl != 'undefined') {
                serverUrl = Xrm.Page.context.getClientUrl();
            } else if (typeof Xrm.Page.context.getServerUrl != 'undefined') {
                serverUrl = Xrm.Page.context.getServerUrl();
            } else {
                serverUrl = document.location.protocol + "//" + document.location.host + "/" + Xrm.Page.context.getOrgUniqueName();
            }
        }
        else { throw new Error("Unable to access the server URL"); }
    }

    if (serverUrl.match(/\/$/)) {
        serverUrl = serverUrl.substring(0, serverUrl.length - 1);
    }
    return serverUrl + OrgServicePath;
};


