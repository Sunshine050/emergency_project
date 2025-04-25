import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return status and timestamp', () => {
      const result = { status: 'ok', timestamp: '2025-04-25T12:00:00.000Z' };
      mockAppService.getHello.mockReturnValue(result);

      expect(appController.getHello()).toEqual(result);
      expect(mockAppService.getHello).toHaveBeenCalled();
    });
  });
});