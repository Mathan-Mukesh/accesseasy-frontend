<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Tabs -->
        <v-tabs v-model="activeTab" color="black" show-arrows>
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :to="{ name: tab.value }"
            style="text-transform: none"
            class="tab-text"
          >
            <v-icon :icon="tab.icon" class="mr-2"></v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <!-- Router View -->
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = [
  {
    value: "unapproved-devices",
    title: "Devices Manager",
    icon: "mdi-devices",
  },
  {
    value: "door-management",
    title: "Door Management",
    icon: "mdi-door",
  },
  {
    value: "accessLvl-category",
    title: "AccessLvl Category",
    icon: "mdi-lock-outline",
  },
];

const activeTab = ref(null);

onMounted(() => {
  activeTab.value = route.name;
});

watch(activeTab, (newValue) => {
  if (newValue && newValue !== route.name) {
    router.push({ name: newValue });
  }
});

watch(
  () => route.name,
  (newValue) => {
    if (newValue && newValue !== activeTab.value) {
      activeTab.value = newValue;
    }
  },
);
</script>

<style scoped>
.v-container {
  padding: 16px;
}

.v-tabs {
  margin-bottom: 20px;
}

.tab-text {
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
}

/* Optional: Add responsive styles */
@media (max-width: 600px) {
  .v-tab {
    min-width: unset;
  }
}
</style>
