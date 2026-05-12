import React from 'react'

const PlainContentWrapper = ({ content }) => {
  return (
    <>
      {content.type === 'paragraph' && <p className='mb-4'>{content.text}</p> }
      {content.type === 'image' && <img className='rounded-none w-max-full h-max-64 my-2' src={content.url}></img>}
      {content.type === 'h2' && <h2 className='mt-6 mb-4 text-3xl font-semibold'>{content.text}</h2>}
      {content.type === 'h3' && <h3 className='mb-2 mt-4 text-xl font-medium'>{content.text}</h3>}
    </>
  )
}

export default PlainContentWrapper