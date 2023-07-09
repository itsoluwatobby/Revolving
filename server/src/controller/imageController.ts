import { Request, Response } from "express";
import { asyncFunc, responseType } from "../helpers/helper.js";
import { randomUUID } from 'crypto';
import fsPromises from 'fs/promises';

export const uploadImages = async(req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const uploadedFile = req.file;
    const uniqueId = randomUUID()
  
    const filename = uploadedFile.originalname
    const fileext = filename.split('.')[1]
    const newName = `${uniqueId}.${fileext}`
    const newPath = `fileUpload/${newName}`
    
    await fsPromises.rename(uploadedFile.path, newPath);
    const imageUrl = `${process.env.IMAGELINK}/${newName}`
  
    return responseType({res, status: 201, message: 'image uploaded', count: 1, data: { url: imageUrl}})
  })
}

export const getImage = (req: Request, res: Response) => {
  asyncFunc(res, async() => {
    const {imageName} = req.params
    const pathname = process.cwd()+`\\fileUpload\\${imageName}`
    res.sendFile(pathname)
  })
}