import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { StorageService } from '../storage/storage.service';
import { storageConfig } from '../storage/storage.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly storageService: StorageService,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'name',
        'role',
        'profileImage',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    // Exclude sensitive data by default for general queries
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'role',
        'profileImage',
        'createdAt',
        'updatedAt',
        'refreshToken',
      ],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const dataToCreate = { ...userData };
    if (dataToCreate.password) {
      dataToCreate.password = await this.hashPassword(dataToCreate.password);
    }
    const user = this.usersRepository.create(dataToCreate);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'name',
        'role',
        'profileImage',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    await this.usersRepository.update(id, updateProfileDto);
    return this.findOneById(id) as Promise<User>;
  }

  async updateByAdmin(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const dataToUpdate = { ...updateUserDto };
    if (dataToUpdate.password) {
      dataToUpdate.password = await this.hashPassword(dataToUpdate.password);
    }
    await this.usersRepository.update(id, dataToUpdate);
    return this.findOneById(id) as Promise<User>;
  }

  async changePassword(id: string, password: string): Promise<void> {
    const hashedPassword = await this.hashPassword(password);
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(id, { refreshToken });
  }

  // Helper for generic updates if strictly needed (e.g. from AuthService for refreshToken)
  async update(id: string, updateData: Partial<User>): Promise<User> {
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.password) {
      dataToUpdate.password = await this.hashPassword(dataToUpdate.password);
    }
    await this.usersRepository.update(id, dataToUpdate);
    const user = await this.findOneById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    // Get user to delete profile image if exists
    const user = await this.findOneById(id);
    if (user?.profileImage) {
      try {
        await this.storageService.delete(user.profileImage);
      } catch (error) {
        // Log but don't fail if image deletion fails
        console.warn(
          'Failed to delete profile image during user removal:',
          error.message,
        );
      }
    }
    await this.usersRepository.delete(id);
  }

  async uploadProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    // Get current user to delete old image
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      try {
        await this.storageService.delete(user.profileImage);
      } catch (error) {
        // Ignore errors when deleting old image (e.g., if it was a base64 URL or file doesn't exist)
        console.warn('Failed to delete old profile image:', error.message);
      }
    }

    // Upload new image
    const uploadResult = await this.storageService.upload(
      file,
      storageConfig.folders.profileImages,
    );

    // Update user with new image URL
    await this.usersRepository.update(userId, {
      profileImage: uploadResult.url,
    });

    return this.findOneById(userId) as Promise<User>;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
