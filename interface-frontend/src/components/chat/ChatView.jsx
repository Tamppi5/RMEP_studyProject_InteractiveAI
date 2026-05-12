import { React, useState, useContext } from 'react'
import { store } from '../../scripts/store'
import { requestChatResponse } from '../../scripts/chatService'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { Chip, Progress } from '@nextui-org/react'

const ChatView = ({ sourceIndex }) => {
  const [messages, setMessages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [writeProgress, setWriteProgress] = useState(-1)
  const ctxStore = useContext(store)

  /**
   * Display the user's message in the chat and make sure the view scrolls down to it.
   *
   * Then, send the user prompt to be processed (alongside the rest of the thread)
   * and render the response when it arrives.
   *
   * If there's an error, a red message is logged to the chat.
   *
   * @param {String} messageText The new prompt
   * @param {String} imageAttachment (optional) A base64-encoded image
   */
  const handleSendChatMessage = async (messageText, imageAttachment) => {
    if (ctxStore.state.displayChatOnboarding) {
      ctxStore.dispatch({ type: 'DISMISS_ONBOARDING' })
    }

    setIsGenerating(true) // Disables chat input + shows processing spinner

    /* Render user-sent message + scroll to bottom */
    const messageHistory = messages
    const newMessage = {
      role: 'user',
      content: String(messageText),
      image: String(imageAttachment) || undefined,
      ts: Date.now(),
      task: sourceIndex
    }

    setMessages([...messageHistory, newMessage])
    scrollToNewest()

    /* Request chat completion from API based on newest prompt and full chat history */
    try {
      const res = await requestChatResponse([...messageHistory, newMessage])

      if (res.error) {
        showErrorMessageInChat(res.error, messageHistory, newMessage)
        return
      }

      handleRenderChatMessage(res, messageHistory, newMessage)
    } catch (e) {
      console.log(e)
      showErrorMessageInChat(e, messageHistory, newMessage)
    }
  }

  /**
   * Render the received chat message
   */
  const handleRenderChatMessage = (fullRes, messageHistory, newMessage) => {
    setIsGenerating(false)

    /* If there's a processing error, show an error message and return */
    if (fullRes.error) {
      showErrorMessageInChat(fullRes.error, messageHistory, newMessage)
      return
    }

    /* Nice character-by-character reply rendering */
    const replyContent = fullRes.choices[0].message.content
    const pauseMs = 5 // 5ms pause between rendering characters

    for (let i = 0; i <= replyContent.length; i++) {
      setTimeout(() => {
        i === replyContent.length ? setWriteProgress(-1) : setWriteProgress(i / replyContent.length * 100)
        setMessages([
          ...messageHistory,
          newMessage,
          { role: 'assistant', content: replyContent.slice(0, i) + (i < replyContent.length ? '▮' : '')}
        ])
        scrollToNewest()
      }, i * pauseMs)
    }

    /* Set a timeout for when the message has been fully rendered */
    setTimeout(() => {
      // Timestamp the message once it's been fully rendereed
      const finalResponse = { role: 'assistant', content: replyContent }

      // Store the FULL ORIGINAL API response (with our TS & taskIndex)
      ctxStore.dispatch({ type: 'UPDATE_MESSAGES', payload: {prompt: newMessage, response: {role: 'assistant', ...fullRes, render_complete: Date.now(), survey_index: sourceIndex}}})

      // Allow proceeding (AI cond. only) since chat has been used
      ctxStore.dispatch({ type: 'TOGGLE_CHAT_USED', payload: {value: true}})

      // Make sure we're displaying the finished response + scroll to it
      setMessages([
          ...messageHistory,
          newMessage,
          finalResponse
      ])
      scrollToNewest()
    }, replyContent.length * pauseMs + 50)
    
  }

  /**
   * Scroll the chat view so that the last message is fully visible
   */
  const scrollToNewest = () => {
    setTimeout(() => {
      const ml = document.querySelectorAll('#chatMessage')
      const lastM = ml[ml.length - 1]
      lastM.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 100)
  }

  /** 
  * Display an error message in the chat and scroll down to it 
  */
  const showErrorMessageInChat = (error, messageHistory, newMessage) => {
    const message = { 
      role: '!', 
      content: `An error occurred with ChatGPT. Please try again.\n\n\"${String(error)}\"\n\nDo NOT refresh the survey, this will erase your progress.\nIf the error persists, please return the study.`, 
      image: undefined, 
      ts: Date.now(), 
      task: sourceIndex
    }
    setMessages([...messageHistory, newMessage, message])
    setWriteProgress(-1)
    scrollToNewest()
    setIsGenerating(false)
  }

  return (
    <div className='flex flex-1 flex-col justify-start items-center w-3/6 h-screen px-16 pb-16'>
      {ctxStore.state.chatEnabled && <div className='flex justify-center items-center w-full py-4'><Chip color='success' variant='dot'>ChatGPT</Chip></div>}
      <div id='messageList' className='flex flex-col w-full h-full max-h-full overflow-auto mb-4'>
          {messages.length > 0 && messages.map((m, i) => 
            <ChatMessage key={i} sender={m.role} message={m.content} image={m.image ? m.image : undefined}/>
          )}
      </div>
      <div className='flex flex-col w-full justify-end'>
        {writeProgress >= 0 
          && <Progress 
              className='px-12 mb-4'
              size='md'
              value={writeProgress}
              color='primary'
              showValueLabel={true}
              disableAnimation={true}
        />}
        {ctxStore.state.chatEnabled && <>
          {ctxStore.state.displayChatOnboarding &&
            <div className='flex flex-col justify-center items-center p-16 shadow-lg mb-4 rounded-xl border-8 border-emerald-500 text-black w-full'>
              <p className='text-4xl font-bold'>Try it out!</p>
              <div className='mt-4'>
                <i className="bi bi-arrow-down text-4xl"></i>
                <i className="bi bi-arrow-down text-4xl"></i>
                <i className="bi bi-arrow-down text-4xl"></i>
              </div>
            </div>
          }
          <ChatInput preventInput={isGenerating || (writeProgress !== -1)} handleSend={handleSendChatMessage} />
        </>}
      </div>
    </div>
  )
}

export default ChatView