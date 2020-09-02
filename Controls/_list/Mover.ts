import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import cInstance = require('Core/core-instance');
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';
import {Logger} from 'UI/Utils';
import {ContextOptions as dataOptions} from 'Controls/context';

import {MoveController, TMovePosition} from './Controllers/MoveController';
import {IMoveControllerOptions} from './interface/IMoveControllerOptions';
import {Model} from 'Types/entity';


// @TODO Если убрать отсюда шаблон, то operationPanel перестаёт получать события
//   selectedTypeChanged даже от MultiSelect
//  https://online.sbis.ru/doc/0445b971-8675-42ef-b2bc-e68d7f82e0ac
import * as Template from 'wml!Controls/_list/Mover/Mover';
import {DataSet} from "Types/source";
import {Dialog} from "../popup";
import * as TreeItemsUtil from "./resources/utils/TreeItemsUtil";
import {ISelectionObject, TKeySelection, TKeysSelection, TSelectionRecord} from "../_interface/ISelectionType";
import {IHashMap} from "WS.Core/ext/requirejs/require";

const DEFAULT_SORTING_ORDER = 'asc';

interface IMoveItemsParams {
    selectedKeys: TKeysSelection;
    excludedKeys: TKeysSelection;
    filter?: object;
}

type TMoveItem = Model|TKeySelection

type TMoveItems = TMoveItem[]|IMoveItemsParams|ISelectionObject|TSelectionRecord;


/**
 * @typedef {String} TMovePosition
 * @description
 * Тип перемещения - в items/source или custom
 */
export enum MOVE_TYPE {
    CUSTOM = 'Custom',
    MOVE_IN_ITEMS = 'MoveInItems'
}

