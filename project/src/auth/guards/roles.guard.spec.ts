import { Test, TestingModule } from "@nestjs/testing";
import { RolesGuard } from "./roles.guard";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ExecutionContext } from "@nestjs/common";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should allow access when no roles are required", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(null);

      const context = {
        getHandler: jest.fn().mockReturnValue(() => {}),
        getClass: jest.fn().mockReturnValue(() => {}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: UserRole.PATIENT,
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });

    it("should allow access when user has required role", () => {
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([UserRole.ADMIN]);

      const context = {
        getHandler: jest.fn().mockReturnValue(() => {}),
        getClass: jest.fn().mockReturnValue(() => {}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: UserRole.ADMIN,
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });

    it("should deny access when user lacks required role", () => {
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([UserRole.ADMIN]);

      const context = {
        getHandler: jest.fn().mockReturnValue(() => {}),
        getClass: jest.fn().mockReturnValue(() => {}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: UserRole.PATIENT,
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
