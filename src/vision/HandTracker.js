/**
 * HandTracker Integrates MediaPipe Hands for hand tracking
 */
export class HandTracker {
  constructor() {
    this.hands = null;
    this.onResultsCallback = null;
  }

  /**
   * Initialize MediaPipe Hands
   */
  async initialize() {
    console.log('正在初始化 MediaPipe Hands...');
    this.hands = new window.Hands({
      locateFile: (file) => {
        const path = `/mediapipe/hands/${file}`;
        console.log('加载资源:', path);
        return path;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults((results) => {
      try {
        if (this.onResultsCallback) {
          this.onResultsCallback(results);
        }
      } catch (err) {
        console.error('HandTracker 回调处理失败:', err);
      }
    });

    // We can't really "await" hands initialization as it's lazy,
    // but we can catch immediate construction errors.
  }

  /**
   * Start detection on a video frame
   */
  async send(videoElement) {
    if (this.hands) {
      await this.hands.send({ image: videoElement });
    }
  }

  /**
   * Register results callback
   */
  onResults(callback) {
    this.onResultsCallback = callback;
  }
}
