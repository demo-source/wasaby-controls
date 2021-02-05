import { assert } from 'chai';
import * as sinon from 'sinon';
import { GridFooterRow, IGridFooterCellOptions } from 'Controls/gridNew';

const columns = [{}, {}, {}, {}, {}, {}];
const mockedOwner = {
    getColumnsConfig: () => columns,
    getStickyColumnsCount: () => 0,
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => false
} as any;

describe('Controls/grid_clean/Display/Footer/FooterRow/Colspan', () => {

    it('Grid columns count > footer columns count', () => {
        const footerRow = new GridFooterRow({
            columns,
            owner: mockedOwner,
            footer: [
                { startColumn: 1, endColumn: 3 },
                { startColumn: 3, endColumn: 4 },
                { startColumn: 4, endColumn: 7 },
            ]
        });
        const sandbox = sinon.createSandbox();

        // replace cell constructor to fake constructor for test options
        function FakeGridFooterCellFactory(options: IGridFooterCellOptions<any>) {
            assert.strictEqual(options.colspan, 0);
        }
        sandbox.replace(footerRow, 'getColumnsFactory', (): any => {
            return FakeGridFooterCellFactory;
        });

        const footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 3);

        sandbox.restore();
    });
});
