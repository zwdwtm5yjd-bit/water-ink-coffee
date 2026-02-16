import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame, gameActions } from '../app/store'
import './Scene3_Grind.css'

const CANVAS_SIZE = 360
const CENTER_X = CANVAS_SIZE / 2
const CENTER_Y = CANVAS_SIZE / 2 + 20
const HANDLE_LENGTH = 90
const GRIND_DURATION = 12000 // 12秒
const SAMPLE_INTERVAL = 100

export function Scene3_Grind() {
  const { dispatch } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  
  const [phase, setPhase] = useState<'idle' | 'grinding' | 'finished'>('idle')
  const [progress, setProgress] = useState(0)
  const [feedback, setFeedback] = useState('')
  
  const handleAngleRef = useRef(-Math.PI / 2)
  const isDraggingRef = useRef(false)
  const lastAngleRef = useRef(0)
  const angularVelocityRef = useRef(0)
  const samplesRef = useRef<number[]>([])
  const lastSampleTimeRef = useRef(0)
  const lastFeedbackTimeRef = useRef(0)
  const powderLevelRef = useRef(0)
  const grindStartTimeRef = useRef(0)
  
  // 计算指针角度
  const getAngle = useCallback((clientX: number, clientY: number): number => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const rect = canvas.getBoundingClientRect()
    const scale = CANVAS_SIZE / rect.width
    const x = (clientX - rect.left) * scale - CENTER_X
    const y = (clientY - rect.top) * scale - CENTER_Y
    return Math.atan2(y, x)
  }, [])
  
  // 绘制磨豆机
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    
    // 绘制粉罐
    drawPowderJar(ctx)
    
    // 绘制磨豆机主体
    drawGrinderBody(ctx)
    
    // 绘制把柄
    drawHandle(ctx)
    
    // 绘制粉末
    if (powderLevelRef.current > 0) {
      drawPowder(ctx)
    }
  }, [])
  
  const drawPowderJar = (ctx: CanvasRenderingContext2D) => {
    const jarY = CENTER_Y + 80
    
    // 罐身
    const gradient = ctx.createLinearGradient(CENTER_X - 60, jarY, CENTER_X + 60, jarY)
    gradient.addColorStop(0, 'rgba(180, 165, 150, 0.4)')
    gradient.addColorStop(0.5, 'rgba(200, 185, 170, 0.5)')
    gradient.addColorStop(1, 'rgba(170, 155, 140, 0.4)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(CENTER_X - 50, jarY)
    ctx.lineTo(CENTER_X - 35, jarY + 80)
    ctx.lineTo(CENTER_X + 35, jarY + 80)
    ctx.lineTo(CENTER_X + 50, jarY)
    ctx.closePath()
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(139, 115, 95, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  
  const drawGrinderBody = (ctx: CanvasRenderingContext2D) => {
    // 机身
    const bodyGradient = ctx.createLinearGradient(CENTER_X - 50, 0, CENTER_X + 50, 0)
    bodyGradient.addColorStop(0, '#A89880')
    bodyGradient.addColorStop(0.5, '#B8A890')
    bodyGradient.addColorStop(1, '#988870')
    
    ctx.fillStyle = bodyGradient
    ctx.beginPath()
    ctx.ellipse(CENTER_X, CENTER_Y, 55, 40, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 木纹
    ctx.strokeStyle = 'rgba(100, 85, 70, 0.15)'
    ctx.lineWidth = 0.5
    for (let i = -40; i <= 40; i += 15) {
      ctx.beginPath()
      ctx.moveTo(CENTER_X + i, CENTER_Y - 30)
      ctx.lineTo(CENTER_X + i * 0.8, CENTER_Y + 30)
      ctx.stroke()
    }
    
    // 顶部
    ctx.fillStyle = '#8B7D70'
    ctx.beginPath()
    ctx.ellipse(CENTER_X, CENTER_Y - 35, 25, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 中心轴
    ctx.fillStyle = '#6B5A4A'
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, 10, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const drawHandle = (ctx: CanvasRenderingContext2D) => {
    const angle = handleAngleRef.current
    const endX = CENTER_X + Math.cos(angle) * HANDLE_LENGTH
    const endY = CENTER_Y + Math.sin(angle) * HANDLE_LENGTH
    
    // 把柄杆
    ctx.strokeStyle = '#5A4A3A'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(CENTER_X, CENTER_Y)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    
    // 握球
    const ballGradient = ctx.createRadialGradient(endX - 3, endY - 3, 0, endX, endY, 14)
    ballGradient.addColorStop(0, '#9A8A7A')
    ballGradient.addColorStop(1, '#6B5A4A')
    
    ctx.fillStyle = ballGradient
    ctx.beginPath()
    ctx.arc(endX, endY, 14, 0, Math.PI * 2)
    ctx.fill()
    
    // 握球高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.beginPath()
    ctx.arc(endX - 4, endY - 4, 4, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const drawPowder = (ctx: CanvasRenderingContext2D) => {
    const jarY = CENTER_Y + 80
    const level = powderLevelRef.current
    const powderHeight = 70 * level
    
    const powderGradient = ctx.createLinearGradient(
      CENTER_X, jarY + 80 - powderHeight,
      CENTER_X, jarY + 80
    )
    powderGradient.addColorStop(0, 'rgba(139, 115, 95, 0.7)')
    powderGradient.addColorStop(1, 'rgba(109, 85, 65, 0.85)')
    
    ctx.fillStyle = powderGradient
    
    // 粉末堆积形状
    const topWidth = 30 + (1 - level) * 20
    ctx.beginPath()
    ctx.moveTo(CENTER_X - topWidth, jarY + 80 - powderHeight)
    ctx.lineTo(CENTER_X + topWidth, jarY + 80 - powderHeight)
    ctx.lineTo(CENTER_X + 30, jarY + 78)
    ctx.lineTo(CENTER_X - 30, jarY + 78)
    ctx.closePath()
    ctx.fill()
    
    // 粉末纹理点
    ctx.fillStyle = 'rgba(80, 60, 45, 0.4)'
    for (let i = 0; i < 20 * level; i++) {
      const px = CENTER_X + (Math.random() - 0.5) * 50
      const py = jarY + 75 - Math.random() * powderHeight
      ctx.beginPath()
      ctx.arc(px, py, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  // 开始研磨
  const startGrind = () => {
    setPhase('grinding')
    setFeedback('缓缓研磨...')
    grindStartTimeRef.current = Date.now()
    samplesRef.current = []
  }
  
  // 计算得分
  const calculateScore = useCallback(() => {
    const samples = samplesRef.current
    if (samples.length === 0) return 0
    
    const idealSamples = samples.filter(rps => rps >= 1.0 && rps <= 1.8).length
    return Math.min(30, Math.floor((idealSamples / samples.length) * 30))
  }, [])
  
  // 结束研磨
  const finishGrind = useCallback(() => {
    const score = calculateScore()
    dispatch(gameActions.setScorePart('grind', score))
    setPhase('finished')
    setFeedback('')
    
    setTimeout(() => {
      dispatch(gameActions.setStep(4))
    }, 1500)
  }, [calculateScore, dispatch])
  
  // 游戏循环
  useEffect(() => {
    if (phase !== 'grinding') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    
    const loop = () => {
      const now = Date.now()
      const elapsed = now - grindStartTimeRef.current
      
      // 更新进度
      const newProgress = Math.min(100, (elapsed / GRIND_DURATION) * 100)
      setProgress(newProgress)
      powderLevelRef.current = newProgress / 100
      
      // 检查结束
      if (elapsed >= GRIND_DURATION) {
        finishGrind()
        return
      }
      
      // 采样
      if (now - lastSampleTimeRef.current >= SAMPLE_INTERVAL) {
        const rps = Math.abs(angularVelocityRef.current) / (Math.PI * 2)
        samplesRef.current.push(rps)
        lastSampleTimeRef.current = now
        
        // 反馈
        if (now - lastFeedbackTimeRef.current > 600) {
          if (rps < 0.8) setFeedback('再快一些...')
          else if (rps > 2.2) setFeedback('稍缓...')
          else setFeedback('研磨正好')
          lastFeedbackTimeRef.current = now
        }
      }
      
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, finishGrind, draw])
  
  // 初始绘制
  useEffect(() => {
    draw()
  }, [])
  
  // 交互
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const angle = getAngle(e.clientX, e.clientY)
    lastAngleRef.current = angle
    isDraggingRef.current = true
    
    if (phase === 'idle') {
      startGrind()
    }
    
    canvas.setPointerCapture(e.pointerId)
  }
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || phase !== 'grinding') return
    
    const angle = getAngle(e.clientX, e.clientY)
    let delta = angle - lastAngleRef.current
    
    // 处理角度跳变
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    
    handleAngleRef.current += delta
    lastAngleRef.current = angle
    
    // 平滑角速度
    const dt = 16
    angularVelocityRef.current = angularVelocityRef.current * 0.7 + (delta / dt * 1000) * 0.3
  }
  
  const handlePointerUp = () => {
    isDraggingRef.current = false
    angularVelocityRef.current = 0
  }
  
  return (
    <div className="scene3-grind">
      <div className="scene3-content">
        <div className="logo-header">
          <img src="https://free.picui.cn/free/2026/02/16/6991ef86a5f5c.png" alt="水墨春秋" className="logo-shop" />
          <img src="https://free.picui.cn/free/2026/02/16/6991ef876bd7b.png" alt="拾陆年" className="logo-anniversary" />
        </div>
        <div className="scene-header">
          <span className="step-mark">叁</span>
          <h2 className="scene-title">研磨</h2>
        </div>
        
        {feedback && (
          <p className={`grind-feedback ${feedback ? 'visible' : ''}`}>{feedback}</p>
        )}
        
        <div className="grinder-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="grinder-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          
          {/* 进度环 */}
          {phase === 'grinding' && (
            <svg className="progress-ring" viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r="46" />
              <circle 
                className="ring-fill" 
                cx="50" cy="50" r="46"
                style={{
                  strokeDasharray: `${2 * Math.PI * 46}`,
                  strokeDashoffset: `${2 * Math.PI * 46 * (1 - progress / 100)}`
                }}
              />
            </svg>
          )}
          
          {phase === 'idle' && (
            <div className="start-hint">
              <p>转动手柄</p>
            </div>
          )}
        </div>
        
        <p className="grind-desc">圈转研磨，成粉入罐</p>
      </div>
    </div>
  )
}
