const fetch = require('node-fetch')

async function agentRoutes(fastify, options) {
  const RUNNER_URL = process.env.RUNNER_URL || 'http://localhost:5000'

  fastify.post('/run', async (request, reply) => {
    const { task, agent = 'default' } = request.body

    if (!task) {
      return reply.status(400).send({ error: 'Task is required' })
    }

    try {
      const response = await fetch(`${RUNNER_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, agent }),
      })

      if (!response.ok) {
        throw new Error('Runner service error')
      }

      const result = await response.json()
      return result
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Failed to run agent task' })
    }
  })

  fastify.get('/status/:id', async (request, reply) => {
    const { id } = request.params

    try {
      const response = await fetch(`${RUNNER_URL}/status/${id}`)
      const result = await response.json()
      return result
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Failed to get task status' })
    }
  })
}

module.exports = agentRoutes