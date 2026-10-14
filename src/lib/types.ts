export class CyclicChainError extends Error {
  constructor(blockId?: string) {
    const message = `Cyclic chain detected at block: ${blockId ?? 'unknown'}`
    super(message)
    this.name = 'CyclicChainError'
  }
}
