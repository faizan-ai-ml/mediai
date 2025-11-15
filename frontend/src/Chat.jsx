import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

function Chat() {
  const { user, logout } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: "👋 Hello! I'm MediAI, your medical AI assistant. I'm here to help answer your health questions and provide medical information.\n\n⚠️ Important: I provide educational information only and am not a replacement for professional medical advice. For emergencies, please call 911 or your local emergency services.\n\nHow can I help you today?"
    }])
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    setIsTyping(true)

    try {
      const response = await axios.post('/api/chat', {
        message: userMessage
      })

      // Simulate typing delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response
        }])
        setIsTyping(false)
      }, 500)
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'error',
        content: '❌ Sorry, I encountered an error. Please try again or check your connection.'
      }])
      setIsTyping(false)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    "What are symptoms of flu?",
    "How to prevent common cold?",
    "When should I see a doctor?",
    "What is a healthy diet?"
  ]

  const handleQuickQuestion = (question) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏥
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                letterSpacing: '-0.5px'
              }}>
                MediAI
              </h1>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '14px',
                opacity: 0.9,
                fontWeight: '400'
              }}>
                Your Intelligent Medical Assistant
              </p>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '20px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                👤
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>
                {user?.username || 'User'}
              </span>
            </div>

            <button
              onClick={logout}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* Quick Questions (only show when no messages except welcome) */}
        {messages.length <= 1 && (
          <div style={{
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              💡 Quick Questions:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px'
            }}>
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(question)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#475569',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.backgroundColor = '#f8fafc'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 6px rgba(102,126,234,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.backgroundColor = 'white'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '75%',
              alignItems: 'flex-start'
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#667eea',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  🤖
                </div>
              )}

              <div style={{
                padding: '14px 18px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: msg.role === 'user' ? '#667eea' :
                  msg.role === 'error' ? '#fee2e2' : 'white',
                color: msg.role === 'user' ? 'white' :
                  msg.role === 'error' ? '#991b1b' : '#1e293b',
                boxShadow: msg.role === 'user' ? '0 4px 6px rgba(102,126,234,0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                lineHeight: '1.6',
                fontSize: '15px',
                border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none'
              }}>
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#10b981',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  👤
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#667eea',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                🤖
              </div>
              <div style={{
                padding: '14px 18px',
                borderRadius: '18px 18px 18px 4px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}>
                <div className="typing-dot" style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: '0s'
                }}></div>
                <div className="typing-dot" style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: '0.2s'
                }}></div>
                <div className="typing-dot" style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: '0.4s'
                }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'white',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your health question here... (Press Enter to send)"
                disabled={loading}
                rows={1}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '15px',
                  resize: 'none',
                  fontFamily: 'inherit',
                  minHeight: '52px',
                  maxHeight: '150px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: loading ? '#f8fafc' : 'white',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '14px 28px',
                backgroundColor: loading || !input.trim() ? '#cbd5e1' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '52px',
                boxShadow: loading || !input.trim() ? 'none' : '0 4px 6px rgba(102,126,234,0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.backgroundColor = '#5568d3'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 8px rgba(102,126,234,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && input.trim()) {
                  e.target.style.backgroundColor = '#667eea'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 6px rgba(102,126,234,0.3)'
                }
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }}></div>
                  Sending...
                </>
              ) : (
                <>
                  <span>Send</span>
                  <span style={{ fontSize: '18px' }}>📤</span>
                </>
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fde68a',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <p style={{
              fontSize: '13px',
              color: '#92400e',
              margin: 0,
              lineHeight: '1.5',
              fontWeight: '500'
            }}>
              <strong>Medical Disclaimer:</strong> This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default Chat