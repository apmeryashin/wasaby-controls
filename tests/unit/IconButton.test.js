/**
 * Created by dv.zuev on 18.05.2017.
 */
define([
   'js!SBIS3.CONTROLS.IconButton',
   'Core/vdom/Synchronizer/resources/SyntheticEvent'
], function (IconButton, SyntheticEvent) {
   'use strict';

   describe('SBIS3.CONTROLS.IconButton', function () {

      var cfg = {
         command: "cmd",
         primary: true
      };

      describe('Events', function () {
         it('tooltipFromCaption', function () {
            cfg.tooltip = "";
            cfg.caption = "caption";
            var iconButton = new IconButton(cfg)
            assert.equal(iconButton._options.tooltip, cfg.caption);
         });

         it('tooltip', function () {
            cfg.tooltip = "tooltip";
            var iconButton = new IconButton(cfg)
            assert.equal(iconButton._options.tooltip, cfg.tooltip);
         });

      });

   });

});
