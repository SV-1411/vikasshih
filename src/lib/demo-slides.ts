/**
 * Demo slides for presentation
 */

// Safe base64 encoding function
function safeBase64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    // Fallback: use URL encoding
    return encodeURIComponent(str);
  }
}

export const demoSlides = [
  {
    id: 'slide_demo_1',
    title: 'Introduction to Web Development',
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="#1e40af"/>
        <text x="960" y="400" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="white">
          Introduction to Web Development
        </text>
        <text x="960" y="500" font-family="Arial, sans-serif" font-size="40" text-anchor="middle" fill="#93c5fd">
          Building Modern Web Applications
        </text>
        <text x="960" y="700" font-family="Arial, sans-serif" font-size="30" text-anchor="middle" fill="#dbeafe">
          Instructor: Prof. Smith
        </text>
        <text x="960" y="750" font-family="Arial, sans-serif" font-size="30" text-anchor="middle" fill="#dbeafe">
          CS 101 - Fall 2024
        </text>
      </svg>
    `),
    type: 'image' as const
  },
  {
    id: 'slide_demo_2',
    title: 'Course Overview',
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="#0f172a"/>
        <text x="960" y="200" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">
          Course Overview
        </text>
        <text x="400" y="350" font-family="Arial, sans-serif" font-size="35" fill="#60a5fa">
          • HTML5 & Semantic Markup
        </text>
        <text x="400" y="430" font-family="Arial, sans-serif" font-size="35" fill="#60a5fa">
          • CSS3 & Modern Layouts
        </text>
        <text x="400" y="510" font-family="Arial, sans-serif" font-size="35" fill="#60a5fa">
          • JavaScript Fundamentals
        </text>
        <text x="400" y="590" font-family="Arial, sans-serif" font-size="35" fill="#60a5fa">
          • React & Component Architecture
        </text>
        <text x="400" y="670" font-family="Arial, sans-serif" font-size="35" fill="#60a5fa">
          • Backend with Node.js
        </text>
        <text x="400" y="750" font-family="Arial, sans-serif" font-size="35" fill="#60a5fa">
          • Database Design & SQL
        </text>
      </svg>
    `),
    type: 'image' as const
  },
  {
    id: 'slide_demo_3',
    title: 'HTML Basics',
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="#1e293b"/>
        <text x="960" y="150" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">
          HTML5 Structure
        </text>
        <rect x="300" y="250" width="1320" height="600" fill="#0f172a" rx="10"/>
        <text x="350" y="320" font-family="monospace" font-size="30" fill="#f97316">&lt;!DOCTYPE html&gt;</text>
        <text x="350" y="370" font-family="monospace" font-size="30" fill="#60a5fa">&lt;html lang="en"&gt;</text>
        <text x="350" y="420" font-family="monospace" font-size="30" fill="#60a5fa">&lt;head&gt;</text>
        <text x="450" y="470" font-family="monospace" font-size="30" fill="#a78bfa">  &lt;meta charset="UTF-8"&gt;</text>
        <text x="450" y="520" font-family="monospace" font-size="30" fill="#a78bfa">  &lt;title&gt;My Website&lt;/title&gt;</text>
        <text x="350" y="570" font-family="monospace" font-size="30" fill="#60a5fa">&lt;/head&gt;</text>
        <text x="350" y="620" font-family="monospace" font-size="30" fill="#60a5fa">&lt;body&gt;</text>
        <text x="450" y="670" font-family="monospace" font-size="30" fill="#10b981">  &lt;h1&gt;Hello World!&lt;/h1&gt;</text>
        <text x="350" y="720" font-family="monospace" font-size="30" fill="#60a5fa">&lt;/body&gt;</text>
        <text x="350" y="770" font-family="monospace" font-size="30" fill="#60a5fa">&lt;/html&gt;</text>
      </svg>
    `),
    type: 'image' as const
  },
  {
    id: 'slide_demo_4',
    title: 'CSS Styling',
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="#0f172a"/>
        <text x="960" y="150" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">
          CSS3 Styling
        </text>
        <rect x="300" y="250" width="1320" height="600" fill="#1e293b" rx="10"/>
        <text x="350" y="320" font-family="monospace" font-size="30" fill="#ec4899">.container</text>
        <text x="550" y="320" font-family="monospace" font-size="30" fill="#60a5fa">{</text>
        <text x="400" y="380" font-family="monospace" font-size="30" fill="#a78bfa">  display:</text>
        <text x="600" y="380" font-family="monospace" font-size="30" fill="#10b981">flex;</text>
        <text x="400" y="440" font-family="monospace" font-size="30" fill="#a78bfa">  justify-content:</text>
        <text x="750" y="440" font-family="monospace" font-size="30" fill="#10b981">center;</text>
        <text x="400" y="500" font-family="monospace" font-size="30" fill="#a78bfa">  align-items:</text>
        <text x="650" y="500" font-family="monospace" font-size="30" fill="#10b981">center;</text>
        <text x="400" y="560" font-family="monospace" font-size="30" fill="#a78bfa">  background:</text>
        <text x="650" y="560" font-family="monospace" font-size="30" fill="#10b981">linear-gradient(45deg, #667eea, #764ba2);</text>
        <text x="400" y="620" font-family="monospace" font-size="30" fill="#a78bfa">  padding:</text>
        <text x="600" y="620" font-family="monospace" font-size="30" fill="#10b981">2rem;</text>
        <text x="400" y="680" font-family="monospace" font-size="30" fill="#a78bfa">  border-radius:</text>
        <text x="700" y="680" font-family="monospace" font-size="30" fill="#10b981">12px;</text>
        <text x="350" y="740" font-family="monospace" font-size="30" fill="#60a5fa">}</text>
      </svg>
    `),
    type: 'image' as const
  },
  {
    id: 'slide_demo_5',
    title: 'JavaScript Functions',
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="#1a1a2e"/>
        <text x="960" y="150" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">
          JavaScript Functions
        </text>
        <rect x="300" y="250" width="1320" height="600" fill="#0f172a" rx="10"/>
        <text x="350" y="320" font-family="monospace" font-size="30" fill="#f59e0b">// Arrow Functions</text>
        <text x="350" y="380" font-family="monospace" font-size="30" fill="#c084fc">const</text>
        <text x="480" y="380" font-family="monospace" font-size="30" fill="#60a5fa">greet</text>
        <text x="580" y="380" font-family="monospace" font-size="30" fill="#ffffff">=</text>
        <text x="630" y="380" font-family="monospace" font-size="30" fill="#60a5fa">(name)</text>
        <text x="760" y="380" font-family="monospace" font-size="30" fill="#ffffff">=&gt;</text>
        <text x="840" y="380" font-family="monospace" font-size="30" fill="#ffffff">{</text>
        <text x="400" y="440" font-family="monospace" font-size="30" fill="#c084fc">  return</text>
        <text x="550" y="440" font-family="monospace" font-size="30" fill="#10b981">\`Hello, \${name}!\`</text>
        <text x="350" y="500" font-family="monospace" font-size="30" fill="#ffffff">}</text>
        
        <text x="350" y="600" font-family="monospace" font-size="30" fill="#f59e0b">// Async Functions</text>
        <text x="350" y="660" font-family="monospace" font-size="30" fill="#c084fc">async function</text>
        <text x="650" y="660" font-family="monospace" font-size="30" fill="#60a5fa">fetchData</text>
        <text x="830" y="660" font-family="monospace" font-size="30" fill="#ffffff">() {</text>
        <text x="400" y="720" font-family="monospace" font-size="30" fill="#c084fc">  const</text>
        <text x="550" y="720" font-family="monospace" font-size="30" fill="#60a5fa">response</text>
        <text x="720" y="720" font-family="monospace" font-size="30" fill="#ffffff">=</text>
        <text x="780" y="720" font-family="monospace" font-size="30" fill="#c084fc">await</text>
        <text x="920" y="720" font-family="monospace" font-size="30" fill="#60a5fa">fetch</text>
        <text x="1020" y="720" font-family="monospace" font-size="30" fill="#10b981">('/api/data')</text>
        <text x="400" y="780" font-family="monospace" font-size="30" fill="#c084fc">  return</text>
        <text x="550" y="780" font-family="monospace" font-size="30" fill="#60a5fa">response.json()</text>
        <text x="350" y="840" font-family="monospace" font-size="30" fill="#ffffff">}</text>
      </svg>
    `),
    type: 'image' as const
  },
  {
    id: 'slide_demo_6',
    title: 'Questions',
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bg)"/>
        <text x="960" y="450" font-family="Arial, sans-serif" font-size="100" font-weight="bold" text-anchor="middle" fill="white">
          Questions?
        </text>
        <text x="960" y="550" font-family="Arial, sans-serif" font-size="40" text-anchor="middle" fill="#e0e7ff">
          Feel free to ask any questions
        </text>
        <text x="960" y="700" font-family="Arial, sans-serif" font-size="30" text-anchor="middle" fill="#c7d2fe">
          Use the reaction buttons or unmute to speak
        </text>
      </svg>
    `),
    type: 'image' as const
  }
];

/**
 * Initialize demo slides for a classroom
 */
export function initializeDemoSlides(classroomId: string) {
  const sessions = JSON.parse(localStorage.getItem('demo_slide_sessions') || '{}');
  
  // Only initialize if no slides exist for this classroom
  if (!sessions[classroomId] || !sessions[classroomId].slides || sessions[classroomId].slides.length === 0) {
    sessions[classroomId] = {
      ...sessions[classroomId],
      slides: demoSlides
    };
    localStorage.setItem('demo_slide_sessions', JSON.stringify(sessions));
    console.log('📊 Demo slides initialized for classroom:', classroomId);
  }
}
