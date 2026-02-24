'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function Home() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const allMessages = [
    { text: "Hey you", emoji: "💕" },
    { text: "Happy Birthday", emoji: "🎈" },
    { text: "May God bless you", emoji: "🍀" },
    { text: "And give u many happiness", emoji: "💕" },
    { text: "Just saying... you're pretty", emoji: "" },
    { text: "awesome", emoji: "💖" },
    { text: "Sending good vibes and maybe a", emoji: "" },
    { text: "wink", emoji: "😉" },
    { text: "Hope u have a great day today", emoji: "💖" },
    { text: "", emoji: "🎂" }
  ];

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let treeProgress = 0;
    let floatingHearts = [];
    let particles = [];
    let treeHearts = [];
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    class FloatingHeart {
      constructor() {
        const rect = canvas.parentElement.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = rect.height + 20;
        this.size = Math.random() * 15 + 8;
        this.speed = Math.random() * 1.5 + 0.5;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.colors = ['#ff6b9d', '#ff8e8e', '#ffd93d', '#ff6b6b', '#ee5a6f', '#ff9ff3', '#feca57', '#ffb6c1', '#ff69b4'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }
      
      update() {
        this.y -= this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;
        this.rotation += this.rotationSpeed;
        const rect = canvas.parentElement.getBoundingClientRect();
        if (this.y < rect.height * 0.2) {
          this.opacity -= 0.01;
        }
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const s = this.size;
        ctx.moveTo(0, -s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.8, -s, -s * 0.3, 0, s * 0.8);
        ctx.bezierCurveTo(s, -s * 0.3, s * 0.5, -s * 0.8, 0, -s * 0.3);
        ctx.fill();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      
      isOffScreen() {
        return this.y < -50 || this.opacity <= 0;
      }
    }
    
    class TreeHeart {
      constructor(x, y, size, color, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = (targetX - x) * 0.02;
        this.vy = (targetY - y) * 0.02;
        this.scale = 0;
        this.targetScale = 1;
        this.alpha = 1;
        this.floatOffset = Math.random() * Math.PI * 2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          this.vx *= 0.8;
          this.vy *= 0.8;
          this.floatOffset += 0.02;
          this.y += Math.sin(this.floatOffset) * 0.3;
        }
        if (this.scale < this.targetScale) {
          this.scale += 0.05;
        }
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        const s = this.size;
        ctx.moveTo(0, -s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.8, -s, -s * 0.3, 0, s * 0.8);
        ctx.bezierCurveTo(s, -s * 0.3, s * 0.5, -s * 0.8, 0, -s * 0.3);
        ctx.fill();
        ctx.restore();
      }
    }
    
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1;
        this.color = color;
        this.size = Math.random() * 5 + 2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15;
        this.life -= 0.015;
      }
      
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    function drawTreeBranch(x, y, angle, length, width, depth, maxDepth) {
      if (depth > maxDepth || length < 2) return;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      const progress = Math.min(1, Math.max(0, (treeProgress - depth * 0.08) / 0.25));
      
      if (progress > 0) {
        const currentEndX = x + (endX - x) * progress;
        const currentEndY = y + (endY - y) * progress;
        const r = Math.floor(255 - depth * 8);
        const g = Math.floor(182 - depth * 4);
        const b = Math.floor(193 - depth * 2);
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.lineWidth = width * progress;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(currentEndX, currentEndY);
        ctx.stroke();
        
        if (progress > 0.85 && depth >= maxDepth - 1) {
          const heartColors = ['#ff6b9d', '#ff8e8e', '#ffd93d', '#ff6b6b', '#ee5a6f', '#ff9ff3', '#feca57', '#ffb6c1'];
          const color = heartColors[Math.floor(Math.random() * heartColors.length)];
          if (Math.random() < 0.6) {
            const spread = isMobile ? 40 : 60;
            treeHearts.push(new TreeHeart(
              currentEndX,
              currentEndY,
              Math.random() * (isMobile ? 10 : 14) + 6,
              color,
              currentEndX + (Math.random() - 0.5) * spread,
              currentEndY + (Math.random() - 0.5) * spread
            ));
          }
        }
        
        if (progress > 0.4) {
          const branchAngle = isMobile ? 0.45 : 0.5;
          const lengthMult = isMobile ? 0.72 : 0.7;
          const newLength = length * lengthMult;
          const newWidth = width * 0.7;
          drawTreeBranch(currentEndX, currentEndY, angle - branchAngle, newLength, newWidth, depth + 1, maxDepth);
          drawTreeBranch(currentEndX, currentEndY, angle + branchAngle, newLength, newWidth, depth + 1, maxDepth);
          if (depth < 3 && !isMobile) {
            drawTreeBranch(currentEndX, currentEndY, angle, newLength * 0.8, newWidth * 0.8, depth + 2, maxDepth);
          }
        }
      }
    }
    
    function drawGround() {
      const rect = canvas.parentElement.getBoundingClientRect();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, rect.height - (isMobile ? 30 : 50));
      ctx.lineTo(rect.width, rect.height - (isMobile ? 30 : 50));
      ctx.stroke();
    }
    
    let frameCount = 0;
    
    function animate() {
      const rect = canvas.parentElement.getBoundingClientRect();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, rect.width, rect.height);
      drawGround();
      
      if (started) {
        if (treeProgress < 4) {
          treeProgress += 0.012;
        }
        const treeX = isMobile ? rect.width * 0.5 : rect.width * 0.6;
        const treeY = rect.height - (isMobile ? 30 : 50);
        const initialLength = isMobile ? 100 : 160;
        const initialWidth = isMobile ? 10 : 16;
        const maxDepth = isMobile ? 8 : 10;
        
        drawTreeBranch(treeX, treeY, -Math.PI / 2, initialLength, initialWidth, 0, maxDepth);
        
        treeHearts.forEach(heart => {
          heart.update();
          heart.draw();
        });
        
        frameCount++;
        const spawnRate = isMobile ? 40 : 25;
        if (frameCount % spawnRate === 0) {
          floatingHearts.push(new FloatingHeart());
        }
        
        floatingHearts = floatingHearts.filter(heart => {
          heart.update();
          heart.draw();
          return !heart.isOffScreen();
        });
        
        particles = particles.filter(particle => {
          particle.update();
          particle.draw();
          return particle.life > 0;
        });
      }
      
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [started, isMobile]);
  
  useEffect(() => {
    if (!started) return;
    let index = 0;
    const typeNextMessage = () => {
      if (index >= allMessages.length) return;
      const msg = allMessages[index];
      let charIndex = 0;
      const fullText = msg.text;
      const interval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[index] = {
              text: fullText.slice(0, charIndex),
              emoji: msg.emoji,
              showCursor: charIndex < fullText.length
            };
            return newMessages;
          });
          charIndex++;
        } else {
          clearInterval(interval);
          index++;
          setTimeout(typeNextMessage, isMobile ? 400 : 600);
        }
      }, isMobile ? 40 : 50);
    };
    const timeout = setTimeout(typeNextMessage, 800);
    return () => clearTimeout(timeout);
  }, [started, isMobile]);
  
  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh', 
        background: '#000', 
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }} 
      />
      
      {!started && (
        <div 
          onClick={handleStart}
          onTouchStart={handleStart}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 10,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
            padding: '20px'
          }}
        >
          <div style={{
            fontSize: isMobile ? '50px' : '70px',
            animation: 'pulse 1.5s ease-in-out infinite',
            marginBottom: '15px',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
          }}>
            🤍
          </div>
          <div style={{
            fontSize: isMobile ? '16px' : '20px',
            color: '#fff',
            opacity: 0.95,
            letterSpacing: '2px',
            marginBottom: '8px',
            fontWeight: '300'
          }}>
            Click Me :)
          </div>
          <div style={{
            fontSize: isMobile ? '12px' : '14px',
            color: '#aaa',
            letterSpacing: '1px',
            fontWeight: '300'
          }}>
            Birthday Queen !
          </div>
        </div>
      )}
      
      {started && (
        <div style={{
          position: 'absolute',
          left: isMobile ? '20px' : '50px',
          top: isMobile ? '20px' : '50%',
          transform: isMobile ? 'none' : 'translateY(-50%)',
          color: '#fff',
          fontSize: isMobile ? '14px' : '17px',
          lineHeight: isMobile ? '1.6' : '2',
          zIndex: 5,
          maxWidth: isMobile ? '200px' : '380px',
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          textShadow: '0 0 10px rgba(0,0,0,0.8)',
          pointerEvents: 'none'
        }}>
          {allMessages.map((_, idx) => {
            const msg = messages[idx];
            return (
              <div 
                key={idx} 
                style={{ 
                  opacity: msg ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  margin: isMobile ? '3px 0' : '6px 0',
                  minHeight: isMobile ? '20px' : '28px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                {msg && (
                  <>
                    <span style={{ color: '#fff' }}>{msg.text}</span>
                    {msg.text && msg.emoji && (
                      <span style={{
                        color: '#ff6b9d',
                        display: 'inline-block',
                        animation: 'heartbeat 1.2s ease-in-out infinite',
                        marginLeft: '6px',
                        fontSize: isMobile ? '12px' : '14px'
                      }}>
                        {msg.emoji}
                      </span>
                    )}
                    {!msg.text && msg.emoji && (
                      <span style={{
                        color: '#ff6b9d',
                        display: 'inline-block',
                        animation: 'heartbeat 1.2s ease-in-out infinite',
                        fontSize: isMobile ? '16px' : '18px'
                      }}>
                        {msg.emoji}
                      </span>
                    )}
                    {msg.showCursor && (
                      <span style={{
                        display: 'inline-block',
                        width: '2px',
                        height: isMobile ? '14px' : '18px',
                        background: '#fff',
                        marginLeft: '3px',
                        animation: 'blink 1s infinite'
                      }} />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 20px rgba(255,255,255,0.6)); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
          75% { transform: scale(1.15); }
        }
        @keyframes blink {
          0%, 45% { opacity: 1; }
          50%, 95% { opacity: 0; }
          100% { opacity: 1; }
        }
        @media (max-width: 768px) {
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        }
      `}</style>
    </div>
  );
}
