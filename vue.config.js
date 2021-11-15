const webpack = require('webpack')
const WebpackZipPlugin = require('webpack-zip-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path')
const IS_PROD = process.env.NODE_ENV === 'production'
const productionGzipExtensions = ['html', 'js', 'css']

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    devServer: {
        port: 8080,
        contentBase: [
            path.join(__dirname, "public"), //追加本文件所在目录下的public目录
        ],
        proxy: {
            "/static": {
                target: `http://${process.env.VUE_APP_M3_HOST}`,
            },
            "/user": {
                target: `http://${process.env.VUE_APP_M3_HOST}`,
            },
            "/matrix": {
                target: `http://${process.env.VUE_APP_M3_HOST}`,
            },
            "/script": {
                target: `http://${process.env.VUE_APP_M3_HOST}`,
            },
            "/web": {
                target: `http://${process.env.VUE_APP_M3_HOST}`,
            },
            "/config": {
                target: `http://${process.env.VUE_APP_M3_HOST}`,
            },
            "/fs": {
                target: `http://${process.env.VUE_APP_M3_HOST}`,
            },
            "/matrix/files": {
                target: `http://${process.env.VUE_APP_M3_HOST}//matrix/files`,
            },
            "/matrix/system": {
                target: `http://${process.env.VUE_APP_M3_HOST}//matrix/system`,
            },
            "/help":{
                target: `http://${process.env.VUE_APP_M3_HOST}/help`
            }
        }
    },

    outputDir: 'app/matrix/' + process.env.VUE_APP_M3_APP,
    productionSourceMap: false,

    configureWebpack: config => {
        // 生产环境
        if (IS_PROD) {

            return {
                
                plugins: [
                    
                    new CompressionPlugin({
                        test: new RegExp(
                            '\\.(' + productionGzipExtensions.join('|') + ')$'
                        ),
                        threshold:10240,
                        minRatio: 1,
                        deleteOriginalAssets: false
                    }),
                    new WebpackZipPlugin({
                        initialFile: 'app',
                        endPath: './',
                        zipName: process.env.VUE_APP_M3_APP+'.zip',
                        //frontShell: 'sed -i \'\' \'s/src="/src="\\/static\\/app\\/matrix\\/m3event/g\; s/href="/href="\\/static\\/app\\/matrix\\/m3event/g\' ./app/matrix/m3event/index.html',
                        //frontShell: 'sed -i \'\' \'s/src="/src="\\/static\\/app\\/matrix\\/m3event/g\; s/href="/href="\\/static\\/app\\/matrix\\/m3event/g\' ./app/matrix/m3event/index.html',
                        behindShell: './deploy.sh ' + process.env.VUE_APP_M3_HOST + ' ' + process.env.VUE_APP_M3_COMPANY + ' ' + process.env.VUE_APP_M3_USERNAME + ' "' + process.env.VUE_APP_M3_PASSWORD + '" ' + process.env.VUE_APP_M3_APP + ' ' + process.env.VUE_APP_M3_TITLE + ' ' + process.env.VUE_APP_M3_VERSION
                    })
                ]
            }
        }
      },

      chainWebpack(config) {

        
        // ============压缩图片 start============
        config.module
            .rule('images')
            .use('image-webpack-loader')
            .loader('image-webpack-loader')
            .options({ bypassOnDebug: true })
            .end()
        // ============压缩图片 end============

        // set svg-sprite-loader
        config.module
          .rule('svg')
          .exclude.add(resolve('src/icons'))
          .end()
        config.module
          .rule('icons')
          .test(/\.svg$/)
          .include.add(resolve('src/icons'))
          .end()
          .use('svg-sprite-loader')
          .loader('svg-sprite-loader')
          .options({
            symbolId: 'icon-[name]'
          })
          .end()
    },

    publicPath: process.env.NODE_ENV === 'production'?'/static/app/matrix/'+process.env.VUE_APP_M3_APP:''
}