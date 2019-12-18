const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 10;
const cellsVertical = 10;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 120 / cellsVertical, {
    label: "wall",
    isStatic: true
  }),
  Bodies.rectangle(width / 2, height, width, 120 / cellsHorizontal, {
    isStatic: true
  }),
  Bodies.rectangle(0, height / 2, 120 / cellsVertical, height, {
    label: "wall",
    isStatic: true
  }),
  Bodies.rectangle(width, height / 2, 120 / cellsHorizontal, height, {
    label: "wall",
    isStatic: true
  })
];
World.add(world, walls);

// maze generation

const shuffle = arr => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

// const grid = [];

// for (let i = 0; i < 3; i++) {
//   grid.push([]);
//   for (let j = 0; j < 3; j++) {
//     grid[i].push(false);
//   }
// }

// console.log(grid);

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

console.log(startRow, startColumn);

const stepThroughCell = (row, column) => {
  // if i have visited the cell at [row, column], then return
  if (grid[row][column] === true) {
    return;
  }

  // mark this cell sd being visited
  grid[row][column] = true;

  // assemble randomly ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"]
  ]);

  // for each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }

    // if we have visited that neighbor, continue to the next neighbors
    if (grid[nextRow][nextColumn] === true) {
      continue;
    }

    // remove a wall from either horizontals or verticals
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    }

    if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
  // visit that next cell
};

stepThroughCell(startRow, startColumn);
// console.log(grid);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open === true) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "green"
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, columnIndex) => {
  row.forEach((open, rowIndex) => {
    if (open === true) {
      return;
    }

    const wall = Bodies.rectangle(
      rowIndex * unitLengthX + unitLengthX,
      columnIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "green"
        }
      }
    );
    World.add(world, wall);
  });
});

// goal

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.5,
  unitLengthY * 0.5,
  {
    label: "goal",
    render: {
      fillStyle: "yellow"
    },
    isStatic: true
  }
);
World.add(world, goal);

// ball

const ballRadius = Math.min(unitLengthY, unitLengthX) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "blue"
  }
  //isStatic: true
});

World.add(world, ball);

document.addEventListener("keydown", event => {
  const { x, y } = ball.velocity;

  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 });
    console.log("move ball up");
  }

  if (event.keyCode === 88 || event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 });
    console.log("move ball down");
  }

  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y });
    console.log("move ball right");
  }

  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y });
    console.log("move ball left");
  }
});

// win condition

Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(collision => {
    const labels = ["ball", "goal"];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      console.log("you win");
      world.gravity.y = 0.5;
      world.bodies.forEach(wall => {
        if (wall.label === "wall") {
          Body.setStatic(wall, false);
        }
      });
    }
    // console.log(collision.bodyA);
  });
});
