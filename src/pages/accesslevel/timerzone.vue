<template>
  <div class="timer-zone-container">
    <!-- Timer Zones Table -->
    <DataTableWrapper
      subtitle="Manage your timer zones and their schedules"
      :showSearch="true"
      :search-query="searchQuery"
      @update:search-query="searchQuery = $event"
    >
      <template #toolbar-actions>
        <BaseButton
          variant="primary"
          size="md"
          text="Add Timer Zone"
          :leftIcon="PlusIcon"
          @click="openAddDialog"
        />
      </template>

      <!-- Skeleton Loading -->
      <SkeletonLoader
        v-if="loading"
        variant="data-table"
        :rows="5"
        :columns="4"
      />

      <!-- Error State -->
      <div v-else-if="error" class="text-center pa-8">
        <v-icon color="error" size="48" class="mb-4">mdi-alert-circle</v-icon>
        <p class="text-body-1 text-error mb-4">{{ error }}</p>
        <BaseButton
          variant="primary"
          size="md"
          text="Retry"
          @click="fetchTimerZones"
        />
      </div>

      <!-- Table Section -->
      <DataTable
        v-else
        :items="filteredTimerZones"
        :columns="headers"
        :showSelection="false"
        :expandable="false"
        show-header
        :row-clickable="true"
        @rowClick="handleRowClick"
      >
        <template #column-name="{ item }">
          <span class="text-body-2">{{ item.timeZoneName }}</span>
        </template>

        <template #column-startTime="{ item }">
          <span class="text-body-2">{{ formatTime(item.entryTime) }}</span>
        </template>

        <template #column-endTime="{ item }">
          <span class="text-body-2">{{ formatTime(item.exitTime) }}</span>
        </template>

        <template #column-status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="flat"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #column-actions="{ item }">
          <div class="d-flex align-center">
            <!-- Edit button removed, only delete button remains -->
            <BaseButton
              variant="text"
              size="sm"
              :icon="TrashIcon"
              color="error"
              @click.stop="deleteZone(item)"
            />
          </div>
        </template>

        <!-- Add row click handler -->
        <template #row="{ item }">
          <tr @click="editZone(item)" class="clickable-row">
            <td>
              <span class="text-body-2">{{ item.timeZoneName }}</span>
            </td>
            <td>
              <span class="text-body-2">{{ formatTime(item.entryTime) }}</span>
            </td>
            <td>
              <span class="text-body-2">{{ formatTime(item.exitTime) }}</span>
            </td>
            <td>
              <v-chip
                :color="getStatusColor(item.status)"
                variant="flat"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </td>
            <td>
              <div class="d-flex align-center" @click.stop>
                <BaseButton
                  variant="text"
                  size="sm"
                  :icon="TrashIcon"
                  color="error"
                  @click="deleteZone(item)"
                />
              </div>
            </td>
          </tr>
        </template>
      </DataTable>
    </DataTableWrapper>

    <!-- Add/Edit Timer Zone Dialog -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6">{{
            isEditing ? "Edit Timer Zone" : "Add Timer Zone"
          }}</span>
          <BaseButton
            variant="text"
            size="sm"
            :icon="XMarkIcon"
            @click="closeDialog"
          />
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="form" v-model="formValid">
            <!-- Time Zone Name -->
            <v-text-field
              v-model="formData.timeZoneName"
              label="Time Zone Name *"
              placeholder="e.g., Work Hours, Sleep Time"
              variant="outlined"
              density="compact"
              :rules="[(v) => !!v || 'Time zone name is required']"
              class="mb-4"
            />

            <!-- Start and End Time -->
            <div class="d-flex align-center mb-4">
              <div class="flex-grow-1 mr-2">
                <v-text-field
                  v-model="formData.entryTime"
                  label="Start Time"
                  type="time"
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || 'Start time is required']"
                />
              </div>
              <div class="flex-grow-1 ml-2">
                <v-text-field
                  v-model="formData.exitTime"
                  label="End Time"
                  type="time"
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || 'End time is required']"
                />
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <BaseButton
            variant="text"
            size="md"
            text="Cancel"
            @click="closeDialog"
          />
          <BaseButton
            variant="primary"
            size="md"
            :text="isEditing ? 'Update Timer Zone' : 'Add Timer Zone'"
            :disabled="!formValid || saving"
            :loading="saving"
            @click="saveZone"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ zoneToDelete?.timeZoneName }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <BaseButton
            variant="text"
            size="md"
            text="Cancel"
            :disabled="deleting"
            @click="showDeleteDialog = false"
          />
          <BaseButton
            variant="primary"
            size="md"
            text="Delete"
            color="error"
            :disabled="deleting"
            :loading="deleting"
            @click="confirmDelete"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

