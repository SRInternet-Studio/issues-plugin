import plugin from '../../../lib/plugins/plugin.js';
import { update as Update } from "../../other/update.js"
export class Update extends plugin {
    constructor() {
        super({
            name: '[插件]更新插件',
            dsc: '更新插件',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: /^#*CI(小工具)?(插件)?(强制)?更新$/i,
                    fnc: 'update'
                },
            ]
        })
    }
    async update(e) {
        if (!e.isMaster) return;
        if (e.at && !e.atme) return;
        e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新issues-plugin`;
        const up = new Update(e);
        up.e = e;
        return up.update();
    }
}