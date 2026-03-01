import React from 'react'

// Subtle watermark overlay — renders a light diagonal tiled text grid
export default function WatermarkOverlay({ opacity = 0.18 }) {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 20,
            overflow: 'hidden',
            opacity: opacity,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                position: 'absolute',
                width: '200%',
                height: '200%',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '60px 40px',
                padding: '40px',
                transform: 'rotate(-25deg)',
                userSelect: 'none',
                alignContent: 'center',
                justifyContent: 'center'
            }}>
                {Array.from({ length: 30 }).map((_, i) => (
                    <span key={i} style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        fontFamily: 'Inter, sans-serif',
                        whiteSpace: 'nowrap',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.35)',
                    }}>SUNU NATAAL</span>
                ))}
            </div>
        </div>
    )
}
