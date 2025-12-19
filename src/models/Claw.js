import * as THREE from 'three';

/**
 * Claw Construct the 3D model of the moving claw
 */
export class Claw {
  constructor() {
    this.group = new THREE.Group();
    this.fingers = [];
    this.isOpen = true;
    this.init();
  }

  init() {
    // Base part
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    this.group.add(base);

    // Cable (The "wire" from top)
    const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 });
    this.cable = new THREE.Mesh(cableGeo, cableMat);
    this.cable.position.y = 0; // Will be scaled and positioned dynamically
    this.group.add(this.cable);

    // Fingers
    const fingerGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2);
    const fingerMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });

    for (let i = 0; i < 3; i++) {
      const fingerAnchor = new THREE.Group();
      const angle = (i / 3) * Math.PI * 2;
      
      const finger = new THREE.Mesh(fingerGeo, fingerMat);
      finger.position.y = -0.75;
      finger.position.z = 0.25; // Slightly more outward
      
      // Add a hinge at the end of the finger
      const hookGeo = new THREE.BoxGeometry(0.2, 0.5, 0.4);
      const hook = new THREE.Mesh(hookGeo, fingerMat);
      hook.position.y = -0.75;
      hook.position.z = 0.1;
      hook.rotation.x = -0.3;
      finger.add(hook);
      
      fingerAnchor.rotation.y = angle;
      fingerAnchor.add(finger);
      fingerAnchor.position.y = -0.5;
      
      this.group.add(fingerAnchor);
      this.fingers.push(fingerAnchor);
    }
  }

  /**
   * Set claw position (XY mapping to XZ in Three.js)
   */
  updatePosition(x, z) {
    this.group.position.x = x;
    this.group.position.z = z;
  }

  private_setHeight(y) {
    this.group.position.y = y;
    
    // Update cable height and position
    // Assume machine top is at height 15
    const machineTopY = 15;
    const cableLength = machineTopY - y;
    if (cableLength > 0) {
      this.cable.scale.y = cableLength;
      this.cable.position.y = cableLength / 2 + 0.5; // Offset to start from top of base
      this.cable.visible = true;
    } else {
      this.cable.visible = false;
    }
  }

  open() {
    this.isOpen = true;
    this.fingers.forEach(f => {
      // Rotate fingers outward
      f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -0.6, 0.1);
    });
  }

  close() {
    this.isOpen = false;
    this.fingers.forEach(f => {
      // Rotate fingers inward to grab
      f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, 0.4, 0.15);
    });
  }

  get model() {
    return this.group;
  }
}
