import { Test, TestingModule } from "@nestjs/testing";
import { SosController } from "./sos.controller";
import { SosService } from "./sos.service";
import { EmergencyGrade, EmergencyType } from "./dto/sos.dto";

describe("SosController", () => {
  let controller: SosController;
  let service: SosService;

  const mockSosService = {
    createEmergencyRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SosController],
      providers: [
        {
          provide: SosService,
          useValue: mockSosService,
        },
      ],
    }).compile();

    controller = module.get<SosController>(SosController);
    service = module.get<SosService>(SosService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createEmergencyRequest", () => {
    it("should call service.createEmergencyRequest and return result", async () => {
      const dto = {
        description: "Heart attack",
        grade: EmergencyGrade.CRITICAL,
        latitude: 19.9,
        longitude: 99.8,
        medicalInfo: { symptoms: "Chest pain" },
        type: EmergencyType.MEDICAL,
      };

      const mockResult = {
        id: "emergency-123",
        ...dto,
        status: "PENDING",
      };

      mockSosService.createEmergencyRequest.mockResolvedValue(mockResult);

      const result = await controller.createEmergencyRequest(dto, {
        id: "user123",
      });

      expect(service.createEmergencyRequest).toHaveBeenCalledWith(
        dto,
        "user123",
      );
      expect(result).toEqual(mockResult);
    });
  });
});
