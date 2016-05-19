/// <reference path="kendo.js" />
if (typeof (Tribridge) == "undefined")
{ Tribridge = { __namespace: true }; }

//------------------
// Global Namespaces
//------------------
Tribridge.Tiles = {};          // Namespace, default
Tribridge.Tiles.Private = {};  // Namespace for private methods
Tribridge.Tiles.Events = {};   // Namespace for event methods
Tribridge.Tiles.CB = {};       // Namespace for callback methods

//------------------
// Global variables:
//------------------
var blnHasFormLoaded = 0;
Tribridge.Tiles.CustomViews = [];
Tribridge.Tiles.PagingSize = 500;
Tribridge.Tiles.AttributeMetadata = [];
Tribridge.Tiles.PatientID = "";

// The query fields are used by the json object builders so it knows what fields we need to extract from the fetchxml results.  
Tribridge.Tiles.AlertFields = ["tri_alertid", "tri_alertidentifier", "tri_alertlevel", "tri_alertdescription", "tri_alertdate", "tri_regarding"];
Tribridge.Tiles.AlertFields2 = ["tri_alertid", "tri_alertidentifier", "tri_alertlevel", "tri_alertlevelname", "tri_alertdescription", "tri_alertdate", "tri_regarding", "tri_regardingname", "count"];
Tribridge.Tiles.EncounterFields = ["customerid", "incidentid", "ownerid"];

//-------------
// Global Enums
//-------------
//Tribridge.Tiles.CarePlanGoalState = [ { label: "Open", value: 167410000 }, { label: "Met", value: 167410001 }, { label: "Not Met", value: 167410002 }, { label: "Closed, Cancelled", value: 167410003 }];

//-------------------------------------------------------------------------------------------------------------
//                                            Entry point method
//-------------------------------------------------------------------------------------------------------------
Tribridge.Tiles.Initialize = function ()
{
}

Tribridge.Tiles.InitializeForm = function ()
{
   debugger;

   //---------------------------------
   // Form Section 3 elements - Alerts
   //---------------------------------
   // Care Plan Goals listview
   $("#CustomerAlerts").kendoListView({
   });

   //--------------------------------------------------------------------
   // And lastly, do a little housekeeping for the initialization process
   //--------------------------------------------------------------------
   if (blnHasFormLoaded == 0)
   {
      // Load the Xrm object
      var Xrm = window.parent.Xrm;
      if (Xrm.Page != null)
      {
         //Tribridge.Tiles.PatientID = Xrm.Page.data.entity.getId();
      }
      else
      {
         // Should not get this
         alert("Could not obtain reference to the Xrm object. Need Patient ID.");
      }
      
      // Initially load all of the Customer Alerts
      //Tribridge.Tiles.LoadCustomerAlertsClick();
      Tribridge.Tiles.LoadCustomerAlerts();

      // Set the flag to indicatte form init has completed.
      blnHasFormLoaded = 1;
   }
}


