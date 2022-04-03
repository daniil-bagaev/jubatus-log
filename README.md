## Install
```
$ npm install jub-log
```
## Usage
```js
    log = require('jub-log');
    log('Hello World', {
        type: 'info'
    });
```
## API
#### `opts.type`
bla bla `Default: custom`
- `info`
- `help`
- `error`
- `warning`
#### `opts.level` 
`Default: Your terminal supports color level` 
Specifies the level of color support.
Color support is automatically detected, but you can override it by setting the `level` property.
You can set any level from 0 to 3, but no more than what your terminal allows.
| Level    	| Description                           |
|-------	|---------------------------------------|
| 0         | All colors disabled                   |
| 1         | Basic color support (16 colors)       |
| 2         | 256 color support                     |
| 3         | Truecolor support (16 million colors) |
Can be overriden by the user with the flags `--color` and `--no-color`.
#### `opts.logdir` 
bla bla `Default: ./.log/` 
#### `opts.filename` 
bla bla `Default: null`
#### `opts.header`
bla bla `Default: null`
#### `opts.prefix`
`Default: null`
Add text before your message
#### `opts.suffix`
`Default: null`
Add text after your message.
### Styles
Each style has an `open` and `close` property.
#### `opts.color`
The text color
`Default: 'white'` 
Standart options:
- `black`
- `red`
- `green`
- `yellow`
- `blue`
- `magenta`
- `cyan`
- `white`
- `grey` alias(`gray`, `brightBlack`)
- `brightRed`
- `brightGreen`
- `brightYellow`
- `brightBlue`
- `brightMagenta`
- `brightCyan`
- `brightWhite`
also you can use hex or rgb variant if your terminal support them.
#### `opts.bg`
The text background color
`Default: 'black'` 
Standart options:
- `black`
- `red`
- `green`
- `yellow`
- `blue`
- `magenta`
- `cyan`
- `white`
- `grey` alias(`gray`, `brightBlack`)
- `brightRed`
- `brightGreen`
- `brightYellow`
- `brightBlue`
- `brightMagenta`
- `brightCyan`
- `brightWhite`
also you can use hex or rgb variant if your terminal support them.
#### `opts.style`
`Default: 'standart'`
Standart options:
- `standart` (alias `reset`) - reset the current style.
- `bold` - make the text bold.
- `dim` - make the text have lower opacity.
- `italic` - make the text italic.
- `underline` - put horizontal line below the text.
- `overline` - put horizontal line above the text.
- `inverse` - invert background and foreground colors.
- `hidden` - make the text invisible.
- `strikethrough` - put horizontal line through the center of the text.
#### `opts.date`
bla bla `Default: null`
|             	| Token 	| Output                                  	|
|-------------	|-------	|-----------------------------------------	|
| Years       	| YY    	| 70, 71 ... 21, 22                       	|
|             	| YYYY  	| 1970, 1971 ... 2021, 2022               	|
| Months      	| M     	| 1, 2 ... 11, 12                         	|
|             	| MM    	| 01, 02 ... 11, 12                       	|
|             	| MMM   	| Jan, Feb ... Nov, Dec                   	|
|             	| MMMM  	| January, Febrary ... November, December 	|
| Days        	| D     	| 1, 2 ... 30, 31                         	|
|             	| DD    	| 01, 02 ... 30, 31                       	|
| Hours       	| H     	| 1, 2 ... 23, 00                         	|
|             	| HH    	| 01, 02, ... 23, 00                      	|
| Minutes     	| m     	| 1, 2 ... 58, 59                         	|
|             	| mm    	| 01, 02 ... 58, 59                       	|
| Seconds     	| s     	| 1, 2 ... 58, 59                         	|
|             	| ss    	| 01, 02 ... 58, 59                       	|
| Miliseconds 	| S     	| 1, 2 ... 8, 9                           	|
|             	| SS    	| 01, 02 ... 98, 99                       	|
|             	| SS    	| 001, 002, ... 998, 999                  	|
## Example

## Related
- [supports-color](https://github.com/chalk/supports-color) code for colors suport 
- [ansi-styles](https://github.com/chalk/ansi-styles) code for ansi-codes support
## License
MIT
