import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame, gameActions } from '../app/store'
import { BeanType } from '../data/beans'
import './Scene2_SelectBeans.css'

const TRAY_WIDTH = 360
const TRAY_HEIGHT = 240
const BEAN_RADIUS = 10
const MARGIN = 25

type DragMode = 'none' | 'sweep' | 'pick'

interface Bean {
  id: string
  type: BeanType
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  removed: boolean
  bouncedOnce: boolean
  opacity: number
  dragOffsetX: number
  dragOffsetY: number
}

export function Scene2_SelectBeans() {
  const { dispatch } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  const beansRef = useRef<Bean[]>([])
  
  const [isFinished, setIsFinished] = useState(false)
  const [removedCount, setRemovedCount] = useState(0)
  const [feedback, setFeedback] = useState('')
  
  const dragModeRef = useRef<DragMode>('none')
  const draggedBeanRef = useRef<Bean | null>(null)
  const lastXRef = useRef(0)
  const pointerPosRef = useRef({ x: 0, y: 0 })
  
  // 初始化豆子
  const initBeans = useCallback(() => {
    const beans: Bean[] = []
    const types: BeanType[] = ['green', 'green', 'worm', 'broken']
    
    types.forEach((type, i) => {
      beans.push(createBean(type, i))
    })
    
    for (let i = 4; i < 24; i++) {
      beans.push(createBean('good', i))
    }
    
    beansRef.current = beans.sort(() => Math.random() - 0.5)
  }, [])
  
  const createBean = (type: BeanType, id: number): Bean => ({
    id: `bean-${id}`,
    type,
    x: MARGIN + Math.random() * (TRAY_WIDTH - MARGIN * 2),
    y: MARGIN + Math.random() * (TRAY_HEIGHT - MARGIN * 2),
    vx: 0,
    vy: 0,
    rotation: Math.random() * 360,
    removed: false,
    bouncedOnce: false,
    opacity: 1,
    dragOffsetX: 0,
    dragOffsetY: 0
  })
  
  // 找点击的豆子
  const findBeanAt = (x: number, y: number): Bean | null => {
    for (let i = beansRef.current.length - 1; i >= 0; i--) {
      const bean = beansRef.current[i]
      if (bean.removed || bean.opacity <= 0.01) continue
      const dist = Math.sqrt((x - bean.x) ** 2 + (y - bean.y) ** 2)
      if (dist < BEAN_RADIUS + 4) return bean
    }
    return null
  }
  
  // 绘制
  const drawBean = (ctx: CanvasRenderingContext2D, bean: Bean) => {
    if (bean.opacity <= 0.01) return
    
    ctx.save()
    ctx.globalAlpha = bean.opacity
    ctx.translate(bean.x, bean.y)
    ctx.rotate((bean.rotation * Math.PI) / 180)
    
    switch (bean.type) {
      case 'good':
        drawGoodBean(ctx)
        break
      case 'green':
        drawGreenBean(ctx)
        break
      case 'broken':
        drawBrokenBean(ctx)
        break
      case 'worm':
        drawWormBean(ctx)
        break
    }
    
    ctx.restore()
  }
  
  const drawGoodBean = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(-2, -2, 0, 0, 0, BEAN_RADIUS)
    gradient.addColorStop(0, '#7A5A45')
    gradient.addColorStop(0.6, '#5A3A28')
    gradient.addColorStop(1, '#4A2E20')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(0, 0, BEAN_RADIUS, BEAN_RADIUS * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(40, 30, 20, 0.4)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, -BEAN_RADIUS * 0.5)
    ctx.quadraticCurveTo(1, 0, 0, BEAN_RADIUS * 0.5)
    ctx.stroke()
  }
  
  const drawGreenBean = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(-2, -2, 0, 0, 0, BEAN_RADIUS)
    gradient.addColorStop(0, '#9AB888')
    gradient.addColorStop(0.6, '#7A9868')
    gradient.addColorStop(1, '#5A7848')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(0, 0, BEAN_RADIUS, BEAN_RADIUS * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(60, 80, 40, 0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, -BEAN_RADIUS * 0.5)
    ctx.quadraticCurveTo(1, 0, 0, BEAN_RADIUS * 0.5)
    ctx.stroke()
  }
  
  const drawBrokenBean = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(-2, -2, 0, 0, 0, BEAN_RADIUS)
    gradient.addColorStop(0, '#7A5A45')
    gradient.addColorStop(0.6, '#5A3A28')
    gradient.addColorStop(1, '#4A2E20')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(0, 0, BEAN_RADIUS * 0.8, BEAN_RADIUS * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(2, -4)
    ctx.lineTo(-3, 4)
    ctx.stroke()
    
    ctx.fillStyle = '#3D2820'
    ctx.beginPath()
    ctx.moveTo(5, -3)
    ctx.lineTo(7, 0)
    ctx.lineTo(4, -5)
    ctx.fill()
  }
  
  const drawWormBean = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(-2, -2, 0, 0, 0, BEAN_RADIUS)
    gradient.addColorStop(0, '#8A6A55')
    gradient.addColorStop(0.6, '#6A4A38')
    gradient.addColorStop(1, '#5A3E2E')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(0, 0, BEAN_RADIUS, BEAN_RADIUS * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(40, 30, 20, 0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, -BEAN_RADIUS * 0.5)
    ctx.quadraticCurveTo(1, 0, 0, BEAN_RADIUS * 0.5)
    ctx.stroke()
    
    ctx.fillStyle = 'rgba(40, 25, 15, 0.7)'
    ctx.beginPath()
    ctx.arc(2, -1, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(-1, 2, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const drawTray = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, TRAY_WIDTH, TRAY_HEIGHT)
    gradient.addColorStop(0, '#C9BBA0')
    gradient.addColorStop(0.5, '#B8A890')
    gradient.addColorStop(1, '#A89880')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(0, 0, TRAY_WIDTH, TRAY_HEIGHT, 8)
    ctx.fill()
    
    ctx.strokeStyle = 'rgba(100, 85, 70, 0.15)'
    ctx.lineWidth = 0.5
    for (let i = 15; i < TRAY_WIDTH; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 4)
      ctx.lineTo(i, TRAY_HEIGHT - 4)
      ctx.stroke()
    }
    
    ctx.strokeStyle = 'rgba(80, 65, 50, 0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(2, 2, TRAY_WIDTH - 4, TRAY_HEIGHT - 4, 6)
    ctx.stroke()
    
    const innerGradient = ctx.createRadialGradient(
      TRAY_WIDTH/2, TRAY_HEIGHT/2, 0,
      TRAY_WIDTH/2, TRAY_HEIGHT/2, TRAY_WIDTH/2
    )
    innerGradient.addColorStop(0, 'rgba(100, 85, 70, 0.05)')
    innerGradient.addColorStop(1, 'rgba(100, 85, 70, 0.12)')
    ctx.fillStyle = innerGradient
    ctx.fill()
  }
  
  // 物理更新
  const updatePhysics = () => {
    beansRef.current.forEach(bean => {
      if (draggedBeanRef.current === bean) return
      
      if (bean.removed) {
        bean.opacity -= 0.05
        return
      }
      
      bean.vx *= 0.95
      bean.vy *= 0.95
      bean.x += bean.vx
      bean.y += bean.vy
      bean.rotation += (bean.vx + bean.vy) * 2
      
      const margin = BEAN_RADIUS
      if (bean.x < margin) { bean.x = margin; bean.vx *= -0.6 }
      else if (bean.x > TRAY_WIDTH - margin) { bean.x = TRAY_WIDTH - margin; bean.vx *= -0.6 }
      
      if (bean.y < margin) { bean.y = margin; bean.vy *= -0.6 }
      else if (bean.y > TRAY_HEIGHT - margin) { bean.y = TRAY_HEIGHT - margin; bean.vy *= -0.6 }
      
      const threshold = 40
      if (bean.x < -threshold || bean.x > TRAY_WIDTH + threshold ||
          bean.y < -threshold || bean.y > TRAY_HEIGHT + threshold) {
        handleBeanRemoval(bean)
      }
    })
  }
  
  const handleBeanRemoval = (bean: Bean) => {
    const problemTypes: BeanType[] = ['green', 'broken', 'worm']
    
    if (problemTypes.includes(bean.type)) {
      bean.removed = true
      setFeedback('拣出异豆')
    } else {
      if (bean.bouncedOnce) {
        bean.removed = true
        setFeedback('误弃好豆')
      } else {
        bean.bouncedOnce = true
        const cx = TRAY_WIDTH / 2
        const cy = TRAY_HEIGHT / 2
        const dx = bean.x - cx
        const dy = bean.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist > 0) {
          bean.vx = -(dx / dist) * 4
          bean.vy = -(dy / dist) * 4
        }
        
        bean.x = Math.max(MARGIN, Math.min(TRAY_WIDTH - MARGIN, bean.x))
        bean.y = Math.max(MARGIN, Math.min(TRAY_HEIGHT - MARGIN, bean.y))
        setFeedback('好豆留步')
      }
    }
    
    const removed = beansRef.current.filter(b => b.removed).length
    setRemovedCount(removed)
    setTimeout(() => setFeedback(''), 800)
  }
  
  // 渲染
  const render = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, TRAY_WIDTH, TRAY_HEIGHT)
    drawTray(ctx)
    
    beansRef.current.forEach(bean => {
      if (bean !== draggedBeanRef.current) {
        drawBean(ctx, bean)
      }
    })
    
    if (draggedBeanRef.current) {
      drawBean(ctx, draggedBeanRef.current)
    }
    
    rafRef.current = requestAnimationFrame(render)
  }
  
  // 交互事件
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas || isFinished) return
    
    const rect = canvas.getBoundingClientRect()
    const scale = TRAY_WIDTH / rect.width
    const x = (e.clientX - rect.left) * scale
    const y = (e.clientY - rect.top) * scale
    
    pointerPosRef.current = { x, y }
    
    const clickedBean = findBeanAt(x, y)
    
    if (clickedBean) {
      dragModeRef.current = 'pick'
      draggedBeanRef.current = clickedBean
      clickedBean.dragOffsetX = x - clickedBean.x
      clickedBean.dragOffsetY = y - clickedBean.y
      clickedBean.vx = 0
      clickedBean.vy = 0
      canvas.setPointerCapture(e.pointerId)
    } else {
      dragModeRef.current = 'sweep'
      lastXRef.current = x
      canvas.setPointerCapture(e.pointerId)
    }
  }
  
  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas || isFinished) return
    
    const rect = canvas.getBoundingClientRect()
    const scale = TRAY_WIDTH / rect.width
    const x = (e.clientX - rect.left) * scale
    const y = (e.clientY - rect.top) * scale
    
    pointerPosRef.current = { x, y }
    
    if (dragModeRef.current === 'pick' && draggedBeanRef.current) {
      draggedBeanRef.current.x = x - draggedBeanRef.current.dragOffsetX
      draggedBeanRef.current.y = y - draggedBeanRef.current.dragOffsetY
      draggedBeanRef.current.rotation += 2
      
      const margin = -10
      if (draggedBeanRef.current.x < margin ||
          draggedBeanRef.current.x > TRAY_WIDTH - margin ||
          draggedBeanRef.current.y < margin ||
          draggedBeanRef.current.y > TRAY_HEIGHT - margin) {
        handleBeanRemoval(draggedBeanRef.current)
        draggedBeanRef.current = null
        dragModeRef.current = 'none'
      }
    } else if (dragModeRef.current === 'sweep') {
      const deltaX = x - lastXRef.current
      lastXRef.current = x
      
      if (Math.abs(deltaX) > 1) {
        beansRef.current.forEach(bean => {
          if (!bean.removed && bean !== draggedBeanRef.current) {
            bean.vx += deltaX * 0.12
            bean.vy += (Math.random() - 0.5) * Math.abs(deltaX) * 0.03
          }
        })
      }
    }
  }
  
  const handlePointerUp = () => {
    dragModeRef.current = 'none'
    draggedBeanRef.current = null
  }
  
  // 计算得分
  const calculateScore = () => {
    const removed = beansRef.current.filter(b => b.removed)
    const correct = removed.filter(b => ['green', 'broken', 'worm'].includes(b.type)).length
    const wrong = removed.filter(b => b.type === 'good').length
    
    let total = correct * 5 - wrong * 3
    if (correct === 4 && wrong === 0) total += 5
    
    return Math.max(0, Math.min(25, total))
  }
  
  const handleFinish = () => {
    const score = calculateScore()
    dispatch(gameActions.setScorePart('selectBean', score))
    setIsFinished(true)
  }
  
  const handleNext = () => {
    dispatch(gameActions.setStep(3))
  }
  
  const handleReset = () => {
    initBeans()
    setIsFinished(false)
    setRemovedCount(0)
    dragModeRef.current = 'none'
    draggedBeanRef.current = null
  }
  
  // 初始化
  useEffect(() => {
    initBeans()
    
    const animate = () => {
      updatePhysics()
      render()
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])
  
  const remainingCount = beansRef.current.filter(b => !b.removed).length
  
  return (
    <div className="scene2-select-beans">
      <div className="scene2-content">
        <div className="logo-header">
          <img src="https://free.picui.cn/free/2026/02/16/6991ef86a5f5c.png" alt="水墨春秋" className="logo-shop" />
          <img src="https://free.picui.cn/free/2026/02/16/6991ef876bd7b.png" alt="拾陆年" className="logo-anniversary" />
        </div>
        <div className="scene-header">
          <span className="step-mark">贰</span>
          <h2 className="scene-title">拣豆</h2>
        </div>
        
        <p className="scene-hint">轻扫滚动，点选拣出</p>
        
        {feedback && <div className="feedback-toast">{feedback}</div>}
        
        <div className="tray-wrapper">
          <canvas
            ref={canvasRef}
            width={TRAY_WIDTH}
            height={TRAY_HEIGHT}
            className="bamboo-tray"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          
          <div className="bean-legend">
            <span className="legend-item green">青</span>
            <span className="legend-item worm">蛀</span>
            <span className="legend-item broken">损</span>
          </div>
        </div>
        
        <div className="status-bar">
          <span>已拣 {removedCount}</span>
          <span className="divider">|</span>
          <span>余 {remainingCount}</span>
        </div>
        
        <div className="action-buttons">
          {!isFinished ? (
            <>
              <button className="btn-text" onClick={handleReset}>重筛</button>
              <button className="btn-primary" onClick={handleFinish}>筛毕</button>
            </>
          ) : (
            <button className="btn-primary" onClick={handleNext}>下一章</button>
          )}
        </div>
      </div>
    </div>
  )
}
