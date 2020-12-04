import { assert } from 'chai';
import { Model } from 'Types/entity';

import { GridCell, GridRow } from 'Controls/display';

describe('Controls/display/GridCell', () => {

    // region Аспект "Тег"

    describe('tag', () => {

        let cell: GridCell<Model, GridRow<Model>>;

        beforeEach(() => {
            cell = new GridCell();
        });

        it('shouldDisplayTag should not return true by default', () => {
            assert.isFalse(cell.shouldDisplayTag());
        });
    });

    // endregion
});