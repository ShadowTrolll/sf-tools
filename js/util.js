function copyJSON (json) {
    copyText(JSON.stringify(json));
}

function copyText (text) {
    const element = document.createElement('textarea');
    element.value = text;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
    window.getSelection().removeAllRanges();
}

function copyNode (node) {
    let range = document.createRange();
    range.selectNode(node);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
}

function copyMatrix (matrix) {
    const element = document.createElement('table');
    element.insertAdjacentHTML(
        'afterbegin',
        `<tbody>${matrix.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`
    )

    document.body.appendChild(element);

    copyNode(element);

    document.body.removeChild(element);
}

function copyGrid (headers, values, transformer) {
    let thead = `<tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>`;
    let tbody = values.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('');
    if (transformer) {
        tbody = transformer(tbody);
    }

    let element = document.createElement('table');
    element.innerHTML = `<thead>${thead}</thead><tbody>${tbody}</tbody>`;
    document.body.appendChild(element);

    copyNode(element);

    document.body.removeChild(element);
}

// text()
(function () {
    File.prototype.text = File.prototype.text || function () {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(this);
        })
    };

    if (!Object.entries) {
        Object.entries = function (obj) {
            var ownProps = Object.keys(obj);
            var i = ownProps.length;
            var resArray = new Array(i);

            while (i--) {
                resArray[i] = [ownProps[i], obj[ownProps[i]]];
            }

            return resArray;
        };
    }

    if (typeof Array.prototype.findLastIndex !== 'function') {
        Array.prototype.findLastIndex = function (predicate) {
            for (let i = this.length - 1; i >= 0; i--) {
                if (predicate(this[i], i, this)) return i;
            }

            return -1;
        }
    }
})();

class Constants {
    constructor (values = null) {
        this.Values = values || {
            'green': '#00c851',
            'orange': '#ffbb33',
            'red': '#ff3547',
            'blue': '#0064b4',
            'black': '#000000',
            'white': '#ffffff',
            '15min': 900000,
            '1hour': 3600000,
            '12hours': 43200000,
            '1day': 86400000,
            '3days': 259200000,
            '7days': 604800000,
            '21days': 1814400000,
            'mount10': 1,
            'mount20': 2,
            'mount30': 3,
            'mount50': 4,
            'none': 0,
            'warrior': 1,
            'mage': 2,
            'scout': 3,
            'assassin': 4,
            'battlemage': 5,
            'berserker': 6,
            'demonhunter': 7,
            'druid': 8,
            'bard': 9,
            'empty': '',
            'tiny': 40,
            'small': 60,
            'normal': 100,
            'large': 160,
            'huge': 200,
            'scrapbook': SCRAPBOOK_COUNT,
            'max': -1,
            'weapon': 1,
            'shield': 2,
            'breastplate': 3,
            'shoes': 4,
            'gloves': 5,
            'helmet': 6,
            'belt': 7,
            'necklace': 8,
            'ring': 9,
            'talisman': 10
        }
    }

    get (key) {
        if (typeof key == 'string' && key.length >= 2 && key[0] == '@') {
            let rkey = key.slice(1);
            if (this.Values.hasOwnProperty(rkey)) {
                return this.Values[rkey];
            } else {
                return key;
            }
        } else {
            return key;
        }
    }

    exists (key) {
        return typeof key == 'string' && key.length >= 2 && key[0] == '@' && this.Values.hasOwnProperty(key.slice(1));
    }

    addConstant (key, value) {
        this.Values[key] = value;
    }

    keys () {
        return Object.keys(this.Values);
    }

    /*
        Old stuff
    */
    getValue (tag, key) {
        return tag == '@' ? this.Values[key] : key;
    }

    isValid (tag, key) {
        return tag == '@' && this.Values.hasOwnProperty(key);
    }
}

Constants.DEFAULT = new Constants();

function decodeScrapbook (data) {
    if (data) {
        let base_string = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
        let output = new Array(base_string.length * 8);
        for (let i = 0; i < base_string.length; i++) {
            let char = base_string.charCodeAt(i);
            for (let j = 0; j < 8; j++) {
                output[i * 8 + j] = (char & (1 << (7 - j))) > 0;
            }
        }

        return output;
    } else {
        return [];
    }
}

