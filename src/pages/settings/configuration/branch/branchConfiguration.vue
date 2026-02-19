<template>
  <div class="locations-container">
    <DataTableWrapper
      :is-empty="!loading && !error && locations.length === 0"
      :has-error="!!error"
      :is-loading="loading"
      :search-query="searchQuery"
      @update:search-query="searchQuery = $event"
      search-placeholder="Search locations..."
      wrapper-class="attendance-table-wrapper"
    >
      <!-- Custom Toolbar with Stats and Create Button -->
      <template #toolbar-actions>
        <div class="toolbar-with-stats">
          <!-- Create Button -->
          <BaseButton
            variant="primary"
            text="Create branch"
            :leftIcon="Plus"
            width="100px"
            @click="createLocation"
          />
          <!-- Location Stats -->
          <div class="stats-container">
            <div class="stat-item total--text">
              <span class="stat-value">{{ locationStats.total }}</span>
              <span class="stat-title">Total</span>
            </div>
            <div class="stat-item branch--text">
              <span class="stat-value">{{ locationStats.branch }}</span>
              <span class="stat-title">Branches</span>
            </div>
            <!-- <div class="stat-item serviceable--text">
              <span class="stat-value">{{
                locationStats.serviceable_area
              }}</span>
              <span class="stat-title">Serviceable</span>
            </div> -->
          </div>
        </div>
      </template>

      <!-- Rest of your template remains the same -->
      <!-- Loading -->
      <SkeletonLoading
        v-if="loading"
        variant="data-table"
        :rows="6"
        :columns="6"
        :animated="true"
      />

      <!-- Non-loading content -->
      <template v-else>
        <!-- Error -->
        <ErrorState
          v-if="error"
          title="Unable to load locations"
          :message="error"
          :retry-action="{ text: 'Try Again', icon: RefreshCw }"
          @retry="fetchLocations"
        />

        <!-- Empty -->
        <EmptyState
          v-else-if="locations.length === 0"
          title="No locations available"
          message="No locations have been added yet."
          :show-default-actions="true"
        >
          <template #actions>
            <BaseButton
              variant="primary"
              text="Add Your First Location"
              width="200px"
              @click="createLocation"
            />
          </template>
        </EmptyState>

        <!-- Table -->
        <DataTable
          v-else
          :items="paginatedItems"
          :columns="columns"
          :selected-items="selected"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          item-key="id"
          :row-clickable="true"
          @update:selected-items="selected = $event"
          @update:sort-by="sortBy = $event"
          @update:sort-direction="sortDirection = $event"
          @row-click="openDialog"
        >
          <!-- Your cell templates remain the same -->
          <!-- Location -->
          <template #cell-location="{ item }">
            <div class="location-info">
              <div class="location-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div class="location-details">
                <span class="location-name">{{ item.locationName }}</span>
                <span v-if="item.pincodes" class="location-pincode"
                  >PIN: {{ item.pincodes }}</span
                >
              </div>
            </div>
          </template>

          <!-- Address -->
          <template #cell-address="{ item }">
            <span class="address-text">{{ item.address || "No address" }}</span>
          </template>

          <!-- Coordinates -->
          <template #cell-coordinates="{ item }">
            <div class="coordinates-info">
              <span class="coordinate-badge lat">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {{ toFixedNumber(item.lat, 4) }}
              </span>
              <span class="coordinate-badge lng">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                  />
                </svg>
                {{ toFixedNumber(item.lng, 4) }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template #cell-actions="{ item }">
            <div class="actions-container">
              <ActionBtn
                :icon="Edit"
                variant="secondary"
                size="100px"
                tooltip="Edit Location"
                @click="openDialog"
              />
              <!-- <ActionBtn
                :icon="QrCodeIcon"
                variant="secondary"
                size="100px"
                tooltip="Generate QR"
                @click="generateQRForItem(item)"
              /> -->
            </div>
          </template>

          <!-- Optional slots for built-in states -->
          <template #empty-state>
            <EmptyState
              title="No locations found"
              message="Try adding a new location."
              :show-default-actions="true"
            >
              <template #actions>
                <BaseButton
                  variant="primary"
                  text="Add Location"
                  width="160px"
                  @click="createLocation"
                />
              </template>
            </EmptyState>
          </template>
        </DataTable>
      </template>

      <!-- Pagination -->
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
    <!-- Updated Dialog UI based on screenshot style -->
    <v-dialog v-model="dialogVisible" max-width="500" persistent>
      <v-card class="entry-type-dialog">
        <v-card-title class="dialog-header">
          Actions for Selected Location
          <v-spacer></v-spacer>
          <v-btn icon @click="dialogVisible = false" class="close-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </v-btn>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p class="location-name-text">
            Select an action for the location: {{ selectedItem?.locationName }}
          </p>
          <div class="entry-type-container">
            <div class="entry-option" @click="handleEdit">
              <div class="option-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  ></path>
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  ></path>
                </svg>
              </div>
              <div class="option-details">
                <h3 class="option-title">Edit</h3>
                <p class="option-description">Edit location details</p>
              </div>
            </div>
            <div class="entry-option" @click="generateQR">
              <div class="option-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <polyline points="14,3 21,3 21,10"></polyline>
                  <polyline points="14,14 21,14 21,21"></polyline>
                  <polyline points="3,14 10,14 10,21"></polyline>
                  <line x1="14" y1="3" x2="10" y2="7"></line>
                  <line x1="14" y1="14" x2="10" y2="18"></line>
                  <line x1="3" y1="14" x2="7" y2="10"></line>
                  <line x1="21" y1="3" x2="17" y2="7"></line>
                </svg>
              </div>
              <div class="option-details">
                <h3 class="option-title">Generate QR</h3>
                <p class="option-description">Generate QR code for location</p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/WorkOrdeForm_Components/form/ErrorState.vue";
import ActionBtn from "@/components/common/buttons/ActionButton.vue";
import { Edit, Plus, QrCode as QrCodeIcon } from "lucide-vue-next";

const tenantId = currentUserTenant.getTenantId();

const router = useRouter();
const token = authService.getToken();

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const API_ENDPOINT = `/items/locationManagement?fields[]=orgLocation.orgName,locSize,locType,locdetail,locmark,state,id&filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][locType][_eq]=branch`;

// Reactive variables
const page = ref(1);
const itemsPerPage = ref(25);
const selected = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const deleteDialog = ref(false);
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const locations = ref([]);
const searchQuery = ref(""); // Change from search to searchQuery for clarity
const debouncedSearch = ref("");
// Sorting state
const sortBy = ref("locationName");
const sortDirection = ref("asc");
let searchTimeout = null;
// Filters
const filters = ref({
  type: "",
  organization: "",
});
const toFixedNumber = (num, digits = 4) => {
  const n = parseFloat(num);
  return Number.isFinite(n) ? n.toFixed(digits) : "--";
};
const dialogVisible = ref(false); // New: Controls dialog visibility
const selectedItem = ref(null);
const openDialog = (item) => {
  selectedItem.value = item; // Store the selected item
  dialogVisible.value = true; // Open the dialog
};
const handleSearch = () => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Set new timeout
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = searchQuery.value;
    page.value = 1; // Reset to first page when searching
  }, 300); // 300ms debounce
};
const handleEdit = () => {
  if (selectedItem.value) {
    router.push({
      name: "branch-configuration-edit",
      params: { id: selectedItem.value.id },
    });
    dialogVisible.value = false; // Close dialog after action
  }
};
const generateQRForItem = async (item) => {
  console.log("generating ", item);
  selectedItem.value = item;
  await generateQR();
};

