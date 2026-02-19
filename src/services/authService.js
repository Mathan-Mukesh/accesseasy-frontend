// authService.js;
import axios from "axios";
import Cookies from "js-cookie";

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    this.protectedApi = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.protectedApi.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.protectedApi.interceptors.response.use(
      (response) => {
        this.updateLastActivity();
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          console.warn(
            "Unauthorized access. Token might be invalid or missing.",
          );
        }
        return Promise.reject(error);
      },
    );

    this.initInactivityTracking();
  }

  setToken(token) {
    Cookies.set("userToken", token, { expires: 365 * 20 });
    localStorage.setItem("userToken", token);
    this.protectedApi.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
    this.updateLastActivity();
  }

  getToken() {
    return Cookies.get("userToken") || localStorage.getItem("userToken");
  }

  setPhone(phone) {
    if (!phone) return;
    localStorage.setItem("userPhone", phone);
  }

  getPhone() {
    return localStorage.getItem("userPhone");
  }

  setEmail(email) {
    if (!email) return;
    localStorage.setItem("email", email);
  }

  getEmail() {
    return localStorage.getItem("email");
  }

  // Add tenant-related methods
  setTenantData(tenantData) {
    if (tenantData) {
      localStorage.setItem("tenantData", JSON.stringify(tenantData));
    }
  }

  getTenantData() {
    const tenantData = localStorage.getItem("tenantData");
    return tenantData ? JSON.parse(tenantData) : null;
  }

  getTenantName() {
    const tenantData = this.getTenantData();
    return tenantData?.tenantName || tenantData?.name || "";
  }

  getTenantId() {
    const tenantData = this.getTenantData();
    return tenantData?.tenantId || tenantData?.id || "";
  }

  // Add user-related methods
  setUserData(userData) {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
      // Also store tenant data if it exists in user data
      if (userData.tenant) {
        this.setTenantData(userData.tenant);
      }
    }
  }

  getUserData() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  getUserRole() {
    const userData = this.getUserData();
    return userData?.role?.name || "";
  }

  getUserId() {
    const userData = this.getUserData();
    return userData?.id || "";
  }

  getUserTenant() {
    const userData = this.getUserData();
    return userData?.tenant || this.getTenantData();
  }

  isAuthenticated() {
    return !!(this.getToken() && (this.getPhone() || this.getEmail()));
  }

  // logout() {
  //   localStorage.removeItem("sessionUuid");
  //   localStorage.removeItem("pinVerifiedInSession");
  //   localStorage.removeItem("userData");
  //   localStorage.removeItem("tenantData");
  //   window.location.href = "/login";
  // }

  // redirectToLogin() {
  //   window.location.href = "/login?timeout=true";
  // }

  logout() {
    Cookies.remove("userToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("email");
    localStorage.removeItem("sessionUuid");
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("userData");
    localStorage.removeItem("tenantData");
    delete this.protectedApi.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  }

  redirectToLogin() {
    window.location.href = "/login?timeout=true";
  }

  async checkPhoneExists(phone) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][phone][_contains]": phone,
          "filter[_and][1][userApp][_eq]": "fieldeasy",
        },
      });
      return response.data.data.length > 0;
    } catch (error) {
      console.error("Error checking phone:", error);
      throw error;
    }
  }

  async checkUserResigned(phone) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][phone][_contains]": phone,
          "filter[_and][1][userApp][_eq]": "fieldeasy",
          "fields[]": ["dateOfLeaving"],
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        const user = response.data.data[0];
        if (user.dateOfLeaving) {
          const parsedDate = this.parseDateString(user.dateOfLeaving);
          if (!parsedDate) return false;

          const today = new Date();
          parsedDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          return parsedDate <= today;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking resignation status:", error);
      throw error;
    }
  }

  parseDateString(dateString) {
    if (!dateString) return null;

    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;

    const formats = [
      /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/,
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
    ];

    for (const regex of formats) {
      const match = dateString.match(regex);
      if (match) {
        if (match[3]?.length === 4) {
          date = new Date(`${match[3]}-${match[2]}-${match[1]}`);
        } else {
          date = new Date(`${match[1]}-${match[2]}-${match[3]}`);
        }
        if (!isNaN(date.getTime())) return date;
      }
    }

    console.warn(`Could not parse date string: ${dateString}`);
    return null;
  }

  async generateOtp(phone) {
    try {
      const isResigned = await this.checkUserResigned(phone);
      if (isResigned) {
        throw new Error("RESIGNED_USER");
      }

      const response = await this.api.post("/sent-otp-sms", {
        phone,
        userApp: "fieldeasy",
      });

      if (response.data.otp_session_uuid) {
        localStorage.setItem("sessionUuid", response.data.otp_session_uuid);
        this.setPhone(phone);
      }

      return response.data;
    } catch (error) {
      console.error("Error generating OTP:", error);
      throw error;
    }
  }

  async verifyOtp(otp, sessionUuid, phone) {
    try {
      if (!otp || !sessionUuid || !phone) {
        throw new Error("Missing required verification data");
      }

      // Step 1: Verify OTP using /directus/verify-otp
      const verifyResponse = await this.api.post("/sent-otp-sms/verify-otp", {
        phone,
        otp,
        otp_session_uuid: sessionUuid,
      });

      if (!verifyResponse.data.success) {
        throw new Error(
          verifyResponse.data.message || "OTP verification failed",
        );
      }

      // Step 2: OTP verified, now fetch token
      const cleanPhone = phone.replace(/\D/g, "").replace(/^91/, "");
      const formattedPhone = "0" + cleanPhone;

      const tokenResponse = await this.api.get(
        `/flows/trigger/542de075-7445-49a5-bd18-c8d8b92b3440?otp=${otp}&session_uuid=${sessionUuid}&phone_number=${formattedPhone}`,
      );

      if (tokenResponse.data.token) {
        this.setToken(tokenResponse.data.token);
        this.setPhone(phone);
        localStorage.removeItem("sessionUuid");

        // Fetch and store user data after successful login
        try {
          const userData = await this.getCurrentUser();
          this.setUserData(userData);
        } catch (error) {
          console.error("Error fetching user data after login:", error);
        }
      }

      return tokenResponse.data;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }
    const phone = this.getPhone();
    const email = this.getEmail();
    if (phone) {
      return this.getUserByPhone(phone);
    } else if (email) {
      return this.getUserByEmail(email);
    } else {
      throw new Error("No phone or email found for current user");
    }
  }

  async getUserByPhone(phone) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][phone][_contains]": phone,
          "filter[_and][1][userApp][_eq]": "fieldeasy",
          "fields[]": [
            "id",
            "tenant.tenantId",
            "tenant.tenantName",
            "role.name",
            "phone",
            "first_name",
            "last_name",
            "email",
            "userPin",
            "dateOfLeaving",
          ],
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        const userData = response.data.data[0];
        this.setUserData(userData);
        return userData;
      }
      throw new Error("User not found");
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async checkEmailExists(email) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][email][_eq]": email,
          "filter[_and][1][userApp][_eq]": "fieldeasy",
        },
      });
      return response.data.data.length > 0;
    } catch (error) {
      console.error("Error checking email:", error);
      throw error;
    }
  }

  async checkUserResignedByEmail(email) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][email][_eq]": email,
          "filter[_and][1][userApp][_eq]": "fieldeasy",
          "fields[]": ["dateOfLeaving"],
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        const user = response.data.data[0];
        if (user.dateOfLeaving) {
          const parsedDate = this.parseDateString(user.dateOfLeaving);
          if (!parsedDate) return false;

          const today = new Date();
          parsedDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          return parsedDate <= today;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking resignation status by email:", error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][email][_eq]": email,
          "filter[_and][1][userApp][_eq]": "fieldeasy",
          "fields[]": [
            "id",
            "tenant.tenantId",
            "tenant.tenantName",
            "role.name",
            "phone",
            "first_name",
            "last_name",
            "email",
            "userPin",
            "dateOfLeaving",
            "otp",
          ],
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        const userData = response.data.data[0];
        this.setUserData(userData);
        return userData;
      }
      throw new Error("User not found");
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  async verifyEmailOtp(otp, sessionUuid, email) {
    try {
      if (!otp || !sessionUuid || !email) {
        throw new Error("Missing required verification data");
      }

      // Step 1: Fetch user data to get the stored OTP
      const userData = await this.getUserByEmail(email);

      if (!userData || userData.otp === null || userData.otp === undefined) {
        throw new Error("OTP not found for this user");
      }

      // Step 2: Compare entered OTP with stored OTP
      // Convert both to strings for comparison to handle type mismatch
      const storedOtp = String(userData.otp).trim();
      const enteredOtp = String(otp).trim();

      if (storedOtp !== enteredOtp) {
        throw new Error("OTP is wrong, please enter correct OTP");
      }

      // Step 3: OTP matches! Now call the trigger API
      const response = await this.api.get(
        `/flows/trigger/133d557a-42ac-480c-9fd9-49ced4bbf5e8?otp=${otp}&session_uuid=${sessionUuid}&email=${email}&user_app=fieldeasy`,
      );

      // Check if token is returned
      if (!response.data || !response.data.token) {
        throw new Error("Authentication failed");
      }

      // Store token and clean up
      this.setToken(response.data.token);
      this.setEmail(email);
      localStorage.removeItem("emailSessionUuid");

      // Fetch and store user data after successful login
      try {
        this.setUserData(userData);
      } catch (error) {
        console.error("Error storing user data after email login:", error);
      }

      return response.data;
    } catch (error) {
      console.error("Error verifying email OTP:", error);

      // Return specific error message
      if (error.message.includes("OTP is wrong")) {
        throw new Error("OTP is wrong, please enter correct OTP");
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }

  // 🔥 FIXED: FORGOT PIN METHODS - PRESERVE +91
  async forgotPin({ phone, email, userApp = "fieldeasy" }) {
    try {
      const payload = {
        userApp,
      };

      // 🔥 DON'T strip + symbol - send phone AS IS
      if (phone) {
        payload.phone = phone; // Keep +91 intact
      }
      if (email) {
        payload.email = email;
      }
      const response = await this.api.post("/pin/forgot-pin", payload);
      return response.data;
    } catch (error) {
      console.error("Error forgot PIN:", error);
      throw error;
    }
  }

  async verifyForgotPinOtp({ phone, email, otp }) {
    try {
      const payload = { otp };

      // 🔥 DON'T strip + symbol - send phone AS IS
      if (phone) {
        payload.phone = phone;
      }
      if (email) {
        payload.email = email;
      }

      const response = await this.api.post(
        "/pin/verify-forgotpin-otp",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying forgot PIN OTP:", error);
      throw error;
    }
  }

  setPinVerified(value) {
    localStorage.setItem("pinVerifiedInSession", value ? "true" : "false");
  }

  isPinVerified() {
    return localStorage.getItem("pinVerifiedInSession") === "true";
  }

  initInactivityTracking() {
    if (typeof window !== "undefined") {
      this.updateLastActivity();
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
      ];

      events.forEach((event) => {
        document.addEventListener(event, this.updateLastActivity.bind(this));
      });

      setInterval(this.checkInactivity.bind(this), 60000);
    }
  }

  updateLastActivity() {
    localStorage.setItem("lastActivityTime", Date.now().toString());
  }

  checkInactivity() {
    if (!this.isAuthenticated()) return;

    const lastActivity = Number.parseInt(
      localStorage.getItem("lastActivityTime") || "0",
    );
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivity;
    const inactivityTimeout = 3600000; // 1 hour

    if (inactiveTime > inactivityTimeout) {
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "session-timeout-modal-overlay";
      modalOverlay.style.position = "fixed";
      modalOverlay.style.top = "0";
      modalOverlay.style.left = "0";
      modalOverlay.style.width = "100%";
      modalOverlay.style.height = "100%";
      modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modalOverlay.style.display = "flex";
      modalOverlay.style.alignItems = "center";
      modalOverlay.style.justifyContent = "center";
      modalOverlay.style.zIndex = "9999";

      // Create modal content
      const modalContent = document.createElement("div");
      modalContent.className = "session-timeout-modal-content";
      modalContent.style.backgroundColor = "white";
      modalContent.style.borderRadius = "8px";
      modalContent.style.padding = "20px";
      modalContent.style.width = "90%";
      modalContent.style.maxWidth = "400px";
      modalContent.style.textAlign = "center";
      modalContent.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";

      // Create icon
      const icon = document.createElement("div");
      icon.style.width = "60px";
      icon.style.height = "60px";
      icon.style.backgroundColor = "#ff5252";
      icon.style.borderRadius = "50%";
      icon.style.display = "flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";
      icon.style.margin = "0 auto 20px";
      icon.innerHTML =
        "<span style='color: white; font-size: 30px; font-weight: bold;'>!</span>";

      // Create heading
      const heading = document.createElement("h3");
      heading.style.fontSize = "22px";
      heading.style.color = "#333";
      heading.style.marginBottom = "10px";
      heading.textContent = "Session Expired";

      // Create message
      const message = document.createElement("p");
      message.style.fontSize = "16px";
      message.style.color = "#666";
      message.style.marginBottom = "20px";
      message.textContent = "Your session has expired due to inactivity.";

      // Create OK button
      const okButton = document.createElement("button");
      okButton.style.backgroundColor = "#ff5252";
      okButton.style.color = "white";
      okButton.style.border = "none";
      okButton.style.borderRadius = "4px";
      okButton.style.padding = "10px 20px";
      okButton.style.fontSize = "16px";
      okButton.style.fontWeight = "600";
      okButton.style.cursor = "pointer";
      okButton.textContent = "OK";
      okButton.onclick = () => {
        document.body.removeChild(modalOverlay);
        this.redirectToLogin();
      };

      // Assemble modal
      modalContent.appendChild(icon);
      modalContent.appendChild(heading);
      modalContent.appendChild(message);
      modalContent.appendChild(okButton);
      modalOverlay.appendChild(modalContent);

      // Add modal to body
      document.body.appendChild(modalOverlay);
    }
  }
}

export const authService = new AuthService();
