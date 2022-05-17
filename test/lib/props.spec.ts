import { mergeProps } from '../../src/lib/props'

describe('mergeProps()', () => {
  it('should merge properties', () => {
    expect(mergeProps({}, {})).toEqual({})
    expect(mergeProps({}, { alt: 'alt-1' })).toEqual({ alt: 'alt-1' })
    expect(mergeProps({ alt: 'alt-1' }, {})).toEqual({ alt: 'alt-1' })
    expect(mergeProps({ alt: 'alt-1' }, { alt: 'alt-1' })).toEqual({
      alt: 'alt-1'
    })
    expect(mergeProps({ alt: 'alt-1' }, { alt: 'alt-2' })).toEqual({
      alt: 'alt-2'
    })
    expect(mergeProps({ alt: 'alt-2' }, { alt: 'alt-1' })).toEqual({
      alt: 'alt-1'
    })
    expect(mergeProps({ src: 'src-1' }, { alt: 'alt-1' })).toEqual({
      src: 'src-1',
      alt: 'alt-1'
    })
  })
  it('should merge properties with className', () => {
    expect(
      mergeProps({ src: 'src-1' }, { alt: 'alt-1', className: 'class-1' })
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      className: 'class-1'
    })
    expect(
      mergeProps({ src: 'src-1', className: 'class-1' }, { alt: 'alt-1' })
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      className: 'class-1'
    })
    expect(
      mergeProps(
        { src: 'src-1', className: 'class-1' },
        { alt: 'alt-1', className: 'class-2' }
      )
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      className: ['class-1', 'class-2']
    })
    expect(
      mergeProps(
        { src: 'src-1' },
        { alt: 'alt-1', className: ['class-1', 'class-2'] }
      )
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      className: ['class-1', 'class-2']
    })
    expect(
      mergeProps(
        { src: 'src-1', className: ['class-1', 'class-2'] },
        { alt: 'alt-1' }
      )
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      className: ['class-1', 'class-2']
    })
    expect(
      mergeProps(
        { src: 'src-1', className: ['class-1', 'class-2'] },
        { alt: 'alt-1', className: ['class-3', 'class-4'] }
      )
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      className: ['class-1', 'class-2', 'class-3', 'class-4']
    })
  })
  it('should merge properties with style', () => {
    expect(
      mergeProps({ src: 'src-1' }, { alt: 'alt-1', style: 'style-1' })
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      style: 'style-1'
    })
    expect(
      mergeProps({ src: 'src-1', style: 'style-1' }, { alt: 'alt-1' })
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      style: 'style-1'
    })
    expect(
      mergeProps({ src: 'src-1', style: 'style-1;' }, { alt: 'alt-1' })
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      style: 'style-1;'
    })
    expect(
      mergeProps(
        { src: 'src-1', style: 'style-1' },
        { alt: 'alt-1', style: 'style-2' }
      )
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      style: 'style-1;style-2'
    })
    expect(
      mergeProps(
        { src: 'src-1', style: 'style-1;' },
        { alt: 'alt-1', style: 'style-2' }
      )
    ).toEqual({
      src: 'src-1',
      alt: 'alt-1',
      style: 'style-1;style-2'
    })
  })
  it('should not chage source objects', () => {
    const p1 = { src: 'src-1' }
    const p2 = { alt: 'alt-1' }
    expect(mergeProps(p1, p2)).toEqual({
      src: 'src-1',
      alt: 'alt-1'
    })
    expect(p1).toEqual({ src: 'src-1' })
    expect(p2).toEqual({ alt: 'alt-1' })
  })
})
