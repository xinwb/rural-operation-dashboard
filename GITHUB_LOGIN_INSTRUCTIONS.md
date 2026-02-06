# GitHub CLI 登录说明

要使用GitHub CLI创建仓库并推送项目，请按以下步骤操作：

## 步骤 1: 登录 GitHub
在终端中运行以下命令：

```bash
gh auth login
```

## 步骤 2: 选择认证方式
系统会询问您几个问题：

1. **How would you like to authenticate?**
   - 选择 "Login with a web browser"

2. **What is your preferred protocol for Git operations?**
   - 选择 "HTTPS"

3. **Authenticate Git with your GitHub credentials?**
   - 选择 "Yes"

4. **How would you like to authenticate GitHub CLI?**
   - 选择 "Paste an authentication token"
   
   (如果您选择了浏览器登录，则会自动跳转到浏览器进行认证)

## 步骤 3: (如果选择Token方式) 创建Personal Access Token
如果您选择使用Token方式认证：

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Fine-grained personal access tokens" 或 "Classic personal access tokens"
3. 点击 "Generate new token"
4. 为Token设置名称，例如 "OpenClaw Dashboard Deployment"
5. 设置过期时间
6. 选择适当的权限：
   - repo (访问仓库)
   - workflow (如果需要管理工作流)
   - admin:org (如果需要组织管理权限)
   - admin:public_key (管理SSH密钥)
7. 点击 "Generate token"
8. 复制生成的token（请注意，关闭页面后将无法再次查看）

## 步骤 4: 完成登录
将复制的token粘贴到终端中提示的位置。

## 步骤 5: 验证登录
登录完成后，运行以下命令验证：

```bash
gh auth status
```

## 步骤 6: 创建仓库并推送
登录成功后，运行以下命令创建仓库并推送项目：

```bash
cd /Users/wubin/Documents/Github/dashboard-system
gh repo create xinwb/rural-operation-dashboard --public --description "乡村运营数据大屏展示系统 - 数据可视化平台"
git push -u origin main
```

## 步骤 7: 启用 GitHub Pages
1. 访问仓库页面 https://github.com/xinwb/rural-operation-dashboard
2. 点击 "Settings" 选项卡
3. 向下滚动到 "Pages" 部分
4. 在 "Source" 下拉菜单中选择 "Deploy from a branch"
5. 选择 "main" 分支和 "/" 目录
6. 点击 "Save"

完成后，您的网站将在 https://xinwb.github.io/rural-operation-dashboard/ 上可用。