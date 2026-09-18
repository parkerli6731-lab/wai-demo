# 架构演进与决策弧光 (WAI Global Headless Arc Log)

## 1. 核心背景与意图 (Context & Intent)
原现网 `https://www.waiglobal.com/` 运行于 Adobe Magento 2 架构，在高并发或跨国访问时遭遇严重的单体性能瓶颈（TTFB 慢、Cloudflare 动态回源穿透、数据库 JOIN 查询开销大）。
本项目旨在以**零服务器基座成本**，基于 Next.js 15 (SSG/Client-side In-memory Indexing) 重构出具备超高性能的全球汽配展示与 B2B 询盘平台。

## 2. 关键设计权衡与决策 (Decisions & Trade-offs)
- **拒绝传统 SQL 动态查询，采用编译期规范化紧凑索引**：
  将原本散落在各个维度的 983 个真实 WAI 件号（784 个摇窗电机 + 199 个发电机）及其跨品牌交叉对照（PIC, Bosch, Denso, Valeo, Ford, GM）抽离为纯静态的 `catalog.json`，首屏无需任何慢网络请求。
- **内置 `sanitizePartNumber` 容错算法**：
  解决汽配买家搜索时习惯携带特殊空格或连字符（如 `104210-4330` vs `104210 4330`）导致的误漏报痛点。
- **B2B 专用询盘篮（RFQ Drawer）**：
  替代沉重的传统购物车与结账流，直切汽配外贸的询价与集装箱订货场景，支持一键批量发起询盘。

## 3. 不变量自动化验证指标 (Invariant Verification)
- 7 项核心断言全绿通过（`verify-invariants.js`）：
  - 983 条工业真实数据 100% 完整收敛；
  - 覆盖 54 个汽车主流品牌，62 年跨度（1965-2026）；
  - 搜索延迟 P99 benchmark: **0.04ms**（远低于 < 15ms 的严苛红线）；
  - Next.js 15 生产打包全静态化生成（Prerendered as static content），Exit Code 0。
