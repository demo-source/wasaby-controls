import FlatController, { IFlatItemData, IFlatModel } from './FlatController';
import { IDragPosition, IOffset, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';
import { TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

const DRAG_MAX_OFFSET = 15,
      EXPAND_ON_DRAG_DELAY = 1000;

export interface ITreeModel extends IFlatModel {
   getPrevDragPosition(): IDragPosition;

   calculateDragTargetPosition(itemData: ITreeItemData, position: TPosition): IDragPosition;
   getItemDataByItem(item: TreeItem<Model>);

   getExpandedItems(): Array<object>;
}

export interface ITreeItemData extends IFlatItemData {
   dispItem: TreeItem<Model>;
   nodeProperty: string;
   isExpanded: boolean;
}

export default class TreeController extends FlatController {
   protected _model: ITreeModel;
   protected _draggingItemData: ITreeItemData;
   private _timeoutForExpandOnDrag: NodeJS.Timeout;
   private _expandOnDragData: ITreeItemData;

   constructor(model: ITreeModel) {
      super(model);
   }

   /**
    * Проверяет получено ли событие из узла, на который наведен элемент при drag-n-drop
    * @remark
    * Мышь считается внутри узла, если смещение от верха или от низа меньше DRAG_MAX_OFFSET
    * На узле должен быть навешан класс .js-controls-TreeView__dragTargetNode
    * Если не передать offset, то он будет посчитан
    * @rem
    * @param event {SyntheticEvent<MouseEvent>} событие клика на узел
    * @param offset {IOffset} смещение мышки относительно верха и низа узла
    */
   isInsideDragTargetNode(event: SyntheticEvent<MouseEvent>, offset?: IOffset): boolean {
      if (!offset) {
         offset = this._calculateOffset(event);
      }

      if (offset) {
         if (offset.top < DRAG_MAX_OFFSET || offset.bottom < DRAG_MAX_OFFSET) {
            return true;
         }
      }

      return false;
   }

   calculateDragPositionRelativeNode(itemData: ITreeItemData, event: SyntheticEvent<MouseEvent>): IDragPosition {
      let dragPosition;

      const offset = this._calculateOffset(event);
      if (offset) {
         if (this._draggingItemData && this.isInsideDragTargetNode(event, offset)) {
            const position = offset.top < DRAG_MAX_OFFSET ? 'before' : 'after';
            dragPosition = this.calculateDragPosition(itemData, position);
         }
      }

      return dragPosition;
   }

   calculateDragPosition(targetItemData: ITreeItemData, position: TPosition): IDragPosition {
      let result;

      //If you hover over the dragged item, and the current position is on the folder,
      //then you need to return the position that was before the folder.
      if (this._draggingItemData && this._draggingItemData.index === targetItemData.index) {
         result = this._model.getPrevDragPosition() || null;
      } else if (targetItemData.dispItem.isNode()) {
         if (position === 'after' || position === 'before') {
            result = this._calculateDragTargetPosition(targetItemData, position);
         } else {
            result = {
               index: targetItemData.index,
               position: 'on',
               item: targetItemData.item,
               data: targetItemData
            };
         }
      } else {
         result = super.calculateDragPosition(targetItemData);
      }

      return result;
   }

   startCountDownForExpandNode(itemData: ITreeItemData, expandNode: Function): void {
      if (itemData.item.get(itemData.nodeProperty) !== null && (!this._expandOnDragData || this._expandOnDragData !== itemData) && !itemData.isExpanded) {
         this._clearTimeoutForExpandOnDrag();
         this._expandOnDragData = itemData;
         this._setTimeoutForExpandOnDrag(this._expandOnDragData, expandNode);
      }
   }

   stopCountDownForExpandNode(): void {
      this._clearTimeoutForExpandOnDrag();
   }

   private _setTimeoutForExpandOnDrag(itemData: ITreeItemData, expandNode: Function): void {
      this._timeoutForExpandOnDrag = setTimeout(() => {
            expandNode(itemData);
         }, EXPAND_ON_DRAG_DELAY);
   }

   private _clearTimeoutForExpandOnDrag(): void {
      if (this._timeoutForExpandOnDrag) {
         clearTimeout(this._timeoutForExpandOnDrag);
         this._timeoutForExpandOnDrag = null;
      }
      this._expandOnDragData = null;
   }

   private _calculateDragTargetPosition(itemData: ITreeItemData, position: TPosition): IDragPosition {
      let
         result,
         startPosition,
         afterExpandedNode = position === 'after' && this._model.getExpandedItems().indexOf(itemData.dispItem.getContents().getKey()) !== -1;

      //The position should not change if the record is dragged from the
      //bottom/top to up/down and brought to the bottom/top of the folder.
      const prevDragPosition = this._model.getPrevDragPosition();
      if (prevDragPosition) {
         if (prevDragPosition.index === itemData.index) {
            startPosition = prevDragPosition.position;
         } else {
            startPosition = prevDragPosition.index < itemData.index ? 'before' : 'after';
         }
      }

      if (position !== startPosition && !afterExpandedNode) {
         result = {
            index: itemData.index,
            item: itemData.item,
            data: itemData,
            position: position
         };
      }

      return result;
   }

   private _calculateOffset(event: SyntheticEvent<MouseEvent>): IOffset {
      const result = { top: null, bottom: null };

      const dragTarget = event.target.closest('.js-controls-TreeView__dragTargetNode');
      if (dragTarget) {
         const dragTargetRect = dragTarget.getBoundingClientRect();
         result.top = event.nativeEvent.pageY - dragTargetRect.top;
         result.bottom = dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY;
      }

      return result;
   }
}