function weight_onchange() {
    var newValue = 0;
    var weightloss = Xrm.Page.getAttribute("tri_currentweightloss");
    var weightgoal = Xrm.Page.getAttribute("tri_weightlossgoal");
    if (weightloss != null && weightgoal != null) {
        newValue = Math.round((weightloss.getValue() / weightgoal.getValue()) * 100);
        if (newValue > 100)
            newValue = 100;
    }

    Xrm.Page.getAttribute("tri_weightlossjs").setValue(newValue);

}