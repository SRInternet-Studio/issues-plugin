import puppeteer from "puppeteer";
let RepoAddr = "";

// 群聊白名单及对应仓库
const RepoAddrs = {
  1009537078: "ClassIsland/ClassIsland",
  680019081: "Sticky-attention/Sticky-attention",
};

export class Screenshot extends plugin {
  constructor() {
    super({
      name: "截图",
      des: "截图",
      event: "message",
      rule: [
        {
          reg: /^(\/|#|!|！)lissue/,
          fnc: "Screenshot",
        },
      ],
    });
  }

  async Screenshot(e) {
    // Check for group whitelist
    if (!(e.group_id in RepoAddrs)) {
      return;
    }

    RepoAddr = RepoAddrs[e.group_id];

    const browser = await puppeteer.launch({
      args: [
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
      await page.goto(`https://github.com/${RepoAddr}/issues`, {
        waitUntil: "networkidle0",
        timeout: 20000,
      });

      // Here, you can potentially interact with the issue list page (e.g., scrape titles, links)

      await e.reply(`Issue 列表页面已获取`); // Send a success message
    } catch (error) {
      console.error("Error fetching issue list:", error);
      await e.reply(`获取 Issue 列表页面失败`); // Send an error message
    } finally {
      await browser.close();
    }
  }
}