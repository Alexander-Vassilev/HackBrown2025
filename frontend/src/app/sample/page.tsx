'use client';

import { useEffect, useState } from 'react';

const mazeSize = 10;

const MazeGame: React.FC = () => {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [enemyPos, setEnemyPos] = useState({ x: 8, y: 8 });
  const [goalPos] = useState({ x: 9, y: 9 });
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('Use arrow keys or WASD to move. Reach the goal to win!');
  const [gameOver, setGameOver] = useState(false);


  useEffect(() => {
    const newWalls = new Set<string>();
    for (let y = 0; y < mazeSize; y++) {
      for (let x = 0; x < mazeSize; x++) {
        if (Math.random() < 0.2) {
          newWalls.add(`${x},${y}`);
        }
      }
    }
    setWalls(newWalls);
  }, []);

  useEffect(() => {
    if (playerPos.x === enemyPos.x && playerPos.y === enemyPos.y) {
      setGameOver(true);
      setMessage('Game Over! Refresh to restart.');
    } else if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
      setGameOver(true);
      setMessage('You Win! Refresh to restart.');
    }
  }, [playerPos, enemyPos, goalPos]);

  useEffect(() => {
    if (gameOver) return;
    const moveEnemy = () => {
      const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
      ];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const newPos = { x: enemyPos.x + dir.dx, y: enemyPos.y + dir.dy };
      if (isValidMove(newPos)) setEnemyPos(newPos);
    };
    const interval = setInterval(moveEnemy, 1000);
    return () => clearInterval(interval);
  }, [enemyPos, gameOver]);

  const isValidMove = (pos: { x: number; y: number }) => {
    return (
      pos.x >= 0 &&
      pos.x < mazeSize &&
      pos.y >= 0 &&
      pos.y < mazeSize &&
      !walls.has(`${pos.x},${pos.y}`)
    );
  };

  const movePlayer = (dx: number, dy: number) => {
    if (gameOver) return;
    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };
    if (isValidMove(newPos)) setPlayerPos(newPos);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(1, 0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, gameOver]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <video autoPlay loop muted className="absolute w-full h-full object-cover">
        <source src="/loop.mp4" type="video/mp4" />
      </video>
      <div className="relative flex flex-col items-center justify-center h-screen bg-gray-200 bg-opacity-50">
        <div className="text-xl font-bold mb-4">{message}</div>
        <div className="grid grid-cols-10 grid-rows-10 gap-1 w-[90vw] h-[90vh] relative">
          {Array.from({ length: mazeSize * mazeSize }).map((_, index) => {
            const x = index % mazeSize;
            const y = Math.floor(index / mazeSize);
            let cellClass = "bg-white border border-gray-300 w-full h-full";
            if (walls.has(`${x},${y}`)) cellClass = "bg-cover bg-center bg-[url('https://mario.wiki.gallery/images/thumb/3/31/NSMBDS_Brick_Block_Artwork.png/1200px-NSMBDS_Brick_Block_Artwork.png')]";
            if (x === playerPos.x && y === playerPos.y) cellClass = "bg-cover bg-center bg-[url('https://target.scene7.com/is/image/Target/GUEST_cf4773e6-afec-4aa1-89e7-74b7dfc09973')]";
            if (x === enemyPos.x && y === enemyPos.y) cellClass = "bg-cover bg-center bg-[url('https://media.zummocorp.com/Fruits/naranja-at-2x-1689333993o7yxJ.webp')]";
            if (x === goalPos.x && y === goalPos.y) cellClass = "bg-green-500";
            return <div key={index} className={cellClass}></div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default MazeGame;
