import { FormControl, FormGroup } from '@angular/forms';

export function checkboxAddControl(
  formGroup: FormGroup,
  options: any[],
  checkedOptions: any[]
): void {
  options.forEach((option) => {
    const isChecked = !!checkedOptions.find((checked) => checked.name === option.name);
    formGroup.addControl(option.name, new FormControl(isChecked));
  });
}

export function getCheckedCheckboxes(
  checkboxes: { [key: string]: boolean }
): string[] {
  return Object.keys(checkboxes).filter(key => checkboxes[key]);
}