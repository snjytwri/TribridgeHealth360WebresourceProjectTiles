if (typeof (Tribridge) == "undefined")
{ Tribridge = { __namespace: true }; }

//------------------
// Global Namespaces
//------------------
Tribridge.Protocol = {};          // Namespace, default
Tribridge.Protocol.Private = {};  // Namespace for private methods
Tribridge.Protocol.Events = {};   // Namespace for event methods
Tribridge.Protocol.CB = {};       // Namespace for callback methods

//------------------
// Global variables:
//------------------
var strSelectedProtocol = "Selected Protocol"
var blnHasFormLoaded = 0;
Tribridge.Protocol.CustomViews = [];
Tribridge.Protocol.PagingSize = 50;
Tribridge.Protocol.SelectedAdvice = [];
Tribridge.Protocol.CaseID = "";
Tribridge.Protocol.ProtocolID = "";
Tribridge.Protocol.QuestionID = "";
Tribridge.Protocol.DispositionID = "";
Tribridge.Protocol.AdviceID = "";
Tribridge.Protocol.AdviceText = [];
Tribridge.Protocol.AdviceTextPlain = [];
Tribridge.Protocol.HeaderRows = [];
Tribridge.Protocol.QuestionResponse = [];
Tribridge.Protocol.Patient = [];
Tribridge.Protocol.OfficeHours = [];
Tribridge.Protocol.AfterHours = [];
Tribridge.Protocol.NumberOfSubheadings = 0;
Tribridge.Protocol.SelectedHoursOfOperations = "";
Tribridge.Protocol.ProtocolHeaderText = "PROTOCOLS";

//-------------
// Global Enums
//-------------
var HoursOfOperation =
{
   OfficeHours: "OH",
   AfterHours: "AH"
}
var HoursOfOperationDescriptor =
{
   OfficeHours: "Office Hours",
   AfterHours: "After Hours"
}

// Values are 0-based so below is 8am to 5pm
var OfficeHours =
{
   Open: 7,
   Close: 16
}
var QuestionResponse =
{
   Yes: 167410000,
   No: 167410001,
   NA: 167410002
}


// The query fields are used by the json object builders so it knows what fields we need to extract from the fetchxml results.  
Tribridge.Protocol.ProtocolQueryFields = ["tri_ah_algorithmid", "tri_title", "tri_category", "tri_descriptor", "tri_gender", "tri_minageyears", "tri_maxageyears", "tri_minagemonths", "tri_maxagemonths", "tri_anatomyid", "tri_systemid", "tri_no_hcasubheadings"];
Tribridge.Protocol.ProtocolDefinitionQueryFields = ["tri_ah_algorithmid", "tri_definitionxhtml"];
Tribridge.Protocol.ProtocolQuestionQueryFields = ["tri_question", "tri_questionxhtml", "tri_questionorder", "tri_dispositionid", "tri_ah_questionid", "tri_heading", "tri_levelid", "tri_colorid", "tri_colorhex", "tri_colorname", "tri_textcolorhex"];
Tribridge.Protocol.ProtocolAdviceQueryFields = ["tri_ah_questionadviceid", "tri_questionid", "tri_adviceid", "tri_questionadviceorder", "tri_algorithmorder", "tri_subheadingorder", "tri_algorithmid", "tri_advicesnap", "tri_st_adviceid", "tri_advice", "tri_advicexhtml", "tri_hca_subheading1", "tri_hca_subheading2", "tri_hca_subheading3", "tri_hca_subheading4", "tri_hca_subheading5"];
Tribridge.Protocol.PatientQueryFields = ["gendercode", "birthdate"];


//-------------------------------------------------------------------------------------------------------------
//                                            Entry point method
//-------------------------------------------------------------------------------------------------------------
Tribridge.Protocol.InitializeForm = function () 
{
   //------------------------------------
   // Form Section 1 elements - Protocols
   //------------------------------------
   // Search text box
   $("#searchstring").kendoMaskedTextBox({
      //mask: "0000 0000 0000 0000"
   });
   // Map the enter key to envoke the click event
   $("#searchstring").keyup(function (event)
   {
      if (event.keyCode == 13)
      {
         $("#searchbutton").click();
      }
   });

   // Search button
   $("#searchbutton").kendoButton();
   $("#searchbutton").click(function ()
   {
      Tribridge.Protocol.LoadFilteredProtocols();
   });

   // Protocols Grid
   $("#ProtocolsGrid").kendoGrid({
      selectable: true,
      groupable: false,
      sortable: false
   });

   // Protocols Definition listview
   $("#ProtocolsDef").kendoListView({
   });

   // Next button 
   $("#buttonnext1").kendoButton();
   $("#buttonnext1").click(function ()
   {
      Tribridge.Protocol.ProtocolNextOnClick();
   });

   //------------------------------------
   // Form Section 2 elements - Questions
   //------------------------------------
   // Questions listview
   $("#Questions").kendoListView({
   });

   // Prev button
   $("#buttonprev2").kendoButton();
   $("#buttonprev2").click(function ()
   {
      // Moving back to the first view state
      Tribridge.Protocol.SetViewState(1);
   });

   // Next button
   $("#buttonnext2").kendoButton();
   $("#buttonnext2").click(function ()
   {
      Tribridge.Protocol.QuestionNextOnClick();
   });

   //--------------------------------------------------------------------------
   // Form Section 3 elements - Advice and where they select which one to apply
   //--------------------------------------------------------------------------
   // Advice listview
   $("#AdviceView").kendoListView({
   });

   // SelectedAdvice listview
   $("#SelectedAdvice").kendoListView({
   });

   // Prev button
   $("#buttonprev3").kendoButton();
   $("#buttonprev3").click(function ()
   {
      Tribridge.Protocol.SetViewState(2);
   });

   // Done button
   $("#buttonnext3").kendoButton();
   $("#buttonnext3").click(function ()
   {
      Tribridge.Protocol.AdviceSelectionDoneOnClick();
   });

   // Move button
   $("#buttonmove").kendoButton();
   $("#buttonmove").click(function ()
   {
      Tribridge.Protocol.AdviceMoveOnClick();
   });

   // And lastly, do a little housekeeping for the initialization process
   if (blnHasFormLoaded == 0)
   {
      // Onload - set initial form state
      Tribridge.Protocol.SetViewState(1);

      // Initially load all of the Protocols
      Tribridge.Protocol.LoadProtocols();

      // Set the flag to indicatte form init has completed.
      blnHasFormLoaded = 1;
   }
}

Tribridge.Protocol.InitializeFormAdvanced = function ()
{
   //------------------------------------
   // Form Section 1 elements - Protocols
   //------------------------------------
   // Search text box
   $("#searchstring").kendoMaskedTextBox({
      //mask: "0000 0000 0000 0000"
   });
   // Map the enter key to envoke the click event
   $("#searchstring").keyup(function (event)
   {
      if (event.keyCode == 13)
      {
         $("#searchbutton").click();
      }
   });

   // Search button
   $("#searchbutton").kendoButton();
   $("#searchbutton").click(function ()
   {
      Tribridge.Protocol.LoadFilteredProtocols();
   });

   // Timeframe radio button
   $("#timeframeoh").click(function ()
   {
      Tribridge.Protocol.HoursOfOperation(HoursOfOperation.OfficeHours);
   });
   $("#timeframeah").click(function ()
   {
      Tribridge.Protocol.HoursOfOperation(HoursOfOperation.AfterHours);
   });

   // Protocols Grid
   $("#ProtocolsGrid").kendoGrid({
      selectable: true,
      groupable: false,
      sortable: false
   });

   // Protocols Definition listview
   $("#ProtocolsHdr").kendoListView({
   });

   // Protocols Definition listview
   $("#ProtocolsDef").kendoListView({
   });

   // Next button 
   $("#buttonnext1").kendoButton();
   $("#buttonnext1").click(function ()
   {
      Tribridge.Protocol.ProtocolNextOnClick();
   });

   //------------------------------------
   // Form Section 2 elements - Questions
   //------------------------------------
   // Questions listview
   $("#Questions").kendoListView({
   });

   // Prev button
   $("#buttonprev2").kendoButton();
   $("#buttonprev2").click(function ()
   {
      // Moving back to the first view state
      Tribridge.Protocol.SetViewState(1);
   });

   // Next button
   $("#buttonnext2").kendoButton();
   $("#buttonnext2").click(function ()
   {
      Tribridge.Protocol.QuestionNextAdvancedOnClick();
   });

   //--------------------------------------------------------------------------
   // Form Section 3 elements - Advice and where they select which one to apply
   //--------------------------------------------------------------------------
   // Advice listview
   $("#AdviceView").kendoListView({
   });

   // SelectedAdvice listview
   $("#SelectedAdvice").kendoListView({
   });

   // Prev button
   $("#buttonprev3").kendoButton();
   $("#buttonprev3").click(function ()
   {
      Tribridge.Protocol.SetViewState(2);
   });

   // Done button
   $("#buttonnext3").kendoButton();
   $("#buttonnext3").click(function ()
   {
      Tribridge.Protocol.AdviceSelectionDoneOnClick();
   });

   // Move button
   $("#buttonmove").kendoButton();
   $("#buttonmove").click(function ()
   {
      Tribridge.Protocol.AdviceMoveOnClick();
   });

   // And lastly, do a little housekeeping for the initialization process
   if (blnHasFormLoaded == 0)
   {
      debugger;
      // Load the Xrm object
      var Xrm = window.opener.Xrm;
      if (Xrm.Page != null)
      {
         // Get the Case Id
         Tribridge.Protocol.CaseID = Xrm.Page.data.entity.getId();

         // Get the Patient Id
         if (Xrm.Page.getAttribute("customerid") != null)
         {
            var lkpCustomer = new Array();
            lkpCustomer = Xrm.Page.getAttribute("customerid").getValue();

            Tribridge.Protocol.Patient.Id = lkpCustomer[0].id;
            Tribridge.Protocol.Patient.Name = lkpCustomer[0].name;
            Tribridge.Protocol.Patient.TypeName = lkpCustomer[0].typename;

            var jsondata = Tribridge.Protocol.FetchPatient(lkpCustomer[0].id);

            if (jsondata.length > 0)
            {
               Tribridge.Protocol.Patient.BirthDate = jsondata[0].birthdate;
               Tribridge.Protocol.Patient.GenderCode = jsondata[0].gendercode;
               Tribridge.Protocol.Patient.GenderCodeName = jsondata[0].gendercodename;
               Tribridge.Protocol.Patient.Age = Tribridge.Protocol.CalculateAge(jsondata[0].birthdate)
            }
         }
      }
      else
      {
         // Should not get this
         alert("Could not obtain reference to the Xrm object. Need Case ID.");
      }
      
      // Onload - set initial form state
      Tribridge.Protocol.SetViewState(1);

      // Determine the current Time Frame for Office HOurs of After Hours
      Tribridge.Protocol.SetDefaultTimeFrame();

      // Load Protocols based on Patient attributes
      Tribridge.Protocol.LoadProtocols();

      // Set the flag to indicatte form init has completed.
      blnHasFormLoaded = 1;
   }
}


