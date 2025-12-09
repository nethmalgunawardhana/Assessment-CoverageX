import '@testing-library/jest-dom'

// Mock fetch API
global.fetch = jest.fn()

// Mock process.env
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
