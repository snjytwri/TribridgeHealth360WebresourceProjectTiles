if (typeof Tribridge == "undefined")
    Tribridge = {};
if (typeof Tribridge.OData == "undefined")
    Tribridge.OData = {};

/**
 * KENDO UI VIEW EDITOR CRUD Operations
 * FOR CRM 2011 & CRM 2013
 * 
 * @author: Leopoldo Moranchel
 * @version: 
 * - 1.0 (25/08/2014, Leopoldo Moranchel) 
 */

// Namespaces
if (typeof Tribridge.OData.Private == "undefined")
    Tribridge.OData.Private = {}; // Namespace for private methods
if (typeof Tribridge.OData.CB == "undefined")
    Tribridge.OData.CB = {}; // Namespace for CallBack methods



Tribridge.OData.Columns = "";



// Save method using OData calls
Tribridge.OData.Save = function (arg)
{
    //debugger;
    var kGrid = $("#grid").data("kendoGrid");
    kGrid.select($(arg.currentTarget).closest("tr"));
    var row = kGrid.dataItem(kGrid.select());
    var columns = Tribridge.ViewEditor.CustomViews[0].Columns;
    var contact = new Object();
    var isNew = true;
    var col = "";
    var primaryAttribute = Tribridge.ViewEditor.CustomViews[0].PrimaryAttribute;


    for (i = 0; i < columns.length; i++) {
        col = columns[i].Name;
        /*if (rowmodel[col] != "" && rowmodel[col] != undefined)
        {
            isNew = false;
        }*/
        contact[col] = row[col];
    }

    if (row[primaryAttribute] != undefined)
    {
        isNew = false;
    }

    if (isNew)
    {
        Tribridge.OData.CreateRecord(contact, Tribridge.OData.GetEntitySet(), Tribridge.OData.CB.createRecordCompleted, null);
    }
    else
    {
        contact[primaryAttribute] = row[primaryAttribute];
        Tribridge.OData.UpdateRecord(contact, Tribridge.OData.GetEntitySet(), Tribridge.OData.CB.updateRecordCompleted, null);
    }
};

// Method used to retrieve all of the OData emtity names
Tribridge.OData.GetEntitySet = function ()
{
    var entitySet = "";
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: parent.Tribridge.ViewEditor.GetServerUrl() + "/XRMServices/2011/OrganizationData.svc/",
        async: false,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            debugger;
            var entitySets = data.d.EntitySets;
            var setLength = entitySets.length;
            for (var i = 0; i < setLength; i++) {
                if (entitySets[i].toLowerCase() == parent.Tribridge.ViewEditor.Command.Entity + "set") {
                    entitySet = entitySets[i];
                    i = setLength;
                }
            }
        }
    });
    return entitySet;
};

// Delete the record
Tribridge.OData.Delete = function (arg)
{
    debugger;
    var kGrid = $("#grid").data("kendoGrid");
    var row = kGrid.dataItem(kGrid.select());
    var contact = new Object();
    var primaryAttribute = Tribridge.ViewEditor.CustomViews[0].PrimaryAttribute;

    contact[primaryAttribute] = row[primaryAttribute];

    Tribridge.OData.DeleteRecord(contact, Tribridge.ViewEditor.CustomViews[0].Schema + "Set");

};



/**
 * @desc Monitors changes in the grid
 * 
 * 
 */
Tribridge.OData.ChangeMonitor = function (arg) {
    var kGrid = $("#grid").data("kendoGrid");
    if (arg.action == "itemchange") {
        kGrid.showColumn(0);
    }
    if (arg.action == undefined) {
        kGrid.hideColumn(0);
    }
};


/**
 * @desc Creates a New Record
 *
 * @param entityObject - The Object containing the data for the new record. 
 * @param odataSetName - The name of the entity set.  
 * 
 * @required entityObject, odataSetName
 */
