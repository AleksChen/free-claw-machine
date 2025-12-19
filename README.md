# 🎮 Free Claw Machine

<div align="center">

[中文](#中文) | [English](#english)

## English

### 📖 About

Free Claw Machine is an interactive web-based arcade game that lets you control a virtual claw machine using nothing but your hands! Wave at your webcam to move the claw, make a fist to grab, and try to win prizes in a fully physics-simulated 3D environment.

**No controllers, no keyboards, no mice** - just pure gesture control powered by cutting-edge computer vision technology.

### ✨ Features

- 🖐️ **Dual Hand Tracking** - Use both hands simultaneously for precise control
- 🎯 **Gesture Recognition** - Intuitive hand gestures for all game actions
- 🎨 **3D Graphics** - Beautiful WebGL rendering with realistic lighting
- ⚙️ **Physics Simulation** - Authentic claw machine physics and collision detection
- 🌐 **Browser-Based** - No installation required, runs directly in your browser
- 📱 **Cross-Platform** - Works on desktop and mobile devices with cameras
- 🎵 **Audio Feedback** - Immersive sound effects for every action

### 🎮 How to Play

1. **Allow Camera Access** - Grant webcam permissions when prompted
2. **Position Your Hands** - Keep both hands visible in the camera frame
3. **Move the Claw** - Use your left hand position to control XY movement
4. **Grab Prizes** - Make a fist with your right hand to lower and grab
5. **Release** - Open your hand to release the prize

**Hand Gestures:**

- ✋ **Open Palm** → Move claw / Release prize
- ✊ **Closed Fist** → Lower claw / Grab prize
- 👆 **Index Finger Up** → Reset position (optional)

### 🛠️ Technology Stack

| Component           | Technology         | Purpose                                         |
| ------------------- | ------------------ | ----------------------------------------------- |
| **Computer Vision** | MediaPipe Hands    | Real-time hand tracking and gesture recognition |
| **3D Engine**       | Three.js (r128)    | Scene rendering, model loading, camera control  |
| **Physics**         | Cannon.js          | Rigid body dynamics and collision detection     |
| **Frontend**        | Vanilla JS / React | UI and state management                         |
| **Build Tool**      | Vite / Webpack     | Development and bundling                        |

### 🚀 Getting Started

#### Prerequisites

- Node.js 16+ and npm/yarn
- Modern browser with WebGL 2.0 support
- Webcam or camera device

#### Installation

```bash
# Clone the repository
git clone https://github.com/AleksChen/free-claw-machine.git

# Navigate to project directory
cd free-claw-machine

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or your configured port).

#### Build for Production

```bash
npm run build
```

### 📁 Project Structure

```
free-claw-machine/
├── src/
│   ├── components/       # React components (if using React)
│   ├── scenes/          # Three.js scene setup
│   ├── models/          # 3D models and assets
│   ├── physics/         # Physics engine integration
│   ├── vision/          # MediaPipe hand tracking logic
│   ├── gestures/        # Gesture recognition system
│   └── utils/           # Helper functions
├── public/              # Static assets
├── docs/                # Documentation
└── tests/               # Unit and integration tests
```

### 🎯 Roadmap

- [x] Basic hand tracking integration
- [x] 3D scene setup with claw model
- [x] Physics simulation
- [ ] Gesture recognition system
- [ ] Multiple prize types
- [ ] Score and achievement system
- [ ] Multiplayer mode
- [ ] Custom skins and themes
- [ ] Mobile optimization
- [ ] AR mode integration

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- [MediaPipe](https://google.github.io/mediapipe/) by Google for hand tracking technology
- [Three.js](https://threejs.org/) community for the amazing 3D engine
- [Cannon.js](https://github.com/schteppe/cannon.js) for physics simulation
- All contributors who help improve this project

### 📧 Contact

Project Link: [https://github.com/AleksChen/free-claw-machine](https://github.com/AleksChen/free-claw-machine)

---

## 中文

### 📖 关于项目

Free Claw Machine 是一款基于网页的互动街机游戏，让你仅用双手就能控制虚拟抓娃娃机！对着摄像头挥手移动爪子，握拳抓取，在完全物理模拟的 3D 环境中尝试赢取奖品。

**无需手柄、无需键盘、无需鼠标** - 仅凭手势控制，由前沿计算机视觉技术驱动。

### ✨ 功能特性

- 🖐️ **双手追踪** - 同时使用双手进行精确控制
- 🎯 **手势识别** - 直观的手势操作完成所有游戏动作
- 🎨 **3D 图形** - 精美的 WebGL 渲染与真实光照
- ⚙️ **物理模拟** - 真实的抓娃娃机物理效果和碰撞检测
- 🌐 **基于浏览器** - 无需安装，直接在浏览器中运行
- 📱 **跨平台** - 支持桌面和移动设备（需配备摄像头）
- 🎵 **音效反馈** - 为每个动作提供沉浸式音效

### 🎮 如何游玩

1. **允许摄像头访问** - 在提示时授予摄像头权限
2. **摆放双手** - 保持双手在摄像头画面中可见
3. **移动爪子** - 用左手位置控制爪子的 XY 平面移动
4. **抓取奖品** - 用右手握拳来下降并抓取
5. **释放** - 张开手掌释放奖品

**手势操作：**

- ✋ **张开手掌** → 移动爪子 / 释放奖品
- ✊ **握拳** → 下降爪子 / 抓取奖品
- 👆 **食指向上** → 重置位置（可选）

### 🛠️ 技术栈

| 组件           | 技术            | 用途                         |
| -------------- | --------------- | ---------------------------- |
| **计算机视觉** | MediaPipe Hands | 实时手部追踪和手势识别       |
| **3D 引擎**    | Three.js (r128) | 场景渲染、模型加载、相机控制 |
| **物理引擎**   | Cannon.js       | 刚体动力学和碰撞检测         |
| **前端框架**   | 原生 JS / React | UI 和状态管理                |
| **构建工具**   | Vite / Webpack  | 开发和打包                   |

### 🚀 快速开始

#### 环境要求

- Node.js 16+ 和 npm/yarn
- 支持 WebGL 2.0 的现代浏览器
- 摄像头或相机设备

#### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/AleksChen/free-claw-machine.git

# 进入项目目录
cd free-claw-machine

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 `http://localhost:5173` (或你配置的端口) 运行。

#### 生产环境构建

```bash
npm run build
```

### 📁 项目结构

```
free-claw-machine/
├── src/
│   ├── components/       # React 组件（如使用 React）
│   ├── scenes/          # Three.js 场景设置
│   ├── models/          # 3D 模型和资源
│   ├── physics/         # 物理引擎集成
│   ├── vision/          # MediaPipe 手部追踪逻辑
│   ├── gestures/        # 手势识别系统
│   └── utils/           # 辅助函数
├── public/              # 静态资源
├── docs/                # 文档
└── tests/               # 单元测试和集成测试
```

### 🎯 开发路线图

- [x] 基础手部追踪集成
- [x] 3D 场景搭建与爪子模型
- [x] 物理模拟
- [ ] 手势识别系统
- [ ] 多种奖品类型
- [ ] 分数和成就系统
- [ ] 多人游戏模式
- [ ] 自定义皮肤和主题
- [ ] 移动端优化
- [ ] AR 模式集成

### 🤝 贡献指南

欢迎贡献！请随时提交 Pull Request。对于重大更改，请先开启 issue 讨论您想要改变的内容。

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详细指南请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 📝 开源协议

本项目采用 MIT 协议 - 详情请见 [LICENSE](LICENSE) 文件。

### 🙏 致谢

- [MediaPipe](https://google.github.io/mediapipe/) - Google 提供的手部追踪技术
- [Three.js](https://threejs.org/) 社区提供的强大 3D 引擎
- [Cannon.js](https://github.com/schteppe/cannon.js) 提供的物理模拟
- 所有帮助改进此项目的贡献者

### 📧 联系方式

项目链接: [https://github.com/AleksChen/free-claw-machine](https://github.com/AleksChen/free-claw-machine)

---

<div align="center">

Made with ❤️ and ✋

**[⬆ Back to Top](#-free-claw-machine)**

</div>
