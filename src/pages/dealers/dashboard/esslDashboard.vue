<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-grey-darken-3">
          ESSL Administration Dashboard
        </h2>
      </v-col>
    </v-row>

    <v-tabs v-model="activeTab" class="mb-6" color="primary">
      <v-tab value="tenants">Tenant Management</v-tab>
      <v-tab value="devices">Device Management</v-tab>
      <v-tab value="dealers">Dealer Requests</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- Tenant Management Tab -->
      <v-tabs-window-item value="tenants">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Tenant Management</span>
            <v-btn color="primary" prepend-icon="mdi-plus"> Add Tenant </v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table
              :headers="tenantHeaders"
              :items="tenants"
              item-key="id"
              class="elevation-0"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.devices="{ item }">
                <v-chip color="primary" size="small" variant="outlined">
                  {{ item.devices }} Active
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="primary"
                  @click="configureTenant(item)"
                >
                  Configure
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Device Management Tab -->
      <v-tabs-window-item value="devices">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold"
            >Device Management</v-card-title
          >
          <v-card-text class="pa-0">
            <v-data-table
              :headers="deviceHeaders"
              :items="devices"
              item-key="id"
              class="elevation-0"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="item.status === 'online' ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="primary"
                  @click="manageDevice(item)"
                >
                  Manage
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Dealer Requests Tab -->
      <v-tabs-window-item value="dealers">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold"
            >Dealer Request Approval</v-card-title
          >
          <v-card-text class="pa-0">
            <v-data-table
              :headers="dealerHeaders"
              :items="dealerRequests"
              item-key="id"
              class="elevation-0"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <div v-if="item.status === 'pending'" class="d-flex ga-2">
                  <v-btn
                    size="small"
                    color="success"
                    variant="outlined"
                    @click="approveDealerRequest(item.id)"
                  >
                    Approve
                  </v-btn>
                  <v-btn
                    size="small"
                    color="error"
                    variant="outlined"
                    @click="rejectDealerRequest(item.id)"
                  >
                    Reject
                  </v-btn>
                </div>
                <span v-else class="text-grey-600">No actions</span>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script>
import { ref } from "vue";

export default {
  name: "EsslDashboard",
  setup() {
    const activeTab = ref("tenants");

    const tenantHeaders = [
      { title: "Tenant ID", key: "tenantId", sortable: true },
      { title: "Tenant Name", key: "tenantName", sortable: true },
      { title: "Status", key: "status", sortable: true },
      { title: "Employee Count", key: "employeeCount", sortable: true },
      { title: "Devices", key: "devices", sortable: false },
      { title: "Actions", key: "actions", sortable: false },
    ];

    const deviceHeaders = [
      { title: "Device ID", key: "deviceId", sortable: true },
      { title: "Device Name", key: "deviceName", sortable: true },
      { title: "Tenant", key: "tenant", sortable: true },
      { title: "Status", key: "status", sortable: true },
      { title: "Last Sync", key: "lastSync", sortable: true },
      { title: "Actions", key: "actions", sortable: false },
    ];

    const dealerHeaders = [
      { title: "Request ID", key: "requestId", sortable: true },
      { title: "Dealer Name", key: "dealerName", sortable: true },
      { title: "Tenant", key: "tenant", sortable: true },
      { title: "Phone", key: "phone", sortable: true },
      { title: "Status", key: "status", sortable: true },
      { title: "Date Created", key: "dateCreated", sortable: true },
      { title: "Actions", key: "actions", sortable: false },
    ];

    const tenants = ref([
      {
        id: 1,
        tenantId: "TNT001",
        tenantName: "TechCorp Solutions",
        status: "active",
        employeeCount: 150,
        devices: 5,
      },
      {
        id: 2,
        tenantId: "TNT002",
        tenantName: "InnovateTech",
        status: "active",
        employeeCount: 85,
        devices: 3,
      },
    ]);

    const devices = ref([
      {
        id: 1,
        deviceId: "DEV001",
        deviceName: "Main Entrance",
        tenant: "TechCorp Solutions",
        status: "online",
        lastSync: "2024-05-27 18:00",
      },
      {
        id: 2,
        deviceId: "DEV002",
        deviceName: "Office Floor 1",
        tenant: "TechCorp Solutions",
        status: "online",
        lastSync: "2024-05-27 17:58",
      },
      {
        id: 3,
        deviceId: "DEV003",
        deviceName: "Reception",
        tenant: "InnovateTech",
        status: "offline",
        lastSync: "2024-05-27 16:30",
      },
    ]);

    const dealerRequests = ref([
      {
        id: 1,
        requestId: "REQ001",
        dealerName: "Rahul Sharma",
        tenant: "TechCorp Solutions",
        phone: "+919876543210",
        status: "pending",
        dateCreated: "2024-01-15",
      },
      {
        id: 2,
        requestId: "REQ002",
        dealerName: "Priya Patel",
        tenant: "InnovateTech",
        phone: "+919876543211",
        status: "approved",
        dateCreated: "2024-02-10",
      },
    ]);

    const getStatusColor = (status) => {
      switch (status) {
        case "active":
        case "approved":
          return "success";
        case "inactive":
        case "rejected":
          return "error";
        case "pending":
          return "warning";
        default:
          return "grey";
      }
    };

    const configureTenant = (tenant) => {
      console.log("Configure tenant:", tenant);
    };

    const manageDevice = (device) => {
      console.log("Manage device:", device);
    };

    const approveDealerRequest = (requestId) => {
      const request = dealerRequests.value.find((r) => r.id === requestId);
      if (request) {
        request.status = "approved";
      }
    };

    const rejectDealerRequest = (requestId) => {
      const request = dealerRequests.value.find((r) => r.id === requestId);
      if (request) {
        request.status = "rejected";
      }
    };

    return {
      activeTab,
      tenantHeaders,
      deviceHeaders,
      dealerHeaders,
      tenants,
      devices,
      dealerRequests,
      getStatusColor,
      configureTenant,
      manageDevice,
      approveDealerRequest,
      rejectDealerRequest,
    };
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
