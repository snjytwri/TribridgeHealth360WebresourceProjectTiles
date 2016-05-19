if (typeof Tribridge == "undefined")
    Tribridge = {};
if (typeof Tribridge.Helper == "undefined")
    Tribridge.Helper = {};
if (typeof Tribridge.Helper.CB == "undefined")
    Tribridge.Helper.CB = {};
if (typeof Tribridge.Helper.Exceptions == "undefined")
    Tribridge.Helper.Exceptions = {};


/**
 * @desc Parses a string date
 * @return A date object
 */
Tribridge.Helper.ParseDate = function (strDate, format) {

    var values, formatParts;
    if (format.indexOf("/") > -1) {
        values = strDate.split('/');
        formatParts = format.split('/');
    } else if (format.indexOf("-") > -1) {
        values = strDate.split('-');
        formatParts = format.split('-');
    } else if (format.indexOf(".") > -1) {
        values = strDate.split('.');
        formatParts = format.split('.');
    } else {
        throw new Tribridge.Helper.Exceptions.DateFormatException(format);
    }

    var month, year, day, hour, minute, second, msecond;
    hour = 0;
    minute = 0;
    second = 0;
    msecond = 0;

    for (var x = 0; x < formatParts.length; x++) {

        if (formatParts[x].indexOf(' ') >= 0) {
            formatParts[x].trim();
        }

        switch (formatParts[x]) {
            case 'yyyy': year = values[x];
                break;
            case 'MM': month = values[x];
                break;
            case 'dd': day = values[x];
                break;
            case 'hh': hour = values[x];
                break;
            case 'mm': minute = values[x];
                break;
            case 'ss': second = values[x];
                break;
            case 'ms': msecond = values[x];
                break;
        }
    }

    return new Date(year, month - 1, day, hour, minute, second, msecond);
}

Tribridge.Helper.DateToString = function (date, format) {

    format = format.replace('yyyy', date.getFullYear());
    format = format.replace('MM', (date.getMonth() + 1 > 9) ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1));
    format = format.replace('dd', date.getDate() > 9 ? date.getDate() : '0' + date.getDate());
    format = format.replace('hh', date.getHours() > 9 ? date.getHours() : '0' + date.getHours());
    format = format.replace('mm', date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());
    format = format.replace('ss', date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds());
    format = format.replace('ms', date.getMilliseconds() > 9 ? date.getMilliseconds() : '0' + date.getMilliseconds());

    return format;
}

/*
* Get the crm service url.
*/
Tribridge.Helper.GetServiceUrl = function () {

    var OrgServicePath = "/XRMServices/2011/Organization.svc/web";

    return Tribridge.Helper.GetServerUrl() + OrgServicePath;
}

/*
* Get the odata crm service url.
*/
Tribridge.Helper.GetODataServiceUrl = function () {

    var OrgServicePath = "/xrmservices/2011/OrganizationData.svc";

    return Tribridge.Helper.GetServerUrl() + OrgServicePath;
}


/*
* Get the crm service url.
*/
Tribridge.Helper.GetServerUrl = function () {

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

    return serverUrl;
}


