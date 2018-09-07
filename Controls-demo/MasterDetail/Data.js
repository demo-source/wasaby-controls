define('Controls-demo/MasterDetail/Data', [], function() {

   var ASTASK = {
      id: 0,
      name: 'Андрей Сухоручкин',
      shortMsg: 'Необходимо сделать MasterDetail',
      taskType: 'Ошибка в разработку',
      imgPath: 'data:image/png;base64,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',
      date: '13 авг'
   }, DKSTASK = {
      id: 1,
      name: 'Дмитрий Крайнов',
      taskType: 'Задача в разработку',
      isNew: true,
      shortMsg: 'Нужно сделать печать на VDOM',
      imgPath: 'data:image/png;base64,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',
      date: '14 авг'
   }, AGTASK = {
      id: 2,
      name: 'Александр Герасимов',
      taskType: 'Ошибка в разработку',
      shortMsg: 'Необходимо сделать Окно выбора на VDOM',
      imgPath: 'data:image/png;base64,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',
      date: '23 авг'
   }, ABTASK = {
      id: 3,
      name: 'Андрей Бегунов',
      taskType: 'Аттестация',
      shortMsg: 'Аттестация сотрудника',
      isNew: true,
      imgPath: 'data:image/png;base64,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',
      date: '26 авг'
   };


   return {
      incoming: [ASTASK, DKSTASK, AGTASK, ABTASK],
      incomingTasks: [DKSTASK],
      instructions: [AGTASK],
      plans: [ABTASK],
      andrewBTasks: [ABTASK],
      andrewSTasks: [ASTASK],
      dmitriyKTasks: [DKSTASK],
      alexGTasks: [AGTASK],
      postponed: [AGTASK, DKSTASK],
      levelUp: [ABTASK],
      criticalBugs: [ASTASK],
      postponedTasks: [ABTASK, AGTASK],
      '3.18.710': [ASTASK],
      todoTasks: [AGTASK],
      hotTasks: [DKSTASK],
      otherTasks: [AGTASK],
      master: [{
         id: '0',
         name: 'Входящие',
         'Раздел@': true,
         'Раздел': null,
         sourceType: 'incoming'
      }, {
         id: '3',
         'Раздел@': false,
         'Раздел': 0,
         name: 'Входящие задачи',
         sourceType: 'incomingTasks'
      }, {
         id: '1',
         name: 'Поручения',
         'Раздел@': false,
         'Раздел': null,
         sourceType: 'instructions'
      }, {
         id: '2',
         'Раздел@': null,
         'Раздел': null,
         name: 'Планы',
         sourceType: 'plans'
      }, {
         id: '4',
         'Раздел@': null,
         'Раздел': null,
         name: 'Задачи от Андрея Б.',
         sourceType: 'andrewBTasks'
      }, {
         id: '5',
         'Раздел@': null,
         'Раздел': null,
         name: 'Задачи от Андрея С.',
         sourceType: 'andrewSTasks'
      }, {
         id: '6',
         'Раздел@': null,
         'Раздел': null,
         name: 'Задачи от Дмитрия К.',
         sourceType: 'dmitriyKTasks'
      }, {
         id: '7',
         'Раздел@': null,
         'Раздел': null,
         name: 'Задачи от Александра Г.',
         sourceType: 'alexGTasks'
      }, {
         id: '8',
         'Раздел@': null,
         'Раздел': null,
         name: 'Отложенные',
         sourceType: 'postponed'
      }, {
         id: '9',
         'Раздел@': null,
         'Раздел': null,
         name: 'Повышение',
         sourceType: 'levelUp'
      }, {
         id: '10',
         'Раздел@': null,
         'Раздел': null,
         name: 'Критические ошибки',
         sourceType: 'criticalBugs'
      }, {
         id: '11',
         'Раздел@': null,
         'Раздел': null,
         name: 'Задачи вынесенные из вехи',
         sourceType: 'postponedTasks'
      }, {
         id: '12',
         'Раздел@': null,
         'Раздел': null,
         name: '3.18.710',
         sourceType: '3.18.710'
      }, {
         id: '13',
         'Раздел@': null,
         'Раздел': null,
         name: 'TODO',
         sourceType: 'todoTasks'
      }, {
         id: '14',
         'Раздел@': null,
         'Раздел': null,
         name: 'Срочные задачи',
         sourceType: 'hotTasks'
      }, {
         id: '15',
         'Раздел@': null,
         'Раздел': null,
         name: 'Прочие',
         sourceType: 'otherTasks'
      }]
   };
});
