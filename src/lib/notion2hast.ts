import { h } from 'hastscript'
import type { Child } from 'hastscript'
import { type Block, type ToHastOpts } from '../builder/types.ts'
import { CyclicChainError } from '../lib/types.ts'
import { Client } from './client.ts'
import { SurroundElement, BlockItem } from '../lib/surround.ts'
import { RichTextToHast } from '../builder/richtext.ts'
import { ColorProps } from '../builder/color.ts'

export async function blockToHast(
  client: Client,
  opts: ToHastOpts,
  depth: number = 0,
  parents: Block[] = []
): Promise<Child> {
  const colorProps =
    opts.customBuilders?.colorProps ||
    new ColorProps({
      ...opts.colorPropsOpts
    })
  const richTextToHast =
    opts.customBuilders?.richText ||
    new RichTextToHast(opts.richTexttoHastOpts || {}, colorProps)
  const children: Child = []
  //const ite = blockItem(client, opts)
  const ite = new BlockItem(client, opts)
  await ite.init()
  let index = 0
  let i = await ite.block()
  const blockToHastOpts = Object.assign({}, opts.blocktoHastOpts || {})
  blockToHastOpts.blockToHastBuilders = opts.customBuilders?.block
  const surround = new SurroundElement('', blockToHastOpts)
  while (i !== null) {
    while (i !== null && !surround.isBreak(i.type)) {
      const nest: Child = []
      if (i.has_children) {
        const blockId = i.id
        if (
          blockId === opts.block_id ||
          parents.some((parent) => parent.id === blockId)
        ) {
          throw new CyclicChainError(blockId)
        }
        const a = await blockToHast(
          client,
          Object.assign({}, opts, { block_id: i.id, parent: i }),
          depth + 1,
          [...parents, i]
        )
        // surround.nest(a)
        if (Array.isArray(a)) {
          nest.push(...a)
        } else {
          nest.push(a)
        }
      }
      await surround.append({
        block: i,
        nest,
        index,
        depth,
        parents,
        opts,
        richTextToHast,
        colorProps
      })
      index++
      i = await ite.block()
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
  return children
}
