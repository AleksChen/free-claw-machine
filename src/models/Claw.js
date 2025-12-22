import * as THREE from 'three';

/**
 * Claw Construct the 3D model of the moving claw
 */
export class Claw {
  constructor() {
    this.group = new THREE.Group();
    this.fingers = [];
    this.targetRotation = -0.6; // Start open
    this.currentRotation = -0.6;
    
    this.init();
  }

  init() {
    // Base part - Dark metal with neon ring
    const baseGeo = new THREE.CylinderGeometry(0.6, 0.8, 1.2, 16);
    const baseMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        metalness: 0.9, 
        roughness: 0.2 
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    
    // Neon Ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.05, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00fff2 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    base.add(ring);
    
    this.group.add(base);

    // Cable (The "wire" from top) - Glowing tech cable
    const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
    const cableMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        emissive: 0x220022,
        metalness: 0.8 
    });
    this.cable = new THREE.Mesh(cableGeo, cableMat);
    this.cable.position.y = 0; 
    this.group.add(this.cable);

    // Fingers
    const fingerGeo = new THREE.BoxGeometry(0.25, 1.8, 0.15);
    const fingerMat = new THREE.MeshStandardMaterial({ 
        color: 0xff0055, 
        metalness: 0.8, 
        roughness: 0.2,
        emissive: 0x440011 
    });

    for (let i = 0; i < 3; i++) {
      const fingerAnchor = new THREE.Group();
      const angle = (i / 3) * Math.PI * 2;
      
      const finger = new THREE.Mesh(fingerGeo, fingerMat);
      finger.position.y = -0.9;
      finger.position.z = 0.35; 
      
      // Add a hinge/tip at the end
      const tipGeo = new THREE.ConeGeometry(0.15, 0.4, 16);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.y = -1.0;
      tip.rotation.x = Math.PI; // Point down
      finger.add(tip);
      
      fingerAnchor.rotation.y = angle;
      fingerAnchor.add(finger);
      fingerAnchor.position.y = -0.4;
      
      // Store the pivot point (the finger mesh itself handles the X rotation relative to anchor)
      finger.rotation.x = this.currentRotation;
      
      this.group.add(fingerAnchor);
      this.fingers.push(finger); // Store the moving part
    }
  }

  update(dt) {
    // Smoothly animate fingers
    const speed = 5.0;
    if (Math.abs(this.currentRotation - this.targetRotation) > 0.01) {
        // Simple lerp-like approach with dt
        const diff = this.targetRotation - this.currentRotation;
        this.currentRotation += diff * Math.min(dt * speed, 1.0);
        
        this.fingers.forEach(f => {
            f.rotation.x = this.currentRotation;
        });
    }
  }

  /**
   * Set claw position (XY mapping to XZ in Three.js)
   */
  updatePosition(x, z) {
    this.group.position.x = x;
    this.group.position.z = z;
  }

  setHeight(y) {
    this.group.position.y = y;
    
    // Update cable height and position
    // Assume machine top is at height 15
    const machineTopY = 15;
    const cableLength = Math.max(0, machineTopY - y);
    
    if (cableLength > 0) {
      this.cable.scale.y = cableLength;
      this.cable.position.y = cableLength / 2 + 0.6; 
      this.cable.visible = true;
    } else {
      this.cable.visible = false;
    }
  }

  open() {
    this.targetRotation = -0.6; // Outward
  }

  close() {
    this.targetRotation = 0.3; // Inward (grab)
  }

  get model() {
    return this.group;
  }
}

