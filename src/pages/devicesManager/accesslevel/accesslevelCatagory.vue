<template>
  <div class="settings-container">
    <!-- Fixed Header Section -->
    <div class="fixed-header">
      <div class="section-header">
        <div class="header-with-back">
          <template v-if="showAccessLevelConfig">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="closeAccessLevelConfig"
              class="mr-4"
            ></v-btn>
          </template>
          <h3 class="text-h6">AccessLevel</h3>
        </div>
        <div v-if="!showAccessLevelConfig" class="filters-container">
          <!-- Search Input -->
          <v-text-field
            v-model="searchQuery"
            placeholder="Search..."
            variant="outlined"
            density="compact"
            hide-details
            class="search-input"
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>

          <!-- State Filter -->
          <!-- <v-select
            v-model="filterState"
            :items="states"
            label="State"
            variant="outlined"
            density="compact"
            hide-details
            class="filter-select"
            clearable
          ></v-select> -->

          <!-- Branch Filter -->
          <!-- <v-select
            v-model="filterBranch"
            :items="allBranches"
            item-title="text"
            item-value="value"
            label="Branch"
            variant="outlined"
            density="compact"
            hide-details
            class="filter-select"
            clearable
          ></v-select> -->

          <v-btn color="black" class="create-btn" @click="openCreateDialog">
            <v-icon start>mdi-plus</v-icon>
            CREATE CATEGORY
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Scrollable Content Section -->
    <div v-if="!showAccessLevelConfig" class="scrollable">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <div v-else class="templates-container">
        <!-- Create Card -->
        <div class="template-card create-card" @click="openCreateDialog">
          <div class="create-card-content">
            <v-icon size="32" color="grey-darken-1">mdi-plus</v-icon>
            <span class="create-text">Create</span>
          </div>
        </div>

        <!-- Category Cards -->
        <div
          v-for="category in filteredAccessLevelCategories"
          :key="category.id"
          class="template-card"
          @click="handleCategoryClick(category)"
        >
          <div class="template-content">
            <div class="category-header">
              <span class="category-name">{{ category.name }}</span>
            </div>
            <div class="category-details">
              <div v-if="!category.accessType" class="access-disabled-icon">
                <v-icon color="error" size="48" title="Access Disabled">
                  mdi-lock-off
                </v-icon>
                <div class="access-disabled-message">
                  <span>Access Disabled</span>
                </div>
              </div>
            </div>
            <div class="template-actions">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="primary"
                @click.stop="editCategory(category)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click.stop="deleteCategory(category.id)"
              ></v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AccessLevelConfiguration Component -->
    <AccessLevelConfiguration
      v-if="showAccessLevelConfig"
      :category="selectedCategory"
      @close="closeAccessLevelConfig"
    />

    <!-- Create/Edit Category Dialog -->
    <v-dialog v-model="categoryDialog" max-width="500px">
      <v-card>
        <v-card-title class="dialog-title">
          {{ editingCategory ? "Edit" : "Create" }} AccessLevel Category
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-text-field
            v-model="categoryName"
            label="Category Name"
            :placeholder="defaultCategoryName"
            variant="outlined"
            required
            class="category-name-input"
            :error-messages="categoryNameError"
          ></v-text-field>
          <v-switch
            v-model="accessTypeEnabled"
            label="Access Type"
            color="primary"
            hide-details
            inset
            class="mt-4"
          ></v-switch>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="categoryDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="black"
            @click="saveCategory"
            :disabled="!!categoryNameError"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Warning Message Dialog -->
    <v-dialog v-model="showWarningDialog" max-width="400px">
      <v-card class="warning-dialog">
        <v-card-text class="warning-message">
          If you want to assign this category to employees, please enable the
          access type by editing this category.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" variant="text" @click="showWarningDialog = false"
            >Close</v-btn
          >
          <v-btn
            color="white"
            variant="text"
            @click="handleEditFromWarning(selectedWarningCategory)"
            >Edit Category</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <MessageAlert
      :message="alertMessage"
      :type="alertType"
      @close="clearAlert"
    />
  </div>
</template>

