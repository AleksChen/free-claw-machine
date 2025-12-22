import * as CANNON from 'cannon-es';
import { GESTURE } from '../gestures/GestureRecognizer.js';
import { Prize } from '../models/Prize.js';

/**
 * GameController Orchestrates game flow and interactions
 */
export class GameController {
  constructor(scene, physics, clawPhysics, state, machine) {
    this.scene = scene;
    this.physics = physics;
    this.clawPhysics = clawPhysics;
    this.state = state;
    this.machine = machine;
    
    this.prizes = [];
    this.clawTargetX = 0;
    this.clawTargetZ = 0;
    this.clawY = 14;
    
    this.exitPos = { x: -3.5, z: 3.5 }; // Top-left output hole
    this.controlMode = 'XY'; // XY or DOWN
    this.isGrabbing = false;
    
    this.moveSpeed = 9.0; // Units per second
  }

  spawnPrizes(count) {
    // Neon colors for prizes
    const colors = [0xff0055, 0x00fff2, 0x9d00ff, 0xffff00, 0xffffff];
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 8;
        const z = (Math.random() - 0.5) * 8;
        const y = 3 + Math.random() * 4;
        
        const prize = new Prize(colors[i % colors.length]);
        this.addPrize(prize, { x, y, z });
    }
  }

  /**
   * Add a prize with physics
   */
  addPrize(prizeObj, position) {
    const body = this.physics.createBoxBody(1, 1, 1, 0.2, position);
    this.physics.addBody(body, prizeObj.model);
    this.scene.add(prizeObj.model);
    this.prizes.push({ model: prizeObj.model, body: body });
  }

  update(dt, gestures = {}, clawPos = {x: 0, z: 0}) {
    // Mapping following user requirements (Mirror aware):
    // Physical Right Hand (MediaPipe 'Left') -> GRAB / BUTTON
    // Physical Left Hand (MediaPipe 'Right') -> MOVEMENT / JOYSTICK
    
    const physicalRight = gestures.Left;
    const physicalLeft = gestures.Right;

    let currentAction = 'IDLE';

    // 1. Directional Movement via Palm Orientation (Physical Left hand)
    if (this.state.status === 'READY' || this.state.status === 'MOVING') {
      // Ensure claw is open when ready
      this.clawPhysics.claw.open();

      // Use palm direction for joystick tilt
      if (physicalLeft && physicalLeft.direction) {
          this.state.setStatus('MOVING'); // Switch to moving state if detecting input
          
          // Map direction to tilt. Camera is mirrored.
          // physicalLeft.direction.x: positive is right in camera
          // physicalLeft.direction.y: negative is up in camera
          
          // Fix mirroring: negate X
          let tiltX = -physicalLeft.direction.x * 2.0; 
          
          // Fix front/back bias: adjust neutral point. 
          // Neutral hand is roughly pointing slightly forward (y ~ -0.7)
          let tiltZ = (physicalLeft.direction.y + 0.7) * 2.0; 
          
          // Deadzone
          if (Math.abs(tiltX) < 0.25) tiltX = 0;
          if (Math.abs(tiltZ) < 0.25) tiltZ = 0;

          // Apply speed * dt
          this.clawTargetX += tiltX * this.moveSpeed * dt;
          this.clawTargetZ += tiltZ * this.moveSpeed * dt;

          // Determine action string for UI
          if (Math.abs(tiltX) > Math.abs(tiltZ)) {
              if (tiltX > 0.3) currentAction = 'RIGHT';
              else if (tiltX < -0.3) currentAction = 'LEFT';
          } else {
              if (tiltZ > 0.3) currentAction = 'BACKWARD';
              else if (tiltZ < -0.3) currentAction = 'FORWARD';
          }

          // Update Visuals
          if (this.machine) {
              this.machine.updateJoystick(tiltX, tiltZ);
              this.machine.updateShadowIndicator(this.clawTargetX, this.clawTargetZ);
          }
      } else {
           if (this.state.status === 'MOVING') this.state.setStatus('READY');
      }

      // Bound checks (machine area is roughly -5 to 5)
      const limit = 5;
      this.clawTargetX = Math.max(-limit, Math.min(limit, this.clawTargetX));
      this.clawTargetZ = Math.max(-limit, Math.min(limit, this.clawTargetZ));
      
      this.clawPhysics.update(dt, this.clawTargetX, this.clawY, this.clawTargetZ);
      
      // 2. Trigger grab if physical right hand makes a fist (Button press)
      const isFist = physicalRight && physicalRight.gesture === GESTURE.FIST;
      
      if (this.machine) {
          this.machine.setButtonPressed(isFist);
          
          if (isFist && this.state.status !== 'DESCENDING') {
            currentAction = 'GRAB';
            this.startGrabSequence();
          }
      }
    } else {
        // During auto-sequences, keeps the indicator visible
        currentAction = this.state.status;
        if (this.machine) {
            this.machine.updateJoystick(0, 0);
            this.machine.updateShadowIndicator(this.clawTargetX, this.clawTargetZ);
            this.machine.setButtonPressed(this.state.status === 'GRABBING');
        }
    }

    if (this.state.setCurrentAction) {
        this.state.setCurrentAction(currentAction);
    }

    // Handle game state transitions
    this.handleSequences(dt);
  }

  async startGrabSequence() {
    this.state.setStatus('DESCENDING');
  }

  handleSequences(dt) {
    const moveSpeed = this.moveSpeed * dt;
    const verticalSpeed = 8.0 * dt;

    if (this.state.status === 'DESCENDING') {
      this.clawPhysics.claw.open(); // Keep open while descending
      
      this.clawY -= verticalSpeed;
      if (this.clawY <= 2.5) { // Hit bottom (slightly higher to avoid clipping floor)
        this.clawY = 2.5;
        this.state.setStatus('GRABBING');
      }
      this.clawPhysics.update(dt, this.clawTargetX, this.clawY, this.clawTargetZ);
      
    } else if (this.state.status === 'GRABBING') {
      this.clawPhysics.claw.close(); // Close to grab
      
      // Pause for a moment, then ascend
      if (!this._grabTimer) {
        this._grabTimer = setTimeout(() => {
          this.clawPhysics.tryGrab(this.prizes);
          this.state.setStatus('ASCENDING');
          this._grabTimer = null;
        }, 800);
      }
      // Still update animation
      this.clawPhysics.update(dt, this.clawTargetX, this.clawY, this.clawTargetZ);

    } else if (this.state.status === 'ASCENDING') {
      this.clawY += verticalSpeed;
      if (this.clawY >= 14) {
        this.clawY = 14;
        this.state.setStatus('RETURNING');
      }
      this.clawPhysics.update(dt, this.clawTargetX, this.clawY, this.clawTargetZ);
      
    } else if (this.state.status === 'RETURNING') {
      // Move to Exit position automatically
      const dx = this.exitPos.x - this.clawTargetX;
      const dz = this.exitPos.z - this.clawTargetZ;
      const dist = Math.sqrt(dx*dx + dz*dz);
      
      // Use logic speed for XZ movement
      const returnSpeed = moveSpeed * 1.5; // Faster return
      
      if (dist > 0.1) {
          this.clawTargetX += (dx / dist) * returnSpeed;
          this.clawTargetZ += (dz / dist) * returnSpeed;
      } else {
          this.clawTargetX = this.exitPos.x;
          this.clawTargetZ = this.exitPos.z;
          this.state.setStatus('RELEASING');
      }
      this.clawPhysics.update(dt, this.clawTargetX, this.clawY, this.clawTargetZ);
      
    } else if (this.state.status === 'RELEASING') {
      this.clawPhysics.claw.open(); // Open to release
      
      // Check for win BEFORE release (to verify we brought it here)
      if (this.clawPhysics.caughtPrize) {
          // Double check position? Nah, if we are in RELEASING state and have a prize, we won.
          this.state.triggerWin(100);
      }
      
      this.clawPhysics.release();
      
      // Keep updating physics/animation
      this.clawPhysics.update(dt, this.clawTargetX, this.clawY, this.clawTargetZ);

      if (!this._releaseTimer) {
        this._releaseTimer = setTimeout(() => {
            this.state.setStatus('READY');
            this._releaseTimer = null;
        }, 1500);
      }
    }
  }
}
