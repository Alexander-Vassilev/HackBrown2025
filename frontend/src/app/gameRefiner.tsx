import React, { useState } from 'react';

const GameRefiner = ({ currentGame, onGameUpdate }) => {
  const [refineRequest, setRefineRequest] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async (e) => {
    e.preventDefault();
    setIsRefining(true);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      const prompt = `
        Current game state:
        ${JSON.stringify(currentGame)}
        
        Tasks:
        - Keep core gameplay unless specifically changed by request
        - Maintain responsive design and keyboard controls
        - Keep win/lose overlays and control legend
        - Preserve game title and text contrast
        - Return JSON with fields: chain-of-thought, game-details, html-css, script
        - Script must run immediately without initialization listener
        - For sprites, you can use the following paths: "player1.png", "player2.png", "tree.png", "car.png". Make sure to resize them.
        - Return parsable RAW JSON, no code blocks. DO NOT HAVE (\`\`\`json).
        
        
        Refine the following game based on this request: "${refineRequest}`;
     
        const response = await fetch(process.env.LLM_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      const refinedGame = JSON.parse(data.body.response);
      
      onGameUpdate(refinedGame);
      setRefineRequest('');
    } catch (error) {
      console.error('Error refining game:', error);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="w-[200px] bg-white/90 backdrop-blur-sm rounded-md shadow">
      <div className="p-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Refine Game</h3>
      </div>
      <div className="p-2">
        <form onSubmit={handleRefine} className="space-y-2">
          <textarea
            value={refineRequest}
            onChange={(e) => setRefineRequest(e.target.value)}
            placeholder="Type your request here..."
            className="w-full p-2 text-sm border rounded text-gray-800 h-16 focus:ring-1 focus:ring-blue-500 outline-none"
            disabled={isRefining}
          />
          <button
            type="submit"
            disabled={isRefining || !refineRequest.trim()}
            className={`w-full p-1 rounded text-white text-sm transition-colors
              ${isRefining || !refineRequest.trim() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isRefining ? (
              <div className="flex items-center justify-center gap-1">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Refining...</span>
              </div>
            ) : (
              'Refine'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameRefiner;