type BadgeClassNamesObj = {
  [color: string]: string
}

// const badgeClassNames: BadgeClassNamesObj = {
//   slate: 'bg-slate-500 hover:bg-slate-600 text-white',
//   stone: 'bg-stone-500 hover:bg-stone-600 text-white',
//   red: 'bg-red-500 hover:bg-red-600 text-white',
//   orange: 'bg-orange-500 hover:bg-orange-600 text-white',
//   yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white',
//   lime: 'bg-lime-500 hover:bg-lime-600 text-white',
//   green: 'bg-green-500 hover:bg-green-600 text-white',
//   emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
//   teal: 'bg-teal-500 hover:bg-teal-600 text-white',
//   cyan: 'bg-cyan-500 hover:bg-cyan-600 text-white',
//   sky: 'bg-sky-500 hover:bg-sky-600 text-white',
//   blue: 'bg-blue-500 hover:bg-blue-600 text-white',
//   indigo: 'bg-indigo-500 hover:bg-indigo-600 text-white',
//   violet: 'bg-violet-500 hover:bg-violet-600 text-white',
//   purple: 'bg-purple-500 hover:bg-purple-600 text-white',
//   fuchsia: 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white',
//   pink: 'bg-pink-500 hover:bg-pink-600 text-white',
//   rose: 'bg-rose-500 hover:bg-rose-600 text-white',
// }
const badgeClassNames: BadgeClassNamesObj = {
  slate: 'bg-slate-700 hover:bg-slate-800 text-white',
  stone: 'bg-slate-700 hover:bg-slate-800 text-white',
  red: 'bg-slate-700 hover:bg-slate-800 text-white',
  orange: 'bg-slate-700 hover:bg-slate-800 text-white',
  yellow: 'bg-slate-700 hover:bg-slate-800 text-white',
  lime: 'bg-slate-700 hover:bg-slate-800 text-white',
  green: 'bg-slate-700 hover:bg-slate-800 text-white',
  emerald: 'bg-slate-700 hover:bg-slate-800 text-white',
  teal: 'bg-slate-700 hover:bg-slate-800 text-white',
  cyan: 'bg-slate-700 hover:bg-slate-800 text-white',
  sky: 'bg-slate-700 hover:bg-slate-800 text-white',
  blue: 'bg-slate-700 hover:bg-slate-800 text-white',
  indigo: 'bg-slate-700 hover:bg-slate-800 text-white',
  violet: 'bg-slate-700 hover:bg-slate-800 text-white',
  purple: 'bg-slate-700 hover:bg-slate-800 text-white',
  fuchsia: 'bg-slate-700 hover:bg-slate-800 text-white',
  pink: 'bg-slate-700 hover:bg-slate-800 text-white',
  rose: 'bg-slate-700 hover:bg-slate-800 text-white',
}

export const getCategoryBadgeClassNames = (color: string, clickable: boolean = true): string => {
  return `${badgeClassNames[color]} ${!clickable ? 'cursor-default' : 'cursor-pointer'}`
}
