import { UserId, RoomId, Application, startServer, verifyJwt, Server } from "@hathora/server-sdk";
import * as dotenv from "dotenv";

type Player = {
  id: string
  score: number
}

type Room = {
  players: Player[]
}

const rooms = new Map<RoomId, Room>();
let server: Server;

const store: Application = {
  async verifyToken(token: string, roomId: RoomId): Promise<UserId | undefined> {
    const userId = verifyJwt(token, process.env.HATHORA_APP_SECRET!);

    console.log(`Verified user ${userId}`);

    if (userId === undefined) {
      console.error("Failed to verify token", token);
    }

    return userId;
  },

  // subscribeUser is called when a new user enters a room, it's an ideal place to do any player-specific initialization steps
  async subscribeUser(roomId: RoomId, userId: string): Promise<void> {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        players: []
      });
      console.log(`New room created (${roomId})`);
    }

    const game = rooms.get(roomId);

    if (!game) return;

    // Make sure the player hasn't already spawned
    if (!game.players.some((player) => player.id === userId)) {
      game.players.push({
        id: userId,
        score: 0
      });

      console.log(`New player joined (${userId})`);

      server.broadcastMessage(roomId, Buffer.from(JSON.stringify({
        event: 'UPDATE_SCORES',
        data: {
          ...game
        }
      }), "utf8"));
    }
  },

  // unsubscribeUser is called when a user disconnects from a room, and is the place where you'd want to do any player-cleanup
  async unsubscribeUser(roomId: RoomId, userId: string): Promise<void> {
    console.log("unsubscribeUser", roomId, userId);
    // Make sure the room exists
    if (!rooms.has(roomId)) {
      return;
    }

    // Remove the player from the room's state
    const game = rooms.get(roomId)!;
    const idx = game.players.findIndex((player) => player.id === userId);
    if (idx >= 0) {
      game.players.splice(idx, 1);
    }
  },

  // onMessage is an integral part of your game's server. It is responsible for reading messages sent from the clients and handling them accordingly, this is where your game's event-based logic should live
  async onMessage(roomId: RoomId, userId: string, data: ArrayBuffer): Promise<void> {
    if (!rooms.has(roomId)) {
      return;
    }

    // Get the player, or return out of the function if they don't exist
    const game = rooms.get(roomId)!;
    const player = game.players.find((player) => player.id === userId);
    if (player === undefined) {
      return;
    }
    
    // Handle client -> server messages on player behalf here
    const message = JSON.parse(Buffer.from(data).toString("utf8"));
    
    if (message.event === 'PLAYER_CLICK') {
      player.score++;

      server.broadcastMessage(roomId, Buffer.from(JSON.stringify({
        event: 'UPDATE_SCORES',
        data: {
          ...game
        }
      }), "utf8"));
    }
  },
};

// Load our environment variables into process.env
dotenv.config();
if (process.env.HATHORA_APP_SECRET === undefined) {
  throw new Error("HATHORA_APP_SECRET not set");
}

// Start the server
async function boot() {
  const port = parseInt(process.env.PORT ?? "4000");
  server = await startServer(store, port);
  console.log(`Server listening on port ${port}`);
}

boot();