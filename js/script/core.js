const ScriptType = {
    Player: 0,
    Group: 1,
    Browse: 2
}

const EditorType = {
    DEFAULT: 0,
    ACTIONS: 1
}

const ARG_MAP = {
    'off': 0,
    'on': 1,
    'thick': 2,
    'thin': 1,
    'static': 2,
    'above or equal': 'ae',
    'below or equal': 'be',
    'equal or above': 'ae',
    'equal or below': 'be',
    'above': 'a',
    'below': 'b',
    'equal': 'e',
    'default': 'd',
    'none': 0,
    'left': 1,
    'right': 2,
    'both': 3,
    'top': 4,
    'bottom': 5
};

const ARG_MAP_SERVER = {
    'off': 0,
    'on': 100
}

const ARG_FORMATTERS = {
    'number': (p, x) => isNaN(x) ? undefined : (Number.isInteger(x) ? x : x.toFixed(2)),
    'fnumber': (p, x) => isNaN(x) ? undefined : formatAsSpacedNumber(x),
    'spaced_number': (p, x) => isNaN(x) ? undefined : formatAsSpacedNumber(x),
    'nnumber': (p, x) => isNaN(x) ? undefined : formatAsNamedNumber(x),
    'exponential_number': (p, x) => isNaN(x) ? undefined : x.toExponential(3),
    'date': (p, x) => isNaN(x) ? '' : _formatDate(x, true, false),
    'bool': (p, x) => x ? intl('general.yes') : intl('general.no'),
    'boolean': (p, x) => x ? intl('general.yes') : intl('general.no'),
    'datetime': (p, x) => isNaN(x) || x <= 0 ? '' : _formatDate(x),
    'time': (p, x) => isNaN(x) ? '' : _formatDate(x, false, true),
    'duration': (p, x) => isNaN(x) ? '' : _formatDurationLegacy(x),
    'default': (p, x) => typeof(x) == 'string' ? x : (isNaN(x) ? undefined : (Number.isInteger(x) ? x : x.toFixed(2)))
}

class CellStyle {
    constructor () {
        this.styles = {};
        this.content = '';
    }

    add (name, value) {
        let style = new Option().style;
        style[name] = value;

        if (style.cssText) {
            this.styles[name] = style.cssText.slice(0, -1) + ' !important';
        }

        this.content = Object.values(this.styles).join(';');
    }

    get cssText () {
        return this.content;
    }
}

class RuleEvaluator {
    constructor () {
        this.rules = [];
    }

    addRule (condition, referenceValue, value) {
        this.rules.push([ condition, referenceValue, value, isNaN(referenceValue) ? referenceValue : null ]);
    }

    get (value, ignoreBase = false) {
        for (let [ condition, referenceValue, output ] of this.rules) {
            if (condition == 'db') {
                if (ignoreBase) {
                    continue;
                } else {
                    return output;
                }
            } else if (condition == 'd') {
                return output;
            } else if (condition == 'e') {
                if (value == referenceValue) {
                    return output;
                }
            } else if (condition == 'a') {
                if (value > referenceValue) {
                    return output;
                }
            } else if (condition == 'b') {
                if (value < referenceValue) {
                    return output;
                }
            } else if (condition == 'ae') {
                if (value >= referenceValue) {
                    return output;
                }
            } else if (condition == 'be') {
                if (value <= referenceValue) {
                    return output;
                }
            }
        }

        return undefined;
    }
}

const FilterTypes = {
    'Guild': ScriptType.Group,
    'Player': ScriptType.Player,
    'Players': ScriptType.Browse
};

const Highlighter = new (class {
    constructor () {
        for (const type of ['keyword', 'constant', 'function', 'value', 'identifier', 'error', 'comment', 'string', 'enum']) {
            this[type] = function (text) {
                if (text) {
                    this._text += `<span class="ta-${type}">${this._escape(text)}</span>`;
                }
                return this;
            }
        }

        this._text = '';
    }

    _escape (string) {
        return String(string).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/ /g, "&nbsp;");
    }

    global (text, subtype = '') {
        this._text += `<span class="ta-global${subtype}">${this._escape(text)}</span>`;
        return this;
    }

    header (text, subtype = '') {
        this._text += `<span class="ta-reserved${subtype}">${this._escape(text)}</span>`;
        return this;
    }

    asMacro () {
        this._text = `<span class="ta-macro">${this._text}</span>`;
        return this;
    }

    expression (text, root, extras) {
        Expression.format(this, text, root, extras);
        return this;
    }

    join (array, method, delimiter = ',') {
        for (let i = 0; i < array.length; i++) {
            if (typeof method === 'function') {
                this[method(array[i])](array[i]);
            } else {
                this[method](array[i]);
            }

            if (i < array.length - 1) {
                this._text += delimiter;
            }
        }

        return this;
    }

    color (text, color) {
        this._text += `<span class="ta-color" style="color: ${color};">${this._escape(text)}</span>`;
        return this;
    }

    boolean (text, isTrue) {
        this._text += `<span class="ta-${isTrue ? 'true' : 'false'}">${this._escape(text)}</span>`;
        return this;
    }

    normal (text) {
        this._text += this._escape(text);
        return this;
    }

    space (size = 1) {
        this._text += ' '.repeat(size);
        return this;
    }

    get text () {
        const text = this._text;
        this._text = '';
        return text;
    }
})();

class Command {
    constructor (regexp, parse, format) {
        this.regexp = regexp;
        this.internalParse = parse;
        this.internalFormat = format;

        this.canParseAlways = false;
        this.canParse = true;
        this.canCopy = false;
        this.type = 0;
    }

    isValid (string) {
        return this.regexp.test(string);
    }

    parse (root, string) {
        return this.internalParse(root, ... string.match(this.regexp).slice(1));
    }

    parseAsMacro (string) {
        return string.match(this.regexp).slice(1);
    }

    format (root, string) {
        return this.internalFormat(root, ... string.match(this.regexp).slice(1));
    }

    parseAlways () {
        this.canParseAlways = true;
        return this;
    }

    parseNever () {
        this.canParse = false;
        return this;
    }

    copyable () {
        this.canCopy = true;
        return this;
    }

    specialType (type) {
        this.type = type;
        return this;
    }

    anyType () {
        this.type = true;
        return this;
    }
}

