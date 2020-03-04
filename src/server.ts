import * as express from 'express'
import * as asyncHandler from 'express-async-handler'
import * as puppeteer from 'puppeteer'
import * as stream from 'stream'
import { Cluster } from 'puppeteer-cluster'

const port = process.env.PORT || 4500
const env = process.env.NODE_ENV || 'development'
const defaultTimeout = 5000
const defaultFormat = 'A4'
const defaultPrintBackground = true

let cluster: Cluster = null

export function app() {
  const server = express()

  server.get(
    '/convert',
    asyncHandler(async (req, res) => {
      const url = req.query.url
      const timeout = req.query.timeout
        ? parseInt(req.query.timeout)
        : defaultTimeout
      const format = req.query.format || defaultFormat
      const printBackground = req.query.printBackground
        ? req.query.printBackground === 'true'
        : defaultPrintBackground

      const target = `result_${Date.now()}.pdf`
      const buff = await cluster.execute({
        url,
        timeout,
        format,
        printBackground,
      })

      res
        .set('Content-disposition', 'attachment; filename=' + target)
        .set('Content-Type', 'application/pdf')

      new stream.PassThrough().pipe(res).end(buff)
    }),
  )

  return server
}

async function run() {
  const options = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--user-agent=puppeteer',
      '--disable-frame-rate-limit',
      '--disable-gpu-vsync',
    ],
  }

  if (env === 'development') {
    options['executablePath'] = puppeteer
      .executablePath()
      .replace('dist/server', 'node_modules/puppeteer')
  }

  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
    puppeteerOptions: options,
    timeout: defaultTimeout,
  })

  await cluster.task(async ({ page, data }) => {
    const { url, timeout, format, printBackground } = data
    await page.goto(url)
    if (!timeout) {
      await page.waitForSelector('#ready', { timeout: defaultTimeout })
    } else {
      await sleep(timeout)
    }
    return await page.pdf({ format, printBackground })
  })

  const server = app()
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`)
  })
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function shutdown(signal) {
  console.log(`Signal received: ${signal}`)
  if (cluster) {
    await cluster.idle()
    await cluster.close()
  }
  process.exit(0)
}

// Clean up resource when received signal to shutdown
process.on('SIGINT', shutdown)
process.on('SIGCHLD', shutdown)
process.on('SIGTERM', shutdown)

run()
