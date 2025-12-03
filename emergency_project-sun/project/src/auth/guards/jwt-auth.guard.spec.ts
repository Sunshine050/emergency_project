import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should allow access to public routes", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

      const context = {
        getHandler: jest.fn().mockReturnValue(() => {}),
        getClass: jest.fn().mockReturnValue(() => {}),
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe("handleRequest", () => {
    it("should return user when authentication succeeds", () => {
      const user = { id: "user-123", email: "test@example.com" };
      expect(guard.handleRequest(null, user, null)).toBe(user);
    });

    it("should throw UnauthorizedException when authentication fails", () => {
      expect(() =>
        guard.handleRequest(null, null, new Error("Authentication failed")),
      ).toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when no user is found", () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