var _private = {
    moveItems(self, items, target, position) {
        const useController = _private.useController(items);
        const afterItemsMove = function (result) {
            _private.afterItemsMove(self, items, target, position, result);
            return result;
        }
        return _private.beforeItemsMove(self, items, target, position).addCallback(function (beforeItemsMoveResult) {
            if (useController) {
                return self._controller.moveItems(
                    _private.convertItemsToISelectionObject(items),
                    _private.extractFilter(items),
                    _private.getIdByItem(self, target),
                    position, beforeItemsMoveResult).then(afterItemsMove);
            }
            if (beforeItemsMoveResult === MOVE_TYPE.MOVE_IN_ITEMS) {
                return _private.moveInItems(self, items, target, position);
            } else if (beforeItemsMoveResult !== MOVE_TYPE.CUSTOM) {
                return _private.moveInSource(self, items, target, position).addCallback(function (moveResult) {
                    _private.moveInItems(self, items, target, position);
                    return moveResult;
                });
            }
        }).addBoth(afterItemsMove);
    },

    beforeItemsMove: function (self, items, target, position) {
        var beforeItemsMoveResult = self._notify('beforeItemsMove', [items, target, position]);
        return beforeItemsMoveResult instanceof Promise ? beforeItemsMoveResult : Deferred.success(beforeItemsMoveResult);
    },

    afterItemsMove: function (self, items, target, position, result) {
        self._notify('afterItemsMove', [items, target, position, result]);

        //According to the standard, after moving the items, you need to unselect all in the table view.
        //The table view and Mover are in a common container (Control.Container.MultiSelector) and do not know about each other.
        //The only way to affect the selection in the table view is to send the selectedTypeChanged event.
        //You need a schema in which Mover will not work directly with the selection.
        //Will be fixed by: https://online.sbis.ru/opendoc.html?guid=dd5558b9-b72a-4726-be1e-823e943ca173
        self._notify('selectedTypeChanged', ['unselectAll'], {
            bubbling: true
        });
    },

    moveInItems: function (self, items, target, position) {
        if (position === TMovePosition.on) {
            _private.hierarchyMove(self, items, target);
        } else {
            _private.reorderMove(self, items, target, position);
        }
    },

    reorderMove: function (self, items, target, position) {
        var
           movedIndex,
           movedItem,
           parentProperty = self._options.parentProperty,
           targetId = _private.getIdByItem(self, target),
           targetItem = _private.getModelByItem(self, targetId),
           targetIndex = self._items.getIndex(targetItem);

        items.forEach(function (item) {
            movedItem = _private.getModelByItem(self, item);
            if (movedItem) {
                if (position === TMovePosition.before) {
                    targetIndex = self._items.getIndex(targetItem);
                }

                movedIndex = self._items.getIndex(movedItem);
                if (movedIndex === -1) {
                    self._items.add(movedItem);
                    movedIndex = self._items.getCount() - 1;
                }

                if (parentProperty && targetItem.get(parentProperty) !== movedItem.get(parentProperty)) {
                    //if the movement was in order and hierarchy at the same time, then you need to update parentProperty
                    movedItem.set(parentProperty, targetItem.get(parentProperty));
                }

                if (position === TMovePosition.after && targetIndex < movedIndex) {
                    targetIndex = (targetIndex + 1) < self._items.getCount() ? targetIndex + 1 : self._items.getCount();
                } else if (position === TMovePosition.before && targetIndex > movedIndex) {
                    targetIndex = targetIndex !== 0 ? targetIndex - 1 : 0;
                }
                self._items.move(movedIndex, targetIndex);
            }
        });
    },

    hierarchyMove: function (self, items, target) {
        var targetId = _private.getIdByItem(self, target);
        items.forEach(function (item) {
            item = _private.getModelByItem(self, item);
            if (item) {
                item.set(self._options.parentProperty, targetId);
            }
        });
    },

    moveInSource: function (self, items, target, position) {
        const targetId = _private.getIdByItem(self, target);
        const idArray = items.map(function (item) {
            return _private.getIdByItem(self, item);
        });

        //If reverse sorting is set, then when we call the move on the source, we invert the position.
        if (position !== TMovePosition.on && self._options.sortingOrder !== DEFAULT_SORTING_ORDER) {
            position = position === TMovePosition.after ? TMovePosition.before : TMovePosition.after;
        }
        return self._source.move(idArray, targetId, {
            position,
            parentProperty: self._options.parentProperty
        });
    },

    moveItemToSiblingPosition: function (self, item, position) {
        const target = _private.getSiblingItem(item, position);
        return target ? self.moveItems([item], target, position) : Deferred.success();
    },

    updateDataOptions: function (self, newOptions, contextDataOptions) {
        let controllerOptions: IMoveControllerOptions = {
            parentProperty: newOptions.parentProperty,
            nodeProperty: newOptions.nodeProperty,
            root: newOptions.root,
            keyProperty: newOptions.keyProperty
        };
        if (newOptions.moveDialogTemplate) {
            controllerOptions.dialog = {
                opener: self
            };
            if (newOptions.moveDialogTemplate.templateName) {
                self._moveDialogTemplate = newOptions.moveDialogTemplate.templateName;
                self._moveDialogOptions = newOptions.moveDialogTemplate.templateOptions;
                controllerOptions.dialog.template = self._moveDialogTemplate;
                controllerOptions.dialog.templateOptions = self._moveDialogOptions;
            } else {
                self._moveDialogTemplate = newOptions.moveDialogTemplate;
                controllerOptions.dialog.template = self._moveDialogTemplate;
                Logger.warn('Mover: Wrong type of moveDialogTemplate option, use object notation instead of template function', self);
            }
        }
        if (contextDataOptions) {
            controllerOptions.source = newOptions.source || contextDataOptions.source;
            controllerOptions.items = contextDataOptions.items;
            self._items = controllerOptions.items;
            self._source = controllerOptions.source;
            self._keyProperty = newOptions.keyProperty || contextDataOptions.keyProperty;
            self._filter = contextDataOptions.filter;
        }
        if (!self._controller) {
            self._controller = new MoveController(controllerOptions);
        } else {
            self._controller.update(controllerOptions);
        }
    },

    checkItem: function (self, item, target, position) {
        var
            key,
            parentsMap,
            movedItem = _private.getModelByItem(self, item);

        if (target !== null) {
            target = _private.getModelByItem(self, target);
        }

        //Check for a item to be moved because it may not be in the current recordset
        if (self._options.parentProperty && movedItem) {
            if (target && position === TMovePosition.on && target.get(self._options.nodeProperty) === null) {
                return false;
            }
            parentsMap = _private.getParentsMap(self, _private.getIdByItem(self, target));
            key = '' + movedItem.get(self._keyProperty);
            if (parentsMap.indexOf(key) !== -1) {
                return false;
            }
        }
        return true;
    },

    getParentsMap: function (self, id) {
        var
            item,
            toMap = [],
            items = self._items,
            path = items.getMetaData().path;

        item = items.getRecordById(id);
        while (item) {
            id = '' + item.get(self._keyProperty);
            if (toMap.indexOf(id) === -1) {
                toMap.push(id);
            } else {
                break;
            }
            id = item.get(self._options.parentProperty);
            item = items.getRecordById(id);
        }
        if (path) {
            path.forEach(function (elem) {
                if (toMap.indexOf(elem.get(self._keyProperty)) === -1) {
                    toMap.push('' + elem.get(self._keyProperty));
                }
            });
        }
        return toMap;
    },

    getModelByItem: function (self, item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item : self._items.getRecordById(item);
    },

    getIdByItem: function (self, item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item.get(self._keyProperty) : item;
    },

    getItemsBySelection(selection): Promise<TMoveItems> {
        let resultSelection;
        // Support moving with mass selection.
        // Full transition to selection will be made by:
        // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        selection.recursive = false;

        if (selection instanceof Array) {
            resultSelection = Deferred.success(selection);
        } else {
            const filter = _private.prepareFilter(this, this._filter, selection);
            resultSelection = getItemsBySelection(selection, this._source, this._items, filter);
        }

        return resultSelection;
    },

    prepareMovedItems(self, items) {
        let result = [];
        items.forEach(function(item) {
            result.push(_private.getIdByItem(self, item));
        });
        return result;
    },

    prepareFilter(self, filter, selection): object {
        const searchParam = self._options.searchParam;
        const root = self._options.root;
        let resultFilter = filter;

        if (searchParam && !selection.selected.includes(root)) {
            resultFilter = {...filter};
            delete resultFilter[searchParam];
        }

        return resultFilter;
    },

    useController(items): boolean {
        return !items.forEach;
    },

    /**
     * Открывает диалог перемещения
     * @param self
     * @param {Controls/_list/interface/ISelection/TMoveItem.typedef} selection
     * @param {Controls/interface:TKeysSelection} selectedKeys
     * @private
     */
    openMoveDialog(self, selection: TMoveItems): Promise<void|DataSet> {
        const templateOptions = {
            movedItems: _private.prepareMovedItems(self, selection),
            source: self._source,
            keyProperty: self._keyProperty,
            ...self._moveDialogOptions
        };
        return new Promise((resolve) => {
            Dialog.openPopup({
                opener: self._dialogOptions.opener,
                templateOptions,
                closeOnOutsideClick: true,
                template: self._moveDialogTemplate,
                eventHandlers: {
                    onResult: (target: Model) => {
                        resolve(self.moveItems(selection, target, TMovePosition.on))
                    }
                }
            });
        });
    },

    /**
     * Получает элемент к которому мы перемещаем текущий элемент
     * Метод сделан публичным для совместимости с HOC
     * @param item текущий элемент
     * @param position позиция (направление перемещения)
     * @private
     */
    getSiblingItem(item: TMoveItem, position: TMovePosition): Model {
        //В древовидной структуре, нужно получить следующий(предыдущий) с учетом иерархии.
        //В рекордсете между двумя соседними папками, могут лежат дочерние записи одной из папок,
        //а нам необходимо получить соседнюю запись на том же уровне вложенности, что и текущая запись.
        //Поэтому воспользуемся проекцией, которая предоставляет необходимы функционал.
        //Для плоского списка можно получить следующий(предыдущий) элемент просто по индексу в рекордсете.
        if (this._parentProperty) {
            const display = TreeItemsUtil.getDefaultDisplayTree(this._items, {
                keyProperty: this._keyProperty,
                parentProperty: this._parentProperty,
                nodeProperty: this._nodeProperty
            }, {});
            if (this._root) {
                display.setRoot(this._root)
            }
            const collectionItem = display.getItemBySourceItem(this._getModel(item));
            let siblingItem;
            if (position === TMovePosition.before) {
                siblingItem = display.getPrevious(collectionItem);
            } else {
                siblingItem = display.getNext(collectionItem);
            }
            return siblingItem ? siblingItem.getContents() : null;
        }
        let itemIndex = this._items.getIndex(this._getModel(item));
        return this._items.at(position === TMovePosition.before ? --itemIndex : ++itemIndex);
    },

    convertItemsToISelectionObject(item: TMoveItems): ISelectionObject {
        let selectionObject: ISelectionObject
        if (item.selected) {
            selectionObject = item;
        } else if (item.selectedKeys) {
            selectionObject = {
                selected: item.selectedKeys,
                excluded: item.excludedKeys,
            }
        } else if (item.forEach) {
            selectionObject = {
                selected: item,
                excluded: undefined
            }
        }
        return selectionObject;
    },

    extractFilter(item: TMoveItems): IHashMap<any> {
        let filter: IHashMap<any>;
        if (item.filter) {
            filter = item.filter;
        }
        return filter || {};
    }
};

