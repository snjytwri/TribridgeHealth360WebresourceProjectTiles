if (typeof Tribridge == "undefined")
    Tribridge = {};
if (typeof Tribridge.OData == "undefined")
    Tribridge.OData = {};

/**
 * KENDO UI VIEW EDITOR ODATA
 * FOR CRM 2011 & CRM 2013
 * 
 * @author: Angelo Ortega 
 * @version: 
 * - 1.0 (25/08/2014, Angelo Ortega)
 *  + GetSavedQuery
 *  + GetUserQuery
 * - 1.1 (11/12/2014, Leopoldo Moranchel)
 *  Updated Tribridge.OData.Private.ParseView to improve loading time
 */

// Namespaces
Tribridge.OData = {}; // Namespace, default
Tribridge.OData.Private = {}; // Namespace for private methods

/**
 * @desc Gets the view metadata (SavedQuery, UserQuery)
 *
 * @param entity - The entity type code.
 * @param viewname - The view name.
 * 
 * @required entityname, viewname
 */
Tribridge.OData.GetQueryView = function (entity, viewname, successCallback, errorCallback, passthrough) {
    Tribridge.OData.Private.GetSavedQuery(entity, viewname, successCallback, errorCallback, passthrough);
};


// ################################################ PRIVATE METHODS

/**
 * @desc Gets the view metadata (SavedQuery, UserQuery)
 *
 * @param entity - The entity type code.
 * @param viewname - The view name.
 * 
 * @required entityname, viewname
 */
Tribridge.OData.Private.GetSavedQuery = function (entity, viewname, successCallback, errorCallback, passthrough) {
    var request = Tribridge.OData.Private.GetServerUrl() + "SavedQuerySet?$select=SavedQueryId,FetchXml,LayoutXml&$top=1&$filter=Name eq '" + viewname + "' and ReturnedTypeCode eq '" + entity + "' and LayoutXml ne null";
    Tribridge.OData.Private.Call(request, Tribridge.OData.Private.GetUserQuery, errorCallback, { entity: entity, viewname: viewname, successCallback: successCallback, errorCallback: errorCallback, passthrough: passthrough });
};
Tribridge.OData.Private.GetUserQuery = function (data, passthrough) {
    var request = Tribridge.OData.Private.GetServerUrl() + "UserQuerySet?$select=UserQueryId,FetchXml,LayoutXml&$top=1&$filter=Name eq '" + passthrough.viewname + "' and ReturnedTypeCode eq '" + passthrough.entity + "' and LayoutXml ne null";
    var newPassthrough = {};
    newPassthrough['passthrough1'] = passthrough;
    newPassthrough['passthrough2'] = data; // Add data
    Tribridge.OData.Private.Call(request, Tribridge.OData.Private.ParseView, passthrough.errorCallback, newPassthrough);
};

