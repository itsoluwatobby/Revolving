import { FaTimes } from "react-icons/fa"
import { Theme, ImageType } from "../../posts"

type ImageCardProps = {
  image: ImageType,
  theme: Theme,
  imagesFiles: ImageType[]
  setImagesFiles: React.Dispatch<React.SetStateAction<ImageType[]>>
}

export default function ImageCard({ image, theme, imagesFiles, setImagesFiles }: ImageCardProps) {

  const deleteImage = (imageId: string) => {
    const otherImages = imagesFiles.filter(image => image.imageId !== imageId)
    setImagesFiles([...otherImages])
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
    </figure>
  )
}