// Utilitários para detectar e gerenciar suporte WebGL
export const detectWebGLSupport = (): { supported: boolean; reason?: string } => {
    // Verificar se WebGL está disponível
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return { supported: false, reason: 'WebGL não está disponível no navegador' };
        }

        // Verificar extensões necessárias
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';

        // Verificar se está usando software rendering
        if (renderer.includes('Microsoft') || renderer.includes('SwiftShader') || renderer.includes('Software')) {
            return { 
                supported: false, 
                reason: 'Renderização por software detectada - pode haver problemas de performance' 
            };
        }

        // Verificar recursos mínimos
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        if (maxTextureSize < 1024 || maxVertexAttributes < 8) {
            return { 
                supported: false, 
                reason: 'Hardware não atende aos requisitos mínimos' 
            };
        }

        // Cleanup
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
            loseContext.loseContext();
        }

        return { supported: true };
    } catch (error) {
        return { 
            supported: false, 
            reason: 'Erro ao verificar suporte WebGL: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
        };
    }
};

// Verificar se o dispositivo é de baixa potência
export const isLowPowerDevice = (): boolean => {
    // Verificar hardware
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) return true;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    // GPUs integradas geralmente têm menor potência
    const isIntegratedGPU = renderer.toLowerCase().includes('intel') && 
                           !renderer.toLowerCase().includes('arc');
    
    // Verificar memória disponível (aproximação)
    const memoryInfo = (navigator as any).deviceMemory;
    const hasLowMemory = memoryInfo && memoryInfo < 4;
    
    // Verificar CPU cores
    const cores = navigator.hardwareConcurrency || 1;
    const hasLowCores = cores < 4;
    
    return isIntegratedGPU || hasLowMemory || hasLowCores;
};

// Configurações otimizadas baseadas no dispositivo
export const getOptimalWebGLSettings = () => {
    const isLowPower = isLowPowerDevice();
    const pixelRatio = window.devicePixelRatio || 1;
    
    return {
        antialias: !isLowPower,
        alpha: true,
        powerPreference: isLowPower ? 'low-power' as const : 'high-performance' as const,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
        stencil: false,
        depth: true,
        premultipliedAlpha: false,
        pixelRatio: isLowPower ? Math.min(pixelRatio, 1.5) : Math.min(pixelRatio, 2),
        maxEdges: isLowPower ? 15 : 30,
        sphereSegments: isLowPower ? 8 : 12,
        autoRotateSpeed: isLowPower ? 0.1 : 0.2,
    };
};

// Monitorar performance em tempo real
export class WebGLPerformanceMonitor {
    private frameCount = 0;
    private lastTime = 0;
    private fps = 60;
    private isThrottling = false;
    
    constructor(private onPerformanceChange?: (fps: number, shouldThrottle: boolean) => void) {}
    
    update() {
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            
            // Se FPS está baixo, ativar throttling
            const shouldThrottle = this.fps < 30;
            if (shouldThrottle !== this.isThrottling) {
                this.isThrottling = shouldThrottle;
                this.onPerformanceChange?.(this.fps, shouldThrottle);
            }
        }
    }
    
    getFPS() {
        return this.fps;
    }
    
    isPerformanceIssue() {
        return this.fps < 30;
    }
}

// Detectar context loss e recuperar
export const setupWebGLContextRecovery = (canvas: HTMLCanvasElement) => {
    let gl: WebGLRenderingContext | null = null;
    let contextLost = false;
    
    const handleContextLost = (event: Event) => {
        event.preventDefault();
        contextLost = true;
        console.warn('WebGL context lost, attempting recovery...');
    };
    
    const handleContextRestored = () => {
        contextLost = false;
        console.log('WebGL context restored');
        
        // Recriar contexto
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        // Disparar evento customizado para que o Three.js possa responder
        canvas.dispatchEvent(new CustomEvent('webgl-context-restored'));
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return {
        isContextLost: () => contextLost,
        forceContextLoss: () => {
            const loseContext = gl?.getExtension('WEBGL_lose_context');
            if (loseContext) {
                loseContext.loseContext();
            }
        },
        cleanup: () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        }
    };
};

// Verificar compatibilidade do navegador
export const getBrowserCompatibility = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome');
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isEdge = userAgent.includes('edge');
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    const compatibility = {
        browser: isChrome ? 'chrome' : isFirefox ? 'firefox' : isSafari ? 'safari' : isEdge ? 'edge' : 'other',
        isMobile,
        webglSupport: detectWebGLSupport(),
        recommendedFallback: false
    };
    
    // Safari tem limitações conhecidas com WebGL
    if (isSafari || compatibility.webglSupport.supported === false) {
        compatibility.recommendedFallback = true;
    }
    
    // Mobile devices também podem ter limitações
    if (isMobile && isLowPowerDevice()) {
        compatibility.recommendedFallback = true;
    }
    
    return compatibility;
};
