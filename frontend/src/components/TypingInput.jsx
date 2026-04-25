import { useState } from 'react'

export default function TypingInput({ onSubmit, isProcessing, language }) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isProcessing) return
    onSubmit(trimmed)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        id="typing-toggle-btn"
        className="typing-toggle"
        onClick={() => setOpen(true)}
        aria-label="Switch to typing input"
      >
        ⌨️ Type instead
      </button>
    )
  }

  return (
    <form
      className="typing-form"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Type your question"
    >
      <div className="typing-input-wrap">
        <input
          id="typing-input"
          className="typing-input"
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={
            language === 'mr-IN' ? 'तुमचा प्रश्न टाइप करा…'
            : language === 'hi-IN' ? 'अपना सवाल टाइप करें…'
            : 'Type your question…'
          }
          disabled={isProcessing}
          autoFocus
          maxLength={300}
        />
        <button
          id="typing-submit-btn"
          type="submit"
          className="typing-submit"
          disabled={!text.trim() || isProcessing}
          aria-label="Send"
        >
          {isProcessing ? '⏳' : '➤'}
        </button>
      </div>
      <button
        type="button"
        className="typing-toggle"
        style={{ marginTop: 6 }}
        onClick={() => { setOpen(false); setText('') }}
      >
        🎙️ Use mic instead
      </button>
    </form>
  )
}
