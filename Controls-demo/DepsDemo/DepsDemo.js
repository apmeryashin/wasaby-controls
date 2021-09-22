define("Controls-demo/DepsDemo/DepsDemo", ["require", "exports", "tslib", "UI/Base", "tmpl!Controls-demo/DepsDemo/DepsDemo"], function (require, exports, tslib_1, Base_1, template) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DepsDemo = /** @class */ (function (_super) {
        tslib_1.__extends(DepsDemo, _super);
        function DepsDemo() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            _this.isOK = true;
            return _this;
        }
        DepsDemo.prototype._afterMount = function () {
            var scripts = document.getElementsByTagName('script');
            if (this.checkDebug(scripts)) {
                this.isOK = true;
            }
            else {
                var depArray = ['Controls/input:Text', 'Controls.buttons:Button'];
                var depName = void 0;
                var allDepsDefined = true;
                for (var j = 0; j < depArray.length; j++) {
                    depName = depArray[j];
                    if (!require.defined(depName)) {
                        allDepsDefined = false;
                    }
                }
                this.isOK = allDepsDefined;
            }
        };
        DepsDemo.prototype.checkDebug = function (scripts) {
            for (var i = 0; i < scripts.length; i++) {
                // @ts-ignore
                if (/scripts_[0-9]+/g.test(scripts[i].attributes.key)) {
                    return false;
                }
            }
            return true;
        };
        return DepsDemo;
    }(Base_1.Control));
    exports.default = DepsDemo;
});
