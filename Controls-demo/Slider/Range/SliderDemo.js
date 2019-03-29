define('Controls-demo/Slider/Range/SliderDemo',
   [
      'Core/Control',
      'Types/source',
      'wml!Controls-demo/Slider/Range/SliderDemo',
      'css!Controls-demo/Slider/Range/SliderDemo',
      'Controls/slider'
   ],
   function(Control, source, template) {
      'use strict';
      var SliderDemo = Control.extend({
         _template: template,
         _template: template,
         _minValue: undefined,
         _maxValue: undefined,
         _scaleStep: undefined,
         _sizeSource: null,
         _size: '',
         _precision: undefined,
         _borderVisible: false,
         _readOnly: false,
         _event: 'none',
         _startValue: undefined,
         _endValue: undefined,
         _beforeMount: function(opts){

            this._minValue = 0;
            this._maxValue = 100;
            this._scaleStep = 20;
            this._precision = 0;
            this._size = 'm';
            this._startValue = 0;
            this._endValue = 100;
            this._sizeSource = new source.Memory({
               idProperty: 'title',
               data: [
                  {
                     title: 's'
                  },
                  {
                     title: 'm'
                  }
               ]
            });

         },
         reset: function(){
            this._event = 'none';
         },
         changeMinValue: function(e, val) {
            this._minValue = val;
         },
         changeMaxValue: function(e, val) {
            this._maxValue = val;
         },
         changeStartValue: function(e, val){
            this._startValue = Math.max(this._minValue, Math.min(val, this._endValue));
            this._event = 'startValueChanged';
         },
         changeEndValue: function(e, val){
            this._endValue = Math.min(this._maxValue, Math.max(val, this._startValue));
            this._event = 'endValueChanged';
         },
         changePrecision: function(e, val) {
            this._precision = val;
         },
         changeScaleStep: function(e, val) {
            this._scaleStep = val;
         },
         changeSize: function(e, val) {
            this._size = val;
         },
         changeBorderVisible: function(e, val) {
            this._borderVisible = val;
         },
         changeReadOnly: function(e, val) {
            this._readOnly = val;
         },
      });

      return SliderDemo;
   }
);
