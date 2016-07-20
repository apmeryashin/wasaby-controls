define('js!SBIS3.TestIconButton', ['js!SBIS3.CORE.CompoundControl', 'html!SBIS3.TestIconButton', 'js!SBIS3.CONTROLS.IconButton', 'js!SBIS3.CONTROLS.TextBox'], function (CompoundControl, dotTplFn) {

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
        outFileName: "regression_icon_button_online",
        htmlTemplate: "/intest/pageTemplates/onlineTemplate.html"
    };

    return moduleClass;
});