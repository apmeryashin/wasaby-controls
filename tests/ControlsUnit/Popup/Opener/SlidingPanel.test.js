define(
   [
      'Controls/popupSliding',
      'Controls/_popupSliding/Strategy',
      'Controls/popup'
   ],
   (popupSliding, Strategy, popupLib) => {
      'use strict';
      var StrategyConstructor = Strategy.Strategy;
      var StrategySingleton = Strategy.default;
      var Controller = popupSliding.Controller;
      var PopupController = popupLib.Controller;
      var getPopupItem = () => {
         return {
            id: 'randomId',
            position: {
               bottom: 0,
               left: 0,
               right: 0
            },
            previousSizes: {
               height: 400
            },
            sizes: {
               height: 500
            },
            popupOptions: {
               desktopMode: 'stack',
               slidingPanelOptions: {
                  heightList: [400, 600, 800],
                  position: 'bottom'
               }
            }
         };
      };
      const DEFAULT_BODY_HEIGHT = 900;
      var DEFAULT_BODY_COORDS = {
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         height: DEFAULT_BODY_HEIGHT,
         width: 1000
      };

      describe('Controls/popupSliding', () => {
         describe('Strategy getPosition', () => {
            it('default case', () => {
               const item = getPopupItem();
               const SlidingPanelStrategy = new StrategyConstructor();
               SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
               const position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

               assert.equal(position.height, 400);
               assert.equal(position.maxHeight, 800);
            });
            it('with initial position', () => {
               const SlidingPanelStrategy = new StrategyConstructor();
               const item = getPopupItem();
               item.position = {
                  bottom: 0,
                  height: 500
               };
               SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
               const position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

               assert.equal(position.height, item.position.height);
               assert.equal(position.bottom, 0);
            });
            it('Height can be zero', () => {
               const SlidingPanelStrategy = new StrategyConstructor();
               const item = getPopupItem();
               item.position = {
                  bottom: 0,
                  height: 0
               };
               SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
               const position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

               assert.equal(position.height, 0);
               assert.equal(position.bottom, 0);
            });
            describe('check overflow', () => {
               it('window height < minHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  const heightForOverflow = 300;
                  SlidingPanelStrategy._getWindowHeight = () => heightForOverflow;
                  const bodyCoords = {...DEFAULT_BODY_COORDS, height: heightForOverflow};
                  const position = SlidingPanelStrategy.getPosition(item, bodyCoords);

                  assert.equal(position.height, heightForOverflow);
                  assert.equal(position.maxHeight, heightForOverflow);
               });
               it('minHeight < window height < maxHeight', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  const heightForOverflow = 500;
                  SlidingPanelStrategy._getWindowHeight = () => heightForOverflow;
                  const bodyCoords = {...DEFAULT_BODY_COORDS, height: heightForOverflow};
                  const position = SlidingPanelStrategy.getPosition(item, bodyCoords);

                  assert.equal(position.height, 400);
                  assert.equal(position.maxHeight, heightForOverflow);
               });
            });
            describe('position', () => {
               it('bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  const position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

                  assert.equal(position.bottom, 0);
               });
               it('bottom', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  const position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

                  assert.equal(position.top, 0);
               });
            });

            describe('autoHeight', () => {
               it('initialisedHeight should be saved', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  item.position.height = 800;
                  item.popupOptions.slidingPanelOptions.autoHeight = true;
                  const position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

                  assert.equal(position.height, 800);
               });
               it('after recalc position height should be undefined, if drag is not started', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  item.popupOptions.slidingPanelOptions.autoHeight = true;
                  const position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

                  assert.equal(position.height, undefined);
               });
               it('if we have inner resize we can increase height but cant decrease', () => {
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.autoHeight = true;
                  item.previousSizes = {
                     width: 300,
                     height: 500
                  };
                  item.sizes = {
                     width: 300,
                     height: 600
                  };
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  let position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS, 'inner');

                  assert.equal(position.height, undefined);

                  item.sizes = {
                     width: 300,
                     height: 490
                  };
                  position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS, 'inner');
                  assert.equal(position.height, 500);
               });
            });
            
            it('restrictiveContainer', () => {
               const SlidingPanelStrategy = new StrategyConstructor();
               const item = getPopupItem();
               item.popupOptions.slidingPanelOptions.position = 'bottom';
               SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
               SlidingPanelStrategy._getWindowWidth = () => DEFAULT_BODY_COORDS.width;
               const restrictiveContainerCoords = {
                  top: 0,
                  bottom: 0,
                  left: 200,
                  right: 500
               };
               const position = SlidingPanelStrategy.getPosition(item, restrictiveContainerCoords);
               assert.equal(position.left, restrictiveContainerCoords.left);
               assert.equal(position.right, DEFAULT_BODY_COORDS.width - restrictiveContainerCoords.right);
            })
         });
         describe('Controller', () => {
            describe('elementCreated', () => {
               it('position bottom', () => {
                  const sandbox = sinon.sandbox.create();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                     return {
                        height: item.position.height
                     };
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });

                  item.sizes = {};
                  Controller.getDefaultConfig(item);
                  assert.equal(item.position.top, DEFAULT_BODY_HEIGHT);

                  const result = Controller.elementCreated(item, {});
                  assert.equal(item.position.top, 500);

                  assert.equal(result, true);
                  sandbox.restore();
               });
               it('position top', () => {
                  const sandbox = sinon.sandbox.create();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                     return {
                        height: item.position.height
                     };
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });

                  item.sizes = {};
                  Controller.getDefaultConfig(item);
                  assert.equal(item.position.bottom, DEFAULT_BODY_HEIGHT);
                  const result = Controller.elementCreated(item, {});

                  assert.equal(item.position.bottom, 500);
                  assert.equal(result, true);
                  sandbox.restore();
               });
            });
            it('elementUpdated', () => {
               const sandbox = sinon.sandbox.create();
               const item = getPopupItem();
               item.position = {
                  height: 500,
                  bottom: 0
               };

               sandbox.stub(StrategySingleton, 'getPosition').callsFake(() => {
                  return {};
               });
               sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
               sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                  return {
                     height: item.position.height
                  };
               });
               sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                  return DEFAULT_BODY_COORDS;
               });

               const result = Controller.elementUpdated(item, {});

               sinon.assert.called(StrategySingleton.getPosition);
               assert.equal(result, true);
               sandbox.restore();
            });
            it('elementUpdated called only for top element', () => {
               const sandbox = sinon.sandbox.create();
               const item1 = getPopupItem();
               const item2 = getPopupItem();
               item1.position = {
                  height: 500,
                  bottom: 0
               };
               item2.position = {
                  height: 500,
                  bottom: 0
               };

               sandbox.stub(StrategySingleton, 'getPosition').callsFake(() => {
                  return {
                     height: 500,
                     bottom: 0
                  };
               });
               sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
               sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                  return {
                     height: item2.position.height
                  };
               });
               sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                  return DEFAULT_BODY_COORDS;
               });
               Controller.elementCreated(item1, {});
               Controller.elementCreated(item2, {});
               const result1 = Controller.elementUpdated(item1, {});
               const result2 = Controller.elementUpdated(item2, {});

               Controller.elementDestroyed(item1, {});
               Controller.elementDestroyed(item2, {});

               assert.equal(result1, false);
               assert.equal(result2, true);
               sandbox.restore();
            });
            it('elementDestroyed + elementAnimated', (resolve) => {
               const sandbox = sinon.sandbox.create();
               const item = getPopupItem();
               const SlidingPanelStrategy = new StrategyConstructor();
               SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
               sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
               sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                  return {
                     height: item.position.height
                  };
               });
               sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                  return DEFAULT_BODY_COORDS;
               });

               item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);
               let destroyedPromiseResolved = false;

               const result = Controller.elementDestroyed(item);

               assert.equal(result instanceof Promise, true);

               Controller.elementAnimated(item);

               const timeoutId = setTimeout(() => {
                  assert.equal(destroyedPromiseResolved, true);
                  resolve();
               }, 200);

               result.then(() => {
                  destroyedPromiseResolved = true;
                  assert.equal(destroyedPromiseResolved, true);
                  clearTimeout(timeoutId);
                  resolve();
               });
               sandbox.restore();
            });

            it('elementDestroyed before elementCreated', (resolve) => {
               const sandbox = sinon.sandbox.create();
               const item = getPopupItem();
               const SlidingPanelStrategy = new StrategyConstructor();
               SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
               sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
               sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                  return {
                     height: item.position.height
                  };
               });
               sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                  return DEFAULT_BODY_COORDS;
               });

               item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

               item.animationState = 'initializing';

               const result = Controller.elementDestroyed(item);

               assert.isTrue(result instanceof Promise);
               result.then(resolve);
               sandbox.restore();
            });

            it('safari body dragging fix', () => {
               const sandbox = sinon.sandbox.create();
               const item1 = getPopupItem();
               const item2 = getPopupItem();

               sandbox.stub(Controller, '_toggleCancelBodyDragging');
               sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
               sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                  return {
                     height: item1.position.height
                  };
               });
               sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                  return DEFAULT_BODY_COORDS;
               });

               Controller.elementCreated(item1);
               Controller.elementCreated(item2);

               sinon.assert.calledOnce(Controller._toggleCancelBodyDragging);
               sinon.assert.calledWithMatch(Controller._toggleCancelBodyDragging, true);

               Controller.elementDestroyed(item1);
               Controller.elementDestroyed(item2);

               sinon.assert.calledTwice(Controller._toggleCancelBodyDragging);
               sinon.assert.calledWithMatch(Controller._toggleCancelBodyDragging, false);

               sandbox.restore();
            });

            describe('getDefaultConfig', () => {
               it('postion bottom', () => {

                  const item = getPopupItem();
                  const sandbox = sinon.sandbox.create();
                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                     return {
                        height: item.position.height
                     };
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });

                  Controller.getDefaultConfig(item);

                  assert.equal(item.popupOptions.className.includes('controls-SlidingPanel__animation'), true);
                  assert.deepEqual(item.popupOptions.slidingPanelData, {
                     minHeight: item.popupOptions.slidingPanelOptions.heightList[0],
                     maxHeight: item.position.maxHeight,
                     height: item.position.height,
                     isMobileMode: true,
                     position: item.popupOptions.slidingPanelOptions.position,
                     desktopMode: 'stack'
                  });
                  assert.equal(item.popupOptions.hasOwnProperty('content'), true);
                  sandbox.restore();
               });

               it('position top', () => {
                  const sandbox = sinon.sandbox.create();
                  const item = getPopupItem();
                  item.popupOptions.slidingPanelOptions.position = 'top';
                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });
                  Controller.getDefaultConfig(item);

                  assert.equal(
                     item.popupOptions.className.includes('controls-SlidingPanel__animation'),
                     true
                  );
                  assert.deepEqual(item.popupOptions.slidingPanelData, {
                     minHeight: item.popupOptions.slidingPanelOptions.heightList[0],
                     maxHeight: item.position.maxHeight,
                     height: item.position.height,
                     isMobileMode: true,
                     position: item.popupOptions.slidingPanelOptions.position,
                     desktopMode: 'stack'
                  });
                  assert.equal(item.popupOptions.hasOwnProperty('content'), true);
                  sandbox.restore();
               });
            });
            describe('popupDragStart', () => {
               it('position bottom', () => {
                  const sandbox = sinon.sandbox.create();
                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  let height = 0;

                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });
                  sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                     return {
                        height: item.position.height
                     };
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 0,
                     y: 10
                  });
                  assert.equal(height, startHeight - 10);
                  Controller.popupDragEnd(item);
                  assert.equal(height, item.popupOptions.slidingPanelOptions.heightList[0]);
                  sandbox.restore();
               });

               it('position top', () => {
                  const sandbox = sinon.sandbox.create();
                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  let height = 0;

                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });
                  sandbox.stub(Controller, '_getPopupSizes').callsFake(() => {
                     return {
                        height: item.position.height
                     };
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  item.popupOptions.slidingPanelOptions.position = 'top';
                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: 10
                  });
                  assert.equal(height, startHeight + 10);
                  Controller.popupDragEnd(item);
                  assert.equal(height, item.popupOptions.slidingPanelOptions.heightList[1]);
                  sandbox.restore();
               });
               it('double drag', () => {
                  const sandbox = sinon.sandbox.create();
                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  let height = 0;

                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 0,
                     y: 10
                  });
                  Controller.popupDragStart(item, {}, {
                     x: 0,
                     y: -20
                  });
                  assert.equal(height, startHeight + 20);
                  Controller.popupDragEnd(item);
                  assert.equal(height, item.popupOptions.slidingPanelOptions.heightList[1]);
                  sandbox.restore();
               });
               it('overflow max', () => {
                  const sandbox = sinon.sandbox.create();
                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  let height = 0;

                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: -10000
                  });
                  Controller.popupDragEnd(item);

                  assert.equal(height, startHeight + 10000);
                  sinon.assert.called(StrategySingleton.getPosition);
                  sandbox.restore();
               });
               it('overflow min', () => {
                  const sandbox = sinon.sandbox.create();
                  let height = 0;
                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);
                  item.position.height = item.position.height + 100;
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: 10000
                  });
                  Controller.popupDragEnd(item);
                  assert.equal(height, startHeight - 10000);
                  sinon.assert.called(StrategySingleton.getPosition);
                  sandbox.restore();
               });
               it('close by drag', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(PopupController, 'remove').callsFake(() => null);

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;
                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });

                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: 10
                  });
                  Controller.popupDragEnd(item);
                  sinon.assert.called(PopupController.remove);
                  sandbox.restore();
               });
               it('minHeight > windowHeight. try to drag top. window should not close', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(PopupController, 'remove').callsFake(() => null);

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy._getWindowHeight = () => 300;
                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => 300);
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });

                  const bodyCoords = {...DEFAULT_BODY_COORDS, height: 300};
                  item.position = SlidingPanelStrategy.getPosition(item, bodyCoords);

                  Controller.popupDragStart(item, {}, {
                     x: 0, y: -10
                  });
                  Controller.popupDragEnd(item);
                  sinon.assert.notCalled(PopupController.remove);
                  sandbox.restore();
               });
               it('heightList when drag ended height should moved to closer height step', () => {
                  const sandbox = sinon.sandbox.create();
                  sandbox.stub(PopupController, 'remove').callsFake(() => null);

                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();

                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });

                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);

                  const heightList = item.popupOptions.slidingPanelOptions.heightList;

                  // closer to first step
                  Controller.popupDragStart(item, {}, {
                     x: 0, y: 50
                  });
                  Controller.popupDragEnd(item);
                  assert.equal(item.position.height, heightList[0]);

                  // closer to second step
                  Controller.popupDragStart(item, {}, {
                     x: 0, y: -100
                  });
                  Controller.popupDragEnd(item);
                  assert.equal(item.position.height, heightList[1]);
                  sandbox.restore();
               });

               it('horizontal drag should not change popup height', () => {
                  const sandbox = sinon.sandbox.create();
                  const item = getPopupItem();
                  const SlidingPanelStrategy = new StrategyConstructor();
                  let height = 0;

                  sandbox.stub(StrategySingleton, '_getWindowHeight').callsFake(() => DEFAULT_BODY_HEIGHT);
                  sandbox.stub(StrategySingleton, 'getPosition').callsFake((item) => {
                     height = item.position.height;
                     return item.position;
                  });
                  sandbox.stub(Controller, '_getRestrictiveContainerCoords').callsFake(() => {
                     return DEFAULT_BODY_COORDS;
                  });
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  item.popupOptions.slidingPanelOptions.position = 'bottom';
                  item.position = SlidingPanelStrategy.getPosition(item, DEFAULT_BODY_COORDS);
                  const startHeight = item.position.height;

                  Controller.popupDragStart(item, {}, {
                     x: 20,
                     y: -10
                  });
                  Controller.popupDragEnd(item);
                  assert.equal(height, startHeight);
                  sandbox.restore();
               });
            });
            describe('compatibility min/max height and heightList', () => {
               it('minHeight', () => {
                  const item = getPopupItem();
                  const heightList = item.popupOptions.slidingPanelOptions.heightList;
                  const minHeight = heightList[0];
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  assert.equal(SlidingPanelStrategy.getMinHeight(item), minHeight);

                  item.popupOptions.slidingPanelOptions.heightList = null;
                  item.popupOptions.slidingPanelOptions.minHeight = minHeight;

                  assert.equal(SlidingPanelStrategy.getMinHeight(item), minHeight);
               });

               it('maxHeight', () => {
                  const item = getPopupItem();
                  const heightList = item.popupOptions.slidingPanelOptions.heightList;
                  const maxHeight = heightList[heightList.length - 1];
                  const SlidingPanelStrategy = new StrategyConstructor();
                  SlidingPanelStrategy._getWindowHeight = () => DEFAULT_BODY_HEIGHT;

                  assert.equal(SlidingPanelStrategy.getMaxHeight(item), maxHeight);

                  item.popupOptions.slidingPanelOptions.heightList = null;
                  item.popupOptions.slidingPanelOptions.maxHeight = maxHeight;

                  assert.equal(SlidingPanelStrategy.getMaxHeight(item), maxHeight);
               });
            });
         });
      });
   }
);
