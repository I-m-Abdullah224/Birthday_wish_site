'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let treeProgress = 0;
    let hearts = [];
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    class Heart {
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
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          this.vx *= 0.8;
          this.vy *= 0.8;
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
        ctx.bezierCurveTo(-s * 0.5, -s * 0.8, -s, -s * 0.3, 0, s);
        ctx.bezierCurveTo(s, -s * 0.3, s * 0.5, -s * 0.8, 0, -s * 0.3);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.color = color;
        this.size = Math.random() * 4 + 2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life -= 0.02;
      }
      
      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
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
      
      const progress = Math.min(1, Math.max(0, (treeProgress - depth * 0.1) / 0.3));
      
      if (progress > 0) {
        const currentEndX = x + (endX - x) * progress;
        const currentEndY = y + (endY - y) * progress;
        
        const r = Math.floor(255 - depth * 10);
        const g = Math.floor(182 - depth * 5);
        const b = Math.floor(193 - depth * 3);
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.lineWidth = width * progress;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(currentEndX, currentEndY);
        ctx.stroke();
        
        if (progress > 0.8 && depth === maxDepth) {
          const heartColors = ['#ff6b9d', '#ff8e8e', '#ffd93d', '#ff6b6b', '#ee5a6f', '#ff9ff3', '#feca57', '#ff6b9d', '#ff8e8e'];
          const color = heartColors[Math.floor(Math.random() * heartColors.length)];
          
          if (Math.random() < 0.4) {
            hearts.push(new Heart(
              currentEndX,
              currentEndY,
              Math.random() * 8 + 4,
              color,
              currentEndX + (Math.random() - 0.5) * 30,
              currentEndY + (Math.random() - 0.5) * 30
            ));
          }
        }
        
        if (progress > 0.5) {
          const branchAngle = 0.5;
          const newLength = length * 0.7;
          const newWidth = width * 0.7;
          
          drawTreeBranch(currentEndX, currentEndY, angle - branchAngle, newLength, newWidth, depth + 1, maxDepth);
          drawTreeBranch(currentEndX, currentEndY, angle + branchAngle, newLength, newWidth, depth + 1, maxDepth);
        }
      }
    }
    
    function drawGround() {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 50);
      ctx.lineTo(canvas.width, canvas.height - 50);
      ctx.stroke();
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawGround();
      
      if (started) {
        if (treeProgress < 3) {
          treeProgress += 0.015;
        }
        
        const treeX = canvas.width * 0.65;
        const treeY = canvas.height - 50;
        
        drawTreeBranch(treeX, treeY, -Math.PI / 2, 120, 12, 0, 9);
        
        hearts.forEach(heart => {
          heart.update();
          heart.draw();
        });
        
        particles.forEach((particle, index) => {
          particle.update();
          particle.draw();
          if (particle.life <= 0) particles.splice(index, 1);
        });
      }
      
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [started]);
  
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
          setTimeout(typeNextMessage, 600);
        }
      }, 50);
    };
    
    const timeout = setTimeout(typeNextMessage, 1000);
    return () => clearTimeout(timeout);
  }, [started]);
  
  const handleStart = () => {
    setStarted(true);
  };
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0
        }} 
      />
      
      {!started && (
        <div 
          onClick={handleStart}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 10,
            userSelect: 'none'
          }}
        >
          <div style={{
            fontSize: '60px',
            animation: 'pulse 1.5s ease-in-out infinite',
            marginBottom: '10px'
          }}>
            🤍
          </div>
          <div style={{
            fontSize: '18px',
            color: '#fff',
            opacity: 0.9,
            letterSpacing: '2px',
            marginBottom: '5px'
          }}>
            Click Me :)
          </div>
          <div style={{
            fontSize: '14px',
            color: '#888',
            letterSpacing: '1px'
          }}>
            Birthday Queen !
          </div>
        </div>
      )}
      
      {started && (
        <div style={{
          position: 'absolute',
          left: '50px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#fff',
          fontSize: '16px',
          lineHeight: '1.8',
          zIndex: 5,
          maxWidth: '350px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              style={{ 
                opacity: msg ? 1 : 0,
                transition: 'opacity 0.3s',
                margin: '5px 0',
                minHeight: '24px'
              }}
            >
              {msg && (
                <>
                  <span>{msg.text}</span>
                  {msg.text && msg.emoji && (
                    <span style={{
                      color: '#ff6b9d',
                      display: 'inline-block',
                      animation: 'heartbeat 1s ease-in-out infinite',
                      marginLeft: '5px'
                    }}>
                      {msg.emoji}
                    </span>
                  )}
                  {!msg.text && msg.emoji && (
                    <span style={{
                      color: '#ff6b9d',
                      display: 'inline-block',
                      animation: 'heartbeat 1s ease-in-out infinite'
                    }}>
                      {msg.emoji}
                    </span>
                  )}
                  {msg.showCursor && (
                    <span style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '16px',
                      background: '#fff',
                      marginLeft: '2px',
                      animation: 'blink 1s infinite'
                    }} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
