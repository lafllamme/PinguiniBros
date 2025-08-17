w// Pixel Art Background for Pinguini Bros
// This creates a beautiful landscape background matching the described image:
// - Warm sunset sky gradient (orange/yellow)
// - Distant mountains in orange/brown
// - Forest in green tones
// - Grass and earth in foreground
// - Orange flowers scattered around

export const PIXEL_BACKGROUND = {
  // Create a canvas-based background that matches the described landscape
  getDataUrl(): string {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return this.fallbackData
    
    // Sky gradient (warm orange/yellow sunset)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 200)
    skyGradient.addColorStop(0, '#FF6B35')    // Bright orange at top
    skyGradient.addColorStop(0.5, '#FF8C42')  // Medium orange
    skyGradient.addColorStop(1, '#FFA500')    // Golden orange at horizon
    
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, 800, 200)
    
    // Clouds (fluffy white/yellow)
    ctx.fillStyle = '#F0E68C'  // Khaki for clouds
    // Cloud 1
    ctx.fillRect(100, 80, 60, 20)
    ctx.fillRect(110, 70, 40, 30)
    // Cloud 2
    ctx.fillRect(400, 60, 80, 25)
    ctx.fillRect(410, 50, 60, 35)
    // Cloud 3
    ctx.fillRect(650, 90, 50, 15)
    ctx.fillRect(660, 85, 30, 20)
    
    // Distant mountains (orange/brown layers)
    ctx.fillStyle = '#D2691E'  // Dark orange-brown
    ctx.fillRect(0, 150, 800, 100)
    
    // Mountain peaks
    ctx.fillStyle = '#8B4513'  // Saddle brown
    // Peak 1
    ctx.fillRect(100, 150, 80, 80)
    ctx.fillRect(120, 130, 40, 100)
    // Peak 2
    ctx.fillRect(300, 150, 120, 90)
    ctx.fillRect(330, 120, 60, 120)
    // Peak 3
    ctx.fillRect(550, 150, 100, 85)
    ctx.fillRect(570, 125, 60, 110)
    
    // Forest (green layers)
    ctx.fillStyle = '#228B22'  // Forest green
    ctx.fillRect(0, 250, 800, 150)
    
    // Forest details
    ctx.fillStyle = '#32CD32'  // Lime green
    // Tree clusters
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 800
      const y = 250 + Math.random() * 100
      const size = 10 + Math.random() * 20
      ctx.fillRect(x, y, size, size)
    }
    
    // Ground (grass and earth)
    // Grass layer
    ctx.fillStyle = '#228B22'  // Forest green
    ctx.fillRect(0, 400, 800, 100)
    
    // Earth layer
    ctx.fillStyle = '#8B4513'  // Saddle brown
    ctx.fillRect(0, 500, 800, 100)
    
    // Orange flowers scattered on grass
    ctx.fillStyle = '#FFA500'  // Orange
    for (let i = 0; i < 15; i++) {
      const x = 50 + Math.random() * 700
      const y = 420 + Math.random() * 60
      ctx.fillRect(x, y, 6, 6)
    }
    
    return canvas.toDataURL()
  },
  
  // Fallback data URL if canvas is not available
  fallbackData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  
  // Color palette matching the background
  colors: {
    skyGradient: {
      top: '#FF6B35',      // Warm orange
      middle: '#FF8C42',   // Medium orange
      bottom: '#FFA500'    // Bright orange
    },
    mountains: {
      far: '#D2691E',      // Dark orange-brown
      near: '#8B4513'      // Saddle brown
    },
    forest: {
      dark: '#228B22',     // Forest green
      light: '#32CD32'     // Lime green
    },
    ground: {
      grass: '#228B22',    // Forest green
      earth: '#8B4513'     // Saddle brown
    },
    flowers: '#FFA500',    // Orange flowers
    clouds: '#F0E68C'      // Khaki clouds
  },
  
  // Layer definitions for parallax effect
  layers: {
    sky: { y: 0, height: 200, speed: 0.1 },
    clouds: { y: 50, height: 100, speed: 0.2 },
    mountains: { y: 150, height: 150, speed: 0.3 },
    forest: { y: 250, height: 200, speed: 0.5 },
    ground: { y: 450, height: 150, speed: 1.0 }
  }
}

// Get the background data URL
export function getBackgroundDataUrl(): string {
  try {
    return PIXEL_BACKGROUND.getDataUrl()
  } catch (error) {
    console.warn('Could not generate background, using fallback:', error)
    return PIXEL_BACKGROUND.fallbackData
  }
}
