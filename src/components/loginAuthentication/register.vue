<!-- register.vue -->
<template>
  <v-container fluid class="fill-height pa-0 login-page-container">
    <div class="login-card">
      <v-row no-gutters class="h-100">
        <!-- LEFT SIDE: Register Form -->
        <v-col cols="12" md="6" class="d-flex flex-column left-panel">
          <div class="login-wrapper mx-auto my-auto">
            <!-- Logo -->
            <div class="logo-container mb-6">
               <img
                src="/public/images/accesseasylogo1.jpeg"
                alt="SafeGuard"
                class="logo-img"
              />
            </div>

            <!-- Header -->
            <div class="text-left mb-6">
              <h2 class="page-title">Create Account</h2>
              <p class="page-subtitle">
                Sign up to manage your access and security.
              </p>
            </div>

            <!-- Form -->
            <v-form ref="form" class="register-form">
               <!-- Grid for Personal Details -->
               <div class="grid-row mb-2">
                 <div class="field-group">
                   <label class="input-label">Full Name <span class="text-red">*</span></label>
                   <v-text-field
                     v-model="fullName"
                     placeholder="Enter full name"
                     variant="outlined"
                     density="comfortable"
                     :rules="requiredRule"
                     hide-details="auto"
                     class="custom-field"
                   ></v-text-field>
                 </div>
                 <div class="field-group">
                   <label class="input-label">Phone Number <span class="text-red">*</span></label>
                   <v-text-field
                     v-model="mobileNumber"
                     placeholder="Enter phone"
                     variant="outlined"
                     density="comfortable"
                     :rules="phoneRules"
                     type="tel"
                     hide-details="auto"
                     class="custom-field"
                   ></v-text-field>
                 </div>
               </div>

               <div class="grid-row mb-2">
                 <div class="field-group">
                   <label class="input-label">Email <span class="text-red">*</span></label>
                   <v-text-field
                     v-model="email"
                     placeholder="Enter email"
                     variant="outlined"
                     density="comfortable"
                     :rules="emailRules"
                     type="email"
                     @input="email = email.toLowerCase()"
                     hide-details="auto"
                     class="custom-field"
                   ></v-text-field>
                 </div>
                 <div class="field-group">
                   <label class="input-label">Employee ID <span class="text-red">*</span></label>
                   <v-text-field
                     v-model="employeeId"
                     placeholder="Enter ID"
                     variant="outlined"
                     density="comfortable"
                     :rules="requiredRule"
                     hide-details="auto"
                     class="custom-field"
                   ></v-text-field>
                 </div>
               </div>

               <!-- Company Details -->
               <div class="mb-2">
                 <label class="input-label">Company Name <span class="text-red">*</span></label>
                 <v-text-field
                   v-model="companyName"
                   placeholder="Enter company name"
                   variant="outlined"
                   density="comfortable"
                   :rules="requiredRule"
                   hide-details="auto"
                   class="custom-field"
                 ></v-text-field>
               </div>

               <div class="mb-6">
                 <label class="input-label">Company Address <span class="text-red">*</span></label>
                 <v-textarea
                   v-model="companyAddress"
                   placeholder="Enter company address"
                   variant="outlined"
                   density="comfortable"
                   :rules="requiredRule"
                   rows="2"
                   hide-details="auto"
                   class="custom-field address-textarea"
                 ></v-textarea>
               </div>

               <!-- Submit Button -->
               <v-btn
                 block
                 height="56"
                 color="#ef4444"
                 class="submit-btn"
                 :loading="isLoading"
                 :disabled="!isFormValid || isLoading"
                 @click="handleRegistration"
               >
                 Create Account
                 <v-icon end class="ml-2">mdi-arrow-right</v-icon>
               </v-btn>

               <!-- Footer -->
               <div class="footer-links mt-6 text-center">
                 <p class="request-access">
                   Already have an account? <span class="link-text" @click="router.push('/login')">Sign In</span>
                 </p>
               </div>
            </v-form>
          </div>
        </v-col>

        <!-- RIGHT SIDE: Content & Visuals (EXACT COPY FROM LOGIN) -->
        <v-col cols="12" md="6" class="d-none d-md-flex flex-column justify-center align-center right-panel pa-10">
          <div class="right-content-wrapper text-center">
            <h2 class="right-title">Total Security Ecosystem.<br>Any Method. Any Door.</h2>
            <p class="right-subtitle mt-4 mb-10">
              Seamless integration of Biometrics, QR, AI Cameras, and traditional locks.
            </p>

            <!-- Dashboard Mockup Visual -->
            <div class="dashboard-mockup">
              <!-- Background Card (System Integrity) -->
              <div class="mockup-card background-card">
                <div class="card-header-sm">
                  <span class="header-text">SYSTEM INTEGRITY</span>
                  <span class="status-badge">● MONITORING</span>
                </div>
                <div class="card-grid">
                  <div class="grid-item">
                    <v-icon color="#3b82f6" size="large">mdi-door</v-icon>
                    <div class="item-label">Doors</div>
                    <div class="item-status success">SECURE</div>
                  </div>
                  <div class="grid-item">
                    <v-icon color="#3b82f6" size="large">mdi-cctv</v-icon>
                    <div class="item-label">AI Cam</div>
                    <div class="item-status info">DETECTING</div>
                  </div>
                </div>
              </div>

              <!-- Foreground Card (Event) -->
              <div class="mockup-card foreground-card">
                <div class="event-row">
                  <div class="event-icon-wrapper">
                    <v-icon color="#3b82f6">mdi-face-recognition</v-icon>
                    <div class="scan-line"></div>
                  </div>
                  <div class="event-details">
                    <div class="event-title">Event: Person Identified</div>
                    <div class="event-time">Lobby Cam 01 • 12:42 PM</div>
                  </div>
                  <div class="event-badge">
                    <v-icon start size="x-small">mdi-check-decagram</v-icon>
                    LOGGED
                  </div>
                </div>
                
                <div class="confidence-section mt-4">
                  <div class="confidence-header">
                    <span>AI Match Confidence</span>
                    <span class="confidence-value">99.8%</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 99.8%"></div>
                  </div>
                </div>
              </div>
              
               <!-- Multi-Factor Secured Badge -->
              <div class="security-badge">
                 <span class="dot"></span> Multi-Factor Secured
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- TOAST NOTIFICATIONS -->
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <ToastNotification
          v-for="toast in toasts"
          :key="toast.id"
          :show="true"
          :message="toast.message"
          :type="toast.type"
          @close="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";

