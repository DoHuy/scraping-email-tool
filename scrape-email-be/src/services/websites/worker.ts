import { parentPort, workerData } from 'worker_threads'
import { ScrapeEmailsFromPage } from './core.service'

const ExecuteScrapeEmailWorker = async (url: string): Promise<Set<string>> => {
    return ScrapeEmailsFromPage(url)
}

;(async () => {
    try {
        const result = await ExecuteScrapeEmailWorker(workerData.url)
        // Convert Set to Array for serialization
        parentPort?.postMessage({ success: true, emails: Array.from(result) })
    } catch (error) {
        parentPort?.postMessage({
            success: false,
            error: (error as Error).message,
        })
    }
})()
