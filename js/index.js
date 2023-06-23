//////////// pg on클래스 기능 ////////////
const sections = document.querySelectorAll(".section");
const pgLinks = document.querySelectorAll(".pg > a");
const sec3Section = document.querySelector("#sec3");
const sec3Pg = document.querySelector(".sec3Pg");

if (window.innerWidth > 600) {
  window.addEventListener("resize", () => {
    console.log("리사이즈");
    setTimeout(() => {
      location.reload();
      console.log("1초 지남");
    }, 1000);
  });
}

//////////// 툭툭 떨어지게 만드는 모션 (600이상에서(pc화면)) ////////////
if (window.innerWidth > 600) {
  sections.forEach((section) => {
    section.addEventListener("mousewheel", (e) => {
      e.preventDefault();
      const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
      const nextSection =
        delta < 0 ? section.nextElementSibling : section.previousElementSibling;

      // .aboutModalWrap 요소와 .pjModalWrap 요소에 on 클래스가 없을 때만 실행
      if (
        !aboutModal.classList.contains("on") &&
        !Array.from(pjModal).some((modal) => modal.classList.contains("on")) &&
        nextSection
      ) {
        const moveTop =
          window.pageYOffset + nextSection.getBoundingClientRect().top;
        window.scrollTo({ top: moveTop, left: 0, behavior: "smooth" });
      }
    });
  });
}

pgLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = document.querySelector(link.getAttribute("href"));
    const moveTop = section.offsetTop;
    window.scrollTo({ top: moveTop, left: 0, behavior: "smooth" });
    pgLinks.forEach((a) => {
      a.classList.remove("on");
    });
    link.classList.add("on");

    // sec3Pg에 "on" 클래스가 있는지 확인합니다.
    if (sec3Pg.classList.contains("on")) {
      sec3Section.classList.add("view");
    } else {
      sec3Section.classList.remove("view");
    }
  });
});

// pagenation을 클릭하는게 아니라 스크롤로 내렸을때
// 해당 section에 맞는 page nation에 on 클래스가 붙게하는 기능
if (window.innerWidth > 600) {
  window.addEventListener("scroll", (e) => {
    e.preventDefault();

    const scrollTop = window.scrollY;
    // console.log(scrollTop);
    sections.forEach((section, i) => {
      if (scrollTop >= section.offsetTop - 50) {
        // -50을 하는 이유는 아래까지 다떨어지지 않아도 좀더 빠르게 변경되게
        pgLinks.forEach((a) => {
          a.classList.remove("on");
        });
        pgLinks[i].classList.add("on");

        // sec3Pg에 "on" 클래스가 있는지 확인합니다.
        if (sec3Pg.classList.contains("on")) {
          sec3Section.classList.add("view");
        } else {
          sec3Section.classList.remove("view");
        }
      }
    });
  });
} else {
  sec3Section.classList.add("view");
}

//////////// sec1 - 연기 모션 ////////////
const canvas = document.querySelector("#experiment");
const context = canvas.getContext("2d");

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

const CURVES = 2;
const STEPS = 20;

const SPEED = 1;

function start() {
  context.clearRect(0, 0, 9999, 9999);

  const pathController = new PathController(3);
  pathController.ensureCanvasFilled();
  pathController.interpolatePaths();
  pathController.drawPaths();
  pathController.animate();
}

function PathController(count) {
  const MIN_LENGTH = CANVAS_HEIGHT + 1024;

  this.paths = [...Array(count)].map(() => new Path());

  this.extendPaths = () => {
    this.paths.forEach((p) => p.extend());
  };

  this.ensureCanvasFilled = () => {
    this.paths.forEach((path) => {
      while (path.getBottom() < MIN_LENGTH) {
        this.extendPaths();
      }
    });

    this.paths.forEach((path) => {
      if (path.curves[0].endPoint < 0 - 512) {
        this.shiftPaths();
      }
    });

    this.interpolatePaths();
  };

  this.shiftPaths = () => {
    this.paths.forEach((path) => path.shiftPath());
  };

  this.drawPaths = () => {
    this.paths.forEach((p) => p.draw());
  };

  this.interpolatePaths = () => {
    this.paths.forEach((path, idx) => {
      if (typeof this.paths[idx + 1] !== "undefined") {
        path.interpolateWith(this.paths[idx + 1]);
      }
    });
  };

  this.stepPaths = () => {
    this.paths.forEach((p) => p.step(SPEED));
  };

  this.clearCanvas = () => {
    context.clearRect(0, 0, 999, 999);
  };

  this.animate = () => {
    this.clearCanvas();
    this.stepPaths();
    this.ensureCanvasFilled();
    this.drawPaths();
    window.requestAnimationFrame(this.animate.bind(this));
  };
}

