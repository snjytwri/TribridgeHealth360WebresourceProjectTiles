if (typeof Tribridge == "undefined")
    Tribridge = {};
if (typeof Tribridge.Protocols == "undefined")
    Tribridge.Protocols = {};
if (typeof Tribridge.Protocols.Config == "undefined")
    Tribridge.Protocols.Config = {};


/**
 * KENDO UI Configuration Page for View Editor
 * FOR CRM 2011 & CRM 2013
 * 
 */

// Namespaces
Tribridge.Protocols.Config = {}; // Namespace, default
Tribridge.Protocols.Config.Private = {}; // Namespace for private methods
Tribridge.Protocols.Config.Events = {}; // Namespace for event methods
Tribridge.Protocols.Config.CB = {}; // Namespace for callback methods

// Global Variables
Tribridge.Protocols.Config.CustomViews = [];
Tribridge.Protocols.Config.PagingSize = 50;
Tribridge.Protocols.Config.Item = "";


Tribridge.Protocols.Config.GridCSSId = '#configgrid';
Tribridge.Protocols.Config.WindowCSSId = '#configWindow';
Tribridge.Protocols.Config.WindowContentId = '#windowContent';

/**
 * @desc The init function of this js.
 */
Tribridge.Protocols.Config.Init = function () {

    // Create grid 
    Tribridge.Protocols.Config.CreateGrid();

    Tribridge.Protocols.Config.Private.ReadEntities();

    Tribridge.Protocols.Config.CreateTab();

    $("#btnNew").kendoButton({
        click: Tribridge.Protocols.Config.EntityList
    });

    $("#btnSaveEnt").kendoButton({
        click: Tribridge.Protocols.Config.CreateSettings
    });

    $("#btnSave").kendoButton({
        click: Tribridge.Protocols.Config.UpdateSettings
    });

    $("#btnAddAttr").kendoButton({
        click: Tribridge.Protocols.Config.AddAttr
    });

    $(".addField").kendoButton({
        click: Tribridge.Protocols.Config.AddFields
    });

    $(".removeField").kendoButton({
        click: Tribridge.Protocols.Config.RemoveFields
    });

    $(".closeWindow").kendoButton({
        click: Tribridge.Protocols.Config.Close
    });
}

/**
 * @desc Loads the grid
 * 
 */
Tribridge.Protocols.Config.CreateGrid = function () {

    $(Tribridge.Protocols.Config.GridCSSId).kendoGrid({
        //autoBind: false,
        height: 550,
        navigatable: true,
        editable: { update: false, destroy: false },
        sortable: true,
        pageable: true,
        filterable: true,
        //save: Tribridge.Protocols.Config.Private.OnSave_Grid,
        //dataBound: Tribridge.Protocols.Config.Private.OnDataBound_Grid,
        //dataBinding: Tribridge.Protocols.Config.Private.OnDataBinding_Grid,
        selectable: "false",
        groupable: false,
        change: Tribridge.Protocols.Config.Private.onChange_Grid,
        columns: Tribridge.Protocols.Config.Private.GridColumns()
    });


}

/**
 * @desc Generates the JSON Array with some static columns shown in the Kendo grid.
 *
 */
Tribridge.Protocols.Config.Private.GridColumns = function () {
    return [
        /*{
            field: "AutoSave",
            width: 16,
            title: "AutoSave",
            filterable: false
            //template: '<a href="javascript:Tribridge.QuestionView.OpenWindow(\'#=tri_QuestionID.Id#\')">#=tri_QuestionID.Name#</a>',
        },*/
        {
            field: "EntityName",
            width: 80,
            title: "Entity Name"
        }, {
            field: "ReadOnlyFields",
            width: 60,
            title: "Read Only Fields",
            filterable: false
        }, {
            field: "RequiredFields",
            width: 60,
            title: "Required Fields",
            filterable: false
        }, {
            field: "Views",
            width: 100,
            title: "Views",
            filterable: false
        } /* {
            field: "FilterLookups",
            width: 60,
            title: "Filter Lookups",
            filterable: false
        }*/
    ];
}

/**
 * @desc Creates the tabs
 * 
 */
Tribridge.Protocols.Config.CreateTab = function () {
    $("#tabstrip").kendoTabStrip({
        animation: {
            open: {
                effects: "fadeIn"
            }
        }
    });
}