//-------------------------------------------------------------------------------------------------------------
//                                            Button Click event methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Tiles.LoadCustomerAlertsClick = function ()
{
   //alert("Tribridge.Tiles.LoadCustomerAlertsClick");
   try
   {
      debugger;
      // Set the view state to indicate we are moving to the third view
      Tribridge.Tiles.SetViewState();

      var grid = $("#CustomerAlerts").data("kendoListView");
      grid.dataSource.read();


      // Load the Advice for the selected question record
      //Tribridge.Tiles.LoadCustomerAlerts();

      $('#linkCustomerAlerts').removeClass("linkactive").addClass("link");
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.CustomerAlertsOnChange = function ()
{
   //alert("Tribridge.Tiles.CustomerAlertsOnChange");
   try
   {
      var listView = $("#CustomerAlerts").data("kendoListView");
      var selecteditem = listView.select();

      if (selecteditem == null || selecteditem.length <= 0)
      {
         alert("No Item selected");
         return;
      }

      // Extract the selected id - the text is delimited by one or more \r\n combinations
      var text = selecteditem[0].innerText.split("\r\n");
      var id = text[text.length - 1];
      //alert("selected:" + id);
   }
   catch (excp)
   {
      alert(excp.description);
   }
}


//-------------------------------------------------------------------------------------------------------------
//                                               Miscellaneous methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Tiles.SetViewState = function ()
{
   //alert("Tribridge.Tiles.SetViewState:" + intState);

   try
   {
      $('#section3').show();
   }
   catch (excp)
   {
      alert(excp.description);
   }
};

Tribridge.Tiles.TransformToJson = function (fetchXmlResults, aryQueryFieldnames)
{
   //alert("Tribridge.Tiles.TransformToJson");
   var jsonObject = [];

   try
   {
      // Check for null or empty parameters
      if (fetchXmlResults == null)
      {
         alert("Tribridge.Tiles.TransformToJson: null FetchXml argument");
         return {};
      }
      if (fetchXmlResults.length == 0)
      {
         alert("No records returned for this query");
         return {};
      }
      if (aryQueryFieldnames == null || aryQueryFieldnames.length == 0)
      {
         alert("null FetchXml argument");
         return {};
      }

      // Loop thru the Query fieldnames to build the return JSON object
      for (recordcount = 0; recordcount < fetchXmlResults.length; recordcount++)
      {
         // Build the array for each record and then load into the JSON object
         //var fields = {};
         var fields = Tribridge.Tiles.GenerateSchema(aryQueryFieldnames);

         for (fieldcount = 0; fieldcount < aryQueryFieldnames.length; fieldcount++)
         {
            // Get the field name for the array
            var currentfield = aryQueryFieldnames[fieldcount];

            // Check that it is in the result set
            if (fetchXmlResults[recordcount].Properties[currentfield] != null)
            {
               var value = fetchXmlResults[recordcount].Properties[currentfield].Value;

               // Convert the optionset index to a label
               if (fetchXmlResults[recordcount].Properties[currentfield].Type == "dateTime")
               {
                  value = fetchXmlResults[recordcount].Properties[currentfield].FormattedValue;
               }
               else if (fetchXmlResults[recordcount].Properties[currentfield].Type == "optionsetvalue" ||
                        fetchXmlResults[recordcount].Properties[currentfield].Type == "entityreference")
               {
                  var opttextname = currentfield + "name";
                  fields[opttextname] = fetchXmlResults[recordcount].Properties[currentfield].FormattedValue;
                  value = fetchXmlResults[recordcount].Properties[currentfield].Value;
               }
               else
               {
                  value = fetchXmlResults[recordcount].Properties[currentfield].Value;
               }

               // Add this element to the fields array
               if (currentfield == "tri_alertdescription")
               {
                  if (value.length > 85)
                  {
                     descrip = new String(value);
                     value = descrip.substring(0, 85) + "...";
                  }
               }
               fields[currentfield] = value;
            }
         }

         // No load this record into the JSON object to be returned
         jsonObject.push(fields);
      }

      return jsonObject;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.RetrieveOptionText = function (optionvalue, optionarray)
{
   //alert("Tribridge.Tiles.RetrieveOptionText");
   debugger;
   try
   {
      if (optionvalue == null || optionvalue == "") return "";
      
      if (optionarray == null || optionarray.length == 0) return "";

      for (cnt = 0; cnt < optionarray.length; cnt++)
      {
         if (optionarray[cnt].value == optionvalue)
         {
            return optionarray[cnt].label;
         }
      }

      return "";
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.GenerateSchema = function (objectfields)
{
   var objreturn = {};

   try
   {
      if (objectfields == null) return objreturn;

      for (cnt=0; cnt < objectfields.length; cnt++)
      {
         objreturn[objectfields[cnt]] = "";
      }

      return objreturn;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.OpenEncounter = function (IncidentId)
{
   //alert(incidentid);
   debugger;
   try
   {
      var Xrm = window.parent.Xrm;

      if (Xrm != null)
      {
         Xrm.Utility.openEntityForm('incident', IncidentId);
      }
      else
      {
         alert("Xrm object not found to open Encounter record.");
      }

   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.OpenCustomer = function (CustomerId)
{
   //alert(CustomerId);
   debugger;
   try
   {
      var Xrm = window.parent.Xrm;

      if (Xrm != null)
      {
         Xrm.Utility.openEntityForm('contact', CustomerId);
      }
      else
      {
         alert("Xrm object not found to open Contact record.");
      }

   }
   catch (excp)
   {
      alert(excp.description);
   }
}


//-------------------------------------------------------------------------------------------------------------
//                                                 Data Load methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Tiles.FetchAlerts = function ()
{
   try
   {
      debugger;

      // Get the encounter list
      var encounters = Tribridge.Tiles.FetchEncounters();


      // build the FetchXml statement
      var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='1000' >" +
                     "<entity name='" + "tri_alert" + "'>" +
                     "<attribute name='tri_alertid' alias='tri_alertid'/>" +
                     "<attribute name='tri_alertidentifier' alias='tri_alertidentifier'/>" +
                     "<attribute name='tri_alertlevel' alias='tri_alertlevel'/>" +
                     "<attribute name='tri_alertdescription' alias='tri_alertdescription'/>" +
                     "<attribute name='tri_alertdate' alias='tri_alertdate'/>" +
                     "<attribute name='tri_regarding' alias='tri_regarding'/>" +
                     "<order descending='true' attribute='tri_alertlevel'/>" +
                     "<order descending='false' attribute='tri_regarding'/>" +
                     "<order descending='true' attribute='tri_alertdate'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='tri_alertlevel' operator='in'>" +
                     //"<value>167410000</value>" +
                     //"<value>167410001</value>" +
                     //"<value>167410002</value>" +
                     "<value>167410003</value>" +
                     "<value>167410004</value>" +
                     "<value>167410005</value>" +
                     "</condition>" +
                     "<condition attribute='tri_regarding' operator='not-null'/>" +
                     "<condition attribute='statecode' operator='eq' value='0'/>" +
                     "<condition attribute='tri_encounterid' operator='null' />" +
                     "</filter>" +
                     "</entity></fetch>";
      //alert(fetchxml);

      // Retrieve the data and then convert to JSON object for data source
      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = [];

      if (res != null && res.length > 0)
      {
         jsondata = Tribridge.Tiles.TransformToJson(res, Tribridge.Tiles.AlertFields);
      }

      var alerts = [];
      
      var last = "";

      // Loop thru the list and build a new distinct list ordered from the original jsondata structure.
      for (idm = 0; idm < jsondata.length; idm++)
      {
         var blnFound = false;

         // Compare against the new list
         for (idn=0; idn < alerts.length; idn++)
         {
            if (jsondata[idm].tri_regardingname == alerts[idn].tri_regardingname)
            {
               alerts[idn].count++;
               blnFound = true;
               break;
            }
         }
         
         if (blnFound == false)
         {
            var blnIsInProgress = false;
            var incidentid = "";
            var owner = "";
            for (icnt = 0; icnt < encounters.length; icnt++)
            {
               if (jsondata[idm].tri_regardingname == encounters[icnt].customeridname)
               {
                  blnIsInProgress = true;
                  incidentid = encounters[icnt].incidentid;
                  owner = encounters[icnt].owneridname;
                  break;
               }
            }

            var fields = [];  
            fields = $.extend({}, jsondata[idm]);
            fields["count"] = 1;
            fields["isinprogress"] = blnIsInProgress;
            fields["incidentid"] = incidentid;
            fields["ownerid"] = owner;
            alerts.push(fields);

            //alerts.push(jsondata[idm]);
            
         }
      }

      // Update the link text
      var labeltext = "Customer Alerts [" + alerts.length + "]";
      $('#lblAlertCnt').text(labeltext);

      return alerts;    //jsondata;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.FetchDistinctAlerts = function ()
{
   try
   {
      debugger;
      // build the FetchXml statement
      var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true' count='500' >" +
                     "<entity name='" + "tri_alert" + "'>" +
                     "<attribute name='tri_regarding' alias='tri_regarding'/>" +
                     "<order descending='false' attribute='tri_regarding'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='tri_alertlevel' operator='in'>" +
                     //"<value>167410000</value>" +
                     //"<value>167410001</value>" +
                     //"<value>167410002</value>" +
                     "<value>167410003</value>" +
                     "<value>167410004</value>" +
                     "<value>167410005</value>" +
                     "</condition>" +
                     "<condition attribute='tri_regarding' operator='not-null'/>" +
                     "<condition attribute='statecode' operator='eq' value='0'/>" +
                     "</filter>" +
                     "</entity></fetch>";
      //alert(fetchxml);

      // Retrieve the data and then convert to JSON object for data source
      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = [];

      if (res != null && res.length > 0)
      {
         jsondata = Tribridge.Tiles.TransformToJson(res, Tribridge.Tiles.AlertDistinctFields);
      }

      return jsondata;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.FetchEncounters = function ()
{
   try
   {
      debugger;
      // build the FetchXml statement
      var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true' count='1000' >" +
                     "<entity name='" + "incident" + "'>" +
                     "<attribute name='customerid' alias='customerid'/>" +
                     "<attribute name='incidentid' alias='incidentid'/>" +
                     "<attribute name='ownerid' alias='ownerid'/>" +
                     "<order descending='false' attribute='customerid'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='statecode' operator='eq' value='0'/>" +
                     "<condition attribute='statuscode' operator='eq' value='1'/>" +
                     "</filter>" +
                     "</entity></fetch>";
      //alert(fetchxml);

      // Retrieve the data and then convert to JSON object for data source
      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = [];

      if (res != null && res.length > 0)
      {
         jsondata = Tribridge.Tiles.TransformToJson(res, Tribridge.Tiles.EncounterFields);
      }

      return jsondata;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.FetchTasks = function (filterstring)
{
   try
   {
      if (filterstring != null && filterstring != "")
      {
         //return Tribridge.View1.FetchTasksForRole(filterstring);
      }

      // build the FetchXml statement
      //var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='500' >" +
      //               "<entity name='" + "task" + "'>" +
      //               "<attribute name='subject' alias='subject'" + " />" +
      //               "<attribute name='scheduledend' alias='scheduledend'" + " />" +
      //               "<attribute name='activityid' alias='activityid'" + " />" +
      //               "<attribute name='activitytypecode' alias='activitytypecode'" + " />" +
      //               "<attribute name='ownerid' alias='ownerid'" + " />" +
      //               "<attribute name='fmc_securityrole' alias='fmc_securityrole'" + " />" +
      //               "<order descending='false' attribute='scheduledend'/>" +
      //               "<filter type='and'>" +
      //               "<condition attribute='statecode' value='0' operator='eq'/>" +
      //               "<condition attribute='regardingobjectid' operator='in'>" +
      //               "<value uitype='contact'>" + Tribridge.View1.EntityID + "</value>" +
      //               "</condition>" +
      //               "</filter>" +
      //               "<link-entity name='role' from='roleid' to='fmc_securityrole' visible='false' link-type='outer' alias='bb'>" +
      //               "<attribute name='name' alias='role' />" +
      //               "<filter type='and'>" +
      //               "<condition attribute='name' operator='like' value='%fms%' />" +
      //               "</filter>" +
      //               "</link-entity>" +
      //               "</entity></fetch>";

      //// Retrieve the data and then convert to JSON object for data source
      //var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      //var jsondata = [];

      //if (res != null && res.length > 0)
      //{
      //   jsondata = Tribridge.View1.TransformToJson(res, Tribridge.View1.TaskQueryFields);

      //   // Update the grid heading
      //   var txt = "Open Activities for Pt Care Plan (" + res.length + ")";
      //   $("#lblActivities").html(txt);
      //}

      var jsondata = [{ activityid: "1", activitytypecode: 4101, scheduledend: "6/8/2015", subject: "Action to reduce fall risk", role: "Lampi, K" },
                      { activityid: "2", activitytypecode: 4102, scheduledend: "5/1/2015", subject: "Adjust PO Prescription", role: "Lampi, K" },
                      { activityid: "3", activitytypecode: 4101, scheduledend: "5/11/2015", subject: "Change BFR", role: "Lampi, K" },
                      { activityid: "4", activitytypecode: 4101, scheduledend: "5/21/2015", subject: "Evaluate Access", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/12/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/22/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/1/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/1/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/1/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/12/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/12/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/14/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/15/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/1/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/1/2015", subject: "ID and Address Barriers", role: "Lampi, K" },
                      { activityid: "5", activitytypecode: 4101, scheduledend: "6/18/2015", subject: "ID and Address Barriers", role: "Lampi, K" }
      ];

      return jsondata;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Tiles.LoadCustomerAlerts = function (protocolid)
{
   //alert("Tribridge.Tiles.LoadCustomerAlerts");
   try
   {
      debugger;
     
      $("#CustomerAlerts").kendoListView({
         dataSource: {
            transport: {
               read: function (options)
               {
                  options.success(Tribridge.Tiles.FetchAlerts());
               }
            },
         },
         template: kendo.template($("#CustomerAlertTemplate").html()),
         selectable: true,
         change: Tribridge.Tiles.CustomerAlertsOnChange
      });

   }
   catch (excp)
   {
      alert("Tribridge.Tiles.LoadCustomerAlerts:" + excp.description);
   }
}


//-------------------------------------------------------------------------------------------------------------
//                                                 Callback methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Tiles.Save_SuccessCallback = function ()
{
   var i = 0;
}

Tribridge.Tiles.Save_ErrorCallback = function ()
{
   var i = 0; 
}

Tribridge.Tiles.ResponseSave_SuccessCallback = function (data, textStatus, XmlHttpRequest)
{
}

Tribridge.Tiles.ResponseSave_FailureCallback = function (data, textStatus, XmlHttpRequest)
{
}

Tribridge.Tiles.MetadataAttribute_SuccessCallback = function (result)
{
   Tribridge.Tiles.AttributeMetadata.push(result);
}

Tribridge.Tiles.MetadataAttribute_FailureCallback = function (data, textStatus, XmlHttpRequest)
{
   var i = 1;
}


//-------------------------------------------------------------------------------------------------------------
//                                                 Other methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Tiles.OnDataBinding = function (arg)
{
}

Tribridge.Tiles.OnDataBound = function (arg)
{
   if (arg != null)
   {
   }
}



