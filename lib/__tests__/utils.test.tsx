import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility', () => {
  it('merges classes', () => {
    const res = cn('a', 'b')
    expect(res).toContain('a')
    expect(res).toContain('b')
  })
})
