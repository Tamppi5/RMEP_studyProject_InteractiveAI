import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { store } from '../../../scripts/store'
import { Button, ScrollShadow } from '@nextui-org/react'
import PlainContentWrapper from './PlainContentWrapper'
import QuestionWrapper from './QuestionWrapper'


const TaskPage = ({ taskIndex, sourceIndex, title, items, next }) => {
  const [submitError, setSubmitError] = useState('')
  const ctxStore = useContext(store)
  const { handleSubmit, control } = useForm({
    mode: 'onSubmit'
  })

  const onSubmit = (pageResponses) => {    
    const mappedResponses = {}
    /* Since we're using hook form at this level instead of in a child component, it also keeps track of
    * ALL of the responses instead ofjust the ones filled in to the currently visible questionnaire. 
    * This is why we need to use the visible task index to access the contents of the currently visible questionnaire.
    */
    if (pageResponses[taskIndex]) {
      /* The form hook returns form contents as a list by default, but we want to connect the responses to question IDs. 
      * Because these will be logged, we should map them to the source task index so we can compare between-participant 
      * responses later.
      */
      const questionItems = items.filter((c) => ['text', 'textarea', 'number', 'likert', 'option', 'slider'].includes(c.type))
      pageResponses[taskIndex].forEach((r, i) => {
        if (r !== undefined && r !== null) {
          const questionItem = questionItems[i - 1]
          mappedResponses[`${sourceIndex}.${i}`] = {
            question: questionItem?.question || '',
            answer: r
          }
        }
      })
    }

    /* A pretty crude attention check. Just blocks progress until correct. */
    if (taskIndex === parseInt(import.meta.env.VITE_ATTN_CHECK_PAGE)) {
      const pass = []
      const correct = import.meta.env.VITE_ATTN_CHECK_RES.split(',')
      pageResponses[taskIndex].forEach((r) => {
        if (correct.includes(r)) {
          pass.push(true)
        } else {
          pass.push(false)
        }
      })

      if (pass.includes(false)) {
        setSubmitError('Looks like you were not quite paying attention. Please try again.')
        return
      }
    }

    ctxStore.dispatch({ type: 'UPDATE_RESPONSES', payload: {index: sourceIndex, responses: mappedResponses}})
    next()
  }

  const showSubmitError = () => {
    setSubmitError('Please respond to all questions before proceeding.')
  }

  /**
   * Since all page contents are included in items, if we want to know
   * the ordinal of a question on a page, we'll need to do some filtering.
   * 
   * This is ONLY used to render the participant-facing question number, not what is logged (see onSubmit above)!
   * */ 
  const getQuestionIndex = (question) => {
    const onlyQuestions = items.filter((c) => ['text', 'textarea', 'number', 'likert', 'option', 'slider'].includes(c.type))
    const qIndex = onlyQuestions.indexOf(question) + 1
    return qIndex
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, showSubmitError)} className='flex flex-1 flex-col justify-between items-start w-full h-full' autoComplete='off'>
      {/* Display page contents */}
      <div className='flex flex-1 flex-col justify-start items-start w-full overflow-auto'>
        <h1 className='text-4xl font-bold mb-4'>{title}</h1>
        <ScrollShadow className='pb-4 w-full'>
            {items.map((item, i) => {
              if (['image', 'paragraph', 'h2', 'h3'].includes(item.type)) {
                return <PlainContentWrapper key={i} content={item} />
              } else if (['text', 'textarea', 'number', 'likert', 'option', 'slider'].includes(item.type)) {
                return <QuestionWrapper key={i} id={`${taskIndex}.${getQuestionIndex(item)}`} question={item} formControl={control} /> // Use taskIndex (the current order of the pages) as not to confuse/distract participants (in case page order is randomized
              }
            })}
        </ScrollShadow>
      </div>
      {/* Display contextual info + submit button */}
      <div className='w-full flex flex-row justify-between items-center mt-4'>
        {/* Display form error if some fields are invalid */}
        <p className='text-red-500 font-bold'>
          <i className={submitError.length > 0 && "bi bi-exclamation-triangle text-xl mr-2"}></i>
          {submitError}
        </p>
        {/* Display instruction to use chat if not used on this page yet */}
        <p className={`text-emerald-500 font-bold -mr-16 ${(ctxStore.state.chatEnabled && !ctxStore.state.chatUsedOnPage) ? '' : 'hidden'}`}>
          <i className='bi bi-info-circle text-xl mr-2'></i>
          Prompt ChatGPT on the right to solve the problem.
        </p>
        {/* Submit button (hidden if chat has not been used) */}
        <Button 
          className={(ctxStore.state.chatEnabled && !ctxStore.state.chatUsedOnPage) ? 'invisible' : ''} 
          isDisabled={ctxStore.state.chatEnabled && !ctxStore.state.chatUsedOnPage} 
          color='primary' 
          type='submit'
        >
          Next
        </Button>
      </div>
    </form>
  )
}

export default TaskPage