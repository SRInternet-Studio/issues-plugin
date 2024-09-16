import puppeteer from "puppeteer"
export class Screenshot extends plugin {
    constructor(){
        super({
            name: '截图',
            des: '截图',
            event: 'message',
            rule: [{
                reg: /^(\/|#|!|！)issue/i,
                fnc: 'Screenshot'
            }],
        })
    }

    async Screenshot (e) {
        let match = [...new Set(e.msg.match(/(\d+)/g).map(i => Number(i)))]
        logger.info(match)
        if (!match.length) {
            return e.reply('你好像没有输入内容')
        }
        const browser = await puppeteer.launch({
            args: [
                "--disable-gpu",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--no-zygote"
            ]
        })
        const page = await browser.newPage()
        await page.setViewport({ width: 1280, height: 800 })
        let res = await Promise.all(match.map(async (issue) => {
            const url = `https://github.com/ClassIsland/ClassIsland/issues/${String(issue)}`
            try {
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 })
            } catch (error) {
                if (error.message.includes('timeout')) {
                    await page.goto(url.replace('github.com', 'kkgithub.com'), { waitUntil: 'networkidle0', timeout: 15000 })
                    e.reply(`${String(issue)}直连超时，尝试使用代理获取......`)
                }
            }
            const img = await page.screenshot({ fullPage: true })
            return img
        }))
        await page.close()
        await browser.close()
        await e.reply(res.map(i => segment.image(i)))
    }
}
