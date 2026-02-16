import { useRef, useEffect, useState } from 'react'
import './SignaturePad.css'

interface SignaturePadProps {
  onComplete: (dataUrl: string) => void
  width?: number
  height?: number
}

export function SignaturePad({ onComplete, width = 320, height = 90 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)
  const [hasDrawn, setHasDrawn] = useState(false)
  
  // 初始化
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 高清屏适配
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)
    
    // 初始状态
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 5  // 默认更粗
  }, [width, height])
  
  // 获取坐标
  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = width / rect.width
    const scaleY = height / rect.height
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }
  
  // 限制在基线范围内
  const clampY = (y: number) => {
    const minY = height * 0.2
    const maxY = height * 0.8
    return Math.max(minY, Math.min(maxY, y))
  }
  
  // 计算线宽（速度敏感）- 更粗更醒目
  const calcWidth = (speed: number) => {
    const minW = 3
    const maxW = 7
    const normalized = Math.min(15, speed) / 15
    return maxW - (maxW - minW) * normalized
  }
  
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    
    isDrawingRef.current = true
    const pos = getPos(e)
    lastPosRef.current = { x: pos.x, y: clampY(pos.y) }
    lastTimeRef.current = Date.now()
    
    canvas.setPointerCapture(e.pointerId)
  }
  
  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault()
    if (!isDrawingRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    const pos = getPos(e)
    const current = { x: pos.x, y: clampY(pos.y) }
    const now = Date.now()
    
    const dx = current.x - lastPosRef.current.x
    const dy = current.y - lastPosRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const dt = Math.max(1, now - lastTimeRef.current)
    const speed = dist / dt * 10
    
    // 设置笔触
    ctx.lineWidth = calcWidth(speed)
    ctx.strokeStyle = `rgba(43, 27, 18, ${0.75 + Math.random() * 0.15})`
    
    // 绘制
    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    
    const midX = (lastPosRef.current.x + current.x) / 2
    const midY = (lastPosRef.current.y + current.y) / 2
    
    ctx.quadraticCurveTo(lastPosRef.current.x, lastPosRef.current.y, midX, midY)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(midX, midY)
    ctx.lineTo(current.x, current.y)
    ctx.stroke()
    
    // 晕染点
    if (Math.random() < 0.25 && speed < 5) {
      ctx.fillStyle = `rgba(43, 27, 18, ${0.08 + Math.random() * 0.08})`
      const r = 1 + Math.random() * 2
      ctx.beginPath()
      ctx.arc(
        current.x + (Math.random() - 0.5) * 6,
        current.y + (Math.random() - 0.5) * 6,
        r, 0, Math.PI * 2
      )
      ctx.fill()
    }
    
    lastPosRef.current = current
    lastTimeRef.current = now
    
    if (!hasDrawn && dist > 3) {
      setHasDrawn(true)
    }
  }
  
  const handlePointerUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    
    if (hasDrawn) {
      const canvas = canvasRef.current
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png')
        onComplete(dataUrl)
      }
    }
  }
  
  return (
    <canvas
      ref={canvasRef}
      className="signature-pad"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  )
}
