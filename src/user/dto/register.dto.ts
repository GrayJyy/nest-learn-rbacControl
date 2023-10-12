import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 18)
  password: string;
}
