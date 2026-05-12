import React, { useState } from 'react'
import { Input } from '@nextui-org/react'

const optionRadioStyle = 'mr-4 appearance-none box-border border-2 border-stone-300 shadow-inner w-8 h-8 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full checked:border-stone-700 checked:shadow-xl checked:border-8 checked:box-border'

const OptionQuestion = ({ id, question, field }) => {
  const [other, setOther] = useState('')
  const [otherSelected, setOtherSelected] = useState(false)

  const handleOtherInput = (e) => {
    setOther(e.target.value)
    /* Only change the currently selected form value if the other option has been selected */
    if (otherSelected) {
      field.onChange(e.target.value)
    }
  }

  const handleSelectOption = (value, isOther) => {
    setOtherSelected(isOther)
    field.onChange(value)
  }

  return (
    <div className='my-4'>
      <fieldset style={{border: 'none', }} name={id} {...field}>
        {/* Render all other options first */}
        {question.options.filter((o) => o.toLowerCase() !== 'other').map((o, i) => 
          <div key={i} className='mb-2 flex flex-row justify-start items-center'>
            <input 
              className={optionRadioStyle}
              type='radio' 
              name={id} 
              id={`${id}_${i}`} 
              value={o} 
              onClick={(e) => handleSelectOption(e.target.value, false)}
            />
            <label htmlFor={`${id}_${i}`}>{o}</label>
          </div>
        )}
        {/* If applicable, render "other" option */}
        {question.options.filter((o) => o.toLowerCase() === 'other').length > 0
          && <div key='other' className='flex flex-row justify-start items-center'>
            <input 
              className={optionRadioStyle} 
              type='radio' 
              name={id} 
              id={`${id}_other`}
              value={other}
              onClick={() => handleSelectOption(other, true)}
            />
            <label htmlFor={`${id}_other`}>Other:</label>
          </div>
        }
      </fieldset>
      {/* Render the "other" input field OUTSIDE of the radio fieldset to prevent changing it from impacting the currently selected value (i.e. so that changing the "other" while option B is selected does not affect B being selected) */}
      {question.options.filter((o) => o.toLowerCase() === 'other').length > 0
        && <Input 
            className='w-4/6 ml-12 mt2' 
            variant='bordered' 
            type="text" 
            placeholder='Please specify' 
            onChange={handleOtherInput} 
            isRequired={otherSelected}
          />
      }
    </div>
  )
}

export default OptionQuestion