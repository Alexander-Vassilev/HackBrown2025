// app/video.tsx

'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '' })

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Ensure it's muted
      videoRef.current.play().catch((err) => console.error("Video play failed:", err));
    }
  }, []);

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
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* Video background */}
      <video
        ref={videoRef}
        src="/opening.mp4"
        autoPlay
        loop
        muted
        style={{
          position: 'absolute', 
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />
<div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '30px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '10px',
          color: 'white',
          width: '400px',
          textAlign: 'center',
        }}
      >
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

  {/* Bottom buttons */}
  <div className="w-full flex justify-between mt-6">
    <button 
      className="bg-gray-500 text-white px-4 py-2 rounded-lg" 
      onClick={() => alert('Loading Screen...')}
    >
      Load Screen
    </button>
    <a href="/play"><button 
      className="bg-green-500 text-white px-4 py-2 rounded-lg">
      Next Page</button></a>        
  </div>
</div>
    </div>
  )
}

