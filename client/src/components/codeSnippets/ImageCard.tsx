import { FaTimes } from "react-icons/fa"
import { Theme, ImageType, ImageUrlsType } from "../../posts"
import { useDeleteImageMutation } from "../../app/api/storyApiSlice"
import { useSelector } from "react-redux"
import { getUrl } from "../../features/story/storySlice"

type ImageCardProps = {
  image: ImageType,
  theme: Theme,
  count: number,
  imagesFiles: ImageType[]
  setImagesFiles: React.Dispatch<React.SetStateAction<ImageType[]>>
}

export default function ImageCard({ image, theme, count, imagesFiles, setImagesFiles }: ImageCardProps) {
  const [deleteImages] = useDeleteImageMutation()
  const urlsObj = useSelector(getUrl)

  const deleteImage = async(imageId: string) => {
    const otherImages = imagesFiles.filter(image => image.imageId !== imageId)
    const targetUrl = urlsObj.find(image => image.imageId === imageId) as ImageUrlsType
    const imageName = targetUrl.url.substring(targetUrl.url.lastIndexOf('/')+1)
    await deleteImages(imageName)
    .then(() => {
      console.log('deleted')
      setImagesFiles([...otherImages])
    })
    .catch(() => {
      console.log('error occurred')
      setImagesFiles([...imagesFiles])
    })
  }

  return (
    <figure className={`relative ${theme == 'light' ? '' : ''}
    shadow-inner text-white flex flex-col p-1.5 h-full max-w-[160px] min-w-[160px] shadow-slate-400 rounded-md`}>
      <img src={URL.createObjectURL(image.image)} alt="images" 
        className="object-cover h-full w-full rounded-md"
      />
      <FaTimes
        onClick={() => deleteImage(image.imageId)}
        className={`absolute right-1.5 text-slate-300 top-1.5 cursor-pointer hover:opacity-70 transition-all active:opacity-95 rounded-lg text-lg bg-slate-800`}
      />
      <span className="absolute top-0.5 rounded-full left-0.5 bg-slate-800 w-5 grid place-content-center h-5 p-1">{++count}</span>
    </figure>
  )
}