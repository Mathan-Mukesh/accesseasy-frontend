<template>
  <ToastNotification
    :show="showToast"
    :message="toastMessage"
    :type="toastType"
    @close="showToast = false"
  />
  <div class="employee-container">
    <div
      class="filter-panel"
      v-if="showFilters && isAdmin && !showForm && tenantId"
    >
      <div class="filter-content">
        <FilterComponent
          :tenantId="tenantId"
          :initialFilters="initialFilters"
          :initiallyVisible="true"
          :filter-schema="pageFilters"
          @apply-filters="handleApplyFilters"
          @filter-visibility-changed="onFilterVisibilityChanged"
        />
      </div>
    </div>

    <div
      class="main-content"
      :class="{ 'full-width': !showFilters || showForm }"
    >
      <DataTableWrapper
        v-if="!showForm"
        :searchQuery="search"
        @update:searchQuery="handleSearchUpdate"
        :showSearch="true"
        :hasError="!!error"
        wrapperClass="employee-table-wrapper"
      >
        <template #before-search>
          <button
            v-if="isAdmin"
            class="filter-toggle-static"
            @click="toggleFilters"
            :class="{ active: hasActiveFilters }"
            :title="showFilters ? 'Hide filters' : 'Show filters'"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            <div v-if="hasActiveFilters" class="filter-indicator"></div>
          </button>
        </template>

        <!-- Toolbar Actions Slot -->
        <template #toolbar-actions>
          <div class="header-actions">
            <BaseButton
              v-if="isAdmin && selectedEmployees.length > 0"
              variant="danger"
              size="md"
              :text="`Delete (${selectedEmployees.length})`"
              :leftIcon="Trash"
              @click="showDeleteConfirmation"
            />
            <BaseButton
              v-if="isAdmin"
              variant="primary"
              size="md"
              text="Create Employee"
              :leftIcon="Plus"
              @click="handleCreateEmployee"
            />
            <BaseButton
              v-if="isAdmin"
              variant="secondary"
              size="md"
              text="Import"
              :leftIcon="Upload"
              @click="handleImport"
            />
            <v-menu v-if="isAdmin">
              <template v-slot:activator="{ props }">
                <BaseButton
                  variant="secondary"
                  size="md"
                  text="Export"
                  :leftIcon="Download"
                  v-bind="props"
                />
              </template>
              <v-list>
                <v-list-item @click="showExportDialog('excel')">
                  <v-list-item-title>Export to Excel</v-list-item-title>
                </v-list-item>
                <v-list-item @click="showExportDialog('csv')">
                  <v-list-item-title>Export to CSV</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <!-- Table Content -->
        <template #default>
          <SkeletonLoading
            v-if="loading"
            variant="data-table"
            :rows="6"
            :columns="columns.length"
            :animated="true"
          />
          <ErrorState
            v-else-if="error"
            :title="'Unable to load employees'"
            :message="error"
            :retry-action="{ text: 'Try Again', icon: RefreshCw }"
            @retry="fetchEmployeeData"
          />
          <DataTable
            v-else
            :items="items"
            :columns="columns"
            :selected-items="selectedEmployees"
            :sort-by="sortBy"
            :sort-direction="sortDirection"
            :show-selection="isAdmin"
            :row-clickable="isAdmin"
            @update:selected-items="selectedEmployees = $event"
            @row-click="handleRowClick"
            @sort="handleSort"
          >
            <!-- Custom Cell Content -->
            <template #cell-profile="{ item }">
              <div class="profile-avatar">
                <img
                  v-if="item.avatarImage"
                  :src="item.avatarImage"
                  :alt="item.assignedUser?.first_name"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </template>
            <template #cell-employeeId="{ item }">
              <span class="employee-id">{{ item.employeeId || "N/A" }}</span>
            </template>
            <template #cell-name="{ item }">
              <span class="employee-name">{{
                item.assignedUser?.first_name || "Unknown"
              }}</span>
            </template>
            <template #cell-locationName="{ item }">
              <span class="location-name">{{ item.locationName || "-" }}</span>
            </template>
            <template #cell-department="{ item }">
              <span class="department-name">{{
                item.department?.departmentName || "No department"
              }}</span>
            </template>
            <!-- <template #cell-orgType="{ item }">
              <span
                class="org-type-badge"
                :class="
                  getOrgTypeClass(item.assignedUser?.organization?.orgType)
                "
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
                {{ formatOrgType(item.assignedUser?.organization?.orgType) }}
              </span>
            </template> -->
            <template #cell-orgName="{ item }">
              <span class="org-name">{{
                item.assignedUser?.organization?.orgName || "No organization"
              }}</span>
            </template>
            <template #cell-role="{ item }">
              <span class="role-badge">{{
                item.assignedUser?.role?.name || "No role"
              }}</span>
            </template>
            <template #cell-contact="{ item }">
              <div class="contact-info">
                <div class="phone-info">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    />
                  </svg>
                  <span>{{ item.assignedUser?.phone || "No phone" }}</span>
                </div>
              </div>
            </template>
            <template #cell-email="{ item }">
              <span class="employee-email">{{
                item.assignedUser?.email || "No email"
              }}</span>
            </template>
            <template #cell-approverName="{ item }">
              <span class="approver-name">{{ item.approverName || "-" }}</span>
            </template>
          </DataTable>
        </template>

        <!-- Pagination Slot -->
        <template #pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>

      <!-- Delete Confirmation Modal -->
      <DeleteConfirmationModal
        :show="showDeleteModal"
        title="Delete Employees"
        :confirmMessage="`Are you sure you want to delete ${selectedEmployees.length} selected employees?`"
        description="This action cannot be undone. All selected employee records will be permanently removed."
        itemLabel="Selected Employees"
        :itemName="`${selectedEmployees.length} employees`"
        cancelText="Cancel"
        confirmText="Delete"
        deletingText="Deleting..."
        :deleting="deleting"
        @close="showDeleteModal = false"
        @confirm="confirmDelete"
      />

      <!-- Entry Type Selection Dialog -->
      <div
        v-if="isAdmin && showDialog"
        class="dialog-overlay"
        @click="showDialog = false"
      >
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <h3>Choose Entry Type</h3>
            <button class="dialog-close" @click="showDialog = false">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="dialog-body">
            <div class="entry-options">
              <div
                class="entry-option"
                @click="handleEntryTypeSelection('manual')"
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M8 6h8" />
                  <path d="M8 10h8" />
                  <path d="M8 14h5" />
                </svg>
                <h4>Manual Entry</h4>
                <p>Enter details manually</p>
              </div>
              <div
                class="entry-option"
                @click="handleEntryTypeSelection('aadhar')"
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <h4>Aadhar Based</h4>
                <p>Auto-fill using Aadhar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Import/Export Dialogs -->
      <v-dialog v-if="isAdmin" v-model="importDialogVisible" max-width="800px">
        <ImportEmployees @close="importDialogVisible = false" />
      </v-dialog>

      <v-dialog v-if="isAdmin" v-model="exportDialogVisible" max-width="800px">
        <ExportEmployees
          @close="exportDialogVisible = false"
          :filters="filters"
          :search="search"
          :sort-by="sortBy"
          :selected-ids="selectedEmployees.map((id) => id)"
          :export-format="currentExportFormat"
        />
      </v-dialog>

      <router-view
        v-if="isAdmin && showForm"
        :key="$route.fullPath"
        :is-editing="isEditing"
        :employee-data="editedItem"
        :tenant-id="tenantId"
        :first-name="editedItem.assignedUser?.first_name"
        @save-success="handleSaveSuccess"
        @cancel="handleCancel"
      />

      <!-- Toast Notification -->
      <ToastNotification
        :show="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />
    </div>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { computed, onMounted, reactive, ref, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DeleteConfirmationModal from "@/components/common/modals/ConfirmDeleteModal.vue";
import ImportEmployees from "./report/importEmployees.vue";
import ExportEmployees from "./report/exportEmployees.vue";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";
import { Download, Plus, Upload, Trash, RefreshCw } from "lucide-vue-next";

// State
const loading = ref(true);
const error = ref("");
const items = ref([]);
const search = ref("");
const showFilters = ref(true);
const selectedEmployees = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const isNavigating = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);
const importDialogVisible = ref(false);
const exportDialogVisible = ref(false);
const currentExportFormat = ref("excel");
const showDialog = ref(false);
const showToast = ref(false); // State for toast visibility
const toastMessage = ref(""); // State for toast message
const toastType = ref("info"); // State for toast type

