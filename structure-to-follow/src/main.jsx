import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from "@heroui/react"
import { UserDataProvider } from './context/UserDataContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserDataProvider>
      <HeroUIProvider>
        {/* <main className="text-foreground bg-background"> NOTE DON'T DELETE */}
          <App />
        {/* </main> */}
      </HeroUIProvider>
    </UserDataProvider>
  </React.StrictMode>,
)
