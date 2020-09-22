define(
   [
      'Controls/popup',
      'Controls/_popupTemplate/BaseController',
      'Core/Deferred'
   ],

   function(popupMod, BaseController, Deferred) {
      'use strict';
      BaseController = BaseController.default;

      function getManager() {
         let Manager = new popupMod.ManagerClass();
         let Container = new popupMod.Container();
         Manager.init({});
         Container._afterMount();
         return Manager;
      }

      before(() => {
         BaseController.prototype._checkContainer = () => true;
      });

      describe('Controls/_popup/Manager/ManagerController', () => {
         it('initialize', function() {
            // Manager and container doesn't initialized
            popupMod.Controller._manager = undefined;
            assert.equal(popupMod.Controller.find(), false);
         });

         it('callMethod', () => {
            getManager();
            let arg0 = '1';
            let arg1 = '2';
            let methodName;

            let baseMethod = popupMod.Controller._callManager;

            popupMod.Controller._callManager = (method, args) => {
               assert.equal(methodName, method);
               assert.equal(args[0], arg0);
               assert.equal(args[1], arg1);
            };

            for (methodName of ['find', 'remove', 'update', 'show']) {
               popupMod.Controller[methodName](arg0, arg1);
            }

            popupMod.Controller._callManager = baseMethod;
         });
      });

      describe('Controls/_popup/Manager', function() {
         let id, element;
         let Manager = getManager();

         it('initialize', function() {
            Manager = getManager();
            assert.equal(Manager._popupItems.getCount(), 0);
         });

         it('append popup', function() {
            Manager = getManager();
            id = Manager.show({
               testOption: 'created'
            }, new BaseController());
            assert.equal(Manager._popupItems.getCount(), 1);
            element = Manager.find(id);
            assert.equal(element.popupOptions.testOption, 'created');
         });

         it('add popup async', function(done) {
            const Manager = getManager();
            const Controller = new BaseController();
            Controller.getDefaultConfig = () => {
               assert.equal(Manager._popupItems.getCount(), 0);
               setTimeout(() => {
                  assert.equal(Manager._popupItems.getCount(), 1);
                  Manager.destroy();
                  done();
               }, 30);
               return Promise.resolve();
            };
            id = Manager.show({
               testOption: 'created'
            }, Controller);
         });

         it('find popup', () => {
            Manager = getManager();
            id = Manager.show({
               testOption: 'created'
            }, new BaseController());
            element = Manager.find(id);
            assert.equal(element.popupOptions.testOption, 'created');
            element.popupState = 'destroyed';
            element = Manager.find(id);
            assert.equal(element, null);
         });

         it('update popup', function() {
            Manager = getManager();
            id = Manager.show({
               testOption: 'created'
            }, new BaseController());
            element = Manager.find(id);
            element.popupState = 'created';
            id = Manager.update(id, {
               testOption: 'updated1'
            });
            assert.equal(element.popupOptions.testOption, 'updated1');
            id = Manager.show({
               id: id,
               testOption: 'updated2'
            }, new BaseController());
            assert.equal(element.popupOptions.testOption, 'updated2');
         });

         it('fireEventHandler', function() {
            Manager = getManager();
            let eventOnCloseFired = false;
            id = Manager.show({
               testOption: 'created'
            }, new BaseController());
            var eventCloseFired = false;
            element = Manager.find(id);
            element.popupState = 'created';
            Manager.update(id, {
               eventHandlers: {
                  onClose: function() {
                     eventCloseFired = true;
                  }
               },
               _events: {
                  onClose: () => {
                     eventOnCloseFired = true;
                  },
                  onResult: (event, args) => {
                     assert.equal(args[0], '1');
                     assert.equal(args[1], '2');
                  }
               }
            });

            Manager._fireEventHandler.call(Manager, element, 'onClose');

            assert.isTrue(eventCloseFired, 'event is not fired.');
            assert.isTrue(eventOnCloseFired, 'event is not fired.');

            Manager._fireEventHandler.call(Manager, id, 'onResult', '1', '2');
         });

         it('remove popup', function(done) {
            Manager = getManager();
            id = Manager.show({
               testOption: 'created'
            }, new BaseController());
            Manager.remove(id).then(() => {
               assert.equal(Manager._popupItems.getCount(), 0);
               done();
            });
            const item = Manager.find(id);
            assert.equal(item.popupState, 'startDestroying');
         });

         it('remove popup with pendings', function(done) {
            Manager = getManager();
            let id1 = Manager.show({
               testOption: 'created'
            }, new BaseController());
            let id2 = Manager.show({
               testOption: 'created'
            }, new BaseController());
            let id3 = Manager.show({
               testOption: 'created'
            }, new BaseController());

            let hasPending = true;
            let pendingDeferred = new Deferred();

            let Pending = {
               hasRegisteredPendings: () => hasPending,
               finishPendingOperations: () => pendingDeferred
            };

            Manager._getPopupContainer = () => ({
               getPending: () => Pending
            });

            Manager.remove(id1);
            // wait promise timeout
            setTimeout(() => {
               assert.equal(Manager._popupItems.getCount(), 3);

               Pending = false;
               Manager.remove(id2).then(() => {
                  assert.equal(Manager._popupItems.getCount(), 2);
                  Pending = {
                     hasRegisteredPendings: () => hasPending,
                     finishPendingOperations: () => pendingDeferred
                  };

                  Manager.remove(id3);
                  //wait promise timeout
                  setTimeout(() => {
                     assert.equal(Manager._popupItems.getCount(), 2);
                     pendingDeferred.callback();
                     assert.equal(Manager._popupItems.getCount(), 0);
                     done();
                  }, 10);
               });
            }, 10);
         });

         it('remove popup and check event', function(done) {
            Manager = getManager();
            let eventCloseFired = false;
            let eventOnCloseFired = false;
            id = Manager.show({
               eventHandlers: {
                  onClose: function() {
                     eventCloseFired = true;
                  }
               },
               _events: {
                  onClose: () => {
                     eventOnCloseFired = true;
                  }
               }
            }, new BaseController());
            Manager.remove(id).then(() => {
               assert.equal(eventCloseFired, false);
               assert.equal(eventOnCloseFired, false);
               done();
            });
         });

         it('add modal popup', function(done) {
            Manager = getManager();
            let id1 = Manager.show({
               modal: false,
               testOption: 'created'
            }, new BaseController());

            Manager.show({
               modal: true,
               testOption: 'created'
            }, new BaseController());

            let indices = Manager._popupItems.getIndicesByValue('modal', true);
            assert.equal(indices.length, 1);
            assert.equal(indices[0], 1);

            Manager.remove(id1).then(() => {
               indices = Manager._popupItems.getIndicesByValue('modal', true);
               assert.equal(indices.length, 1);
               assert.equal(indices[0], 0);
               done();
            });
         });

         it('popup deactivated', () => {
            Manager = getManager();
            let isDeactivated = false;
            let controller = {
               popupDeactivated: () => {
                  isDeactivated = true;
               },
               getDefaultConfig: () => ({}),
               POPUP_STATE_INITIALIZING: 'initializing'
            };
            let id = Manager.show({
               closeOnOutsideClick: true,
               closeOnDeactivated: true
            }, controller);

            let item = Manager.find(id);

            let baseFinishPendings = Manager._finishPendings;
            Manager._finishPendings = (popupId, popupCallback, pendingCallback, pendingsFinishedCallback) => {
               pendingsFinishedCallback();
            };
            Manager._popupDeactivated(id);
            assert.equal(isDeactivated, false);

            item.popupState = 'create';
            Manager._popupDeactivated(id);
            assert.equal(isDeactivated, true);

            isDeactivated = false;
            item.popupOptions.closeOnOutsideClick = false;
            item.popupOptions.closeOnDeactivated = false;
            Manager._popupDeactivated(id);
            assert.equal(isDeactivated, false);

            Manager._finishPendings = baseFinishPendings;
         });

         it('managerPopupMaximized notified', function() {
            let popupOptions = {
               modal: false,
               maximize: false,
               testOption: 'created'
            };
            Manager = getManager();
            var isMaximizeNotified;
            const stub = sinon.stub(popupMod.ManagerClass, '_notifyEvent').callsFake(function(event, args) {
               isMaximizeNotified = event === 'managerPopupMaximized';
               assert.isTrue(popupOptions === args[0].popupOptions);
            });
            let id0 = Manager.show(popupOptions, new BaseController());
            Manager._popupMaximized(id0);
            assert.isTrue(isMaximizeNotified);
            stub.restore();
         });
         it('managerPopupUpdated notified', function() {
            let popupOptions = {
               modal: false,
               maximize: false,
               testOption: 'created'
            };
            Manager = getManager();
            var isUpdateNotified;
            const stub = sinon.stub(popupMod.ManagerClass, '_notifyEvent').callsFake(function(event, args) {
               isUpdateNotified = event === 'managerPopupUpdated';
               assert.isTrue(popupOptions === args[0].popupOptions);
            });
            let id0 = Manager.show(popupOptions, new BaseController());
            Manager._popupUpdated(id0);
            assert.isTrue(isUpdateNotified);
            isUpdateNotified = null;
            Manager._popupResizingLine(id0, {});
            assert.isTrue(isUpdateNotified);
            stub.restore();
         });
         it('managerPopupDestroyed notified', function(done) {
            let popupOptions = {
               testOption: 'created'
            };
            Manager = getManager();
            var isDestroyNotified;
            const stub = sinon.stub(popupMod.ManagerClass, '_notifyEvent').callsFake(function(event, args) {
               isDestroyNotified = event === 'managerPopupDestroyed';
               if (event === 'managerPopupDestroyed') {
                  assert.equal(args[1].getCount(), 0);
               }
               assert.equal(popupOptions, args[0].popupOptions);
            });
            id = Manager.show(popupOptions, new BaseController());
            Manager.remove(id).then(() => {
               assert.isTrue(isDestroyNotified);
               stub.restore();
               done();
            });
         });
         it('isIgnoreActivationArea', function() {
            let focusedContainer = {
               classList: {
                  contains: function(str) {
                     if (str === 'controls-Popup__isolatedFocusingContext') {
                        return true;
                     }
                     return false;
                  }
               }
            };
            let focusedArea = {};
            Manager = getManager();
            var firstResult = Manager._isIgnoreActivationArea(focusedContainer);
            assert.equal(firstResult, true);
            var secondResult = Manager._isIgnoreActivationArea(focusedArea);
            assert.equal(secondResult, false);
         });
         it('mousedownHandler', function() {
            Manager =
               getManager();
            let deactivatedCount = 0;
            Manager.remove = () => deactivatedCount++;
            Manager._isIgnoreActivationArea = () => false;
            Manager._isNewEnvironment = () => true;
            Manager._needClosePopupByOutsideClick = (item) => item.popupOptions.closeOnOutsideClick;
            let id1 = Manager.show({
               testOption: 'created',
               autofocus: false,
               closeOnOutsideClick: true
            }, new BaseController());
            let id2 = Manager.show({
               testOption: 'created'
            }, new BaseController());
            let id3 = Manager.show({
               testOption: 'created',
               autofocus: false,
               closeOnOutsideClick: true
            }, new BaseController());
            let event = {
               target: {
                  classList: {
                     contains: () => false
                  }
               }
            }
            Manager.mouseDownHandler(event);
            assert.equal(deactivatedCount, 2);
            Manager.destroy();
         });
         it('Linked Popups', function(done) {
            Manager = getManager();

            let id1 = Manager.show({
            }, new BaseController());

            let id2 = Manager.show({
            }, new BaseController());

            Manager._popupItems.at(0).childs = [Manager._popupItems.at(1)];
            Manager._popupItems.at(1).parentId = id1;

            let item1 = Manager._popupItems.at(0);
            let removeDeferred2 = new Deferred();
            let baseRemove = Manager._removeElement;
            Manager._removeElement = (element, container) => {
               if (element.id === id2) {
                  element.controller._elementDestroyed = () => removeDeferred2;
               }
               Manager._notify = () => {};
               return baseRemove.call(Manager, element, container);
            };
            Manager.remove(id1);
            // wait promise timeout
            setTimeout(() => {
               assert.equal(Manager._popupItems.getCount(), 2);
               removeDeferred2.callback();
               // wait promise timeout
               setTimeout(() => {
                  assert.equal(Manager._popupItems.getCount(), 0);
                  Manager.destroy();
                  done();
               }, 10);
            }, 10);
         });

         it('removeFromParentConfig', function() {
            Manager = getManager();

            let id1 = Manager.show({
            }, new BaseController());

            let id2 = Manager.show({
            }, new BaseController());

            Manager._popupItems.at(0).childs = [Manager._popupItems.at(1)];
            Manager._popupItems.at(1).parentId = id1;
            Manager._removeFromParentConfig(Manager._popupItems.at(1));
            assert.equal(Manager._popupItems.at(0).childs.length, 0);

            Manager.destroy();
         });
         it('managerPopupCreated notified', function() {
            let isPopupOpenedEventTriggered = false;
            let popupOptions = {
               modal: false,
               maximize: false,
               testOption: 'created',
               _events: {
                  onOpen: () => {
                     isPopupOpenedEventTriggered = true;
                  }
               }
            };
            Manager = getManager();
            var isCreateNotified;
            const stub = sinon.stub(popupMod.ManagerClass, '_notifyEvent').callsFake(function(event, args) {
               isCreateNotified = event === 'managerPopupCreated';
               assert.isTrue(popupOptions === args[0].popupOptions);
            });
            let id0 = Manager.show(popupOptions, new BaseController());
            Manager._popupCreated.call(Manager, id0);
            Manager._popupBeforePaintOnMount.call(Manager, id0);
            assert.isTrue(isCreateNotified);
            assert.isTrue(isPopupOpenedEventTriggered);
            stub.restore();
         });
         it('managerPopupResingLine', function() {
            let popupOptions = {
               width: 500,
               maxWidth: 800,
               minWidth: 300
            };
            Manager = getManager();
            let offset = 100;
            let id0 = Manager.show(popupOptions, new BaseController());
            let element = Manager._popupResizingLine(id0, offset);
            assert.isTrue(element);
         });
         it('managerPopupAnimated', () => {
            let id0 = Manager.show({}, new BaseController());
            let hasError = false;
            try {
               Manager._popupAnimated(id0);
            } catch(err) {
               hasError = true;
            }
            assert.equal(false, hasError, 'Не смогли вызвать обработку анимании на контроллере');
         });

         it('calculateZIndex', () => {
            Manager = getManager();
            const controller = {
               getDefaultConfig: () => {}
            };
            const item1 = {
               id: 1
            };
            Manager.show(item1, controller);
            assert.equal(Manager._popupItems.at(0).currentZIndex, 10);

            const item2 = {
               id: 2,
               topPopup: true
            };
            Manager.show(item2, controller);
            assert.equal(Manager._popupItems.at(1).currentZIndex, 4000);

            const item3 = {
               id: 3,
            };
            Manager.show(item3, controller);
            Manager._popupItems.at(2).parentId = 2;
            Manager._updateZIndex();
            assert.equal(Manager._popupItems.at(2).currentZIndex, 4010);

            const item4 = {
               id: 2,
               zIndexCallback: () => 5000
            };
            Manager.show(item4, controller);
            assert.equal(Manager._popupItems.at(3).currentZIndex, 5000);
            Manager.destroy();
         });

         it('update popup poisition by scroll and resize', () => {
            Manager = getManager();
            let isResetRootContainerCalled = false;
            let isControllerCalled = false;
            const BaseController = {
               resetRootContainerCoords: () => {
                  isResetRootContainerCalled = true;
               }
            };
            const controllerCallback = () => {
               isControllerCalled = true;
            };
            const item = {
               controller: {
                  resizeOuter: controllerCallback,
                  pageScrolled: controllerCallback,
                  workspaceResize: controllerCallback,
               }
            };
            Manager._popupItems.add(item);
            Manager._getBaseController = () => BaseController;
            Manager._getItemContainer = () => {};
            Manager._pageScrolledBase();
            assert.equal(isResetRootContainerCalled, true);
            assert.equal(isControllerCalled, true);

            const methods = ['_popupResizeOuterBase', '_workspaceResize', '_pageScrolledBase'];
            for (const method of methods) {
               Manager[method]();
               assert.equal(isResetRootContainerCalled, true);
               assert.equal(isControllerCalled, true);
               isResetRootContainerCalled = false;
               isControllerCalled = false;
            }
            Manager.destroy();
         });

         it('finishPendings', () => {
            Manager = getManager();
            let popupId = Manager.show({
               closeOnOutsideClick: true,
               closeOnDeactivated: true
            }, new BaseController());

            let hasPending = true;
            let pendingDeferred = new Deferred();

            let Pending = {
               hasRegisteredPendings: () => hasPending,
               finishPendingOperations: () => pendingDeferred
            };

            Manager._getPopupContainer = () => ({
               getPending: () => Pending
            });

            Manager._finishPendings(popupId,null,null,null);
            let item = Manager._popupItems.at(0);
            let error = new Error('error');
            error.canceled = true;
            item.removePending.errback(error);
            assert.strictEqual(item.popupState, 'created');
            assert.strictEqual(item.removePending, null);
            Manager.destroy();
         });
      });
   }
);
