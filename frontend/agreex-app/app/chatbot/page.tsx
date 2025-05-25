'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'bot' | 'user'
  text: string
  isAudio?: boolean
  isDocument?: boolean
  hasButton?: boolean
}

const conversation: Message[] = [
  { role: 'bot', text: 'Hello! I\'m Contrax. I need your personal information: Name, Specialty, Tax ID, Address, Email, Phone.' },
  { role: 'user', text: 'I\'m Sarai Alejandro, web designer. Tax ID 10456789012. Jr. Los Amautas - San Juan de Lurigancho. sarai.alejandro@gmail.com, 934003487.' },
  { role: 'bot', text: 'Thank you Sarai. Now I need the client company information: Name, Tax ID, Address, Legal representative, Contact.' },
  { role: 'user', text: 'TechSolutions SAC, Tax ID 20587456321. Av. Benavides 1580, Surco. Representative: Ana Torres, General Manager. Contact: marketing@techsolutions.pe, 998765432.' },
  { role: 'bot', text: 'Perfect. Now tell me about the project: Description, Deliverables, Timeline, Intellectual property.' },
  { role: 'user', text: '[SENDS AUDIO]', isAudio: true },
  { role: 'bot', text: 'How much do you plan to charge and how do you prefer payments? I can recommend a structure if you wish.' },
  { role: 'user', text: 'I plan to charge 25 soles per hour.' },
  { role: 'bot', text: 'I recommend this structure: 30% at start, 40% upon design approval, 30% upon delivery. Does that sound good?' },
  { role: 'user', text: 'Sounds good to me. I\'ll keep my rate but use that payment structure.' },
  { role: 'bot', text: 'Ready! Your contract is prepared. Click to review.', hasButton: true }
]

