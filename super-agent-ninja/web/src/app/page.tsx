'use client'

import { useState } from 'react'
import Chat from '@/components/Chat'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Super Agent Ninja 🥷
          </h1>
          <Chat />
        </div>
      </div>
    </main>
  )
}