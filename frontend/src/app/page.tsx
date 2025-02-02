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
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Check if both fields are filled
    setIsValid(name.trim().length > 0 && description.trim().length > 0);
  }, [name, description]);

  const gameCreationScreen = ()=> {
    setCurrentGame(null)
    gameRenderer.current!.innerHTML = gameCreation
  }

  const promptUser = async (question: string, validate: (input: string) => boolean) => {
    let answer = "";
    do {
      answer = window.prompt(question) || "";
      if (!validate(answer)) {
        alert("Invalid input. Please try again.");
      }
    } while (!validate(answer));
    return answer;
  };

  const router = useRouter();

  const generateGame = async () => {
      
    const genre = await promptUser(
      "What is the genre/style of the game? (e.g., platformer, puzzle, shooter)",
      (input) => true
    );
  
    const movement = await promptUser(
      "How does the player move? (e.g., arrow keys, WASD, mouse)",
      (input) => true
    );
  
    const obstacles = await promptUser(
      "What obstacles or constraints exist in the game?",
      (input) => true
    );
  
    const winCondition = await promptUser(
      "What is the win condition for the game?",
      (input) => true
    );
  
    setGenerating(true)

    const gameDescription = `A ${genre} game where players move using ${movement}. Obstacles include ${obstacles}. The win condition is ${winCondition}.`;
  

    let res = await generate(`Create a embeded js game in a div named ${name} about ${gameDescription}.
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
      - For the script, makes sure it runs immediately, do not use an event listener to initialize it.
      `)

    setGenerating(false)
//- If there is a good character, use the image "../../public/sprite.png" in the public folder
      //- If there is an enemy, use the image "../../public/enemy.png"
    // console.log(res.data.body["response"])
    //      - use "sprite.png" and "enemy.png" in the public folder for good and evil, respectively

    let rawResponse = res.data.body["response"];
    console.log(rawResponse); // Log the response to inspect the content

    // Sanitize the response by replacing problematic control characters
    let sanitizedResponse = rawResponse.replace(/[\x00-\x1F\x7F]/g, '');

    let generated_res = JSON.parse(sanitizedResponse);
    setCurrentGame(generated_res);
    console.log(name);
    console.log(description);
    console.log(generated_res["html-css"]);
    console.log(generated_res["script"]);

    gameRenderer.current!.innerHTML = generated_res["html-css"]

    let gameScript = document.createElement("script");
    gameScript.innerHTML = generated_res["script"]
    document.body.appendChild(gameScript)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let retries = 0;

    // while (retries < 3) {
      try {
        generateGame();
        // break;
      } catch {
        retries += 1;
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

            <button
              type="submit"
              className={`w-full text-white py-2 rounded-lg transition ${
                isValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isValid}
            >
              Submit
            </button>
          </form>

          {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}

          {/* Loading bar */}
          {generating && (
            <div className="w-full mt-4">
              <div className="bg-gray-200 h-2 rounded-full w-full">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-center text-gray-500 mt-2">Generating game...</p>
            </div>
          )}

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
