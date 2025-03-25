import { vi } from 'vitest'
import { setupTestDatabase } from './src/database/testDatabase'
import { setupTestCache } from './src/cache'
import { setupTestLogger } from './src/logger'

// Setup test database
beforeAll(async () => {
  await setupTestDatabase()
})

// Setup test cache
beforeAll(async () => {
  await setupTestCache()
})

// Setup test logger
beforeAll(() => {
  setupTestLogger()
})

// Clear mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Reset modules after each test
afterEach(() => {
  vi.resetModules()
})

// Reset mocks after each test
afterEach(() => {
  vi.resetAllMocks()
})
