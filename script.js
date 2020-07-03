document.addEventListener('DOMContentLoaded', () => {
  let gridContainer = document.getElementById('#grid');
  let showNextGridContainer = document.getElementById('#next-grid');
  const scoreDisplay = document.getElementById('#score');
  const speedDisplay = document.getElementById('#speed');
  const startBtn = document.getElementById('#startBtn');
  const gridSizeBtn = document.getElementById('#gridSizeBtn');
  const cellSizeBtn = document.getElementById('#cellSizeBtn');
  const refreshBtn = document.getElementById('#refreshBtn');

  cellSizeBtn.disabled = true;
  startBtn.disabled = true;

  const audio = new Audio('completed.wav');

  let grid = [];
  const colors = ['cyan', 'blue', 'orange', 'purple', 'magenta', 'green', 'red'];

  let gridSizeClicks = 0;
  let cellSizeClicks = 0;
  let gridWidth;
  let gridHeight;
  let cellWidth;
  let cellHeight;
  let width;
  let timerId;
  let score = 0;
  let speed = 1000;
  speedDisplay.textContent = speed + 'ms';

  // Tetrominoes
  let iTetromino = [];
  let lrTetromino = [];
  let llTetromino = [];
  let oTetromino = [];
  let pTetromino = [];
  let zrTetromino = [];
  let zlTetromino = [];
  let theTetrominoes = [];
  let currentPosition;
  let currentRotation;
  let random;
  let nextRandom = 0;
  let current;

  let displayNextGrid = [];
  const displayWidth = 5;
  let displayTetrominoes = [
    [2, displayWidth + 2, displayWidth * 2 + 2, displayWidth * 3 + 2],
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],
    [2, 3, displayWidth + 3, displayWidth * 2 + 3],
    [2, 3, displayWidth + 2, displayWidth + 3],
    [2, displayWidth + 1, displayWidth + 2, displayWidth + 3],
    [displayWidth + 1, displayWidth + 2, displayWidth * 2 + 2, displayWidth * 2 + 3],
    [displayWidth + 2, displayWidth + 3, displayWidth * 2 + 1, displayWidth * 2 + 2],
  ];
  const displayIndex = displayWidth;

  refreshBtn.addEventListener('click', () => {
    location.reload();
  });

  gridSizeBtn.addEventListener('click', () => {
    if (gridSizeClicks < 3) {
      gridSizeClicks++;
    } else {
      gridSizeClicks = 1;
    }

    if (gridSizeClicks === 1) {
      gridWidth = 420;
      gridHeight = 420;
      gridContainer.style.width = gridWidth + 'px';
      gridContainer.style.height = gridHeight + 'px';
      gridSizeBtn.textContent = 'Small';
    } else if (gridSizeClicks === 2) {
      gridWidth = 540;
      gridHeight = 540;
      gridContainer.style.width = gridWidth + 'px';
      gridContainer.style.height = gridHeight + 'px';
      gridSizeBtn.textContent = 'Medium';
    } else if (gridSizeClicks === 3) {
      gridWidth = 660;
      gridHeight = 660;
      gridContainer.style.width = gridWidth + 'px';
      gridContainer.style.height = gridHeight + 'px';
      gridSizeBtn.textContent = 'Big';
    }
    gridContainer.style.borderLeft = '3px solid black';
    cellSizeBtn.disabled = false;
  });

  cellSizeBtn.addEventListener('click', () => {
    if (cellSizeClicks < 3) {
      cellSizeClicks++;
    } else {
      cellSizeClicks = 1;
    }

    if (cellSizeClicks === 1) {
      cellWidth = 10;
      cellHeight = 10;
      cellSizeBtn.textContent = 'Small';
    } else if (cellSizeClicks === 2) {
      cellWidth = 15;
      cellHeight = 15;
      cellSizeBtn.textContent = 'Medium';
    } else if (cellSizeClicks === 3) {
      cellWidth = 20;
      cellHeight = 20;
      cellSizeBtn.textContent = 'Big';
    }

    [].forEach.call(document.querySelectorAll('.square, .taken'), function (e) {
      e.parentNode.removeChild(e);
    });
    createGrid();
    showNextGrid();
    width = Math.floor(gridWidth / cellWidth);
    init();
    startBtn.disabled = false;
  });

  document.addEventListener('keyup', control);

  startBtn.addEventListener('click', () => {
    cellSizeBtn.classList.add('no-change-during-game');
    gridSizeBtn.classList.add('no-change-during-game');
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, speed);
    }
  });

  function init() {
    // Tetrominoes
    iTetromino = [
      [1, width + 1, width * 2 + 1, width * 3 + 1],
      [width, width + 1, width + 2, width + 3],
      [1, width + 1, width * 2 + 1, width * 3 + 1],
      [width, width + 1, width + 2, width + 3],
    ];

    lrTetromino = [
      [1, width + 1, width * 2 + 1, 2],
      [width, width + 1, width + 2, width * 2 + 2],
      [1, width + 1, width * 2 + 1, width * 2],
      [width, width * 2, width * 2 + 1, width * 2 + 2],
    ];

    llTetromino = [
      [1, 2, width + 2, width * 2 + 2],
      [3, width + 1, width + 2, width + 3],
      [2, width + 2, width * 2 + 2, width * 2 + 3],
      [width + 1, width + 2, width + 3, width * 2 + 1],
    ];

    oTetromino = [
      [1, 2, width + 1, width + 2],
      [1, 2, width + 1, width + 2],
      [1, 2, width + 1, width + 2],
      [1, 2, width + 1, width + 2],
    ];

    pTetromino = [
      [1, width, width + 1, width + 2],
      [0, width, width + 1, width * 2],
      [width, width + 1, width + 2, width * 2 + 1],
      [width, 1, width + 1, width * 2 + 1],
    ];

    zlTetromino = [
      [0, 1, width + 1, width + 2],
      [1, width, width + 1, width * 2],
      [0, 1, width + 1, width + 2],
      [1, width, width + 1, width * 2],
    ];
    zrTetromino = [
      [1, 2, width, width + 1],
      [0, width, width + 1, width * 2 + 1],
      [1, 2, width, width + 1],
      [0, width, width + 1, width * 2 + 1],
    ];

    theTetrominoes = [
      iTetromino,
      lrTetromino,
      llTetromino,
      oTetromino,
      pTetromino,
      zlTetromino,
      zrTetromino,
    ];

    currentPosition = Math.floor(width / 2) - 1;
    currentRotation = 0;
    random = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random][currentRotation];
  }

  //create grid
  function createGrid() {
    grid = [];
    let squaresInGrid = (gridHeight * gridWidth) / (cellWidth * cellHeight);
    let tableWidth = Math.floor(gridWidth / cellWidth);
    for (let i = 0; i < squaresInGrid + tableWidth; i++) {
      let square = document.createElement('div');
      if (i < squaresInGrid) {
        square.setAttribute('class', 'square');
        square.style.width = cellWidth + 'px';
        square.style.height = cellHeight + 'px';
      } else {
        square.setAttribute('class', 'taken');
        square.style.width = cellWidth + 'px';
        square.style.height = cellHeight + 'px';
      }
      gridContainer.appendChild(square);
      grid.push(square);
    }
  }

  // create grid to display upcoming tetromino
  function showNextGrid() {
    displayNextGrid = [];
    for (let i = 0; i < 25; i++) {
      let square = document.createElement('div');
      square.setAttribute('class', 'square');
      square.style.width = '16px';
      square.style.height = '16px';
      showNextGridContainer.appendChild(square);
      displayNextGrid.push(square);
    }
    //showNextGridContainer.classList.add('show-next-grid');
  }

  function showNextTetromino() {
    displayNextGrid.forEach((square) => {
      //square.classList.remove('tetromino');
      square.style.backgroundColor = '';
      square.style.background = '';
    });
    displayTetrominoes[nextRandom].forEach((index) => {
      //displayNextGrid[index + displayIndex].classList.add('tetromino');
      displayNextGrid[index + displayIndex].style.backgroundColor = colors[nextRandom];
      displayNextGrid[index + displayIndex].style.background =
        'radial-gradient(lavenderblush, ' + colors[nextRandom] + ')';
    });
  }

  // select tetromino and set current position
  function nextTetromino() {
    currentPosition = Math.floor(width / 2) - 1;
    currentRotation = 0;
    random = nextRandom;
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random][currentRotation];
  }

  //draw
  function draw() {
    current.forEach((index) => {
      //grid[currentPosition + index].classList.add('tetromino');
      grid[currentPosition + index].style.backgroundColor = colors[random];
      grid[currentPosition + index].style.background =
        'radial-gradient(lavenderblush, ' + colors[random] + ')';
    });
  }

  //undraw
  function undraw() {
    current.forEach((index) => {
      //grid[currentPosition + index].classList.remove('tetromino');
      grid[currentPosition + index].style.backgroundColor = '';
      grid[currentPosition + index].style.background = '';
    });
  }

  // move down every second
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  function freeze() {
    if (
      current.some((index) => grid[currentPosition + index + width].classList.contains('taken'))
    ) {
      current.forEach((index) => grid[currentPosition + index].classList.add('taken'));

      nextTetromino();
      draw();
      showNextTetromino();
      addScore();
      gameOver();
    }
  }

  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some((index) => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) {
      currentPosition -= 1;
    }
    if (current.some((index) => grid[currentPosition + index].classList.contains('taken'))) {
      currentPosition += 1;
    }
    draw();
  }

  function moveRight() {
    undraw();
    const isAtRightEdge = current.some((index) => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) {
      currentPosition += 1;
    }
    if (current.some((index) => grid[currentPosition + index].classList.contains('taken'))) {
      currentPosition -= 1;
    }
    draw();
  }

  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    draw();
  }

  // assigning functions to keyCodes
  function control(e) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }

  function addScore() {
    for (let i = 0; i < (gridHeight / cellHeight) * width; i += width) {
      let row = [];
      for (let j = 0; j < width; j++) {
        row.push(i + j);
      }

      if (row.every((index) => grid[index].classList.contains('taken'))) {
        score += 10;
        audio.play();
        //increase speed with each score
        increaseSpeed();
        scoreDisplay.textContent = score;
        row.forEach((index) => {
          grid[index].classList.remove('taken');
          //grid[index].classList.remove('tetromino');
          grid[index].style.backgroundColor = '';
          grid[index].style.background = '';
        });
        const rowRemoved = grid.splice(i, width);
        grid = rowRemoved.concat(grid);
        grid.forEach((cell) => {
          gridContainer.appendChild(cell);
        });
      }
    }
  }

  // game over
  function gameOver() {
    if (current.some((index) => grid[currentPosition + index].classList.contains('taken'))) {
      scoreDisplay.textContent = ' Game over!';
      clearInterval(timerId);
    }
  }

  function increaseSpeed() {
    if (speed > 100) {
      speed -= 50;
      speedDisplay.textContent = speed + 'ms';
      clearInterval(timerId);
      timerId = setInterval(moveDown, speed);
    }
  }
});
