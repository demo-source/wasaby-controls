/**
 * Created by am.gerasimov on 06.03.2017.
 */
/* global define, beforeEach, afterEach, describe, context, it, assert, $ws */
define(
   [
      'Controls/Search/Search',
      'WS.Data/Source/Memory'
   ],
   function (Search, Memory) {
      
      'use strict';
      
      describe('Controls.Lists.utils.Search', function () {
         var data = [
                {
                   name: 'Sasha'
                },
                {
                   name: 'Aleksey'
                },
                {
                   name: 'Dmitry'
                },
               {
                  name: 'Dmitry'
               },
                {
                   name: 'Ыфырф'
                }
             ],
             source = new Memory({
                data: data
             });
         
         describe('search', function() {
            it('Search', function(done) {
               var search = new Search(
                  {
                     searchParam: 'name',
                     dataSource: source,
                     searchDelay: 50
                  }
               );
               search.search({
                  filter: {
                     name: 'Sasha'
                  },
                  pageSize: 5
               }).addCallback(function(result) {
                  assert.equal(result.result.getCount(), 1);
                  assert.equal(result.result.at(0).get('name'), 'Sasha');
                  done();
                  return result;
               });
            });
   
            it('abort Search', function(done) {
               var search  = new Search(
                  {
                     searchParam: 'name',
                     dataSource: source,
                     searchDelay: 50
                  }
               );
               var searchDef = search.search({
                  filter: {
                     name: 'Sasha'
                  },
                  pageSize: 5
               });
   
               search.abort();
   
               searchDef.addErrback(function(err) {
                  done();
                  return err;
               });
               
            });
   
            it('double Search', function(done) {
               var search = new Search(
                  {
                     searchParam: 'name',
                     dataSource: source,
                     searchDelay: 50
                  }
               ),
               aborted;
               search.search({
                  filter: {
                     name: 'Aleksey'
                  },
                  pageSize: 1
               }).addErrback(function(result) {
                  aborted = true;
                  return result;
               });
   
               search.search({
                  filter: {
                     name: 'Sasha'
                  },
                  pageSize: 5
               }).addCallback(function(result) {
                  assert.equal(result.result.getCount(), 1);
                  assert.equal(result.result.at(0).get('name'), 'Sasha');
                  assert.equal(aborted, true);
                  done();
                  return result;
               });
            });
   
            it('check search navigation', function(done) {
               var search  = new Search(
                  {
                     searchParam: 'name',
                     dataSource: source,
                     navigation: {
                        source: 'page',
                        sourceConfig: {
                           pageSize: 1,
                           page: 0,
                           mode: 'totalCount'
                        }
                     },
                     searchDelay: 50
                  }
               );
               search.search({
                  filter: {
                     name: 'Dmitry'
                  }
               }).addCallback(function(res) {
                  assert.equal(res.result.getCount(), 1);
                  assert.equal(res.hasMore, true);
                  done();
               });
      
            });
   
            it('check wrong params', function(done) {
               try {
                  new Search({searchParam: 'name'});
               } catch (e) {
                  done();
               }
            });
   
            it('getArgsForQuery', function() {
               var search  = new Search(
                  {
                     searchParam: 'name',
                     dataSource: source,
                     navigation: {
                        source: 'page',
                        sourceConfig: {
                           pageSize: 1,
                           page: 0,
                           mode: 'totalCount'
                        }
                     }
                  }
               );
   
               var queryArgs = Search._private.getArgsForQuery(search, {});
               
               assert.equal(source, queryArgs[0]);
               assert.equal(0, queryArgs[4]);
            });
         });
      });
   });