const router = useRouter();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// ALL ORIGINAL REFS - CLEAN
const isLoading = ref(false);
const companyName = ref("");
const companyAddress = ref("");
const fullName = ref("");
const email = ref("");
const mobileNumber = ref("");
const employeeId = ref("");
const emailError = ref("");
const phoneError = ref("");
const form = ref(null);
const year = ref(new Date().getFullYear());

// ✅ VALIDATION STATE - Track if fields are valid
const isEmailValid = ref(false);
const isPhoneValid = ref(false);

// ✅ TOAST SYSTEM - SINGLE TOAST (replace old ones)
const toasts = ref([]);
let emailToastId = null;
let phoneToastId = null;

const addToast = (message, type = "info", duration = 5000) => {
  const id = Date.now() + Math.random();
  const toast = { id, message, type };
  toasts.value.push(toast);

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// ✅ TOAST SHORTCUTS
const showSuccess = (message, duration = 3000) =>
  addToast(message, "success", duration);
const showError = (message, duration = 5000) =>
  addToast(message, "error", duration);

// ✅ SHOW EMAIL ERROR ONLY ONCE
const showEmailError = (message, duration = 6000) => {
  if (emailToastId) removeToast(emailToastId);
  emailToastId = addToast(message, "error", duration);
};

// ✅ SHOW PHONE ERROR ONLY ONCE
const showPhoneError = (message, duration = 8000) => {
  if (phoneToastId) removeToast(phoneToastId);
  phoneToastId = addToast(message, "error", duration);
};

const requiredRule = [(v) => !!v || "This field is required"];
const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
  async (v) => await validateEmail(v),
];
const phoneRules = [
  (v) => !!v || "Phone number is required",
  (v) => /^\d{10}$/.test(v) || "Phone number must be 10 digits",
  async (v) => await validatePhoneNumber(v),
];

