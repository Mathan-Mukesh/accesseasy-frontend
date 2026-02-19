<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Tabs: show only when not on Add/Edit -->
        <v-tabs
          v-if="!isFormRoute"
          v-model="activeTab"
          show-arrows
          background-color="transparent"
          @update:modelValue="handleTabChange"
          class="custom-tabs"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="custom-tab"
          >
            <v-icon :icon="tab.icon" class="mr-2"></v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <!-- Tab Content (always rendered) -->
        <v-card
          :class="[
            'tab-content-wrapper',
            { 'full-width-no-tabs': isFormRoute },
          ]"
          elevation="0"
        >
          <router-view></router-view>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";

const router = useRouter();
const route = useRoute();

const userRole = ref("");
const tabs = ref([]);
const activeTab = ref("employee");

// names of routes that should hide tabs
const FORM_ROUTE_NAMES = ["AddEmployeeForm", "EmployeeForm"];

// computed boolean: true when current route is a form (add/edit)
const isFormRoute = computed(() => {
  // route.name may be undefined briefly — coerce to string
  const rname = String(route.name || "");
  return FORM_ROUTE_NAMES.includes(rname);
});

// (optional) debug: uncomment to see the route names in console when navigating
// watch(() => route.name, (n) => console.log('route.name =>', n));

const handleTabChange = (newValue) => {
  router.push(`/employee-details/${newValue}`);
};

const updateActiveTabFromRoute = () => {
  const currentPath = route.path;
  const pathSegments = currentPath.split("/");
  const tabValue = pathSegments[pathSegments.length - 1];
  const currentTab = tabs.value.find((tab) => tab.value === tabValue);
  activeTab.value = currentTab ? currentTab.value : "employee";
};

const fetchrole = async () => {
  const userData = await currentUserTenant.fetchLoginUserDetails();
  userRole.value = userData.role.name;

  tabs.value = [
    { value: "employee", title: "All Employees", icon: "mdi-account-details" },
    { value: "leave", title: "Leave Balance", icon: "mdi-calendar-check" },
    {
      value: "attendance",
      title: "Shift Details",
      icon: "mdi-calendar-clock",
    },
    {
      value: "card",
      title: "Card Management",
      icon: "mdi-card-account-details",
    },
    // {
    //   value: "otherDetails",
    //   title: "Employee Other Details",
    //   icon: "mdi-card-account-details-outline",
    // },
  ];
};

watch(
  () => route.path,
  () => {
    updateActiveTabFromRoute();
  }
);

onMounted(async () => {
  await fetchrole();
  updateActiveTabFromRoute();
});
</script>

<style scoped>
/* tab design */

.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}
.full-width-no-tabs {
  padding-top: 8px; /* reduce space reserved for tabs if needed */
}
.custom-tabs {
  background-color: transparent; /* Changed from white to transparent for a cleaner look */
  padding: 8px 0 8px; /* Adjusted padding */
  border-bottom: none;
}

.custom-tab {
  border-radius: 8px; /* Rounded all corners for pill shape */
  background-color: #fff; /* White background for inactive */
  color: #64748b !important; /* Softer text color */
  border: 1px solid #e2e8f0; /* Subtle border */
  margin-right: 12px;
  min-height: 36px; /* Reduced height */
  height: 36px;
  transition: all 0.2s ease;
  text-transform: capitalize;
  font-weight: 600;
  font-size: 13px; /* Reduced font size */
  letter-spacing: 0.3px;
}

/* Active tab style */
.v-tab--selected.custom-tab {
  background-color: #122f68 !important; /* Dark blue for active state (more premium than bright red) */
  color: #ffffff !important;
  border-color: #122f68;
  box-shadow: 0 4px 12px rgba(18, 47, 104, 0.15);
  transform: translateY(-1px);
}

/* Icon styles */
.custom-tab .v-icon {
  color: #64748b !important;
  font-size: 18px; /* Smaller icons */
  opacity: 1;
}
.v-tab--selected .v-icon {
  color: #ffffff !important;
}

/* Content below tabs */
.tab-content-wrapper {
  border-radius: 12px;
  background: white;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* Subtle shadow */
  border: 1px solid #f1f5f9;
}

::v-deep(.v-tab.v-btn) {
  height: 36px !important; /* Force height */
  border-radius: 8px !important;
  min-width: auto !important; /* Allow smaller width */
  padding: 0 16px; /* Comfortable padding */
}
</style>
