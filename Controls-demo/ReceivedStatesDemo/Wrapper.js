define("Controls-demo/ReceivedStatesDemo/Wrapper", ["require", "exports", "tslib", "UI/Base", "Env/Env", "wml!Controls-demo/ReceivedStatesDemo/Wrapper"], function (require, exports, tslib_1, Base_1, Env_1, template) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var rsData = '123';
    var default_1 = /** @class */ (function (_super) {
        tslib_1.__extends(default_1, _super);
        function default_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            _this.gotRS = false;
            return _this;
        }
        default_1.prototype._beforeMount = function (options, _, receivedState) {
            if (Env_1.constants.isServerSide) {
                return rsData;
            }
            this.gotRS = receivedState === rsData;
        };
        return default_1;
    }(Base_1.Control));
    exports.default = default_1;
});
