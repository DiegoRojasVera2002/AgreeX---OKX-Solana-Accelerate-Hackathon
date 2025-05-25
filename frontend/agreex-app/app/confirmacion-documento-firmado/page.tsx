'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ConfirmacionDocumentoFirmado() {
  const [fechaHora, setFechaHora] = useState('')

  useEffect(() => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    const formattedDate = now.toLocaleDateString('en-US', options)
      .replace(',', '')
      .replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/, '$1/$2/$3 at $4:$5:$6')
    
    setFechaHora(formattedDate)
  }, [])

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    alert('Downloading signed document...')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-3xl font-bold text-[#2b2b2b] flex items-center">
        <div className="w-[30px] h-[30px] bg-[#d3ff36] rounded-full mr-2.5 flex items-center justify-center">
          <span className="text-[#2b2b2b] text-xs ml-0.5">▶</span>
        </div>
        AgreeX
      </div>
      
      <div className="bg-white w-full max-w-[600px] rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-6 text-center border-b border-[#eee]">
          <div className="mb-4 inline-block">
            <svg 
              className="w-[50px] h-[50px]" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#4CAF50" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="text-2xl mb-1.5 text-[#333]">Document signed</h1>
          <p className="text-[#666] text-sm">The document has already been signed</p>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="text-xs text-[#666] mb-1 block">Document:</label>
            <p className="text-sm text-[#333]">FREELANCE_CONTRACT_SARAI.pdf</p>
          </div>
          
          <div className="mb-4">
            <label className="text-xs text-[#666] mb-1 block">Sent by:</label>
            <p className="text-sm text-[#333]">Sarai Esther Alejandro Casas</p>
          </div>
          
          <div className="mb-4">
            <label className="text-xs text-[#666] mb-1 block">From email:</label>
            <p>
              <a href="mailto:sara.alejandro@gmail.com" className="text-[#4285f4] no-underline hover:underline text-sm">
                sara.alejandro@gmail.com
              </a>
            </p>
          </div>
          
          <div className="mb-4">
            <label className="text-xs text-[#666] mb-1 block">Signed:</label>
            <p className="text-sm text-[#333]">{fechaHora}</p>
          </div>
          
          <div className="bg-[#f9f9f9] p-4 -mx-6 mt-4">
            <label className="text-xs text-[#666] mb-1 block">Status:</label>
            <p className="text-sm text-[#333]">1 of 2 signers remaining</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8 gap-4">
        <Link 
          href="/" 
          className="px-6 py-3 border-none rounded font-semibold cursor-pointer text-center text-sm no-underline bg-[#f0f0f0] text-[#333] hover:opacity-90 hover:-translate-y-0.5 transition-all"
        >
          Back
        </Link>
        <a 
          href="#" 
          onClick={handleDownload}
          className="px-6 py-3 border-none rounded font-semibold cursor-pointer text-center text-sm no-underline bg-[#2b2b2b] text-white hover:opacity-90 hover:-translate-y-0.5 transition-all"
        >
          Download document
        </a>
      </div>
    </div>
  )
} 