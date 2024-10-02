import puppeteer from "puppeteer";
let RepoAddr = ""

// 群聊白名单及对应仓库
const RepoAddrs = {
    1009537078: "ClassIsland/ClassIsland",
    680019081: "Sticky-attention/Sticky-attention"
}

export class Screenshot extends plugin {
    constructor() {
        super({
            name: '截图',
            des: '截图',
            event: 'message',
            rule: [{
                reg: /^(\/|#|!|！)issue/i,
                fnc: 'Screenshot'
            }],
        });
    }

    async Screenshot(e) {
        // console.log(e.group_id);
        // if (e.group_id != "1009537078" && e.group_id != "680019081")
        // {
        //     return;
        // }

        // 检测群聊白名单
        if (e.group_id in RepoAddrs)
        {
            RepoAddr = RepoAddrs[e.group_id];
        }
        else
        {
            return;
        }


        let match = [...new Set(e.msg.match(/\d+/g).map(i => Number(i)))];
        logger.info(match);

        if (!match.length) {
            return e.reply('你好像没有输入内容');
        }

        const browser = await puppeteer.launch({
            args: [
                "--disable-gpu",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--no-zygote"
            ]
        });

        let res = await Promise.all(match.map(async (issue) => {
            await e.reply(`[${issue}] 开始截图`)
            const url = `https://github.com/${RepoAddr}/issues/${String(issue)}`;
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            try {
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
            } catch (error) {
                if (error.message.includes('timeout')) {
                    e.reply(`${String(issue)}直连超时，尝试使用代理获取......`);
                    await page.goto('https://kkgithub.com/' + url, { waitUntil: 'networkidle0', timeout: 15000 });
                }
            }

            const imgBase64 = await page.screenshot({ fullPage: true, encoding: 'base64' });
            await page.close();
            return imgBase64;
        }));

        await browser.close();
        for (let img of res) {
            await e.reply(segment.image(`base64://${img}`));
        }
    }
}
