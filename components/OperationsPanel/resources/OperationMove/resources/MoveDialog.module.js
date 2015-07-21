/**
 * Created by as.suhoruchkin on 02.04.2015.
 */
define('js!SBIS3.CONTROLS.MoveDialog', [
   'js!SBIS3.CORE.Dialog',
   'js!SBIS3.CONTROLS.Record',
   'js!SBIS3.CONTROLS.ArrayStrategy'
], function(Dialog, Record, ArrayStrategy) {

   var MoveDialog = Dialog.extend({

      $protected: {
         _options: {
            linkedView: undefined,
            template: 'js!SBIS3.CONTROLS.MoveDialogTemplate',
            cssClassName: 'controls-MoveDialog'
         },
         _treeView: undefined
      },
      $constructor: function() {
         this.subscribe('onReady', this._onReady.bind(this));
      },
      _onReady: function() {
         var
            linkedView = this._options.linkedView,
            selectedCount = linkedView.getSelectedKeys().length;
         this.setTitle('Перенести ' + selectedCount + ' запис' + $ws.helpers.wordCaseByNumber(selectedCount, 'ей', 'ь', 'и') + ' в');
         this.getChildControlByName('MoveDialogTemplate-moveButton')
            .subscribe('onActivated', this._moveRecords.bind(this));
         this._treeView = this.getChildControlByName('MoveDialogTemplate-TreeDataGrid')
            .subscribe('onDataLoad', this._onDataLoadHandler.bind(this));
         this._treeView.setHierField(linkedView._options.hierField);
         this._treeView.setColumns([{ field: linkedView._options.displayField }]);
         this._treeView.setDataSource(linkedView._dataSource);
         /*TODO cуперкостыль для того, чтобы если папка пустая БЛ не возвращала выборку из её предка*/
         this._treeView._filter['folderChanged'] = true;
      },
      /*TODO тут добавить корень в дерево*/
      _onDataLoadHandler: function(event, dataSet) {
         event.setResult(dataSet);
      },
      _moveRecords: function() {
         var
            records,
            linkedView = this._options.linkedView,
            moveTo = this._treeView.getSelectedKeys()[0];
            records = linkedView.getSelectedKeys();
         if (this._checkRecordsForMove(records, moveTo)) {
            this._move(records, moveTo).getResult().addCallback(function () {
               linkedView.removeItemsSelectionAll();
               linkedView.openNode(moveTo);
            });
         }
         this.close();
      },
      _move: function(records, moveTo) {
         var
            record,
            deferred = new $ws.proto.ParallelDeferred(),
            linkedView = this._options.linkedView,
            hierField = linkedView._options.hierField;
         for (var i = 0; i < records.length; i++) {
            record = linkedView._dataSet.getRecordByKey(records[i]);
            deferred.push(linkedView._dataSource.move(record, hierField, [moveTo]));
         }
         return deferred.done();
      },
      _checkRecordsForMove: function(records, moveTo) {
         if (moveTo === undefined) {
            return false;
         }
         if ($.inArray(moveTo, records) !== -1) {
            $ws.helpers.alert("Вы не можете переместить запись саму в себя!", {}, this);
            return false;
         }
         return true;
      }
   });

   return MoveDialog;

});