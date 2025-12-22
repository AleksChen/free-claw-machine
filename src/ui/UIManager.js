/**
 * UIManager Manages DOM elements and UI state
 */
export class UIManager {
  constructor() {
    this.elements = {
      loading: document.getElementById("loading"),
      loadingStatus: document.getElementById("loading-status"),
      error: document.getElementById("error"),
      errorMessage: document.getElementById("error-message"),
      gameState: document.getElementById("game-state"),
      score: document.getElementById("score"),
      fps: document.getElementById("fps"),
      leftHandIndicator: document.getElementById("left-hand"),
      rightHandIndicator: document.getElementById("right-hand"),
      cameraCanvas: document.getElementById("camera-canvas"),
      currentAction: document.getElementById("current-action"),
      winOverlay: document.getElementById("win-overlay"),
      winScore: document.getElementById("win-score"),
    };

    this.canvasCtx = this.elements.cameraCanvas.getContext("2d");
  }

  setLoadingStatus(message) {
    this.elements.loadingStatus.textContent = message;
  }

  hideLoading() {
    this.elements.loading.style.display = "none";
  }

  showError(message) {
    this.elements.error.style.display = "flex";
    this.elements.errorMessage.textContent = message;
    this.elements.loading.style.display = "none";
  }

  showWin(score) {
    this.elements.winScore.textContent = `+${score} 分`;
    this.elements.winOverlay.style.display = "flex";

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.elements.winOverlay.style.display = "none";
    }, 3000);
  }

  setGameState(state) {
    this.elements.gameState.textContent = state;
  }

  setAction(action) {
    const actionMap = {
      FORWARD: "FORWARD",
      BACKWARD: "BACKWARD",
      LEFT: "LEFT",
      RIGHT: "RIGHT",
      GRAB: "GRAB!",
      DESCENDING: "DROP",
      ASCENDING: "LIFT",
      RETURNING: "RETURN",
      RELEASING: "RELEASE",
      READY: "READY",
      IDLE: "IDLE",
    };
    this.elements.currentAction.textContent = actionMap[action] || action;

    // Add pulse animation on change
    this.elements.currentAction.classList.remove("pulse-once");
    void this.elements.currentAction.offsetWidth; // trigger reflow
    this.elements.currentAction.classList.add("pulse-once");
  }

  updateScore(score) {
    this.elements.score.textContent = score;
    // Add animation for score change
    this.elements.score.style.transform = "scale(1.5)";
    this.elements.score.style.color = "#fff";
    setTimeout(() => {
      this.elements.score.style.transform = "scale(1)";
      this.elements.score.style.color = "#ffd700";
    }, 200);
  }

  updateFPS(fps) {
    this.elements.fps.textContent = fps;
  }

  updateHandIndicators(hands) {
    // Mirror aware:
    // MediaPipe 'Right' label is User's Physical Left
    // MediaPipe 'Left' label is User's Physical Right
    const hasPhysicalLeft = hands.some((h) => h.label === "Right");
    const hasPhysicalRight = hands.some((h) => h.label === "Left");

    this.elements.leftHandIndicator.classList.toggle("active", hasPhysicalLeft);
    this.elements.rightHandIndicator.classList.toggle(
      "active",
      hasPhysicalRight
    );
  }

  drawHandMarkers(results) {
    const { width, height } = this.elements.cameraCanvas;
    this.canvasCtx.clearRect(0, 0, width, height);

    if (results.multiHandLandmarks) {
      // Define hand connections (skeletal structure)
      const connections = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4], // Thumb
        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8], // Index
        [0, 9],
        [9, 10],
        [10, 11],
        [11, 12], // Middle
        [0, 13],
        [13, 14],
        [14, 15],
        [15, 16], // Ring
        [0, 17],
        [17, 18],
        [18, 19],
        [19, 20], // Pinky
        [5, 9],
        [9, 13],
        [13, 17], // Palm base
      ];

      results.multiHandLandmarks.forEach((landmarks, index) => {
        const isRightHand = results.multiHandedness[index].label === "Right";
        // Neon Colors: Physical Left (Right Label) = Magenta, Physical Right (Left Label) = Cyan
        const color = isRightHand ? "#FF00FF" : "#00FFF2";

        // 1. Draw connections (skeleton lines)
        this.canvasCtx.strokeStyle = color;
        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.lineCap = "round";
        this.canvasCtx.shadowColor = color;
        this.canvasCtx.shadowBlur = 10;

        connections.forEach(([i, j]) => {
          const start = landmarks[i];
          const end = landmarks[j];
          this.canvasCtx.beginPath();
          this.canvasCtx.moveTo(start.x * width, start.y * height);
          this.canvasCtx.lineTo(end.x * width, end.y * height);
          this.canvasCtx.stroke();
        });

        this.canvasCtx.shadowBlur = 0; // Reset for dots

        // 2. Draw joints (landmarks)
        for (const landmark of landmarks) {
          const x = landmark.x * width;
          const y = landmark.y * height;

          this.canvasCtx.fillStyle = "#FFFFFF";
          this.canvasCtx.beginPath();
          this.canvasCtx.arc(x, y, 3, 0, 2 * Math.PI);
          this.canvasCtx.fill();
        }
      });
    }
  }

  resizeCanvas(video) {
    this.elements.cameraCanvas.width = video.videoWidth;
    this.elements.cameraCanvas.height = video.videoHeight;
  }
}