const Workers = new (class {
    constructor () {
        this.fetchCache = {};
        this.objectCache = {};
    }

    _local () {
        return document.location.protocol == 'file:';
    }

    async _fetchContent (location) {
        if (typeof this.fetchCache[location] === 'undefined') {
            let url = `${this._local() ? 'https://sftools.mar21.eu' : ''}/${location}`;

            this.fetchCache[location] = await fetch(url).then(data => data.text());
        }

        return this.fetchCache[location];
    }

    async _fetchObject (type) {
        if (typeof this.objectCache[type] === 'undefined') {
            let blob = new Blob([
                (await this._fetchContent('js/sim/base.js')) + (await this._fetchContent(`js/sim/${type}.js`))
            ], { type: 'text/javascript' });

            this.objectCache[type] = URL.createObjectURL(blob);
        }

        return this.objectCache[type];
    }

    async _prefetch (type) {
        await this._fetchObject(type);
    }

    async createWorker (type) {
        return new Worker(await this._fetchObject(type));
    }
})();

class WorkerBatch {
    constructor (type) {
        this.type = type;
        this.workers = [];
    }

    async _nextWorker () {
        if (this.workers.length > 0) {
            const index = this.workers.findIndex(([, params]) => this.activeParams.every((_params) => this.instanceCondition(params, _params)));

            if (index !== -1) {
                const [callback, params] = this.workers.splice(index, 1)[0];
                this.activeParams.push(params);
    
                const worker = await Workers.createWorker(this.type);
                worker.addEventListener('message', ({ data }) => {
                    callback(data, Date.now() - this.timestamp);
    
                    Loader.progress(++this.workersDone / this.workersTotal);

                    this.activeParams.splice(
                        this.activeParams.indexOf(params),
                        1
                    );

                    if (this.workersDone === this.workersTotal) {
                        this._resolve();
                    } else {
                        this._nextWorker();
                    }
                })
    
                worker.postMessage(params);
            }
        }
    }

    skip (predicate) {
        for (let i = 0; i < this.workers.length; i++) {
            // Remove worker if predicate is true
            if (predicate(this.workers[i][1])) {
                this.workers.splice(i--, 1);
                this.workersDone++;
            }
        }
    }

    add (callback, params) {
        this.workers.push([ callback, params ]);
    }

    size () {
        return this.workers.length;
    }

    run (instances, instanceCondition = () => true) {
        // Initial timestamp
        this.timestamp = Date.now();

        // Set counters
        this.workersDone = 0;
        this.workersTotal = this.workers.length;

        this.activeParams = [];

        // Set instance condition
        this.instanceCondition = instanceCondition;

        // Show loader
        Loader.toggle(true, { progress: true });

        // Create promise
        return new Promise(async (resolve) => {
            this._resolve = () => {
                const duration = Date.now() - this.timestamp;

                Loader.toggle(false);
                Logger.log('MESSAGE', `Simulator took ${_formatDuration(duration)} with ${this.workersTotal} sets using ${instances} concurrent threads.`);

                resolve(duration);
            };

            if (this.workersTotal === 0) {
                this._resolve();
            } else {
                await Workers._prefetch(this.type);

                const instancesInitial = Math.min(instances, this.workersTotal);
                for (let i = 0; i < instancesInitial; i++) {
                    this._nextWorker();
                }
            }
        })
    }
}

