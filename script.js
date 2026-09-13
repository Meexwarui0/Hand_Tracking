const videoEl = document.getElementById('video');
const drawCanvas = document.getElementById('drawCanvas');
const handCanvas = document.getElementById('handCanvas');
const drawCtx = drawCanvas.getContext('2d');
const handCtx = handCanvas.getContext('2d');
const statusBadge = document.getElementById('statusBadge');
const loadingEl = document.getElementById('loading');
const clearBtn = document.getElementById('clearBtn');
const brushUpBtn = document.getElementById('brushSizeUp');
const brushDownBtn = document.getElementById('brushSizeDown');

const STAGE_W = 720, STAGE_H = 450;
drawCanvas.width = STAGE_W; drawCanvas.height = STAGE_H;
handCanvas.width = STAGE_W; handCanvas.height = STAGE_H;

const palette = [
  '#ff2bd6', 
  '#ff6a00', 
  '#f9f722', 
  '#39ff6a', 
  '#22e6ff', 
  '#7a5cff', 
  '#ff3b5c', 
  '#ffffff'  
];
const swatchSize = 26;
const swatchGap = 42;
const swatchX = STAGE_W - 34;
const swatchStartY = 50;

let currentColor = '#ff2bd6';
let brushSize = 7;
const eraserSize = 36;

let rightPinching = false;
let leftPinching = false;
let lastRightPoint = null;

let hoverSwatchIndex = -1;
let hoverStartTime = 0;
const HOVER_SELECT_MS = 400;


const SMOOTHING_ALPHA = 0.45;
let smoothedRightIndex = null;
let smoothedRightThumb = null;
let smoothedLeftIndex = null;
let smoothedLeftThumb = null;

function smooth(prev, curr, alpha) {
  if (!prev) return { x: curr.x, y: curr.y };
  return {
    x: prev.x + (curr.x - prev.x) * alpha,
    y: prev.y + (curr.y - prev.y) * alpha
  };
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function drawPalette(activeIndex) {
  palette.forEach((color, i) => {
    const cy = swatchStartY + i * swatchGap;
    const half = swatchSize / 2;
    handCtx.fillStyle = color;
    handCtx.fillRect(swatchX - half, cy - half, swatchSize, swatchSize);
    handCtx.lineWidth = (color === currentColor) ? 4 : 2;
    handCtx.strokeStyle = (i === activeIndex) ? '#f9f722' : '#000000';
    handCtx.strokeRect(swatchX - half, cy - half, swatchSize, swatchSize);
    if (color === currentColor) {
      handCtx.strokeStyle = '#ffffff';
      handCtx.lineWidth = 1;
      handCtx.strokeRect(swatchX - half - 3, cy - half - 3, swatchSize + 6, swatchSize + 6);
    }
  });
}

function checkSwatchHover(px, py) {
  const half = swatchSize / 2 + 6;
  for (let i = 0; i < palette.length; i++) {
    const cy = swatchStartY + i * swatchGap;
    if (Math.abs(px - swatchX) < half && Math.abs(py - cy) < half) return i;
  }
  return -1;
}

function setStatus(text) {
  statusBadge.textContent = text;
}


let strokePoints = [];

function beginStroke(pt) {
  strokePoints = [pt];
}

function extendStroke(pt, color, size) {
  strokePoints.push(pt);
  if (strokePoints.length < 3) return;
  const len = strokePoints.length;
  const p0 = strokePoints[len - 3];
  const p1 = strokePoints[len - 2];
  const p2 = strokePoints[len - 1];
  const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
  const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

  drawCtx.strokeStyle = color;
  drawCtx.lineWidth = size;
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.shadowColor = color;
  drawCtx.shadowBlur = 6;
  drawCtx.beginPath();
  drawCtx.moveTo(mid1.x, mid1.y);
  drawCtx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
  drawCtx.stroke();
  drawCtx.shadowBlur = 0;

  if (strokePoints.length > 4) strokePoints.shift();
}

function endStroke() {
  strokePoints = [];
}


const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6,
  selfieMode: true
});

hands.onResults(onResults);

