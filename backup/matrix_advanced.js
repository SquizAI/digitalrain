document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d', { alpha: false });

    // Set canvas to full screen with proper scaling
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Dataset of words and numbers
    const dataWords = [
        // Sample Datasets
        'Iris', 'Flower', 'Dataset', 'Classification', 'Titanic', 'Passengers', 'Survival',
        'Boston', 'Housing', 'Prices', 'Wine', 'Quality', 'Ratings', 'Customer', 'Churn',
        'Sales', 'Forecasting', 'Time', 'Series', 'Analytics', 'Pipeline',

        // Car Data Fields
        'Horsepower', 'Miles_per_Gallon', 'Weight_in_lbs', 'Origin', 'USA', 'Europe', 'Japan',
        'Year', 'Model', 'Engine', 'Transmission', 'Fuel', 'Efficiency', 'Performance',

        // Stock Market Terms
        'Open', 'Close', 'High', 'Low', 'Volume', 'Price', 'Market', 'Trade', 'Stock',
        'Bull', 'Bear', 'Trend', 'Rally', 'Volatility', 'Index', 'Portfolio', 'Dividend',

        // Weather Data
        'Temperature', 'Precipitation', 'Wind', 'Sunny', 'Cloudy', 'Rainy', 'Stormy',
        'Forecast', 'Humidity', 'Pressure', 'Climate', 'Weather', 'Seasonal', 'Pattern',

        // Data Analysis Terms
        'Mean', 'Median', 'Mode', 'Standard', 'Deviation', 'Variance', 'Correlation',
        'Regression', 'Distribution', 'Quartile', 'Percentile', 'Outlier', 'Sample',
        'Population', 'Hypothesis', 'Test', 'Confidence', 'Interval', 'P-Value',

        // Database Fields
        'ID', 'Name', 'Category', 'Value', 'Type', 'Status', 'Date', 'Time', 'Timestamp',
        'Count', 'Sum', 'Average', 'Minimum', 'Maximum', 'Group', 'Filter', 'Sort', 'Join',

        // Technical Terms
        'Neural', 'Network', 'Deep', 'Learning', 'Algorithm', 'Data', 'Model', 'Training',
        'Tensor', 'Vector', 'Matrix', 'Gradient', 'Epoch', 'Batch', 'Layer', 'Node',
        'Function', 'Variable', 'Class', 'Object', 'Method', 'Array', 'String', 'Boolean',
        'Promise', 'Async', 'Await', 'Thread', 'Process', 'Stream', 'Buffer', 'Socket',

        // System Commands
        'sudo rm -rf', './configure', 'make install', 'npm start', 'docker run', 'git push',
        'ssh -p 22', 'chmod +x', 'kill -9', 'ps aux', 'netstat', 'ping -c 4', 'traceroute',

        // Numbers and Calculations
        '0x0', '0x1', '0xFF', '127.0.0.1', '192.168.1.1', '255.255.255.0', '::1',
        'π', '∞', '∑', '∫', '∂', '√', 'λ', 'θ', 'Ω', 'δ', '∇', '∆', '∈', '∉',

        // Statistics
        'Row_Count:1000', 'Columns:10', 'Missing:5', 'Unique:950', 'Mean:500.5',
        'StdDev:288.675', 'Min:1', 'Max:1000', 'Median:500', 'Q1:250', 'Q3:750',

        // Project Stats
        'Projects:8', 'Workflows:5', 'Success:98.5%', 'Runtime:45m', 'Memory:2MB',
        'Duplicates:10', 'Categories:4', 'Users:156', 'Active:891', 'Total:1599',
    ];

    // Additional tech words
    const additionalTechWords = [
        // Programming Languages & Frameworks
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Rust', 'Go', 'Ruby', 'PHP',
        'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
        'Spring', 'Laravel', 'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'Jenkins',

        // Database Technologies
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'Neo4j', 'ElasticSearch',
        'DynamoDB', 'MariaDB', 'SQLite', 'CouchDB', 'InfluxDB', 'Prometheus', 'Grafana',

        // Cloud & DevOps
        'AWS', 'Azure', 'GCP', 'Lambda', 'S3', 'EC2', 'RDS', 'CloudFront', 'Route53',
        'VPC', 'IAM', 'ECS', 'EKS', 'Fargate', 'CloudWatch', 'CloudTrail', 'CodePipeline',

        // AI & ML Libraries
        'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'NumPy', 'Pandas', 'OpenCV',
        'NLTK', 'SpaCy', 'Hugging Face', 'XGBoost', 'LightGBM', 'Rapids', 'MLflow',

        // Networking & Security
        'TCP/IP', 'HTTP/3', 'WebSocket', 'gRPC', 'GraphQL', 'OAuth2', 'JWT', 'HTTPS',
        'SSL/TLS', 'DNS', 'DHCP', 'LDAP', 'Kerberos', 'IPSec', 'OpenSSL', 'WireGuard',

        // System Architecture
        'Microservices', 'Serverless', 'Event-Driven', 'CQRS', 'Event-Sourcing', 'DDD',
        'REST', 'SOA', 'Pub/Sub', 'Message-Queue', 'Circuit-Breaker', 'Load-Balancer',

        // Development Tools
        'Git', 'VSCode', 'WebStorm', 'Postman', 'Swagger', 'Jira', 'Confluence', 'Slack',
        'npm', 'yarn', 'pnpm', 'webpack', 'Babel', 'ESLint', 'Prettier', 'Jest',

        // Binary & Hexadecimal
        '0b1010', '0b1100', '0b1111', '0b10001', '0xABCD', '0xFFFF', '0x1234', '0x5678',
        '0xAAAA', '0xBBBB', '0xCCCC', '0xDDDD', '0xEEEE', '0x9999', '0x8888', '0x7777',

        // IP Addresses & Ports
        '10.0.0.1', '172.16.0.1', '192.168.0.1', '169.254.0.1', 'fe80::1', '2001:db8::1',
        'PORT:80', 'PORT:443', 'PORT:3000', 'PORT:5432', 'PORT:27017', 'PORT:6379',

        // Version Numbers
        'v1.0.0', 'v2.1.3', 'v3.5.7', 'v4.8.2', 'v5.12.4', 'v6.15.9', 'v7.20.1', 'v8.25.6',
        'v9.30.8', 'v10.35.2', 'v11.40.5', 'v12.45.7', 'v13.50.9', 'v14.55.3', 'v15.60.8',

        // Status Codes & Errors
        '200_OK', '201_CREATED', '204_NO_CONTENT', '301_MOVED', '400_BAD_REQUEST',
        '401_UNAUTHORIZED', '403_FORBIDDEN', '404_NOT_FOUND', '500_SERVER_ERROR',
        '502_BAD_GATEWAY', '503_SERVICE_UNAVAILABLE', '504_GATEWAY_TIMEOUT',

        // Mathematical Constants
        'π:3.14159', 'e:2.71828', 'φ:1.61803', '√2:1.41421', '√3:1.73205', 'ln2:0.69314',
        'log10:2.30258', 'ζ(3):1.20205', 'γ:0.57721', 'μ:0.26149', 'α:0.00729',

        // Memory Addresses
        '0x00000000', '0xFFFFFFFF', '0x7FFFFFFF', '0x80000000', '0x0000FFFF', '0xFFFF0000',
        'HEAP:0x123', 'STACK:0x456', 'CODE:0x789', 'DATA:0xABC', 'BSS:0xDEF',
    ];

    // Special highlighted words
    const specialWords = [
        // System Messages
        'SYSTEM_BREACH', 'ACCESS_DENIED', 'ENCRYPTED', 'DECRYPTED', 'OVERRIDE', 'BACKDOOR',
        'ROOT_ACCESS', 'KERNEL_PANIC', 'BUFFER_OVERFLOW', 'STACK_TRACE', 'MEMORY_DUMP',
        'CORE_DUMP', 'SEGMENTATION_FAULT', 'NULL_POINTER', 'DEADLOCK_DETECTED',
        'RACE_CONDITION', 'HEAP_CORRUPTION', 'STACK_OVERFLOW', 'INVALID_OPCODE',

        // Analysis Status
        'ANALYZING_DATA', 'PROCESSING_COMPLETE', 'TRAINING_MODEL', 'PREDICTION_READY',
        'VALIDATION_ERROR', 'OPTIMIZATION_FAILED', 'CONVERGENCE_ACHIEVED',
        'OUTLIERS_DETECTED', 'PATTERN_IDENTIFIED', 'CORRELATION_FOUND',

        // Security Alerts
        'SECURITY_BREACH', 'UNAUTHORIZED_ACCESS', 'INTRUSION_DETECTED', 'FIREWALL_BREACH',
        'PORT_SCAN', 'MALWARE_DETECTED', 'VIRUS_SIGNATURE', 'TROJAN_DETECTED',
        'RANSOMWARE', 'CRYPTOJACKING', 'DDoS_ATTACK', 'ZERO_DAY_EXPLOIT',

        // Data Pipeline Status
        'ETL_RUNNING', 'TRANSFORM_COMPLETE', 'LOAD_FAILED', 'VALIDATION_PASSED',
        'SCHEMA_MISMATCH', 'PIPELINE_BLOCKED', 'QUEUE_OVERFLOW', 'BATCH_PROCESSED',
        'STREAM_CONNECTED', 'CACHE_INVALIDATED', 'INDEX_REBUILT', 'BACKUP_CREATED',
    ];

    // Combine regular words
    const allDataWords = [...dataWords, ...additionalTechWords];

    // Font size and column setup
    const fontSize = 20;
    const columns = Math.floor(window.innerWidth / (fontSize * 0.8)); // Increased density with 0.8x spacing

    // Track active animation frame
    let animationFrameId;

    // Create a drop object
    function createDrop() {
        const isSpecial = Math.random() < 0.15; // 15% chance for special words
        
        // Different types of drops
        const dropType = Math.random();
        let typingMode;
        
        if (dropType < 0.5) {
            typingMode = 'sequential'; // Regular typing effect
        } else if (dropType < 0.8) {
            typingMode = 'burst'; // Types several characters at once
        } else {
            typingMode = 'glitch'; // Random typing with occasional jumps
        }
        
        return {
            x: Math.floor(Math.random() * window.innerWidth),
            y: Math.random() * -100, // Start above the visible area
            speed: getRandomSpeed(),
            word: getRandomWord(isSpecial),
            isSpecial: isSpecial,
            visibleChars: 0,
            typingDelay: Math.random() * 80 + 40, // Faster typing (40-120ms)
            typingTimer: 0,
            typingMode: typingMode,
            trailLength: Math.floor(Math.random() * 4) + 2, // Shorter trail length (2-5 chars)
            trailOpacity: 0.7 + Math.random() * 0.3, // Random base opacity for trail
            burstSize: Math.floor(Math.random() * 3) + 1, // For burst typing mode
            glitchTimer: 0,
            hasEcho: Math.random() < 0.3, // 30% chance to have echo effect
            echoOffset: Math.floor(Math.random() * 5) + 2, // Echo offset if enabled
            matrixTrail: [], // Store trail characters for Matrix effect
            matrixTrailLength: Math.floor(Math.random() * 5) + 3, // 3-7 characters in Matrix trail
            lastTrailUpdate: 0 // Time tracking for trail updates
        };
    }

    // Get random speed
    function getRandomSpeed() {
        // Wider range of speeds for more variety
        const baseSpeed = 1 + Math.random() * 2.5; // Between 1 and 3.5
        return Math.round(baseSpeed * 10) / 10; // Round to 1 decimal place
    }

    // Get random word
    function getRandomWord(isSpecial) {
        const words = isSpecial ? specialWords : allDataWords;
        return words[Math.floor(Math.random() * words.length)];
    }

    // Get random Matrix character (mostly Asian characters for authenticity)
    function getMatrixChar() {
        const charTypes = [
            // Matrix-style characters (mostly katakana for authentic look)
            'ｱ', 'ｲ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ',
            'ﾀ', 'ﾁ', 'ﾂ', 'ﾃ', 'ﾄ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾉ', 'ﾊ', 'ﾋ', 'ﾌ', 'ﾍ', 'ﾎ',
            'ﾏ', 'ﾐ', 'ﾑ', 'ﾒ', 'ﾓ', 'ﾔ', 'ﾕ', 'ﾖ', 'ﾗ', 'ﾘ', 'ﾙ', 'ﾚ', 'ﾛ', 'ﾜ', 'ﾝ',
            // Occasional numbers and symbols for variety
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
            '+', '-', '*', '/', '=', '>', '<', '?', '!', '@'
        ];
        
        // Mostly Asian characters, occasionally numbers/symbols
        return charTypes[Math.floor(Math.random() * charTypes.length)];
    }

    // Initialize drops (increased density to 85% of column count)
    const drops = Array.from({ length: Math.floor(columns * 0.85) }, () => createDrop());

    // Handle window resize
    window.addEventListener('resize', () => {
        // Resize canvas with proper pixel ratio
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(pixelRatio, pixelRatio);
    });

    // Animation variables
    let lastTime = 0;
    let paused = false;

    // Main drawing function
    function draw(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Clear with slight fade effect for trailing visuals
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'; // Slight transparency for motion blur
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Ensure crisp text rendering
        ctx.imageSmoothingEnabled = false;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // Draw all drops
        drops.forEach((drop, i) => {
            // Process typing based on mode
            drop.typingTimer += deltaTime;
            
            // Update Matrix trail characters occasionally
            if (currentTime - drop.lastTrailUpdate > 100) { // Update every 100ms
                drop.lastTrailUpdate = currentTime;
                
                // Add a new character to the front of the trail if needed
                if (drop.matrixTrail.length < drop.matrixTrailLength) {
                    drop.matrixTrail.unshift(getMatrixChar());
                } else {
                    // Shift array and add new character at beginning
                    drop.matrixTrail.pop();
                    drop.matrixTrail.unshift(getMatrixChar());
                }
            }
            
            // Typing logic - same as before
            if (drop.typingTimer >= drop.typingDelay) {
                drop.typingTimer = 0;
                
                switch(drop.typingMode) {
                    case 'sequential':
                        // Regular sequential typing
                        if (drop.visibleChars < drop.word.length) {
                            drop.visibleChars++;
                        }
                        break;
                    
                    case 'burst':
                        // Burst typing - multiple characters at once
                        if (drop.visibleChars < drop.word.length) {
                            drop.visibleChars = Math.min(
                                drop.visibleChars + drop.burstSize, 
                                drop.word.length
                            );
                        }
                        break;
                    
                    case 'glitch':
                        // Glitch typing - can randomly jump ahead or back
                        drop.glitchTimer++;
                        
                        if (drop.glitchTimer >= 3) { // Every 3rd cycle
                            drop.glitchTimer = 0;
                            
                            if (Math.random() < 0.15 && drop.visibleChars > 1) {
                                // Occasionally go back a character (glitch effect)
                                drop.visibleChars = Math.max(1, drop.visibleChars - 1);
                            } else if (drop.visibleChars < drop.word.length) {
                                // Usually advance 1-2 characters
                                drop.visibleChars = Math.min(
                                    drop.visibleChars + (Math.random() < 0.7 ? 1 : 2),
                                    drop.word.length
                                );
                            }
                        } else if (drop.visibleChars < drop.word.length) {
                            // Normal advance on other cycles
                            drop.visibleChars++;
                        }
                        break;
                }
            }

            // Get visible characters of the word
            const chars = drop.word.slice(0, drop.visibleChars).split('');
            
            // Draw each character of the word
            chars.forEach((char, j) => {
                const y = drop.y + (j * fontSize * 1.2); // 1.2x spacing for readability
                
                // Only draw visible characters
                if (y > 0 && y < window.innerHeight) {
                    // Choose font size with slight variation for dynamic feel
                    const charFontSize = fontSize * (1 + (Math.random() * 0.1 - 0.05)); // ±5% variation
                    ctx.font = `bold ${Math.floor(charFontSize)}px "Courier New", monospace`;

                    // Calculate brightness based on position
                    const isCurrent = j === chars.length - 1;
                    const trailPosition = (chars.length - j) / chars.length;
                    
                    if (isCurrent) { // Currently typing character
                        // Bright typing effect with sharp glow
                        ctx.shadowColor = drop.isSpecial ? '#00a9ff' : '#00ff00';
                        ctx.shadowBlur = 8; // Increased glow
                        
                        // Pulsing effect for the current character
                        const pulseIntensity = 0.8 + Math.sin(currentTime / 200) * 0.2;
                        
                        ctx.fillStyle = drop.isSpecial ? 
                            `rgba(255, 255, 255, ${pulseIntensity})` : 
                            `rgba(180, 255, 180, ${pulseIntensity})`;
                            
                        // Double render for emphasis
                        ctx.fillText(char, drop.x, y);
                        ctx.fillText(char, drop.x, y);
                        
                        // Add echo effect for some drops
                        if (drop.hasEcho) {
                            ctx.shadowBlur = 3;
                            ctx.fillStyle = drop.isSpecial ? 
                                `rgba(0, 169, 255, 0.4)` : 
                                `rgba(0, 255, 0, 0.4)`;
                            ctx.fillText(char, drop.x + drop.echoOffset, y + drop.echoOffset);
                        }
                    } else {
                        // Previously typed characters (trail)
                        ctx.shadowBlur = 0;
                        
                        // Calculate fade based on position in the trail and randomness
                        const distanceFade = Math.pow(trailPosition, 0.8); // Non-linear fade
                        const jitter = 1 + (Math.random() * 0.1 - 0.05); // ±5% jitter
                        const opacity = Math.max(0.9 - (j / chars.length) * jitter, 0.25) * distanceFade * drop.trailOpacity;
                        
                        // Color based on drop type
                        ctx.fillStyle = drop.isSpecial ? 
                            `rgba(0, 169, 255, ${opacity})` : 
                            `rgba(0, 255, 0, ${opacity})`;
                            
                        ctx.fillText(char, drop.x, y);
                        
                        // Add random digital artifacts for some characters
                        if (Math.random() < 0.03) {
                            ctx.fillStyle = drop.isSpecial ? 
                                `rgba(200, 230, 255, 0.6)` : 
                                `rgba(200, 255, 200, 0.6)`;
                            const artifactX = drop.x + (Math.random() * 4 - 2);
                            ctx.fillText('.', artifactX, y);
                        }
                    }
                }
            });

            // Draw Matrix trail below the word (classic Matrix rain effect)
            if (chars.length > 0) {
                const lastCharY = drop.y + ((chars.length - 1) * fontSize * 1.2);
                
                // Draw the Matrix trail characters below the word
                drop.matrixTrail.forEach((trailChar, k) => {
                    const trailY = lastCharY + ((k + 1) * fontSize * 1.2);
                    
                    // Skip if off screen
                    if (trailY < 0 || trailY > window.innerHeight) return;
                    
                    // Matrix trail fade effect - first character is brightest
                    let trailOpacity;
                    if (k === 0) {
                        // Head character (brightest, with glow)
                        trailOpacity = 0.95;
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = drop.isSpecial ? '#00a9ff' : '#00ff00';
                    } else {
                        // Trailing characters (fade out progressively)
                        const fadeRate = 1 - ((k + 1) / (drop.matrixTrailLength + 1)) * 0.9;
                        trailOpacity = Math.max(0.1, fadeRate) * 0.8;
                        ctx.shadowBlur = 0;
                    }
                    
                    // Matrix characters font
                    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
                    
                    // Color based on drop type (special/normal)
                    ctx.fillStyle = drop.isSpecial ? 
                        `rgba(0, 169, 255, ${trailOpacity})` : 
                        `rgba(0, 255, 0, ${trailOpacity})`;
                    
                    // Draw the trail character
                    ctx.fillText(trailChar, drop.x, trailY);
                    
                    // Occasional character swaps for authentic Matrix effect
                    if (Math.random() < 0.05) {
                        drop.matrixTrail[k] = getMatrixChar();
                    }
                });
                
                // Reset shadow after drawing
                ctx.shadowBlur = 0;
            }

            // Move drop with variable speed
            drop.y += drop.speed;

            // Reset drop when it goes off screen including trail
            const fullWordHeight = fontSize * 1.2 * drop.word.length;
            const trailHeight = fontSize * 1.2 * drop.matrixTrailLength;
            
            if (drop.y > window.innerHeight + trailHeight || 
                (drop.visibleChars >= drop.word.length && 
                 drop.y > window.innerHeight - fullWordHeight)) {
                drops[i] = createDrop();
            }
        });

        // Occasionally add new drops for more dynamic feel
        if (Math.random() < 0.02 && drops.length < columns * 1.2) {
            drops.push(createDrop());
        }

        // Request next animation frame
        if (!paused) {
            animationFrameId = requestAnimationFrame(draw);
        }
    }

    // Start animation
    function animate(currentTime) {
        draw(currentTime);
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Initial animation start
    animate(0);

    // Toggle animation on click
    canvas.addEventListener('click', () => {
        paused = !paused;
        if (!paused) {
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(animate);
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });
}); 