/**
 * Шаблон, который используют для настройки отображения элемента контрола {@link Controls/grid:View Таблица} в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/edit/ режиме редактирования}.
 * 
 * @class Controls/_grid/interface/RowEditor
 * @author Авраменко А.С.
 * @see Controls/grid:View#itemTemplate
 * @example
 * <pre class="brush: html">
 * <Controls.grid:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/grid:RowEditor" scope="{{itemTemplate}}">
 *          <div>
 *             Этот шаблон отображается в режиме редактирования.
 *             <Controls.dropdown:Combobox bind:selectedKey="content.itemData.item.documentSign"  />
 *          </div>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.grid:View>
 * </pre>
 * @public
 */

export default interface IRowEditorOptions {
   /**
    * @name Controls/_grid/interface/RowEditor#content
    * @cfg {String|Function} Пользовательский шаблон, описывающий содержимое элемента в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/edit/ режиме редактирования}.
    * @default undefined
    */
   content?: string;
}