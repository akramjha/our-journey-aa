import { createRouter, createWebHistory } from "vue-router";

import WeddingPlanner from "@/pages/WeddingPlanner.vue";
import SavingsPage from "@/pages/SavingsPage.vue";
import TunangPlannerPage from "@/pages/TunangPlannerPage.vue";
import ChecklistPage from "@/pages/ChecklistPage.vue";
import NikahPage from "@/pages/NikahPage.vue";
import WeddingEventPage from "@/pages/WeddingEventPage.vue";
import CoupleSettings from "@/views/CoupleSettings.vue";

const routes = [
  {
    path: "/",
    component: WeddingPlanner,
  },
  {
    path: "/savings",
    component: SavingsPage,
  },
  {
    path: "/tunang",
    component: TunangPlannerPage,
  },
  {
  path: "/checklist",
  component: ChecklistPage,
},
{
  path: "/nikah",
  component: NikahPage
},
{
  path: "/wedding",
  component: WeddingEventPage,
},
{
  path: "/settings",
  component: CoupleSettings
},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;