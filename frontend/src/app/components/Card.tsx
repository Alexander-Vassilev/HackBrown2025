'use client'

export default function GameCard({ game }: { game: any }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
      <h2 className="text-2xl font-semibold">{game.name}</h2>
      <p className="mt-2 text-gray-400">{game.description}</p>
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
        onClick={() => alert(`Loading ${game.name}...`)}
      >
        Play
      </button>
    </div>
  );
}
