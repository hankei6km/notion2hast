import type { Properties } from 'hastscript'
import { ColorPropertiesMap, ColorPropsOpts } from './types'

// https://optemization.com/notion-color-guide
const colorPropertiesMap: ColorPropertiesMap = {
  gray: { style: 'color:#9B9A97' },
  brown: { style: 'color:#64473A' },
  orange: { style: 'color:#D9730D' },
  yellow: { style: 'color:#DFAB01' },
  green: { style: 'color:#0F7B6C' },
  blue: { style: 'color:#0B6E99' },
  purple: { style: 'color:#6940A5' },
  pink: { style: 'color:#AD1A72' },
  red: { style: 'color:#E03E3E' },
  gray_background: { style: 'background-color:#EBECED' },
  brown_background: { style: 'background-color:#E9E5E3' },
  orange_background: { style: 'background-color:#FAEBDD' },
  yellow_background: { style: 'background-color:#FBF3DB' },
  green_background: { style: 'background-color:#DDEDEA' },
  blue_background: { style: 'background-color:#DDEBF1' },
  purple_background: { style: 'background-color:#EAE4F2' },
  pink_background: { style: 'background-color:#F4DFEB' },
  red_background: { style: 'background-color:#FBE4E4' }
}

export class ColorProps {
  private defaultColorPropertiesMap(): ColorPropertiesMap {
    return colorPropertiesMap
  }
  private colorPropertiesMap: ColorPropertiesMap = {}
  constructor(opts: ColorPropsOpts) {
    Object.assign(
      this.colorPropertiesMap,
      this.defaultColorPropertiesMap(),
      opts.colorPropertiesMap || {}
    )
  }
  props(color: string): Properties {
    return { ...(this.colorPropertiesMap[color] || {}) }
  }
}
