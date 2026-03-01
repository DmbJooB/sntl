/**
 * Draws a tiled watermark on the given canvas context.
 */
const drawWatermarkOnCanvas = (ctx, width, height) => {
    ctx.save()
    const fontSize = Math.max(14, Math.min(width, height) * 0.035)
    ctx.font = `700 ${fontSize}px Inter, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.30)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    const text = 'SUNU NATAAL'
    const spacing = fontSize * 8
    const angle = -Math.PI / 6 // -30 degrees

    ctx.translate(width / 2, height / 2)
    ctx.rotate(angle)

    const diagonal = Math.sqrt(width * width + height * height)
    const cols = Math.ceil(diagonal / spacing) + 2
    const rows = Math.ceil(diagonal / spacing) + 2

    for (let row = -rows; row <= rows; row++) {
        for (let col = -cols; col <= cols; col++) {
            ctx.fillText(text, col * spacing, row * spacing * 1.5)
        }
    }

    ctx.restore()
}

/**
 * Loads an image to a canvas, trying fetch-as-blob first to bypass CORS,
 * then falls back to direct Image() load with crossOrigin anonymous.
 */
const loadImageToCanvas = async (imageUrl) => {
    // Strategy 1: fetch → blob → object URL (bypasses CORS for most CDNs)
    try {
        const resp = await fetch(imageUrl, { mode: 'cors' })
        if (resp.ok) {
            const blob = await resp.blob()
            const objectUrl = URL.createObjectURL(blob)
            const img = new Image()
            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = reject
                img.src = objectUrl
            })
            URL.revokeObjectURL(objectUrl)
            return img
        }
    } catch (_) {
        // fall through
    }

    // Strategy 2: direct Image() with crossOrigin
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
    })
    return img
}

/**
 * Downloads an image with a watermark burned in.
 * Used for free downloads and previews (not purchased images).
 */
export const downloadWithWatermark = async (imageUrl, filename) => {
    try {
        const img = await loadImageToCanvas(imageUrl)

        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawWatermarkOnCanvas(ctx, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    } catch (error) {
        console.error('Erreur watermark download:', error)
        // Last resort: download original with no watermark (only if all else fails)
        const a = document.createElement('a')
        a.href = imageUrl
        a.download = filename
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
}

/**
 * Downloads a PURCHASED image — resized to the selected format, no watermark.
 */
export const downloadPurchasedImage = async (imageUrl, filename, sizeOption) => {
    try {
        const img = await loadImageToCanvas(imageUrl)

        let targetWidth = img.naturalWidth || img.width
        let targetHeight = img.naturalHeight || img.height

        if (sizeOption === 'small') {
            const ratio = Math.min(800 / targetWidth, 600 / targetHeight)
            if (ratio < 1) {
                targetWidth = Math.round(targetWidth * ratio)
                targetHeight = Math.round(targetHeight * ratio)
            }
        } else if (sizeOption === 'medium') {
            const ratio = Math.min(2400 / targetWidth, 1600 / targetHeight)
            if (ratio < 1) {
                targetWidth = Math.round(targetWidth * ratio)
                targetHeight = Math.round(targetHeight * ratio)
            }
        }
        // 'large' = original dimensions, no resize

        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        // No watermark on purchased images

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    } catch (error) {
        console.error("Erreur téléchargement image achetée:", error)
        const a = document.createElement('a')
        a.href = imageUrl
        a.download = filename
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
}
