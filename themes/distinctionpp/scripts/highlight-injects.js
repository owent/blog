'use strict';

hexo.on('ready', function () {
    let ejs = require('ejs');

    const default_configure = {
        style: "default",
        langs: [],
        selector: 'pre>code',
        version: '9.12.0',
        url: {
            js: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/<%- version %>/highlight.min.js",
            style: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/<%- version %>/styles/<%- style %>.min.css",
            lang: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/<%- version %>/languages/<%- lang %>.min.js"
        },
        options: { // options of highlight.js see http://highlightjs.readthedocs.io/en/latest/api.html#configure-options
            //tabReplace: '    ',
            //useBR: false,
            //classPrefix: 'hljs-',
            //languages: {} // language alias
        }
    };

    if (!this.config.highlight) {
        this.config.highlight = {};
    }

    if (this.config.highlight.version) {
        default_configure.version = this.config.highlight.version;
    } else {
        default_configure.version = require('highlight.js/package.json').version;
    }

    var urls = Object.assign({}, default_configure.url, this.config.highlight.url || {});
    var options = Object.assign({}, default_configure.options, this.config.highlight.options || {});
    this.config.highlight = Object.assign(default_configure, this.config.highlight, {
        url: urls,
        options: options
    });

    this.config.highlight.url.js = ejs.render(urls.js, this.config.highlight);
    this.config.highlight.url.style = ejs.render(urls.style, this.config.highlight);

    var langs = [];
    for (const lang of this.config.highlight.langs || this.config.highlight.langs || []) {
        this.config.highlight.lang = lang;
        langs.push(ejs.render(urls.lang, this.config.highlight));
    }

    this.config.highlight.lang = undefined;
    this.config.highlight.langs = langs;
    this.config.highlight['options-json'] = JSON.stringify(this.config.highlight.options || {});
});