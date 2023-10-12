import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Get('init')
  async initData() {
    await this.userService.initData();
    return 'success';
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const _user = await this.userService.login(loginDto);
    const _token = this.jwtService.sign({
      user: { username: _user.username, roles: _user.roles },
    });
    return _token;
  }
}
