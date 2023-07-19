export type Avatar = 'snail' | 'chicken' | 'mushroom' | 'rhino' | 'trunk'

export type FoodType = 'chicken' | 'sandwich' | 'waffle' | 'taco' | 'cake' | 'ramen' | 'hotdog' | 'burger'

export type Vector2 = {
  x: number
  y: number
}

export type Player = {
  id: string
  avatar: Avatar
  food: number
  position: Vector2
  velocity: Vector2
  isMoving: boolean
  isFlipped: boolean
}

export type Food = {
  id: string
  type: FoodType
  position: Vector2
}

export type GameState = {
  players: Player[]
  food: Food[]
}