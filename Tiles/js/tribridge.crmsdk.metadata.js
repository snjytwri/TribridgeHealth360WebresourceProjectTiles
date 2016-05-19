if (typeof Tribridge == "undefined")
    Tribridge = {};
if (typeof Tribridge.CRMSDK == "undefined")
    Tribridge.CRMSDK = {};



Tribridge.CRMSDK.METADATA = {};
Tribridge.CRMSDK.METADATA.Private = {};
Tribridge.CRMSDK.METADATA.EntityFilters = {};


/**
 * @desc Retrieves the metadata for an attribute
 *
 * @param entityName - The unique key.
 * @param attributeName - The value.
 * @param metadataId - The metadata id (If no attributename/entityname provided)
 * @param asIfPublished - Defines if the attribute metadata should be published.
 * @param successCallBack - The success callback function.
 * @param errorCallBack - The error callback function.
 * @param passthrough - The passthrough object.
 *
 * @required entityName,attributeName,asIfPublished,successCallBack
 */
Tribridge.CRMSDK.METADATA.RetrieveAttribute = function (entityName, attributeName, metadataId, asIfPublished, successCallBack, errorCallBack, passthrough) {
    
    var entityLogicalNameValueNode;

    if (Tribridge.CRMSDK.METADATA.IsNullOrEmpty(entityName))
        entityLogicalNameValueNode = '<b:value i:nil="true" />';
    else
        entityLogicalNameValueNode = '<b:value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">' + entityName.toLowerCase() + '</b:value>';

    var logicalNameValueNode;
    if (Tribridge.CRMSDK.METADATA.IsNullOrEmpty(attributeName))
        logicalNameValueNode = '<b:value i:nil="true" />';    
    else
        logicalNameValueNode = '<b:value i:type="c:string"   xmlns:c="http://www.w3.org/2001/XMLSchema">' + attributeName.toLowerCase() + '</b:value>';

    if (Tribridge.CRMSDK.METADATA.IsNullOrEmpty(metadataId))
        metadataId = "00000000-0000-0000-0000-000000000000";

    var request = [
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">',
         '<soapenv:Body>',
          '<Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">',
           '<request i:type="a:RetrieveAttributeRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">',
            '<a:Parameters xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">',
             '<a:KeyValuePairOfstringanyType>',
              '<b:key>EntityLogicalName</b:key>',
               entityLogicalNameValueNode,
             '</a:KeyValuePairOfstringanyType>',
             '<a:KeyValuePairOfstringanyType>',
              '<b:key>MetadataId</b:key>',
              '<b:value i:type="ser:guid"  xmlns:ser="http://schemas.microsoft.com/2003/10/Serialization/">' + metadataId + '</b:value>',
             '</a:KeyValuePairOfstringanyType>',
              '<a:KeyValuePairOfstringanyType>',
              '<b:key>RetrieveAsIfPublished</b:key>',
            '<b:value i:type="c:boolean" xmlns:c="http://www.w3.org/2001/XMLSchema">' + asIfPublished.toString() + '</b:value>',
             '</a:KeyValuePairOfstringanyType>',
             '<a:KeyValuePairOfstringanyType>',
              '<b:key>LogicalName</b:key>',
               logicalNameValueNode,
             '</a:KeyValuePairOfstringanyType>',
            '</a:Parameters>',
            '<a:RequestId i:nil="true" />',
            '<a:RequestName>RetrieveAttribute</a:RequestName>',
           '</request>',
          '</Execute>',
         '</soapenv:Body>',
        '</soapenv:Envelope>'].join('');


    var req = new XMLHttpRequest();
    req.open("POST", Tribridge.CRMSDK.METADATA.GetServerUrl(), (successCallBack != null));
    try { req.responseType = 'msxml-document' } catch (e) { }
    req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
    if (successCallBack != null) {
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                req.onreadystatechange = null; //Addresses potential memory leak issue with IE
                if (req.status == 200) {
                    //Success
                    var docText = req.responseText;
                    var docXml = req.responseXML;
                    // Set namespaces
                    try {
                        docXml.setProperty("SelectionNamespaces", Tribridge.CRMSDK.METADATA.Private.GetSelectionNamespaces().join(" "));
                    } catch (e) {
                        // DO NOTHING 
                    }

                    successCallBack(Tribridge.CRMSDK.METADATA.SoapParseAttributeResponse(docXml), passthrough);
                }
                else {
                    if (!Tribridge.CRMSDK.METADATA.IsNullOrEmpty(errorCallBack))
                        errorCallBack(req, passthrough);
                }
            }
        };
        req.send(request);
    } else {
        req.send(request);
        //Success
        var docText = req.responseText;
        var docXml = req.responseXML;
        return Tribridge.CRMSDK.METADATA.SoapParseAttributeResponse(docXml);
    }
    
};

