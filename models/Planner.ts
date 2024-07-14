const mongoose = require('mongoose')
const { Schema } = mongoose

const subTaskSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    checked: { type: Boolean, default: false },
  },
  { _id: false }
)

const taskCardSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String },
    status: { type: String, required: true },
    subTasks: [String],
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
    clerkUserId: { type: String, required: true },
    boardOrder: [String],
    boards: { type: Map, of: boardSchema, default: {} },
    columns: { type: Map, of: columnSchema, default: {} },
    categories: { type: Map, of: categorySchema, default: {} },
    taskCards: { type: Map, of: taskCardSchema, default: {} },
    subTasks: { type: Map, of: subTaskSchema, default: {} },
  },
  { minimize: false }
)

export default mongoose.models.Planner || mongoose.model('Planner', plannerSchema, 'planner')
