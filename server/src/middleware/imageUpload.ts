import multer, { StorageEngine, diskStorage } from "multer";
import process from 'process'

const pathname = process.cwd()+'\\fileUpload'
const coverPhotoPathname = process.cwd()+'\\coverPhotoStorage'
const dpPathname = process.cwd()+'\\dpStorage'

const storage: StorageEngine = diskStorage({
  destination: function(req: Express.Request, file: Express.Multer.File, cb){
    cb(null, pathname)
  },
  filename: function(req: Express.Request, file: Express.Multer.File, cb){
    cb(null, file.originalname)
  }
})

const dpStorage: StorageEngine = diskStorage({
  destination: function(req: Express.Request, file: Express.Multer.File, cb){
    cb(null, dpPathname)
  },
  filename: function(req: Express.Request, file: Express.Multer.File, cb){
    cb(null, file.originalname)
  }
})

const coverPhotoStorage: StorageEngine = diskStorage({
  destination: function(req: Express.Request, file: Express.Multer.File, cb){
    cb(null, coverPhotoPathname)
  },
  filename: function(req: Express.Request, file: Express.Multer.File, cb){
    cb(null, file.originalname)
  }
})

export const coverPhotoUpload = multer({storage: coverPhotoStorage})
export const dpUpload = multer({storage: dpStorage})
export const upload = multer({storage: storage})

