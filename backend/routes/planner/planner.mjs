import express from 'express'
import db from '../../db/conn.mjs'

const router = express.Router()

// Get entire data
router.get('/', async (req, res) => {
  try {
    const results = await db.collection('planner').find().toArray()
    res.send(results).status(200)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

// Get all planner data for given user
router.get('/planner', async (req, res) => {
  try {
    const results = await db
      .collection('planner')
      .aggregate([
        { $match: { username: 'user1' } },
        { $project: { boardOrder: 1, boards: 1, columns: 1, categories: 1, taskCards: 1, subTasks: 1, _id: 0 } },
        { $limit: 1 },
      ])
      .toArray()
    res.send(results[0]).status(200)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

router.post('/planner/users/:email', async (req, res) => {
  const email = req.params.email

  const user = await db.collection('planner').findOne({ username: email })
  if (user) {
    return res.status(409).send('User already exists')
  }

  const newUser = {
    username: email,
    boardOrder: [],
    boards: {},
    columns: {},
    categories: {},
    taskCards: {},
    subTasks: {},
  }

  try {
    await db.collection('planner').insertOne(newUser)
    res.status(201).send('User added successfully')
  } catch (error) {
    res.status(500).send('Error adding user')
  }
})

export default router
