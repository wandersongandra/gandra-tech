'use client'

import dynamic from 'next/dynamic'

const Marquee = dynamic(() => import('@/components/motion/Marquee'))
const Manifesto = dynamic(() => import('@/components/sections/Manifesto'))

export function DeferredMarquee({ inverted = false, speed = 32 }: { inverted?: boolean; speed?: number }) {
  return <Marquee inverted={inverted} speed={speed} />
}

export function DeferredManifesto() {
  return <Manifesto />
}