Tribridge.Protocols.Config.AddFields = function () {
    var btn = this;
    var kGrid = $(Tribridge.Protocols.Config.GridCSSId).data("kendoGrid");
    var row = kGrid.dataItem(kGrid.select());

    if (row == null) {
        alert("Select a row");
        return;
    }

    switch (btn.element[0].id) {
        case "btnAddRO":
            {
                Tribridge.Protocols.Config.Item = "#RO";
                SDK.Metadata.RetrieveEntity(SDK.Metadata.EntityFilters.Attributes,
                    row.EntityName, null, false,
                    Tribridge.Protocols.Config.CB.successRetrieveAttributes,
                    Tribridge.Protocols.Config.CB.errorRetrieveEntityList);
                break;
            }

        case "btnAddRF":
            {
                Tribridge.Protocols.Config.Item = "#RF";
                SDK.Metadata.RetrieveEntity(SDK.Metadata.EntityFilters.Attributes,
                    row.EntityName, null, false,
                    Tribridge.Protocols.Config.CB.successRetrieveAttributes,
                    Tribridge.Protocols.Config.CB.errorRetrieveEntityList);
                break;
            }
        case "btnAddRV":
            {
                Tribridge.Protocols.Config.Item = "#RV";
                Tribridge.Protocols.Config.Private.ReadSavedViews();
                break;
            }
    }
}

Tribridge.Protocols.Config.RemoveFields = function () {
    var btn = this;

    switch (btn.element[0].id) {
        case "btnRemoveRO":
            {
                $('#RO option:selected').remove();
                break;
            }

        case "btnRemoveRF":
            {
                $('#RF option:selected').remove();
                break;
            }
        case "btnRemoveRV":
            {
                $('#RV option:selected').remove();
                break;
            }
    }
}

Tribridge.Protocols.Config.AddAttr = function () {
    var kddl = $("#attributes").data("kendoDropDownList");
    var value = kddl.value();

    $(Tribridge.Protocols.Config.Item).append("<option value=\"" + value + "\" >" + value + "</option>");
    kddl.dataSource.remove(kddl.dataItem(kddl.select()));

}

Tribridge.Protocols.Config.Close = function () {
    var btn = this;

    switch (btn.element[0].id) {
        case "btnCancelEnt":
            {
                $("#configWindow").data("kendoWindow").close();
                break;
            }

        case "btnCancelField":
            {
                $("#fieldWindow").data("kendoWindow").close();
                break;
            }
    }
}

Tribridge.Protocols.Config.BindData = function (ents) {

    var data = [];
    $.each(ents, function (i, ent) {
        data.push({
            GUID: ent.triipcrm_ProtocolssettingsId,
            AutoSave: ent.triipcrm_EnableAutoSave,
            EntityName: ent.triipcrm_name,
            ReadOnlyFields: ent.triipcrm_ReadOnlyFields,
            RequiredFields: ent.triipcrm_RequiredFields,
            Views: ent.triipcrm_RestrictedViews,
            //FilterLookups: ent.triipcrm_FilterLookup,
            MainGrid: ent.triipcrm_MainGrid,
            SubGrid: ent.triipcrm_SubGrid,
            InactiveRecords: ent.triipcrm_InactiveRecords,
            EnableAutoSave: ent.triipcrm_EnableAutoSave,
        });
    });

    $(Tribridge.Protocols.Config.GridCSSId).getKendoGrid().dataSource.data(data);
    $(Tribridge.Protocols.Config.GridCSSId).getKendoGrid().refresh();
}

Tribridge.Protocols.Config.EntityList = function () {

    SDK.Metadata.RetrieveAllEntities(SDK.Metadata.EntityFilters.Entity,
     false,
     Tribridge.Protocols.Config.CB.successRetrieveEntityList,
     Tribridge.Protocols.Config.CB.errorRetrieveEntityList);
}

Tribridge.Protocols.Config.CreateSettings = function () {
    var ves = new Object();
    ves["triipcrm_name"] = $("#entity").data("kendoDropDownList").value();
    Tribridge.Protocols.Config.Private.CreateRecord(ves);
}

Tribridge.Protocols.Config.UpdateSettings = function () {
    var ves = new Object();

    var ro = "";
    $("#RO option").each(function () {
        ro += $(this).val() + ", ";
    });

    var rf = "";
    $("#RF option").each(function () {
        rf += $(this).val() + ", ";
    });

    var rv = "";
    $("#RV option").each(function () {
        rv += $(this).val() + ", ";
    });

    var kGrid = $(Tribridge.Protocols.Config.GridCSSId).data("kendoGrid");
    var row = kGrid.dataItem(kGrid.select());

    ves["triipcrm_ProtocolssettingsId"] = row.GUID;
    //ves["triipcrm_AutoSave"] = null;
    //ves["triipcrm_name"] = null;
    ves["triipcrm_ReadOnlyFields"] = ro;
    ves["triipcrm_RequiredFields"] = rf;
    ves["triipcrm_RestrictedViews"] = rv;
    //ves["triipcrm_FilterLookup"] = null;
    ves["triipcrm_MainGrid"] = $("#MainGrid").is(":checked");
    ves["triipcrm_SubGrid"] = $("#SubGrid").is(":checked");
    ves["triipcrm_InactiveRecords"] = $("#DIR").is(":checked");
    ves["triipcrm_EnableAutoSave"] = $("#EAS").is(":checked");

    Tribridge.Protocols.Config.Private.UpdateRecord(ves);
}

