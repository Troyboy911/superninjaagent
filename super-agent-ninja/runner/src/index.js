require('dotenv').config()
const Fastify = require('fastify')
const cors = require('@fastify/cors')
const { v4: uuidv4 } = require('uuid')

const taskManager = require('./utils/taskManager')
const defaultAgent = require('./agents/default')

const fastify = Fastify({
  logger: true
})

async function build() {
  await fastify.register(cors, {
    origin: true
  })

  // Task execution endpoint
  fastify.post('/run', async (request, reply) => {
    const { task, agent = 'default', options = {} } = request.body

    if (!task) {
      return reply.status(400).send({ error: 'Task is required' })
    }

    const taskId = uuidv4()
    
    // Store task
    taskManager.createTask(taskId, {
      task,
      agent,
      options,
      status: 'pending',
      createdAt: new Date()
    })

    // Execute asynchronously
    setImmediate(async () => {
      try {
        await taskManager.updateTask(taskId, { status: 'running' })
        
        let result
        switch (agent) {
          case 'default':
            result = await defaultAgent.execute(task, options)
            break
          default:
            throw new Error(`Unknown agent: ${agent}`)
        }

        await taskManager.updateTask(taskId, {
          status: 'completed',
          result,
          completedAt: new Date()
        })
      } catch (error) {
        await taskManager.updateTask(taskId, {
          status: 'failed',
          error: error.message,
          failedAt: new Date()
        })
      }
    })

    return { taskId, status: 'pending' }
  })

  // Task status endpoint
  fastify.get('/status/:id', async (request, reply) => {
    const { id } = request.params
    const task = taskManager.getTask(id)

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' })
    }

    return task
  })

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return fastify
}

async function start() {
  try {
    const server = await build()
    const port = process.env.PORT || 5000
    
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`Runner service running on port ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  start()
}

module.exports = build