import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home'  // 改為重定向到主頁
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/RegisterView.vue')
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('../views/HomeView.vue'),
        meta: {requiresAuth: true}  // 需要驗證的路由
    },
    {
        path: '/vocab-list',
        name: 'VocabList',
        component: () => import('../views/VocabListView.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/study',
        name: 'Study',
        component: () => import('../views/StudyView.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPassword.vue')
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/ResetPassword.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 添加路由守衛來處理身份驗證
router.beforeEach((to, _from, next) => {
    const isAuthenticated = localStorage.getItem('token') // 檢查是否有登入令牌

    if (to.meta.requiresAuth && !isAuthenticated) {
        // 如果頁面需要驗證但使用者未登入，重定向到登入頁面
        next({name: 'Login'})
    } else {
        next()
    }
})

export default router