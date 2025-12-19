import * as THREE from 'three';

/**
 * Prize Construct a simple prize/doll model
 */
export class Prize {
  constructor(color = 0xffaa00) {
    this.group = new THREE.Group();
    this.init(color);
  }

  init(color) {
    // A simple prize: a sphere with a cube "body"
    const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
    const headGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: color });

    const body = new THREE.Mesh(bodyGeo, material);
    body.castShadow = true;
    body.receiveShadow = true;
    
    const head = new THREE.Mesh(headGeo, material);
    head.position.y = 0.8;
    head.castShadow = true;
    
    this.group.add(body);
    this.group.add(head);
  }

  get model() {
    return this.group;
  }
}
