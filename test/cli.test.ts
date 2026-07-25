import { describe, it, mock, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { PassThrough } from 'stream'

const mockClieentBaseExports = {
  Client: mock.fn(function (a: any) {})
}
mock.module('@notionhq/client', {
  exports: mockClieentBaseExports
})

let blockToHastReturnValue: any = Promise.resolve({ id: 'test-1' })
const mockNotion2HastExports = {
  blockToHast: mock.fn((a1: any, a2: any) => blockToHastReturnValue)
}
mock.module('../src/lib/notion2hast.ts', {
  exports: mockNotion2HastExports
})

const mockHastUtilToHtmlExports = {
  toHtml: mock.fn((a1: any, a2: any) => 'test-html-1')
}
mock.module('hast-util-to-html', {
  exports: mockHastUtilToHtmlExports
})

const mockClieentBase = await import('@notionhq/client')
const mockNotion2Hast = await import('../src/lib/notion2hast.ts')
const mockHastUtilToHtml = await import('hast-util-to-html')
const { cli } = await import('../src/cli.ts')

describe('cli()', async () => {
  afterEach(() => {
    mock.reset()
    mockClieentBaseExports.Client.mock.resetCalls()
    blockToHastReturnValue = Promise.resolve({ id: 'test-1' })
    mockNotion2HastExports.blockToHast.mock.resetCalls()
    mockHastUtilToHtmlExports.toHtml.mock.resetCalls()
  })

  it('should return stdout with exitcode=0', async (t) => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(
      mockClieentBaseExports.Client.mock.calls[0].arguments[0],
      {
        auth: 'test-api-key-1'
      }
    )
    assert.strictEqual(mockNotion2HastExports.blockToHast.mock.callCount(), 1)
    assert.deepStrictEqual(
      mockNotion2HastExports.blockToHast.mock.calls[0].arguments[1],
      {
        block_id: 'test-block-id-1',
        blocktoHastOpts: { defaultClassName: undefined },
        richTexttoHastOpts: { defaultClassName: undefined }
      }
    )
    assert.strictEqual(mockHastUtilToHtmlExports.toHtml.mock.callCount(), 0)
    assert.strictEqual(
      outData,
      `{
  "id": "test-1"
}
`
    )
    assert.strictEqual(errData, '')
  })

  it('should convert hast with default class name', async (t) => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        defaultClassName: true,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(
      mockClieentBaseExports.Client.mock.calls[0].arguments[0],
      {
        auth: 'test-api-key-1'
      }
    )
    assert.strictEqual(mockNotion2HastExports.blockToHast.mock.callCount(), 1)
    assert.deepStrictEqual(
      mockNotion2HastExports.blockToHast.mock.calls[0].arguments[1],
      {
        block_id: 'test-block-id-1',
        blocktoHastOpts: { defaultClassName: true },
        richTexttoHastOpts: { defaultClassName: true }
      }
    )
    assert.strictEqual(mockHastUtilToHtmlExports.toHtml.mock.callCount(), 0)
    assert.strictEqual(
      outData,
      `{
  "id": "test-1"
}
`
    )
    assert.strictEqual(errData, '')
  })

  it('should convert hast to html', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        toHtml: true,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(
      mockClieentBaseExports.Client.mock.calls[0].arguments[0],
      { auth: 'test-api-key-1' }
    )
    assert.strictEqual(mockNotion2HastExports.blockToHast.mock.callCount(), 1)
    assert.deepStrictEqual(
      mockNotion2HastExports.blockToHast.mock.calls[0].arguments[1],
      {
        block_id: 'test-block-id-1',
        blocktoHastOpts: { defaultClassName: undefined },
        richTexttoHastOpts: { defaultClassName: undefined }
      }
    )
    assert.strictEqual(mockHastUtilToHtmlExports.toHtml.mock.callCount(), 1)
    assert.deepStrictEqual(
      mockHastUtilToHtmlExports.toHtml.mock.calls[0].arguments[0],
      {
        id: 'test-1'
      }
    )
    assert.strictEqual(outData, 'test-html-1\n')
    assert.strictEqual(errData, '')
  })

  it('should return stderr with exitcode=1', async () => {
    blockToHastReturnValue = Promise.reject('rejected')
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        stdout,
        stderr
      }),
      1
    )
    assert.strictEqual(outData, '')
    assert.strictEqual(errData, 'rejected\n')
  })
})
