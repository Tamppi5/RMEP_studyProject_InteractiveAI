import React, { useEffect, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { Badge, Button, Tooltip } from '@nextui-org/react'

const ImageSelector = ({ setAttachedImage, imageAttached, handleInputError }) => {
  const [previewImg, setPreviewImg] = useState(undefined)

  useEffect(() => {
    if (!imageAttached) {
      resetInputAndPreview()
    }
  }, [imageAttached])

  const handleImageAttach = async (e) => {
    const file = e.target.files[0]

    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 512,
      useWebWorker: true,
    }

    try {
      if (!file.type.includes('image')) {
        throw new TypeError('File must be an image.')
      }

      const compressed = await imageCompression(file, compressionOptions)

      const reader = new FileReader()
      reader.onloadend = () => {
          setAttachedImage('data:image/png;base64,' + reader.result.split(',')[1])
          setPreviewImg(window.URL.createObjectURL(compressed))
      }

      reader.readAsDataURL(compressed)
    } catch (error) {
      handleInputError(String(error))
      document.getElementById('imageInput').value = null
    }
  }

  const resetInputAndPreview = () => {
    setPreviewImg('')
    document.getElementById('imageInput').value = null
  }

  return (
    <div>
      <div>
          <Badge isInvisible={!previewImg || previewImg.length < 1} shape='circle' className='border-0 py-[1px]' color='success' size='md' placement='bottom-right' content={<i className={`p-0 m-0 bi ${previewImg && 'bi-check-lg'}`}></i>}>
            <Tooltip className='p-2' content={previewImg 
              ? <>
                <img src={previewImg} width='200px'></img>
                <Button className='mt-2' color='danger' onClick={() => setAttachedImage('')}>Remove image</Button>
              </>
              : 'Attach an image'
            }>
              <Button 
                className='mr-2 p-0' 
                color='default' 
                variant='shadow' 
                disableRipple='true' 
                disableAnimation='true' 
                startContent={
                  <label className='w-full h-full flex flex-1 justify-center items-center' htmlFor='imageInput'>
                      <i className={`bi ${previewImg ? 'bi-file-earmark-image' : 'bi-paperclip'} text-xl`}></i>
                  </label>

                }
                isIconOnly
              >
              </Button>
            </Tooltip>
          </Badge>
        <input className='hidden' id="imageInput" type="file" accept='image/png, image/jpeg' onChange={handleImageAttach} />
      </div>
    </div>
  )
}

export default ImageSelector