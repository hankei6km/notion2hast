import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mergeProps } from '../../src/lib/props.ts'

describe('mergeProps()', () => {
  it('should merge properties', () => {
    assert.deepStrictEqual(mergeProps({}, {}), {})
    assert.deepStrictEqual(mergeProps({}, { alt: 'alt-1' }), { alt: 'alt-1' })
    assert.deepStrictEqual(mergeProps({ alt: 'alt-1' }, {}), { alt: 'alt-1' })
    assert.deepStrictEqual(mergeProps({ alt: 'alt-1' }, { alt: 'alt-1' }), {
      alt: 'alt-1'
    })
    assert.deepStrictEqual(mergeProps({ alt: 'alt-1' }, { alt: 'alt-2' }), {
      alt: 'alt-2'
    })
    assert.deepStrictEqual(mergeProps({ alt: 'alt-2' }, { alt: 'alt-1' }), {
      alt: 'alt-1'
    })
    assert.deepStrictEqual(mergeProps({ src: 'src-1' }, { alt: 'alt-1' }), {
      src: 'src-1',
      alt: 'alt-1'
    })
  })
  it('should merge properties with className', () => {
    assert.deepStrictEqual(
      mergeProps({ src: 'src-1' }, { alt: 'alt-1', className: 'class-1' }),
      {
        src: 'src-1',
        alt: 'alt-1',
        className: 'class-1'
      }
    )
    assert.deepStrictEqual(
      mergeProps({ src: 'src-1', className: 'class-1' }, { alt: 'alt-1' }),
      {
        src: 'src-1',
        alt: 'alt-1',
        className: 'class-1'
      }
    )
    assert.deepStrictEqual(
      mergeProps(
        { src: 'src-1', className: 'class-1' },
        { alt: 'alt-1', className: 'class-2' }
      ),
      {
        src: 'src-1',
        alt: 'alt-1',
        className: ['class-1', 'class-2']
      }
    )
    assert.deepStrictEqual(
      mergeProps(
        { src: 'src-1' },
        { alt: 'alt-1', className: ['class-1', 'class-2'] }
      ),
      {
        src: 'src-1',
        alt: 'alt-1',
        className: ['class-1', 'class-2']
      }
    )
    assert.deepStrictEqual(
      mergeProps(
        { src: 'src-1', className: ['class-1', 'class-2'] },
        { alt: 'alt-1' }
      ),
      {
        src: 'src-1',
        alt: 'alt-1',
        className: ['class-1', 'class-2']
      }
    )
    assert.deepStrictEqual(
      mergeProps(
        { src: 'src-1', className: ['class-1', 'class-2'] },
        { alt: 'alt-1', className: ['class-3', 'class-4'] }
      ),
      {
        src: 'src-1',
        alt: 'alt-1',
        className: ['class-1', 'class-2', 'class-3', 'class-4']
      }
    )
  })
  it('should merge properties with style', () => {
    assert.deepStrictEqual(
      mergeProps({ src: 'src-1' }, { alt: 'alt-1', style: 'style-1' }),
      {
        src: 'src-1',
        alt: 'alt-1',
        style: 'style-1'
      }
    )
    assert.deepStrictEqual(
      mergeProps({ src: 'src-1', style: 'style-1' }, { alt: 'alt-1' }),
      {
        src: 'src-1',
        alt: 'alt-1',
        style: 'style-1'
      }
    )
    assert.deepStrictEqual(
      mergeProps({ src: 'src-1', style: 'style-1;' }, { alt: 'alt-1' }),
      {
        src: 'src-1',
        alt: 'alt-1',
        style: 'style-1;'
      }
    )
    assert.deepStrictEqual(
      mergeProps(
        { src: 'src-1', style: 'style-1' },
        { alt: 'alt-1', style: 'style-2' }
      ),
      {
        src: 'src-1',
        alt: 'alt-1',
        style: 'style-1;style-2'
      }
    )
    assert.deepStrictEqual(
      mergeProps(
        { src: 'src-1', style: 'style-1;' },
        { alt: 'alt-1', style: 'style-2' }
      ),
      {
        src: 'src-1',
        alt: 'alt-1',
        style: 'style-1;style-2'
      }
    )
  })
  it('should not chage source objects', () => {
    const p1 = { src: 'src-1' }
    const p2 = { alt: 'alt-1' }
    assert.deepStrictEqual(mergeProps(p1, p2), {
      src: 'src-1',
      alt: 'alt-1'
    })
    assert.deepStrictEqual(p1, { src: 'src-1' })
    assert.deepStrictEqual(p2, { alt: 'alt-1' })
  })
})
