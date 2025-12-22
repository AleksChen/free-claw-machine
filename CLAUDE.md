# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览
基于MediaPipe手部追踪的3D抓娃娃机游戏，使用Three.js渲染和Cannon.js物理引擎。

## 快速开始命令

### 开发环境
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器（端口5173）
npm run build        # 生产环境构建
npm run preview      # 预览构建结果
```

### 项目结构关键路径
- `src/main.js` - 应用入口，初始化所有系统
- `src/game/GameController.js` - 游戏逻辑控制中心
- `src/vision/HandTracker.js` - MediaPipe手部追踪
- `src/scenes/GameScene.js` - Three.js 3D场景管理
- `src/physics/PhysicsWorld.js` - Cannon.js物理引擎封装

## 核心系统架构

### 1. 手势识别系统
- **HandTracker**: 管理MediaPipe Hands模型，处理摄像头输入
- **CoordinateMapper**: 将2D手势坐标映射到3D游戏空间
- 手势控制逻辑：左手控制位置，右手握拳触发抓取

### 2. 3D渲染系统
- **GameScene**: Three.js场景管理，包含相机、灯光、模型
- **ClawMachine**: 3D爪子机模型和动画
- **Prize**: 可抓取奖品模型管理

### 3. 物理引擎集成
- **PhysicsWorld**: Cannon.js物理世界封装
- **ClawPhysics**: 爪子物理行为（移动、抓取、碰撞）
- 奖品物理模拟（重力、碰撞、堆叠）

### 4. UI管理系统
- **UIManager**: 原生JS实现的UI控制（无React等框架）
- 实时FPS显示、游戏状态提示

## 关键依赖
- **Three.js r128**: 3D渲染引擎
- **Cannon.js**: 物理引擎（使用cannon-es版本）
- **MediaPipe Hands**: 谷歌手部追踪模型
- **Vite**: 现代构建工具

## 开发注意事项

### MediaPipe集成
- MediaPipe文件通过`vite-plugin-static-copy`自动复制到`public/mediapipe/`
- 首次运行需要下载模型文件，耐心等待加载完成
- 需要摄像头权限，建议使用HTTPS或localhost

### 3D坐标映射
手势坐标从2D摄像头空间映射到3D游戏空间需要特殊处理：
- 使用视锥体投影计算
- 考虑深度信息的近似估计
- 坐标系转换：MediaPipe的右手坐标系 → Three.js的右手坐标系

### 物理调试
- 开启`debugRenderer`可视化物理边界
- 调整重力、质量、摩擦力参数影响游戏手感
- 奖品密度和爪子抓取力的平衡是关键

## 性能优化点
- 使用`requestAnimationFrame`控制渲染循环
- FPS计数器监控性能
- 物理计算频率与渲染频率分离
- 模型LOD（细节层次）优化适用于低端设备