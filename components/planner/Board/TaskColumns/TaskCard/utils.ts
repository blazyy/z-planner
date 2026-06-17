type BadgeClassNamesObj = {
  [color: string]: string
}

// Backgrounds use the -700 shade so white text clears WCAG AA (4.5:1) for
// every color in both light and dark mode (the worst case, yellow/lime/green,
// sits at ~4.9:1). The mid-tone -500 shades the palette used previously failed
// AA badly for the bright hues (yellow-500 with white text was ~1.9:1). Hover
// deepens one more step to -800. The badge is a self-contained colored pill
// with fixed white text, so the surrounding theme does not affect its contrast.
export const badgeClassNames: BadgeClassNamesObj = {
  slate: 'bg-slate-700 hover:bg-slate-800 text-white',
  stone: 'bg-stone-700 hover:bg-stone-800 text-white',
  red: 'bg-red-700 hover:bg-red-800 text-white',
  orange: 'bg-orange-700 hover:bg-orange-800 text-white',
  yellow: 'bg-yellow-700 hover:bg-yellow-800 text-white',
  lime: 'bg-lime-700 hover:bg-lime-800 text-white',
  green: 'bg-green-700 hover:bg-green-800 text-white',
  emerald: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  teal: 'bg-teal-700 hover:bg-teal-800 text-white',
  cyan: 'bg-cyan-700 hover:bg-cyan-800 text-white',
  sky: 'bg-sky-700 hover:bg-sky-800 text-white',
  blue: 'bg-blue-700 hover:bg-blue-800 text-white',
  indigo: 'bg-indigo-700 hover:bg-indigo-800 text-white',
  violet: 'bg-violet-700 hover:bg-violet-800 text-white',
  purple: 'bg-purple-700 hover:bg-purple-800 text-white',
  fuchsia: 'bg-fuchsia-700 hover:bg-fuchsia-800 text-white',
  pink: 'bg-pink-700 hover:bg-pink-800 text-white',
  rose: 'bg-rose-700 hover:bg-rose-800 text-white',
}

export const badgeClassNamesWithoutHover: BadgeClassNamesObj = {
  slate: 'bg-slate-700 text-white',
  stone: 'bg-stone-700 text-white',
  red: 'bg-red-700 text-white',
  orange: 'bg-orange-700 text-white',
  yellow: 'bg-yellow-700 text-white',
  lime: 'bg-lime-700 text-white',
  green: 'bg-green-700 text-white',
  emerald: 'bg-emerald-700 text-white',
  teal: 'bg-teal-700 text-white',
  cyan: 'bg-cyan-700 text-white',
  sky: 'bg-sky-700 text-white',
  blue: 'bg-blue-700 text-white',
  indigo: 'bg-indigo-700 text-white',
  violet: 'bg-violet-700 text-white',
  purple: 'bg-purple-700 text-white',
  fuchsia: 'bg-fuchsia-700 text-white',
  pink: 'bg-pink-700 text-white',
  rose: 'bg-rose-700 text-white',
}
