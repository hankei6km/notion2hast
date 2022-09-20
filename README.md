# notion2hast

[Notion の blocks](https://developers.notion.com/reference/block) を [hast] へ変換。

実装中。

## Installtion

```console
$ npm install --save notion2hast
```

## Security

`notion2hast` は信頼できるソースのみを扱う前提で動作します。

第三者からのソースを扱う状況では [`hast-util-sanitize`] の併用を推奨します。

## Usage

### basic

```typescript
import { Client as NotionClient } from '@notionhq/client'
import { ClientOptions } from '@notionhq/client/build/src/Client'
import { toHtml as hastToHtml } from 'hast-util-to-html'
import { blockToHast } from 'notion2hast'
import { Client } from 'notion2hast'

class FromNotion extends Client {
  private client: NotionClient
  constructor(options?: ClientOptions) {
    super()
    this.client = new NotionClient(options)
  }
  async listBlockChildren(
    ...args: Parameters<NotionClient['blocks']['children']['list']>
  ): Promise<ReturnType<NotionClient['blocks']['children']['list']>> {
    return this.client.blocks.children.list(...args)
  }
}

const apiKey = process.env.API_KEY
const blockId = process.env.BLOCK_ID

const client = new FromNotion({
  auth: apiKey
})
const tree = await blockToHast(client, {
  block_id: blockId,
  blocktoHastOpts: { defaultClassName: true },
  richTexttoHastOpts: { defaultClassName: true }
})
console.log(`${hastToHtml(tree)}`)
```

```html
<p>最初のパラグラフ。</p>
<h2>文字装飾</h2>
<p><strong>太字</strong></p>
<p><em>italic</em></p>
<p><s>打消し線</s></p>
<p><code>code</code></p>
<h2>リスト</h2>
<ul>
  <li>項目1</li>
  <li>
    項目2
    <ul>
      <li>
        項目2-1
        <ul>
          <li>項目<span style="color: #0b6e99">2-1-1</span></li>
        </ul>
      </li>
      <li>項目2-2</li>
    </ul>
  </li>
</ul>
```

### Custom Client

Notions の Client(主に fetch 関連)が利用できない環境では Custom Client を利用可能。

以下、Google Apps Script(clasp) で利用する場合の例。

`tohast.ts`

```typescript
import { Client as NotionClient } from '@notionhq/client'
import { ClientOptions } from '@notionhq/client/build/src/Client'
import { toHtml as hastToHtml } from 'hast-util-to-html'
import { blockToHast } from '@hankei6km/notion2hast'
import { Client } from '@hankei6km/notion2hast'
import { listBlockChildren } from './notion'

export namespace NotionToHast {
  class FromNotion extends Client {
    //private client: NotionClient;
    private auth: ClientOptions['auth']
    constructor(options?: ClientOptions) {
      super()
      this.auth = options?.auth
    }
    async listBlockChildren(
      ...args: Parameters<NotionClient['blocks']['children']['list']>
    ): Promise<ReturnType<NotionClient['blocks']['children']['list']>> {
      return listBlockChildren(this.auth || '', args[0].block_id) as any
    }
  }

  export async function toHast(apiKey: string, block_id: string) {
    const client = new FromNotion({ auth: apiKey })
    const tree = await blockToHast(client, {
      block_id,
      blocktoHastOpts: { defaultClassName: true },
      richTexttoHastOpts: { defaultClassName: true }
    })
    console.log(`${hastToHtml(tree)}`)
  }
}
```

`notion.ts`

```typescript
import {
  CreatePageParameters,
  UpdatePageParameters,
  QueryDatabaseParameters,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints'

const apiIUrlCreatePage = 'https://api.notion.com/v1/pages'
const apiUrlDabtabaseQuery = (database_id: string) =>
  `https://api.notion.com/v1/databases/${database_id}/query`
const apiUrlUpdatePage = (page_id: string) =>
  `https://api.notion.com/v1/pages/${page_id}`
const apiUrListBlockChildren = (block_id: string) =>
  `https://api.notion.com/v1/blocks/${block_id}/children`
const apiVersion = '2022-02-22'

export function isErrRes(
  res: GoogleAppsScript.URL_Fetch.HTTPResponse
): boolean {
  const code = Math.trunc(res.getResponseCode() / 100)
  if (code === 4 || code === 5) {
    return true
  }
  return false
}

export function listBlockChildren(apiKey: string, block_id: string) {
  const url = apiUrListBlockChildren(block_id)
  try {
    const res = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': apiVersion
      },
      muteHttpExceptions: true
    })
    const code = res.getResponseCode()
    if (isErrRes(res)) {
      throw res.getContentText()
    }
    const resQuery = JSON.parse(res.getContentText()) as QueryDatabaseResponse
    return resQuery
  } catch (e) {
    console.log(`${e}`)
    throw e
  }
}
```

### default class name

各要素にデフォルトの class 名を追加。デフォルトのクラス名は properties map の key が使用される。

```typescript
const client = new FromNotion({
  auth: apiKey,
  blocktoHastOpts: { defaultClassName: true },
  richTexttoHastOpts: { defaultClassName: true }
})
```

```html
<p class="paragraph">最初のパラグラフ。</p>
<h2 class="heading-2">文字装飾</h2>
<p class="paragraph"><strong class="text-bold">太字</strong></p>
<p class="paragraph"><em class="text-italic">italic</em></p>
<p class="paragraph"><s class="text-strikethrough">打消し線</s></p>
<p class="paragraph"><code class="text-code">code</code></p>
```

### properties map

指定要素のプロパティを変更。`className` を指定した場合、指定された要素にデフォルト class 名は追加されない。

```typescript
const client = new FromNotion({
  auth: apiKey,
  blocktoHastOpts: {
    defaultClassName: true,
    blockToHastBuilderOpts: {
      propertiesMap: {
        'heading-2': { style: 'border: solid;' },
        callout: { className: 'flex' },
        'callout-paragraph': { className: 'grow' }
      }
    }
  },
  richTexttoHastOpts: { defaultClassName: true }
})
```

```html
<h2 style="border: solid" class="heading-2">コールアウト</h2>
<div class="flex" style="background-color: #ebeced">
  <div class="callout-icon-emoji">💡</div>
  <div class="grow">
    <p>コールアウトの<strong class="text-bold">テキスト</strong>。</p>
  </div>
