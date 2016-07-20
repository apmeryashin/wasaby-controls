define('js!SBIS3.TestRadioGroup3', ['js!SBIS3.CORE.CompoundControl', 'html!SBIS3.TestRadioGroup3', 'js!SBIS3.CONTROLS.RadioGroup', 'js!SBIS3.CONTROLS.TextBox'], function (CompoundControl, dotTplFn) {

    var moduleClass = CompoundControl.extend({
        _dotTplFn: dotTplFn,
        $protected: {
            _options: {}
        },
        $constructor: function () {
        },
        init: function () {
            moduleClass.superclass.init.call(this);
        }
    });

    moduleClass.webPage = {
        outFileName: "regression_radio_group_online_3",
        htmlTemplate: "/intest/pageTemplates/onlineTemplate.html"
    };

    return moduleClass;
});