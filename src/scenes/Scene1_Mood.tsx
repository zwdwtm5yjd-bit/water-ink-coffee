import { useState, useEffect, useRef } from 'react'
import { useGame, gameActions } from '../app/store'
import './Scene1_Mood.css'

const moodOptions = [
  { value: 'calm' as const, label: '静', desc: '风止心静，岁暮安详' },
  { value: 'expectant' as const, label: '盼', desc: '春信将至，万物待苏' },
  { value: 'nostalgic' as const, label: '忆', desc: '旧岁如烟，余香绕梁' },
  { value: 'hopeful' as const, label: '望', desc: '晨光初绽，前路昭昭' }
]

export function Scene1_Mood() {
  const { dispatch } = useGame()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [inkSpreading, setInkSpreading] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 水墨背景动画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    // 绘制水墨晕染
    let time = 0
    const drawInk = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 多层水墨晕染
      for (let i = 0; i < 3; i++) {
        const x = canvas.width * (0.2 + i * 0.3) + Math.sin(time * 0.001 + i) * 50
        const y = canvas.height * (0.3 + i * 0.2) + Math.cos(time * 0.001 + i) * 30
        const radius = 150 + Math.sin(time * 0.0005 + i) * 50
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `rgba(107, 90, 75, ${0.03 + i * 0.01})`)
        gradient.addColorStop(0.5, `rgba(139, 115, 95, ${0.02 + i * 0.005})`)
        gradient.addColorStop(1, 'rgba(139, 115, 95, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      time += 16
      requestAnimationFrame(drawInk)
    }
    
    const rafId = requestAnimationFrame(drawInk)
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const handleSelect = (mood: string) => {
    if (selectedMood) return
    
    setSelectedMood(mood)
    dispatch(gameActions.setMood(mood as any))
    
    // 墨韵扩散
    setTimeout(() => {
      setInkSpreading(true)
    }, 300)
    
    setTimeout(() => {
      setShowTransition(true)
    }, 1200)
    
    setTimeout(() => {
      dispatch(gameActions.setStep(2))
    }, 2000)
  }

  return (
    <div className="scene1-mood">
      {/* 水墨背景层 */}
      <canvas ref={canvasRef} className="ink-canvas" />
      
      {/* 纸质纹理层 */}
      <div className="paper-texture" />
      
      <div className="scene1-content">
        {/* Logo区 */}
        <div className="logo-header-scene1">
          <img src="https://free.picui.cn/free/2026/02/16/6991ef86a5f5c.png" alt="水墨春秋" className="logo-shop" />
          <img src="https://free.picui.cn/free/2026/02/16/6991ef876bd7b.png" alt="拾陆年" className="logo-anniversary" />
        </div>
        
        {/* 标题区 */}
        <div className="title-section">
          <div className="season-mark">甲辰岁暮</div>
          <h1 className="main-title">心境</h1>
          <p className="subtitle">岁末 contemplation，择一心境</p>
        </div>
        
        {/* 心境选项 - 古卷轴风格 */}
        <div className="mood-scroll">
          {moodOptions.map((option, index) => (
            <button
              key={option.value}
              className={`mood-card ${selectedMood === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              disabled={selectedMood !== null}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="card-inner">
                <span className="mood-char">{option.label}</span>
                <div className="mood-divider" />
                <span className="mood-desc">{option.desc}</span>
              </div>
              {selectedMood === option.value && (
                <div className="ink-bloom" />
              )}
            </button>
          ))}
        </div>
        
        {/* 底部印章 */}
        <div className="seal-mark">水墨春秋</div>
      </div>
      
      {/* 墨韵过渡 */}
      {inkSpreading && (
        <div className="ink-transition">
          <div className="ink-drop ink-drop-1" />
          <div className="ink-drop ink-drop-2" />
          <div className="ink-drop ink-drop-3" />
        </div>
      )}
      
      {/* 场景切换遮罩 */}
      {showTransition && <div className="scene-fade" />}
    </div>
  )
}
