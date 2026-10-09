import { RichTextToHast } from '../src/lib/richtext.ts'
import type { RichTextItem } from '../src/lib/types.ts'

export function getMockRichTextItem(
  text: string,
  opts: Record<string, any> = {}
): RichTextItem {
  //): Parameters<RichTextToHast['build']>[0] {
  const { text: textObj, annotaions, ...others } = opts
  return Object.assign(
    {
      text: Object.assign({ content: text, link: null }, textObj),
      annotations: Object.assign(
        {
          bold: false,
          code: false,
          color: 'default',
          italic: false,
          strikethrough: false,
          underline: false
        },
        annotaions || {}
      ),
      href: null,
      plain_text: text
    },
    others,
    { type: 'text' }
  ) as any
}
