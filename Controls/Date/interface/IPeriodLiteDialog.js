define('Controls/Date/interface/IPeriodLiteDialog', [
   'WS.Data/Type/descriptor'
], function(types) {
   'use strict';

   /**
    * mixin Controls/Date/interface/IPeriodLiteDialog
    * @public
    */
   var EMPTY_CAPTIONS = {
      NOT_SPECIFIED: rk('Не указан'),
      NOT_SELECTED: rk('Не выбран'),
      WITHOUT_DUE_DATE: rk('Бессрочно', 'ShortForm'),
      ALL_TIME: rk('Весь период')
   };

   return {
      getDefaultOptions: function() {
         return {

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#year
             * @cfg {Date} Displayed period
             */
            year: undefined,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#chooseMonths
             * @cfg {Boolean} Sets the option to choose a month
             */
            chooseMonths: true,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#chooseQuarters
             * @cfg {Boolean} Sets the option to choose a quarter
             */
            chooseQuarters: true,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#chooseHalfyears
             * @cfg {Boolean} Sets the option to choose a half-year
             */
            chooseHalfyears: true,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#chooseYears
             * @cfg {Boolean} Sets the option to choose a year
             */
            chooseYears: true,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#emptyCaption
             * @cfg {String} Text that is used if the period is not selected
             */
            emptyCaption: undefined,

            // TODO: Доделать полноценную поддержку следующих опций. Пока не показываем их в документации.
            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#checkedStart
             * @cfg {Date} The date (month) of the beginning of the checked period
             * @noshow
             */
            checkedStart: undefined,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#checkedEnd
             * @cfg {Date} The date(month) of the end of the checked period
             * @noshow
             */
            checkedEnd: undefined,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#checkedIconCssClass
             * @cfg {String} The CSS class that will be set on the selected icons. The default is a green tick.
             * @noshow
             */
            checkedIconCssClass: 'icon-Yes icon-done',

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#uncheckedIconCssClass
             * @cfg {String} A CSS class that will be set on unselected icons. The default is a gray tick.
             * @noshow
             */
            uncheckedIconCssClass: 'icon-Yes icon-disabled',

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#checkedIconTitle
             * @cfg {String} A hint that will be displayed on the selected icons. By default, there is no tooltip.
             * @noshow
             */
            checkedIconTitle: undefined,

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#uncheckedIconTitle
             * @cfg {String} A hint that will be displayed on the unselected icons. By default, there is no tooltip.
             * @noshow
             */
            uncheckedIconTitle: undefined

            /**
             * @name Controls/Date/interface/IPeriodLiteDialog#iconsHandler
             * @cfg {Function} Sets the function to be called when the component is repainted.
             * @remark
             * Function Arguments:
             * <ol>
             *    <li>periods - An array containing arrays from the beginning and end of the period</li>
             * </ol>
             * The function must return an array of Boolean elements or an object containing information about
             * the displayed icon {@link Icon} or Deferred, which fires such an object.
             * If the function returns true, the icon corresponding to the options {@Link checkedIconCssClass}
             * and {@Link checkedIconTitle} will be drawn. If false, the icons will match the options
             * {@Link uncheckedIconCssClass} and {@Link uncheckedIconTitle}.
             * By default, these are green and gray check marks.
             * The function can return an object containing information about custom windows.
             * { iconClass: 'icon-Yes icon-done',
             *   title: 'Reporting period is closed'
             *   }
             *
             * @see updateIcons
             * @noshow
             */
            // iconsHandler: undefined,
         };
      },

      EMPTY_CAPTIONS: EMPTY_CAPTIONS,

      getOptionTypes: function() {
         return {
            chooseMonths: types(Boolean),
            chooseQuarters: types(Boolean),
            chooseHalfyears: types(Boolean),
            chooseYears: types(Boolean),
            emptyCaption: types(String)
         };
      }
   };
});
