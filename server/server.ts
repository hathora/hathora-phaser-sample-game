import { UserId, RoomId, Application, startServer, verifyJwt, Server } from "@hathora/server-sdk";
import * as dotenv from "dotenv";
import { Avatar, FoodType, GameState } from '../common/types';
import { v4 as uuid } from 'uuid';

const avatars: Avatar[] = ['snail', 'chicken', 'mushroom', 'rhino', 'trunk'];
const foodTypes: FoodType[] = ['chicken', 'sandwich', 'waffle', 'taco', 'cake', 'ramen', 'hotdog', 'burger'];
const mapWidth = 1280;
const mapHeight = 720;
const mapPadding = 64;
const playerSpeed = 18;
const objWidth = 32;
const objHeight = 32;
const minSpawnTime = 1000;
const maxSpawnTime = 5000;
const timers: Map<RoomId, Map<string, NodeJS.Timeout>> = new Map();

/**
 * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const rooms = new Map<RoomId, GameState>();
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
        players: [],
        food: []
      });

      timers.set(roomId, new Map());
      console.log(`New room created (${roomId})`);
    }

    const game = rooms.get(roomId);

    if (!game) return;

    // Make sure the player hasn't already spawned
    if (!game.players.some((player) => player.id === userId)) {
      game.players.push({
        id: userId,
        avatar: avatars[getRandomInt(0, avatars.length - 1)],
        food: 0,
        position: {
          x: getRandomInt(mapPadding, mapWidth - mapPadding),
          y: getRandomInt(mapPadding, mapHeight - mapPadding),
        },
        velocity: {
          x: 0,
          y: 0
        },
        isMoving: false,
        isFlipped: false
      });

      console.log(`New player joined (${userId})`);
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

    // Remove the game room if empty
    if (game.players.length === 0) {
      rooms.delete(roomId);
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
    
    if (message.event === 'PLAYER_MOVE') {
      const {direction} = message;

      if ([-1, 0, 1].includes(direction.x) && [-1, 0, 1].includes(direction.y)) {
        player.velocity = direction;
      }

      player.isMoving = (player.velocity.x !== 0 || player.velocity.y !== 0);

      if (player.velocity.x !== 0) {
        player.isFlipped = (player.velocity.x === 1);
      }
    }
    else if (message.event === 'PING') {
      server.sendMessage(roomId, userId, Buffer.from(JSON.stringify({
        event: 'PONG',
        ts: Date.now()
      }), "utf8"));
    }
  },
};

function hitTest(x1: number, y1: number, x2: number, y2: number) {
  const hw = objWidth / 2;
  const hh = objHeight / 2;

  return (x1 + hw >= x2 - hw && x1 - hw <= x2 + hw && y1 + hh >= y2 - hh && y1 - hh <= y2 + hh);
}

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

  setInterval(() => {
    rooms.forEach((game, roomId) => {
      game.players.forEach((player) => {
        player.position.x += (player.velocity.x * playerSpeed);
        player.position.y += (player.velocity.y * playerSpeed);

        if (player.position.x < 0) {
          player.position.x += playerSpeed;
        }
        else if (player.position.x > mapWidth) {
          player.position.x -= playerSpeed;
        }

        if (player.position.y < 0) {
          player.position.y += playerSpeed;
        }
        else if (player.position.y > mapHeight) {
          player.position.y -= playerSpeed;
        }
      });

      const roomTimers = timers.get(roomId)!;

      while (roomTimers.size < 3) {
        const timeout = getRandomInt(minSpawnTime, maxSpawnTime);
        const foodId = uuid();

        roomTimers.set(foodId, setTimeout(() => {
          game.food.push({
            id: foodId,
            type: foodTypes[getRandomInt(0, foodTypes.length)],
            position: {
              x: getRandomInt(0, mapWidth),
              y: getRandomInt(0, mapHeight)
            }
          });

          roomTimers.delete(foodId);
        }, timeout));
      }

      game.food.forEach((food, i) => {
        game.players.forEach((player) => {
          if (hitTest(player.position.x, player.position.y, food.position.x, food.position.y)) {
            game.food.splice(i, 1);
            player.food++;
          }
        });
      });
      
      server.broadcastMessage(roomId, Buffer.from(JSON.stringify({
        event: 'UPDATE',
        game: {
          ...game
        },
        ts: Date.now()
      }), "utf8"));
    });
  }, 50);
}

boot();