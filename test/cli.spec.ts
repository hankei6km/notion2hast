import { PassThrough } from 'stream'
import { jest } from '@jest/globals'

jest.unstable_mockModule('@notionhq/client', async () => {
  const mockClientInstance = {}
  const mockClient = jest.fn<(a: any[]) => any>()
  const reset = (reject: boolean = false) => {
    mockClient.mockReset().mockImplementation(() => mockClientInstance)
  }

  reset()
  return {
    Client: mockClient,
    _reset: reset,
    _getMocks: () => ({
      mockClient,
      mockClientInstance
    })
  }
})

jest.unstable_mockModule('../src/lib/notion2hast.js', async () => {
  const mockBlockToHast = jest.fn<(a: any[]) => any>()
  const reset = (reject: boolean = false) => {
    if (reject) {
      mockBlockToHast.mockReset().mockRejectedValue('rejected')
    } else {
      mockBlockToHast.mockReset().mockResolvedValue({ id: 'test-1' })
    }
  }

  reset()
  return {
    blockToHast: mockBlockToHast,
    _reset: reset,
    _getMocks: () => ({
      mockBlockToHast
    })
  }
})

jest.unstable_mockModule('hast-util-to-html', async () => {
  const mockToHtml = jest.fn<(a: any[]) => any>()
  const reset = (reject: boolean = false) => {
    mockToHtml.mockReset().mockReturnValue('test-html-1')
  }

  reset()
  return {
    toHtml: mockToHtml,
    _reset: reset,
    _getMocks: () => ({
      mockToHtml
    })
  }
})

const mockClieentBase = await import('@notionhq/client')
const mockNotion2Hast = await import('../src/lib/notion2hast.js')
const mockHastUtilToHtml = await import('hast-util-to-html')
const { mockClient, mockClientInstance } = (mockClieentBase as any)._getMocks()
const { mockBlockToHast } = (mockNotion2Hast as any)._getMocks()
const { mockToHtml } = (mockHastUtilToHtml as any)._getMocks()
const { cli } = await import('../src/cli.js')

afterEach(() => {
  ;(mockClieentBase as any)._reset()
  ;(mockNotion2Hast as any)._reset()
  ;(mockHastUtilToHtml as any)._reset()
})

describe('cli()', () => {
  it('should return stdout with exitcode=0', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockClient).toBeCalledWith({ auth: 'test-api-key-1' })
    expect(mockBlockToHast).toBeCalledTimes(1)
    expect(mockBlockToHast.mock.calls[0][1]).toEqual({
      block_id: 'test-block-id-1',
      blocktoHastOpts: { defaultClassName: undefined },
      richTexttoHastOpts: { defaultClassName: undefined }
    })
    expect(mockToHtml).toBeCalledTimes(0)
    expect(outData).toEqual(`{
  "id": "test-1"
}
`)
    expect(errData).toEqual('')
  })

  it('should convert hast with defalut class name', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        defaultClassName: true,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockClient).toBeCalledWith({ auth: 'test-api-key-1' })
    expect(mockBlockToHast).toBeCalledTimes(1)
    expect(mockBlockToHast.mock.calls[0][1]).toEqual({
      block_id: 'test-block-id-1',
      blocktoHastOpts: { defaultClassName: true },
      richTexttoHastOpts: { defaultClassName: true }
    })
    expect(mockToHtml).toBeCalledTimes(0)
    expect(outData).toEqual(`{
  "id": "test-1"
}
`)
    expect(errData).toEqual('')
  })

  it('should convert hast to html', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        toHtml: true,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockClient).toBeCalledWith({ auth: 'test-api-key-1' })
    expect(mockBlockToHast).toBeCalledTimes(1)
    expect(mockBlockToHast.mock.calls[0][1]).toEqual({
      block_id: 'test-block-id-1',
      blocktoHastOpts: { defaultClassName: undefined },
      richTexttoHastOpts: { defaultClassName: undefined }
    })
    expect(mockToHtml).toBeCalledTimes(1)
    expect(mockToHtml).toBeCalledWith({
      id: 'test-1'
    })
    expect(outData).toEqual('test-html-1\n')
    expect(errData).toEqual('')
  })

  it('should return stderr with exitcode=1', async () => {
    ;(mockNotion2Hast as any)._reset(true) // set reject
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cli({
        apiKey: 'test-api-key-1',
        blockId: 'test-block-id-1',
        stdout,
        stderr
      })
    ).toEqual(1)
    expect(outData).toEqual('')
    expect(errData).toEqual('rejected\n')
  })
})
