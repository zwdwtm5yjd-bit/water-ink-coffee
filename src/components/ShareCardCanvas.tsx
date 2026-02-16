import { useEffect, useRef } from 'react'
import { useGame } from '../app/store'
import { berryRedColor, getPersonalityColorValue } from '../data/colors'

const LOGO1_URL = `${import.meta.env.BASE_URL}logo1.png`.replace(/\/\/+/, '/')

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

interface ShareCardCanvasProps {
  onReady: (dataUrl: string) => void
}

export function ShareCardCanvas({ onReady }: ShareCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state } = useGame()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas dimensions (4:5 ratio)
    const width = 1080
    const height = 1350
    const dpr = window.devicePixelRatio || 1

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.scale(dpr, dpr)

    // Get data
    const colorSystem = state.colorSystem
    const zen = state.zen
    const blessing = state.blessing
    const beanResult = state.beanResult
    const signatureImage = state.signatureImage
    const serialNumber = state.serialNumber
    const totalScore = state.score.total

    if (!colorSystem || !zen || !blessing || !beanResult || !signatureImage || !serialNumber) {
      return
    }

    let cancelled = false
    const run = async () => {
      let logoImg: HTMLImageElement | null = null
      try {
        logoImg = await loadImage(LOGO1_URL)
      } catch {
        // 本地 logo 加载失败时继续绘制，仅无 logo
      }
      if (cancelled) return

      // 1. Background
      ctx.fillStyle = colorSystem.background
      ctx.fillRect(0, 0, width, height)

      // 2. Border decoration based on score tier
      drawBorderDecoration(ctx, width, height, totalScore, colorSystem.goldEdge)

      // 2.5 Logo1 置于卡片顶部中央
      if (logoImg?.complete && logoImg.naturalWidth > 0) {
        const logoH = 52
        const logoW = logoH * (logoImg.naturalWidth / logoImg.naturalHeight)
        const logoX = (width - logoW) / 2
        const logoY = 58
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH)
      }

      // 3. 禅字区域（不再显示「您的年度咖啡人格」）
      const zenCenterY = height * 0.28
      
      // 4. Zen character
      ctx.font = '240px "Noto Serif SC", serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fillText(zen.word, width / 2, zenCenterY)

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // 5. Zen explanation
      ctx.fillStyle = '#4A4A4A'
      ctx.font = '32px "Noto Sans SC", sans-serif'
      ctx.textBaseline = 'top'
      ctx.fillText(zen.explanation, width / 2, zenCenterY + 140)
      ctx.textBaseline = 'middle'

      // 6. Personality sentence（卡片上不用白色，浅底看不见）
      const personColor = colorSystem.personalityColor === 'white' ? '#2C2C2C' : getPersonalityColorValue(colorSystem.personalityColor)
      ctx.fillStyle = personColor
      ctx.font = 'bold 36px "Noto Sans SC", sans-serif'
      wrapText(ctx, state.personalitySentence || '', width / 2, height * 0.48, width * 0.8, 50)

      // 7. 年度风味
      const flavorY = height * 0.62
      ctx.fillStyle = '#6A6A6A'
      ctx.font = '24px "Noto Sans SC", sans-serif'
      ctx.fillText('年度风味', width / 2, flavorY)

      ctx.fillStyle = '#2C2C2C'
      ctx.font = 'bold 48px "Noto Serif SC", serif'
      ctx.fillText(beanResult.name, width / 2, flavorY + 58)
      ctx.font = '26px "Noto Sans SC", sans-serif'
      ctx.fillStyle = '#4A4A4A'
      ctx.fillText(beanResult.processName, width / 2, flavorY + 100)

      ctx.font = '28px "Noto Sans SC", sans-serif'
      if (beanResult.type === 'perfect' && beanResult.specialText) {
        ctx.fillStyle = '#4A4A4A'
        ctx.fillText('完整', width / 2, flavorY + 155)
        ctx.font = 'italic 24px "Noto Sans SC", sans-serif'
        ctx.fillStyle = '#6A6A6A'
        ctx.fillText(beanResult.specialText, width / 2, flavorY + 195)
      } else {
        ctx.fillStyle = '#6A6A6A'
        ctx.fillText(beanResult.flavors.join(' / '), width / 2, flavorY + 155)
      }
      // 豆评（与评测对应的一句话）
      const beanComment = (beanResult as { beanComment?: string }).beanComment
      if (beanComment) {
        ctx.font = '22px "Noto Sans SC", sans-serif'
        ctx.fillStyle = '#8A8A8A'
        ctx.fillText(beanComment, width / 2, flavorY + 200)
      }

      // 8. Blessing
      const blessingY = height * 0.82
      ctx.fillStyle = '#2C2C2C'
      ctx.font = '32px "Noto Sans SC", sans-serif'
      ctx.fillText(blessing.main, width / 2, blessingY)
      ctx.font = '24px "Noto Sans SC", sans-serif'
      ctx.fillStyle = '#4A4A4A'
      ctx.fillText(blessing.sub, width / 2, blessingY + 40)

      function exportCanvas() {
        if (cancelled || !canvas) return
        const dataUrl = canvas.toDataURL('image/png', 0.95)
        onReady(dataUrl)
      }

      // 9. Signature image
      if (signatureImage) {
        const img = new Image()
        img.onload = () => {
          if (cancelled) return
          const sigWidth = 300
          const sigHeight = 100
          const sigX = (width - sigWidth) / 2
          const sigY = height * 0.91
          ctx.drawImage(img, sigX, sigY, sigWidth, sigHeight)
          ctx.fillStyle = 'rgba(74, 74, 74, 0.4)'
          ctx.font = '16px monospace'
          ctx.fillText(serialNumber, width / 2, height - 30)
          exportCanvas()
        }
        img.src = signatureImage
      } else {
        ctx.fillStyle = 'rgba(74, 74, 74, 0.4)'
        ctx.font = '16px monospace'
        ctx.fillText(serialNumber, width / 2, height - 30)
        exportCanvas()
      }
    }

    run()
    return () => { cancelled = true }
  }, [state, onReady])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'none',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  )
}

