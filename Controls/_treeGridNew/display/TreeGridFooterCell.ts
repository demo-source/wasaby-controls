import { GridFooterCell } from 'Controls/gridNew';

export default class TreeGridFooterCell<S> extends GridFooterCell<S> {
   getWrapperClasses(
      theme: string,
      backgroundColorStyle: string,
      style: string = 'default',
      templateHighlightOnHover: boolean
   ): string {
      const classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);
      // todo shouldDrawExpanderPadding https://online.sbis.ru/opendoc.html?guid=c407c670-f342-4388-9466-1389ff5b1848
      const expanderSize = this.getOwner().getExpanderSize() || 'default';
      return classes + ` controls-TreeGridView__footer__expanderPadding-${expanderSize}_theme-${theme}`;
   }
}

Object.assign(TreeGridFooterCell.prototype, {
   '[Controls/treeGrid:TreeGridFooterCell]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterCell',
   _instancePrefix: 'tree-grid-footer-cell-'
});
