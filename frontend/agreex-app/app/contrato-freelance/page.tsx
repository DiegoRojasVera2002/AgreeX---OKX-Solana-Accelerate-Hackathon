'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContratoFreelance() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('draw')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'He generado un contrato basado en nuestra conversación. Por favor revísalo y completa los campos necesarios.' }
  ])

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setMessages([...messages, { type: 'user', content: chatInput }])
      setChatInput('')
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Entiendo tu consulta. He actualizado el contrato según tu solicitud.' 
        }])
      }, 1500)
    }
  }

  const handleSign = () => {
    setShowModal(false)
    router.push('/confirmacion-documento-firmado')
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f7f7f7]">
      <div className="bg-[#2b2b2b] px-5 py-4 flex items-center justify-between text-white">
        <a href="/" className="flex items-center text-white text-2xl font-semibold no-underline">
          <div className="w-6 h-6 bg-[#d3ff36] rounded-full mr-2 flex items-center justify-center">
            <span className="text-[#2b2b2b] text-xs ml-0.5">▶</span>
          </div>
          AgreeX
        </a>
      </div>
      
      <div className="flex h-[calc(100vh-54px)] w-full">
        <div className="w-1/4 bg-white border-r border-[#e0e0e0] flex flex-col">
          <div className="flex-1 overflow-y-auto p-2.5">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'bot' && (
                  <div className="w-[30px] h-[30px] rounded-full bg-[#d3ff36] flex items-center justify-center mr-2 flex-shrink-0 text-[#2b2b2b] font-bold">
                    C
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                  message.type === 'bot' 
                    ? 'bg-[#f0f0f0] text-[#333] rounded-tl-none' 
                    : 'bg-[#2b2b2b] text-white rounded-tr-none'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 flex bg-white border-t border-[#e0e0e0]">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 border border-[#e0e0e0] rounded-full outline-none text-sm"
              placeholder="Escribe tu mensaje..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="bg-[#2b2b2b] text-white border-none px-5 py-2.5 rounded-full ml-2.5 cursor-pointer font-semibold text-sm hover:bg-[#444] transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
        
        <div className="w-1/2 bg-white p-5 overflow-y-auto">
          <div className="bg-white p-8 rounded shadow-[0_2px_5px_rgba(0,0,0,0.1)] text-sm leading-relaxed">
            <h1 className="text-center text-xl font-bold mb-5 uppercase underline">
              CONTRATO DE PRESTACIÓN DE SERVICIOS FREELANCE
            </h1>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">PRIMERA: PARTES</h2>
              <div className="mb-2.5 flex flex-col">
                <span>El Contratante:</span>
                <div className="border-b border-[#ccc] h-6 my-1.5"></div>
              </div>
              <div className="mb-2.5 flex flex-col">
                <span>El Freelancer:</span>
                <div className="border-b border-[#ccc] h-6 my-1.5"></div>
              </div>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">SEGUNDA: OBJETO DEL CONTRATO</h2>
              <p>El Freelancer se compromete a realizar los siguientes servicios:</p>
              <div className="border-b border-[#ccc] h-6 my-1.5"></div>
              <div className="border-b border-[#ccc] h-6 my-1.5"></div>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">TERCERA: PLAZO</h2>
              <p>El presente contrato tendrá una duración de:</p>
              <div className="border-b border-[#ccc] h-6 my-1.5"></div>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">CUARTA: HONORARIOS</h2>
              <p>El Contratante pagará al Freelancer la suma de:</p>
              <div className="border-b border-[#ccc] h-6 my-1.5"></div>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">QUINTA: FORMA DE PAGO</h2>
              <p>El pago se realizará de la siguiente manera:</p>
              <div className="border-b border-[#ccc] h-6 my-1.5"></div>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">SEXTA: OBLIGACIONES DEL FREELANCER</h2>
              <ul className="list-disc pl-5">
                <li>Realizar el trabajo con diligencia y profesionalismo</li>
                <li>Entregar el trabajo en los plazos acordados</li>
                <li>Mantener confidencialidad sobre la información del proyecto</li>
              </ul>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">SÉPTIMA: OBLIGACIONES DEL CONTRATANTE</h2>
              <ul className="list-disc pl-5">
                <li>Proporcionar la información necesaria para el proyecto</li>
                <li>Realizar los pagos en los plazos acordados</li>
                <li>Brindar retroalimentación oportuna</li>
              </ul>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">OCTAVA: PROPIEDAD INTELECTUAL</h2>
              <p>Los derechos de propiedad intelectual del trabajo realizado serán:</p>
              <div className="border-b border-[#ccc] h-6 my-1.5"></div>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">NOVENA: RESOLUCIÓN DE CONFLICTOS</h2>
              <p>Las partes acuerdan resolver cualquier conflicto mediante:</p>
              <div className="border-b border-[#ccc] h-6 my-1.5"></div>
            </div>
            
            <div className="mb-5">
              <h2 className="text-base font-bold mb-2.5">DÉCIMA: FIRMAS</h2>
              <div className="grid grid-cols-2 gap-5 mt-5">
                <div className="text-center">
                  <div className="border-b border-[#333] h-12 mb-2"></div>
                  <p>El Contratante</p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="bg-[#2b2b2b] text-white border-none px-3 py-2 rounded cursor-pointer font-semibold mt-2.5 text-sm hover:bg-[#444] transition-all"
                  >
                    Firmar Digitalmente
                  </button>
                </div>
                <div className="text-center">
                  <div className="border-b border-[#333] h-12 mb-2"></div>
                  <p>El Freelancer</p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="bg-[#2b2b2b] text-white border-none px-3 py-2 rounded cursor-pointer font-semibold mt-2.5 text-sm hover:bg-[#444] transition-all"
                  >
                    Firmar Digitalmente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-1/4 bg-[#f0f0f0] border-l border-[#e0e0e0] p-5 overflow-y-auto">
          <div className="bg-white p-5 rounded mb-5 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <h2 className="text-base mb-4 border-b border-[#ddd] pb-1.5">Información del Contrato</h2>
            <div className="mb-2.5">
              <label className="block text-xs text-[#666] mb-1.5">Tipo de Contrato</label>
              <span className="font-medium">Prestación de Servicios</span>
            </div>
            <div className="mb-2.5">
              <label className="block text-xs text-[#666] mb-1.5">Fecha de Creación</label>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="mb-2.5">
              <label className="block text-xs text-[#666] mb-1.5">Estado</label>
              <span className="font-medium">Borrador</span>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded mb-5 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <h2 className="text-base mb-4 border-b border-[#ddd] pb-1.5">Datos del Proyecto</h2>
            <div className="mb-2.5">
              <label className="block text-xs text-[#666] mb-1.5">Nombre del Proyecto</label>
              <input type="text" className="w-full px-2.5 py-2 border border-[#ccc] rounded text-sm" />
            </div>
            <div className="mb-2.5">
              <label className="block text-xs text-[#666] mb-1.5">Duración Estimada</label>
              <input type="text" className="w-full px-2.5 py-2 border border-[#ccc] rounded text-sm" />
            </div>
            <div className="mb-2.5">
              <label className="block text-xs text-[#666] mb-1.5">Presupuesto</label>
              <input type="text" className="w-full px-2.5 py-2 border border-[#ccc] rounded text-sm" />
            </div>
          </div>
          
          <div className="flex gap-2.5 mt-5">
            <button className="flex-1 p-3 border-none rounded font-semibold cursor-pointer text-center bg-[#2b2b2b] text-white hover:opacity-90 hover:-translate-y-0.5 transition-all">
              Descargar PDF
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 p-3 border-none rounded font-semibold cursor-pointer text-center bg-[#d3ff36] text-[#2b2b2b] hover:opacity-90 hover:-translate-y-0.5 transition-all"
            >
              Enviar a Firmar
            </button>
          </div>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-[1000] overflow-auto flex items-center justify-center">
          <div className="bg-white m-auto p-6 rounded-lg w-[80%] max-w-[700px] max-h-[85vh] overflow-y-auto shadow-[0_5px_15px_rgba(0,0,0,0.3)] relative">
            <span 
              onClick={() => setShowModal(false)}
              className="absolute top-2.5 right-4 text-2xl font-bold cursor-pointer text-[#666] hover:text-black"
            >
              &times;
            </span>
            
            <h2 className="text-xl font-bold mb-5">Firma Digital</h2>
            
            <div className="flex mb-5 border-b border-[#ddd]">
              <div 
                onClick={() => setActiveTab('draw')}
                className={`px-4 py-2.5 cursor-pointer mr-1.5 rounded-t ${activeTab === 'draw' ? 'bg-[#2b2b2b] text-white' : 'bg-[#f0f0f0]'}`}
              >
                Dibujar Firma
              </div>
              <div 
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2.5 cursor-pointer mr-1.5 rounded-t ${activeTab === 'upload' ? 'bg-[#2b2b2b] text-white' : 'bg-[#f0f0f0]'}`}
              >
                Subir Imagen
              </div>
              <div 
                onClick={() => setActiveTab('camera')}
                className={`px-4 py-2.5 cursor-pointer mr-1.5 rounded-t ${activeTab === 'camera' ? 'bg-[#2b2b2b] text-white' : 'bg-[#f0f0f0]'}`}
              >
                Tomar Foto
              </div>
            </div>
            
            <div className={`p-4 border border-[#ddd] rounded-b ${activeTab === 'draw' ? 'block' : 'hidden'}`}>
              <canvas className="border border-[#ddd] bg-white w-full h-[200px] mb-4"></canvas>
              <div className="flex justify-between mb-4">
                <button className="px-4 py-2 bg-[#f0f0f0] border border-[#ddd] rounded cursor-pointer text-sm hover:bg-[#e0e0e0]">
                  Limpiar
                </button>
                <button className="px-4 py-2 bg-[#f0f0f0] border border-[#ddd] rounded cursor-pointer text-sm hover:bg-[#e0e0e0]">
                  Deshacer
                </button>
              </div>
              <button 
                onClick={handleSign}
                className="w-full p-3 bg-[#d3ff36] text-[#2b2b2b] border-none rounded font-semibold cursor-pointer hover:opacity-90"
              >
                Confirmar Firma
              </button>
            </div>
            
            <div className={`p-4 border border-[#ddd] rounded-b ${activeTab === 'upload' ? 'block' : 'hidden'}`}>
              <div className="p-5 border-2 border-dashed border-[#ddd] text-center mb-4">
                <div className="text-5xl text-[#ccc] mb-2.5">📁</div>
                <p>Arrastra tu archivo aquí o haz clic para seleccionar</p>
                <label className="inline-block px-5 py-2.5 bg-[#2b2b2b] text-white rounded cursor-pointer mt-2.5 hover:bg-[#444]">
                  Seleccionar Archivo
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <button 
                onClick={handleSign}
                className="w-full p-3 bg-[#d3ff36] text-[#2b2b2b] border-none rounded font-semibold cursor-pointer hover:opacity-90"
              >
                Confirmar Firma
              </button>
            </div>
            
            <div className={`p-4 border border-[#ddd] rounded-b ${activeTab === 'camera' ? 'block' : 'hidden'}`}>
              <div className="w-full h-[300px] bg-black mb-4 relative overflow-hidden">
                <video className="w-full h-full object-cover"></video>
              </div>
              <div className="flex justify-between mb-4">
                <button className="px-4 py-2 bg-[#2b2b2b] text-white border-none rounded cursor-pointer text-sm hover:bg-[#444]">
                  Iniciar Cámara
                </button>
                <button className="px-4 py-2 bg-[#2b2b2b] text-white border-none rounded cursor-pointer text-sm hover:bg-[#444]">
                  Capturar
                </button>
              </div>
              <button 
                onClick={handleSign}
                className="w-full p-3 bg-[#d3ff36] text-[#2b2b2b] border-none rounded font-semibold cursor-pointer hover:opacity-90"
              >
                Confirmar Firma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 