const generateQR = async () => {
  const loc = selectedItem.value;
  if (!loc) {
    showErrorMessage("Location not found");
    return;
  }

  let qrContent = loc.qrDetails;

  // If qrDetails not in the current object, fetch it
  if (!qrContent) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/locationManagement/${loc.id}?fields[]=qrDetails`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch QR details");

      const data = await response.json();
      qrContent = data.data.qrDetails;
      console.log(qrContent);
      if (!qrContent) {
        showErrorMessage("QR details not found for this location");
        return;
      }
    } catch (error) {
      console.error("Error fetching QR details:", error);
      showErrorMessage("Failed to retrieve QR details. Please try again.");
      return;
    }
  }

  // Ensure qrContent is a string
  if (typeof qrContent !== "string") {
    console.error("qrContent is not a string:", qrContent);
    // Try to stringify if it's an object
    try {
      qrContent = JSON.stringify(qrContent);
    } catch (e) {
      showErrorMessage("Invalid QR content format");
      return;
    }
  }

  const locationName =
    loc.locdetail?.locationName || loc.locationName || "Unknown_Location";

  try {
    // Create QR code instance
    const typeNumber = 0; // Auto-detect the best type
    const errorCorrectionLevel = "H"; // High error correction
    const qr = QRCode(typeNumber, errorCorrectionLevel);

    // Add data and generate
    qr.addData(qrContent);
    qr.make();

    // Get the module count (size of QR code)
    const moduleCount = qr.getModuleCount();
    const cellSize = 8; // Size of each cell in pixels
    const margin = 4; // Margin in cells
    const size = moduleCount * cellSize + margin * cellSize * 2;

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Fill white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    // Draw QR code
    ctx.fillStyle = "#000000";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            col * cellSize + margin * cellSize,
            row * cellSize + margin * cellSize,
            cellSize,
            cellSize,
          );
        }
      }
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        showErrorMessage("Failed to generate QR code image");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${locationName.replace(/\s+/g, "_")}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      showSuccessMessage("QR code downloaded successfully!");
    }, "image/png");

    dialogVisible.value = false;
  } catch (error) {
    console.error("Error generating QR code:", error);
    showErrorMessage(`Failed to generate QR code: ${error.message}`);
  }
};
// API Methods
const fetchLocations = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 🔍 Log raw response from API
    console.log("Raw API data:", data);

    // Transform
    locations.value = transformApiData(data.data || data);

    // 🔍 Log transformed locType values
    console.log(
      "Transformed locTypes:",
      locations.value.map((l) => l.locType),
    );

    console.log("Locations fetched successfully:", locations.value.length);
  } catch (error) {
    console.error("Error fetching locations:", error);
    errorMessage.value = "Failed to fetch locations. Please try again.";
    showErrorAlert.value = true;
  } finally {
    loading.value = false;
  }
};

const deleteLocations = async (ids) => {
  try {
    const deletePromises = ids.map((id) =>
      fetch(`${API_BASE_URL}/items/locationManagement/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    );

    await Promise.all(deletePromises);
    locations.value = locations.value.filter(
      (location) => !ids.includes(location.id),
    );
    return true;
  } catch (error) {
    console.error("Error deleting locations:", error);
    throw error;
  }
};
const formatLocationType = (type) => {
  switch (type) {
    case "branch":
      return "Branch";
    case "serviceable_area":
      return "Serviceable Area";
    default:
      return "Unknown";
  }
};