const SettingsCommands = [
    /*
        If not
    */
    new Command(
        /^if not (.+)$/,
        null,
        (root, arg) => Highlighter.keyword('if not ').value(arg).asMacro()
    ).parseNever(),
    /*
        If
    */
    new Command(
        /^if (.+)$/,
        null,
        (root, arg) => Highlighter.keyword('if ').value(arg).asMacro()
    ).parseNever(),
    /*
        Else if
    */
    new Command(
        /^else if (.+)$/,
        null,
        (root, arg) => Highlighter.keyword('else if ').value(arg).asMacro()
    ).parseNever(),
    /*
        Else
    */
    new Command(
        /^else$/,
        null,
        (root) => Highlighter.keyword('else').asMacro()
    ).parseNever(),
    /*
        Loop
    */
    new Command(
        /^loop (\w+(?:\s*\,\s*\w+)*) for (.+)$/,
        null,
        (root, name, array) => Highlighter.keyword('loop ').value(name).keyword(' for ').expression(array, root).asMacro()
    ).parseNever(),
    /*
        End loop or condition
    */
    new Command(
        /^end$/,
        null,
        (root) => Highlighter.keyword('end').asMacro()
    ).parseNever(),
    /*
        Macro-compatible function
    */
    new Command(
        /^mset (\w+[\w ]*) with (\w+[\w ]*(?:,\s*\w+[\w ]*)*) as (.+)$/,
        (root, name, args, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addFunction(name, ast, args.split(',').map(v => v.trim()));
            }
        },
        (root, name, args, expression) => Highlighter.keyword('mset ').function(name).keyword(' with ').join(args.split(','), 'value').keyword(' as ').expression(expression, root).asMacro()
    ).parseAlways(),
    /*
        Macro-compatible variable
    */
    new Command(
        /^mset (\w+[\w ]*) as (.+)$/,
        (root, name, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addVariable(name, ast, false);
            }
        },
        (root, name, expression) => Highlighter.keyword('mset ').constant(name).keyword(' as ').expression(expression, root).asMacro()
    ).parseAlways(),
    /*
        Constant
    */
    new Command(
        /^const (\w+) (.+)$/,
        (root, name, value) => root.addConstant(name, value),
        (root, name, value) => Highlighter.keyword('const ').constant(name).space(1).value(value)
    ).parseAlways(),
    /*
        Constant Expression
    */
    new Command(
        /^constexpr (\w+) (.+)$/,
        (root, name, expression) => {
            let ast = new Expression(expression);
            if (ast.isValid()) {
                root.addConstant(name, new ExpressionScope(root).eval(ast));
            }
        },
        (root, name, expression) => Highlighter.keyword('constexpr ').constant(name).space().expression(expression, root)
    ).parseAlways(),
    /*
        Server column
    */
    new Command(
        /^server ((@?)(\S+))$/,
        (root, value, a, b) => {
            let val = root.constants.getValue(a, b);
            if (val != undefined) {
                if (isNaN(val)) {
                    val = ARG_MAP_SERVER[val];
                }

                if (!isNaN(val)) {
                    root.addGlobal('server', Number(val));
                }
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('server ');

            let val = root.constants.getValue(a, b);
            if (ARG_MAP_SERVER.hasOwnProperty(value)) {
                return acc.boolean(value, value === 'on');
            } else if (root.constants.isValid(a, b) && !isNaN(val)) {
                return acc.constant(value);
            } else if (a == '@' || isNaN(val)) {
                return acc.error(value);
            } else {
                return acc.value(value);
            }
        }
    ),
    /*
        Name column
    */
    new Command(
        /^name ((@?)(\S+))$/,
        (root, value, a, b) => {
            let val = root.constants.getValue(a, b);
            if (val != undefined && !isNaN(val)) {
                root.addGlobal('name', Number(val));
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('name ');

            let val = root.constants.getValue(a, b);
            if (root.constants.isValid(a, b) && !isNaN(val)) {
                return acc.constant(value);
            } else if (a == '@' || isNaN(val)) {
                return acc.error(value);
            } else {
                return acc.value(value);
            }
        }
    ),
    /*
        Column width
    */
    new Command(
        /^width ((@?)(\S+))$/,
        (root, value, a, b) => {
            let val = root.constants.getValue(a, b);
            if (val != undefined && !isNaN(val)) {
                root.addShared('width', Number(val));
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('width ');

            let val = root.constants.getValue(a, b);
            if (root.constants.isValid(a, b) && !isNaN(val)) {
                return acc.constant(value);
            } else if (a == '@' || isNaN(val)) {
                return acc.error(value);
            } else {
                return acc.value(value);
            }
        }
    ).copyable(),
    /*
        Embed width configuration
    */
    new Command(
        /^columns (@?\w+[\w ]*(?:,\s*@?\w+[\w ]*)*)$/,
        (root, parts) => {
            let values = parts.split(',').map(p => root.constants.get(p.trim())).map(v => isNaN(v) ? 0 : parseInt(v));
            if (values.length > 0) {
                root.addLocal('columns', values);
            }
        },
        (root, parts) => {
            return Highlighter.keyword('columns ').join(
                parts.split(','),
                (part) => {
                    const value = root.constants.get(part.trim());
                    if (isNaN(value)) {
                        return 'error';
                    } else if (part.trim()[0] == '@') {
                        return 'constant';
                    } else {
                        return 'value';
                    }
                }
            )
        }
    ).copyable(),
    /*
        Not defined value
    */
    new Command(
        /^not defined value ((@?)(.+))$/,
        (root, value, a, b) => {
            let val = root.constants.getValue(a, b);
            if (val != undefined) {
                root.addShared('ndef', val);
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('not defined value ');
            
            if (root.constants.isValid(a, b)) {
                return acc.constant(value);
            } else if (a == '@') {
                return acc.error(value);
            } else {
                return acc.value(value);
            }
        }
    ).copyable(),
    /*
        Not defined color
    */
    new Command(
        /^not defined color ((@?)(.+))$/,
        (root, value, a, b) => {
            let val = getCSSColor(root.constants.getValue(a, b));
            if (val != undefined && val) {
                root.addShared('ndefc', val);
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('not defined color ');
            
            let val = getCSSColor(root.constants.getValue(a, b));
            if (root.constants.isValid(a, b) && val) {
                return acc.constant(value);
            } else if (a == '@' || !val) {
                return acc.error(value);
            } else {
                return acc.color(value, val);
            }
        }
    ).copyable(),
    /*
        Value default rule
    */
    new Command(
        /^value default ((@?)(\S+[\S ]*))$/,
        (root, value, a, b) => {
            let val = root.constants.getValue(a, b);
            if (val != undefined) {
                root.addValueRule(ARG_MAP['default'], 0, val);
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('value ').constant('default ');

            if (root.constants.isValid(a, b)) {
                return acc.constant(value);
            } else if (a == '@') {
                return acc.error(value);
            } else {
                return acc.value(value);
            }
        }
    ).copyable(),
    /*
        Value rules
    */
    new Command(
        /^value (equal or above|above or equal|below or equal|equal or below|equal|above|below) ((@?)(.+)) ((@?)(\S+[\S ]*))$/,
        (root, rule, value, a, b, value2, a2, b2) => {
            let ref = root.constants.getValue(a, b);
            let val = root.constants.getValue(a2, b2);

            if (val != undefined && ref != undefined) {
                root.addValueRule(ARG_MAP[rule], ref, val);
            }
        },
        (root, rule, value, a, b, value2, a2, b2) => {
            const acc = Highlighter.keyword('value ').constant(rule).space();

            if (root.constants.isValid(a, b)) {
                acc.constant(value);
            } else if (a == '@') {
                acc.error(value);
            } else {
                acc.value(value);
            }

            acc.space();

            if (root.constants.isValid(a2, b2)) {
                acc.constant(value2);
            } else if (a2 == '@') {
                acc.error(value2);
            } else {
                acc.value(value2);
            }

            return acc;
        }
    ).copyable(),
    /*
        Color default rule
    */
    new Command(
        /^color default ((@?)(\S+[\S ]*))$/,
        (root, value, a, b) => {
            let val = getCSSColor(root.constants.getValue(a, b));
            if (val != undefined && val) {
                root.addColorRule(ARG_MAP['default'], 0, val);
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('color ').constant('default ');
            
            let val = getCSSColor(root.constants.getValue(a, b));
            if (root.constants.isValid(a, b) && val) {
                return acc.constant(value);
            } else if (a == '@' || !val) {
                return acc.error(value);
            } else {
                return acc.color(value, val);
            }
        }
    ).copyable(),
    /*
        Color rules
    */
    new Command(
        /^color (equal or above|above or equal|below or equal|equal or below|equal|above|below) ((@?)(.+)) ((@?)(\S+[\S ]*))$/,
        (root, rule, value, a, b, value2, a2, b2) => {
            let ref = root.constants.getValue(a, b);
            let val = getCSSColor(root.constants.getValue(a2, b2));

            if (val != undefined && ref != undefined && val) {
                root.addColorRule(ARG_MAP[rule], ref, val);
            }
        },
        (root, rule, value, a, b, value2, a2, b2) => {
            const acc = Highlighter.keyword('color ').constant(rule).space();
            
            let val = getCSSColor(root.constants.getValue(a2, b2));
            if (root.constants.isValid(a, b)) {
                value = acc.constant(value);
            } else if (a == '@') {
                value = acc.error(value);
            } else {
                value = acc.value(value);
            }

            acc.space();

            if (root.constants.isValid(a2, b2) && val) {
                value2 = acc.constant(value2);
            } else if (a2 == '@' || !val) {
                value2 = acc.error(value2);
            } else {
                value2 = acc.color(value2, val);
            }

            return acc;
        }
    ).copyable(),
    /*
        Alias
    */
    new Command(
        /^alias ((@?)(.+))$/,
        (root, value, a, b) => {
            let val = root.constants.getValue(a, b);
            if (val != undefined) {
                root.addAlias(val);
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('alias ');
            
            if (root.constants.isValid(a, b)) {
                return acc.constant(value);
            } else if (a == '@') {
                return acc.error(value);
            } else {
                return acc.value(value);
            }
        }
    ).copyable(),
    /*
        Statistics format expression
    */
    new Command(
        /^format statistics (.+)$/,
        (root, expression) => {
            if (expression == 'on') {
                root.addFormatStatisticsExpression(true);
            } else if (expression == 'off') {
                root.addFormatStatisticsExpression(false);
            } else if (ARG_FORMATTERS.hasOwnProperty(expression)) {
                root.addFormatStatisticsExpression(ARG_FORMATTERS[expression])
            } else {
                let ast = new Expression(expression, root);
                if (ast.isValid()) {
                    root.addFormatStatisticsExpression(ast);
                }
            }
        },
        (root, expression) => {
            const acc = Highlighter.keyword('format statistics ');
            if (expression === 'on' || expression == 'off') {
                return acc.boolean(expression, expression === 'on');
            } else if (ARG_FORMATTERS.hasOwnProperty(expression)) {
                return acc.constant(expression);
            } else {
                return acc.expression(expression, root);
            }
        }
    ).copyable(),
    /*
        Difference format expression
    */
    new Command(
        /^format difference (.+)$/,
        (root, expression) => {
            if (expression == 'on') {
                root.addFormatDifferenceExpression(true);
            } else if (expression == 'off') {
                root.addFormatDifferenceExpression(false);
            } else if (ARG_FORMATTERS.hasOwnProperty(expression)) {
                root.addFormatDifferenceExpression(ARG_FORMATTERS[expression])
            } else {
                let ast = new Expression(expression, root);
                if (ast.isValid()) {
                    root.addFormatDifferenceExpression(ast);
                }
            }
        },
        (root, expression) => {
            const acc = Highlighter.keyword('format difference ');
            if (expression === 'on' || expression == 'off') {
                return acc.boolean(expression, expression === 'on');
            } else if (ARG_FORMATTERS.hasOwnProperty(expression)) {
                return acc.constant(expression);
            } else {
                return acc.expression(expression, root);
            }
        }
    ).copyable(),
    /*
        Cell background
    */
    new Command(
        /^background ((@?)(.+))$/,
        (root, value, a, b) => {
            let val = getCSSColor(root.constants.getValue(a, b));
            if (val != undefined && val) {
                root.addShared('background', val);
            }
        },
        (root, value, a, b) => {
            const acc = Highlighter.keyword('background ');
            
            let val = getCSSColor(root.constants.getValue(a, b));
            if (root.constants.isValid(a, b) && val) {
                return acc.constant(value);
            } else if (a == '@' || !val) {
                return acc.error(value);
            } else {
                return acc.color(value, val);
            }
        }
    ).copyable(),
    /*
        Format expression
    */
    new Command(
        /^(format|expf) (.+)$/,
        (root, token, expression) => {
            if (ARG_FORMATTERS.hasOwnProperty(expression)) {
                root.addFormatExpression(ARG_FORMATTERS[expression])
            } else {
                let ast = new Expression(expression, root);
                if (ast.isValid()) {
                    root.addFormatExpression(ast);
                }
            }
        },
        (root, token, expression) => {
            const acc = Highlighter.keyword(token).space();
            if (ARG_FORMATTERS.hasOwnProperty(expression)) {
                return acc.constant(expression);
            } else {
                return acc.expression(expression, root);
            }
        }
    ).copyable(),
    /*
        Category
    */
    new Command(
        /^((?:\w+)(?:\,\w+)*:|)category(?: (.+))?$/,
        (root, extensions, name) => {
            root.addCategory(name || '', name == undefined);
            if (extensions) {
                root.addExtension(... extensions.slice(0, -1).split(','));
            }
        },
        (root, extensions, name) => {
            const acc = Highlighter.constant(extensions || '').keyword('category');
            if (name) {
                return acc.space().identifier(name);
            } else {
                return acc;
            }
        }
    ).copyable(),
    /*
        Grouped header
    */
    new Command(
        /^((?:\w+)(?:\,\w+)*:|)header(?: (.+))? as group of (\d+)$/,
        (root, extensions, name, length) => {
            if (length > 0) {
                root.addHeader(name || '', Number(length));
                if (extensions) {
                    root.addExtension(... extensions.slice(0, -1).split(','));
                }
            }
        },
        (root, extensions, name, length) => {
            const acc = Highlighter.constant(extensions || '').keyword('header');
            if (name != undefined) {
                acc.space();

                if (SP_KEYWORD_MAPPING_0.hasOwnProperty(name)) {
                    acc.header(name);
                } else if (SP_KEYWORD_MAPPING_1.hasOwnProperty(name)) {
                    acc.header(name, '-protected');
                } else if (SP_KEYWORD_MAPPING_2.hasOwnProperty(name)) {
                    acc.header(name, '-private');
                } else if (SP_KEYWORD_MAPPING_5_HO.hasOwnProperty(name)) {
                    acc.header(name, '-itemizable');
                } else {
                    acc.identifier(name);
                }
            }
            
            return acc.keyword(' as group of ').value(length);
        }
    ).copyable(),
    /*
        Header
    */
    new Command(
        /^((?:\w+)(?:\,\w+)*:|)header(?: (.+))?$/,
        (root, extensions, name) => {
            root.addHeader(name || '');
            if (extensions) {
                root.addExtension(... extensions.slice(0, -1).split(','));
            }
        },
        (root, extensions, name) => {
            const acc = Highlighter.constant(extensions || '').keyword('header');
            if (name != undefined) {
                acc.space();

                if (SP_KEYWORD_MAPPING_0.hasOwnProperty(name)) {
                    acc.header(name);
                } else if (SP_KEYWORD_MAPPING_1.hasOwnProperty(name)) {
                    acc.header(name, '-protected');
                } else if (SP_KEYWORD_MAPPING_2.hasOwnProperty(name)) {
                    acc.header(name, '-private');
                } else if (SP_KEYWORD_MAPPING_5_HO.hasOwnProperty(name)) {
                    acc.header(name, '-itemizable');
                } else {
                    acc.identifier(name);
                }
            }
            
            return acc;
        }
    ).copyable(),
    /*
        Row
    */
    new Command(
        /^((?:\w+)(?:\,\w+)*:|)show (\S+[\S ]*) as (\S+[\S ]*)$/,
        (root, extensions, name, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addRow(name, ast);
                if (extensions) {
                    root.addExtension(... extensions.slice(0, -1).split(','));
                }
            }
        },
        (root, extensions, name, expression) => Highlighter.constant(extensions || '').keyword('show ').identifier(name).keyword(' as ').expression(expression, root)
    ),
    /*
        Var
    */
    new Command(
        /^var (\w+) (.+)$/,
        (root, name, value) => root.addHeaderVariable(name, value),
        (root, name, value) => Highlighter.keyword('var ').constant(name).space().value(value)
    ).copyable(),
    /*
        Embedded table end
    */
    new Command(
        /^embed end$/,
        (root) => root.pushEmbed(),
        (root) => Highlighter.keyword('embed end')
    ).copyable(),
    /*
        Embedded table
    */
    new Command(
        /^((?:\w+)(?:\,\w+)*:|)embed(?: (.+))?$/,
        (root, extensions, name) => {
            root.embedBlock(name || '');
            if (extensions) {
                root.addExtension(... extensions.slice(0, -1).split(','));
            }
        },
        (root, extensions, name) => {
            const acc = Highlighter.constant(extensions || '').keyword('embed');
            if (name) {
                return acc.space().identifier(name);
            } else {
                return acc;
            }
        }
    ).copyable(),
    /*
        Layout
    */
    new Command(
        /^layout ((\||\_|table|statistics|rows|members)(\s+(\||\_|table|statistics|rows|members))*)$/,
        (root, layout) => root.addLayout(layout.split(/\s+/).map(v => v.trim())),
        (root, layout) => Highlighter.keyword('layout ').constant(layout)
    ),
    /*
        Table variable
    */
    new Command(
        /^set (\w+[\w ]*) with all as (.+)$/,
        (root, name, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addVariable(name, ast, true);
            }
        },
        (root, name, expression) => Highlighter.keyword('set ').global(name).keyword(' with all as ').expression(expression, root),
    ).parseAlways(),
    /*
        New syntax for table variable
    */
    new Command(
        /^set \$(\w+[\w ]*) as (.+)$/,
        (root, name, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addVariable(name, ast, true);
            }
        },
        (root, name, expression) => Highlighter.keyword('set ').global(`$${name}`).keyword(' as ').expression(expression, root)
    ).parseAlways(),
    /*
        New syntax for unfiltered table variable
    */
    new Command(
        /^set \$\$(\w+[\w ]*) as (.+)$/,
        (root, name, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addVariable(name, ast, 'unfiltered');
            }
        },
        (root, name, expression) => Highlighter.keyword('set ').global(`$$${name}`, '-unfiltered').keyword(' as ').expression(expression, root)
    ).parseAlways(),
    /*
        Function
    */
    new Command(
        /^set (\w+[\w ]*) with (\w+[\w ]*(?:,\s*\w+[\w ]*)*) as (.+)$/,
        (root, name, args, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addFunction(name, ast, args.split(',').map(v => v.trim()));
            }
        },
        (root, name, args, expression) => Highlighter.keyword('set ').function(name).keyword(' with ').join(args.split(','), 'value').keyword(' as ').expression(expression, root)
    ).parseAlways(),
    /*
        Variable
    */
    new Command(
        /^set (\w+[\w ]*) as (.+)$/,
        (root, name, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addVariable(name, ast, false);
            }
        },
        (root, name, expression) => Highlighter.keyword('set ').constant(name).keyword(' as ').expression(expression, root)
    ).parseAlways(),
    /*
        Lined
    */
    new Command(
        /^lined$/,
        (root, value) => root.addGlobal('lined', 1),
        (root, value) => Highlighter.keyword('lined')
    ),
    new Command(
        /^lined (on|off|thin|thick)$/,
        (root, value) => root.addGlobal('lined', ARG_MAP[value]),
        (root, value) => Highlighter.keyword('lined ').boolean(value, value !== 'off')
    ),
    /*
        Theme
    */
    new Command(
        /^theme (light|dark)$/,
        (root, value) => root.addGlobal('theme', value),
        (root, value) => Highlighter.keyword('theme ').boolean(value, true)
    ),
    new Command(
        /^theme text:(\S+) background:(\S+)$/,
        (root, textColor, backgroundColor) => {
            root.addGlobal('theme', {
                text: getCSSColor(textColor),
                background: getCSSBackground(backgroundColor)
            });
        },
        (root, textColor, backgroundColor) => Highlighter.keyword('theme ').constant('text:').color(textColor, getCSSColor(textColor)).constant(' background:').color(backgroundColor, getCSSColor(backgroundColor))
    ),
    /*
        Performance (entry cutoff)
    */
    new Command(
        /^performance (\d+)$/,
        (root, value) => {
            if (value > 0) {
                root.addGlobal('performance', Number(value));
            }
        },
        (root, value) => Highlighter.keyword('performance ')[value > 0 ? 'value' : 'error'](value)
    ),
    /*
        Scale
    */
    new Command(
        /^scale (\d+)$/,
        (root, value) => {
            if (value > 0) {
                root.addGlobal('scale', Number(value));
            }
        },
        (root, value) => Highlighter.keyword('scale ')[value > 0 ? 'value' : 'error'](value)
    ),
    /*
        Row height
    */
    new Command(
        /^row height (\d+)$/,
        (root, value) => {
            if (value > 0) {
                root.addGlobalEmbedable('row_height', Number(value));
            }
        },
        (root, value) => Highlighter.keyword('row height ')[value > 0 ? 'value' : 'error'](value)
    ),
    /*
        Font
    */
    new Command(
        /^font (.+)$/,
        (root, font) => {
            let value = getCSSFont(font);
            if (value) {
                root.addGlobalEmbedable('font', value);
            }
        },
        (root, font) => Highlighter.keyword('font ')[getCSSFont(font) ? 'value' : 'error'](font)
    ),
    /*
        Shared options
    */
    new Command(
        /^(difference|hydra|flip|brackets|statistics|maximum|grail|decimal) (on|off)$/,
        (root, key, value) => root.addShared(key, ARG_MAP[value]),
        (root, key, value) => Highlighter.keyword(key).space().boolean(value, value == 'on')
    ).copyable(),
    /*
        Clean
    */
    new Command(
        /^clean$/,
        (root) => root.addLocal('clean', 1),
        (root) => Highlighter.keyword('clean')
    ).copyable(),
    new Command(
        /^clean hard$/,
        (root) => root.addLocal('clean', 2),
        (root) => Highlighter.keyword('clean ').constant('hard')
    ).copyable(),
    /*
        Action
    */
    new Command(
        /^action (none|show)$/,
        (root, value) => root.addAction(value),
        (root, value) => Highlighter.keyword('action ').constant(value)
    ).copyable(),
    /*
        Indexing
    */
    new Command(
        /^indexed$/,
        (root, value) => root.addGlobal('indexed', 1),
        (root, value) => Highlighter.keyword('indexed')
    ),
    new Command(
        /^indexed (on|off|static)$/,
        (root, value) => root.addGlobal('indexed', ARG_MAP[value]),
        (root, value) => Highlighter.keyword('indexed ').boolean(value, value != 'off')
    ),
    /*
        Global options
    */
    new Command(
        /^(members|outdated|opaque|large rows|align title)$/,
        (root, key) => root.addGlobal(key, true),
        (root, key) => Highlighter.keyword(key)
    ),
    new Command(
        /^(members|outdated|opaque|large rows|align title) (on|off)$/,
        (root, key, value) => root.addGlobal(key, ARG_MAP[value]),
        (root, key, value) => Highlighter.keyword(key).space().boolean(value, value == 'on')
    ),
    /*
        Custom left category
    */
    new Command(
        /^((?:\w+)(?:\,\w+)*:|)left category$/,
        (root, extensions) => {
            root.addGlobal('custom left', true);
            root.addCategory('', true);
            if (extensions) {
                root.addExtension(... extensions.slice(0, -1).split(','));
            }
        },
        (root, extensions) => Highlighter.constant(extensions || '').keyword('left category')
    ),
    /*
        Statistics
    */
    new Command(
        /^statistics (\S+[\S ]*) as (\S+[\S ]*)$/,
        (root, name, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addStatistics(name, ast);
            }
        },
        (root, name, expression) => Highlighter.keyword('statistics ').constant(name).keyword(' as ').expression(expression, root)
    ),
    /*
        Extra expression
    */
    new Command(
        /^extra (.+)$/,
        (root, value) => root.addFormatExtraExpression(a => value),
        (root, value) => Highlighter.keyword('extra ').value(value)
    ).copyable(),
    /*
        Cell style
    */
    new Command(
        /^style ([a-zA-Z\-]+) (.*)$/,
        (root, style, value) => root.addStyle(style, value),
        (root, style, value) => Highlighter.keyword('style ').constant(style).space().value(value)
    ).copyable(),
    /*
        Cell content visibility
        Cell content breaking
        Toggle statistics color
    */
    new Command(
        /^(visible|breakline|statistics color) (on|off)$/,
        (root, type, value) => root.addShared(type.replace(/ /g, '_'), ARG_MAP[value]),
        (root, type, value) => Highlighter.keyword(type).space(1).boolean(value, value == 'on')
    ).copyable(),
    /*
        Cell border
    */
    new Command(
        /^border (none|left|right|both|top|bottom)$/,
        (root, value) => root.addShared('border', ARG_MAP[value]),
        (root, value) => Highlighter.keyword('border ').constant(value)
    ).copyable(),
    /*
        Order expression
    */
    new Command(
        /^order by (.+)$/,
        (root, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addLocal('order', ast);
            }
        },
        (root, expression) => Highlighter.keyword('order by ').expression(expression, root)
    ).copyable(),
    new Command(
        /^glob order (asc|des)$/,
        (root, value) => root.addGlobOrder(undefined, value == 'asc'),
        (root, value) => Highlighter.keyword('glob order ').constant(value)
    ).copyable(),
    new Command(
        /^glob order (asc|des) (\d+)$/,
        (root, value, index) => root.addGlobOrder(parseInt(index), value == 'asc'),
        (root, value, index) => Highlighter.keyword('glob order ').constant(value).constant(index)
    ).copyable(),
    /*
        Value expression
    */
    new Command(
        /^expr (.+)$/,
        (root, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addLocal('expr', ast);
            }
        },
        (root, expression) => Highlighter.keyword('expr ').expression(expression, root)
    ).copyable(),
    /*
        Alias expression
    */
    new Command(
        /^expa (.+)$/,
        (root, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addAliasExpression((a, b) => new ExpressionScope(a).eval(ast, b));
            }
        },
        (root, expression) => Highlighter.keyword('expa ').expression(expression, root)
    ).copyable(),
    /*
        Cell alignment
    */
    new Command(
        /^align (left|right|center)$/,
        (root, value) => root.addShared('align', value),
        (root, value) => Highlighter.keyword('align ').constant(value)
    ).copyable(),
    new Command(
        /^align (left|right|center) (left|right|center)$/,
        (root, value, value2) => {
            root.addShared('align', value);
            root.addShared('align_title', value2);
        },
        (root, value, value2) => Highlighter.keyword('align ').constant(value).space().constant(value2)
    ).copyable(),
    /*
        Discard expression
    */
    new Command(
        /^discard (.+)$/,
        (root, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addDiscardRule(ast);
            }
        },
        (root, expression) => Highlighter.keyword('discard ').expression(expression, root)
    ),
    /*
        Order all expression
    */
    new Command(
        /^order all by (.+)$/,
        (root, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addDefaultOrder(ast);
            }
        },
        (root, expression) => Highlighter.keyword('order all by ').expression(expression, root)
    ),
    /*
        Color expression
    */
    new Command(
        /^expc (.+)$/,
        (root, expression) => {
            let ast = new Expression(expression, root);
            if (ast.isValid()) {
                root.addColorExpression(ast);
            }
        },
        (root, expression) => Highlighter.keyword('expc ').expression(expression, root)
    ).copyable(),
    new Command(
        /^text (auto|(?:.+))$/,
        (root, value) => {
            if (value === 'auto') {
                root.addTextColorExpression(true);
            } else {
                const ast = new Expression(value, root);
                if (ast.isValid()) {
                    root.addTextColorExpression(ast);
                }
            }
        },
        (root, value) => {
            const acc = Highlighter.keyword('text ');
            if (value === 'auto') {
                return acc.boolean(value, true);
            } else {
                return acc.expression(value, root);
            }
        }
    ).copyable(),
    /*
        Cell padding (left only)
    */
    new Command(
        /^padding (.+)$/,
        (root, value) => root.addLocal('padding', value),
        (root, value) => Highlighter.keyword('padding ').value(value)
    ).copyable(),
    /*
        Define extension
    */
    new Command(
        /^define (\w+)$/,
        (root, name) => root.addDefinition(name),
        (root, name) => Highlighter.keyword('define ').identifier(name),
        true
    ),
    /*
        Apply extension
    */
    new Command(
        /^extend (\w+)$/,
        (root, name) => root.addExtension(name),
        (root, name) => Highlighter.keyword('extend ').constant(name)
    ),
    /*
        Force push current header / row / statistic
    */
    new Command(
        /^push$/,
        (root) => root.push(),
        (root) => Highlighter.keyword('push')
    ).parseAlways(),
    /*
        Tag action
    */
    new Command(
        /^tag (player|file) as (.+) if (.+)$/,
        (root, type, tag, expr) => {
            let ast1 = new Expression(tag);
            let ast2 = new Expression(expr);
            if (ast1.isValid() && ast2.isValid()) {
                root.addActionEntry('tag', type, ast1, ast2);
            }
        },
        (root, type, tag, expr) => Highlighter.keyword('tag ').constant(type).keyword(' as ').expression(tag, undefined, ACTION_PROPS).keyword(' if ').expression(expr, undefined, ACTION_PROPS)
    ).specialType(EditorType.ACTIONS),
    new Command(
        /^remove player if (.+)$/,
        (root, expr) => {
            let ast1 = new Expression(expr);
            if (ast1.isValid()) {
                root.addActionEntry('remove', 'player', ast1);
            }
        },
        (root, expr) => Highlighter.keyword('remove ').constant('player').keyword(' if ').expression(expr, undefined, ACTION_PROPS)
    ).specialType(EditorType.ACTIONS),
    /*
        Tracker
    */
    new Command(
        /^(track (\w+(?:[ \w]*\w)?) as (.+) when (.+))$/,
        (root, str, name, arg, arg2) => {
            let ast = new Expression(arg);
            let ast2 = new Expression(arg2);
            if (ast.isValid() && ast2.isValid()) {
                root.addTracker(name, str, ast2, ast);
            }
        },
        (root, str, name, arg, arg2) => Highlighter.keyword('track ').constant(name).keyword(' as ').expression(arg).keyword(' when ').expression(arg2)
    ).anyType(),
    new Command(
        /^(track (\w+(?:[ \w]*\w)?) when (.+))$/,
        (root, str, name, arg) => {
            let ast = new Expression(arg);
            if (ast.isValid()) {
                root.addTracker(name, str, ast);
            }
        },
        (root, str, name, arg) => Highlighter.keyword('track ').constant(name).keyword(' when ').expression(arg)
    ).anyType()
];

