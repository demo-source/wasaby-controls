import List = require('Controls/List');
import 'wml!Controls/List/List';
import 'Controls/List/ListViewModel';
import 'Core/Deferred';
import 'Controls/Utils/tmplNotify';
import 'Controls/List/ListView';
import 'Controls/List/ListControl';
import 'Controls/_calendar/MonthList/ListControl'

/**
 * Plain list with custom item template. Can load data from data source.
 *
 * @class Controls/_calendar/MonthList/List
 * @extends Controls/List
 * @control
 * @author Миронов А.Ю.
 */

var ModuleControl = List.extend(/** @lends Controls/_calendar/MonthList/List.prototype */{
    _viewTemplate: 'Controls/_calendar/MonthList/ListControl'
});

export default ModuleControl;