function Path() {
  this.curves = [];
  this.interpolatedCurves = [];

  // how much length to maintain
  this.minLength = CANVAS_HEIGHT + 512;

  this.extend = () => {
    let newCurve;
    if (this.curves.length) {
      const parentCurve = this.curves[this.curves.length - 1];
      childCurve = new Curve({ startPoint: [...parentCurve.endPoint] });
    } else {
      childCurve = new Curve();
    }
    this.curves.push(childCurve);
    return childCurve;
  };

  this.draw = () => {
    this.curves.forEach((c) => {
      c.draw("dimgray");
    });
    this.interpolatedCurves.forEach((c) => {
      c.forEach((d) => d.draw("dimgray"));
    });
  };

  this.step = () => {
    this.curves.forEach((c) => c.step());
    this.interpolatedCurves.forEach((c) => c.forEach((d) => d.step()));
  };

  this.interpolateWith = (path) => {
    this.interpolatedPair = path;
    this.interpolatedCurves = this.curves.map((curve, idx) => {
      // for when some paths have more curves, just add
      // more curves to this path
      if (typeof path.curves[idx] == "undefined") path.extend();
      return curve.interpolateWith(path.curves[idx]);
    });
  };

  this.getLength = () => this.curves.reduce((acc, cur) => acc + cur.length, 0);

  this.getBottom = () => {
    if (!this.curves.length) return 0;
    return this.curves[this.curves.length - 1].endPoint[1];
  };

  this.shiftPath = () => {
    this.curves.shift();
  };
}

function Curve(params = {}) {
  const config = Object.assign({}, params);

  const MAX_WIDTH = 256;
  const MIN_WIDTH = 128;
  const MAX_LENGTH = 512;
  const MIN_LENGTH = 256;

  this.startPoint = config.startPoint || [randomInRange(0, MAX_WIDTH), 0];
  this.length = randomInRange(MIN_LENGTH, MAX_LENGTH);
  this.startWhiskerLength = config.startWhiskerLength || 128;
  this.endWhiskerLength = 128;

  // require the curve to start and end on opposite sides
  // with a margin of at least MIN_WIDTH
  let startX = this.startPoint[0];
  let endX;
  if (startX > MAX_WIDTH / 2) {
    endX = randomInRange(0, MIN_WIDTH);
  } else {
    endX = randomInRange(MIN_WIDTH, MAX_WIDTH);
  }
  this.endPoint = [endX, this.startPoint[1] + this.length];

  this.interpolatedCurves = [];
  this.attachedCurves = [];

  this.forcedBezier = config.forcedBezier;

  this.draw = (color = "red") => {
    const bez = this.toBezier();
    context.beginPath();
    context.moveTo(...bez.startPoint);
    context.bezierCurveTo(...bez.cp1, ...bez.cp2, ...bez.endPoint);
    context.strokeStyle = color;
    context.lineWidth = 0.3;
    context.stroke();

    // this.drawPoints();
    // this.drawWhiskers();
  };

  this.step = () => {
    const oldBez = this.toBezier();
    const newBez = Object.assign({}, oldBez);
    newBez.startPoint[1] = oldBez.startPoint[1] - SPEED;
    newBez.endPoint[1] = oldBez.endPoint[1] - SPEED;
    newBez.cp1[1] = oldBez.cp1[1] - SPEED;
    newBez.cp2[1] = oldBez.cp2[1] - SPEED;
    this.forcedBezier = newBez;
  };

  this.toBezier = () => {
    return (
      this.forcedBezier || {
        startPoint: this.startPoint,
        endPoint: this.endPoint,
        cp1: [this.startPoint[0], this.startPoint[1] + this.startWhiskerLength],
        cp2: [this.endPoint[0], this.endPoint[1] - this.endWhiskerLength],
      }
    );
  };

  this.createAttachedCurve = () => {
    return new Curve(
      Object.assign(
        {},
        {
          startPoint: [...this.endPoint],
        }
      )
    );
  };

  this.createAttachedCurves = (count = 20) => {
    this.attachedCurve = this.createAttachedCurve();
    if (count - 1) this.attachedCurve.createAttachedCurves(count - 1);
    return [...this.attachedCurves];
  };

  this.drawPoints = () => {
    drawCircle(...this.toBezier().startPoint, "blue");
    drawCircle(...this.toBezier().endPoint, "blue");
  };

  this.drawWhiskers = () => {
    context.beginPath();
    context.moveTo(...this.toBezier().startPoint);
    context.lineTo(...this.toBezier().cp1);
    context.moveTo(...this.toBezier().endPoint);
    context.lineTo(...this.toBezier().cp2);
    context.strokeStyle = "orange";
    context.stroke();

    drawCircle(...this.toBezier().cp1, "orange");
    drawCircle(...this.toBezier().cp2, "orange");
  };

  // yeet
  this.interpolateWith = (curve) =>
    (this.interpolatedCurves = interpolateCurves(this, curve));
}

