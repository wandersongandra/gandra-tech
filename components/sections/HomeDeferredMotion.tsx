'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const CardStack = dynamic(() => import('@/components/motion/CardStack'), { ssr: false })
const ScrollThread = dynamic(() => import('@/components/motion/ScrollThread'), { ssr: false })
const Marquee = dynamic(() => import('@/components/motion/Marquee'))
const Manifesto = dynamic(() => import('@/components/sections/Manifesto'))

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

function useIdleReady(timeout = 900) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const idleWindow = window as IdleWindow
    let timer: number | undefined
    let idleHandle: number | undefined

    const show = () => setReady(true)

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(show, { timeout })
    } else {
      timer = window.setTimeout(show, Math.min(timeout, 600))
    }

    return () => {
      if (idleHandle !== undefined && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle)
      }
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [timeout])

  return ready
}

export function DeferredVisualEffects() {
  const ready = useIdleReady(1200)

  if (!ready) return null

  return (
    <>
      <ScrollThread />
      <CardStack />
    </>
  )
}

export function DeferredMarquee({ inverted = false, speed = 32 }: { inverted?: boolean; speed?: number }) {
  return <Marquee inverted={inverted} speed={speed} />
}

export function DeferredManifesto() {
  return <Manifesto />
}