const NumberLabels = [
    [1E123, 'Quadrag'],
    [1E120, 'Noventrig'],
    [1E117, 'Octotrig'],
    [1E114, 'Septentrig'],
    [1E111, 'Sestrig'],
    [1E108, 'Quinquatrig'],
    [1E105, 'Quattuortrig'],
    [1E102, 'Trestrig'],
    [1E99, 'Duotrig'],
    [1E96, 'Untrig'],
    [1E93, 'Trig'],
    [1E90, 'Novemvig'],
    [1E87, 'Octovig'],
    [1E84, 'Septemvig'],
    [1E81, 'Sesvig'],
    [1E78, 'Quinquavig'],
    [1E75, 'Quattuorvig'],
    [1E72, 'Tresvig'],
    [1E69, 'Duovig'],
    [1E66, 'Unvig'],
    [1E63, 'Vig'],
    [1E60, 'Novendec'],
    [1E57, 'Octodec'],
    [1E54, 'Septendec'],
    [1E51, 'Sedec'],
    [1E48, 'Quinquadec'],
    [1E45, 'Quattuordec'],
    [1E42, 'Tredec'],
    [1E39, 'Duodec'],
    [1E36, 'Undec'],
    [1E33, 'Dec'],
    [1E30, 'Non'],
    [1E27, 'Oct'],
    [1E24, 'Sept'],
    [1E21, 'Sex'],
    [1E18, 'Quint'],
    [1E15, 'Quad'],
    [1E12, 'T'],
    [1E9, 'B'],
    [1E6, 'M']
];

function formatAsNamedNumber(rn) {
    let p = rn < 0 ? "-" : "";
    let n = Math.abs(rn);
    if (n < NumberLabels[NumberLabels.length - 1][0]) {
        return p + n.toString().split('').map((char, i, array) => ((array.length - 1 - i) % 3 == 2) && i != 0 ? (' ' + char) : char).join('');
    } else if (n > NumberLabels[0][0]) {
        return p + n.toExponential(3).replace('+', '');
    } else {
        for (let i = 0, unit; unit = NumberLabels[i]; i++) {
            if (n >= unit[0]) {
                var num = n / unit[0];
                return p + (num.toString().includes('.') && num.toString().split('.')[1].length > 3 ? num.toFixed(3) : num).toString().split('e')[0] + ' ' + unit[1];
            }
        }
    }
}

function getColorFromGradientObj (obj, sample) {
    var stops = Object.entries(obj).map(e => [ Number(e[0]), e[1] ]);
    stops.sort((a, b) => a[0] - b[0]);
    if (sample < stops[0][0]) sample = stops[0][0];
    else if (sample > stops[stops.length - 1][0]) sample = stops[stops.length - 1][0];
    for (var i = 0; i < stops.length - 1; i++) {
        if (sample <= stops[i + 1][0]) {
            return getColorFromGradient(stops[i][1], stops[i + 1][1], (sample - stops[i][0]) / (stops[i + 1][0] - stops[i][0]));
        }
    }

    return '';
}

function getColorFromGradient(a, b, sample) {
    a = getColorFromName(a);
    b = getColorFromName(b);
    var color = '#';
    var ao = a.startsWith('#') ? 1 : 0;
    var bo = b.startsWith('#') ? 1 : 0;
    if (isNaN(sample) || sample > 1) sample = 1.0;
    else if (sample < 0) sample = 0.0;
    if (a.length < 8) a += 'ff';
    if (b.length < 8) b += 'ff';
    for (var i = 0; i < 7; i += 2) {
        var sa = parseInt(a.substring(i + ao, i + ao + 2), 16);
        var sb = parseInt(b.substring(i + bo, i + bo + 2), 16);
        var s = Math.floor(sa * (1 - sample) + sb * (sample)).toString(16);
        color += '0'.repeat(2 - s.length) + s;
    }

    return color;
}

