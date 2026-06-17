import mongoose, { InferSchemaType, Model, Schema } from 'mongoose'

const subTaskSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: '' },
    checked: { type: Boolean, default: false },
  },
  { _id: false }
)

const taskCardSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: '' },
    category: { type: String, required: true },
    content: { type: String, default: '' },
    status: { type: String, required: true, enum: ['created', 'completed', 'archived'] },
    subTasks: [String],
    // Internal, UI-invisible. Set the moment a card is archived on read so the
    // archived-card purge (app/api/planner/route.ts) can keep the N most-recent
    // archived cards and drop the oldest. Optional: legacy archived cards
    // predating this field have no archivedAt and are treated as oldest.
    archivedAt: { type: Date },
  },
  { _id: false }
)

const columnSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    taskCards: [String],
  },
  { _id: false }
)

const boardSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    columns: [String],
    categories: [String],
  },
  { _id: false }
)

const categorySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
  },
  { _id: false }
)

const plannerSchema = new Schema(
  {
    // The tenancy key for every query in the app — unique creates the index.
    clerkUserId: { type: String, required: true, unique: true },
    boardOrder: [String],
    boards: { type: Map, of: boardSchema, default: {} },
    columns: { type: Map, of: columnSchema, default: {} },
    categories: { type: Map, of: categorySchema, default: {} },
    taskCards: { type: Map, of: taskCardSchema, default: {} },
    subTasks: { type: Map, of: subTaskSchema, default: {} },
  },
  { minimize: false, timestamps: true }
)

export type PlannerDoc = InferSchemaType<typeof plannerSchema>

const Planner: Model<PlannerDoc> =
  (mongoose.models.Planner as Model<PlannerDoc>) || mongoose.model<PlannerDoc>('Planner', plannerSchema, 'planner')

export default Planner
