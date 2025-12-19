/**
 * CoordinateMapper Maps 2D normalized camera coordinates to 3D game coordinates
 */
export class CoordinateMapper {
  constructor(gameAreaWidth, gameAreaHeight) {
    this.gameAreaWidth = gameAreaWidth;
    this.gameAreaHeight = gameAreaHeight;
    this.smoothingFactor = 0.2; // Exponential smoothing
    
    this.currentPos = { x: 0, y: 0 };
  }

  /**
   * Map hand position to claw position
   * @param {Object} pos Normalized hand position {x, y, z} [0, 1]
   */
  mapToClaw(pos) {
    if (!pos) return this.currentPos;

    // Invert X because camera is mirrored
    // handX 0.0 is left of screen, 1.0 is right
    // clawX should be -width/2 to +width/2
    const targetX = (pos.x - 0.5) * this.gameAreaWidth * 2;
    
    // handY 0.0 is top, 1.0 is bottom
    // clawY (Z in 3D scene) should be -height/2 to +height/2
    const targetY = (pos.y - 0.5) * this.gameAreaHeight * 2;

    // Apply simple smoothing
    this.currentPos.x += (targetX - this.currentPos.x) * this.smoothingFactor;
    this.currentPos.y += (targetY - this.currentPos.y) * this.smoothingFactor;

    return { ...this.currentPos };
  }
}
