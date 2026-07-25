import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ColorProps } from '../../src/lib/color.ts'

describe('ColorProps.props()', () => {
  it('should retun text class', () => {
    const c = new ColorProps({})
    assert.deepStrictEqual(c.props('gray'), { style: 'color:#9B9A97' })
    assert.deepStrictEqual(c.props('brown'), { style: 'color:#64473A' })
    assert.deepStrictEqual(c.props('orange'), { style: 'color:#D9730D' })
    assert.deepStrictEqual(c.props('yellow'), { style: 'color:#DFAB01' })
    assert.deepStrictEqual(c.props('green'), { style: 'color:#0F7B6C' })
    assert.deepStrictEqual(c.props('blue'), { style: 'color:#0B6E99' })
    assert.deepStrictEqual(c.props('purple'), { style: 'color:#6940A5' })
    assert.deepStrictEqual(c.props('pink'), { style: 'color:#AD1A72' })
    assert.deepStrictEqual(c.props('red'), { style: 'color:#E03E3E' })
    assert.deepStrictEqual(c.props('gray_background'), {
      style: 'background-color:#EBECED'
    })
    assert.deepStrictEqual(c.props('brown_background'), {
      style: 'background-color:#E9E5E3'
    })
    assert.deepStrictEqual(c.props('orange_background'), {
      style: 'background-color:#FAEBDD'
    })
    assert.deepStrictEqual(c.props('yellow_background'), {
      style: 'background-color:#FBF3DB'
    })
    assert.deepStrictEqual(c.props('green_background'), {
      style: 'background-color:#DDEDEA'
    })
    assert.deepStrictEqual(c.props('blue_background'), {
      style: 'background-color:#DDEBF1'
    })
    assert.deepStrictEqual(c.props('purple_background'), {
      style: 'background-color:#EAE4F2'
    })
    assert.deepStrictEqual(c.props('pink_background'), {
      style: 'background-color:#F4DFEB'
    })
    assert.deepStrictEqual(c.props('red_background'), {
      style: 'background-color:#FBE4E4'
    })
    assert.deepStrictEqual(c.props('default'), {})
    assert.deepStrictEqual(c.props('foo'), {})
  })
  it('should retun text class', () => {
    const c = new ColorProps({
      colorPropertiesMap: {
        default: {
          className: 'default-class'
        }
      }
    })
    assert.deepStrictEqual(c.props('gray'), { style: 'color:#9B9A97' })
    assert.deepStrictEqual(c.props('brown'), { style: 'color:#64473A' })
    assert.deepStrictEqual(c.props('orange'), { style: 'color:#D9730D' })
    assert.deepStrictEqual(c.props('yellow'), { style: 'color:#DFAB01' })
    assert.deepStrictEqual(c.props('green'), { style: 'color:#0F7B6C' })
    assert.deepStrictEqual(c.props('blue'), { style: 'color:#0B6E99' })
    assert.deepStrictEqual(c.props('purple'), { style: 'color:#6940A5' })
    assert.deepStrictEqual(c.props('pink'), { style: 'color:#AD1A72' })
    assert.deepStrictEqual(c.props('red'), { style: 'color:#E03E3E' })
    assert.deepStrictEqual(c.props('gray_background'), {
      style: 'background-color:#EBECED'
    })
    assert.deepStrictEqual(c.props('brown_background'), {
      style: 'background-color:#E9E5E3'
    })
    assert.deepStrictEqual(c.props('orange_background'), {
      style: 'background-color:#FAEBDD'
    })
    assert.deepStrictEqual(c.props('yellow_background'), {
      style: 'background-color:#FBF3DB'
    })
    assert.deepStrictEqual(c.props('green_background'), {
      style: 'background-color:#DDEDEA'
    })
    assert.deepStrictEqual(c.props('blue_background'), {
      style: 'background-color:#DDEBF1'
    })
    assert.deepStrictEqual(c.props('purple_background'), {
      style: 'background-color:#EAE4F2'
    })
    assert.deepStrictEqual(c.props('pink_background'), {
      style: 'background-color:#F4DFEB'
    })
    assert.deepStrictEqual(c.props('red_background'), {
      style: 'background-color:#FBE4E4'
    })
    assert.deepStrictEqual(c.props('default'), {
      className: 'default-class'
    })
    assert.deepStrictEqual(c.props('foo'), {})
  })
})
