import React from 'react'

const LikertQuestion = ({ id, question, field }) => {
  const options = [...Array(question.max - question.min + 1).keys()].map((k) => k + question.min)
  
  return (
    <div className='flex flex-row items-center mx-16 justify-center'>
      <p className='text-center'>{question.minLabel}</p>
      <fieldset className='border-none flex flex-row mx-4 w-full justify-center' name={id} {...field}>
        {options.map((o) => 
          <div key={o} className='mx-2 flex flex-col justify-center items-center'>
            <input 
              className='appearance-none box-border border-2 border-stone-300 shadow-inner w-6 h-6 mb-1 rounded-full checked:border-stone-700 checked:shadow-xl checked:border-8 checked:box-border' 
              type='radio' 
              name={id} 
              id={`${id}_${o}`} 
              value={o} 
              onClick={field.onChange}
            />
            <label htmlFor={`${id}_${o}`}>{o}</label>
          </div>
        )}
      </fieldset>
      <p className='text-center'>{question.maxLabel}</p>
    </div>
  )
}

export default LikertQuestion