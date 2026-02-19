<template>
  <v-alert
    v-if="planStatus.show"
    :type="planStatus.type"
    prominent
    class="plan-alert"
    dismissible
  >
    {{ planStatus.message }}
    <template v-slot:append>
      <v-btn color="white" @click="goToPlans">Renew Plan</v-btn>
    </template>
  </v-alert>

  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="computedRail"
      permanent
      class="modern-sidebar"
      width="240"
      rail-width="72"
      elevation="0"
    >
      <!-- Header Section - Logo with Image -->
      <div class="sidebar-header" @click="toggleSidebarState">
        <v-img
          src="/images/accesseasylogo1.jpeg"
          alt="Logo"
          cover
          class="logo-image-full"
          style="width: 85%"
        />
      </div>

      <!-- Navigation Menu -->
      <div class="nav-content">
        <v-list class="nav-list" density="compact">
          <template
            v-for="(item, index) in filteredMenuItems"
            :key="item.title || item.header"
          >
            <!-- Header Item -->
            <v-list-subheader
              v-if="item.header && !computedRail"
              class="sidebar-group-header"
            >
              {{ item.header }}
            </v-list-subheader>
            <v-divider
              v-else-if="item.header && computedRail"
              class="my-2"
            ></v-divider>

            <!-- Simple Menu Item (No Sub Items) -->
            <v-list-item
              v-else-if="
                !item.header && (!item.subItems || item.subItems.length === 0)
              "
              :to="item.to"
              class="nav-item main-item"
              :class="{ active: $route.path === item.to }"
              @click="handleItemClick(item.to, item)"
              exact
            >
              <template v-slot:prepend>
                <v-tooltip
                  :disabled="!computedRail"
                  location="right"
                  open-delay="500"
                >
                  <template v-slot:activator="{ props }">
                    <div class="icon-wrapper">
                      <v-icon
                        class="nav-icon"
                        v-bind="props"
                        size="24"
                        @click.stop="
                          handleIconClick(item.to, item, null, index)
                        "
                      >
                        {{ item.icon }}
                      </v-icon>
                    </div>
                  </template>
                  <span> {{ item.title }}</span>
                </v-tooltip>
              </template>
              <v-list-item-title v-if="!computedRail" class="nav-title">
                {{ item.title }}
                <v-progress-circular
                  v-if="isLoading && loadingItemTitle === item.title"
                  indeterminate
                  size="20"
                  color="white"
                  class="ml-3"
                  style="vertical-align: middle"
                />
              </v-list-item-title>
            </v-list-item>

            <!-- Menu Item with Sub Items -->
            <div v-else-if="!item.header" class="menu-group">
              <v-list-item
                class="nav-item main-item expandable"
                :class="{
                  expanded: expandedMenus[item.title] && !computedRail,
                }"
                @click="handleMainMenuClick(item.title)"
              >
                <template v-slot:prepend>
                  <v-tooltip
                    :disabled="!computedRail"
                    location="right"
                    open-delay="500"
                  >
                    <template v-slot:activator="{ props }">
                      <div class="icon-wrapper">
                        <v-icon
                          class="nav-icon"
                          v-bind="props"
                          size="24"
                          @click.stop="handleIconClick(null, item, null, index)"
                        >
                          {{ item.icon }}
                        </v-icon>
                      </div>
                    </template>
                    <span>{{ item.title }}</span>
                  </v-tooltip>
                </template>
                <v-list-item-title v-if="!computedRail" class="nav-title">
                  {{ item.title }}
                </v-list-item-title>
                <template v-slot:append v-if="!computedRail">
                  <v-icon
                    class="expand-icon"
                    :class="{ rotated: expandedMenus[item.title] }"
                    size="16"
                  >
                    mdi-chevron-right
                  </v-icon>
                </template>
              </v-list-item>

              <!-- Sub Menu Items -->
              <v-expand-transition>
                <div
                  v-if="expandedMenus[item.title] && !computedRail"
                  class="sub-menu-section"
                >
                  <v-list-item
                    v-for="subItem in item.subItems"
                    :key="subItem.title"
                    :to="subItem.to"
                    class="nav-item sub-item"
                    :class="{ active: $route.path === subItem.to }"
                    @click="handleSubItemClick(subItem)"
                  >
                    <v-list-item-title class="sub-title">
                      {{ subItem.title }}
                    </v-list-item-title>
                  </v-list-item>
                </div>
              </v-expand-transition>
            </div>
          </template>
        </v-list>
      </div>
    </v-navigation-drawer>

    <!-- Rail Mode Submenu Overlay -->
    <v-card
      v-if="computedRail && railSubmenuOpen && currentRailSubmenu"
      class="rail-submenu-overlay"
      :style="railSubmenuStyle"
      elevation="24"
    >
      <v-list density="compact" class="rail-submenu-list">
        <v-list-subheader class="rail-submenu-header">
          {{ currentRailSubmenu.title }}
        </v-list-subheader>
        <v-list-item
          v-for="subItem in currentRailSubmenu.subItems"
          :key="subItem.title"
          class="rail-submenu-item"
          :class="{ active: $route.path === subItem.to }"
          @click="handleRailSubmenuClick(subItem)"
        >
          <v-list-item-title class="rail-submenu-title">
            {{ subItem.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-app-bar color="white" elevation="0" class="top-bar" height="64">
        <!-- Mobile Menu Button -->
        <v-btn
          v-if="isMobile"
          icon
          variant="text"
          @click="toggleSidebarState"
          class="mobile-menu-btn"
          size="small"
        >
          <v-icon size="20">mdi-menu</v-icon>
        </v-btn>

        <!-- Page Title -->
        <v-toolbar-title class="d-flex align-center">
          {{ getCurrentPageTitle }}
          
          <!-- Branch Filter (Only visible on Dashboard) -->
          <div v-if="getCurrentPageTitle === 'Dashboard'" class="ml-4 branch-filter-container">
             <select 
              v-model="selectedBranch" 
              class="layout-branch-select"
            >
              <option value="all">All Branches</option>
              <option 
                v-for="branch in branches" 
                :key="branch.id" 
                :value="branch.id"
              >
                {{ branch.locationName }}
              </option>
            </select>
          </div>
        </v-toolbar-title>

        <!-- Spacer -->
        <v-spacer />

        <!-- Profile Section -->
        <div class="header-profile">
          <v-avatar size="32" class="header-profile-avatar">
            <v-img
              v-if="profileImage"
              :src="profileImage"
              :loading="isLoadingImage"
              alt="Profile"
            />
            <v-icon v-else size="32" color="primary">mdi-account-circle</v-icon>
          </v-avatar>
          <v-menu v-model="profileMenu" offset-y>
            <template v-slot:activator="{ props }">
              <v-btn
                variant="text"
                size="small"
                v-bind="props"
                class="header-profile-btn"
              >
                <span class="header-profile-name">{{ userFullName }}</span>
                <v-icon size="16">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-card min-width="160" class="profile-menu">
              <v-list density="compact">
                <v-list-item
                  prepend-icon="mdi-account-outline"
                  title="Profile"
                  @click="$router.push('/profile')"
                />
                <v-divider />
                <v-list-item
                  prepend-icon="mdi-logout"
                  title="Logout"
                  @click="handleLogout"
                  class="logout-menu-item"
                />
              </v-list>
            </v-card>
          </v-menu>
        </div>

        <!-- Tenant Name Chip -->
        <v-chip
          class="tenant-chip"
          variant="outlined"
          size="small"
          prepend-icon="mdi-office-building"
        >
          {{ tenantName || "No organization" }}
        </v-chip>

        <!-- Role Name Chip -->
        <v-chip
          class="role-chip"
          variant="outlined"
          size="small"
          prepend-icon="mdi-account-check-outline"
        >
          {{ userRole || "Employee" }}
        </v-chip>
      </v-app-bar>

      <!-- Page Content -->
      <v-container fluid class="page-container">
        <PremiumOverlay v-if="isLocked" @upgrade="goToPlans" />
        <router-view v-else />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { authService } from "@/services/authService";
import PremiumOverlay from "@/components/common/upgrade/PremiumUpgrade.vue";

export default {
  name: "CompleteSidebar",
  components: {
    PremiumOverlay,
  },
  setup() {
    const router = useRouter();
    const drawer = ref(true);
    const rail = ref(false);
    const isMobile = ref(false);
    const profileMenu = ref(false);
    const profileImage = ref(null);
    const userFullName = ref("");
    const isLoadingImage = ref(false);
    const userRole = ref("");
    const userStatus = ref({ color: "grey", text: "Unknown" });
    const expandedMenus = ref({});
    const tenantName = ref("");
    const tenantplan = ref(null);
    const railSubmenuOpen = ref(false);
    const currentRailSubmenu = ref(null);
    const railSubmenuStyle = ref({});
    const isLoading = ref(false); // ADD THIS
    const loadingItemTitle = ref("");

    const startLoading = (itemTitle) => {
      isLoading.value = true;
      loadingItemTitle.value = itemTitle; // Set specific item
    };

    const stopLoading = () => {
      isLoading.value = false;
      loadingItemTitle.value = ""; // Clear
    };

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 960;
      if (isMobile.value) {
        rail.value = true;
      } else {
        rail.value = false;
      }
    };

    // Combined menu items (merged settingsMenuItems into menuItems)
    const menuItems = [
      {
        title: "Overview",
        icon: "mdi-format-list-checkbox",
        to: "/taskManagement/taskcomponents",
        roles: ["Admin"],
        subItems: [],
      },
      {
        header: "Management",
        roles: ["Admin", "Employee", "Manager", "esslAdmin"],
      },
      {
        title: "Employees",
        icon: "mdi-account-group-outline",
        to: "/employee-details/employee",
        roles: ["Admin", "Employee", "Manager", "esslAdmin"],
      },

      // {
      //   title: "Attendance Configuration",
      //   icon: "mdi-calendar-clock",
      //   roles: ["Admin", "Dealer", "Manager", "Employee"],
      //   to: "/settings/attendanceconfigtab",
      // },
      {
        title: "Attendance",
        icon: "mdi-calendar-clock-outline",
        roles: ["Admin", "Employee", "Manager"],
        subItems: [
          {
            title: "Live Attendance",
            icon: "mdi-calendar-today",
            to: "/attendanceDeatils/live",
            roles: ["Admin", "Manager"],
          },
          {
            title: "Daily Attendance",
            to: "/attendanceDeatils/daily",
            roles: ["Admin", "Employee"],
          },
          {
            title: "Monthly Attendance",
            to: "/attendanceDeatils/dashboard",
            roles: ["Admin", "Dealer", "Manager", "Employee"],
          },
          // {
          //   title: "Regularisation",
          //   icon: "mdi-calendar-check",
          //   to: "/regularisation",
          //   roles: ["Admin", "Employee", "Manager"],
          //   requiredFeature: "pro",
          // },
          {
            title: "All In-Outs",
            icon: "mdi-book-open-page-variant-outline",
            to: "/attendanceLog",
            roles: ["Admin", "Employee", "Manager", "Employee"],
          },
        ],
      },
      // {
      //  title: "Clients & Sites",
      //  icon: "mdi-office-building-outline",
      // to: "/organization/locationtab",
      // roles: ["Admin"],
      // },
      // {
      // title: "Routes",
      // icon: "mdi-file-table-box-outline",
      //to: "/locate",
      //roles: ["Admin", "Manager"],
      // },
      // {
      //  title: "Work Orders",
      // icon: "mdi-clipboard-text-outline",
      // to: "/taskManagement/taskcomponents/workorder",
      // roles: ["Admin", "Manager", "Employee"],
      // requiredFeature: "fieldpro",
      // },
      {
        title: "Access Control",
        icon: "mdi-shield-account-outline",
        roles: ["Admin", "Manager", "esslAdmin"],
        subItems: [
          {
            title: "Card Management",
            icon: "mdi-card-account-details-outline",
            to: "/card-management/cards",
            roles: ["Admin", "Manager", "esslAdmin"],
          },
          {
            title: "Face Embedding",
            icon: "mdi-face-recognition",
            to: "/face-embedding/ai-face-embedding",
            roles: ["Admin", "Manager", "Employee"],
          },
          {
            title: "Fingerprint Management",
            icon: "mdi-fingerprint",
            to: "/finger-data",
            roles: ["Admin", "Manager", "Employee"],
          },
          // QR Generate section
          {
            title: "QR Generate",
            icon: "mdi-qrcode",
            to: "/qr-generate/employee",
            roles: ["Admin", "Manager", "Employee"],
            subItems: [
              {
                title: "QR Generate",
                to: "/qr-generate/bulk",
                roles: ["Admin", "Manager"],
              },
              {
                title: "Employee QR Generate",
                to: "/qr-generate/employee",
                roles: ["Admin", "Manager", "Employee"],
              },
            ],
          },
        ],
      },
      // {
      //   title: "Expenses",
      //   icon: "mdi-cash",
      //   to: "/reimbursement/reimbursementtab/reimbursement_card",
      //   roles: ["Admin", "Employee", "Manager"],
      // },
      {
        title: " Requests",
        to: "/leave/leaveRequest",
        icon: "mdi-send",
        roles: ["Employee"],
      },
      {
        title: "Requests",
        to: "/leave/leavePermission",
        icon: "mdi-account-check",
        roles: ["Admin"],
      },
      { header: "Security AI", roles: ["Admin", "Manager", "esslAdmin"] },
      {
        title: "Monitoring",
        icon: "mdi-cctv",
        to: "/monitoring/live",
        roles: ["Admin", "Manager", "esslAdmin"],
      },
      {
        title: "Alerts",
        icon: "mdi-alert-circle-outline",
        to: "/monitoring/events",
        roles: ["Admin", "Manager", "esslAdmin"],
      },
      {
        header: "System",
        roles: ["Admin", "Dealer", "Manager", "Administrator"],
      },
      // {
      //   title: "Smart Forms",
      //   icon: "mdi-form-textbox",
      //   to: "/taskManagement/taskcomponents/workflow",
      //   roles: ["Admin"],
      // },
      // {
      //   title: "Payroll",
      //   icon: "mdi-cash-multiple",
      //   to: "/payroll",
      //   roles: ["Admin", "Dealer"],
      //   requiredFeature: "payrollpro",
      //   subItems: [
      //     {
      //       title: "Employee Salaries",
      //       to: "/payroll/employee-salary/salary-details",
      //       roles: ["Admin", "Dealer"],
      //     },
      //     {
      //       title: "Run Payroll",
      //       to: "/payroll/management",
      //       roles: ["Admin", "Dealer"],
      //     },
      //     {
      //       title: "Additional Pay",
      //       to: "/payroll/adhoc-payments",
      //       roles: ["Admin", "Dealer"],
      //     },
      //     {
      //       title: "Advance and Loans",
      //       to: "/payroll/advance-loans/advance",
      //       roles: ["Admin", "Dealer"],
      //     },

      //     {
      //       title: "Policies",
      //       to: "/payroll/policy",
      //       roles: ["Admin", "Dealer"],
      //     },
      //     {
      //       title: "TDS",
      //       to: "/payroll/tds",
      //       roles: ["Admin", "Dealer", "Employee"],
      //     },
      //   ],
      // },
      {
        title: "Configurators",
        icon: "mdi-domain",
        to: "/configuration",
        roles: ["Admin", "Dealer", "Manager"],
      },
      {
        title: "Reports",
        icon: "mdi-file-table-box-outline",
        to: "/reports",
        roles: ["Admin", "Manager"],
      },
      {
        title: "Uploads",
        icon: "mdi-file-table-box-outline",
        to: "/import",
        roles: ["Admin", "Manager"],
      },
      {
        title: "Organization Settings",
        icon: "mdi-domain",
        to: "/settings/organization",
        roles: ["Admin", "Administrator", "Dealer"],
      },

      // {
      //   title: "Role Configurator",
      //   icon: "mdi-shield-account",
      //   roles: ["Admin", "Administrator"],
      //   to: "/settings/roleConfigurator/roleconfig",
      // },
      // {
      //   title: "Subscription & Plans",
      //   icon: "mdi-credit-card-outline",
      //   to: "/settings/plans/plans",
      //   roles: ["Admin"],
      // },
    ];

    const filteredMenuItems = computed(() => {
      const role = userRole.value || "Employee";
      return menuItems
        .map((item) => {
          if (!item.roles.includes(role)) {
            return null;
          }
          if (item.subItems && item.subItems.length > 0) {
            const filteredSubItems = item.subItems.filter((subItem) =>
              subItem.roles.includes(role)
            );
            return {
              ...item,
              subItems: filteredSubItems,
            };
          }
          return item;
        })
        .filter(Boolean);
    });

    const computedRail = computed(() => rail.value);

    const availableFeatures = computed(() => {
      return tenantplan.value?.features?.map((f) => f.key.toLowerCase()) || [];
    });

    const currentRoute = computed(() => router.currentRoute.value.path);

    const requiresFeature = (path) => {
      const premiumRoutes = {
        fieldpro: [
          "/taskManagement/taskcomponents/workorder",
          "/taskManagement/taskcomponents/workflow",
        ],
        crm: ["/connectors/connector"],
        pro: ["/regularisation"],
        // payrollpro: [
        //   "/payroll",
        //   "/payroll/management",
        //   "/payroll/adhoc-payments",
        //   "/payroll/advance",
        //   "/payroll/loan",
        // ],
      };
      for (const [feature, paths] of Object.entries(premiumRoutes)) {
        if (paths.some((p) => path.startsWith(p))) {
          return feature;
        }
      }
      return null;
    };

    const daysLeft = computed(() => {
      if (!tenantplan.value || !tenantplan.value.end_date) return Infinity;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(tenantplan.value.end_date);
      end.setHours(0, 0, 0, 0);
      return Math.floor((end - today) / (1000 * 60 * 60 * 24));
    });

    const planStatus = computed(() => {
      const dl = daysLeft.value;
      if (dl === Infinity) return { show: false };
      if (dl < 0) {
        return {
          show: true,
          type: "error",
          message:
            "Your version is completed. Please buy the plan to continue the service.",
        };
      } else if (dl <= 3) {
        return {
          show: true,
          type: "warning",
          message: `Your plan is expiring in ${dl} day${dl > 1 ? "s" : ""} on ${tenantplan.value.end_date}. Please renew to continue the service.`,
        };
      }
      return { show: false };
    });

    const isLocked = computed(() => {
      if (daysLeft.value < 0) return true;
      if (!tenantplan.value?.features) return false;
      const req = requiresFeature(currentRoute.value);
      return req && !availableFeatures.value.includes(req);
    });

    const goToPlans = () => {
      router.push("/settings/plans/plans");
    };

    const handleIconClick = (route, item, action, index) => {
      if (computedRail.value) {
        if (action === "logout") {
          handleLogout();
        } else if (route) {
          router.push(route);
        } else if (item && item.subItems && item.subItems.length > 0) {
          showRailSubmenu(item, index);
        }
      }
    };

    const showRailSubmenu = (item, index) => {
      currentRailSubmenu.value = item;
      railSubmenuOpen.value = true;
      const itemHeight = 56;
      const headerHeight = 80;
      const topPosition = headerHeight + index * itemHeight + 8;
      railSubmenuStyle.value = {
        position: "fixed",
        left: "72px",
        top: `${topPosition}px`,
        zIndex: 9999,
        minWidth: "200px",
      };
    };

    const handleRailSubmenuClick = (subItem) => {
      if (subItem.to) {
        railSubmenuOpen.value = false;
        currentRailSubmenu.value = null;
        router.push(subItem.to);
      }
    };

    const closeRailSubmenu = () => {
      railSubmenuOpen.value = false;
      currentRailSubmenu.value = null;
    };

    const handleItemClick = async (route, item) => {
      if (!route) {
        closeRailSubmenu();
        return;
      }

      const currentPath = router.currentRoute.value.path;

      // Skip navigation if already on the route
      if (currentPath === route) {
        closeRailSubmenu();
        return;
      }

      startLoading(item.title);

      try {
        await router.push(route);
      } catch (error) {
        if (error.name !== "NavigationDuplicated") {
          console.error("Navigation error:", error);
        }
      } finally {
        setTimeout(() => {
          stopLoading();
        }, 1000);
      }

      closeRailSubmenu();
    };

    const handleSubItemClick = (subItem) => {
      if (subItem.to) {
        router.push(subItem.to);
      }
      closeRailSubmenu();
    };

    const handleMainMenuClick = (menuTitle) => {
      if (!computedRail.value) {
        const wasOpen = expandedMenus.value[menuTitle];
        expandedMenus.value = {};
        expandedMenus.value[menuTitle] = !wasOpen;
      }
    };

    const getCurrentPageTitle = computed(() => {
      const currentRoute = router.currentRoute.value;
      const path = currentRoute.path;

      const routeTitleMap = {
        "/taskManagement/taskcomponents": "Dashboard",
        "/settings/organization": "Organization Settings",
        "/settings/attendancepolicy": "Attendance Policy",
        "/settings/payrollCatagory": "Payroll Category",
        "/settings/configuration": "Configuration",
        "/settings/holidays": "Holidays",
        "/settings/shifts": "Shifts",
        "/configuration/teams": "Configurators",
        "/configuration/designations": "Configurators",
        "/settings/leave-types": "Leave Types",
        "/settings/plans/plans": "Subscription & Plans",
        "/taskManagement/taskcomponents/workOrder": "Work Orders",
        "/taskManagement/taskcomponents/workflow": "Workflow",
        "/taskManagement/Map/livetracking": "Live Tracking",
        "/taskManagement/productviews": "Assets",
        "/taskManagement/productviews/deviceManagementScreen": "Asset Types",
        "/organization/orgmainui": "Clients and Sites",
        "/organization/org_location": "Locations",
        "/employee-details/employee": "Employee Details",
        "/employee-details/leave": "Employee Details",
        "/employee-details/otherDetails": "Employee Details",
        "/employee-details/attendance": "Employee Details",
        "/leave": "Leave Management",
        "/taskManagement/kpi": "KPI View",
        "/reimbursement/reimbursementtab/reimbursement_card": "Expense",
        "/reimbursement/reimbursementtab/addreimbursement": "Expense",
        "/taskManagement-overviewtab/livetracking": "Live Tracking",
        "/attendanceDeatils/live": "Live Attendance",
        "/attendanceLog/attendance": "Logs",
        "/attendanceDeatils/daily": "Daily Attendance",
        "/attendanceDeatils/dashboard": "Monthly Dashboard",
        "/attendanceDeatils/roster": "Company Roster",
        "/reimbursement/reimbursement_card": "Expenses",
        "/import/importDetails": "Uploads",
        "/connectors/connector": "Connectors",
        "/attendanceLog/general": "Attendance Logs",
        "/profile": "Profile",
        "/reports/workordergenerate": "Reports",
        "/qr-generate": "QR Generate",
        "/qr-generate/bulk": "QR Generate",
        "/qr-generate/employee": "Employee QR Generate",
        "/monitoring/events": "Event Monitoring",
        "/monitoring/live": "Live Camera Feed",
      };

      if (routeTitleMap[path]) {
        return routeTitleMap[path];
      }

      if (path.startsWith("/taskManagement/")) {
        return "Work Orders";
      }
      if (path.startsWith("/organization/")) {
        return "Organization";
      }
      if (path.startsWith("/employee-details/")) {
        return "Users Details";
      }

      if (path.includes("/payroll/employee-salary/salary-details")) {
        return "Salary Details";
      }
      if (path.includes("/payroll/employee-salary/bank-details")) {
        return "Bank Details";
      }
      if (path.includes("/configuration/configuration")) {
        return "Configurators";
      }
      if (path.includes("/configuration/departement-configuration")) {
        return "Configurators";
      }
      if (path.includes("/configuration/shifts")) {
        return "Configurators";
      }
      if (path.includes("/configuration/attendanceCycle")) {
        return "Configurators";
      }
      if (path.includes("/configuration/leave-types")) {
        return "Configurators";
      }
      if (path.includes("/configuration/holidays")) {
        return "Configurators";
      }
      if (path.includes("/configuration/reimbursement_settings")) {
        return "Configurators";
      }
      if (path.includes("/configuration/payroll-policy")) {
        return "Configurators";
      }
      if (path.includes("/configuration/penalty-policy")) {
        return "Configurators";
      }
      if (path.includes("/leave/tab/leavePermission")) {
        return "Request";
      }
      if (path.includes("/reports/attendance")) {
        return "Attendance Report";
      }
      if (path.includes("/reports/companyReport")) {
        return "Payroll Report";
      }
      // if (path.includes("/payroll/policy/penalty-policy")) {
      //   return "Penality Policies";
      // }
      if (path.includes("/payroll/advance-loans/advance")) {
        return "Advance";
      }
      if (path.includes("/payroll/advance-Loans/Loan")) {
        return "Loan";
      }
      if (path.includes("/payroll/attendance-verification")) {
        return "Run Payroll";
      }
      if (path.includes("/payroll/salary-verification")) {
        return "Run Payroll";
      }
      if (path.includes("/payroll/review")) {
        return "Run Payroll";
      }
      if (path.startsWith("/attendanceDeatils/")) {
        return "Attendance";
      }
      if (path.startsWith("/reimbursement/")) {
        return "Reimbursement";
      }

      const findTitleInMenuItems = (items) => {
        for (const item of items) {
          if (item.to === path) {
            return item.title;
          }
          if (item.subItems) {
            const subTitle = findTitleInMenuItems(item.subItems);
            if (subTitle) return subTitle;
          }
        }
        return null;
      };

      const menuTitle = findTitleInMenuItems(menuItems);
      return menuTitle || "Dashboard";
    });

    const toggleSidebarState = () => {
      if (isMobile.value) {
        drawer.value = !drawer.value;
      } else {
        rail.value = !rail.value;
        closeRailSubmenu();
      }
      if (!rail.value) {
        drawer.value = true;
      }
    };

    const goToDashboard = () => {
      router.push("/taskManagement/taskcomponents");
    };

    const fetchUserProfile = async () => {
      try {
        const api = axios.create({
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
        });

        const token = localStorage.getItem("userToken");

        if (!token) {
          throw new Error("No user token found");
        }

        const response = await api.get("/users/me", {
          params: {
            fields: [
              "first_name",
              "last_name",
              "avatar.id",
              "role.name",
              "tenant.tenantName",
              "tenant.plan",
            ],
          },
        });

        if (response.data?.data) {
          console.log("response", response.data);
          const userData = response.data.data;
          userFullName.value = `${userData.first_name} ${
            userData.last_name || ""
          }`;
          userRole.value = userData.role?.name || "";
          userStatus.value = getUserStatus("unknown");
          tenantName.value =
            userData.tenant?.tenantName || "No organization assigned";
          tenantplan.value = userData.tenant?.plan || null;

          if (userData.avatar?.id) {
            await fetchAuthorizedImage(
              `${import.meta.env.VITE_API_URL}/assets/${userData.avatar.id}`
            );
          }
        } else {
          userFullName.value = "Guest";
          userRole.value = "Employee";
          userStatus.value = getUserStatus("unknown");
          tenantplan.value = null;
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        userFullName.value = "Guest";
        userRole.value = "Employee";
        userStatus.value = getUserStatus("unknown");
        tenantplan.value = null;
      }
    };

    const fetchAuthorizedImage = async (imageUrl) => {
      isLoadingImage.value = true;
      try {
        const response = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load image");
        const blob = await response.blob();
        profileImage.value = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error loading profile image:", error);
        profileImage.value = null;
      } finally {
        isLoadingImage.value = false;
      }
    };

    const getUserStatus = (status) => {
      switch (status) {
        case "active":
          return { color: "success", text: "Active" };
        case "inactive":
          return { color: "error", text: "Inactive" };
        default:
          return { color: "grey", text: "Unknown" };
      }
    };

    const handleLogout = () => {
      authService.logout();
      router.push("/login");
    };

    onMounted(() => {
      fetchUserProfile();
      checkMobile();
      window.addEventListener("resize", checkMobile);
      document.addEventListener("click", (e) => {
        if (
          railSubmenuOpen.value &&
          !e.target.closest(".rail-submenu-overlay") &&
          !e.target.closest(".nav-item")
        ) {
          closeRailSubmenu();
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener("resize", checkMobile);
    });

    watch(
      () => router.currentRoute.value,
      () => {
        if (isMobile.value) {
          rail.value = true;
        } else {
          rail.value = false;
        }
        closeRailSubmenu();
      },
      { immediate: true }
    );

    return {
      loadingItemTitle,
      isLoading,
      drawer,
      rail,
      isMobile,
      profileMenu,
      profileImage,
      userFullName,
      isLoadingImage,
      userStatus,
      filteredMenuItems,
      getCurrentPageTitle,
      handleLogout,
      expandedMenus,
      toggleSidebarState,
      goToDashboard,
      tenantName,
      handleSubItemClick,
      handleIconClick,
      handleItemClick,
      computedRail,
      railSubmenuOpen,
      currentRailSubmenu,
      railSubmenuStyle,
      handleRailSubmenuClick,
      closeRailSubmenu,
      handleMainMenuClick,
      isLocked,
      goToPlans,
      planStatus,
      userRole,
    };
  },
};
</script>

<style scoped>
.modern-sidebar {
  border-right: 1px solid #e5e7eb !important;
  background: white !important;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
}

.modern-sidebar :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  background: white;
  border-bottom: 1px solid #35486d;
  height: 65px;
}

.header-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0;
  border-radius: 8px;
  background: white;
  color: white;
  transition: background-color 0.2s;
  justify-content: flex-start;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-container {
  width: 240px;
  height: 100px;
  background: rgb(255, 255, 255);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  border-radius: 4px;
}

/* Navigation Content */
.nav-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.nav-list {
  padding: 0;
}

.modern-sidebar :deep(.v-list-item) {
  margin: 3px 0 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  position: relative !important;
  min-height: 48px !important;
  padding: 0 12px !important;
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.modern-sidebar.v-navigation-drawer--rail .icon-wrapper {
  margin-right: 0;
  width: 100%;
  justify-content: center;
  padding: 8px;
}

.modern-sidebar.v-navigation-drawer--rail .icon-wrapper:hover {
  background-color: rgb(244, 84, 84);
}

.modern-sidebar.v-navigation-drawer--rail :deep(.v-list-item) {
  justify-content: center !important;
  padding: 8px !important;
  min-height: 56px !important;
}

.modern-sidebar.v-navigation-drawer--rail :deep(.v-list-item__prepend) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin: 0 !important;
}

.modern-sidebar :deep(.main-item) {
  font-weight: 500 !important;
  color: #1e3fa9 !important;
}

/* Active State Styling - ADDED */
.modern-sidebar :deep(.main-item.active) {
  background-color: rgb(244, 84, 84) !important;
  color: #ffffff !important;
}

.modern-sidebar :deep(.main-item.active .nav-icon) {
  color: #fff !important;
}

.modern-sidebar :deep(.main-item:hover) {
  background-color: rgb(244, 84, 84) !important;
  color: #ffffff !important;
}

.modern-sidebar :deep(.nav-icon) {
  color: #1e3fa9;
  transition: all 0.2s ease !important;
}

.modern-sidebar :deep(.main-item:hover .nav-icon) {
  color: #ffffff !important;
}

.modern-sidebar :deep(.nav-title) {
  font-size: 14px !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  font-weight: 500 !important;
}

.sub-menu-section {
  margin-left: 32px !important;
  border-left: 1px solid #e5e7eb !important;
  padding-left: 12px !important;
  margin-top: 4px !important;
  margin-bottom: 4px !important;
}

.modern-sidebar :deep(.sub-item) {
  min-height: 40px !important;
  font-weight: 400 !important;
  color: #1e3fa9 !important;
  margin: 1px 0 !important;
  padding-left: 8px !important;
}

/* Active State Styling for Sub Items - ADDED */
.modern-sidebar :deep(.sub-item.active) {
  background-color: rgb(244, 84, 84) !important;
  color: #ffffff !important;
}

.modern-sidebar :deep(.sub-item:hover) {
  background-color: rgb(244, 84, 84) !important;
  color: #ffffff !important;
}

.modern-sidebar :deep(.sub-title) {
  font-size: 13px !important;
  font-weight: 400 !important;
}

.modern-sidebar :deep(.expandable) {
  cursor: pointer !important;
}

.modern-sidebar :deep(.expand-icon) {
  color: #1e3fa9 !important;
  font-weight: bold !important;
  transform: scale(1.1);
  text-shadow:
    0 0 1px #1e3fa9,
    0 0 1px #1e3fa9;
  transition: transform 0.2s ease !important;
}

.modern-sidebar :deep(.expand-icon.rotated) {
  transform: rotate(90deg) !important;
}

.rail-submenu-overlay {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  z-index: 9999 !important;
  min-width: 200px;
}

.rail-submenu-list {
  padding: 8px 0;
}

.rail-submenu-header {
  font-size: 12px;
  font-weight: 600;
  color: rgb(3, 25, 59);
  padding: 8px 16px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rail-submenu-item {
  margin: 1px 8px;
  border-radius: 6px;
  min-height: 36px;
  color: #6b7280;
  cursor: pointer;
}

/* Active State Styling for Rail Submenu - ADDED */
.rail-submenu-item.active {
  background-color: rgb(244, 84, 84) !important;
  color: white !important;
}

.rail-submenu-item:hover {
  background-color: rgb(244, 84, 84);
  color: white;
}

.rail-submenu-title {
  font-size: 13px;
  font-weight: 400;
}

.main-content {
  background-color: #f9fafb;
}

.top-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb !important;
  background-color: white !important;
  color: #000 !important;
}

.mobile-menu-btn {
  margin-right: 12px;
}

.page-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #111827 !important;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Header Profile Styles */
.header-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.header-profile-avatar {
  flex-shrink: 0;
  border: 2px solid #c6e4dc;
}

.header-profile-btn {
  text-transform: none !important;
  color: #000 !important;
  padding: 0 8px !important;
  font-weight: bold;
}

.header-profile-name {
  font-size: 14px;
  font-weight: bold;
  color: #000;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tenant-chip {
  font-size: 12px !important;
  height: 32px !important;
  border-color: #e5e7eb !important;
  margin-right: 8px !important;
  font-weight: bold;
}

.role-chip {
  font-size: 12px !important;
  height: 32px !important;
  border-color: #e5e7eb !important;
  margin-right: 8px !important;
  font-weight: bold;
}

.status-chip {
  font-size: 11px !important;
  height: 20px !important;
}

.page-container {
  height: calc(100vh - 64px);
  overflow: hidden;
}

@media (max-width: 960px) {
  .page-title {
    font-size: 16px !important;
    max-width: 100px;
  }
  .page-container {
    padding: 16px !important;
  }
  .header-profile-name {
    max-width: 80px;
  }
}

.nav-content::-webkit-scrollbar {
  width: 4px;
}

.nav-content::-webkit-scrollbar-track {
  background: transparent;
}

.nav-content::-webkit-scrollbar-thumb {
  background: rgb(255, 164, 164);
  border-radius: 2px;
}

.nav-content::-webkit-scrollbar-thumb:hover {
  background: rgb(244, 84, 84);
}

:deep(.v-tooltip .v-overlay__content) {
  background-color: rgba(250, 250, 250, 0.9) !important;
  color: white !important;
  padding: 6px 8px !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

.profile-menu {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #77c3ab !important;
  background-color: #c6e4dc;
}

.logout-menu-item {
  color: #dc2626 !important;
}
.v-toolbar-title {
  font-weight: bold;
}

.sidebar-group-header {
  font-size: 12px !important;
  font-weight: 700 !important;
  color: #1e3fa9 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  padding: 16px 16px 8px 16px !important;
  height: auto !important;
  min-height: unset !important;
}
</style>
