import * as CANNON from 'cannon-es';

/**
 * ClawPhysics Handles claw physics interaction (simplified)
 */
export class ClawPhysics {
  constructor(world, claw) {
    this.world = world;
    this.claw = claw;
    this.body = null;
    this.constraint = null;
    this.caughtPrize = null;
    
    this.init();
  }

  init() {
    // The claw itself is a kinematic-like body but we'll move it manually
    // However, we need a small collision body at the center of the claw base
    this.body = new CANNON.Body({
        mass: 0, // Static/Kinematic
        shape: new CANNON.Sphere(0.5),
        position: new CANNON.Vec3(0, 14, 0)
    });
    this.world.addBody(this.body);
  }

  update(x, y, z) {
    this.body.position.set(x, y, z);
    this.claw.updatePosition(x, z);
    this.claw.private_setHeight(y);
  }

  /**
   * Try to grab a prize near the claw
   */
  tryGrab(prizes) {
    if (this.caughtPrize) return;

    for (const prizeObj of prizes) {
        const dist = this.body.position.distanceTo(prizeObj.body.position);
        if (dist < 2.0) { // More forgiving radius
            this.grab(prizeObj);
            return true;
        }
    }
    return false;
  }

  grab(prizeObj) {
    this.caughtPrize = prizeObj;
    
    // Create a constraint to stick prize to claw
    this.constraint = new CANNON.LockConstraint(this.body, prizeObj.body);
    this.world.world.addConstraint(this.constraint);
    
    this.claw.close();
  }

  release() {
    if (this.caughtPrize) {
        this.world.world.removeConstraint(this.constraint);
        this.caughtPrize = null;
        this.constraint = null;
    }
    this.claw.open();
  }
}
