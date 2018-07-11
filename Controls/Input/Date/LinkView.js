define('Controls/Input/Date/LinkView', [
   'Core/Control',
   'Core/helpers/Date/getFormattedDateRange',
   'Controls/Calendar/Utils',
   'Controls/Date/model/DateRange',
   'Controls/Input/Date/interface/ILinkView',
   'tmpl!Controls/Input/Date/LinkView/LinkView',
   'css!Controls/Input/Date/LinkView/LinkView'
], function(
   BaseControl,
   getFormattedDateRange,
   CalendarControlsUtils,
   DateRangeModel,
   IDateLinkView,
   componentTmpl
) {
   'use strict';

   /**
    * A link button that displays the period. Supports the change of periods to adjacent.
    *
    * @class Controls/Input/Date/LinkView
    * @extends Core/Control
    * @mixes Controls/Input/Date/interface/ILinkView
    * @control
    * @public
    * @category Input
    * @author Миронов А.Ю.
    * @demo Controls-demo/Input/Date/LinkView
    *
    */

   var _private = {
      _updateEnabled: function(self, readOnly) {
         if (self._options === readOnly) {
            return;
         }
         self._prevNextButtonsEnabledClass = 'controls-DateLinkView__prevNextButtons-';
         self._prevNextButtonsEnabledClass += readOnly ? 'disabled' : 'enabled';

         self._valueEnabledClass = 'controls-DateLinkView__value-';
         self._valueEnabledClass += readOnly ? 'disabled' : 'enabled';
      },

      _updateCaption: function(self, options) {
         var opt = options || self._options;

         self._caption = _private._getCaption(
            self._rangeModel.startValue,
            self._rangeModel.endValue,
            opt.emptyCaption
         );
      },

      _getCaption: function(startValue, endValue, emptyCaption) {
         // As an empty value, use the non-breaking space @nbsp; ('\ xA0') that would not make layout
         return getFormattedDateRange(
            startValue,
            endValue,
            {
               contractToMonth: true,
               fullNameOfMonth: true,
               contractToQuarter: true,
               contractToHalfYear: true,
               emptyPeriodTitle: emptyCaption || '\xA0'
            }
         );
      }
   };

   var Component = BaseControl.extend({
      _template: componentTmpl,

      _rangeModel: null,
      _caption: '',
      _prevNextButtonsEnabledClass: null,
      _valueEnabledClass: null,

      constructor: function() {
         Component.superclass.constructor.apply(this, arguments);
         this._rangeModel = new DateRangeModel();
         CalendarControlsUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
      },

      _beforeMount: function(options) {
         this._rangeModel.update(options);
         _private._updateCaption(this, options);
         _private._updateEnabled(this, options.readOnly);
      },

      _beforeUpdate: function(options) {
         var changed = this._rangeModel.update(options);
         if (changed) {
            _private._updateCaption(this, options);
         }
         _private._updateEnabled(this, options.readOnly);
      },

      shiftBack: function() {
         this._rangeModel.shiftBack();
         _private._updateCaption(this);
      },

      shiftForward: function() {
         this._rangeModel.shiftForward();
         _private._updateCaption(this);
      },

      _onClick: function() {
         this._notify('linkClick');
      },

      _beforeUnmount: function() {
         this._rangeModel.destroy();
      }

   });

   Component.EMPTY_CAPTIONS = IDateLinkView.EMPTY_CAPTIONS;

   Component.getDefaultOptions = IDateLinkView.getDefaultOptions;

   Component.getOptionTypes = IDateLinkView.getOptionTypes;

   return Component;
});
