'use strict';
const 
    os = require('os'),
    fs = require('fs');
const 
    logger = {
        env: {
            teamcity: (process.env.TEAMCITY_VERSION || false),
            term: (process.env.TERM || false),
            termProgram: (process.env.TERM_PROGRAM || false),
            termProgramVer: parseInt((process.env.TERM_PROGRAM_VERSION || '').split('.')[0], 10),
            ci: (process.env.CI || false),
            ciVariant:  ['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(el => { return el in process.env }),
            ciName: (process.env.CI_NAME || false),
            platform: process.platform,
            colorTerm: (process.env.COLORTERM || false),
            osRelease: os.release().split('.').map(el => {return parseInt(el)}),
            node: process.versions.node.split('.').map(el => {return parseInt(el)}),
            stdout: process.stdout,
            stderr: process.stderr,
            get color () { 
                let 
                    flags = 
                        process.argv
                            .map(el => {
                                if(el.startsWith('-'))
                                    if(el.startsWith('--'))
                                        return el.slice(2).split('=');
                                    else
                                        return el.slice(1).split('=')
                            })
                            .filter(Boolean);
                let x = undefined;
                flags.forEach(el => {
                    if(el.length > 1)
                        x = el[1]
                    else
                        x = false;
                });
                return x;
            },
            get forceColor() {
                return (this.color === undefined) ? undefined : 
                            (!this.color) ? false : 
                                ((process.env.FORCE_COLOR && process.env.FORCE_COLOR.length === 0) || parseInt(process.env.FORCE_COLOR, 10) !== 0);               
            },
            get level() {
                let level;
                if(this.forceColor === false)
                    return 0;
                if((this.stdout && !this.stdout.isTTY && this.forceColor !== true) || (this.stderr && !this.stderr.isTTY && this.forceColor !== true))
                    return 0;    
                let min = this.forceColor ? 1 : 0;
                if(this.platform === 'win32') {
                    if(this.node[0] >= 8 && this.osRelease[0] >= 10 && this.osRelease[2] >= 10586)
                        level = (this.osRelease[2] >= 14931) ? 3 : 2;
                    level = 1;
                }
                if(this.ci) {
                    if(this.ciVariant || this.ciName === 'codeship')
                        level = 1;
                    level = min;
                }
                if(this.teamcity)
                    level = /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(this.teamcity) ? 1 : 0;
                if(this.colorTerm === 'truecolor')
                    level = 3
                else 
                    if(this.colorTerm)
                        level = 1;
                switch(this.termProgram) {
                    case 'iTerm.app':
                        level = (this.termProgramVer >= 3) ? 3 : 2;
                    case 'Hyper':
                        level = 3;
                    case 'Apple_Terminal':
                        level = 2;
                }    
                if(/-256(color)?$/i.test(this.term))
                    level = 2;
                if(/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(this.term))
                    level = 1;
                if(this.term === 'dumb')
                    level = min;    
                if(this.color === '256' && level >= 2)
                    level = 2;
                if((this.color === '16m' || this.color === 'full' || this.color === 'truecolor') && level >=3)
                    level = 3;
                return level;
            }
        },
        opts: {
            logdir: './.log',
            filename: null,
            header: null,
            prefix: null,
            suffix: null,
            color: 'white',
            bg: 'black',
            style: 'standart',
            date: null
        },
        styleCodes(style) {
            switch(style) {
                case 'standart':
                case 'reset':
                    return { 
                        open: '\u001b[0m', 
                        close: '\u001b[0m', 
                    };
                case 'bold':
                    return { 
                        open: '\u001b[1m', 
                        close: '\u001b[22m', 
                    };
                case 'dim':
                    return { 
                        open: '\u001b[2m', 
                        close: '\u001b[22m', 
                    };
                case 'italic':
                    return { 
                        open: '\u001b[3m', 
                        close: '\u001b[23m', 
                    };
                case 'underline':                    
                    return { 
                        open: '\u001b[4m', 
                        close: '\u001b[24m', 
                    };
                case 'overline':
                    return { 
                        open: '\u001b[53m', 
                        close: '\u001b[55m', 
                    };
                case 'inverse':                    
                    return { 
                        open: '\u001b[7m', 
                        close: '\u001b[27m', 
                    };
                case 'hidden':                    
                    return { 
                        open: '\u001b[8m', 
                        close: '\u001b[28m', 
                    };
                case 'strikethrough':
                    return { 
                        open: '\u001b[9m', 
                        close: '\u001b[29m', 
                    };
                default:                    
                    return { 
                        open: '\u001b[0m', 
                        close: '\u001b[0m', 
                    };
            }
        },
        colorCodes(color, level) {
            if(!level)
                level = this.env.level;
        },
        log (msg, opts) {
            if(!opts)
                opts = {};            
            opts = {
                filename: (opts.filename || this.opts.filename),
                logdir: (opts.logdir || this.opts.logdir),
                header: (opts.header || this.opts.header),
                color: (opts.color || this.opts.color),
                bg: (opts.bg || this.opts.bg),
                style: (opts.style || this.opts.style),
                prefix: (opts.prefix || this.opts.prefix),
                suffix: (opts.suffix || this.opts.suffix),
                level: (this.env.level < opts.level) ? this.env.level : (opts.level || this.env.level)
            }
            msg = (opts.header && opts.header.length) ? opts.header + '\n' + msg : msg;
            msg = (opts.prefix && opts.prefix.length) ? opts.prefix + msg : msg;
            msg = (opts.suffix && opts.suffix.length) ? msg + opts.suffix : msg;
            if(opts.filename) {
                fs.mkdirSync(opts.logdir, {recursive: true}, err => {
                    if (err)
                        console.log('No log dir');
                })
                fs.appendFileSync(opts.logdir + opts.filename, msg+'\n');
            }
        }
    },
    log = (msg, opts) => {
        logger.log(msg, opts);
    };
//log('aaa', {style: 'bold'});
module.exports = log;
