import {
  Get,
  Post,
  Body,
  Session,
  HttpCode,
  UseGuards,
  Controller,
  BadRequestException
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup-dto';
import { SignInDto } from './dtos/signin-dto';
import { UserDto } from 'src/user/dtos/user-dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';
import { currentUser } from './decorators/current-user.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('/signup')
  async register(@Body() body: SignUpDto, @Session() Session: any) {
    if (body.password !== body.password_confirm)
      throw new BadRequestException('Passwords do not match!');

    const user = await this.userService.register(body.firstname, body.lastname, body.email, body.password);
    Session.userId = user.user_id;
    return user;
  }

  @Post('/signin')
  @HttpCode(200)
  async signin(@Body() body: SignInDto, @Session() Session: any) {
    const user = await this.userService.login(body.email, body.password);
    Session.userId = user.user_id;
    return user;
  }

  @Get('/whoami')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  whoami(@currentUser() user: User) {
    return user;
  }

  @Post('/signout')
  @HttpCode(204)
  signout(@Session() Session: any) {
    Session.userId = null;
  }
}