function drawCircle(x, y, color) {
  const radius = 4;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
}

// returns new curves
function interpolateCurves(curveA, curveB, count = STEPS) {
  const result = [];
  const bezierA = curveA.toBezier();
  const bezierB = curveB.toBezier();

  // draw one curve for each desired step
  for (let i = 1; i <= count; i++) {
    const progress = i / (count + 1);
    const curve = new Curve();
    const params = ["startPoint", "endPoint", "cp1", "cp2"];
    const forcedBezier = {
      startPoint: interpolatePoints(
        bezierA.startPoint,
        bezierB.startPoint,
        progress
      ),
      endPoint: interpolatePoints(bezierA.endPoint, bezierB.endPoint, progress),
      cp1: interpolatePoints(bezierA.cp1, bezierB.cp1, progress),
      cp2: interpolatePoints(bezierA.cp2, bezierB.cp2, progress),
    };
    result.push(new Curve({ forcedBezier }));
  }
  return result;
}

function interpolatePoints(pointA, pointB, progress) {
  const diffX = pointA[0] - pointB[0];
  const diffY = pointA[1] - pointB[1];
  const newX = progress * diffX + pointB[0];
  const newY = progress * diffY + pointB[1];
  return [newX, newY];
}

function rngIfy(number, maxMag, minMag) {
  const max = number + maxMag;
  let min;
  if (typeof minMag !== "undefined") {
    min = number - minMag;
  } else {
    min = number - maxMag;
  }
  return Math.floor(Math.random() * (max - min) + min);
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

start();

//////////// sec2 - 모달 ////////////
const body = document.querySelector("body");
const aboutModalOpenBtn = document.querySelector(".consoleText");
const aboutModalColseBtn = document.querySelector(".aboutModalCloseBtn");
const aboutModal = document.querySelector(".aboutModalWrap");

aboutModalOpenBtn.addEventListener("click", () => {
  aboutModal.classList.add("on");
  body.classList.add("on");
});

aboutModalColseBtn.addEventListener("click", () => {
  aboutModal.classList.remove("on");
  body.classList.remove("on");
});

window.addEventListener("click", (e) => {
  if (e.target == aboutModal) {
    aboutModal.classList.remove("on");
    body.classList.remove("on");
  }
});
//////////// sec3 stack click ////////////
const stackImg = document.querySelectorAll(".stack");
const stackDetail = document.querySelectorAll(".stackDetail");

stackImg.forEach((item, i) => {
  item.addEventListener("click", () => {
    stackImg.forEach((a) => {
      a.classList.remove("on");
    });
    stackImg[i].classList.add("on");

    stackDetail.forEach((b) => {
      b.classList.remove("on");
    });
    stackDetail[i].classList.add("on");
  });
});

//////////// sec5 yes 버튼 ////////////
const pj = document.querySelectorAll(".pj");
const pjModal = document.querySelectorAll(".pjModalWrap");
const pjModalCloseBtn = document.querySelectorAll(".pjModalCloseBtn");

pj.forEach((item, i) => {
  item.addEventListener("click", (event) => {
    event.preventDefault(); // 기본 동작 막기

    pjModal.forEach((a) => {
      a.classList.remove("on");
    });
    body.classList.add("on");
    pjModal[i].classList.add("on");
  });
});

pjModalCloseBtn.forEach((item, i) => {
  item.addEventListener("click", (event) => {
    body.classList.remove("on");
    pjModal[i].classList.remove("on");
  });
});

window.addEventListener("click", (e) => {
  pjModal.forEach((item, i) => {
    if (e.target == item) {
      item.classList.remove("on");
      body.classList.remove("on");
    }
  });
});

//////////// sec5 yes 버튼 ////////////
const yesBtn = document.querySelector(".contactYesBtn");
const sec5FirstView = document.querySelector(".firstView");
const sec5SecondView = document.querySelector(".SecondView");

yesBtn.addEventListener("click", () => {
  sec5FirstView.classList.add("on");
  sec5SecondView.classList.add("on");
});
