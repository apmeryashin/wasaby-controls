define('Controls/HighCharts',
   [
      'Core/Control',
      'tmpl!Controls/HighCharts/HighCharts',
      'Core/constants',
      'Core/Date',
      'css!Controls/HighCharts/HighCharts',
      'browser!/cdn/highcharts/4.2.7/highcharts-more.js'
   ],
   function(Control, template, constants) {
      'use strict';

      /**
       * Component HighCharts
       * @class Controls/HighCharts
       * @extends Core/Control
       * @mixes Controls/interface/IHighCharts
       * @control
       * @authors Volotskoy V.D., Sukhoruchkin A.S.
       */

      var _private = {
            drawChart: function(self, config) {

               //TODO Как добавят возможность использовать контейнер как _children поменять на config.highChartOptions.chart.renderTo = this._children.highChartContainer
               //Ссылка на задачу: https://online.sbis.ru/opendoc.html?guid=e6e4454f-0f12-45e7-a390-86adfd5582a1

               config.chartOptions.chart.renderTo = self._container;
               config.chartOptions.credits = config.chartOptions.credits || {};
               config.chartOptions.credits.enabled = false;
               if (self._chartInstance) {
                  self._chartInstance.destroy();
               }
               self._chartInstance = new Highcharts.Chart(config.chartOptions);
            }
         },
         HighChart = Control.extend({
         _template: template,
         _chartInstance: null,

         _shouldUpdate: function() {
            return false;
         },

         _afterMount: function(config) {
            Highcharts.setOptions({
               lang: {
                  numericSymbols: ['', '', '', '', '', ''],
                  months: constants.Date.longMonths,
                  shortMonths: constants.Date.months,
                  weekdays: constants.Date.longDays,
                  thousandsSep: ' '
               },
               plotOptions: {
                  series: {
                     animation: !constants.browser.isIE10
                  }
               }
            });
            _private.drawChart(this, config);
         },

         _beforeUpdate: function(config) {
            if (this._options.chartOptions !== config.chartOptions) {
               _private.drawChart(this, config);
            }
         },



         _beforeUnmount: function() {
            this._chartInstance.destroy();
            this._chartInstance = undefined;
         }
      });

      return HighChart;
   });