Tribridge.CRMSDK.METADATA.RetrieveEntity = function (entityName, entityFilter, metadataId, asIfPublished, successCallBack, errorCallBack, passthrough) {
  
    if (entityName == null && metadataId == null) {
        throw new Error("SDK.Metadata.RetrieveEntity requires either the LogicalName or MetadataId parameter not be null.");
    }

    if (entityName != null) {
        if (typeof entityName != "string")
        {
            throw new Error("SDK.Metadata.RetrieveEntity LogicalName must be a string value.");
        }
        metadataId = "00000000-0000-0000-0000-000000000000";
    }

    if (metadataId != null && entityName == null) {
        if (typeof metadataId != "string")
        {
            throw new Error("SDK.Metadata.RetrieveEntity MetadataId must be a string value.");
        }
    }

    var entityLogicalNameValueNode = "";
    if (entityName == null)
    {
        entityLogicalNameValueNode = "<b:value i:nil=\"true\" />";
    }
    else
    {
        entityLogicalNameValueNode = "<b:value i:type=\"c:string\"   xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + entityName.toLowerCase() + "</b:value>";
    }

    var request = [
    "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">",
     "<soapenv:Body>",
      "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
       "<request i:type=\"a:RetrieveEntityRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
        "<a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
         "<a:KeyValuePairOfstringanyType>",
          "<b:key>EntityFilters</b:key>",
          "<b:value i:type=\"c:EntityFilters\" xmlns:c=\"http://schemas.microsoft.com/xrm/2011/Metadata\">" + entityFilter + "</b:value>",
         "</a:KeyValuePairOfstringanyType>",
         "<a:KeyValuePairOfstringanyType>",
          "<b:key>MetadataId</b:key>",
          "<b:value i:type=\"ser:guid\"  xmlns:ser=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + metadataId + "</b:value>",
         "</a:KeyValuePairOfstringanyType>",
         "<a:KeyValuePairOfstringanyType>",
          "<b:key>RetrieveAsIfPublished</b:key>",
          "<b:value i:type=\"c:boolean\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + asIfPublished.toString() + "</b:value>",
         "</a:KeyValuePairOfstringanyType>",
         "<a:KeyValuePairOfstringanyType>",
          "<b:key>LogicalName</b:key>",
           entityLogicalNameValueNode,
         "</a:KeyValuePairOfstringanyType>",
        "</a:Parameters>",
        "<a:RequestId i:nil=\"true\" />",
        "<a:RequestName>RetrieveEntity</a:RequestName>",
       "</request>",
      "</Execute>",
     "</soapenv:Body>",
    "</soapenv:Envelope>"].join("");

    var req = new XMLHttpRequest();
    req.open("POST", Tribridge.CRMSDK.METADATA.GetServerUrl(), (successCallBack != null));
    try { req.responseType = 'msxml-document' } catch (e) { }
    req.setRequestHeader("Accept", "application/xml, text/xml, */*");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
    
    if (successCallBack != null) {
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                req.onreadystatechange = null; //Addresses potential memory leak issue with IE
                if (req.status == 200) {
                    //Success
                    var docText = req.responseText;
                    var docXml = req.responseXML;
                    // Set namespaces
                    try {
                        docXml.setProperty("SelectionNamespaces", Tribridge.CRMSDK.METADATA.Private.GetSelectionNamespaces().join(" "));
                    } catch (e) {
                        // DO NOTHING 
                    }

                    switch (entityFilter) {
                        case Tribridge.CRMSDK.METADATA.EntityFilters.Attributes:
                            successCallBack(Tribridge.CRMSDK.METADATA.SoapParseAttributeResponse(docXml), passthrough);
                            break;
                        default:
                            successCallBack(Tribridge.CRMSDK.METADATA.SoapParseAttributeResponse(docXml), passthrough);
                            break;
                    }
                }
                else {
                    if (!Tribridge.CRMSDK.METADATA.IsNullOrEmpty(errorCallBack))
                        errorCallBack(req, passthrough);
                }
            }
        };
        req.send(request);
    } else {
        req.send(request);
        //Success
        var docText = req.responseText;
        var docXml = req.responseXML;
        // Set namespaces
        try {
            docXml.setProperty("SelectionNamespaces", Tribridge.CRMSDK.METADATA.Private.GetSelectionNamespaces().join(" "));
        } catch (e) {
            // DO NOTHING 
        }

        switch (entityFilter) {
            case Tribridge.CRMSDK.METADATA.EntityFilters.Attributes:
                return Tribridge.CRMSDK.METADATA.SoapParseAttributeResponse(docXml);
            default:
                return Tribridge.CRMSDK.METADATA.SoapParseAttributeResponse(docXml);
        }
    }

};

