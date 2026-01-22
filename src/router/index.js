import { createRouter, createWebHashHistory } from 'vue-router'
import { getFirebaseAuth } from '../firebase'
import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth) {
        const auth = getFirebaseAuth()

        // Wait for auth state to initialize
        await new Promise(resolve => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe()
                resolve(user)
            })
        })

        const currentUser = auth.currentUser
        if (!currentUser) {
            next('/login')
        } else {
            next()
        }
    } else {
        next() // Make sure to always call next()!
    }
})

export default router
