import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('/user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  GetUsers() {
    return this.userService.getUsers();
  }

  @Post()
  CreateUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    console.log(createUserDto);

    return this.userService.createUser(createUserDto);
  }

  @Get('/:userId')
  GetUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUser(userId);
  }

  @Patch('/:userId')
  UpdateUser(
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.updateUser(updateUserDto, userId);
  }

  @Delete('/:userId')
  DeleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.deleteUser(userId);
  }
}
