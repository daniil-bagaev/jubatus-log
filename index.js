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
        types: {
            info: {
                color: 'blue',
                header: '[Info]'
            },
            help: {
                color: 'cyan',
                header: '[Help]'
            },
            error: {
                color: 'brightRed',
                header: '[Error]'
            }, 
            warning: {
                color: 'yellow',
                header: '[Warning]'
            }
        },
        styleCodes(style) {
            switch(style) {
                case 'standart':
                case 'reset':
                    return { 
                        open: '\u001b[0m', 
                        close: '\u001b[0m'
                    };
                case 'bold':
                    return { 
                        open: '\u001b[1m', 
                        close: '\u001b[22m'
                    };
                case 'dim':
                    return { 
                        open: '\u001b[2m', 
                        close: '\u001b[22m'
                    };
                case 'italic':
                    return { 
                        open: '\u001b[3m', 
                        close: '\u001b[23m'
                    };
                case 'underline':                    
                    return { 
                        open: '\u001b[4m', 
                        close: '\u001b[24m'
                    };
                case 'overline':
                    return { 
                        open: '\u001b[53m', 
                        close: '\u001b[55m'
                    };
                case 'inverse':                    
                    return { 
                        open: '\u001b[7m', 
                        close: '\u001b[27m'
                    };
                case 'hidden':                    
                    return { 
                        open: '\u001b[8m', 
                        close: '\u001b[28m'
                    };
                case 'strikethrough':
                    return { 
                        open: '\u001b[9m', 
                        close: '\u001b[29m'
                    };
                default:                    
                    return { 
                        open: '\u001b[0m', 
                        close: '\u001b[0m'
                    };
            }
        },
        bgNameCodes(color) {
            let closeCode = '\u001b[49m';
            switch(color) {
                case 'white':
                    return {
                        open: '\u001b[47m',
                        close: closeCode
                    };
                case 'black':
                    return {
                        open: '\u001b[40m',
                        close: closeCode
                    };
                case 'red':
                    return {
                        open: '\u001b[41m',
                        close: closeCode
                    };
                case 'green':
                    return {
                        open: '\u001b[42m',
                        close: closeCode
                    };
                case 'yellow':
                    return {
                        open: '\u001b[43m',
                        close: closeCode
                    };
                case 'blue':
                    return {
                        open: '\u001b[44m',
                        close: closeCode
                    };
                case 'magenta':
                    return {
                        open: '\u001b[45m',
                        close: closeCode
                    };
                case 'cyan':
                    return {
                        open: '\u001b[46m',
                        close: closeCode
                    };
                case 'gray':
                case 'grey':
                case 'brightBlack': 
                    return {
                        open: '\u001b[100m',
                        close: closeCode
                    };
                case 'brightWhite':
                    return {
                        open: '\u001b[107m',
                        close: closeCode
                    };
                case 'brightRed':
                    return {
                        open: '\u001b101m',
                        close: closeCode
                    };
                case 'brightGreen':
                    return {
                        open: '\u001b[102m',
                        close: closeCode
                    };
                case 'brightYellow':
                    return {
                        open: '\u001b[103m',
                        close: closeCode
                    };
                case 'brightBlue':
                    return {
                        open: '\u001b[104m',
                        close: closeCode
                    };
                case 'brightMagenta':
                    return {
                        open: '\u001b[105m',
                        close: closeCode
                    };
                case 'brightCyan':
                    return {
                        open: '\u001b[106m',
                        close: closeCode
                    };
                default: 
                    return {
                        open: '\u001b[47m',
                        close: closeCode
                    };
            }
        },
        colorNameCodes(color) {
            let closeCode = '\u001b[39m';
            switch(color) {
                case 'white':
                    return {
                        open: '\u001b[37m',
                        close: closeCode
                    };
                case 'black':
                    return {
                        open: '\u001b[30m',
                        close: closeCode
                    };
                case 'red':
                    return {
                        open: '\u001b[31m',
                        close: closeCode
                    };
                case 'green':
                    return {
                        open: '\u001b[32m',
                        close: closeCode
                    };
                case 'yellow':
                    return {
                        open: '\u001b[33m',
                        close: closeCode
                    };
                case 'blue':
                    return {
                        open: '\u001b[34m',
                        close: closeCode
                    };
                case 'magenta':
                    return {
                        open: '\u001b[35m',
                        close: closeCode
                    };
                case 'cyan':
                    return {
                        open: '\u001b[36m',
                        close: closeCode
                    };
                case 'gray':
                case 'grey':
                case 'brightBlack': 
                    return {
                        open: '\u001b[90m',
                        close: closeCode
                    };
                case 'brightWhite':
                    return {
                        open: '\u001b[97m',
                        close: closeCode
                    };
                case 'brightRed':
                    return {
                        open: '\u001b91m',
                        close: closeCode
                    };
                case 'brightGreen':
                    return {
                        open: '\u001b[92m',
                        close: closeCode
                    };
                case 'brightYellow':
                    return {
                        open: '\u001b[93m',
                        close: closeCode
                    };
                case 'brightBlue':
                    return {
                        open: '\u001b[94m',
                        close: closeCode
                    };
                case 'brightMagenta':
                    return {
                        open: '\u001b[95m',
                        close: closeCode
                    };
                case 'brightCyan':
                    return {
                        open: '\u001b[96m',
                        close: closeCode
                    };
                default: 
                    return {
                        open: '\u001b[37m',
                        close: closeCode
                    };
            }
        },
        dateFormat(format) {
            let
                months = ['M', 'MM', 'MMM', 'MMMM'],
                days = ['D', 'DD'],
                years = ['YY', 'YYYY'],
                hours = ['H', 'HH'],
                minutes = ['m', 'mm'],
                seconds = ['s', 'ss'],
                miliseconds = ['S', 'SS', 'SSS'];
            let 
                monthsNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            let date = format
                .match(/([A-Za-z]{1,4})|([\s\:\-]{0,})/gi)
                .filter(Boolean)
                .map(el => {
                    let z;
                    if(/[A-Za-z{1,4}]/gi.test(el)){
                        if(years.includes(el)) {
                            switch(el) {
                                case 'YYYY':
                                    return new Date().getFullYear()+'';
                                case 'YY':
                                    return (new Date().getFullYear()+'').slice(2);
                            }
                        }
                        if(months.includes(el)) {
                            switch(el) {
                                case 'MMMM':
                                    return monthsNames[new Date().getMonth()];
                                case 'MMM':
                                    return monthsNames[new Date().getMonth()].slice(0, 3);
                                case 'MM':
                                    return ((new Date().getUTCMonth()+'').length === 1) ? '0'+new Date().getUTCMonth() : new Date().getUTCMonth()+'';
                                case 'M':
                                    return new Date().getUTCMonth()+'';
                            }    
                        }
                        if(days.includes(el)) {
                            switch(el) {
                                case 'DD':
                                    return ((new Date().getDate()+'').length === 1) ? '0'+new Date().getDate() : new Date().getDate()+'';
                                case 'D':
                                    return new Date().getDate()+'';
                            }                            
                        }
                        if(hours.includes(el)) {
                            switch(el) {
                                case 'HH':
                                    return ((new Date().getHours()+'').length === 1) ? '0'+new Date().getHours() : new Date().getHours()+'';
                                case 'H':
                                    return new Date().getHours()+'';
                            }                            
                        }
                        if(minutes.includes(el)) {
                            switch(el) {
                                case 'mm':
                                    return ((new Date().getMinutes()+'').length === 1) ? '0'+new Date().getMinutes() : new Date().getMinutes()+'';
                                case 'm':
                                    return new Date().getMinutes()+'';
                            }                            
                        }                    
                        if(seconds.includes(el)) {
                            switch(el) {
                                case 'ss':
                                    return ((new Date().getSeconds()+'').length === 1) ? '0'+new Date().getSeconds() : new Date().getSeconds()+'';
                                case 's':
                                    return new Date().getSeconds()+'';
                            }                            
                        }
                        if(miliseconds.includes(el)) {
                            switch(el) {
                                case 'S':
                                    return (((new Date().getMilliseconds()+'').length === 1) ? '00'+ (new Date().getMilliseconds()+'') : ((new Date().getMilliseconds()+'').length === 2) ? '0'+ (new Date().getMilliseconds()+'') : (new Date().getMilliseconds()+'')).slice(0,1);
                                case 'SS':
                                    return (((new Date().getMilliseconds()+'').length === 1) ? '00'+ (new Date().getMilliseconds()+'') : ((new Date().getMilliseconds()+'').length === 2) ? '0'+ (new Date().getMilliseconds()+'') : (new Date().getMilliseconds()+'')).slice(0,2);
                                case 'SSS':
                                    return (((new Date().getMilliseconds()+'').length === 1) ? '00'+ (new Date().getMilliseconds()+'') : ((new Date().getMilliseconds()+'').length === 2) ? '0'+ (new Date().getMilliseconds()+'') : (new Date().getMilliseconds()+''));
                            }                            
                        }
                    } else 
                        return el;
                })
                .join('^^')
                .replaceAll('^^','');
            return '[' + date + ']';
        },
        log (msg, opts) {
            if(!opts)
                opts = {};    
            opts = 
                (!Object.keys(opts).length) ? this.opts : 
                    (opts.type && this.types.hasOwnProperty(opts.type)) ? Object.assign(this.opts, this.types[opts.type], opts) : {
                        type: 'custom',
                        filename: (opts.filename || this.opts.filename),
                        logdir: (opts.logdir || this.opts.logdir),
                        header: (opts.header || this.opts.header),
                        color: (opts.color || this.opts.color),
                        bg: (opts.bg || this.opts.bg),
                        style: (opts.style || this.opts.style), //TODO: return style standart if not in styles
                        prefix: (opts.prefix || this.opts.prefix),
                        suffix: (opts.suffix || this.opts.suffix),
                        date: (opts.date || this.opts.date)
                    };
            Object.assign(opts, {level: (this.env.level < opts.level) ? this.env.level : (opts.level || this.env.level)});
            if(opts.style)
                opts.styleCodes = this.styleCodes(opts.style);

            if(opts.bg)       
                if(/[A-Za-z]/i.test(opts.color) && opts.level >=1)
                    opts.bgCodes = this.bgNameCodes(opts.bg);

            if(opts.color)
                if(/[A-Za-z]/g.test(opts.color) && opts.level >=1)
                    opts.colorCodes = this.colorNameCodes(opts.color);

            msg = (opts.header && opts.header.length) ? opts.header + '\n' + msg : msg;
            msg = (opts.prefix && opts.prefix.length) ? opts.prefix + msg : msg;
            msg = (opts.suffix && opts.suffix.length) ? msg + opts.suffix : msg;
            msg = (opts.date && opts.date.length) ? this.dateFormat(opts.date) +' '+ msg : msg;
            if(opts.filename) {
                fs.mkdirSync(opts.logdir, {recursive: true}, err => {
                    if (err)
                        console.log('No log dir');
                })
                fs.appendFileSync(opts.logdir + opts.filename, msg+'\n');
            }
            //console.log(opts);
            console.log(msg);
        }
    },
    log = (msg, opts) => {
        logger.log(msg, opts);
    };
log('Hello world', {type: 'info'});
//module.exports = log;
