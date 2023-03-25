import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { CreateBlogDto } from "./create-blog.dto";

export class UpdateBlogDto extends CreateBlogDto {}
