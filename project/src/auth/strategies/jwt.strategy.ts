import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { TokenPayload } from "../../common/interfaces/auth.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
    // Log JWT_SECRET เพื่อตรวจสอบ
    console.log('JwtStrategy - JWT_SECRET:', configService.get<string>("JWT_SECRET"));
  }

  async validate(payload: TokenPayload) {
    console.log('JwtStrategy - Payload:', payload); // Log payload เพื่อดูข้อมูลโทเคน

    const { sub: userId } = payload;
    console.log('JwtStrategy - User ID:', userId); // Log userId ที่ดึงจาก payload

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (user.status !== "ACTIVE") {
        console.error('JwtStrategy - Error: User is not active:', user);
        throw new UnauthorizedException("User is inactive");
      }

      console.log('JwtStrategy - Validation successful for user:', user);
      return user;
    } catch (error) {
      console.error('JwtStrategy - Error during validation:', error.message);
      throw new UnauthorizedException("Validation failed: " + error.message);
    }
  }
}