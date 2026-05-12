const baseURL = import.meta.env.VITE_PROXY_URL

const saveToDatabase = async (data) => {
  try {
    const res = await fetch(`${baseURL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null)
      throw new Error(errorBody?.error || 'Failed to save data. Please try again.')
    }

    const response = await res.json()

    return response
  } catch (e) {
    return {'error': e.message}
  }
}

const checkParticipation = async (id) => {
  try {
    const res = await fetch(`${baseURL}/check_participation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({id: String(id)})
    })

    switch (res.status) {
      case 302:
        return {'error': 'Participation with given ID already registered.'}
      case 204:
        return {}
      default:
        throw new Error('Something went wrong. Please try again.')
    }
  } catch (e) {
    return {'error': e.message}
  }
}

export {saveToDatabase, checkParticipation}