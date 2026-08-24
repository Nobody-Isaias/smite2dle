import { useEffect, useRef, useState } from 'react'

type ClueImageProps = {
  src: string
  className?: string
  blur?: number
  greyscale?: boolean
  rotation?: number
}

/**
 * Draws a clue image into a canvas with its blur and greyscale baked into the
 * pixels.
 *
 * A CSS `filter` on an `<img>` is only a paint effect: the element still holds
 * the untouched original, so dragging it to the desktop, opening it in a new
 * tab, or reading `src` in devtools hands you the clean answer. Compositing to
 * a canvas means the distorted pixels are the only ones that exist client-side.
 *
 * The source URL is still visible in the network panel - hiding that needs a
 * proxy - but this removes every cheat that does not require devtools.
 */
export function ClueImage({
  src,
  className,
  blur = 0,
  greyscale = false,
  rotation = 0,
}: ClueImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setImage(null)

    const nextImage = new Image()
    nextImage.decoding = 'async'
    nextImage.onload = () => {
      if (!cancelled) {
        setImage(nextImage)
      }
    }
    nextImage.onerror = () => {
      if (!cancelled) {
        setImage(null)
      }
    }
    nextImage.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const draw = () => {
      const context = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()

      if (!context || rect.width === 0 || rect.height === 0) {
        return
      }

      const ratio = window.devicePixelRatio || 1
      const width = Math.round(rect.width * ratio)
      const height = Math.round(rect.height * ratio)

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, width, height)

      if (!image) {
        return
      }

      // Quarter turns swap the box the artwork has to fit inside.
      const quarterTurned = Math.abs(rotation % 180) === 90
      const boxWidth = quarterTurned ? height : width
      const boxHeight = quarterTurned ? width : height

      const scale = Math.min(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight)
      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale

      context.filter = `${greyscale ? 'grayscale(1) ' : ''}blur(${blur * ratio}px)`
      context.translate(width / 2, height / 2)

      if (rotation) {
        context.rotate((rotation * Math.PI) / 180)
      }

      context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
      context.filter = 'none'
      context.setTransform(1, 0, 0, 1, 0, 0)
    }

    draw()

    const observer = new ResizeObserver(draw)
    observer.observe(canvas)

    return () => {
      observer.disconnect()
    }
  }, [image, blur, greyscale, rotation])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    />
  )
}
