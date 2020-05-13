# Платформенные визуальные компоненты
#
## Сборка и запуск.

1. Клонируйте репозиторий с контролами, например в папку `wasaby-controls` (все команды в следующих пунктах нужно будет выполнять в этой папке):

        git clone git@github.com:saby/wasaby-controls.git /path/to/wasaby-controls

1. Переключите репозиторий на нужную ветку, например rc-19.100:

        git checkout rc-19.100

1. Установите [Node.js](http://nodejs.org/) и [NPM](http://npmjs.com).

1. Установите зависимости:

        npm install

1. Cоберите проект:

        npm run build

1. Для запуска локального демо-стенда по адресу [localhost:777](http://localhost:777/) выполните:

        npm start
        
    Если порт 777 занят, то приложение запустится на другом свободном порту, в консоли будет ссылка        

1. Для запуска юнит-тестов под Node.js выполните:

        npm test

1. Для запуска сервера с юнит-тестами по адресу [localhost:1025](http://localhost:1025/) выполните:

        npm run start:units

