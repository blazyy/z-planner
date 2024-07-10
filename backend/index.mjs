import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import cors from 'cors'
import express from 'express'
import './loadEnvironment.mjs'
import boards from './routes/planner/boards.mjs'
import cards from './routes/planner/cards.mjs'
import categories from './routes/planner/categories.mjs'
import columns from './routes/planner/columns.mjs'
import subtasks from './routes/planner/subtasks.mjs'

const PORT = process.env.PORT || 5050
const app = express()
const allowedOrigin = process.env.ALLOWED_ORIGIN

const corsOptions = {
  origin: function (origin, callback) {
    if (origin === allowedOrigin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}

app.use(cors(corsOptions))
app.use(express.json())

app.use(ClerkExpressRequireAuth())

app.use('/', [boards, columns, cards, subtasks, categories])

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send('Uh oh! An unexpected error occured.')
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})
