import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import Admin from './Admin.jsx'; // Adminをインポート
import './index.css'

// ページのURLを設定
const router = createBrowserRouter([
  {
    path: "/", // トップページ (投票画面)
    element: <App />,
  },
  {
    path: "/admin", // 管理者ページ
    element: <Admin />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)