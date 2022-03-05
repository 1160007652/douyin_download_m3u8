import ffmpeg from "fluent-ffmpeg";
import got from "got";
import Puppeteer from "puppeteer-core";
import ora from 'ora';
import os from 'os';

function downloadM3u8Tomp4(m3u8File, outputFile) {
    const spinner = ora('Loading').start();
    const ffmpegPath = os.platform() === 'darwin' ? './libs/ffmpeg_mac' : './libs/ffmpeg_win.exe';

    return new Promise((resolve, reject) => {
        if (!m3u8File || !outputFile) {
          reject(new Error("You must specify the input and the output files"));
          return;
        }
  
        ffmpeg(m3u8File)
        .setFfmpegPath(ffmpegPath)
        .on("error", error => {
            reject(new Error(error));
        })
        .on('start', (data) => {
            spinner.text = `开始下载中`;
        })
        .on('progress', (process) => {
            spinner.text = `时长：${process.timemark}`
        })
        .on("end", () => {
            spinner.end();
            resolve();
        })
        .outputOptions("-c copy")
        .outputOptions("-bsf:a aac_adtstoasc")
        .output(outputFile)
        .run();
    });
}

async function urlToMu38Link(url) {

    let m3u8Link = '';
    let result = await got({
        url, 
        headers: {
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36"
        }
    });
    const longLink = result.redirectUrls.pop().href;
    
    const browser = await Puppeteer.launch({
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        headless: true,
        devtools: false,
    });

    const page = await browser.newPage();
    const iPhone = Puppeteer.devices['iPhone 6'];
    await page.emulate(iPhone);
    await page.setDefaultNavigationTimeout(0);
    await page.setJavaScriptEnabled(true);
    await page.setRequestInterception(true);
    await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    );

    page.on('request', async req => {
    if(req.url().includes('m3u8')){
        m3u8Link = req.url();
    }
    await req.continue();
    });

    await page.goto(longLink, { waitUntil: 'networkidle2', timeout: 0 });

    await page.close();
    await browser.close();
    return m3u8Link;
}

async function  main() {

    // 替换此处链接为 抖音直播分享出来的 短链接, 如格式：“https://v.douyin.com/NLSrsDU/”
    const DOU_YIN_SHORT_URL_LINK = 'https://v.douyin.com/NLSrsDU/';

    // 将短链转化出 m3u8 直播链接
    const m3u8Link = await urlToMu38Link(DOU_YIN_SHORT_URL_LINK);

    console.log("短链接：", DOU_YIN_SHORT_URL_LINK);
    console.log("直播链接：", m3u8Link);

    // 将 m3u8 直播流保存为 mp4
    await downloadM3u8Tomp4(m3u8Link, `./download/${Date.now()}.mp4`);

}

main();