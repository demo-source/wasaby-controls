/*global define, $ws, rk*/
define('js!SBIS3.CONTROLS.Action.List.InteractiveMove',[
      'js!SBIS3.CONTROLS.Action.List.Move',
      'js!SBIS3.CONTROLS.Action.List.HierarchicalMoveMixin',
      'js!SBIS3.CONTROLS.Action.DialogMixin'
   ],
   function (ListMove, HierarchicalMoveMixin, DialogMixin) {
      'use strict';
      /**
       * Действие перемещения по иерархии с выбором места перемещения через диалог.
       * По умолчанию переносит выделенные записи.
       * @class SBIS3.CONTROLS.Action.List.InteractiveMove
       * @public
       * @extends SBIS3.CONTROLS.Action.List.Move
       * @mixes SBIS3.CONTROLS.Action.List.HierarchicalMoveMixin
       * @mixes SBIS3.CONTROLS.Action.DialogMixin
       * @author Крайнов Дмитрий Олегович
       * @example
       * Пример использования InteractiveMove:
       * <pre>
       *    define('js!SBIS3.Demo.InteractiveMove', ['js!SBIS3.CORE.CompoundControl', 'js!SBIS3.CONTROLS.Action.List.InteractiveMove'],
       *    function(CompoundControl, InteractiveMove){
       *       var move;
       *       return CompoundControl.extend({
       *          _onInintHandler: function(){
       *             //создаем action
       *             move = new InteractiveMove({
       *                linkedObject: this
       *             });
       *          },
       *          interactiveMove: function(el, key, record) {
       *             //переместить только переданные записи
       *             move.execute({records: [record]});
       *          },
       *          buttonInteractiveMove: function(){
       *             //переместить выбранные в ListView записи
       *             move.execute();
       *          }
       *       }
       *    })
       * </pre>
       * В xhtml навесим обработчик:
       * <pre>
       *    <div class="MyListView">
       *    <component data-component="SBIS3.CONTROLS.Button" name="ButtonHierMove" class="Button">
       *       <option name="caption">Переместить</option>
       *       <options name="handlers">
       *          <option name="onActivated" type="function">js!SBIS3.Demo.InteractiveMove:prototype.buttonInteractiveMove
       *       </option>
       *       </options>
       *    </component>
       *    <component data-component="SBIS3.CONTROLS.ListView" name="MyListView">
       *       <options name="itemsActions" type="Array">
       *          <options>
       *             <option name="name" value="moveUp"></option>
       *             <option name="icon" value="sprite:icon-16 icon-folder icon-primary"></option>
       *             <option name="title" value="Interactive move"></option>
       *             <option name="isMainAction" value="true" type="boolean"></option>
       *             <option name="onActivated" type="function">js!SBIS3.Demo.InteractiveMove:prototype.interactiveMove</option>
       *          </options>
       *       </options>
       *    </component>
       *    </div>
       * </pre>
       * @ignoreOptions validators independentContext contextRestriction extendedTooltip
       *
       * @ignoreMethods activateFirstControl activateLastControl addPendingOperation applyEmptyState applyState clearMark
       * @ignoreMethods changeControlTabIndex destroyChild detectNextActiveChildControl disableActiveCtrl findParent
       * @ignoreMethods focusCatch getActiveChildControl getChildControlById getChildControlByName getChildControls
       * @ignoreMethods getClassName getContext getEventBusOf getEventHandlers getEvents getExtendedTooltip getOpener
       * @ignoreMethods getImmediateChildControls getLinkedContext getNearestChildControlByName getOwner getOwnerId
       * @ignoreMethods getReadyDeferred getStateKey getTabindex getUserData getValue hasActiveChildControl hasChildControlByName
       * @ignoreMethods hasEventHandlers isActive isAllReady isDestroyed isMarked isReady makeOwnerName setOwner setSize
       * @ignoreMethods markControl moveFocus moveToTop once registerChildControl registerDefaultButton saveToContext
       * @ignoreMethods sendCommand setActive setChildActive setClassName setExtendedTooltip setOpener setStateKey activate
       * @ignoreMethods setTabindex setTooltip setUserData setValidators setValue storeActiveChild subscribe unregisterChildControl
       * @ignoreMethods unregisterDefaultButton unsubscribe validate waitAllPendingOperations waitChildControlById waitChildControlByName
       *
       * @ignoreEvents onActivate onAfterLoad onAfterShow onBeforeControlsLoad onBeforeLoad onBeforeShow onChange onClick
       * @ignoreEvents onFocusIn onFocusOut onKeyPressed onReady onResize onStateChanged onTooltipContentRequest
       */

      var InteractiveMove = ListMove.extend([HierarchicalMoveMixin, DialogMixin],/** @lends SBIS3.CONTROLS.Action.List.InteractiveMove.prototype */{
         $protected:{
            _options : {
               template : 'js!SBIS3.CONTROLS.MoveDialogTemplate'
            },
            _canExecute: true
         },

         _doExecute: function(meta) {
            meta = meta || {};
            var records = meta.records || this.getSelectedItems();
            this._opendEditComponent({
               title: rk('Перенести') + ' ' + records.length + $ws.helpers.wordCaseByNumber(records.length, ' ' + rk('записей'), ' ' + rk('запись', 'множественное'), ' ' + rk('записи')) + ' ' + rk('в'),
               cssClassName: 'controls-moveDialog',
               opener: this._options.linkedObject,
               records: records
            }, this._options.template);
         },

         _buildComponentConfig: function(meta) {
            var self = this;
            return {
               linkedView: this._options.linkedObject,
               dataSource: this._options.dataSource,
               records: meta.records,
               handlers: {
                  onPrepareFilterOnMove: function(event, rec) {
                     event.setResult(self._options.linkedObject._notify('onPrepareFilterOnMove', rec));
                  },
                  onMove: function(e, records, moveTo) {
                     self._move(records, moveTo);
                  }
               }
            };
         }
      });
      return InteractiveMove;
   }
);

