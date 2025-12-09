let mix = require('laravel-mix')
let NovaExtension = require('laravel-nova-devtool')

mix.extend('nova', new NovaExtension())

mix
    .setPublicPath('dist')
    .js('resources/js/field.js', 'js')
    .js('resources/js/tool.js', 'js')
    .vue({ version: 3 })
    .postCss('resources/css/boxkit.css', 'css', [
        require('tailwindcss'),
        require('autoprefixer'),
    ])
    .nova('hdrm147/box-kit')
    .version()
