import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './i18n';

const router = createRouter({
  routeTree,
  basepath: '/',
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
});

// Type-safe module augmentation for the router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