export default function ChatbotPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isWaitingForUserInput, setIsWaitingForUserInput] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [showRecording, setShowRecording] = useState(false)
  const [showDocument, setShowDocument] = useState(false)
  const [showContractLoading, setShowContractLoading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [userInput, setUserInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Iniciar la conversación
    showBotResponse()
  }, [])

  const showBotResponse = () => {
    if (currentMessageIndex >= conversation.length) return

    const message = conversation[currentMessageIndex]
    if (message.role === 'bot') {
      setShowTyping(true)
      
      setTimeout(() => {
        setShowTyping(false)
        setMessages(prev => [...prev, message])
        setCurrentMessageIndex(prev => prev + 1)
        
        // Si el siguiente mensaje es del usuario, esperar input
        if (currentMessageIndex + 1 < conversation.length && 
            conversation[currentMessageIndex + 1].role === 'user') {
          setIsWaitingForUserInput(true)
        } else if (currentMessageIndex + 1 < conversation.length) {
          // Si hay más mensajes del bot, mostrarlos
          setTimeout(() => showBotResponse(), 1000)
        }
      }, 1500)
    }
  }

  const processUserInput = () => {
    if (!isWaitingForUserInput || currentMessageIndex >= conversation.length) return

    const userMessage = conversation[currentMessageIndex]
    if (userMessage.role === 'user' && !userMessage.isAudio) {
      setMessages(prev => [...prev, userMessage])
      setCurrentMessageIndex(prev => prev + 1)
      setIsWaitingForUserInput(false)
      setUserInput('')
      
      // Mostrar siguiente mensaje del bot
      setTimeout(() => showBotResponse(), 500)
    }
  }

  const handleAudioRecording = () => {
    if (!isWaitingForUserInput || currentMessageIndex >= conversation.length) return
    
    const currentMessage = conversation[currentMessageIndex]
    if (currentMessage.role === 'user' && currentMessage.isAudio) {
      setShowRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    setShowRecording(false)
  }

  const sendRecording = () => {
    stopRecording()
    const audioMessage = conversation[currentMessageIndex]
    setMessages(prev => [...prev, audioMessage])
    setCurrentMessageIndex(prev => prev + 1)
    setIsWaitingForUserInput(false)
    
    setTimeout(() => showBotResponse(), 500)
  }

  const handleContractReview = () => {
    setShowContractLoading(true)
    setTimeout(() => {
      router.push('/contrato-freelance')
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
        }
        
        body {
          color: #333;
          background-color: #f7f7f7;
          line-height: 1.3;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
        }
        
        .chat-header {
          background-color: #2b2b2b;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .logo {
          display: flex;
          align-items: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          text-decoration: none;
        }
        
        .logo-icon {
          width: 24px;
          height: 24px;
          background-color: #d3ff36;
          border-radius: 50%;
          margin-right: 8px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-icon::before {
          content: "▶";
          color: #2b2b2b;
          font-size: 10px;
          margin-left: 2px;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background-color: white;
          overflow: hidden;
        }
        
        .chat-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 10px 0;
          padding: 0 20px;
        }
        
        .chat-messages {
          padding: 20px;
          flex: 1;
          overflow-y: auto;
        }
        
        .message {
          margin-bottom: 20px;
          display: flex;
        }
        
        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .bot {
          align-items: flex-start;
        }
        
        .user {
          justify-content: flex-end;
        }
        
        .bot .message-content {
          background-color: #f0f0f0;
          color: #333;
          border-radius: 0 10px 10px 10px;
        }
        
        .user .message-content {
          background-color: #2b2b2b;
          color: white;
          border-radius: 10px 0 10px 10px;
        }
        
        .bot-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #d3ff36;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          flex-shrink: 0;
          color: #2b2b2b;
          font-weight: bold;
        }
        
        .bot-avatar::before {
          content: "C";
          font-size: 16px;
        }
        
        .input-container {
          padding: 15px 20px;
          display: flex;
          background-color: white;
          border-top: 1px solid #e0e0e0;
        }
        
        .input-field {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 50px;
          outline: none;
          font-size: 0.9rem;
        }
        
        .input-field:focus {
          border-color: #d3ff36;
          box-shadow: 0 0 0 2px rgba(211, 255, 54, 0.2);
        }
        
        .send-btn {
          background-color: #333;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 50px;
          margin-left: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s;
          font-size: 0.9rem;
        }
        
        .action-btns {
          display: flex;
          gap: 10px;
        }
        
        .audio-btn, .document-btn {
          width: 40px;
          height: 40px;
          background-color: #f0f0f0;
          color: #2b2b2b;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        
        .audio-btn:hover, .document-btn:hover {
          background-color: #d3ff36;
        }
        
        .review-btn {
          display: inline-block;
          background-color: #2b2b2b;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 10px;
          cursor: pointer;
          border: none;
        }
        
        .typing-indicator {
          display: flex;
          padding: 8px 12px;
          background-color: #f0f0f0;
          border-radius: 10px;
          margin-bottom: 15px;
          align-items: center;
          width: fit-content;
        }
        
        .typing-animation {
          display: flex;
        }
        
        .typing-dot {
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background-color: #888;
          border-radius: 50%;
          opacity: 0.6;
          animation: typingAnimation 1.2s infinite;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typingAnimation {
          0%, 100% {
            opacity: 0.6;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
        
        .audio-message {
          display: flex;
          align-items: center;
          background-color: #f8f8f8;
          padding: 10px;
          border-radius: 10px;
          width: fit-content;
        }
        
        .audio-player {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #33a852;
          padding: 5px 10px;
          border-radius: 20px;
          color: white;
        }
        
        .play-icon {
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #33a852;
        }
        
        .audio-waveform {
          width: 100px;
          height: 20px;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cGF0aCBkPSJNNSAxMCBMOSA1IEwxMyAxMyBMMTcgOCBMMjEgMTIgTDI1IDYgTDI5IDE1IEwzMyA5IEwzNyAxMSBMNDEgNyBMNDUgMTQgTDQ5IDQgTDUzIDEyIEw1NyA4IEw2MSAxNiBMNjUgNiBMNjkgMTEgTDczIDkgTDc3IDEzIEw4MSA1IEw4NSAxMSBMODkgNyBMOTMgMTAgTDk3IDE0IiBzdHJva2U9IndoaXRlIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPg0KPC9zdmc+');
          background-repeat: no-repeat;
          background-position: center;
        }
        
        .audio-time {
          font-size: 0.8rem;
        }
        
        .recording-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          color: white;
        }
        
        .recording-animation {
          width: 100px;
          height: 100px;
          background-color: #d3ff36;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: pulseAnimation 1.5s infinite;
        }
        
        .recording-waveform {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-bottom: 20px;
        }
        
        .recording-wave-bar {
          width: 4px;
          height: 20px;
          background-color: #d3ff36;
          border-radius: 2px;
          animation: waveAnimation 0.5s infinite alternate;
        }
        
        @keyframes waveAnimation {
          0% {
            height: 5px;
          }
          100% {
            height: 30px;
          }
        }
        
        .recording-wave-bar:nth-child(2) {
          animation-delay: 0.1s;
        }
        
        .recording-wave-bar:nth-child(3) {
          animation-delay: 0.2s;
        }
        
        .recording-wave-bar:nth-child(4) {
          animation-delay: 0.3s;
        }
        
        .recording-wave-bar:nth-child(5) {
          animation-delay: 0.4s;
        }
        
        @keyframes pulseAnimation {
          0% {
            box-shadow: 0 0 0 0 rgba(211, 255, 54, 0.4);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(211, 255, 54, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(211, 255, 54, 0);
          }
        }
        
        .recording-timer {
          font-size: 20px;
          margin-bottom: 30px;
        }
        
        .recording-actions {
          display: flex;
          gap: 20px;
        }
        
        .recording-cancel, .recording-send {
          padding: 12px 30px;
          border-radius: 30px;
          border: none;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .recording-cancel {
          background-color: #ff3636;
          color: white;
        }
        
        .recording-send {
          background-color: #d3ff36;
          color: #2b2b2b;
        }
        
        .recording-cancel:hover, .recording-send:hover {
          transform: scale(1.05);
        }
        
        .document-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .document-modal {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          width: 400px;
          max-width: 90%;
        }
        
        .document-modal h2 {
          margin-bottom: 20px;
          color: #2b2b2b;
        }
        
        .document-drop-zone {
          border: 2px dashed #ccc;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 20px;
        }
        
        .document-drop-zone:hover {
          border-color: #d3ff36;
          background-color: #f9ffed;
        }
        
        .document-drop-zone p {
          margin-top: 10px;
          color: #777;
          font-size: 14px;
        }
        
        .document-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .document-cancel, .document-send {
          padding: 10px 20px;
          border-radius: 5px;
          border: none;
          font-weight: bold;
          cursor: pointer;
        }
        
        .document-cancel {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .document-send {
          background-color: #2b2b2b;
          color: white;
        }
        
        .document-cancel:hover {
          background-color: #e0e0e0;
        }
        
        .document-send:hover {
          background-color: #1a1a1a;
        }
        
        .contract-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          color: white;
        }
        
        .contract-loading-animation {
          width: 120px;
          height: 120px;
          position: relative;
          margin-bottom: 30px;
        }
        
        .contract-loading-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 5px solid rgba(211, 255, 54, 0.2);
          border-top-color: #d3ff36;
          animation: spinAnimation 1.5s infinite linear;
        }
        
        .contract-loading-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 40px;
          color: #d3ff36;
        }
        
        .contract-loading-text {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #d3ff36;
        }
        
        .contract-loading-subtext {
          font-size: 16px;
          max-width: 80%;
          text-align: center;
          line-height: 1.5;
        }
        
        @keyframes spinAnimation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="chat-container">
        <div className="chat-header">
          <a href="/" className="logo">
            <div className="logo-icon"></div>
            AgreeX
          </a>
        </div>
        
        <h1 className="chat-title">Conversation between Freelancer and Contrax Bot</h1>
        
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.role === 'bot' && <div className="bot-avatar"></div>}
              <div className="message-content">
                {message.isAudio ? (
                  <div className="audio-message">
                    <div className="audio-player">
                      <div className="play-icon">▶</div>
                      <div className="audio-waveform"></div>
                      <div className="audio-time">0:28</div>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.text}
                    {message.hasButton && (
                      <div>
                        <button className="review-btn" onClick={handleContractReview}>
                          Revisar mi Contrato
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          
          {showTyping && (
            <div className="typing-indicator">
              <div className="bot-avatar"></div>
              <div className="typing-animation">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <input 
            type="text" 
            className="input-field" 
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && processUserInput()}
          />
          <div className="action-btns">
            <button className="audio-btn" onClick={handleAudioRecording}>
              <svg className="audio-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14C13.1046 14 14 13.1046 14 12V7C14 5.89543 13.1046 5 12 5C10.8954 5 10 5.89543 10 7V12C10 13.1046 10.8954 14 12 14Z" fill="#2b2b2b"/>
                <path d="M7 12C7 15.3137 9.68629 18 13 18M17 12C17 15.3137 14.3137 18 11 18" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 18V21M12 21H9M12 21H15" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="document-btn" onClick={() => setShowDocument(true)}>
              <svg className="document-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 13H16" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 17H12" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <button className="send-btn" onClick={processUserInput}>Send</button>
        </div>
      </div>
      
      {/* Audio recording overlay */}
      {showRecording && (
        <div className="recording-overlay">
          <div className="recording-animation">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14C13.1046 14 14 13.1046 14 12V7C14 5.89543 13.1046 5 12 5C10.8954 5 10 5.89543 10 7V12C10 13.1046 10.8954 14 12 14Z" fill="#2b2b2b"/>
              <path d="M7 12C7 15.3137 9.68629 18 13 18M17 12C17 15.3137 14.3137 18 11 18" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 18V21M12 21H9M12 21H15" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="recording-waveform">
            <div className="recording-wave-bar"></div>
            <div className="recording-wave-bar"></div>
            <div className="recording-wave-bar"></div>
            <div className="recording-wave-bar"></div>
            <div className="recording-wave-bar"></div>
          </div>
          <div className="recording-timer">{formatTime(recordingTime)}</div>
          <div className="recording-actions">
            <button className="recording-cancel" onClick={stopRecording}>Cancel</button>
            <button className="recording-send" onClick={sendRecording}>Send</button>
          </div>
        </div>
      )}
      
      {/* Document upload overlay */}
      {showDocument && (
        <div className="document-overlay" onClick={() => setShowDocument(false)}>
          <div className="document-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Attach document</h2>
            <div className="document-drop-zone">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V18" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15H15" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Click or drag a file here</p>
            </div>
            <div className="document-actions">
              <button className="document-cancel" onClick={() => setShowDocument(false)}>Cancel</button>
              <button className="document-send" onClick={() => setShowDocument(false)}>Send</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Contract loading screen overlay */}
      {showContractLoading && (
        <div className="contract-loading-overlay">
          <div className="contract-loading-animation">
            <div className="contract-loading-circle"></div>
            <div className="contract-loading-icon">⚙️</div>
          </div>
          <div className="contract-loading-text">Creating contract with Blockchain + AI</div>
          <div className="contract-loading-subtext">
            We are generating a smart and secure contract based on the information provided. 
            This process ensures transparency and security for your agreements.
          </div>
        </div>
      )}
    </>
  )
} 