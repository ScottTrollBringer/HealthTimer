// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import WipBand from './WipBand'

afterEach(() => {
  cleanup()
})

describe('WipBand', () => {
  it('renders "WIP" text', () => {
    render(<WipBand />)
    expect(screen.getByText('WIP')).toBeTruthy()
  })

  it('renders ON/OFF button with disabled attribute', () => {
    render(<WipBand />)
    const btn = screen.getByRole('button', { name: 'ON/OFF' })
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('clicking disabled button causes no error and button remains disabled', () => {
    render(<WipBand />)
    const btn = screen.getByRole('button', { name: 'ON/OFF' })
    fireEvent.click(btn)
    expect(btn.hasAttribute('disabled')).toBe(true)
  })
})
