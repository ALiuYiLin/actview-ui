import { createApp } from "actview"

import "./index.css"
import { App } from "./App"

// actview 入口：createApp + mount（复刻官方 demo main.tsx）
createApp(App).mount("#app")
