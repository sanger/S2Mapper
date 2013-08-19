define([ 'resource_test_helper'
  , 'config'
  , 'mapper/s2_root'
  , 'mapper/s2_tube_resource'
  , 'text!json/unit/root.json'
  , 'text!json/unit/tube.json'
  , 'text!json/unit/order_without_batch.json'
], function (TestHelper, config, Root, TubeResource, rootTestJson, tubeTestJson, tubeByBarcodeJson) {
  'use strict';

  TestHelper(function (results) {
    describe("Tube Resource:-", function () {

      var s2;

      describe("modular interface", function () {
        
        it("should be labellable", function () {
          expect(TubeResource.instantiate({rawJson:{actions:{}}}).labelWith).to.be.defined;
        })
      
      });

      describe("Searching for a tube by EAN13 barcode,", function () {

        describe("and the tube IS on the system,", function () {

          beforeEach(function (done) {

            var self = this;

            config.loadTestData(rootTestJson);
            config.cummulativeLoadingTestDataInFirstStage(tubeByBarcodeJson);

            Root.load({user:"username"})
              .then(function (root) {
                results.assignTo('root')(root);
                s2 = results.get('root');
                return root.tubes.findByEan13Barcode('2345678901234');
              })
              .then(function(res) {
                self.tube = res
              })
              .then(results.expected)
              .fail(results.unexpected)
              .always(done);

          });

          it("takes an EAN13 barcode and returns the corresponding resource.", function () {
            
            expect(this.tube.rawJson).to.be.defined;
          
          });
        });


        describe("and tube IS NOT on the system,", function () {

          var tubePromise;

          beforeEach(function (done) {

              config.loadTestData(rootTestJson);

              Root.load({user:"username"})
                .then(function (root) {
                  results.assignTo('root')(root);
                  s2 = results.get('root');
                  config.cummulativeLoadingTestDataInFirstStage(tubeByBarcodeJson);
                  tubePromise = s2.tubes.findByEan13Barcode('6666666666666'); // we need to save the promise here !
                  return tubePromise;
                })
                .then(results.unexpected)
                .fail(results.expected)
                .always(function(err) {
                  done();
                });

          });

          it("takes an EAN13 barcode but the returned promise is rejected.", function () {
            expect(tubePromise.state()).to.equal('rejected')
          })

        })
      });

      describe("once a tube has been loaded", function () {
        beforeEach(function (done) {

          var self = this;

          config.loadTestData(rootTestJson);

          Root.load({user:"username"})
            .then(function (root) {
              results.assignTo('root')(root);
              s2 = results.get('root');
              config.cummulativeLoadingTestDataInFirstStage(tubeByBarcodeJson);
              return root.tubes.findByEan13Barcode('2345678901234');
            })
            .then(function(res) {
              self.tube = res;
            })
            .fail(results.unexpected)
            .always(done);
        });

        describe(".order()", function () {
          
          it("resolves to an order resource.", function (done) {

            this.tube.order()
              .then(function(order) {
                expect(order.resourceType).to.equal('order');
              })
              .fail(results.unexpected)
              .always(done);

          })
        })
      });

      describe("When the server fails to respond to a search creation",function(){
          
          it("the findByEan13Barcode promise fails.", function (done) {
            
            config.loadTestData(rootTestJson);

            Root.load({user:"username"})
              .then(function (root) {
                // with this line, when findByEan13Barcode will be called,
                // we artificially prevent the creation of search, simulating a server failure.
                root.laboratorySearches.create = function(){ return $.Deferred().reject().promise();};

                results.assignTo('root')(root);
                s2 = results.get('root');
                config.cummulativeLoadingTestDataInFirstStage(tubeByBarcodeJson);
                return root.tubes.findByEan13Barcode('2345678901234');
              })
              .then(results.unexpected)
              .fail(results.expected)
              .always(done);

        });
      });
    })
  })
});
