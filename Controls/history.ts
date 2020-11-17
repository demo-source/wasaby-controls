/**
 * Библиотека контролов, которые служат для отображения элемента коллекции или выбора элемента из выпадающего окна с возможностью сохранения истории выбора.
 * @library Controls/history
 * @public
 * @author Крайнов Д.О.
 */

/*
 * history library
 * @library Controls/history
 * @public
 * @author Крайнов Д.О.
 */

import Constants = require('Controls/_history/Constants');
import FilterSource = require('Controls/_history/FilterSource');

export {default as Source} from './_history/Source';
export {default as Service} from './_history/Service';

export {
    Constants,
    FilterSource
};
