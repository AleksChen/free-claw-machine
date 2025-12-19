import { CameraManager } from './vision/CameraManager.js';
import { HandTracker } from './vision/HandTracker.js';
import { UIManager } from './ui/UIManager.js';
import { GameScene } from './scenes/GameScene.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { GameController } from './game/GameController.js';
import { GameState } from './game/GameState.js';
import { GestureRecognizer } from './gestures/GestureRecognizer.js';
import { CoordinateMapper } from './gestures/CoordinateMapper.js';
import { ClawMachine } from './models/ClawMachine.js';
import { Claw } from './models/Claw.js';
import { ClawPhysics } from './physics/ClawPhysics.js';
import { Prize } from './models/Prize.js';

class App {
  constructor() {
    this.ui = new UIManager();
    this.camera = null;
    this.handTracker = null;
    this.gestureRecognizer = new GestureRecognizer();
    this.coordMapper = new CoordinateMapper(6, 6); // Area width/height in 3D
    this.videoElement = document.getElementById('camera-video');
    
    this.scene = null;
    this.physics = null;
    this.controller = null;
    this.gameState = new GameState();
    
    this.lastTime = performance.now();
    this.frameCount = 0;
  }

  async init() {
    try {
      this.ui.setLoadingStatus('正在初始化 3D 场景...');
      const canvas = document.getElementById('game-canvas');
      this.scene = new GameScene(canvas);
      this.physics = new PhysicsWorld();

      // Load machine
      const machine = new ClawMachine();
      this.scene.add(machine.model);

      // Load claw
      const claw = new Claw();
      this.scene.add(claw.model);
      const clawPhysics = new ClawPhysics(this.physics, claw);

      // Setup controller
      this.controller = new GameController(this.scene, this.physics, clawPhysics, this.gameState, machine);
      
      // Spawn some prizes
      for (let i = 0; i < 15; i++) {
          const prize = new Prize();
          const pos = {
              x: (Math.random() - 0.5) * 8,
              y: 2 + Math.random() * 5,
              z: (Math.random() - 0.5) * 8
          };
          this.controller.addPrize(prize, pos);
      }

      // Bind events
      this.gameState.onScoreChange = (score) => this.ui.updateScore(score);
      this.gameState.onStatusChange = (status) => this.ui.setGameState(status);
      this.gameState.onActionChange = (action) => this.ui.setAction(action);

      // Camera & AI initialization
      this.ui.setLoadingStatus('正在启动摄像头...');
      this.camera = new CameraManager(this.videoElement);
      const video = await this.camera.initialize();
      this.ui.resizeCanvas(video);

      this.ui.setLoadingStatus('正在加载 AI 模型...');
      this.handTracker = new HandTracker();
      
      // Wait for MediaPipe to be loaded from index.html scripts
      const checkHandsLoaded = () => {
        return new Promise((resolve) => {
          const check = () => {
            if (typeof window.Hands !== 'undefined') {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      };
      
      await checkHandsLoaded();
      await this.handTracker.initialize();

      this.handTracker.onResults((results) => {
        this.onHandResults(results);
      });

      this.ui.hideLoading();
      this.ui.setGameState('READY');
      
      this.startLoop();
      
    } catch (error) {
      console.error('初始化失败:', error);
      this.ui.showError(error.message);
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  onHandResults(results) {
    this.ui.updateHandIndicators(results.multiHandedness || []);
    this.ui.drawHandMarkers(results);
    
    const gestureData = this.gestureRecognizer.process(
        results.multiHandLandmarks, 
        results.multiHandedness
    );
    
    // Mirror aware mapping:
    // Physical Left hand (detected as 'Right' by MediaPipe) controls movement
    const physicalLeftPos = gestureData.Right.position;
    const mappedPos = this.coordMapper.mapToClaw(physicalLeftPos);
    
    // Update game controller with all hand data
    this.controller.update(gestureData, mappedPos);
  }

  startLoop() {
    const loop = async (time) => {
      const dt = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // Update AI
      await this.handTracker.send(this.videoElement);
      
      // Update Physics
      this.physics.step(Math.min(dt, 0.1));
      
      // Update Scene
      this.scene.render();
      
      this.updateFPS();
      requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    // Use a separate timer for FPS reporting to UI to avoid jitter
    if (!this.lastFPSUpdate || now - this.lastFPSUpdate >= 1000) {
      this.ui.updateFPS(this.frameCount);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }
}

const app = new App();
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