<script>
import AccessLevelConfiguration from "./accesslvelConfiguration.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export default {
  name: "AccessLevelCategory",
  components: {
    AccessLevelConfiguration,
  },
  data() {
    return {
      categoryDialog: false,
      accessLevelCategories: [],
      accessTypeEnabled: true,
      categoryNameError: "",
      states: [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
      ],
      branches: [],
      selectedState: null,
      selectedBranches: [],
      categoryName: "",
      editingCategory: null,
      searchQuery: "",
      filterState: null,
      filterBranch: null,
      allBranches: [],
      showAccessLevelConfig: false,
      selectedCategory: null,
      loading: false,
      page: 1,
      limit: 25,
      areaType: "urban",
      showWarningDialog: false,
      selectedWarningCategory: null,
      alertMessage: "",
      alertType: "",
    };
  },
  computed: {
    defaultCategoryName() {
      return `AccessLevel ${this.accessLevelCategories.length + 1}`;
    },
    token() {
      return authService.getToken();
    },
    apiUrl() {
      return import.meta.env.VITE_API_URL;
    },
    filteredAccessLevelCategories() {
      return this.accessLevelCategories.filter((category) => {
        const matchesSearch = this.searchQuery
          ? category.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true;
        const matchesState = this.filterState
          ? category.state === this.filterState
          : true;
        const matchesBranch = this.filterBranch
          ? category.branches.includes(this.filterBranch)
          : true;
        return matchesSearch && matchesState && matchesBranch;
      });
    },
  },
  created() {
    this.initializeData();
  },
  methods: {
    async initializeData() {
      await this.fetchAccessLevels();
      await this.fetchBranches();
    },
    async fetchAccessLevels() {
      try {
        await currentUserTenant.fetchLoginUserDetails();
        const tenantId = currentUserTenant.getTenantId();
        this.loading = true;
        const fields = [
          "accessLevelName",
          "accessLevelNumber",
          "tenant.tenantName",
          "_24hrs",
          "holidays",
          "maxWorkHours",
          "accessType",
          "workingHours",
          "configName",
          "tenant.tenantId",
          "assignedDoors.doors_id.doorNumber",
          "assignedDoors.doors_id.doorName",
          "assignedDoors.doors_id.id",
          "assignedDoors.id",
          "assignedBranches.branch_id.id",
          "assignedBranches.branch_id.branchId",
          "assignedBranches.branch_id.state",
          "assignedBranches.branch_id.branchName",
          "assignedBranches.id",
          "id",
          "state",
          "assignDoorsGroup",
          "assignDevicesGroup",
          "groupType",
        ];

        const params = new URLSearchParams({
          limit: this.limit.toString(),
          page: this.page.toString(),
          "sort[]": "sort",
          "filter[tenant][tenantId][_eq]": tenantId,
        });

        fields.forEach((field) => {
          params.append("fields[]", field);
        });

        if (this.searchQuery) {
          params.append("filter[accessLevelName][_contains]", this.searchQuery);
        }

        if (this.filterState) {
          params.append(
            "filter[accessLevelName][branch_id][state][_eq]",
            this.filterState,
          );
        }

        if (this.filterBranch) {
          params.append(
            "filter[assignedBranches][branch_id][branchId][_eq]",
            this.filterBranch,
          );
        }

        const response = await fetch(
          `${this.apiUrl}/items/accesslevels?${params}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();
        this.accessLevelCategories = data.data.map((item) => ({
          id: item.id,
          name: item.accessLevelName,
          state: item.state || "",
          assignedBranches: item.assignedBranches.map((branch) => ({
            id: branch.branch_id?.id,
            branchId: branch.branch_id?.branchId,
            branchName: branch.branch_id?.branchName,
            state: branch.branch_id?.state,
          })),
          assignedDoors: item.assignedDoors.map((door) => ({
            doorId: door.doors_id?.id,
            doorName: door.doors_id?.doorName,
            doorNumber: door.doors_id?.doorNumber,
          })),
          configName: item.configName,
          accessType: item.accessType,
          workingHours: item.workingHours,
          maxWorkHours: item.maxWorkHours,
          holidays: item.holidays,
          assignDoorsGroup: item.assignDoorsGroup,
          assignDevicesGroup: item.assignDevicesGroup,
          groupType: item.groupType,
          _24hrs: item._24hrs,
        }));
      } catch (error) {
        console.error("Error fetching access levels:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchBranches() {
      try {
        await currentUserTenant.fetchLoginUserDetails();
        const tenantId = currentUserTenant.getTenantId();

        const params = new URLSearchParams({
          "filter[tenant][tenantId][_eq]": tenantId,
        });

        const response = await fetch(`${this.apiUrl}/items/branch?${params}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        this.allBranches = data.data.map((branch) => ({
          text: branch.branchName,
          value: branch.branchId,
          state: branch.state,
        }));
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    },
    isDuplicateCategoryName(name) {
      return this.accessLevelCategories.some(
        (category) =>
          category.name.toLowerCase() === name.toLowerCase() &&
          (!this.editingCategory || category.id !== this.editingCategory.id),
      );
    },

    openCreateDialog() {
      this.editingCategory = null;
      this.selectedState = null;
      this.selectedBranches = [];
      this.categoryName = `AccessLevel ${this.accessLevelCategories.length + 1}`;
      this.categoryDialog = true;
      this.categoryNameError = "";
      this.accessTypeEnabled = true;
    },
    editCategory(category) {
      this.editingCategory = category;
      this.selectedState = category.state;
      this.categoryName = category.name;
      this.selectedBranches = category.branches;
      this.selectedDoors = category.doors;
      this.areaType = category.areaType || "urban";
      this.categoryNameError = "";
      this.categoryDialog = true;
      this.accessTypeEnabled = category.accessType !== false;
    },

    async handleAccessTypeToggle(switchValue) {
      try {
        // Get tenant ID
        const tenantId = currentUserTenant.getTenantId();

        // Step 1: Fetch all personal module IDs associated with this category
        const fetchUrl = `${this.apiUrl}/items/personalModule?fields[]=id&filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][assignedAccessLevels][accesslevels_id][accessLevelName][_contains]=${this.categoryName || this.defaultCategoryName}`;

        const response = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        // Step 2: Extract all IDs from the response
        const ids = data.data.map((item) => item.id);

        if (ids.length === 0) {
          console.log("No personal modules found for this category");
          return;
        }

        // Step 3: Make PATCH request to update access status for all IDs
        const patchUrl = `${this.apiUrl}/items/personalModule`;
        const patchPayload = {
          keys: ids,
          data: {
            accessOn: switchValue,
          },
        };

        const patchResponse = await fetch(patchUrl, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchPayload),
        });

        if (patchResponse.ok) {
          // Show success message
          this.alertMessage = `Access ${switchValue ? "enabled" : "disabled"} for ${ids.length} users`;
          this.alertType = "success";
        } else {
          throw new Error("Failed to update access status");
        }
      } catch (error) {
        console.error("Error updating access status:", error);
        this.alertMessage = "Failed to update access status";
        this.alertType = "error";
      }
    },

    async saveCategory() {
      if (this.isDuplicateCategoryName(this.categoryName)) {
        this.categoryNameError =
          "A category with this name already exists. No duplicates allowed.";
        return;
      }

      try {
        const payload = {
          accessLevelName: this.categoryName || this.defaultCategoryName,
          tenant: {
            tenantId: currentUserTenant.getTenantId(),
          },
          status: "active",
          configName: this.categoryName || this.defaultCategoryName,
          accessType: this.accessTypeEnabled,
        };

        const accessLevelId = await this.generateSequentialAccessLevelId();
        payload.accessLevelNumber = accessLevelId;

        const url = this.editingCategory
          ? `${this.apiUrl}/items/accesslevels/${this.editingCategory.id}`
          : `${this.apiUrl}/items/accesslevels`;

        const method = this.editingCategory ? "PATCH" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          this.categoryDialog = false;
          await this.fetchAccessLevels();

          // If editing and access type changed, update personal modules
          if (
            this.editingCategory &&
            this.editingCategory.accessType !== this.accessTypeEnabled
          ) {
            await this.handleAccessTypeToggle(this.accessTypeEnabled);
          }
        }
      } catch (error) {
        console.error("Error saving category:", error);
      }
    },

    async duplicateCategory(category) {
      try {
        const newCategory = {
          ...category,
          name: `${category.name} (Copy)`,
        };
        delete newCategory.id;

        const response = await fetch(`${this.apiUrl}/items/accesslevels`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCategory),
        });

        if (response.ok) {
          await this.fetchAccessLevels();
        }
      } catch (error) {
        console.error("Error duplicating category:", error);
      }
    },
    async deleteCategory(categoryId) {
      if (confirm("Are you sure you want to delete this category?")) {
        try {
          const response = await fetch(
            `${this.apiUrl}/items/accesslevels/${categoryId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            await this.fetchAccessLevels();
          }
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      }
    },

    openAccessLevelConfig(category) {
      this.selectedCategory = category;
      this.showAccessLevelConfig = true;
    },
    closeAccessLevelConfig() {
      this.showAccessLevelConfig = false;
      this.selectedCategory = null;
    },

    async generateSequentialAccessLevelId() {
      try {
        const tenantId = currentUserTenant.getTenantId();
        const response = await fetch(
          `${this.apiUrl}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}&sort[]=-accessLevelNumber&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );
        const data = await response.json();
        if (!data.data || data.data.length === 0) {
          return "1";
        }
        const lastAccessLevel = data.data[0].accessLevelNumber;
        if (!lastAccessLevel || lastAccessLevel === "NaN") {
          return "1";
        }
        const lastNumber = parseInt(lastAccessLevel, 10);
        if (isNaN(lastNumber)) {
          return "1";
        }
        return (lastNumber + 1).toString();
      } catch (error) {
        console.error("Error generating access level ID:", error);
        return "1";
      }
    },
    handleCategoryClick(category) {
      if (!category.accessType) {
        this.selectedWarningCategory = category;
        this.showWarningDialog = true;
      } else {
        this.openAccessLevelConfig(category);
      }
    },
    handleEditFromWarning(category) {
      this.showWarningDialog = false;
      this.editCategory(category);
    },
    clearAlert() {
      this.alertMessage = "";
      this.alertType = "";
    },
  },
  watch: {
    searchQuery: {
      handler() {
        this.fetchAccessLevels();
      },
      debounce: 300,
    },
    filterState() {
      this.fetchAccessLevels();
    },
    filterBranch() {
      this.fetchAccessLevels();
    },
    categoryName(newValue) {
      if (this.isDuplicateCategoryName(newValue)) {
        this.categoryNameError =
          "A category with this name already exists. No duplicates allowed.";
      } else {
        this.categoryNameError = "";
      }
    },
    accessTypeEnabled(newValue, oldValue) {
      if (this.editingCategory && newValue !== oldValue) {
        // Don't call API here, we'll do it after saving the category
        console.log(`Access type changed to: ${newValue}`);
      }
    },
  },
};
</script>

