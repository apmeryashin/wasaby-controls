/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Model', ['js!WS.Data/Entity/Model'], function (Model) {
   'use strict';
   $ws.single.ioc.resolve('ILogger').error('SBIS3.CONTROLS.Data.Model', 'Module is no longer available since version 3.7.4.100. Use WS.Data/Entity/Model instead.');
   return Model;
});