</div>
```

## 対応状況

### Block

- [x] paragraph
- [x] heading_1
- [x] heading_2
- [x] heading_3
- [x] bulleted_list_item
- [x] numbered_list_item
- [x] quote
- [ ] to_do - チェックは properties map で表現
- [x] toggle
- [ ] template
- [ ] synced_block
- [ ] child_page
- [ ] child_database
- [ ] equation
- [x] code
- [x] callout
- [x] divider
- [ ] breadcrumb
- [ ] table_of_contents
- [x] column_list
- [x] column
- [ ] link_to_page
- [x] table
- [x] table_row
- [ ] embed
- [ ] bookmark - `a` タグとして変換
- [x] image
- [ ] video
- [ ] pdf
- [ ] file
- [ ] audio
- [ ] link_preview
- [ ] unsupported

### rich text

- [x] text
  - [x] annotations
    - [x] bold
    - [x] italic
    - [x] strikethrough
    - [x] underline
    - [x] code
    - [x] color
  - [x] href
- [ ] mention
  - [ ] user
  - [ ] date
  - [ ] link_preview
  - [ ] template_mention
    - [ ] template_mention_date
    - [ ] template_mention_user
  - [ ] page
  - [ ] database
  - [ ] annotations
    - [ ] bold
    - [ ] italic
    - [ ] strikethrough
    - [ ] underline
    - [ ] code
    - [ ] color
  - [ ] href
- [ ] equation
  - [ ] annotations
    - [ ] bold
    - [ ] italic
    - [ ] strikethrough
    - [ ] underline
    - [ ] code
    - [ ] color
  - [ ] href

## properties mapping

### block

- `paragraph`
- `heading-1`
- `heading-2`
- `heading-3`
- `code`
- `code-pre`
- `code-code`
- `code-caption`
- `callout`
- `callout-icon-emoji`
- `callout-icon-image`
- `callout-paragraph`
- `divider`
- `column-list`
- `column`
- `bulleted-list`
- `bulleted-list-item`
- `numbered-list`
- `numbered-list-item`
- `quote`
- `todo`
- `todo-checked`
- `todo-not-checked`
- `todo-text`
- `toggle`
- `toggle-summary`
- `table`
- `table-row`
- `table-row-cell`
- `table-row-header`
- `table-row-header-top-left`
- `table-row-header-top`
- `table-row-header-left`
- `bookmark`
- `bookmark-link`
- `bookmark-caption`
- `image`
- `image-img`
- `image-caption`

### rich text

- `text-link`
- `text-bold`
- `text-code`
- `text-italic`
- `text-strikethrough`
- `text-underline`

### color

- `gray`
- `brown`
- `orange`
- `yellow`
- `green`
- `blue`
- `purple`
- `pink`
- `red`
- `gray_background`
- `brown_background`
- `orange_background`
- `yellow_background`
- `green_background`
- `blue_background`
- `purple_background`
- `pink_background`
- `red_background`

## ライセンス

MIT License

Copyright (c) 2022 hankei6km

[hast]: (https://github.com/syntax-tree/hast)
[`hast-util-sanitize`]: https://github.com/syntax-tree/hast-util-sanitize
