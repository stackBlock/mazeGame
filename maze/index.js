const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 12;
const width = 600;
const height = 600;

const unitLength = width / cells;

const engine = Engine.create();
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
  Bodies.rectangle(width / 2, 0, width, 120 / cells, {
    isStatic: true
  }),
  Bodies.rectangle(width / 2, height, width, 120 / cells, {
    isStatic: true
  }),
  Bodies.rectangle(0, height / 2, 120 / cells, height, {
    isStatic: true
  }),
  Bodies.rectangle(width, height / 2, 120 / cells, height, {
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

const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

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
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
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
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      10,
      {
        isStatic: true
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
      rowIndex * unitLength + unitLength,
      columnIndex * unitLength + unitLength / 2,
      10,
      unitLength,
      {
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

// goal

const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * 0.5,
  unitLength * 0.5,
  {
    render: {
      fillStyle: "yellow"
    },
    isStatic: true
  }
);
World.add(world, goal);

// ball

const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength * 0.3, {
  render: {
    fillStyle: "green"
  }
  // isStatic: true
});

World.add(world, ball);

document.addEventListener("keydown", event => {
  if (event.keyCode === 87 || event.keyCode === 38) {
    console.log("move ball up");
  }

  if (event.keyCode === 88 || event.keyCode === 40) {
    console.log("move ball down");
  }

  if (event.keyCode === 68 || event.keyCode === 39) {
    console.log("move ball right");
  }

  if (event.keyCode === 65 || event.keyCode === 37) {
    console.log("move ball left");
  }
});

