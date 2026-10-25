(() => {
const D = window.DEMO;
const KEY = 'xilixiwai-demo-v1';
const $ = (s, el = document) => el.querySelector(s);

/* ---------------- 状态 ---------------- */
const fresh = () => ({
  theme: 'tide', nameIdx: 0, st: 0, userEvents: [], hiddenEv: {}, evDone: {}, todayDone: {}, home: true, trip: false, body: false, charity: false, fans: false, deals: false, crisis: false, portfolio: false, meals: [], check: {}, reviews: {}, files: {}, archives: [], cycleOn: false, cycle: { lastStart: -24, len: 28, dur: 5 }, sym: {}, inv: {}, selDay: 12, pack: {}, packAdd: {}, tab: {}, ran: {}, folder: [], provider: 'demo',
  rel: 'xia', adopt: null, handling: 'probe', tasks: D.tasks.map(t => ({ ...t })),
  sel: null, tone: 'warm', submitted: {}, scope: 'ad', scopeTried: false, checks: {}, faqQ: '', seen: {}, pick: 'nl'
});
let S;
S = fresh();
const save = () => {};
let freshKey = null, newFolder = null, timers = [];
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; try { if (window.__comicStop) window.__comicStop(); } catch {} };
const later = (fn, ms) => timers.push(setTimeout(fn, ms));

/* 资料夹：每站产出 */
const FOLDER = {
  take:   { st: 0, t: '接戏评估卡', d: '初读梗概 · 戏份 · 匹配度 · 档期' },
  read:   { st: 1, t: '角色分析卡', d: '背景 · 经历 · 性格 · 动机 · 关系 · 弧线', tab: 'card' },
  line:   { st: 1, t: '第12场台词建议稿', d: '原句保留，建议稿待导演确认', opt: true },
  role:   { st: 2, t: '第12场表演方案', d: '情绪节拍 · 目标与动作 · 选定演法' },
  dance:  { st: 2, t: '第21场舞蹈拆解', d: '主题 · 情绪 · 节奏 · 四段动作 · 训练记录' },
  prev:   { st: 3, t: '造型参考与分镜表', d: '三套造型 · 5个镜头' },
  comic:  { st: 3, t: '动态漫剧预演', d: '第12场 · 16秒' },
  shoot:  { st: 4, t: '任务看板与内容日历', d: '纪要拆解 · 一周排期 · 常见问题' },
  promo:  { st: 5, t: '粉丝反馈周报', d: '留言分类 · 回复草稿 · 舆情信号' },
  deal:   { st: 6, t: '授权核对清单', d: '品牌核验 · 五项授权边界 · 待律师审核' },
  review: { st: 7, t: '作品复盘报告', d: '复盘 · 播出口碑 · 表演自评' }
};
const has = k => S.folder.includes(k);
function addFolder(k, msg) {
  if (!has(k)) { S.folder.push(k); newFolder = k; }
  save(); render(true); toast(msg || `已存入资料夹：${FOLDER[k].t}`); nudge();
}
const stationDone = i => Object.entries(FOLDER).some(([k, v]) => v.st === i && has(k)) && Object.entries(FOLDER).filter(([, v]) => v.st === i && !v.opt).every(([k]) => has(k));

/* ---------------- 小工具 ---------------- */
function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}
const tag = (lv, t) => `<span class="tag ${lv}">${t}</span>`;
const demoTag = () => tag('demo', '示例结果 · 演示模式');
const tab = (st, def) => S.tab[st] || def;
const tabs = (st, list) => `<div class="tabs">${list.map(([k, n]) => `<button data-act="tab" data-st="${st}" data-v="${k}" class="${tab(st, list[0][0]) === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;

/* AI 运行：先展示“思考步骤”，再显示结果（结果为预置示例） */
function aiBlock(key, label, hint, result) {
  if (S.ran[key]) return `<div class="${freshKey === key ? 'reveal' : ''}">${result()}</div>`;
  return `<div class="ai-box" data-ai="${key}"><p>${hint}</p><button class="btn pri ai" data-act="run" data-k="${key}">${label.replace(/^AI\s*/, "查看示例 · ")}</button></div>`;
}
const STEPS = {
  airdata:  ['读取 32 集播放与讨论数据', '统计口碑评分与关键词', '对比开播前后的粉丝增长'],
  selfrev:  ['读取你的自评回答', '对照导演反馈与观众口碑', '提炼最值得带走的经验'],
  port:     ['读取 9 部作品的题材、角色与口碑', '结合年龄、气质、体态、声线', '计算题材 × 角色适配度', '生成发展路线'],
  vet:      ['检索导演与主创的公开报道', '查询出品方的诉讼与纠纷记录', '研判题材导向与审查风险', '评估角色形象风险，对照你的作品库'],
  crisis:   ['抓取全网相关讨论 3.6 万条', '识别首发来源与扩散路径', '核对剧方与经纪团队的确认信息', '比较回应方式并起草声明'],
  clause:   ['读取合同草案（共 23 条）', '逐条检查排他、使用期限、AI 条款、违约责任、付款', '对照你现有的合同和代言', '标出风险与修改建议'],
  offer0:   ['查询工商与经营状态', '检索司法诉讼与产品抽检', '扫描舆情与过往代言人', '对照形象、粉丝、排他与档期打分'],
  offer1:   ['查询工商与经营状态', '检索司法诉讼与产品抽检', '扫描舆情与过往代言人', '对照形象、粉丝、排他与档期打分'],
  offer2:   ['查询工商与经营状态', '检索司法诉讼与产品抽检', '扫描舆情与过往代言人', '对照形象、粉丝、排他与档期打分'],
  fanplan:  ['汇总各平台本周热议话题', '整理粉丝提问与期待', '按平台调性分配内容形式', '排出一周内容日历'],
  orgcheck: ['查询民政部门登记信息', '核对公开募捐资格与年报', '检查过往项目的结项公示', '扫描近一年的舆情'],
  fanpost:  ['读取本次公益项目与机构信息', '按粉丝公益规范起草', '标注需要工作室审核的地方'],
  bodyplan: ['读取角色设定：曾是舞团学员，形象轻盈挺拔', '对照近 90 天体重与运动记录', '计算到定妆、开机的时间', '生成安全的节奏、训练与饮食建议'],
  legs:     ['读取 4 段行程与出发时间', '对照起降两地天气：雷雨、降雨概率', '估算去机场 / 车站的路况（高峰、雨天）', '比较飞机、高铁、自驾的总耗时与延误风险'],
  wear:     ['读取每一天的城市、气温和降雨', '结合当天活动的着装要求', '生成每日穿搭与随身物品'],
  sched:    ['读取本月日程（14 项）', '逐一核对新邀约与拍摄、宣发、训练的时间', '估算跨城行程与休息时间', '给出可接 / 需协调 / 建议婉拒'],
  compare:  ['读取 3 部剧本与邀约信息', '提取角色分量、题材与团队', '对照你的年度方向与已有档期', '生成横向对比与建议'],
  rcard:    ['汇总人物关系、成长线、潜台词与小传', '整理背景与人生经历时间线', '分析性格、核心动机与外在细节', '生成角色分析卡'],
  bio:      ['汇总剧本中关于许知夏的全部交代', '补全人物前史（标注推断）', '以第一人称写成人物小传'],
  call:     ['读取今日通告单', '关联资料夹中的表演方案与台词稿', '生成今日准备清单'],
  take:     ['读取剧本全文（40场 · 约6.8万字）', '识别主要人物与出场场次', '提取许知夏的成长线', '对照你的年度方向与档期'],
  rel:      ['按剧情顺序整理人物出场', '识别人物之间的关系与变化', '标注“角色此刻知道什么”'],
  growth:   ['定位许知夏的关键选择', '按场次估计人物主动性', '生成成长线'],
  subtext:  ['定位第12场原文', '区分“剧本写明”与“人物推断”', '生成潜台词解读'],
  keysc:    ['计算每场的人物变化幅度', '结合情绪强度与戏剧功能', '排出重点场次'],
  lineopt:  ['保留原句', '按三种演法生成改写建议', '标注每种改法的风险'],
  beats:    ['把第12场拆成情绪节拍', '为每个节拍写出目标、阻碍与动作反应', '生成三种处理方式'],
  dance:    ['识别舞段主题与人物情绪', '分析音乐节奏（BPM 72 → 96）', '按 8 拍划分动作段落', '整理训练观察问题'],
  looks:    ['提取各场次人物状态与环境', '生成造型方向与色彩参考'],
  shots:    ['读取已选演法：', '拆分镜头与时长', '生成轻量分镜画面'],
  tasks:    ['读取会议纪要（6条）', '识别负责人与截止时间', '拆解为任务并排进日历'],
  classify: ['读取最新 12 条留言', '按话题与情绪分类', '标记需要人工关注的内容', '为每类准备回复草稿'],
  itv:      ['读取采访邀约与资料夹', '预测可能的问题', '整理要点与不展开的话题'],
  report:   ['统计话题热度', '分析情绪分布', '提炼可执行的运营建议'],
  brand:    ['检索品牌公开信息', '逐条核对信息来源', '区分已核验、待核验与传闻'],
  rights:   ['读取合作需求：数字人广告', '按肖像、声音、表演数据、生成内容、商业授权逐项核对', '生成需要问清楚的问题'],
  brief:    ['检索影视、舞蹈、音乐、时尚、AI 内容、行业活动、公益七个方向', '逐条标注来源类型与核验状态', '判断和你的相关度', '生成摘要、建议动作与合作灵感'],
  plan:     ['汇总这部戏的资料夹', '对照年度目标', '生成下一阶段行动清单（供团队取舍）']
};
function runAI(key) { S.ran[key] = true; render(true); toast('已展开预置示例；没有调用 AI'); }

/* ---------------- 每站步骤指引 ---------------- */
const seen = (st, t) => !!S.seen[st + ':' + t];
const GUIDE = [
  [['横向对比 3 部剧本', null, () => S.ran.compare], ['AI 初读首选剧本', null, () => S.ran.take], ['项目背调', null, () => S.ran.vet], ['决定接戏', null, () => has('take')]],
  [['人物关系', 'rel', () => S.ran.rel], ['成长线', 'growth', () => S.ran.growth], ['潜台词', 'sub', () => S.ran.subtext], ['重点场次', 'key', () => S.ran.keysc], ['人物小传', 'bio', () => S.ran.bio], ['生成角色分析卡', 'card', () => S.ran.rcard], ['存入资料夹', 'card', () => has('read')], ['台词优化（可选）', 'line', () => has('line'), true]],
  [['拆情绪节拍', 'scene', () => S.ran.beats], ['选定一种演法', 'scene', () => has('role')], ['拆解舞段', 'dance', () => S.ran.dance], ['存入舞蹈训练记录', 'dance', () => has('dance')]],
  [['造型参考', 'look', () => S.ran.looks], ['轻量分镜', 'board', () => S.ran.shots], ['存入分镜', 'board', () => has('prev')], ['播放动态漫剧', 'comic', () => has('comic')]],
  [['读今日通告单', 'call', () => S.ran.call], ['纪要拆成任务', 'tasks', () => S.ran.tasks], ['存入任务看板', 'tasks', () => has('shoot')], ['看内容日历', 'cal', () => seen(4, 'cal')], ['查知识库', 'faq', () => seen(4, 'faq')]],
  [['留言分类', 'cmt', () => S.ran.classify], ['提交一条回复审核', 'cmt', () => Object.keys(S.submitted).length > 0], ['提炼运营反馈', 'rep', () => S.ran.report], ['存入周报', 'rep', () => has('promo')], ['看舆情信号', 'sig', () => seen(5, 'sig')]],
  [['核验品牌信息', null, () => S.ran.brand], ['逐项核对授权', null, () => S.ran.rights], ['切换用途对比', null, () => S.scopeTried], ['生成授权清单', null, () => has('deal')]],
  [['作品复盘', 'look', () => seen(7, 'look')], ['播出与口碑', 'data', () => S.ran.airdata], ['表演自评', 'self', () => S.ran.selfrev], ['存入资料夹', 'self', () => has('review')]]
];
const curStep = i => GUIDE[i].findIndex(g => !g[3] && !g[2]());
function stepBar(i) {
  const c = curStep(i), n = D.stations[i + 1];
  return `<div class="steps">${GUIDE[i].map((g, k) => `<button class="step ${g[2]() ? 'ok' : ''} ${k === c ? 'cur' : ''}" data-act="step" data-st="${i}" data-k="${k}"><i>${g[2]() ? '✓' : k + 1}</i>${g[0]}</button>`).join('<span class="arrow">›</span>')}</div>
  ${c < 0 ? `<div class="done-banner"><b>✓ 本站完成</b><span>${n ? `成果已存进资料夹，接下来去「${n.name}」` : '一部戏完整走完了'}</span>${n ? `<button class="btn pri" data-act="go" data-i="${i + 1}">下一站：${n.name} →</button>` : `<button class="btn pri" data-act="export">导出资料包</button>`}</div>` : `<p class="step-tip">👉 现在做：<b>${GUIDE[i][c][0]}</b></p>`}`;
}
function nudge() {
  if (onPage()) return;
  const c = curStep(S.st);
  if (c >= 0) later(() => toast('下一步：' + GUIDE[S.st][c][0]), 2400);
  else later(() => toast(S.st < 7 ? `本站完成，下一站：${D.stations[S.st + 1].name}` : '全部完成，可以导出资料包'), 2400);
}

/* ---------------- 人工复核 · 最终决定（每个板块都有） ---------------- */
const pageKey = () => onPage() || 'st' + S.st;
const PAGE_NAME = k => ({ home: '日程总览', trip: '出行与天气', body: '身体与状态', charity: '公益与影响力', fans: '粉丝与社群', deals: '合同与品牌', crisis: '危机公关与舆情', portfolio: '作品库与发展规划', brief: '行业简报' })[k] || (D.stations[+k.slice(2)] ? `${D.stations[+k.slice(2)].no} ${D.stations[+k.slice(2)].name}` : k);
const REVIEW_HINT = {
  home: '例如：上海商演接，但只留 3 小时；杭州路演婉拒，改视频连线。经纪人周五前回复对方。',
  trip: '例如：成都→重庆改坐 10:00 高铁；重庆两天有雨，礼服提前装防水罩；助理负责多带 2 把伞。',
  brief: '例如：AI 标识条款转给律师；舞台小作品的想法下周和舞团老师聊；代言传闻不回应。',
  portfolio: '例如：未来一年优先现实题材和悬疑反差角色；甜宠类暂不接；明年争取一部文艺电影。',
  crisis: '例如：采用联合澄清，今天 11:30 剧方先发、工作室转发；对两个营销号保留证据，律师跟进。',
  deals: '例如：香氛品牌可以接，但排他改成“香氛品类”、内容期满 6 个月下架、加 AI 条款；借贷 App 婉拒。律师周三前回复。',
  fans: '例如：舞蹈数据站由对接人私下沟通，引导改公益应援；周三的训练 vlog 本人先看再发。',
  charity: '例如：乡村阅读角继续做；新机构先签小额试点，资金公示每季度一次；倡议文案改第二句后发布。',
  body: '例如：同意 AI 的节奏，但每周只减 0.3 公斤；周三加一次普拉提；夜戏前一定加餐。',
  st0: '例如：先接《逆光来信》，《第七号证人》让经纪人核实投资后再谈。',
  st1: '例如：第12场的潜台词解读同意第 2 条；人物小传第 3 段我自己重写。',
  st2: '例如：第12场先按“试探”准备，现场再和导演试一遍“克制”。',
  st3: '例如：第21场造型换成深灰练功服，分镜第 4 镜改成侧面。',
  st4: '例如：探班口径确认用第一版；周五的勘景助理跟。',
  st5: '例如：“住哪家酒店”那条已转安保；剧情讨论类留言本人挑 3 条亲自回。',
  st6: '例如：数字人广告暂不接，只接受不涉及声音克隆的平面合作；合同交律师。',
  st7: '例如：下半年优先找现实题材；表演工作坊报 9 月那期。'
};
const STATUS = [['adopt', '采纳 AI 建议', 'ok'], ['modify', '修改后采纳', 'warn'], ['reject', '暂不采纳', 'bad'], ['discuss', '待讨论', '']];
const WHO = ['本人', '经纪人', '助理', '宣传', '造型', '制片 / 导演'];
S.reviews = S.reviews || {}; S.files = S.files || {}; S.archives = S.archives || [];
let draftStatus = 'adopt';
function reviewBlock() { return '<div class="note">当前为虚构项目的操作示例。切回「我的工作区」可填写、保存和共享你自己的资料。</div>'; }
const stamp = () => { const d = new Date(); return `${d.getMonth() + 1}/${d.getDate()} ${d.toTimeString().slice(0, 5)}`; };
function saveReview() {
  const t = ($('#rvText').value || '').trim(); if (!t) { toast('先写下你们的决定'); return; }
  const k = pageKey(); (S.reviews[k] = S.reviews[k] || []).push({ status: draftStatus, who: $('#rvWho').value, text: t, at: stamp() });
  save(); render(true); toast('已保存人工决定');
}
function importFiles(files) {
  const k = pageKey(); S.files[k] = S.files[k] || [];
  [...files].forEach(f => {
    const size = f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(f.size / 1024)) + ' KB';
    const rec = { name: f.name, size, at: stamp() };
    const done = () => { S.files[k].push(rec); try { save(); } catch { rec.text = ''; rec.img = ''; save(); toast('文件较大，只登记了文件名'); } render(true); };
    if (/\.json$/i.test(f.name) && /戏里戏外|backup/i.test(f.name)) { importBackup(f); return; }
    if (/^text\/|\.(md|txt|csv)$/i.test(f.type + f.name) && f.size < 300000) { const r = new FileReader(); r.onload = () => { rec.text = r.result; done(); }; r.readAsText(f); }
    else if (/^image\//.test(f.type) && f.size < 8000000) { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), s = Math.min(1, 480 / im.width); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); rec.img = c.toDataURL('image/jpeg', .7); done(); }; im.src = r.result; }; r.readAsDataURL(f); }
    else done();
  });
  toast(`已导入 ${files.length} 个文件到「${PAGE_NAME(k)}」`);
}
/* ---------------- 归档 / 备份 / 导入 ---------------- */
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
function exportBackup() { download(`戏伴工作台-备份-${new Date().toLocaleDateString('sv')}.json`, JSON.stringify({ app: 'xilixiwai', version: 1, savedAt: new Date().toISOString(), state: S }, null, 1), 'application/json'); toast('已导出完整备份（包含所有记录、决定和附件）'); }
function importBackup(file) {
  const r = new FileReader(); r.onload = () => {
    try { const j = JSON.parse(r.result); if (j.app !== 'xilixiwai' || !j.state) throw 0;
      if (!confirm(`导入 ${j.savedAt ? j.savedAt.slice(0, 16).replace('T', ' ') : ''} 的备份？当前浏览器里的记录会被替换。`)) return;
      S = Object.assign(fresh(), j.state); save(); render(); toast('备份已恢复'); if ($('#dlg').open) settings();
    } catch { toast('这不是戏伴工作台的备份文件'); }
  }; r.readAsText(file);
}
function archiveProject() {
  const n = Object.values(S.reviews).reduce((a, l) => a + l.length, 0);
  S.archives.unshift({ title: `《${D.project.title}》`, at: new Date().toLocaleString('zh-CN'), folder: S.folder.length, reviews: n, snap: JSON.stringify({ folder: S.folder, reviews: S.reviews, checks: S.checks, tasks: S.tasks }) });
  save(); toast(`已归档：资料夹 ${S.folder.length} 项 · 人工决定 ${n} 条`); if ($('#dlg').open) settings();
}

/* ---------------- 页面结构：今天 / 一部戏 / 事业 / 生活 ---------------- */
const PAGES = { home: -1, trip: -2, body: -3, charity: -4, fans: -5, deals: -6, crisis: -7, portfolio: -8, brief: -9 };
const onPage = () => Object.keys(PAGES).find(k => S[k]) || '';
const VIEWP = { home: () => vHome(), trip: () => vTrip(), body: () => vBody(), charity: () => vCharity(), fans: () => vFans(), deals: () => vDeals(), crisis: () => vCrisis(), portfolio: () => vPortfolio(), brief: () => vBrief() };
const CRUMB = { home: () => `<b>日程总览</b><span>示例：拍摄期 ${D.sched.year}年${D.sched.month}月 · 当天 ${D.sched.month}月${D.sched.today}日 · ${D.actor.name}</span>`, trip: () => `<b>出行与天气</b><span>${D.trip.title}</span>`, body: () => `<b>身体与状态</b><span>角色：许知夏 · 定妆前 6 周</span>`, charity: () => `<b>公益与影响力</b><span>把热爱变成看得见的善意</span>`, fans: () => `<b>粉丝与社群</b><span>真诚对待粉丝，也守住边界</span>`, deals: () => `<b>合同与品牌</b><span>AI 先背调评估，人来做决定</span>`, crisis: () => `<b>危机公关与舆情</b><span>先核实，再回应</span>`, portfolio: () => `<b>作品库与发展规划</b><span>适合什么角色，下一步往哪走</span>`, brief: () => `<b>行业简报</b><span>${D.brief2.week} · 逐条核验来源</span>` };

/* ---------------- 框架渲染 ---------------- */
const name = () => D.names[0];
const PROVIDERS = [
  ['demo', '演示模式', '今天发布会使用'], ['deepseek', 'DeepSeek', 'API Key'], ['openai', 'ChatGPT / OpenAI', 'API Key'],
  ['claude', 'Claude', 'API Key'], ['codex', 'Codex', '本机登录'], ['claudecode', 'Claude Code', '本机登录']
];
const providerName = () => (PROVIDERS.find(p => p[0] === S.provider) || PROVIDERS[0])[1];
const handlingName = () => D.handlings.find(h => h.id === S.handling).k;

