## 直播流下载工具

此脚本，可以将抖音的m3u8直播流，保存为mp4格式，并下载到本地。

## 使用方法

#### 安装node环境

#### 修改短链接地址

在 "./src/index.js" 的 main 方法中，修改下载短链接，如下代码为修改处
```js
 const DOU_YIN_SHORT_URL_LINK = 'https://v.douyin.com/NLSrsDU/';
```

修改完代码后，执行命令:

安装依赖
> npm install

运行脚本
> npm run start


## 视频目录

下载的视频在，项目根目录/download 