// This function creates record by making OData call
Tribridge.OData.CreateRecord = function (entityObject, odataSetName, successCallback, errorCallback) {
    var jsonEntity = JSON.stringify(entityObject);
    var ODataUrl = Tribridge.Helper.GetODataServiceUrl() + "/" + odataSetName;

    //Asynchronous AJAX function to Create a CRM record using OData
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: ODataUrl,
        data: jsonEntity,
        beforeSend: function (XMLHttpRequest) {
            //Specifying this header ensures that the results will be returned as JSON.
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },

        success: function (data, textStatus, XmlHttpRequest) {
            if (successCallback) {
                successCallback(data.d, textStatus, XmlHttpRequest);
            }
        },

        error: function (XmlHttpRequest, textStatus, errorThrown) {
            if (errorCallback)
                errorCallback(XmlHttpRequest, textStatus, errorThrown);
            else
                alert("Error on the creation of record; Error – " + errorThrown);
        }
    });

}

/**
 * @desc Updates an existing Record
 *
 * @param entityObject - The Object containing the data for the new record. 
 * @param odataSetName - The name of the entity set.  
 * 
 * @required entityObject, odataSetName
 */
// This function creates record by making OData call
Tribridge.OData.UpdateRecord = function (entityObject, odataSetName, successCallback, errorCallback)
{
    debugger;
    var jsonEntity = JSON.stringify(entityObject);
    var ODataUrl = Tribridge.Helper.GetODataServiceUrl() + "/" + odataSetName;
    var primaryAttribute = Tribridge.ViewEditor.CustomViews[0].PrimaryAttribute;

    //Asynchronous AJAX function to Create a CRM record using OData
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: ODataUrl + "(guid'" + entityObject[primaryAttribute] + "')",
        data: jsonEntity,
        beforeSend: function (XMLHttpRequest) {
            //Specifying this header ensures that the results will be returned as JSON.
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            //Specify the HTTP method MERGE to update just the changes you are submitting.             
            XMLHttpRequest.setRequestHeader("X-HTTP-Method", "MERGE");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            successCallback(data, textStatus, XmlHttpRequest);
        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            if (errorCallback)
                errorCallback(XmlHttpRequest, textStatus, errorThrown);
            else
                alert("Error on the creation of record; Error – " + errorThrown);
        }
    });

}

/**
 * @desc Deletes an existing Record
 *
 * @param entityObject - The Object containing the data for the new record. 
 * @param odataSetName - The name of the entity set.  
 * 
 * @required entityObject, odataSetName
 */
// This function creates record by making OData call
Tribridge.OData.DeleteRecord = function (entityObject, odataSetName) {
    debugger;
    var jsonEntity = window.JSON.stringify(entityObject);
    var ODataUrl = Tribridge.Helper.GetODataServiceUrl() + "/" + odataSetName;
    var primaryAttribute = Tribridge.ViewEditor.CustomViews[0].PrimaryAttribute;

    //Asynchronous AJAX function to Create a CRM record using OData
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: ODataUrl + "(guid'" + entityObject[primaryAttribute] + "')",
        beforeSend: function (XMLHttpRequest) {
            //Specifying this header ensures that the results will be returned as JSON.
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            //Specify the HTTP method MERGE to update just the changes you are submitting.             
            XMLHttpRequest.setRequestHeader("X-HTTP-Method", "DELETE");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            debugger;
            $("#grid").data("kendoGrid").dataSource.read();
            alert("Record Deleted");
            /*
            if (successCallback) {
                successCallback(data.d, textStatus, XmlHttpRequest);
            }*/
        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            if (errorCallback)
                errorCallback(XmlHttpRequest, textStatus, errorThrown);
            else
                alert("Error on the creation of record; Error – " + errorThrown);
        }
    });

}


// ################################################### CALLBACK

// This callback method executes on succesful record creation
Tribridge.OData.CB.createRecordCompleted = function (data, textStatus, XmlHttpRequest) {
    var contact = data;
    debugger;
    alert("Contact created");
};

// This callback method executes on succesful record update
Tribridge.OData.CB.updateRecordCompleted = function (data, textStatus, XmlHttpRequest) {
    var contact = data;
    debugger;
    alert("Record updated successfully");
};