/**
 * Контрол для перемещения элементов списка в recordSet и dataSource.
 *
 * @remark
 * Контрол должен располагаться в одном контейнере {@link Controls/list:DataContainer} со списком.
 * В случае использования {@link Controls/operations:Controller} для корректной обработки событий необходимо помещать Controls/list:Mover внутри Controls/operations:Controller.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FtreeGrid%2FMover%2FBase%2FIndex">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/actions/mover/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IMovable
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

/*
 * Сontrol to move the list items in recordSet and dataSource.
 * Сontrol must be in one {@link Controls/list:DataContainer} with a list.
 * In case you are using {@link Controls/operations:Controller}
 * you should place Controls/list:Mover inside of Controls/operations:Controller.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IMovable
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

var Mover = BaseAction.extend({
    _controller: null,
    _moveDialogTemplate: null,
    _moveDialogOptions: null,
    _template: Template,
    _beforeMount: function (options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
    },

    _beforeUpdate: function (options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
    },

    moveItemUp: function (item) {
        return _private.moveItemToSiblingPosition(this, item, TMovePosition.before);
    },

    moveItemDown: function (item) {
        return _private.moveItemToSiblingPosition(this, item, TMovePosition.after);
    },

    moveItems(items: []|IMoveItemsParams, target, position): Promise<any> {
        const self = this;
        if (target === undefined) {
            return Deferred.success();
        }
        if (_private.useController(items)) {
            return _private.moveItems(self, items, target, position);
        } else {
            return _private.getItemsBySelection.call(this, items).addCallback(function (items) {
                items = items.filter((item) => {
                    return _private.checkItem(self, item, target, position);
                });
                if (items.length) {
                    return _private.moveItems(self, items, target, position);
                } else {
                    return Deferred.success();
                }
            });
        }
    },

    moveItemsWithDialog(items: []|IMoveItemsParams): Promise<any> {
        if (_private.useController(items)) {
            return this._controller.moveItemsWithDialog(_private.convertItemsToISelectionObject(items), _private.extractFilter(items));
        } else {
            if (this._moveDialogTemplate) {
                if (this.validate(items)) {
                    return _private.getItemsBySelection.call(this, items).addCallback((items: []) => (
                        _private.openMoveDialog(this, items)
                    ));
                }
            } else {
                Logger.warn('Mover: Can\'t call moveItemsWithDialog! moveDialogTemplate option, is undefined', this);
            }
        }
        return Promise.resolve();
    }
});

Mover.getDefaultOptions = function () {
    return {
        sortingOrder: DEFAULT_SORTING_ORDER
    };
};

Mover.contextTypes = function () {
    return {
        dataOptions: dataOptions
    };
};

Mover._private = _private;

export = Mover;
