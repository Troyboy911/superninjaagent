const { OpenAI } = require('openai')
const { Anthropic } = require('@anthropic-ai/sdk')
const { GoogleGenerativeAI } = require('google-generative-ai')

async function chatRoutes(fastify, options) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const gemini = genAI.getGenerativeModel({ model: 'gemini-pro' })

  fastify.post('/', async (request, reply) => {
    const { message, provider = 'openai' } = request.body

    if (!message) {
      return reply.status(400).send({ error: 'Message is required' })
    }

    try {
      let replyText = ''

      switch (provider) {
        case 'openai':
          const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
            max_tokens: 1000
          })
          replyText = openaiResponse.choices[0].message.content
          break

        case 'anthropic':
          const anthropicResponse = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [{ role: 'user', content: message }]
          })
          replyText = anthropicResponse.content[0].text
          break

        case 'gemini':
          const geminiResponse = await gemini.generateContent(message)
          replyText = geminiResponse.response.text()
          break

        default:
          return reply.status(400).send({ error: 'Invalid provider' })
      }

      return { reply: replyText }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Failed to generate response' })
    }
  })

  fastify.post('/stream', async (request, reply) => {
    const { message, provider = 'openai' } = request.body

    reply.raw.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    try {
      if (provider === 'openai') {
        const stream = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          stream: true
        })

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          reply.raw.write(content)
        }
      }

      reply.raw.end()
    } catch (error) {
      fastify.log.error(error)
      reply.raw.write('Error: Failed to stream response')
      reply.raw.end()
    }
  })
}

module.exports = chatRoutes