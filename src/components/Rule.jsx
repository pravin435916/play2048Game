import React from 'react'

const Rule = () => {
    return (
        <div className="p-4  rounded-3xl text-black inset-0 backdrop-blur-sm bg-blue-200/30 z-40 my-auto h-max flex items-center flex-col">
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <ul className="list-disc list-inside space-y-2 text-black">
                <li>Use arrow keys (← ↑ → ↓) to move tiles.</li>
                <li>When two tiles with the same number touch, they merge into one.</li>
                <li>Each merge increases your score by the tile's value.</li>
                <li>Reach the 2048 tile to win the game.</li>
                <li>Use Undo to revert your last move.</li>
                <li>Game ends when no more valid moves are possible.</li>
            </ul>
        </div>
    )
}
export default Rule
