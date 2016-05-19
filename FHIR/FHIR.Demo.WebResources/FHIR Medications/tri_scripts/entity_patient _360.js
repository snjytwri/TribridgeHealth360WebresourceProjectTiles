var patientForm = "Health360 Core";
var providerForm = "Provider";
var bypassLogicId = "{BDC46734-4FF3-E411-80CE-005056810C7C}";

var contactType = {
    Patient: 167410000,
    Physician: 167410001,
    OtherProvider: 167410002
}


function form_onload() {
    var myId = Xrm.Page.context.getUserId();
    var thisClient = Xrm.Page.context.client.getClient();
    var isCrmForTablets = (Xrm.Page.context.client.getClient() == "Mobile");

    // If Not Mobile then execute logic
    if (isCrmForTablets == false && myId != bypassLogicId) {
        // Hide Business Process Flow if completed
        var bpfCompleted = true;

        try {
            var activeProcess = Xrm.Page.data.process.getActiveProcess();
            var stages = activeProcess.getStages();
            stages.forEach(function (stage, n) {
                var stageSteps = stage.getSteps();
                stageSteps.forEach(function (step, i) {
                    // If Step is required it needs a values
                    var isRequired = step.isRequired();
                    if (isRequired == true) {
                        var stepAttributeName = step.getAttribute();
                        var stepAttribute = Xrm.Page.getAttribute(stepAttributeName);
                        var stepValue = stepAttribute.getValue();
                        // Null Test
                        if (stepValue == null || stepValue == "") {
                            bpfCompleted = false;
                        } else {
                            var stepType = stepAttribute.getAttributeType();
                            if (stepType == "lookup") {
                                if (stepValue[0].id == "")
                                    bpfCompleted = false;
                            }
                        }
                    }
                });
            });

            if (bpfCompleted == true)
                Xrm.Page.ui.process.setVisible(false);
        } catch (e) { }

        // Set the right form
        var type = Xrm.Page.getAttribute("tri_contacttype").getValue();
        if (type == contactType.Patient) {
            formSelect(patientForm);
        } else if (type == contactType.Physician || type == contactType.OtherProvider) {
            formSelect(providerForm);
        }
    } else {   // Mobile Logic
        try {
            Xrm.Page.ui.process.setVisible(false);
        } catch (e1) {}
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