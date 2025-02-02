import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI, { dbName: 'gameDB' });
};

// Define Mongoose Model
const gameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  gameCode: { type: String, required: true }, // HTML + CSS
  gameScript: { type: String, required: true }, // JavaScript
});

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);

// Handle GET (Fetch saved games)
export async function GET() {
  try {
    await connectToDatabase();
    const games = await Game.find({});
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

// Handle POST (Save a new game)
export async function POST(req: Request) {
  try {
    const { name, description, gameCode, gameScript } = await req.json();
    if (!name || !description || !gameCode || !gameScript) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    const newGame = new Game({ name, description, gameCode, gameScript });
    await newGame.save();

    return NextResponse.json({ message: 'Game saved successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Game already saved!' }, { status: 500 });
  }
}