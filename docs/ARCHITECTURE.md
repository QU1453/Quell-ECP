# Quell-ECP 技术架构方案

> 配套 [PRD.md](./PRD.md) · 日期：2026-09-05
> 决策：自营单店铺 B2C；一期电商核心；自租服务器容器化部署。

---

## 1. 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 前端 | React 18 + Vite + TypeScript + Tailwind CSS | 前后端分离、构建产物静态化，便于 Nginx 托管 |
| 前端数据 | TanStack Query + react-router | 服务端状态缓存、路由与角色守卫 |
| 后端 | Node.js 20 + NestJS + TypeScript | 模块化、DI、Guard/Interceptor 结构化，适合随业务演进扩模块（支付、多店铺、物流） |
| ORM / 数据库 | Prisma + PostgreSQL 16 | 类型安全、迁移友好；PG 自托管成熟稳定 |
| 鉴权 | JWT（Access + Refresh，HttpOnly Cookie 或 Authorization 头） | 前后端分离下的常规方案，RBAC 角色守卫 |
| 支付 | 本地**模拟支付网关**（Provider 抽象） | 一期不接真实渠道，二期可换 Stripe/PayPal 沙箱 Provider |
| 校验 | zod（packages/shared）+ NestJS Pipe | 前后端共享校验规则 |
| 部署 | Docker Compose（nginx / api / postgres） | 满足自租服务器单机一键部署 |
| 仓库 | Monorepo（npm workspaces） | 共享类型/校验，一次安装，统一版本 |

## 2. 架构总览

```
浏览器（买家前台 / 运营后台，同一 React SPA）
        │ HTTPS
        ▼
┌─────────────────── 自租服务器 · Docker Compose ───────────────────┐
│  nginx（80/443）                                                 │
│   ├── location /   → Web SPA 静态产物                             │
│   └── location /api → 反代到 api:3000                            │
│                                                                  │
│  api（NestJS，单体模块化）                                        │
│   auth → users → categories/products → cart → orders → payments │
│   └─ admin：复用上述模块的 AdminController + 角色守卫               │
│        │ Prisma                                                │
│        ▼                                                        │
│  PostgreSQL 16（volume 持久化，不对外网暴露）                      │
│                                                                  │
│  （虚线）二期能力：多币种汇率 · i18n · 跨境运费 · 物流模拟            │
└──────────────────────────────────────────────────────────────────┘
```

- 一期为**单体后端 + 模块化**：先跑通闭环，模块边界已按“可拆服务”划分；
- 二期跨境能力以**新增模块 + 预留字段**方式接入，不改一期核心流程。

## 3. 仓库结构（计划）

```
quell-ecp/
├─ apps/
│  ├─ api/                      # NestJS 后端
│  │  ├─ src/modules/           # auth users categories products cart orders payments admin stats uploads
│  │  ├─ prisma/schema.prisma   # 数据模型与迁移
│  │  └─ Dockerfile
│  └─ web/                      # React + Vite（前台 `/` + 后台 `/admin`）
│     ├─ src/pages/store        # 商城前台
│     ├─ src/pages/admin        # 运营后台（角色守卫）
│     └─ Dockerfile（构建静态产物 → 由 nginx 托管）
├─ packages/shared/             # 共享 TS 类型、枚举、zod schema
├─ infra/                       # docker-compose.yml、nginx.conf、.env.example、部署文档
├─ docs/                        # PRD / 架构 / 部署
└─ README.md
```

> 管理后台一期与前台同属一个 SPA，通过 `/admin` 路由 + 角色守卫隔离，减少部署面；后续流量/复杂度上来可拆分独立应用。

## 4. 数据模型（一期核心）

| 表 | 关键字段 | 备注 |
|---|---|---|
| User | email、passwordHash、role(buyer/admin)、createdAt | |
| Address | userId、recipient、phone、country、region、city、street、postalCode | `country` 字段一期即保留，供二期运费/物流使用 |
| Category | name、slug、sort | |
| Product | categoryId、title、description、images[]、priceCents、currency(默认USD)、stock、status(on/off)、软删除 | `currency` 预留二期多币种 |
| CartItem | userId、productId、quantity | 唯一约束 (userId, productId) |
| Order | userId、orderNo、status、totalCents、currency、addressSnapshot、paidAt、timeline | 地址下单时快照 |
| OrderItem | orderId、productId、titleSnapshot、priceCents、quantity | 商品信息快照，防改价追溯 |
| Payment | orderId、channel(mock)、amountCents、status、txnId、paidAt | 与订单解耦，可对账 |

## 5. 关键设计

### 5.1 鉴权与角色
- POST `/api/v1/auth/register|login` → 返回 Access(JWT) + Refresh；
- NestJS `RolesGuard` + `@Roles('admin')` 保护后台接口；
- 前台买家接口要求 `buyer` 登录态，越权访问一律 403。

### 5.2 模拟支付网关（模块化）
```
PaymentProvider (interface)      # charge / refund / (webhook 预留)
   ├── MockProvider  ← 一期：本地模拟收银台
   └── SandboxProvider ← 二期：Stripe/PayPal 沙箱等
```
- 提交订单 → 创建 `Payment(pending)` → 前端跳**模拟收银台**；
- 买家点“模拟支付成功/失败/取消” → 后端**幂等**推进订单状态；
- 接口形态对齐真实网关 webhook，二期替换 Provider 即可，不重写订单流程。

### 5.3 库存一致性
- 下单事务内校验并扣减库存（`UPDATE ... WHERE stock >= qty`，行级安全）；
- 取消/退款/超时未支付 → 回补库存；
- 后台看板对低库存商品告警。

### 5.4 二期演进预留（不改一期主流程）
- **多币种**：金额一律整数分存储 + `currency` 字段；二期引入汇率表与下单时点快照；
- **i18n**：文案统一走 key；商品标题等先存单语种，二期按 locale 字段扩展或外挂翻译表；
- **跨境物流**：Address 已含国家/邮编；Order 预留物流子表（轨迹事件），二期填充状态机。

## 6. 部署方案（自租服务器）

镜像与编排（M3 落地，示例）：

```yaml
# infra/docker-compose.yml
services:
  nginx:
    image: nginx:1.27-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - web-dist:/usr/share/nginx/html:ro
  api:
    build: ../apps/api
    env_file: .env            # DATABASE_URL / JWT_SECRET 等
    depends_on:
      db: { condition: service_healthy }
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: quell
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U quell"] }
```

```nginx
# infra/nginx.conf（核心规则）
server {
  listen 80;
  location /api/   { proxy_pass http://api:3000; }
  location /      { root /usr/share/nginx/html; try_files $uri /index.html; }  # SPA
}
```

要点：
- DB 不映射宿主端口，仅容器内网访问；
- `JWT_SECRET`、`POSTGRES_PASSWORD` 走 `.env`（提供 `.env.example`）；
- 部署步骤（装 Docker → clone → `cp .env.example .env` → `docker compose up -d --build` → migrate/seed → 验收）；
- 服务器建议 2C2G 起步，4G 更从容；域名 + HTTPS（certbot）作为可选加固，写入部署文档；
- 备份：`pg_dump` 定时任务或挂载卷快照。

## 7. 里程碑依赖映射

| 里程碑 | 主要落地物（对应本方案） |
|---|---|
| M0 | 仓库结构、api + prisma + pg、web 脚手架、dev compose |
| M1 | auth/users/categories/products 模块、admin 与前台路由骨架 |
| M2 | cart/orders/payments 状态机闭环（§PRD.5） |
| M3 | uploads/stats、生产镜像、infra/ 部署、验收与文档 |
