import * as THREE from 'three';

/**
 * ClawMachine Construct the 3D model of the machine
 */
export class ClawMachine {
  constructor() {
    this.group = new THREE.Group();
    this.init();
  }

  init() {
    // Machine dimensions
    const width = 12;
    const height = 15;
    const depth = 12;
    const thickness = 0.5;

    // Floor
    const floorGeo = new THREE.BoxGeometry(width, thickness, depth);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -thickness / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Frame (Columns)
    const columnGeo = new THREE.BoxGeometry(thickness, height, thickness);
    const columnMat = new THREE.MeshStandardMaterial({ color: 0xea4335 });
    
    const positions = [
      [-width/2 + thickness/2, height/2, -depth/2 + thickness/2],
      [width/2 - thickness/2, height/2, -depth/2 + thickness/2],
      [-width/2 + thickness/2, height/2, depth/2 - thickness/2],
      [width/2 - thickness/2, height/2, depth/2 - thickness/2]
    ];

    positions.forEach(pos => {
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(...pos);
      col.castShadow = true;
      this.group.add(col);
    });

    // Top
    const topGeo = new THREE.BoxGeometry(width, thickness, depth);
    const top = new THREE.Mesh(topGeo, columnMat);
    top.position.y = height;
    top.castShadow = true;
    this.group.add(top);

    // Glass
    const glassGeo = new THREE.BoxGeometry(width - 0.1, height, depth - 0.1);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      roughness: 0,
      metalness: 0.1
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = height / 2;
    this.group.add(glass);

    // Output hole
    const holeGeo = new THREE.BoxGeometry(3, 0.1, 3);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(-width/2 + 2, 0.01, depth/2 - 2);
    this.group.add(hole);

    // Front Control Panel
    const panelGeo = new THREE.BoxGeometry(width, 1, 2);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 1.5, depth / 2 + 1);
    this.group.add(panel);

    // Joystick
    this.joystickBase = new THREE.Group();
    this.joystickBase.position.set(-2, 2, depth / 2 + 1);
    
    const baseGeo = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    this.joystickBase.add(baseMesh);

    this.joystickHandle = new THREE.Group();
    const stickGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1 });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.y = 0.75;
    this.joystickHandle.add(stick);

    const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.y = 1.5;
    this.joystickHandle.add(ball);
    
    this.joystickBase.add(this.joystickHandle);
    this.group.add(this.joystickBase);

    // Button
    this.buttonBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    this.buttonBase.position.set(2, 2, depth / 2 + 1);
    this.group.add(this.buttonBase);

    this.buttonTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xff4444 })
    );
    this.buttonTop.position.set(2, 2.2, depth / 2 + 1);
    this.group.add(this.buttonTop);
    this.buttonOriginalY = 2.2;

    // Drop Point Indicator (Shadow)
    const ringGeo = new THREE.RingGeometry(0.8, 1.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    this.shadowIndicator = new THREE.Mesh(ringGeo, ringMat);
    this.shadowIndicator.rotation.x = -Math.PI / 2;
    this.shadowIndicator.position.y = 0.05; // Slightly above floor
    this.group.add(this.shadowIndicator);
  }

  updateJoystick(x, z) {
      // Tilt the handle based on input (-1 to 1)
      this.joystickHandle.rotation.z = -x * 0.5;
      this.joystickHandle.rotation.x = z * 0.5;
  }

  updateShadowIndicator(x, z) {
      this.shadowIndicator.position.x = x;
      this.shadowIndicator.position.z = z;
  }

  setButtonPressed(pressed) {
      this.buttonTop.position.y = pressed ? this.buttonOriginalY - 0.15 : this.buttonOriginalY;
      this.buttonTop.material.emissive.setHex(pressed ? 0x330000 : 0x000000);
  }

  get model() {
    return this.group;
  }
}
