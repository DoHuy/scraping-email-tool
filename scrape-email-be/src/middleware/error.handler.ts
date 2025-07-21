import { NextFunction, Request, Response } from 'express'

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`Error: ${error.message}`)
    return res.status(500).json({ message: 'Internal server error' })
}

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return res.status(404).json({ message: 'Resource not found' })
}