define(['Controls/operations'], function(operations) {
   'use strict';
   describe('Controls/_operations/Panel/Container', function() {
      it('_getSelectedKeys', function() {
         let containerInstance = new operations.PanelContainer();

         assert.deepEqual(containerInstance._getSelectedKeys({
            listMarkedKey: null,
            selectedKeys: []
         }), []);

         assert.deepEqual(containerInstance._getSelectedKeys({
            listMarkedKey: 1,
            selectedKeys: []
         }), [1]);

         assert.deepEqual(containerInstance._getSelectedKeys({
            listMarkedKey: 1,
            selectedKeys: [2]
         }), [2]);
      });

      describe('_beforeUpdate', function() {
         let containerInstance;

         beforeEach(() => {
            containerInstance = new operations.PanelContainer();
            containerInstance.saveOptions({
               listMarkedKey: null,
               selectedKeys: [],
               selectedKeysCount: 0
            });
         });

         describe('marked key', () => {
            it('selectedKeys are empty and list has marked key', () => {
               containerInstance._beforeUpdate({
                  listMarkedKey: 1,
                  selectedKeys: []
               });
               assert.deepEqual(containerInstance._selectedKeys, [1]);
               assert.deepEqual(containerInstance._selectedKeysCount, 0);
            });

            it('has selectedKeys and list has marked key', () => {
               containerInstance._beforeUpdate({
                  listMarkedKey: 1,
                  selectedKeys: [2]
               });
               assert.deepEqual(containerInstance._selectedKeys, [2]);
               assert.isUndefined(containerInstance._selectedKeysCount);
            });
         });

         describe('selectedKeysCount', () => {
            it('selectedKeysCount is changed', () => {
               containerInstance._beforeUpdate({
                  selectedKeysCount: 100,
                  selectedKeys: [2]
               });
               assert.equal(containerInstance._selectedKeysCount, 100);
            });
         });
      });
   });
});
