import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    await this.usersRepository.delete(id);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
