/*
 * perf-6 feature flag: column virtualization.
 *
 * DEFAULT OFF. When off, ColumnTasks renders exactly as it did before perf-6
 * (a plain .map over the visible card ids). When on, the card list is rendered
 * through react-window so only the visible window of cards is mounted, which is
 * the win for very tall columns.
 *
 * The flag is read once at module load from a build-time-inlined public env var
 * (NEXT_PUBLIC_*). Anything other than the exact string 'true' leaves it off,
 * so an unset var, a typo, or 'false' all keep today's behavior. We intentionally
 * do NOT default this on: the @hello-pangea/dnd + react-window integration has
 * known rough edges (documented in VirtualizedColumnTasks), and the flag-off path
 * is the supported, behavior-identical default.
 */
export const VIRTUALIZE_COLUMNS = process.env.NEXT_PUBLIC_VIRTUALIZE_COLUMNS === 'true'

// Fixed row height (px) used by react-window to compute the windowed slice.
// react-window's FixedSizeList needs a constant item size; task cards are
// variable-height in reality, so this is a pragmatic estimate (see the
// flag-ON limitation note in VirtualizedColumnTasks). Only consulted on the
// flag-ON path.
export const VIRTUALIZED_CARD_ROW_HEIGHT = 140

// Pixel height of the scrollable viewport for the windowed list. Mirrors the
// 82vh min/max height the non-virtualized column uses; react-window needs a
// concrete number rather than a vh string. Only consulted on the flag-ON path.
export const VIRTUALIZED_LIST_HEIGHT = 700