SettingsCommands.MACRO_IFNOT = SettingsCommands[0];
SettingsCommands.MACRO_IF = SettingsCommands[1];
SettingsCommands.MACRO_ELSEIF = SettingsCommands[2];
SettingsCommands.MACRO_ELSE = SettingsCommands[3];
SettingsCommands.MACRO_LOOP = SettingsCommands[4];
SettingsCommands.MACRO_END = SettingsCommands[5];
SettingsCommands.MACRO_FUNCTION = SettingsCommands[6];
SettingsCommands.MACRO_VARIABLE = SettingsCommands[7];
SettingsCommands.MACRO_CONST = SettingsCommands[8];
SettingsCommands.MACRO_CONSTEXPR = SettingsCommands[9];

class Settings {
    // Contructor
    constructor (string, type, scriptType = 0) {
        this.code = string;
        this.type = type;
        this.env_id = randomSHA1();

        // Constants
        this.constants = new Constants();

        // Discard rules
        this.discardRules = [];

        // Variables and functions
        this.functions = {};
        this.variables = {};
        this.variablesReference = {};

        this.trackers = {};

        // Lists
        this.lists = [];
        this.row_indexes = {};

        // Table
        this.categories = [];
        this.customStatistics = [];
        this.customRows = [];

        // Other things
        this.customDefinitions = {};
        this.actions = [];

        // Settings
        this.globals = {};

        // Shared globals
        this.shared = {
            statistics_color: true,
            visible: true
        };

        // Shared category
        this.sharedCategory = null;

        // Temporary objects
        this.category = null;
        this.header = null;
        this.definition = null;
        this.row = null;
        this.embed = null;

        // Parse settings
        for (let line of Settings.handleMacros(string, type)) {
            let command = SettingsCommands.find(command => command.isValid(line));
            if (command && command.canParse && (command.type === true || command.type == scriptType)) {
                command.parse(this, line);
            }
        }

        // Push last embed && category
        this.pushEmbed();
        this.pushCategory();
    }

