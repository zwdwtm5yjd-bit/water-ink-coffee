import { useState, useEffect, useCallback } from 'react'
import { useGame, gameActions } from '../app/store'
import { zenWords } from '../data/zen'
import { SignaturePad } from '../components/SignaturePad'
import './Scene5_TasteAndSign.css'

type ScenePhase = 'tasting' | 'zen-emerge' | 'explain' | 'signature' | 'complete'

export function Scene5_TasteAndSign() {
  const { state, dispatch } = useGame()
  const [phase, setPhase] = useState<ScenePhase>('tasting')
  const [rewriteCount, setRewriteCount] = useState(0)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  
  // 确保数据完整
  useEffect(() => {
    if (!state.zen) {
      const randomZen = zenWords[Math.floor(Math.random() * zenWords.length)]
      dispatch(gameActions.setZen(randomZen))
    }
    
    if (!state.colorSystem) {
      const backgrounds = ['#E8DDD4', '#F0EBE3', '#EDE6DA', '#E5DDD0']
      const zenColors = ['#2C2C2C', '#3D3530', '#4A4038', '#5A5040']
      
      dispatch(gameActions.setColors({
        background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
        zenColor: zenColors[Math.floor(Math.random() * zenColors.length)],
        personalityColor: Math.random() > 0.5 ? 'black' : 'white',
        goldEdge: Math.random() > 0.95
      }))
    }
    
    if (!state.serialNumber) {
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      dispatch(gameActions.setSerialNumber(`SM-2026-${randomNum}`))
    }
  }, [state.zen, state.colorSystem, state.serialNumber, dispatch])
  
  // 动画序列
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    timers.push(setTimeout(() => setPhase('zen-emerge'), 500))
    timers.push(setTimeout(() => setPhase('explain'), 1800))
    timers.push(setTimeout(() => setPhase('signature'), 3000))
    
    return () => timers.forEach(clearTimeout)
  }, [])
  
  const handleSignatureComplete = useCallback((dataUrl: string) => {
    setSignatureData(dataUrl)
    dispatch(gameActions.setSignatureImage(dataUrl))
  }, [dispatch])
  
  const handleRewrite = () => {
    if (rewriteCount < 1) {
      setSignatureData(null)
      setRewriteCount(c => c + 1)
    }
  }
  
  const handleComplete = () => {
    setPhase('complete')
    setTimeout(() => {
      dispatch(gameActions.setStep(6))
    }, 1500)
  }
  
  const zen = state.zen
  const colorSystem = state.colorSystem
  
  const showZen = phase === 'zen-emerge' || phase === 'explain' || phase === 'signature' || phase === 'complete'
  const showExplain = phase === 'explain' || phase === 'signature' || phase === 'complete'
  const showSignature = phase === 'signature' || phase === 'complete'
  const showComplete = phase === 'complete'
  
  return (
    <div className="scene5-taste-sign" style={{ background: colorSystem?.background || '#E8DDD4' }}>
      <div className="logo-header-scene5">
        <img src="https://free.picui.cn/free/2026/02/16/6991ef86a5f5c.png" alt="水墨春秋" className="logo-shop" />
        <img src="https://free.picui.cn/free/2026/02/16/6991ef876bd7b.png" alt="拾陆年" className="logo-anniversary" />
      </div>
      <div className="scene5-content">
        {/* 品茗区 */}
        <div className={`tasting-area ${showZen ? 'shrink' : ''}`}>
          <div className="tea-bowl">
            <div className="bowl-body">
              <div className="bowl-liquid">
                {showZen && (
                  <div 
                    className={`zen-char ${phase === 'explain' || phase === 'signature' || phase === 'complete' ? 'settled' : 'emerging'}`}
                    style={{ color: colorSystem?.zenColor || '#3D3530' }}
                  >
                    {zen?.word}
                  </div>
                )}
              </div>
            </div>
            <div className="bowl-stand" />
          </div>
          
          {showExplain && (
            <p className={`zen-explain ${phase === 'signature' || phase === 'complete' ? 'visible' : ''}`}>
              {zen?.explanation}
            </p>
          )}
        </div>
        
        {/* 签名区 */}
        {showSignature && !showComplete && (
          <div className={`signature-area ${phase === 'signature' ? 'visible' : ''}`}>
            <p className="sign-prompt">为这杯咖啡，签上你的名字</p>
            
            <div className="sign-line-box">
              <div className="base-line" />
              <SignaturePad
                key={rewriteCount}
                onComplete={handleSignatureComplete}
                width={520}
                height={260}
              />
            </div>
            
            <div className="sign-actions">
              {rewriteCount < 1 && signatureData && (
                <button className="btn-text" onClick={handleRewrite}>重写</button>
              )}
              <button 
                className="btn-primary" 
                onClick={handleComplete}
                disabled={!signatureData}
              >
                完成落款
              </button>
            </div>
          </div>
        )}
        
        {/* 完成 */}
        {showComplete && (
          <div className="complete-area">
            <div className="red-seal">落款完成</div>
            <p className="serial">{state.serialNumber}</p>
          </div>
        )}
      </div>
    </div>
  )
}
