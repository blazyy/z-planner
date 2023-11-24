import cors from 'cors'
import express from 'express'
import './loadEnvironment.mjs'
import cards from './routes/planner/cards.mjs'
import columns from './routes/planner/columns.mjs'
import planner from './routes/planner/planner.mjs'

const PORT = process.env.PORT || 5050
const app = express()

const logger = (req, res, next) => {
  // console.log('log')
  next()
}
app.use(logger)

app.use(cors())
app.use(express.json())

// Load the /posts routes
app.use('/', [planner, columns, cards])

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send('Uh oh! An unexpected error occured.')
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})