function drawBorderDecoration(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  score: number,
  goldEdge: boolean
) {
  const margin = 40
  const lineWidth = 2

  // Main border
  ctx.strokeStyle = '#2C2C2C'
  ctx.lineWidth = lineWidth
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2)

  // Inner border
  ctx.strokeStyle = 'rgba(44, 44, 44, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(margin + 8, margin + 8, width - (margin + 8) * 2, height - (margin + 8) * 2)

  // Gold edge if applicable
  if (goldEdge) {
    ctx.strokeStyle = 'rgba(201, 168, 108, 0.6)'
    ctx.lineWidth = 1
    ctx.strokeRect(margin + 2, margin + 2, width - (margin + 2) * 2, height - (margin + 2) * 2)
  }

  // Decorative berries (red fruits) based on score tier
  const berryCount = getBerryCount(score)
  const berryRadius = 8

  for (let i = 0; i < berryCount; i++) {
    const angle = (Math.PI * 2 * i) / berryCount - Math.PI / 4
    const distance = 30
    const x = margin + distance + Math.cos(angle) * 10
    const y = margin + distance + Math.sin(angle) * 10

    // Draw berry
    ctx.fillStyle = berryRedColor
    ctx.beginPath()
    ctx.arc(x, y, berryRadius, 0, Math.PI * 2)
    ctx.fill()

    // Small stem
    ctx.strokeStyle = '#4A4A4A'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y - berryRadius)
    ctx.lineTo(x, y - berryRadius - 6)
    ctx.stroke()

    // Leaf
    ctx.fillStyle = '#6A7A5A'
    ctx.beginPath()
    ctx.ellipse(x + 3, y - berryRadius - 6, 6, 3, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Corner decorations (branch patterns)
  drawBranchPattern(ctx, margin, margin, 0) // top-left
  drawBranchPattern(ctx, width - margin, margin, Math.PI / 2) // top-right
  drawBranchPattern(ctx, width - margin, height - margin, Math.PI) // bottom-right
  drawBranchPattern(ctx, margin, height - margin, -Math.PI / 2) // bottom-left
}

function getBerryCount(score: number): number {
  if (score >= 95) return 8
  if (score >= 86) return 6
  if (score >= 71) return 4
  if (score >= 51) return 2
  return 0
}

function drawBranchPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  ctx.strokeStyle = 'rgba(44, 44, 44, 0.3)'
  ctx.lineWidth = 1

  // Simple branch pattern
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(25, 0)

  // Small side branches
  ctx.moveTo(10, 0)
  ctx.lineTo(15, -5)

  ctx.moveTo(18, 0)
  ctx.lineTo(23, 5)

  ctx.stroke()

  ctx.restore()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}