const columns = [
  {
    key: "locationName",
    label: "Location Name",
    sortable: false,
    width: "20px",
  },
  // {
  //   key: "locType",
  //   label: "Type",
  //   sortable: false,
  //   width: "120px",
  // },
  // {
  //   key: "orgName",
  //   label: "Organization",
  //   sortable: false,
  //   width: "180px",
  // },
  {
    key: "address",
    label: "Address",
    width: "30px",
  },
  {
    key: "state",
    label: "State",
    width: "30px",
  },
  {
    key: "coordinates",
    label: "Coordinates",
    width: "20px",
  },
  {
    key: "actions",
    label: "Actions",
    width: "20px",
  },
];

// Data transformation function
const transformApiData = (apiData) => {
  if (!Array.isArray(apiData)) {
    console.warn("API data is not an array:", apiData);
    return [];
  }

  return apiData.map((item) => ({
    id: item.id,
    locationName: item.locdetail?.locationName || "N/A",
    locType: item.locType || "unknown",
    state: item.state || "N/A",
    orgName: item.orgLocation?.orgName || "Unassigned",
    address: item.locdetail?.address || "N/A",
    pincodes: item.locdetail?.pincodes?.join(", ") || "N/A", // Join pincodes array
    lat: item.locmark?.coordinates?.[1] || 0, // Latitude is the second value
    lng: item.locmark?.coordinates?.[0] || 0, // Longitude is the first value
    dateCreated: item.date_created,
    tenant: item.tenant,
    orgLocation: item.orgLocation,
    empIds: item.empIds,
    locSize: item.locSize,
    originalData: item,
  }));
};
// Computed properties
const locationStats = computed(() => {
  const allLocations = locations.value;
  return {
    total: allLocations.length,
    branch: allLocations.filter((l) => l.locType === "branch").length,
    serviceable_area: allLocations.filter(
      (l) => l.locType === "serviceable_area",
    ).length,
  };
});

const hasActiveFilters = computed(() => {
  return (
    filters.value.type !== "" ||
    filters.value.organization !== "" ||
    search.value !== ""
  );
});

