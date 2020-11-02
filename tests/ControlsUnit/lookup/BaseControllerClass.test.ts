import {default as BaseControllerClass, ILookupBaseControllerOptions} from 'Controls/_lookup/BaseControllerClass';
import {Memory, SbisService} from 'Types/source';
import {RecordSet, List} from 'Types/collection';
import {Model} from 'Types/entity';
import {deepStrictEqual, ok} from 'assert';
import {stub} from 'sinon';
import {error} from 'Controls/dataSource';
import {Service} from 'Controls/history';

function getData(): object[] {
    return [
        {
            id: 0,
            title: 'Sasha'
        },
        {
            id: 1,
            title: 'Aleksey'
        },
        {
            id: 2,
            title: 'Dmitry'
        }
    ];
}

function getSource(): Memory {
    return new Memory({
        keyProperty: 'id',
        data: getData()
    });
}
const source = getSource();

const sourceWithError = getSource();
sourceWithError.query = () => Promise.reject(new Error());

function getRecordSet(): RecordSet {
    return new RecordSet({
        rawData: getData(),
        keyProperty: 'id'
    });
}

function getControllerOptions(): object {
    return {
        selectedKeys: [],
        source,
        keyProperty: 'id',
        displayProperty: 'title'
    };
}

function getLookupControllerWithEmptySelectedKeys(additionalConfig?: object): BaseControllerClass {
    let options = getControllerOptions();
    options = {...options, ...additionalConfig};
    return new BaseControllerClass(options as ILookupBaseControllerOptions);
}

function getLookupControllerWithSelectedKeys(additionalConfig?: object): BaseControllerClass {
    let options = getControllerOptions();
    options.selectedKeys = [0, 1, 2];
    options = {...options, ...additionalConfig};
    return new BaseControllerClass(options as ILookupBaseControllerOptions);
}

class CustomModel extends Model {
    protected _moduleName: string = 'customModel';
    protected _$properties = {
        isCustom: {
            get(): boolean {
                return true;
            }
        }
    };
}

describe('Controls/_lookup/BaseControllerClass', () => {

    describe('loadItems', () => {
        it('simple loadItems', () => {
            const controller = getLookupControllerWithSelectedKeys();

            return new Promise((resolve) => {
                controller.loadItems().then((items) => {
                    controller.setItems(items);
                    const resultItemsCount = 3;
                    deepStrictEqual(controller.getItems().getCount(), resultItemsCount);
                    resolve();
                });
            });
        });

        it('source returns error', () => {
            const controller = getLookupControllerWithSelectedKeys({
                source: sourceWithError
            });

            return new Promise((resolve) => {
                const errorStub = stub(error, 'process');
                controller.loadItems().then((result) => {
                    ok(errorStub.calledOnce);
                    ok(result instanceof List);
                    errorStub.restore();
                    resolve();
                });
            });
        });
    });

    describe('update', () => {
        it('source is changed while loading', async () => {
            const controller = getLookupControllerWithSelectedKeys();
            const isLoadCanceled = false;
            controller.loadItems();
            controller._sourceController.cancelLoading = () => {
                isLoadCanceled = true;
            };
            const options = getControllerOptions();
            options.source = getSource();
            await controller.update(options);
            ok(isLoadCanceled);
        });
    });

    it('setItems', () => {
        const controller = getLookupControllerWithEmptySelectedKeys();
        controller.setItems(getRecordSet());
        deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);
    });

    it('getItems', () => {
        const resultItemsCount = 3;
        const controller = getLookupControllerWithEmptySelectedKeys();
        controller.setItems(getRecordSet());
        deepStrictEqual(controller.getItems().getCount(), resultItemsCount);
    });

    it('addItem', () => {
        const controller = getLookupControllerWithEmptySelectedKeys();
        const item = new Model({
            rawData: getData()[0],
            keyProperty: 'id'
        });
        controller.addItem(item);

        deepStrictEqual(controller.getItems().getCount(), 1);
        deepStrictEqual(controller.getItems().at(0).get('title'), 'Sasha');
    });

    it('addItem source model is preparing', () => {
        const controller = getLookupControllerWithEmptySelectedKeys({
            source: new SbisService({
                model: CustomModel
            })
        });
        const item = new Model({
            rawData: getData()[0],
            keyProperty: 'id'
        });
        controller.addItem(item);

        ok(controller.getItems().at(0) instanceof CustomModel);
    });

    it('removeItem', () => {
        const controller = getLookupControllerWithSelectedKeys();
        const item = new Model({
            rawData: getData()[0],
            keyProperty: 'id'
        });

        controller.setItems(getRecordSet());
        controller.removeItem(item);
        deepStrictEqual(controller.getSelectedKeys(), [1, 2]);
        deepStrictEqual(controller.getItems().getCount(), 2);
    });

    it('getSelectedKeys', () => {
        const controller = getLookupControllerWithEmptySelectedKeys();
        controller.setItems(getRecordSet());
        deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);
    });

    it('getTextValue', () => {
        const controller = getLookupControllerWithSelectedKeys();

        return new Promise((resolve) => {
            controller.loadItems().then((items) => {
                controller.setItems(items);
                deepStrictEqual(controller.getTextValue(), 'Sasha, Aleksey, Dmitry');
                resolve();
            });
        });
    });

    it('setItemsAndSaveToHistory', async () => {
        const controller = getLookupControllerWithEmptySelectedKeys({
            historyId: 'TEST_HISTORY_ID'
        });
        const historyService = await controller.setItemsAndSaveToHistory(getRecordSet());

        ok(historyService instanceof Service);
        deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);
    });
});
