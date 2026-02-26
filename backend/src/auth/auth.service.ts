import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      
      if (privateKey && clientEmail) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: 'fitpro-platform',
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      }
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const isApproved = dto.role !== UserRole.COACH;

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      isApproved,
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message:
        dto.role === UserRole.COACH
          ? 'Registration successful. Your account is pending admin approval.'
          : 'Registration successful.',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Your account has been suspended');
    }

    if (user.role === UserRole.COACH && !user.isApproved) {
      throw new ForbiddenException('Your coach account is pending admin approval');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async firebaseLogin(idToken: string, role?: string) {
    let firebaseUser: admin.auth.DecodedIdToken;

    try {
      firebaseUser = await admin.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    const { email, name, picture, uid } = firebaseUser;

    if (!email) {
      throw new UnauthorizedException('No email found in Firebase token');
    }

    // find or create user
    let user = await this.usersService.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const userRole = (role as UserRole) || UserRole.CLIENT;
      const isApproved = userRole !== UserRole.COACH;

      user = await this.usersService.create({
        name: name || email.split('@')[0],
        email,
        password: await bcrypt.hash(uid, 10),
        role: userRole,
        avatar: picture || '',
        isApproved,
        isActive: true,
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException('Your account has been suspended');
    }

    if (user.role === UserRole.COACH && !user.isApproved) {
      throw new ForbiddenException('Your coach account is pending admin approval');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      isNewUser,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(user: UserDocument) {
    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async getMe(user: UserDocument) {
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
  }

  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isApproved: user.isApproved,
      isActive: user.isActive,
      createdAt: user['createdAt'],
    };
  }
}
