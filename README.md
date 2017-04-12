# angular-tooltip

Angularjs tooltip module

## Requirement

### Browser support

Chrome | Firefox | IE | Opera | Safari
--- | --- | --- | --- | --- |
 ✔ | ✔ | IE9 + | ✔ | ✔ |

## Installation

1. Bower
```
$ bower install kw-ng-tooltip --save
```

2. Add module dependency
```js
angular.module('app', [
	'kw.tooltip'
]);
```

3. Use!
```html
<div tooltip tt-text="Tooltip Text">Tooltip me</div>
```

## Documentation

Option | Optional | Type | Default | Example
--- | --- | --- | --- | --- |
tooltip | O(If used "tt-text") | String() |  | 'template/other-tooltip.html' |
tt-text | O(If used "tooltip") | String() |  | '\<b\>Tooltip Text\</b\>' |
tt-type | O | String('TOP', 'BOTTOM', 'LEFT', 'RIGHT') | 'TOP' | 'bottom' |
tt-option | O | Object({ <br/>waitTime: Number,<br/>animationTime: Number,<br/>padding: Number,<br/>useHTML: Boolean,<br/>zIndex: Number<br/>}) | {<br/>waitTime: 250,<br/>animationTime: 250,<br/>padding: 5,<br/>useHTML: false,<br/>zIndex: 1000<br/>} | { useHTML: true } |
tt-scope-model | O | Object({ Key: Value }) | | { time: getTime() } |
tt-disable | O | String(Code) | | 'isDisabled() == true'

## License

The MIT License (MIT)

Copyright (c) 2014 Filippo Oretti, Dario Andrei

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
