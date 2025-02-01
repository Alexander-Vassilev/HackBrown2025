"use client"

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/addGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();
      setMessage(data.message || "Error adding game.");
    } catch (error) {
      setMessage("Error connecting to API.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Add a Game</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <label className="block mb-2 text-gray-700 font-semibold">Game Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter game name"
          className="w-full p-2 border rounded-lg mb-4"
          required
        />

        <label className="block mb-2 text-gray-700 font-semibold">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter game description"
          className="w-full p-2 border rounded-lg mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
    </div>
  );
}
