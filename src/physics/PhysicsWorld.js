import * as CANNON from 'cannon-es';

/**
 * PhysicsWorld Manages Cannon.js world and synchronization
 */
export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // Typical earth gravity
    
    // Add ground
    const groundMat = new CANNON.Material('ground');
    const groundBody = new CANNON.Body({
      mass: 0, // static
      shape: new CANNON.Plane(),
      material: groundMat
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    this.bodiesToSync = [];
  }

  addBody(body, mesh = null) {
    this.world.addBody(body);
    if (mesh) {
      this.bodiesToSync.push({ body, mesh });
    }
  }

  step(dt) {
    this.world.step(dt);
    
    // Sync mesh positions and quaternions
    for (const item of this.bodiesToSync) {
      item.mesh.position.copy(item.body.position);
      item.mesh.quaternion.copy(item.body.quaternion);
    }
  }

  createBoxBody(width, height, depth, mass, position) {
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = new CANNON.Body({
      mass: mass,
      shape: shape,
      position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    return body;
  }

  createSphereBody(radius, mass, position) {
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass: mass,
      shape: shape,
      position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    return body;
  }
}
