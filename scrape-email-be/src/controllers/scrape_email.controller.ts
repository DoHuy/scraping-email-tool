import { Request, Response } from 'express'
import { Helper } from '../helpers/helpers'
import { IResourceService } from '../services/resource.service'

export class ResourceController {
    resourceService: IResourceService

    constructor(service: IResourceService) {
        this.resourceService = service
    }

    ScrapeEmails = async (req: Request, res: Response) => {
        const { links } = req.body
        try {
            const emails = await this.resourceService.ScrapeEmails(links)
            return Helper.buildSuccessResponse(
                Array.from(emails),
                'emails scraped successfully',
                200,
                res
            )
        } catch (error: Error | any) {
            return Helper.buildErrorResponse(error, 500, res)
        }
    }

    SendEmails = async (req: Request, res: Response) => {
        const { emails, subject, body, accessToken = '' } = req.body
        const files = (req.files as Express.Multer.File[] | undefined) || []
        const attachedFiles = files.map((file) => ({
            fileName: file.originalname,
            filePath: file.path,
        }))
        console.log('Attached files:', attachedFiles)
        try {
            const result =
                await this.resourceService.SendEmailsToMultipleRecipients(
                    accessToken,
                    emails,
                    subject,
                    body,
                    attachedFiles
                )

            // export csv download
            const buffer =
                await this.resourceService.ExportEmailStatusToXlsx(result)
            // Set headers and send file
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="email_status.xlsx"'
            )
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            res.send(buffer)
        } catch (error: Error | any) {
            return Helper.buildErrorResponse(error, 500, res)
        }
    }
}
