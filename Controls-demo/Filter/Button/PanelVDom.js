define('Controls-demo/Filter/Button/PanelVDom',
   [
      'Core/Control',
      'WS.Data/Source/Memory',
      'WS.Data/Chain',
      'tmpl!Controls-demo/Filter/Button/PanelVDom',
      'Controls/Filter/Button/Panel',

      'tmpl!Controls-demo/Filter/Button/resources/filterPanelTemplateSimple',
      'tmpl!Controls-demo/Filter/Button/resources/mainBlockPanelSimple',

      'tmpl!Controls-demo/Filter/Button/resources/author',

      'tmpl!Controls-demo/Filter/Button/resources/additionalBlockPanel',

      'css!Controls-demo/Filter/Button/PanelVDom'
   ],

   function(Control, MemorySource, Chain, template) {

      /**
       * @class Controls/Container/Search
       * @extends Controls/Control
       * @control
       * @public
       */

      'use strict';

      var alignFilterSource = {
         module: 'WS.Data/Source/Memory',
         options: {
            data: [
               {key: 1, title: 'right'},
               {key: 2, title: 'left'}
            ],
            idProperty: 'key'
         }
      };

      var styleHeaderSource = {
         module: 'WS.Data/Source/Memory',
         options: {
            data: [
               {key: 1, title: 'primary'},
               {key: 2, title: 'default'}
            ],
            idProperty: 'key'
         }
      };

      var sourcePeriod = {
         module: 'WS.Data/Source/Memory',
         options: {
            data: [
               {key: 1, title: 'All time'},
               {key: 2, title: 'Today'},
               {key: 3, title: 'Past month'},
               {key: 4, title: 'Past 6 months'},
               {key: 5, title: 'Past year'}
            ],
            idProperty: 'key'
         }
      };

      var sourceGroup = {
         module: 'WS.Data/Source/Memory',
         options: {
            data: [
               {key: 1, title: 'My'},
               {key: 2, title: 'My department'}
            ],
            idProperty: 'key'
         }
      };
      var sourceLimit = {
         module: 'WS.Data/Source/Memory',
         options: {
            data: [
               {key: 1, title: 'Due date'},
               {key: 2, title: 'Overdue'}
            ],
            idProperty: 'key'
         }
      };

      var sourceState = {
         module: 'WS.Data/Source/Memory',
         options: {
            data: [
               {key: 1, title: 'All states'},
               {key: 2, title: 'In progress'},
               {key: 3, title: 'Done'},
               {key: 4, title: 'Not done'},
               {key: 5, title: 'Deleted'}
            ],
            idProperty: 'key'
         }
      };
      var sourceOwner = {
         module: 'WS.Data/Source/Memory',
         options: {
            data: [
               {key: 1, title: 'On me'},
               {key: 2, title: 'On department'}
            ],
            idProperty: 'key'
         }
      };

      var itemsSimple = [
         {id: 'period', value: [2], resetValue: [1], textValue: 'Today', source: sourcePeriod, visibility: true},
         {id: 'state', value: [1], resetValue: [1], source: sourceState, visibility: true},
         {id: 'sender', value: '', resetValue: '', visibility: true},
         {id: 'author', value: 'Ivanov K.K.', resetValue: '', visibility: true, templateItem: 'tmpl!Controls-demo/Filter/Button/resources/author'},
         {id: 'responsible', value: '', resetValue: '', visibility: true}
      ];

      var items = [
         {id: 'period', value: [1], resetValue: [1], source: sourcePeriod, visibility: true},
         {id: 'state', value: [1], resetValue: [1], source: sourceState, visibility: true},
         {id: 'limit', value: [1], resetValue: '', textValue: 'Due date', source: sourceLimit, visibility: false},
         {id: 'sender', value: '', resetValue: '', visibility: true},
         {id: 'author', value: 'Ivanov K.K.', resetValue: '', visibility: true, templateItem: 'tmpl!Controls-demo/Filter/Button/resources/author'},
         {id: 'responsible', value: '', resetValue: '', visibility: true},
         {id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false},
         {id: 'operation', value: '', resetValue: '', visibility: false},
         {id: 'group', value: [1], resetValue: [1], source: sourceGroup, visibility: false},
         {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false},
         {id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false},
         {id: 'own', value: [2], resetValue: '', textValue: 'On department', source: sourceOwner, visibility: false},
         {id: 'our organisation', value: '', resetValue: '', visibility: false},
         {id: 'document', value: '', resetValue: '', visibility: false}
      ];

      var PanelVDom = Control.extend({
         _template: template,
         _itemTemplate: { templateName: 'tmpl!Controls-demo/Filter/Button/resources/mainBlockPanelSimple'},
         _addTemplate: {templateName: 'tmpl!Controls-demo/Filter/Button/resources/additionalBlockPanel'},
         _itemsSimple: items,
         _hasItemTemplateProperty: false,
         _styleHeaderSource: styleHeaderSource,

         valueChangedHandler: function(event, value) {
            if (value) {
               this._itemsSimple = itemsSimple;
               this._addTemplate = null;
            } else {
               this._itemsSimple = items;
               this._addTemplate = {templateName: 'tmpl!Controls-demo/Filter/Button/resources/additionalBlockPanel'};
            }
         },

         valueChangedHandler2: function(event, value) {
            if (value) {
               this._itemTemplateProperty = 'templateItem';
            } else {
               this._itemTemplateProperty = null;
            }
         },

         _title: 'Отбираются',

         _alignFilterSource: alignFilterSource,
         _selectedKeyAlign: 'right',
         _selectedKeyStyle: 'primary',

         _additionalBlock: false,

         _items: items

      });

      return PanelVDom;
   });
