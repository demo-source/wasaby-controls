define(['Controls/Operations/ReportDialog'], function(ReportDialog) {
   'use strict';

   describe('Controls.Operations.ReportDialog', function() {
      var reportDialog = new ReportDialog();

      it('success', function() {
         reportDialog._beforeMount({
            operationsCount: 10,
            operationsSuccess: 10
         });
         assert.equal(reportDialog._message, 'Выполнение операции завершилось успешно');
      });
      it('error without errors list', function() {
         reportDialog._beforeMount({
            operationsCount: 10,
            operationsSuccess: 6
         });
         assert.equal(reportDialog._message, 'Выполнение операции завершилось ошибкой');
      });
      it('error with errors list', function() {
         reportDialog._beforeMount({
            operationsCount: 10,
            operationsSuccess: 6,
            errors: ['error1']
         });
         assert.equal(reportDialog._message, '4 из 10 операций были обработаны с ошибкой');
      });
   });
});
