const baseURL = import.meta.env.VITE_PROXY_URL || `http://${window.location.hostname}:5001`
const SYSTEM_PROMPT = import.meta.env.VITE_SYSTEM_PROMPT || ''

/**
 * Request a chat completion based on a list of messages from oldest to newest
 *
 * @param {Array} messages The list of chat messages so far. Should include at least one message (prompt from user).
 * @returns The full API response containing the chat completion
 */
const requestChatResponse = async (messages) => {
  try {
    const messagesToSend = messages.filter((m) => ['user', 'assistant'].includes(m.role))
    if (SYSTEM_PROMPT) {
      messagesToSend.unshift({ role: 'system', content: SYSTEM_PROMPT })
    }
    const res = await fetch(`${baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messagesToSend
      })
    })

    const parsed = await res.json()

    if (parsed.error) {
      throw new Error(parsed.error)
    }

    return parsed.response
  } catch (e) {
    return { error: e.message }
  }
}

export { requestChatResponse }