// ################################################### PRIVATE

Tribridge.Protocols.Config.Private.ReadEntities = function () {
    var odataSelect = Tribridge.Helper.GetODataServiceUrl() + "/triipcrm_ProtocolssettingsSet";
    var passthrough = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: odataSelect,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            debugger;
            Tribridge.Protocols.Config.BindData(data.d.results);
            //var parsed = Tribridge.Xrm.ParseActivities(data.d.results, passthrough);

            //Tribridge.Xrm.CB.RetrieveViews(viewtype, parsed);
        },
        error: Tribridge.Protocols.Config.CB.Error
    });
}

Tribridge.Protocols.Config.Private.CreateRecord = function (entityObject) {
    var jsonEntity = JSON.stringify(entityObject);
    var ODataUrl = Tribridge.Helper.GetODataServiceUrl() + "/triipcrm_ProtocolssettingsSet";

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
            alert("Entity succesfully added");
            $(Tribridge.Protocols.Config.WindowCSSId).data("kendoWindow").close();
            Tribridge.Protocols.Config.Private.ReadEntities();
            Tribridge.Protocols.Config.Private.Clear();
        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            alert("Error on the creation of record; Error – " + errorThrown);
        }
    });

}

Tribridge.Protocols.Config.Private.UpdateRecord = function (entityObject) {
    var jsonEntity = JSON.stringify(entityObject);
    var ODataUrl = Tribridge.Helper.GetODataServiceUrl() + "/triipcrm_ProtocolssettingsSet";

    //Asynchronous AJAX function to Create a CRM record using OData
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: ODataUrl + "(guid'" + entityObject["triipcrm_ProtocolssettingsId"] + "')",
        data: jsonEntity,
        beforeSend: function (XMLHttpRequest) {
            //Specifying this header ensures that the results will be returned as JSON.
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            //Specify the HTTP method MERGE to update just the changes you are submitting.             
            XMLHttpRequest.setRequestHeader("X-HTTP-Method", "MERGE");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            alert("Settings Updated");
            Tribridge.Protocols.Config.Private.Clear();
            Tribridge.Protocols.Config.Private.ReadEntities();

        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            alert("Error on the creation of record; Error – " + errorThrown);
        }
    });
}

Tribridge.Protocols.Config.Private.onChange_Grid = function () {
    var kGrid = $(Tribridge.Protocols.Config.GridCSSId).data("kendoGrid");
    var row = kGrid.dataItem(kGrid.select());

    Tribridge.Protocols.Config.Private.LoadAttributes(row.ReadOnlyFields, "#RO");
    Tribridge.Protocols.Config.Private.LoadAttributes(row.RequiredFields, "#RF");
    Tribridge.Protocols.Config.Private.LoadAttributes(row.Views, "#RV");

    $('#MainGrid').prop('checked', row.MainGrid);
    $('#SubGrid').prop('checked', row.SubGrid);
    $('#DIR').prop('checked', row.InactiveRecords);
    $('#EAS').prop('checked', row.EnableAutoSave);


    debugger;
}

Tribridge.Protocols.Config.Private.LoadAttributes = function (attr, selectId) {
    $(selectId).html("");
    if (attr != null) {
        var a = attr.replace(/\s+/g, '');
        var array = a.split(',');
        for (i = 0; i < array.length; i++) {
            if (array[i] != "" && array[i] != null)
                $(selectId).append("<option value=\"" + array[i] + "\" >" + array[i] + "</option>");
        }
    }
}

Tribridge.Protocols.Config.Private.Clear = function () {

    $("#RO").html("");
    $("#RF").html("");
    $("#RV").html("");

    $('#MainGrid').prop('checked', false);
    $('#SubGrid').prop('checked', false);
    $('#DIR').prop('checked', false);
    $('#EAS').prop('checked', false);
}

Tribridge.Protocols.Config.Private.ReadSavedViews = function () {
    var kGrid = $(Tribridge.Protocols.Config.GridCSSId).data("kendoGrid");
    var row = kGrid.dataItem(kGrid.select());

    var odataSelect = Tribridge.Helper.GetODataServiceUrl() + "/SavedQuerySet?$select=Name&$filter=ReturnedTypeCode eq '" + row.EntityName + "' and QueryType eq 0";
    var passthrough = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: odataSelect,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            Tribridge.Protocols.Config.Private.ReadUserViews(data.d.results);
        },
        error: Tribridge.Protocols.Config.CB.Error
    });
}

