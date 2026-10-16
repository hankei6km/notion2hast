import {
  type GetBlockResponse,
  type RichTextItemResponse
} from '@notionhq/client'
import type { Child, Properties } from 'hastscript'
import { BlockToHastBuilder } from './block.ts'
import type { ColorProps } from './color.ts'
import type { RichTextToHast } from './richtext.ts'

export type CustomBuilders = {
  block?: BlockToHastBuilders
  richText?: RichTextToHast
  colorProps?: ColorProps
}

export type ToHastOpts = {
  block_id: string
  parent?: Block
  blocktoHastOpts?: BlockToHastOpts
  richTexttoHastOpts?: RichTexttoHastOpts
  colorPropsOpts?: ColorPropsOpts
  customBuilders?: CustomBuilders
}

export type Block = Extract<GetBlockResponse, { type: string }>

export type BlockToHastBuilderPropertiesKey =
  | `paragraph`
  | `heading-1`
  | `heading-2`
  | `heading-3`
  | `heading-4`
  | `code`
  | `code-pre`
  | `code-code`
  | `code-caption`
  | `callout`
  | `callout-icon-emoji`
  | `callout-icon-image`
  | `callout-paragraph`
  | `divider`
  | `column-list`
  | `column`
  | `bulleted-list`
  | `bulleted-list-item`
  | `numbered-list`
  | `numbered-list-item`
  | `quote`
  | `todo`
  | `todo-checked`
  | `todo-not-checked`
  | `todo-text`
  | `toggle`
  | `toggle-summary`
  | `table`
  | `table-row`
  | `table-row-cell`
  | `table-row-header`
  | `table-row-header-top-left`
  | `table-row-header-top`
  | `table-row-header-left`
  | `bookmark`
  | `bookmark-link`
  | `bookmark-caption`
  | `image`
  | `image-img`
  | `image-caption`
  | `text-link`
  | `text-bold`
  | `text-code`
  | `text-italic`
  | `text-strikethrough`
  | `text-underline`

// export type BlockToHastBuilderPropertiesMap = Record<
//   BlockToHastBuilderPropertiesKey ,
//   Properties
// >
export type BlockToHastBuilderPropertiesMap = {
  [key in BlockToHastBuilderPropertiesKey]?: Properties
}
export type BlockToHastBuilderOpts = {
  defaultClassname?: boolean
  propertiesMap?: BlockToHastBuilderPropertiesMap
}
//export type BlockToHastBuilders = Partial<
//  Record<Block['type'], BlockToHastBuilder<Block['type']>>
//>
export type BlockToHastBuilders = {
  // 'paragraph': BlockToHastBuilder<'paragraph'> // ok
  // 'paragraph': BlockToHastBuilder<'heading_1'> // error
  [key in Block['type']]?: BlockToHastBuilder<key>
}

export type RichTextItem = RichTextItemResponse

export type BlockToHastOpts = {
  defaultClassName?: boolean
  blockToHastBuilderOpts?: BlockToHastBuilderOpts
  blockToHastBuilders?: BlockToHastBuilders
}

export type ColorPropertiesMap = Record<string, Properties>
export type ColorPropsOpts = {
  colorPropertiesMap?: ColorPropertiesMap
}
export type BlockToHastBuilderBuildOpts = {
  block: Block
  nest: Child[]
  index: number
  depth: number
  parents: Block[]
  opts: ToHastOpts
  richTextToHast: RichTextToHast
  colorProps: ColorProps
}
export type RichTexttoHastBuildePropertiesMap = Record<string, Properties>
export type RichTexttoHastBuilderOpts = {
  richTexttoHastBuildePropertiesMap?: RichTexttoHastBuildePropertiesMap
}
export type RichTexttoHastOpts = {
  defaultClassName?: boolean
  richTexttoHastBuilderOpts?: RichTexttoHastBuilderOpts
}
