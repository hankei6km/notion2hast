import { classnames } from 'hast-util-classnames'
import { h } from 'hastscript'
import { HProperties } from 'hastscript/lib/core'

export function mergeProps(
  p: HProperties,
  { className, style, ...others }: HProperties
): HProperties {
  const ret: HProperties = { ...p }

  // className(class) をマージ.
  Object.assign(ret, others)
  if (typeof className === 'string' || Array.isArray(className)) {
    if (typeof p.className === 'string' || Array.isArray(p.className)) {
      const c = classnames(p.className, className)
      if (Array.isArray(c)) {
        ret.className = c
      }
    } else {
      ret.className = className
    }
  }
  // style をマージ、単純な文字列の連結.
  // ダメそうだったら以下を検討.
  // https://www.npmjs.com/package/style-to-object
  // https://www.npmjs.com/package/to-style
  if (typeof style === 'string') {
    let ps = `${p.style || ''}`.trimEnd()
    let dlm = ''
    if (ps && !ps.endsWith(';')) {
      dlm = ';'
    }
    ret.style = `${ps}${dlm}${style}`
  }

  return ret
}
