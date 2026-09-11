# wrapper

Модуль NodeCMS. Предоставляет API для вызова сервисов из других модулей через прокси-обёртку. Все вызовы выполняются только локально, без обращения к ESB.

## Назначение

- `GET /wrapper` — список версий сервисов (`Object.keys(sreda.versions)`).
- `POST /wrapper/:from/:to/:service` — выполнить метод локального сервиса по телу запроса.
- Глобальная функция `wrapper(module, id)` — Proxy-класс: любой вызов метода проксируется в `wrapperService.getFunctionResult()`.

## Структура

```
wrapper/
├── _tests_/tests/wrapper.service.test.js
├── controllers/wrapper.controller.js
├── routers/wrapper.router.js
├── services/wrapper.service.js
├── package.json
└── README.md
```

## Тело POST-запроса

```json
{
  "servicePathArray": ["module", "services"],
  "serviceName": "example.service",
  "constructorArgumentsList": [],
  "functionName": "methodName",
  "functionArgumentsList": []
}
```

Сервис подключается по пути `../../{servicePathArray}/{serviceName}`, создаётся экземпляр с `constructorArgumentsList` и вызывается `functionName(...functionArgumentsList)`.

## Использование Proxy

```js
const LocalService = wrapper('module', 'module/services/example.service');
const instance = new LocalService(...constructorArgs);
const result = await instance.someMethod(...methodArgs);
```

Вызов всегда идёт через локальный `post()`. Если модуля нет на диске, `require` выбросит ошибку.

## Тесты

```bash
npm install --save-dev jest
npm test
```

Тесты покрывают `findService()`, `getFunctionResult()` и `post()`.