//-------------------------------------------------------------------------------------------------------------
//                                            Button Click event methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Protocol.ProtocolNextOnClick = function ()
{
   try
   {
      // Get a reference to the protocol grid control
      var grid = $("#ProtocolsGrid").data("kendoGrid");
      var row = grid.select();
      if (row != null && row.length == 1)
      {
         // grab the selected row - should only be one
         var data = grid.dataItem(row);
         //alert(data.tri_title);
         //alert(data.tri_ah_algorithmid);

         // Set the heading for the next 2 sections based on the text of the selected protocol row
         $("#HeadingText2").text(data.tri_title);
         $("#HeadingText3").text(data.tri_title);

         // Set the view state to indicate we are moving to the second view
         Tribridge.Protocol.SetViewState(2);

         // Store the id of the selected protocol and load the questions to display in the list view
         Tribridge.Protocol.ProtocolID = data.tri_ah_algorithmid;
         Tribridge.Protocol.LoadProtocolQuestions(data.tri_ah_algorithmid);
      }
      else
      {
         alert("Please select a Protocol from the list.");
      }
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.QuestionNextOnClick = function ()
{
   var intCodeLocation = 0;
   try
   {
      debugger;
      if (Tribridge.Protocol.ProtocolID != null || Tribridge.Protocol.ProtocolID != "")
      {
         // Get the current Question selection
         var listView = $("#Questions").data("kendoListView");
         var selecteditem = listView.select();

         if (selecteditem == null || selecteditem.length <= 0)
         {
            alert("Please select a Question from the list.");
            return;
         }

         intCodeLocation++;            // 1

         // Create XmlDoc parser
         var domResult = new ActiveXObject("MSXML2.DOMDocument");
         domResult.async = false;
         domResult.preserveWhiteSpace = false;
         domResult.loadXML(selecteditem[0].innerHTML);

         intCodeLocation++;            // 2

         // Check for XML parse error
         if (domResult.parseError != null && domResult.parseError.errorCode != 0)
         {
            alert("Error parsing question text:" + domResult.parseError.reason);
            return;
         }

         intCodeLocation++;            // 3

         var tablenode = domResult.selectSingleNode("//table");
         var labelnodes = tablenode.getElementsByTagName("label");

         var questiontext = "";
         var questionid = "";
         var dispositionid = "";
         if (domResult.selectSingleNode("//table/tbody/tr/td/label[@id = 'tri_question']") != null)
         {
            questiontext = domResult.selectSingleNode("//table/tbody/tr/td/label[@id = 'tri_question']").text;
         }

         intCodeLocation++;            // 4

         // If user selected a header row, do not do anything
         if (Tribridge.Protocol.IsSelectionAHeader(questiontext) == true) return;

         // Test for empty question text. Should not gett this.
         if (questiontext == "")
         {
            alert("No question text found.");
         }

         intCodeLocation++;            // 5

         if (domResult.selectSingleNode("//table/tbody/tr/td/label[@id = 'tri_ah_questionid']") != null)
         {
            questionid = domResult.selectSingleNode("//table/tbody/tr/td/label[@id = 'tri_ah_questionid']").text;
         }
         if (domResult.selectSingleNode("//table/tbody/tr/td/label[@id = 'tri_dispositionid']") != null)
         {
            dispositionid = domResult.selectSingleNode("//table/tbody/tr/td/label[@id = 'tri_dispositionid']").text;
         }

         intCodeLocation++;            // 6

         // Check for empty strings - means could not find values in xml string. Should not happen unless the template changes.
         if (questionid == "" || dispositionid == "")
         {
            alert("Error: not able to parse the HTML to find the values for Question or Disposition. Please alert your administrator.");
            return;
         }

         intCodeLocation++;            // 7

         // Store the id values in the global variables for later use
         Tribridge.Protocol.QuestionID = questionid;
         Tribridge.Protocol.DispositionID = dispositionid;

         intCodeLocation++;            // 8

         // Set the view state to indicate we are moving to the third view
         Tribridge.Protocol.SetViewState(3);

         intCodeLocation++;            // 9

         // Make sure that no left over advice is left from a previous display of this view.
         Tribridge.Protocol.ClearSelectedAdvice();

         intCodeLocation++;            // 10

         // Load the Advice for the selected question record
         Tribridge.Protocol.LoadQuestionAdvice(questionid, Tribridge.Protocol.ProtocolID);
      }
      else
      {
         // Should never get this.
         alert("Error: No Protocol has been selected.");
      }
   }
   catch (excp)
   {
      alert("QuestionNextOnClick(" + intCodeLocation + "): " + excp.description);
   }
}

Tribridge.Protocol.QuestionNextAdvancedOnClick = function ()
{
   try
   {
      debugger;
      if (Tribridge.Protocol.ProtocolID != null || Tribridge.Protocol.ProtocolID != "")
      {
         // Verifiy the Yes selections. Returns object with count and string containing QuestionID and DispositionID
         var result = Tribridge.Protocol.CheckForYes();

         // Verify only one Yes question selected
         if (result.yescount <= 0)
         {
            alert("You have not selected Yes to a question. Please answer a question to Yes and resubmit.");
            return;
         }
         else if (result.yescount > 1)
         {
            alert("You have selected Yes to " + result.yescount + " questions. Please select only 1 Yes question and resubmit.");
            return;
         }
         else //if (result.yescount == 1)
         {
            // do nothing
         }

         // Check to see that we have returned the expected ids
         // Should never have issue here
         if (result.ids == undefined || result.ids == null)
         {
            // Should not get this
            alert("Unexpected error: Cannot obtain Question and/or Disposition");
         }

         // Store the id values in the global variables for later use
         var aryIDS = result.ids.split("::");
         Tribridge.Protocol.QuestionID = aryIDS[0];
         Tribridge.Protocol.DispositionID = aryIDS[1];

         // Load the QuestionResponse object
         Tribridge.Protocol.BuildQuestionResponse();

         // Set the view state to indicate we are moving to the third view
         Tribridge.Protocol.SetViewState(3);

         // Make sure that no left over advice is left from a previous display of this view.
         Tribridge.Protocol.ClearSelectedAdvice();

         // Load the Advice for the selected question record
         Tribridge.Protocol.LoadQuestionAdvice(Tribridge.Protocol.QuestionID, Tribridge.Protocol.ProtocolID);
      }
      else
      {
         // Should never get this.
         alert("Error: No Protocol has been selected.");
      }
   }
   catch (excp)
   {
      alert("QuestionNextAdvancedOnClick:" + excp.description);
   }
}

Tribridge.Protocol.AdviceSelectionDoneOnClick = function ()
{
   try
   {
      debugger;

      //if (Tribridge.Protocol.SelectedAdvice != null && Tribridge.Protocol.SelectedAdvice.length > 0)
      //if (Tribridge.Protocol.AdviceText != null && Tribridge.Protocol.AdviceText.length > 0)
      if (Tribridge.Protocol.AdviceTextPlain != null && Tribridge.Protocol.AdviceTextPlain.length > 0)
      {
         //alert("Tribridge.Protocol.SelectedAdvice:" + Tribridge.Protocol.SelectedAdvice[0].tri_adviceid);

         // Using window.opener because this window was opened using the window.open() 
         // command.  Must change the code if opened in any type of alternate way.
         var Xrm = window.opener.Xrm;
         if (Xrm.Page != null)
         {
            if (Xrm.Page.getAttribute("tri_algorithmid") != null)
            {
               // Set the Algorithm id
               Xrm.Page.getAttribute("tri_algorithmid").setValue([{ id: Tribridge.Protocol.ProtocolID, entityType: "tri_ah_algorithm", name: "" }]);
               Xrm.Page.getAttribute("tri_algorithmid").setSubmitMode("always");

               // Set the question id
               Xrm.Page.getAttribute("tri_questionid").setValue([{ id: Tribridge.Protocol.QuestionID, entityType: "tri_ah_question", name: "" }]);
               Xrm.Page.getAttribute("tri_questionid").setSubmitMode("always");

               // Set the disposition id
               Xrm.Page.getAttribute("tri_dispositionid").setValue([{ id: Tribridge.Protocol.DispositionID, entityType: "tri_ah_disposition", name: "" }]);
               Xrm.Page.getAttribute("tri_dispositionid").setSubmitMode("always");

               // Set the selectedadvice id
               //Xrm.Page.getAttribute("tri_adviceid").setValue([{ id: Tribridge.Protocol.AdviceID, entityType: "tri_ah_advice", name: "" }]);
               //Xrm.Page.getAttribute("tri_adviceid").setSubmitMode("always");

               // Loop thtru the selected advice array.
               var advicetext = "";
               // DMurray - comment out this loop to and save the inner text back to CRM record.
               //for (idm = 0; idm < Tribridge.Protocol.AdviceText.length; idm++)
               //{
               //   advicetext += Tribridge.Protocol.AdviceText[idm];
               //   advicetext += "\r\n";
               //}
               for (idm = 0; idm < Tribridge.Protocol.AdviceTextPlain.length; idm++)
               {
                  advicetext += Tribridge.Protocol.AdviceTextPlain[idm];
                  advicetext += "\r\n";
               }

               // Set the selectedadvice text
               Xrm.Page.getAttribute("tri_advicenotes").setValue(advicetext);
               Xrm.Page.getAttribute("tri_advicenotes").setSubmitMode("always");
            }

            // Save the questions off.

            // Call the form Save to make the selections permanent
            Xrm.Page.data.save().then(Tribridge.Protocol.Save_SuccessCallback, Tribridge.Protocol.Save_ErrorCallback);
         }
      }
      else
      {
         alert("No Advice entry has been selected.");
      }
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.AdviceMoveOnClick = function ()
{
   try
   {
      // Get the selected Advice item
      var listView = $("#AdviceView").data("kendoListView");

      // selects first list view item
      var selecteditem = listView.select();

      if (selecteditem == null || selecteditem.length <= 0)
      {
         alert("Please select an Advice from the list.");
         return;
      }
      debugger;

      var advicetext = Tribridge.Protocol.GetAdviceText(selecteditem[0].innerHTML);
      var advicetextplain = Tribridge.Protocol.GetAdviceText(selecteditem[0].innerText);
      var adviceid = Tribridge.Protocol.GetAdviceId(selecteditem[0].innerHTML);

      // Added code to remove the GUID from the end of the advicetextplain text. Trim 37 characters off.
      if (advicetextplain.length > 37)
      {
         advicetextplain = advicetextplain.substring(0, advicetextplain.length - 37);
      }

      // Save the advice text
      Tribridge.Protocol.AdviceText.push(advicetext);
      Tribridge.Protocol.AdviceTextPlain.push(advicetextplain);

      // Add item to Selected Advice view
      Tribridge.Protocol.LoadSelectedAdvice(adviceid, advicetext);

      // Set the global advice id value - may not be needed now?
      Tribridge.Protocol.AdviceID = adviceid;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.IsSelectionAHeader = function (strSelectedQuestion)
{
   try
   {
      // Verify that a header row wasnt selected
      if (Tribridge.Protocol.HeaderRows.length > 0)
      {
         for (idm = 0; idm < Tribridge.Protocol.HeaderRows.length; idm++)
         {
            if (strSelectedQuestion == Tribridge.Protocol.HeaderRows[idm])
            {
               return true;
            }
         }
      }
      return false;
   }
   catch (excp)
   {
      alert(excp.des);
   }
}

Tribridge.Protocol.NoToAllOnClick = function (sender, levelid)
{
   try
   {
      //alert("Click:" + levelid);
      var listView = $("#Questions").data("kendoListView");
      var datasource = listView.dataSource;
      var data = datasource.transport.data;

      // Get the levelid value (90, 80...) of the selected NO button because
      // we need to set all of the radios in this group to NO
      var aryArgs = levelid.split("-");

      // Loop thru the radio buttons for all the questions
      $("table tr td input[type=radio]").each(function ()
      {
         //alert($(this).attr('value'));

         // The ID contains 3 elements delimited with a dash - level, question order, and radio item identifier (a,b,or c)
         var aryName = $(this).attr('id').split("-");

         // If this level is the same as the one containing the selected button
         if (aryName[0] == aryArgs[0])
         {
            //alert($(this).attr('id') + "=" + $(this).is(':checked'));

            // Check that this is the No radio. We know the No radio option is tied to the "b" identifier
            if (aryName[2] == "b")
            {
               $(this).prop('checked', true);
            }
         }
      });
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.BuildQuestionResponse = function ()
{
   var intCodeLocation = 0;

   try
   {
      //debugger;

      // Get a reference to the datasource
      var listView = $("#Questions").data("kendoListView");
      var datasource = listView.dataSource;
      var data = datasource.transport.data;
      var numrecs = data.length;

      // First populate the object with the existing question information
      Tribridge.Protocol.QuestionResponse = $.extend({}, data);

      intCodeLocation++;               // 1

      // Now add the Responses in
      $("table tr td input[type=radio]").each(function ()
      {
         // Get the object containing questionid
         var aryName = $(this).attr('name').split("::");
         var aryID = $(this).attr('id').split("-");
         var responseindex = 0;

         if ($(this).is(':checked'))
         {
            // Match the yes/no/na to the optionset values
            if (aryID[2] == "a")
               responseindex = QuestionResponse.Yes;       //167410000;
            else if (aryID[2] == "b")
               responseindex = QuestionResponse.No;        //167410001;
            else if (aryID[2] == "c")
               responseindex = QuestionResponse.NA;        //167410002;

            // Using the question id value, find the array element and add the answer.
            for (i = 0; i < numrecs; i++)
            {
               if (Tribridge.Protocol.QuestionResponse[i].tri_ah_questionid == aryName[0] && 
                   Tribridge.Protocol.QuestionResponse[i].tri_colorhex == "")
               {
                  Tribridge.Protocol.QuestionResponse[i].questionresponse = responseindex;
                  //alert("Found question");
                  break;
               }
            }
         }
      });

      intCodeLocation++;               // 2

      debugger;
      // Now add the text notes in
      $("table tr td input[type=text]").each(function ()
      {
         // Get the object containing questionid
         var aryName = $(this).attr('name').split("::");       // format is txt::GUID::GUID
         var aryID = $(this).attr('id').split("-");            // format is txt-levelid-questionorder

         if ($(this).val() != "")
         {
            // Using the question id value, find the array element and add the answer.
            for (i = 0; i < numrecs; i++)
            {
               if (Tribridge.Protocol.QuestionResponse[i].tri_ah_questionid == aryName[1] &&
                   Tribridge.Protocol.QuestionResponse[i].tri_colorhex == "")
               {
                  Tribridge.Protocol.QuestionResponse[i].text = $(this).val();
                  //alert("Found question");
                  break;
               }
            }
         }
      });

      intCodeLocation++;               // 3

      //debugger;
      // Save the records
      for (cnt = 0; cnt < numrecs; cnt++)
      {
         // Filter out the Header rows that are part of the dataset so we only save the actual questions.
         if (Tribridge.Protocol.QuestionResponse[cnt].tri_colorhex == "" && Tribridge.Protocol.QuestionResponse[cnt].questionresponse > 0)
         {
            var Response = {};
            var incident = { Id: Tribridge.Protocol.CaseID, LogicalName: "incident", Name: "" };
            var question = { Id: Tribridge.Protocol.QuestionResponse[cnt].tri_ah_questionid, LogicalName: "tri_ah_question", Name: "" };
            var protocol = { Id: Tribridge.Protocol.ProtocolID, LogicalName: "tri_ah_algorithm", Name: "" };
            var answer = { Value: Tribridge.Protocol.QuestionResponse[cnt].questionresponse };
            var textvalue = "";
            if (Tribridge.Protocol.QuestionResponse[cnt].text != undefined && Tribridge.Protocol.QuestionResponse[cnt].text != "")
            {
               textvalue = Tribridge.Protocol.QuestionResponse[cnt].text;
            }
            
            Response.tri_incidentid = incident;
            Response.tri_questionid = question;
            Response.tri_algorithmid = protocol;
            Response.tri_response = answer;
            if (textvalue != "")
            {
               Response.tri_comments = textvalue;
            }
            Response.tri_name = "Question Response";

            Tribridge.OData.CreateRecord(Response, 'tri_ah_questionresponseSet', Tribridge.Protocol.ResponseSave_SuccessCallback, Tribridge.Protocol.ResponseSave_FailureCallback);
         }
      }

      intCodeLocation++;               // 4

   }
   catch (excp)
   {
      alert("BuildQuestionResponse (" + intCodeLocation + "):" + excp.description);
   }
}

Tribridge.Protocol.HoursOfOperation = function (type)
{
   //alert("Tribridge.Protocol.HoursOfOperation:" + type);

   try
   {
      Tribridge.Protocol.SelectedHoursOfOperations = type;

      var grid = $("#ProtocolsGrid").data("kendoGrid");
      //grid.dataSource.read();

      if (type == HoursOfOperation.OfficeHours)
      {
         Tribridge.Protocol.SetProtocolHeaderText(Tribridge.Protocol.OfficeHours.length);
         grid.dataSource.data(Tribridge.Protocol.OfficeHours);
      }
      else
      {
         Tribridge.Protocol.SetProtocolHeaderText(Tribridge.Protocol.AfterHours.length);
         grid.dataSource.data(Tribridge.Protocol.AfterHours);
      }
   }
   catch (excp)
   {
      alert(excp.description);
   }
}


//-------------------------------------------------------------------------------------------------------------
//                                               Miscellaneous methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Protocol.SetViewState = function (intState)
{
   //alert("Tribridge.Protocol.SetViewState:" + intState);

   try
   {
      if (intState == 1)
      {
         $('#section1').show();
         $('#section2').hide();
         $('#section3').hide();
      }
      else if (intState == 2)
      {
         $('#section1').hide();
         $('#section2').show();
         $('#section3').hide();
      }
      else if (intState == 3)
      {
         $('#section1').hide();
         $('#section2').hide();
         $('#section3').show();
      }
      else
      {
         alert("Invalid view state provided.");
      }
   }
   catch (excp)
   {
      alert(excp.description);
   }
};

Tribridge.Protocol.TransformToJson = function (fetchXmlResults, aryQueryFieldnames)
{
   //alert("Tribridge.Protocol.TransformToJson");
   var jsonObject = [];

   try
   {
      // Check for null or empty parameters
      if (fetchXmlResults == null)
      {
         alert("Tribridge.Protocol.TransformToJson: null FetchXml argument");
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
         var fields = {};
         for (fieldcount = 0; fieldcount < aryQueryFieldnames.length; fieldcount++)
         {
            // Get the field name for the array
            var currentfield = aryQueryFieldnames[fieldcount];

            // Check that it is in the result set
            if (fetchXmlResults[recordcount].Properties[currentfield] != null)
            {
               var value = "";
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

Tribridge.Protocol.TransformToJson_Questions = function (fetchXmlResults, aryQueryFieldnames)
{
   //alert("Tribridge.Protocol.TransformToJson_Questions");
   var jsonObject = [];

   try
   {
      // Check for null or empty parameters
      if (fetchXmlResults == null)
      {
         alert("null FetchXml argument");
         return {};
      }
      if (fetchXmlResults.length == 0)
      {
         alert("No questions found for the selected Protocol");
         return {};
      }
      if (aryQueryFieldnames == null || aryQueryFieldnames.length == 0)
      {
         alert("null FetchXml argument");
         return {};
      }

      //debugger;
      // Loop thru the Query fieldnames to build the return JSON object
      var lastlevelid = "";
      for (recordcount = 0; recordcount < fetchXmlResults.length; recordcount++)
      {
         // Build the array for each record and then load into the JSON object
         var fields = {};
         for (fieldcount = 0; fieldcount < aryQueryFieldnames.length; fieldcount++)
         {
            // Get the field name for the array
            var currentfield = aryQueryFieldnames[fieldcount];

            // Check that it is in the result set
            if (fetchXmlResults[recordcount].Properties[currentfield] != null)
            {
               var value = fetchXmlResults[recordcount].Properties[currentfield].Value;

               fields[currentfield] = value;
            }
         }

         // If the QuestionXhtml field is not empty, use it for the question instead of the Question plain text
         if (fields.tri_questionxhtml != null && fields.tri_questionxhtml != "")
         {
            fields["tri_question"] = fields.tri_questionxhtml;
         }

         // Now load this record into the JSON object to be returned
         if (recordcount == 0)
         {
            // the very first time thru, add the column heading.
            var headerrec = {};
            headerrec = $.extend({}, fields);
            headerrec.tri_question = headerrec.tri_heading;
            jsonObject.push(headerrec);

            // Add the header text to the array for later use
            Tribridge.Protocol.HeaderRows.push(headerrec.tri_heading);
         }
         else if (fields.tri_levelid != lastlevelid)
         {
            // We have a change of levels so we need to insert a header row before we add the data row.
            var headerrec = {};
            headerrec = $.extend({}, fields);                  // $.extend copies the fields object into the headerrec object.
            headerrec.tri_question = headerrec.tri_heading;    // Place the heading text where the question is so it will print out
            jsonObject.push(headerrec);

            // Add the header text to the array for later use
            Tribridge.Protocol.HeaderRows.push(headerrec.tri_heading);
         }

         // remove the row color for the fields row so we wont display a color. Only headers should have a color value.
         fields["tri_colorhex"] = "";
         jsonObject.push(fields);
         lastlevelid = fields.tri_levelid;
      }

      return jsonObject;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.TransformToJson_Advice = function (fetchXmlResults, aryQueryFieldnames)
{
   //alert("Tribridge.Protocol.TransformToJson_Advice");
   var jsonObject = [];

   try
   {
      // Check for null or empty parameters
      if (fetchXmlResults == null)
      {
         alert("null FetchXml argument");
         return {};
      }
      if (fetchXmlResults.length == 0)
      {
         alert("No advice found for the selected question");
         return {};
      }
      if (aryQueryFieldnames == null || aryQueryFieldnames.length == 0)
      {
         alert("null FetchXml argument");
         return {};
      }

      //debugger;
      // Loop thru the Query fieldnames to build the return JSON object
      var lastlevelid = "";
      for (recordcount = 0; recordcount < fetchXmlResults.length; recordcount++)
      {
         // Build the array for each record and then load into the JSON object
         var fields = {};
         for (fieldcount = 0; fieldcount < aryQueryFieldnames.length; fieldcount++)
         {
            // Get the field name for the array
            var currentfield = aryQueryFieldnames[fieldcount];

            // Check that it is in the result set
            if (fetchXmlResults[recordcount].Properties[currentfield] != null)
            {
               var value = fetchXmlResults[recordcount].Properties[currentfield].Value;

               fields[currentfield] = value;
            }
         }

         // Now load this record into the JSON object to be returned
         if (recordcount == 0)
         {
            // the very first time thru, add the column heading.
            if (fields.tri_subheadingorder != 0)
            {
               var headerrec = {};
               headerrec = $.extend({}, fields);

               var headingtext = "";
               if (fields.tri_subheadingorder == 1)
               {
                  headingtext = headerrec.tri_hca_subheading1;
               }
               else if (fields.tri_subheadingorder == 2)
               {
                  headingtext = headerrec.tri_hca_subheading2;
               }
               else if (fields.tri_subheadingorder == 3)
               {
                  headingtext = headerrec.tri_hca_subheading3;
               }
               else if (fields.tri_subheadingorder == 4)
               {
                  headingtext = headerrec.tri_hca_subheading4;
               }
               else if (fields.tri_subheadingorder == 5)
               {
                  headingtext = headerrec.tri_hca_subheading5;
               }

               headerrec.tri_advicexhtml = headingtext;            // Place the subheading heading text where the advice is so it will print out
               jsonObject.push(headerrec);
            }

            // Add the header text to the array for later use
            //Tribridge.Protocol.HeaderRows.push(headerrec.tri_heading);
         }
         else if (fields.tri_subheadingorder != lastlevelid)
         {
            if (fields.tri_subheadingorder != 0)
            {

               // We have a change of levels so we need to insert a header row before we add the data row.
               var headerrec = {};
               headerrec = $.extend({}, fields);                     // $.extend copies the fields object into the headerrec object.

               var headingtext = "";
               if (fields.tri_subheadingorder == 1)
               {
                  headingtext = headerrec.tri_hca_subheading1;
               }
               else if (fields.tri_subheadingorder == 2)
               {
                  headingtext = headerrec.tri_hca_subheading2;
               }
               else if (fields.tri_subheadingorder == 3)
               {
                  headingtext = headerrec.tri_hca_subheading3;
               }
               else if (fields.tri_subheadingorder == 4)
               {
                  headingtext = headerrec.tri_hca_subheading4;
               }
               else if (fields.tri_subheadingorder == 5)
               {
                  headingtext = headerrec.tri_hca_subheading5;
               }

               headerrec.tri_advicexhtml = headingtext;            // Place the subheading heading text where the advice is so it will print out
               jsonObject.push(headerrec);
            }

            // Add the header text to the array for later use
            //Tribridge.Protocol.HeaderRows.push(headerrec.tri_heading);
         }

         // remove the row subheading order value for the fields row so we wont display heading text format. Only headers should have a subheading order value.
         lastlevelid = fields.tri_subheadingorder;
         if (fields.tri_subheadingorder != 0)
         {
            fields["tri_subheadingorder"] = "";
         }

         if (typeof (fields.tri_advicexhtml) != "undefined")
         {
            // Copy the xhtml over to advice cuz some protocols dont have xhtml and we dont want to have to check 2 fiels for data.
            // Will just always use the advice text.
            fields["tri_advice"] = fields["tri_advicexhtml"];
         }
         jsonObject.push(fields);
      }

      return jsonObject;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.CheckForYes = function ()
{
   try
   {
      var result = {};
      result.yescount = 0;
      result.ids = "";
      var yescount = 0;

      debugger;

      // Get reference to the questions dataset
      var listView = $("#Questions").data("kendoListView");
      var datasource = listView.dataSource;
      var data = datasource.transport.data;

      var element = null;

      // Loop thru the radio buttons for all the questions
      $("table tr td input[type=radio]").each(function ()
      {
         //alert($(this).attr('value'));

         // The ID contains 3 elements delimited with a dash - level, question order, and radio item identifier (a, b, or c)
         var aryID = $(this).attr('id').split("-");

         // Check that this is the Yes radio. We know the Yes radio option is tied to the "a" identifier
         if (aryID[2] == "a")
         {
            if ($(this).is(':checked'))
            {
               yescount++;
               result.ids = $(this).attr('name');
            }
         }
      });

      result.yescount = yescount;
      return result;

   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.CalculateAge = function (strbirthdate)
{
   try
   {
      if (strbirthdate == null || strbirthdate == "") return -1;

      var today = new Date();
      var birthDate = new Date(strbirthdate);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
      {
         age--;
      }
      return age;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.ParseAfterOfficeHours = function (jsondata)
{
   try
   {
      for (recordcount = 0; recordcount < jsondata.length; recordcount++)
      {
         if (jsondata[recordcount].tri_descriptorname == HoursOfOperationDescriptor.AfterHours)
         {
            Tribridge.Protocol.AfterHours.push(jsondata[recordcount])
         }
         else
         {
            Tribridge.Protocol.OfficeHours.push(jsondata[recordcount]);
         }
      }

      //----------------------------------------
      // Return array based on active time frame
      //----------------------------------------
      if (Tribridge.Protocol.SelectedHoursOfOperations == HoursOfOperation.OfficeHours)
      {
         Tribridge.Protocol.SetProtocolHeaderText(Tribridge.Protocol.OfficeHours.length);
         return Tribridge.Protocol.OfficeHours;
      }
      else if (Tribridge.Protocol.SelectedHoursOfOperations == HoursOfOperation.AfterHours)
      {
         Tribridge.Protocol.SetProtocolHeaderText(Tribridge.Protocol.AfterHours.length);
         return Tribridge.Protocol.AfterHours;
      }
      else
      {
         Tribridge.Protocol.SetTimeFrame(HoursOfOperation.OfficeHours, true);
         Tribridge.Protocol.SetProtocolHeaderText(Tribridge.Protocol.OfficeHours.length);
         return Tribridge.Protocol.OfficeHours;
      }
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.SetProtocolHeaderText = function (recordcount)
{
   try
   {
      if (recordcount > 0)
      {
         Tribridge.Protocol.ProtocolHeaderText = "PROTOCOLS [" + recordcount + "]";
      }
      else
      {
         Tribridge.Protocol.ProtocolHeaderText = "PROTOCOLS [No records found]";
      }
      $("#ProtocolsGrid th[data-field=tri_title]").html(Tribridge.Protocol.ProtocolHeaderText);
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.SetTimeFrame = function (type, blnValue)
{
   try
   {
      if (type == HoursOfOperation.OfficeHours)
      {
         $('#timeframeoh').attr('checked', blnValue);
      }
      else
      {
         $('#timeframeah').attr('checked', blnValue);
      }
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.ClearTimeFramesCollections = function ()
{
   try
   {
      Tribridge.Protocol.OfficeHours = [];
      Tribridge.Protocol.AfterHours = [];
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.SetDefaultTimeFrame = function ()
{
   try
   {
      debugger;

      var currentdt = new Date();

      //-----------------------------------------------------------------
      // If the current time is within the Ofice Hours range, seto to OH.
      //-----------------------------------------------------------------
      if (currentdt.getHours() >= OfficeHours.Open && currentdt.getHours() <= OfficeHours.Close)
      {
         Tribridge.Protocol.SetTimeFrame(HoursOfOperation.OfficeHours, true);
         Tribridge.Protocol.SelectedHoursOfOperations = HoursOfOperation.OfficeHours;
      }
      else
      {
         Tribridge.Protocol.SetTimeFrame(HoursOfOperation.AfterHours, true);
         Tribridge.Protocol.SelectedHoursOfOperations = HoursOfOperation.AfterHours;
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
Tribridge.Protocol.FetchProtocols = function (searchstring)
{
   debugger;
   try
   {
      //------------------------------------------------------------------
      // If there is a search string value, use the alternate query method
      //------------------------------------------------------------------
      if (searchstring != "") return Tribridge.Protocol.FetchProtocols2(searchstring);

      var fetchxml = "";
      var filterage = "";
      var filtergender = "<filter type='or'>" +
                         "<condition attribute='tri_gender' value='167410001' operator='eq'/>" +
                         "<condition attribute='tri_gender' value='167410002' operator='eq'/>" +
                         "<condition attribute='tri_gender' value='167410000' operator='eq'/>" +
                         "</filter>";

      //----------------------------------------
      // If we have an age, setup the age filter
      //----------------------------------------
      if (Tribridge.Protocol.Patient.Age >= 0)
      {
         filterage = "<condition attribute='tri_maxageyears' value='" + Tribridge.Protocol.Patient.Age + "' operator='ge'/>";
         filterage += "<condition attribute='tri_minageyears' value='" + Tribridge.Protocol.Patient.Age + "' operator='le'/>";
      }
      
      if (Tribridge.Protocol.Patient.GenderCodeName == "Male")
      {
         // Filter Male or Both
         filtergender = "<filter type='or'>" +
                        "<condition attribute='tri_gender' value='167410000' operator='eq'/>" +
                        "<condition attribute='tri_gender' value='167410002' operator='eq'/>" +
                        "</filter>";
      }
      else if (Tribridge.Protocol.Patient.GenderCodeName == "Female")
      {
         // Filter Female or Both
         filtergender = "<filter type='or'>" +
                        "<condition attribute='tri_gender' value='167410001' operator='eq'/>" +
                        "<condition attribute='tri_gender' value='167410002' operator='eq'/>" +
                        "</filter>";
      }

      // Build the FetchXml statement
      fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='1000' >" +
                  "<entity name='" + "tri_ah_algorithm" + "'>" +
                  "<attribute name='tri_title' alias='tri_title'" + " />" +
                  "<attribute name='tri_ah_algorithmid' alias='tri_ah_algorithmid'" + " />" +
                  "<attribute name='tri_category' alias='tri_category'" + " />" +
                  "<attribute name='tri_descriptor' alias='tri_descriptor'" + " />" +
                  "<attribute name='tri_gender' alias='tri_gender'" + " />" +
                  "<attribute name='tri_minageyears' alias='tri_minageyears'" + " />" +
                  "<attribute name='tri_maxageyears' alias='tri_maxageyears'" + " />" +
                  "<attribute name='tri_minagemonths' alias='tri_minagemonths'" + " />" +
                  "<attribute name='tri_maxagemonths' alias='tri_maxagemonths'" + " />" +
                  "<attribute name='tri_anatomyid' alias='tri_anatomyid'" + " />" +
                  "<attribute name='tri_systemid' alias='tri_systemid'" + " />" +
                  "<attribute name='tri_no_hcasubheadings' alias='tri_no_hcasubheadings'" + " />" +
                  "<order descending='false' attribute='tri_title'/>" +
                  "<filter type='and'>" +
                  "<condition attribute='statecode' value='0' operator='eq'/>";

      fetchxml += filterage;
      fetchxml += filtergender;
      fetchxml += "</filter></entity></fetch>";
      //alert(fetchxml);

      // Retrieve the data and then convert to JSON object for data source
      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = Tribridge.Protocol.TransformToJson(res, Tribridge.Protocol.ProtocolQueryFields);

      // Parse into After/Office hours
      //return jsondata;
      return Tribridge.Protocol.ParseAfterOfficeHours(jsondata);

   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.FetchProtocols2 = function (searchstring)
{
   debugger;
   try
   {
      //if (Tribridge.Protocol.Patient.Id != "undefined")
      //{
      //   // Do something
      //}

      var fetchxml = "";
      var filterage = "";
      var filtergender = "<filter type='or'>" +
                         "<condition attribute='tri_gender' value='167410001' operator='eq'/>" +
                         "<condition attribute='tri_gender' value='167410002' operator='eq'/>" +
                         "<condition attribute='tri_gender' value='167410000' operator='eq'/>" +
                         "</filter>";

      //----------------------------------------
      // If we have an age, setup the age filter
      //----------------------------------------
      if (Tribridge.Protocol.Patient.Age >= 0)
      {
         filterage = "<condition attribute='tri_maxageyears' value='" + Tribridge.Protocol.Patient.Age + "' operator='ge'/>";
         filterage += "<condition attribute='tri_minageyears' value='" + Tribridge.Protocol.Patient.Age + "' operator='le'/>";
      }

      if (Tribridge.Protocol.Patient.GenderCodeName == "Male")
      {
         // Filter Male or Both
         filtergender = "<filter type='or'>" +
                        "<condition attribute='tri_gender' value='167410000' operator='eq'/>" +
                        "<condition attribute='tri_gender' value='167410002' operator='eq'/>" +
                        "</filter>";
      }
      else if (Tribridge.Protocol.Patient.GenderCodeName == "Female")
      {
         // Filter Female or Both
         filtergender = "<filter type='or'>" +
                        "<condition attribute='tri_gender' value='167410001' operator='eq'/>" +
                        "<condition attribute='tri_gender' value='167410002' operator='eq'/>" +
                        "</filter>";
      }

      // Build the FetchXml statement
      var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true' count='500' >" +
                     "<entity name='" + "tri_ah_algorithm" + "'>" +
                     "<attribute name='tri_title' alias='tri_title'" + " />" +
                     "<attribute name='tri_ah_algorithmid' alias='tri_ah_algorithmid'" + " />" +
                     "<attribute name='tri_category' alias='tri_category'" + " />" +
                     "<attribute name='tri_descriptor' alias='tri_descriptor'" + " />" +
                     "<attribute name='tri_gender' alias='tri_gender'" + " />" +
                     "<attribute name='tri_minageyears' alias='tri_minageyears'" + " />" +
                     "<attribute name='tri_maxageyears' alias='tri_maxageyears'" + " />" +
                     "<attribute name='tri_minagemonths' alias='tri_minagemonths'" + " />" +
                     "<attribute name='tri_maxagemonths' alias='tri_maxagemonths'" + " />" +
                     "<attribute name='tri_anatomyid' alias='tri_anatomyid'" + " />" +
                     "<attribute name='tri_systemid' alias='tri_systemid'" + " />" +
                     "<attribute name='tri_no_hcasubheadings' alias='tri_no_hcasubheadings'" + " />" +
                     "<order descending='false' attribute='tri_title'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='statecode' value='0' operator='eq'/>";
      
      fetchxml += filterage;
      fetchxml += filtergender;
      fetchxml += "</filter>" +
                  "<link-entity name='tri_ah_algorithmsearch' link-type='inner' from='tri_algorithmid' to='tri_ah_algorithmid'>" +
                  "<filter type='and'>" +
                  "<condition attribute='tri_searchword' value='" + searchstring + "%' operator='like'/>" +
                  //"<condition attribute='statecode' value='0' operator='eq'/>" +
                  "</filter>" +
                  "</link-entity>" +
                  "</entity></fetch>";
      //alert(fetchxml);

      // Retrieve the data and then convert to JSON object for data source
      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = Tribridge.Protocol.TransformToJson(res, Tribridge.Protocol.ProtocolQueryFields);

      //return jsondata;
      return Tribridge.Protocol.ParseAfterOfficeHours(jsondata);

   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.LoadProtocols = function ()
{
   //alert("Tribridge.Protocol.LoadProtocols");
   try
   {
      // Protocols Grid
      $("#ProtocolsGrid").kendoGrid({
         //dataSource: jsondata,
         dataSource: {
            transport: {
               read: function (options)
               {
                  var datafilter = "";
                  if (options.data != null && options.data.data != undefined)
                  {
                     // filter is passed in the options.data object with the name "data"
                     datafilter = options.data.data;
                  }
                  options.success(Tribridge.Protocol.FetchProtocols(datafilter));
               }
            },
            schema: {
               model: {
                  fields: {
                     tri_ah_algorithmid: { type: "string" },
                     tri_title: { type: "string"}
                  }
               }
            },
         },
         //filterable: {
         //   mode: "row"
         //},
         selectable: true,
         groupable: false,
         sortable: false,
         change: function (e)
         {
            var selectedRows = this.select();
            for (var i = 0; i < selectedRows.length; i++)
            {
               var dataItem = this.dataItem(selectedRows[i]);

               Tribridge.Protocol.NumberOfSubheadings = 0;
               if (dataItem.tri_no_hcasubheadings != null)
               {
                  Tribridge.Protocol.NumberOfSubheadings = dataItem.tri_no_hcasubheadings;
               }

               Tribridge.Protocol.LoadProtocolDefinition(dataItem.tri_ah_algorithmid);

               Tribridge.Protocol.LoadProtocolHeader(dataItem);

               // Reset the HeaderRows array
               Tribridge.Protocol.HeaderRows = [];
            }
         },
         columns: [{
            field: "tri_ah_algorithmid",
            title: "ID"
         },
         {
            field: "tri_gendername",
            title: "Gender"
         },
         {
            field: "tri_title",
            title: "PROTOCOLS"
         }]
      });

      // The first column is the record id
      $("#ProtocolsGrid").data("kendoGrid").hideColumn(0);
      $("#ProtocolsGrid").data("kendoGrid").hideColumn(1);

      //$("#ProtocolsGrid th[data-field=tri_title]").html(Tribridge.Protocol.ProtocolHeaderText);

   }
   catch (excp)
   {
      alert("Tribridge.Protocol.LoadProtocols:" + excp.description);
   }
}

Tribridge.Protocol.LoadFilteredProtocols = function ()
{
   //alert("Tribridge.Protocol.LoadFilteredProtocols");
   try
   {
      debugger;

      // Get the search string entered
      var searchstring = $('#searchstring').val();
      
      // Setup an array element
      var filterval = {};
      if (searchstring != null && searchstring != "")
      {
         // Load the search string into the array element for passing to the search string
         filterval = { data: searchstring };
      }

      // Clear the existing collections
      Tribridge.Protocol.ClearTimeFramesCollections();

      // Get a pointer to the grid control and call the read object
      var grid = $("#ProtocolsGrid").data("kendoGrid");
      grid.dataSource.read(filterval);

   }
   catch (excp)
   {
      alert("Tribridge.Protocol.LoadFilteredProtocols:" + excp.description);
   }
}

Tribridge.Protocol.LoadProtocolDefinition = function (protocolid)
{
   //alert("Tribridge.Protocol.LoadProtocolDefinition");
   try
   {
      var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true' count='500' >" +
                     "<entity name='" + "tri_ah_algorithm" + "'>" +
                     "<attribute name='tri_definitionxhtml' alias='tri_definitionxhtml'" + " />" +
                     "<attribute name='tri_ah_algorithmid' alias='tri_ah_algorithmid'" + " />" +
                     "<filter type='and'>" +
                     "<condition attribute='statecode' value='0' operator='eq'/>" +
                     "<condition attribute='tri_ah_algorithmid' value='" + protocolid + "' operator='eq'/>" +
                     "</filter>" +
                     "</entity></fetch>";
      //alert(fetchxml);

      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = Tribridge.Protocol.TransformToJson(res, Tribridge.Protocol.ProtocolDefinitionQueryFields);

      var dataSource = new kendo.data.DataSource({
         data: jsondata,
         pageSize: 500
      });

      $("#ProtocolsDef").kendoListView({
         dataSource: dataSource,
         template: "<div>DEFINITION<br>#=tri_definitionxhtml#<br></div>",
         selectable: false
      });
   }
   catch (excp)
   {
      alert("Tribridge.Protocol.LoadProtocolDefinition:" + excp.description);
   }
}

Tribridge.Protocol.LoadProtocolQuestions = function (protocolid)
{
   //alert("Tribridge.Protocol.LoadProtocolQuestions");
   try
   {
      var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='500'>" +
                     "<entity name='" + "tri_ah_disposition" + "'>" +
                     "<attribute name='tri_levelid' alias='tri_levelid'/>" +
                     "<attribute name='tri_heading' alias='tri_heading'/>" +
                     "<attribute name='tri_colorid' alias='tri_colorid'/>" +
                     "<order descending='true' attribute='tri_levelid'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='tri_levelid' value='1' operator='ge'/>" +
                     "<condition attribute='tri_maindisposition' value='1' operator='eq'/>" +
                     "<condition attribute='statecode' value='0' operator='eq'/>" +
                     "</filter>" +
                     "<link-entity name='tri_ah_question' alias='aa' from='tri_dispositionid' to='tri_ah_dispositionid'>" +
                     "<attribute name='tri_question' alias='tri_question'" + " />" +
                     "<attribute name='tri_questionxhtml' alias='tri_questionxhtml'" + " />" +
                     "<attribute name='tri_questionorder' alias='tri_questionorder'" + " />" +
                     "<attribute name='tri_dispositionid' alias='tri_dispositionid'" + " />" +
                     "<attribute name='tri_ah_questionid' alias='tri_ah_questionid'" + " />" +
                     "<order descending='false' attribute='tri_questionorder'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='statecode' value='0' operator='eq'/>" +
                     "<condition attribute='tri_algorithmid' value='" + protocolid + "' operator='eq'/>" +
                     "</filter>" +
                     "</link-entity>" +
                     "<link-entity name='tri_ah_color' alias='bb' from='tri_ah_colorid' to='tri_colorid' link-type='outer'>" +
                     "<attribute name='tri_colorhex' alias='tri_colorhex'" + " />" +
                     "<attribute name='tri_colorname' alias='tri_colorname'" + " />" +
                     "<attribute name='tri_textcolorhex' alias='tri_textcolorhex'" + " />" +
                     "</link-entity>" +
                     "</entity></fetch>";
      //alert(fetchxml);

      debugger;
      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = Tribridge.Protocol.TransformToJson_Questions(res, Tribridge.Protocol.ProtocolQuestionQueryFields);

      var dataSource = new kendo.data.DataSource({
         data: jsondata,
         pageSize: 500
      });

      if (typeof(jsondata.length) == "undefined")
      {
         dataSource = [];
      }

      $("#Questions").kendoListView({
         dataSource: dataSource,
         template: kendo.template($("#QuestionTemplate").html()),
         selectable: true
      });
   }
   catch (excp)
   {
      alert("Tribridge.Protocol.LoadProtocolQuestions:" + excp.description);
   }
}

Tribridge.Protocol.LoadProtocolHeader = function (rowarray)
{
   //alert("Tribridge.Protocol.LoadProtocolHeader");
   try
   {
      var htmltemplate = "";
      var jsondata = [
                         {
                            tri_categoryname: rowarray.tri_categoryname,
                            tri_descriptorname: rowarray.tri_descriptorname,
                            tri_anatomyidname: rowarray.tri_anatomyidname,
                            tri_gendername: rowarray.tri_gendername,
                            tri_maxagemonths: rowarray.tri_maxagemonths,
                            tri_maxageyears: rowarray.tri_maxageyears,
                            tri_minagemonths: rowarray.tri_minagemonths,
                            tri_minageyears: rowarray.tri_minageyears,
                            tri_systemidname: rowarray.tri_systemidname,
                            tri_title: rowarray.tri_title
                         }
                     ]

      if (rowarray.tri_categoryname != null && (rowarray.tri_categoryname == "Pediatric" || rowarray.tri_categoryname == "Pediatric Guideline"))
      {
         // Include months only for Pediatrics
         htmltemplate = "<div style='font-family: Tahoma; font-size: 14px;'>" +
                        "<table><tr>" +
                        "<td style='font-family: Tahoma; font-size: 14px; font-weight: bold' colspan='3'>#:tri_title#</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='category' style='font-weight:'>Category:&nbsp;&nbsp;</label>" +
                        "<label id='categoryval' style='font-style:normal'>#:tri_categoryname#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "<label id='descriptor' style=''>Descriptor:&nbsp;&nbsp;</label>" +
                        "<label id='descriptorval' style='font-style:normal'>#:tri_descriptorname#</label>" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='system' style=''>System:&nbsp;&nbsp;</label>" +
                        "<label id='systemval' style='font-style:normal'>#:tri_systemidname#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "<label id='anatomy' style=''>Anatomy:&nbsp;&nbsp;</label>" +
                        "<label id='anatomyval' style='font-style:normal'>#:tri_anatomyidname#</label>" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='minageyrs' style=''>Min Age Years:&nbsp;&nbsp;</label>" +
                        "<label id='minageyrsval' style=''>#:tri_minageyears#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "<label id='minagemths' style=''>Months:&nbsp;&nbsp;</label>" +
                        "<label id='minagemthsval' style=''>#:tri_minagemonths#</label>" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='maxageyrs' style=''>Max Age Years:&nbsp;&nbsp;</label>" +
                        "<label id='maxageyrsval' style=''>#:tri_maxageyears#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "<label id='maxagemths' style='font-weight:'>Months:&nbsp;&nbsp;</label>" +
                        "<label id='maxagemthsval' style=''>#:tri_maxagemonths#</label>" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='gender' style='font-weight:'>Gender:&nbsp;&nbsp;</label>" +
                        "<label id='genderval' style=''>#:tri_gendername#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>&nbsp;</td>" +
                        "</tr>" +
                        "</table>" +
                        "</div>";
      }
      else
      {
         htmltemplate = "<div style='font-family: Tahoma; font-size: 14px;'>" +
                        "<table><tr>" +
                        "<td style='font-family: Tahoma; font-size: 14px; font-weight: bold' colspan='3'>#:tri_title#</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='category' style='font-weight:'>Category:&nbsp;&nbsp;</label>" +
                        "<label id='categoryval' style='font-style:normal'>#:tri_categoryname#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "<label id='descriptor' style=''>Descriptor:&nbsp;&nbsp;</label>" +
                        "<label id='descriptorval' style='font-style:normal'>#:tri_descriptorname#</label>" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='system' style=''>System:&nbsp;&nbsp;</label>" +
                        "<label id='systemval' style='font-style:normal'>#:tri_systemidname#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "<label id='anatomy' style=''>Anatomy:&nbsp;&nbsp;</label>" +
                        "<label id='anatomyval' style='font-style:normal'>#:tri_anatomyidname#</label>" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='minageyrs' style=''>Min Age Years:&nbsp;&nbsp;</label>" +
                        "<label id='minageyrsval' style=''>#:tri_minageyears#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "&nbsp;" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='maxageyrs' style=''>Max Age Years:&nbsp;&nbsp;</label>" +
                        "<label id='maxageyrsval' style=''>#:tri_maxageyears#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>" +
                        "&nbsp;" +
                        "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td>" +
                        "<label id='gender' style='font-weight:'>Gender:&nbsp;&nbsp;</label>" +
                        "<label id='genderval' style=''>#:tri_gendername#</label>" +
                        "</td>" +
                        "<td>&nbsp;</td>" +
                        "<td>&nbsp;</td>" +
                        "</tr>" +
                        "</table>" +
                        "</div>";
      }

      var dataSource = new kendo.data.DataSource({
         data: jsondata,
         pageSize: 10
      });

      if (typeof (jsondata.length) == "undefined")
      {
         dataSource = [];
      }

      $("#ProtocolsHdr").kendoListView({
         dataSource: dataSource,
         template: htmltemplate,
         selectable: false
      });
   }
   catch (excp)
   {
      alert("Tribridge.Protocol.LoadProtocolHeader:" + excp.description);
   }
}

Tribridge.Protocol.LoadQuestionAdvice = function (questionid, algorithmid)
{
   //alert("Tribridge.Protocol.LoadQuestionAdvice");
   try
   {
      debugger;

      var fetchxml = "";

      if (Tribridge.Protocol.NumberOfSubheadings == 0)
      {
         fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='500' >" +
                     "<entity name='" + "tri_ah_questionadvice" + "'>" +
                     "<attribute name='tri_ah_questionadviceid'/>" +
                     "<attribute name='tri_questionid'/>" +
                     "<attribute name='tri_adviceid'/>" +
                     "<attribute name='tri_questionadviceorder'/>" +
                     "<order descending='false' attribute='tri_questionadviceorder'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='statecode' value='0' operator='eq'/>" +
                     "<condition attribute='tri_questionid' value='" + questionid + "' operator='eq'/>" +
                     "</filter>" +
                     "<link-entity name='tri_ah_advice' alias='aa' link-type='inner' from='tri_ah_adviceid' to='tri_adviceid'>" +
                     "<attribute name='tri_subheadingorder' alias='tri_subheadingorder'" + " />" +
                     "<attribute name='tri_algorithmorder' alias='tri_algorithmorder'" + " />" +
                     "<attribute name='tri_algorithmid' alias='tri_algorithmid'" + " />" +
                     "<attribute name='tri_advicesnap' alias='tri_advicesnap'" + " />" +
                     "<attribute name='tri_st_adviceid' alias='tri_st_adviceid'" + " />" +
                     "<attribute name='tri_advice' alias='tri_advice'" + " />" +
                     "<attribute name='tri_advicexhtml' alias='tri_advicexhtml'" + " />" +
                     //"<order descending='false' attribute='tri_subheadingorder'/>" +
                     //"<order descending='false' attribute='tri_algorithmorder'/>" +
                     "<filter type='and'>" +
                     "<condition attribute='statecode' value='0' operator='eq'/>" +
                     "<condition attribute='tri_algorithmid' value='" + algorithmid + "' operator='eq'/>" +
                     "</filter>" +
                     "<link-entity name='tri_ah_algorithm' alias='bb' link-type='inner' from='tri_ah_algorithmid' to='tri_algorithmid' >" +
                     "<attribute name='tri_hca_subheading1' alias='tri_hca_subheading1'" + " />" +
                     "<attribute name='tri_hca_subheading2' alias='tri_hca_subheading2'" + " />" +
                     "<attribute name='tri_hca_subheading3' alias='tri_hca_subheading3'" + " />" +
                     "<attribute name='tri_hca_subheading4' alias='tri_hca_subheading4'" + " />" +
                     "<attribute name='tri_hca_subheading5' alias='tri_hca_subheading5'" + " />" +
                     "</link-entity>" +
                     "</link-entity>" +
                     "</entity></fetch>";
      }
      else
      {
         fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='500' >" +
                    "<entity name='" + "tri_ah_advice" + "'>" +
                    "<attribute name='tri_subheadingorder' alias='tri_subheadingorder'" + " />" +
                    "<attribute name='tri_algorithmorder' alias='tri_algorithmorder'" + " />" +
                    "<attribute name='tri_algorithmid' alias='tri_algorithmid'" + " />" +
                    "<attribute name='tri_advicesnap' alias='tri_advicesnap'" + " />" +
                    "<attribute name='tri_st_adviceid' alias='tri_st_adviceid'" + " />" +
                    "<attribute name='tri_advice' alias='tri_advice'" + " />" +
                    "<attribute name='tri_advicexhtml' alias='tri_advicexhtml'" + " />" +
                    "<order descending='false' attribute='tri_subheadingorder'/>" +
                    "<order descending='false' attribute='tri_algorithmorder'/>" +
                    "<filter type='and'>" +
                    "<condition attribute='statecode' value='0' operator='eq'/>" +
                    "<condition attribute='tri_algorithmid' value='" + algorithmid + "' operator='eq'/>" +
                    "</filter>" +
                    "<link-entity name='tri_ah_questionadvice' alias='aa' link-type='inner' from='tri_adviceid' to='tri_ah_adviceid'>" +
                    "<attribute name='tri_ah_questionadviceid' alias='tri_ah_questionadviceid'/>" +
                    "<attribute name='tri_questionid' alias='tri_questionid'/>" +
                    "<attribute name='tri_adviceid' alias='tri_adviceid'/>" +
                    "<attribute name='tri_questionadviceorder' alias='tri_questionadviceorder'/>" +
                    "<order descending='false' attribute='tri_questionadviceorder'/>" +
                    "<filter type='and'>" +
                    "<condition attribute='statecode' value='0' operator='eq'/>" +
                    "<condition attribute='tri_questionid' value='" + questionid + "' operator='eq'/>" +
                    "</filter>" +
                    "</link-entity>" +   
                    "<link-entity name='tri_ah_algorithm' alias='bb' link-type='inner' from='tri_ah_algorithmid' to='tri_algorithmid' >" +
                    "<attribute name='tri_hca_subheading1' alias='tri_hca_subheading1'" + " />" +
                    "<attribute name='tri_hca_subheading2' alias='tri_hca_subheading2'" + " />" +
                    "<attribute name='tri_hca_subheading3' alias='tri_hca_subheading3'" + " />" +
                    "<attribute name='tri_hca_subheading4' alias='tri_hca_subheading4'" + " />" +
                    "<attribute name='tri_hca_subheading5' alias='tri_hca_subheading5'" + " />" +
                    "</link-entity>" +
                    "</entity></fetch>";
      }
      //alert(fetchxml);

      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      //var jsondata = Tribridge.Protocol.TransformToJson(res, Tribridge.Protocol.ProtocolAdviceQueryFields);
      var jsondata = Tribridge.Protocol.TransformToJson_Advice(res, Tribridge.Protocol.ProtocolAdviceQueryFields);

      var dataSource = new kendo.data.DataSource({
         data: jsondata,
         pageSize: 500
      });

      if (typeof(jsondata.length) == "undefined")
      {
         dataSource = [];
      }

      $("#AdviceView").kendoListView({
         dataSource: dataSource,
         //template: "<div><label id='tri_algoorder'>#=tri_algorithmorder#</label><label id='tri_advice'>#=tri_advicexhtml#</label><label id='tri_adviceid' style='visibility:hidden'>#:tri_adviceid#</label></div>",
         template: kendo.template($("#AdviceTemplate").html()),
         selectable: true
      });
   }
   catch (excp)
   {
      alert("Tribridge.Protocol.LoadQuestionAdvice:" + excp.description);
   }
}

Tribridge.Protocol.LoadSelectedAdvice = function (id, advicetext)
{
   //alert("Tribridge.Protocol.LoadQuestionAdvice");
   try
   {
      Tribridge.Protocol.SelectedAdvice.push({ tri_adviceid: id, tri_advice: advicetext });

      var dataSource = new kendo.data.DataSource({
         data: Tribridge.Protocol.SelectedAdvice,
         pageSize: 500
      });

      $("#SelectedAdvice").kendoListView({
         dataSource: dataSource,
         template: "<div><label id='tri_advice'>#=tri_advice#</label><label id='tri_adviceid' style='visibility:hidden'>#:tri_adviceid#</label></div>",
         selectable: true
      });
   }
   catch (excp)
   {
      alert("Tribridge.Protocol.ProtocolSearch:" + excp.description);
   }
}

Tribridge.Protocol.ClearSelectedAdvice = function ()
{
   try
   {
      // Reset the array containg the selected advice
      Tribridge.Protocol.SelectedAdvice = [];
      Tribridge.Protocol.AdviceText = [];
      Tribridge.Protocol.AdviceTextPlain = [];

      // Set the datasource
      var dataSource = new kendo.data.DataSource({
         data: Tribridge.Protocol.SelectedAdvice
      });

      // Update the control
      $("#SelectedAdvice").kendoListView({
         dataSource: dataSource,
         template: "<div><label id='tri_advice'>#:tri_advice#</label><label id='tri_adviceid' style='visibility:hidden'>#:tri_adviceid#</label></div>",
         selectable: true
      });
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.FetchPatient = function (contactid)
{
   try
   {
      if (contactid == "")
      {
         // Should not get this error.
         alert("Patient Id not found, cannot load patient data.");
         return;
      }

      // build the FetchXml statement
      var fetchxml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' count='1' >" +
                     "<entity name='" + "contact" + "'>" +
                     "<attribute name='gendercode' alias='gendercode'" + " />" +
                     "<attribute name='birthdate' alias='birthdate'" + " />" +
                     "<filter type='and'>" +
                     "<condition attribute='contactid' value='" + contactid + "' operator='eq'/>" +
                     "</filter>" +
                     "</entity></fetch>";
      //alert(fetchxml);

      // Retrieve the data and then convert to JSON object for data source
      var res = Tribridge.CRMSDK.RetrieveMultipleByFetchXML(Tribridge.Helper.EscapeHtml(fetchxml), null, null, null);
      var jsondata = Tribridge.Protocol.TransformToJson(res, Tribridge.Protocol.PatientQueryFields);

      return jsondata;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.GetAdviceText = function (txtHTML)
{
   var value = new String(txtHTML);
   var labeltext = '<label id="tri_advice">';

   try
   {
      var ndxBegin = txtHTML.indexOf(labeltext);

      if (ndxBegin > 0)
      {
         value = value.substring(ndxBegin);
         var ndxEnd = value.indexOf('</label>');

         if (ndxEnd > labeltext.length)
         {
            value = value.substring(labeltext.length, ndxEnd);
            return value;
         }
      }

      return value;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

Tribridge.Protocol.GetAdviceId = function (txtHTML)
{
   var value = new String(txtHTML);
   var labeltext = '<label id="tri_adviceid" style="visibility: hidden;">';

   try
   {
      var ndxBegin = txtHTML.indexOf(labeltext);

      if (ndxBegin > 0)
      {
         value = value.substring(ndxBegin);
         var ndxEnd = value.indexOf('</label>');

         if (ndxEnd > labeltext.length)
         {
            value = value.substring(labeltext.length, ndxEnd);
            return value;
         }
      }

      return value;
   }
   catch (excp)
   {
      alert(excp.description);
   }
}

//-------------------------------------------------------------------------------------------------------------
//                                                 Callback methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Protocol.Save_SuccessCallback = function ()
{
   // Display alert for record saved status
   //alert("Record Saved.");
   $('#divStatus').css("visibility", "visible");

   // Close the form in 3.5 seconds. Added close in timeout as was causing issues when closed immediately??
   setTimeout(function () { window.close(); }, 3500);

}

Tribridge.Protocol.Save_ErrorCallback = function ()
{
   alert("Error during Save.");
}

Tribridge.Protocol.ResponseSave_SuccessCallback = function (data, textStatus, XmlHttpRequest)
{
   //alert("success");
}

Tribridge.Protocol.ResponseSave_FailureCallback = function (data, textStatus, XmlHttpRequest)
{
   alert(textStatus);
}


//-------------------------------------------------------------------------------------------------------------
//                                                 Other methods
//-------------------------------------------------------------------------------------------------------------
Tribridge.Protocol.Private.Model = function (index)
{
    var viewInfo = Tribridge.Protocol.CustomViews[index];

    var retObj = {};
    for (var x = 0; x < viewInfo.Columns.length; x++) {

        // Readonly?
        var editable = true;
        if ($.inArray(viewInfo.Columns[x].Name.toLowerCase(), viewInfo.Readonly) > -1) {
            editable = false;
        }

        // Required?
        var required = false;
        if ($.inArray(viewInfo.Columns[x].Name.toLowerCase(), viewInfo.Required) > -1) {
            required = true;
        }

        var options = null;
        if (viewInfo.OptionSets != null && viewInfo.OptionSets.hasOwnProperty(viewInfo.Columns[x].Attribute)) {
            options = viewInfo.OptionSets[viewInfo.Columns[x].Attribute];
        }

        var name = Tribridge.Protocol.Private.GetColumnField(viewInfo.Columns[x].Name, viewInfo.Columns[x].Type);
        retObj[name] = { editable: editable, type: Tribridge.Protocol.Private.GetModelType(viewInfo.Columns[x].Type), validation: { required: required }, options: options };
    }

    return retObj;
};

Tribridge.Protocol.Private.GetColumnField = function (field, crmtype) {

    switch (crmtype) {

        case 'Status':
        case 'Picklist':
        case 'Money':
            return field + '.Value';
        case 'Owner':
        case 'Lookup':
        case 'Customer':
        case 'Uniqueidentifier':
            return field + '.Id';
        case 'Double':
        case 'BigInt':
        case 'Decimal':
        case 'Integer':
        case 'DateTime':
        case 'Boolean':
        case 'EntityName':
        case 'Memo':
        case 'String':
        case 'Virtual':
        default:
            return field;
    }
}

Tribridge.Protocol.Private.GetModelType = function (crmtype) {

    switch (crmtype) {
        case 'Double':
        case 'BigInt':
        case 'Decimal':
        case 'Money':
        case 'Integer':
        case 'Picklist':
        case 'Status':
            return 'number';
        case 'DateTime':
            return 'date';
        case 'Boolean':
            return 'boolean';

        case 'Owner':
        case 'Lookup':
        case 'Customer':
        case 'Uniqueidentifier':
        case 'EntityName':
        case 'Memo':
        case 'String':
        case 'Virtual':
        default:
            return 'string';
    }
}

Tribridge.Protocol.Private.GetEditor = function (crmfield, crmtype) {
    switch (crmtype) {
        case 'Lookup':
        case 'Customer':
            return Tribridge.Protocol.Private.LookupEditor;
        case 'Picklist':
        case 'Status':
            return Tribridge.Protocol.Private.DropDownEditor;
        case 'Double':
        case 'BigInt':
        case 'Decimal':
        case 'Money':
        case 'Integer':
        case 'DateTime':
        case 'Boolean':
        case 'Owner':
        case 'Uniqueidentifier':
        case 'EntityName':
        case 'Memo':
        case 'String':
        case 'Virtual':
        default:
            return null;
    }
};

