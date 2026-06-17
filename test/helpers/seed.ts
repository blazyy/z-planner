import Planner from '@/models/Planner'

type PlannerSeed = {
  clerkUserId: string
  boardOrder?: string[]
  boards?: Record<string, unknown>
  columns?: Record<string, unknown>
  categories?: Record<string, unknown>
  taskCards?: Record<string, unknown>
  subTasks?: Record<string, unknown>
}

/**
 * Insert a planner document for tenancy/cascade tests. Maps default to empty so
 * partial seeds are valid against the schema. Returns the lean stored doc.
 */
export async function seedPlanner(seed: PlannerSeed) {
  await Planner.create({
    clerkUserId: seed.clerkUserId,
    boardOrder: seed.boardOrder ?? [],
    boards: seed.boards ?? {},
    columns: seed.columns ?? {},
    categories: seed.categories ?? {},
    taskCards: seed.taskCards ?? {},
    subTasks: seed.subTasks ?? {},
  })
  return getPlanner(seed.clerkUserId)
}

/** Read back a planner document as a plain object for assertions. */
export async function getPlanner(clerkUserId: string) {
  return Planner.findOne({ clerkUserId }).lean()
}

export { Planner }