// ✅ COMPUTED PROPERTY - Check if form is valid
const isFormValid = computed(() => {
  return (
    companyName.value.trim() !== "" &&
    companyAddress.value.trim() !== "" &&
    fullName.value.trim() !== "" &&
    email.value.trim() !== "" &&
    mobileNumber.value.trim() !== "" &&
    employeeId.value.trim() !== "" &&
    isEmailValid.value &&
    isPhoneValid.value
  );
});

// ALL ORIGINAL FUNCTIONS - NOW WITH SINGLE TOASTS
async function validateForm() {
  if (!form.value) return false;
  const { valid, errors } = await form.value.validate();
  if (!valid) {
    const errorMsg = `Please correct the following errors: ${errors
      .map((err) => `${err.id}: ${err.errorMessages[0]}`)
      .join(", ")}`;
    showError(errorMsg, 7000);
    return false;
  }
  return true;
}

async function validateEmail(value) {
  if (!value) return true;
  try {
    const response = await api.get(`/users`, {
      params: {
        "filter[email][_eq]": value.toLowerCase(),
        "fields[]": "email",
      },
    });
    if (response.data.data.length > 0) {
      emailError.value =
        "This email is already registered. Please use a different email.";
      showEmailError(emailError.value);
      isEmailValid.value = false;
      return false;
    }
    emailError.value = "";
    isEmailValid.value = true;
    return true;
  } catch (error) {
    emailError.value =
      "An error occurred while validating the email. Please try again.";
    showEmailError(emailError.value);
    isEmailValid.value = false;
    return false;
  }
}

async function validatePhoneNumber(value) {
  if (!value) return true;
  try {
    const response = await api.get(`/users`, {
      params: {
        "filter[phone][_eq]": `+91${value}`,
        "fields[]": "phone",
        "fields[]": "userApp",
      },
    });
    if (
      response.data.data.some((user) =>
        user.userApp?.toLowerCase().includes("fieldeasy")
      )
    ) {
      phoneError.value =
        "This phone number is already registered for Fieldseasy. Please log in or use a different number.";
      showPhoneError(phoneError.value);
      isPhoneValid.value = false;
      return false;
    }
    phoneError.value = "";
    isPhoneValid.value = true;
    return true;
  } catch (error) {
    phoneError.value =
      "An error occurred while validating the phone number. Please try again.";
    showPhoneError(phoneError.value);
    isPhoneValid.value = false;
    return false;
  }
}

async function handleRegistration() {
  if (!(await validateForm())) return;

  isLoading.value = true;

  try {
    // Validate inputs
    if (!email.value.includes("@") || !email.value.includes(".")) {
      showError("Please enter a valid email address");
      isLoading.value = false;
      return;
    }
    if (!companyName.value) {
      showError("Company name is required");
      isLoading.value = false;
      return;
    }
    if (!employeeId.value) {
      showError("Please enter your employee ID");
      isLoading.value = false;
      return;
    }

    // Create tenant
    const tenantPayload = {
      tenantName: companyName.value,
      panOrGst: null,
      companyAddress: JSON.stringify(companyAddress.value || ""),
    };
    const tenantResponse = await api.post("/items/tenant", tenantPayload);
    if (tenantResponse.status !== 200 && tenantResponse.status !== 201) {
      throw new Error("Failed to create tenant");
    }
    const tenantId = tenantResponse.data.data.tenantId;

    // Create personal module
    const adminRoleId = "ea2303aa-1662-43ca-a7f7-ab84924a7e0a";
    const personalModulePayload = {
      status: "active",
      accessOn: true,
      employeeId: employeeId.value,
      cycleType: 1,
      uniqueId: `${tenantId}-${employeeId.value}`,
      assignedUser: {
        first_name: fullName.value,
        email: email.value,
        phone: mobileNumber.value ? `+91${mobileNumber.value}` : null,
        role: adminRoleId,
        tenant: tenantId,
        appAccess: true,
        userApp: "fieldeasy",
      },
    };
    const personalModuleResponse = await api.post(
      "/items/personalModule",
      personalModulePayload
    );
    if (
      personalModuleResponse.status !== 200 &&
      personalModuleResponse.status !== 201
    ) {
      throw new Error("Failed to create personal module");
    }

    // ✅ SUCCESS TOAST - SINGLE
    showSuccess("Registration successful! Redirecting to login...", 3000);
    setTimeout(() => router.push("/login"), 2000);
  } catch (e) {
    const errorMsg = e.response
      ? e.response.status === 429
        ? "Too many requests. Please try again later."
        : e.response.status >= 500
          ? "Server error. Please check registration_errors collection or contact support."
          : e.response.data.message || e.message
      : "An error occurred during registration. Please check registration_errors collection.";
    showError(errorMsg, 7000);
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Layout */
.h-100 {
  height: 100%;
}

.login-page-container {
  background-color: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 1200px;
  height: 800px; /* Fixed height for the card look */
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 20px;
}

.left-panel {
  background-color: #ffffff;
  padding: 40px;
  height: 100%;
  overflow-y: auto; /* Allow scrolling for the form */
}

.right-panel {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); /* Light orange gradient */
  position: relative;
  overflow: hidden;
  height: 100%;
}

.login-wrapper {
  max-width: 550px;
  width: 100%;
}

/* Logo */
.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 48px;
  width: auto;
}

