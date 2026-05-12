import { Avatar } from '@nextui-org/react'
import React from 'react'

const ChatMessage = ({sender, message, image}) => {
  return (
    <div id='chatMessage' className='flex flex-row justify-start items-start w-full mt-4'>
      <Avatar name={sender === 'assistant' ? 'GPT' : sender.toUpperCase()} size='lg' radius='sm' />
      <div className='flex flex-col justify-start items-start w-full ml-4'>
        {image && <img className='drop-shadow-lg rounded-xl mb-2' style={{width: '325px'}} src={image}></img>}
        <div className={`p-4 w-full drop-shadow-none rounded-xl ${sender === 'user' ? 'bg-blue-500 text-blue-50' : (sender === 'assistant' ? 'bg-stone-100' : 'bg-orange-500 text-orange-50')}`}>
          <p className='text-wrap whitespace-pre'>{message}</p>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage