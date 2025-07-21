import * as express from 'express'
import { ResourceController } from '../controllers/scrape_email.controller'
import { ResourceService } from '../services/resource.service'
import multer from 'multer'
import * as path from 'path'

const resourceController = new ResourceController(new ResourceService())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Specify the destination folder for uploads
    },
    filename: (req, file, cb) => {
        // Generate a unique filename to avoid conflicts
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        )
    },
})

// Configure Multer with file filter for images and PDFs
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/
        const mimetype = filetypes.test(file.mimetype)
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        )

        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb(
                new Error(
                    'Error: File upload only supports the following filetypes - ' +
                        filetypes
                )
            )
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB per file
        files: 5, // Limit to 5 files per upload
    },
})

const Router = express.Router()
Router.post('/scrape', resourceController.ScrapeEmails)
Router.post(
    '/sendEmails',
    upload.array('files', 5),
    resourceController.SendEmails
)

export { Router as resourceRouter }
