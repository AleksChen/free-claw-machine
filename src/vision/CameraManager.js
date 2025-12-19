/**
 * CameraManager Handles webcam stream acquisition and management
 */
export class CameraManager {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.stream = null;
  }

  /**
   * Initialize camera with optimal settings
   */
  async initialize() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持摄像头访问');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      this.videoElement.srcObject = this.stream;
      
      return new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve(this.videoElement);
        };
      });
    } catch (error) {
      console.error('摄像头初始化失败:', error);
      if (error.name === 'NotAllowedError') {
        throw new Error('请授予摄像头访问权限以进行游戏');
      }
      throw new Error('无法连接到摄像头: ' + error.message);
    }
  }

  /**
   * Stop camera stream
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
  }
}