Tribridge.OData.Private.ParseView = function (data, passthrough) {

    // Check first if a standard view is present.
    var userQueryViews = data;
    var savedQueryViews = passthrough.passthrough2;
    var pass = passthrough.passthrough1;

    var results = [];
    var entityInfo = null;
    var obj = null;

    if (savedQueryViews != null && savedQueryViews.d.results.length > 0) {
        obj = {
            FetchXml: savedQueryViews.d.results[0].FetchXml,
            LayoutXml: savedQueryViews.d.results[0].LayoutXml,
            Odata: null,
            Schema: null,
            Id: savedQueryViews.d.results[0].UserQueryId
        };

    } else if (userQueryViews != null && userQueryViews.d.results.length > 0) {
        obj = {
            FetchXml: userQueryViews.d.results[0].FetchXml,
            LayoutXml: userQueryViews.d.results[0].LayoutXml,
            Odata: null,
            Schema: null,
            Id: userQueryViews.d.results[0].UserQueryId
        };
    }

    var xmlDoc = Tribridge.Helper.ParseXml(obj.FetchXml);
    // Get metadata for further processing
    if (xmlDoc != null && xmlDoc.getElementsByTagName('entity') != null) {
        var entityNode = xmlDoc.getElementsByTagName('entity')[0];
        entityInfo = Tribridge.CRMSDK.METADATA.RetrieveEntity(entityNode.attributes.getNamedItem('name').text, Tribridge.CRMSDK.METADATA.EntityFilters.Entity, null, true, null, null, null);
        results = Tribridge.CRMSDK.METADATA.RetrieveEntity(entityNode.attributes.getNamedItem('name').text, Tribridge.CRMSDK.METADATA.EntityFilters.Attributes, null, true, null, null, null);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //pass.successCallback(obj, pass.passthrough);
    //Tribridge.Protocols.CB.ParseViewMetadata = function (data, passthrough) {
    var viewInfo = Tribridge.Protocols.CustomViews[passthrough];

    debugger;
    var xml = $.parseXML(obj.LayoutXml);
    var cellEle = xml.getElementsByTagName('cell');

    var columns = [];
    $.each(cellEle, function (index, value) {
        columns.push(value.getAttribute('name'));
    });
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    // Parse the metadata results
    var types = [];
    var schemas = [];
    var optionsets = [];
    var lookupsets = [];
    if (results.Attributes != null) {
        for (var prop in results.Attributes) {
            types[results.Attributes[prop].AttributeLogicalName] = results.Attributes[prop].AttributeType;
            schemas[results.Attributes[prop].AttributeLogicalName] = results.Attributes[prop].SchemaName;
            schemas[entityInfo.Name] = entityInfo.SchemaName;

            if (columns.indexOf(prop) > -1) {
                //            if(true){
                if (results.Attributes[prop].hasOwnProperty("Options")) {
                    if (results.Attributes[prop].Options != null && results.Attributes[prop].Options.length > 0) {
                        optionsets[results.Attributes[prop].AttributeLogicalName] = results.Attributes[prop].Options;
                    }
                }

                if (results.Attributes[prop].hasOwnProperty("Targets")) {
                    if (results.Attributes[prop].Targets != null && results.Attributes[prop].Targets.length > 0) {
                        var objTargets = [];
                        for (var y = 0; y < results.Attributes[prop].Targets.length; y++) {
                            // Get entity metadata
                            var entityTarget = Tribridge.CRMSDK.METADATA.RetrieveEntity(results.Attributes[prop].Targets[y].Entity, Tribridge.CRMSDK.METADATA.EntityFilters.Entity, null, true, null, null, null);
                            var entityTargetAttributes = Tribridge.CRMSDK.METADATA.RetrieveEntity(results.Attributes[prop].Targets[y].Entity, Tribridge.CRMSDK.METADATA.EntityFilters.Attributes, null, true, null, null, null);
                            var primaryAtt = entityTarget.PrimaryAttribute;
                            var primaryIdAtt = entityTarget.PrimaryIdAttribute;
                            var entityName = results.Attributes[prop].Targets[y].Entity;

                            if (entityTargetAttributes.Attributes != null && entityTargetAttributes.Attributes.hasOwnProperty(primaryAtt)) {
                                primaryAtt = entityTargetAttributes.Attributes[primaryAtt].SchemaName;
                            }

                            if (entityTargetAttributes.Attributes != null && entityTargetAttributes.Attributes.hasOwnProperty(primaryIdAtt)) {
                                entityName = entityTargetAttributes.Attributes[primaryIdAtt].AttributeName;
                                primaryIdAtt = entityTargetAttributes.Attributes[primaryIdAtt].SchemaName;
                            }

                            objTargets.push({ Entity: results.Attributes[prop].Targets[y].Entity, EntityName: entityName, SchemaName: entityTarget.SchemaName, PrimaryAttributeSchema: primaryAtt, PrimaryIdAttributeSchema: primaryIdAtt });


                        }
                        lookupsets[results.Attributes[prop].AttributeLogicalName] = objTargets;
                    }
                }
            }
        }
    }
    obj.PrimaryIdAttributeSchema = entityInfo.PrimaryAttribute;
    obj.PrimaryAttributeSchema = entityInfo.PrimaryIdAttribute;
    obj.Schema = entityInfo.SchemaName;
    obj.Odata = Tribridge.OData.Private.RetrieveViewUrl(xmlDoc, types, schemas);
    obj.AttributeNames = schemas;
    obj.AttributeTypes = types;
    obj.OptionSets = optionsets;
    obj.Targets = lookupsets;
    pass.successCallback(obj, pass.passthrough);
};

Tribridge.OData.Private.RetrieveViewUrl = function (xmlDoc, arr, arrSchemas) {

    var odataString = Tribridge.Helper.FetchXmlHeaderToOdata(xmlDoc, arr, arrSchemas);
    var filter = Tribridge.Helper.FetchXmlConditionsToOdata(xmlDoc, arr, arrSchemas);
    var select = Tribridge.Helper.FetchXmlColumnSetToOdata(xmlDoc, arr, arrSchemas);

    return { ODataUrl: odataString, Select: select, Filter: filter };
}

/**
 * @desc Ajax ODATA Service Call.
 *
 * @param request - The request odata url.
 * @param successCallback - The success callback method.
 * @param errorCallback - The error callback method. 
 *
 * @required request, successCallback
 */
Tribridge.OData.Private.Call = function (request, successCallback, errorCallback, passthrough) {
    // Make Ajax Call
    var req = $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: request,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            successCallback(data, passthrough);
        },
        error: errorCallback != null ? errorCallback : Tribridge.OData.Private.Error
    });
};

/**
 * @desc The error default callback method.
 *
 * @param XmlHttpRequest - The request data.
 * @param textStatus - The status.
 * @param errorThrown - The error thrown. 
 *
 */
Tribridge.OData.Private.Error = function (XmlHttpRequest, textStatus, errorThrown) {

}

/**
 * @desc Returns the crm service url.
 */
Tribridge.OData.Private.GetServerUrl = function () {

    //return "http://devserver:5555/TribridgeDev/XRMServices/2011/OrganizationData.svc/";

    var OrgServicePath = "/XRMServices/2011/OrganizationData.svc/";
    var serverUrl = "";
    // Check if form call
    if (typeof Xrm != 'undefined') {
        if (typeof Xrm.Page.context == "object") {
            if (typeof Xrm.Page.context.getClientUrl == 'function') {
                serverUrl = Xrm.Page.context.getClientUrl();
            } else if (typeof Xrm.Page.context.getServerUrl == 'function') {
                serverUrl = Xrm.Page.context.getServerUrl();
            } else {
                var pathArray = window.location.pathname.split('/');
                //serverUrl = window.location.protocol + "//" + window.location.host + "/" + pathArray[1];
                serverUrl = window.location.protocol + "//" + window.location.host;
            }
        }
        else { throw new Error("Unable to access the server URL"); }
    } else {
        // Get orga
        var pathArray = window.location.pathname.split('/');
        //serverUrl = window.location.protocol + "//" + window.location.host + "/" + pathArray[1];
        serverUrl = window.location.protocol + "//" + window.location.host;
    }

    if (serverUrl.match(/\/$/)) {
        serverUrl = serverUrl.substring(0, serverUrl.length - 1);
    }

    return serverUrl + OrgServicePath;
};