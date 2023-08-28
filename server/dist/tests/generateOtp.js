
import { generateOTP } from '../helpers/helper.js'
import assert from 'assert'
import { describe, it } from 'node:test';

describe('checks if length is 6', () => {
  it('should return the same length', () => {
    const result = generateOTP()
    assert.strictEqual(result?.length, 6)
  })
})
