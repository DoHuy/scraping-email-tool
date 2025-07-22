import express from 'express'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import 'reflect-metadata'
import { resourceRouter } from './routes/resource.routes'
import { errorHandler } from './middleware/error.handler'
import cors from 'cors'
import https from 'https'
import * as fs from 'fs'
import path from 'path'
dotenv.config()

const app = express()
app.use(cors()) // <-- Add this line to enable CORS
app.use(express.json())
app.use(errorHandler)
const { PORT = 3000 } = process.env
app.use('/api', resourceRouter)

app.get(/(.*)/, (req: Request, res: Response) => {
    res.status(404).json({ message: 'Not found' })
})

// Read SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../', 'certs', 'key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../', 'certs', 'cert.pem')),
}

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
