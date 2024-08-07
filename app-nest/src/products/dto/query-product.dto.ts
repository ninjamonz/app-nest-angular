import { IsIn, IsOptional } from 'class-validator';
import { CursorPaginationDto } from '../../_common/pagination/cursor-pagination.dto';

export class QueryProductDto extends CursorPaginationDto {
  // TODO
  // where, orderBy, groupBy, having, etc

  @IsIn(['true', 'false'])
  @IsOptional()
  archived?: 'true' | 'false';
}
