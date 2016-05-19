var generalTabName = "TAB_GENERAL";
var infoSectionName = "SECTION_INFO";
var noteSectionName = "SECTION_NOTE";
var descriptionAttribute = "tri_name";
var patientAttribute = "tri_patientid";

function form_onload() {
    var isCrmForTablets = (Xrm.Page.context.client.getClient() == "Mobile");
    // If Form is new then save if we have a valid Description - Only if we are not Mobile
    if (isCrmForTablets == false) {
        var type = Xrm.Page.ui.getFormType();
        if (type == 1) {
            Xrm.Page.ui.tabs.get(generalTabName).sections.get(noteSectionName).setVisible(false);
        } else {
            Xrm.Page.ui.tabs.get(generalTabName).sections.get(noteSectionName).setVisible(true);
            Xrm.Page.getControl(patientAttribute).setDisabled(true);
        }
    }
}

function patient_onchange() {
    checkInitialSave();
}

function description_onchange() {
    checkInitialSave();
}

function checkInitialSave() {
    var isCrmForTablets = (Xrm.Page.context.client.getClient() == "Mobile");
    // If Form is new then save if we have a valid Description and Patient
    var type = Xrm.Page.ui.getFormType();
    if (type == 1) {
        var description = Xrm.Page.getAttribute(descriptionAttribute).getValue();
        var patient = Xrm.Page.getAttribute(patientAttribute).getValue();
        if (isLookupValid(patient) == true && isStringEmptyOrNull(description) == true) {
            Xrm.Page.data.save();
            if (isCrmForTablets == false)
                Xrm.Page.ui.tabs.get(generalTabName).sections.get(noteSectionName).setVisible(true);
            // Lock Patient
            Xrm.Page.getControl(patientAttribute).setDisabled(true);
        }
    }
}

function isLookupValid(lookupField) {
    var returnValue = false;
    if (lookupField != null && lookupField[0] != null && lookupField[0].id != "")
        returnValue = true;
    return returnValue;
}

function isStringEmptyOrNull(stringName) {
    var returnValue = false;
    if (stringName != null && stringName != "")
        returnValue = true;
    return returnValue;
}