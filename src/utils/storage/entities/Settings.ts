import { SETTINGS } from "../../../utils/constants";
import { Storable } from "../Storage";

export class Setting {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }

}

export class Settings extends Storable {
  settings: Setting[];

  constructor() {
    super(SETTINGS);
    this.settings = [];
  }

}