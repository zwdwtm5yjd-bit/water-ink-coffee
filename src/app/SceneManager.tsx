import { useGame } from './store'
import { Scene1_Mood } from '../scenes/Scene1_Mood'
import { Scene2_SelectBeans } from '../scenes/Scene2_SelectBeans'
import { Scene3_Grind } from '../scenes/Scene3_Grind'
import { Scene4_Brew } from '../scenes/Scene4_Brew'
import { Scene5_TasteAndSign } from '../scenes/Scene5_TasteAndSign'
import { Scene6_RenderCard } from '../scenes/Scene6_RenderCard'
import { useEffect, useRef, useState, useCallback } from 'react'

export function SceneManager() {
  const { state } = useGame()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // 初始化背景音乐（使用 base 路径，兼容 Vite 开发与 GitHub Pages 部署）
  useEffect(() => {
    const base = import.meta.env.BASE_URL
    const audioSrc = `${base}bg-music.mp3`.replace(/\/\/+/, '/')
    const audio = new Audio(audioSrc)
    audio.loop = true
    audio.volume = 0.5
    audio.preload = 'auto'
    audioRef.current = audio
    audio.addEventListener('error', () => {
      console.warn('Background music failed to load. Add public/bg-music.mp3 or check path.')
    })
    
    // 用户首次点击页面时播放音乐
    const handleFirstInteraction = async () => {
      if (!audioRef.current) return
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      if (isPlaying) return
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        console.warn('Background music requires user gesture:', err)
      }
    }

    // 监听用户交互
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((err) => {
        console.error('Failed to toggle play:', err)
      })
    }
  }, [isPlaying])

  const renderScene = () => {
    switch (state.step) {
      case 1:
        return <Scene1_Mood />
      case 2:
        return <Scene2_SelectBeans />
      case 3:
        return <Scene3_Grind />
      case 4:
        return <Scene4_Brew />
      case 5:
        return <Scene5_TasteAndSign />
      case 6:
        return <Scene6_RenderCard />
      default:
        return <Scene1_Mood />
    }
  }

  return (
    <div className="scene-manager">
      {renderScene()}
      {/* 音乐控制按钮 */}
      <button 
        className="music-toggle"
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(90, 74, 58, 0.85)',
          color: '#FAF9F7',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(4px)'
        }}
      >
        {isPlaying ? '🔔' : '🔕'}
      </button>
    </div>
  )
}
