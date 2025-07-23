import path from 'path'
import XLSX from 'xlsx'
import { Worker } from 'worker_threads'
import nodemailer from 'nodemailer'
import fs from 'fs'
import util from 'util'

export interface IResourceService {
    ScrapeEmails(links: string[]): Promise<Set<string>>
    SendEmailsToMultipleRecipients(
        accessToken: string,
        email: string[],
        subject: string,
        body: string,
        attachedFiles: { fileName: string; filePath: string }[]
    ): Promise<Map<string, string>>
    ExportEmailStatusToXlsx(emailStatusMap: Map<string, string>): unknown
}

const unlinkAsync = util.promisify(fs.unlink)

export class ResourceService implements IResourceService {
    async ScrapeEmails(links: string[]): Promise<Set<string>> {
        const workerPath = path.resolve(
            __dirname,
            '../../dist/src/services/websites/worker.js'
        )
        console.log(`Worker path: ${workerPath}`)
        const scrapePromises = links.map(
            (url) =>
                new Promise<string[]>((resolve, reject) => {
                    const worker = new Worker(workerPath, {
                        workerData: { url },
                    })

                    worker.on('message', (msg) => {
                        if (msg.success) {
                            resolve(msg.emails)
                        } else {
                            reject(
                                new Error(msg.error || 'Unknown worker error')
                            )
                        }
                    })
                    worker.on('error', reject)
                    worker.on('exit', (code) => {
                        if (code !== 0)
                            reject(
                                new Error(
                                    `Worker stopped with exit code ${code}`
                                )
                            )
                    })
                })
        )

        const results = await Promise.allSettled(scrapePromises)

        // Merge all emails into a single Set
        const allEmails = new Set<string>()
        for (const result of results) {
            if (result.status === 'fulfilled') {
                result.value.forEach((email) => allEmails.add(email))
            }
            // Optionally, handle/log rejected results here
        }
        return allEmails
    }

    private async SendEmail(
        accessToken: string,
        email: string,
        subject: string,
        body: string,
        attachedFiles: { fileName: string; filePath: string }[]
    ): Promise<{ email: string; success: boolean }> {
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                type: 'OAuth2',
                accessToken,
                user: process.env.YOUR_OUTLOOK_USER,
            },
            tls: {
                ciphers: 'SSLv3',
            },
        })

        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.YOUR_OUTLOOK_EMAIL,
            to: email,
            subject: subject,
            html: body,
            attachments: attachedFiles.map((file) => ({
                filename: file.fileName,
                path: path.resolve(__dirname, '../../', file.filePath),
            })),
        }

        // wait 2 seconds each time
        await new Promise((res) => setTimeout(res, 2000))

        try {
            const info = await transporter.sendMail(mailOptions)
            console.log(`Email sent to ${email}:`, info.response)
        } catch (error) {
            console.error(`Error sending email to ${email}:`, error)
            return { email, success: false }
        }

        return { email, success: true }
    }

    async SendEmailsToMultipleRecipients(
        accessToken: string,
        emails: string[],
        subject: string,
        body: string,
        attachedFiles: { fileName: string; filePath: string }[]
    ): Promise<Map<string, string>> {
        try {
            // Create an array of promises
            const sendEmailPromises = emails.map((email) =>
                this.SendEmail(
                    accessToken || '',
                    email,
                    subject,
                    body,
                    attachedFiles
                )
            )

            // Wait for all emails to be sent
            const results = await Promise.all(sendEmailPromises)

            // Remove uploaded files
            for (const file of attachedFiles) {
                const fileFullPath = path.resolve(
                    __dirname,
                    '../../',
                    file.filePath
                )
                try {
                    await unlinkAsync(fileFullPath)
                    console.log(`Deleted file: ${fileFullPath}`)
                } catch (err) {
                    console.error(`Failed to delete file: ${fileFullPath}`, err)
                }
            }

            console.log('All emails sent!')

            return results.reduce((acc, result) => {
                acc.set(result.email, result.success ? 'Success' : 'Failed')
                return acc
            }, new Map<string, string>())
        } catch (error) {
            console.error('Error in SendEmailsToMultipleRecipients:', error)
            throw error
        }
    }

    ExportEmailStatusToXlsx(
        emailStatusMap: Map<string, string>
    ): XLSX.WorkBook {
        // Convert Map to array of objects
        const data = Array.from(emailStatusMap.entries()).map(
            ([email, status]) => ({
                Email: email,
                Status: status,
            })
        )

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'EmailStatus')
        const buffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer',
        })
        return buffer
    }
}