function onResults(results) {
  handCtx.clearRect(0, 0, STAGE_W, STAGE_H);

  let rightHand = null;
  let leftHand = null;

  if (results.multiHandLandmarks && results.multiHandedness) {
    results.multiHandLandmarks.forEach((landmarks, i) => {
      const label = results.multiHandedness[i].label;
      if (label === 'Right') rightHand = landmarks;
      else leftHand = landmarks;
    });
  }


  if (rightHand) {
    const rawThumb = { x: rightHand[4].x * STAGE_W, y: rightHand[4].y * STAGE_H };
    const rawIndex = { x: rightHand[8].x * STAGE_W, y: rightHand[8].y * STAGE_H };

    smoothedRightThumb = smooth(smoothedRightThumb, rawThumb, SMOOTHING_ALPHA);
    smoothedRightIndex = smooth(smoothedRightIndex, rawIndex, SMOOTHING_ALPHA);

    const tx = smoothedRightThumb.x, ty = smoothedRightThumb.y;
    const ix = smoothedRightIndex.x, iy = smoothedRightIndex.y;
    const pinchDist = dist(tx, ty, ix, iy);
    const pinchThreshold = 34;

    const wasPinching = rightPinching;
    rightPinching = pinchDist < pinchThreshold;

    const swatchIdx = checkSwatchHover(ix, iy);
    if (swatchIdx !== -1) {
      if (swatchIdx === hoverSwatchIndex) {
        if (Date.now() - hoverStartTime > HOVER_SELECT_MS) {
          currentColor = palette[swatchIdx];
        }
      } else {
        hoverSwatchIndex = swatchIdx;
        hoverStartTime = Date.now();
      }
    } else {
      hoverSwatchIndex = -1;
    }

    if (rightPinching && swatchIdx === -1) {
      if (!wasPinching || !lastRightPoint) {
        beginStroke({ x: ix, y: iy });
      } else {
        extendStroke({ x: ix, y: iy }, currentColor, brushSize);
      }
      lastRightPoint = { x: ix, y: iy };
    } else {
      endStroke();
      lastRightPoint = null;
    }

    handCtx.beginPath();
    handCtx.arc(ix, iy, 9, 0, Math.PI * 2);
    handCtx.fillStyle = rightPinching ? currentColor : 'rgba(249,247,34,0.85)';
    handCtx.fill();
    handCtx.lineWidth = 2;
    handCtx.strokeStyle = '#000';
    handCtx.stroke();
    handCtx.beginPath();
    handCtx.arc(tx, ty, 6, 0, Math.PI * 2);
    handCtx.fillStyle = 'rgba(255,255,255,0.7)';
    handCtx.fill();
  } else {
    endStroke();
    lastRightPoint = null;
    rightPinching = false;
    hoverSwatchIndex = -1;
    smoothedRightIndex = null;
    smoothedRightThumb = null;
  }


  if (leftHand) {
    const rawThumb = { x: leftHand[4].x * STAGE_W, y: leftHand[4].y * STAGE_H };
    const rawIndex = { x: leftHand[8].x * STAGE_W, y: leftHand[8].y * STAGE_H };

    smoothedLeftThumb = smooth(smoothedLeftThumb, rawThumb, SMOOTHING_ALPHA);
    smoothedLeftIndex = smooth(smoothedLeftIndex, rawIndex, SMOOTHING_ALPHA);

    const tx = smoothedLeftThumb.x, ty = smoothedLeftThumb.y;
    const ix = smoothedLeftIndex.x, iy = smoothedLeftIndex.y;
    const pinchDist = dist(tx, ty, ix, iy);
    leftPinching = pinchDist < 34;

    const midX = (tx + ix) / 2;
    const midY = (ty + iy) / 2;

    if (leftPinching) {
      drawCtx.save();
      drawCtx.globalCompositeOperation = 'destination-out';
      drawCtx.beginPath();
      drawCtx.arc(midX, midY, eraserSize / 2, 0, Math.PI * 2);
      drawCtx.fill();
      drawCtx.restore();
    }

    handCtx.beginPath();
    handCtx.arc(midX, midY, eraserSize / 2, 0, Math.PI * 2);
    handCtx.strokeStyle = leftPinching ? '#ff2bd6' : 'rgba(255,255,255,0.75)';
    handCtx.lineWidth = 2.5;
    handCtx.stroke();
  } else {
    leftPinching = false;
    smoothedLeftIndex = null;
    smoothedLeftThumb = null;
  }

  drawPalette(hoverSwatchIndex);

  let modeText = [];
  if (rightHand) modeText.push(rightPinching ? 'DRAWING' : 'R-HAND READY');
  if (leftHand) modeText.push(leftPinching ? 'ERASING' : 'L-HAND READY');
  if (modeText.length === 0) modeText.push('SHOW YOUR HAND');
  setStatus(modeText.join('  /  '));
}


const camera = new Camera(videoEl, {
  onFrame: async () => {
    await hands.send({ image: videoEl });
  },
  width: STAGE_W,
  height: STAGE_H
});

camera.start()
  .then(() => {
    loadingEl.style.display = 'none';
  })
  .catch((err) => {
    loadingEl.innerHTML = 'ไม่สามารถเข้าถึงกล้องได้<br/>กรุณาอนุญาตกล้องแล้วรีเฟรชหน้านี้<br/><small>' + err.message + '</small>';
  });


clearBtn.addEventListener('click', () => {
  drawCtx.clearRect(0, 0, STAGE_W, STAGE_H);
});
brushUpBtn.addEventListener('click', () => {
  brushSize = Math.min(30, brushSize + 2);
});
brushDownBtn.addEventListener('click', () => {
  brushSize = Math.max(2, brushSize - 2);
});