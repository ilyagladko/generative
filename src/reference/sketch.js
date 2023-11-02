// generative art machine
// copyright graham 2020
// https://grahammak.es

// todo: common sizes
// 1334x750 is iphone 6 hidpi

let THEMES;
let TEMPLATES;
let userTheme = "faroe";
let userTemplate = "flock of birds";
const HEIGHT_MAX = 2160; // height needed for 4k resolution
const HEIGHT_MIN = 32;
const WIDTH_MIN = 32;
const WRAPPER_EL = "macheen";
const CANVAS_EL = "canvasWrapper";
let canvasEl;

const pageColumnWidth = 500;

const defaultTemplate = {
  rows: 3,
  columns: 3,
  oldWonk: false,
  wonkSegments: 0,
  wonkFactor: 0,
  fillOpacity: 140,
  strokeOpacity: 0,
  strokeWeight: 0,
  wipeOpacity: 0,
  maxFrames: 20,
  features: {}
};

const defaultFeatures = {
  borderCross: {
    x: false,
    y: false,
    amt: 0,
    pct: 0
  },
  gridLoopTransform: {
    matrix: null
  },
  drawLoopTransform: {
    matrix: null
  }
};

let renderButton;
function handleRenderButtonClick() {
  initCanvas();
}

let themeSelect;
function handleThemeSelectChange() {
  userTheme = themeSelect.value();
  this.theme = THEMES[userTheme];
  loadTheme();
  initCanvas();
}

let templateSelect;
function handleTemplateSelectChange() {
  userTemplate = templateSelect.value();
  this.template = TEMPLATES[userTemplate];
  loadTemplate();
  initCanvas();
}

let widthInput;
let heightInput;
function handleInputChange() {
  noLoop();
  const w = widthInput.value();
  const h = heightInput.value();
  this.setDimensions(w, h);
  resizeCanvas(w, h);
  initCanvas();
}

let counter;

function preload() {
  THEMES = loadJSON("./themes.json");
  TEMPLATES = loadJSON("./templates.json");
}

function setup() {
  this.setDimensions = function (w = pageColumnWidth, h = 400) {
    this.canvasWidth = restrict(w, WIDTH_MIN, this.innerWidth);
    console.log(w, WIDTH_MIN, this.innerWidth, this.canvasWidth);
    this.canvasHeight = restrict(h, HEIGHT_MIN, HEIGHT_MAX);
    const pageColumnOffset =
      this.innerWidth < pageColumnWidth ? this.innerWidth : pageColumnWidth;
    if (!canvasEl) {
      canvasEl = document.getElementById(CANVAS_EL);
    }
    canvasEl.style.transform = `translateX(calc(-50% + ${
      pageColumnOffset / 2
    }px))`;
  };
  this.setDimensions();

  loadTheme();
  loadTemplate();
  const cnv = createCanvas(this.canvasWidth, this.canvasHeight);
  cnv.parent(CANVAS_EL); // id of div
  frameRate(1000);
  initCanvas();

  // set up controls
  initControls();
}

function initCanvas() {
  counter = 0;
  const c = color(this.theme.wipe);
  c.setAlpha(255);
  background(c);
  loop();
}

function initControls() {
  // CANVAS STYLING
  const rowWrapper = createDiv();
  rowWrapper.parent("controlsContainer");
  rowWrapper.addClass("controlRow");

  // theme
  const themeSelectWrapper = createSpan();
  themeSelectWrapper.parent(rowWrapper);

  const themeLabel = createElement("label", "theme:");
  themeLabel.parent(themeSelectWrapper);

  themeSelect = createSelect();
  Object.keys(THEMES).forEach((t) => themeSelect.option(t));
  themeSelect.changed(handleThemeSelectChange.bind(this));
  themeSelect.selected(userTheme);
  themeSelect.parent(themeSelectWrapper);

  // template
  const templateSelectWrapper = createSpan();
  templateSelectWrapper.parent(rowWrapper);

  const templateLabel = createElement("label", "template:");
  templateLabel.parent(templateSelectWrapper);

  templateSelect = createSelect();
  Object.keys(TEMPLATES).forEach((t) => templateSelect.option(t));
  templateSelect.changed(handleTemplateSelectChange.bind(this));
  templateSelect.selected(userTemplate);
  templateSelect.parent(templateSelectWrapper);

  // CANVAS DIMENSIONS
  const canvasWrapper = createDiv();
  canvasWrapper.parent("controlsContainer");
  canvasWrapper.addClass("controlRow");

  // width
  const widthWrapper = createSpan();
  widthWrapper.parent(canvasWrapper);

  const widthLabel = createElement("label", "width:");
  widthLabel.parent(widthWrapper);

  widthInput = createInput(`${this.canvasWidth}`);
  widthInput.attribute("type", "number");
  widthInput.input(handleInputChange.bind(this));
  widthInput.parent(widthWrapper);

  // height
  const heightWrapper = createSpan();
  heightWrapper.parent(canvasWrapper);

  const heightLabel = createElement("label", "height:");
  heightLabel.parent(heightWrapper);

  heightInput = createInput(`${this.canvasHeight}`);
  heightInput.attribute("type", "number");
  heightInput.input(handleInputChange.bind(this));
  heightInput.parent(heightWrapper);

  // BUTTONS
  // re-render
  renderButton = createButton("render");
  renderButton.mousePressed(handleRenderButtonClick);
  renderButton.addClass("controlButton");
  renderButton.parent("controlsContainer");
}

function loadTheme() {
  this.theme = THEMES[userTheme];
  console.log(userTheme);
}

