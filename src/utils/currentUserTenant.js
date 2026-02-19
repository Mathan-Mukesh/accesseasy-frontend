// src/utils/currentUserTenant.js
import { authService } from "@/services/authService";

class CurrentUserTenant {
  constructor() {
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null;
    this.role = null;
    this.userId = null;
    this.isLoading = false;
    this.initialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    if (this.isLoading && this.initPromise) {
      return this.initPromise;
    }

    this.isLoading = true;
    this.initPromise = (async () => {
      try {
        await this.fetchLoginUserDetails();
        this.initialized = true;
      } catch (error) {
        console.error("Failed to initialize user data:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    })();

    return this.initPromise;
  }

  async fetchLoginUserDetails() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("User token not found");
      }

      if (!authService.isAuthenticated()) {
        throw new Error("User not authenticated");
      }

      const phone = authService.getPhone();
      const email = authService.getEmail();
      if (!phone && !email) {
        throw new Error("Phone or email not found");
      }

      // Prefer phone; fallback to email
      const formattedPhone =
        phone && !phone.startsWith("+91") ? `+91${phone}` : phone;

      const params = {
        fields:
          "id,tenant.tenantId,tenant.tenantName,role.name,phone,tenant.plan,tenant.accountSettings",
      };

      if (formattedPhone) {
        params["filter[_and][0][phone][_eq]"] = formattedPhone;
        params["filter[_and][1][userApp][_eq]"] = "fieldeasy";
      } else if (email) {
        params["filter[_and][0][email][_eq]"] = email;
        params["filter[_and][1][userApp][_eq]"] = "fieldeasy";
      }

      // Use the user's token instead of env token
      const userResponse = await authService.protectedApi.get("/users", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.data.data?.length) {
        const userData = userResponse.data.data[0];

        this.tenantId = userData.tenant?.tenantId || userData.tenant;
        this.tenantName = userData.tenant?.tenantName || null;

        this.tenantPlan = userData.tenant?.plan || null;
        if (typeof this.tenantPlan === "string") {
          try {
            this.tenantPlan = JSON.parse(this.tenantPlan);
          } catch (parseError) {
            console.warn("Failed to parse tenant plan JSON:", parseError);
          }
        }

        this.accountSettings = userData.tenant?.accountSettings || null;
        if (typeof this.accountSettings === "string") {
          try {
            this.accountSettings = JSON.parse(this.accountSettings);
          } catch (parseError) {
            console.warn("Failed to parse account settings JSON:", parseError);
          }
        }

        this.role = userData.role.name;
        this.userId = userData.id;

        // ✅ Save user & tenant details into authService for reuse
        authService.setUserData(userData);
        return userData;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching login user details:", error);
      if (error.response?.status === 401) {
        this.clearUserData();
        authService.logout();
      }
      throw error;
    }
  }

  clearUserData() {
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null;
    this.role = null;
    this.userId = null;
    this.initialized = false;
    this.isLoading = false;
    this.initPromise = null; // ✅ Clear promise
  }

  getTenantId() {
    if (!authService.isAuthenticated()) {
      return null;
    }
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantId;
  }

  getRole() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.role;
  }

  getUserId() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.userId;
  }

  getTenantName() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantName;
  }

  getTenantPlan() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantPlan;
  }

  getAccountSettings() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.accountSettings;
  }

  async refresh() {
    this.initialized = false;
    this.isLoading = false;
    this.initPromise = null;
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null;
    this.role = null;
    this.userId = null;

    await this.initialize();
    return {
      tenantId: this.tenantId,
      role: this.role,
      userId: this.userId,
    };
  }

  async getTenantIdAsync() {
    if (!authService.isAuthenticated()) {
      return null;
    }
    await this.initialize();
    return this.tenantId;
  }

  async getRoleAsync() {
    await this.initialize();
    return this.role;
  }

  async getUserIdAsync() {
    await this.initialize();
    return this.userId;
  }

  async getTenantNameAsync() {
    await this.initialize();
    return this.tenantName;
  }

  async getTenantPlanAsync() {
    await this.initialize();
    return this.tenantPlan;
  }

  async getAccountSettingsAsync() {
    await this.initialize();
    return this.accountSettings;
  }

  getPlanProperty(propertyName) {
    const plan = this.getTenantPlan();
    return plan && typeof plan === "object" ? plan[propertyName] : null;
  }

  async getPlanPropertyAsync(propertyName) {
    const plan = await this.getTenantPlanAsync();
    return plan && typeof plan === "object" ? plan[propertyName] : null;
  }

  getAccountSetting(propertyName) {
    const settings = this.getAccountSettings();
    return settings && typeof settings === "object"
      ? settings[propertyName]
      : null;
  }

  async getAccountSettingAsync(propertyName) {
    const settings = await this.getAccountSettingsAsync();
    return settings && typeof settings === "object"
      ? settings[propertyName]
      : null;
  }

  getCurrency() {
    return this.getAccountSetting("currency");
  }

  async getCurrencyAsync() {
    return await this.getAccountSettingAsync("currency");
  }
}

export const currentUserTenant = new CurrentUserTenant();
