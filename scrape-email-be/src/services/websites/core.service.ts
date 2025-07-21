import puppeteer from 'puppeteer'

const filterEmails = (text: string): string[] => {
    /**
     * Extract email addresses from a given text.
     *
     * @param {string} text - Input text containing email addresses
     * @returns {Array} - List of email addresses found in the text
     */
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = text.match(emailPattern) || []
    return emails
}

export const ScrapeEmailsFromPage = async (
    link: string
): Promise<Set<string>> => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const emails = new Set<string>() // Use Set to avoid duplicate emails

    try {
        console.log(`Processing page ${link}`)
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 6000000 })

        const textContent = await page.evaluate(() => {
            const elements = document.getElementsByClassName('fa-envelope')
            return Array.from(elements)
                .map((el) => {
                    const parent = el.parentElement
                    return parent && parent.textContent
                        ? parent.textContent.trim()
                        : ''
                })
                .join('\n')
        })

        // Find all emails in the HTML content using regex
        const foundEmails = filterEmails(textContent) || []
        for (const email of foundEmails) {
            emails.add(email)
        }
    } catch (error) {
        console.error('An error occurred:', error)
    } finally {
        await browser.close()
    }
    return emails
}
