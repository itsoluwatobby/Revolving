import { toast } from "react-hot-toast"
import { FaTimes } from "react-icons/fa"
import { ErrorStyle } from "../../utils/navigator"
import { useDispatch, useSelector } from "react-redux"
import { deleteSingleImage } from "../../utils/helperFunc"
import { Theme, ImageType, ImageUrlsType } from "../../types/posts"
import { getUrl, resetUrl, setUrl } from "../../features/story/storySlice"

type ImageCardProps = {
  theme: Theme,
  count: number,
  image: ImageType,
  loadingImage: boolean,
  imagesFiles: ImageType[]
  setImagesFiles: React.Dispatch<React.SetStateAction<ImageType[]>>
}

export default function ImageCard({ image, loadingImage, theme, count, imagesFiles, setImagesFiles }: ImageCardProps) {
  const urlsObj = useSelector(getUrl)
  const dispatch = useDispatch()

  const deleteImage = async(imageId: string) => {
    const otherImages = imagesFiles.filter(image => image.imageId !== imageId)
    const otherUrls = urlsObj.filter(image => image.imageId !== imageId) as ImageUrlsType[]
    const targetUrl = urlsObj.find(image => image.imageId === imageId) as ImageUrlsType
    deleteSingleImage(targetUrl.url, 'story')
    .then(() => {
      dispatch(resetUrl())
      otherUrls.map(urls => dispatch(setUrl(urls)))
      setImagesFiles([...otherImages])
    })
    .catch(() => {
      setImagesFiles([...imagesFiles])
      toast.error('Error deleting images', ErrorStyle)
    })
  }

  return (
    <figure className={`relative ${theme == 'light' ? '' : ''} ${imagesFiles.length ? 'scale-100' : 'scale-0'} transition-all shadow-inner text-white flex flex-col p-1.5 h-full max-w-[160px] min-w-[160px] shadow-slate-400 rounded-md`}>
      <img src={URL.createObjectURL(image.image)} alt="images" 
        className="object-cover h-full w-full rounded-md"
      />
      <FaTimes
        onClick={() => deleteImage(image.imageId)}
        className={`absolute right-1.5 text-slate-300 top-1.5 cursor-pointer hover:opacity-70 transition-all active:opacity-95 rounded-lg text-lg bg-slate-800`}
      />
      <span className="absolute top-0.5 rounded-full left-0.5 bg-slate-800 w-4 grid place-content-center h-4 p-0.5">{++count}</span>
      <div className={`${loadingImage ? 'scale-100' : 'scale-0'} transition-all italic z-20 absolute bg-gray-800 top-1/2 left-[26%] p-1 animate-pulse rounded-sm`}>Uploading...</div>
    </figure>
  )
}