// Pagination
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);

// Sorting
const sortBy = ref("assignedUser.first_name");
const sortDirection = ref("asc");

// API Configuration
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const userId = currentUserTenant.getUserId();
const userRole = currentUserTenant.getRole();
const router = useRouter();
const route = useRoute();
const tenantplan = currentUserTenant.getTenantPlan();

// Role-based access control
const isAdmin = computed(() => userRole === "Admin" || userRole === "Dealer");
const isManager = computed(() => userRole === "Manager");
const isEmployee = computed(() => userRole === "Employee");

// Filter Configuration
const filters = reactive({
  organization: "",
  department: "",
  branch: "",
  role: "",
  gender: "",
  dateFrom: "",
  dateTo: "",
});

const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

const initialFilters = computed(() => ({
  organization: filters.organization,
  department: filters.department,
  branch: filters.branch,
  role: filters.role,
  gender: filters.gender,
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.organization ||
    filters.department ||
    filters.branch ||
    filters.role ||
    filters.gender ||
    filters.dateFrom ||
    filters.dateTo ||
    search.value
  );
});

// Columns Configuration
const columns = [
  {
    key: "name",
    label: "Name",
    sortable: false,
    sortKey: "assignedUser.first_name",
    class: "name-col",
    width: 150,
  },

  // {
  //   key: "profile",
  //   label: "Profile",
  //   sortable: false,
  //   class: "profile-col",
  //   width: 80,
  // },
  {
    key: "employeeId",
    label: "EmpID",
    sortable: false,
    class: "id-col",
    width: 120,
  },

  {
    key: "department",
    label: "Department",
    sortable: false,
    sortKey: "department.departmentName",
    class: "department-col",
    width: 150,
  },
  // {
  //   key: "locationName",
  //   label: "Branch",
  //   sortable: false,
  //   class: "location-col",
  //   width: 180,
  // },
  // {
  //   key: "orgType",
  //   label: "Organization Type",
  //   sortable: false,
  //   sortKey: "assignedUser.organization.orgType",
  //   class: "org-col",
  //   width: 180,
  // },
  // {
  //   key: "orgName",
  //   label: "Organization Name",
  //   sortable: false,
  //   sortKey: "assignedUser.organization.orgName",
  //   class: "org-name-col",
  //   width: 200,
  // },
  {
    key: "role",
    label: "Role",
    sortable: false,
    sortKey: "assignedUser.role.name",
    class: "role-col",
    width: 120,
  },
  {
    key: "approverName",
    label: "Approver",
    sortable: false,
    sortKey: "approver.first_name",
    class: "approver-col",
    width: 150,
  },
  {
    key: "contact",
    label: "Contact",
    sortable: false,
    sortKey: "assignedUser.phone",
    class: "contact-col",
    width: 150,
  },
  // {
  //   key: "email",
  //   label: "Email",
  //   sortable: false,
  //   sortKey: "assignedUser.email",
  //   class: "email-col",
  //   width: 200,
  // },
];

