import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)

    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
  })
})
