import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async getUsers(): Promise<User[]> {
    const data = await this.usersRepository.find();
    console.log(/data/, data);

    return data;
  }
  createUser(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }
  async getUser(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }
  async updateUser(updateUserDto: UpdateUserDto, id: number) {
    return await this.usersRepository.update(id, updateUserDto);
  }
  async deleteUser(userId: number) {
    return await this.usersRepository.delete(userId);
  }
  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } }); //we can use findOneBy also
  }
}
