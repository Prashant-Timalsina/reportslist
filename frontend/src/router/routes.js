const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ReportPage.vue') },
      {
        path: 'report/:id',
        name: 'report-details',
        component: () => import('pages/ReportDetailsPage.vue'),
      },
      { path: '/login', name: 'login', component: () => import('pages/LoginSignup.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
