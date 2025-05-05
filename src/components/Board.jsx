import React, { useEffect, useState } from "react";
import { FaGamepad } from "react-icons/fa";
const SIZE = 4; // 4 * 4 Matrix
import bg from "../assets/bg-hero.avif";
import { VscDebugRestart } from "react-icons/vsc";
import { GrUndo } from "react-icons/gr";
import Rule from "./Rule";
import Footer from "./Footer";
const generateEmptyGrid = () =>
  Array(SIZE).fill(0).map(() => Array(SIZE).fill(0)); // empty grid

const placeRandom = (grid) => { 
  const empty = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (grid[i][j] === 0) empty.push({ x: i, y: j });
    }
  }
  if (empty.length === 0) return grid;

  const { x, y } = empty[Math.floor(Math.random() * empty.length)];
  grid[x][y] = Math.random() < 0.6 ? 2 : 4; // 60% chance of 2, 40% chance of 4
  return grid;
};

const slideLeft = (grid, scoreRef) => {
  for (let i = 0; i < SIZE; i++) {
    // Get row without zeros
    let row = grid[i].filter(cell => cell > 0);

    // Merge same numbers
    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] === row[j + 1]) {
        row[j] *= 2;
        scoreRef.current += row[j];
        row.splice(j + 1, 1);
      }
    }

    // Add zeros to end
    while (row.length < SIZE) {
      row.push(0);
    }

    grid[i] = row;
  }
}

const slideRight = (grid, scoreRef)  =>{
  for (let i = 0; i < SIZE; i++) {
    // Get row without zeros
    let row = grid[i].filter(cell => cell > 0);

    // Merge same numbers (from right to left)
    for (let j = row.length - 1; j > 0; j--) {
      if (row[j] === row[j - 1]) {
        row[j] *= 2;
        scoreRef.current += row[j];
        row.splice(j - 1, 1); // Remove the merged number
      }
    }

    // Add zeros to start
    while (row.length < SIZE) {
      row.unshift(0); 
    }

    grid[i] = row;
  }
}

function slideUp(grid, scoreRef) {
  for (let j = 0; j < SIZE; j++) {
    // Get column without zeros
    let col = [];
    for (let i = 0; i < SIZE; i++) {
      if (grid[i][j] > 0) {
        col.push(grid[i][j]);
      }
    }

    // Merge same numbers
    for (let i = 0; i < col.length - 1; i++) {
      if (col[i] === col[i + 1]) {
        col[i] *= 2;
        scoreRef.current += col[i];
        col.splice(i + 1, 1);
      }
    }

    // Add zeros to end
    while (col.length < SIZE) {
      col.push(0);
    }

    // Put back in grid
    for (let i = 0; i < SIZE; i++) {
      grid[i][j] = col[i];
    }
  }
}

function slideDown(grid, scoreRef) {
  for (let j = 0; j < SIZE; j++) {
    // Get column without zeros
    let col = [];
    for (let i = 0; i < SIZE; i++) {
      if (grid[i][j] > 0) {
        col.push(grid[i][j]);
      }
    }

    // Merge same numbers (from bottom to top)
    for (let i = col.length - 1; i > 0; i--) {
      if (col[i] === col[i - 1]) {
        col[i] *= 2;
        scoreRef.current += col[i];
        col.splice(i - 1, 1); // Remove the merged number
      }
    }

    // Add zeros to start
    while (col.length < SIZE) {
      col.unshift(0);
    }

    // Put back in grid
    for (let i = 0; i < SIZE; i++) {
      grid[i][j] = col[i];
    }
  }
}

// Check if move changed anything
const hasChanged = (oldGrid, newGrid) => {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (oldGrid[i][j] !== newGrid[i][j]) return true;
    }
  }
  return false;
};

const checkGameOver = (grid) => {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (grid[i][j] === 0) return false;
      if (j < SIZE - 1 && grid[i][j] === grid[i][j + 1]) return false;
      if (i < SIZE - 1 && grid[i][j] === grid[i + 1][j]) return false;
    }
  }
  return true;
};

const checkWin = (grid) => {
  return grid.flat().includes(2048); //check any tile is 2048
};

