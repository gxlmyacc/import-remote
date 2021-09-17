# Webpack 5 Module Federation 案例

- `app1` 暴露一个 Slides 模块；
- `app2` 暴露一个 NewsList 模块，引用 app1 的 Slides 模块；
- `app3` 引用 app1 的 Slides 模块，引用 app2 的 NewsList 模块；

## 依赖安装

运行 `npm install` 安装 `lerna`。

```bash
npm install
```

运行 `npx lerna bootstrap` 安装各个分包的依赖。

```bash
npx lerna bootstrap
```

## 运行 DEMO

运行 `npm run start`。该命令会启动三个服务，app1/app2/app3 分别对应端口 3001/3002/3003。

- [localhost:3001](http://localhost:3001/) (app1)
- [localhost:3002](http://localhost:3002/) (app2)
- [localhost:3003](http://localhost:3003/) (app3)
