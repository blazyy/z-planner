type BadgeClassNamesObj = {
  [color: string]: string
}

export const BADGE_COLOR_POWER = 500
export const BADGE_HOVER_COLOR_POWER = 700

export const availableColors = [
  'slate',
  'stone',
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
]

const badgeClassNames: BadgeClassNamesObj = {
  slate: `bg-slate-${BADGE_COLOR_POWER} hover:bg-slate-${BADGE_HOVER_COLOR_POWER} text-white`,
  stone: `bg-stone-${BADGE_COLOR_POWER} hover:bg-stone-${BADGE_HOVER_COLOR_POWER} text-white`,
  red: `bg-red-${BADGE_COLOR_POWER} hover:bg-red-${BADGE_HOVER_COLOR_POWER} text-white`,
  orange: `bg-orange-${BADGE_COLOR_POWER} hover:bg-orange-${BADGE_HOVER_COLOR_POWER} text-white`,
  yellow: `bg-yellow-${BADGE_COLOR_POWER} hover:bg-yellow-${BADGE_HOVER_COLOR_POWER} text-white`,
  lime: `bg-lime-${BADGE_COLOR_POWER} hover:bg-lime-${BADGE_HOVER_COLOR_POWER} text-white`,
  green: `bg-green-${BADGE_COLOR_POWER} hover:bg-green-${BADGE_HOVER_COLOR_POWER} text-white`,
  emerald: `bg-emerald-${BADGE_COLOR_POWER} hover:bg-emerald-${BADGE_HOVER_COLOR_POWER} text-white`,
  teal: `bg-teal-${BADGE_COLOR_POWER} hover:bg-teal-${BADGE_HOVER_COLOR_POWER} text-white`,
  cyan: `bg-cyan-${BADGE_COLOR_POWER} hover:bg-cyan-${BADGE_HOVER_COLOR_POWER} text-white`,
  sky: `bg-sky-${BADGE_COLOR_POWER} hover:bg-sky-${BADGE_HOVER_COLOR_POWER} text-white`,
  blue: `bg-blue-${BADGE_COLOR_POWER} hover:bg-blue-${BADGE_HOVER_COLOR_POWER} text-white`,
  indigo: `bg-indigo-${BADGE_COLOR_POWER} hover:bg-indigo-${BADGE_HOVER_COLOR_POWER} text-white`,
  violet: `bg-violet-${BADGE_COLOR_POWER} hover:bg-violet-${BADGE_HOVER_COLOR_POWER} text-white`,
  purple: `bg-purple-${BADGE_COLOR_POWER} hover:bg-purple-${BADGE_HOVER_COLOR_POWER} text-white`,
  fuchsia: `bg-fuchsia-${BADGE_COLOR_POWER} hover:bg-fuchsia-${BADGE_HOVER_COLOR_POWER} text-white`,
  pink: `bg-pink-${BADGE_COLOR_POWER} hover:bg-pink-${BADGE_HOVER_COLOR_POWER} text-white`,
  rose: `bg-rose-${BADGE_COLOR_POWER} hover:bg-rose-${BADGE_HOVER_COLOR_POWER} text-white`,
}

export const getCategoryBadgeClassNames = (color: string, clickable: boolean = true): string => {
  return `${badgeClassNames[color]} ${!clickable ? 'cursor-default' : 'cursor-pointer'}`
}
