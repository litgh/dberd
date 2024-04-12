import { createRouter, createWebHashHistory } from "vue-router";

const routers = [{
    path: "/",
    name: "Home",
    component: () => import("@/pages/LandingPage.vue"),
}, {
    path: "/workspace",
    name: "Workspace",
    component: () => import("@/pages/Workspace.vue")
}];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routers,
});

export default router;