const filteredItems = computed(() => {
  let filtered = locations.value;

  // Apply search filter from DataTableWrapper
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((item) => {
      // Search across multiple fields
      return (
        (item.locationName &&
          item.locationName.toLowerCase().includes(query)) ||
        (item.locType && item.locType.toLowerCase().includes(query)) ||
        (item.orgName && item.orgName.toLowerCase().includes(query)) ||
        (item.address && item.address.toLowerCase().includes(query)) ||
        (item.pincodes && item.pincodes.toLowerCase().includes(query))
      );
    });
  }

  // Apply type filter
  if (filters.value.type) {
    filtered = filtered.filter((item) => item.locType === filters.value.type);
  }

  // Apply organization filter
  if (filters.value.organization) {
    if (filters.value.organization === "assigned") {
      filtered = filtered.filter(
        (item) => item.orgName && item.orgName !== "Unassigned",
      );
    } else if (filters.value.organization === "unassigned") {
      filtered = filtered.filter(
        (item) => !item.orgName || item.orgName === "Unassigned",
      );
    }
  }

  // Apply sorting
  if (sortBy.value) {
    filtered.sort((a, b) => {
      const valA = a[sortBy.value] || "";
      const valB = b[sortBy.value] || "";
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection.value === "desc"
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      }
      return sortDirection.value === "desc" ? valB - valA : valA - valB;
    });
  }

  return filtered;
});

const totalItems = computed(() => filteredItems.value.length);

const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});

// Utility Methods

const applyFilters = () => {
  page.value = 1;
};

const clearSearch = () => {
  searchQuery.value = "";
  debouncedSearch.value = "";
};
// Event Handlers
const handlePageChange = (newPage) => {
  page.value = newPage;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
};

const editItem = (item) => {
  router.push({
    name: "branch-configuration-edit",
    params: { id: item.id },
  });
};

const createLocation = () => {
  // Check if route exists
  const route = router.resolve({ name: "branch-configuration-add" });
  if (route) {
    router.push({ name: "branch-configuration-add" });
  } else {
    console.error("Route not found");
  }
};

// Lifecycle
onMounted(() => {
  fetchLocations();
});
</script>

<style scoped>
/* Stats Container */
.stats-container {
  display: inline-flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.stat-title {
  color: #6b7280;
}

/* Toolbar with Stats */
.toolbar-with-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .toolbar-with-stats {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .stats-container {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .stat-item {
    min-width: 100px;
    padding: 0.375rem 0.5rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-title {
    font-size: 0.625rem;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .toolbar-with-stats {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .location-stats-toolbar .stats-grid {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .location-stats-toolbar .stats-grid {
    flex-wrap: wrap;
  }

  .location-stats-toolbar .stat-card {
    flex: 1;
    min-width: 100px;
  }
}

/* The rest of your existing styles remain the same */
.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow: hidden;
}

.location-icon {
  display: flex;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 0px;
  min-width: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.location-name {
  font-weight: 600;
  color: #111827;
  font-size: 13px;
  line-height: 1.1;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-pincode {
  font-size: 10px;
  color: #6b7280;
  line-height: 1.1;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid #e5e7eb;
  color: #111827;
  background: #f3f4f6;
  white-space: nowrap;
  margin: 0;
  height: 20px;
  box-sizing: border-box;
}

.type-badge.type-branch {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.type-badge.type-serviceable_area {
  background: #ecfeff;
  color: #0e7490;
  border-color: #a5f3fc;
}

.org-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  height: 20px;
  box-sizing: border-box;
}

.org-badge.org-unassigned {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #9f1239;
}

.org-badge.org-assigned {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #14532d;
}

.org-badge svg {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin: 0;
  padding: 0;
}

.address-text {
  color: #374151;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  margin: 0;
  padding: 0;
}

.coordinates-info {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.coordinate-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  white-space: nowrap;
  margin: 0;
  height: 18px;
  box-sizing: border-box;
}

.coordinate-badge svg {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin: 0;
  padding: 0;
}

.coordinate-badge.lat {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

.coordinate-badge.lng {
  background: #ddd6fe;
  border-color: #c4b5fd;
  color: #5b21b6;
}

/* New styles for actions container in table */
.actions-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Dialog styles based on screenshot */
.entry-type-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.close-btn {
  background: none !important;
  border: none !important;
  color: #64748b !important;
}

.dialog-content {
  padding: 24px;
}

.location-name-text {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

.entry-type-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.entry-option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-1px);
}

.option-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.option-icon svg {
  width: 24px;
  height: 24px;
}

.option-details {
  flex: 1;
}

.option-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.option-description {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}
</style>
