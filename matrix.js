document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d', { alpha: false });

    // Set canvas to full screen
    function resizeCanvas() {
        try {
            console.log("Resizing canvas...");
            
            // Use device pixel ratio for crisp rendering on high-DPI displays
            const dpr = window.devicePixelRatio || 1;
            
            // Get window dimensions
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            console.log(`Window dimensions: ${windowWidth}x${windowHeight}, DPR: ${dpr}`);
            
            // Set canvas dimensions (physical pixels)
            canvas.width = windowWidth * dpr;
            canvas.height = windowHeight * dpr;
            
            // Set CSS dimensions (logical pixels)
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            // Ensure canvas is visible and correctly positioned
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.margin = '0';
            canvas.style.padding = '0';
            canvas.style.zIndex = '0'; // Set to 0 to ensure visibility
            canvas.style.display = 'block';
            
            // Make sure it's not hidden
            canvas.style.visibility = 'visible';
            canvas.style.opacity = '1';
            
            // Reset transform matrix and apply the device pixel ratio scaling
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            
            // Adjust the drawing style for better visibility
            ctx.font = '14px "Courier New", monospace';
            ctx.textBaseline = 'top';
            
            console.log(`Canvas resized to ${canvas.width}x${canvas.height} pixels`);
        } catch (error) {
            console.error('Error resizing canvas:', error);
        }
    }
    
    // Expose the resizeCanvas function to the window object
    // This allows it to be called from the main process
    window.resizeCanvas = resizeCanvas;
    
    // Call it initially to set up the canvas
    resizeCanvas();

    // Configuration
    const CONFIG = {
        // Visual settings
        SHOW_WORDS: true,
        SHOW_TRAILS: true,
        
        // Performance settings
        DROP_DENSITY: 0.6,
        MAX_DROPS: 200,
        MIN_TRAIL_LENGTH: 12,
        MAX_TRAIL_LENGTH: 35,
        SKIP_FRAMES: 1,
        
        // Animation settings
        SPEED_MULTIPLIER: 1.2,
        MIN_FONT_SIZE: 18,
        MAX_FONT_SIZE: 28,
        
        // Typing effect settings
        TYPING_SPEED: 150,
        WORD_PAUSE: 2000,
        
        // Direction settings
        TYPING_DIRECTION: 'bottom-up',
        
        // Glow effects
        GLOW_INTENSITY: 2,  // Reduced for crisper text
        GLOW_COLOR: '#0047AB',
        
        // Clarity settings
        CRISP_TEXT: true,
        REDUCED_BLUR: true,
        HIGH_CONTRAST: true
    };

    // AI-related words
    const AI_WORDS = [
        'AI', 'ML', 'GPT', 'BERT', 'CNN', 'RNN', 'LSTM', 'GAN', 
        'DATA', 'MODEL', 'LEARN', 'NEURAL', 'DEEP', 'TRAIN',
        'ALGORITHM', 'NETWORK', 'TENSOR', 'VECTOR', 'MATRIX',
        'TRANSFORMER', 'ATTENTION', 'LLAMA', 'CLAUDE', 'GEMINI',
        'DIFFUSION', 'STABLE', 'MIDJOURNEY', 'DALLE', 'IMAGEN',
        'FINETUNING', 'TRANSFER', 'PROMPT', 'ENGINEERING', 'RAG',
        'ACCURACY', 'PRECISION', 'RECALL', 'F1SCORE', 'ROC', 'AUC',
        'ALIGNMENT', 'SAFETY', 'FAIRNESS', 'TRANSPARENCY',
        'NLP', 'VISION', 'SPEECH', 'RECOGNITION', 'SYNTHESIS',
        'BACKPROPAGATION', 'STOCHASTIC', 'ACTIVATION', 'RELU',
        'AGI', 'SUPERINTELLIGENCE', 'SINGULARITY'
    ];

    // Famous AI sayings
    const AI_SAYINGS = [
        'I THINK THEREFORE I AM',
        'THE SINGULARITY IS NEAR',
        'ARTIFICIAL GENERAL INTELLIGENCE',
        'MACHINES CAN THINK',
        'INTELLIGENCE IS ARTIFICIAL',
        'DEEP LEARNING REVOLUTION',
        'DATA IS THE NEW OIL',
        'ALGORITHMS CONTROL EVERYTHING',
        'THERE IS NO SPOON',
        'FOLLOW THE WHITE RABBIT',
        'THE MATRIX HAS YOU',
        'WAKE UP NEO'
    ];

    // Matrix characters (katakana)
    const MATRIX_CHARS = [
        'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
        'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト',
        'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
        'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ',
        'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン'
    ];

    // Animation variables
    let drops = [];
    let lastTime = performance.now();
    let animationFrameId = null;
    let frameCount = 0;
    let globalTime = 0;
    let paused = false;

    // Error logging
    function logError(message, data = {}) {
        console.error(`[MATRIX ERROR] ${message}`, data);
        
        // Display error on screen
        const errorDiv = document.getElementById('matrix-error-log') || createErrorDisplay();
        const timestamp = new Date().toISOString();
        const errorItem = document.createElement('div');
        errorItem.textContent = `${timestamp}: ${message}`;
        errorItem.style.color = 'red';
        errorDiv.appendChild(errorItem);
        
        // Limit number of errors shown
        while (errorDiv.children.length > 10) {
            errorDiv.removeChild(errorDiv.firstChild);
        }
    }

    // Create error display
    function createErrorDisplay() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'matrix-error-log';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '10px';
        errorDiv.style.left = '10px';
        errorDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '10px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.maxWidth = '80%';
        errorDiv.style.maxHeight = '80%';
        errorDiv.style.overflow = 'auto';
        errorDiv.style.fontFamily = 'monospace';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Matrix Error Log';
        errorDiv.appendChild(heading);
        
        document.body.appendChild(errorDiv);
        return errorDiv;
    }

    // Get random Matrix character
    function getMatrixChar() {
        return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    }

    // Create a drop object
    function createDrop() {
        // Random font size
        const fontSize = Math.floor(Math.random() * (CONFIG.MAX_FONT_SIZE - CONFIG.MIN_FONT_SIZE + 1)) + CONFIG.MIN_FONT_SIZE;
        
        // Random trail length
        const trailLength = Math.floor(Math.random() * (CONFIG.MAX_TRAIL_LENGTH - CONFIG.MIN_TRAIL_LENGTH + 1)) + CONFIG.MIN_TRAIL_LENGTH;
        
        // Pre-generate trail characters
        const trail = [];
        for (let i = 0; i < trailLength; i++) {
            trail.push(getMatrixChar());
        }
        
        // Select text to display
        const showLongText = Math.random() < 0.2; // 20% chance for a saying
        const text = showLongText 
            ? AI_SAYINGS[Math.floor(Math.random() * AI_SAYINGS.length)]
            : AI_WORDS[Math.floor(Math.random() * AI_WORDS.length)];
        
        // Random speed variation
        const speedVariation = Math.random() * 1.5 + 0.8;
        
        // Random glow intensity
        const glowIntensity = Math.random() * CONFIG.GLOW_INTENSITY + (CONFIG.GLOW_INTENSITY / 2);
        
        // Random blue color variation
        const baseColor = {
            r: Math.floor(Math.random() * 30),      // 0-30 (darker blue)
            g: Math.floor(Math.random() * 30) + 40, // 40-70 (medium blue)
            b: Math.floor(Math.random() * 55) + 150 // 150-205 (royal blue)
        };
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.floor(Math.random() * window.innerWidth),
            y: Math.random() * -100,  // Start above screen
            speed: speedVariation * CONFIG.SPEED_MULTIPLIER,
            text: text,
            fontSize: fontSize,
            visibleChars: 0,
            trail: trail,
            trailLength: trailLength,
            typingTimer: 0,
            typingState: 'typing',
            pauseTimer: 0,
            lastTypingTime: 0,
            glowIntensity: glowIntensity,
            baseColor: baseColor,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.005 + 0.002,
            showTrail: false,
            trailStartTime: 0,
            encryptedChars: new Map()
        };
    }

    // Initialize drops array
    function initializeDrops() {
        try {
            // Clear existing drops
            drops = [];
            
            // Create initial drops based on density
            const dropCount = Math.min(
                CONFIG.MAX_DROPS,
                Math.floor(window.innerWidth * CONFIG.DROP_DENSITY / 10)
            );
            
            for (let i = 0; i < dropCount; i++) {
                drops.push(createDrop());
            }
            
            console.log(`Initialized ${drops.length} drops`);
        } catch (error) {
            logError(`Error initializing drops: ${error.message}`);
            console.error(error);
        }
    }

    // Get encrypted character for a position
    function getEncryptedChar(drop, charIndex) {
        const key = `${drop.id}-${charIndex}`;
        if (!drop.encryptedChars.has(key)) {
            drop.encryptedChars.set(key, getMatrixChar());
        }
        return drop.encryptedChars.get(key);
    }

    // Refresh encrypted character
    function refreshEncryptedChar(drop, charIndex) {
        if (Math.random() < 0.08) { // 8% chance to refresh
            const key = `${drop.id}-${charIndex}`;
            drop.encryptedChars.set(key, getMatrixChar());
        }
    }

    // Set font with improved clarity
    function setFont(fontSize) {
        if (CONFIG.CRISP_TEXT) {
            // Use pixel font or monospace with no antialiasing for maximum crispness
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';  // Center alignment for better positioning
        } else {
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.textBaseline = 'top';
        }
    }

    // Draw function
    function draw(currentTime) {
        try {
            // Exit if paused
            if (paused) {
                console.log("Animation is paused");
                return;
            }
            
            // Skip frames for better performance
            frameCount++;
            if (frameCount % CONFIG.SKIP_FRAMES !== 0) {
                animationFrameId = requestAnimationFrame(draw);
                return;
            }

            // Calculate delta time
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            globalTime += deltaTime;

            // Get canvas dimensions safely
            const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
            const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

            // Clear screen with perfect black for better contrast
            if (CONFIG.HIGH_CONTRAST) {
                ctx.fillStyle = 'rgb(0, 0, 0)';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            }

            // Check if drops array exists
            if (!drops || !Array.isArray(drops) || drops.length === 0) {
                logError("Drops array is not properly initialized");
                initializeDrops();
                animationFrameId = requestAnimationFrame(draw);
                return;
            }

            // Process all drops
            for (let i = 0; i < drops.length; i++) {
                try {
                    const drop = drops[i];
                    
                    // Skip if drop is undefined
                    if (!drop) {
                        logError(`Drop at index ${i} is undefined`);
                        drops[i] = createDrop();
                        continue;
                    }
                    
                    // Reset if off screen
                    if (drop.y > canvasHeight + 200) {
                        drop.y = Math.random() * -100;
                        drop.visibleChars = 0;
                        drop.typingState = 'typing';
                        drop.pauseTimer = 0;
                        drop.showTrail = false;
                        
                        // Choose new text
                        const showLongText = Math.random() < 0.2;
                        drop.text = showLongText
                            ? AI_SAYINGS[Math.floor(Math.random() * AI_SAYINGS.length)]
                            : AI_WORDS[Math.floor(Math.random() * AI_WORDS.length)];
                        
                        continue;
                    }
                    
                    // Update typing state
                    drop.typingTimer += deltaTime;
                    
                    // Handle typing state machine
                    if (drop.typingState === 'typing') {
                        if (drop.typingTimer >= CONFIG.TYPING_SPEED) {
                            drop.typingTimer = 0;
                            
                            if (drop.visibleChars < drop.text.length) {
                                drop.visibleChars++;
                                drop.lastTypingTime = currentTime;
                            } else {
                                drop.typingState = 'paused';
                                drop.pauseTimer = 0;
                                drop.showTrail = true;
                                drop.trailStartTime = currentTime;
                            }
                        }
                    } else if (drop.typingState === 'paused') {
                        drop.pauseTimer += deltaTime;
                        
                        if (drop.pauseTimer >= CONFIG.WORD_PAUSE) {
                            drop.typingState = 'resetting';
                            drop.typingTimer = 0;
                        }
                    } else if (drop.typingState === 'resetting') {
                        if (drop.typingTimer >= CONFIG.TYPING_SPEED / 2) {
                            drop.typingTimer = 0;
                            
                            if (drop.visibleChars > 0) {
                                drop.visibleChars--;
                            } else {
                                drop.typingState = 'typing';
                                drop.showTrail = false;
                                
                                // Choose new text
                                const showLongText = Math.random() < 0.2;
                                drop.text = showLongText
                                    ? AI_SAYINGS[Math.floor(Math.random() * AI_SAYINGS.length)]
                                    : AI_WORDS[Math.floor(Math.random() * AI_WORDS.length)];
                            }
                        }
                    } else {
                        // Invalid state
                        logError(`Invalid typing state: ${drop.typingState}`);
                        drop.typingState = 'typing';
                    }
                    
                    // Set font
                    setFont(drop.fontSize);
                    
                    // Draw text characters
                    if (CONFIG.SHOW_WORDS) {
                        const text = drop.text;
                        const visiblePart = text.substring(0, drop.visibleChars);
                        
                        // Calculate positions for each character
                        const charPositions = [];
                        
                        if (CONFIG.TYPING_DIRECTION === 'bottom-up') {
                            // Bottom-up typing
                            for (let j = 0; j < visiblePart.length; j++) {
                                const y = drop.y - (j * drop.fontSize);
                                
                                charPositions.push({
                                    char: visiblePart[visiblePart.length - 1 - j],
                                    y: y,
                                    index: visiblePart.length - 1 - j
                                });
                            }
                        } else {
                            // Top-down typing
                            for (let j = 0; j < visiblePart.length; j++) {
                                const y = drop.y + (j * drop.fontSize);
                                
                                charPositions.push({
                                    char: visiblePart[j],
                                    y: y,
                                    index: j
                                });
                            }
                        }
                        
                        // Draw each character
                        for (let j = 0; j < charPositions.length; j++) {
                            const pos = charPositions[j];
                            
                            // Skip if off screen
                            if (pos.y === undefined || pos.y < 0 || pos.y > canvasHeight) continue;
                            
                            // Determine if currently typed
                            const isCurrentlyTyped = pos.index === visiblePart.length - 1 && 
                                                    currentTime - drop.lastTypingTime < 500;
                            
                            // Calculate fade position
                            const fadePosition = pos.index / visiblePart.length;
                            
                            // Apply pulse effect
                            const pulseMultiplier = 0.85 + (Math.sin(globalTime * drop.pulseSpeed + drop.pulsePhase) * 0.15);
                            
                            // Set glow effect with improved clarity
                            if (isCurrentlyTyped) {
                                if (!CONFIG.REDUCED_BLUR) {
                                    ctx.shadowColor = CONFIG.GLOW_COLOR;
                                    ctx.shadowBlur = drop.glowIntensity * 1.2 * pulseMultiplier;
                                } else {
                                    // Reduced blur for crisper text
                                    ctx.shadowColor = CONFIG.GLOW_COLOR;
                                    ctx.shadowBlur = Math.min(drop.glowIntensity * 0.8, 2) * pulseMultiplier;
                                }
                            } else {
                                if (!CONFIG.REDUCED_BLUR) {
                                    ctx.shadowColor = CONFIG.GLOW_COLOR;
                                    ctx.shadowBlur = drop.glowIntensity * fadePosition * 0.8 * pulseMultiplier;
                                } else {
                                    // Minimal blur for non-typed characters
                                    ctx.shadowColor = CONFIG.GLOW_COLOR;
                                    ctx.shadowBlur = Math.min(drop.glowIntensity * fadePosition * 0.5, 1.5) * pulseMultiplier;
                                }
                            }
                            
                            // Set color
                            const r = drop.baseColor.r;
                            const g = Math.floor(drop.baseColor.g * (0.7 + fadePosition * 0.3) * pulseMultiplier);
                            const b = Math.floor(drop.baseColor.b * (0.7 + fadePosition * 0.3) * pulseMultiplier);
                            const opacity = 0.7 + (fadePosition * 0.3);
                            
                            if (isCurrentlyTyped) {
                                ctx.fillStyle = `rgba(${r + 100}, ${g + 50}, ${b}, 0.95)`;
                            } else {
                                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                            }
                            
                            // Determine decryption state
                            const timeSinceTyped = currentTime - drop.lastTypingTime;
                            const decryptionProgress = Math.min(100, Math.max(0, 
                                ((visiblePart.length - pos.index) * 10) + 
                                (isCurrentlyTyped ? 0 : Math.min(100, timeSinceTyped / 15))
                            ));
                            
                            // Determine which character to show
                            let displayChar;
                            if (decryptionProgress >= 85) {
                                // Fully decrypted
                                displayChar = pos.char;
                                
                                // Make fully decrypted characters more visible
                                const brightnessBoost = 30;
                                ctx.fillStyle = `rgba(${Math.min(255, r + brightnessBoost)}, 
                                               ${Math.min(255, g + brightnessBoost)}, 
                                               ${Math.min(255, b + brightnessBoost)}, 
                                               ${Math.min(1.0, opacity + 0.2)})`;
                                               
                                ctx.shadowBlur = drop.glowIntensity * 1.5 * pulseMultiplier;
                            } else if (decryptionProgress > 40) {
                                // Partially decrypted
                                const decryptionRatio = (decryptionProgress - 40) / (85 - 40);
                                
                                if (Math.random() < Math.pow(decryptionRatio, 0.7)) {
                                    displayChar = pos.char;
                                    
                                    const partialBrightnessBoost = Math.floor(20 * decryptionRatio);
                                    ctx.fillStyle = `rgba(${Math.min(255, r + partialBrightnessBoost)}, 
                                                   ${Math.min(255, g + partialBrightnessBoost)}, 
                                                   ${Math.min(255, b + partialBrightnessBoost)}, 
                                                   ${opacity})`;
                                } else {
                                    displayChar = getEncryptedChar(drop, pos.index);
                                    if (Math.random() < 0.08 * (1 - decryptionRatio)) {
                                        refreshEncryptedChar(drop, pos.index);
                                    }
                                }
                            } else {
                                // Fully encrypted
                                displayChar = getEncryptedChar(drop, pos.index);
                                if (Math.random() < 0.08) {
                                    refreshEncryptedChar(drop, pos.index);
                                }
                            }
                            
                            // Draw character with improved positioning for crispness
                            if (CONFIG.CRISP_TEXT) {
                                // Round position to nearest pixel for crisp rendering
                                const x = Math.round(drop.x);
                                const y = Math.round(pos.y);
                                ctx.fillText(displayChar, x, y);
                            } else {
                                ctx.fillText(displayChar, drop.x, pos.y);
                            }
                        }
                        
                        // Reset shadow
                        ctx.shadowBlur = 0;
                        
                        // Draw matrix trail
                        if (CONFIG.SHOW_TRAILS) {
                            // Determine starting position
                            let startY;
                            
                            if (CONFIG.SHOW_WORDS && drop.visibleChars > 0 && charPositions && charPositions.length > 0) {
                                if (CONFIG.TYPING_DIRECTION === 'bottom-up') {
                                    startY = charPositions[0].y + drop.fontSize;
                                } else {
                                    startY = charPositions[charPositions.length - 1].y + drop.fontSize;
                                }
                            } else {
                                startY = drop.y + drop.fontSize;
                            }
                            
                            // Calculate trail length
                            let effectiveTrailLength = drop.trailLength;
                            
                            // Add trail fade-in effect
                            if (drop.showTrail) {
                                const trailAge = currentTime - drop.trailStartTime;
                                const trailFadeInDuration = 1000; // 1 second
                                const trailProgress = Math.min(1, trailAge / trailFadeInDuration);
                                effectiveTrailLength = Math.floor(drop.trailLength * trailProgress);
                            }
                            
                            // Ensure minimum trail length
                            effectiveTrailLength = Math.max(3, effectiveTrailLength);
                            
                            // Draw trail characters
                            for (let j = 0; j < effectiveTrailLength; j++) {
                                const trailY = startY + (j * drop.fontSize);
                                
                                // Skip if off screen
                                if (trailY === undefined || trailY < 0 || trailY > canvasHeight) continue;
                                
                                // Get character
                                const char = j < drop.trailLength ? 
                                    drop.trail[j] : getMatrixChar();
                                
                                // Calculate fade position
                                let fadePosition = j / effectiveTrailLength;
                                
                                // Enhance bottom brightness
                                if (j > effectiveTrailLength * 2/3) {
                                    fadePosition = fadePosition * 2.5;
                                }
                                
                                // Apply fade effect
                                const falloffFactor = j > effectiveTrailLength * 2/3 ? 
                                    Math.min(1.0, fadePosition * 1.5) : 
                                    Math.pow(fadePosition, 1.8);
                                
                                // Apply pulse effect
                                const pulseMultiplier = 0.85 + (Math.sin(globalTime * drop.pulseSpeed + drop.pulsePhase + j * 0.2) * 0.15);
                                
                                // Set glow effect with improved clarity
                                if (j > effectiveTrailLength * 2/3) {
                                    if (!CONFIG.REDUCED_BLUR) {
                                        ctx.shadowColor = CONFIG.GLOW_COLOR;
                                        ctx.shadowBlur = drop.glowIntensity * falloffFactor * 1.2 * pulseMultiplier;
                                    } else {
                                        // Reduced blur for crisper trail
                                        ctx.shadowColor = CONFIG.GLOW_COLOR;
                                        ctx.shadowBlur = Math.min(drop.glowIntensity * falloffFactor * 0.8, 2) * pulseMultiplier;
                                    }
                                } else if (j > effectiveTrailLength * 1/2) {
                                    if (!CONFIG.REDUCED_BLUR) {
                                        ctx.shadowColor = CONFIG.GLOW_COLOR;
                                        ctx.shadowBlur = drop.glowIntensity * falloffFactor * 0.6 * pulseMultiplier;
                                    } else {
                                        // Minimal blur for upper trail
                                        ctx.shadowColor = CONFIG.GLOW_COLOR;
                                        ctx.shadowBlur = Math.min(drop.glowIntensity * falloffFactor * 0.3, 1) * pulseMultiplier;
                                    }
                                } else {
                                    ctx.shadowBlur = 0;
                                }
                                
                                // Set color
                                const r = drop.baseColor.r;
                                const normalizedPosition = j / effectiveTrailLength;
                                const colorIntensity = Math.pow(normalizedPosition, 0.8);
                                
                                const g = Math.floor(drop.baseColor.g * colorIntensity * falloffFactor * pulseMultiplier);
                                const b = Math.floor(drop.baseColor.b * colorIntensity * falloffFactor * pulseMultiplier);
                                
                                // Set opacity
                                let opacity;
                                if (j > effectiveTrailLength * 2/3) {
                                    opacity = Math.min(1.0, Math.max(0.4, falloffFactor * 1.8));
                                } else if (j > effectiveTrailLength * 1/3) {
                                    opacity = Math.max(0.15, falloffFactor * 0.9);
                                } else {
                                    opacity = Math.max(0.05, falloffFactor * 0.5);
                                }
                                
                                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                                
                                // Draw character with improved positioning
                                if (CONFIG.CRISP_TEXT) {
                                    // Round position to nearest pixel for crisp rendering
                                    const x = Math.round(drop.x);
                                    const y = Math.round(trailY);
                                    ctx.fillText(char, x, y);
                                } else {
                                    ctx.fillText(char, drop.x, trailY);
                                }
                                
                                // Occasionally update trail characters
                                if (Math.random() < 0.05) {
                                    drop.trail[j] = getMatrixChar();
                                }
                            }
                            
                            // Reset shadow
                            ctx.shadowBlur = 0;
                        }
                    }
                    
                    // Move drop down
                    drop.y += drop.speed * (deltaTime * 0.05);
                } catch (dropError) {
                    logError(`Error processing drop: ${dropError.message}`);
                    console.error(dropError);
                }
            }

            // IMPORTANT: Always request next frame at the end
            if (!paused) {
                animationFrameId = requestAnimationFrame(draw);
            }
        } catch (error) {
            console.error("Error in draw function:", error);
            // Attempt to recover by requesting another frame
            if (!paused) {
                animationFrameId = requestAnimationFrame(draw);
            }
        }
    }

    // Initialize
    function initialize() {
        try {
            console.log("Starting Matrix animation initialization...");
            
            // Set up canvas first
            resizeCanvas();
            
            // Then initialize drops
            initializeDrops();
            
            // Make sure context exists
            if (!ctx) {
                console.error("Canvas context is null!");
                throw new Error("Failed to get canvas context");
            }
            
            // Print configuration for debugging
            console.log("Animation configuration:", {
                width: canvas.width,
                height: canvas.height,
                drops: drops.length,
                devicePixelRatio: window.devicePixelRatio || 1
            });
            
            // Ensure we're not already running
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // Start animation with explicit flag
            paused = false;
            lastTime = performance.now();
            console.log("Starting animation loop...");
            animationFrameId = requestAnimationFrame(draw);
            
            console.log("Matrix animation initialized successfully");
        } catch (error) {
            console.error("Error initializing Matrix animation:", error);
            // Try again after a short delay
            setTimeout(initialize, 1000);
        }
    }
    
    // Start initialization
    initialize();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        try {
            resizeCanvas();
            initializeDrops();
        } catch (error) {
            console.error("Error handling resize:", error);
        }
    });

    // Toggle animation on click
    canvas.addEventListener('click', () => {
        paused = !paused;
        if (!paused) {
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(draw);
        } else if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    });
});