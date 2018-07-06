define('Controls/Dropdown/Container',
   [
      'Core/Control',
      'tmpl!Controls/Dropdown/Container/Container',
      'Controls/Controllers/SourceController',
      'Core/helpers/Object/isEqual',
      'Core/helpers/Object/isEmpty',
      'WS.Data/Chain',
      'Controls/Input/Dropdown/Util'
   ],

   function(Control, template, SourceController, isEqual, isEmpty, Chain, dropdownUtils) {

      'use strict';

      /**
       * Container for dropdown lists
       *
       * @class Controls/Dropdown/Container
       * @extends Core/Control
       * @mixes Controls/interface/ISource
       * @mixes Controls/Button/interface/ICaption
       * @mixes Controls/Button/interface/IIcon
       * @author Золотова Э.Е.
       * @control
       * @public
       */

      /**
       * @event Controls/Dropdown/Container#selectedItemsChanged Occurs when the selected items change.
       */

      /**
       * @name Controls/Dropdown/Container#nodeProperty
       * @cfg {String} Name of the field describing the type of the node (list, node, hidden node).
       */

      /**
       * @name Controls/Dropdown/Container#parentProperty
       * @cfg {String} Name of the field that contains information about parent node.
       */

      /**
       * @name Controls/Dropdown/Container#headTemplate
       * @cfg {Function} Template that will be rendered above the list.
       */

      /**
       * @name Controls/Dropdown/Container#contentTemplate
       * @cfg {Function} Template that will be render the list.
       */

      /**
       * @name Controls/Dropdown/Container#footerTemplate
       * @cfg {Function} Template that will be rendered below the list.
       */

      /**
       * @name Controls/Dropdown/Container#selectedKeys
       * @cfg {Array} Array of selected items' keys.
       */

      /**
       * @name Controls/Dropdown/Container#headConfig
       * @cfg {Object} Menu style menuStyle
       * @variant defaultHead The head with icon and caption
       * @variant duplicateHead The icon set under first item
       */

      /**
       * @name Controls/Dropdown/Container#showHeader
       * @cfg {Boolean} Display the header
       * @variant true The header is displayed.
       * @variant false The header is not displayed.
       */

      /**
       * @name Controls/Dropdown/Container#emptyText
       * @cfg {String} Add an empty item to the list.
       * @variant true Add empty item with text 'Не выбрано'
       */

      /**
       * @name Controls/Dropdown/Container#typeShadow
       * @cfg {String} Specifies the type of shadow around the popup.
       * @variant default Default shadow
       * @variant suggestionsContainer Shadow on the right, left, bottom
       */

      var _private = {
         loadItems: function(instance, source, selectedKeys, keyProperty, filter) {
            instance._sourceController = new SourceController({
               source: source
            });
            return instance._sourceController.load(filter).addCallback(function(items) {
               instance._items = items;
               _private.updateSelectedItems(instance, selectedKeys, keyProperty);
               return items;
            });
         },

         updateSelectedItems: function(instance, selectedKeys, keyProperty) {
            Chain(instance._items).each(function(item) {
               if (selectedKeys.indexOf(item.get(keyProperty)) > -1) {
                  instance._selectedItems.push(item);
               }
            });
            if (instance._options.dataLoadCallback) {
               instance._options.dataLoadCallback(instance._selectedItems);
            }
         },

         onResult: function(result) {
            switch (result.action) {
               case 'pinClicked':
                  this._notify('pinClicked', [result.data]);
                  this._items = this._options.source.getItems();
                  this._open();
                  break;
               case 'itemClick':
                  _private.selectItem.call(this, result.data);
                  if (!result.data[0].get('@parent')) {
                     this._children.DropdownOpener.close();
                  }
                  break;
               case 'footerClick':
                  this._notify('footerClick', [result.event]);
            }
         },

         selectItem: function(item) {
            this._selectedItems = item;
            this._notify('selectedItemsChanged', [this._selectedItems]);
         }
      };

      var Dropdown = Control.extend({
         _template: template,

         _beforeMount: function(options, context, receivedState) {
            this._emptyText = dropdownUtils.prepareEmpty(options.emptyText);
            this._selectedItems = [];
            this._onResult = _private.onResult.bind(this);
            if (!options.lazyItemsLoad) {
               if (receivedState) {
                  this._items = receivedState;
                  _private.updateSelectedItems(this, options.selectedKeys, options.keyProperty);
               } else {
                  if (options.source) {
                     return _private.loadItems(this, options.source, options.selectedKeys, options.keyProperty);
                  }
               }
            }
         },

         _beforeUpdate: function(newOptions) {
            if (newOptions.selectedKeys && !isEqual(newOptions.selectedKeys, this._options.selectedKeys)) {
               _private.updateSelectedItems(this, newOptions.selectedKeys);
            }
            if (newOptions.source && newOptions.source !== this._options.source) {
               if (newOptions.lazyItemsLoad) {
                  /* source changed, items is not actual now */
                  this._items = null;
               } else {
                  var self = this;
                  return _private.loadItems(this, newOptions.source, newOptions.selectedKeys).addCallback(function() {
                     self._forceUpdate();
                  });
               }
            }
         },

         _open: function() {
            var self = this;

            function open() {
               var config = {
                  templateOptions: {
                     items: self._items,
                     width: self._options.width
                  },
                  target: self._container,
                  corner: self._options.corner,
                  horizontalAlign: self._options.horizontalAlign,
                  verticalAlign: self._options.verticalAlign
               };
               self._children.DropdownOpener.open(config, self);
            }

            if (this._options.source && !this._items) {
               _private.loadItems(this, this._options.source, this._options.selectedKeys, this._options.keyProperty, this._options.filter).addCallback(function(items) {
                  open();
                  return items;
               });
            } else {
               open();
            }
         }
      });

      Dropdown.getDefaultOptions = function getDefaultOptions() {
         return {
            filter: {},
            selectedKeys: []
         };
      };

      Dropdown._private = _private;
      return Dropdown;
   });
