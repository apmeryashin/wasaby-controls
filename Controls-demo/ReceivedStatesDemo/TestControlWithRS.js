define("Controls-demo/ReceivedStatesDemo/TestControlWithRS", ["require", "exports", "tslib", "UI/Base", "wml!Controls-demo/ReceivedStatesDemo/TestControlWithRS"], function (require, exports, tslib_1, Base_1, template) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var rsData = '654';
    var default_1 = /** @class */ (function (_super) {
        tslib_1.__extends(default_1, _super);
        function default_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        default_1.prototype._beforeMount = function (options, _, receivedState) {
            if (receivedState === rsData) {
                this.gotRSInner = 'true';
                this.gotRSOuter = '' + options.wrapperRS;
                return;
            }
            return rsData;
        };
        return default_1;
    }(Base_1.Control));
    exports.default = default_1;
});
