import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { clonePlayer, type PlayerStats } from '@/assets/characters/Enemy'

export const useGameStore = defineStore('game', () => {
  // state
  const score = ref(0)
  const lives = ref(3)
  const currentLevel = ref(1)
  const player = reactive<PlayerStats>(clonePlayer())

  // derived
  const hpPercent = computed(() => player.hp / player.maxHp)
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
  }

  function healPlayer(n = 1) {
    player.hp = Math.min(player.maxHp, player.hp + n)
  }

  function respawnPlayer() {
    player.hp = player.maxHp
  }

  return {
    // state
    score,
    lives,
    currentLevel,
    player,
    // derived
    hpPercent,
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
  }
})


