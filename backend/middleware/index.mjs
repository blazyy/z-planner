const handleServerError = (res, error) => {
  console.error(error)
  res.status(500).send('Internal Server Error')
}

export const errorHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next)
  } catch (error) {
    handleServerError(res, error)
  }
}
