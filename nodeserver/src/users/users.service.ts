import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {}

  private get saltRounds(): number {
    return Number(this.config.get('BCRYPT_ROUNDS', 12));
  }

  async create(dto: CreateUserDto): Promise<User> {
    const username = dto.username.toLowerCase().trim();
    const exists = await this.userModel.exists({ username });
    if (exists) {
      throw new ConflictException('Username already taken');
    }
    const password = await bcrypt.hash(dto.password, this.saltRounds);
    const created = await this.userModel.create({ ...dto, username, password });
    return this.sanitize(created);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Used by AuthService — includes the password hash for verification. */
  async findByUsernameWithPassword(
    username: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ username: username.toLowerCase().trim() })
      .select('+password')
      .exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.username) update.username = dto.username.toLowerCase().trim();
    if (dto.password) {
      update.password = await bcrypt.hash(dto.password, this.saltRounds);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Soft delete — deactivate, never hard-delete (preserves history). */
  async deactivate(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private sanitize(doc: UserDocument): User {
    const obj = doc.toObject() as unknown as Record<string, unknown>;
    delete obj.password;
    return obj as unknown as User;
  }
}