Tribridge.CRMSDK.METADATA.SoapParseAttributeResponse = function(responseXML){

    var rootNode = responseXML.getElementsByTagName('a:Results');
    var schemaname = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(rootNode[0].getElementsByTagName('c:SchemaName')[0]);
    var objectcode = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(rootNode[0].getElementsByTagName('c:ObjectTypeCode')[0]);
    var logical = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(rootNode[0].getElementsByTagName('c:LogicalName')[0]);

    var primaryIdAttribute = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(rootNode[0].getElementsByTagName('c:PrimaryIdAttribute')[0]);
    var primaryNameAttribute = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(rootNode[0].getElementsByTagName('c:PrimaryNameAttribute')[0]);

    var retCollection = [];
    if (!Tribridge.CRMSDK.METADATA.IsNullOrEmpty(rootNode)) {
        var logicals = rootNode[0].getElementsByTagName('c:AttributeMetadata');
        for (var x = 0; x < logicals.length; x++) {
            var attType = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:AttributeType')[0]);
            var attLabel = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:DisplayName')[0].getElementsByTagName('a:Label')[0]);
            var entity = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:EntityLogicalName')[0]);
            var att = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:LogicalName')[0]);
            var schema = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:SchemaName')[0]);
            var options = logicals[x].getElementsByTagName('c:OptionMetadata');
            
            var attOf = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:AttributeOf')[0]);
            var display = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:DisplayName')[0]);
            var link = Tribridge.CRMSDK.METADATA.GetTextPropertyXML(logicals[x].getElementsByTagName('c:LinkedAttributeId')[0]);
            var targets = logicals[x].getElementsByTagName('c:Targets');

            var retObj = {
                AttributeType: attType,
                AttributeName: attLabel,
                AttributeOf: attOf,
                DisplayName: display,
                LinkedAttributeId: link,
                AttributeLogicalName: att,
                EntityLogicalName: entity,
                SchemaName: schema
            };

            if (targets != null && targets.length > 0) {
                var targetList = [];
                var targetEntities = targets[0].getElementsByTagName('d:string');
                if (targetEntities != null) {
                    for (var i = 0; i < targetEntities.length; i++) {
                        var target = targetEntities[i];

                        targetList.push({
                            Entity: Tribridge.CRMSDK.METADATA.GetTextPropertyXML(target)
                        });
                    }
                }
                retObj['Targets'] = targetList;
            }

            if (options != null) {
                var optionList = [];
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];

                    optionList.push({
                        Label: Tribridge.CRMSDK.METADATA.GetTextPropertyXML(option.getElementsByTagName('a:Label')[0]),
                        Value: Tribridge.CRMSDK.METADATA.GetTextPropertyXML(option.getElementsByTagName('c:Value')[0])
                    });
                }
                retObj['Options'] = optionList;
            }
       
            if (logicals.length == 1) {
                return { Name: logical, SchemaName: schemaname, ObjectCode: objectcode, PrimaryAttribute: primaryNameAttribute, PrimaryIdAttribute: primaryIdAttribute, Attributes: [retObj] };
            }
            retCollection[retObj.AttributeLogicalName] = retObj;
        }
        return { Name: logical, SchemaName: schemaname, ObjectCode: objectcode, PrimaryAttribute: primaryNameAttribute, PrimaryIdAttribute: primaryIdAttribute, Attributes: retCollection };
    }
    
}

