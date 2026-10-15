import { createBrowserRouter } from 'react-router'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { VizPage } from './pages/VizPage'
import { Root } from './Root'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ':section/:slug', element: <VizPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