// Reactive data
const timerZones = ref([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const error = ref(null);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const formValid = ref(false);
const form = ref(null);
const zoneToDelete = ref(null);
const searchQuery = ref(""); // This comes from DataTableWrapper
const debouncedSearch = ref(""); // NEW: debounced version

let searchTimeout = null;

// Snackbar
const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

// Table headers with widths
const headers = ref([
  {
    label: "Name",
    key: "timeZoneName",
    sortable: true,
    width: "200px",
  },
  {
    label: "Start Time",
    key: "entryTime",
    sortable: true,
    width: "200px",
  },
  {
    label: "End Time",
    key: "exitTime",
    sortable: true,
    width: "200px",
  },
  // {
  //   label: "Status",
  //   key: "status",
  //   sortable: true,
  //   width: "15%",
  //   align: "center",
  // },
  // {
  //   label: "Actions",
  //   key: "actions",
  //   sortable: false,
  //   width: "15%",
  //   align: "center",
  // },
]);

// Form data
const formData = reactive({
  id: null,
  timeZoneName: "",
  entryTime: "",
  exitTime: "",
  tenant: "",
});

// Get tenant ID and token
const tenantId = ref(null);
const token = ref(null);

// API endpoints
const API_BASE = import.meta.env.VITE_API_URL;

const filteredTimerZones = computed(() => {
  const query = debouncedSearch.value.trim().toLowerCase();
  if (!query) return timerZones.value;

  return timerZones.value.filter((zone) =>
    zone.timeZoneName?.toLowerCase().includes(query)
  );
});
// Methods
const showNotification = (message, color = "success") => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  // Convert HH:mm:ss to HH:mm format for display
  return timeString.slice(0, 5);
};

const formatTimeForAPI = (timeString) => {
  if (!timeString) return "";
  // Ensure time is in HH:mm:ss format
  return timeString.length === 5 ? `${timeString}:00` : timeString;
};
const handleRowClick = (item) => {
  if (item && item.id) {
    editZone(item);
  } else {
    console.error("Invalid item or item ID");
    showNotification(
      "Unable to open timer zone details. Please try again.",
      "error"
    );
  }
};
const getStatusColor = (status) => {
  const statusColors = {
    draft: "warning",
    published: "success",
    archived: "error",
  };
  return statusColors[status] || "default";
};

const openAddDialog = () => {
  isEditing.value = false;
  resetForm();
  showDialog.value = true;
};

const editZone = (zone) => {
  isEditing.value = true;
  Object.assign(formData, {
    ...zone,
    entryTime: formatTime(zone.entryTime),
    exitTime: formatTime(zone.exitTime),
  });
  showDialog.value = true;
};

const saveZone = async () => {
  if (!formValid.value) return;

  saving.value = true;
  try {
    const payload = {
      timeZoneName: formData.timeZoneName,
      entryTime: formatTimeForAPI(formData.entryTime),
      exitTime: formatTimeForAPI(formData.exitTime),
      tenant: tenantId.value,
    };

    let response;
    if (isEditing.value) {
      // Update existing zone
      response = await fetch(`${API_BASE}/items/time/${formData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(payload),
      });
    } else {
      // Add new zone
      response = await fetch(`${API_BASE}/items/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error(
        `Failed to ${isEditing.value ? "update" : "create"} timer zone`
      );
    }

    const result = await response.json();

    showNotification(
      `Timer zone ${isEditing.value ? "updated" : "created"} successfully`
    );

    closeDialog();
    await fetchTimerZones(); // Refresh the list
  } catch (err) {
    console.error("Error saving timer zone:", err);
    showNotification(
      `Failed to ${isEditing.value ? "update" : "create"} timer zone`,
      "error"
    );
  } finally {
    saving.value = false;
  }
};

const deleteZone = (zone) => {
  zoneToDelete.value = zone;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!zoneToDelete.value) return;

  deleting.value = true;
  try {
    const response = await fetch(
      `${API_BASE}/items/time/${zoneToDelete.value.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete timer zone");
    }

    showNotification("Timer zone deleted successfully");

    // Remove from local state
    timerZones.value = timerZones.value.filter(
      (z) => z.id !== zoneToDelete.value.id
    );

    showDeleteDialog.value = false;
    zoneToDelete.value = null;
  } catch (err) {
    console.error("Error deleting timer zone:", err);
    showNotification("Failed to delete timer zone", "error");
  } finally {
    deleting.value = false;
  }
};

const closeDialog = () => {
  showDialog.value = false;
  resetForm();
};

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    timeZoneName: "",
    entryTime: "",
    exitTime: "",
    tenant: "",
  });
  if (form.value) {
    form.value.resetValidation();
  }
};

const fetchTimerZones = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get user details first
    const userDetails = await currentUserTenant.fetchLoginUserDetails();

    if (!token.value || !tenantId.value) {
      throw new Error("Authentication required or tenant not found");
    }

    // Use proper Directus API parameter format
    const fields = [
      "id",
      "timeZoneName",
      "entryTime",
      "exitTime",
      "status",
      "tenant.tenantId",
      "tenant.tenantName",
    ];

    const url = new URL(`${API_BASE}/items/time`);
    fields.forEach((field) => {
      url.searchParams.append("fields[]", field);
    });
    url.searchParams.append("filter[status][_neq]", "archived");
    url.searchParams.append("filter[tenant][_eq]", tenantId.value);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch timer zones: ${response.status}`);
    }

    const result = await response.json();
    timerZones.value = result.data || [];
  } catch (err) {
    console.error("Error fetching timer zones:", err);

    if (err.message.includes("Failed to fetch")) {
      error.value =
        "Cannot connect to server. Please make sure the backend service is running.";
    } else {
      error.value = "Failed to load timer zones. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

// Initialize authentication data properly
const initializeAuth = async () => {
  try {
    // Get token and tenant ID
    token.value = authService.getToken();
    tenantId.value = currentUserTenant.getTenantId();

    if (!token.value || !tenantId.value) {
      throw new Error("Authentication data not available");
    }
  } catch (err) {
    console.error("Auth initialization error:", err);
    error.value = "Authentication failed. Please log in again.";
  }
};
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal.trim().toLowerCase();
  }, 300);
});
// Lifecycle - Initialize auth first, then fetch data
onMounted(async () => {
  await initializeAuth();
  if (token.value && tenantId.value) {
    await fetchTimerZones();
  }
});
</script>

<style scoped>
.timer-zone-container {
  height: 100%;
}

:deep(.v-table) {
  border-radius: 8px;
}

:deep(.v-table thead th) {
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.v-table tbody tr) {
  border-bottom: 1px solid #e2e8f0;
}

:deep(.v-table tbody tr:hover) {
  background-color: #f8fafc;
  cursor: pointer;
}

/* Custom column widths */
:deep(.v-table th:nth-child(1)),
:deep(.v-table td:nth-child(1)) {
  width: 30%;
}

:deep(.v-table th:nth-child(2)),
:deep(.v-table td:nth-child(2)) {
  width: 20%;
  text-align: center;
}

:deep(.v-table th:nth-child(3)),
:deep(.v-table td:nth-child(3)) {
  width: 20%;
  text-align: center;
}

:deep(.v-table th:nth-child(4)),
:deep(.v-table td:nth-child(4)) {
  width: 15%;
  text-align: center;
}

:deep(.v-table th:nth-child(5)),
:deep(.v-table td:nth-child(5)) {
  width: 15%;
  text-align: center;
}

/* Add cursor pointer for clickable rows */
.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #f5f5f5 !important;
}
</style>
