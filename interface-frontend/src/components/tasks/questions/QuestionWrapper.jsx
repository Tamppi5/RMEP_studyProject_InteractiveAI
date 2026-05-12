import React, { useContext, useState } from 'react'
import LikertQuestion from './LikertQuestion'
import OptionQuestion from './OptionQuestion'
import SliderQuestion from './SliderQuestion'
import { Input, Textarea, Button, Tooltip } from '@nextui-org/react'
import { useController } from 'react-hook-form'
import { store } from '../../../scripts/store'

const QuestionWrapper = ({ id, question, formControl }) => {
  const [copyEnabled, setCopyEnabled] = useState(true)
  const { state } = useContext(store)

  const { field, fieldState } = useController({ 
    control: formControl, 
    name: id, 
    rules: {
      required: {
        value: true, 
        message: 'Please answer this question.'
      }, 
      ...getValidationRules(question) // All fields are required. Get additional rules based on question type.
    }
  })
  
  const handleCopy = () => {
    navigator.clipboard.writeText(String(question.question + '\n- ' + question.options.join('\n- ')))
    setCopyEnabled(false)
    setTimeout(() => {
      setCopyEnabled(true)
    }, 1500)
  }

  return (
    <div className='my-16'>
      <div className='flex flex-row justify-between items-center mb-8'>
        <h3 className='text-lg font-bold'>{id} - {question.question}<span className='text-red-500'>*</span></h3>
        {/* Show copy button if AI condition and question type is option (this should probably be moved to the OptionQuestion component) */}
        {(state.chatEnabled && state.condition === 'ai' && question.type === 'option') && <Tooltip className="p-4" content="Copy question and options to clipboard">
          <Button
            className='ml-8'
            color='default' 
            variant='faded'
            disableRipple='true'
            isDisabled={!copyEnabled}
            children={
              <i className={`bi ${copyEnabled ? 'bi-copy text-stone-500' : 'bi-clipboard-check text-emerald-700'} text-xl`}></i>
            }
            onClick={handleCopy}
            isIconOnly
          >
          </Button>
        </Tooltip>}
      </div>
      {/* Display error if validation rules breached */}
      {fieldState.error && <p className='text-red-500 mb-2 ml-2'>{fieldState.error.message}</p>}
      {/* Render the appropriate component based on question type */}
      {question.type === 'text' && <Input id={id} name={id} className='w-5/6' variant='bordered' type="text" {...field}/>}
      {question.type === 'textarea' && <Textarea id={id} name={id} className='w-5/6' variant='bordered' type="text" minRows={3} maxRows={8} {...field}/>}
      {question.type === 'number' && <Input id={id} name={id} className='w-2/6' variant='bordered' type="number" {...field}/>}
      {question.type === 'likert' && <LikertQuestion id={id} question={question} field={field} />}
      {question.type === 'option' && <OptionQuestion id={id} question={question} field={field} />}
      {question.type === 'slider' && <SliderQuestion id={id} question={question} field={field}/>}
    </div>
  )
}

const getValidationRules = (question) => {
  return ({
    'text': {
      minLength: {value: 2, message: 'Must be at least 2 characters long.'},
      maxLength: {value: 200, message: 'Maximum 200 characters.'}
    },
    'textarea': {
      minLength: {value: 2, message: 'Must be at least 2 characters long.'},
      maxLength: {value: 400, message: 'Maximum 400 characters.'}
    },
    'number': {
      min: {value: 0, message: 'Please enter a number between 0 and 999'},
      max: {value: 999, message: 'Please enter a number between 0 and 999'},
      validate: {
        isNumber: (v) => !isNaN(v) || 'Please enter a number',
        isInteger: (v) => Number.isInteger(parseFloat(v)) || 'Please enter a rounded number.'
      }
    },
    'slider': {
      min: {value: question.min, message: 'Invalid slider value'},
      max: {value: question.max, message: 'Invalid slider value'}
    },
    'likert': {
      min: {value: question.min, message: 'Invalid value'},
      max: {value: question.max, message: 'Invalid value'}
    },
    'option': {
      validate: {
        isValidOption: (v) => question.options.filter((o) => o.toLowerCase() === 'other').length > 0 ? true : (question.options.includes(v) || 'Please select one')
      },
      maxLength: {value: 5000, message: 'Maximum 5000 characters.'}
    }
  }[question.type])
}

export default QuestionWrapper