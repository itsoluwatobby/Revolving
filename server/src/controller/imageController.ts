import { v4 as uuidV4 } from 'uuid';
import fsPromises from 'fs/promises';
import { Request, Response } from "express";
import { asyncFunc, responseType } from "../helpers/helper.js";

class ImageController{

  uploadImages(req: Request, res: Response){
    asyncFunc(res, async() => {
      const uploadedFile = req.file;
      const uniqueId = uuidV4()
      const filename = uploadedFile.originalname
      const fileext = filename.substring(filename.lastIndexOf('.'))
      const newName = `${uniqueId}${fileext}`
      const newPath = `fileUpload/${newName}`
      fsPromises.rename(uploadedFile.path, newPath)
      .then(() => {
        const imageUrl = `${process.env.IMAGELINK}/${newName}`
        return responseType({res, status: 201, message: 'image uploaded', count: 1, data: { url: imageUrl}})
      }).catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }

  // Using express-static middleware to serve my images
  getImage(req: Request, res: Response){
    asyncFunc(res, async() => {
      const {imageName} = req.params
      const pathname = process.cwd()+`\\fileUpload\\${imageName}`
      res.sendFile(pathname)
    })
  }

  deleteImage(req: Request, res: Response){
    asyncFunc(res, async() => {
      const name = req.url
      const imageName = name.substring(1)
      const pathname = process.cwd()+`\\fileUpload\\${imageName}`
      fsPromises.unlink(pathname)
      .then(() => responseType({res, status: 204, message: 'image deleted'}))
      .catch((error) => responseType({res, status: 404, message: `${error.message}`}))
    })
  }
}

export default new ImageController()