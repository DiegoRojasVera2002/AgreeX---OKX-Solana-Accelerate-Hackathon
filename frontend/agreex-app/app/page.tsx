'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [projectDescription, setProjectDescription] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Aplicar animaciones fade-in cuando se carga la página
    const timer = setTimeout(() => {
      const elements = [
        document.querySelector('.hero-text'),
        document.querySelector('.chatbot-container'),
        document.querySelector('.input-container'),
        ...Array.from(document.querySelectorAll('.column')).flatMap(col => Array.from(col.children))
      ].filter(Boolean)
      
      elements.forEach((el, index) => {
        if (el) {
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            (el as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.transform = 'translateY(0)';
          }, 100 + (index * 100))
        }
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = () => {
    if (projectDescription.trim()) {
      console.log('Message sent:', projectDescription)
      router.push('/chatbot')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
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
          background-color: #fff;
          line-height: 1.3;
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        header {
          background-color: #2b2b2b;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 7vh;
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
        
        .nav-container {
          display: flex;
          align-items: center;
        }
        
        nav ul {
          display: flex;
          list-style: none;
          margin-right: 20px;
        }
        
        nav ul li {
          margin: 0 12px;
        }
        
        nav ul li a {
          color: white;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
        }
        
        .login-btn {
          background-color: #d3ff36;
          color: #2b2b2b;
          border: none;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.3s;
        }
        
        .main-container {
          flex: 1;
          display: flex;
          justify-content: center;
          max-height: 93vh;
          padding: 2vh 40px;
          gap: 20px;
        }
        
        .left-section {
          width: 35%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .hero-text {
          margin-bottom: 2vh;
        }
        
        .hero-text h1 {
          font-size: 3.2rem;
          line-height: 1;
          margin-bottom: 1vh;
          color: #333;
          font-weight: 700;
        }
        
        .hero-text p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 3vh;
        }
        
        .chatbot-container {
          display: flex;
          align-items: center;
          background-color: #f8f8f8;
          padding: 10px;
          border-radius: 50px;
          max-width: 100%;
          margin-bottom: 1vh;
        }
        
        .chatbot-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #77c3f7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          flex-shrink: 0;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
        
        .chatbot-message {
          font-size: 0.9rem;
        }
        
        .chatbot-message strong {
          font-weight: 600;
        }
        
        .input-container {
          display: flex;
          max-width: 100%;
          margin-bottom: 2vh;
        }
        
        .input-field {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 50px;
          outline: none;
          font-size: 0.9rem;
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
        
        .right-section {
          position: relative;
          width: 60%;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-height: 100%;
        }
        
        .column {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
        }
        
        .profile-card {
          position: relative;
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          flex: 1;
          height: 22vh;
        }
        
        .profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .profile-info {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: white;
          padding: 10px;
          border-radius: 12px 12px 0 0;
        }
        
        .profile-name {
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 3px;
        }
        
        .profile-icon {
          margin-right: 6px;
          display: inline-block;
          width: 16px;
          height: 16px;
          background-color: #f0f0f0;
          border-radius: 50%;
          text-align: center;
          line-height: 16px;
          font-size: 10px;
          color: #777;
        }
        
        .profile-title {
          font-size: 0.8rem;
          color: #666;
        }
        
        .flag-icon {
          display: inline-block;
          vertical-align: middle;
          margin-left: 4px;
          font-size: 0.8rem;
        }
        
        .info-bubble {
          background-color: #d3ff36;
          padding: 15px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          height: 22vh;
        }
        
        .bubble-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .bubble-text {
          font-size: 0.95rem;
          line-height: 1.3;
        }
        
        .highlight {
          font-weight: 600;
          font-style: italic;
        }
        
        .chat-widget {
          position: fixed;
          bottom: 10px;
          right: 10px;
          width: 45px;
          height: 45px;
          background-color: #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          cursor: pointer;
          z-index: 1000;
          color: white;
          font-size: 18px;
        }
        
        @media (max-width: 1200px) {
          .hero-text h1 {
            font-size: 2.8rem;
          }
          
          .bubble-title {
            font-size: 1.1rem;
          }
          
          .bubble-text {
            font-size: 0.9rem;
          }
          
          .main-container {
            padding: 1.5vh 20px;
          }
        }
        
        @media (max-width: 992px) {
          .main-container {
            flex-direction: column;
            padding: 1.5vh 20px;
            max-height: none;
            overflow-y: auto;
          }
          
          .left-section, .right-section {
            width: 100%;
          }
          
          .hero-text h1 {
            font-size: 2.5rem;
          }
          
          .profile-card, .info-bubble {
            height: 20vh;
          }
        }
        
        @media (max-width: 768px) {
          header {
            padding: 0 20px;
          }
          
          nav ul li {
            margin: 0 8px;
          }
          
          .hero-text h1 {
            font-size: 2rem;
          }
          
          .right-section {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .profile-card, .info-bubble {
            height: 15vh;
          }
          
          .bubble-title {
            font-size: 1rem;
          }
        }
      `}</style>

      <header>
        <a href="#" className="logo">
          <div className="logo-icon"></div>
          AgreeX
        </a>
        
        <div className="nav-container">
          <nav>
            <ul>
              <li><a href="#">Our Platform</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Jobs</a></li>
              <li><a href="#">Benefits</a></li>
            </ul>
          </nav>
          
          <button className="login-btn">Sign In</button>
        </div>
      </header>
      
      <div className="main-container">
        <div className="left-section">
          <div className="hero-text">
            <h1>"Agree, execute, get paid"</h1>
            <p>Clear contracts, guaranteed payments.</p>
          </div>
          
          <div className="chatbot-container">
            <div className="chatbot-avatar">C</div>
            <div className="chatbot-message">
              Hello! I'm <strong>Contrax</strong>, your virtual assistant
            </div>
          </div>
          
          <div className="input-container">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Describe your project"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="send-btn" onClick={handleSendMessage}>Send!</button>
          </div>
        </div>
        
        <div className="right-section">
          {/* First column */}
          <div className="column">
            <div className="info-bubble">
              <h3 className="bubble-title">Smart contracts without effort</h3>
              <p className="bubble-text">Generate, <span className="highlight">sign</span> and validate legal agreements, <span className="highlight">without technical knowledge or lawyers</span>.</p>
            </div>
            
            <div className="profile-card">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Samir Pérez" className="profile-img" />
              <div className="profile-info">
                <div className="profile-name">
                  <span className="profile-icon">⚙</span>
                  Samir Pérez 
                  <span className="flag-icon">PE</span>
                </div>
                <div className="profile-title">Web Developer</div>
              </div>
            </div>
          </div>
          
          {/* Second column */}
          <div className="column">
            <div className="profile-card">
              <img src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Luis Peralta" className="profile-img" />
              <div className="profile-info">
                <div className="profile-name">
                  <span className="profile-icon">⚙</span>
                  Luis Peralta 
                  <span className="flag-icon">PE</span>
                </div>
                <div className="profile-title">Full Stack Developer</div>
              </div>
            </div>
            
            <div className="info-bubble">
              <h3 className="bubble-title">Clear and local legal writing</h3>
              <p className="bubble-text">Our AI translates your agreements into legal language <span className="highlight">adapted to local laws</span>, without fine print.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="chat-widget" onClick={() => router.push('/chatbot')}>💬</div>
    </>
  )
}
