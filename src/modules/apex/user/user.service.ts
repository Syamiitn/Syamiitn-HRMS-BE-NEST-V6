import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private async ensureUniqueFields(dto: { email?: string; username?: string }, excludeId?: number) {
    if (dto.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Email already exists');
      }
    }
    if (dto.username) {
      const existing = await this.repo.findOne({ where: { username: dto.username } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Username already exists');
      }
    }
  }

  private hashPassword(password: string): string {
    if (!password || password.length < 8)
      throw new BadRequestException('Password must be at least 8 characters');
    const rounds = this.config.get<number>('auth.saltRounds', 10);
    return bcrypt.hashSync(password, rounds);
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    try {
      await this.ensureUniqueFields({ email: dto.email, username: dto.username });
      const hash = this.hashPassword(dto.password);
      const entity = this.repo.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        role: dto.role ?? UserRole.USER,
        passwordHash: hash,
        isEmailVerified: dto.isEmailVerified ?? false,
        isActive: dto.isActive ?? true,
        ...(typeof dto.twoFactorEnabled === 'boolean' ? { twoFactorEnabled: dto.twoFactorEnabled } : {}),
        ...(dto.twoFactorMethod ? { twoFactorMethod: dto.twoFactorMethod } : {}),
      } as any);
      const saved = await this.repo.save(entity);
      // Exclude passwordHash from return
      const { passwordHash, ...rest } = saved as any;
      return rest;
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate user detected');
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(query: QueryUserDto = {} as QueryUserDto): Promise<Partial<User>[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ firstName: Like(term) });
        where.push({ lastName: Like(term) });
        where.push({ email: Like(term) });
        where.push({ username: Like(term) });
        where.push({ phone: Like(term) });
      }

      const baseWhere: any = {};
      if (query.role) baseWhere.role = query.role;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (typeof query.isEmailVerified === 'boolean') baseWhere.isEmailVerified = query.isEmailVerified;

      const orderBy = query.sortBy ?? 'createdAt';
      const orderDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;

      const options: any = {
        where: where.length ? where.map((w) => ({ ...w, ...baseWhere })) : baseWhere,
        order: { [orderBy]: orderDir },
        select: ['id','firstName','lastName','username','email','phone','role','isEmailVerified','isPhoneVerified','twoFactorMethod','twoFactorEnabled','isActive','lastLoginAt','createdAt','updatedAt'],
      };
      if (query.page && query.limit) {
        options.skip = (query.page - 1) * query.limit;
        options.take = query.limit;
      }

      return await this.repo.find(options);
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: number): Promise<Partial<User>> {
    try {
      const user = await this.repo.findOne({ where: { id }, select: ['id','firstName','lastName','username','email','phone','role','isEmailVerified','isPhoneVerified','twoFactorMethod','twoFactorEnabled','isActive','lastLoginAt','createdAt','updatedAt'] });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<Partial<User>> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('User not found');

      if (dto.email || dto.username) {
        await this.ensureUniqueFields({ email: dto.email, username: dto.username }, id);
      }

      let passwordHash: string | undefined = undefined;
      if (dto.password) {
        passwordHash = this.hashPassword(dto.password);
      }

      const updated = await this.repo.preload({
        id,
        firstName: dto.firstName ?? current.firstName,
        lastName: dto.lastName ?? current.lastName,
        username: dto.username ?? current.username,
        email: dto.email ?? current.email,
        phone: dto.phone ?? current.phone,
        role: (dto.role as any) ?? current.role,
        isEmailVerified: dto.isEmailVerified ?? current.isEmailVerified,
        isActive: dto.isActive ?? current.isActive,
        twoFactorEnabled: typeof dto.twoFactorEnabled === 'boolean' ? dto.twoFactorEnabled : current.twoFactorEnabled,
        twoFactorMethod: dto.twoFactorMethod ?? current.twoFactorMethod,
        ...(passwordHash ? { passwordHash } : {}),
      } as any);
      if (!updated) throw new NotFoundException('User not found');
      const saved = await this.repo.save(updated);
      const { passwordHash: _, ...rest } = saved as any;
      return rest;
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate user detected');
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('User not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
