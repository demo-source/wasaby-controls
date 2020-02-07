import 'Core/polyfill/PromiseAPIDeferred';

import {assert} from 'chai';
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';

import * as ErrorModule from 'Controls/_dataSource/error';
import {ListSourceLoadingController} from 'Controls/_list/SourceControl/ListSourceLoadingController';
import {SourceFaker} from 'Controls-demo/List/Utils/listDataGenerator';

const NUMBER_OF_ITEMS = 50;

describe('Controls/_list/SourceControl/ListSourceLoadingController', () => {
    let instance: ListSourceLoadingController;
    let source: SourceFaker;
    let rawData: any[];

    describe ('load', () => {

        beforeEach(() => {
            source = new SourceFaker({perPage: NUMBER_OF_ITEMS, keyProperty: 'id'});
            rawData = source.getRawData();
        });

        it('should load first portion of data', () => {
            instance = new ListSourceLoadingController({
                source,
                keyProperty: 'id',
                navigation: {
                    source: 'page',
                    view: 'demand',
                    sourceConfig: {
                        page: 0,
                        pageSize: NUMBER_OF_ITEMS,
                        hasMore: false
                    }
                }
            });
            const _record = new Record({rawData: rawData[4]});
            return instance.load()
                .then((response: {data: RecordSet, error: ErrorModule.ViewConfig}) => {
                    assert.equal(response.data.at(4).get('id'), _record.get('id'));
                });
        });

        it('should change page on demand', () => {
            instance = new ListSourceLoadingController({
                source,
                keyProperty: 'id',
                navigation: {
                    source: 'page',
                    view: 'demand',
                    sourceConfig: {
                        page: 0,
                        pageSize: NUMBER_OF_ITEMS,
                        hasMore: false
                    }
                }
            });
            const _record = new Record({rawData: rawData[4]});
            return instance.load()
                .then((response: {data: RecordSet, error: ErrorModule.ViewConfig}) => {
                    assert.equal(response.data.at(4).get('id'), _record.get('id'));
                    return response.data;
                })
                .then((recordSet: RecordSet) => {
                    recordSet.setMetaData({more: true});
                    return instance.loadToDirection('down')
                        .then((response2: {data: RecordSet, error: ErrorModule.ViewConfig}) => {
                            assert.equal(response2.data.at(0).get('id'), NUMBER_OF_ITEMS);
                        });
                });
        });
    });
});
