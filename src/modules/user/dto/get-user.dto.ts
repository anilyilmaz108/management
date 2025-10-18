import { IsString, IsEmail, IsInt, IsBoolean, Min, Max, IsOptional } from 'class-validator';
import { Post } from 'src/modules/post/entity/post.entity';

export class GetUserDto {
      @IsString()
      username: string;
        
      @IsEmail()
      email: string;
    
      @IsInt()
      @Min(0)
      age: number;
    
      @IsInt()
      role: number;
        
      @IsBoolean()
      isActive: boolean;

      @IsOptional()
      posts?: Post[];
}