function getColorFromHSLA (h, s, l, a) {
    let r, g, b;

    h = parseInt(h) / 360;
    s = parseInt(s) / 100;
    l = parseInt(l) / 100;

    if (s == 0) {
        r = g = b = l;
    } else {
        const hue2rgb = function (p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return getColorFromRGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
}

function getColorFromRGBA (r, g, b, a) {
    var hr = Number(Math.trunc(r)).toString(16);
    var hg = Number(Math.trunc(g)).toString(16);
    var hb = Number(Math.trunc(b)).toString(16);
    var ha = isNaN(a) ? 'ff' : Number(Math.trunc(a * 255)).toString(16);

    return '#' + '0'.repeat(2 - hr.length) + hr + '0'.repeat(2 - hg.length) + hg + '0'.repeat(2 - hb.length) + hb + '0'.repeat(2 - ha.length) + ha;
}

const COLOR_MAP = {
    'aliceblue': '#f0f8ff',
    'antiquewhite': '#faebd7',
    'aqua': '#00ffff',
    'aquamarine': '#7fffd4',
    'azure': '#f0ffff',
    'beige': '#f5f5dc',
    'bisque': '#ffe4c4',
    'black': '#000000',
    'blanchedalmond': '#ffebcd',
    'blue': '#0000ff',
    'blueviolet': '#8a2be2',
    'brown': '#a52a2a',
    'burlywood': '#deb887',
    'cadetblue': '#5f9ea0',
    'chartreuse': '#7fff00',
    'chocolate': '#d2691e',
    'coral': '#ff7f50',
    'cornflowerblue': '#6495ed',
    'cornsilk': '#fff8dc',
    'crimson': '#dc143c',
    'cyan': '#00ffff',
    'darkblue': '#00008b',
    'darkcyan': '#008b8b',
    'darkgoldenrod': '#b8860b',
    'darkgray': '#a9a9a9',
    'darkgreen': '#006400',
    'darkkhaki': '#bdb76b',
    'darkmagenta': '#8b008b',
    'darkolivegreen': '#556b2f',
    'darkorange': '#ff8c00',
    'darkorchid': '#9932cc',
    'darkred': '#8b0000',
    'darksalmon': '#e9967a',
    'darkseagreen': '#8fbc8f',
    'darkslateblue': '#483d8b',
    'darkslategray': '#2f4f4f',
    'darkturquoise': '#00ced1',
    'darkviolet': '#9400d3',
    'deeppink': '#ff1493',
    'deepskyblue': '#00bfff',
    'dimgray': '#696969',
    'dodgerblue': '#1e90ff',
    'firebrick': '#b22222',
    'floralwhite': '#fffaf0',
    'forestgreen': '#228b22',
    'fuchsia': '#ff00ff',
    'gainsboro': '#dcdcdc',
    'ghostwhite': '#f8f8ff',
    'gold': '#ffd700',
    'goldenrod': '#daa520',
    'gray': '#808080',
    'green': '#008000',
    'greenyellow': '#adff2f',
    'honeydew': '#f0fff0',
    'hotpink': '#ff69b4',
    'indianred ': '#cd5c5c',
    'indigo': '#4b0082',
    'ivory': '#fffff0',
    'khaki': '#f0e68c',
    'lavender': '#e6e6fa',
    'lavenderblush': '#fff0f5',
    'lawngreen': '#7cfc00',
    'lemonchiffon': '#fffacd',
    'lightblue': '#add8e6',
    'lightcoral': '#f08080',
    'lightcyan': '#e0ffff',
    'lightgoldenrodyellow': '#fafad2',
    'lightgrey': '#d3d3d3',
    'lightgreen': '#90ee90',
    'lightpink': '#ffb6c1',
    'lightsalmon': '#ffa07a',
    'lightseagreen': '#20b2aa',
    'lightskyblue': '#87cefa',
    'lightslategray': '#778899',
    'lightsteelblue': '#b0c4de',
    'lightyellow': '#ffffe0',
    'lime': '#00ff00',
    'limegreen': '#32cd32',
    'linen': '#faf0e6',
    'magenta': '#ff00ff',
    'maroon': '#800000',
    'mediumaquamarine': '#66cdaa',
    'mediumblue': '#0000cd',
    'mediumorchid': '#ba55d3',
    'mediumpurple': '#9370d8',
    'mediumseagreen': '#3cb371',
    'mediumslateblue': '#7b68ee',
    'mediumspringgreen': '#00fa9a',
    'mediumturquoise': '#48d1cc',
    'mediumvioletred': '#c71585',
    'midnightblue': '#191970',
    'mintcream': '#f5fffa',
    'mistyrose': '#ffe4e1',
    'moccasin': '#ffe4b5',
    'navajowhite': '#ffdead',
    'navy': '#000080',
    'oldlace': '#fdf5e6',
    'olive': '#808000',
    'olivedrab': '#6b8e23',
    'orange': '#ffa500',
    'orangered': '#ff4500',
    'orchid': '#da70d6',
    'palegoldenrod': '#eee8aa',
    'palegreen': '#98fb98',
    'paleturquoise': '#afeeee',
    'palevioletred': '#d87093',
    'papayawhip': '#ffefd5',
    'peachpuff': '#ffdab9',
    'peru': '#cd853f',
    'pink': '#ffc0cb',
    'plum': '#dda0dd',
    'powderblue': '#b0e0e6',
    'purple': '#800080',
    'rebeccapurple': '#663399',
    'red': '#ff0000',
    'rosybrown': '#bc8f8f',
    'royalblue': '#4169e1',
    'saddlebrown': '#8b4513',
    'salmon': '#fa8072',
    'sandybrown': '#f4a460',
    'seagreen': '#2e8b57',
    'seashell': '#fff5ee',
    'sienna': '#a0522d',
    'silver': '#c0c0c0',
    'skyblue': '#87ceeb',
    'slateblue': '#6a5acd',
    'slategray': '#708090',
    'snow': '#fffafa',
    'springgreen': '#00ff7f',
    'steelblue': '#4682b4',
    'tan': '#d2b48c',
    'teal': '#008080',
    'thistle': '#d8bfd8',
    'tomato': '#ff6347',
    'turquoise': '#40e0d0',
    'violet': '#ee82ee',
    'wheat': '#f5deb3',
    'white': '#ffffff',
    'whitesmoke': '#f5f5f5',
    'yellow': '#ffff00',
    'yellowgreen': '#9acd32'
};

function getColorFromName (name) {
    if (name in COLOR_MAP) {
        return COLOR_MAP[name];
    } else {
        var css = getCSSColor(name);
        if (css == '') {
            return '#00000000';
        } else if (css.startsWith('rgba')) {
            var obj = css.split(/^rgba\((.*), (.*), (.*), (.*)\)$/g);

            return getColorFromRGBA(Number(obj[1]), Number(obj[2]), Number(obj[3]), Number(obj[4]));
        } else if (css.startsWith('rgb')) {
            var obj = css.split(/^rgb\((.*), (.*), (.*)\)$/g);

            return getColorFromRGBA(Number(obj[1]), Number(obj[2]), Number(obj[3]),  1);
        } else {
            return name;
        }
    }
}

const GOLD_CURVE = (function (base, max, clamp) {
    for (let i = base.length; i < max; i++) {
        base[i] = Math.min(Math.floor((base[i - 1] + Math.floor(base[Math.floor(i / 2)] / 3) + Math.floor(base[Math.floor(i / 3)] / 4)) / 5) * 5, clamp);
    }

    return base;
})([0, 25, 50, 75], 650, 1E9);

function getGoldCurve (value) {
    return GOLD_CURVE[value] == undefined ? 1E9 : GOLD_CURVE[value];
}

function calculateAttributePrice (attribute) {
    var price = 0;
    for (var i = 0; i < 5; i++) {
        var num = Math.floor(1 + (attribute + i) / 5);
        price = num >= 800 ? 5E9 : (price + getGoldCurve(num));
    }

    price = 5 * Math.floor(Math.floor(price / 5) / 5) / 100;
    return price < 10 ? price : Math.min(1E7, Math.floor(price));
}

const TOTAL_GOLD_CURVE = [];
function calculateTotalAttributePrice (attribute) {
    var price = 0;
    if (attribute > 3200) {
        price += 1E7 * (attribute - 3200);
        attribute = 3200;
    }

    if (!TOTAL_GOLD_CURVE.length) {
        for (var i = 0; i < 3200; i++) {
            TOTAL_GOLD_CURVE[i] = (TOTAL_GOLD_CURVE[i - 1] || 0) + calculateAttributePrice(i);
        }
    }

    return price + (TOTAL_GOLD_CURVE[attribute - 1] || 0);
}

function toCSSColor (color) {
    let style = new Option().style;
    style.color = color;
    return style.color;
}

function getCSSColor (color) {
    if (COLOR_MAP.hasOwnProperty(color)) {
        return toCSSColor(COLOR_MAP[color]);
    } else if (/^\#([\da-fA-F]{8}|[\da-fA-F]{6}|[\da-fA-F]{3,4})$/.test(color)) {
        return toCSSColor(color);
    } else if (/^[\\]+?\#([\da-fA-F]{8}|[\da-fA-F]{6}|[\da-fA-F]{3,4})$/.test(color)) {
        return toCSSColor(color.substring(color.lastIndexOf('#')));
    } else if (/^([\da-fA-F]{8}|[\da-fA-F]{6}|[\da-fA-F]{3,4})$/.test(color)) {
        return toCSSColor('#' + color);
    } else if (/^rgba?\(\d{1,3}(, \d{1,3}){2,3}\)$/.test(color)) {
        return getColorFromRGBA(...color.slice(color.indexOf('(') + 1, color.lastIndexOf(')')).split(',').map(n => n.trim()));
    } else {
        return '';
    }
}

function getCSSBackground (color) {
    let c = getCSSColor(color);
    if (c) {
        return c;
    } else if (color != undefined) {
        let style = new Option().style;
        style.background = color;
        return style.background;
    } else {
        return '';
    }
}

function getCSSColorFromBackground (string) {
    var style = new Option().style;
    style.background = string;
    return style['background-color'];
}

function getCSSFont(string) {
    var style = new Option().style;
    style.font = string;
    if (style.font == '') {
        style.font = `${ string } Roboto`;
    }

    return style.font;
}

function formatAsSpacedNumber(n, delim = '&nbsp') {
    n = Math.trunc(n);
    return n.toString().split('').map((char, i, array) => ((array.length - 1 - i) % 3 == 2) && i != 0 ? (delim + char) : char).join('');
}

class ComplexDataType {
    constructor (values) {
        this.values = values || [];
        this.ptr = 0;
        this.bytes = [];
    }

    empty () {
        return this.values.length <= this.ptr;
    }

    atLeast (size) {
        return (this.ptr + size) <= this.values.length;
    }

    long () {
        return this.values[this.ptr++] || 0;
    }

    peek () {
        return this.values[this.ptr] || 0;
    }

    string () {
        return this.values[this.ptr++] || '';
    }

    split () {
        var word = this.long();
        this.bytes = [word % 0x100, (word >> 8) % 0x100, (word >> 16) % 0x100, (word >> 24) % 0x100];
    }

    short () {
        if (!this.bytes.length) {
            this.split();
        }

        return this.bytes.shift() + (this.bytes.shift() << 8);
    }

    byte () {
        if (!this.bytes.length) {
            this.split();
        }

        return this.bytes.shift();
    }

    byteArray (len) {
        const array = [];
        for (let i = 0; i < len; i++) {
            array.push(this.byte());
        }

        return array;
    }

    assert (size) {
        if (this.values.length < size) {
            throw `ComplexDataType Exception: Expected ${ size } values but ${ this.values.length } were supplied!`;
        }
    }

    sub (size) {
        var b = this.values.slice(this.ptr, this.ptr + size);
        this.ptr += size;
        return b;
    }

    clear () {
        this.bytes = [];
    }

    skip (size) {
        this.ptr += size;
        return this;
    }

    back (size) {
        this.ptr -= size;
        return this;
    }
}

function compareItems (a, b) {
    if (typeof(a) == 'string' && typeof(b) == 'string') {
        if (a == '') return 1;
        else if (b == '') return -1;
        else return a.localeCompare(b);
    } else if (a == undefined) {
        return 1;
    } else if (b == undefined) {
        return -1;
    } else {
        return b - a;
    }
}

function getPotionType (type) {
    return type == 16 ? 6 : (type == 0 ? 0 : 1 + (type - 1) % 5);
}

function getObjectAt (obj, path) {
    if (!obj) return undefined;
    var sub = path.split('.');
    for (var i = 0; i < sub.length; i++) {
        obj = obj[sub[i]];
        if (obj == undefined) {
            return undefined;
        }
    }
    return obj;
}

function setObjectAt (obj, path, val) {
    var sub = path.split('.');
    for (var i = 0; i < sub.length; i++) {
        if (i == sub.length - 1) {
            obj[sub[i]] = val;
        } else {
            if (obj[sub[i]] == undefined) {
                obj[sub[i]] = { };
            }

            obj = obj[sub[i]];
        }
    }
}

// Download
function download (e, d) {
    let o = document.createElement("a");
    o.download = e;
    o.href = URL.createObjectURL(d);
    document.body.appendChild(o);

    o.click();
    URL.revokeObjectURL(o.href);

    document.body.removeChild(o);
}

// Download node as image
function downloadScreenshot ($node, filename, onClone) {
    html2canvas($node.get(0), {
        logging: false,
        allowTaint: true,
        useCORS: true,
        onclone: doc => {
            let $table = $(doc).find('table.sftools-table tbody');
            $table.each((index, el) => {
                if ($(el).find('tr.css-entry.border-bottom-thick, tr.css-entry.border-bottom-thin').length && $(el).hasClass('css-entry-opaque')) {
                    $(el).removeClass('css-entry-opaque').addClass('css-entry-opaque-image');
                }
            });

            $('<tr class="border-bottom-thick"></tr>').insertAfter($(doc).find('tr.css-entry.border-bottom-thick'));
            $('<tr class="border-bottom-thin"></tr>').insertAfter($(doc).find('tr.css-entry.border-bottom-thin'));

            if (onClone) {
                onClone(doc);
            }
        }
    }).then((canvas) => {
        canvas.toBlob((blob) => {
            download(filename, blob);
        });
    });
}

// Fast join array to string
function join (a, c, b, m) {
    var r = '';
    for (var i = (b != undefined ? b : 0), l = m == undefined ? a.length : Math.min(a.length, m); i < l; ++i) r += c(a[i], i, a);
    return r;
}

function SHA1 (text) {
    function rotate_left (n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    function cvt_hex (val) {
        var str = '';
        for (var i = 7; i >= 0; i--) {
            str += ((val >>> (i * 4)) & 0x0f).toString(16);
        }

        return str;
    }

    function encodeUTF8 (text) {
        text = text.replace(/\r\n/g, '\n');
        var utf = '';

        for (var n = 0; n < text.length; n++) {
            var c = text.charCodeAt(n);
            if (c < 128) {
                utf += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utf += String.fromCharCode((c >> 6) | 192);
                utf += String.fromCharCode((c & 63) | 128);
            } else {
                utf += String.fromCharCode((c >> 12) | 224);
                utf += String.fromCharCode(((c >> 6) & 63) | 128);
                utf += String.fromCharCode((c & 63) | 128);
            }
        }

        return utf;
    }

    var words = new Array();
    text = encodeUTF8(text);

    for (var i = 0; i < text.length - 3; i += 4) {
        words.push(text.charCodeAt(i) << 24 | text.charCodeAt(i + 1) << 16 | text.charCodeAt(i + 2) << 8 | text.charCodeAt(i + 3));
    }

    var padding = text.length % 4;
    if (padding == 0) {
        words.push(0x080000000);
    } else if (padding == 1) {
        words.push(text.charCodeAt(text.length - 1) << 24 | 0x0800000);
    } else if (padding == 2) {
        words.push(text.charCodeAt(text.length - 2) << 24 | text.charCodeAt(text.length - 1) << 16 | 0x08000);
    } else if (padding == 3) {
        words.push(text.charCodeAt(text.length - 3) << 24 | text.charCodeAt(text.length - 2) << 16 | text.charCodeAt(text.length - 1) << 8 | 0x080);
    }

    while ((words.length % 16) != 14) {
        words.push(0);
    }

    words.push(text.length >>> 29);
    words.push((text.length << 3) & 0x0ffffffff);

    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;

    var W = new Array(80);

    for (var block = 0; block < words.length; block += 16) {
        for (var i = 0; i < 16; i++) {
            W[i] = words[block + i];
        }

        for (var i = 16; i <= 79; i++) {
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }

        var A = H0;
        var B = H1;
        var C = H2;
        var D = H3;
        var E = H4;

        for (var i = 0; i <= 19; i++) {
            var temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (var i = 20; i <= 39; i++) {
            var temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (var i = 40; i <= 59; i++) {
            var temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (var i = 60; i <= 79; i++) {
            var temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    return (cvt_hex(H0) + cvt_hex(H1) /* + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4) */ ).toLowerCase();
}

function randomSHA1 () {
    return SHA1(Math.random().toString()).slice(0, 8);
}
