const path = require('node:path');
const Extensions = require('../../../../core/class/Extensions.class');

class wrapperService extends Extensions {
    async findService(servicePathArray, serviceName) {
        try {
            const localPath = path.join(
                '..',
                '..',
                ...servicePathArray,
                serviceName
            );
            require(localPath);
            return true;
        } catch (e) {
            return false;
        }
    }

    async getFunctionResult(
        serviceArgumentsList,
        constructorArgumentsList,
        functionName,
        functionArgumentsList
    ) {
        let servicePath = serviceArgumentsList[1] || serviceArgumentsList[0];

        const pathParse = path.parse(servicePath);
        let servicePathArray = servicePath.split('/');
        servicePathArray.pop(); // удаляем имя сервиса
        servicePathArray = servicePathArray.filter(
            (dir) => dir !== '..' && dir !== '.'
        );
        let serviceName = pathParse.base;

        const body = {
            servicePathArray,
            serviceName,
            constructorArgumentsList,
            functionName,
            functionArgumentsList,
        };

        return this.post(
            serviceArgumentsList[0],
            servicePathArray[0],
            body
        );
    }

    async post(from, service, body) {
        const localPath = path.join(
            '..',
            '..',
            ...body.servicePathArray,
            body.serviceName
        );
        const moduleClass = require(localPath);
        const moduleInstance = new moduleClass(
            ...body.constructorArgumentsList
        );
        const result = await moduleInstance[body.functionName](
            ...body.functionArgumentsList
        );
        return result;
    }
}

globalThis.wrapper = function (module, id) {
    function newClass(...args) {
        // Заглушка
    }

    const myClass = new Proxy(newClass, {
        construct: function (target, constructorArgumentsList) {
            const myProxy = new Proxy(
                {},
                {
                    get: function get(target, name) {
                        return function wrapper() {
                            const functionArgumentsList =
                                Array.prototype.slice.call(arguments);
                            const wrapperClass = new wrapperService();
                            return wrapperClass.getFunctionResult(
                                [module, id],
                                constructorArgumentsList,
                                name,
                                functionArgumentsList
                            );
                        };
                    },
                }
            );
            return myProxy;
        },
    });

    return myClass;
};

module.exports = wrapperService;
