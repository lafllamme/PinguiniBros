# 🐧 Pinguini Bros

A fun 2D platformer game built with **KAPLAY** and **Nuxt 4**, featuring pixel art graphics and classic platformer mechanics.

## 🎮 Game Features

- **Classic Platformer Gameplay**: Jump, run, and collect items in a Super Mario-style adventure
- **Multiple Levels**: Explore different ice cave environments with increasing difficulty
- **Enemy Types**: Face various enemies like slimes, bats, and spikes
- **Collectibles**: Gather fish, coins, and gems for points
- **Smooth Controls**: Responsive movement with keyboard controls
- **Pixel Art Style**: Retro-inspired graphics and animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd penguini-bros
   ```

2. **Install dependencies**
   ```bash
   make install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   make dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Controls

- **Movement**: Arrow Keys or WASD
- **Jump**: Space, Up Arrow, or W
- **Pause**: Escape
- **Menu Navigation**: Mouse clicks

## 🏗️ Project Structure

```
penguini-bros/
├── app/                    # Main app files
│   └── app.vue            # Root Vue component
├── components/            # Vue components
│   └── GameCanvas.vue     # Main game canvas
├── characters/            # Character classes
│   ├── Player.ts          # Player character logic
│   └── Enemy.ts           # Enemy AI and behavior
├── levels/                # Level definitions
│   └── Level1.ts          # First level data and manager
├── scenes/                # Game scenes
│   └── GameScene.ts       # Main game scene logic
├── utils/                 # Utility functions
│   └── AssetLoader.ts     # Asset management
├── assets/                # Game assets
│   ├── sprites/           # Sprite images
│   ├── sounds/            # Sound effects
│   └── music/             # Background music
├── maps/                  # Level maps (future)
├── Makefile               # Build and development commands
└── README.md              # This file
```

## 🛠️ Development

### Available Commands

```bash
# Show all available commands
make help

# Install dependencies
make install

# Start development server
make dev

# Build for production
make build

# Preview production build
make preview

# Clean build artifacts
make clean

# Quick start (install + dev)
make start
```

### Adding New Levels

1. Create a new level file in `levels/Level2.ts`
2. Define the level data using the `LevelData` interface
3. Add platforms, collectibles, enemies, and goals
4. Import and use in the game scene

### Adding New Characters

1. Create character class in `characters/` directory
2. Implement movement, collision, and behavior logic
3. Add to the asset loader configuration
4. Use in level definitions

### Adding New Assets

1. Place sprites in `assets/sprites/`
2. Place sounds in `assets/sounds/`
3. Place music in `assets/music/`
4. Update `utils/AssetLoader.ts` configuration

## 🎨 Game Mechanics

### Player Character
- **Double Jump**: Jump twice before landing
- **Movement**: Smooth left/right movement
- **Collision**: Proper physics with platforms and enemies

### Enemies
- **Slime**: Basic patrol movement
- **Bat**: Flying enemy with wider patrol
- **Spike**: Static hazard that damages on contact

### Collectibles
- **Fish**: 10 points each
- **Coins**: 5 points each
- **Gems**: 25 points each

### Level Progression
- Reach the goal to complete a level
- Collect items for higher scores
- Avoid enemies and hazards
- Multiple lives system

## 🔧 Technical Details

### Built With
- **KAPLAY**: Modern game engine for 2D games
- **Nuxt 4**: Vue.js framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Architecture
- **Component-based**: Modular Vue components
- **Scene Management**: Organized game scenes
- **Asset Management**: Centralized asset loading
- **Level System**: Data-driven level design

## 🎵 Audio

The game includes placeholder audio assets. To add real audio:

1. Replace placeholder data URLs in `AssetLoader.ts`
2. Add actual audio files to `assets/sounds/` and `assets/music/`
3. Update the asset configuration with real file paths

## 🖼️ Graphics

Currently using placeholder sprites. To add real graphics:

1. Create pixel art sprites (recommended 16x16 or 32x32 pixels)
2. Place in `assets/sprites/` directory
3. Update asset configuration
4. Ensure sprites follow the game's pixel art style

## 🚀 Deployment

### Build for Production
```bash
make build
```

### Preview Production Build
```bash
make preview
```

### Deploy to Static Hosting
The built files can be deployed to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐧 About Pinguini Bros

Pinguini Bros is a tribute to classic platformer games, featuring adorable penguin characters in an icy adventure. The game combines modern web technologies with nostalgic gameplay mechanics to create an engaging gaming experience using the powerful KAPLAY game engine.

---

**Happy Gaming! 🐧❄️**
