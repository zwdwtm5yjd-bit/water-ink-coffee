import { useState, useEffect, useCallback, useRef } from 'react'
import { useGame, gameActions } from '../app/store'
import { zenWords } from '../data/zen'
import { 
  backgroundColors, 
  getRandomZenColor,
  signatureColors,
  getRandomPersonalityColor,
  getPersonalityColorValue,
  getRandomCalligraphyFont,
  getRandomBrushFont,
  goldBorderColor,
  berryRedColor
} from '../data/colors'
import { calculateBeanResult } from '../data/beans'
import { getPersonalitySentence, resolvePersonalityType, PersonalityType } from '../data/personality'
import './Scene6_RenderCard.css'

type RevealPhase = 'ink' | 'zen' | 'personality' | 'flavor' | 'blessing' | 'sign' | 'complete'

// Logo：保存的卡片优先用本地 logo1，页面展示可用图床
const LOGO1_LOCAL = `${import.meta.env.BASE_URL}logo1.png`.replace(/\/\/+/, '/')
const LOGO1_URL = 'https://free.picui.cn/free/2026/02/16/6991ef86a5f5c.png'
const LOGO2_URL = 'https://free.picui.cn/free/2026/02/16/6991ef876bd7b.png'

export function Scene6_RenderCard() {
  const { state, dispatch } = useGame()
  const [phase, setPhase] = useState<RevealPhase>('ink')
  const [cardDataUrl, setCardDataUrl] = useState<string>('')
  const [finalData, setFinalData] = useState<{
    personalityType: PersonalityType
    personalitySentence: string
    beanResult: { type: string; name: string; processName: string; flavors: string[]; beanComment?: string }
    signatureColor: string
    zenFont: string
    bodyFont: string
    background: string
    zenColor: string
    personalityColor: 'black' | 'white' | 'gold'
    goldEdge: boolean
    zen: typeof zenWords[0]
    blessing: { main: string; sub: string }
    serialNumber: string
    totalScore: number
  } | null>(null)
  
  // 初始化所有数据
  useEffect(() => {
    const totalScore = state.score.selectBean + state.score.grind + state.score.brew
    const mood = state.moodChoice || 'calm'
    
    // 1. 确定颜色系统（每次重新生成禅字颜色）
    let background: string
    let zenColor: string
    let personalityColor: 'black' | 'white' | 'gold'
    let goldEdge: boolean
    
    // 背景色只生成一次
    if (state.colorSystem) {
      background = state.colorSystem.background
      personalityColor = state.colorSystem.personalityColor
      goldEdge = state.colorSystem.goldEdge
    } else {
      background = backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
      const personality = getRandomPersonalityColor()
      personalityColor = personality.color
      goldEdge = personality.goldEdge
    }
    // 禅字颜色每次重新随机（1%金色，9种其他颜色均分）
    zenColor = getRandomZenColor()
    
    // 2. 确定禅字
    const zen = state.zen || zenWords[Math.floor(Math.random() * zenWords.length)]
    if (!state.zen) {
      dispatch(gameActions.setZen(zen))
    }
    
    // 3. 确定人格
    let personalityType: PersonalityType
    let personalitySentence: string
    
    if (state.personalitySentence) {
      personalityType = '静水流深'
      personalitySentence = state.personalitySentence
    } else {
      personalityType = resolvePersonalityType(mood, state.score.grind, state.score.brew)
      const isRare = totalScore >= 95 && Math.random() < 0.1
      const sentenceObj = getPersonalitySentence(personalityType, isRare)
      personalitySentence = sentenceObj.text
      dispatch(gameActions.setPersonalitySentence(personalitySentence))
    }
    
    // 4. 确定豆子
    let beanResult: { type: string; name: string; processName: string; flavors: string[]; beanComment?: string }
    
    if (state.beanResult) {
      beanResult = state.beanResult as any
    } else {
      const result = calculateBeanResult(totalScore, personalityType)
      beanResult = {
        type: result.type,
        name: result.name,
        processName: result.processName,
        flavors: result.flavors,
        beanComment: result.beanComment
      }
      dispatch(gameActions.setBeanResult(beanResult as any))
    }
    
    // 5. 确定祝福
    let blessing: { main: string; sub: string }
    if (state.blessing) {
      blessing = state.blessing
    } else {
      blessing = zen.blessings[Math.floor(Math.random() * zen.blessings.length)]
      dispatch(gameActions.setBlessing(blessing))
    }
    
    // 6. 确定编号
    const serialNumber = state.serialNumber || `SM-2026-${Math.floor(1000 + Math.random() * 9000)}`
    if (!state.serialNumber) {
      dispatch(gameActions.setSerialNumber(serialNumber))
    }
    
    // 7. 保存颜色系统
    if (!state.colorSystem) {
      dispatch(gameActions.setColors({ background, zenColor, personalityColor, goldEdge }))
    }
    
    // 8. 随机视觉元素
    const zenFont = getRandomBrushFont()
    const bodyFont = getRandomCalligraphyFont()
    const signatureColor = signatureColors[Math.floor(Math.random() * signatureColors.length)]
    
    setFinalData({
      personalityType,
      personalitySentence,
      beanResult,
      signatureColor,
      zenFont,
      bodyFont,
      background,
      zenColor,
      personalityColor,
      goldEdge,
      zen,
      blessing,
      serialNumber,
      totalScore
    })
  }, [])
  
  // 动画序列
  useEffect(() => {
    if (!finalData) return
    const timers: NodeJS.Timeout[] = []
    timers.push(setTimeout(() => setPhase('complete'), 600))
    return () => timers.forEach(clearTimeout)
  }, [finalData])
  
  const [jpgDataUrl, setJpgDataUrl] = useState<string>('')

  const handleCardReady = useCallback((url: string) => {
    setCardDataUrl(url)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(img, 0, 0)
        setJpgDataUrl(c.toDataURL('image/jpeg', 0.92))
      }
    }
    img.src = url
  }, [])

  const saveAsJpg = useCallback(() => {
    const doDownload = (url: string) => {
      const link = document.createElement('a')
      link.download = `水墨咖啡签-${state.serialNumber}.jpg`
      link.href = url
      link.click()
    }
    if (jpgDataUrl) {
      doDownload(jpgDataUrl)
      return
    }
    if (!cardDataUrl) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(img, 0, 0)
        doDownload(c.toDataURL('image/jpeg', 0.92))
      }
    }
    img.src = cardDataUrl
  }, [jpgDataUrl, cardDataUrl, state.serialNumber])

  const handleSave = () => saveAsJpg()

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleCardTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null
      saveAsJpg()
    }, 500)
  }
  const handleCardTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }
  const handleCardContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    saveAsJpg()
  }

  const handleRestart = () => dispatch(gameActions.resetAll())
  
  if (!finalData || !state.signatureImage) {
    return (
      <div className="scene6-render">
        <div className="loading">墨韵凝香...</div>
      </div>
    )
  }
  
  const renderData = finalData
  
  return (
    <div className="scene6-render" style={{ background: renderData.background }}>
      {/* 顶部Logo */}
      <div className="scene6-logo">
        <img src={LOGO1_URL} alt="水墨春秋" />
      </div>
      
      <CardCanvasRenderer 
        data={renderData} 
        signatureImage={state.signatureImage} 
        onReady={handleCardReady} 
      />
      
      <div className="scene6-content">
        {phase !== 'complete' ? (
          <div className="reveal-stage">
            <div className="loading">墨韵凝香...</div>
          </div>
        ) : (
          <div className="complete-stage">
            {cardDataUrl && (
              <div
                className="card-preview"
                onTouchStart={handleCardTouchStart}
                onTouchEnd={handleCardTouchEnd}
                onTouchCancel={handleCardTouchEnd}
                onContextMenu={handleCardContextMenu}
              >
                <img src={cardDataUrl} alt="水墨咖啡签" draggable={false} />
              </div>
            )}
            <div className="action-buttons">
              <button className="btn-save" style={{ fontFamily: renderData.bodyFont }} onClick={handleSave}>
                保存
              </button>
              <button className="btn-restart" style={{ fontFamily: renderData.bodyFont }} onClick={handleRestart}>
                再冲
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface CardData {
  background: string
  zenColor: string
  personalityColor: 'black' | 'white' | 'gold'
  goldEdge: boolean
  signatureColor: string
  zenFont: string
  bodyFont: string
  zen: { word: string; explanation: string }
  blessing: { main: string; sub: string }
  beanResult: { type: string; name: string; processName: string; flavors: string[]; beanComment?: string }
  personalitySentence: string
  personalityType: PersonalityType
  serialNumber: string
  totalScore: number
}

function CardCanvasRenderer({ 
  data, 
  signatureImage, 
  onReady 
}: { 
  data: CardData
  signatureImage: string
  onReady: (url: string) => void 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderedRef = useRef(false)
  const logo1Loaded = useRef<HTMLImageElement | null>(null)
  const logo2Loaded = useRef<HTMLImageElement | null>(null)
  const localLogoLoaded = useRef<HTMLImageElement | null>(null)
  
  // Logo加载函数
  const loadLogoWithRetry = useCallback((url: string, retries = 2): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const tryLoad = (attempt: number) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        const timeout = setTimeout(() => {
          console.log(`Logo load timeout: ${url} (attempt ${attempt})`)
          if (attempt < retries) {
            tryLoad(attempt + 1)
          } else {
            resolve(null)
          }
        }, 3000)
        
        img.onload = () => {
          clearTimeout(timeout)
          resolve(img)
        }
        
        img.onerror = () => {
          clearTimeout(timeout)
          console.log(`Logo load error: ${url} (attempt ${attempt})`)
          if (attempt < retries) {
            tryLoad(attempt + 1)
          } else {
            resolve(null)
          }
        }
        
        img.src = url
      }
      
      tryLoad(0)
    })
  }, [])
  
  useEffect(() => {
    if (renderedRef.current) return
    
    const loadImages = async () => {
      // 保存的卡片必须带 logo1：先加载本地 logo1.png，失败再用网络
      const logo1Local = await loadLogoWithRetry(LOGO1_LOCAL)
      const logo1Network = logo1Local ? null : await loadLogoWithRetry(LOGO1_URL)
      logo1Loaded.current = logo1Local || logo1Network
      logo2Loaded.current = await loadLogoWithRetry(LOGO2_URL)
      localLogoLoaded.current = await new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = `${import.meta.env.BASE_URL}logo-card.png`.replace(/\/\/+/, '/')
      })
      drawCard()
    }
    
    const drawCard = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const W = 1080
      const H = 1920
      const dpr = 2
      
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.scale(dpr, dpr)
      
      ctx.fillStyle = data.background
      ctx.fillRect(0, 0, W, H)
      
      ctx.fillStyle = 'rgba(0,0,0,0.008)'
      for (let i = 0; i < 300; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 2, Math.random() * 2)
      }
      
      drawMuchaBorder(ctx, W, H, data.totalScore, data.goldEdge)
      
      // logo1 改在签名右侧绘制（放大一倍、逆时针15°），见下方签名 onload 内
      
      // 4. 禅字区域（不再显示「您的年度咖啡人格」）
      const zenY = H * 0.22
      
      // 5. 巨大禅字
      ctx.font = `380px ${data.zenFont}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      
      for (let i = 3; i >= 1; i--) {
        ctx.shadowColor = data.zenColor
        ctx.shadowBlur = i * 10
        ctx.globalAlpha = 0.02
        ctx.fillText(data.zen.word, W / 2 + i * 2, zenY + i * 2)
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      ctx.fillText(data.zen.word, W / 2, zenY)
      
      // 6. 解释
      ctx.fillStyle = lightenColor(data.zenColor, 15)
      ctx.font = `34px ${data.bodyFont}`
      ctx.textBaseline = 'top'
      ctx.fillText(data.zen.explanation, W / 2, zenY + 70)
      
      // 7. 装饰分隔线
      drawElegantDivider(ctx, W / 2, H * 0.32)
      
      // 8. 人格句
      const personY = H * 0.37
      const personColor = data.personalityColor === 'white' ? '#2C2C2C' : getPersonalityColorValue(data.personalityColor)
      ctx.fillStyle = personColor
      ctx.font = `bold 46px ${data.bodyFont}`
      wrapText(ctx, data.personalitySentence, W / 2, personY, W * 0.82, 62)
      
      // 9. 装饰分隔线
      drawElegantDivider(ctx, W / 2, H * 0.48)
      
      // 10. 年度风味
      const flavorY = H * 0.52
      ctx.fillStyle = '#7A6A5A'
      ctx.font = `28px ${data.bodyFont}`
      ctx.fillText('年度风味', W / 2, flavorY)
      
      ctx.fillStyle = '#3D3530'
      ctx.font = `bold 48px ${data.bodyFont}`
      ctx.fillText(`${data.beanResult.name} · ${data.beanResult.processName}`, W / 2, flavorY + 58)
      
      ctx.font = `28px ${data.bodyFont}`
      if (data.beanResult.type === 'perfect') {
        ctx.fillStyle = '#5A4A3A'
        ctx.fillText('兰花 · 果香花香 · 甜橙', W / 2, flavorY + 118)
      } else {
        ctx.fillStyle = '#5A4A3A'
        const displayFlavors = data.beanResult.flavors.slice(0, 4).join(' · ')
        ctx.fillText(displayFlavors, W / 2, flavorY + 118)
      }
      // 豆评（与评测对应的一句话）；完美豆不显示豆评，避免与风味栏重叠
      const beanComment = data.beanResult.beanComment
      if (beanComment && data.beanResult.type !== 'perfect') {
        ctx.font = `24px ${data.bodyFont}`
        ctx.fillStyle = '#8A7A6A'
        ctx.fillText(beanComment, W / 2, flavorY + 158)
      }
      
      // 11. 装饰分隔线
      drawElegantDivider(ctx, W / 2, H * 0.66)
      
      // 12. 祝福
      const blessingY = H * 0.70
      ctx.fillStyle = '#2C2C2C'
      ctx.font = `bold 40px ${data.bodyFont}`
      ctx.fillText(data.blessing.main, W / 2, blessingY)
      ctx.font = `30px ${data.bodyFont}`
      ctx.fillStyle = '#4A4A4A'
      ctx.fillText(data.blessing.sub, W / 2, blessingY + 55)
      
      // 13. 装饰分隔线
      drawElegantDivider(ctx, W / 2, H * 0.80)
      
      // 14. 签名区域（放大醒目）
      const signY = H * 0.84
      // 95 分以上在「落笔」上方显示金色「水墨年度珍藏」
      if (data.totalScore >= 95) {
        ctx.fillStyle = goldBorderColor
        ctx.font = `36px ${data.bodyFont}`
        ctx.fillText('水墨年度珍藏', W / 2, signY - 48)
      }
      ctx.fillStyle = '#8B7D70'
      ctx.font = `32px ${data.bodyFont}`
      ctx.fillText('落笔', W / 2, signY)
      
      // 绘制签名 - 更大更醒目
      const img = new Image()
      img.onload = () => {
        const signW = 460
        const signH = 140
        const signX = (W - signW) / 2
        const signYPos = signY + 45
        
        // 创建临时canvas处理签名
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = signW
        tempCanvas.height = signH
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0, signW, signH)
          const imageData = tempCtx.getImageData(0, 0, signW, signH)
          const pixelData = imageData.data
          
          const colorHex = data.signatureColor
          const r = parseInt(colorHex.slice(1, 3), 16)
          const g = parseInt(colorHex.slice(3, 5), 16)
          const b = parseInt(colorHex.slice(5, 7), 16)
          
          for (let idx = 0; idx < pixelData.length; idx += 4) {
            const alpha = pixelData[idx + 3]
            if (alpha > 50) {
              const intensity = (pixelData[idx] + pixelData[idx + 1] + pixelData[idx + 2]) / 3
              const factor = intensity / 255
              pixelData[idx] = Math.round(r * factor + (255 - r) * (1 - factor) * 0.9)
              pixelData[idx + 1] = Math.round(g * factor + (255 - g) * (1 - factor) * 0.9)
              pixelData[idx + 2] = Math.round(b * factor + (255 - b) * (1 - factor) * 0.9)
            } else {
              pixelData[idx + 3] = 0
            }
          }
          
          tempCtx.putImageData(imageData, 0, 0)
          ctx.drawImage(tempCanvas, signX, signYPos)
        }
        
        // logo1：签名的右边，放大一倍（96px 高），逆时针倾斜 15°
        const logo1 = logo1Loaded.current || localLogoLoaded.current
        if (logo1?.complete && logo1.naturalWidth > 0) {
          const logoH = 96
          const logoW = logoH * (logo1.naturalWidth / logo1.naturalHeight)
          const gap = 24
          const logoCenterX = signX + signW + gap + logoW / 2
          const logoCenterY = signYPos + signH / 2
          ctx.save()
          ctx.translate(logoCenterX, logoCenterY)
          ctx.rotate((-15 * Math.PI) / 180)
          ctx.drawImage(logo1, -logoW / 2, -logoH / 2, logoW, logoH)
          ctx.restore()
        }
        
        // 编号
        ctx.fillStyle = 'rgba(100, 90, 80, 0.3)'
        ctx.font = '12px monospace'
        ctx.textAlign = 'right'
        ctx.fillText(data.serialNumber, W - 60, H - 50)
        
        onReady(canvas.toDataURL('image/png', 0.95))
        renderedRef.current = true
      }
      img.onerror = () => {
        ctx.fillStyle = 'rgba(100, 90, 80, 0.3)'
        ctx.font = '12px monospace'
        ctx.textAlign = 'right'
        ctx.fillText(data.serialNumber, W - 60, H - 50)
        onReady(canvas.toDataURL('image/png', 0.95))
        renderedRef.current = true
      }
      img.crossOrigin = 'anonymous'
      img.src = signatureImage
    }
    
    loadImages()
  }, [data, signatureImage, onReady])
  
  return <canvas ref={canvasRef} style={{ display: 'none' }} />
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x00FF) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

function drawElegantDivider(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = 'rgba(139, 115, 95, 0.25)'
  ctx.lineWidth = 1
  
  ctx.fillStyle = berryRedColor
  ctx.beginPath()
  ctx.arc(x, y, 4, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.moveTo(x - 80, y)
  ctx.lineTo(x - 15, y)
  ctx.moveTo(x + 15, y)
  ctx.lineTo(x + 80, y)
  ctx.stroke()
  
  ctx.fillStyle = goldBorderColor
  ctx.beginPath()
  ctx.arc(x - 90, y, 2, 0, Math.PI * 2)
  ctx.arc(x + 90, y, 2, 0, Math.PI * 2)
  ctx.fill()
}

// 慕夏风格装饰边框 - 优雅对称、植物装饰、金色线条
function drawMuchaBorder(ctx: CanvasRenderingContext2D, W: number, H: number, score: number, goldEdge: boolean) {
  const margin = 60
  const level = Math.min(5, Math.floor(score / 20) + 1)
  
  const lineColor = goldEdge ? 'rgba(180, 150, 80, 0.9)' : 'rgba(100, 80, 60, 0.85)'
  const accentColor = goldEdge ? 'rgba(200, 170, 100, 0.8)' : 'rgba(130, 110, 90, 0.7)'
  const leafColor = '#7A9A7A'
  const flowerColor = '#C9A0B0'
  
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // 1. 顶部拱形装饰框架
  const topY = margin
  const archHeight = 45
  
  // 外拱
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(margin, topY + archHeight)
  ctx.quadraticCurveTo(W / 2, topY - 20, W - margin, topY + archHeight)
  ctx.stroke()
  
  // 内拱
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(margin + 15, topY + archHeight - 8)
  ctx.quadraticCurveTo(W / 2, topY - 5, W - margin - 15, topY + archHeight - 8)
  ctx.stroke()
  
  // 顶部中心装饰 - 扇形贝壳
  ctx.fillStyle = accentColor
  ctx.beginPath()
  ctx.moveTo(W / 2, topY + 5)
  for (let i = -4; i <= 4; i++) {
    const angle = (i / 4) * Math.PI / 3
    const r = 25
    ctx.lineTo(W / 2 + Math.sin(angle) * r, topY + 15 - Math.cos(angle) * r * 0.5)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // 顶部两侧花卉装饰
  for (let side = -1; side <= 1; side += 2) {
    const cx = W / 2 + side * 120
    const cy = topY + 25
    
    // 花朵
    ctx.fillStyle = flowerColor
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.PI / 2
      const r = 12
      ctx.beginPath()
      ctx.ellipse(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.6, 6, 4, angle, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 花蕊
    ctx.fillStyle = goldEdge ? '#E8D0A0' : '#D4C4A8'
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // 2. 底部拱形装饰框架（对称）
  const bottomY = H - margin
  
  ctx.lineWidth = 3
  ctx.strokeStyle = lineColor
  ctx.beginPath()
  ctx.moveTo(margin, bottomY - archHeight)
  ctx.quadraticCurveTo(W / 2, bottomY + 20, W - margin, bottomY - archHeight)
  ctx.stroke()
  
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(margin + 15, bottomY - archHeight + 8)
  ctx.quadraticCurveTo(W / 2, bottomY + 5, W - margin - 15, bottomY - archHeight + 8)
  ctx.stroke()
  
  // 底部中心装饰
  ctx.fillStyle = accentColor
  ctx.beginPath()
  ctx.moveTo(W / 2, bottomY - 5)
  for (let i = -4; i <= 4; i++) {
    const angle = (i / 4) * Math.PI / 3
    const r = 25
    ctx.lineTo(W / 2 + Math.sin(angle) * r, bottomY - 15 + Math.cos(angle) * r * 0.5)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // 3. 左右侧边装饰 - 优雅的S形曲线
  const sideMargin = margin + 10
  
  // 左侧
  ctx.lineWidth = 2.5
  ctx.strokeStyle = lineColor
  ctx.beginPath()
  ctx.moveTo(sideMargin, topY + archHeight + 30)
  ctx.bezierCurveTo(sideMargin - 15, H / 3, sideMargin + 10, H * 2 / 3, sideMargin, bottomY - archHeight - 30)
  ctx.stroke()
  
  // 右侧
  ctx.beginPath()
  ctx.moveTo(W - sideMargin, topY + archHeight + 30)
  ctx.bezierCurveTo(W - sideMargin + 15, H / 3, W - sideMargin - 10, H * 2 / 3, W - sideMargin, bottomY - archHeight - 30)
  ctx.stroke()
  
  // 4. 侧边装饰花卉
  for (let side = 0; side < 2; side++) {
    const sx = side === 0 ? sideMargin : W - sideMargin
    
    // 上部花卉
    for (let i = 0; i < 3; i++) {
      const sy = topY + archHeight + 60 + i * (H / 2 - archHeight * 2 - 60) / 2
      
      // 藤蔓卷
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(sx + (side === 0 ? -8 : 8), sy, 10, 0, Math.PI * 1.5)
      ctx.stroke()
      
      // 小花
      ctx.fillStyle = i % 2 === 0 ? flowerColor : leafColor
      ctx.beginPath()
      ctx.arc(sx + (side === 0 ? -12 : 12), sy - 5, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  // 5. 四角强化装饰 - 洛可可涡卷
  const corners = [
    { x: margin, y: topY + archHeight, angle: 0 },
    { x: W - margin, y: topY + archHeight, angle: Math.PI / 2 },
    { x: W - margin, y: bottomY - archHeight, angle: Math.PI },
    { x: margin, y: bottomY - archHeight, angle: Math.PI * 1.5 }
  ]
  
  corners.forEach((corner) => {
    ctx.save()
    ctx.translate(corner.x, corner.y)
    ctx.rotate(corner.angle)
    
    // 涡卷纹
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, 30)
    ctx.bezierCurveTo(20, 28, 40, 15, 35, 0)
    ctx.bezierCurveTo(30, -15, 10, -10, 5, -5)
    ctx.stroke()
    
    // 内侧小涡卷
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(8, 20)
    ctx.quadraticCurveTo(20, 18, 22, 8)
    ctx.stroke()
    
    // 装饰圆点
    ctx.fillStyle = goldEdge ? '#E8D0A0' : '#B8A890'
    ctx.beginPath()
    ctx.arc(15, 10, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // 叶片装饰
    ctx.fillStyle = leafColor
    for (let i = 0; i < 3; i++) {
      ctx.save()
      ctx.translate(12 + i * 10, 18 - i * 8)
      ctx.rotate(-0.5 + i * 0.4)
      ctx.beginPath()
      ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    
    ctx.restore()
  })
  
  // 6. 内侧细线框
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1
  ctx.strokeRect(margin + 25, topY + archHeight + 15, W - (margin + 25) * 2, H - (topY + archHeight + 15) * 2)
  
  // 7. 顶部等级指示 - 小花环
  if (level > 0) {
    const indicatorY = topY + archHeight - 5
    for (let i = 0; i < level; i++) {
      const angle = (i / (level - 1 || 1) - 0.5) * Math.PI * 0.6
      const r = 40
      const cx = W / 2 + Math.sin(angle) * r
      const cy = indicatorY + Math.cos(angle) * r * 0.3
      
      ctx.fillStyle = i % 2 === 0 ? berryRedColor : flowerColor
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const chars = text.split('')
  let line = ''
  let cy = y
  
  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i]
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line, x, cy)
      line = chars[i]
      cy += lineH
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, cy)
}