// Helper Functions
const formatOrgType = (orgType) => {
  if (!orgType) return "N/A";
  const typeMap = {
    "main tenant": "MAIN ORG",
    tenantorg: "SUB ORG",
    distributororg: "DISTRIBUTOR",
    clientorg: "CLIENT",
  };
  return typeMap[orgType] || orgType.toUpperCase();
};

const getOrgTypeClass = (orgType) => {
  const classMap = {
    "main tenant": "main-org-badge",
    tenantorg: "sub-org-badge",
    distributororg: "distributor-org-badge",
    clientorg: "client-org-badge",
  };
  return classMap[orgType] || "default-org-badge";
};

// Filter Handlers
const toggleFilters = () => {
  if (isAdmin.value) {
    showFilters.value = !showFilters.value;
  }
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchEmployeeData();
};

// Search Handling
let searchTimeout = null;
const handleSearchUpdate = (value) => {
  search.value = value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchEmployeeData();
  }, 300);
};

// Data Fetching
const buildFilterParams = async () => {
  const params = {};

  // Common tenant/user-based logic
  if (isAdmin.value) {
    params["filter[assignedUser][tenant][tenantId][_eq]"] = tenantId;
  } else {
    params["filter[_or][0][approver][id][_eq]"] = userId;
    params["filter[_or][1][assignedUser][id][_eq]"] = userId;
  }

  // ✅ Apply filters regardless of role
  if (filters.organization) {
    params["filter[assignedUser][organization][id][_eq]"] =
      filters.organization;
  }
  if (filters.department) {
    params["filter[department][id][_in]"] = filters.department;
  }
  if (filters.branch) {
    params["filter[branchLocation][id][_eq]"] = filters.branch;
  }
  if (filters.role) {
    params["filter[assignedUser][role][name][_in]"] = filters.role;
  }
  if (filters.gender) {
    params["filter[assignedUser][gender][_in]"] = filters.gender;
  }
  if (filters.dateFrom) {
    params["filter[assignedUser][dateOfJoining][_gte]"] = filters.dateFrom;
  }
  if (filters.dateTo) {
    params["filter[assignedUser][dateOfJoining][_lte]"] = filters.dateTo;
  }

  // ✅ Search filters
  if (search.value) {
    params["filter[_or][0][employeeId][_eq]"] = search.value;
    params["filter[_or][1][assignedUser][first_name][_icontains]"] =
      search.value;
    params["filter[_or][2][assignedUser][email][_icontains]"] = search.value;
    params["filter[_or][3][assignedUser][role][name][_icontains]"] =
      search.value;
    params["filter[_or][4][assignedUser][phone][_icontains]"] = search.value;
    params["filter[_or][5][assignedUser][organization][orgName][_icontains]"] =
      search.value;
    params["filter[_or][6][assignedUser][organization][orgType][_icontains]"] =
      search.value;
    params["filter[_or][7][department][departmentName][_icontains]"] =
      search.value;
  }

  // ✅ Sorting
  if (sortBy.value) {
    params.sort = `${sortDirection.value === "desc" ? "-" : ""}${sortBy.value}`;
  }

  console.log("Filter Params:", params);
  return params;
};

const fetchEmployeeAggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    const filterParams = await buildFilterParams();
    const params = {
      "aggregate[count]": "id",
      ...filterParams,
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    totalItems.value = Number(countData?.data?.[0]?.count?.id) || 0;
  } catch (err) {
    console.error("Error fetching aggregate count:", err);
    totalItems.value = 0;
  }
};

const fetchEmployeeData = async () => {
  if (isNavigating.value) return;
  await fetchEmployeeAggregateCount();

  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    loading.value = true;
    const filterParams = await buildFilterParams();
    const params = {
      fields: [
        "id",
        "employeeId",
        "status",
        "assignedUser.id",
        "assignedUser.avatar.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "assignedUser.phone",
        "assignedUser.email",
        "branchLocation.id",
        "branchLocation.locdetail",
        "department.id",
        "department.departmentName",
        "approver.id",
        "approver.first_name",
      ],
      ...filterParams,
      page: page.value,
      limit: itemsPerPage.value,
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    let employeeData = responseData.data || [];

    items.value = await Promise.all(
      employeeData.map(async (employee) => {
        const employeeWithAvatar = { ...employee };
        employeeWithAvatar.locationName =
          employee.branchLocation?.locdetail?.locationName || "-";
        if (employee.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${
            employee.assignedUser.avatar.id
          }`;
          employeeWithAvatar.avatarImage =
            await fetchAuthorizedImage(avatarUrl);
        } else {
          employeeWithAvatar.avatarImage = null;
        }
        employeeWithAvatar.approverName = employee.approver?.first_name || "-";
        return employeeWithAvatar;
      })
    );
  } catch (error) {
    console.error("Error fetching employee data:", error);
    error.value =
      "Failed to load employees. Please check your connection and try again.";
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

// Event Handlers
const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
  fetchEmployeeData();
};

const handleRowClick = (employee) => {
  console.log(employee);
  if (isAdmin.value) {
    editItem(employee);
  }
};

const showExportDialog = (format) => {
  if (isAdmin.value) {
    currentExportFormat.value = format;
    exportDialogVisible.value = true;
  }
};

const showDeleteConfirmation = () => {
  if (!isAdmin.value) return;
  if (selectedEmployees.value.length === 0) {
    showToast.value = true;
    toastMessage.value = "No employees selected for deletion.";
    toastType.value = "warning";
    return;
  }
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!isAdmin.value) return;
  const employeeIds = selectedEmployees.value.map((employee) => employee.id);
  const userIds = selectedEmployees.value
    .map((employee) => employee.assignedUser?.id)
    .filter((id) => id); // Filter out any undefined/null IDs

  try {
    deleting.value = true;

    // First, delete the assigned users from the 'users' collection
    if (userIds.length > 0) {
      const usersResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keys: userIds,
          }),
        }
      );

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        throw new Error(
          `Failed to delete users: ${errorData.errors?.[0]?.message || "Unknown error"} (Status: ${usersResponse.status})`
        );
      }
    }

    // Then, delete the personalModule entries
    if (employeeIds.length > 0) {
      const personalResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keys: employeeIds,
          }),
        }
      );

      if (!personalResponse.ok) {
        const errorData = await personalResponse.json();
        throw new Error(
          `Failed to delete employees: ${errorData.errors?.[0]?.message || "Unknown error"} (Status: ${personalResponse.status})`
        );
      }
    }

    showToast.value = true;
    toastMessage.value = `${employeeIds.length} employees deleted successfully!`;
    toastType.value = "success";
    selectedEmployees.value = [];
    fetchEmployeeData();
    showDeleteModal.value = false;
  } catch (err) {
    console.error("Error deleting employees:", err);
    showToast.value = true;
    toastMessage.value = `Failed to delete: ${err.message}. Please try again.`;
    toastType.value = "error";
  } finally {
    deleting.value = false;
  }
};

const handleCreateEmployee = () => {
  if (totalItems.value >= tenantplan?.users) {
    showToast.value = true;
    toastMessage.value =
      "You have reached the limit of users. Please buy more users to add more.";
    toastType.value = "warning";
    return;
  }
  showDialog.value = true;
};

const handleImport = () => {
  if (totalItems.value >= tenantplan?.users) {
    showToast.value = true;
    toastMessage.value =
      "You have reached the limit of users. Please buy more users to add more.";
    toastType.value = "warning";
    return;
  }
  importDialogVisible.value = true;
};

const showAddEmployeeForm = () => {
  if (!isAdmin.value) return;
  isEditing.value = false;
  editedItem.value = {};
  isNavigating.value = true;
  showForm.value = true;
  showFilters.value = false;
  router.push({
    name: "AddEmployeeForm",
    params: { module: "personalmodule" },
  });
};

const handleEntryTypeSelection = (type) => {
  if (!isAdmin.value) return;
  showDialog.value = false;
  if (type === "manual" || type === "aadhar") {
    showAddEmployeeForm();
  }
};

const editItem = (item) => {
  if (!isAdmin.value) return;
  isEditing.value = true;
  editedItem.value = item;
  isNavigating.value = true;
  showForm.value = true;
  showFilters.value = false;
  router.push({
    name: "EmployeeForm",
    params: { id: item.id, module: "personalmodule" },
  });
};

const handleSaveSuccess = () => {
  showForm.value = false;
  isNavigating.value = false;
  showFilters.value = true;
  selectedEmployees.value = [];
  editedItem.value = {};
  isEditing.value = false;
  router.push("/employee-details/employee").then(() => {
    setTimeout(() => {
      fetchEmployeeData();
    }, 100);
  });
};

const handleCancel = () => {
  showForm.value = false;
  isNavigating.value = false;
  showFilters.value = true;
  selectedEmployees.value = [];
  search.value = "";
  page.value = 1;
  editedItem.value = {};
  isEditing.value = false;
  router.push("/employee-details/employee").then(() => {
    setTimeout(() => {
      fetchEmployeeData();
    }, 100);
  });
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchEmployeeData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchEmployeeData();
};

// Lifecycle
onMounted(async () => {
  if (route.path === "/employee-details/employee") {
    showForm.value = false;
    showFilters.value = true;
    isNavigating.value = false;
    isEditing.value = false;
    editedItem.value = {};
    selectedEmployees.value = [];
    await fetchEmployeeData();
  } else if (
    route.path.includes("/employee-details/employee/") &&
    route.path !== "/employee-details/employee"
  ) {
    showForm.value = true;
    showFilters.value = false;
    isNavigating.value = true;
  }
});

// Watch route changes to reset state when navigating back to main list
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath === "/employee-details/employee" && oldPath !== newPath) {
      showForm.value = false;
      isNavigating.value = false;
      showFilters.value = true;
      isEditing.value = false;
      editedItem.value = {};
      nextTick(() => {
        fetchEmployeeData();
      });
    }
  },
  { immediate: false }
);
</script>

<style scoped>
/* Root Layout */
.employee-container {
  display: flex;
  height: 100vh;
  position: relative;
}

/* Filter Panel */
.filter-panel {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.filter-content {
  flex: 1;
  overflow-y: auto;
}

/* Filter Toggle Button */
.filter-toggle-static {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #374151;
}

.filter-toggle-static:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-toggle-static.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.filter-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.main-content.full-width {
  flex: 1;
}

.header-content {
  display: flex;
  align-items: center;

  padding: 1rem; /* Removed extra left padding */
  max-width: none;
}
/* Search */
.search-container {
  flex: 1;
  max-width: 400px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-input:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input svg {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.search-input input {
  width: 100%;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  background: transparent;
  color: #1e293b;
}

.search-input input:focus {
  outline: none;
}

.search-input input::placeholder {
  color: #9ca3af;
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: #e5e7eb;
  color: #6b7280;
  transform: scale(1.1);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Main Content Area */
.main-content-area {
  flex: 1;
  overflow-y: auto;
  background-color: #f9fafb;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Profile Avatar */
.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #64748b;
}

/* Employee Info */
.employee-name {
  font-weight: 500;
  margin: 0;
  font-size: 0.875rem;
  color: #1e293b;
}

.employee-email {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Organization Info */
.org-type-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  width: fit-content;
}

.default-org-badge {
  background: #f1f5f9;
  color: #475569;
}

.org-name {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.department-name {
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Role Badge */
.role-badge {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  width: fit-content;
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.phone-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
}

.phone-info svg {
  color: #94a3b8;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.dialog-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.dialog-body {
  padding: 1.5rem;
}

.entry-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.entry-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.entry-option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
}

.entry-option svg {
  color: #3b82f6;
}

.entry-option h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.entry-option p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
  .search-container {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .employee-container {
    flex-direction: column;
  }
  .filter-panel {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 50vh;
  }
  .filter-toggle-static {
    position: static;
    margin: 1rem 0;
    width: 40px;
    height: 40px;
  }
  .header-content {
    padding-left: 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .search-container {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }
  .entry-options {
    grid-template-columns: 1fr;
  }
}
</style>
