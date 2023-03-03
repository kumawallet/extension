import BaseEntity from "./BaseEntity";

export default class BackUp extends BaseEntity {
  data: string | undefined;

  constructor(data: string | undefined) {
    super();
    this.data = data;
  }

  static async init() {
    await BackUp.set(new BackUp(undefined));
  }
}
