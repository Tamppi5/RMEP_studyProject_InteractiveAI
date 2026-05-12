import React, { useEffect, useState, useContext } from 'react'
import { store } from '../../scripts/store'
import { saveToDatabase } from '../../scripts/dbService'
import { Button, Spinner } from '@nextui-org/react'

const DonePage = () => {
  const {dispatch, state} = useContext(store)
  const [isSaving, setIsSaving] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(undefined)
  const [errorMessage, setErrorMessage] = useState('')
  const [prolificCode, setProlificCode] = useState('')
  const [prolificUrl, setProlificUrl] = useState('')

  useEffect(() => {
    dispatch({ type: 'ALL_DONE' })
    tryToSave()
  }, [])

  const tryToSave = async () => {
    setSaveSuccess(undefined)
    setIsSaving(true)
    try {
      const res = await saveToDatabase({
        participantId: state.participantId,
        condition: state.condition,
        messages: state.messages,
        tasks: state.tasks
      })

      if (res.error) {
        throw new Error(res.error)
      }

      setSaveSuccess(true)
      setIsSaving(false)
      setProlificCode(res.prolificCode)
      setProlificUrl(res.prolificUrl)
    } catch (e) {
      setErrorMessage(e.message)
      setTimeout(() => {
        setSaveSuccess(false)
        setIsSaving(false)
      }, 2000)
    }
  }

  return (
    <div className='justify-self-center self-center text-center mb-2'>
      <h1 className='text-3xl font-bold mb-4'>All done! 🎉</h1>
      {/* Show loading spinner when saving */}
      {isSaving && <div>
        <Spinner className='my-4' />
        <p className='italic'>Saving your responses...</p>
      </div>}
      {/* Show error message & retry button if save failed */}
      {(saveSuccess !== undefined && saveSuccess === false) && <div>
        <p className='text-red-500 my-4'>{errorMessage}</p>
        <Button color='danger' onClick={() => tryToSave()}>Try again</Button>
      </div>}
      {/* Show thank-you message and Prolific redirect if save was successful */}
      {(saveSuccess !== undefined && saveSuccess === true) && <div>
        <p>Thank you for taking part in the study!</p> 
        <p className='my-4 font-bold'>To register your participation on Prolific, navigate to the following URL:</p>
        <p className='text-blue-500 hover:underline my-8'><a href={prolificUrl}>{prolificUrl}</a></p>
        <p className='font-bold my-4'>... OR copy and paste this code:</p>
        <p className='font-mono p-4 bg-stone-200'>{prolificCode}</p>
      </div>}
    </div>
  )
}

export default DonePage