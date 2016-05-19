var crmPatientForm = "Information";
var tabletPatientForm = "Tablet Information";

var contactType = {
    Patient: 167410000,
    Physician: 167410001,
    Other: 167410002
}

function form_onload() {
    var thisClient = Xrm.Page.context.client.getClient();
    var isCrmForTablets = (Xrm.Page.context.client.getClient() == "Mobile");

    // If Not Mobile then execute logic
    if (isCrmForTablets == false) {
        // If we are on the Tablet for Set to CRM Default form
        var currentForm = Xrm.Page.ui.formSelector.getCurrentItem();
        if (currentForm.getLabel() == tabletPatientForm)
            formSelect(crmPatientForm);
    }
}

function formSelect(targetForm) {
    // Set form, if target <> current
    var currentForm = Xrm.Page.ui.formSelector.getCurrentItem();
    if (currentForm.getLabel() != targetForm) {
        var forms = Xrm.Page.ui.formSelector.items.get();
        var i = 0;
        for (i = 0; i < forms.length; i++) {
            if (forms[i].getLabel() == targetForm) {
                forms[i].navigate();
                return;
            }
        }
    }
}