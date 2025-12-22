/**
 * GameState Manages game scoring and life cycle
 */
export class GameState {
  constructor() {
    this.score = 0;
    this.status = 'READY'; // READY, MOVING, DESCENDING, GRABBING, ASCENDING, RELEASING
    this.onScoreChange = null;
    this.onStatusChange = null;
    this.onWin = null;
  }

  setScore(score) {
    this.score = score;
    if (this.onScoreChange) this.onScoreChange(this.score);
  }

  addScore(points) {
    this.setScore(this.score + points);
  }
  
  triggerWin(points) {
      this.addScore(points);
      if (this.onWin) this.onWin(points);
  }

  setStatus(status) {
    this.status = status;
    if (this.onStatusChange) this.onStatusChange(this.status);
  }

  setCurrentAction(action) {
    if (this.onActionChange) this.onActionChange(action);
  }
}
