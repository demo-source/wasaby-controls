/**
 * Created by as.krasilnikov on 21.03.2018.
 */
define('Controls/Popup/Opener/Stack/StackStrategy', [], function() {
   // Minimum popup indentation from the right edge
   var MINIMAL_PANEL_DISTANCE = 20;

   var _private = {
      getPanelWidth: function(item, tCoords, maxPanelWidth) {
         var panelWidth;
         var maxPanelWidthWithOffset = maxPanelWidth - tCoords.right;
         var minWidth = parseInt(item.popupOptions.minWidth, 10);
         var maxWidth = parseInt(item.popupOptions.maxWidth, 10);

         if (_private.isMaximizedPanel(item) && !_private.isMaximizedState(item)) {
            panelWidth = item.popupOptions.minimizedWidth;
         } else if (!minWidth || !maxWidth) { // If no configuration is specified then get the size of the container
            if (item.containerWidth > maxPanelWidthWithOffset) {
               panelWidth = maxPanelWidthWithOffset; // returns the width of the content no larger than the allowed width
            }
         } else if (maxWidth <= maxPanelWidthWithOffset) {
            panelWidth = maxWidth;
         } else if (minWidth > maxPanelWidthWithOffset) { // If the minimum width does not fit into the screen - positioned on the right edge of the window
            if (_private.isMaximizedPanel(item)) {
               minWidth = item.popupOptions.minimizedWidth;
            }
            if (minWidth > maxPanelWidthWithOffset) {
               tCoords.right = 0;
            }
            panelWidth = minWidth;
         } else {
            panelWidth = maxPanelWidthWithOffset; // return allowed width
         }

         return panelWidth;
      },
      isMaximizedPanel: function(item) {
         return !!item.popupOptions.minimizedWidth;
      },

      isMaximizedState: function(item) {
         return !!item.popupOptions.maximized;
      }
   };

   return {

      /**
       * Returns popup position
       * @function Controls/Popup/Opener/Stack/StackController#getPosition
       * @param tCoords Coordinates of the container relative to which the panel is displayed
       * @param item Popup configuration
       */
      getPosition: function(tCoords, item) {
         var maxPanelWidth = this.getMaxPanelWidth();
         var width = _private.getPanelWidth(item, tCoords, maxPanelWidth);
         var position = {
            stackWidth: width,
            right: item.hasMaximizePopup ? 0 : tCoords.right,
            top: tCoords.top,
            bottom: 0
         };

         if (item.popupOptions.minWidth) {
            //todo: Удалить minimizedWidth https://online.sbis.ru/opendoc.html?guid=8f7f8cea-b39d-4046-b5b2-f8dddae143ad
            position.stackMinWidth = item.popupOptions.minimizedWidth || item.popupOptions.minWidth;
         }
         if (item.popupOptions.maxWidth) {
            position.stackMaxWidth = Math.min(item.popupOptions.maxWidth, maxPanelWidth);
         } else {
            position.stackMaxWidth = maxPanelWidth;
         }

         return position;
      },

      /**
       * Returns the maximum possible width of popup
       * @function Controls/Popup/Opener/Stack/StackController#getMaxPanelWidth
       */
      getMaxPanelWidth: function() {
         return window.innerWidth - MINIMAL_PANEL_DISTANCE;
      },

      isMaximizedPanel: _private.isMaximizedPanel
   };
});
