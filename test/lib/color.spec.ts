import { ColorProps } from '../../src/lib/color'

describe('ColorProps.props()', () => {
  it('should retun text class', () => {
    const c = new ColorProps({})
    expect(c.props('gray')).toEqual({ style: 'color:#9B9A97' })
    expect(c.props('brown')).toEqual({ style: 'color:#64473A' })
    expect(c.props('orange')).toEqual({ style: 'color:#D9730D' })
    expect(c.props('yellow')).toEqual({ style: 'color:#DFAB01' })
    expect(c.props('green')).toEqual({ style: 'color:#0F7B6C' })
    expect(c.props('blue')).toEqual({ style: 'color:#0B6E99' })
    expect(c.props('purple')).toEqual({ style: 'color:#6940A5' })
    expect(c.props('pink')).toEqual({ style: 'color:#AD1A72' })
    expect(c.props('red')).toEqual({ style: 'color:#E03E3E' })
    expect(c.props('gray_background')).toEqual({
      style: 'background-color:#EBECED'
    })
    expect(c.props('brown_background')).toEqual({
      style: 'background-color:#E9E5E3'
    })
    expect(c.props('orange_background')).toEqual({
      style: 'background-color:#FAEBDD'
    })
    expect(c.props('yellow_background')).toEqual({
      style: 'background-color:#FBF3DB'
    })
    expect(c.props('green_background')).toEqual({
      style: 'background-color:#DDEDEA'
    })
    expect(c.props('blue_background')).toEqual({
      style: 'background-color:#DDEBF1'
    })
    expect(c.props('purple_background')).toEqual({
      style: 'background-color:#EAE4F2'
    })
    expect(c.props('pink_background')).toEqual({
      style: 'background-color:#F4DFEB'
    })
    expect(c.props('red_background')).toEqual({
      style: 'background-color:#FBE4E4'
    })
    expect(c.props('default')).toEqual({})
    expect(c.props('foo')).toEqual({})
  })
  it('should retun text class', () => {
    const c = new ColorProps({
      colorPropertiesMap: {
        default: {
          className: 'default-class'
        }
      }
    })
    expect(c.props('gray')).toEqual({ style: 'color:#9B9A97' })
    expect(c.props('brown')).toEqual({ style: 'color:#64473A' })
    expect(c.props('orange')).toEqual({ style: 'color:#D9730D' })
    expect(c.props('yellow')).toEqual({ style: 'color:#DFAB01' })
    expect(c.props('green')).toEqual({ style: 'color:#0F7B6C' })
    expect(c.props('blue')).toEqual({ style: 'color:#0B6E99' })
    expect(c.props('purple')).toEqual({ style: 'color:#6940A5' })
    expect(c.props('pink')).toEqual({ style: 'color:#AD1A72' })
    expect(c.props('red')).toEqual({ style: 'color:#E03E3E' })
    expect(c.props('gray_background')).toEqual({
      style: 'background-color:#EBECED'
    })
    expect(c.props('brown_background')).toEqual({
      style: 'background-color:#E9E5E3'
    })
    expect(c.props('orange_background')).toEqual({
      style: 'background-color:#FAEBDD'
    })
    expect(c.props('yellow_background')).toEqual({
      style: 'background-color:#FBF3DB'
    })
    expect(c.props('green_background')).toEqual({
      style: 'background-color:#DDEDEA'
    })
    expect(c.props('blue_background')).toEqual({
      style: 'background-color:#DDEBF1'
    })
    expect(c.props('purple_background')).toEqual({
      style: 'background-color:#EAE4F2'
    })
    expect(c.props('pink_background')).toEqual({
      style: 'background-color:#F4DFEB'
    })
    expect(c.props('red_background')).toEqual({
      style: 'background-color:#FBE4E4'
    })
    expect(c.props('default')).toEqual({
      className: 'default-class'
    })
    expect(c.props('foo')).toEqual({})
  })
})
