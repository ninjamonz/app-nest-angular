import { Transform, TransformFnParams } from 'class-transformer';
import { trim } from '../helpers/trim';

export function Trim() {
  return Transform((params: TransformFnParams) => {
    if (typeof params.value !== 'string') {
      return params.value;
    }
    return trim(params.value);
  });
}
