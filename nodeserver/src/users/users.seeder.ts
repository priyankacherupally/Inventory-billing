import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from '../common/constants/roles.enum';

/** Seeds the two initial users on first boot if they do not exist. */
@Injectable()
export class UsersSeeder implements OnModuleInit {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const rounds = Number(this.config.get('BCRYPT_ROUNDS', 12));

    const seeds = [
      {
        name: 'Priyanka',
        username: this.config.get<string>('SEED_ADMIN_USERNAME', 'priyanka'),
        password: this.config.get<string>('SEED_ADMIN_PASSWORD', 'Admin@123'),
        role: UserRole.ADMIN,
      },
      {
        name: 'Nikhil',
        username: this.config.get<string>('SEED_BILLING_USERNAME', 'nikhil'),
        password: this.config.get<string>(
          'SEED_BILLING_PASSWORD',
          'Billing@123',
        ),
        role: UserRole.BILLING_EXECUTIVE,
      },
    ];

    for (const seed of seeds) {
      const username = seed.username.toLowerCase().trim();
      const exists = await this.userModel.exists({ username });
      if (exists) continue;
      await this.userModel.create({
        name: seed.name,
        username,
        password: await bcrypt.hash(seed.password, rounds),
        role: seed.role,
        isActive: true,
      });
      this.logger.log(`Seeded ${seed.role} user: ${username}`);
    }
  }
}