function renderSide() {
  const rv = k => (S.reviews[k] || []).length ? ' <i class="revdot" title="已有人工决定">✍</i>' : '';
  const it = (k, ic, t, sub) => `<button class="st home-btn ${S[k] ? 'on' : ''}" data-act="go" data-i="${PAGES[k]}"><span class="st-dot">${ic}</span><span><b>${t}${rv(k)}</b><small>${sub}</small></span></button>`;
  const inSt = !onPage();
  $('#side').innerHTML = `
  <div class="brand" data-act="settings" title="点击更换名称">
    <div class="brand-mark">${name().name[0]}</div>
    <div><b>${name().name}</b><small>${name().en}</small></div>
  </div>
  <div class="side-cap">今天</div>
  ${it('home', '📅', '日程总览', '今日 · 本月 · 新邀约')}
  <div class="side-cap">一部戏的一生</div>
  <ol class="journey">${D.stations.map((s, i) => `
    <li><button class="st ${inSt && S.st === i ? 'on' : ''} ${stationDone(i) ? 'done' : ''}" data-act="go" data-i="${i}">
      <span class="st-dot">${stationDone(i) && !(inSt && S.st === i) ? '✓' : s.no}</span>
      <span><b>${s.name}${rv('st' + i)}</b><small>${s.title.split(' · ')[1] || s.title}</small></span>
    </button></li>`).join('')}
  </ol>
  <div class="side-cap">事业</div>
  ${it('portfolio', '🎞', '作品库与发展规划', '作品 · 雷达 · 年度规划')}
  ${it('deals', '📑', '合同与品牌', '资料库 · 代言 · 背调')}
  ${it('fans', '💬', '粉丝与社群', '后援会 · 全平台留言')}
  ${it('crisis', '🛡', '危机公关与舆情', '监测 · 研判 · 回应')}
  ${it('charity', '💛', '公益与影响力', '项目 · 核验 · 联动')}
  ${it('brief', '📰', '行业简报', '核验来源 · 趋势 · 灵感')}
  <div class="side-cap">生活</div>
  ${it('trip', '🧳', '出行与天气', '天气 · 交通 · 携带清单')}
  ${it('body', '💪', '身体与状态', '体重 · 饮食 · 运动 · 睡眠')}
  <a class="st extra" href="rourou/" target="_blank" rel="noopener"><span class="st-dot">🐾</span><span><b>肉肉的小世界</b><small>吃喝 · 疫苗 · 行为解读</small></span></a>
  <div class="side-cap">发布会</div>
  <a class="st extra" href="launch.html" target="_blank" rel="noopener"><span class="st-dot">▶</span><span><b>发布会页</b><small>暖场 · 宣发片 · 讲解</small></span></a>
  <div class="side-foot">
    <div class="me"><div class="avatar">${D.actor.initial}</div><div><b>${D.actor.name}</b><small>${D.actor.role}</small></div></div>
    <div class="side-btns"><button data-act="settings">⚙ 设置</button><button data-act="reset">↺ 重新演示</button></div>
  </div>`;
}
function renderTop() {
  const s = D.stations[S.st], done = D.stations.filter((_, i) => stationDone(i)).length;
  $('#top').innerHTML = `
  <div class="crumb">${onPage() ? CRUMB[onPage()]() : `<b>《${D.project.title}》</b><span>${D.project.role} · 第 ${s.no} 站 / 08 · ${s.title}</span>`}</div>
  <div class="prog" title="已完成站数"><i><em style="width:${done / 8 * 100}%"></em></i>${done}/8</div>
  <button class="chip" data-act="settings" title="连接模型"><span class="led ${S.provider === 'demo' ? '' : 'live'}"></span>${S.provider === 'demo' ? '演示模式 · 示例结果' : providerName() + ' · 待配置'}</button>
  <div class="themes" title="切换主题">${[['tide', '#34456f', '深蓝潮汐'], ['butter', '#eee5ae', '奶油便签'], ['moss', '#56653c', '山野片场']].map(([k, c, n]) => `<button data-act="theme" data-v="${k}" title="${n}" class="${S.theme === k ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>
  <button class="icon-btn folder-toggle" data-act="folder">资料夹 ${S.folder.length}</button>`;
}
function renderFolder() {
  const items = Object.entries(FOLDER);
  $('#folder').innerHTML = `
  <div class="folder-head"><h3>这部戏的资料夹 <span class="tag">${S.folder.length}/${items.length}</span></h3>
  <p>每一站的成果都存在这里，下一站接着用。</p></div>
  <div class="folder-list">${items.map(([k, v]) => has(k)
    ? `<div class="fi ${newFolder === k ? 'new' : ''}" data-act="go" data-i="${v.st}" data-tab="${v.tab || ''}"><span class="fi-no">${D.stations[v.st].no}</span><div><b>${v.t}</b><small>${v.d}</small></div></div>`
    : `<div class="fi empty"><span class="fi-no">${D.stations[v.st].no}</span><div><b>${v.t}</b><small>待生成 · ${D.stations[v.st].name}</small></div></div>`).join('')}
  </div>
  <div class="folder-foot"><button class="btn ${S.folder.length ? 'pri' : ''}" data-act="export" ${S.folder.length ? '' : 'disabled'}>导出整部戏资料包</button>
    <div class="row mt8 foot3"><button class="btn sm" data-act="backup" title="所有记录、决定、附件">💾 备份</button><label class="btn sm" title="导入备份文件">📥 导入<input type="file" id="bkFile" accept=".json,application/json" hidden></label><button class="btn sm" data-act="archive" title="给这部戏留一份快照">🗄 归档</button></div></div>`;
  newFolder = null;
}
const HERO_IMG = ['09_script', '02_window', '07_rooftop', '11_wardrobe', '10_set', '13_press', '14_rights', '08_station'];
function hero(s) {
  return `<section class="hero has-img" style="--img:url('assets/photos/${HERO_IMG[D.stations.indexOf(s)]}.jpg')"><div class="eyebrow">STATION ${s.no} · ${s.en}</div><h1>${s.title}</h1><p>${s.desc}</p>
  <div class="needs">${s.need.map(n => `<span class="need">${n}</span>`).join('')}</div></section>${stepBar(D.stations.indexOf(s))}`;
}
function next(i, carry) {
  const n = D.stations[i + 1];
  return `<div class="next"><div class="carry">${carry}</div><div class="row">
    ${i > 0 ? `<button class="btn" data-act="go" data-i="${i - 1}">← 上一站</button>` : `<button class="btn" data-act="go" data-i="-1">← 日程总览</button>`}
    ${n ? `<button class="btn pri" data-act="go" data-i="${i + 1}">带着成果去下一站：${n.name} →</button>` : `<button class="btn pri" data-act="export">导出整部戏资料包</button>`}
  </div></div>`;
}

/* ---------------- 第1站：接本 ---------------- */
// 评分逻辑：每一项都由原始数据算出，权重可由本人调整
const ARC = { 完整: 100, 部分: 65, 扁平: 35 }, PROD = { 良好: 100, 一般: 60, 待核实: 40 }, PLAT = { 'S+': 100, S: 90, A: 70, 院线待定: 50 };
function scoreScript(x) {
  const r = x.raw, rankPt = { 1: 100, 2: 75, 3: 50 }[r.rank] || 40;
  const Y = D.scoreRule.year, hit = r.goals.filter(g => Y.includes(g)).length;
  const dims = [
    ['role', '角色分量', .5 * r.share + .3 * rankPt + .2 * ARC[r.arc], `戏份 ${r.shareTxt}（${r.share}）×50% + 台词量排名第 ${r.rank}（${rankPt}）×30% + 弧线${r.arc}（${ARC[r.arc]}）×20%`],
    ['dir', '年度方向', Math.min(100, hit / 3 * 100), `今年想走的方向：${Y.join('、')}（命中 3 个记满分）。本剧对应：${r.goals.join('、')}，命中 ${hit} 个`],
    ['team', '团队与平台', .5 * r.dir * 10 + .3 * PROD[r.prod] + .2 * PLAT[r.plat], `导演口碑 ${r.dirTxt}（${r.dir * 10}）×50% + 出品方${r.prod}（${PROD[r.prod]}）×30% + ${r.platTxt}（${PLAT[r.plat]}）×20%`],
    ['sched', '档期', Math.max(0, 100 - r.conflict * 4), `和已有日程冲突 ${r.conflict} 天，每天扣 4 分`],
    ['fee', '片酬', Math.min(100, r.fee * 80), `报价 ÷ 期望片酬 = ${Math.round(r.fee * 100)}%（100% 记 80 分，最高 100）`]
  ].map(d => [d[0], d[1], Math.round(d[2]), d[3]]);
  const W = S.wts || D.scoreRule.weights, sum = Object.values(W).reduce((a, b) => a + b, 0) || 1;
  const total = Math.round(dims.reduce((a, d) => a + d[2] * (W[d[0]] || 0), 0) / sum);
  return { dims, total };
}

function vTake() {
  const T = D.take, P = D.project, SC = D.scripts;
  const compare = aiBlock('compare', 'AI 横向对比 3 部剧本', '三个本子同时到，不用一部部从头读完再比。AI 先按角色分量、年度方向、团队、档期、片酬五个维度横向比较。', () => `
    <div class="card"><div class="result-head"><h3>三部剧本横向对比</h3>${demoTag()}</div>
      <div class="grid3">${SC.map(x => `<button class="pick ${S.pick === x.id ? 'on' : ''}" data-act="pick" data-v="${x.id}">
        <div class="row" style="justify-content:space-between"><h3 class="serif" style="font-size:19px">《${x.t}》</h3>${x.rec ? tag('ok', 'AI 推荐') : ''}</div>
        <p class="small muted">${x.g} · ${x.role}</p>
        ${(() => { const sc = scoreScript(x); return `<div class="score"><b>${sc.total}</b><small>综合匹配（按你的权重）</small></div>
        ${sc.dims.map(([k, n, v]) => `<div class="dimrow"><span>${n}</span><div class="bar"><i style="width:${v}%;background:${v >= 75 ? 'var(--ok)' : v >= 50 ? 'var(--warn)' : 'var(--bad)'}"></i></div><b class="dv">${v}</b></div>`).join('')}
        ${S.showCalc ? `<ul class="calc">${sc.dims.map(([k, n, v, how]) => `<li><b>${n} ${v}</b>　${how}</li>`).join('')}</ul>` : ''}`; })()}
        <p class="small mt8">${x.note}</p></button>`).join('')}</div>
      <div class="rule-box mt"><div class="row" style="justify-content:space-between"><b>评分规则 · 权重由你定</b><span class="row"><button class="btn sm" data-act="calc">${S.showCalc ? '收起计算过程' : '看每一项怎么算'}</button><button class="btn sm" data-act="wreset">恢复默认权重</button></span></div>
        <div class="wts">${[['role', '角色分量'], ['dir', '年度方向'], ['team', '团队与平台'], ['sched', '档期'], ['fee', '片酬']].map(([k, n]) => `<label><span>${n}</span><input type="range" min="0" max="50" step="5" data-wt="${k}" value="${(S.wts || D.scoreRule.weights)[k]}"><b>${(S.wts || D.scoreRule.weights)[k]}%</b></label>`).join('')}</div>
        <p class="small muted mt8">综合 = 各项得分 × 权重，加总后按权重总和归一。比如更看重作品和角色，就把「角色分量」「年度方向」调高；档期紧就调高「档期」。</p></div>
      <ul class="list mt">${D.compareAdvice.map(a => `<li class="small">→ ${a}</li>`).join('')}</ul>
      <p class="note">评分是帮你排序的参考，不是结论。接哪一部，由你和经纪团队决定。</p></div>`);
  const pickT = SC.find(x => x.id === S.pick) || SC[0];
  const detail = !S.ran.compare ? '' : S.pick !== 'nl' ? `<div class="card mt"><p>本演示以 <b>《逆光来信》</b> 走完整条主线。《${pickT.t}》的细读流程与之相同。</p><div class="row mt8"><button class="btn sm" data-act="pick" data-v="nl">切回《逆光来信》</button></div></div>` : `<div class="mt">${aiBlock('take', 'AI 细读《逆光来信》', '选定首选后，AI 再细读这一部：讲了什么故事、你的戏份、角色弧线，以及接之前要问清楚的事。', () => `
    <div class="card"><div class="result-head"><h3>《${P.title}》初读报告</h3>${demoTag()}</div>
      <p class="line-q">${T.summary}</p>
      <div class="grid4 mt">
        <div class="metric"><b>${T.scenes.hers}<small>/${T.scenes.total}场</small></b><small>${P.role} 出场</small></div>
        <div class="metric"><b>${T.scenes.linesRank}</b><small>台词量</small></div>
        <div class="metric"><b>3 场</b><small>重点场次：${T.scenes.key}</small></div>
        <div class="metric"><b class="serif" style="font-size:17px;line-height:1.4">${T.arc}</b><small>角色弧线</small></div>
      </div></div>
    <div class="grid2 mt">
      <div class="card"><h3>和你今年的方向合不合</h3><ul class="list mt8">${T.fit.map(f => `<li><div class="row" style="justify-content:space-between"><b>${f.k}</b>${tag(f.s, f.t)}</div><p class="muted small">${f.v}</p></li>`).join('')}</ul></div>
      <div class="card"><h3>接之前，建议先问清楚</h3><ul class="list mt8">${T.questions.map((q, i) => `<li>${i + 1}. ${q}</li>`).join('')}</ul>
        <p class="note">AI 只负责把信息摆清楚。接不接、什么条件接，由你和团队决定。</p>
        <div class="row mt">${has('take') ? `${tag('ok', '✓ 已决定接下这部戏')}<span class="muted small">评估卡已存入资料夹</span>` : `<button class="btn" data-act="toast" data-msg="已生成给导演的问题清单（演示）">先约导演聊聊</button><button class="btn pri" data-act="save" data-k="take">接下《${P.title}》 ✓</button>`}</div></div>
    </div>
    ${has('take') ? `<div class="card mt"><div class="result-head"><div><h3>合作确认记录</h3><p class="sub">把“口头说好的”和“写进合同的”分开记，谁负责、何时确认一目了然。</p></div>${tag('ev', '经纪 · 法务 · 财务')}</div>
      <table class="tbl"><tr><th>事项</th><th>约定</th><th>状态</th><th>负责人</th></tr>${D.confirm.map(c => `<tr><td><b>${c.k}</b></td><td>${c.v}</td><td>${tag(c.st, c.t)}</td><td class="muted">${c.who}</td></tr>`).join('')}</table></div>` : ''}`)}</div>`;
  const vet = S.pick !== 'nl' || !S.ran.compare ? '' : `<div class="card mt"><div class="result-head"><div><h3>项目背调 · 导演、主创、题材与角色</h3><p class="sub">接之前先查清楚：舆论风险、内容导向、角色会不会有问题</p></div></div>
    ${aiBlock('vet', 'AI 背调《逆光来信》', '查导演和主创的公开报道与纠纷记录、出品方资质，研判题材导向与审查风险、角色形象风险，并对照你的作品库。', () => `${T.vet.map(v => `<div class="src">${tag(v[0], v[1])}<div><b>${v[2]}</b><p class="small muted">${v[3]}</p></div></div>`).join('')}
      <div class="gate" style="background:color-mix(in srgb,var(--accent) 12%,transparent)">🎞 对照你的作品库：${T.vsMe} <button class="btn sm" data-act="go" data-i="-8">查看作品库与定位 →</button></div>
      <p class="note">${demoTag()}　正式版接入公开报道、裁判文书与备案信息，并附原始链接；网络传闻不作为依据。</p>`)}</div>`;
  return `${hero(D.stations[0])}
  <div class="card"><h3>收件箱 · 本周收到 ${SC.length} 部剧本</h3>
    ${SC.map(x => `<div class="inbox mt8 ${S.ran.compare ? '' : 'pulse'}"><div class="env">✉️</div><div style="flex:1"><b>《${x.t}》</b><p class="muted small">${x.g} · 邀约角色 ${x.role} · 来自 ${x.from}</p></div>${tag('ev', '新邀约')}</div>`).join('')}</div>
  <div class="mt">${compare}</div>${detail}${vet}
  ${next(0, has('take') ? '下一站会带上：<b>剧本 + 接戏评估卡</b>（重点场次、舞蹈准备提醒）' : '先比较、再细读，最后决定接哪一部。')}`;
}

/* ---------------- 第2站：读本 ---------------- */
function scriptPanel(hl) {
  return `<div class="card"><div class="result-head"><h3>剧本原文</h3><span class="muted small">节选 · 虚构剧本</span></div>
  <div class="script" id="script">${D.script.map(s => `<div class="sc ${hl === s.id ? 'hl' : ''}" id="sc-${s.id}"><h4>${s.title}</h4>${s.text.split('\n').map(l => `<p>${l}</p>`).join('')}</div>`).join('')}</div></div>`;
}
function relSVG() {
  const c = D.people[0];
  return `<svg viewBox="0 0 610 330" style="width:100%;height:auto">
  ${D.people.slice(1).map(p => `<line class="rel-edge ${p.dash ? 'dash' : ''}" x1="${c.x}" y1="${c.y}" x2="${p.x}" y2="${p.y}"/>
     <text class="rel-label" x="${(c.x + p.x) / 2}" y="${(c.y + p.y) / 2 - 6}" text-anchor="middle">${p.edge.split(' · ')[0]}</text>`).join('')}
  ${D.people.map(p => `<g class="rel-node ${p.me ? 'me' : ''} ${S.rel === p.id ? 'on' : ''}" data-act="rel" data-v="${p.id}">
     <circle cx="${p.x}" cy="${p.y}" r="${p.me ? 44 : 34}"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="${p.me ? 16 : 14}">${p.name}</text></g>`).join('')}
  </svg>`;
}
function growthSVG(data, h = 230, labelKey = 'label', xLabel = d => '第' + d.sc + '场') {
  const W = 620, x = i => 60 + i * ((W - 110) / (data.length - 1)), y = v => h - 40 - v * (h - 80) / 100;
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.v)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${h}" style="width:100%;height:auto">
    <line class="axis" x1="40" y1="${h - 40}" x2="${W - 20}" y2="${h - 40}"/>
    <path class="curve" d="${path}"/>
    ${data.map((d, i) => `<circle class="pt" cx="${x(i)}" cy="${y(d.v)}" r="6"/>
      <text x="${x(i)}" y="${y(d.v) - 14}" text-anchor="middle" font-size="13" font-weight="600">${d[labelKey]}</text>
      <text x="${x(i)}" y="${h - 18}" text-anchor="middle" font-size="12" class="rel-label">${xLabel(d)}</text>`).join('')}
  </svg>`;
}
function vRead() {
  const t = tab(1, 'rel'), p = D.people.find(x => x.id === S.rel);
  const cite = (sc, q) => `<button class="btn sm" data-act="cite" data-sc="${sc}">↩ 回到原文 第${sc}场</button>`;
  let body = '';
  if (t === 'rel') body = aiBlock('rel', '分析人物关系', 'AI 按剧情顺序整理人物，并特别标出：每个时间点，角色自己“知道什么、不知道什么”。', () => `
    <div class="card"><div class="result-head"><h3>人物关系</h3>${demoTag()}</div>${relSVG()}
      <div class="line-q mt8"><b>${p.name}</b>　${p.desc}${p.edge ? `<br><span class="muted small">与许知夏：${p.edge}</span>` : ''}</div>
      <div class="note">⚠ 信息时点：准备第12场时，许知夏<b>还不知道</b>信是陆川寄的（第28场才揭晓）。读过结局的我们，不能把答案提前演出来。 ${cite(8)}</div></div>`);
  if (t === 'growth') body = aiBlock('growth', '生成成长线', 'AI 找出许知夏在全剧中的关键选择，画出她从“回避”到“主动”的变化。', () => `
    <div class="card"><div class="result-head"><h3>许知夏的成长线 · 主动性变化</h3>${demoTag()}</div>${growthSVG(D.growth)}
      <ul class="list">${D.growth.map(g => `<li class="row" style="justify-content:space-between"><span><b>第${g.sc}场 · ${g.label}</b>　<span class="muted">${g.note}</span></span>${cite(g.sc)}</li>`).join('')}</ul></div>`);
  if (t === 'sub') body = aiBlock('subtext', '解读第12场潜台词', 'AI 逐句写出“话里没说出口的意思”。注意：这些是对人物的推断，不是剧本写明的事实，需要你和导演判断。', () => `
    <div class="card"><div class="result-head"><h3>第12场 · 动机与潜台词</h3>${demoTag()}</div>
      <ul class="list">${D.subtext.map(s => `<li><p class="serif" style="font-size:16px"><b>${s.who}：</b>${s.line}</p><p class="mt8 small">${tag('', '推断')} <span class="muted">潜台词：</span>${s.sub}</p></li>`).join('')}</ul>
      <div class="note">许知夏在这场戏中的动机：<b>守住自己的节奏</b>——她不是不想谈，而是不想被对方带着谈。 ${cite(12)}</div></div>`);
  if (t === 'key') body = aiBlock('keysc', '找出重点场次', 'AI 按“人物变化幅度 + 情绪强度 + 戏剧功能”给场次排序，告诉你哪几场要花最多功夫。', () => `
    <div class="card"><div class="result-head"><h3>重点场次</h3>${demoTag()}</div>
      <ul class="list">${D.keyScenes.map((k, i) => `<li><div class="row" style="justify-content:space-between"><b>${i + 1}. 第${k.sc}场 · ${k.w}</b>${cite(k.sc)}</div><p class="small mt8">${k.why}</p><p class="small muted">提示：${k.tip}</p></li>`).join('')}</ul></div>`);
  if (t === 'bio') body = aiBlock('bio', 'AI 起草人物小传', '演员进组前通常要写人物小传。AI 汇总剧本里关于许知夏的全部交代，起草一版第一人称小传，你再改成自己的。', () => `
    <div class="card"><div class="result-head"><h3>许知夏 · 人物小传（草稿）</h3>${demoTag()}</div>
      ${D.bio.map(p => `<p class="serif" style="font-size:15.5px;line-height:1.95;margin-bottom:10px">${p}</p>`).join('')}
      <p class="note">${D.bioNote}</p><div class="row mt8">${cite(21)}<button class="btn sm" data-act="toast" data-msg="正式版可直接编辑并保留历史版本">✎ 改成我自己的版本</button></div></div>`);
  if (t === 'card') { const RC = D.roleCard; body = aiBlock('rcard', 'AI 生成角色分析卡', '把人物关系、成长线、潜台词和小传汇总成一张卡：背景、经历、性格、动机、外在细节、关系与弧线，一眼看懂她是谁。', () => `
    <div class="rcard" id="rcard"><div class="rc-side"><div class="rc-photo" style="background-image:url('assets/photos/06_xia.jpg')"></div>
        <div class="swatch">${RC.palette.map(c => `<i style="background:${c}"></i>`).join('')}</div>
        <dl class="kv small">${RC.basic.map(b => `<dt>${b[0]}</dt><dd>${b[1]}</dd>`).join('')}</dl>
        <div class="row mt8">${RC.tags.map(x => `<span class="tag">${x}</span>`).join('')}</div></div>
      <div class="rc-main"><div class="result-head"><div><div class="eyebrow" style="color:var(--accent)">CHARACTER PROFILE</div><h2 class="serif" style="font-size:30px">许知夏</h2></div>${demoTag()}</div>
        <p class="line-q">${RC.oneLine}</p>
        <h4 class="rc-h">人物前史</h4><div class="rc-time">${RC.timeline.map(x => `<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>
        <div class="grid2 mt"><div><h4 class="rc-h">性格光谱</h4>${RC.traits.map(([l, r, v]) => `<div class="spec"><span>${l}</span><div><i style="left:${v}%"></i></div><span>${r}</span></div>`).join('')}</div>
          <div><h4 class="rc-h">核心驱动</h4>${RC.core.map(c => `<div class="core"><small>${c[0]}</small><b>${c[1]}</b></div>`).join('')}</div></div>
        <div class="grid2 mt"><div><h4 class="rc-h">外在细节</h4><dl class="kv small" style="grid-template-columns:52px 1fr">${RC.surface.map(x => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('')}</dl></div>
          <div><h4 class="rc-h">人物关系</h4><ul class="list small">${RC.relations.map(x => `<li><b>${x[0]}</b>　${x[1]}</li>`).join('')}</ul></div></div>
        <h4 class="rc-h mt">人物弧线</h4><div class="rc-arc">${RC.arc.map((x, i) => `<div><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>${i < RC.arc.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
        <div class="grid2 mt"><div><h4 class="rc-h">关键台词</h4>${RC.lines.map(l => `<p class="serif small" style="margin:4px 0">${l}</p>`).join('')}</div>
          <div><h4 class="rc-h">表演提醒</h4><ul class="list small">${RC.notes.map(n => `<li>✦ ${n}</li>`).join('')}</ul></div></div>
        <div class="row mt">${cite(21)}<button class="btn sm" data-act="print">🖨 打印 / 存为 PDF</button>${has('read') ? tag('ok', '✓ 已存入资料夹') : `<button class="btn sm pri" data-act="save" data-k="read">存入资料夹</button>`}</div>
        <p class="note">背景与经历来自剧本交代（可点“回到原文”核对），性格、动机等为 AI 推断，请与导演确认后改成你自己的理解。</p></div></div>`); }
  if (t === 'line') body = aiBlock('lineopt', '生成台词优化建议', 'AI 给出几种改法，原句始终保留。采不采用、怎么说更像这个人物，由你和导演决定。', () => `
    <div class="card"><div class="result-head"><h3>台词优化 · 第12场</h3>${demoTag()}</div>
      <p class="small muted">原句（保留）</p><p class="line-q">${S.adopt !== null ? `<s class="muted">${D.lineOpt.original}</s><br>${D.lineOpt.options[S.adopt].t} ${tag('ok', '已采用建议 · 原句已存档')}` : D.lineOpt.original}</p>
      <div class="grid3 mt">${D.lineOpt.options.map((o, i) => `<button class="pick ${S.adopt === i ? 'on' : ''}" data-act="adopt" data-i="${i}"><span class="tag">${o.k}</span><p class="serif mt8" style="font-size:16px">${o.t}</p><p class="small muted mt8">${o.why}</p></button>`).join('')}</div>
      <div class="row mt">${S.adopt !== null ? `<button class="btn sm" data-act="adopt" data-i="-1">撤回，恢复原句</button>` : ''}${has('line') ? tag('ok', '✓ 建议稿已存入资料夹') : `<button class="btn sm" data-act="save" data-k="line" ${S.adopt === null ? 'disabled' : ''}>存为建议稿（交导演确认）</button>`}</div></div>`);
  const allRan = ['rel', 'growth', 'subtext', 'keysc', 'bio'].every(k => S.ran[k]);
  return `${hero(D.stations[1])}
  ${tabs(1, [['rel', '人物关系'], ['growth', '成长线'], ['sub', '动机与潜台词'], ['key', '重点场次'], ['bio', '人物小传'], ['card', '角色分析卡'], ['line', '台词优化']])}
  <div class="${t === 'card' ? 'fullw' : 'split'}">${t === 'card' ? '' : `<div>${scriptPanel(S.hl)}</div>`}<div>${body}
    <div class="card"><div class="row" style="justify-content:space-between"><div><h3>角色分析卡</h3><p class="sub">关系、成长线、潜台词、重点场次、人物小传都看过后，存成一张卡带进下一站。</p></div>
    ${has('read') ? tag('ok', '✓ 已存入资料夹') : `<button class="btn ${allRan ? 'pri' : ''}" data-act="save" data-k="read" ${allRan ? '' : 'disabled'}>存入资料夹</button>`}</div>
    ${allRan ? '' : `<p class="small muted mt8">还差：${[['rel', '人物关系'], ['growth', '成长线'], ['subtext', '潜台词'], ['keysc', '重点场次'], ['bio', '人物小传']].filter(([k]) => !S.ran[k]).map(x => x[1]).join('、')}</p>`}</div>
  </div></div>
  ${next(1, has('read') ? '下一站会带上：<b>角色分析卡</b>（第12场潜台词、信息时点、重点场次）' : '分析结果存入资料夹后，下一站可以直接接着用。')}`;
}

/* ---------------- 第3站：入角 ---------------- */
function vRole() {
  const t = tab(2, 'scene');
  let body;
  if (t === 'scene') {
    body = `<div class="card"><div class="result-head"><h3>第12场 · 窗边的来信</h3><span class="muted small">来自资料夹：角色分析卡 · 重点场次 1</span></div>
      <p class="line-q">陆川：你一直留着这封信？／许知夏：我只是还没想好，要把它放在哪里。／陆川：有些事情，放下了也不会忘。／许知夏：那就先让我，把话说完。</p></div>
    <div class="mt">${aiBlock('beats', '拆解情绪节拍与三种演法', 'AI 把这场戏拆成 4 个情绪节拍，写出每一拍的人物目标、阻碍和动作反应，再给出同一场戏的三种处理方式。', () => `
      <div class="card"><div class="result-head"><h3>情绪推进</h3>${demoTag()}</div>${growthSVG(D.beats, 210, 't', (d) => '')}
        <div class="grid4 mt">${D.beats.map((b, i) => `<div><span class="tag">节拍 ${i + 1} · ${b.t}</span><dl class="kv mt8" style="grid-template-columns:40px 1fr;font-size:13px"><dt>目标</dt><dd>${b.goal}</dd><dt>阻碍</dt><dd>${b.obs}</dd><dt>动作</dt><dd>${b.act}</dd></dl></div>`).join('')}</div></div>
      <div class="card"><div class="result-head"><h3>同一场戏 · 三种处理</h3><span class="muted small">点选一种，带进下一站做预演</span></div>
        <div class="grid3">${D.handlings.map(h => `<button class="pick ${S.handling === h.id ? 'on' : ''}" data-act="handling" data-v="${h.id}"><h3 class="serif" style="font-size:20px">${h.k}</h3>
          <dl class="kv mt8" style="grid-template-columns:40px 1fr;font-size:13px"><dt>节奏</dt><dd>${h.rhythm}</dd><dt>视线</dt><dd>${h.eye}</dd><dt>身体</dt><dd>${h.body}</dd><dt>风险</dt><dd>${h.risk}</dd></dl>
          <p class="small mt8" style="color:var(--accent)">${h.fit}</p></button>`).join('')}</div>
        <div class="row mt" style="justify-content:space-between"><span class="small muted">最后用哪一种，在现场和导演一起定。AI 只是把差别摆在眼前。</span>
        ${has('role') ? tag('ok', `✓ 已存：${handlingName()}版表演方案`) : `<button class="btn pri" data-act="save" data-k="role">选定「${handlingName()}」，存入表演方案</button>`}</div></div>`)}</div>`;
  } else if (t === 'drill') {
    S.drillShow = S.drillShow || {};
    body = `<div class="card"><div class="result-head"><h3>台词陪练</h3><span class="muted small">AI 念对手的词，你接自己的词；点卡片看答案</span></div>
      ${D.drill.map((d, i) => `<div class="drill"><p class="muted">${d.cue}</p><button class="drill-line ${S.drillShow[i] ? 'on' : ''}" data-act="drill" data-i="${i}">${S.drillShow[i] ? `许知夏：${d.line}` : '许知夏：▢▢▢▢▢▢▢▢　（先自己说，再点开核对）'}</button></div>`).join('')}
      <div class="row mt"><span class="small muted">已核对 ${Object.values(S.drillShow).filter(Boolean).length}/${D.drill.length} 句 · 正式版可接语音朗读与录音回放</span><button class="btn sm" data-act="drill" data-i="-1">重新遮挡</button></div></div>`;
  } else {
    const Dn = D.dance;
    body = `<div class="card"><div class="result-head"><h3>第21场 · 天台独舞</h3><span class="muted small">来自资料夹：接戏评估卡 · 需准备 6 周</span></div>
      <p class="line-q">${D.script.find(s => s.id === 21).text}</p></div>
    <div class="mt">${aiBlock('dance', 'AI 拆解舞段', 'AI 从主题、人物情绪、音乐节奏和动作段落四个方面拆解这段舞，辅助编舞灵感和训练复盘。', () => `
      <div class="card"><div class="result-head"><h3>舞段拆解</h3>${demoTag()}</div>
        <dl class="kv"><dt>主题</dt><dd class="serif">${Dn.theme}</dd><dt>音乐</dt><dd>${Dn.music}</dd></dl>
        <div class="dance">${Dn.segs.map(s => `<div class="seg" style="--c:${s.c}"><b>${s.n}</b><small>情绪：${s.emo}</small><small>动作：${s.move}</small><div class="beats">${'<i></i>'.repeat(s.beats)}</div><small>${s.beats} × 8 拍</small></div>`).join('')}</div></div>
      <div class="card"><div class="result-head"><h3>训练记录与动作观察问题</h3><span class="muted small">结合训练视频形成观察问题</span></div>
        <ul class="list">${Dn.log.map(l => `<li><div class="row"><span class="tag">${l.d}</span><b>${l.t}</b></div><p class="small mt8">❓ ${l.q}</p></li>`).join('')}</ul>
        <div class="gate">⚠ 动作纠正和身体安全由专业舞蹈老师判断。AI 只负责记录、整理和提出观察问题。</div>
        <div class="row mt">${has('dance') ? tag('ok', '✓ 舞蹈拆解已存入资料夹') : `<button class="btn pri" data-act="save" data-k="dance">存入资料夹</button>`}</div></div>`)}</div>`;
  }
  return `${hero(D.stations[2])}${tabs(2, [['scene', '第12场 · 表演设计'], ['drill', '台词陪练'], ['dance', '第21场 · 舞蹈段落']])}${body}
  ${next(2, has('role') ? `下一站会带上：<b>「${handlingName()}」版表演方案</b>，分镜会按这个演法生成` : '选定一种演法，下一站的分镜会按它来生成。')}`;
}

/* ---------------- 第4站：预演 ---------------- */
const PHOTO = { wide: '04_two', letter: '03_letter', lu: '05_lu', xia: '06_xia', two: '02_window' };
const photo = (n, cls = '') => `<img class="ph ${cls}" src="assets/photos/${n}.jpg" alt="" loading="lazy">`;
function pic(kind, uid) {
  if (PHOTO[kind]) return photo(PHOTO[kind]);
  const g = `g${uid}`;
  const bg = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4668"/><stop offset="1" stop-color="#1b2133"/></linearGradient>
    <radialGradient id="${g}l" cx=".72" cy=".3" r=".6"><stop offset="0" stop-color="#f6e7c4" stop-opacity=".55"/><stop offset="1" stop-color="#f6e7c4" stop-opacity="0"/></radialGradient></defs>
    <rect width="320" height="200" fill="url(#${g})"/><rect width="320" height="200" fill="url(#${g}l)"/>`;
  const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#efe3c6" opacity=".85" rx="2"/><path d="M${x + w / 2} ${y}V${y + h}M${x} ${y + h / 2}H${x + w}" stroke="#3a4668" stroke-width="5"/>`;
  const person = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-46" r="17" fill="${c}"/><path d="M-30 30 Q-28 -22 0 -24 Q28 -22 30 30Z" fill="${c}"/></g>`;
  const letter = (x, y, r = -6, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><rect x="-22" y="-14" width="44" height="28" fill="#f3ead6" rx="2"/><path d="M-22 -14 L0 3 L22 -14" stroke="#b9a782" fill="none" stroke-width="1.5"/></g>`;
  const table = `<rect x="0" y="150" width="320" height="50" fill="#141826" opacity=".85"/>`;
  const K = {
    wide: `${win(185, 28, 90, 96)}${table}${person(95, 150, 1, '#202638')}${person(232, 150, 1, '#2a3048')}${letter(162, 160)}`,
    letter: `<rect x="0" y="60" width="320" height="140" fill="#1a1f2e"/>${letter(160, 128, -8, 2.6)}<rect x="196" y="96" width="70" height="22" rx="11" fill="#d9b9a0" transform="rotate(-20 230 107)"/>`,
    lu: `${win(30, 24, 80, 86)}${person(210, 168, 1.35, '#2c3350')}<path d="M0 200 Q10 110 70 120 Q110 130 120 200Z" fill="#0f1220" opacity=".95"/>`,
    xia: `${win(220, 10, 90, 100)}<g transform="translate(150 132)"><circle cx="0" cy="-30" r="44" fill="#262d44"/><path d="M-44 -30 Q-46 -84 0 -80 Q48 -82 44 -24 Q40 -60 0 -62 Q-38 -62 -44 -30Z" fill="#141826"/><path d="M-70 80 Q-60 20 0 18 Q60 20 70 80Z" fill="#e9e2d2" opacity=".9"/></g>`,
    two: `${win(120, 20, 80, 90)}${table}${person(105, 150, 1.15, '#23293d')}${person(222, 150, 1.15, '#2e3550')}${letter(162, 162, 0, .8)}`
  };
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">${bg}${K[kind]}</svg>`;
}
function vPrev() {
  const t = tab(3, 'look');
  let body;
  if (t === 'look') body = aiBlock('looks', 'AI 生成造型参考', '根据每场戏的人物状态和环境，生成造型方向和色彩参考，作为和造型老师沟通的起点。', () => `
    <div class="result-head"><h3>造型参考 · 角色氛围</h3>${demoTag()}</div>
    <div class="grid3">${D.looks.map(l => `<div class="card look">${photo(l.img, 'look-img')}<span class="tag">${l.sc}</span><h3 class="serif mt8" style="font-size:19px">${l.k}</h3>
      <div class="swatch">${l.pal.map(c => `<i style="background:${c}"></i>`).join('')}</div><p class="small muted">氛围：${l.mood}</p></div>`).join('')}</div>
    <p class="note">造型参考只是方向，最终方案由造型团队设计。生成图像涉及本人肖像时，按第 07 站的授权规则处理。</p>`);
  else if (t === 'board') body = aiBlock('shots', 'AI 生成轻量分镜', `按第 03 站选定的「${handlingName()}」演法，把第12场拆成 5 个镜头。`, () => `
    <div class="result-head"><h3>第12场 · 轻量分镜（${handlingName()}版）</h3>${demoTag()}</div><p class="small muted" style="margin:-6px 0 10px">演示版三种演法共用同一组示意镜头；正式版按所选演法生成。</p>
    <div class="frames">${D.shots.map(s => `<div class="frame"><div class="pic">${pic(s.pic, 'f' + s.no)}</div><div class="cap"><b>${s.no} · ${s.size} · ${s.dur}秒</b>${s.cam}<br><span class="muted">${s.act}</span>${s.line ? `<br><span class="serif">${s.line}</span>` : ''}</div></div>`).join('')}</div>
    <div class="row mt">${has('prev') ? tag('ok', '✓ 造型与分镜已存入资料夹') : `<button class="btn pri" data-act="save" data-k="prev">存入资料夹</button>`}<button class="btn" data-act="tab" data-st="3" data-v="comic">▶ 播放成动态漫剧</button></div>`);
  else body = `<div class="result-head"><h3>动态漫剧预演 · 第12场</h3><span class="muted small">由分镜自动串联 · 共 ${D.shots.reduce((a, s) => a + s.dur, 0)} 秒</span></div>
    <div class="player" id="player"><div class="cover"><div><div class="eyebrow" style="color:#fff">MOTION PREVIEW</div><h2 class="serif" style="font-size:28px">《${D.project.title}》第12场 · 窗边的来信</h2><p style="opacity:.75">${handlingName()}版 · ${D.shots.length} 个镜头</p><button data-act="play">▶ 播放</button></div></div></div>
    <p class="note">这是分镜节奏示意，用来和导演、摄影讨论构图、停顿和镜头时长。正式版可接入图像 / 视频生成模型生成画面。</p>`;
  return `${hero(D.stations[3])}${tabs(3, [['look', '造型参考'], ['board', '轻量分镜'], ['comic', '动态漫剧']])}${body}
  ${next(3, has('comic') ? '预演完成。进组后，下一站管理<b>团队协同</b>' : '播放一次动态漫剧，预演就会存入资料夹。')}`;
}
let comicAudio = null;
window.__comicStop = () => { if (comicAudio) { comicAudio.pause(); comicAudio = null; } };
function playComic() {
  clearTimers();
  
  const el = $('#player'); if (!el) return;
  const total = D.shots.reduce((a, s) => a + s.dur, 0) * 1000;
  el.innerHTML = `<div class="stage" id="stage"></div><div class="ctrl"><button data-act="play">↺ 重播</button><div class="pbar"><i id="pb"></i></div><span id="pt" style="font-size:12px">0s</span></div>`;
  let t = 0;
  D.shots.forEach((s, i) => {
    later(() => {
      $('#stage').innerHTML = `<div class="kb" style="position:absolute;inset:0;animation-duration:${s.dur}s">${pic(s.pic, 'p' + i)}</div><div class="shotno">SHOT ${s.no} · ${s.size} · ${s.cam}</div><div class="subtitle">${s.line || `<span style="opacity:.8;font-size:16px">${s.act}</span>`}</div>`;
    }, t);
    t += s.dur * 1000;
  });
  const pb = $('#pb'), pt = $('#pt'), t0 = performance.now();
  const tick = () => {
    if (!document.body.contains(pb)) return;
    const p = Math.min(1, (performance.now() - t0) / total);
    pb.style.width = p * 100 + '%'; pt.textContent = Math.round(p * total / 1000) + 's';
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  later(() => {
    const st = $('#stage'); if (st) st.insertAdjacentHTML('beforeend', `<div class="cover" style="background:#000c"><div><h2 class="serif">预演结束</h2><button data-act="play">↺ 再看一遍</button></div></div>`);
    if (!has('comic')) addFolder('comic', '已存入资料夹：动态漫剧预演');
  }, total + 300);
}

/* ---------------- 第5站：开机 ---------------- */
function vShoot() {
  const t = tab(4, 'call'), C = D.callsheet;
  let body;
  if (t === 'call') body = `<div class="split"><div class="card"><div class="result-head"><h3>今日通告单</h3><span class="tag">${C.date}</span></div>
      <dl class="kv"><dt>时间</dt><dd>${C.call}</dd><dt>地点</dt><dd>${C.place}</dd><dt>天气</dt><dd>${C.weather}</dd></dl>
      <table class="tbl mt"><tr><th>场</th><th>内容</th><th>时间</th><th>人物</th></tr>${C.scenes.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>
    <div>${aiBlock('call', 'AI 读通告单', '通告单每天都来，信息很碎。AI 帮你读成“今天我要准备什么”，并把资料夹里这场戏的表演方案、台词稿关联进来。', () => `
      <div class="card"><div class="result-head"><h3>今天你要准备的</h3>${demoTag()}</div>
      <ul class="list">${C.prep.map(p => `<li class="small">☐ ${p}</li>`).join('')}</ul>
      <h3 class="mt">剧本改页核对 <span class="muted small">${D.revision.from}</span></h3>
      <ul class="list mt8">${D.revision.changes.map(([k, a, b]) => `<li class="small">${tag(k === '删' ? 'bad' : k === '加' ? 'ok' : 'warn', k)} ${a ? `<s class="muted">${a}</s>` : ''} ${b ? `→ <b>${b}</b>` : ''}</li>`).join('')}</ul>
      <p class="note">${D.revision.note}</p>
      <div class="row mt8">${has('role') ? tag('ok', `已关联：第12场「${handlingName()}」版表演方案`) : tag('warn', '第12场还没有表演方案，可回到「入角」补上')}${has('line') ? tag('ok', '已关联：台词建议稿') : ''}</div></div>`)}</div></div>`;
  else if (t === 'tasks') body = `<div class="split"><div class="card"><h3>会议纪要</h3><p class="sub">把碰头会的记录粘进来（可直接修改）</p>
      <div class="field"><textarea id="minutes" style="min-height:230px">${D.minutes}</textarea></div></div>
    <div>${aiBlock('tasks', 'AI 拆解成任务', 'AI 从纪要里找出“谁、做什么、什么时候”，拆成任务卡，同时排进内容日历。', () => `
      <div class="result-head"><h3>任务看板</h3>${demoTag()}</div>
      <div class="kanban">${['待办', '进行中', '已完成'].map((c, ci) => `<div class="col"><h4>${c}<span>${S.tasks.filter(x => x.col === ci).length}</span></h4>
        ${S.tasks.map((x, i) => x.col === ci ? `<div class="task">${x.t}<small><span>${x.who} · ${x.due}</span>${ci < 2 ? `<button data-act="move" data-i="${i}">推进 →</button>` : '✓'}</small></div>` : '').join('')}</div>`).join('')}</div>
      <div class="row mt">${has('shoot') ? tag('ok', '✓ 已存入资料夹') : `<button class="btn pri" data-act="save" data-k="shoot">存入资料夹</button>`}<button class="btn" data-act="tab" data-st="4" data-v="cal">查看内容日历 →</button></div>`)}</div></div>`;
  else if (t === 'cal') body = `<div class="card"><div class="result-head"><h3>内容日历 · 开机周</h3><div class="row small"><span class="ev shoot">拍摄</span><span class="ev post">物料发布</span><span class="ev fan">粉丝 / 社群</span></div></div>
    <div class="cal">${D.week.map(d => `<div class="day"><b>${d.d}</b>${d.ev.map(([c, n]) => `<span class="ev ${c}">${n}</span>`).join('')}</div>`).join('')}</div>
    <p class="note">物料发布前都需要经过“宣传起草 → 经纪人审核 → 本人确认”，日历只负责提醒，不会自动发布。</p></div>`;
  else {
    const q = (S.faqQ || '').trim();
    const list = D.faq.filter(f => !q || (f.q + f.a + f.tag).includes(q));
    body = `<div class="card"><div class="result-head"><h3>工作室知识库 · 常见问题模板</h3><span class="muted small">团队成员遇到问题先查这里，少重复问</span></div>
      <div class="field" style="margin-top:0"><input id="faq" placeholder="搜索：探班、行程、物料、品牌…" value="${q}"></div>
      <ul class="list mt8">${list.map(f => `<li><div class="row"><span class="tag">${f.tag}</span><b>${f.q}</b></div><p class="small mt8">${f.a}</p></li>`).join('') || '<li class="muted">没有找到，可以新建一条</li>'}</ul></div>`;
  }
  return `${hero(D.stations[4])}${tabs(4, [['call', '今日通告单'], ['tasks', '纪要 → 任务'], ['cal', '内容日历'], ['faq', '知识库与常见问题']])}${body}
  ${next(4, '拍完了，剧要开播。下一站处理<b>粉丝留言</b>')}`;
}

/* ---------------- 第6站：宣传 ---------------- */
function replyPanel() {
  const c = D.comments.find(x => x.id === S.sel);
  if (!c) return `<div class="card"><h3>回复草稿</h3><p class="sub">点左边任意一条留言，AI 会按它的类型起草回复。</p></div>`;
  const risk = c.c === 'risk';
  const tones = [['warm', '温暖'], ['play', '俏皮'], ['formal', '正式']];
  return `<div class="card"><div class="result-head"><h3>回复草稿</h3>${demoTag()}</div>
    <p class="small muted">${c.u}：</p><p class="line-q" style="font-size:14.5px">${c.t}</p>
    ${risk ? `<div class="alert mt"><b>⚠ 不建议回复</b><p class="small mt8">${c.id === 9 ? D.signals[0].s : D.signals[1].s}</p></div>` : `
    <p class="small muted mt">语气</p><div class="opt">${tones.map(([k, n]) => `<button data-act="tone" data-v="${k}" class="${S.tone === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    <div class="draft mt8">${D.replies[c.c][S.tone]}</div>`}
    <div class="gate">🔒 AI 只起草，不会自动发送。重要对外回复必须经过工作室人工审核。</div>
    <div class="row mt">${S.submitted[c.id] ? tag('ok', '✓ 已提交工作室审核 · 待人工确认') : `<button class="btn pri" data-act="submit">${risk ? '转工作室人工处理' : '提交工作室审核'}</button>`}</div></div>`;
}
function vPromo() {
  const t = tab(5, 'cmt');
  let body;
  if (t === 'cmt') body = `<div class="split" style="grid-template-columns:minmax(0,7fr) minmax(0,5fr)"><div>
    ${S.ran.classify ? `<div class="${freshKey === 'classify' ? 'reveal' : ''}"><div class="result-head"><h3>留言分类</h3>${demoTag()}</div>
      <div class="buckets">${Object.entries(D.cats).map(([k, v]) => `<div class="bucket"><h4>${v.ic} ${v.n}<span class="muted">${D.comments.filter(c => c.c === k).length}</span></h4>
      <div class="cmts">${D.comments.filter(c => c.c === k).map(c => `<button class="cmt ${S.sel === c.id ? 'on' : ''}" data-act="sel" data-i="${c.id}"><small>${c.u}${S.submitted[c.id] ? ' · ✓ 已提交审核' : ''}</small>${c.t}</button>`).join('')}</div></div>`).join('')}</div></div>`
      : `<div class="result-head"><h3>最新留言 · 未整理</h3><span class="muted small">共 ${D.comments.length} 条 · 示例数据</span></div>
      <div class="cmts">${D.comments.map(c => `<div class="cmt"><small>${c.u}</small>${c.t}</div>`).join('')}</div>
      <div class="mt" data-ai="classify" style="display:flex;gap:12px;align-items:center"><button class="btn pri ai" data-act="run" data-k="classify">AI 分类并起草回复</button><span class="small muted">按话题与情绪分类，标出需要人工关注的内容</span></div>`}
    </div><div style="position:sticky;top:0">${S.ran.classify ? replyPanel() : `<div class="card"><h3>回复草稿</h3><p class="sub">先让 AI 把留言分好类。</p></div>`}</div></div>`;
  else if (t === 'rep') body = aiBlock('report', 'AI 提炼运营反馈', '把一周的留言变成团队能直接用的反馈：大家在聊什么、情绪怎么样、接下来可以做什么。', () => `
    <div class="result-head"><h3>粉丝反馈周报</h3>${demoTag()}</div>
    <div class="grid2"><div class="card"><h3>热议话题</h3><ul class="list mt8">${D.report.topics.map(([n, v]) => `<li><div class="row" style="justify-content:space-between"><span>${n}</span><span class="muted small">${v}%</span></div><div class="bar mt8"><i style="width:${v * 2.6}%"></i></div></li>`).join('')}</ul></div>
    <div class="card"><h3>情绪分布</h3><div class="bar mt" style="height:22px;display:flex"><i style="width:${D.report.mood.pos}%;background:var(--ok);border-radius:0"></i><i style="width:${D.report.mood.neu}%;background:var(--muted);border-radius:0"></i><i style="width:${D.report.mood.neg}%;background:var(--bad);border-radius:0"></i></div>
      <p class="small mt8">正面 ${D.report.mood.pos}% · 中性 ${D.report.mood.neu}% · 负面 ${D.report.mood.neg}%</p>
      <h3 class="mt">建议动作</h3><ul class="list mt8">${D.report.actions.map(a => `<li class="small">→ ${a}</li>`).join('')}</ul></div></div>
    <div class="row mt">${has('promo') ? tag('ok', '✓ 周报已存入资料夹') : `<button class="btn pri" data-act="save" data-k="promo">存入资料夹</button>`}</div>`);
  else if (t === 'itv') { const I = D.interview; body = aiBlock('itv', 'AI 生成采访备忘卡', '宣传期采访一个接一个。AI 根据角色分析、训练记录和粉丝热议，提前准备可能被问到的问题和要点。', () => `
    <div class="card"><div class="result-head"><h3>采访备忘卡 · ${I.media}</h3>${demoTag()}</div>
      <div class="grid3"><div><b>可能被问到</b><ul class="list mt8">${I.qs.map(q => `<li class="small">“${q}”</li>`).join('')}</ul></div>
      <div><b>可以讲的要点</b><ul class="list mt8">${I.keys.map(q => `<li class="small">✓ ${q}</li>`).join('')}</ul></div>
      <div><b>不展开的话题</b><ul class="list mt8">${I.avoid.map(q => `<li class="small">✕ ${q}</li>`).join('')}</ul></div></div>
      <p class="note">要点来自资料夹：角色分析卡、舞蹈训练记录、粉丝反馈周报。口径以宣传团队确认为准。</p></div>`); }
  else body = `<div class="result-head"><h3>舆情信号</h3><span class="muted small">只做归类和提醒，处置由人决定</span></div>
    ${D.signals.map(s => `<div class="alert mt8" style="${s.lv === 'warn' ? 'border-color:color-mix(in srgb,var(--warn) 55%,transparent);background:color-mix(in srgb,var(--warn) 10%,transparent)' : ''}"><div class="row">${tag(s.lv, s.t)}<b>${s.d}</b></div><p class="small mt8">建议：${s.s}</p></div>`).join('')}
    <p class="note">AI 不会把网络传闻当成事实，也不会替团队对外回应。</p>`;
  return `${hero(D.stations[5])}${tabs(5, [['cmt', '留言分类与回复'], ['rep', '运营反馈'], ['itv', '采访备忘卡'], ['sig', '舆情信号']])}${body}
  ${next(5, '剧火了，品牌找上门。下一站处理<b>商业合作与授权</b>')}`;
}

/* ---------------- 第7站：商务 ---------------- */
function vDeal() {
  const O = D.offer, sc = D.scopes[S.scope];
  return `${hero(D.stations[6])}
  <div class="inbox"><div class="env">💼</div><div style="flex:1"><b>合作邀约：${O.brand}</b><p class="small muted">${O.type} · ${O.ask} · ${O.term}</p></div>${tag('warn', '涉及数字人')}</div>
  <div class="grid2 mt">
    <div>${aiBlock('brand', 'AI 核验品牌信息', '行业信息助手先检索这家品牌的公开信息，每一条都标清来源。网络传闻不当成事实。', () => `
      <div class="card"><div class="result-head"><h3>品牌背景简报</h3>${demoTag()}</div>
      ${D.sources.map(s => `<div class="src">${tag(s.lv, s.tag)}<div><b>${s.t}</b><p class="small muted">来源：${s.from}</p></div></div>`).join('')}</div>`)}</div>
    <div class="card"><h3>相关法规提示</h3><ul class="list mt8">${D.laws.map(l => `<li class="small">${l}</li>`).join('')}</ul><p class="note">仅作知识提示，不替代专业法律意见。合同条款以律师审核为准。</p></div>
  </div>
  <div class="card mt">
    <div class="result-head"><div><h3>授权边界核对</h3><p class="sub">同一份肖像、声音和表演，用途不同，要问的问题也不同。</p></div>
      <div class="opt" style="margin:0">${Object.entries(D.scopes).map(([k, v]) => `<button data-act="scope" data-v="${k}" class="${S.scope === k ? 'on' : ''}">${v.n}</button>`).join('')}</div></div>
    ${aiBlock('rights', 'AI 逐项核对授权', '按肖像、声音、表演数据、生成内容、商业授权五个方面，结合这次的用途逐项核对。', () => `
      <p class="small">当前用途：<b>${sc.n}</b> — ${sc.d}</p>
      <div class="dims mt">${D.dims.map(d => { const lv = sc.lv[d.id]; return `<div class="dim" style="border-top:4px solid var(--${lv === 'ok' ? 'ok' : lv === 'warn' ? 'warn' : 'bad'})"><span class="ic">${d.ic}</span><b>${d.n}</b>${tag(lv, D.lvText[lv])}${d.q.map(q => `<p>· ${q}</p>`).join('')}</div>`; }).join('')}</div>
      <div class="row mt" style="justify-content:space-between"><span class="small muted">${demoTag()}　清单交经纪人与律师审核，最终是否合作由本人和团队决定。</span>
      ${has('deal') ? tag('ok', '✓ 授权核对清单已存入资料夹') : `<button class="btn pri" data-act="save" data-k="deal">生成授权核对清单</button>`}</div>`)}
  </div>
  ${next(6, '合作谈完，戏也杀青了。最后一站：<b>复盘与下一步</b>')}`;
}

/* ---------------- 第8站：复盘 ---------------- */
function planView() {
  return `<div class="card"><h3>年度目标进度</h3><div class="grid3 mt8">${D.goals.map(g => `<div><b>${g.g}</b><div class="bar mt8"><i style="width:${g.p}%"></i></div><p class="small muted mt8">${g.s}</p></div>`).join('')}</div></div>
    <div class="card"><h3>2027 档期与学习安排</h3>
      <div class="year">${Array.from({ length: 12 }, (_, i) => `<span class="m">${i + 1}月</span>`).join('')}</div>
      ${D.lanes.map(l => `<div class="lane">${l.items.map(([a, b, n, c]) => `<span class="ev ${c}" style="grid-column:${a}/${b + 1};${c === 'empty' ? 'border:1px dashed var(--muted);background:none' : ''}">${l.n} · ${n}</span>`).join('')}</div>`).join('')}</div>
    <div class="card">${aiBlock('plan', 'AI 生成下一阶段行动清单', 'AI 结合这部戏的复盘、年度目标和档期，给出下一阶段的行动建议。最终取舍由本人和团队决定。', () => `
      <div class="result-head"><h3>下一阶段行动清单</h3>${demoTag()}</div>
      ${D.actions.map((a, i) => `<label class="chk"><input type="checkbox" data-act="check" data-i="${i}" ${S.checks[i] ? 'checked' : ''}><span>${a}</span></label>`).join('')}
      <div class="row mt" style="justify-content:space-between"><span class="small muted">AI 提供结构和备选方案，勾选与否由你和团队决定。</span>${has('review') ? tag('ok', '✓ 已存入资料夹') : `<button class="btn pri" data-act="save" data-k="review">存入资料夹</button>`}</div>`)}</div>`;
}
function vReview() {
  const t = tab(7, 'look');
  let body;
  if (t === 'look') body = `<div class="grid2">
    <div class="card"><h3>这部戏留下了什么</h3><p class="sub">自动汇总自资料夹（${S.folder.length} 项）</p>
      <ul class="list mt8">${S.folder.length ? S.folder.map(k => `<li class="row" style="justify-content:space-between"><span><span class="tag">${D.stations[FOLDER[k].st].name}</span> ${FOLDER[k].t}</span><button class="btn sm" data-act="go" data-i="${FOLDER[k].st}">查看</button></li>`).join('') : '<li class="muted small">资料夹还是空的，前面几站走一遍就会出现在这里。</li>'}</ul></div>
    <div><div class="card"><h3>杀青后续 · 别断了跟踪</h3><ul class="list mt8">${D.wrapup.map(([k, t, w, lv]) => `<li class="small row" style="justify-content:space-between"><span>${tag(lv, k)} ${t}</span><span class="muted">${w}</span></li>`).join('')}</ul></div>
    <div class="card"><h3>做得好的</h3><ul class="list mt8">${D.wins.map(w => `<li class="small">✓ ${w}</li>`).join('')}</ul></div>
    <div class="card"><h3>下次可以更好的</h3><ul class="list mt8">${D.improve.map(w => `<li class="small">→ ${w}</li>`).join('')}</ul></div></div></div>`;
  else if (t === 'data') body = aiBlock('airdata', 'AI 汇总播出数据与口碑', '汇总这部戏的播出热度、口碑评分、观众热议和你的粉丝增长，看清观众记住了什么。', () => { const A = D.air, mx = Math.max(...A.heat); return `
    <div class="grid4 kpis">${A.kpi.map(k => `<div class="kpi"><small>${k[0]}</small><b>${k[1]}<em>${k[2]}</em></b><span class="small muted">${k[3]}</span></div>`).join('')}</div>
    <div class="grid2 mt"><div class="card"><div class="result-head"><h3>32 集热度曲线</h3>${demoTag()}</div>
      <svg viewBox="0 0 640 190" class="wxchart"><path class="curve" d="${A.heat.map((v, i) => `${i ? 'L' : 'M'}${30 + i * 18.5},${160 - v / mx * 130}`).join(' ')}"/>${A.marks.map(([e, t]) => `<line x1="${30 + (e - 1) * 18.5}" x2="${30 + (e - 1) * 18.5}" y1="20" y2="160" stroke="var(--line)" stroke-dasharray="4 4"/><text x="${30 + (e - 1) * 18.5}" y="14" text-anchor="middle" font-size="11" class="rel-label">第${e}集 ${t}</text>`).join('')}<text x="30" y="182" font-size="11" class="rel-label">第1集</text><text x="604" y="182" font-size="11" class="rel-label" text-anchor="end">第32集</text></svg></div>
    <div class="card"><h3>观众记住了什么</h3><div class="bars2 mt8">${A.topics.map(([n, v]) => `<div style="grid-template-columns:120px 1fr 40px"><span>${n}</span><i><b style="width:${v}%"></b></i><span>${v}%</span></div>`).join('')}</div>
      <h3 class="mt">口碑关键词</h3><div class="row mt8">${A.words.map((w, i) => `<span class="tag ${i < 4 ? 'ok' : ''}">${w}</span>`).join('')}</div></div></div>`; });
  else if (t === 'self') { S.selfAns = S.selfAns || {}; body = `<div class="grid2"><div class="card"><h3>表演自评</h3><p class="sub">AI 提问，你来回答；写下来的，才是真正留下的</p>
      ${D.selfQ.map((q, i) => `<div class="field"><label>${i + 1}. ${q}</label><textarea data-self="${i}" rows="2" placeholder="写下你的想法…">${S.selfAns[i] || ''}</textarea></div>`).join('')}</div>
    <div><div class="card"><h3>导演与搭档的反馈</h3><ul class="list small mt8">${D.feedback.map(f => `<li><b>${f[0]}</b>：“${f[1]}”</li>`).join('')}</ul></div>
      <div class="card mt">${aiBlock('selfrev', 'AI 总结：带进下一部戏的三件事', '结合你的自评、导演反馈和观众口碑，总结这部戏最值得带走的经验。', () => `<div class="result-head"><h3>带进下一部戏的三件事</h3>${demoTag()}</div><ol class="small" style="padding-left:18px;margin:0">${D.takeaway.map(x => `<li style="margin:6px 0">${x}</li>`).join('')}</ol>
        <div class="row mt">${has('review') ? tag('ok', '✓ 作品复盘已存入资料夹') : `<button class="btn pri" data-act="save" data-k="review">存入资料夹</button>`}</div>`)}</div></div></div>`; }
  return `${hero(D.stations[7])}${tabs(7, [['look', '作品复盘'], ['data', '播出与口碑'], ['self', '表演自评']])}${body}
  <div class="next"><div class="carry">一部戏走完了：<b>资料夹 ${S.folder.length}/${Object.keys(FOLDER).length}</b>。下一部戏，从“接本”重新开始。</div>
  <div class="row"><button class="btn" data-act="go" data-i="6">← 上一站</button><button class="btn pri" data-act="export">导出整部戏资料包</button></div></div>`;
}

/* ---------------- 作品库与发展定位 ---------------- */
function radar2(rows) {
  const n = rows.length, R = 120, cx = 170, cy = 158, pt = (i, r) => [cx + r * Math.sin(i / n * 2 * Math.PI), cy - r * Math.cos(i / n * 2 * Math.PI)];
  const poly = (k) => rows.map((r, i) => pt(i, R * r[k] / 100).join(',')).join(' ');
  return `<svg viewBox="0 0 340 320" class="radar2">${[1, .75, .5, .25].map(f => `<polygon points="${rows.map((_, i) => pt(i, R * f).join(',')).join(' ')}" class="rg"/>`).join('')}
    ${rows.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" class="rg"/>`).join('')}
    <polygon points="${poly(2)}" class="rt"/><polygon points="${poly(1)}" class="rv"/>
    ${rows.map((r, i) => { const [x, y] = pt(i, R + 22); return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11.5" class="rel-label">${r[0]}</text>`; }).join('')}</svg>`;
}
function vPortfolio() {
  const P = D.portfolio, H = P.heat;
  const genres = {}; P.works.forEach(w => { const g = w[2].split(' · ')[0]; genres[g] = (genres[g] || 0) + 1; });
  const hc = v => `color-mix(in srgb,var(--accent) ${Math.round((v - 40) / 60 * 85)}%,var(--panel2))`;
  return `<section class="hero has-img" style="--img:url('assets/photos/20_award.jpg')"><div class="eyebrow">MY WORKS & DIRECTION</div><h1>作品库与发展规划</h1>
    <p>把演过的每一部戏导进来，和你的年龄、气质、体态、声线放在一起，AI 帮你看清：最适合什么题材、什么角色，下一步往哪走。</p>
    <div class="needs"><span class="need">个人作品库</span><span class="need">自我画像</span><span class="need">多维能力雷达</span><span class="need">题材 × 角色适配</span><span class="need">发展路线</span></div></section>
  <div class="card"><div class="result-head"><div><h3>我的作品时间轴</h3><p class="sub">${P.works.length} 部作品 · 可以导入片单、剧照、评分和评价</p></div><label class="btn sm" style="cursor:pointer">📥 导入作品<input type="file" id="rvFile" multiple hidden></label></div>
    <div class="works">${P.works.map(w => `<div class="wk"><span class="wy">${w[0]}</span><b>《${w[1]}》</b><small>${w[2]}</small><small>${w[3]}</small>${w[4] ? `<span class="ws ${w[4] >= 8 ? 'hi' : w[4] < 7 ? 'lo' : ''}">${w[4]}</span>` : '<span class="ws now">拍摄中</span>'}</div>`).join('')}</div>
    <div class="row mt8">${Object.entries(genres).map(([g, c]) => `<span class="tag">${g} × ${c}</span>`).join('')}<span class="small muted">口碑为示例评分</span></div></div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>多维能力与市场雷达</h3><div class="legend"><span><i style="background:var(--accent)"></i>现在</span><span><i style="background:var(--hi)"></i>3 年目标</span></div></div>${radar2(P.radar)}</div>
    <div class="card"><h3>自我画像</h3><p class="sub">由本人和团队填写，AI 只做参考</p>
      <dl class="kv mt8" style="grid-template-columns:76px 1fr">${P.self.map(s => `<dt>${s[0]}</dt><dd>${s[1]}</dd>`).join('')}</dl>
      <h3 class="mt">题材 × 角色 适配度</h3>
      <table class="heat mt8"><tr><th></th>${H.cols.map(c => `<th>${c}</th>`).join('')}</tr>${H.rows.map((r, i) => `<tr><th>${r}</th>${H.v[i].map(v => `<td style="background:${hc(v)}">${v}</td>`).join('')}</tr>`).join('')}</table></div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>AI 发展建议</h3><p class="sub">结合作品口碑、自我画像和当前邀约</p></div></div>
    ${aiBlock('port', 'AI 综合分析', '读取全部作品的题材、角色和口碑，结合年龄、气质、体态、声线，给出最适合的方向、要谨慎的方向和发展路线。', () => `
      <div class="grid2"><div class="flag ok"><b>✓ 最适合</b>${P.best.map(b => `<p class="small">· ${b}</p>`).join('')}</div><div class="flag warn"><b>! 谨慎</b>${P.careful.map(b => `<p class="small">· ${b}</p>`).join('')}</div></div>
      <div class="roadmap mt">${P.road.map((r, i) => `<div class="rm"><span>${i + 1}</span><b>${r[0]}</b><p class="small">${r[1]}</p></div>`).join('')}</div>
      <p class="note">${demoTag()}　接什么、往哪走，最终由本人和团队决定。新剧本到来时，「接本」会自动对照这里的定位。</p>`)}
  </div>
  <div class="section-title mt"><h2>年度规划</h2><p class="small muted">目标、档期与学习安排，下一阶段的行动清单</p></div>
  ${planView()}`;
}

/* ---------------- 危机公关与舆情 ---------------- */
function vCrisis() {
  const C = D.crisis, E = C.event, mx = Math.max(...C.volume);
  const W = 600, H = 170, xs = i => 30 + i * (W - 60) / (C.volume.length - 1), ys = v => 140 - v / mx * 115;
  return `<section class="hero has-img" style="--img:url('assets/photos/27_comments.jpg')"><div class="eyebrow">CRISIS & REPUTATION</div><h1>危机公关与舆情</h1>
    <p>风吹草动，第一时间知道。AI 帮你监测声量、判断性质、比较回应方案、起草声明；先核实，再回应，发不发、怎么发，由人决定。</p>
    <div class="needs"><span class="need">舆情监测</span><span class="need">预警分级</span><span class="need">事件研判</span><span class="need">回应方案</span><span class="need">声明起草</span><span class="need">预案库</span></div></section>
  <div class="grid4 kpis">
    <div class="kpi"><small>当前预警</small><b class="warn-t">${C.level[0]}</b><span class="small muted">1 个事件在扩散</span></div>
    <div class="kpi"><small>今日声量指数</small><b>${C.volume[6]}</b><span class="small warn-t">约为平时的 9 倍</span></div>
    <div class="kpi"><small>负面占比</small><b>${C.mood.neg}<em>%</em></b><div class="bar"><i style="width:${C.mood.neg}%;background:var(--bad)"></i></div></div>
    <div class="kpi"><small>响应团队</small><b>${C.team.length}<em>人在线</em></b><span class="small muted">经纪 · 公关 · 律师 · 安保</span></div>
  </div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>全网声量 · 近 7 天</h3>${tag('demo', '示例数据')}</div>
      <svg viewBox="0 0 ${W} ${H}" class="wxchart"><path d="${C.volume.map((v, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(v)}`).join(' ')} L${xs(6)},140 L${xs(0)},140 Z" fill="color-mix(in srgb,var(--bad) 18%,transparent)"/>
        <path class="curve" style="stroke:var(--bad)" d="${C.volume.map((v, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(v)}`).join(' ')}"/>
        ${C.volume.map((v, i) => `<circle class="pt" style="stroke:var(--bad)" cx="${xs(i)}" cy="${ys(v)}" r="4"/><text x="${xs(i)}" y="160" text-anchor="middle" font-size="11" class="rel-label">${C.days[i]}</text>`).join('')}
        <text x="${xs(5) - 6}" y="${ys(96) - 12}" text-anchor="end" font-size="12" font-weight="600" fill="var(--bad)">传闻出现</text></svg></div>
    <div class="card"><h3>事件时间线 · ${E.t}</h3><p class="sub">${E.type} · ${E.heat}</p>
      <ol class="tl mt8">${E.timeline.map(x => `<li><span class="tm" style="width:76px">${x[0]}</span><i style="background:${x[1] === '待决定' ? 'var(--warn)' : x[1] === '核实' ? 'var(--ok)' : 'var(--bad)'}"></i><span><b>${x[1]}</b>　${x[2]}</span></li>`).join('')}</ol></div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>AI 事件研判与回应方案</h3><p class="sub">先把事情看清楚，再决定怎么说</p></div></div>
    ${aiBlock('crisis', 'AI 研判并起草回应', '判断事件性质与传播趋势、评估对你的影响、比较三种回应方式，并起草一份声明供团队审核。', () => `
      <div class="grid4">${E.judge.map(j => `<div class="leg"><small class="muted">${j[0]}</small><p class="mt8"><b>${j[1]}</b></p></div>`).join('')}</div>
      <h4 class="mt" style="font:600 15px var(--serif)">三种回应方式</h4>
      <div class="grid3 mt8">${E.options.map(o => `<div class="flag ${o[2]}"><b>${o[0]}</b><p class="small">${o[1]}</p>${o[2] === 'ok' ? '<span class="tag ok mt8">AI 推荐</span>' : ''}</div>`).join('')}</div>
      <h4 class="mt" style="font:600 15px var(--serif)">声明草稿</h4><div class="draft mt8">${E.draft}</div>
      <div class="gate">🔒 AI 只起草，不会自动发布。是否回应、用哪种方式、什么时候发，由经纪人和本人在下方「人工复核 · 最终决定」写下结论。</div>`)}
  </div>
  <div class="grid2 mt">
    <div class="card"><h3>危机预案库</h3><p class="sub">常见情况，提前想好怎么做</p>
      ${C.playbook.map(p => `<div class="rule"><span>${p[0]}</span><div><b>${p[1]}</b><p class="small muted">${p[2]}</p></div></div>`).join('')}</div>
    <div><div class="card"><h3>危机响应小组</h3><div class="grid3 mt8">${C.team.map(t => `<div class="leg"><b>${t[0]}</b><p class="small muted">${t[1]}</p></div>`).join('')}</div></div>
      <div class="card mt"><h3>处理原则</h3><ul class="list small mt8">${C.principles.map(p => `<li>✓ ${p}</li>`).join('')}</ul>
        <h3 class="mt">过往事件复盘</h3><ul class="list small mt8">${C.history.map(h => `<li><b>${h[0]}</b> · ${h[1]}<br><span class="muted">${h[2]}</span></li>`).join('')}</ul></div></div>
  </div>`;
}

/* ---------------- 合同与品牌 ---------------- */
function radar(scores) {
  const n = scores.length, R = 70, cx = 90, cy = 88, pt = (i, r) => [cx + r * Math.sin(i / n * 2 * Math.PI), cy - r * Math.cos(i / n * 2 * Math.PI)];
  const ring = f => scores.map((_, i) => pt(i, R * f).join(',')).join(' ');
  return `<svg viewBox="0 0 180 180" class="radar"><polygon points="${ring(1)}" class="rg"/><polygon points="${ring(.66)}" class="rg"/><polygon points="${ring(.33)}" class="rg"/>
    <polygon points="${scores.map((s, i) => pt(i, R * s[1] / 100).join(',')).join(' ')}" class="rv"/>
    ${scores.map((s, i) => { const [x, y] = pt(i, R + 14); return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="9.5" class="rel-label">${s[0]}</text>`; }).join('')}</svg>`;
}
function vDeals() {
  const X = D.deals, o = X.offers[S.offer || 0];
  const cats = X.brands.map(b => b.cat);
  return `<section class="hero has-img" style="--img:url('assets/photos/14_rights.jpg')"><div class="eyebrow">CONTRACTS & BRANDS</div><h1>合同与品牌</h1>
    <p>合同、证件、作品资料都放在一个地方；正在代言的品牌、交付进度、到期时间一目了然。新的代言找上门，AI 先做背调、给出评估，最后由人决定接不接。</p>
    <div class="needs"><span class="need">资料库</span><span class="need">合同库</span><span class="need">AI 条款审阅</span><span class="need">代言品牌管理</span><span class="need">品牌背调</span><span class="need">该不该接</span></div></section>
  <div class="vault">${X.vault.map(v => `<div class="vt"><span>${v[0]}</span><b>${v[1]}</b><small>${v[2]} 份</small></div>`).join('')}<label class="vt add"><span>📥</span><b>导入资料</b><small>PDF · Word · 图片</small><input type="file" id="rvFile" multiple hidden></label></div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>合同库</h3>${tag('demo', '示例数据')}</div>
      ${X.contracts.map(c => `<div class="ct"><div class="row" style="justify-content:space-between"><span class="row"><span class="tag">${c.type}</span><b>${c.n}</b></span>${tag(c.lv, c.st)}</div><p class="small muted">${c.party} · 到期 ${c.end}</p><div class="row mt8">${c.keys.map(k => `<span class="chipk">${k}</span>`).join('')}</div></div>`).join('')}</div>
    <div class="card"><div class="result-head"><div><h3>AI 条款审阅</h3><p class="sub">${X.draft.n}</p></div></div>
      ${aiBlock('clause', 'AI 审阅合同草案', '逐条读合同：排他范围、内容使用期限、AI 生成条款、违约责任、付款节点，标出对你不利的地方。', () => `${X.draft.flags.map(f => `<div class="flag ${f[0]}"><b>${{ ok: '✓', warn: '!', bad: '✕' }[f[0]]} ${f[1]}</b><p class="small">${f[2]}</p></div>`).join('')}
        <p class="note">${demoTag()}　AI 只标出风险、给出修改方向。合同以律师审核为准。</p>`)}</div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>正在代言的品牌</h3><p class="sub">交付进度、到期提醒、品类占用</p></div><span class="small muted">已占用品类：${cats.join(' · ')}</span></div>
    <div class="grid3">${X.brands.map(b => `<div class="leg"><div class="row" style="justify-content:space-between"><b>${b.n}</b><span class="tag">${b.cat}</span></div><p class="small muted">${b.role} · 到期 ${b.end}</p>
      ${b.dl.map(d => `<div class="dlr"><span>${d[0]}</span><div class="bar"><i style="width:${d[1] / d[2] * 100}%"></i></div><span class="small">${d[1]}/${d[2]}</span></div>`).join('')}
      <div class="row mt8" style="justify-content:space-between"><span class="small ${b.left < 90 ? 'warn-t' : 'muted'}">${b.left < 90 ? '⏰ ' : ''}${b.left} 天后到期</span><span class="small muted">合作评分 ${b.score}</span></div></div>`).join('')}</div></div>
  <div class="card mt"><div class="result-head"><div><h3>新的代言邀约 · 该不该接？</h3><p class="sub">AI 背调 + 评估，最后由人复核决定</p></div>
    <div class="opt" style="margin:0">${X.offers.map((x, i) => `<button data-act="offer" data-i="${i}" class="${(S.offer || 0) === i ? 'on' : ''}">${x.n}</button>`).join('')}</div></div>
    <p class="small muted">${o.cat} · ${o.role} · 报价${o.fee}</p>
    ${aiBlock('offer' + (S.offer || 0), `AI 背调并评估「${o.n}」`, '查工商、司法、产品抽检、舆情、过往代言人、广告合规，再对照你的形象、粉丝构成、现有排他和档期，给出建议。', () => `
      <div class="offer-g"><div>${radar(o.scores)}<div class="verdict ${o.verdict[0]}">${o.verdict[1]}</div></div>
        <div><h4 class="small muted" style="margin-bottom:6px">品牌背调</h4>${o.check.map(c => `<div class="src">${tag(c[0], { ok: '正常', warn: '需核实', bad: '风险' }[c[0]])}<div><b>${c[1]}</b><p class="small muted">${c[2]}</p></div></div>`).join('')}</div></div>
      <p class="note">${demoTag()}　正式版接入企业信用、裁判文书、市场监管抽检和舆情数据，并附原始链接。<b>接不接，请在下方「人工复核 · 最终决定」写下结论。</b></p>`)}
  </div>`;
}

/* ---------------- 行业简报 ---------------- */
function vBrief() {
  return `<section class="hero has-img" style="--img:url('assets/photos/13_press.jpg')"><div class="eyebrow">INDUSTRY BRIEFING</div><h1>行业简报</h1>
    <p>影视、舞蹈、音乐、时尚、AI 内容、行业活动、公益：每周一份，只推和你有关的。每一条都标清来源和核验状态，不把网络传闻当成事实。</p>
    <div class="needs"><span class="need">定向搜集</span><span class="need">分类摘要</span><span class="need">来源核验</span><span class="need">趋势提示</span><span class="need">合作灵感</span></div></section>
  ${aiBlock('brief', 'AI 生成本周行业简报', '围绕七个方向整理公开信息：每一条都标出来源、核验状态、和你有没有关系、建议怎么做。', briefView)}`;
}
function briefView() {
  const B = D.brief2, f = S.bf || '全部', only = !!S.bVerified;
  const items = B.items.filter(x => (f === '全部' || x.f === f) && (!only || x.lv === 'ok'));
  const cnt = k => B.items.filter(x => x.lv === k).length;
  const kw = [...B.keywords, ...(S.bKw || [])];
  return `<div class="card brief-top"><div class="result-head"><div><h3>本周行业简报</h3><p class="sub">${B.week} · 共 ${B.items.length} 条 · 已核验 ${cnt('ok')} · 示例 / 待核验 ${cnt('warn')} · 传闻 ${cnt('bad')}</p></div>${demoTag()}</div>
    <div class="ai-sum">✦ <b>AI 摘要：</b>${B.summary}</div></div>
  <div class="row mt">${['全部', '影视', '舞蹈', '音乐', '时尚', 'AI 内容', '行业活动', '公益'].map(x => `<button class="btn sm ${f === x ? 'pri' : ''}" data-act="bf" data-v="${x}">${x}</button>`).join('')}
    <label class="small muted" style="margin-left:auto;display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" data-act="bver" ${only ? 'checked' : ''}> 只看已核验</label></div>
  <div class="briefs mt8">${items.map(x => `<div class="bi ${x.lv}"><div class="row" style="justify-content:space-between"><span class="row"><span class="tag">${x.f}</span>${tag(x.lv, x.tag)}</span><span class="rel rel-${x.rel[0]}">相关度 ${x.rel[0]}</span></div>
      <h4>${x.t}</h4><p class="small muted">${x.sum}</p>
      <dl class="kv small mt8" style="grid-template-columns:62px 1fr"><dt>来源</dt><dd>${x.src}</dd><dt>和你有关</dt><dd>${x.rel[1]}</dd><dt>建议动作</dt><dd>${x.act}</dd>${x.idea ? `<dt>合作灵感</dt><dd>💡 ${x.idea}</dd>` : ''}</dl></div>`).join('') || '<p class="muted small">没有符合条件的条目</p>'}</div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>题材热度</h3><span class="small muted">近 3 个月 · 示例</span></div>
      <div class="bars2 mt8">${B.trends.map(([n, v, d]) => `<div style="grid-template-columns:110px 1fr 60px"><span>${n}</span><i><b style="width:${v}%"></b></i><span class="${d === '↑' ? 'ok-t' : d === '↓' ? 'bad-t' : 'muted'}">${d} ${v}</span></div>`).join('')}</div>
      <p class="note">热度为示例数据，正式版接入公开榜单与平台数据，按周更新。</p></div>
    <div class="card"><h3>订阅关键词</h3><p class="sub">只推送和你有关的行业信息</p>
      <div class="row mt8">${kw.map(k => `<span class="tag">#${k}</span>`).join('')}</div>
      <input class="add-item" id="kwIn" placeholder="+ 添加关键词，回车确认" style="margin-top:10px">
      <h3 class="mt">信息来源原则</h3><ul class="list small mt8">${B.rules.map(r => `<li>✓ ${r}</li>`).join('')}</ul></div>
  </div>`;
}

/* ---------------- 粉丝与社群 ---------------- */
function spark(v, c) { const m = Math.max(...v); return `<svg viewBox="0 0 120 36" class="spark"><path d="${v.map((x, i) => `${i ? 'L' : 'M'}${i * 20},${34 - x / m * 30}`).join(' ')}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/></svg>`; }
function vFans() {
  const F = D.fans, P = Object.fromEntries(F.platforms.map(p => [p.k, p]));
  const pf = S.fanPf || 'all', inbox = F.inbox.filter(m => pf === 'all' || m.p === pf);
  const maxA = Math.max(...F.portrait.age.map(a => a[1]));
  return `<section class="hero has-img" style="--img:url('assets/photos/28_fans.jpg')"><div class="eyebrow">FANS & COMMUNITY</div><h1>粉丝与社群</h1>
    <p>后援会、粉丝团、各个平台的留言，都在一个地方。AI 帮你分类、起草、排内容、提醒风险；怎么回、发什么，由人决定。真诚对待粉丝，也守住边界。</p>
    <div class="needs"><span class="need">平台矩阵</span><span class="need">后援会对接</span><span class="need">全平台留言</span><span class="need">宠粉内容日历</span><span class="need">合规与安全</span><span class="need">粉丝洞察</span></div></section>
  <div class="plats">${F.platforms.map(p => `<div class="plat"><div class="row" style="justify-content:space-between"><span class="pbadge" style="background:${p.c}">${p.n}</span>${spark(p.grow, p.c === '#1d1d1f' ? 'var(--accent)' : p.c)}</div>
    <b class="pf">${p.fans}</b><small class="muted">粉丝 · 互动率 ${p.eng}</small>
    <p class="small mt8"><b>调性：</b>${p.tone}</p><p class="small"><b>最受欢迎：</b>${p.best}</p><p class="small muted">${p.cadence}</p></div>`).join('')}</div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><div><h3>后援会与粉丝团</h3><p class="sub">谁在组织粉丝、规模多大、守不守规矩，一目了然</p></div>${tag('demo', '示例数据')}</div>
      ${F.clubs.map(c => `<div class="club"><div><div class="row"><b>${c.n}</b><span class="tag ${c.lv === 'ok' ? 'ok' : 'bad'}">${c.tag}</span></div><p class="small muted">${c.size} 人 · ${c.lead}</p><p class="small mt8">最近：${c.last}</p></div>
        <div class="score ${c.lv}"><b>${c.score}</b><small>合规分</small></div></div>`).join('')}
      <div class="gate">⚠ AI 提醒：「舞蹈数据站」发起了打榜冲刺，且未签对接规范。建议由对接人私下沟通，引导改成公益应援；不公开点名。</div></div>
    <div class="card"><h3>和粉丝相处的规矩</h3><p class="sub">对接规范，所有后援会签署后执行</p>
      <div class="mt8">${F.rules.map(r => `<div class="rule"><span>${r[0]}</span><div><b>${r[1]}</b><p class="small muted">${r[2]}</p></div></div>`).join('')}</div></div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>全平台留言 · 一个收件箱</h3><p class="sub">微博、抖音、小红书、B站的留言汇在一起，AI 按平台调性起草回复</p></div>
    <div class="opt" style="margin:0"><button data-act="fanpf" data-v="all" class="${pf === 'all' ? 'on' : ''}">全部</button>${F.platforms.map(p => `<button data-act="fanpf" data-v="${p.k}" class="${pf === p.k ? 'on' : ''}">${p.n}</button>`).join('')}</div></div>
    <div class="inbox2">${inbox.map((m, i) => `<div class="msg"><div class="row" style="justify-content:space-between"><span class="row"><span class="pbadge sm" style="background:${P[m.p].c}">${P[m.p].n}</span><b>${m.u}</b></span>${tag(m.lv, m.c)}</div>
      <p class="mt8">${m.t}</p><div class="reply"><small>✦ AI 草稿 · ${P[m.p].tone.split('、')[0]}</small>${m.r}</div>
      <div class="row mt8">${(S.fanOk || {})[m.u] ? tag('ok', '✓ 已提交审核') : m.lv === 'bad' ? `<button class="btn sm" data-act="fanok" data-v="${m.u}">转安保 / 工作室</button>` : `<button class="btn sm pri" data-act="fanok" data-v="${m.u}">提交审核</button><button class="btn sm" data-act="toast" data-msg="已打开编辑（演示）">修改</button>`}</div></div>`).join('')}</div>
    <p class="note">AI 只起草，不自动回复、不自动发布。正式版通过各平台开放接口或工作室账号授权读取留言。</p></div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><div><h3>宠粉内容日历 · 本周</h3><p class="sub">用粉丝真正关心的内容，持续给惊喜</p></div></div>
      ${aiBlock('fanplan', 'AI 生成本周内容排期', '根据各平台的热议话题和粉丝提问，排出一周的内容：每一条都回应一个真实的期待。', () => `<div class="fplan">${F.plan.map(p => `<div class="fp"><b>${p[0]}</b><span class="pbadge sm" style="background:${P[p[1]].c}">${P[p[1]].n}</span><span>${p[2]}</span><small class="muted">${p[3]}</small></div>`).join('')}</div>
        <p class="note">${demoTag()}　内容由宣传团队制作、本人确认后发布。</p>`)}</div>
    <div class="card"><h3>粉丝洞察</h3><p class="sub">谁在喜欢你、他们在聊什么</p>
      <div class="bars2 mt8">${F.portrait.age.map(a => `<div><span>${a[0]}</span><i><b style="width:${a[1] / maxA * 100}%"></b></i><span>${a[1]}%</span></div>`).join('')}</div>
      <p class="small mt"><b>城市 TOP 6：</b>${F.portrait.city.join(' · ')}</p>
      <div class="row mt8">${F.portrait.topics.map((t, i) => `<span class="tag" style="font-size:${13 + (6 - i) * 1.2}px">#${t}</span>`).join('')}</div>
      <div class="gate mt">✦ 18 岁以下粉丝约 6%：相关活动不设置任何消费门槛。</div></div>
  </div>`;
}

/* ---------------- 公益与影响力 ---------------- */
function vCharity() {
  const C = D.charity, P = C.projects;
  const maxM = Math.max(...C.months.map(m => m[1]));
  return `<section class="hero has-img" style="--img:url('assets/photos/22_charity.jpg')"><div class="eyebrow">CHARITY & IMPACT</div><h1>公益与影响力</h1>
    <p>把热爱变成看得见的善意。参与过哪些公益、下一步做什么、机构靠不靠谱、粉丝怎么一起参与，都在这里，透明、可追溯。</p>
    <div class="needs"><span class="need">公益项目</span><span class="need">机构核验</span><span class="need">粉丝公益联动</span><span class="need">公益日历</span><span class="need">年度公益报告</span></div></section>
  <div class="grid4 kpis">${C.kpi.map(k => `<div class="kpi"><small>${k[0]}</small><b>${k[1]}<em>${k[2]}</em></b><span class="small muted">${k[3]}</span></div>`).join('')}</div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>正在参与的公益</h3>${tag('demo', '示例数据')}</div>
      ${P.map(p => `<div class="cproj"><div class="cimg" style="background-image:url('assets/photos/${p.img}.jpg')"></div><div><div class="row" style="justify-content:space-between"><b>${p.n}</b>${tag(p.lv, p.st)}</div>
        <p class="small muted">${p.org} · ${p.role}</p><div class="bar mt8"><i style="width:${p.p}%"></i></div><p class="small mt8">下一步：${p.next}</p></div></div>`).join('')}</div>
    <div>
      <div class="card"><div class="result-head"><h3>公益足迹</h3><span class="small muted">近 12 个月 · 参与次数</span></div>
        <svg viewBox="0 0 600 170" class="wxchart">${C.months.map(([m, v], i) => { const h = v / maxM * 110, x = 20 + i * 48; return `<rect x="${x}" y="${130 - h}" width="28" height="${h}" rx="5" fill="var(--hi)" class="grow" style="animation-delay:${i * 40}ms"/><text x="${x + 14}" y="${124 - h}" text-anchor="middle" font-size="11" class="rel-label">${v || ''}</text><text x="${x + 14}" y="152" text-anchor="middle" font-size="11" class="rel-label">${m}</text>`; }).join('')}</svg></div>
      <div class="card mt"><h3>公益日历</h3><p class="sub">提前规划，不临时起意</p>
        <ul class="list small mt8">${C.days.map(d => `<li class="row" style="justify-content:space-between"><span><b>${d[0]}</b>　${d[1]}</span><span class="muted">${d[2]}</span></li>`).join('')}</ul></div>
    </div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>AI 公益机构核验</h3><p class="sub">合作前先查清楚：登记、资质、财务公开、过往项目、舆情</p></div></div>
    <div class="row" style="flex-wrap:nowrap"><input class="add-item" id="orgIn" style="margin:0;flex:1" placeholder="输入机构名称，例如：某某乡村阅读公益基金会" value="${S.orgQ || '星光乡村阅读公益基金会（示例）'}"><button class="btn pri ai" data-act="run" data-k="orgcheck">AI 核验</button></div>
    <div class="mt" ${S.ran.orgcheck ? '' : 'data-ai="orgcheck"'}>${S.ran.orgcheck ? `<div class="${freshKey === 'orgcheck' ? 'reveal' : ''}"><div class="grid3">${C.check.map(c => `<div class="leg"><div class="row" style="justify-content:space-between"><b>${c[0]}</b>${tag(c[2], c[3])}</div><p class="small muted mt8">${c[1]}</p></div>`).join('')}</div>
      <p class="note">${demoTag()}　正式版会到民政部「慈善中国」平台查询登记信息与年报，并附原始链接。演示中的机构为虚构。最终是否合作，由本人和团队决定。</p></div>` : '<p class="small muted">点击「AI 核验」，逐项检查这家机构。</p>'}</div>
  </div>
  <div class="grid2 mt">
    <div class="card"><h3>粉丝公益联动</h3><p class="sub">把粉丝的心意，引到正规、透明的地方</p>
      <ul class="list small mt8">${C.fanRules.map(r => `<li>✓ ${r}</li>`).join('')}</ul>
      ${aiBlock('fanpost', 'AI 起草倡议文案', '为下一次粉丝公益活动起草一份倡议，发布前需要工作室审核。', () => `<div class="draft">${C.fanPost}</div><div class="gate">🔒 AI 只起草，不会自动发布。以艺人名义发起的公益，需要本人和工作室确认。</div>`)}</div>
    <div class="card"><h3>AI 公益方向建议</h3><p class="sub">从作品、角色和生活里，找到真正有共鸣的方向</p>
      <div class="mt8">${C.match.map(m => `<div class="leg" style="margin-bottom:10px"><b>${m[0]}</b><p class="small muted mt8">${m[1]}</p></div>`).join('')}</div></div>
  </div>`;
}

/* ---------------- 身体与状态 ---------------- */
const KCAL = [['鸡胸', 165, '100克'], ['牛肉', 190, '100克'], ['三文鱼', 208, '100克'], ['虾', 100, '100克'], ['鸡蛋', 70, '个'], ['米饭', 116, '100克'], ['燕麦', 150, '40克'], ['红薯', 90, '100克'], ['玉米', 110, '根'], ['面条', 280, '碗'], ['馒头', 220, '个'], ['西兰花', 35, '100克'], ['沙拉', 120, '份'], ['蔬菜', 40, '份'], ['苹果', 95, '个'], ['香蕉', 105, '根'], ['酸奶', 140, '杯'], ['牛奶', 130, '盒'], ['豆浆', 80, '杯'], ['美式', 10, '杯'], ['拿铁', 190, '杯'], ['奶茶', 350, '杯'], ['蛋白棒', 200, '根'], ['坚果', 160, '小把'], ['火锅', 900, '顿'], ['炸鸡', 600, '份'], ['蛋糕', 350, '块'], ['盒饭', 750, '份'], ['粥', 120, '碗']];
function guessKcal(t) {
  const hit = KCAL.filter(([k]) => t.includes(k));
  const n = +(t.match(/(\d+)/) || [])[1] || 1;
  if (!hit.length) return { k: 300, how: '没有识别到常见食物，按一份约 300 千卡估算' };
  const k = hit.reduce((a, [, v, u]) => a + v * (u === '100克' && n > 20 ? n / 100 : (u !== '100克' && n < 10 ? n : 1)), 0);
  return { k: Math.round(k), how: hit.map(([k, v, u]) => `${k} 约 ${v} 千卡/${u}`).join('，') };
}
function vBody() {
  const B = D.body, today = new Date();
  const meals = [...B.meals, ...(S.meals || [])], intake = meals.reduce((a, m) => a + m.k, 0);
  const burn = B.bmr + B.workouts.reduce((a, w) => a + w.k, 0) + (S.extraBurn || 0);
  const w = B.weights, n = w.length, wNow = w[n - 1], wWeek = w[n - 8];
  const W = 640, H = 210, xs = i => 40 + i * (W - 60) / (n - 1), lo = Math.min(...w, B.target[0]) - .4, hi = Math.max(...w, B.target[1]) + .4, ys = v => 170 - (v - lo) / (hi - lo) * 150;
  const dd = i => { const x = new Date(today); x.setDate(x.getDate() - (n - 1 - i)); return `${x.getMonth() + 1}/${x.getDate()}`; };
  const wk = B.week, maxK = Math.max(...wk.map(d => Math.max(d[1], d[2])));
  const ck = S.check || {};
  return `<section class="hero has-img" style="--img:url('assets/photos/19_body.jpg')"><div class="eyebrow">BODY & CONDITION</div><h1>身体与状态</h1>
    <p>身材、精力、嗓音、睡眠，都会出现在镜头里。按角色的要求，把每天的体重、饮食、运动和状态记下来，AI 帮你看趋势、给建议。</p>
    <div class="needs"><span class="need">体重趋势</span><span class="need">摄入与消耗</span><span class="need">运动记录</span><span class="need">角色体态</span><span class="need">睡眠与嗓音</span></div></section>
  <div class="gate" style="margin-top:0;margin-bottom:14px">🔒 身体数据只有本人可见，默认不同步给团队。体重和饮食管理请在营养师 / 医生指导下进行，不建议极端节食。</div>
  <div class="grid4 kpis">
    <div class="kpi"><small>今日体重</small><b>${wNow.toFixed(1)}<em>kg</em></b><span class="small ${wNow - wWeek <= 0 ? 'muted' : 'warn-t'}">比 7 天前 ${(wNow - wWeek > 0 ? '+' : '') + (wNow - wWeek).toFixed(1)} kg · 目标 ${B.target[0]}–${B.target[1]}</span></div>
    <div class="kpi"><small>今日摄入</small><b>${intake}<em>千卡</em></b><div class="bar"><i style="width:${Math.min(100, intake / B.goalIn * 100)}%"></i></div><span class="small muted">建议 ${B.goalIn} 千卡左右</span></div>
    <div class="kpi"><small>今日消耗</small><b>${burn}<em>千卡</em></b><span class="small muted">基础代谢 ${B.bmr} + 运动 ${burn - B.bmr}</span></div>
    <div class="kpi"><small>热量差</small><b class="${burn - intake > 700 ? 'warn-t' : ''}">${burn - intake > 0 ? '-' : '+'}${Math.abs(burn - intake)}<em>千卡</em></b><span class="small ${burn - intake > 700 ? 'warn-t' : 'muted'}">${burn - intake > 700 ? '缺口偏大，注意别饿着拍戏' : '在合理范围'}</span></div>
  </div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>体重趋势 · 近 ${n} 天</h3><span class="small muted">阴影是角色目标区间</span></div>
      <svg viewBox="0 0 ${W} ${H}" class="wxchart"><rect x="30" y="${ys(B.target[1])}" width="${W - 40}" height="${ys(B.target[0]) - ys(B.target[1])}" fill="color-mix(in srgb,var(--ok) 18%,transparent)" rx="6"/>
        <path class="curve" d="${w.map((v, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(v)}`).join(' ')}"/>
        ${B.marks.map(([i, t]) => `<line x1="${xs(i)}" x2="${xs(i)}" y1="20" y2="170" stroke="var(--line)" stroke-dasharray="4 4"/><text x="${xs(i)}" y="16" text-anchor="middle" font-size="11" class="rel-label">${t}</text>`).join('')}
        ${w.map((v, i) => i % 15 === 0 || i === n - 1 ? `<circle class="pt" cx="${xs(i)}" cy="${ys(v)}" r="4"/><text x="${xs(i)}" y="${ys(v) - 9}" text-anchor="middle" font-size="11" font-weight="600">${v.toFixed(1)}</text><text x="${xs(i)}" y="196" text-anchor="middle" font-size="11" class="rel-label">${dd(i)}</text>` : '').join('')}
      </svg></div>
    <div class="card"><div class="result-head"><h3>近 7 天 摄入 vs 消耗</h3><div class="legend"><span><i style="background:var(--hi)"></i>摄入</span><span><i style="background:var(--accent)"></i>消耗</span></div></div>
      <svg viewBox="0 0 ${W} ${H}" class="wxchart">${wk.map(([d, a, b], i) => { const x = 50 + i * 82, ha = a / maxK * 150, hb = b / maxK * 150; return `<rect x="${x}" y="${175 - ha}" width="26" height="${ha}" rx="4" fill="var(--hi)" class="grow"/><rect x="${x + 30}" y="${175 - hb}" width="26" height="${hb}" rx="4" fill="var(--accent)" class="grow"/><text x="${x + 28}" y="196" text-anchor="middle" font-size="11" class="rel-label">${d}</text>`; }).join('')}</svg></div>
  </div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>今天吃了什么</h3><span class="small muted">输入食物，AI 估算热量</span></div>
      <ul class="list small">${meals.map(m => `<li class="row" style="justify-content:space-between"><span><span class="tag">${m.t}</span> ${m.n}</span><b>${m.k} 千卡</b></li>`).join('')}</ul>
      <div class="row mt8" style="flex-wrap:nowrap"><input class="add-item" id="foodIn" placeholder="例如：一杯拿铁、200 克鸡胸、一个苹果" style="margin:0;flex:1"><button class="btn sm pri" data-act="food">记录</button></div>
      ${S.lastFood ? `<p class="small muted mt8">✦ ${S.lastFood}</p>` : ''}</div>
    <div class="card"><div class="result-head"><h3>运动记录</h3><span class="small muted">可连接 Apple 健康 / 华为运动健康 / Keep（正式版）</span></div>
      <ul class="list small">${B.workouts.map(x => `<li class="row" style="justify-content:space-between"><span>${x.ic} ${x.n} · ${x.m} 分钟</span><b>${x.k} 千卡</b></li>`).join('')}</ul>
      <h3 class="mt">今天的状态</h3><div class="checks">${[['energy', '精力'], ['mood', '情绪'], ['voice', '嗓音'], ['sleep', '睡眠质量']].map(([k, t]) => `<div class="ckrow"><span>${t}</span><div class="dots5">${[1, 2, 3, 4, 5].map(v => `<button data-act="ck" data-v="${k}" data-i="${v}" class="${(ck[k] || 0) >= v ? 'on' : ''}"></button>`).join('')}</div></div>`).join('')}
        <div class="ckrow"><span>昨晚睡眠</span><b>${B.sleep} 小时</b></div></div></div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>AI 角色体态方案 · 许知夏</h3><p class="sub">根据角色设定（曾是舞团学员）、开机时间和你最近的记录</p></div></div>
    ${aiBlock('bodyplan', 'AI 生成体态方案', '结合角色的形象要求、距离定妆和开机的时间、最近 90 天的体重与运动记录，给出安全的节奏和训练建议。', () => `
      <div class="grid3">${B.plan.map(p => `<div class="leg"><b>${p[0]}</b><ul class="small" style="margin:8px 0 0;padding-left:18px">${p[1].map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div>
      <p class="note">${demoTag()}　AI 只给方向和提醒。具体的饮食和训练计划，请与营养师、体能教练、舞蹈老师一起制定。</p>`)}
  </div>
  ${cycleCard()}
  <div class="card mt"><h3>为角色，还可以准备这些</h3><p class="sub">一切都是为了把戏演好，下一步可以继续扩展</p>
    <div class="grid4 mt8">${B.more.map(m => `<div class="leg"><div style="font-size:22px">${m[0]}</div><b>${m[1]}</b><p class="small muted mt8">${m[2]}</p></div>`).join('')}</div></div>`;
}

/* ---------------- 私密模块：经期记录（可选） ---------------- */
function cycleCard() {
  if (!S.cycleOn) return `<div class="card mt private"><div class="result-head"><div><h3>🔒 私密模块 · 经期记录（可选）</h3><p class="sub">只有本人可见，不会出现在团队资料包里，随时可以关闭并清除。用不用，完全由自己决定。</p></div><button class="btn" data-act="cycle" data-v="on">开启</button></div>
    <p class="small muted">开启后：记录周期和身体感受，AI 会对照日程，提前提醒经期和拍摄、活动、出差重叠的日子。</p></div>`;
  const C = S.cycle, dayMs = 86400000, t0 = new Date(); t0.setHours(0, 0, 0, 0);
  const start = n => new Date(t0.getTime() + n * dayMs);
  const next = C.lastStart + C.len, cycDay = -C.lastStart + 1;
  const days = Array.from({ length: 35 }, (_, i) => i - 7);
  const kind = d => { const r = ((d - C.lastStart) % C.len + C.len) % C.len; if (d >= C.lastStart && d < C.lastStart + C.dur) return 'p'; if (r < C.dur && d >= next) return 'pp'; if (r >= C.len - 3) return 'pms'; return ''; };
  const tripDays = D.trip.days.map(x => x.d);
  const overlap = D.trip.days.filter(x => x.d >= next && x.d < next + C.dur);
  const f = d => `${start(d).getMonth() + 1}/${start(d).getDate()}`;
  const SYM = ['痛经', '疲惫', '浮肿', '情绪低落', '皮肤状态差', '睡不好'];
  const sym = S.sym[new Date().toDateString()] || [];
  return `<div class="card mt private"><div class="result-head"><div><h3>🔒 私密模块 · 经期记录</h3><p class="sub">仅本人可见 · 不进入团队资料包 · 不同步给任何人</p></div><button class="btn sm" data-act="cycle" data-v="off">关闭并清除</button></div>
    <div class="grid4 kpis"><div class="kpi"><small>周期第</small><b>${cycDay}<em>天</em></b></div><div class="kpi"><small>预计下次</small><b>${f(next)}</b><span class="small muted">还有 ${next} 天</span></div><div class="kpi"><small>平均周期</small><b>${C.len}<em>天</em></b></div><div class="kpi"><small>经期时长</small><b>${C.dur}<em>天</em></b></div></div>
    <div class="cyc mt">${days.map(d => `<div class="cd ${kind(d)} ${d === 0 ? 'now' : ''}" title="${f(d)}"><small>${start(d).getDate()}</small>${tripDays.includes(d) ? '<i>✈︎</i>' : ''}</div>`).join('')}</div>
    <div class="legend mt8"><span><i style="background:var(--bad)"></i>经期</span><span><i style="background:color-mix(in srgb,var(--bad) 40%,transparent)"></i>预测经期</span><span><i style="background:color-mix(in srgb,var(--warn) 45%,transparent)"></i>经前期</span><span>✈︎ 出差 / 活动</span></div>
    <div class="row mt"><span class="small muted">今天的感受：</span>${SYM.map(x => `<button class="btn sm ${sym.includes(x) ? 'pri' : ''}" data-act="sym" data-v="${x}">${x}</button>`).join('')}</div>
    ${overlap.length ? `<div class="gate mt">✦ AI 提醒：预计 ${f(next)} 开始经期，和 ${overlap.map(x => `${f(x.d)} ${x.city}「${x.ev.split('（')[0]}」`).join('、')} 重叠。<br>· 造型：避免浅色、紧身的礼服，提前和造型师沟通备选<br>· 随身：暖宝宝、止痛药、替换用品，助理包里多备一份<br>· 安排：活动结束后尽量留出休息时间；是否告诉经纪人调整行程，由你自己决定</div>` : `<p class="small muted mt">接下来的出差和活动与预测经期没有重叠。</p>`}
  </div>`;
}

/* ---------------- 出行与天气 ---------------- */
const WX = { status: 'idle', at: '', data: null };
function loadWX(force) {
  if (WX.status === 'loading' || (WX.status === 'live' && !force)) return;
  const C = D.trip.cities, names = Object.keys(C);
  if (!WX.data && window.WX_SNAPSHOT) { WX.data = window.WX_SNAPSHOT.cities; WX.status = 'snap'; WX.at = window.WX_SNAPSHOT.fetched; }
  const prev = WX.status; WX.status = 'loading';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${names.map(n => C[n][0]).join(',')}&longitude=${names.map(n => C[n][1]).join(',')}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=7`;
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 6000);
  return; /* Weather is a reference snapshot, not live data. */
  fetch(url, { signal: ctl.signal }).then(r => r.json()).then(j => {
    const arr = Array.isArray(j) ? j : [j]; const data = {};
    names.forEach((n, i) => { data[n] = arr[i].daily; });
    WX.data = data; WX.status = 'live'; WX.at = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }).catch(() => { WX.status = prev === 'live' ? 'live' : WX.data ? 'snap' : 'none'; })
    .finally(() => { clearTimeout(to); if (S.trip) render(true); });
}
const WXC = c => c >= 95 ? ['⛈', '雷雨'] : c >= 80 ? ['🌦', '阵雨'] : c >= 71 ? ['❄️', '雪'] : c >= 61 ? ['🌧', '雨'] : c >= 51 ? ['🌦', '小雨'] : c >= 45 ? ['🌫', '雾'] : c >= 3 ? ['☁️', '阴'] : c >= 1 ? ['⛅', '多云'] : ['☀️', '晴'];
function wxAt(city, d) {
  const x = WX.data && WX.data[city]; if (!x || d >= x.time.length) return null;
  const dt = new Date(x.time[d] + 'T00:00:00');
  return { date: `${dt.getMonth() + 1}/${dt.getDate()}`, wk: '日一二三四五六'[dt.getDay()], max: Math.round(x.temperature_2m_max[d]), min: Math.round(x.temperature_2m_min[d]), rain: x.precipitation_probability_max[d] ?? 0, code: x.weather_code[d] };
}
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const hhmm = m => { m = (m + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
function judgeLeg(L) {
  const a = wxAt(L.from, L.d), b = wxAt(L.to, L.d);
  const storm = [a, b].some(w => w && w.code >= 95), wet = [a, b].some(w => w && w.rain >= 60), wetFrom = !!(a && a.rain >= 60);
  const lh = Math.floor(toMin(L.leave) / 60), peak = (lh >= 7 && lh <= 9) || (lh >= 17 && lh <= 19);
  const road = Math.round(D.trip.toHub[L.from] * (peak ? 1.4 : 1) * (wetFrom ? 1.25 : 1));
  const rows = Object.entries(L.opts).map(([mode, o]) => {
    let hrs = o.h + o.hub + (mode === '自驾' ? 0 : road / 60), risk = 'ok', note = '';
    if (mode === '飞机') { if (storm) { risk = 'bad'; note = '雷雨，航班延误 / 取消风险高'; hrs += 1.5; } else if (wet) { risk = 'warn'; note = '降雨，可能延误'; hrs += .5; } else note = '天气良好'; }
    if (mode === '高铁') { note = o.h > 6 ? '车程过长' : '准点率高，可在车上休息、背台词'; if (o.h > 6) risk = 'warn'; }
    if (mode === '自驾') { if (wet) { risk = 'warn'; hrs *= 1.25; note = '雨天路滑、易拥堵'; } else note = '灵活，但长途疲劳'; }
    return { mode, hrs: Math.round(hrs * 10) / 10, risk, note };
  });
  const score = r => r.hrs + (r.risk === 'bad' ? 3 : r.risk === 'warn' ? .6 : 0) - (r.mode === '高铁' && r.hrs < 6 ? .7 : 0);
  const best = rows.slice().sort((x, y) => score(x) - score(y))[0];
  const buffer = best.mode === '飞机' ? 90 : best.mode === '高铁' ? 30 : 0;
  const leaveHome = hhmm(toMin(L.leave) - buffer - (best.mode === '自驾' ? 0 : road));
  const why = [];
  if (best.mode === '高铁') why.push(storm || wet ? '起降地有降雨或雷雨，高铁受天气影响小，更准点' : '距离适中，高铁总耗时不输飞机，还更准点');
  if (best.mode === '飞机') why.push(L.km > 1500 ? '距离远，飞机明显更快' : '飞机总耗时最短');
  if (best.mode === '飞机' && (storm || wet)) why.push('天气有风险：建议改早班机，并预留一班高铁作为备选');
  why.push(`去${best.mode === '飞机' ? '机场' : best.mode === '高铁' ? '车站' : '目的地'}${peak ? '正值高峰' : '非高峰'}${wetFrom ? '、出发地有雨' : ''}，路上约 ${road} 分钟`);
  return { a, b, rows, best, leaveHome, road, why };
}
function wearFor(w, ev) {
  if (!w) return '暂无天气数据';
  const t = [];
  if (w.max >= 26) t.push('轻薄透气，注意防晒'); else if (w.max >= 20) t.push('薄外套 + 单衣'); else if (w.max >= 14) t.push('风衣或针织开衫'); else t.push('大衣 / 薄羽绒');
  if (w.max - w.min >= 8) t.push(`早晚温差 ${w.max - w.min}°，叠穿`);
  if (w.rain >= 60 || w.code >= 61) t.push('带伞，穿防滑防水的鞋');
  if (/户外/.test(ev) && w.rain >= 40) t.push('户外环节：提前和品牌确认雨天方案');
  return t.join('；');
}
function vTrip() {
  const T = D.trip;
  if (WX.status === 'idle') loadWX();
  const days = T.days.map(x => ({ ...x, w: wxAt(x.city, x.d) }));
  const ws = days.map(x => x.w).filter(Boolean);
  const tmin = ws.length ? Math.min(...ws.map(w => w.min)) : 0, tmax = ws.length ? Math.max(...ws.map(w => w.max)) : 0, rainy = ws.filter(w => w.rain >= 60).length;
  const st = { live: ['live', `实时 · Open-Meteo · 更新于 ${WX.at}`], snap: ['', `离线快照 · Open-Meteo ${WX.at} 抓取（当前未联网）`], loading: ['', '正在获取实时天气…'], none: ['', '暂无天气数据'] }[WX.status] || ['', ''];
  const W = 640, H = 214, xs = i => 50 + i * ((W - 90) / (days.length - 1)), ty = v => 150 - (v - (tmin - 3)) / Math.max(1, (tmax + 3) - (tmin - 3)) * 110;
  const chart = ws.length ? `<svg viewBox="0 0 ${W} ${H}" class="wxchart">
    ${days.map((x, i) => x.w ? `<rect x="${xs(i) - 14}" y="${190 - x.w.rain * .35}" width="28" height="${x.w.rain * .35}" rx="4" class="rainbar"/>` : '').join('')}
    <path class="curve" d="${days.map((x, i) => x.w ? `${i ? 'L' : 'M'}${xs(i)},${ty(x.w.max)}` : '').join(' ')}" style="stroke:var(--hi)"/>
    <path class="curve" d="${days.map((x, i) => x.w ? `${i ? 'L' : 'M'}${xs(i)},${ty(x.w.min)}` : '').join(' ')}" style="stroke:var(--accent)"/>
    ${days.map((x, i) => x.w ? `<text x="${xs(i)}" y="${ty(x.w.max) - 10}" text-anchor="middle" font-size="12" font-weight="600">${x.w.max}°</text><text x="${xs(i)}" y="${ty(x.w.min) + 18}" text-anchor="middle" font-size="11" class="rel-label">${x.w.min}°</text><text x="${xs(i)}" y="207" text-anchor="middle" font-size="11" class="rel-label">${x.city} ☂${x.w.rain}%</text>` : '').join('')}
  </svg>` : '<p class="muted small">暂无天气数据</p>';
  const extra = {};
  if (rainy) { extra['艺人助理'] = ['折叠伞 ×6 + 一次性雨衣']; extra['造型'] = ['礼服防水罩、鞋套']; extra['安保'] = ['雨天路线多留 20 分钟']; }
  if (ws.length && tmin <= 10) (extra['艺人助理'] = extra['艺人助理'] || []).push('暖宝宝、薄羽绒（候场用）');
  if (days.some(x => x.city === '北京')) (extra['化妆'] = extra['化妆'] || []).push('保湿喷雾（北京干燥）');
  const team = T.team.map(r => ({ ...r, ai: extra[r.role] || [], add: S.packAdd[r.role] || [] }));
  const all = team.flatMap(r => [...r.items, ...r.ai, ...r.add].map(i => r.role + '|' + i));
  const doneN = all.filter(k => S.pack[k]).length;
  return `<section class="hero has-img" style="--img:url('assets/photos/08_station.jpg')"><div class="eyebrow">TRAVEL & WEATHER</div><h1>出行与天气</h1>
    <p>演员每天在不同城市之间奔波。接入天气预报，AI 帮你判断怎么走、几点出发、穿什么，团队各自带什么也不会落下。</p>
    <div class="needs"><span class="need">实时天气</span><span class="need">交通判断</span><span class="need">穿搭提醒</span><span class="need">团队携带清单</span></div></section>
  <div class="card"><div class="result-head"><div><h3>${T.title}</h3><p class="sub">${days.length} 天 · ${[days[0].from, ...days.map(x => x.city)].filter((c, i, a) => c !== a[i - 1]).join(' → ')}</p></div>
    <div class="row"><span class="chip"><span class="led ${st[0]}"></span>${st[1]}</span><button class="btn sm" data-act="wx">↻ 刷新天气</button></div></div>
    <div class="route">${days.map((x, i) => `<div class="rt"><div class="rt-wx">${x.w ? WXC(x.w.code)[0] : '·'}</div><b>${x.city}</b><small>${x.w ? `${x.w.date} 周${x.w.wk}` : 'D+' + x.d}</small><small class="ev">${x.ev.split('（')[0]}</small>${x.w ? `<span class="tag ${x.w.rain >= 60 ? 'warn' : ''}">${x.w.min}–${x.w.max}° · ☂${x.w.rain}%</span>` : ''}</div>${i < days.length - 1 ? `<div class="rt-arrow">${days[i + 1].from ? (T.legs.find(l => l.d === days[i + 1].d) ? '→' : '→') : '·'}</div>` : ''}`).join('')}</div>
  </div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>行程天气</h3><div class="legend"><span><i style="background:var(--hi)"></i>最高温</span><span><i style="background:var(--accent)"></i>最低温</span><span><i style="background:color-mix(in srgb,var(--accent) 35%,transparent)"></i>降雨概率</span></div></div>${chart}</div>
    <div class="card"><h3>出发前要知道</h3><div class="grid2 mt8">
      <div class="kpi"><small>气温范围</small><b>${ws.length ? tmin + '–' + tmax : '-'}<em>°C</em></b></div>
      <div class="kpi"><small>可能下雨</small><b class="${rainy ? 'warn-t' : ''}">${rainy}<em>天</em></b></div></div>
      <ul class="list mt8 small">${days.filter(x => x.w && (x.w.rain >= 60 || x.w.code >= 95)).map(x => `<li>${WXC(x.w.code)[0]} <b>${x.w.date} ${x.city}</b> ${WXC(x.w.code)[1]}，降雨概率 ${x.w.rain}% · ${x.ev.split('（')[0]}</li>`).join('') || `<li class="muted">${ws.length ? '行程期间没有明显降雨' : '暂无天气数据，无法判断'}</li>`}</ul></div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>AI 交通判断</h3><p class="sub">飞机、高铁还是坐车？几点出门？</p></div></div>
    ${aiBlock('legs', 'AI 判断每一段怎么走', '结合起降两地的天气、去机场或车站的路况（高峰、雨天），比较飞机、高铁、自驾的总耗时和延误风险。', () => `<div class="legs">${T.legs.map(L => { const J = judgeLeg(L); return `<div class="leg">
      <div class="row" style="justify-content:space-between"><b>${L.from} → ${L.to}</b><span class="small muted">${J.a ? J.a.date : 'D+' + L.d} · 计划 ${L.leave} 出发</span></div>
      <div class="small muted mt8">${J.a ? `${L.from} ${WXC(J.a.code).join(' ')} ☂${J.a.rain}%` : ''}　→　${J.b ? `${L.to} ${WXC(J.b.code).join(' ')} ☂${J.b.rain}%` : ''}</div>
      <table class="tbl mt8"><tr><th>方式</th><th>门到门</th><th>天气风险</th><th></th></tr>${J.rows.map(r => `<tr class="${r === J.best ? 'best' : ''}"><td><b>${{ 飞机: '✈︎', 高铁: '🚄', 自驾: '🚗' }[r.mode]} ${r.mode}</b></td><td>${r.hrs} 小时</td><td>${tag(r.risk, { ok: '低', warn: '中', bad: '高' }[r.risk])}</td><td class="small muted">${r.note}</td></tr>`).join('')}</table>
      <div class="rec">建议：<b>${J.best.mode}</b>　·　${J.leaveHome} 前出门<ul>${J.why.map(w => `<li>${w}</li>`).join('')}</ul></div></div>`; }).join('')}</div>
      <p class="note">${demoTag()}　天气为${WX.status === 'live' ? '实时预报' : '离线快照'}；路况按城市与时段估算，正式版可接入高德 / 百度地图实时路况和航班动态。最终由团队确认订票。</p>`)}
  </div>
  <div class="card mt"><div class="result-head"><div><h3>每日穿搭提醒</h3><p class="sub">按每天的城市天气和活动着装要求</p></div></div>
    ${aiBlock('wear', 'AI 生成穿搭提醒', '根据每天所在城市的最高最低气温、降雨和当天活动，给出穿什么、随身带什么。', () => `<div class="wear">${days.map(x => `<div class="wd"><div class="row" style="justify-content:space-between"><b>${x.w ? x.w.date + ' 周' + x.w.wk : 'D+' + x.d} · ${x.city}</b><span class="wx-big">${x.w ? WXC(x.w.code)[0] : ''}</span></div>
      <p class="small muted">${x.w ? `${WXC(x.w.code)[1]} ${x.w.min}–${x.w.max}° · 降雨 ${x.w.rain}%` : ''}</p><p class="small mt8"><b>活动：</b>${x.ev}</p><p class="small"><b>着装：</b>${x.dress}</p><p class="small"><b>提醒：</b>${wearFor(x.w, x.ev)}</p></div>`).join('')}</div>`)}
  </div>
  <div class="card mt"><div class="result-head"><div><h3>团队携带清单</h3><p class="sub">每个人负责什么、带齐没有，一目了然；勾选会保存</p></div>
    <div class="row"><span class="small muted">已准备 ${doneN}/${all.length}</span><div class="bar" style="width:140px"><i style="width:${all.length ? doneN / all.length * 100 : 0}%"></i></div><button class="btn sm" data-act="toast" data-msg="已生成清单（演示：不会发送给任何人）">生成清单发给团队</button></div></div>
    <div class="team">${team.map(r => { const items = [...r.items.map(i => [i, '']), ...r.ai.map(i => [i, 'ai']), ...r.add.map(i => [i, 'add'])]; const n = items.filter(([i]) => S.pack[r.role + '|' + i]).length; return `<div class="role"><div class="row" style="justify-content:space-between"><b>${r.ic} ${r.role}</b><span class="small muted">${n}/${items.length}</span></div><div class="bar mt8"><i style="width:${n / items.length * 100}%"></i></div>
      <div class="mt8">${items.map(([i, k]) => `<label class="chk small"><input type="checkbox" data-act="pack" data-v="${r.role}|${i}" ${S.pack[r.role + '|' + i] ? 'checked' : ''}><span>${i}${k === 'ai' ? ' <span class="tag ev">✦ AI 按天气补充</span>' : ''}${k === 'add' ? ' <span class="tag">手动添加</span>' : ''}</span></label>`).join('')}</div>
      <input class="add-item" data-role="${r.role}" placeholder="+ 添加物品，回车确认"></div>`; }).join('')}</div>
  </div>`;
}

/* ---------------- 日程总览 ---------------- */
function schedEvents() {
  const C = D.sched, ev = C.events.map((e, i) => ({ ...e, id: 's' + i })).filter(e => !S.hiddenEv[e.id]);
  (S.userEvents || []).forEach(e => ev.push({ ...e, mine: true }));
  C.invites.forEach(i => { if (S.inv[i.id] === 'yes' && i.day) ev.push({ t: i.t, a: i.day, b: i.day, n: i.n + '（新接）', added: true, id: 'inv-' + i.id }); });
  return ev;
}
function dayInfo() {
  const C = D.sched, ev = schedEvents(), days = [];
  for (let d = 1; d <= C.days; d++) {
    const list = ev.filter(e => d >= e.a && d <= e.b);
    const shoot = list.some(e => e.t === 'shoot');
    const clash = shoot && list.some(e => ['film', 'biz', 'promo', 'variety'].includes(e.t));
    const rest = !list.length || list.some(e => e.t === 'rest');
    days.push({ d, list, clash, work: !rest, rest });
  }
  return days;
}
function donut(parts, total) {
  let off = 0; const R = 54, L = 2 * Math.PI * R;
  return `<svg viewBox="0 0 140 140" class="donut-svg">${parts.map(([c, v]) => { const len = v / total * L; const seg = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${len} ${L - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`; off += len; return seg; }).join('')}
    <text x="70" y="66" text-anchor="middle" font-size="22" font-weight="700">${total}</text><text x="70" y="86" text-anchor="middle" font-size="11" class="rel-label">项·天</text></svg>`;
}
function vHome() {
  const C = D.sched, T = C.types, days = dayInfo();
  const work = days.filter(d => d.work).length, rest = C.days - work, clashes = days.filter(d => d.clash);
  const pending = C.invites.filter(i => !S.inv[i.id]).length;
  const tally = {}; days.forEach(d => d.list.forEach(e => { tally[e.t] = (tally[e.t] || 0) + 1; }));
  const parts = Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => [T[k].c, v, k]);
  const total = parts.reduce((a, p) => a + p[1], 0);
  const sel = days[(S.selDay || C.today) - 1];
  const wk = ['一', '二', '三', '四', '五', '六', '日'];
  const yearDays = C.yearDays.slice(); yearDays[C.month - 1] = work;
  const maxY = Math.max(...yearDays);
  return `<section class="hero has-img" style="--img:url('assets/photos/15_studio.jpg')"><div class="eyebrow">OVERVIEW · ${C.year}年${C.month}月</div><h1>日程总览</h1>
    <p>拍摄、宣发、商演、综艺、训练，全部排在一张表上。新邀约进来，AI 先帮你查冲突、算行程；接不接，由你和团队决定。</p>
    <div class="needs"><span class="need">日程安排</span><span class="need">档期冲突</span><span class="need">数据看板</span><span class="need">个人发展规划</span></div></section>
  <div class="grid4 kpis">
    <div class="kpi"><small>本月工作日</small><b>${work}<em>/${C.days}天</em></b><div class="bar"><i style="width:${work / C.days * 100}%"></i></div></div>
    <div class="kpi"><small>休息日</small><b class="${rest < 4 ? 'warn-t' : ''}">${rest}<em>天</em></b><span class="small ${rest < 4 ? 'warn-t' : 'muted'}">${rest < 4 ? '偏少，注意身体' : '正常'}</span></div>
    <div class="kpi"><small>档期冲突</small><b class="${clashes.length ? 'bad-t' : ''}">${clashes.length}<em>天</em></b><span class="small muted">${clashes.map(d => C.month + '/' + d.d).join('、') || '无'}</span></div>
    <div class="kpi"><small>待决定邀约</small><b>${pending}<em>项</em></b><span class="small muted">见下方 AI 排期助手</span></div>
  </div>
  <div class="row mt" style="justify-content:flex-end;gap:8px"><span class="small muted">${(S.userEvents || []).length ? `我添加了 ${S.userEvents.length} 项 · ` : ''}示例日程 ${D.sched.events.length - Object.keys(S.hiddenEv).length} 项</span>${Object.keys(S.hiddenEv).length < D.sched.events.length ? '<button class="btn sm" data-act="evclear">清空示例，从零开始</button>' : '<button class="btn sm" data-act="evrestore">恢复示例日程</button>'}</div>
  <div class="home-grid mt8">
    <div class="card"><div class="result-head"><h3>${C.month}月日程 <span class="small muted" style="font-weight:400">点日期查看、添加、勾选</span></h3><div class="legend">${Object.entries(T).map(([k, v]) => `<span><i style="background:${v.c}"></i>${v.n}</span>`).join('')}</div></div>
      <div class="cal-m">${wk.map(w => `<div class="wk">周${w}</div>`).join('')}
      ${'<div></div>'.repeat(C.firstWeekday - 1)}
      ${days.map(d => `<button class="dm ${d.d === C.today ? 'today' : ''} ${d.clash ? 'clash' : ''} ${S.selDay === d.d ? 'sel' : ''}" data-act="day" data-i="${d.d}">
        <span class="dn">${d.d}</span>${d.list.some(e => e.long) ? `<i class="longbar" style="background:${T.shoot.c}"></i>` : ''}
        ${d.list.filter(e => !e.long).slice(0, 2).map(e => `<em class="${S.evDone[e.id] ? 'em-done' : ''}" style="background:${T[e.t].c}">${e.n.split(' · ')[0].split('（')[0]}</em>`).join('')}${d.list.filter(e => !e.long).length > 2 ? `<small class="more">+${d.list.filter(e => !e.long).length - 2}</small>` : ''}
        ${d.clash ? '<b class="cl">冲突</b>' : ''}</button>`).join('')}</div></div>
    <div>
      <div class="card"><div class="result-head"><h3>${C.month}月${sel.d}日${sel.d === C.today ? ' · 当天' : ''}</h3>${sel.clash ? tag('bad', '有冲突') : ''}</div>
        ${sel.d === C.today ? `<ol class="tl tl-check">${C.todayPlan.map(([h, n, t], i) => `<li class="${S.todayDone[i] ? 'done' : ''}"><label><input type="checkbox" data-act="tdone" data-i="${i}" ${S.todayDone[i] ? 'checked' : ''}><span class="tm">${h}</span><i style="background:${T[t].c}"></i><span>${n}</span></label></li>`).join('')}</ol>` : ''}
        <ul class="list evl">${sel.list.filter(e => !(sel.d === C.today && !e.mine && !e.added && e.long)).map(e => `<li class="${S.evDone[e.id] ? 'done' : ''}"><label class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" data-act="evdone" data-v="${e.id}" ${S.evDone[e.id] ? 'checked' : ''}><i class="dot" style="background:${T[e.t].c};margin-top:6px"></i><span style="flex:1"><b>${e.n}</b>${e.mine ? ' <span class="tag">我添加的</span>' : ''}<br><span class="small muted">${T[e.t].n}${e.a !== e.b ? ` · ${C.month}/${e.a}–${C.month}/${e.b}` : ''}${e.time ? ' · ' + e.time : ''}${e.note ? ' · ' + e.note.replace(/</g, '&lt;') : ''}</span></span></label>
          <button class="btn sm" data-act="evdel" data-v="${e.id}">${e.mine ? '删除' : '移除'}</button></li>`).join('') || '<li class="muted small">这一天还没有安排。</li>'}</ul>
        <details class="evform" ${sel.list.length ? '' : 'open'}><summary>＋ 在 ${C.month}月${sel.d}日 添加日程</summary>
          <div class="grid2 mt8"><div class="field" style="margin-top:0"><label>内容</label><input id="evN" placeholder="例如：杂志拍摄 · 上海"></div>
            <div class="field" style="margin-top:0"><label>类型</label><select id="evT">${Object.entries(T).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('')}</select></div>
            <div class="field"><label>开始 / 结束（日）</label><div class="row" style="flex-wrap:nowrap"><input id="evA" type="number" min="1" max="${C.days}" value="${sel.d}"><span>—</span><input id="evB" type="number" min="1" max="${C.days}" value="${sel.d}"></div></div>
            <div class="field"><label>时间</label><input id="evTime" placeholder="例如：14:00–18:00"></div></div>
          <div class="field"><label>备注</label><input id="evNote" placeholder="地点、对接人、要带什么…"></div>
          <div class="row mt8" style="justify-content:space-between"><span class="small muted">保存后，冲突、统计和图表会自动重新计算</span><button class="btn pri" data-act="evadd">添加到日程</button></div></details>
        ${sel.clash ? `<div class="gate">⚠ 这一天拍摄与${sel.list.filter(e => ['film', 'biz', 'promo', 'variety'].includes(e.t)).map(e => T[e.t].n).join('、')}重叠。建议：提前与制片确认调整通告，或改为线上参与。</div>` : ''}</div>
      <div class="card mt"><h3>这个月时间花在哪</h3><div class="row mt8" style="align-items:center;flex-wrap:nowrap">${donut(parts, total)}
        <ul class="list small" style="flex:1">${parts.slice(0, 6).map(([c, v, k]) => `<li class="row" style="justify-content:space-between;padding:4px 0"><span><i class="dot" style="background:${c}"></i>${T[k].n}</span><b>${Math.round(v / total * 100)}%</b></li>`).join('')}</ul></div></div>
    </div>
  </div>
  <div class="grid2 mt">
    <div class="card"><div class="result-head"><h3>${C.year} 年每月工作天数</h3><span class="small muted">本月偏满，下半年留出学习时间</span></div>
      <svg viewBox="0 0 600 190" class="ybars">${yearDays.map((v, i) => { const h = v / maxY * 130, x = 18 + i * 48; return `<rect x="${x}" y="${150 - h}" width="30" height="${h}" rx="5" fill="${i + 1 === C.month ? 'var(--accent)' : 'color-mix(in srgb,var(--accent) 55%,transparent)'}" style="animation-delay:${i * 50}ms"/><text x="${x + 15}" y="${144 - h}" text-anchor="middle" font-size="11" class="rel-label">${v}</text><text x="${x + 15}" y="172" text-anchor="middle" font-size="11" class="rel-label">${i + 1}月</text>`; }).join('')}</svg></div>
    <div class="card"><h3>收件箱</h3><p class="sub">一部戏的一生，从这里开始</p>
      <div class="inbox mt pulse"><div class="env">✉️</div><div style="flex:1"><b>${D.scripts.length} 部新剧本待看</b><p class="muted small">${D.scripts.map(x => '《' + x.t + '》').join('、')}</p></div><button class="btn pri" data-act="go" data-i="0">进入第 01 站 →</button></div>
      <div class="inbox mt8"><div class="env">📨</div><div style="flex:1"><b>${C.invites.length} 个新邀约</b><p class="muted small">商演、路演、综艺，见下方排期助手</p></div></div></div>
  </div>
  <div class="card mt"><div class="result-head"><div><h3>AI 排期助手</h3><p class="sub">新邀约进来，先查冲突、算行程，再决定</p></div></div>
    ${aiBlock('sched', 'AI 检查新邀约', `本周收到 ${C.invites.length} 个新邀约。AI 对照本月拍摄、宣发、训练和休息，逐一检查有没有冲突、行程是否过紧。`, () => `
      <div class="grid3">${C.invites.map(i => `<div class="inv"><div class="row" style="justify-content:space-between"><span class="tag" style="background:${T[i.t].c};color:#fff">${T[i.t].n}</span>${tag(i.lv, { ok: '可以接', warn: '需协调', bad: '建议婉拒' }[i.lv])}</div>
        <b class="mt8" style="display:block">${i.n}</b><p class="small muted">${i.d} · ${i.r}</p><p class="small mt8">💡 ${i.s}</p>
        <div class="row mt8">${S.inv[i.id] ? tag(S.inv[i.id] === 'yes' ? 'ok' : '', S.inv[i.id] === 'yes' ? '✓ 已接受，已加入日程' : '已婉拒') + `<button class="btn sm" data-act="inv" data-v="${i.id}" data-i="0">撤回</button>` : `<button class="btn sm pri" data-act="inv" data-v="${i.id}" data-i="1">接受</button><button class="btn sm" data-act="inv" data-v="${i.id}" data-i="2">婉拒</button>`}</div></div>`).join('')}</div>
      <p class="note">${demoTag()}　AI 只给建议。接不接、怎么调，由本人、经纪人和剧组沟通后决定。</p>`)}
  </div>`;
}

const VIEWS = [vTake, vRead, vRole, vPrev, vShoot, vPromo, vDeal, vReview];

/* ---------------- 渲染 ---------------- */
function render(keepScroll) {
  document.documentElement.dataset.theme = S.theme;
  document.title = `${name().name} · 演员AI工作台`;
  const m = $('#main'), y = m.scrollTop;
  renderSide(); renderTop(); renderFolder();
  if (onPage()) { m.innerHTML = VIEWP[onPage()]() + reviewBlock(); if (keepScroll) m.scrollTop = y; return; }
  const tdef = GUIDE[S.st].find(g => g[1]);
  if (tdef) S.seen[S.st + ':' + (S.tab[S.st] || tdef[1])] = true;
  const html = VIEWS[S.st](), cut = html.lastIndexOf('<div class="next">');
  m.innerHTML = cut > 0 ? html.slice(0, cut) + reviewBlock() + html.slice(cut) : html + reviewBlock();
  if (keepScroll) m.scrollTop = y;
}
function go(i) {
  const pk = Object.keys(PAGES).find(k => PAGES[k] === i);
  if (pk) { if (S[pk]) return; clearTimers(); Object.keys(PAGES).forEach(k => S[k] = k === pk); save(); render(); $('#main').scrollTop = 0; $('#app').classList.remove('folder-open'); return; }
  i = Math.max(0, Math.min(7, i)); if (i === S.st && !onPage()) return;
  clearTimers(); Object.keys(PAGES).forEach(k => S[k] = false); S.st = i; S.hl = null; save(); render(); $('#main').scrollTop = 0;
  $('#app').classList.remove('folder-open');
}

/* ---------------- 设置弹窗 ---------------- */
function settings() {
  const dlg = $('#dlg');
  dlg.innerHTML = `<div class="dlg"><h2>设置<button data-act="close" aria-label="关闭">×</button></h2>
    <div class="field"><label>连接 AI 模型</label>
      <div class="provider">${PROVIDERS.map(([k, n, d]) => `<button data-act="prov" data-v="${k}" class="${S.provider === k ? 'on' : ''}">${n}<small>${d}</small></button>`).join('')}</div>
      <p class="small muted mt8">${S.provider === 'demo' ? '当前为演示模式：所有 AI 结果均为预置示例，并在页面上标注“示例结果”。' : `正式版在这里填写 ${providerName()} 的${['codex', 'claudecode'].includes(S.provider) ? '本机登录' : ' API Key'}，由演员和工作室使用自己的账号。演示版不保存、不发送任何密钥，结果仍为预置示例。`}</p></div>
    <div class="field"><label>主题</label><div class="opt">${[['tide', '深蓝潮汐'], ['butter', '奶油便签'], ['moss', '山野片场']].map(([k, n]) => `<button data-act="theme" data-v="${k}" class="${S.theme === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="field"><label>数据归档与备份</label>
      <div class="row"><button class="btn sm" data-act="backup">💾 导出完整备份</button><label class="btn sm" style="cursor:pointer">📥 导入备份<input type="file" id="bkFile" accept=".json" hidden></label><button class="btn sm" data-act="archive">🗄 归档这部戏</button></div>
      ${S.archives.length ? `<ul class="list small mt8">${S.archives.map(a => `<li>🗄 ${a.title} · ${a.at} · 资料夹 ${a.folder} 项 · 人工决定 ${a.reviews} 条</li>`).join('')}</ul>` : '<p class="small muted">还没有归档记录。</p>'}</div>
    <div class="field"><label>演示操作</label><p class="small">键盘 <span class="kbd">←</span> <span class="kbd">→</span> 切换上一站 / 下一站；“重新演示”清空进度，回到日程总览首页。</p>
      <div class="row mt8"><button class="btn sm" data-act="reset">↺ 重新演示</button></div></div>
    <p class="note">本演示所有项目、人物、留言、品牌均为虚构，仅用于展示工作流程，不代表任何真实演员的经历、使用或背书。数据只保存在当前浏览器。</p></div>`;
  if (!dlg.open) dlg.showModal();
}

/* ---------------- 导出 ---------------- */
function exportMd() {
  const P = D.project, L = [];
  L.push(`# 《${P.title}》资料包`, '', `${name().name} · 演员AI工作台 演示导出 · ${new Date().toLocaleString('zh-CN')}`, '', '> 演示版：AI 结果为预置示例，项目与人物均为虚构。', '');
  if (has('take')) L.push('## 01 接戏评估卡', D.take.summary, '', ...D.take.fit.map(f => `- ${f.k}：${f.v}（${f.t}）`), '');
  if (has('read')) L.push('## 02 角色分析卡', '### 人物关系', ...D.people.slice(1).map(p => `- ${p.name}：${p.edge}`), '### 成长线', ...D.growth.map(g => `- 第${g.sc}场 ${g.label}：${g.note}`), '### 第12场潜台词', ...D.subtext.map(s => `- ${s.who}：「${s.line}」→ ${s.sub}（推断）`), '### 重点场次', ...D.keyScenes.map(k => `- 第${k.sc}场 ${k.w}：${k.why}`), '### 人物小传（草稿）', ...D.bio, '### 角色分析卡', D.roleCard.oneLine, ...D.roleCard.basic.map(b => `- ${b[0]}：${b[1]}`), ...D.roleCard.timeline.map(x => `- ${x[0]}：${x[1]}`), ...D.roleCard.core.map(c => `- ${c[0]}：${c[1]}`), ...D.roleCard.surface.map(c => `- ${c[0]}：${c[1]}`), '');
  if (has('line')) L.push('## 02 台词建议稿', `- 原句（保留）：${D.lineOpt.original}`, `- 建议：${S.adopt !== null ? D.lineOpt.options[S.adopt].t : '未采用'}（待导演确认）`, '');
  if (has('role')) L.push(`## 03 第12场表演方案 · ${handlingName()}`, ...D.beats.map((b, i) => `- 节拍${i + 1} ${b.t}｜目标：${b.goal}｜阻碍：${b.obs}｜动作：${b.act}`), '');
  if (has('dance')) L.push('## 03 第21场舞蹈拆解', `主题：${D.dance.theme}`, `音乐：${D.dance.music}`, ...D.dance.segs.map(s => `- ${s.n}（${s.beats}×8拍）情绪：${s.emo}；动作：${s.move}`), ...D.dance.log.map(l => `- ${l.d}：${l.t}｜观察问题：${l.q}`), '');
  if (has('prev')) L.push('## 04 造型与分镜', ...D.looks.map(l => `- ${l.sc}：${l.k}（${l.mood}）`), ...D.shots.map(s => `- 镜头${s.no} ${s.size} ${s.dur}秒｜${s.cam}｜${s.act}${s.line ? '｜' + s.line : ''}`), '');
  if (has('shoot')) L.push('## 05 任务看板', ...S.tasks.map(x => `- [${x.col === 2 ? 'x' : ' '}] ${x.t}（${x.who} · ${x.due}）`), '');
  if (has('promo')) L.push('## 06 粉丝反馈周报', ...D.report.topics.map(([n, v]) => `- ${n}：${v}%`), ...D.report.actions.map(a => `- 建议：${a}`), '');
  if (has('deal')) L.push(`## 07 授权核对清单 · ${D.offer.brand}`, `用途：${D.scopes[S.scope].n}`, ...D.dims.map(d => `- ${d.n}（${D.lvText[D.scopes[S.scope].lv[d.id]]}）：${d.q.join(' / ')}`), '', '> 仅作知识提示，以律师审核为准。', '');
  if (has('review')) L.push('## 08 作品复盘报告', ...D.air.kpi.map(k => `- ${k[0]}：${k[1]}${k[2]}（${k[3]}）`), '### 观众记住了什么', ...D.air.topics.map(([n, v]) => `- ${n}：${v}%`), '### 表演自评', ...D.selfQ.map((q, i) => `- ${q}\n  ${(S.selfAns || {})[i] || '（未填写）'}`), '### 带进下一部戏的三件事', ...D.takeaway.map(t => `- ${t}`), '');
  const rv = Object.entries(S.reviews).filter(([, l]) => l.length);
  if (rv.length) { L.push('## 人工复核 · 最终决定'); rv.forEach(([k, l]) => { L.push(`### ${PAGE_NAME(k)}`); l.forEach(r => L.push(`- ${r.at} ${r.who}（${(STATUS.find(x => x[0] === r.status) || STATUS[3])[1]}）：${r.text.replace(/\n/g, ' ')}`)); }); L.push(''); }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([L.join('\n')], { type: 'text/markdown' }));
  a.download = `《${P.title}》资料包.md`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('已导出资料包（Markdown）');
}

/* ---------------- 事件 ---------------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, v = el.dataset.v, i = +el.dataset.i;
  switch (a) {
    case 'go': if (el.dataset.tab) { S.tab[i] = el.dataset.tab; save(); } go(i); if (el.dataset.tab) render(); break;
    case 'tab': clearTimers(); S.tab[el.dataset.st] = v; save(); render(true); break;
    case 'run': runAI(el.dataset.k); break;
    case 'save': addFolder(el.dataset.k); break;
    case 'toast': toast('示例操作 · 未发送消息或提交审核'); break;
    case 'theme': S.theme = v; save(); render(true); if ($('#dlg').open) settings(); break;
    case 'settings': bridge({ type: 'navigate', tab: 'more' }); break;
    case 'close': $('#dlg').close(); break;
    case 'nm': S.nameIdx = i; save(); render(true); settings(); break;
    case 'prov': S.provider = v; save(); render(true); settings(); break;
    case 'reset':
      if (confirm('恢复原状、重新演示？\n工作台和肉肉的演示改动都会清空，回到「日程总览」首页（主题保留）。')) {
        const keep = { theme: S.theme, nameIdx: S.nameIdx }; clearTimers(); S = Object.assign(fresh(), keep); save(); try { localStorage.removeItem('rourou-world-v1'); } catch {}
        if ($('#dlg').open) $('#dlg').close(); render(); toast('已重置，可以重新演示');
      } break;
    case 'folder': $('#app').classList.toggle('folder-open'); break;
    case 'export': exportMd(); break;
    case 'rel': S.rel = v; save(); render(true); break;
    case 'cite': {
      S.hl = +el.dataset.sc; render(true);
      const sc = $('#sc-' + el.dataset.sc), box = $('#script');
      if (sc && box) box.scrollTop = sc.offsetTop - box.offsetTop - 8;
      toast(`已定位到原文 第${el.dataset.sc}场`); break;
    }
    case 'adopt': S.adopt = i < 0 ? null : i; save(); render(true); toast(i < 0 ? '已撤回，恢复原句' : '已采用建议，原句仍保留'); break;
    case 'handling': S.handling = v; save(); render(true); break;
    case 'play': playComic(); break;
    case 'move': S.tasks[i].col = Math.min(2, S.tasks[i].col + 1); save(); render(true); break;
    case 'sel': S.sel = i; save(); render(true); break;
    case 'tone': S.tone = v; save(); render(true); break;
    case 'submit': S.submitted[S.sel] = true; render(true); toast('示例审核状态已切换，未发送给任何人'); break;
    case 'scope': S.scope = v; S.scopeTried = true; save(); render(true); break;
    case 'pick': S.pick = v; save(); render(true); break;
    case 'step': { const g = GUIDE[+el.dataset.st][+el.dataset.k]; if (g[1]) { S.tab[el.dataset.st] = g[1]; save(); render(true); } const t = document.querySelector('.ai-box, .thinking, [data-ai]'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); break; }
    case 'drill': S.drillShow = i < 0 ? {} : { ...(S.drillShow || {}), [i]: !(S.drillShow || {})[i] }; save(); render(true); break;
    case 'wx': loadWX(true); render(true); toast('正在获取实时天气…'); break;
    case 'pack': S.pack[v] = el.checked; if (!el.checked) delete S.pack[v]; save(); render(true); break;
    case 'food': { const t = ($('#foodIn').value || '').trim(); if (!t) { toast('先输入吃了什么'); break; } const g = guessKcal(t); S.meals.push({ t: new Date().toTimeString().slice(0, 5), n: t, k: g.k }); S.lastFood = `AI 估算：${t} ≈ ${g.k} 千卡（${g.how}）`; save(); render(true); break; }
    case 'ck': S.check[v] = i; save(); render(true); break;
    case 'cycle': if (v === 'off' && !confirm('关闭并清除经期记录？')) break; S.cycleOn = v === 'on'; if (!S.cycleOn) { S.sym = {}; S.cycle = { lastStart: -24, len: 28, dur: 5 }; } save(); render(true); toast(S.cycleOn ? '已开启（仅本人可见）' : '已关闭并清除'); break;
    case 'sym': { const k = new Date().toDateString(), l = S.sym[k] = S.sym[k] || []; const j = l.indexOf(v); j < 0 ? l.push(v) : l.splice(j, 1); save(); render(true); break; }
    case 'gobrief': go(-9); break;
    case 'offer': S.offer = i; save(); render(true); break;
    case 'fanpf': S.fanPf = v; save(); render(true); break;
    case 'fanok': S.fanOk = S.fanOk || {}; S.fanOk[v] = true; save(); render(true); toast('已提交工作室审核，未对外发送'); break;
    case 'bf': S.bf = v; save(); render(true); break;
    case 'bver': S.bVerified = el.checked; save(); render(true); break;
    case 'print': document.body.classList.add('printing-card'); window.print(); setTimeout(() => document.body.classList.remove('printing-card'), 500); break;
    case 'calc': S.showCalc = !S.showCalc; save(); render(true); break;
    case 'wreset': delete S.wts; save(); render(true); toast('已恢复默认权重'); break;
    case 'evadd': { const n = ($('#evN').value || '').trim(); if (!n) { toast('先写下日程内容'); break; } let a = +$('#evA').value || S.selDay, b = +$('#evB').value || a; if (b < a) [a, b] = [b, a]; a = Math.max(1, Math.min(D.sched.days, a)); b = Math.max(1, Math.min(D.sched.days, b));
      S.userEvents.push({ id: 'u' + Date.now(), t: $('#evT').value, a, b, n, time: ($('#evTime').value || '').trim(), note: ($('#evNote').value || '').trim() }); save(); render(true); toast('已添加到日程，冲突与统计已更新'); break; }
    case 'evdel': if (v.startsWith('u')) S.userEvents = S.userEvents.filter(e => e.id !== v); else if (v.startsWith('inv-')) delete S.inv[v.slice(4)]; else S.hiddenEv[v] = true; save(); render(true); toast('已移除'); break;
    case 'evdone': S.evDone[v] = el.checked; if (!el.checked) delete S.evDone[v]; save(); render(true); break;
    case 'tdone': S.todayDone[i] = el.checked; save(); render(true); break;
    case 'evclear': if (confirm('清空全部示例日程？你添加的日程会保留。')) { D.sched.events.forEach((_, k) => S.hiddenEv['s' + k] = true); save(); render(true); toast('已清空示例，可以从零开始录入'); } break;
    case 'evrestore': S.hiddenEv = {}; save(); render(true); toast('已恢复示例日程'); break;
    case 'day': S.selDay = i; save(); render(true); break;
    case 'inv': S.inv[v] = i === 1 ? 'yes' : i === 2 ? 'no' : undefined; if (!S.inv[v]) delete S.inv[v]; save(); render(true); toast(i === 1 ? '已接受，日程已更新' : i === 2 ? '已婉拒（演示，不会发送任何消息）' : '已撤回'); break;
    case 'rvst': draftStatus = v; document.querySelectorAll('[data-act="rvst"]').forEach(b => b.classList.toggle('on', b.dataset.v === v)); break;
    case 'rvsave': saveReview(); break;
    case 'rvdel': if (confirm('删除这条决定？')) { S.reviews[pageKey()].splice(i, 1); save(); render(true); } break;
    case 'rvfdel': S.files[pageKey()].splice(i, 1); save(); render(true); break;
    case 'backup': exportBackup(); break;
    case 'archive': archiveProject(); break;
    case 'check': S.checks[i] = el.checked; save(); break;
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'rvFile' && e.target.files.length) importFiles(e.target.files);
  if (e.target.id === 'bkFile' && e.target.files[0]) importBackup(e.target.files[0]);
});
document.addEventListener('input', e => {
  if (e.target.dataset && e.target.dataset.wt) { S.wts = { ...(S.wts || D.scoreRule.weights), [e.target.dataset.wt]: +e.target.value }; save(); render(true); return; }
  if (e.target.dataset && e.target.dataset.self !== undefined) { S.selfAns = S.selfAns || {}; S.selfAns[e.target.dataset.self] = e.target.value; save(); }
  if (e.target.id === 'orgIn') S.orgQ = e.target.value;
  if (e.target.id === 'faq') {
    S.faqQ = e.target.value; const pos = e.target.selectionStart; render(true);
    const f = $('#faq'); f.focus(); f.setSelectionRange(pos, pos);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'kwIn' && e.target.value.trim()) { (S.bKw = S.bKw || []).push(e.target.value.trim()); save(); render(true); toast('已订阅关键词'); return; }
  if (e.key === 'Enter' && e.target.id === 'foodIn') { document.querySelector('[data-act="food"]').click(); return; }
  if (e.key === 'Enter' && e.target.classList?.contains('add-item') && e.target.value.trim()) {
    const r = e.target.dataset.role; (S.packAdd[r] = S.packAdd[r] || []).push(e.target.value.trim()); save(); render(true); toast('已添加到「' + r + '」'); return;
  }
  if ((e.target.closest && e.target.closest('input,textarea,select')) || $('#dlg').open || e.metaKey || e.ctrlKey || e.altKey) return;
  const SEQ = [-1, 0, 1, 2, 3, 4, 5, 6, 7, -8, -6, -5, -7, -4, -9, -2, -3], cur = onPage() ? PAGES[onPage()] : S.st, k = SEQ.indexOf(cur);
  if (e.key === 'ArrowRight' && k < SEQ.length - 1) go(SEQ[k + 1]);
  if (e.key === 'ArrowLeft' && k > 0) go(SEQ[k - 1]);
});
$('#dlg').addEventListener('click', e => { if (e.target === $('#dlg')) $('#dlg').close(); });

const fromHash = () => { const h = location.hash.slice(1), hm = h.match(/st=(\d)/); if (hm) { Object.keys(PAGES).forEach(k => S[k] = false); S.st = Math.min(7, +hm[1]); } else if (PAGES[h]) Object.keys(PAGES).forEach(k => S[k] = k === h); else return; save(); history.replaceState(null, '', location.pathname); };

/* ---------------- 通告本适配层：我的工作区（真实资料）与参考示例 ---------------- */
// A host page may drive the workbench in-process (the shareable demo) instead of through a parent frame.
const LOCAL = window.__STUDIO_LOCAL__, CH = 'tonggaoben-studio', embedded = !!LOCAL || window.parent !== window;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const bridge = m => { if (LOCAL) LOCAL.receive({ channel: CH, ...m }); else if (embedded) window.parent.postMessage({ channel: CH, ...m }, '*'); };
const ROLE = { actor: '明星', assistant: '助理', team: '团队' };
let ownMode = embedded, booted = false, here = 'home', loadError = '';
let ctx = { me: null, members: [], workspace: null, records: [], projectId: '' };
let draft = { version: 1, pages: {} }, savedAt = null;
let saveState = 'saved', saveMsg = '', saveTimer = null, dirty = false, reqSeq = 0, switching = false, staleView = false;
const waiters = {}, openPaste = {};
let ownStatus = '采纳';
S.theme = 'paper';

/* 字段定义：F(键, 名称, 类型, 选项)；L(列表键, 名称, 列) */
const F = (k, l, t = 'text', o) => ({ k, l, t, o });
const L = (k, l, cols, x = {}) => ({ k, l, cols, ...x });
const ALL = ['actor', 'assistant', 'team'], AA = ['actor', 'assistant'], AT = ['assistant', 'team'];
const sec = (id, t, d, roles, body) => ({ id, t, d, roles, vals: body.vals || [], lists: body.lists || [], extra: body.extra });
// The four platforms most people use; every platform column picks from these.
const PLATFORMS = ['微博', '抖音', '小红书', '哔哩哔哩'];
const OWN = {
  st0: { desc: '把收到的本子并排比较，记录背调与档期，最后由明星本人确认接不接。', roles: AA, secs: [
    sec('compare', '横向对比剧本', '同时收到几个本子时，先并排比一比角色分量、主创和匹配度。', AA, { lists: [L('scripts', '剧本', [F('title', '剧名'), F('role', '角色'), F('weight', '戏份'), F('team', '主创 / 平台'), F('fit', '匹配度', 'select', ['高', '中', '低', '待评估']), F('note', '备注')])] }),
    sec('read', '初读首选剧本', '记下第一遍读完的直觉，后面读本时可以回头对照。', ['actor'], { vals: [F('summary', '故事梗概', 'area'), F('arc', '角色成长线', 'select', ['完整', '部分', '扁平', '待判断']), F('scenes', '主要场次'), F('appeal', '吸引我的地方', 'area'), F('worry', '我的顾虑', 'area')] }),
    sec('vet', '项目背调', '每条结论写上来源，区分已核验、待核验和传闻。', AA, { lists: [L('checks', '核查项', [F('item', '核查内容'), F('source', '来源'), F('result', '结论', 'select', ['已核验', '待核验', '有风险', '传闻']), F('note', '说明')], { seed: [{ item: '出品方经营与诉讼' }, { item: '导演与主创口碑' }, { item: '平台与排播' }, { item: '题材与审查风险' }] })] }),
    sec('schedule', '档期核对', '对照工作台里已有的档期，写清冲突和可调整的部分。', ['assistant'], { vals: [F('window', '预计拍摄周期'), F('conflict', '冲突与调整方案', 'area')], extra: 'conflicts' }),
    sec('decide', '我的接戏决定', '理由写在这里；正式决定在项目详情里由明星本人确认，团队会看到结果。', ['actor'], { vals: [F('lean', '目前倾向', 'select', ['接下', '暂缓', '不接', '还没想好']), F('reason', '理由与条件', 'area')], extra: 'decision' })
  ] },
  st1: { desc: '整理人物关系、成长线、潜台词和人物小传，形成自己的角色分析卡。', roles: ['actor'], secs: [
    sec('rel', '人物关系', '按出场顺序记下关系，以及角色此刻知道什么。', ['actor'], { extra: 'relnet', lists: [L('people', '人物', [F('name', '人物'), F('relation', '与我的关系'), F('change', '关系变化'), F('knows', '此刻知道什么')])] }),
    sec('growth', '成长线', '关键选择按场次排开，给主动性打个分。', ['actor'], { lists: [L('beats', '关键节点', [F('scene', '场次'), F('event', '发生了什么'), F('state', '人物状态'), F('level', '主动性 1–10', 'num')])] }),
    sec('sub', '潜台词', '区分剧本写明的和你推断的。', ['actor'], { lists: [L('lines', '台词', [F('scene', '场次'), F('line', '原句'), F('sub', '潜台词'), F('basis', '依据', 'select', ['剧本写明', '人物推断'])])] }),
    sec('key', '重点场次', '变化最大、最难的几场，写清为什么和怎么准备。', ['actor'], { lists: [L('scenes', '场次', [F('scene', '场次'), F('why', '为什么重要'), F('prep', '准备方法')])], }),
    sec('bio', '人物小传', '用第一人称写，推断的部分自己标出来。', ['actor'], { vals: [F('bio', '人物小传', 'long')] }),
    sec('card', '角色分析卡', '一页纸讲清这个人，开机前可以存为资料卡给导演或团队。', ['actor'], { vals: [F('oneLine', '一句话人物'), F('background', '背景与经历', 'area'), F('personality', '性格', 'area'), F('motive', '核心动机', 'area'), F('surface', '外在细节（口头禅、习惯、体态）', 'area')] }),
    sec('line', '台词调整（可选）', '原句保留；建议稿等导演确认。确认后可以直接加入台词练习。', ['actor'], { lists: [L('opts', '台词', [F('scene', '场次'), F('original', '原句'), F('suggest', '建议稿'), F('status', '状态', 'select', ['待导演确认', '已确认', '不用'])], { toLine: true })] })
  ] },
  st2: { desc: '把重点场拆成情绪节拍，选定演法；有舞段或动作戏时拆解训练。', roles: ['actor'], secs: [
    sec('scene', '情绪节拍', '一场戏拆成几个节拍，每拍写目标、阻碍和动作。', ['actor'], { vals: [F('scene', '场次与内容')], lists: [L('beats', '节拍', [F('t', '节拍'), F('goal', '目标'), F('obstacle', '阻碍'), F('action', '动作反应')])] }),
    sec('handling', '演法选择', '先定一种准备，现场再和导演试。', ['actor'], { vals: [F('choice', '选定演法', 'select', ['克制', '试探', '爆发', '自定义']), F('why', '为什么这样演', 'area'), F('backup', '现场备选', 'area')] }),
    sec('dance', '舞蹈 / 动作拆解', '按段落写清情绪和动作；没有舞段可以跳过。', ['actor'], { vals: [F('theme', '主题'), F('music', '音乐与节奏')], lists: [L('segs', '段落', [F('name', '段落'), F('count', '八拍数', 'num'), F('emotion', '情绪'), F('move', '动作要点')])] }),
    sec('train', '训练记录', '每次练完记一笔，问题留给下次。', ['actor'], { lists: [L('log', '训练', [F('date', '日期', 'date'), F('content', '练了什么'), F('problem', '发现的问题')])] })
  ] },
  st3: { desc: '造型、分镜、走位与需要提前沟通的事项，在开机前对齐。', roles: ALL, secs: [
    sec('look', '造型参考', '按场次列造型，写清颜色、情绪和负责人。', ALL, { lists: [L('looks', '造型', [F('scene', '场次'), F('look', '造型'), F('color', '色彩'), F('mood', '情绪'), F('owner', '负责人', 'member')])] }),
    sec('board', '分镜', '镜头顺序、景别、时长和动作。', ['actor', 'team'], { lists: [L('shots', '镜头', [F('no', '镜号'), F('size', '景别', 'select', ['远景', '全景', '中景', '近景', '特写']), F('dur', '时长（秒）', 'num'), F('cam', '机位 / 运镜'), F('act', '动作'), F('line', '台词')])] }),
    sec('move', '走位与身体状态', '体态、体力和需要提前准备的身体条件。', ['actor'], { vals: [F('notes', '走位与身体', 'area')] }),
    sec('comm', '提前沟通事项', '开机前要问清楚的事，可以直接发成任务。', ALL, { lists: [L('items', '事项', [F('item', '事项'), F('with', '沟通对象'), F('owner', '负责人', 'member'), F('due', '截止', 'date')], { toTask: true })] })
  ] },
  st4: { desc: '对照当天通告，记录现场重点；把会议纪要拆成有负责人的任务。', roles: ALL, secs: [
    sec('call', '今日准备', '先看通告，再写下今天的重点和现场反馈。', ALL, { vals: [F('focus', '今天的重点', 'area'), F('feedback', '现场反馈', 'area')], extra: 'callday' }),
    sec('tasks', '纪要拆任务', '贴入会议纪要，拆成有负责人、截止日期的任务，再逐条发布到工作台。', AT.concat('actor'), { vals: [F('minutes', '会议纪要', 'area')], lists: [L('tasks', '任务', [F('title', '任务'), F('owner', '负责人', 'member'), F('due', '截止', 'date'), F('note', '说明')], { toTask: true })] }),
    sec('cal', '内容日历', '一周内容排期，谁负责、发在哪里。', AT, { lists: [L('posts', '内容', [F('date', '日期', 'date'), F('platform', '平台', 'select', PLATFORMS), F('content', '内容'), F('owner', '负责人', 'member')])] }),
    sec('faq', '常见问题与口径', '探班、采访常被问到的问题，统一口径。', AT, { lists: [L('qa', '问答', [F('q', '问题'), F('a', '口径')])] })
  ] },
  st5: { desc: '整理留言与反馈，回复先审核再发布，留意舆情信号。', roles: ALL, secs: [
    sec('plats', '各平台运营', '微博、抖音、小红书、哔哩哔哩，账号、粉丝、调性和更新节奏放在一起看。', ALL, { lists: [L('plats', '平台', [F('platform', '平台', 'select', PLATFORMS), F('account', '账号'), F('fans', '粉丝数'), F('tone', '内容调性'), F('cadence', '更新节奏'), F('owner', '负责人', 'member')], { seed: PLATFORMS.map(p => ({ platform: p })) })] }),
    sec('cmt', '留言分类', '按话题和情绪分类，标出需要人工关注的。', AT, { lists: [L('items', '留言', [F('platform', '平台', 'select', PLATFORMS), F('content', '留言'), F('type', '类型', 'select', ['剧情讨论', '表演夸奖', '求物料', '提问', '负面', '越界'])  , F('action', '处理')])] }),
    sec('reply', '回复审核', '回复草稿先过审核；本人亲自回的标出来。', ALL, { lists: [L('replies', '回复', [F('to', '回复对象'), F('text', '回复草稿'), F('status', '状态', 'select', ['草稿', '待本人确认', '已确认', '不回复'])])] }),
    sec('rep', '运营反馈周报', '本周观众最关心什么，下一步怎么做。', AT, { vals: [F('topics', '热议话题', 'area'), F('sentiment', '情绪分布'), F('actions', '建议动作', 'area')] }),
    sec('sig', '舆情信号', '先核实，再判断要不要处理。', ALL, { lists: [L('signals', '信号', [F('signal', '内容'), F('level', '程度', 'select', ['低', '中', '高']), F('handle', '处理方式')])] })
  ] },
  st6: { desc: '核验品牌，逐项写清授权边界，交律师确认后由明星本人决定。', roles: AA, secs: [
    sec('brand', '品牌核验', '每条信息写来源，分清已核验、待核验和传闻。', AA, { vals: [F('brand', '品牌'), F('product', '产品 / 合作形式')], lists: [L('checks', '核验', [F('item', '核验内容'), F('source', '来源'), F('status', '状态', 'select', ['已核验', '待核验', '传闻'])])] }),
    sec('rights', '授权边界', '肖像、声音、表演数据、生成内容、商业授权逐项写清。', AA, { lists: [L('dims', '授权项', [F('dim', '授权项'), F('allow', '是否允许', 'select', ['允许', '有限允许', '不允许', '待问清'])  , F('term', '期限 / 范围'), F('note', '要问清的问题')], { seed: [{ dim: '肖像' }, { dim: '声音' }, { dim: '表演数据' }, { dim: '生成内容（AI）' }, { dim: '商业授权' }] })] }),
    sec('scope', '用途与期限', '用途、期限、地域和排他范围。', ['assistant'], { vals: [F('use', '用途'), F('term', '期限'), F('region', '地域'), F('exclusive', '排他范围')] }),
    sec('lawyer', '待律师确认', '列出要律师回复的问题，写上负责人。', ['assistant'], { lists: [L('qs', '问题', [F('q', '问题'), F('owner', '负责人', 'member'), F('status', '状态', 'select', ['待发出', '已发律师', '已回复'])], { toTask: true })] }),
    sec('decide', '我的边界', '本人能接受和不能接受的，写清楚。', ['actor'], { vals: [F('yes', '可以接受', 'area'), F('no', '不能接受', 'area')] })
  ] },
  st7: { desc: '总结作品与表演，把经验带进下一部戏。', roles: ALL, secs: [
    sec('look', '作品复盘', '做得好的、需要改善的。', ALL, { vals: [F('good', '做得好的', 'area'), F('improve', '下次改善', 'area')] }),
    sec('data', '播出与口碑', '播放、评分、讨论度，写上数据来源。', AT, { lists: [L('kpi', '指标', [F('name', '指标'), F('value', '数值'), F('source', '来源'), F('note', '说明')])] }),
    sec('self', '表演自评', '四个问题，写给下一部戏的自己。', ['actor'], { vals: D.selfQ.map((q, i) => F('q' + i, q, 'area')) }),
    sec('next', '带进下一部戏', '三件最值得带走的事。', ALL, { lists: [L('items', '经验', [F('item', '经验'), F('owner', '负责人', 'member')])] })
  ] },
  portfolio: { icon: '🎞', name: '作品库与发展规划', sub: '作品 · 方向 · 年度规划', desc: '整理作品，想清楚适合什么角色、下一步往哪走。', roles: AA, img: '20_award', secs: [
    sec('works', '作品库', '已拍、已播的作品都记下来。', AA, { lists: [L('works', '作品', [F('title', '作品'), F('year', '年份'), F('role', '角色'), F('genre', '题材'), F('platform', '平台'), F('feedback', '口碑')])] }),
    sec('direction', '发展方向', '优先、暂不接和想争取的。', AA, { vals: [F('prefer', '优先方向', 'area'), F('avoid', '暂不接', 'area'), F('want', '想争取', 'area')] }),
    sec('goals', '年度规划', '按季度排目标和负责人。', AA, { lists: [L('goals', '目标', [F('when', '时间'), F('goal', '目标'), F('owner', '负责人', 'member')], { toTask: true })] })
  ] },
  deals: { icon: '📑', name: '合同与品牌', sub: '合同 · 代言 · 新邀约', desc: '合同、代言和新邀约放在一起看，排他和到期一目了然。', roles: AA, img: '14_rights', secs: [
    sec('contracts', '合同与代言', '品类排他和到期日最容易撞，写清楚。', AA, { lists: [L('items', '合同', [F('brand', '品牌'), F('type', '类型', 'select', ['代言', '广告', '合作', '影视', '其他']), F('exclusive', '排他品类'), F('until', '到期', 'date'), F('status', '状态', 'select', ['洽谈中', '待律师', '已签', '已结束', '婉拒'])])] }),
    sec('offers', '新邀约评估', '品牌背景、风险、和现有合同冲不冲突。', AA, { lists: [L('offers', '邀约', [F('brand', '品牌'), F('product', '产品'), F('risk', '风险'), F('decision', '建议', 'select', ['可以接', '有条件接', '婉拒', '待评估'])])] })
  ] },
  fans: { icon: '💬', name: '粉丝与社群', sub: '后援会 · 平台 · 内容', desc: '真诚对待粉丝，也守住边界。', roles: ALL, img: '28_fans', secs: [
    sec('groups', '后援会与对接人', '各平台的组织和对接方式。', AT.concat('actor'), { lists: [L('groups', '组织', [F('name', '名称'), F('platform', '平台'), F('contact', '对接人'), F('note', '注意事项')])] }),
    sec('plan', '粉丝内容计划', '谁发、发在哪、谁审核。', ALL, { lists: [L('plan', '内容', [F('date', '日期', 'date'), F('platform', '平台', 'select', PLATFORMS), F('content', '内容'), F('approver', '审核人', 'member')])] }),
    sec('bounds', '边界与提醒', '哪些行为要提醒，怎么引导。', ALL, { vals: [F('rules', '边界说明', 'area')] })
  ] },
  crisis: { icon: '🛡', name: '危机公关与舆情', sub: '核实 · 研判 · 回应', desc: '先核实，再回应。时间线和证据都留档。', roles: ALL, img: '27_comments', secs: [
    sec('event', '事件与核实', '发生了什么、从哪里开始、哪些已核实。', ALL, { vals: [F('what', '事件'), F('origin', '首发来源'), F('verified', '已核实的信息', 'area')], lists: [L('timeline', '时间线', [F('time', '时间'), F('event', '经过')])] }),
    sec('response', '回应方案', '选一种回应方式，写清谁先发、什么时候发。', ALL, { vals: [F('way', '回应方式', 'select', ['暂不回应', '联合澄清', '工作室声明', '本人回应', '法律途径']), F('plan', '执行安排', 'area'), F('statement', '声明草稿', 'long')] }),
    sec('evidence', '证据留存', '截图、链接、时间都要记。', AT, { lists: [L('items', '证据', [F('what', '内容'), F('link', '链接 / 位置'), F('at', '记录时间')])] })
  ] },
  charity: { icon: '💛', name: '公益与影响力', sub: '项目 · 机构核验 · 倡议', desc: '把热爱变成看得见的善意；机构先核验，资金要公示。', roles: ALL, img: '22_charity', secs: [
    sec('projects', '公益项目', '机构资质、公示频率和负责人。', ALL, { lists: [L('items', '项目', [F('name', '项目'), F('org', '机构'), F('verify', '资质核验', 'select', ['已核验', '待核验', '有疑问']), F('disclose', '公示频率'), F('owner', '负责人', 'member')])] }),
    sec('post', '倡议文案', '发布前由工作室审核。', ALL, { vals: [F('text', '文案', 'long'), F('review', '审核意见', 'area')] })
  ] },
  brief: { icon: '📰', name: '行业简报', sub: '来源核验 · 趋势 · 灵感', desc: '每条信息标来源和核验状态，判断和自己的相关度。', roles: ALL, img: '30_digital', secs: [
    sec('items', '本周简报', '只记有来源的；传闻单独标出来。', ALL, { vals: [F('keywords', '关注关键词')], lists: [L('items', '信息', [F('title', '内容'), F('field', '方向', 'select', ['影视', '舞蹈', '音乐', '时尚', 'AI 内容', '行业活动', '公益']), F('source', '来源'), F('status', '核验', 'select', ['已核验', '待核验', '传闻']), F('action', '建议动作')])] })
  ] },
  trip: { icon: '🧳', name: '出行与天气', sub: '行程 · 交通 · 携带清单', desc: '行程、交通和随身物品；天气请以出发前的实时预报为准。', roles: AA, img: '08_station', secs: [
    sec('legs', '行程', '每段写清时间、方式和天气提醒。', AA, { lists: [L('legs', '行程', [F('date', '日期', 'date'), F('from', '出发'), F('to', '到达'), F('mode', '方式', 'select', ['飞机', '高铁', '自驾', '其他']), F('time', '时间'), F('note', '天气 / 备注')])] }),
    sec('pack', '携带清单', '谁带、带了没有。', AA, { lists: [L('items', '物品', [F('item', '物品'), F('owner', '负责人', 'member'), F('done', '状态', 'select', ['待准备', '已装好'])])] })
  ] },
  body: { icon: '💪', name: '身体与状态', sub: '体态 · 训练 · 睡眠（仅自己）', desc: '只保存在你自己的草稿里，不会自动给任何人看。', roles: ['actor'], img: '19_body', secs: [
    sec('target', '角色体态目标', '定妆、开机前要达到的状态，节奏要安全。', ['actor'], { vals: [F('goal', '目标'), F('plan', '训练与饮食安排', 'area')] }),
    sec('log', '每日记录', '体重、睡眠、运动和感受。', ['actor'], { lists: [L('log', '记录', [F('date', '日期', 'date'), F('weight', '体重'), F('sleep', '睡眠'), F('exercise', '运动'), F('feeling', '感受')])] })
  ] }
};
const OWN_IMG = ['09_script', '24_scripts', '07_rooftop', '29_storyboard', '10_set', '13_press', '14_rights', '26_director'];
const CAREER = ['portfolio', 'deals', 'fans', 'crisis', 'charity', 'brief'], LIFE = ['trip', 'body'];
const role = () => (ctx.me && ctx.me.role) || 'actor';
const canPage = k => k === 'home' || (OWN[k] && OWN[k].roles.includes(role()));
const mySecs = k => OWN[k].secs.filter(s => s.roles.includes(role()));
const pageTitle = k => k === 'home' ? '日程总览' : k[0] === 's' && k[1] === 't' ? `${D.stations[+k[2]].no} ${D.stations[+k[2]].name}` : OWN[k].name;
const pg = k => (draft.pages[k] = draft.pages[k] || { values: {}, lists: {}, complete: false });
const peek = k => draft.pages[k] || { values: {}, lists: {}, complete: false };
const filled = (k, s) => { const p = peek(k); return s.vals.some(f => (p.values[f.k] || '').trim()) || s.lists.some(l => (p.lists[l.k] || []).length > 0); };
const pageCount = k => { const ss = mySecs(k); return [ss.filter(s => filled(k, s)).length, ss.length]; };
const records = kind => ctx.records.filter(r => r.kind === kind && !r.deleted);
const project = () => records('schedule').find(r => r.id === ctx.projectId);
const memberName = id => { const m = ctx.members.find(x => x.userId === id); return m ? `${m.name}（${ROLE[m.role]}）` : ''; };
const todayStr = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
const dateOk = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '');

/* ---------- 保存 ---------- */
function setSave(st, msg = '') { saveState = st; saveMsg = msg; const el = $('#oSave'); if (el) el.outerHTML = saveChip(); }
function saveChip() {
  const t = { saved: savedAt ? '已保存 · ' + new Date(savedAt).toTimeString().slice(0, 5) : '已保存', dirty: '有改动 · 稍后自动保存', saving: '保存中…', error: '保存失败 · 点此重试', conflict: '其他设备已更新 · 需处理' }[saveState];
  return `<button class="save-chip ${saveState}" id="oSave" data-o="${saveState === 'error' ? 'retry' : saveState === 'conflict' ? 'conflict' : ''}" title="${esc(saveMsg)}">${t}</button>`;
}
function touch() { dirty = true; if (saveState !== 'conflict') setSave('dirty'); clearTimeout(saveTimer); saveTimer = setTimeout(flush, 900); }
function flush() {
  clearTimeout(saveTimer);
  if (!dirty || !booted || saveState === 'conflict') return Promise.resolve(saveState !== 'error' && saveState !== 'conflict');
  dirty = false; const id = ++reqSeq; setSave('saving');
  bridge({ type: 'save', state: draft, requestId: id });
  return new Promise(res => { waiters[id] = res; });
}

/* ---------- 框架：侧栏 / 顶栏 / 资料夹 ---------- */
function oSide() { $('#side').innerHTML = ''; }
function modeSwitch() { return embedded ? `<div class="mode-switch" role="group" aria-label="切换"><button class="${ownMode ? 'on' : ''}" data-o="own">我的工作区</button><button class="${ownMode ? '' : 'on'}" data-o="demo">参考示例</button></div>` : ''; }
const groupOf = k => k === 'home' ? 'today' : k[0] === 's' && k[1] === 't' ? 'journey' : CAREER.includes(k) ? 'career' : 'life';
const CAT_BASE = LOCAL && typeof LOCAL.catBase === 'string' ? LOCAL.catBase : '../';
// One cat per page: the viewer's own cat on the overview, then one cat for each area of the workbench.
const catImg = k => CAT_BASE + (!k || k === 'home' ? (({ assistant: 'cat-assistant.png', team: 'cat-team.png' })[role()] || 'cat-mascot.png') : ({ journey: 'cat-lounge.png', career: 'cat-team.png', life: 'cat-mascot.png' })[groupOf(k)]);
const sentence = t => String(t).toLowerCase().replace(/^./, c => c.toUpperCase());
// Every page has its own cat or cat thing (bowl, treats, yarn and toy mouse); the same picture marks its card and its header.
const ITEM = { st0: ['cat-treats'], st1: ['cat-lounge'], st2: ['cat-toys'], st3: ['cat-guide'], st4: ['cat-bowl'], st5: ['cat-mascot'], st6: ['cat-assistant'], st7: ['cat-treats', 1], portfolio: ['cat-lounge', 1], deals: ['cat-bowl', 1], fans: ['cat-toys', 1], crisis: ['cat-assistant', 1], charity: ['cat-guide', 1], brief: ['cat-mascot', 1], trip: ['cat-bowl'], body: ['cat-lounge'] };
const itemImg = (k, cls = '') => { const [f, flip] = ITEM[k] || ['cat-mascot']; return `<img class="${cls}${flip ? ' flip' : ''}" src="${CAT_BASE}cats/${f}.png" alt="" loading="lazy">`; };
const navGroups = () => [['journey', '拍戏准备', D.stations.map((_, i) => 'st' + i).filter(canPage)], ['career', '事业', CAREER.filter(canPage)], ['life', '生活', LIFE.filter(canPage)]].filter(x => x[2].length);
const firstPage = () => (navGroups()[0] || [, , ['st0']])[2][0];
let sentGroups = '';
function toolsHtml() {
  return `<div class="own-toolbar"><label class="proj"><span>项目</span><select data-o-change="project" ${switching ? 'disabled' : ''}><option value="">通用 · 不关联项目</option>${records('schedule').sort((a, b) => (b.payload.startDate || '').localeCompare(a.payload.startDate || '')).map(r => `<option value="${esc(r.id)}" ${r.id === ctx.projectId ? 'selected' : ''}>${esc(r.payload.name)} · ${esc(r.payload.status || '')}</option>`).join('')}</select></label>${saveChip()}<button class="own-folder" data-o="folder">资料夹</button><button class="own-link" data-o="demo">参考示例</button></div>`;
}
function oTop() {
  if (here === 'home' || !canPage(here)) here = firstPage();
  const g = groupOf(here), groups = navGroups(), cur = groups.find(x => x[0] === g);
  // The host page shows the groups in its own top bar, beside its other tabs.
  const msg = JSON.stringify({ items: groups.map(([id, label]) => ({ id, label })), current: g });
  if (msg !== sentGroups) { sentGroups = msg; bridge({ type: 'groups', ...JSON.parse(msg) }); }
  const card = k => { const st = groupOf(k) === 'journey', [n, t] = pageCount(k), done = peek(k).complete;
    return `<li><button style="--acc:${hue(k)}" class="pcard ${here === k ? 'on' : ''} ${done ? 'done' : ''}" data-o="page" data-p="${k}">${itemImg(k, 'pcard-pic')}<span class="pcard-text">${st ? `<i>${D.stations[+k[2]].no}</i>` : ''}<b>${esc(st ? D.stations[+k[2]].name : OWN[k].name)}</b></span><span class="pcard-meta"><em><u style="width:${t ? n / t * 100 : 0}%"></u></em><small>${done ? '完成' : n + '/' + t}</small></span></button></li>`; };
  $('#top').innerHTML = cur ? `<ol class="pcards">${cur[2].map(card).join('')}</ol>` : '';
}
function oFolder() {
  const pages = ['home'].concat(D.stations.map((_, i) => 'st' + i), CAREER, LIFE).filter(k => k !== 'home' && canPage(k));
  const linked = ctx.projectId ? ctx.records.filter(r => ['task', 'resource', 'note'].includes(r.kind) && r.payload.projectId === ctx.projectId) : [];
  const kindName = { task: '任务', resource: '资料卡', note: '准备笔记' };
  $('#folder').innerHTML = `
  <div class="folder-head"><h3>${project() ? '这部戏的资料夹' : '我的资料夹'}<button class="own-close" data-o="folder" aria-label="关闭资料夹">×</button></h3><p>草稿只有你自己能看到。要给别人看，在板块里点「存为资料卡」或「发成任务」，选好共享范围。</p></div>
  <div class="folder-list">${pages.map(k => { const [n, t] = pageCount(k), c = peek(k).complete; return `<div class="fi ${n ? '' : 'empty'}" data-o="page" data-p="${k}"><span class="fi-no">${c ? '✓' : n + '/' + t}</span><div><b>${esc(pageTitle(k))}</b><small>${c ? '已完成' : n ? `已填 ${n} 项，共 ${t} 项` : '还没开始'}</small></div></div>`; }).join('')}
  ${ctx.projectId ? `<h4 class="folder-cap">工作台里关联的资料</h4>${linked.length ? linked.map(r => `<div class="fi" data-o="open" data-id="${esc(r.id)}"><span class="fi-no">${kindName[r.kind]}</span><div><b>${esc(r.payload.title || '未命名')}</b><small>${r.kind === 'task' ? esc((r.payload.status || '') + (r.payload.assigneeId ? ' · ' + memberName(r.payload.assigneeId) : '')) : esc({ private: '仅自己', core: '明星与助理', workspace: '整个团队' }[r.visibility] || '')}</small></div></div>`).join('') : '<p class="small muted pad">还没有关联到这个项目的任务或资料卡。</p>'}` : ''}
  </div>
  <div class="folder-foot"><button class="btn pri" data-o="exportAll">导出${project() ? '整部戏' : ''}资料包</button>
  <div class="row mt8 foot3"><button class="btn sm" data-o="backup">💾 备份草稿</button><label class="btn sm">📥 导入草稿<input type="file" data-o-file="import" accept=".json,application/json" hidden></label></div></div>`;
}

/* ---------- 表单控件 ---------- */
function control(f, value, path) {
  const a = `data-f="${path}" aria-label="${esc(f.l)}"`;
  if (f.t === 'area' || f.t === 'long') return `<textarea ${a} class="${f.t}" rows="${f.t === 'long' ? 10 : 4}">${esc(value)}</textarea>`;
  if (f.t === 'select') return `<select ${a}><option value="">请选择</option>${f.o.map(o => `<option ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}${value && !f.o.includes(value) ? `<option selected>${esc(value)}</option>` : ''}</select>`;
  if (f.t === 'member') return `<select ${a}><option value="">未指定</option>${ctx.members.map(m => `<option value="${esc(m.userId)}" ${m.userId === value ? 'selected' : ''}>${esc(m.name)}（${ROLE[m.role]}）</option>`).join('')}</select>`;
  if (f.t === 'date') return `<input type="date" ${a} value="${esc(value)}">`;
  if (f.t === 'num') return `<input type="number" inputmode="decimal" ${a} value="${esc(value)}">`;
  return `<input type="text" ${a} value="${esc(value)}">`;
}
function listBlock(k, s, l) {
  const rows = peek(k).lists[l.k] || [], base = `${k}|${l.k}`, can = { task: l.toTask, line: l.toLine && role() !== 'team' };
  return `<div class="o-list" data-ai-list="${base}" style="--cols:${l.cols.length}">
    ${rows.length ? `<div class="o-head">${l.cols.map(c => `<span>${esc(c.l)}</span>`).join('')}<span></span></div>` : ''}
    ${rows.map((r, i) => `<div class="o-row">${l.cols.map(c => `<label class="o-cell"><span>${esc(c.l)}</span>${control(c, r[c.k] || '', `${base}|${i}|${c.k}`)}</label>`).join('')}
      <div class="o-acts">${r._ai ? `<span class="ai-pill">AI 示例</span><button class="btn sm" data-o="aiKeep" data-l="${base}" data-i="${i}">保留</button>` : ''}${can.task ? `<button class="btn sm" data-o="toTask" data-l="${base}" data-i="${i}" title="发布到工作台任务">发成任务</button>` : ''}${can.line ? `<button class="btn sm" data-o="toLine" data-l="${base}" data-i="${i}">加入台词练习</button>` : ''}<button class="btn sm ghost" data-o="delRow" data-l="${base}" data-i="${i}" aria-label="删除这一行">删除</button></div></div>`).join('')}
    ${rows.length ? '' : `<p class="o-empty">暂无${esc(l.l)}</p>`}
    <div class="row o-add">${aiRowsFor(k, l.k) ? aiButton('aiFill', `data-l="${base}"`, 'AI 帮我添加', base) : ''}<button class="btn" data-o="addRow" data-l="${base}">＋ 添加${esc(l.l)}</button><button class="btn" data-o="paste" data-l="${base}">整段粘贴多行</button>${l.seed && !rows.length ? `<button class="btn" data-o="seed" data-l="${base}">填入常用${esc(l.l)}</button>` : ''}</div>
    ${openPaste[base] ? `<div class="o-paste"><p class="small">每行一条，列之间用 <b>｜</b> 或 Tab 分隔，顺序：${l.cols.map(c => esc(c.l)).join(' ｜ ')}。只写一列也可以。</p><textarea data-paste="${base}" rows="6" placeholder="${esc(l.cols.slice(0, 3).map(c => c.l).join(' ｜ '))}"></textarea><div class="row mt8"><button class="btn pri" data-o="pasteAdd" data-l="${base}">按行添加</button><button class="btn" data-o="paste" data-l="${base}">取消</button></div></div>` : ''}
  </div>`;
}
function extraBlock(k, s) {
  const p = project(), me = ctx.me || {};
  if (s.extra === 'relnet') {
    const rows = (peek(k).lists.people || []).filter(r => (r.name || '').trim()), pal = ['#57778a', '#a3715c', '#7d6c8e', '#5f8270', '#a06a74', '#636f96', '#9c8550', '#7a8058'];
    return rows.length ? netSVG('我的角色', rows.slice(0, 10).map((r, i) => ({ label: r.name, edge: r.relation || '', color: pal[i % pal.length] })), '#3a3833') : '<p class="net-hint">在下表填入人物和关系，这里会自动画出关系网。</p>';
  }
  if (s.extra === 'decision') {
    if (!p) return '<div class="o-callout">先在顶部选择一个项目，接戏决定会记在那个项目上。</div>';
    return `<div class="o-callout"><b>《${esc(p.payload.name)}》当前决定：${esc(p.payload.decision || '待决定')}</b><span>正式决定会同步给助理和团队，并留下记录。</span><button class="btn pri" data-o="open" data-id="${esc(p.id)}">去确认接戏决定</button></div>`;
  }
  if (s.extra === 'conflicts') {
    const list = records('schedule').filter(r => r.payload.status !== '已结束'), hits = [];
    list.forEach((a, i) => list.slice(i + 1).forEach(b => { if (a.payload.startDate <= b.payload.endDate && b.payload.startDate <= a.payload.endDate) hits.push([a, b]); }));
    return `<div class="o-callout ${hits.length ? 'warn' : ''}"><b>${hits.length ? `工作台里有 ${hits.length} 处档期重叠` : '工作台里的档期暂无重叠'}</b>${hits.map(([a, b]) => `<span>${esc(a.payload.name)}（${esc(a.payload.startDate)}—${esc(a.payload.endDate)}）与 ${esc(b.payload.name)}（${esc(b.payload.startDate)}—${esc(b.payload.endDate)}）</span>`).join('')}${p && p.payload.decision ? `<span>明星决定：${esc(p.payload.decision)}</span>` : ''}<button class="btn" data-o="nav" data-tab="schedule">打开档期</button></div>`;
  }
  if (s.extra === 'callday') {
    const days = records('callDay').sort((a, b) => a.payload.date.localeCompare(b.payload.date)), d = days.find(r => r.payload.date === todayStr()) || days.find(r => r.payload.date > todayStr());
    if (!d) return `<div class="o-callout"><b>工作台里还没有今天或之后的通告。</b>${role() === 'assistant' ? '<button class="btn pri" data-o="create" data-kind="callDay">新建通告</button>' : '<span>通告由助理编排，发布后会出现在这里。</span>'}</div>`;
    const sc = d.payload.scenes || [];
    return `<div class="o-callout"><b>${d.payload.date === todayStr() ? '今天' : esc(d.payload.date)} · ${esc(d.payload.projectCode)}${d.payload.location ? ' · ' + esc(d.payload.location) : ''}</b><span>化妆 ${esc(d.payload.makeupTime || '—')} · 到场 ${esc(d.payload.arrivalTime || '—')} · ${sc.length} 场，已完成 ${sc.filter(x => x.cleared).length} 场</span>${sc.slice(0, 6).map(x => `<span>${x.cleared ? '✓' : '○'} 第${esc(x.number)}场 ${esc(x.summary || '')}</span>`).join('')}<button class="btn" data-o="open" data-id="${esc(d.id)}">打开通告</button></div>`;
  }
  return '';
}


/* ---------- AI 分析 · 示例（预置内容，未调用任何模型） ---------- */
const prim = v => typeof v === 'string' || typeof v === 'number';
const clean = arr => arr.filter(prim).filter(x => !/^#|^\d\d_/.test(String(x)));
function tx(v) {
  if (prim(v)) return `<p>${esc(v)}</p>`;
  if (Array.isArray(v)) return `<ul class="ai-list">${v.map(x => `<li>${prim(x) ? esc(x) : esc(clean(Array.isArray(x) ? x : Object.values(x)).join(' · '))}</li>`).join('')}</ul>`;
  if (v && typeof v === 'object') return Object.values(v).map(tx).join('');
  return '';
}
const ul = list => `<ul class="ai-list">${list.map(x => `<li>${x}</li>`).join('')}</ul>`;
const h5 = t => `<h5>${esc(t)}</h5>`;
const AIX = {
  'st0.compare': ['compare', '三部剧本横向对比', () => ul(D.scripts.map(x => `<b>《${esc(x.t)}》</b> ${esc(x.g)} · ${esc(x.role)}`)) + h5('建议') + ul(D.compareAdvice.map(esc))],
  'st0.read': ['take', '首选剧本初读', () => `<p>${esc(D.take.summary)}</p><p><b>成长线：</b>${esc(D.take.arc)}</p>` + ul(D.take.fit.map(f => `<b>${esc(f.k)}</b>（${esc(f.t)}）：${esc(f.v)}`))],
  'st1.rel': ['rel', '人物关系', () => ul(D.people.map(x => `<b>${esc(x.name)}</b>：${esc(x.desc)}${x.edge ? `（${esc(x.edge)}）` : ''}`))],
  'st1.growth': ['growth', '成长线', () => ul(D.growth.map(g => `<b>第${g.sc}场 · ${esc(g.label)}</b>：${esc(g.note)}`))],
  'st1.sub': ['subtext', '第12场潜台词', () => ul(D.subtext.map(x => `<b>${esc(x.who)}</b>「${esc(x.line)}」→ ${esc(x.sub)}（推断）`))],
  'st1.key': ['keysc', '重点场次', () => ul(D.keyScenes.map(k => `<b>第${k.sc}场 · ${esc(k.w)}</b>：${esc(k.why)} <i>${esc(k.tip)}</i>`))],
  'st1.bio': ['bio', '人物小传草稿', () => D.bio.map(x => `<p>${esc(x)}</p>`).join('')],
  'st1.card': ['rcard', '角色分析卡', () => `<p><b>${esc(D.roleCard.oneLine)}</b></p>` + ul(D.roleCard.basic.map(b => `${esc(b[0])}：${esc(b[1])}`))],
  'st1.line': ['lineopt', '台词改写建议', () => `<p>原句（保留）：「${esc(D.lineOpt.original)}」</p>` + ul(D.lineOpt.options.map(o => `<b>${esc(o.k)}</b>「${esc(o.t)}」 ${esc(o.why)}`))],
  'st2.scene': ['beats', '第12场情绪节拍', () => ul(D.beats.map((b, n) => `<b>节拍${n + 1} · ${esc(b.t)}</b>：目标 ${esc(b.goal)}；阻碍 ${esc(b.obs)}；动作 ${esc(b.act)}`))],
  'st2.handling': ['beats', '三种演法对比', () => ul(D.handlings.map(h => `<b>${esc(h.k)}</b>：${esc(h.rhythm)}；${esc(h.eye)}；风险：${esc(h.risk)}`))],
  'st2.dance': ['dance', '第21场舞蹈拆解', () => `<p>${esc(D.dance.theme)}</p><p>${esc(D.dance.music)}</p>` + ul(D.dance.segs.map(x => `<b>${esc(x.n)}</b>（${x.beats}×8拍）${esc(x.emo)}：${esc(x.move)}`))],
  'st3.look': ['looks', '造型方向', () => ul(D.looks.map(l => `<b>${esc(l.sc)}</b>：${esc(l.k)}（${esc(l.mood)}）`))],
  'st3.board': ['shots', '轻量分镜', () => ul(D.shots.map(x => `<b>镜头${x.no} · ${esc(x.size)} ${x.dur}秒</b> ${esc(x.cam)}：${esc(x.act)}${x.line ? `「${esc(x.line)}」` : ''}`))],
  'st4.call': ['call', '今日准备清单', () => `<p><b>${esc(D.callsheet.date)}</b> · ${esc(D.callsheet.call)} · ${esc(D.callsheet.place)}</p>` + ul(D.callsheet.prep.map(esc))],
  'st4.tasks': ['tasks', '纪要拆成任务', () => ul(D.tasks.map(x => `${esc(x.t)}（${esc(x.who)} · ${esc(x.due)}）`))],
  'st4.cal': ['fanplan', '一周内容日历', () => ul(D.week.map(w => `<b>${esc(w.d)}</b>：${w.ev.map(e => esc(e[1])).join('、')}`))],
  'st4.faq': [['读取资料夹与对外规则', '整理常被问到的问题', '生成统一口径'], '常见问题与口径', () => ul(D.faq.map(f => `<b>${esc(f.q)}</b> ${esc(f.a)}`))],
  'st5.cmt': ['classify', '留言分类', () => ul(D.comments.slice(0, 8).map(c => `<b>${esc(c.u)}</b>：${esc(c.t)}`))],
  'st5.reply': ['classify', '回复草稿（三种语气）', () => ul(Object.entries(D.replies.work).map(([k, v]) => `<b>${{ warm: '温暖', play: '俏皮', formal: '正式' }[k] || esc(k)}</b>：${esc(v)}`))],
  'st5.rep': ['report', '运营反馈周报', () => ul(D.report.topics.map(t => `${esc(t[0])}：${t[1]}%`)) + h5('建议动作') + ul(D.report.actions.map(esc))],
  'st5.sig': ['report', '舆情信号', () => ul(D.signals.map(x => `<b>${esc(x.t)}</b>：${esc(x.d)} → ${esc(x.s)}`))],
  'st6.brand': ['brand', '品牌信息核验', () => `<p><b>${esc(D.offer.brand)}</b> · ${esc(D.offer.type)}</p>` + ul(D.sources.map(x => `<b>${esc(x.tag)}</b> ${esc(x.t)}（${esc(x.from)}）`))],
  'st6.rights': ['rights', '授权边界要问清的问题', () => ul(D.dims.map(d => `<b>${esc(d.n)}</b>：${d.q.map(esc).join(' ')}`)) + '<p class="ai-note">仅作知识提示，以律师审核为准。</p>'],
  'st7.look': ['plan', '作品复盘', () => h5('做得好的') + ul(D.wins.map(esc)) + h5('下次改善') + ul(D.improve.map(esc))],
  'st7.data': ['airdata', '播出与口碑', () => ul(D.air.kpi.map(k => `<b>${esc(k[0])}</b>：${esc(k[1])}${esc(k[2])}（${esc(k[3])}）`))],
  'st7.self': ['selfrev', '各方反馈', () => ul(D.feedback.map(f => `<b>${esc(f[0])}</b>：${esc(f[1])}`))],
  'st7.next': ['plan', '带进下一部戏', () => ul(D.takeaway.map(esc))],
  'portfolio.direction': ['port', '发展方向建议', () => h5('最适合') + ul(D.portfolio.best.map(esc)) + h5('要谨慎') + ul(D.portfolio.careful.map(esc)) + h5('路线') + ul(D.portfolio.road.map(r => `<b>${esc(r[0])}</b>：${esc(r[1])}`))],
  'portfolio.goals': ['port', '年度目标进度', () => ul(D.goals.map(g => `<b>${esc(g.g)}</b> ${g.p}%：${esc(g.s)}`))],
  'deals.offers': ['offer0', '新邀约背调', () => ul(D.deals.offers.map(o => `<b>${esc(o.n)}</b> · ${esc(o.cat)} · ${esc(o.role)} → ${esc(o.verdict[1])}`))],
  'deals.contracts': ['clause', '合同要点', () => ul(D.deals.contracts.map(c => `<b>${esc(c.n)}</b>（${esc(c.st)} · 到期 ${esc(c.end)}）：${(c.keys || []).map(esc).join('；')}`))],
  'fans.plan': ['fanplan', '各平台内容策略', () => ul(D.fans.platforms.map(x => `<b>${esc(x.n)}</b>（${esc(x.fans)}）：${esc(x.tone)}；适合 ${esc(x.best)}；${esc(x.cadence)}`))],
  'crisis.event': ['crisis', '事件研判', () => `<p><b>${esc(D.crisis.event.t)}</b> · ${esc(D.crisis.event.heat)}</p>` + ul(D.crisis.event.timeline.map(t => `<b>${esc(t[0])}</b> ${esc(t[1])}：${esc(t[2])}`)) + h5('研判') + ul(D.crisis.event.judge.map(j => `<b>${esc(j[0])}</b>：${esc(j[1])}`))],
  'crisis.response': ['crisis', '回应方式与声明草稿', () => ul(D.crisis.event.options.map(o => `<b>${esc(o[0])}</b>：${esc(o[1])}`)) + h5('声明草稿') + `<p>${esc(D.crisis.event.draft)}</p>`],
  'charity.projects': ['orgcheck', '公益项目与机构核验', () => ul(D.charity.projects.map(x => `<b>${esc(x.n)}</b> · ${esc(x.org)} · ${esc(x.role)}${x.next ? '：' + esc(x.next) : ''}`))],
  'charity.post': ['fanpost', '倡议文案草稿', () => tx(D.charity.fanPost)],
  'brief.items': ['brief', '本周行业简报', () => `<p>${esc(D.brief2.summary)}</p>` + ul(D.brief2.items.map(x => `<b>${esc(x.tag)}</b> ${esc(x.t)}：${esc(x.act || x.sum)}`))],
  'trip.legs': ['legs', '行程与交通判断', () => ul(D.trip.legs.map(l => `<b>第${l.d}天 · ${esc(l.from)} → ${esc(l.to)}</b>（${l.km} 公里，${esc(l.leave)} 出发）：${Object.entries(l.opts).map(([k, o]) => `${esc(k)}约 ${o.h} 小时`).join('，')}`)) + '<p class="ai-note">天气以出发前的实时预报为准。</p>'],
  'body.target': ['bodyplan', '体态与训练节奏', () => D.body.plan.map(([t, items]) => h5(t) + ul(items.map(esc))).join('')]
};
const aiState = {};
function aiBlockOwn(key) {
  const def = AIX[key]; if (!def) return '';
  const st = aiState[key], steps = Array.isArray(def[0]) ? def[0] : (STEPS[def[0]] || ['整理资料', '生成建议']);
  if (st === 'run') return `<div class="ai-run" data-ai-run="${key}"><b><span class="spin"></span>正在展示示例分析…</b><ol>${steps.map(x => `<li>${esc(x.replace('读取已选演法：', '读取已选演法'))}</li>`).join('')}</ol></div>`;
  if (st !== 'done') return '';
  let body = ''; try { body = def[2](); } catch { body = '<p>示例暂时无法显示。</p>'; }
  return `<div class="ai-result"><div class="ai-head"><span class="ai-tag">示例 · 未调用 AI</span><b>${esc(def[1])}</b><button data-o="aiClose" data-k="${key}">收起</button></div><p class="ai-note">以下是虚构项目《逆光来信》的预置示例，用来展示接入 AI 之后的效果，不是根据你填写的内容生成的，也不会写进你的草稿。</p>${body}</div>`;
}
function runAIOwn(key) {
  aiState[key] = 'run'; render(true);
  const lis = [...document.querySelectorAll(`[data-ai-run="${key}"] li`)];
  lis.forEach((li, n) => later(() => { li.classList.add('in'); if (lis[n - 1]) lis[n - 1].classList.add('ok'); }, 150 + n * 420));
  later(() => { aiState[key] = 'done'; render(true); }, 300 + lis.length * 420);
}



/* ---------- 板块小画面：一只猫 + 一件和内容相符的小道具 ---------- */
const PROP = {
  script: 'M7 3h7l4 4v14H7z M14 3v4h4 M10 12h5 M10 16h5', columns: 'M4 5h5v14H4z M15 5h5v14h-5z M11 8h2 M11 12h2 M11 16h2',
  book: 'M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z M12 6v14', search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z M20 20l-4-4',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5', check: 'M4 12l5 5L20 6',
  people: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M2 20c0-3 3-5 6-5s6 2 6 5 M17 11a3 3 0 1 0 0-6 M16 15c3 0 6 2 6 5', trend: 'M3 17l6-6 4 4 8-8 M15 7h6v6',
  bubble: 'M4 5h16v11H9l-5 4z', star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', pen: 'M4 20l4-1 11-11-3-3L5 16z M14 6l3 3',
  idcard: 'M3 6h18v12H3z M7 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 10h6 M12 14h4', quote: 'M5 11h4v6H4v-4c0-3 1-5 3-6 M15 11h4v6h-5v-4c0-3 1-5 3-6',
  pulse: 'M3 12h4l2-5 4 10 2-5h6', mask: 'M4 5c5 2 11 2 16 0v6c0 5-4 8-8 8s-8-3-8-8z M8 10h2 M14 10h2 M9 14c2 1.5 4 1.5 6 0',
  music: 'M9 18V6l10-2v12 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M16 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', dumbbell: 'M6 7v10 M18 7v10 M3 10v4 M21 10v4 M6 12h12',
  shirt: 'M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-3 2-4 2s-3 0-4-2z', film: 'M4 5h16v14H4z M4 9h16 M4 15h16 M8 5v4 M12 5v4 M16 5v4 M8 15v4 M12 15v4 M16 15v4',
  walk: 'M13 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M10 21l2-6-3-3 1-4 4 2 3 1 M9 12l-3 2 M12 15l3 6', chat: 'M3 6h12v8H7l-4 3z M15 9h6v8l-3-2h-6v-1',
  clipboard: 'M8 4h8v3H8z M6 6H5v15h14V6h-1 M9 12h6 M9 16h4', list: 'M9 6h11 M9 12h11 M9 18h11 M4 6h1 M4 12h1 M4 18h1',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7 M12 17h.01', reply: 'M10 8L4 13l6 5 M4 13h10c4 0 6 2 6 6',
  bars: 'M5 20V10 M12 20V4 M19 20v-7', alert: 'M12 3l10 18H2z M12 10v5 M12 18h.01', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
  key: 'M8 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z M11 11h10 M18 11v3 M21 11v2', map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14',
  scale: 'M12 4v16 M6 20h12 M5 8h14 M5 8l-3 6h6z M19 8l-3 6h6z', hand: 'M8 12V5a1.5 1.5 0 0 1 3 0v6 M11 11V4a1.5 1.5 0 0 1 3 0v7 M14 11V6a1.5 1.5 0 0 1 3 0v8c0 4-3 7-7 7-3 0-5-2-6-4l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 14',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0z M8 6H4c0 3 2 5 4 5 M16 6h4c0 3-2 5-4 5 M12 13v4 M8 20h8', mirror: 'M12 3a6 8 0 1 0 0 16 6 8 0 0 0 0-16z M12 19v2 M9 21h6',
  arrow: 'M4 12h14 M13 6l6 6-6 6', reel: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M8 12.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M16 12.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M15 9l-2 5-4 1 2-5z', target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12h.01',
  contract: 'M6 3h12v18H6z M9 8h6 M9 12h6 M9 17c1-1 2 1 3 0s2 1 3 0', mail: 'M3 6h18v12H3z M3 7l9 6 9-6', fence: 'M5 21V7l2-3 2 3v14 M15 21V7l2-3 2 3v14 M5 10h14 M5 16h14',
  siren: 'M7 18v-6a5 5 0 0 1 10 0v6 M5 21h14 M12 3v2 M4 7l1.5 1 M20 7l-1.5 1', megaphone: 'M3 10v4h4l8 5V5L7 10z M18 9a4 4 0 0 1 0 6', archive: 'M3 5h18v4H3z M5 9v11h14V9 M10 13h4',
  heart: 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z', news: 'M4 5h13v14H6a2 2 0 0 1-2-2z M17 9h3v8a2 2 0 0 1-2 2 M7 9h7 M7 13h7 M7 16h4',
  train: 'M6 4h12v11H6z M6 11h12 M9 15l-3 5 M15 15l3 5 M9 8h.01 M15 8h.01', bag: 'M5 8h14l-1 12H6z M9 8V6a3 3 0 0 1 6 0v2', notebook: 'M6 3h12v18H6z M9 3v18 M12 8h4 M12 12h4'
};
const SEC_PROP = {
  'st0.compare': 'columns', 'st0.read': 'book', 'st0.vet': 'search', 'st0.schedule': 'calendar', 'st0.decide': 'check',
  'st1.rel': 'people', 'st1.growth': 'trend', 'st1.sub': 'bubble', 'st1.key': 'star', 'st1.bio': 'pen', 'st1.card': 'idcard', 'st1.line': 'quote',
  'st2.scene': 'pulse', 'st2.handling': 'mask', 'st2.dance': 'music', 'st2.train': 'dumbbell',
  'st3.look': 'shirt', 'st3.board': 'film', 'st3.move': 'walk', 'st3.comm': 'chat',
  'st4.call': 'clipboard', 'st4.tasks': 'list', 'st4.cal': 'calendar', 'st4.faq': 'help',
  'st5.plats': 'megaphone', 'st5.cmt': 'bubble', 'st5.reply': 'reply', 'st5.rep': 'bars', 'st5.sig': 'alert',
  'st6.brand': 'shield', 'st6.rights': 'key', 'st6.scope': 'map', 'st6.lawyer': 'scale', 'st6.decide': 'hand',
  'st7.look': 'trophy', 'st7.data': 'bars', 'st7.self': 'mirror', 'st7.next': 'arrow',
  'portfolio.works': 'reel', 'portfolio.direction': 'compass', 'portfolio.goals': 'target', 'deals.contracts': 'contract', 'deals.offers': 'mail',
  'fans.groups': 'people', 'fans.plan': 'calendar', 'fans.bounds': 'fence', 'crisis.event': 'siren', 'crisis.response': 'megaphone', 'crisis.evidence': 'archive',
  'charity.projects': 'heart', 'charity.post': 'pen', 'brief.items': 'news', 'trip.legs': 'train', 'trip.pack': 'bag', 'body.target': 'target', 'body.log': 'notebook'
};
const VIG_CATS = ['cat-lounge', 'cat-toys', 'cat-treats', 'cat-bowl', 'cat-guide', 'cat-mascot', 'cat-assistant'];
function vignette(k, s, n) {
  const seed = [...k].reduce((a, c) => a + c.charCodeAt(0), 0), cat = VIG_CATS[(seed + n * 3) % VIG_CATS.length], prop = PROP[SEC_PROP[k + '.' + s.id]] || PROP.star;
  return `<span class="vig" aria-hidden="true"><img src="${CAT_BASE}cats/${cat}.png" alt="" loading="lazy"><svg class="vig-prop" viewBox="0 0 24 24"><path d="${prop}"/></svg><em>${String(n + 1).padStart(2, '0')}</em></span>`;
}
const SPARK = '<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3l1.6 5.4L17 10l-5.4 1.6L10 17l-1.6-5.4L3 10l5.4-1.6z"/><path class="s2" d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>';
const aiDone = {};
function aiButton(o, attrs, label, key) {
  const busy = aiRun === key, done = aiDone[key] && Date.now() - aiDone[key] < 2400;
  return `<button class="ai-go ${busy ? 'busy' : ''} ${done ? 'done' : ''}" data-o="${o}" ${attrs} ${busy ? 'disabled' : ''}>${busy ? '<i class="ai-ring"></i><span>AI 整理中…</span>' : done ? '<span>✓ 已完成</span>' : SPARK + `<span>${label}</span>`}</button>`;
}
let aiRun = '';

/* ---------- AI 帮我添加 / AI 起草（演示阶段为预置内容，接入模型后只换内容来源） ---------- */
const J = a => a.join('\n');
const AIROWS = {
  'st0.scripts': () => D.scripts.map((x, i) => ({ title: x.t, role: x.role, weight: x.raw.shareTxt, team: x.raw.dirTxt, fit: ['高', '中', '低'][i] || '待评估', note: D.compareAdvice[i] || '' })),
  'st0.checks': () => [{ item: '出品方经营与诉讼', source: '企业信用公示系统', result: '已核验', note: '近三年无重大诉讼' }, { item: '导演与主创口碑', source: '近四部作品评分', result: '已核验', note: '陈导近 4 部均分 8.6' }, { item: '平台与排播', source: '平台招商会', result: '待核验', note: '一线平台 S 级，排播待定' }, { item: '题材与审查风险', source: '剧本通读', result: '已核验', note: '现实题材，风险低' }],
  'st1.people': () => D.people.slice(1).map(p => ({ name: p.name, relation: (p.edge || p.desc).split(/[，。（(]/)[0], change: '', knows: p.desc.slice(0, 40) })),
  'st1.beats': () => D.growth.map(g => ({ scene: '第' + g.sc + '场', event: g.note, state: g.label, level: String(Math.round(g.v / 10)) })),
  'st1.lines': () => D.subtext.map(x => ({ scene: '第12场', line: x.line, sub: x.sub, basis: '人物推断' })),
  'st1.scenes': () => D.keyScenes.map(k => ({ scene: '第' + k.sc + '场', why: k.why, prep: k.tip })),
  'st1.opts': () => D.lineOpt.options.map(o => ({ scene: '第12场', original: D.lineOpt.original, suggest: o.t, status: '待导演确认' })),
  'st2.beats': () => D.beats.map(b => ({ t: b.t, goal: b.goal, obstacle: b.obs, action: b.act })),
  'st2.segs': () => D.dance.segs.map(x => ({ name: x.n, count: String(x.beats), emotion: x.emo, move: x.move })),
  'st2.log': () => D.dance.log.map(l => ({ date: '', content: l.d + '：' + l.t, problem: l.q })),
  'st3.looks': () => D.looks.map(l => ({ scene: l.sc, look: l.k, color: '', mood: l.mood })),
  'st3.shots': () => D.shots.map(x => ({ no: String(x.no), size: x.size, dur: String(x.dur), cam: x.cam, act: x.act, line: x.line || '' })),
  'st4.tasks': () => D.tasks.map(x => ({ title: x.t, due: '', note: x.who + ' · ' + x.due })),
  'st4.posts': () => D.week.flatMap(w => w.ev.map(e => ({ date: '', content: w.d + ' · ' + e[1] }))).slice(0, 10).map((r, i) => ({ ...r, platform: PLATFORMS[i % 4] })),
  'st4.qa': () => D.faq.map(f => ({ q: f.q, a: f.a })),
  'st5.items': () => D.comments.slice(0, 8).map((c, i) => ({ platform: PLATFORMS[i % 4], content: c.t, type: { work: '剧情讨论', love: '表演夸奖', trip: '提问', advice: '负面', risk: '越界' }[c.c] || '提问', action: '' })),
  'st5.replies': () => Object.entries(D.replies).slice(0, 4).map(([k, v]) => ({ to: { work: '剧情讨论', love: '关心', trip: '行程询问', advice: '建议' }[k] || k, text: v.warm, status: '待本人确认' })),
  'st5.signals': () => D.signals.map(x => ({ signal: x.t + '：' + x.d, level: x.lv === 'bad' ? '高' : '中', handle: x.s })),
  'st6.checks': () => D.sources.map(x => ({ item: x.t, source: x.from, status: x.tag.includes('已核验') ? '已核验' : x.tag.includes('待') ? '待核验' : '传闻' })),
  'st6.dims': () => D.dims.map(d => ({ dim: d.n, allow: '待问清', term: '', note: d.q.join(' ') })),
  'st7.kpi': () => D.air.kpi.map(k => ({ name: k[0], value: k[1] + k[2], source: '平台后台', note: k[3] })),
  'st7.items': () => D.takeaway.map(t => ({ item: t })),
  'portfolio.works': () => D.portfolio.works.map(w => ({ title: w[1], year: String(w[0]), role: w[3], genre: w[2], platform: '', feedback: String(w[4]) })),
  'portfolio.goals': () => D.goals.map(g => ({ when: '今年', goal: g.g + '：' + g.s })),
  'deals.items': () => D.deals.contracts.map(c => ({ brand: c.n, type: ['影视', '代言'].includes(c.type) ? c.type : '其他', exclusive: '', until: /^\d{4}-\d{2}-\d{2}$/.test(c.end) ? c.end : '', status: '已签' })),
  'deals.offers': () => D.deals.offers.map(o => ({ brand: o.n, product: o.cat + ' · ' + o.role, risk: o.verdict[1], decision: o.verdict[0] === 'ok' ? '有条件接' : '婉拒' })),
  'fans.groups': () => D.fans.clubs.map(c => ({ name: c.n, platform: c.tag, contact: c.lead, note: c.last })),
  'fans.plan': () => D.fans.platforms.map(x => ({ date: '', platform: x.n === 'B站' ? '哔哩哔哩' : x.n, content: x.best })),
  'st5.plats': () => D.fans.platforms.map(x => ({ platform: x.n === 'B站' ? '哔哩哔哩' : x.n, account: '林知夏工作室', fans: x.fans, tone: x.tone, cadence: x.cadence })),
  'crisis.timeline': () => D.crisis.event.timeline.map(t => ({ time: t[0], event: t[1] + ' · ' + t[2] })),
  'charity.items': () => D.charity.projects.map(x => ({ name: x.n, org: x.org, verify: '待核验', disclose: '每季度', owner: '' })),
  'brief.items': () => D.brief2.items.map(x => ({ title: x.t, field: x.f, source: x.src, status: x.tag.includes('已核验') ? '已核验' : x.tag.includes('待') ? '待核验' : '传闻', action: x.act || '' })),
  'trip.legs': () => D.trip.legs.map(l => ({ date: '', from: l.from, to: l.to, mode: Object.keys(l.opts)[0] || '高铁', time: l.leave, note: '' }))
};
const AITEXT = {
  'st0.summary': () => D.take.summary, 'st0.appeal': () => D.take.fit[0].v + '；' + D.take.fit[1].v, 'st0.worry': () => D.take.fit[2].v + '；' + D.take.fit[3].v, 'st0.scenes': () => D.take.scenes.key, 'st0.arc': () => '完整',
  'st1.bio': () => D.bio.join('\n\n'), 'st1.oneLine': () => D.roleCard.oneLine, 'st1.background': () => J(D.roleCard.timeline.map(t => t[0] + '：' + t[1])), 'st1.personality': () => J(D.roleCard.core.map(c => c[0] + '：' + c[1])), 'st1.surface': () => J(D.roleCard.surface.map(c => c[0] + '：' + c[1])),
  'st2.scene': () => '第12场 · 窗边的来信', 'st2.why': () => (D.handlings.find(h => h.id === 'probe') || D.handlings[0]).fit, 'st2.theme': () => D.dance.theme, 'st2.music': () => D.dance.music,
  'st4.minutes': () => D.minutes, 'st4.focus': () => J(D.callsheet.prep),
  'st5.topics': () => J(D.report.topics.map(t => t[0] + ' ' + t[1] + '%')), 'st5.sentiment': () => `正面 ${D.report.mood.pos}% · 中性 ${D.report.mood.neu}% · 负面 ${D.report.mood.neg}%`, 'st5.actions': () => J(D.report.actions),
  'st6.brand': () => D.offer.brand, 'st6.product': () => D.offer.type,
  'st7.good': () => J(D.wins), 'st7.improve': () => J(D.improve),
  'portfolio.prefer': () => J(D.portfolio.best), 'portfolio.avoid': () => J(D.portfolio.careful), 'portfolio.want': () => J(D.portfolio.road.map(r => r[0] + '：' + r[1])),
  'crisis.what': () => D.crisis.event.t, 'crisis.origin': () => D.crisis.event.first, 'crisis.verified': () => J(D.crisis.event.judge.map(j => j[0] + '：' + j[1])), 'crisis.statement': () => D.crisis.event.draft, 'crisis.plan': () => D.crisis.event.options[1][0] + '：' + D.crisis.event.options[1][1],
  'charity.text': () => D.charity.fanPost, 'brief.keywords': () => 'AI 内容标识、现实题材、舞台作品',
  'body.goal': () => D.body.plan[0][1][0], 'body.plan': () => J(D.body.plan.flatMap(([t, items]) => items.map(x => t + '：' + x)))
};
const aiRowsFor = (k, lk) => AIROWS[k + '.' + lk];
const aiTextFields = (k, s) => s.vals.filter(f => AITEXT[k + '.' + f.k]);
let aiBusy = false;
function aiFillList(base) {
  if (aiBusy) return; const [k, lk] = base.split('|'), gen = aiRowsFor(k, lk); if (!gen) return;
  const { l } = listDef(k, lk), rows = pg(k).lists[lk] = pg(k).lists[lk] || [], keys = new Set(l.cols.map(c => c.k));
  let add; try { add = gen().map(r => Object.fromEntries(Object.entries(r).filter(([key, v]) => keys.has(key) && v !== '' && v != null).map(([key, v]) => [key, String(v).slice(0, 4000)]))); } catch { add = []; }
  // Rows already started with the same first column (e.g. the four seeded platforms) are completed in place rather than duplicated.
  const first = l.cols[0].k, fillIn = [];
  add = add.filter(r => { const at = rows.findIndex(x => x[first] && x[first] === r[first] && !fillIn.some(f => f.i === rows.indexOf(x))); if (at < 0) return true; fillIn.push({ i: at, r }); return false; });
  const room = 60 - rows.length; add = add.slice(0, room); if (!add.length && !fillIn.length) { toast('这张表已经满了'); return; }
  aiBusy = true; aiRun = base; render(true);
  const host = document.querySelector(`[data-ai-list="${base}"]`);
  if (host) host.insertAdjacentHTML('afterbegin', '<div class="ai-thinking"><span></span><b>AI 正在整理…</b><i>读取资料夹与相关剧本</i></div>');
  later(() => {
    fillIn.forEach(({ i, r }) => { rows[i] = { ...rows[i], ...Object.fromEntries(Object.entries(r).filter(([key]) => !(rows[i][key] || '').trim())), _ai: '1' }; });
    if (!add.length) { aiBusy = false; aiRun = ''; aiDone[base] = Date.now(); touch(); flush(); render(true); document.querySelectorAll(`[data-ai-list="${base}"] .o-row`).forEach(el => el.classList.add('ai-in')); later(() => render(true), 2500); toast(`AI 已补全 ${fillIn.length} 条，可以直接修改（演示阶段为预置示例）`); return; }
    if (fillIn.length) { touch(); render(true); }
    add.forEach((r, n) => later(() => {
      rows.push({ ...r, _ai: '1' }); touch(); render(true);
      const els = document.querySelectorAll(`[data-ai-list="${base}"] .o-row`), el = els[els.length - 1]; if (el) el.classList.add('ai-in');
      if (n === add.length - 1) { aiBusy = false; aiRun = ''; aiDone[base] = Date.now(); flush(); render(true); later(() => render(true), 2500); toast(`AI 已${fillIn.length ? '补全 ' + fillIn.length + ' 条、' : ''}添加 ${add.length} 条，可以直接修改（演示阶段为预置示例）`); }
    }, n * 260));
  }, 900);
}
function aiDraft(k, sid) {
  if (aiBusy) return; const s = mySecs(k).find(x => x.id === sid); if (!s) return;
  const p = pg(k), todo = aiTextFields(k, s).filter(f => !(p.values[f.k] || '').trim());
  if (!todo.length) { toast('这一栏已经填好了'); return; }
  aiBusy = true; aiRun = k + '.' + sid; render(true); let i = 0;
  const next = () => {
    if (i >= todo.length) { aiBusy = false; aiRun = ''; aiDone[k + '.' + sid] = Date.now(); touch(); flush(); render(true); later(() => render(true), 2500); toast('AI 已起草，可以直接修改（演示阶段为预置示例）'); return; }
    const f = todo[i++], text = String(AITEXT[k + '.' + f.k]()).slice(0, 12000), el = document.querySelector(`[data-f="${k}|v|${f.k}"]`);
    if (!el || f.t === 'select') { p.values[f.k] = text; if (el) el.value = text; later(next, 120); return; }
    el.classList.add('ai-typing'); let n = 0; const step = Math.max(1, Math.ceil(text.length / 60));
    const tick = () => { n = Math.min(text.length, n + step); el.value = text.slice(0, n); if (n < text.length) later(tick, 28); else { el.classList.remove('ai-typing'); p.values[f.k] = text; later(next, 160); } };
    tick();
  };
  next();
}

/* ---------- 颜色与关系网 ---------- */
const HUE = { home: '#3a3833', st0: '#a3715c', st1: '#57778a', st2: '#7d6c8e', st3: '#5f8270', st4: '#9c8550', st5: '#a06a74', st6: '#636f96', st7: '#7a8058', portfolio: '#557f80', deals: '#627093', fans: '#a2717f', crisis: '#9a5f59', charity: '#9b8a57', brief: '#677c62', trip: '#5f8196', body: '#a67a66' };
const ROLE_HUE = { actor: '#a3715c', assistant: '#57778a', team: '#5f8270' };
const hue = k => HUE[k] || '#22211e';
function netSVG(center, nodes, centerColor) {
  if (!nodes.length) return '';
  const cfg = { center: String(center), centerColor, nodes: nodes.slice(0, 10).map(n => ({ label: String(n.label).slice(0, 8), edge: String(n.edge || '').slice(0, 12), color: n.color, dash: !!n.dash })) };
  return `<div class="net" data-net="${esc(JSON.stringify(cfg))}"><canvas aria-hidden="true"></canvas><ul class="net-text">${cfg.nodes.map(n => `<li>${esc(cfg.center)} — ${esc(n.label)}${n.edge ? '：' + esc(n.edge) : ''}</li>`).join('')}</ul></div>`;
}
// Plexus ring: a broken, triangulated torus shell turning around a hot core, with embers, flashing vertices,
// sparks running along links, drifting bokeh and faint orbit rings. The real relations sit lightly on top.
function mountNets() {
  document.querySelectorAll('.net[data-net]:not([data-on])').forEach(el => {
    el.dataset.on = '1';
    let cfg; try { cfg = JSON.parse(el.dataset.net); } catch { return; }
    const cv = el.querySelector('canvas'), g = cv && cv.getContext('2d'); if (!g) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // Torus shell with gaps and jitter, so the ring reads as hand-made rather than geometric.
    const P = [];
    while (P.length < 640) {
      const u = rnd() * Math.PI * 2, v = rnd() * Math.PI * 2;
      if (Math.sin(u * 2 + 1.3) > .86 && rnd() < .7) continue;
      const tube = .3 + .1 * Math.sin(u * 5) + (rnd() - .5) * .12, R0 = 1 + .06 * Math.sin(u * 3) + (rnd() - .5) * .1;
      P.push([(R0 + tube * Math.cos(v)) * Math.cos(u), tube * Math.sin(v) * 1.15 + (rnd() - .5) * .08, (R0 + tube * Math.cos(v)) * Math.sin(u)]);
    }
    const E = [], seen = new Set();
    P.forEach((a, i) => {
      const near = P.map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2]).filter(x => x[0] !== i).sort((x, y) => x[1] - y[1]).slice(0, 6);
      near.forEach(([j, d]) => { const k = i < j ? i + ',' + j : j + ',' + i; if (d < .07 && !seen.has(k)) { seen.add(k); E.push([i, j]); } });
    });
    const flash = new Float32Array(P.length), sparks = [], embers = [], bokeh = Array.from({ length: 7 }, () => ({ x: rnd(), y: rnd(), r: 18 + rnd() * 46, a: .05 + rnd() * .08, s: (rnd() - .5) * .00004 }));
    const links = cfg.nodes.map((_, i) => ({ t: i / Math.max(1, cfg.nodes.length) }));
    let W = 0, H = 0, rot = 0.6, last = performance.now(), visible = true;
    const size = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); W = el.clientWidth || 600; H = Math.round(Math.max(320, Math.min(440, W * .5))); cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); try { new ResizeObserver(size).observe(el); } catch {}
    try { new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(el); } catch {}
    const chip = (x, y, w, h, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
    const font = (w, px) => `${w} ${px}px -apple-system,"PingFang SC","Hiragino Sans GB",sans-serif`;
    function draw(time) {
      const cx = W / 2, cy = H / 2, R = Math.min(W * .24, H * .36);
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#e9e7e2'); bg.addColorStop(1, '#c7c4bd'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      bokeh.forEach(b => { const x = b.x * W, y = b.y * H, gr = g.createRadialGradient(x, y, 0, x, y, b.r); gr.addColorStop(0, `rgba(255,255,255,${b.a * 2.2})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, b.r, 0, Math.PI * 2); g.fill(); });
      g.strokeStyle = 'rgba(40,38,34,.13)'; g.lineWidth = 1;
      [1.55, 1.95].forEach(k => { g.beginPath(); g.arc(cx, cy, R * k, 0, Math.PI * 2); g.stroke(); });
      g.strokeStyle = 'rgba(40,38,34,.07)'; g.beginPath(); g.ellipse(cx, cy, R * 2.35, R * .55, -.18, 0, Math.PI * 2); g.stroke();
      // core
      const flick = .82 + .18 * Math.sin(time / 230) * Math.sin(time / 610);
      g.save();
      let gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * .78); gr.addColorStop(0, `rgba(255,214,140,${.75 * flick})`); gr.addColorStop(.3, `rgba(226,146,62,${.42 * flick})`); gr.addColorStop(1, 'rgba(190,110,40,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * .78, 0, Math.PI * 2); g.fill();
      gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * .2); gr.addColorStop(0, `rgba(255,252,236,${flick})`); gr.addColorStop(.5, `rgba(255,224,160,${.8 * flick})`); gr.addColorStop(1, 'rgba(240,180,100,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * .2, 0, Math.PI * 2); g.fill();
      if (!still) while (embers.length < 46) embers.push({ x: (rnd() - .5) * R * .7, y: (rnd() - .3) * R * .5, vx: (rnd() - .5) * .012, vy: -.01 - rnd() * .02, life: 1, s: .6 + rnd() * 1.6 });
      embers.forEach(e => { g.fillStyle = `rgba(${236 + 19 * e.life | 0},${140 + 70 * e.life | 0},60,${e.life})`; g.beginPath(); g.arc(cx + e.x, cy + e.y, e.s, 0, Math.PI * 2); g.fill(); });
      g.restore();
      // ring
      const ca = Math.cos(rot), sa = Math.sin(rot), tilt = 1.18 + .08 * Math.sin(time / 4000), ct = Math.cos(tilt), st = Math.sin(tilt);
      const Q = P.map(([x, y, z]) => { const x1 = x * ca - z * sa, z1 = x * sa + z * ca, y2 = y * ct - z1 * st, z2 = y * st + z1 * ct, s = 2.6 / (3.2 - z2); return [cx + x1 * R * s, cy + y2 * R * s, z2]; });
      E.forEach(([a, b]) => { const z = (Q[a][2] + Q[b][2]) / 2, k = (z + 1.4) / 2.8; g.strokeStyle = `rgba(28,26,23,${.08 + .55 * k * k})`; g.lineWidth = .3 + .75 * k; g.beginPath(); g.moveTo(Q[a][0], Q[a][1]); g.lineTo(Q[b][0], Q[b][1]); g.stroke(); });
      Q.forEach(([x, y, z], i) => { const k = (z + 1.4) / 2.8; g.fillStyle = `rgba(30,28,25,${.2 + .6 * k})`; g.beginPath(); g.arc(x, y, .5 + 1.2 * k, 0, Math.PI * 2); g.fill(); });
      g.save();
      Q.forEach(([x, y], i) => { if (flash[i] > .02) { const f = flash[i], r = 3 + 9 * f, gl = g.createRadialGradient(x, y, 0, x, y, r); gl.addColorStop(0, `rgba(255,248,226,${f})`); gl.addColorStop(.35, `rgba(240,164,72,${f * .8})`); gl.addColorStop(1, 'rgba(236,176,96,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } });
      sparks.forEach(p => { const [a, b] = E[p.e], x = Q[a][0] + (Q[b][0] - Q[a][0]) * p.t, y = Q[a][1] + (Q[b][1] - Q[a][1]) * p.t, gl = g.createRadialGradient(x, y, 0, x, y, 6); gl.addColorStop(0, 'rgba(255,246,220,1)'); gl.addColorStop(.4, 'rgba(238,160,70,.85)'); gl.addColorStop(1, 'rgba(236,150,60,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); });
      g.restore();
      // relations, kept light so the ring stays the subject
      const n = cfg.nodes.length, rx = Math.min(W / 2 - 72, R * 2.05), ry = Math.min(H / 2 - 24, R * 1.25);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      cfg.nodes.forEach((d, i) => {
        const ang = -Math.PI / 2 + (i + .5) * 2 * Math.PI / n + rot * .18, x = cx + rx * Math.cos(ang), y = cy + ry * Math.sin(ang);
        g.strokeStyle = 'rgba(40,38,34,.28)'; g.lineWidth = 1; g.setLineDash(d.dash ? [4, 4] : [2, 3]); g.beginPath(); g.moveTo(cx + (x - cx) * .32, cy + (y - cy) * .32); g.lineTo(x, y); g.stroke(); g.setLineDash([]);
        if (!still) { const l = links[i], k = .32 + .68 * l.t, px = cx + (x - cx) * k, py = cy + (y - cy) * k; g.save(); const gl = g.createRadialGradient(px, py, 0, px, py, 7); gl.addColorStop(0, 'rgba(255,240,206,1)'); gl.addColorStop(.4, 'rgba(236,158,68,.8)'); gl.addColorStop(1, 'rgba(236,170,90,0)'); g.fillStyle = gl; g.beginPath(); g.arc(px, py, 7, 0, Math.PI * 2); g.fill(); g.restore(); }
        g.font = font(600, 13); const w = g.measureText(d.label).width + 30;
        g.fillStyle = 'rgba(255,254,251,.88)'; chip(x - w / 2, y - 15, w, 30, 15); g.fill(); g.strokeStyle = 'rgba(40,38,34,.18)'; g.stroke();
        g.fillStyle = d.color; g.beginPath(); g.arc(x - w / 2 + 12, y, 4, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2a2925'; g.fillText(d.label, x + 5, y + .5);
        if (d.edge) { g.font = font(400, 11.5); g.fillStyle = 'rgba(42,41,37,.72)'; g.fillText(d.edge, x, y + 25); }
      });
      g.font = font(700, 13); g.fillStyle = 'rgba(42,30,18,.85)'; g.fillText(cfg.center.slice(0, 6), cx, cy + R * .42);
    }
    function step(dt) {
      rot += dt * .00009;
      for (let i = 0; i < flash.length; i++) flash[i] *= .94;
      if (Math.random() < .35) flash[(Math.random() * flash.length) | 0] = .6 + Math.random() * .4;
      while (sparks.length < 18 && E.length) sparks.push({ e: (Math.random() * E.length) | 0, t: 0, v: .006 + Math.random() * .01 });
      sparks.forEach(p => { p.t += p.v * dt / 16; }); for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].t >= 1) { flash[E[sparks[i].e][1]] = 1; sparks.splice(i, 1); }
      embers.forEach(e => { e.x += e.vx * dt; e.y += e.vy * dt; e.life -= dt * .0009; }); for (let i = embers.length - 1; i >= 0; i--) if (embers[i].life <= 0) embers.splice(i, 1);
      bokeh.forEach(b => { b.x = (b.x + b.s * dt + 1) % 1; });
      links.forEach(l => { l.t = (l.t + dt * .00032) % 1; });
    }
    function frame(now) {
      if (!el.isConnected) return;
      const dt = Math.min(50, now - last); last = now;
      if (visible) { step(dt); draw(now); }
      requestAnimationFrame(frame);
    }
    draw(performance.now());
    if (!still) requestAnimationFrame(frame);
  });
}

/* ---------- 页面 ---------- */
function oHome() {
  const me = ctx.me || {}, days = records('callDay').sort((a, b) => a.payload.date.localeCompare(b.payload.date)), upcoming = days.filter(r => r.payload.date >= todayStr()).slice(0, 4);
  const sched = records('schedule').sort((a, b) => (a.payload.startDate || '').localeCompare(b.payload.startDate || ''));
  const mine = records('task').filter(r => r.payload.assigneeId === me.userId && r.payload.status !== '已完成').sort((a, b) => (a.payload.dueDate || '9').localeCompare(b.payload.dueDate || '9'));
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false }).slice(0, 16), rem = records('reminder').filter(r => !r.payload.done).sort((a, b) => a.payload.fireAt.localeCompare(b.payload.fireAt)).slice(0, 4);
  const pending = role() === 'actor' ? sched.filter(r => !r.payload.decision || r.payload.decision === '待决定') : [];
  const prog = ['st0', 'st1', 'st2', 'st3', 'st4', 'st5', 'st6', 'st7'].concat(CAREER, LIFE).filter(canPage);
  const add = (kind, label) => `<button class="mod-act" data-o="create" data-kind="${kind}">${label}</button>`;
  const mod = (title, count, act, body) => `<section class="mod"><header><h3>${title}</h3>${count !== '' ? `<span class="mod-count">${count}</span>` : ''}${act}</header>${body}</section>`;
  const rows = (list, render, empty) => list.length ? `<ul class="mod-list">${list.map(render).join('')}</ul>` : `<p class="mod-empty">${empty}</p>`;
  return `<section class="own-head compact"><div><p class="own-eyebrow">${esc(todayStr())} · ${esc(ROLE[role()])}</p><h1>${esc(me.name || '')}，${{ actor: '把注意力留给角色', assistant: '把每一场安排妥当', team: '让每一步都有人接住' }[role()]}</h1></div><div class="head-links"><button data-o="nav" data-tab="messages">留言</button>${role() !== 'team' ? '<button data-o="nav" data-tab="lines">台词练习</button>' : ''}<button data-o="nav" data-tab="resources">资料卡</button></div><img class="own-cat" src="${catImg()}" alt=""></section>
  ${pending.length ? `<div class="alert-row"><b>等你做接戏决定</b>${pending.map(r => `<button data-o="open" data-id="${esc(r.id)}">《${esc(r.payload.name)}》</button>`).join('')}</div>` : ''}
  ${mod('协作关系网', '', '', netSVG((ctx.members.find(m => m.role === 'actor') || me).name || '明星', ctx.members.filter(m => m.role !== 'actor').map(m => ({ label: m.name, edge: `${ROLE[m.role]} · ${records('task').filter(t => t.payload.assigneeId === m.userId && t.payload.status !== '已完成').length} 项任务`, color: ROLE_HUE[m.role] })).concat(sched.slice(0, 4).map(r => ({ label: r.payload.name, edge: r.payload.decision || '待决定', color: r.payload.decision === '接下' ? '#5f8270' : r.payload.decision === '不接' ? '#9a9993' : '#9c8550', dash: !r.payload.decision || r.payload.decision === '待决定' }))), ROLE_HUE.actor) + '<p class="net-legend"><i style="background:#57778a"></i>助理<i style="background:#5f8270"></i>团队 / 已接下<i style="background:#9c8550"></i>待决定（虚线）</p>')}
  <div class="mod-grid three">
    ${mod('近期通告', upcoming.length, role() === 'assistant' ? add('callDay', '＋ 新建') : '', rows(upcoming, d => `<li data-o="open" data-id="${esc(d.id)}"><b>${d.payload.date === todayStr() ? '今天' : esc(d.payload.date.slice(5))}</b><span>${esc(d.payload.projectCode)}<small>${d.payload.location ? esc(d.payload.location) + ' · ' : ''}化妆 ${esc(d.payload.makeupTime || '—')} · ${(d.payload.scenes || []).length} 场</small></span></li>`, '还没有近期通告'))}
    ${mod('我的任务', mine.length, add('task', '＋ 新建'), rows(mine.slice(0, 5), t => `<li data-o="open" data-id="${esc(t.id)}"><b class="${t.payload.dueDate && t.payload.dueDate < todayStr() ? 'late' : ''}">${esc((t.payload.dueDate || '—').slice(5) || '—')}</b><span>${esc(t.payload.title)}<small>${esc(t.payload.status)}${t.payload.priority === '重要' ? ' · 重要' : ''}</small></span></li>`, '没有分配给你的未完成任务'))}
    ${mod('提醒', rem.length, role() !== 'team' ? add('reminder', '＋ 新建') : '', rows(rem, r => `<li data-o="open" data-id="${esc(r.id)}"><b class="${r.payload.fireAt <= now ? 'late' : ''}">${esc(r.payload.fireAt.slice(5))}</b><span>${esc(r.payload.title)}<small>${r.payload.fireAt <= now ? '已到时间' : esc(r.payload.kind || '')}</small></span></li>`, '没有待处理的提醒'))}
  </div>
  ${mod('档期', sched.length, role() === 'assistant' ? add('schedule', '＋ 新建档期') : '', sched.length ? `<table class="mod-table"><thead><tr><th>项目</th><th>时间</th><th>状态</th><th>明星决定</th></tr></thead><tbody>${sched.map(r => `<tr data-o="open" data-id="${esc(r.id)}"><td><b>${esc(r.payload.name)}</b></td><td>${esc(r.payload.startDate)} — ${esc(r.payload.endDate)}</td><td>${esc(r.payload.status)}</td><td>${esc(r.payload.decision || '待决定')}</td></tr>`).join('')}</tbody></table>` : '<p class="mod-empty">还没有你能看到的档期</p>')}
  ${mod(`我的准备${project() ? ' ·《' + esc(project().payload.name) + '》' : ''}`, '', '', `<div class="prep-grid">${prog.map(k => { const [n, t] = pageCount(k), c = peek(k).complete; return `<button style="--acc:${hue(k)}" class="prep ${c ? 'done' : ''}" data-o="page" data-p="${k}"><b>${esc(pageTitle(k))}</b><i><em style="width:${t ? n / t * 100 : 0}%"></em></i><small>${c ? '✓ 已完成' : `${n} / ${t}`}</small></button>`; }).join('')}</div>`)}`;
}
function reviewOwn(k) {
  const rows = peek(k).lists.reviews || [], me = ctx.me || {};
  return `<section class="card review" id="o-review"><div class="result-head"><div><h3>人工复核 · 最终决定</h3></div>${rows.length ? tag('ok', `已有 ${rows.length} 条`) : tag('warn', '还没有决定')}</div>
    <div class="opt" style="margin-top:0">${[['采纳'], ['修改后采纳'], ['暂不采纳'], ['待讨论']].map(([v]) => `<button data-o="rvst" data-v="${v}" class="${ownStatus === v ? 'on' : ''}">${v}</button>`).join('')}</div>
    <div class="rv-grid mt8"><div class="field" style="margin-top:0"><label>决定人</label><select id="oRvWho">${ctx.members.map(m => `<option value="${esc(m.name)}（${ROLE[m.role]}）" ${m.userId === me.userId ? 'selected' : ''}>${esc(m.name)}（${ROLE[m.role]}）</option>`).join('')}<option>导演 / 制片</option><option>律师</option></select></div>
    <div class="field" style="margin-top:0"><label>决定 / 批注</label><textarea id="oRvText" placeholder="${esc(REVIEW_HINT[k] || '写下最终怎么做、谁负责、什么时候完成')}"></textarea></div></div>
    <div class="row mt8" style="justify-content:flex-end"><button class="btn pri" data-o="rvsave" data-p="${k}">保存决定</button></div>
    ${rows.length ? `<ul class="rv-list mt">${rows.slice().reverse().map((r, j) => `<li><div class="row" style="justify-content:space-between"><span class="row">${tag(r.status === '采纳' ? 'ok' : r.status === '暂不采纳' ? 'bad' : 'warn', esc(r.status))}<b>${esc(r.who)}</b><span class="small muted">${esc(r.at)}</span></span><button class="btn sm ghost" data-o="rvdel" data-p="${k}" data-i="${rows.length - 1 - j}">删除</button></div><p>${esc(r.text)}</p></li>`).join('')}</ul>` : ''}
  </section>`;
}
function oPage(k) {
  if (!canPage(k) || k === 'home') { here = k = firstPage(); }
  const o = OWN[k], st = k[0] === 's' && k[1] === 't', i = st ? +k[2] : -1, ss = mySecs(k), p = peek(k), proj = project();
  const s0 = st ? D.stations[i] : null, img = st ? OWN_IMG[i] : o.img;
  const head = `<section class="own-head" style="--acc:${hue(k)}"><div><p class="own-eyebrow">${st ? `Station ${s0.no} — ${sentence(s0.en)}` : groupOf(k) === 'career' ? 'Career' : 'Life'}</p><h1>${st ? esc(s0.title) : esc(o.name)}</h1><p class="own-desc">${esc(o.desc)}</p><div class="own-tags"><span>${esc(ROLE[role()])}负责 ${ss.length} 项</span><span>${proj ? '《' + esc(proj.payload.name) + '》' : '通用 · 未关联项目'}</span>${p.complete ? '<span class="ok">✓ 已完成</span>' : ''}</div></div>${itemImg(k, 'own-cat')}</section>`;
  const toc = `<nav class="toc" style="--acc:${hue(k)}"><h4>本页 ${ss.length} 项</h4>${ss.map((s, n) => `<button class="${filled(k, s) ? 'ok' : ''}" data-o="jump" data-s="${s.id}"><i>${filled(k, s) ? '✓' : String(n + 1).padStart(2, '0')}</i>${esc(s.t)}</button>`).join('')}</nav>`;
  const body = ss.map((s, n) => `<section class="card o-sec" style="--acc:${hue(k)}" id="sec-${s.id}"><div class="o-sec-head">${vignette(k, s, n)}<div><h3>${esc(s.t)}<i class="tip" title="${esc(s.d)}" aria-label="${esc(s.d)}">?</i></h3></div>${filled(k, s) ? '<span class="o-no">✓ 已填写</span>' : ''}${aiTextFields(k, s).length ? aiButton('aiDraft', `data-p="${k}" data-s="${s.id}"`, 'AI 起草', k + '.' + s.id) : ''}${AIX[k + '.' + s.id] ? `<button class="ai-btn ${aiState[k + '.' + s.id] ? 'on' : ''}" data-o="ai" data-k="${k}.${s.id}">${SPARK}<span>AI 分析</span></button>` : ''}</div>
    ${aiBlockOwn(k + '.' + s.id)}${extraBlock(k, s)}
    ${s.vals.length ? `<div class="o-fields">${s.vals.map(f => `<label class="field ${['area', 'long'].includes(f.t) ? 'wide' : ''}"><span>${esc(f.l)}</span>${control(f, p.values[f.k] || '', `${k}|v|${f.k}`)}</label>`).join('')}</div>` : ''}
    ${s.lists.map(l => listBlock(k, s, l)).join('')}
  </section>`).join('');
  const share = `<section class="side-box"><h4>共享与导出</h4><button class="btn pri" data-o="toResource" data-p="${k}">存为资料卡</button>${st ? `<button class="btn" data-o="toNote" data-p="${k}">存为准备笔记</button>` : ''}<button class="btn" data-o="exportPage" data-p="${k}">导出本页</button><button class="btn ${p.complete ? '' : 'ghost-dark'}" data-o="complete" data-p="${k}">${p.complete ? '取消完成标记' : '✓ 标记本页完成'}</button><button class="own-link" data-o="example" data-p="${k}">看参考示例怎么做 →</button></section>`;
  const nav = st ? `<div class="next"><div class="carry">${i < 7 && canPage('st' + (i + 1)) ? `下一站：${esc(D.stations[i + 1].name)} · ${esc(D.stations[i + 1].title)}` : '一部戏的准备会随项目一直保存在这里。'}</div><div class="row">${i > 0 && canPage('st' + (i - 1)) ? `<button class="btn" data-o="page" data-p="st${i - 1}">← ${esc(D.stations[i - 1].name)}</button>` : ''}${i < 7 && canPage('st' + (i + 1)) ? `<button class="btn pri" data-o="page" data-p="st${i + 1}">${esc(D.stations[i + 1].name)} →</button>` : ''}</div></div>` : '';
  return toolsHtml() + head + `<div class="page-cols"><div class="page-main">${body}${reviewOwn(k)}${nav}</div><aside class="page-side">${toc}${share}</aside></div>`;
}
function oLoading() { return loadError ? `<section class="card"><h3>工作台暂时没能打开</h3><p class="sub mt8">${esc(loadError)}</p><div class="row mt8"><button class="btn pri" data-o="reload">重新连接</button><button class="btn" data-o="demo">先看参考示例</button></div></section>` : '<section class="card"><h3>正在打开你的工作区…</h3><p class="sub mt8">正在读取工作台里的资料和你的草稿。</p></section>'; }

/* ---------- 导出 ---------- */
function pageMd(k) {
  const p = peek(k), L = [`## ${pageTitle(k)}${p.complete ? '（已完成）' : ''}`];
  mySecs(k).forEach(s => {
    if (!filled(k, s)) return; L.push('', `### ${s.t}`);
    s.vals.forEach(f => { const v = (p.values[f.k] || '').trim(); if (v) L.push(`**${f.l}**：${v.includes('\n') ? '\n' + v : v}`); });
    s.lists.forEach(l => (p.lists[l.k] || []).forEach(r => L.push('- ' + l.cols.map(c => r[c.k] ? `${c.l}：${c.t === 'member' ? memberName(r[c.k]) || r[c.k] : r[c.k]}` : '').filter(Boolean).join('｜'))));
  });
  const rv = p.lists.reviews || []; if (rv.length) L.push('', '### 人工复核 · 最终决定', ...rv.map(r => `- ${r.at} ${r.who}（${r.status}）：${r.text.replace(/\n/g, ' ')}`));
  return L.join('\n');
}
function mdHead() { const pj = project(); return [`# ${pj ? '《' + pj.payload.name + '》' : '通用工作区'}资料包`, '', `${(ctx.me || {}).name || ''}（${ROLE[role()]}）· 工作台 · 导出于 ${new Date().toLocaleString('zh-CN')}`, '', '> 内容为本人录入的草稿，没有经过 AI 生成；共享前请自行确认范围。', '']; }
const fileName = s => s.replace(/[\\/:*?"<>|]/g, '_');

/* ---------- 共享到通告本 ---------- */
function rowAt(base, i) { const [k, lk] = base.split('|'); return { k, lk, rows: pg(k).lists[lk] = pg(k).lists[lk] || [], row: (pg(k).lists[lk] || [])[i] }; }
function listDef(k, lk) { for (const s of OWN[k].secs) for (const l of s.lists) if (l.k === lk) return { s, l }; return {}; }
function shareTask(base, i) {
  const { k, lk, row } = rowAt(base, i), { s, l } = listDef(k, lk); if (!row) return;
  const title = (row[l.cols[0].k] || '').trim(); if (!title) { toast('先填写第一列，再发成任务'); return; }
  const owner = l.cols.find(c => c.t === 'member'), due = l.cols.find(c => c.t === 'date');
  const note = l.cols.slice(1).filter(c => c.t !== 'member' && c.t !== 'date' && row[c.k]).map(c => `${c.l}：${row[c.k]}`).concat(`来自工作台 · ${pageTitle(k)} · ${s.t}`).join('\n');
  const payload = { title: title.slice(0, 160), note: note.slice(0, 8000), projectId: ctx.projectId || null };
  if (owner && row[owner.k]) payload.assigneeId = row[owner.k];
  if (due && dateOk(row[due.k])) payload.dueDate = row[due.k];
  bridge({ type: 'create', kind: 'task', payload }); toast('已在工作台打开任务，确认后发布');
}
function shareLine(base, i) {
  const { row } = rowAt(base, i); if (!row) return;
  const text = (row.suggest || row.original || '').trim(); if (!text) { toast('先填写原句或建议稿'); return; }
  bridge({ type: 'create', kind: 'line', payload: { sceneNumber: (row.scene || '').slice(0, 100), text: text.slice(0, 12000), emotionNote: row.suggest && row.original ? `原句：${row.original}`.slice(0, 4000) : '' } }); toast('已在工作台打开台词，确认后保存');
}
function shareDoc(k, kind) {
  const md = pageMd(k); if (!mySecs(k).some(s => filled(k, s))) { toast('这一页还没有内容'); return; }
  const pj = project(), title = `${pageTitle(k)}${pj ? ' ·《' + pj.payload.name + '》' : ''}`.slice(0, 160);
  const payload = kind === 'note' ? { title, content: md.slice(0, 16000), stage: +k[2], projectId: ctx.projectId || null, complete: !!peek(k).complete } : { title, content: md.slice(0, 16000), category: k[0] === 's' && k[1] === 't' ? '项目资料' : pageTitle(k), projectId: ctx.projectId || null };
  bridge({ type: 'create', kind, payload }); toast(md.length > 16000 ? '内容较长，只带入前 16000 字；完整版请导出' : '已在工作台打开，选择共享范围后保存');
}

/* ---------- 事件 ---------- */
function goOwn(k) { if (!canPage(k)) return; aiBusy = false; aiRun = ''; here = k; render(); $('#main').scrollTop = 0; $('#app').classList.remove('folder-open'); }
function parseRows(text, l) {
  return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(line => { const parts = line.split(/\t|｜|\|/).map(x => x.trim()), r = {}; l.cols.forEach((c, n) => { if (!parts[n]) return; if (c.t === 'member') { const m = ctx.members.find(x => x.name === parts[n] || x.userId === parts[n]); if (m) r[c.k] = m.userId; } else r[c.k] = parts[n].slice(0, 4000); }); return r; });
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-o]'); if (!el || !el.dataset.o) return;
  const a = el.dataset.o, base = el.dataset.l, i = +el.dataset.i;
  switch (a) {
    case 'page': goOwn(el.dataset.p); break;
    case 'ai': if (aiState[el.dataset.k] === 'done') { delete aiState[el.dataset.k]; render(true); } else if (!aiState[el.dataset.k]) runAIOwn(el.dataset.k); break;
    case 'aiClose': delete aiState[el.dataset.k]; render(true); break;
    case 'aiFill': aiFillList(base); break;
    case 'aiDraft': aiDraft(el.dataset.p, el.dataset.s); break;
    case 'aiKeep': { const { row } = rowAt(base, i); if (row) { delete row._ai; touch(); render(true); } break; }
    case 'own': ownMode = true; render(); $('#main').scrollTop = 0; break;
    case 'demo': ownMode = false; clearTimers(); render(); $('#main').scrollTop = 0; break;
    case 'example': { const k = el.dataset.p; ownMode = false; clearTimers(); if (k[0] === 's' && k[1] === 't') { Object.keys(PAGES).forEach(x => S[x] = false); S.st = +k[2]; } else if (PAGES[k]) Object.keys(PAGES).forEach(x => S[x] = x === k); render(); $('#main').scrollTop = 0; break; }
    case 'nav': flush(); bridge({ type: 'navigate', tab: el.dataset.tab }); break;
    case 'open': flush(); bridge({ type: 'open', id: el.dataset.id }); break;
    case 'create': bridge({ type: 'create', kind: el.dataset.kind, payload: ctx.projectId && ['task', 'resource', 'note'].includes(el.dataset.kind) ? { projectId: ctx.projectId } : {} }); break;
    case 'folder': $('#app').classList.toggle('folder-open'); break;
    case 'jump': { const t = $('#sec-' + el.dataset.s); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); break; }
    case 'addRow': { const { rows, k, lk } = rowAt(base); const { l } = listDef(k, lk); if (rows.length >= 60) { toast('单个列表最多 60 项'); break; } rows.push({}); touch(); render(true); const inputs = document.querySelectorAll(`[data-f^="${base}|${rows.length - 1}|"]`); if (inputs[0]) inputs[0].focus(); break; }
    case 'delRow': { const { rows, row } = rowAt(base, i); if (row && Object.values(row).some(v => v) && !confirm('删除这一行？')) break; rows.splice(i, 1); touch(); render(true); break; }
    case 'seed': { const { rows, k, lk } = rowAt(base); const { l } = listDef(k, lk); l.seed.forEach(r => rows.push({ ...r })); touch(); render(true); break; }
    case 'paste': openPaste[base] = !openPaste[base]; render(true); if (openPaste[base]) { const t = document.querySelector(`[data-paste="${base}"]`); if (t) t.focus(); } break;
    case 'pasteAdd': { const { rows, k, lk } = rowAt(base), { l } = listDef(k, lk), t = document.querySelector(`[data-paste="${base}"]`), add = parseRows(t ? t.value : '', l);
      if (!add.length) { toast('先粘贴内容，每行一条'); break; } const room = 60 - rows.length; rows.push(...add.slice(0, room)); openPaste[base] = false; touch(); render(true); toast(add.length > room ? `已添加 ${room} 条，超出 60 条的部分没有添加` : `已添加 ${add.length} 条`); break; }
    case 'toTask': shareTask(base, i); break;
    case 'toLine': shareLine(base, i); break;
    case 'toResource': shareDoc(el.dataset.p, 'resource'); break;
    case 'toNote': shareDoc(el.dataset.p, 'note'); break;
    case 'complete': { const p = pg(el.dataset.p); p.complete = !p.complete; touch(); render(true); toast(p.complete ? '已标记完成' : '已取消完成标记'); break; }
    case 'exportPage': { const k = el.dataset.p; download(fileName(`${pageTitle(k)}.md`), mdHead().concat(pageMd(k)).join('\n'), 'text/markdown'); toast('已导出本页'); break; }
    case 'exportAll': { const ks = D.stations.map((_, n) => 'st' + n).concat(CAREER, LIFE).filter(k => canPage(k) && mySecs(k).some(s => filled(k, s))); if (!ks.length) { toast('还没有可以导出的内容'); break; } download(fileName(`${project() ? '《' + project().payload.name + '》' : '通用工作区'}资料包.md`), mdHead().concat(ks.map(pageMd).join('\n\n')).join('\n'), 'text/markdown'); toast('已导出资料包（Markdown）'); break; }
    case 'backup': download(fileName(`戏伴工作台-草稿-${project() ? project().payload.name : '通用'}-${todayStr()}.json`), JSON.stringify({ app: 'tonggaoben-studio', version: 1, projectId: ctx.projectId, savedAt: new Date().toISOString(), state: draft }, null, 2), 'application/json'); toast('已导出草稿备份'); break;
    case 'rvst': ownStatus = el.dataset.v; document.querySelectorAll('[data-o="rvst"]').forEach(b => b.classList.toggle('on', b.dataset.v === ownStatus)); break;
    case 'rvsave': { const t = ($('#oRvText').value || '').trim(); if (!t) { toast('先写下你们的决定'); break; } const p = pg(el.dataset.p), l = p.lists.reviews = p.lists.reviews || []; if (l.length >= 60) { toast('最多保留 60 条决定，请先删除旧的'); break; } l.push({ status: ownStatus, who: $('#oRvWho').value, text: t.slice(0, 4000), at: stamp() }); touch(); render(true); toast('已保存人工决定'); break; }
    case 'rvdel': if (confirm('删除这条决定？')) { pg(el.dataset.p).lists.reviews.splice(i, 1); touch(); render(true); } break;
    case 'retry': dirty = true; flush(); break;
    case 'conflict': conflictDialog(); break;
    case 'reloadDraft': $('#dlg').close(); saveState = 'saved'; dirty = false; booted = false; render(); bridge({ type: 'reload' }); break;
    case 'reload': loadError = ''; render(); bridge({ type: 'reload' }); break;
    case 'oclose': $('#dlg').close(); break;
  }
});
function conflictDialog() {
  const dlg = $('#dlg');
  dlg.innerHTML = `<div class="dlg"><h2>草稿在别处更新了<button data-o="oclose" aria-label="关闭">×</button></h2><p class="mt8">你在另一台设备或窗口里改过这个项目的草稿。为了不覆盖那边的内容，这里暂停了保存。</p><ol class="list small mt8"><li>先点「备份当前草稿」，把这边的内容存成文件。</li><li>再点「载入最新版本」，必要时用「导入草稿」合并回来。</li></ol><div class="row mt"><button class="btn" data-o="backup">💾 备份当前草稿</button><button class="btn pri" data-o="reloadDraft">载入最新版本</button></div></div>`;
  if (!dlg.open) dlg.showModal();
}
document.addEventListener('input', e => {
  const f = e.target.dataset && e.target.dataset.f; if (!f || !ownMode) return;
  const parts = f.split('|'), k = parts[0], v = e.target.value.slice(0, parts[1] === 'v' ? 12000 : 4000);
  if (parts[1] === 'v') pg(k).values[parts[2]] = v; else { const rows = pg(k).lists[parts[1]] = pg(k).lists[parts[1]] || []; rows[+parts[2]] = rows[+parts[2]] || {}; rows[+parts[2]][parts[3]] = v; delete rows[+parts[2]]._ai; }
  touch();
});
document.addEventListener('change', e => {
  if (e.target.dataset && e.target.dataset.f) { flush(); oSide(); oFolder(); }
  if (e.target.dataset && e.target.dataset.oChange === 'project') switchProject(e.target.value);
  if (e.target.dataset && e.target.dataset.oFile === 'import' && e.target.files[0]) importDraft(e.target.files[0], e.target);
});
document.addEventListener('focusout', () => { if (staleView) setTimeout(() => { if (!document.activeElement || !document.activeElement.closest('#main input,#main textarea,#main select')) { staleView = false; render(true); } }, 0); });
async function switchProject(id) {
  switching = true; oTop(); const ok = await flush();
  if (!ok && !confirm('当前草稿还没保存成功，仍要切换项目吗？没保存的改动会丢失。')) { switching = false; oTop(); return; }
  booted = false; render(); bridge({ type: 'project', id });
}
function importDraft(file, input) {
  const r = new FileReader();
  r.onload = () => {
    input.value = '';
    try {
      const j = JSON.parse(r.result), st = j && j.app === 'tonggaoben-studio' ? j.state : j;
      if (!st || typeof st.pages !== 'object' || Array.isArray(st.pages)) throw new Error();
      const keys = Object.keys(st.pages).filter(k => OWN[k]);
      if (!keys.length) throw new Error();
      if (!confirm(`导入 ${keys.length} 个板块，覆盖当前项目里相同板块的草稿？其他板块保持不变。`)) return;
      keys.forEach(k => { const p = st.pages[k] || {}; draft.pages[k] = { values: p.values && typeof p.values === 'object' ? p.values : {}, lists: p.lists && typeof p.lists === 'object' ? p.lists : {}, complete: p.complete === true }; });
      touch(); flush(); render(true); toast('已导入草稿，正在保存');
    } catch { toast('这个文件不是工作台的草稿备份'); }
  };
  r.readAsText(file);
}

/* ---------- 渲染切换与父页面消息 ---------- */
const demoRender = render;
render = function (keepScroll) {
  if (!ownMode) {
    $('#app').classList.remove('own'); demoRender(keepScroll); document.documentElement.dataset.theme = 'paper'; document.title = '戏伴工作台 · 示例';
    document.querySelectorAll('#side a.extra, #side .side-btns [data-act="settings"], #top .chip, #top .themes').forEach(x => x.remove()); const br = $('#side .brand'); if (br) br.removeAttribute('data-act');
    $('#top').insertAdjacentHTML('beforeend', modeSwitch());
    $('#main').insertAdjacentHTML('afterbegin', `<div class="demo-banner"><b>参考示例</b><span>项目、人物、留言和品牌均为虚构；结果是预置内容，没有调用 AI，操作也不会发送或保存。</span>${embedded ? '<button class="btn pri" data-o="own">回到我的工作区</button>' : ''}</div>`);
    return;
  }
  document.documentElement.dataset.theme = 'paper'; document.title = '戏伴工作台'; $('#app').classList.add('own');
  const m = $('#main'), y = m.scrollTop;
  oSide(); oTop(); oFolder();
  m.innerHTML = booted ? oPage(here) : oLoading();
  if (keepScroll) m.scrollTop = y;
  mountNets();
};
window.addEventListener('message', e => { if (!LOCAL && e.source === window.parent && e.data && e.data.channel === CH) deliver(e.data); });
if (LOCAL) LOCAL.deliver = m => deliver(m);
function deliver(m) {
  if (m.type === 'group') { const grp = navGroups().find(x => x[0] === m.id); if (grp && groupOf(here) !== m.id) goOwn(grp[2][0]); return; }
  if (m.type === 'init') {
    ctx = { me: m.me, members: m.members || [], workspace: m.workspace, records: m.records || [], projectId: m.projectId || '' };
    const st = m.state && typeof m.state.pages === 'object' && !Array.isArray(m.state.pages) ? m.state : { version: 1, pages: {} };
    draft = { version: 1, pages: st.pages }; savedAt = m.updatedAt; booted = true; switching = false; loadError = ''; dirty = false; saveState = 'saved';
    if (here === 'home' || !canPage(here)) here = firstPage();
    render(); return;
  }
  if (m.type === 'context') {
    ctx = { ...ctx, me: m.me, members: m.members || [], workspace: m.workspace, records: m.records || [] };
    if (!ownMode || !booted) return;
    if (!canPage(here)) { here = firstPage(); render(); return; }
    const y = $('#main').scrollTop; oSide(); oTop(); oFolder();
    if (document.activeElement && document.activeElement.closest('#main input,#main textarea,#main select')) staleView = true; else render(true);
    $('#main').scrollTop = y; return;
  }
  if (m.type === 'saved') { savedAt = m.updatedAt || savedAt; if (m.requestId === reqSeq && !dirty) setSave('saved'); (waiters[m.requestId] || (() => {}))(true); delete waiters[m.requestId]; return; }
  if (m.type === 'save-error') { dirty = true; setSave(m.conflict ? 'conflict' : 'error', m.message || ''); toast(m.conflict ? '草稿在另一处更新过，已暂停保存' : (m.message || '保存失败，改动还在页面上')); (waiters[m.requestId] || (() => {}))(false); delete waiters[m.requestId]; if (m.conflict) conflictDialog(); return; }
  if (m.type === 'load-error') { booted = false; switching = false; loadError = m.message || '工作台暂时无法连接'; render(); }
}
fromHash();
addEventListener('hashchange', () => { fromHash(); clearTimers(); render(); $('#main').scrollTop = 0; });
render();
bridge({ type: 'ready' });

})();
