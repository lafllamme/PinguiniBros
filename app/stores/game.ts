import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { clonePlayer, type PlayerStats } from '@/assets/characters/Enemy'

export const useGameStore = defineStore('game', () => {
  // state
  const score = ref(0)
  const lives = ref(3)
  const currentLevel = ref(1)
  const player = reactive<PlayerStats>(clonePlayer())
  const lastDamageAt = ref(0)
  const lastHealAt = ref(0)
  const isPlayerDead = ref(false)
  const canTakeDamage = ref(true)
  
  // Dynamic screen dimensions
  const screenWidth = ref(800)
  const screenHeight = ref(600)
  
  // Level grid information
  const levelGrid = ref({
    tileSize: 32, // 16px * 2.0 scale
    groundRows: 5, // 4 rows sand_block_2 + 1 row sand_block_3
    groundBottomY: 0,
    groundTopY: 0,
    characterGroundY: 0
  })

  // derived
  const hpPercent = computed(() => player.hp / player.maxHp)
  type HpBucket = 'g' | 'y' | 'r'
  const hpBucket = computed<HpBucket>(() => {
    const p = hpPercent.value
    return p > 0.6 ? 'g' : p > 0.3 ? 'y' : 'r'
  })
  const isPlayerDeadComputed = computed(() => player.hp <= 0 || isPlayerDead.value)
  const isGameOver = computed(() => lives.value <= 0)

  // actions
  function setLevel(level: number) {
    currentLevel.value = level
  }

  function addScore(n = 1) {
    score.value += n
  }

  function loseLife() {
    if (lives.value > 0) lives.value -= 1
  }

  function resetLives(n = 3) {
    lives.value = n
  }

  function setPlayer(partial: Partial<PlayerStats>) {
    Object.assign(player, partial)
    if (partial.attack) Object.assign(player.attack, partial.attack)
  }

  function damagePlayer(n = 1) {
    player.hp = Math.max(0, player.hp - n)
    lastDamageAt.value = Date.now()
  }

  function healPlayer(n = 1) {
    player.hp = Math.min(player.maxHp, player.hp + n)
    lastHealAt.value = Date.now()
  }

  // helpers (time-based checks kept here to avoid window hooks elsewhere)
  function isRegenReady(now: number = Date.now(), delayMs = 5000) {
    return now - lastDamageAt.value > delayMs && player.hp < player.maxHp
  }

  function regenCooldownMs(now: number = Date.now(), delayMs = 5000) {
    return Math.max(0, delayMs - (now - lastDamageAt.value))
  }

  function respawnPlayer() {
    player.hp = player.maxHp
    isPlayerDead.value = false
    canTakeDamage.value = true
  }

  function setPlayerDead(dead: boolean) {
    isPlayerDead.value = dead
  }

  function setCanTakeDamage(canDamage: boolean) {
    canTakeDamage.value = canDamage
  }
  
  function setScreenDimensions(width: number, height: number) {
    screenWidth.value = width
    screenHeight.value = height
  }
  
  function setLevelGrid(gridInfo: {
    tileSize?: number
    groundRows?: number
    groundBottomY?: number
    groundTopY?: number
    characterGroundY?: number
  }) {
    Object.assign(levelGrid.value, gridInfo)
  }
  
  function calculateLevelGrid(screenHeight: number) {
    const tileSize = levelGrid.value.tileSize
    const groundRows = levelGrid.value.groundRows
    
    // Build from bottom up: start at screen bottom, build ground rows upward
    const groundBottomY = screenHeight - tileSize // Bottom row starts at screen bottom
    const groundTopY = groundBottomY - ((groundRows - 1) * tileSize) // Top row is (groundRows-1) tiles up
    const characterGroundY = groundTopY // Character ground is ON the ground top (no gap)
    
    setLevelGrid({
      groundBottomY,
      groundTopY,
      characterGroundY
    })
    
    return { groundBottomY, groundTopY, characterGroundY, tileSize }
  }

  return {
    // state
    score,
    lives,
    currentLevel,
    player,
    lastDamageAt,
    lastHealAt,
    isPlayerDead,
    canTakeDamage,
    screenWidth,
    screenHeight,
    levelGrid,
    // derived
    hpPercent,
    hpBucket,
    isPlayerDeadComputed,
    isGameOver,
    // actions
    setLevel,
    addScore,
    loseLife,
    resetLives,
    setPlayer,
    damagePlayer,
    healPlayer,
    respawnPlayer,
    setPlayerDead,
    setCanTakeDamage,
    setScreenDimensions,
    setLevelGrid,
    calculateLevelGrid,
    isRegenReady,
    regenCooldownMs,
  }
})


