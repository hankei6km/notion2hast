import { h } from 'hastscript'
import { HChild, Node, Root } from 'hastscript/lib/core'
import { ToHastOpts } from './types.js'
import { Client } from './client.js'
import { blockItem, SurroundElement } from './block.js'
import { RichTextToHast } from './richtext.js'
import { ColorProps } from './color.js'

export async function blockToHast(
  client: Client,
  opts: ToHastOpts,
  depth: number = 0
): Promise<Node> {
  const colorProps = new ColorProps({
    ...opts.colorPropsOpts
  })
  const richTextToHast = new RichTextToHast(
    opts.richTexttoHastOpts || {},
    colorProps
  )
  const children: HChild = []
  const ite = blockItem(client, opts)
  let index = 0
  let i = await ite.next()
  const surround = new SurroundElement('', opts.blocktoHastOpts || {})
  while (!i.done) {
    while (!i.done && !surround.isBreak(i.value?.type)) {
      const nest: HChild = []
      if (i.value?.has_children) {
        const a = await blockToHast(
          client,
          Object.assign({}, opts, { block_id: i.value?.id, parent: i.value }),
          depth + 1
        )
        // surround.nest(a)
        nest.push(a)
      }
      await surround.append({
        block: i.value,
        nest,
        parent: opts.parent,
        index,
        richTextToHast,
        colorProps
      })
      index++
      i = await ite.next()
    }
    const tag = surround.outerTag()
    if (tag && tag.name) {
      children.push(h(tag.name, tag.properties || {}, ...surround.content()))
    } else {
      children.push(h(null, ...surround.content()))
    }
    surround.reset()
  }
  if (depth === 0) {
    return h(null, ...children)
  }
  return children as any
}