const Board  = () => {
  const [grid, setGrid] = useState(() =>
    placeRandom(placeRandom(generateEmptyGrid()))
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    () => Number(localStorage.getItem("bestScore")) || 0
  );
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [history, setHistory] = useState([]);

  const restartGame = () => {
    const freshGrid = generateEmptyGrid();
    placeRandom(freshGrid);  // 2
    placeRandom(freshGrid); // 4
    setGrid(freshGrid);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setHistory([]);
  };

  useEffect(() => {
    const handleMoveKey = (e) => {
      if (gameOver || win) return;

      let dir;
      if (e.key === "ArrowLeft") dir = "left";
      else if (e.key === "ArrowRight") dir = "right";
      else if (e.key === "ArrowUp") dir = "up";
      else if (e.key === "ArrowDown") dir = "down";
      else return;

      const oldGrid = grid.map(row => [...row]);
      const newGrid = grid.map(row => [...row]);
      const scoreRef = { current: 0 };   //to keep track of score changes

      // Apply slide based on direction
      switch (dir) {
        case 'left':
          slideLeft(newGrid, scoreRef);
          break;
        case 'right':
          slideRight(newGrid, scoreRef);
          break;
        case 'up':
          slideUp(newGrid, scoreRef);
          break;
        case 'down':
          slideDown(newGrid, scoreRef);
          break;
      }

      if (hasChanged(oldGrid, newGrid)) {
        // Save for undo
        setHistory(prev => [...prev, { grid: oldGrid, score }]);

        const updatedGrid = placeRandom(newGrid);
        setGrid(updatedGrid);
        const newScore = score + scoreRef.current;
        setScore(newScore);
        if (newScore > bestScore) {  // update best score
          setBestScore(newScore);
          localStorage.setItem("bestScore", newScore);
        }
        if (checkWin(updatedGrid)) setWin(true);
        else if (checkGameOver(updatedGrid)) setGameOver(true);
      }
    };

    window.addEventListener("keydown", handleMoveKey);
    return () => window.removeEventListener("keydown", handleMoveKey);
  }, [grid, score, bestScore, gameOver, win]);

  const handleUndo = () => {
    if (history.length === 0) return;

    const prevState = history[history.length - 1];
    setGrid(prevState.grid);
    setScore(prevState.score);
    setHistory(prev => prev.slice(0, -1));
  };

  const getTileColor = (val) => {
    if (val === 0) return "bg-gray-100";
    if (val === 2) return "bg-yellow-100";
    if (val === 4) return "bg-yellow-200";
    if (val === 8) return "bg-yellow-300";
    if (val === 16) return "bg-yellow-400";
    if (val === 32) return "bg-orange-400";
    if (val === 64) return "bg-orange-500";
    if (val === 128) return "bg-red-400";
    if (val === 256) return "bg-red-500";
    if (val === 512) return "bg-pink-500";
    if (val === 1024) return "bg-purple-500";
    if (val === 2048) return "bg-green-500";
    return "bg-black text-white"; // values after 2048
  };

  console.log("Grid:", grid);
  console.log("Score:", score);

  return (
    <div className="font-mono flex flex-col md:flex-row justify-center items-start gap-10 min-h-screen p-4 w-full overflow-hidden">
      <img src={bg} alt="bg-hero" className="fixed top-0 left-0 w-full h-full object-cover -z-10" />
      {/* Left: Game Section */}
      <h1 className="absolute top-2 text-5xl text-center font-extrabold text-black mb-6 drop-shadow-lg ">
          2048 Game
        </h1>
      <div className="flex flex-col justify-center overflow-hidden items-center gap-6 mt-14 ">
        <div className="flex gap-2 sm:gap-8 mb-6 z-10">
          <div className="bg-white shadow-lg rounded-xl flex justify-center flex-col items-center px-4 sm:px-10 sm:py-2 gap-2">
            <div className="text-xl font-semibold">Score</div>
            <div className="text-3xl">{score}</div>
          </div>
          <div className="bg-white shadow-lg rounded-xl flex justify-center flex-col items-center px-4 sm:px-10 sm:py-2 gap-2">
            <div className="text-xl font-semibold">Best</div>
            <div className="text-3xl">{bestScore}</div>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <button
              title="Restart"
              onClick={restartGame}
              className="cursor-pointer flex gap-2 h-max p-4 items-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xl "
            >
              <VscDebugRestart size={30} />
            </button>
            <button
              title="Undo"
              onClick={handleUndo}
              className="cursor-pointer flex gap-2 h-max p-4 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow"
            >
              <GrUndo size={30} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-gray-300 p-2 sm:p-6 rounded-xl shadow-xl">
          {grid.map((row, i) =>
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className={`h-16 w-16 sm:w-20 sm:h-20 flex items-center justify-center font-bold text-2xl rounded-xl ${getTileColor(val)} transition duration-300`}
              >
                {val !== 0 ? val : ""} {/* Show value if not 0 */}
              </div>
            ))
          )}
        </div>
      </div>
      {/* Right: Rules Section */}
       <Rule />
      {/* footer  */}
       <Footer />
      {(gameOver || win) && (
        <div className="fixed inset-0 backdrop-blur-sm bg-blue-200/30 z-40">
          <div className="absolute flex items-center flex-col top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-white bg-opacity-90 shadow-2xl rounded-xl p-8 z-50 w-96 text-center">
            <h2 className={`text-3xl font-bold ${win ? "text-green-600" : "text-red-600"}`}>
              {win ? "You Win 🎉!" : "Game Over 💀 !"}
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              {win ? "You reached 2048!" : "No more valid moves."}
            </p>
            <button
              onClick={restartGame}
              className="flex gap-2 items-center mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-700 cursor-pointer text-white rounded-full shadow-lg transition duration-300"
            >
              <span> Restart Game </span>
              <FaGamepad size={30} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;