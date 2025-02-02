// app/video.tsx

'use client'

import { useEffect, useRef, useState, } from 'react'
import gsap from 'gsap'
import './global.css'
import { useRouter } from 'next/navigation';



export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const gameScreen = useRef<HTMLDivElement>(null)
  const loopRef = useRef<HTMLVideoElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [tsCode, setTsCode] = useState<string>('') // The TypeScript code
  const [savedGames, setSavedGames] = useState<any[]>([]) // List of saved games
  const [gameName, setGameName] = useState<string>('') // Name of the generated game
  // const { data: savedGames, error } = useSWR('/api/games', fetcher)
  const router = useRouter();

  // if (error) return <div>Error loading games...</div>
  // if (!savedGames) return <div>Loading games...</div>
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

  console.log(savedGames.length)

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage("Game added successfully!");
      } else {
        setMessage(data.message || "Error adding game.");
      }
    } catch (error) {
      setMessage("Error connecting to API.");
      console.error(error);
    }
  };
  
  

   // Save the generated game to MongoDB
   const handleSaveGame = async () => {
    if (!gameName || !tsCode) {
      alert('Please provide a game name and TypeScript code.')
      return
    }

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameName, tsCode }),
      })
      const result = await response.json()
      if (response.ok) {
        alert('Game saved successfully')
        fetchSavedGames() // Refresh the list of saved games
      } else {
        alert(result.error || 'Failed to save game')
      }
    } catch (error) {
      alert('Error saving game')
    }
  }

  // Load the saved games from MongoDB
  const fetchSavedGames = async () => {
    try {
      const response = await fetch('/api/games')
      const result = await response.json()
      if (response.ok) {
        console.log(response)
        console.log(result)
        setSavedGames(result)
      } else {
        alert(result.error || 'Failed to load games')
      }
    } catch (error) {
      alert('Error loading games')
    }
  }

  // Load a saved game and populate the TypeScript code in the editor
  const handleAllGames = () => {
    router.push('/galleryPage'); // Redirect to gallery page
  };

  const handleLoadGame = (game: any) => {
    setGameName(game.gameName)
    setTsCode(game.tsCode)
  }

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
          <div className="mt-6">
          <button
            onClick={handleSaveGame}
            className="px-6 py-2 bg-green-600 rounded-lg text-white font-semibold mr-4"
          >
            Save Game
          </button>
          <button
            onClick={handleAllGames}
            className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold"
          >
            All Games
          </button>

    </div>
    </div>
    </div>
    </div>


  )
}

