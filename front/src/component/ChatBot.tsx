// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import mascotte from '../../media/mascotte.svg'

function ChatBot() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t('chatbot.welcome'),
      sender: 'bot'
    }
  ])
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMessages(prev => prev.map(msg =>
      msg.id === 1 ? { ...msg, text: t('chatbot.welcome') } : msg
    ));
  }, [t]);

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setError(null)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    }
    setMessages([...messages, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          lang: i18n.language || 'fr'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('chatbot.commError'))
      }

      const botResponse = {
        id: messages.length + 2,
        text: data.reply,
        sender: 'bot'
      }
      setMessages(prev => [...prev, botResponse])
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)

      const errorMessage = {
        id: messages.length + 2,
        text: t('chatbot.error', { message: err.message }),
        sender: 'bot'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        className="w-12 h-12 bg-transparent border-none cursor-pointer flex items-center justify-center transition-all duration-300 p-0 hover:scale-110 active:scale-95 rounded-full"
        onClick={toggleChat}
        title="Ouvrir l'assistant BuddyCoach"
      >
        <img
          src={mascotte}
          alt="Mascotte BuddyCoach"
          className="w-full h-full object-contain"
        />
      </button>

      {isOpen && (
        <div className="
          fixed z-[1000] flex flex-col bg-white
          animate-[slideUp_0.3s_ease-out]
          shadow-[0_5px_40px_rgba(0,0,0,0.16)]
          sm:bottom-[100px] sm:right-[30px] sm:w-[380px] sm:h-[500px] sm:rounded-xl
          top-0 left-0 right-0 bottom-[100px] sm:inset-auto
        ">
          <div className="bg-indigo-600 text-white px-4 py-4 sm:rounded-t-xl flex justify-between items-center font-semibold" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
            <h3 className="m-0 text-base">{t('chatbot.header')}</h3>
            <button
              className="bg-transparent border-none text-white cursor-pointer p-0 w-8 h-8 flex items-center justify-center transition-transform duration-200 hover:rotate-90"
              onClick={toggleChat}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] px-3.5 py-2.5 rounded-xl break-words leading-relaxed text-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-2">
                <div className="max-w-[70%] px-3.5 py-2.5 rounded-xl rounded-tl-sm bg-gray-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-[typing_1.4s_infinite]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-[typing_1.4s_infinite_0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-[typing_1.4s_infinite_0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 p-3 border-t border-gray-200 bg-white sm:rounded-b-xl"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.inputPlaceholder')}
              disabled={isLoading}
              className="flex-1 border border-gray-300 rounded-full px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-600 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 text-white border-none rounded-full px-5 py-2.5 cursor-pointer text-sm font-semibold transition-all hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {t('chatbot.send')}
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  )
}

export default ChatBot
