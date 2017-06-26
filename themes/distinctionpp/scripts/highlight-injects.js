hexo.on('ready', function (post) {
    let ejs = require('ejs');
    this.config.highlight.version = require('highlight.js/package.json').version;

    if (this.config.highlight.url['js']) {
        this.config.highlight.url['js'] = ejs.render(this.config.highlight.url['js'], this.config.highlight);
    }

    if (this.config.highlight.url['style']) {
        this.config.highlight.url['style'] = ejs.render(this.config.highlight.url['style'], this.config.highlight);
    }

    var langs = [];
    if (this.config.highlight.url['lang']) {
        for (const lang of this.config.highlight.langs || []) {
            this.config.highlight['lang'] = lang;
            langs.push(ejs.render(this.config.highlight.url['lang'], this.config.highlight));
        }
    }
    this.config.highlight['lang'] = undefined;
    this.config.highlight['langs'] = langs;
});