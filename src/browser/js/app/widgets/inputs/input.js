var Widget = require('../common/widget'),
    Canvas = require('../common/canvas')

module.exports = class Input extends Canvas {

    static defaults() {

        return {
            type:'input',
            id:'auto',
            linkId:'',

            _geometry:'geometry',

            left:'auto',
            top:'auto',
            width:'auto',
            height:'auto',

            _style:'style',

            label:'auto',
            color:'auto',
            css:'',

            _input:'input',

            vertical:false,
            align: '',
            unit: '',
            editable:true,

            _value: 'value',
            default: '',
            value: '',

            _osc:'osc',

            precision:2,
            address:'auto',
            preArgs:[],
            target:[],
            bypass:false
        }

    }

    constructor(options) {

        var html = `
            <div class="input">
                <canvas></canvas>
            </div>
        `

        super({...options, html: html})

        this.value = ''
        this.stringValue = ''
        this.focused = false

        if (this.getProp('vertical')) this.widget.classList.add('vertical')
        if (this.getProp('align') === 'left') this.widget.classList.add('left')
        if (this.getProp('align') === 'right') this.widget.classList.add('right')


        if (this.getProp('editable')) {
            this.canvas.setAttribute('tabindex', 0)
            this.canvas.addEventListener('focus', this.focus.bind(this))
            this.input = DOM.create('<input></input>')
            this.input.addEventListener('blur', (e)=>{
                this.blur(false)
            })
            this.input.addEventListener('keydown', (e)=>{
                if (e.keyCode==13) this.blur()
                if (e.keyCode==27) this.blur(false)
            })
        } else {
            this.widget.classList.add('not-editable')
        }

    }

    focus() {

        if (this.focused) return
        this.focused = true

        this.canvas.setAttribute('tabindex','-1')
        this.input.value = this.stringValue
        this.widget.insertBefore(this.input, this.canvas)
        this.input.focus()

    }

    blur(change=true) {

        if (!this.focused) return
        this.focused = false

        if (change) this.inputChange()

        this.canvas.setAttribute('tabindex','0')
        this.widget.removeChild(this.input)

    }

    inputChange() {

        this.setValue(this.input.value, {sync:true, send:true})

    }

    resizeHandle(event){

        super.resizeHandle(event)

        if (this.getProp('vertical')){

            var ratio = CANVAS_SCALING * this.scaling

            this.ctx.setTransform(1, 0, 0, 1, 0, 0)
            this.ctx.rotate(-Math.PI/2)
            this.ctx.translate(-this.height * ratio, 0)


            if (ratio != 1) this.ctx.scale(ratio, ratio)
        }


    }

    setValue(v, options={} ) {

        try {
            this.value = JSON.parse(v)
        } catch (err) {
            this.value = v
        }

        this.stringValue = this.getStringValue()
        this.batchDraw()

        if (options.send && !options.fromSync) this.sendValue()
        if (options.sync) this.changed(options)

    }

    draw() {

        var v = this.stringValue,
            width = this.getProp('vertical') ? this.height : this.width,
            height = !this.getProp('vertical') ? this.height : this.width

        if (this.getProp('unit') && v.length) v += ' ' + this.getProp('unit')

        this.clear()

        this.ctx.fillStyle = this.colors.text

        if (this.textAlign == 'center') {
            this.ctx.fillText(v, Math.round(width/2), Math.round(height/2))
        } else if (this.textAlign == 'right') {
            this.ctx.fillText(v, width, Math.round(height/2))
        } else {
            this.ctx.fillText(v, 0, Math.round(height/2))
        }

        this.clearRect = [0, 0, width, height]

    }

    getStringValue() {
        if (this.value === undefined) return ''
        return typeof this.value != 'string' ?
            JSON.stringify(Widget.deepCopy(this.value, this.precision)).replace(/,/g, ', ') :
            this.value
    }

}
