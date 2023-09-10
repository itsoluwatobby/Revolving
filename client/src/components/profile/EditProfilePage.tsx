import { useState } from 'react';
import { ImageTypeProp, TargetImageType, Theme } from '../../posts';
import { UserProps } from '../../data';
import DPComponent from './DPComponent';

type Props = {
  theme: Theme,
  image: TargetImageType,
  isLoadingDp: boolean,
  userProfile: UserProps
  isLoadingDelete: boolean,
  isLoadingUpdate: boolean,
  imageType: ImageTypeProp,
  clearPhoto: (type: ImageTypeProp) => Promise<void>,
  handleImage: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function EditProfilePage({ userProfile, image, theme, isLoadingDp, isLoadingDelete, isLoadingUpdate, imageType, handleImage, clearPhoto }: Props) {
  const [hoverDp, setHoverDp] = useState<ImageTypeProp>('NIL')
  
  return (
    <section>
      <h2>Public profile</h2>
      <hr className={`w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-400'}`}/>

      <div>
        <DPComponent 
          imageType={imageType} isLoadingDp={isLoadingDp} image={image}
          isLoadingDelete={isLoadingDelete} userProfile={userProfile}
          isLoadingUpdate={isLoadingUpdate} theme={theme} hoverDp={hoverDp}
          setHoverDp={setHoverDp} handleImage={handleImage} clearPhoto={clearPhoto}
        />
      </div>

    </section>
  )
}