Tribridge.Protocols.Config.Private.ReadUserViews = function (saved) {
    var kGrid = $(Tribridge.Protocols.Config.GridCSSId).data("kendoGrid");
    var row = kGrid.dataItem(kGrid.select());

    var odataSelect = Tribridge.Helper.GetODataServiceUrl() + "/UserQuerySet?$select=Name&$filter=ReturnedTypeCode eq '" + row.EntityName + "' and QueryType eq 0";
    var passthrough = [];
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: odataSelect,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            Tribridge.Protocols.Config.CB.successRetrieveViews(saved, data.d.results);
        },
        error: Tribridge.Protocols.Config.CB.Error
    });
}
// ################################################### CALLBACKS

Tribridge.Protocols.Config.CB.Error = function (XmlHttpRequest, textStatus, errorThrown) {
    alert('Status: ' + XmlHttpRequest.status);
}

Tribridge.Protocols.Config.CB.successRetrieveEntityList = function (entityMetadataCollection) {
    kGrid = $(Tribridge.Protocols.Config.GridCSSId).data("kendoGrid");

    entityMetadataCollection.sort(function (a, b) {
        if (a.LogicalName < b.LogicalName)
        { return -1 }
        if (a.LogicalName > b.LogicalName)
        { return 1 }
        return 0;
    });

    var data = [];
    var existing = [];

    for (i = 0; i < kGrid.dataSource.view().length; i++) {
        existing.push(kGrid.dataSource.view()[i].EntityName);
    }

    for (var i = 0; i < entityMetadataCollection.length; i++) {
        var entity = entityMetadataCollection[i];
        var j = existing.indexOf(entity.LogicalName);
        if (j < 0) {
            data.push({
                text: entity.SchemaName,
                value: entity.LogicalName
            });
        }
    }

    var window = $(Tribridge.Protocols.Config.WindowCSSId);

    if (!window.data("kendoWindow")) {
        window.kendoWindow({
            width: "400px",
            title: "Select Entity",
            actions: [
                "Close"
            ],
            modal: true
        });
    }

    var dropdownlist = $("#dropdownlist").data("kendoDropDownList");

    // create DropDownList from input HTML element
    $("#entity").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: data,
        index: 0,
    });

    $("#btnAdd").hide();
    $("#btnSaveEnt").show();


    window.data("kendoWindow").center().open();
}

Tribridge.Protocols.Config.CB.successRetrieveAttributes = function (EntityMetadata) {
    var attributes = EntityMetadata.Attributes;
    debugger;

    attributes.sort(function (a, b) {
        if (a.LogicalName < b.LogicalName)
        { return -1 }
        if (a.LogicalName > b.LogicalName)
        { return 1 }
        return 0;
    });

    var data = [];
    var existing = [];

    $(Tribridge.Protocols.Config.Item + " option").each(function () {
        existing.push(this.value);
    });

    for (var i = 0; i < attributes.length; i++) {
        var entity = attributes[i];
        var j = existing.indexOf(entity.LogicalName);
        if (j < 0) {
            data.push({
                text: entity.SchemaName,
                value: entity.LogicalName
            });
        }
    }

    var window = $("#fieldWindow");

    if (!window.data("kendoWindow")) {
        window.kendoWindow({
            width: "400px",
            title: "Select Attributes",
            actions: [
                "Close"
            ],
            modal: true
        });

    }

    // create DropDownList from input HTML element
    $("#attributes").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: data,
        index: 0,
    });
    window.data("kendoWindow").center().open();
}

Tribridge.Protocols.Config.CB.errorRetrieveEntityList = function (error) {
    ///<summary>
    /// Displays the error returned from  SDK.Metadata.RetrieveAllEntities if it fails.
    ///</summary>
    setText(message, error.message);
    if (alertFlag.checked == true)
        alert("An Error occurred.");
}

Tribridge.Protocols.Config.CB.successRetrieveViews = function (saved, user) {
    var views = saved.concat(user);
    debugger;

    views.sort(function (a, b) {
        if (a.Name < b.Name)
        { return -1 }
        if (a.Name > b.Name)
        { return 1 }
        return 0;
    });

    var data = [];
    var existing = [];

    $(Tribridge.Protocols.Config.Item + " option").each(function () {
        existing.push(this.value);
    });

    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        var j = existing.indexOf(view.Name);
        if (j < 0) {
            data.push({
                text: view.Name,
                value: view.Name
            });
        }
    }

    var window = $("#fieldWindow");

    if (!window.data("kendoWindow")) {
        window.kendoWindow({
            width: "600px",
            title: "Select Attributes",
            actions: [
                "Close"
            ],
            modal: true
        });

    }

    // create DropDownList from input HTML element
    $("#attributes").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: data,
        index: 0,
    });
    window.data("kendoWindow").center().open();
}