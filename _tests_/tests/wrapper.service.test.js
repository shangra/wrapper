const WrapperService = require('../../services/wrapper.service');

describe('WrapperService', () => {
    let wrapperService;

    beforeEach(() => {
        wrapperService = new WrapperService();
    });

    test('findService should resolve with true when a valid local service is found', async () => {
        jest.spyOn(wrapperService, 'resolveLocalPath').mockReturnValueOnce(
            '/resolved/service.js'
        );

        const result = await wrapperService.findService(
            ['some', 'path'],
            'service.js'
        );
        expect(result).toBe(true);
    });

    test('findService should resolve with false when no local service is found', async () => {
        jest.spyOn(wrapperService, 'resolveLocalPath').mockImplementationOnce(
            () => {
                throw new Error('not found');
            }
        );

        const result = await wrapperService.findService(
            ['some', 'path'],
            'nonexistent-service.js'
        );
        expect(result).toBe(false);
    });

    test('getFunctionResult should always call local post', async () => {
        jest.spyOn(wrapperService, 'post').mockResolvedValueOnce({
            result: 'local',
        });

        const params = [['some', 'path'], [], 'method', []];

        const result = await wrapperService.getFunctionResult(...params);
        expect(result).toEqual({ result: 'local' });
        expect(wrapperService.post).toHaveBeenCalledTimes(1);
    });

    test('post method should work as expected', async () => {
        const ModuleClassMock = jest.fn().mockImplementation(() => ({
            someMethod: jest.fn().mockResolvedValue('resolved'),
        }));
        jest.spyOn(wrapperService, 'loadLocalClass').mockReturnValueOnce(
            ModuleClassMock
        );

        const body = {
            servicePathArray: ['some', 'path'],
            serviceName: 'service.js',
            constructorArgumentsList: [],
            functionName: 'someMethod',
            functionArgumentsList: [],
        };

        const result = await wrapperService.post('from', 'service', body);
        expect(result).toBe('resolved');
        expect(wrapperService.loadLocalClass).toHaveBeenCalledWith(
            ['some', 'path'],
            'service.js'
        );
    });
});
