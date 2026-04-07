import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterInput, LoginInput } from './dto/auth.input';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await argon2.hash(input.password);

    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        role: 'MEMBER', // Role is never taken from client input — always MEMBER on self-registration
        country: input.country,
      },
    });

    const accessToken = this.signToken(user.id, user.email, user.role, user.country);
    const { password: _, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password, input.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.signToken(user.id, user.email, user.role, user.country);
    const { password: _, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  private signToken(id: string, email: string, role: string, country: string) {
    return this.jwtService.sign(
      { sub: id, email, role, country },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    );
  }
}
