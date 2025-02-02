"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState<string>("Bob");
  const [description, setDescription] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const router = useRouter();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure canvas is not null
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Ensure context is not null

    let snake = [{ x: 10, y: 10 }];
    let direction = "RIGHT";
    let food = { x: 15, y: 15 };

    function update() {
      let head = { ...snake[0] };
      if (direction === "RIGHT") head.x += 1;
      if (direction === "LEFT") head.x -= 1;
      if (direction === "UP") head.y -= 1;
      if (direction === "DOWN") head.y += 1;
      
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
      } else {
        snake.pop();
      }
    }

    function draw() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "red";
      ctx.fillRect(food.x * 20, food.y * 20, 20, 20);

      ctx.fillStyle = "lime";
      snake.forEach((segment) => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
      });
    }

    function gameLoop() {
      update();
      draw();
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
      if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
      if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
      if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    });

    const gameInterval = setInterval(gameLoop, 100);
    return () => clearInterval(gameInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Snake Game</h1>
      <canvas ref={canvasRef} width={400} height={400} className="bg-black"></canvas>
      <div className="mt-6 w-96 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold">Chatbot</h2>
        <textarea className="w-full p-2 border rounded-lg mt-2" placeholder="Type your message..."></textarea>
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg mt-2">Send</button>
      </div>
    </div>
  );
}