<style scoped>
.settings-container {
  width: 100%;
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  background: white;
}

.scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 0 24px 24px;
}

.templates-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 0;
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  background: white;
}

.create-btn {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.template-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  height: 160px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  padding: 20px;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.create-card {
  border: 2px dashed #e0e0e0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.create-text {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.template-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
}

.category-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.access-disabled-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 8px;
}

.access-disabled-icon .v-icon {
  font-size: 48px;
  opacity: 0.8;
}

.access-disabled-message {
  text-align: center;
  color: #dc3545;
  font-weight: 500;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #666;
}

.template-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 8px;
}

.template-card:hover .template-actions {
  opacity: 1;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  padding: 24px 24px 0;
}

.dialog-content {
  padding: 24px;
}

.dialog-actions {
  padding: 16px 24px;
}

.filters-container {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
  margin-bottom: 0;
}

.filter-select {
  width: 160px;
  margin-bottom: 0;
}

.header-with-back {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-dialog {
  background-color: #dc3545 !important;
}

.warning-message {
  color: white !important;
  font-size: 16px;
  padding: 20px;
  text-align: center;
}

/* Override Vuetify dialog card styles */
.warning-dialog :deep(.v-card-actions) {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.warning-dialog :deep(.v-btn) {
  color: white !important;
}

@media (max-width: 768px) {
  .templates-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .template-card {
    height: 160px;
  }
}
</style>