/*
* Escapes the html string 
*/
Tribridge.Helper.EscapeHtml = function (html) {

    return html.replace(/[&<>"']/g, Tribridge.Helper.ReplaceTag);
}

/*
* Escapes quotes of the string 
*/
Tribridge.Helper.EscapeQuotes = function (text) {

    return text.replace(/["']/g, Tribridge.Helper.ReplaceTag);
}

Tribridge.Helper.ReplaceTag = function (tag) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": "&#39;",
        "/": "&#x2F"
    };

    return entityMap[tag] || tag;
}

Tribridge.Helper.ParseXml = function (xmlStr) {
    var xmlDoc;
    // Parse XML

    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(xmlStr);

    return xmlDoc;
}

Tribridge.Helper.FetchXmlToOdata = function (fetchXml, arrTypes, arrSchemaNames) {

    var odataUrl = '';
    // Get conditions as filter
    odataUrl += Tribridge.Helper.FetchXmlHeaderToOdata(fetchXml, arrTypes, arrSchemaNames);

    // Convert columnset
    var columns = Tribridge.Helper.FetchXmlColumnSetToOdata(fetchXml, arrTypes, arrSchemaNames);

    if (columns != null && columns != '') {
        odataUrl += '?$select=' + columns;
    }

    // Get conditions as filter
    var filters = Tribridge.Helper.FetchXmlConditionsToOdata(fetchXml, arrTypes, arrSchemaNames);

    if (filters != null && filters != '') {
        if (columns != null && columns != '') {
            odataUrl += '&$filter=' + filters;
        } else {
            odataUrl += '?$filter=' + filters;
        }
    }

    // TODO Link entity... not that easy, missing informations ;/
    return odataUrl;
}


Tribridge.Helper.FetchXmlHeaderToOdata = function (fetchXml, arrTypes, arrSchemaNames) {

    var entityNode = fetchXml.getElementsByTagName('entity')[0];
    var attributesNode = entityNode.getElementsByTagName('attribute');

    var name = arrSchemaNames[Tribridge.Helper.GetTextPropertyXML(entityNode.attributes.getNamedItem('name'))] + 'Set';;
    if ( typeof name == 'undefined'){
        name = Tribridge.Helper.GetTextPropertyXML(entityNode.attributes.getNamedItem('name')) + 'Set';
    }

    return Tribridge.Helper.GetODataServiceUrl() + "/" + name;
}

Tribridge.Helper.FetchXmlColumnSetToOdata = function (fetchXml, arrTypes, arrSchemaNames) {

    var entityNode = fetchXml.getElementsByTagName('entity')[0];
    var attributesNode = entityNode.getElementsByTagName('attribute');
    var odataUrl = '';
    var name = "";
    if (attributesNode != null && attributesNode.length > 0) {

        for (var x = 0; x < attributesNode.length; x++) {
            name = Tribridge.Helper.GetTextPropertyXML(attributesNode[x].attributes.getNamedItem('name'));
            if (arrSchemaNames[name] != undefined) {
                odataUrl += arrSchemaNames[name];

                if (x < attributesNode.length - 1)
                    odataUrl += ",";
            }
        }
    }

    return odataUrl;
}

Tribridge.Helper.FetchXmlConditionsToOdata = function (fetchXml, arrTypes, arrSchemaNames) {

    var entityNode = fetchXml.getElementsByTagName('entity')[0];
    var filtersNode = entityNode.getElementsByTagName('filter');
    var odataUrl = '';

    // Convert conditions
    if (filtersNode != null && filtersNode.length > 0) {
        var conditions = filtersNode[0].getElementsByTagName('condition');
        if (conditions != null && conditions.length > 0) {

            for (var y = 0; y < conditions.length; y++) {
                var logical = Tribridge.Helper.GetTextPropertyXML(conditions[y].attributes.getNamedItem('attribute'));
                var name = arrSchemaNames[logical];
                var op = Tribridge.Helper.GetTextPropertyXML(conditions[y].attributes.getNamedItem('operator'));

                switch (op) {
                    case 'in':
                        var inChildren = conditions[y].childNodes;
                        odataUrl += "(";
                        for (var l = 0; l < inChildren.length; l++) {
                            odataUrl += Tribridge.Helper.GetFilterLine(name, Tribridge.Helper.GetTextPropertyXML(inChildren[l]), arrTypes[logical], 'eq');
                            if (l < inChildren.length - 1)
                                odataUrl += " or ";
                        }
                        odataUrl += ")";
                        break;
                    case 'not-in':
                        var inChildren = conditions[y].childNodes;
                        odataUrl += "(";
                        for (var l = 0; l < inChildren.length; l++) {
                            odataUrl += Tribridge.Helper.GetFilterLine(name, Tribridge.Helper.GetTextPropertyXML(inChildren[l]), arrTypes[logical], 'ne');
                            if (l < inChildren.length - 1)
                                odataUrl += " and ";
                        }
                        odataUrl += ")";
                        break;
                    case 'not-null':
                        odataUrl += Tribridge.Helper.GetFilterLine(name, 'null', arrTypes[logical], 'ne');
                        break;
                    case 'null':
                        odataUrl += Tribridge.Helper.GetFilterLine(name, 'null', arrTypes[logical], 'eq');
                        break;
                    case 'eq-userid':
                        odataUrl += Tribridge.Helper.GetFilterLine(name, Xrm.Page.context.getUserId(), arrTypes[logical], 'eq');
                        break;
                    case 'like':
                        var val = Tribridge.Helper.GetTextPropertyXML(conditions[y].attributes.getNamedItem('value'));
                        var attributePart = Tribridge.Helper.ConvertAttributeForFilter(name, arrTypes[logical]);
                        var valuePart = Tribridge.Helper.ConvertValueForFilter(val, arrTypes[logical]);

                        odataUrl += 'substringof('+valuePart+','+attributePart+')';
                        break;
                    default:
                        var val = Tribridge.Helper.GetTextPropertyXML(conditions[y].attributes.getNamedItem('value'));
                        odataUrl += Tribridge.Helper.GetFilterLine(name, val, arrTypes[logical], op);
                        break;
                }

                if (y < conditions.length - 1)
                    odataUrl += " " + Tribridge.Helper.GetTextPropertyXML(filtersNode[0].attributes.getNamedItem('type')) + " ";
            }


        }
    }
    return odataUrl;
}

Tribridge.Helper.GetFilterLine = function (attribute, value, type, condition, special) {
    var attributePart  = Tribridge.Helper.ConvertAttributeForFilter(attribute, type);
    var valuePart = Tribridge.Helper.ConvertValueForFilter(value, type);

    return attributePart + " " + condition + " " + valuePart;
}

Tribridge.Helper.ConvertAttributeForFilter = function (attribute, type) {

    var attSuffix = "";

    switch (type) {
        case 'Guid':
            valuePrefix = "guid'";
            valueSuffix = "'";
            break;
        case 'Lookup':
        case 'Owner':
        case 'Uniqueidentifier':
            attSuffix = "/Id";
            valuePrefix = "guid'";
            valueSuffix = "'";
            break;
        case 'Picklist':
        case 'State':
            attSuffix = "/Value";
            break;
        case 'Boolean':
            break;
        case 'Integer':
        case 'Decimal':
        case 'BigInt':
            break;
        case 'DateTime':
            break;
        default: //String,Memo
            break;
    }

    return attribute + attSuffix;
}

Tribridge.Helper.ConvertValueForFilter = function (value, type) {

    var valuePrefix = "";
    var valueSuffix = "";

    switch (type) {
        case 'Guid':
            valuePrefix = "guid'";
            valueSuffix = "'";
            break;
        case 'Lookup':
        case 'Owner':
        case 'Uniqueidentifier':
            valuePrefix = "guid'";
            valueSuffix = "'";
            break;
        case 'Picklist':
        case 'State':
            break;
        case 'Boolean':
            if (!isNaN(value) && parseInt(Number(value)) == value) {
                value = value > 0 ? true : false;
            }
            break;
        case 'Integer':
        case 'Decimal':
        case 'BigInt':
            break;
        case 'DateTime':
            valuePrefix = "datetime'";
            valueSuffix = "'";
            break;
        default: //String,Memo
            valuePrefix = "'";
            valueSuffix = "'";
            break;
    }

    return valuePrefix + value + valueSuffix;
}

Tribridge.Helper.GetDateFromOdata = function (odataDate) {
    odataDate = odataDate.replace("/Date(", '');
    odataDate = odataDate.replace(")/", '');
    var mEpoch = parseInt(odataDate);
    if (mEpoch < 1000000000) mEpoch *= 1000;

    var date = new Date();
    date.setTime(mEpoch);

    return date;
}

Tribridge.Helper.GetTextPropertyXML = function (node) {
    if (typeof node == 'undefined' || node == null)
        return '';

    if (typeof node.text != 'undefined')
        return node.text;
    if (typeof node.textContent != 'undefined')
        return node.textContent;

    return '';
}

//############################################################## EXCEPTIONS

/**
 * @desc Date format exception.
 */
Tribridge.Helper.Exceptions.DateFormatException = function (value)
{
    this.value = value;
    this.message = "The date format is not valid.";
    this.toString = function () {
        return this.value + this.message
    };
}