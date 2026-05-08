import { createRouter, createWebHistory } from "vue-router";
import WeddingPlanner from "@/pages/WeddingPlanner.vue";
import SavingsPage from "@/pages/SavingsPage.vue";

const routes = [
  { path: "/", component: WeddingPlanner },
  { path: "/savings", component: SavingsPage }
];

export default createRouter({
  history: createWebHistory(),
  routes
});