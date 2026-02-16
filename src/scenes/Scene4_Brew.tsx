import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame, gameActions } from '../app/store'
import './Scene4_Brew.css'

const CANVAS_WIDTH = 360
const CANVAS_HEIGHT = 520
const CENTER_X = CANVAS_WIDTH / 2

// 时间配置（毫秒）
const PHASE1_DURATION = 5000   // 第一段注水
const STEAM_DURATION = 3000    // 闷蒸
const PHASE2_DURATION = 11000  // 第二段注水

interface BrewSample {
  timestamp: number
  flow: number      // 0-1
  inCenter: boolean // 是否在中心
  angle: number     // 壶的倾斜角度
}

type BrewPhase = 'idle' | 'phase1' | 'steaming' | 'phase2' | 'finishing' | 'complete'

export function Scene4_Brew() {
  const { dispatch } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  
  const [phase, setPhase] = useState<BrewPhase>('idle')
  const [feedback, setFeedback] = useState('')
  const [phaseText, setPhaseText] = useState('')
  const [progress, setProgress] = useState(0)
  
  // 壶的状态
  const kettleRef = useRef({
    x: CENTER_X - 100,
    y: 80,
    angle: 0,
    pouring: false
  })
  
  // 手冲壶图片：优先抠图版（透明底，无白边），否则用原图
  const kettleImgRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}`.replace(/\/\/+/, '/')
    const tryLoad = (src: string) => {
      const img = new Image()
      img.onload = () => { kettleImgRef.current = img }
      img.onerror = () => {
        if (src.includes('抠图')) {
          const fallback = new Image()
          fallback.onload = () => { kettleImgRef.current = fallback }
          fallback.src = base + '手冲壶.png'
          fallback.onerror = () => {}
        }
      }
      img.src = src
    }
    tryLoad(base + '手冲壶-抠图.png')
  }, [])
  
  // 采样数据
  const samplesRef = useRef<BrewSample[]>([])
  const steamSamplesRef = useRef<BrewSample[]>([])
  
  // 视觉状态
  const coffeeLevelRef = useRef(0)      // 咖啡液面高度
  const bloomLevelRef = useRef(0)       // 闷蒸膨胀度
  const steamIntensityRef = useRef(0)   // 蒸汽强度
  const dropsRef = useRef<Array<{ x: number; y: number; vy: number; life: number }>>([])
  const ripplesRef = useRef<Array<{ x: number; y: number; r: number; alpha: number }>>([])
  
  // 计算水流参数（壶嘴相对壶中心的偏移：图片壶与手绘壶共用一套逻辑）
  const calculateFlow = useCallback(() => {
    const kettle = kettleRef.current
    const useImg = kettleImgRef.current
    // 使用图片时按图片比例校准壶嘴出口；否则用手绘壶的出口
    const spoutOffsetX = useImg ? -42 : -48
    const spoutOffsetY = useImg ? -6 : -6
    
    // 根据角度计算旋转后的壶嘴位置
    const rad = kettle.angle * Math.PI / 180
    const spoutX = kettle.x + spoutOffsetX * Math.cos(rad) - spoutOffsetY * Math.sin(rad)
    const spoutY = kettle.y + spoutOffsetX * Math.sin(rad) + spoutOffsetY * Math.cos(rad)
    
    // 目标位置（滤杯中心）
    const targetX = CENTER_X
    const targetY = 200
    
    // 距离评分
    const dist = Math.sqrt(Math.pow(spoutX - targetX, 2) + Math.pow(spoutY - targetY, 2))
    const distScore = Math.max(0, 1 - dist / 100)
    
    // 角度评分：前倾（负角）越大水流越大，直立为0
    const tiltAmount = Math.abs(kettle.angle)
    const tiltScore = Math.min(1, tiltAmount / 12)
    
    // 综合流量
    const flow = kettle.pouring ? Math.max(0.1, distScore * tiltScore) : 0
    
    return { 
      flow, 
      inCenter: dist < 50,
      angle: kettle.angle,
      spoutX, 
      spoutY,
      targetX,
      targetY
    }
  }, [])
  
  // 绘制
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    // 画布底色与页面灰白一致，手冲壶白边不再突兀
    ctx.fillStyle = '#FAF9F7'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 绘制分享壶
    drawServer(ctx)
    
    // 绘制滤杯组
    drawDripper(ctx)
    
    // 绘制水流
    const { flow, spoutX, spoutY } = calculateFlow()
    if (flow > 0 && (phase === 'phase1' || phase === 'phase2')) {
      drawStream(ctx, spoutX, spoutY, flow)
    }
    
    // 绘制水滴
    drawDrops(ctx)
    
    // 绘制涟漪
    drawRipples(ctx)
    
    // 绘制蒸汽（闷蒸阶段）
    if (phase === 'steaming' || (phase === 'phase2' && bloomLevelRef.current > 0.3)) {
      drawSteam(ctx)
    }
    
    // 绘制手冲壶
    drawKettle(ctx)
    
    // 绘制进度
    if (phase !== 'idle' && phase !== 'complete') {
      drawProgress(ctx)
    }
  }, [phase, calculateFlow])
  
  const drawServer = (ctx: CanvasRenderingContext2D) => {
    const sy = 380
    
    // 壶身
    const grad = ctx.createLinearGradient(CENTER_X - 60, sy, CENTER_X + 60, sy)
    grad.addColorStop(0, 'rgba(160, 145, 130, 0.4)')
    grad.addColorStop(0.5, 'rgba(180, 165, 150, 0.5)')
    grad.addColorStop(1, 'rgba(150, 135, 120, 0.4)')
    
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(CENTER_X - 50, sy)
    ctx.lineTo(CENTER_X - 35, sy + 100)
    ctx.lineTo(CENTER_X + 35, sy + 100)
    ctx.lineTo(CENTER_X + 50, sy)
    ctx.closePath()
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(120, 105, 95, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 咖啡液
    if (coffeeLevelRef.current > 0) {
      const level = coffeeLevelRef.current
      const maxH = 90
      const liquidH = maxH * level
      const ly = sy + 95 - liquidH
      
      const lgrad = ctx.createLinearGradient(CENTER_X, ly, CENTER_X, sy + 95)
      lgrad.addColorStop(0, 'rgba(89, 65, 48, 0.9)')
      lgrad.addColorStop(1, 'rgba(79, 55, 38, 0.9)')
      
      ctx.fillStyle = lgrad
      ctx.beginPath()
      const tw = 28 + level * 18
      ctx.moveTo(CENTER_X - tw, ly)
      ctx.lineTo(CENTER_X + tw, ly)
      ctx.lineTo(CENTER_X + 32, sy + 93)
      ctx.lineTo(CENTER_X - 32, sy + 93)
      ctx.closePath()
      ctx.fill()
    }
  }
  
  const drawDripper = (ctx: CanvasRenderingContext2D) => {
    const dy = 220
    
    // V60滤杯
    const dgrad = ctx.createLinearGradient(CENTER_X - 50, dy - 50, CENTER_X + 50, dy + 60)
    dgrad.addColorStop(0, '#E8DCD0')
    dgrad.addColorStop(0.5, '#F0E8E0')
    dgrad.addColorStop(1, '#D8CCC0')
    
    ctx.fillStyle = dgrad
    ctx.beginPath()
    ctx.moveTo(CENTER_X - 45, dy - 40)
    ctx.lineTo(CENTER_X + 45, dy - 40)
    ctx.lineTo(CENTER_X + 28, dy + 55)
    ctx.lineTo(CENTER_X - 28, dy + 55)
    ctx.closePath()
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(139, 115, 95, 0.2)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 螺旋纹路
    ctx.strokeStyle = 'rgba(180, 165, 150, 0.4)'
    ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
      const y = dy - 20 + i * 25
      const w = 40 - i * 8
      ctx.beginPath()
      ctx.moveTo(CENTER_X - w, y)
      ctx.lineTo(CENTER_X + w, y)
      ctx.stroke()
    }
    
    // 咖啡粉层
    const py = dy - 5
    const bloomScale = 1 + bloomLevelRef.current * 0.3
    
    const bgrad = ctx.createRadialGradient(CENTER_X, py, 0, CENTER_X, py, 38 * bloomScale)
    bgrad.addColorStop(0, '#7A5A45')
    bgrad.addColorStop(0.6, '#5A3A28')
    bgrad.addColorStop(1, '#3D2820')
    
    ctx.fillStyle = bgrad
    ctx.beginPath()
    ctx.ellipse(CENTER_X, py, 38 * bloomScale, 24 * bloomScale, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 闷蒸气泡
    if (bloomLevelRef.current > 0.2) {
      const bubbleCount = Math.floor(bloomLevelRef.current * 8)
      ctx.fillStyle = 'rgba(220, 200, 180, 0.6)'
      for (let i = 0; i < bubbleCount; i++) {
        const angle = (i / bubbleCount) * Math.PI * 2 + Date.now() / 800
        const r = 15 + bloomLevelRef.current * 15
        const bx = CENTER_X + Math.cos(angle) * r
        const by = py + Math.sin(angle) * r * 0.6
        const s = 0.8 + bloomLevelRef.current + Math.sin(Date.now() / 400 + i * 0.8) * 0.4
        
        ctx.beginPath()
        ctx.arc(bx, by, Math.max(0.5, s), 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // 液面
    if ((phase === 'phase1' || phase === 'phase2') && coffeeLevelRef.current > 0) {
      ctx.fillStyle = 'rgba(109, 85, 65, 0.5)'
      ctx.beginPath()
      ctx.ellipse(CENTER_X, py + 3, 35, 20, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const drawStream = (ctx: CanvasRenderingContext2D, sx: number, sy: number, flow: number) => {
    const ty = 195
    const w = 1.5 + flow * 3
    
    // 水流主体
    const sgrad = ctx.createLinearGradient(sx, sy, sx, ty)
    sgrad.addColorStop(0, `rgba(220, 235, 250, ${0.5 + flow * 0.3})`)
    sgrad.addColorStop(0.5, `rgba(200, 220, 240, ${0.4 + flow * 0.2})`)
    sgrad.addColorStop(1, 'rgba(180, 200, 220, 0.2)')
    
    ctx.strokeStyle = sgrad
    ctx.lineWidth = w
    ctx.lineCap = 'round'
    
    // 水流抖动
    const jitter = (1 - flow) * 3
    const jx = (Math.random() - 0.5) * jitter
    
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(sx + jx, (sy + ty) / 2, CENTER_X, ty)
    ctx.stroke()
    
    // 产生水滴
    if (Math.random() < flow * 0.4) {
      dropsRef.current.push({
        x: CENTER_X + (Math.random() - 0.5) * 6,
        y: ty,
        vy: 2 + flow * 3,
        life: 1
      })
    }
    
    // 产生涟漪
    if (Math.random() < flow * 0.15) {
      ripplesRef.current.push({
        x: CENTER_X + (Math.random() - 0.5) * 20,
        y: 360,
        r: 2,
        alpha: 0.6
      })
    }
  }
  
  const drawDrops = (ctx: CanvasRenderingContext2D) => {
    const drops = dropsRef.current
    if (drops.length === 0) return
    
    ctx.fillStyle = 'rgba(200, 220, 240, 0.7)'
    
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]
      
      ctx.beginPath()
      ctx.arc(d.x, d.y, 2, 0, Math.PI * 2)
      ctx.fill()
      
      d.y += d.vy
      d.life -= 0.02
      
      if (d.y > 360 || d.life <= 0) {
        if (d.y > 360) {
          ripplesRef.current.push({ x: d.x, y: 360, r: 3, alpha: 0.5 })
        }
        drops.splice(i, 1)
      }
    }
  }
  
  const drawRipples = (ctx: CanvasRenderingContext2D) => {
    const ripples = ripplesRef.current
    if (ripples.length === 0) return
    
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]
      
      ctx.strokeStyle = `rgba(109, 85, 65, ${r.alpha * 0.5})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(r.x, r.y, r.r * 2, r.r * 0.6, 0, 0, Math.PI * 2)
      ctx.stroke()
      
      r.r += 0.5
      r.alpha -= 0.015
      
      if (r.alpha <= 0) {
        ripples.splice(i, 1)
      }
    }
  }
  
  const drawSteam = (ctx: CanvasRenderingContext2D) => {
    const intensity = steamIntensityRef.current
    const particleCount = Math.floor(intensity * 12)
    
    for (let i = 0; i < particleCount; i++) {
      const t = Date.now() / 1000 + i * 0.5
      const x = CENTER_X + Math.sin(t * 2) * 25
      const y = 200 - (t * 50) % 80
      const size = 3 + Math.sin(t * 3) * 2
      const alpha = (1 - ((t * 50) % 80) / 80) * intensity * 0.4
      
      ctx.fillStyle = `rgba(220, 210, 200, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  // 绘制手冲壶：图片/壶身均随倾斜角度旋转，增强参与感
  const drawKettle = (ctx: CanvasRenderingContext2D) => {
    const { x, y, angle } = kettleRef.current
    const img = kettleImgRef.current
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle * Math.PI / 180)
    
    if (img?.complete && img.naturalWidth > 0) {
      const drawW = 100
      const drawH = drawW * (img.naturalHeight / img.naturalWidth)
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    } else {
      // 无图时的简易壶：壶身椭圆 + 细短小弯壶嘴
      const bodyGrad = ctx.createLinearGradient(-22, -25, 22, 30)
      bodyGrad.addColorStop(0, '#A67B5B')
      bodyGrad.addColorStop(0.5, '#C9A87C')
      bodyGrad.addColorStop(1, '#8B6914')
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.ellipse(0, 0, 26, 32, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#7A5A3A'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = '#B8956A'
      ctx.beginPath()
      ctx.moveTo(-24, 2)
      ctx.quadraticCurveTo(-38, -4, -46, -6)
      ctx.lineTo(-47, -5)
      ctx.quadraticCurveTo(-38, -4, -24, 4)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#5A4A3A'
      ctx.beginPath()
      ctx.ellipse(-47, -5.5, 1.2, 1.2, 0.2, 0, Math.PI * 2)
      ctx.fill()
    }
    
    if (kettleRef.current.pouring) {
      ctx.fillStyle = 'rgba(100, 80, 60, 0.8)'
      ctx.font = '11px "Noto Serif SC", serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.abs(angle).toFixed(0)}°`, 0, 52)
    }
    
    ctx.restore()
  }
  
  const drawProgress = (ctx: CanvasRenderingContext2D) => {
    const cx = CANVAS_WIDTH - 35
    const cy = 35
    const r = 22
    
    ctx.strokeStyle = 'rgba(139, 115, 95, 0.2)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    
    ctx.strokeStyle = '#8B7D70'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
    ctx.stroke()
    
    ctx.fillStyle = '#5A4A3A'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const phaseNum = phase === 'phase1' ? '1' : phase === 'steaming' ? '★' : '2'
    ctx.fillText(phaseNum, cx, cy)
  }
  
  // 采样
  const takeSample = useCallback(() => {
    const { flow, inCenter, angle } = calculateFlow()
    const sample: BrewSample = {
      timestamp: Date.now(),
      flow,
      inCenter,
      angle
    }
    
    if (phase === 'phase1') {
      samplesRef.current.push(sample)
      bloomLevelRef.current = Math.min(1, bloomLevelRef.current + flow * 0.015)
    } else if (phase === 'phase2') {
      samplesRef.current.push(sample)
      coffeeLevelRef.current = Math.min(1, coffeeLevelRef.current + flow * 0.008)
    }
  }, [phase, calculateFlow])
  
  // 开始第一段
  const startPhase1 = () => {
    setPhase('phase1')
    setPhaseText('第一段 · 唤醒')
    kettleRef.current.pouring = true
    samplesRef.current = []
    bloomLevelRef.current = 0
  }
  
  // 开始闷蒸
  const startSteaming = () => {
    setPhase('steaming')
    setPhaseText('闷蒸中...')
    kettleRef.current.pouring = false
    steamIntensityRef.current = bloomLevelRef.current
    
    const steamSample: BrewSample = {
      timestamp: Date.now(),
      flow: bloomLevelRef.current,
      inCenter: true,
      angle: 0
    }
    steamSamplesRef.current = [steamSample]
  }
  
  // 开始第二段
  const startPhase2 = () => {
    setPhase('phase2')
    setPhaseText('第二段 · 展开')
    kettleRef.current.pouring = true
  }
  
  // 计算得分
  const calculateScore = useCallback(() => {
    const allSamples = [...samplesRef.current, ...steamSamplesRef.current]
    if (allSamples.length === 0) return 0
    
    const flows = allSamples.map(s => s.flow)
    const avgFlow = flows.reduce((a, b) => a + b, 0) / flows.length
    const flowVariance = flows.reduce((sum, f) => sum + Math.pow(f - avgFlow, 2), 0) / flows.length
    const flowScore = Math.max(0, 1 - flowVariance * 3) * 40
    
    const centerHits = allSamples.filter(s => s.inCenter).length
    const centerScore = (centerHits / allSamples.length) * 30
    
    const steamScore = steamSamplesRef.current.length > 0
      ? Math.min(30, steamSamplesRef.current[0].flow * 30)
      : 0
    
    return Math.round(flowScore + centerScore + steamScore)
  }, [])
  
  // 完成
  const finishBrew = useCallback(() => {
    const score = calculateScore()
    dispatch(gameActions.setScorePart('brew', score))
    setPhase('complete')
    setPhaseText('萃取完成')
    
    setTimeout(() => {
      dispatch(gameActions.setStep(5))
    }, 1500)
  }, [calculateScore, dispatch])
  
  // 游戏循环
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete') return
    
    let phaseStartTime = Date.now()
    
    const loop = () => {
      const now = Date.now()
      const elapsed = now - phaseStartTime
      
      if (phase === 'phase1') {
        const prog = Math.min(1, elapsed / PHASE1_DURATION)
        setProgress(prog)
        
        if (elapsed >= PHASE1_DURATION) {
          startSteaming()
          phaseStartTime = now
        }
      } else if (phase === 'steaming') {
        const prog = Math.min(1, elapsed / STEAM_DURATION)
        setProgress(prog)
        
        steamIntensityRef.current = bloomLevelRef.current * (1 - prog * 0.3)
        
        if (elapsed >= STEAM_DURATION) {
          startPhase2()
          phaseStartTime = now
        }
      } else if (phase === 'phase2') {
        const prog = Math.min(1, elapsed / PHASE2_DURATION)
        setProgress(prog)
        
        if (elapsed >= PHASE2_DURATION) {
          setPhase('finishing')
          kettleRef.current.pouring = false
          phaseStartTime = now
        }
      } else if (phase === 'finishing') {
        if (elapsed >= 500) {
          finishBrew()
          return
        }
      }
      
      if (kettleRef.current.pouring) {
        takeSample()
      }
      
      if (phase === 'phase1' || phase === 'phase2') {
        const { flow, inCenter } = calculateFlow()
        if (flow < 0.2) {
          setFeedback('倾斜壶身')
        } else if (!inCenter) {
          setFeedback('对准中心')
        } else if (flow > 0.7) {
          setFeedback('水流湍急')
        } else {
          setFeedback('恰到好处')
        }
      } else if (phase === 'steaming') {
        setFeedback(bloomLevelRef.current > 0.6 ? '闷蒸充分' : '闷蒸不足')
      }
      
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, takeSample, draw, calculateFlow, finishBrew])
  
  // 初始绘制
  useEffect(() => {
    draw()
  }, [])
  
  // 交互：idle 时任意点击画布即可开始（手机端好点），开始后仅拖拽壶身移动
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas || phase === 'steaming' || phase === 'finishing' || phase === 'complete') return
    
    const rect = canvas.getBoundingClientRect()
    const scale = CANVAS_WIDTH / rect.width
    const x = (e.clientX - rect.left) * scale
    const y = (e.clientY - rect.top) * scale
    
    if (phase === 'idle') {
      canvas.setPointerCapture(e.pointerId)
      lastPosRef.current = { x, y }
      startPhase1()
      return
    }
    
    const kettle = kettleRef.current
    const dist = Math.sqrt(Math.pow(x - kettle.x, 2) + Math.pow(y - kettle.y, 2))
    if (dist < 60) {
      canvas.setPointerCapture(e.pointerId)
      lastPosRef.current = { x, y }
    }
  }
  
  const lastPosRef = useRef({ x: 0, y: 0 })
  
  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const scale = CANVAS_WIDTH / rect.width
    const x = (e.clientX - rect.left) * scale
    const y = (e.clientY - rect.top) * scale
    
    const dx = x - lastPosRef.current.x
    // 仅前倾到直立：角度范围 [前倾-45°, 直立0°]，不后仰
    const newAngle = kettleRef.current.angle + dx
    kettleRef.current.angle = Math.max(-45, Math.min(0, newAngle))
    kettleRef.current.x = Math.max(50, Math.min(CANVAS_WIDTH - 50, x))
    kettleRef.current.y = Math.max(40, Math.min(CANVAS_HEIGHT - 180, y))
    
    lastPosRef.current = { x, y }
  }
  
  const handlePointerUp = () => {
    // 手指抬起不停止
  }
  
  return (
    <div className="scene4-brew">
      <div className="scene4-content">
        <div className="logo-header">
          <img src="https://free.picui.cn/free/2026/02/16/6991ef86a5f5c.png" alt="水墨春秋" className="logo-shop" />
          <img src="https://free.picui.cn/free/2026/02/16/6991ef876bd7b.png" alt="拾陆年" className="logo-anniversary" />
        </div>
        <div className="scene-header">
          <span className="step-mark">肆</span>
          <h2 className="scene-title">注水</h2>
        </div>
        
        {phaseText && (
          <p className={`phase-text ${phase === 'steaming' ? 'steaming' : ''}`}>
            {phaseText}
          </p>
        )}
        
        {feedback && (
          <p className={`brew-feedback ${feedback ? 'visible' : ''}`}>
            {feedback}
          </p>
        )}
        
        <div className="brew-canvas-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="brew-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          
          {phase === 'idle' && (
            <div className="brew-start-hint">
              <p>点按提壶</p>
              <p className="sub">左右移动控制角度</p>
            </div>
          )}
          
          {phase === 'steaming' && (
            <div className="steam-indicator">
              <div className="steam-ring" />
              <p>让咖啡粉充分呼吸</p>
            </div>
          )}
        </div>
        
        <div className="brew-guide">
          <div className={`guide-step ${phase === 'phase1' ? 'active' : phase !== 'idle' ? 'done' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-name">唤醒</span>
          </div>
          <div className={`guide-arrow ${phase === 'steaming' ? 'pulse' : ''}`}>→</div>
          <div className={`guide-step ${phase === 'steaming' ? 'active' : phase === 'phase2' || phase === 'finishing' ? 'done' : ''}`}>
            <span className="step-num">★</span>
            <span className="step-name">闷蒸</span>
          </div>
          <div className={`guide-arrow ${phase === 'phase2' ? 'pulse' : ''}`}>→</div>
          <div className={`guide-step ${phase === 'phase2' ? 'active' : phase === 'finishing' ? 'done' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-name">展开</span>
          </div>
        </div>
      </div>
    </div>
  )
}
