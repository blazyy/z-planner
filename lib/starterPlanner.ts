import {
  NANOID,
  UNASSIGNED_CATEGORY_COLOR,
  UNASSIGNED_CATEGORY_ID,
  UNASSIGNED_CATEGORY_NAME,
} from '@/constants/constants'

/*
 * Starter board seeded for brand-new users on their very first load.
 *
 * Both the collection GET (app/api/planner/route.ts) and the summary GET
 * (app/api/planner/summary/route.ts) feed the result of buildStarterPlanner into
 * the get-or-create upsert's $setOnInsert. Because $setOnInsert only writes on
 * INSERT, an existing user's document is NEVER touched/reseeded — the builder
 * runs per request but its output is discarded by Mongo when the doc already
 * exists. Sharing one builder keeps the two endpoints from drifting apart.
 *
 * Every id is minted fresh from NANOID (17-char lowercase alphanumeric, the
 * shape lib/apiSchemas.ts#entityId validates) so two concurrent first loads that
 * each build a starter doc still converge on a single persisted document via the
 * unique clerkUserId index — only the inserting request's ids survive.
 *
 * The per-board default 'unassigned' category is the one exception to the
 * generated-id rule: it uses the literal UNASSIGNED_CATEGORY_ID, matching what
 * the client mints when creating a board (utils/.../addNewBoardToPlanner.ts) and
 * the categoryId union in lib/apiSchemas.ts.
 */

type StarterPlanner = {
  clerkUserId: string
  boardOrder: string[]
  boards: Record<string, { id: string; name: string; columns: string[]; categories: string[] }>
  columns: Record<string, { id: string; name: string; taskCards: string[] }>
  categories: Record<string, { id: string; name: string; color: string }>
  taskCards: Record<
    string,
    { id: string; title: string; category: string; content: string; status: 'created'; subTasks: string[] }
  >
  subTasks: Record<string, { id: string; title: string; checked: boolean }>
}

export function buildStarterPlanner(clerkUserId: string): StarterPlanner {
  const boardId = NANOID()
  const todoColumnId = NANOID()
  const inProgressColumnId = NANOID()
  const doneColumnId = NANOID()
  const card1Id = NANOID()
  const card2Id = NANOID()

  const unassignedCategory = {
    id: UNASSIGNED_CATEGORY_ID,
    name: UNASSIGNED_CATEGORY_NAME,
    color: UNASSIGNED_CATEGORY_COLOR,
  }

  return {
    clerkUserId,
    boardOrder: [boardId],
    boards: {
      [boardId]: {
        id: boardId,
        name: 'My First Board',
        columns: [todoColumnId, inProgressColumnId, doneColumnId],
        categories: [unassignedCategory.id],
      },
    },
    columns: {
      [todoColumnId]: { id: todoColumnId, name: 'To Do', taskCards: [card1Id, card2Id] },
      [inProgressColumnId]: { id: inProgressColumnId, name: 'In Progress', taskCards: [] },
      [doneColumnId]: { id: doneColumnId, name: 'Done', taskCards: [] },
    },
    categories: {
      [unassignedCategory.id]: unassignedCategory,
    },
    taskCards: {
      [card1Id]: {
        id: card1Id,
        title: 'Welcome to your planner',
        category: unassignedCategory.id,
        content: 'Drag this card between columns, or open it to add subtasks.',
        status: 'created',
        subTasks: [],
      },
      [card2Id]: {
        id: card2Id,
        title: 'Create your own board',
        category: unassignedCategory.id,
        content: 'Use the sidebar to add a new board when you are ready.',
        status: 'created',
        subTasks: [],
      },
    },
    subTasks: {},
  }
}
