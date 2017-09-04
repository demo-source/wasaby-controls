define('js!WSControls/Lists/ListView2',
   [
      'js!WSControls/Lists/MultiSelector',
      'tmpl!WSControls/Lists/ListView2',
      'js!WSControls/Lists/ItemsToolbar/ItemsToolbarCompatible',
      'js!WSControls/Lists/Controllers/PageNavigation'
   ],

   function(MultiSelector, template, ItemsToolbarCompatible, PageNavigation) {
      
      var INDICATOR_DELAY = 2000;
      
      var ListView = MultiSelector.extend({
         _navigationController: null,
         _controlName: 'WSControls/Lists/ListView',
         _template: template,


         _mouseMove: function(e, displayItem) {
            this._hoveredIndex = this._display.getIndex(displayItem);
         },

         _mouseLeave: function () {
            this._hoveredIndex = -1;
         },
   
         _getItemData: function(displayItem, index) {
            var data = ListView.superclass._getItemData.apply(this, arguments);
            data.hovered = this._hoveredIndex === index;
            return data;
         },

         _beforeMount: function(newOptions) {
            this._initNavigation(newOptions);
            ListView.superclass._beforeMount.apply(this, arguments);
         },

         _initNavigation: function(options) {
            if (options.dataSource && options.navigation && (!this._navigationController)) {
               this._navigationController = new PageNavigation(options.navigation.config);
               this._navigationController.prepareSource(options.dataSource);
            }
         },

         _prepareQueryParams: function(direction) {
            var params = ListView.superclass._prepareQueryParams.apply(this, arguments);
            if (this._navigationController) {
               var addParams = this._navigationController.prepareQueryParams(this._display, direction);
               params.limit = addParams.limit;
               params.offset = addParams.offset;
               //TODO фильтр и сортировка не забыть приделать
            }
            return params;
         },

         _onLoadPage: function(list, direction) {
            ListView.superclass._onLoadPage.apply(this, arguments);
            if (this._navigationController) {
               this._navigationController.calculateState(list, this._display, direction);
            }
         },

         /*DataSource*/
         _toggleIndicator: function(show){  //TODO метод скопирован из старого ListView
            var self = this;
//            container = this.getContainer(),
//            ajaxLoader = container.find('.controls-AjaxLoader').eq(0),
//            indicator, centerCord, scrollContainer;


            this._showedLoading = show;
            if (show) {
               setTimeout(function(){
                  if (!self.isDestroyed() && self._showedLoading) {
//                  scrollContainer = self._getScrollContainer()[0];
//                  indicator = ajaxLoader.find('.controls-AjaxLoader__outer');
//                  if(indicator.length && scrollContainer && scrollContainer.offsetHeight && container[0].scrollHeight > scrollContainer.offsetHeight) {
//                     /* Ищем кординату, которая находится по середине отображаемой области грида */
//                     centerCord =
//                        (Math.max(scrollContainer.getBoundingClientRect().bottom, 0) - Math.max(container[0].getBoundingClientRect().top, 0))/2;
//                     /* Располагаем индикатор, учитывая прокрутку */
//                     indicator[0].style.top = centerCord + scrollContainer.scrollTop + 'px';
//                  } else {
//                     /* Если скрола нет, то сбросим кординату, чтобы индикатор сам расположился по середине */
//                     indicator[0].style.top = '';
//                  }
                     self.loading = true;
                  }
               }, INDICATOR_DELAY);
            }
            else {
               this.loading = show;
            }
         },

         _beforeUnmount: function() {
            if (this._navigationController) {
               this._navigationController.destroy();
               this._navigationController = null;
            }
         }
         /**/

      });

      return ListView;
   });