Tribridge.CRMSDK.METADATA.SoapParseResponse = function (responseXML) {

  


}

// #################################### Helpers #####################################

/**
 * @desc Get the text content from a xml node.
 *
 * @param node - The xml node.
 *
 * @required node
 * @return The string.
 */
Tribridge.CRMSDK.METADATA.GetTextPropertyXML = function (node) {
    if (typeof node == 'undefined' || node == null)
        return '';

    if (typeof node.text != 'undefined')
        return node.text;
    if (typeof node.textContent != 'undefined')
        return node.textContent;

    return '';
}

/**
 * @desc Checks if the object is filled or not.
 *
 * @param obj - The object to check if is null or empty.
 *
 * @required obj
 */
Tribridge.CRMSDK.METADATA.IsNullOrEmpty = function (obj) {
    if (typeof obj == 'undefined' || obj == null )
        return true;

    if (typeof obj == 'object' && obj.length < 1)
        return true;

    return false;
}


/**
 * @desc Returns the crm meta url.
 *
 */
Tribridge.CRMSDK.METADATA.GetServerUrl = function () {

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
}

// #################################### Private Methods #####################################

Tribridge.CRMSDK.METADATA.Private.GetSelectionNamespaces = function () {
    var namespaces = [
    "xmlns:s='http://schemas.xmlsoap.o}rg/soap/envelope/'",
    "xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'",
    "xmlns:i='http://www.w3.org/2001/XMLSchema-instance'",
    "xmlns:b='http://schemas.datacontract.org/2004/07/System.Collections.Generic'",
    "xmlns:c='http://schemas.microsoft.com/xrm/2011/Metadata'"];
    return namespaces;
}

Tribridge.CRMSDK.METADATA.EntityFilters.prototype = {
    Default: 'Entity',
    Entity: 'Entity',
    Attributes: 'Attributes',
    Privileges: 'Privileges',
    Relationships: 'Relationships',
    All: 'All'
};

Tribridge.CRMSDK.METADATA.EntityFilters.Default = 'Entity';
Tribridge.CRMSDK.METADATA.EntityFilters.Entity = 'Entity';
Tribridge.CRMSDK.METADATA.EntityFilters.Attributes = 'Attributes';
Tribridge.CRMSDK.METADATA.EntityFilters.Privileges = 'Privileges';
Tribridge.CRMSDK.METADATA.EntityFilters.Relationships = 'Relationships';
Tribridge.CRMSDK.METADATA.EntityFilters.All = 'All';
Tribridge.CRMSDK.METADATA.EntityFilters.__enum = true;
Tribridge.CRMSDK.METADATA.EntityFilters.__flags = true;