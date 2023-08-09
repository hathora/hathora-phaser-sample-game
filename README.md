![A screenshot of the game's title screen.](https://github.com/saricden/hathora-phaser-test/assets/7004280/a97e5280-d9c9-47c8-9457-6859427ad121)

# Hathora Phaser Test Game

A demo game utilizing the [Phaser 3](https://github.com/photonstorm/phaser) game engine and the [Hathora Phaser 3 Plugin](https://github.com/hathora/hathora-phaser) to integrate multiplayer lobby components.

## Live demo

You can try the game by visiting:

[sdn-hathora-phaser.netlify.app](https://sdn-hathora-phaser.netlify.app/)

## Running locally

To run the game locally, follow these steps:

1. Clone the game from GitHub:

```bash
git clone git@github.com:saricden/hathora-phaser-test.git
```

2. Install the client dependencies with NPM:

```bash
cd client
npm install
```

3. Install the server dependencies with NPM:

```bash
cd ../server
npm install
```

4. Populate environment variables:

For this step, you will need to have a Hathora account and be logged into [console.hathora.dev](https://console.hathora.dev/), as well as have an application created. For this step you will need:

- A `HATHORA_APP_ID`: Found on your Hathora application's overview page.
- A `HATHORA_APP_SECRET`: Also found on your Hathora application's overview page.
- A `HATHORA_TOKEN`: Can be accessed via the command - `cat ~/.config/hathora/token`.

With all of these variables handy, you then need to populate a `.env` file at the root of the project like so:

```
HATHORA_APP_SECRET=...
HATHORA_APP_ID=...
HATHORA_TOKEN=...
```

5. Boot up the local client and server

In the terminal tab you have open, run the following:

```bash
cd ..
npm run client
```

Then, open a second terminal tab and from the same directory (the project root), run this:

```bash
npm run server
```

You should now have your own copy of the game running at `http://localhost:5173/`! Woohoo! 🥳