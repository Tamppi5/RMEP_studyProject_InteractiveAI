import React, { useState } from 'react'
import { Slider } from '@nextui-org/react'

const SliderQuestion = ({id, question, field}) => {
  /**
   * If a 5th parameter "randomDefault" is included, pick a random initial value within the range.
   * Otherwise, default to midpoint.
   * */ 
  const [sliderValue, setSliderValue] = useState(question.additionalParams[0] === 'randomDefault' 
    ? Math.floor(Math.random() * (question.max - question.min + 1)) + question.min
    : (question.max + question.min) / 2
  )

  const handleMoveSlider = (value) => {
    setSliderValue(value)
    field.onChange(value)
  }

  return (
    <div className='flex flex-row justify-center items-center mx-16'>
      <span>{question.minLabel}</span>
      <Slider 
        id={id} 
        name={id}
        className='mx-8'
        step={1}
        fillOffset={sliderValue}
        color='foreground'
        label=''
        size='lg'
        minValue={question.min}
        maxValue={question.max}
        value={sliderValue}
        onChange={handleMoveSlider}
        inputRef={field.ref}
      />
      <span>{question.maxLabel}</span>
    </div>
  )
}

export default SliderQuestion