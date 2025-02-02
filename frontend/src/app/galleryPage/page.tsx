'use client'

import { useEffect, useState } from 'react';
import GameCard from '../components/Card'; // Import the Card component
import { useRouter } from 'next/navigation';

export default function GalleryPage() {
  const [savedGames, setSavedGames] = useState<any[]>([]);
  const router = useRouter();

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

  const handleGameClick = async (gameId: string) => {
    router.push("../")
    
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Gallery of Saved Games</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {savedGames.length === 0 ? (
          <p>No saved games found.</p>
        ) : (
          savedGames.map((game) => (
            <div key={game._id} onClick={() => handleGameClick(game._id)}>
              <GameCard game={game} />
            </div>
          ))
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