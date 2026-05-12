import { Button, Textarea } from '@nextui-org/react'
import {React, useState} from 'react'
import ImageSelector from './ImageSelector'

const enableImages = import.meta.env.VITE_ALLOW_IMAGES ? import.meta.env.VITE_ALLOW_IMAGES === 'true' : true

const ChatInput = ({preventInput, handleSend}) => {
  const [userInput, setUserInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [imageAttachment, setImageAttachment] = useState('')

  const handleSubmitInput = (e) => {
    e.preventDefault()
    if (userInput.length > 1) {
      setUserInput('')
      handleSend(userInput, imageAttachment)
      setImageAttachment('')
    } else {
      handleInputError('Cannot send an empty message!')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitInput(e)
    }
  }

  const handleInputError = (message) => {
    setInputError(message)
    setTimeout(() => setInputError(''), 5000)
  }

  return (
    <form className='flex flex-row items-end' onSubmit={handleSubmitInput}>
      {enableImages && <ImageSelector setAttachedImage={setImageAttachment} imageAttached={imageAttachment.length > 0} handleInputError={handleInputError} />}
      <Textarea
        className='drop-shadow-xl -mb-6'
        type="text"
        placeholder={preventInput ? 'Previous input is being processed...' : 'Type something here...'}
        onChange={(e) => setUserInput(String(e.target.value))}
        onKeyDown={handleKeyDown}
        value={userInput}
        autoComplete='off'
        isInvalid={inputError.length > 1}
        errorMessage={inputError}
        labelPlacement='outside'
        isDisabled={preventInput}
        minRows={2}
        maxRows={5}
        description={'All messages are recorded.'}
      />
      <Button className='ml-2' type="submit" color='primary' variant='shadow' isIconOnly startContent={!preventInput && <i className='bi bi-arrow-up-square text-xl'></i>} isLoading={preventInput} isDisabled={preventInput}></Button>
    </form>
  )
}

export default ChatInput