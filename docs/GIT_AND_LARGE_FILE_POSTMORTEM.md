# Git 提交与静态资源工程踩坑与避坑指南 (Post-Mortem & SOP)

本文档沉淀自 `wai-headless-demo` 项目在仓库认证、大文件推送告警及前端海量静态数据性能优化过程中的真实排障经验，旨在为后续工程提供规范化避坑方案。

---

## 避坑点 1：GitHub 账号登录与命令行鉴权机制失效

### 1. 现象与误区
* **现象**：终端提示 `Password for 'https://...':` 时，输入 GitHub 网页登录密码，直接报 `remote: Invalid username or token. Password authentication is not supported for Git operations.`。
* **误区**：以为是账号密码输错，反复重置网页密码或通过 Google 快捷登录找回密码，依然无法在终端 Push 代码。

### 2. 底层机制
GitHub 早在 2021 年就全面禁用了基于纯账号+密码的 Git 命令行操作（防止暴力破解及凭据泄漏）。终端中必须使用：
* **PAT（Personal Access Token）**，或者
* **SSH 密钥**（推荐，一劳永逸）。

### 3. 标准解决 SOP (推荐 SSH)
1. 生成本地密钥：
   ```bash
   ssh-keygen -t ed25519 -C "your-github-username"
   ```
2. 复制公钥内容：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
3. 前往 GitHub `Settings -> SSH and GPG keys -> New SSH key` 粘贴并保存。
4. 将本地仓库 Remote 切换为 SSH 协议：
   ```bash
   git remote set-url origin git@github.com:<username>/<repo>.git
   ```

---

## 避坑点 2：单体超大静态资源 (>50MB) 导致 Git 告警与拦截

### 1. 现象与风险阈值
* **50MB**：GitHub 弹出 Warning 警告（本次排查中 `alternators.json` (82.94MB) 和 `starters.json` (80.39MB) 触发报警）。
* **100MB**：GitHub 直接 **Push Rejected 强行拦截**，终止推送。
* **浏览器性能陷阱**：前端单个页面如果直接 `fetch()` 80MB 的 JSON 文件，会瞬间打满带宽、产生数百兆的 JavaScript 堆内存占用，导致低配移动端或浏览器主线程严重卡死。

### 2. 误区：`git rm` 无法解决已提交的大文件
* **误区**：在发现大文件告警后，直接在工作区删除文件或加入 `.gitignore` 并新建一个 commit。
* **原因**：大文件依然残留在过去的 Git Commit 历史树中，`git push` 时 Git 依然会打包所有历史对象（Packfile），依然会触发 GitHub 拦截或告警。

### 3. 规范解决方案：分片存储 (Chunking) + 清单索引 (Manifest)

对于大型离线数据（3万~10万级 SKU 类目）：

1. **分片处理（Chunk Size 控制在 1000~2000 条，单文件 1~10MB）**：
   * 采用脚本将单体 JSON 切割为 `chunk_0.json`, `chunk_1.json`, ...
   * 生成轻量级 `manifest.json`：
     ```json
     {
       "totalItems": 9975,
       "totalChunks": 7,
       "skuMap": {
         "11034": 0,
         "11035": 0,
         ...
       }
     }
     ```
2. **代码端按需精准加载 (O(1) 索引)**：
   * 前端/服务端先查 `manifest.skuMap[sku]` 拿到 `chunkIndex`。
   * 仅加载目标 `chunk_${chunkIndex}.json`，内存与网络消耗从 80MB 骤降至 2~5MB。

3. **抹除大文件历史记录**：
   * 若刚提交且仅有 1 个 commit：
     ```bash
     # 重新构建分片产物后
     git add -A
     git commit --amend -m "your commit message"
     git push origin <branch> --force
     ```
   * 若已有多条 commit：使用 `git-filter-repo` 彻底剥离大文件对象：
     ```bash
     brew install git-filter-repo
     git filter-repo --path public/data/categories/alternators.json --invert-paths
     ```

---

## 避坑点 3：前端工程中的数据双份同步隐患

### 1. 现象
在本项目中，`src/data/categories/` 与 `public/data/categories/` 同时存在大文件，导致体积直接翻倍（215MB -> 430MB）。

### 2. 最佳工程实践规范
1. **职责分离**：
   * 属于服务端/构建时 SSG 读取的数据：仅保存在 `src/data/`，不要拷贝到 `public/`。
   * 属于客户端浏览器 `fetch()` 动态拉取的数据：才放置于 `public/`。
2. **自动化切分管道**：
   * 原始数据源若更新，统一通过 `scripts/split-categories.js` 统一生成切片，禁止手动拷贝大文件。

---

## 快速自检清单 (Pre-flight Checklist)

在后续项目执行 `git push` 之前，运行以下检查：

- [ ] **文件大小审计**：
  ```bash
  find . -not -path '*/.*' -not -path './node_modules*' -size +45M
  ```
  *(确保没有任何超过 45MB 的单个文件存在)*
- [ ] **Git Remote 协议检查**：
  ```bash
  git remote -v
  ```
  *(确认是 `git@github.com:...` 而不是 `https://`，避免密码认证陷阱)*
- [ ] **不变性与构建验证**：
  ```bash
  node verify-invariants.js && npm run build
  ```
  *(确保分片改造后数据完整性与 SSG 构建 100% 通过)*
