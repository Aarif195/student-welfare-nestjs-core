import { PartialType } from '@nestjs/swagger';
import { CreateStudySpaceDto } from './create-study-space.dto';

export class UpdateStudySpaceDto extends PartialType(CreateStudySpaceDto) {}