function loadTemplate() {
  const t = Object.assign({}, defaultTemplate, TEMPLATES[userTemplate]);
  const allFeatures = Object.keys(defaultFeatures);
  allFeatures.map(
    (f) =>
      (t.features[f] = Object.assign({}, defaultFeatures[f], t.features[f]))
  );
  this.template = t;
}

function draw() {
  if (this.template.maxFrames > 0 && counter > this.template.maxFrames - 1) {
    return noLoop();
  }
  let wonkOptions = [
    this.template.wonkSegments, // current wonkSegments
    this.template.wonkFactor // current wonkFactor
  ];

  if (this.template.features.drawLoopTransform.matrices) {
    const selectedMatrix = random(
      this.template.features.drawLoopTransform.matrices
    );
    applyMatrix(...selectedMatrix);
  }

  for (let r = 0; r < this.template.rows; r++) {
    for (let c = 0; c < this.template.columns; c++) {
      const p1 = getRandPoint(
        this.canvasWidth / this.template.columns,
        this.canvasHeight / this.template.rows
      );
      const p2 = getRandPoint(
        this.canvasWidth / this.template.columns,
        this.canvasHeight / this.template.rows
      );
      if (this.template.features.gridLoopTransform.matrices) {
        const selectedMatrix = random(
          this.template.features.gridLoopTransform.matrices
        );
        applyMatrix(...selectedMatrix);
      }
      drawRectLayer(p1, p2, wonkOptions);

      translate(this.canvasWidth / this.template.columns, 0);
    }
    translate(-this.canvasWidth, this.canvasHeight / this.template.rows);
  }

  const wipe = color(this.theme.wipe);

  if (this.template.wipeOpacity) {
    wipe.setAlpha(this.template.wipeOpacity);
  }
  background(wipe);
  if (counter === 360) {
    counter = 0;
  }
  counter++;
}

// draw funcs

function drawWonkyLine(p1, p2, numPoints, wonkFactor) {
  const points = getWonkyLinePoints(p1, p2, numPoints, wonkFactor);

  points.forEach((p, i, a) => {
    if (i === a.length - 1) {
      return;
    }
    line(p.x, p.y, a[i + 1].x, a[i + 1].y);
  });
}

function getWonkyLinePoints(p1, p2, numPoints = 2, wonkFactor = 0) {
  let points = [];
  let init = 1;
  if (this.template.oldWonk) {
    init = 0;
  } else {
    points.push(p1);
  }
  for (let i = init; i < numPoints; i++) {
    let l1 = lerp(p1.x, p2.x, mapToOne(i, numPoints));
    let l2 = lerp(p1.y, p2.y, mapToOne(i, numPoints));
    points.push({
      x: l1 + random(wonkFactor) * random([1, -1]),
      y: l2 + random(wonkFactor) * random([1, -1])
    });
  }

  points.push(p2);

  return points;
}

function drawWonkyRect(p1, p2, wonkyLineArgs = []) {
  const points = {
    a: p1,
    b: {
      x: p1.x,
      y: p2.y
    },
    c: p2,
    d: {
      x: p2.x,
      y: p1.y
    }
  };

  const lineSegments = [
    getWonkyLinePoints(points.a, points.b, ...wonkyLineArgs),
    getWonkyLinePoints(points.b, points.c, ...wonkyLineArgs),
    getWonkyLinePoints(points.c, points.d, ...wonkyLineArgs),
    getWonkyLinePoints(points.d, points.a, ...wonkyLineArgs)
  ];

  if (this.template.oldWonk) {
    lineSegments.forEach((s) => s.pop());
  }

  const shapePoints = [
    ...lineSegments[0],
    ...lineSegments[1],
    ...lineSegments[2],
    ...lineSegments[3]
  ];

  // create a polygon from the points
  beginShape();
  shapePoints.forEach((p) => vertex(p.x, p.y));
  endShape();
}

function drawRectLayer(p1, p2, wonkOptions) {
  const c = color(getRandomColor());
  c.setAlpha(this.template.fillOpacity);
  fill(c);
  c.setAlpha(this.template.strokeOpacity);
  stroke(c);

  if (this.template.strokeWeight) {
    strokeWeight(this.template.strokeWeight);
  }

  let point1 = p1;
  let point2 = p2;

  // aleatorically apply each borderCross enlargement to one of the points
  if (
    this.template.features.borderCross.x &&
    random(100) > 100 - this.template.features.borderCross.pct
  ) {
    if (random(2) > 1) {
      point1 = borderCross(p1, "x");
    } else {
      point2 = borderCross(p2, "x");
    }
  }
  if (
    this.template.features.borderCross.y &&
    random(100) > 100 - this.template.features.borderCross.pct
  ) {
    if (random(2) > 1) {
      point1 = borderCross(p1, "y");
    } else {
      point2 = borderCross(p2, "y");
    }
  }

  drawWonkyRect(point1, point2, wonkOptions);
}

// features

function borderCross(p, axis) {
  const coeff = random([1, -1]);
  const mutation = random(this.template.features.borderCross.amt) * coeff;

  return Object.assign({}, p, {
    [axis]: p[axis] + mutation
  });
}

// utils

function getRandomColor() {
  return random(this.theme.colors);
}

function mapToOne(value, range) {
  return map(value, 0, range, 0, 1);
}

function getRandPoint(xMax, yMax) {
  return {
    x: random(xMax),
    y: random(yMax)
  };
}

function restrict(val, min, max) {
  let newVal = val;
  if (min && val < min) newVal = min;
  else if (max && val > max) newVal = max;
  return newVal;
}
