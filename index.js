//'use strict'
const 
    os = require('os');
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
            forceColor: (process.env.FORCE_COLOR || false),
            platform: process.platform,
            osRelease: os.release().split('.').map(el => {return parseInt(el)}),
            node: process.versions.node.split('.').map(el => {return parseInt(el)}),
            stdout: process.stdout,
            stderr: process.stderr,
            color: (process.argv
                .map(arg => {
                    return (arg.startsWith('-')) ? 
                        (arg.startsWith('--')) ? 
                            (arg.slice(2) === 'no-color') ? 
                                false : 
                                    (arg.slice(2).split('=')[1]) ? 
                                        arg.slice(2).split('=')[1] 
                                            : true 
                        : (arg.slice(1) === 'no-color') ? 
                            false : 
                                (arg.slice(1).split('=')[1]) ? 
                                    arg.slice(1).split('=')[1] 
                                        : true
                    : false;
                })
                .filter(Boolean)
                .toString() || false),
            get forceColor() {
                return (!this.color) ? false : (true || process.env.FORCE_COLOR.length === 0 || parseInt(process.env.FORCE_COLOR, 10) !== 0)
            },
            min: this.forceColor ? 1 : 0,
            get level() {
                let level = this.min;
                if (this.forceColor === false) 
                    level = 0;
                    
                if (this.color === '16m' || this.color === 'full' || this.color === 'truecolor')
                    level = 3;

                if (this.color = '256')
                    level = 2;

                if((this.stdout && !this.stdout.isTTY && this.forceColor !== true) || (this.stderr && !this.stderr.isTTY && this.forceColor !== true))
                    level = 0;

                if(this.platform === 'win32')
                    if(this.node[0] >= 8 && this.osRelease[0] >= 10 && this.osRelease[2] >= 10586)
                        level = (this.osRelease[2] >= 14931) ? 3 : 2;

                if(this.ci) {
                    if(this.ciVariant || this.ciName === 'codeship')
                        level = 1;
                    level = this.min;
                }

                if(this.teamcity)
                    level = /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(this.teamcity) ? 1 : 0;

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
                if(this.colorTerm)
                    level = 1;

                if(this.term === 'dumb')
                    level = this.min;
                
                return level;
            }
        },
        get supColor() {
            return (this.env.level === 0) ? false : {
                level: this.env.level,
                hasBasic: true,
                has256: this.env.level >= 2,
                has16m: this.env.level >= 3,
              };
        },
        get level () {
            return this.supColor.level
        },
        log (msg, opts) {
            console.log(this.level);
        }
    },
    log = (msg, opts) => {
        logger.log(msg, opts)    
    };

log('aaa');
//module.exports = log;