/* Typography */
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

/* Form Inputs */
.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
}

/* Customizing v-text-field to look cleaner */
:deep(.v-field__outline) {
  --v-field-border-opacity: 0.15;
}

:deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
  color: #ef4444 !important;
}

:deep(.v-field) {
  border-radius: 12px !important;
  background-color: #f9fafb !important;
}

:deep(.v-field--focused) {
  background-color: #ffffff !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

/* Button */
.submit-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.15) !important;
}

/* Footer */
.request-access {
  font-size: 14px;
  color: #6b7280;
}

.link-text {
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
}

.link-text:hover {
  text-decoration: underline;
}

/* Right Side Styles */
.right-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
}

.right-subtitle {
  font-size: 16px;
  color: #4b5563;
  max-width: 400px;
  margin: 0 auto;
}

.dashboard-mockup {
  position: relative;
  width: 100%;
  max-width: 480px;
  height: 320px;
  margin-top: 20px;
}

.mockup-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: absolute;
  width: 100%;
  transition: all 0.3s ease;
}

/* Background Card (System Integrity) */
.background-card {
  top: 0;
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  padding: 20px;
  opacity: 0.6;
  z-index: 1;
  filter: blur(1px);
}

.card-header-sm {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-text {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 1px;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  color: #3b82f6;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.grid-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}

.item-label {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin-top: 8px;
}

.item-status {
  font-size: 10px;
  font-weight: 700;
  margin-top: 4px;
}

.item-status.success { color: #10b981; }
.item-status.info { color: #3b82f6; }

/* Foreground Card (Event) */
.foreground-card {
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 24px;
  z-index: 2;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.event-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.event-icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #3b82f6;
  animation: scan 2s infinite linear;
  opacity: 0.5;
}

@keyframes scan {
  0% { top: 10%; opacity: 0; }
  50% { opacity: 1; }
  100% { top: 90%; opacity: 0; }
}

.event-details {
  flex: 1;
  text-align: left;
}

.event-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.event-time {
  font-size: 12px;
  color: #6b7280;
}

.event-badge {
  background: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.confidence-section {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}

.confidence-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
}

.confidence-value {
  color: #10b981;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
}

.security-badge {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #059669;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dot {
  width: 6px;
  height: 6px;
  background: #059669;
  border-radius: 50%;
}

/* Toast Styles */
.toast-container {
  position: fixed;
  top: 4rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toast-list > * {
  pointer-events: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Mobile Responsiveness */
@media (max-width: 960px) {
  .login-card {
    height: auto;
    min-height: 100vh;
    border-radius: 0;
    margin: 0;
  }
  
  .left-panel {
    padding: 24px;
    height: auto;
    overflow-y: visible;
  }
  
  .grid-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .toast-container {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style>