    static handleConditionals (lines, type, scope) {
        let output = [];

        let condition = false;
        let shouldDiscard = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (SettingsCommands.MACRO_IF.isValid(line)) {
                let rule = null;
                let ruleMustBeTrue = false;

                if (SettingsCommands.MACRO_IFNOT.isValid(line)) {
                    rule = SettingsCommands.MACRO_IFNOT;
                    ruleMustBeTrue = true;
                } else {
                    rule = SettingsCommands.MACRO_IF;
                }

                let cond = rule.parseAsMacro(line)[0].trim();
                if (cond in FilterTypes) {
                    shouldDiscard = ruleMustBeTrue ? (FilterTypes[cond] == type) : (FilterTypes[cond] != type);
                    condition = true;
                } else {
                    let condExpression = new Expression(cond);
                    if (condExpression.isValid()) {
                        let result = scope.eval(condExpression);
                        shouldDiscard = ruleMustBeTrue ? result : !result;
                        condition = true;
                    }
                }
            } else if (SettingsCommands.MACRO_ELSEIF.isValid(line)) {
                if (condition) {
                    if (shouldDiscard) {
                        let cond = SettingsCommands.MACRO_ELSEIF.parseAsMacro(line)[0].trim();
                        if (cond in FilterTypes) {
                            shouldDiscard = FilterTypes[cond] != type;
                        } else {
                            let condExpression = new Expression(cond);
                            if (condExpression.isValid()) {
                                let result = scope.eval(condExpression);
                                shouldDiscard = !result;
                            }
                        }
                    } else {
                        shouldDiscard = true;
                    }
                }
            } else if (SettingsCommands.MACRO_ELSE.isValid(line)) {
                if (condition) {
                    shouldDiscard = !shouldDiscard;
                }
            } else if (SettingsCommands.MACRO_LOOP.isValid(line)) {
                let endsRequired = 1;
                if (!shouldDiscard) {
                    output.push(line);
                }

                while (++i < lines.length) {
                    line = lines[i];

                    if (SettingsCommands.MACRO_IF.isValid(line) || SettingsCommands.MACRO_LOOP.isValid(line)) {
                        endsRequired++;
                        if (!shouldDiscard) {
                            output.push(line);
                        }
                    } else if (SettingsCommands.MACRO_END.isValid(line)) {
                        if (!shouldDiscard) {
                            output.push(line);
                        }

                        if (--endsRequired == 0) break;
                    } else if (!shouldDiscard) {
                        output.push(line);
                    }
                }
            } else if (SettingsCommands.MACRO_END.isValid(line)) {
                shouldDiscard = false;
                condition = false;
            } else if (!shouldDiscard) {
                output.push(line);
            }
        }

