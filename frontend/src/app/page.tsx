// app/video.tsx

'use client'

import { useEffect, useRef, useState, } from 'react'
import gsap from 'gsap'
import './global.css'
import axios from 'axios'
import { useRouter } from 'next/navigation';



export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const gameScreen = useRef<HTMLDivElement>(null)
  const loopRef = useRef<HTMLVideoElement>(null)
  const gameRenderer = useRef<HTMLDivElement>(null)
  const restartGameCreationButton = useRef<HTMLButtonElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [savedGames, setSavedGames] = useState<any[]>([]) // List of saved games


  const generate = async (prompt: string) => {
    const headers = {
      'Content-Type': 'application/json'
    }
    return await axios.post(process.env.LLM_ENDPOINT as string, { prompt }, { headers: headers })
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Ensure it's muted
      videoRef.current.play().catch((err) => console.error("Video play failed:", err));
      videoRef.current.addEventListener("timeupdate", () => {
        if (Math.round(videoRef.current!.currentTime) == 6) {
          gsap.to(gameScreen.current, {
            opacity: 1,
            duration: 1,
            ease: "power1.inOut"
          })
        }

        gsap.to(restartGameCreationButton.current, {
          opacity: 1,
          duration: 1
        })
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
    setGameCreation(gameRenderer.current!.innerHTML)
  }, []);

  const [name, setName] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [currentGame, setCurrentGame] = useState(null)
  const [gameCreation, setGameCreation] = useState<string>("");

  const gameCreationScreen = ()=> {
    setCurrentGame(null)
    gameRenderer.current!.innerHTML = gameCreation
  }

  const router = useRouter();

  const generateGame = async () => {
      
    setGenerating(true)

    let res = await generate(`Create a embeded js game in a div named ${name} about ${description}.
      Task:
      - Output in raw json format (no need for code blocks \`\`\`) with fields "chain-of-thought", "game-details", "html-css", and "script".
      - The "script", will be attached to a script element, and the "html-css" will be rendered inside innerHTML.
      - Make sure the game adjust to the size of the innerHTML's parent.
      - The game must be interactive with keyboard input (e.g. arrows).
      - The game must have a clear win/lose screen that overlays the game screen, do not use alert.
      - If the game's details are not provided, make them up or infer it.
      - Include a legend on the top of the game for controls.
      - Include the title of the game on the top (make it standout).
      - For any texts, make sure it contrasts with the background.
      - For the script, makes sure it runs immediately, do not use an event listener to initialize it.`)

    setGenerating(false)

    // console.log(res.data.body["response"])
    let generated_res = JSON.parse(res.data.body["response"])
    setCurrentGame(generated_res)
    console.log(name)
    console.log(description)
    console.log(generated_res["html-css"])
    console.log(generated_res["script"])

    gameRenderer.current!.innerHTML = generated_res["html-css"]

    let gameScript = document.createElement("script");
    gameScript.innerHTML = generated_res["script"]
    document.body.appendChild(gameScript)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let retries = 0;

    while (retries < 3) {
      try {
        await generateGame();
        break;
      } catch {
        retries += 1;
      }
    }

    if (currentGame) {
      try {
        const response = await fetch("/api/addGame", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            gameCode: currentGame["html-css"],
            gameScript: currentGame["script"]
          }),
        });

        const data = await response.json();
        setMessage(data.message || "Error adding game.");
      } catch (error) {
        setMessage("Error connecting to API.");
        console.error(error);
      }
    }
  };


  // Load a saved game and populate the TypeScript code in the editor
  const handleAllGames = () => {
    router.push('/galleryPage'); // Redirect to gallery page
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
        <div ref={gameRenderer} className='h-[77%] w-[60%] bg-[#50CEF9] rounded-md flex justify-center items-center flex-col'>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Add a Game</h1>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
            <label className="block mb-2 text-gray-700 font-semibold">Game Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter game name"
              className="w-full p-2 border rounded-lg mb-4 text-gray-900"
              required
            />

            <label className="block mb-2 text-gray-700 font-semibold">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter game description"
              className="w-full p-2 border rounded-lg mb-4 text-gray-900 text-sm"
              required
            />

            {generating ?
              <div className='w-full flex items-center justify-center'>
                <div role="status">
                  <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div> :
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Submit
              </button>
            }
          </form>

          {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}

          {/* Bottom buttons */}
          <div className='w-full p-4 flex flex-row justify-center items-center gap-x-4'>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              onClick={() => generate("What is 1 + 1")}
            >
              Load Screen
            </button>
            <a href="/play"><button
              className="bg-green-500 text-white px-4 py-2 rounded-lg">
              Next Page</button></a>
          </div>
          <div className="mt-6">
          <button
            onClick={handleAllGames}
            className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold"
          >
            All Games
          </button>

        </div>
        </div>
      </div>
      <div className='absolute bottom-0 w-full flex justify-center'>
        <div className='h-[77%] w-[60%] bg-transparent flex justify-start'>
          <button
            ref={restartGameCreationButton}
            onClick={gameCreationScreen}
            className="w-[17%] p-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition opacity-0"
          >
            New Game
          </button>

    </div>
        </div>
      </div>


  )
}
