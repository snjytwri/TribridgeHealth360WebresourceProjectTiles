if (typeof Tribridge == "undefined")
    Tribridge = {};
if (typeof Tribridge.Protocols == "undefined")
    Tribridge.Protocols = {};
if (typeof Tribridge.Protocols.Command == "undefined")
    Tribridge.Protocols.Command = {};


Tribridge.Protocols.Command.isGrid = false;
Tribridge.Protocols.Command.Entity = "";
Tribridge.Protocols.Command.ViewName = "";
Tribridge.Protocols.Command.ReadonlyCols = [];
Tribridge.Protocols.Command.RequiredCols = [];
Tribridge.Protocols.Command.RestrictedViews = [];

Tribridge.Protocols.Command.Verify = function (entity) {
    debugger;
    var odataSelect = Tribridge.Protocols.GetServerUrl() + "/XRMServices/2011/OrganizationData.svc/triipcrm_ProtocolssettingsSet";
    var passthrough = [];
    var enable = false;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: odataSelect,
        async: false,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {

            var ents = data.d.results;

            var ar = [];
            for (i = 0; i < ents.length; i++) {
                ar.push(ents[i].triipcrm_name);
            }

            var i = ar.indexOf(entity);

            enable = i < 0 ? false : true;
            if (enable) {
                var readOnly = ents[i].triipcrm_ReadOnlyFields;
                if (readOnly != null) {
                    readOnly = readOnly.substring(0, readOnly.length - 2);
                    Tribridge.Protocols.Command.ReadonlyCols = readOnly.split(", ");
                }


                var required = ents[i].triipcrm_RequiredFields;
                if (required != null) {
                    required = required.substring(0, required.length - 2);
                    Tribridge.Protocols.Command.RequiredCols = required.split(", ");
                }

                var restricted = ents[i].triipcrm_RestrictedViews;
                if (restricted != null) {
                    restricted = restricted.substring(0, restricted.length - 2);
                    Tribridge.Protocols.Command.RestrictedViews = restricted.split(", ");
                }

            }
        }
        //error: Tribridge.Protocols.Config.CB.Error
    });

    return enable;
}

Tribridge.Protocols.Command.InsertGrid = function (entity) {
    debugger;
    var view = $("#crmGrid_SavedNewQuerySelector span").text();
    Tribridge.Protocols.Command.ViewName = view;
    if (Tribridge.Protocols.Command.isGrid) {
        $("#homepageTableCell div").first().show();
        $("#homepageTableCell").find("#Protocols").first().remove();
        Tribridge.Protocols.Command.isGrid = false;
        document.getElementById("crmGrid").control.refresh();
    }
    else {
        var isRestricted = Tribridge.Protocols.Command.RestrictedViews.indexOf(Tribridge.Protocols.Command.ViewName) < 0 ? false : true;
        if (isRestricted == false) {
            isRestricted = Tribridge.Protocols.Command.RestrictedViews.indexOf(Tribridge.Protocols.Command.ViewName.replace(" ", "")) < 0 ? false : true;
        }


        if (isRestricted) {
            alert("This view is restricted, and can't be used with the Protocols");
        }
        else {
            $("#homepageTableCell div").first().hide();
            var gridurl = Tribridge.Protocols.GetServerUrl() + "/WebResources/triipcrm_/Tribridge.IP.CRM.Protocols/BuildGrid.html";
            $("#homepageTableCell").append("<iframe id='Protocols'src='" + gridurl + "' style='border: currentColor; width: 100%; height: 100%;'></iframe>");
            Tribridge.Protocols.Command.Entity = entity;
            Tribridge.Protocols.Command.isGrid = true;
        }
    }

}



Tribridge.Protocols.GetServerUrl = function () {

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

Tribridge.Protocols.TransformToJson = function (fetchXmlResults, aryQueryFieldnames)
{
   alert("Tribridge.Protocols.TransformToJson");
   try
   {
      alert(aryQueryFieldnames.length);
   }
   catch (excp)
   {
      alert(excp.description);
   }
   return "";
}