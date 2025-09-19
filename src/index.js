require('dotenv').config()
const Fastify = require('fastify')
const cors = require('@fastify/cors')
const helmet = require('@fastify/helmet')
const rateLimit = require('@fastify/rate-limit')

const chatRoutes = require('./routes/chat')
const agentRoutes = require('./routes/agents')

const fastify = Fastify({
  logger: true
})

async function build() {
  // Register plugins
  await fastify.register(cors, {
    origin: true
  })
  
  await fastify.register(helmet)
  
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })

  // Register routes
  await fastify.register(chatRoutes, { prefix: '/chat' })
  await fastify.register(agentRoutes, { prefix: '/agents' })

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return fastify
}

async function start() {
  try {
    const server = await build()
    const port = process.env.PORT || 4000
    
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`API server running on port ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  start()
}

module.exports = build