/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Collection.Tree', [
   'js!SBIS3.CONTROLS.Data.Collection.TreeItem',
   'js!SBIS3.CONTROLS.Data.Bind.ICollection'
], function (TreeItem, IBindCollection) {
   'use strict';

   /**
    * Дерево.
    * @class SBIS3.CONTROLS.Data.Collection.Tree
    * @extends SBIS3.CONTROLS.Data.Collection.TreeItem
    * @mixes SBIS3.CONTROLS.Data.Bind.ICollection
    * @public
    * @author Мальцев Алексей
    */

   return TreeItem.extend([IBindCollection], /** @lends SBIS3.CONTROLS.Data.Collection.Tree.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Collection.Tree',

      $constructor: function (cfg) {
         cfg = cfg || {};

         this._options.node = cfg.node = true;

         if ('parent' in cfg && cfg.parent) {
            throw new Error('Tree can\'t have a parent');
         }
      },

      setParent: function (parent) {
         throw new Error('Tree root can\'t have a parent');
      },

      notifyItemChange: function (item, index, property) {
         this._notify(
            'onCollectionItemChange',
            item,
            index,
            property
         );
      }
   });
});
