// app/video.tsx

'use client'

import { useEffect, useRef, useState, } from 'react'
import gsap from 'gsap'
import './global.css'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const gameScreen = useRef<HTMLDivElement>(null)
  const loopRef = useRef<HTMLVideoElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Ensure it's muted
      videoRef.current.play().catch((err) => console.error("Video play failed:", err));
      videoRef.current.addEventListener("timeupdate", ()=>{
          if (Math.round(videoRef.current!.currentTime) == 6){
            gsap.to(gameScreen.current, {
              opacity: 1,
              duration: 2,
              ease: "power1.inOut"
            })
          }
      })
      videoRef.current.addEventListener("ended", () => {
        gsap.to(videoRef.current, {
          opacity: 0,
          duration: 2,
          onComplete: () => { videoRef.current!.style.display = "none" }
        })

        loopRef.current?.play()
      })
    }
    window.addEventListener("resize", (event) => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      console.log(window.innerWidth)
    })
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
        ref={loopRef}
        src="/loop.mp4"
        muted
        loop
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: "fill",
        }}
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      <video
        ref={videoRef}
        src="/opening.mp4"
        autoPlay
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
        }}
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="absolute w-screen h-screen flex justify-center items-center opacity-0 press-start-2p-regular" ref={gameScreen}>
        <div className='h-[77%] w-[60%] bg-[#50CEF9] rounded-md flex justify-center items-center flex-col'>
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
          <div className='w-full p-4 flex flex-row justify-center items-center gap-x-4'>
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
    </div>
  )
}

