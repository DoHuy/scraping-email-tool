import { Response } from 'express'

export class Helper {
    static buildErrorResponse(
        error: Error,
        status: number,
        res: Response
    ): Response<any, Record<string, any>> {
        return res.status(status).json({
            error: error.message,
        })
    }

    static buildSuccessResponse(
        data: Record<string, any>,
        message: string,
        status: number,
        res: Response
    ): Response<any, Record<string, any>> {
        return res.status(status).json({
            message,
            data,
        })
    }
}
