define(['Controls/List/Tree/TreeViewModel', 'Core/core-merge', 'WS.Data/Collection/RecordSet', 'WS.Data/Collection/IBind'], function(TreeViewModel, cMerge, RecordSet, IBindCollection) {
   function MockedDisplayItem(cfg) {
      var
         self = this;
      this._id = cfg.id;
      this._isNode = cfg.isNode;
      this.isNode = function() {
         return this._isNode;
      };
      this.getContents = function() {
         return {
            getId: function() {
               return self._id;
            },
            get: function() {
               return self._isNode;
            }
         };
      };
   }
   var
      treeData = [
         {
            'id': '123',
            'title': 'Хлеб',
            'price': 50,
            'parent': null,
            'parent@': true,
            'balance': 15
         },
         {
            'id': '234',
            'title': 'Батон',
            'price': 150,
            'parent': '123',
            'parent@': true,
            'balance': 3
         },
         {
            'id': '1',
            'title': 'один',
            'parent': '234',
            'parent@': false
         },
         {
            'id': '2',
            'title': 'два',
            'parent': '234',
            'parent@': false
         },
         {
            'id': '3',
            'title': 'три',
            'parent': '234',
            'parent@': true
         },
         {
            'id': '345',
            'title': 'Масло',
            'price': 100,
            'parent': null,
            'parent@': null,
            'balance': 5
         },
         {
            'id': '456',
            'title': 'Помидор',
            'price': 75,
            'parent': null,
            'parent@': null,
            'balance': 7
         },
         {
            'id': '567',
            'title': 'Капуста китайская',
            'price': 35,
            'parent': null,
            'parent@': null,
            'balance': 2
         }
      ],
      cfg = {
         keyProperty: 'id',
         displayProperty: 'title',
         parentProperty: 'parent',
         nodeProperty: 'parent@',
         items: new RecordSet({
            rawData: treeData,
            idProperty: 'id'
         })
      };

   describe('Controls.List.Tree.TreeViewModel', function() {
      describe('"_private" block', function() {
         var
            treeViewModel = new TreeViewModel(cfg);
         it('isVisibleItem', function() {
            var
               item = treeViewModel.getItemById('123', cfg.keyProperty),
               itemChild;
            assert.isTrue(TreeViewModel._private.isVisibleItem.call({
               expandedNodes: treeViewModel._expandedNodes,
               keyProperty: treeViewModel._options.keyProperty
            }, item), 'Invalid value "isVisibleItem(123)".');
            treeViewModel.toggleExpanded(item, true);
            itemChild = treeViewModel.getItemById('234', cfg.keyProperty);
            assert.isTrue(TreeViewModel._private.isVisibleItem.call({
               expandedNodes: treeViewModel._expandedNodes,
               keyProperty: treeViewModel._options.keyProperty
            }, itemChild), 'Invalid value "isVisibleItem(234)".');
            treeViewModel.toggleExpanded(item, false);
            assert.isFalse(TreeViewModel._private.isVisibleItem.call({
               expandedNodes: treeViewModel._expandedNodes,
               keyProperty: treeViewModel._options.keyProperty
            }, itemChild), 'Invalid value "isVisibleItem(234)".');
         });
         it('displayFilter', function() {
            var
               item = treeViewModel.getItemById('123', cfg.keyProperty),
               itemChild;
            assert.isTrue(TreeViewModel._private.displayFilterTree.call({
               expandedNodes: treeViewModel._expandedNodes,
               keyProperty: treeViewModel._options.keyProperty
            }, item.getContents(), 0, item), 'Invalid value "displayFilterTree(123)".');
            treeViewModel.toggleExpanded(item, true);
            itemChild = treeViewModel.getItemById('234', cfg.keyProperty);
            assert.isTrue(TreeViewModel._private.displayFilterTree.call({
               expandedNodes: treeViewModel._expandedNodes,
               keyProperty: treeViewModel._options.keyProperty
            }, itemChild.getContents(), 1, itemChild), 'Invalid value "displayFilterTree(234)".');
            treeViewModel.toggleExpanded(item, false);
            assert.isFalse(TreeViewModel._private.displayFilterTree.call({
               expandedNodes: treeViewModel._expandedNodes,
               keyProperty: treeViewModel._options.keyProperty
            }, itemChild.getContents(), 1, itemChild), 'Invalid value "displayFilterTree(234)".');
         });
         it('getDisplayFilter', function() {
            assert.isTrue(TreeViewModel._private.getDisplayFilter(treeViewModel._expandedNodes, treeViewModel._options).length === 1,
               'Invalid filters count prepared by "getDisplayFilter".');
            treeViewModel = new TreeViewModel(cMerge({itemsFilterMethod: function() {return true;}}, cfg));
            assert.isTrue(TreeViewModel._private.getDisplayFilter(treeViewModel._expandedNodes, treeViewModel._options).length === 2,
               'Invalid filters count prepared by "getDisplayFilter" with "itemsFilterMethod".');
         });
         it('shouldDrawExpander', function() {
            var
               testsShouldDrawExpander = [{
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return null;
                        }
                     }
                  },
                  expanderIcon: 'none'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  },
                  expanderIcon: 'none'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'none'
               }],
               testsResultShouldDrawExpander = [false, false, false, true, true, false, true, true, false];
            testsShouldDrawExpander.forEach(function(item, i) {
               assert.equal(TreeViewModel._private.shouldDrawExpander(testsShouldDrawExpander[i].itemData, testsShouldDrawExpander[i].expanderIcon),
                  testsResultShouldDrawExpander[i],
                  'Invalid value "shouldDrawExpander(...)" for step ' + i + '.');
            });
         });
         it('prepareExpanderClasses', function() {
            var
               testsPrepareExpanderClasses = [{
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return false;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  }
               }, {
                  itemData: {
                     item: {
                        get: function() {
                           return true;
                        }
                     }
                  },
                  expanderIcon: 'testIcon'
               }],
               testsResultPrepareExpanderClasses = [
                  'controls-TreeGrid__row-expander controls-TreeGrid__row-expander_size_default js-controls-ListView__notEditable controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_collapsed',
                  'controls-TreeGrid__row-expander controls-TreeGrid__row-expander_size_default js-controls-ListView__notEditable controls-TreeGrid__row-expander_testIcon controls-TreeGrid__row-expander_testIcon_collapsed',
                  'controls-TreeGrid__row-expander controls-TreeGrid__row-expander_size_default js-controls-ListView__notEditable controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_collapsed',
                  'controls-TreeGrid__row-expander controls-TreeGrid__row-expander_size_default js-controls-ListView__notEditable controls-TreeGrid__row-expander_testIcon controls-TreeGrid__row-expander_testIcon_collapsed'
               ];
            testsPrepareExpanderClasses.forEach(function(item, i) {
               assert.equal(TreeViewModel._private.prepareExpanderClasses(testsPrepareExpanderClasses[i].itemData, testsPrepareExpanderClasses[i].expanderIcon),
                  testsResultPrepareExpanderClasses[i],
                  'Invalid value "prepareExpanderClasses(...)" for step ' + i + '.');
            });
         });
      });
      describe('public methods', function() {
         var
            treeViewModel = new TreeViewModel(cfg);
         it('getCurrent and toggleExpanded', function() {
            assert.equal(undefined, treeViewModel._expandedNodes['123'], 'Invalid value "_expandedNodes" before call "toggleExpanded(123, true)".');
            assert.isFalse(treeViewModel.getCurrent().isExpanded, 'Invalid value "getCurrent()" before call "toggleExpanded(123, true)".');

            treeViewModel.toggleExpanded(treeViewModel.getCurrent().dispItem, true);
            assert.isTrue(treeViewModel._expandedNodes['123'], 'Invalid value "_expandedNodes" after call "toggleExpanded(123, true)".');
            assert.isTrue(treeViewModel.getCurrent().isExpanded, 'Invalid value "getCurrent()" after call "toggleExpanded(123, true)".');

            treeViewModel.toggleExpanded(treeViewModel.getCurrent().dispItem, false);
            assert.equal(undefined, treeViewModel._expandedNodes['123'], 'Invalid value "_expandedNodes" after call "toggleExpanded(123, false)".');
            assert.isFalse(treeViewModel.getCurrent().isExpanded, 'Invalid value "getCurrent()" after call "toggleExpanded(123, false)".');

            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty), true);
            treeViewModel.toggleExpanded(treeViewModel.getItemById('234', cfg.keyProperty), true);
            assert.deepEqual({ '123': true, '234': true }, treeViewModel._expandedNodes, 'Invalid value "_expandedNodes" after expand "123" and "234".');
            treeViewModel.toggleExpanded(treeViewModel.getItemById('123', cfg.keyProperty), false);
            assert.deepEqual({}, treeViewModel._expandedNodes, 'Invalid value "_expandedNodes" after collapse "123".');
         });

         it('multiSelectStatus', function() {
            treeViewModel.toggleExpanded(treeViewModel.getCurrent().dispItem, true);
            treeViewModel._curIndex = 1; //234
            treeViewModel.toggleExpanded(treeViewModel.getCurrent().dispItem, true);
            treeViewModel._updateSelection(['123', '234', '1', '2', '3']);
            treeViewModel._curIndex = 0; //123
            assert.isTrue(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._curIndex = 1; //234
            assert.isTrue(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._updateSelection(['123', '234', '1']);
            treeViewModel._curIndex = 0; //123
            assert.isNull(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._curIndex = 1; //123
            assert.isNull(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._updateSelection(['123']);
            treeViewModel._curIndex = 0; //123
            assert.isFalse(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._curIndex = 1; //234
            assert.isFalse(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._updateSelection(['123', '234', '3']);
            treeViewModel._curIndex = 0; //123
            assert.isNull(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._curIndex = 1; //234
            assert.isNull(treeViewModel.getCurrent().multiSelectStatus);
            treeViewModel._curIndex = 4; //3
            assert.isTrue(treeViewModel.getCurrent().multiSelectStatus);
         });

         it('setRoot', function() {
            treeViewModel.setRoot('testRoot');
            assert.deepEqual({}, treeViewModel._expandedNodes, 'Invalid value "_expandNodes" after setRoot("testRoot").');
            assert.equal('testRoot', treeViewModel._display.getRoot().getContents(), 'Invalid value "_expandNodes" after setRoot("testRoot").');
         });
         it('onCollectionChange', function() {
            var
               removedItems1 = [
                  new MockedDisplayItem({ id: 'mi1', isNode: true }), new MockedDisplayItem({ id: 'mi3', isNode: false })],
               removedItems2 = [
                  new MockedDisplayItem({ id: 'mi2', isNode: true }), new MockedDisplayItem({ id: 'mi4', isNode: false })],
               notifiedOnNodeRemoved = false;
            treeViewModel._expandedNodes = { 'mi1': true, 'mi2': true };
            treeViewModel._notify = function(eventName) {
               if (eventName === 'onNodeRemoved') {
                  notifiedOnNodeRemoved = true;
               }
            };
            treeViewModel._onCollectionChange(null, IBindCollection.ACTION_REMOVE, null, null, removedItems1, null);
            assert.deepEqual(treeViewModel._expandedNodes, { 'mi2': true }, 'Invalid value "_expandedNodes" after "onCollectionChange".');
            treeViewModel._onCollectionChange(null, IBindCollection.ACTION_REMOVE, null, null, removedItems2, null);
            assert.deepEqual(treeViewModel._expandedNodes, {}, 'Invalid value "_expandedNodes" after "onCollectionChange".');
            assert.isTrue(notifiedOnNodeRemoved, 'Event "onNodeRemoved" not notified.');
         });
      });
   });
});
