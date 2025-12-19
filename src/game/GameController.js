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
  }

  spawnPrizes(count) {
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];
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

  update(gestures, clawPos) {
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

          const speedFactor = 0.15;
          this.clawTargetX += tiltX * speedFactor;
          this.clawTargetZ += tiltZ * speedFactor;

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
      }

      // Bound checks (machine area is roughly -5 to 5)
      const limit = 5;
      this.clawTargetX = Math.max(-limit, Math.min(limit, this.clawTargetX));
      this.clawTargetZ = Math.max(-limit, Math.min(limit, this.clawTargetZ));
      
      this.clawPhysics.update(this.clawTargetX, this.clawY, this.clawTargetZ);
      
      // 2. Trigger grab if physical right hand makes a fist (Button press)
      const isFist = physicalRight.gesture === GESTURE.FIST;
      
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

    // Update Action Display (assuming controller has access to ui via some bridge or event, 
    // but here we might need to emit or the app class handles it)
    // Actually, App class calls controller.update, so we can return the action or use a callback.
    // For now, let's assume we want to update it here if possible or return it.
    // Looking at App.js, it doesn't seem to do anything with return value.
    // Let's add this.state.setCurrentAction if it exists, or update UIManager directly if we had a ref.
    // The GameState seems to be a good place.
    if (this.state.setCurrentAction) {
        this.state.setCurrentAction(currentAction);
    }

    // Handle game state transitions
    this.handleSequences();
  }

  async startGrabSequence() {
    this.state.setStatus('DESCENDING');
  }

  handleSequences() {
    if (this.state.status === 'DESCENDING') {
      this.clawPhysics.claw.open(); // Keep open while descending
      this.clawY -= 0.15;
      if (this.clawY <= 2) { // Hit bottom
        this.state.setStatus('GRABBING');
      }
      this.clawPhysics.update(this.clawTargetX, this.clawY, this.clawTargetZ);
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
    } else if (this.state.status === 'ASCENDING') {
      this.clawY += 0.15;
      if (this.clawY >= 14) {
        this.clawY = 14;
        this.state.setStatus('RETURNING');
      }
      this.clawPhysics.update(this.clawTargetX, this.clawY, this.clawTargetZ);
    } else if (this.state.status === 'RETURNING') {
      // Move to Exit position automatically
      const dx = this.exitPos.x - this.clawTargetX;
      const dz = this.exitPos.z - this.clawTargetZ;
      const dist = Math.sqrt(dx*dx + dz*dz);
      
      const moveSpeed = 0.15;
      if (dist > 0.1) {
          this.clawTargetX += (dx / dist) * moveSpeed;
          this.clawTargetZ += (dz / dist) * moveSpeed;
      } else {
          this.clawTargetX = this.exitPos.x;
          this.clawTargetZ = this.exitPos.z;
          this.state.setStatus('RELEASING');
      }
      this.clawPhysics.update(this.clawTargetX, this.clawY, this.clawTargetZ);
    } else if (this.state.status === 'RELEASING') {
      this.clawPhysics.claw.open(); // Open to release
      this.clawPhysics.release();
      
      // Score check
      if (this.clawPhysics.caughtPrize) {
          this.state.addScore(100);
      }
      
      if (!this._releaseTimer) {
        this._releaseTimer = setTimeout(() => {
            this.state.setStatus('READY');
            this._releaseTimer = null;
        }, 1000);
      }
    }
  }
}
