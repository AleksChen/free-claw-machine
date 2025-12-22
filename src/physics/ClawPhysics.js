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
    this.gripQuality = 0; // 0 to 1
    
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

  update(dt, x, y, z) {
    this.body.position.set(x, y, z);
    this.claw.updatePosition(x, z);
    this.claw.setHeight(y); // Updated method name
    this.claw.update(dt);   // Update animation
    
    // Simulate slip if holding something
    if (this.caughtPrize && this.constraint) {
        this.checkSlip(dt);
    }
  }

  checkSlip(dt) {
      // Slip logic:
      // Lower quality = higher chance to slip per second
      // Quality 1.0 = 0% chance
      // Quality 0.5 = 10% chance per second? -> 0.1 * dt
      
      // Cyberpunk "Glitch" Grip:
      // Randomly destabilize
      const slipChance = (1.0 - this.gripQuality) * 0.5 * dt; 
      
      if (Math.random() < slipChance) {
          console.log("Slip!", this.gripQuality);
          this.release();
      }
  }

  /**
   * Try to grab a prize near the claw
   */
  tryGrab(prizes) {
    if (this.caughtPrize) return;

    let bestPrize = null;
    let minDist = 999;

    for (const prizeObj of prizes) {
        const dist = this.body.position.distanceTo(prizeObj.body.position);
        if (dist < 1.5) { // Stricter radius (was 2.0)
            if (dist < minDist) {
                minDist = dist;
                bestPrize = prizeObj;
            }
        }
    }
    
    if (bestPrize) {
        // Calculate grip quality based on distance and alignment
        // Perfect grip at dist 0.
        // Penalty for distance
        let quality = Math.max(0, 1.0 - (minDist / 1.5));
        
        // Random factor (luck)
        quality *= (0.8 + Math.random() * 0.4); 
        this.gripQuality = Math.min(1.0, quality);
        
        console.log(`Grabbed! Dist: ${minDist.toFixed(2)}, Quality: ${this.gripQuality.toFixed(2)}`);
        
        // If quality is too low, don't even pick it up?
        // Or pick it up but drop immediately? 
        // Let's pick it up always if in range, but slip later (more dramatic)
        this.grab(bestPrize);
        return true;
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
        
        // Wake up the body so it falls naturally
        this.caughtPrize.body.wakeUp();
        this.caughtPrize.body.velocity.y -= 1; // Small push down
        
        this.caughtPrize = null;
        this.constraint = null;
    }
    this.claw.open();
  }
}
