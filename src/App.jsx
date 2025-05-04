import React from 'react'
import Board from './components/Board'

const App = () => {
  // logic to build the game
  // 1. Create a 4x4 grid 
  // 2. Place two random numbers (2 or 4) in the grid
  // 3. Allow the user to move the numbers in four directions (up, down, left, right) 
  //    - When the user moves the numbers, slide them in the direction of the move
  //    - If two numbers are the same, merge them into one
   //    - After each move, place a new random number (2 or 4) in an empty cell
  //    - Keep track of the score
  // 4. Merge the numbers when they are the same
  // 5. Keep track of the score
  // 6. End the game when there are no more valid moves
  // 7. Allow the user to restart the game
  return (
    <>
      <Board />
    </>
  )
}
export default App