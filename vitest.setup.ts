import '@testing-library/jest-dom'
import { vi } from 'vitest'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') })

class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver
  })
}

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
})

// Stub crypto.randomUUID for JSDOM
if (typeof crypto === 'undefined') {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => Math.random().toString(36).substring(7)
    }
  });
} else if (!crypto.randomUUID) {
  Object.defineProperty(crypto, 'randomUUID', {
    value: () => Math.random().toString(36).substring(7)
  });
}
