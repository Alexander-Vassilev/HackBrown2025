'use client'

import { useEffect, useState } from 'react';
import GameCard from '../components/Card'; // Import the Card component

export default function GalleryPage() {
  const [savedGames, setSavedGames] = useState<any[]>([]);

  useEffect(() => {
    const fetchSavedGames = async () => {
      try {
        const response = await fetch('/api/games');
        const result = await response.json();
        if (response.ok) {
          setSavedGames(result);
        } else {
          alert(result.error || 'Failed to load games');
        }
      } catch (error) {
        alert('Error loading games');
      }
    };

    fetchSavedGames();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Gallery of Saved Games</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {savedGames.length === 0 ? (
          <p>No saved games found.</p>
        ) : (
          savedGames.map((game) => <GameCard key={game._id} game={game} />)
        )}
      </div>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold"
      >
        Back
      </button>
    </div>
  );
}
