const {defineConfig} = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: 'src/logo/icon.ico' // 这里是你自定义图标的文件路径
        },
        mac: {
          icon: 'src/logo/icon.icns'
        },
        linux: {
          icon: 'src/logo/icon.png'
        }
      }
    }
  }
})
;