        return output;
    }

    static handleLoops (lines, scope) {
        let output = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (SettingsCommands.MACRO_LOOP.isValid(line)) {
                let [ names, values ] = SettingsCommands.MACRO_LOOP.parseAsMacro(line);

                let variableNames = names.split(',').map(name => name.trim());
                let variableValues = [];

                let valuesExpression = new Expression(values);
                if (valuesExpression.isValid()) {
                    variableValues = scope.eval(valuesExpression);
                    if (!variableValues) {
                        variableValues = [];
                    } else if (!Array.isArray(variableValues)) {
                        if (typeof variableValues == 'object') {
                            variableValues = Object.values(variableValues);
                        } else {
                            variableValues = [ variableValues ];
                        }
                    }
                }

                let loop = [];

                let endsRequired = 1;
                while (++i < lines.length) {
                    line = lines[i];

                    if (SettingsCommands.MACRO_END.isValid(line)) {
                        if (--endsRequired == 0) break;
                    } else if (SettingsCommands.MACRO_IF.isValid(line) || SettingsCommands.MACRO_LOOP.isValid(line)) {
                        endsRequired++;
                    }

                    loop.push(line);
                }

                if (endsRequired != 0) {
                    output.push(... loop);
                } else {
                    for (let block of variableValues) {
                        if (!Array.isArray(block)) {
                            block = [ block ];
                        }

                        let varArray = variableNames.map((key, index) => `var ${ key } ${ block[index] }`);
                        let replacementArray = variableNames.map((key, index) => {
                            return {
                                regexp: new RegExp(`__${ key }__`, 'g'),
                                value: block[index]
                            }
                        });

                        for (let loopLine of loop) {
                            for (let { regexp, value } of replacementArray) {
                                loopLine = loopLine.replace(regexp, value)
                            }

                            output.push(loopLine);

                            if (/^(?:\w+(?:\,\w+)*:|)(?:header|embed|show|category)(?: .+)?$/.test(loopLine)) {
                                output.push(... varArray);
                            }
                        }
                    }
                }
            } else {
                output.push(line);
            }
        }

        return output;
    }

    static handleMacroVariables (lines, constants) {
        let settings = {
            functions: { },
            variables: { },
            constants: constants,
            lists: { }
        };

        let is_unsafe = 0;
        for (let line of lines) {
            if (SettingsCommands.MACRO_IF.isValid(line) || SettingsCommands.MACRO_LOOP.isValid(line)) {
                is_unsafe++;
            } else if (SettingsCommands.MACRO_END.isValid(line)) {
                if (is_unsafe > 0) {
                    is_unsafe--;
                }
            } else if (is_unsafe == 0) {
                if (SettingsCommands.MACRO_FUNCTION.isValid(line)) {
                    let [name, variables, expression] = SettingsCommands.MACRO_FUNCTION.parseAsMacro(line);
                    let ast = new Expression(expression);
                    if (ast.isValid()) {
                        settings.functions[name] = {
                            ast: ast,
                            args: variables.split(',').map(v => v.trim())
                        };
                    }
                } else if (SettingsCommands.MACRO_VARIABLE.isValid(line)) {
                    let [name, expression] = SettingsCommands.MACRO_VARIABLE.parseAsMacro(line);
                    let ast = new Expression(expression);
                    if (ast.isValid()) {
                        settings.variables[name] = {
                            ast: ast,
                            tableVariable: false
                        };
                    }
                } else if (SettingsCommands.MACRO_CONST.isValid(line)) {
                    let [name, value] = SettingsCommands.MACRO_CONST.parseAsMacro(line);
                    settings.constants.addConstant(name, value);
                } else if (SettingsCommands.MACRO_CONSTEXPR.isValid(line)) {
                    let [name, expression] = SettingsCommands.MACRO_CONSTEXPR.parseAsMacro(line);

                    let ast = new Expression(expression);
                    if (ast.isValid()) {
                        settings.constants.addConstant(name, new ExpressionScope(settings).eval(ast));
                    }
                }
            }
        }

        return settings;
    }

    static handleMacros (string, type) {
        let lines = string.split('\n').map(line => Settings.stripComments(line)[0].trim()).filter(line => line.length);

        // Scope for macros
        let scope = new ExpressionScope().add({
            table: type,
        }).add(SiteOptions.options);

        // Special constants for macros
        let constants = new Constants();
        constants.addConstant('guild', ScriptType.Group);
        constants.addConstant('player', ScriptType.Player);
        constants.addConstant('players', ScriptType.Browse);

        // Generate initial settings
        let settings = Settings.handleMacroVariables(lines, constants);
        while (lines.some(line => SettingsCommands.MACRO_IF.isValid(line) || SettingsCommands.MACRO_LOOP.isValid(line))) {
            lines = Settings.handleConditionals(lines, type, scope.environment(settings));
            settings = Settings.handleMacroVariables(lines, constants);
            lines = Settings.handleLoops(lines, scope.environment(settings));
            settings = Settings.handleMacroVariables(lines, constants);
        }

        return lines;
    }

    // Merge definition to object
    mergeDefinition (obj, name) {
        let definition = this.customDefinitions[name];
        if (definition) {
            // Merge commons
            for (var [ key, value ] of Object.entries(definition)) {
                if (!obj.hasOwnProperty(key)) obj[key] = definition[key];
            }

            // Merge color expression
            if (!obj.color.expr) {
                obj.color.expr = definition.color.expr;
            }

            // Merge color rules
            if (!obj.color.rules.rules.length) {
                obj.color.rules.rules = definition.color.rules.rules;
            }

            // Merge value expression
            if (!obj.value.format) {
                obj.value.format = definition.value.format;
            }

            // Merge difference format expression
            if (!obj.value.format) {
                obj.value.formatDifference = definition.value.formatDifference;
            }

            // Merge statistics format expression
            if (!obj.value.format) {
                obj.value.formatStatistics = definition.value.formatStatistics;
            }

            // Merge value extra
            if (!obj.value.extra) {
                obj.value.extra = definition.value.extra;
            }

            // Merge value rules
            if (!obj.value.rules.rules.length) {
                obj.value.rules.rules = definition.value.rules.rules;
            }

            this.mergeStyles(obj, definition.style);
            this.mergeVariables(obj, definition.vars);
        }
    }

    addTracker (name, str, ast, out) {
        this.trackers[name] = {
            str: str,
            ast: ast,
            out: out,
            hash: ast.rstr + (out ? out.rstr : '0000000000000000')
        };
    }

    addActionEntry (action, type, ...args) {
        this.actions.push({
            action,
            type,
            args
        });
    }

    // Merge mapping to object
    mergeMapping (obj, mapping) {
        // Merge commons
        for (var [ key, value ] of Object.entries(mapping)) {
            if (!obj.hasOwnProperty(key)) obj[key] = mapping[key];
        }

        // Merge value expression
        if (!obj.value.format) {
            obj.value.format = mapping.format;
        }

        // Merge diff value expression
        if (!obj.value.formatDifference) {
            obj.value.formatDifference = mapping.format_diff;
        }

        // Merge value extra
        if (!obj.value.extra) {
            obj.value.extra = mapping.extra;
        }

        this.mergeStyles(obj, mapping.style);
        this.mergeVariables(obj, mapping.vars);
    }

    mergeTextColor (obj, mapping) {
        if (obj.color && typeof obj.color.text === 'undefined') {
            obj.color.text = mapping.text;
            obj.color.background = mapping.ndefc;
        }
    }

    merge (obj, mapping) {
        // Merge all non-objects
        for (var [ key, value ] of Object.entries(mapping)) {
            if (!obj.hasOwnProperty(key) && typeof value != 'object') obj[key] = mapping[key];
        }

        this.mergeStyles(obj, mapping.style);
        this.mergeVariables(obj, mapping.vars);
        this.mergeTextColor(obj, mapping);
    }

    mergeStyles (obj, sourceStyle) {
        if (sourceStyle) {
            if (obj.style) {
                // Rewrite styles
                for (let [ name, value ] of Object.entries(sourceStyle.styles)) {
                    if (!obj.style.styles.hasOwnProperty(name)) {
                        obj.style.add(name, value);
                    }
                }
            } else {
                // Add whole style class
                obj.style = sourceStyle;
            }
        }
    }

    mergeVariables (obj, sourceVars) {
        if (sourceVars) {
            if (obj.vars) {
                // Add vars
                for (let [ name, value ] of Object.entries(sourceVars)) {
                    if (!obj.vars.hasOwnProperty(name)) {
                        obj.vars[name] = value;
                    }
                }
            } else {
                // Add whole list
                obj.vars = sourceVars;
            }
        }
    }

    // Push all settings
    push () {
        let obj = null;

        // Push definition
        obj = this.definition;
        if (obj) {
            this.customDefinitions[obj.name] = obj;
            this.definition = null;
        }

        // Push row
        obj = this.row;
        if (obj) {
            // Merge definitions
            for (let definitionName of obj.extensions || []) {
                this.mergeDefinition(obj, definitionName);
            }

            // Merge shared
            this.merge(obj, this.shared);

            if (obj.background) {
                obj.color.rules.addRule('db', 0, obj.background);
            }

            this.mergeTextColor(obj, obj);

            // Push
            this.customRows.push(obj);
            this.row = null;
        }

        // Push header
        obj = this.header;
        if (obj && (this.embed || this.category)) {
            let name = obj.name;

            // Get mapping if exists
            let mapping = SP_KEYWORD_MAPPING_0[name] || SP_KEYWORD_MAPPING_1[name] || SP_KEYWORD_MAPPING_2[name] || SP_KEYWORD_MAPPING_5_HO[name];

            // Merge definitions
            for (let definitionName of obj.extensions || []) {
                this.mergeDefinition(obj, definitionName);
            }

            // Add specials
            let custom = SP_SPECIAL_CONDITIONS[name];
            if (custom && obj.clean != 2) {
                for (let entry of custom) {
                    if (entry.condition(obj)) {
                        entry.apply(obj);
                    }
                }
            }

            // Add mapping or expression
            if (mapping && !obj.expr) {
                if (obj.clean == 2) {
                    obj.expr = mapping.expr;
                } else {
                    this.mergeMapping(obj, mapping);
                }
            }

            this.mergeTextColor(obj, obj);

            // Push header if possible
            if (obj.expr) {
                if (!obj.clean) {
                    if (this.category) {
                        this.merge(obj, this.sharedCategory);
                    }

                    this.merge(obj, this.shared);
                } else {
                    this.merge(obj, {
                        visible: true,
                        statistics_color: true
                    });
                }

                if (obj.background) {
                    obj.color.rules.addRule('db', 0, obj.background);
                }

                // Push
                (this.embed || this.category).headers.push(obj);
            }

            this.header = null;
        }
    }

    // Push category
    pushCategory () {
        this.push();

        // Push category
        let obj = this.category;
        if (obj) {
            this.merge(obj, this.sharedCategory);

            this.categories.push(obj);
            this.category = null;
        }
    }

    // Create color block
    getColorBlock () {
        return {
            expr: undefined,
            text: undefined,
            background: undefined,
            rules: new RuleEvaluator(),
            get: function (player, compare, settings, value, extra = undefined, ignoreBase = false, header = undefined, alternateSelf = undefined) {
                // Get color from expression
                const expressionColor = this.expr ? new ExpressionScope(settings).with(player, compare).addSelf(alternateSelf).addSelf(value).add(extra).via(header).eval(this.expr) : undefined;
                // Get color from color block
                const blockColor = this.rules.get(value, ignoreBase || (typeof expressionColor !== 'undefined'));

                // Final background color
                const backgroundColor = (typeof blockColor === 'undefined' ? getCSSBackground(expressionColor) : blockColor) || '';

                // Get color for text
                let textColor = undefined;
                if (this.text === true) {
                    textColor = _invertColor(_parseColor(backgroundColor) || _parseColor(this.background), true);
                } else if (this.text) {
                    textColor = getCSSColor(new ExpressionScope(settings).with(player, compare).addSelf(alternateSelf).addSelf(value).add(extra).via(header).eval(this.text));
                }

                // Return color or empty string
                return {
                    bg: backgroundColor,
                    fg: textColor
                };
            }
        }
    }

    // Create value block
    getValueBlock () {
        return {
            extra: undefined,
            format: undefined,
            breakline: true,
            formatDifference: undefined,
            formatStatistics: undefined,
            rules: new RuleEvaluator(),
            get: function (player, compare, settings, value, extra = undefined, header = undefined, alternateSelf = undefined) {
                // Get value from value block
                let output = this.rules.get(value);

                // Get value from format expression
                if (typeof output == 'undefined') {
                    if (this.format instanceof Expression) {
                        output = new ExpressionScope(settings).with(player, compare).addSelf(alternateSelf).addSelf(value).add(extra).via(header).eval(this.format);
                    } else if (typeof this.format === 'function') {
                        output = this.format(player, value);
                    } else if (typeof this.format === 'string' && ARG_FORMATTERS.hasOwnProperty(this.format)) {
                        output = ARG_FORMATTERS[this.format](player, value);
                    }
                }

                // Get value from value itself
                if (typeof output == 'undefined') {
                    output = value;
                }

                // Add extra
                if (typeof output != 'undefined' && this.extra) {
                    output = `${ output }${ this.extra(player) }`;
                }

                if (typeof output == 'undefined') {
                    output = '';
                }

                // Replace spaces with unbreakable ones
                if (this.breakline == 0) {
                    output = output.replace(/\ /g, '&nbsp;')
                }

                // Return value
                return output;
            },
            getDifference: function (player, compare, settings, value, extra = undefined) {
                let nativeDifference = Number.isInteger(value) ? value : value.toFixed(2);

                if (this.formatDifference === true) {
                    if (this.format instanceof Expression) {
                        return new ExpressionScope(settings).with(player, compare).addSelf(value).add(extra).eval(this.format);
                    } else if (typeof this.format === 'function') {
                        return this.format(player, value);
                    } else if (typeof this.format === 'string' && ARG_FORMATTERS.hasOwnProperty(this.format)) {
                        return ARG_FORMATTERS[this.format](player, value);
                    } else {
                        return nativeDifference;
                    }
                } else if (this.formatDifference instanceof Expression) {
                    return new ExpressionScope(settings).with(player, compare).addSelf(value).add(extra).eval(this.formatDifference);
                } else if (typeof this.formatDifference == 'function') {
                    return this.formatDifference(settings, value);
                } else {
                    return nativeDifference;
                }
            },
            getStatistics: function (settings, value) {
                let nativeFormat = Number.isInteger(value) ? value : value.toFixed(2);

                if (this.formatStatistics === false) {
                    return nativeFormat;
                } else if (this.formatStatistics) {
                    return new ExpressionScope(settings).addSelf(value).eval(this.formatStatistics);
                } else if (this.format instanceof Expression) {
                    return new ExpressionScope(settings).addSelf(value).eval(this.format);
                } else if (typeof this.format == 'function') {
                    return this.format(undefined, value);
                } else if (typeof this.format === 'string' && ARG_FORMATTERS.hasOwnProperty(this.format)) {
                    return ARG_FORMATTERS[this.format](undefined, value);
                } else {
                    return nativeFormat;
                }
            }
        }
    }

    // Create new header
    addHeader (name, grouped = 0) {
        this.push();

        // Header
        this.header = {
            name: name,
            value: this.getValueBlock(),
            color: this.getColorBlock()
        };

        if (grouped) {
            this.header.grouped = grouped;
        }
    }

    // Create new category
    addCategory (name) {
        this.pushCategory();

        // Category
        this.category = {
            name: name,
            empty: name == '',
            headers: []
        };

        // Category shared
        this.sharedCategory = { }
    }

    // Create row
    addRow (name, expression) {
        this.push();

        // Row
        this.row = {
            name: name,
            ast: expression,
            value: this.getValueBlock(),
            color: this.getColorBlock()
        }
    }

    // Create definition
    addDefinition (name) {
        this.push();

        // Definition
        this.definition = {
            name: name,
            value: this.getValueBlock(),
            color: this.getColorBlock()
        }
    }

    // Create statistic
    addStatistics (name, expression) {
        this.customStatistics.push({
            name: name,
            ast: expression
        });
    }

    // Add alias
    addAlias (name) {
        let object = (this.definition || this.header || this.embed);
        if (object) {
            object.alias = name;
        }
    }

    // Add custom style
    addStyle (name, value) {
        let object = (this.row || this.definition || this.header || this.embed || this.sharedCategory || this.shared);
        if (object) {
            if (!object.style) {
                object.style = new CellStyle();
            }

            object.style.add(name, value);
        }
    }

    // Add color expression to the header
    addColorExpression (expression) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.color.expr = expression;
        }
    }

    addTextColorExpression (expression) {
        let object = (this.row || this.definition || this.header || this.embed || this.sharedCategory || this.shared);
        if (object) {
            object.text = expression;
        }
    }

    addAliasExpression (expression) {
        let object = (this.row || this.definition || this.header || this.embed || this.category);
        if (object) {
            object['expa'] = expression;
        }
    }

    addGlobOrder (index, order) {
        let object = (this.header || this.embed);
        if (object) {
            object['glob_order'] = {
                ord: order,
                index: index
            }
        }
    }

    // Add format expression to the header
    addFormatExpression (expression) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.value.format = expression;
        }
    }

    addBreaklineRule (value) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.value.breakline = value;
        }
    }

    // Add format extra expression to the header
    addFormatExtraExpression (expression) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.value.extra = expression;
        }
    }

    addFormatStatisticsExpression (expression) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.value.formatStatistics = expression;
        }
    }

    addFormatDifferenceExpression (expression) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.value.formatDifference = expression;
        }
    }

    // Add color rule to the header
    addColorRule (condition, referenceValue, value) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.color.rules.addRule(condition, referenceValue, value);
        }
    }

    // Add value rule to the header
    addValueRule (condition, referenceValue, value) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object.value.rules.addRule(condition, referenceValue, value);
        }
    }

    // Add new variable
    addVariable (name, expression, isTableVariable = false) {
        this.variables[name] = {
            ast: expression,
            tableVariable: isTableVariable
        }
    }

    // Add new function
    addFunction (name, expression, args) {
        this.functions[name] = {
            ast: expression,
            args: args
        }
    }

    // Add global
    addGlobal (name, value) {
        this.globals[name] = value;
    }

    addGlobalEmbedable (name, value) {
        (this.embed || this.definition || this.globals)[name] = value;
    }

    // Add shared variable
    addShared (name, value) {
        let object = (this.row || this.definition || this.header || this.embed || this.sharedCategory || this.shared);
        if (object) {
            object[name] = value;
        }

        this.addLocal(`ex_${ name }`, value);
    }

    // Add extension
    addExtension (... names) {
        let object = (this.row || this.definition || this.header || this.embed || this.sharedCategory || this.shared);
        if (object) {
            if (!object.extensions) {
                object.extensions = [];
            }

            object.extensions.push(... names);
        }
    }

    // Add constant
    addConstant (name, value) {
        this.constants.addConstant(name, value);
    }

    // Add local variable
    addLocal (name, value) {
        let object = (this.row || this.definition || this.header || this.embed);
        if (object) {
            object[name] = value;
        }
    }

    // Add action
    addAction (value) {
        let object = (this.header || this.embed);
        if (object) {
            object['action'] = value;
        }
    }

    addHeaderVariable (name, value) {
        let object = (this.row || this.definition || this.header || this.embed || this.sharedCategory || this.shared);
        if (object) {
            if (!object.vars) {
                object.vars = {};
            }

            object.vars[name] = value;
        }
    }

    embedBlock (name) {
        this.push();

        this.embed = {
            name,
            embedded: true,
            headers: [],
            value: this.getValueBlock(),
            color: this.getColorBlock()
        }
    }

    pushEmbed () {
        let obj = this.embed;
        if (obj && this.category) {
            this.push();

            for (let definitionName of obj.extensions || []) {
                this.mergeDefinition(obj, definitionName);
            }

            if (!obj.clean) {
                this.merge(obj, this.sharedCategory);
                this.merge(obj, this.shared);
            } else {
                this.merge(obj, {
                    visible: true,
                    statistics_color: true
                });
            }

            if (obj.background) {
                obj.color.rules.addRule('db', 0, obj.background);
            }

            if (this.category) {
                this.category.headers.push(obj);
                this.embed = null;
            }
        }
    }

    addLayout (layout) {
        this.globals.layout = layout;
    }

    // Add discard rule
    addDiscardRule (rule) {
        this.discardRules.push(rule);
    }

    addDefaultOrder (order) {
        this.globals.order_by = order;
    }

    // Get compare environment
    getCompareEnvironment () {
        return {
            functions: this.functions,
            variables: this.variablesReference,
            lists: {},
            array: [],
            array_unfiltered: [],
            // Constants have to be propagated through the environment
            constants: this.constants,
            row_indexes: this.row_indexes,
            timestamp: this.reference,
            reference: this.reference,
            env_id: this.env_id
        }
    }

    // Random getters and stuff
    getIndexStyle () {
        return this.globals.indexed;
    }

    getServerStyle () {
        return this.globals.server == undefined ? 100 : this.globals.server;
    }

    getBackgroundStyle () {
        return this.shared.background;
    }

    getTheme () {
        return this.globals.theme;
    }

    getOutdatedStyle () {
        return this.globals.outdated;
    }

    getLayout (hasStatistics, hasRows, hasMembers) {
        if (typeof this.globals.layout != 'undefined') {
            return this.globals.layout;
        } else {
            if (this.type == ScriptType.Browse) {
                return [
                    ... (hasStatistics ? [ 'statistics', hasRows ? '|' : '_' ] : []),
                    ... (hasRows ? (hasStatistics ? [ 'rows', '_' ] : [ 'rows', '|', '_' ]) : []),
                    'table'
                ];
            } else if (this.type == ScriptType.Group) {
                return [
                    'table',
                    ... (hasStatistics || hasRows || hasMembers ? [ '_' ] : []),
                    ... (hasStatistics ? [ 'statistics' ] : []),
                    ... (hasRows ? [ '|', 'rows' ] : []),
                    ... (hasMembers ? [ '|', 'members' ] : [])
                ];
            } else {
                return [
                    ... (hasRows ? [ 'rows', '|', '_' ] : []),
                    'table'
                ];
            }
        }
    }

    getEntryLimit () {
        return this.globals.performance;
    }

    getOpaqueStyle () {
        return this.globals.opaque ? 'css-entry-opaque' : '';
    }

    getLinedStyle () {
        return this.globals.lined || 0;
    }

    getRowStyle () {
        return this.globals['large rows'] ? 'css-maxi-row' : '';
    }

    getRowHeight () {
        return this.globals['row_height'] || 0;
    }

    getFontStyle () {
        return this.globals.font ? `font: ${ this.globals.font };` : '';
    }

    getTitleAlign () {
        return this.globals['align title'];
    }

    getNameStyle () {
        return Math.max(100, this.globals.name == undefined ? 250 : this.globals.name);
    }

    evalRowIndexes (array, embedded = false) {
        // For every entry
        array.forEach((entry, index) => {
            // Get player from object if embedded
            let player = embedded ? entry.player : entry;

            // Save player index
            this.row_indexes[`${ player.Identifier }_${ player.Timestamp }`] = index;
        });
    }

    evalRules () {
        // For each category
        for (let category of this.categories) {
            // For each header
            for (let header of category.headers) {
                // For each rule block
                for (let rules of [ header.color.rules.rules, header.value.rules.rules ]) {
                    // For each entry
                    for (let i = 0, rule; rule = rules[i]; i++) {
                        let key = rule[3];
                        // Check if key exists
                        if (key && key in this.variables) {
                            // If variable with that name exists then set it
                            if (this.variables[key].value != 'undefined') {
                                // Set value
                                rule[1] = Number(this.variables[key].value);
                            } else {
                                // Remove the rule
                                rules.splice(i--, 1);
                            }
                        }
                    }
                }
            }
        }
    }

    createSegmentedArray (array, mapper) {
        let segmentedArray = array.map((entry, index, arr) => {
            let obj = mapper(entry, index, arr);
            obj.segmented = true;
            return obj;
        });

        segmentedArray.segmented = true;

        return segmentedArray;
    }

    evalHistory (array, unfilteredArray) {
        // Evaluate row indexes
        this.evalRowIndexes(array);

        // Purify array
        array = [ ... array ];

        // Get shared scope
        let scope = this.createSegmentedArray(array, (player, index, arr) => [player, arr[index + 1] || player]);
        let unfilteredScope = this.createSegmentedArray(unfilteredArray, (player, index, arr) => [player, arr[index + 1] || player]);

        this.array = array;
        this.array_unfiltered = unfilteredArray;

        // Iterate over all variables
        for (let [ name, variable ] of Object.entries(this.variables)) {
            // Copy over to reference variables
            this.variablesReference[name] = {
                ast: variable.ast,
                tableVariable: variable.tableVariable
            }

            // Run only if it is a table variable
            if (variable.tableVariable) {
                // Get value
                let value = new ExpressionScope(this).addSelf(variable.tableVariable == 'unfiltered' ? unfilteredScope : scope).eval(variable.ast);

                // Set value if valid
                if (!isNaN(value) || typeof(value) == 'object' || typeof('value') == 'string') {
                    variable.value = value;
                } else {
                    delete variable.value;
                }
            }
        }

        // Evaluate custom rows
        for (let row of this.customRows) {
            let currentValue = new ExpressionScope(this).with(array[0]).addSelf(array).eval(row.ast);

            row.eval = {
                value: currentValue
            }
        }

        // Evaluate array constants
        this.evalRules();
    }

    evalPlayers (array, unfilteredArray) {
        // Evaluate row indexes
        this.evalRowIndexes(array, true);

        // Variables
        let compareEnvironment = this.getCompareEnvironment();
        let sameTimestamp = array.timestamp == array.reference;

        // Set lists
        this.lists = {
            classes: array.reduce((c, { player }) => {
                c[player.Class]++;
                return c;
            }, _arrayToDefaultHash(CONFIG.indexes(), 0))
        }

        this.array = array;
        this.array_unfiltered = unfilteredArray;
        this.timestamp = array.timestamp;
        this.reference = array.reference;

        // Get segmented lists
        let arrayCurrent = this.createSegmentedArray(array, entry => [entry.player, entry.compare]);
        let arrayCompare = this.createSegmentedArray(array, entry => [entry.compare, entry.compare]);
        let unfilteredArrayCurrent = this.createSegmentedArray(unfilteredArray, entry => [entry.player, entry.compare]);
        let unfilteredArrayCompare = this.createSegmentedArray(unfilteredArray, entry => [entry.compare, entry.compare]);

        // Evaluate variables
        for (let [ name, variable ] of Object.entries(this.variables)) {
            // Copy over to reference variables
            this.variablesReference[name] = {
                ast: variable.ast,
                tableVariable: variable.tableVariable
            }

            if (variable.tableVariable) {
                // Calculate values of table variable
                let currentValue = new ExpressionScope(this).addSelf(variable.tableVariable == 'unfiltered' ? unfilteredArrayCurrent : arrayCurrent).eval(variable.ast);
                let compareValue = sameTimestamp ? currentValue : new ExpressionScope(this).addSelf(variable.tableVariable == 'unfiltered' ? unfilteredArrayCompare : arrayCompare).eval(variable.ast);

                // Set values if valid
                if (!isNaN(currentValue) || typeof currentValue == 'object' || typeof currentValue == 'string') {
                    variable.value = currentValue;
                } else {
                    delete variable.value;
                }

                if (!isNaN(compareValue) || typeof compareValue == 'object' || typeof compareValue == 'string') {
                    this.variablesReference[name].value = compareValue;
                } else {
                    delete this.variablesReference[name].value;
                }
            }
        }

        // Evaluate custom rows
        for (let row of this.customRows) {
            let currentValue = new ExpressionScope(this).addSelf(arrayCurrent).eval(row.ast);
            let compareValue = sameTimestamp ? currentValue : new ExpressionScope(compareEnvironment).addSelf(arrayCompare).eval(row.ast);

            row.eval = {
                value: currentValue,
                compare: compareValue
            }
        }

        // Evaluate array constants
        this.evalRules();
    }

    evalGuilds (array, unfilteredArray) {
        // Evaluate row indexes
        this.evalRowIndexes(array, true);

        // Variables
        let compareEnvironment = this.getCompareEnvironment();
        let sameTimestamp = array.timestamp == array.reference;

        // Set lists
        this.lists = {
            joined: SiteOptions.obfuscated ? array.joined.map((p, i) => `joined_${ i + 1 }`) : array.joined,
            kicked: SiteOptions.obfuscated ? array.kicked.map((p, i) => `kicked_${ i + 1 }`) : array.kicked,
            classes: array.reduce((c, { player }) => {
                c[player.Class]++;
                return c;
            }, _arrayToDefaultHash(CONFIG.indexes(), 0))
        }

        this.array = array;
        this.array_unfiltered = unfilteredArray;
        this.timestamp = array.timestamp;
        this.reference = array.reference;

        array = [ ... array ];
        unfilteredArray = [ ... unfilteredArray ];

        // Get segmented lists
        let arrayCurrent = this.createSegmentedArray(array, entry => [entry.player, entry.compare]);
        let arrayCompare = this.createSegmentedArray(array, entry => [entry.compare, entry.compare]);
        let unfilteredArrayCurrent = this.createSegmentedArray(unfilteredArray, entry => [entry.player, entry.compare]);
        let unfilteredArrayCompare = this.createSegmentedArray(unfilteredArray, entry => [entry.compare, entry.compare]);

        // Get own player
        let ownEntry = array.find(entry => entry.player.Own) || array[0];
        let ownPlayer = _dig(ownEntry, 'player');
        let ownCompare = _dig(ownEntry, 'compare');

        // Evaluate variables
        for (let [ name, variable ] of Object.entries(this.variables)) {
            // Copy over to reference variables
            this.variablesReference[name] = {
                ast: variable.ast,
                tableVariable: variable.tableVariable
            }

            if (variable.tableVariable) {
                // Calculate values of table variable
                let currentValue = new ExpressionScope(this).addSelf(variable.tableVariable == 'unfiltered' ? unfilteredArrayCurrent : arrayCurrent).eval(variable.ast);
                let compareValue = sameTimestamp ? currentValue : new ExpressionScope(this).addSelf(variable.tableVariable == 'unfiltered' ? unfilteredArrayCompare : arrayCompare).eval(variable.ast);

                // Set values if valid
                if (!isNaN(currentValue) || typeof currentValue == 'object' || typeof currentValue == 'string') {
                    variable.value = currentValue;
                } else {
                    delete variable.value;
                }

                if (!isNaN(compareValue) || typeof compareValue == 'object' || typeof compareValue == 'string') {
                    this.variablesReference[name].value = compareValue;
                } else {
                    delete this.variablesReference[name].value;
                }
            }
        }

        // Evaluate custom rows
        for (let row of this.customRows) {
            let currentValue = new ExpressionScope(this).with(ownPlayer, ownCompare).addSelf(arrayCurrent).eval(row.ast);
            let compareValue = sameTimestamp ? currentValue : new ExpressionScope(compareEnvironment).with(ownCompare, ownCompare).addSelf(arrayCompare).eval(row.ast);

            row.eval = {
                value: currentValue,
                compare: compareValue
            }
        }

        this.evalRules();
    }

    /*
        Old shit
    */

    static parseConstants(string, type) {
        let settings = new Settings('');

        for (var line of Settings.handleMacros(string)) {
            let trimmed = Settings.stripComments(line)[0].trim();

            for (let command of SettingsCommands) {
                if (command.canParse && command.canParseAlways && (command.type === true || command.type == type) && command.isValid(trimmed)) {
                    command.parse(settings, trimmed);
                    break;
                }
            }
        }

        return settings;
    }

    static checkEscapeTrail (line, index) {
        if (line[index - 1] != '\\') {
            return false;
        } else {
            let escape = true;
            for (let i = index - 2; i >= 0 && line[i] == '\\'; i--) {
                escape = !escape;
            }

            return escape;
        }
    }

    static stripComments (line, escape = true) {
        let comment;
        let commentIndex = -1;

        let ignored = false;
        for (var i = 0; i < line.length; i++) {
            if (line[i] == '\'' || line[i] == '\"' || line[i] == '\`') {
                if (line[i - 1] == '\\' || (ignored && line[i] != ignored)) continue;
                else {
                    ignored = ignored ? false : line[i];
                }
            } else if (!Settings.checkEscapeTrail(line, i) && line[i] == '#' && !ignored) {
                commentIndex = i;
                break;
            }
        }

        if (commentIndex != -1) {
            comment = line.slice(commentIndex);
            line = line.slice(0, commentIndex);

            if (escape) {
                line = line.replaceAll(/\\(\\|#)/g, (_, capture) => {
                    commentIndex -= 1;
                    return capture;
                });
            }
        } else if (escape) {
            line = line.replaceAll(/\\(\\|#)/g, (_, capture) => capture);
        }

        return [ line, comment, commentIndex ];
    }

    // Format code
    static format (string, type = 0) {
        var settings = Settings.parseConstants(string, type);
        var content = '';

        ScriptHighlightCache.setCurrent(settings);

        for (let line of string.split('\n')) {
            if (ScriptHighlightCache.has(line)) {
                content += ScriptHighlightCache.get(line);
            } else {
                let [ commandLine, comment, commentIndex ] = Settings.stripComments(line, false);
                let [ , prefix, trimmed, suffix ] = commandLine.match(/^(\s*)(\S(?:.*\S)?)?(\s*)$/);

                let currentContent = '';
                currentContent += prefix.replace(/ /g, '&nbsp;');

                if (trimmed) {
                    let command = SettingsCommands.find(command => command.isValid(trimmed));
                    if (command && (command.type === true || command.type == type)) {
                        const lineHtml = command.format(settings, trimmed);
                        currentContent += (typeof lineHtml === 'object' ? lineHtml.text : lineHtml);
                    } else {
                        currentContent += Highlighter.error(trimmed).text;
                    }
                }

                currentContent += suffix.replace(/ /g, '&nbsp;');
                if (commentIndex != -1) {
                    currentContent += Highlighter.comment(comment).text;
                }

                ScriptHighlightCache.store(line, currentContent);

                content += currentContent;
            }

            content += '</br>';
        }

        return content;
    }
};

const ScriptHighlightCache = new (class {
    initialize () {
        this.hash = null;
        this.cache = {};
    }

    setCurrent (tempSettings) {
        let newHash = SHA1(JSON.stringify(tempSettings));
        if (newHash != this.hash) {
            this.hash = newHash;
            this.cache = {};
        }
    }

    has (line) {
        return line in this.cache;
    }

    get (line) {
        return this.cache[line];
    }

    store (line, output) {
        this.cache[line] = output;
    }
})();

// Script archive
const ScriptArchive = new (class {
    constructor () {
        this.dataExpiry = 86400000;
        this.data = Store.shared.get('archive', []).filter(({ timestamp }) => timestamp > Date.now() - this.dataExpiry);
        this._persist();
    }

    _persist () {
        Store.shared.set('archive', this.data);
    }

    clear () {
        this.data = [];
        this._persist();
    }

    empty () {
        return this.data.length === 0;
    }

    all () {
        return _sortDesc(this.data, ({ timestamp }) => timestamp);
    }

    get (timestamp) {
        return this.data.find(({ timestamp: _timestamp }) => _timestamp == timestamp).content;
    }

    add (type, name, version, content) {
        this.data.push({
            type,
            name,
            version,
            content,
            timestamp: Date.now(),
            temporary: Store.isTemporary()
        });

        this._persist();
    }
})();

// Settings manager
const ScriptManager = new (class {
    get scripts () {
        if (typeof this._internal === 'undefined') {
            this._internal = Store.get('settings', {});
        }

        return this._internal;
    }

    _persist () {
        Store.set('settings', this.scripts);
    }

    save (name, content, parent) {
        let script = this.scripts[name];
        if (script) {
            ScriptArchive.add('overwrite_script', name, this.scripts[name].version, this.scripts[name].content);
            
            script.content = content;
            script.version = (isNaN(script.version) ? 1 : script.version) + 1;
            script.timestamp = Date.now();
            script.parent = parent;

            ScriptArchive.add('save_script', name, script.version, script.content);
        } else {
            ScriptArchive.add('create_script', name, 1, content);

            script = {
                name: name,
                content: content,
                parent: parent,
                version: 1,
                timestamp: Date.now()
            }
        }

        this.scripts[name] = script;

        this._persist();
    }

    remove (name) {
        if (this.scripts[name]) {
            ScriptArchive.add('remove_script', name, this.scripts[name].version, this.scripts[name].content);

            delete this.scripts[name];
            this._persist();
        }
    }

    exists (name) {
        return name in this.scripts;
    }

    all () {
        return this.scripts;
    }

    list () {
        return Object.values(this.scripts);
    }

    keys () {
        return Object.keys(this.scripts);
    }

    getContent (name, fallback, template) {
        const script = this.scripts[name] || this.scripts[fallback];
        return script ? script.content : template;
    }

    get (name, fallback) {
        return this.scripts[name] || this.scripts[fallback];
    }
})()

// Templates
const TemplateManager = new (class {
    get templates () {
        if (typeof this._internal === 'undefined') {
            this._internal = Store.shared.get('templates', {});
        }

        return this._internal;
    }

    _persist () {
        Store.shared.set('templates', this.templates);
    }

    toggleFavorite (name) {
        this.templates[name].favorite = !this.templates[name].favorite;
        this._persist();
    }

    setOnline (name, key, secret, version) {
        if (this.templates[name]) {
            this.templates[name].online = {
                timestamp: this.templates[name].timestamp,
                key,
                secret,
                version: isNaN(version) ? 1 : version
            };

            this._persist();
        }
    }

    setOffline (name) {
        if (this.templates[name]) {
            this.templates[name].online = false;

            this._persist();
        }
    }

    save (name, content) {
        let template = this.templates[name];
        if (template) {
            ScriptArchive.add('overwrite_template', name, template.version, template.content);

            // Overwrite needed parts
            template.content = content;
            template.version = (isNaN(template.version) ? 1 : template.version) + 1;
            template.timestamp = Date.now();

            ScriptArchive.add('save_template', name, template.version, template.content);
        } else {
            ScriptArchive.add('create_template', name, 1, content);

            // Create new object
            template = {
                name: name,
                content: content,
                version: 1,
                timestamp: Date.now(),
                online: false
            };
        }

        this.templates[name] = template;

        this._persist();
    }

    remove (name) {
        if (this.templates[name]) {
            ScriptArchive.add('remove_template', name, this.templates[name].version, this.templates[name].content);

            delete this.templates[name];
            this._persist();
        }
    }

    exists (name) {
        return name in this.templates;
    }

    all () {
        return this.templates;
    }

    list () {
        return Object.values(this.templates);
    }

    sortedList () {
        return _sortDesc(_sortDesc(this.list(), (template) => template.timestamp), (template) => template.favorite ? 1 : -1);
    }

    get (name) {
        return this.templates[name];
    }

    getContent (name) {
        return this.templates[name] ? this.templates[name].content : '';
    }
})();

class ScriptEditor {
    constructor (parent, editorType, changeCallback) {
        this.parent = parent.get(0);
        
        this.changeCallback = changeCallback;
        this.editorType = editorType;

        this.area = this.parent.querySelector('textarea');
        this.wrapper = this.parent.querySelector('.ta-wrapper');
        this.mask = this.parent.querySelector('.ta-content');

        const baseStyle = getComputedStyle(this.area);
        this.mask.style.top = baseStyle.paddingTop;
        this.mask.style.left = baseStyle.paddingLeft;
        this.mask.style.font = baseStyle.font;
        this.mask.style.fontFamily = baseStyle.fontFamily;
        this.mask.style.lineHeight = baseStyle.lineHeight;

        const maskClone = this.mask.cloneNode(true);

        this.area.addEventListener('input', (event) => {
            let value = event.currentTarget.value;
            if (this.pasted) {
                value = value.replace(/\t/g, ' ');

                const ob = this.area;

                const ob1 = ob.selectionStart;
                const ob2 = ob.selectionEnd;
                const ob3 = ob.selectionDirection;

                ob.value = value;

                ob.selectionStart = ob1;
                ob.selectionEnd = ob2;
                ob.selectionDirection = ob3;

                this.pasted = false;
            }

            const scrollTransform = getComputedStyle(this.mask).transform;

            this.mask.remove();
            this.mask = maskClone.cloneNode(true);
            this.mask.innerHTML = Settings.format(value, this.editorType);
            this.mask.style.transform = scrollTransform;

            this.wrapper.insertAdjacentElement('beforeend', this.mask);

            if (typeof this.changeCallback === 'function') {
                this.changeCallback(value);
            }
        });

        this.area.dispatchEvent(new Event('input'));

        this.area.addEventListener('scroll', (event) => {
            const sy = event.currentTarget.scrollTop;
            const sx = event.currentTarget.scrollLeft;
            this.mask.style.transform = `translate(${ -sx }px, ${ -sy }px)`;
        });

        this.area.addEventListener('keydown', (event) => {
            if (event.key == 'Tab') {
                event.preventDefault();

                let a = this.area;
                let v = this.area.value;
                let s = a.selectionStart;
                let d = a.selectionEnd;

                if (s == d) {
                    this.area.value = v.substring(0, s) + '  ' + v.substring(s);
                    a.selectionStart = s + 2;
                    a.selectionEnd = d + 2;
                } else {
                    let o = 0, oo = 0, i;
                    for (i = d - 1; i > s; i--) {
                        if (v[i] == '\n') {
                            v = v.substring(0, i + 1) + '  ' + v.substring(i + 1);
                            oo++;
                        }
                    }

                    while (i >= 0) {
                        if (v[i] == '\n') {
                            v = v.substring(0, i + 1) + '  ' + v.substring(i + 1);
                            o++;
                            break;
                        } else {
                            i--;
                        }
                    }

                    this.area.value = v;
                    a.selectionStart = s + o * 2;
                    a.selectionEnd = d + (oo + o) * 2;
                }

                this.area.dispatchEvent(new Event('input'));
                this.area.dispatchEvent(new Event('scroll'));
            }
        });

        this.area.addEventListener('paste', () => {
            this.pasted = true;
        });

        this.area.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        this.area.addEventListener('dragenter', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        this.area.addEventListener('drop', (event) => {
            if (_dig(event, 'dataTransfer', 'files', 0, 'type') == 'text/plain') {
                event.preventDefault();
                event.stopPropagation();

                const reader = new FileReader();
                reader.readAsText(event.dataTransfer.files[0], 'UTF-8');
                reader.onload = (file) => {
                    this.content = file.target.result;
                }
            }
        });
    }

    get content () {
        return this.area.value;
    }

    set content (value) {
        this.area.value = value;
        this.area.dispatchEvent(new Event('input'));

        this.scrollTop();
    }

    scrollTop () {
        this.area.scrollTo(0, 0);
        this.area.dispatchEvent(new Event('scroll'));
    }
}
