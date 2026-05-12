import React, { useContext, useState } from "react"
import { store } from "./scripts/store"
import { checkParticipation } from "./scripts/dbService"
import TaskView from './components/tasks/TaskView'
import ChatView from "./components/chat/ChatView"
import { Button, Card, CardBody, Input } from '@nextui-org/react'

const App = ({ condition, tasks }) => {
  const [idGiven, setIdGiven] = useState(false)
  const [idError, setIdError] = useState('')
  const ctxStore = useContext(store)

  const handleIdSubmit = async (e) => {
    e.preventDefault()

    /* Don't require ID if configured in .env */
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      ctxStore.dispatch({type: 'UPDATE_ID', payload: {id: e.target[0].value}})
      ctxStore.dispatch({type: 'UPDATE_CONDITION', payload: {condition: condition}})
      ctxStore.dispatch({type: 'NEXT_TASK'})
      setIdGiven(true)
      return
    }

    /* ID should be pretty long to discourage participants from submitting whatever / partial IDs  */
    if (e.target[0].value.trim().length < 16) {
      setIdGiven(false)
      setIdError('Please enter your Prolific ID.')
      return
    }

    /* Check whether the ID has already been registered in the database */
    const res = await checkParticipation(e.target[0].value)

    /* If there's no errors, allow proceeding */
    if (!res.error) {
      ctxStore.dispatch({type: 'UPDATE_ID', payload: {id: e.target[0].value}})
      ctxStore.dispatch({type: 'UPDATE_CONDITION', payload: {condition: condition}})
      ctxStore.dispatch({type: 'NEXT_TASK'})
      setIdGiven(true)
    } else {
      setIdGiven(false)
      setIdError(res.error)
    }
  }

  return (
    <>
      {!idGiven 
      ? <div className='flex justify-center items-center h-full'>
        <Card className='p-2'>
          <CardBody>
          <form onSubmit={handleIdSubmit}> 
            <Input className='my-2' type="text" maxLength={64} label='Prolific ID' labelPlacement='outside' placeholder='e.g. 0123456789' isInvalid={idError.length > 0} errorMessage={idError && idError} />
            <Button type="submit" color="primary">Submit</Button>
          </form>
          </CardBody>
        </Card>
      </div>
      : <>
        <div className='flex flex-1 flex-row h-screen'>
          <TaskView tasks={tasks} />
          <ChatView sourceIndex={
            tasks[ctxStore.state.taskIndex] 
            ? tasks[ctxStore.state.taskIndex].sourceIndex 
            : tasks[ctxStore.state.taskIndex - 1].sourceIndex
          } />
        </div>
      </>
      }
    </>
  )
}

export default App