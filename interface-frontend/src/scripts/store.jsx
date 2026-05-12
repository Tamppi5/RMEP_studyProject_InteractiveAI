import { createContext, useReducer } from 'react'
const chatEnabledIndex = import.meta.env.VITE_CHAT_ENABLED_BEGIN || 1
const chatDisabledIndex = import.meta.env.VITE_CHAT_ENABLED_END || 99

const init = {
  participantId: '',
  taskIndex: -1,
  messages: [],
  tasks: {},
  condition: undefined,
  chatEnabled: false,
  displayChatOnboarding: true,
  chatUsedOnPage: false
}

const store = createContext(init)
const { Provider } = store

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'UPDATE_ID':
        return {...state, participantId: action.payload.id}
      case 'UPDATE_CONDITION':
        return {...state, condition: action.payload.condition}
      case 'DISMISS_ONBOARDING':
          return {...state, displayChatOnboarding: false}
      case 'TOGGLE_CHAT_USED':
        return {...state, chatUsedOnPage: action.payload.value}
      case 'NEXT_TASK':
        if (state.condition === 'ai' && state.taskIndex + 1 >= chatEnabledIndex && state.taskIndex + 1 <= chatDisabledIndex) {
          return {...state, taskIndex: state.taskIndex + 1, chatEnabled: true}
        } 
        return {...state, taskIndex: state.taskIndex + 1, chatEnabled: false}
      case 'UPDATE_RESPONSES':
        const resToUpdate = state.tasks[action.payload.index] || {ts: undefined, responses: {}}
        const updatedRes = {ts: resToUpdate['ts'], displayIndex: state.taskIndex, responses: action.payload.responses}
        return {...state, tasks: {...state.tasks, [action.payload.index]: updatedRes}}
      case 'UPDATE_TASK_TIMESTAMP':
        const resToStamp = state.tasks[action.payload.index] || {ts: undefined, responses: {}}
        const stampedRes = {...resToStamp, ts: action.payload.ts}
        return {...state, tasks: {...state.tasks, [action.payload.index]: stampedRes}}
      case 'UPDATE_MESSAGES':
        const updatedMessages = [...state.messages, action.payload.prompt, action.payload.response]
        return {...state, messages: updatedMessages}
      case 'ALL_DONE':
        return {...state, chatEnabled: false}
      default:
        throw new TypeError(`Error: Invalid action type ${action.type}`)
    }
  }, init)

  return <Provider value={{state, dispatch}}>{children}</Provider>
}

export {store, StateProvider}