export class Player {
  id: number;
  score = 0;
  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
