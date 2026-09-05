# Quell-ECP

模拟跨境电商平台（自营单店铺 B2C）。用于电商业务流程模拟、学习与演示：**不含真实支付与物流**，可自托管部署到自租服务器。

## 目的与性质

- 跑通「商品上架 → 下单 → 支付（模拟）→ 履约」完整闭环
- 前台商城（买家）+ 运营后台（管理员）双端
- 预留跨境演进：多币种/汇率、中英日多语言、跨境物流（二期）
- 一切可复现：Docker 一键部署、种子数据演示

## 架构

```text
浏览器（React SPA：商城前台 + 运营后台）
   │
nginx ──静态托管──────▶ /api
                           │
                      NestJS（auth · products · orders · payments(mock) · admin）
                           │ Prisma
                        PostgreSQL
```

- 前端 React + Vite + Tailwind；后端 NestJS + Prisma + PostgreSQL；Docker Compose 单机部署
- 支付走本地模拟网关（Provider 抽象，二期可换沙箱）
- Monorepo：`apps/`（web、api）· `packages/shared`（共享类型）· `infra/`（部署）

## 仓库现状

| 目录 | 说明 |
|---|---|
| [docs/PRD.md](docs/PRD.md) | 需求文档（角色、范围、订单状态机、验收、里程碑） |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 技术架构、数据模型、部署方案 |
| [design/](design/) | 商城前台三语（中/EN/日）静态设计原型，`python3 -m http.server` 即可预览 |

代码实现尚未开始（见 PRD 里程碑：M0 基建 → M1 账号商品 → M2 交易闭环 → M3 上线部署）。
