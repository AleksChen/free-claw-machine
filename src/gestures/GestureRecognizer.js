/**
 * Gesture States
 */
export const GESTURE = {
  OPEN: 'OPEN',
  FIST: 'FIST',
  UNKNOWN: 'UNKNOWN'
};

/**
 * GestureRecognizer Analyzes hand landmarks to identify gestures
 */
export class GestureRecognizer {
  constructor() {
    this.fistThreshold = 0.05; // Euclidean distance threshold for fist
  }

  /**
   * Identify gesture for a single hand
   */
  identify(landmarks) {
    if (!landmarks) return GESTURE.UNKNOWN;

    // A simple fist detection: check if finger tips are close to the palm base (wrist)
    // or if the average distance between thumb tip, index tip, middle tip, etc. to 
    // the palm center is small.
    
    // MediaPipe Hands Keypoints:
    // 0: WRIST
    // 5, 9, 13, 17: M_CP (Base of fingers)
    // 8, 12, 16, 20: TIPS
    
    // Checking distance between TIPS and corresponding M_CP
    const tipIndices = [8, 12, 16, 20];
    const baseIndices = [5, 9, 13, 17];
    
    let totalDist = 0;
    for (let i = 0; i < tipIndices.length; i++) {
        const tip = landmarks[tipIndices[i]];
        const base = landmarks[baseIndices[i]];
        
        const dist = Math.sqrt(
            Math.pow(tip.x - base.x, 2) + 
            Math.pow(tip.y - base.y, 2) + 
            Math.pow(tip.z - base.z, 2)
        );
        totalDist += dist;
    }
    
    const avgDist = totalDist / tipIndices.length;
    
    // If average distance is small, it's a fist
    if (avgDist < 0.08) { // Empirical value
        return GESTURE.FIST;
    } else {
        return GESTURE.OPEN;
    }
  }

  /**
   * Process multiple hands
   */
  process(multiHandLandmarks, multiHandedness) {
    const results = {
      Left: { gesture: GESTURE.UNKNOWN, position: null },
      Right: { gesture: GESTURE.UNKNOWN, position: null }
    };

    if (multiHandLandmarks) {
      multiHandLandmarks.forEach((landmarks, index) => {
        const label = multiHandedness[index].label; 
        // MediaPipe label can be 'Left' or 'Right'
        
        const gesture = this.identify(landmarks);
        
        // Use wrist or palm center for position
        const wrist = landmarks[0];
        const middleBase = landmarks[9];
        
        // Direction vector: from wrist to middle finger base
        // Normalize it to getting a pure orientation
        const dx = middleBase.x - wrist.x;
        const dy = middleBase.y - wrist.y;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        const direction = { x: dx / mag, y: dy / mag };

        const position = {
            x: (wrist.x + middleBase.x) / 2,
            y: (wrist.y + middleBase.y) / 2,
            z: (wrist.z + middleBase.z) / 2
        };

        results[label] = { gesture, position, direction };
      });
    }

    return results;
  }
}
