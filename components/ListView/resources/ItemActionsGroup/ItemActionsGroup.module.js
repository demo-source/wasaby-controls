/**
 * Created by am.gerasimov on 26.03.2015.
 */

define('js!SBIS3.CONTROLS.ItemActionsGroup',
   [
      'js!SBIS3.CONTROLS.ButtonGroupBaseDS',
      'js!SBIS3.CONTROLS.IconButton',
      'js!SBIS3.CONTROLS.Link',
      'js!SBIS3.CONTROLS.ContextMenu',
      'html!SBIS3.CONTROLS.ItemActionsGroup',
      'html!SBIS3.CONTROLS.ItemActionsGroup/ItemTpl'
   ],
   function(ButtonGroupBaseDS, IconButton, Link, ContextMenu, dotTplFn, dotTplFnForItem) {

      'use strict';

      var VERTICAL_OFFSET = -21;
      var HORIZONTAL_OFFSET = 3;

      var ItemActionsGroup = ButtonGroupBaseDS.extend( /** @lends SBIS3.CONTROLS.ItemActionsGroup.prototype */ {
         $protected: {
            _dotTplFn: dotTplFn,
            _itemActionsButtons: {},
            _itemActionsMenu: undefined,
            _itemActionsMenuButton: undefined,
            _itemActionsHiddenButton: [],
            _activeItem: undefined,
            _options: {
               touchMode: false,
               linkedControl: undefined
            }
         },

         $constructor: function() {
            this._publish('onShowMenu', 'onHideMenu');
            $ws.single.CommandDispatcher.declareCommand(this, 'showMenu', this.showItemActionsMenu);

            this.once('onInit', function() {
               this._itemActionsMenuButton = this._container.find('.controls-ItemActions__menu-button');
            }.bind(this));

            if(this._options.items.length && this._options.items[0].title) {
               $ws.single.ioc.resolve('ILogger').log('title', 'C 3.7.3.140 свойство операции над записью title перестанет работать. Используйте свойство caption');
            }
         },
         /**
          * Изменяет операции над строкой до нужного состояния - скрывает / показывает кнопки
          */
         applyItemActions: function() {
            var onlyMain = true,
                itemsInstances = this.getItemsInstances(),
                isActionVisible,
                isMain;

            /* Если открыто меню, не меняем состояние кнопок */
            if(this._itemActionsMenu && this._itemActionsMenu.isVisible()) return;

            for(var i in itemsInstances) {
               if(itemsInstances.hasOwnProperty(i)) {
                  isMain = this._itemActionsButtons[i]['isMainAction'];
                  isActionVisible = itemsInstances[i].isVisible();

                  /* Проверка, надо ли показывать иконку меню */
                  if (onlyMain && isActionVisible && !isMain) {
                     onlyMain = false;
                  }
                  /* Скрываем на строке все неглавные опции */
                  if(!isMain && isActionVisible) {
                     itemsInstances[i].getContainer().addClass('ws-hidden');
                  }
               }
            }
            this._itemActionsMenuButton[onlyMain ? 'addClass' : 'removeClass']('ws-hidden');
         },
         /**
          * Создаёт меню для операций над записью
          * @private
          */
         _createItemActionMenu: function() {
            var self = this,
                verticalAlign = {
                  side: 'top',
                  offset: VERTICAL_OFFSET
               },
               horizontalAlign = {
                  side: 'right',
                  offset: HORIZONTAL_OFFSET
               },
               target = this._itemActionsMenuButton,
               corner = 'br',
                // TODO перевести на проекции
               items = this.getItems().getRawData();

            if (this._options.touchMode) {
               verticalAlign.offset = 0;
               horizontalAlign.offset = 0;
               target = this._container;
               corner = 'tr';
            }

            this._itemActionsMenu = new ContextMenu({
               element: $('> .controls-ItemActions__menu-container', this._getItemsContainer()[0]).show(),
               items: items,
               keyField: this._options.keyField,
               //FIXME для обратной совместимости
               displayField: items[0].title ? 'title' : 'caption',
               parent: this,
               opener: this,
               target:  target,
               corner: corner,
               closeButton: true,
               verticalAlign: verticalAlign,
               horizontalAlign: horizontalAlign,
               closeByExternalClick: true,
               handlers: {
                  onClose: function() {
                     self._activeItem.container.removeClass('controls-ItemActions__activeItem');
                     self._notify('onHideMenu');
                  },
                  onMenuItemActivate: function(e, id) {
                     self._itemActivatedHandler(id);
                  }
               }
            });
         },
         /**
          * Показывает меню для операций над записью
          */
         showItemActionsMenu: function() {
            /* Создадим меню операций над записью, если его ещё нет */
            if(!this._itemActionsMenu) {
               this._createItemActionMenu();
            }

            this._onBeforeMenuShowHandler();
            this._itemActionsMenu.show();
            this._activeItem.container.addClass('controls-ItemActions__activeItem');
            this._itemActionsMenu.recalcPosition(true);
         },

         /**
          * Срабатывает перед открытием меню
          * Скрывает записи, которые нужно скрыть
          * @private
          */
         _onBeforeMenuShowHandler: function() {
            var menuInstances = this._itemActionsMenu.getItemsInstances(),
                itemActionsInstances = this.getItemsInstances();

            for(var i in menuInstances) {
               if(menuInstances.hasOwnProperty(i)) {
                  menuInstances[i].getContainer()[itemActionsInstances.hasOwnProperty(i) && itemActionsInstances[i].isVisible() ? 'show' : 'hide']();
               }
            }

            this._notify('onShowMenu');
         },

         hasVisibleActions: function() {
            return $ws.helpers.find(this.getItemsInstances(), function(instance) {
               return instance.isVisible();
            });
         },
         /**
          * Показывает операции над записью
          */
         show: function(hoveredItem) {
            this._activeItem = hoveredItem;
            ItemActionsGroup.superclass.show.call(this);
         },
         /**
          * Задаёт новые операции над записью
          * Как в меню, так и на строке
          * @param items Массив новых items
          */
         setItems: function(items) {
            this._itemActionsButtons ={};
            this._itemActionsMenu && this._itemActionsMenu.setItems(items);
            ItemActionsGroup.superclass.setItems.apply(this, arguments);
         },
         /**
          * Возвращает признак того, открыто ли сейчас меню операций над записью
          * @returns {boolean|*}
          */
         isItemActionsMenuVisible: function() {
            return this._itemActionsMenu && this._itemActionsMenu.isVisible();
         },
         /**
          * Обработчик нажатия на кнопку операций над записью
          * @param item
          * @private
          */
         _itemActivatedHandler: function(item) {
            this._itemActionsButtons[item]['handler'].call(this._options.linkedControl,
                this._activeItem.container,
                this._activeItem.key,
                this._activeItem.record);
            this.hide();
         },

         _getItemsContainer: function(){
            return $('.controls-ItemActions__itemsContainer', this._container[0]);
         },

         canAcceptFocus: function() {
            return false;
         },

         _getItemTemplate : function(item) {
            this._itemActionsButtons[item.get('name')] = {
               isMainAction : item.get('isMainAction'),
               handler: item.get('onActivated'),
               isVisible: true
            };

            return dotTplFnForItem;
         },

         destroy: function() {
            this._itemActionsButtons = {};
            this._activeItem = undefined;
            this._itemActionsMenuButton = undefined;
            ItemActionsGroup.superclass.destroy.apply(this, arguments);
         }
      });

      return ItemActionsGroup;

   });
