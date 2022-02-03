define(
   [
      'Controls/popupTemplate',
      'Controls/_popupTemplate/Notification/Template/NotificationContent',
      'Controls/popup',
      'Controls/_popupTemplate/Notification/NotificationController',
      'Types/collection',
      'Controls/sizeUtils'
   ],
   (popupTemplate, NotificationContent, popup, NotificationController, collection, sizeUtils) => {
      'use strict';

      NotificationContent = NotificationContent.default;

      describe('Controls/_popup/Opener/Notification', () => {
         const containers = [
            {
               offsetHeight: 10,
               offsetWidth: 10
            },
            {
               offsetHeight: 20,
               offsetWidth: 20
            },
            {
               offsetHeight: 30,
               offsetWidth: 30
            }
         ];

         beforeEach(() => {
            popupTemplate.NotificationController._historyCoords = {
               bottom: 0,
               right: 0
            };
            sinon.stub(popupTemplate.NotificationController, '_validatePosition');
            sinon.stub(popupTemplate.NotificationController, '_calculateDirection');
         });

         afterEach(function() {
            popupTemplate.NotificationController._stack.clear();
            sinon.restore();
         });

         describe('_updatePositions', () => {
            it('should calculate correct coords for popups', () => {
               const item1 = {
                  popupOptions: {}
               };
               const item2 = {
                  popupOptions: {}
               };
               popupTemplate.NotificationController._historyCoords = {
                  bottom: 100,
                  right: 100
               };
               let right;
               let bottom;
               popupTemplate.NotificationController.elementCreated(item1, containers[1]);
               popupTemplate.NotificationController.elementCreated(item2, containers[2]);
               popupTemplate.NotificationController._updatePositions();
               right = popupTemplate.NotificationController._stack.at(0).position.right;
               bottom = popupTemplate.NotificationController._stack.at(0).position.bottom;
               assert.equal(right, popupTemplate.NotificationController._historyCoords.right);
               assert.equal(bottom, popupTemplate.NotificationController._historyCoords.bottom);

               right = popupTemplate.NotificationController._stack.at(1).position.right;
               bottom = popupTemplate.NotificationController._stack.at(1).position.bottom;
               const firstItemHeight = popupTemplate.NotificationController._stack.at(0).height;
               assert.equal(right, popupTemplate.NotificationController._historyCoords.right);
               assert.equal(bottom, popupTemplate.NotificationController._historyCoords.bottom + firstItemHeight);
            });
         });

         describe('popupDragStart', () => {
            it('should calculate correct position after dragNDrop', () => {
               sinon.stub(popupTemplate.NotificationController, '_updatePositions');
               const item1 = {
                  popupOptions: {}
               };
               sinon.stub(sizeUtils.DimensionsMeasurer, 'getWindowDimensions').returns({
                  innerWidth: 1000,
                  innerHeight: 1000
               });
               popupTemplate.NotificationController.elementCreated(item1, containers[1]);
               const popupItem = popupTemplate.NotificationController._stack.at(0);
               const offset = {
                  x: 10,
                  y: 10
               };
               popupTemplate.NotificationController._startPosition = {
                  bottom: 210,
                  right: 115
               };
               popupTemplate.NotificationController.popupDragStart(popupItem, null, offset);
               assert.equal(popupTemplate.NotificationController._historyCoords.right, 105);
               assert.equal(popupTemplate.NotificationController._historyCoords.bottom, 200);
            });

            [{
               startPosition: {
                  bottom: 5,
                  right: 5
               },
               result: {
                  bottom: -5,
                  right: -5
               }
            }, {
               startPosition: {
                  bottom: 999,
                  right: 100
               },
               result: {
                  bottom: 989,
                  right: 90
               }
            }, {
               startPosition: {
                  bottom: 100,
                  right: 999
               },
               result: {
                  bottom: 90,
                  right: 989
               }
            }].forEach((test, index) => {
               it('should not let popup go out of window ' + index, () => {
                  sinon.stub(popupTemplate.NotificationController, '_updatePositions');
                  const item1 = {
                     popupOptions: {}
                  };
                  sinon.stub(sizeUtils.DimensionsMeasurer, 'getWindowDimensions').returns({
                     innerWidth: 1000,
                     innerHeight: 1000
                  });
                  popupTemplate.NotificationController.elementCreated(item1, containers[1]);
                  const popupItem = popupTemplate.NotificationController._stack.at(0);
                  const offset = {
                     x: 10,
                     y: 10
                  };
                  popupTemplate.NotificationController._startPosition = test.startPosition;
                  popupTemplate.NotificationController.popupDragStart(popupItem, null, offset);
                  assert.equal(popupTemplate.NotificationController._historyCoords.right, test.result.right);
                  assert.equal(popupTemplate.NotificationController._historyCoords.bottom, test.result.bottom);
               });
            });
         });

         it('elementCreated', function() {
            const item1 = {
               popupOptions: {}
            };
            const item2 = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.elementCreated(item1, containers[1]);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 1);
            assert.equal(popupTemplate.NotificationController._stack.at(0), item1);
            assert.equal(item1.height, containers[1].offsetHeight);
            assert.deepEqual(item1.position, {
               right: 0,
               bottom: 0
            });

            popupTemplate.NotificationController.elementCreated(item2, containers[2]);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 2);
            assert.equal(popupTemplate.NotificationController._stack.at(0), item2);
            assert.equal(popupTemplate.NotificationController._stack.at(1), item1);
            assert.equal(item2.height, containers[2].offsetHeight);
            assert.deepEqual(item2.position, {
               right: 0,
               bottom: 0
            });
            assert.deepEqual(item1.position, {
               right: 0,
               bottom: containers[2].offsetHeight
            });
         });

         it('elementUpdated', function() {
            const item = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.elementCreated(item, containers[1]);
            popupTemplate.NotificationController.elementUpdated(item, containers[2]);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 1);
            assert.equal(popupTemplate.NotificationController._stack.at(0), item);
            assert.equal(item.height, containers[2].offsetHeight);
            assert.deepEqual(item.position, {
               right: 0,
               bottom: 0
            });
         });

         it('elementDestroyed', function() {
            const item = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.elementCreated(item, containers[1]);
            popupTemplate.NotificationController.elementDestroyed(item);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 0);
         });

         it('getDefaultConfig', function() {
            const item = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.getDefaultConfig(item);
            assert.equal(item.popupOptions.content, NotificationContent);
         });

         it('getCustomZIndex', () => {
            let list = new collection.List();
            list.add({
               id: 1,
               popupOptions: {}
            });
            let zIndex = popup.Notification.zIndexCallback({}, list);
            assert.equal(zIndex, 100);

            list.add({
               id: 2,
               popupOptions: {
                  maximize: true,
               }
            });

            zIndex = popup.Notification.zIndexCallback({}, list);
            assert.equal(zIndex, 19);

            list.at(1).popupOptions.maximize = false;
            list.at(1).popupOptions.modal = true;

            zIndex = popup.Notification.zIndexCallback({}, list);
            assert.equal(zIndex, 19);

            let item = {
               id: 3,
               parentId: 2,
               popupOptions: {}
            };
            list.add(item);
            zIndex = popup.Notification.zIndexCallback(item, list);
            assert.equal(zIndex, 100);

         });

         it('getCompatibleConfig', () => {
            const cfg = {
               autoClose: true
            };

            popup.Notification.prototype._getCompatibleConfig({
               prepareNotificationConfig: function(config) {
                  return config;
               }
            }, cfg);
            assert.equal(cfg.notHide, false);
            cfg.autoClose = false;
            popup.Notification.prototype._getCompatibleConfig({
               prepareNotificationConfig: function(config) {
                  return config;
               }
            }, cfg);
            assert.equal(cfg.notHide, true);
         });

         it('Notification opener open/close', (done) => {
            let closeId = null;
            popup.Notification.openPopup = () => {
               return Promise.resolve('123');
            };

            popup.Notification.closePopup = (id) => {
               closeId = id;
            };

            const opener = new popup.Notification({});
            opener.open().then((id1) => {
               assert.equal(id1, '123');
               opener.open().then((id2) => {
                  assert.equal(id2, '123');
                  opener.close();
                  assert.equal(closeId, '123');
                  done();
               });
            });
         });
         describe('_validatePosition', () => {
            [{
               historyCoords: {
                  bottom: 0,
                  right: 0
               },
               result: {
                  bottom: 0,
                  right: 0
               }
            }, {
               historyCoords: {
                  bottom: 10000,
                  right: 10000
               },
               result: {
                  bottom: 980,
                  right: 980
               }
            }, {
               historyCoords: {
                  bottom: 10000,
                  right: 500
               },
               result: {
                  bottom: 980,
                  right: 500
               }
            }, {
               historyCoords: {
                  bottom: 500,
                  right: 10000
               },
               result: {
                  bottom: 500,
                  right: 980
               }
            }, {
               historyCoords: {
                  bottom: -100,
                  right: -200
               },
               result: {
                  bottom: 0,
                  right: 0
               }
            }].forEach((test) => {
               it('should set edges of window if popup does not fit it right', () => {
                  sinon.restore();
                  const item1 = {
                     popupOptions: {}
                  };
                  popupTemplate.NotificationController._historyCoords = test.historyCoords;
                  sinon.stub(sizeUtils.DimensionsMeasurer, 'getWindowDimensions').returns({
                     innerWidth: 1000,
                     innerHeight: 1000
                  });
                  popupTemplate.NotificationController.elementCreated(item1, containers[1]);

                  popupTemplate.NotificationController._validatePosition();

                  assert.equal(test.result.bottom, popupTemplate.NotificationController._historyCoords.bottom);
                  assert.equal(test.result.right, popupTemplate.NotificationController._historyCoords.right);
               });
            });
         });
      });
   }
);
