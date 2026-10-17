import { createBrowserRouter } from 'react-router'
import { HomePage } from './pages/HomePage'
import { MixedPracticePage } from './pages/MixedPracticePage'
import { NodePage } from './pages/NodePage'
import { RouteError } from './pages/RouteError'
import { Root } from './Root'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Root />,
      errorElement: <RouteError />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'practice', element: <MixedPracticePage /> },
        // Any depth of the content tree, plus redirects for moved paths and the not-found page.
        { path: '*', element: <NodePage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)
