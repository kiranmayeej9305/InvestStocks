/**
 * Logo Loading Queue
 * Prevents too many simultaneous logo API requests
 */

class LogoLoadQueue {
  private queue: Array<() => void> = []
  private activeRequests = 0
  private readonly maxConcurrent = 3 // Only 3 logo requests at a time
  private readonly delayBetweenRequests = 200 // 200ms delay between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeRequests++
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.activeRequests--
          // Add delay before processing next request
          setTimeout(() => {
            this.processNext()
          }, this.delayBetweenRequests)
        }
      })

      this.processNext()
    })
  }

  private processNext() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const next = this.queue.shift()
    if (next) {
      next()
    }
  }
}

export const logoQueue = new LogoLoadQueue()
