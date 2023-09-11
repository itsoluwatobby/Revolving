import { useState } from 'react';
import { ImageTypeProp, TargetImageType, Theme } from '../../posts';
import { UserProps } from '../../data';
import DPComponent from './DPComponent';

type Props = {
  theme: Theme,
  image: TargetImageType,
  isLoading: boolean,
  userProfile: UserProps
  isLoadingDelete: boolean,
  isLoadingUpdate: boolean,
  imageType: ImageTypeProp,
  clearPhoto: (type: ImageTypeProp) => Promise<void>,
  handleImage: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function EditProfilePage({ userProfile, image, theme, isLoading, isLoadingDelete, isLoadingUpdate, imageType, handleImage, clearPhoto }: Props) {
  const [hoverDp, setHoverDp] = useState<ImageTypeProp>('NIL')
  
  return (
    <section>
      <h2>Public profile</h2>
      <hr className={`w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-400'}`}/>

      <div>
        <DPComponent 
          imageType={imageType} isLoading={isLoading} image={image}
          isLoadingDelete={isLoadingDelete} userProfile={userProfile}
          isLoadingUpdate={isLoadingUpdate} hoverDp={hoverDp}
          setHoverDp={setHoverDp} handleImage={handleImage} clearPhoto={clearPhoto}
        />
      </div>

    </section>
  )
}