var crmTargetForm = "Information for CRM";

function form_onload () {
    var thisClient = Xrm.Page.context.client.getClient();
    var isCrmForTablets = (Xrm.Page.context.client.getClient() == "Mobile");

    // If Not Mobile then lets switch to the CRM form
    if (isCrmForTablets == false) {
        formSelect();
    }
}

function formSelect() {
    // Set form, if target <> current
    var currentForm = Xrm.Page.ui.formSelector.getCurrentItem();
    if (currentForm.getLabel() != crmTargetForm) {
        var forms = Xrm.Page.ui.formSelector.items.get();
        var i = 0;
        for (i = 0; i < forms.length; i++) {
            if (forms[i].getLabel() == crmTargetForm) {
                forms[i].navigate();
                return;
            }
        }
    }
}
