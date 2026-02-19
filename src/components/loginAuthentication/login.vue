<!-- login page.vue -->
<template>
  <v-container fluid class="fill-height pa-0 login-page-container">
    <div class="login-card">
      <v-row no-gutters class="h-100">
        <!-- LEFT SIDE: Login Form -->
        <v-col cols="12" md="6" class="d-flex flex-column justify-center align-center left-panel">
          <div class="login-wrapper">
            <!-- Logo -->
            <div class="logo-container mb-6">
               <img
                src="/public/images/accesseasylogo1.jpeg"
                alt="SafeGuard"
                class="logo-img"
              />
            </div>

            <!-- Header -->
            <div class="text-left mb-8">
              <h2 class="page-title">Advanced Access Portal</h2>
              <p class="page-subtitle">
                Secure login for managing Multi-Door, QR, AI Camera, and Biometric systems.
              </p>
            </div>

            <!-- Tabs -->
            <div class="tabs-container mb-6">
              <button
                @click="setMode('phone')"
                :class="['tab-btn', { active: mode === 'phone' }]"
              >
                <v-icon start size="small" class="mr-2">mdi-cellphone</v-icon>
                Phone
              </button>
              <button
                @click="setMode('email')"
                :class="['tab-btn', { active: mode === 'email' }]"
              >
                <v-icon start size="small" class="mr-2">mdi-email-outline</v-icon>
                Email
              </button>
            </div>

            <!-- Phone Form -->
            <div v-if="mode === 'phone'" class="form-content">
              <label class="input-label">Mobile Number</label>
              <div class="phone-input-group">
                <div class="country-flag">
                  <span class="flag-icon">🇮🇳</span>
                  <span class="country-code">+91</span>
                </div>
                <input
                  v-model="phoneRaw"
                  type="tel"
                  class="custom-input"
                  @input="sanitizePhone"
                  @keyup.enter="handleSubmit"
                />
              </div>
              <div v-if="phoneError" class="error-msg mt-1">{{ phoneError }}</div>
            </div>

            <!-- Email Form -->
            <div v-if="mode === 'email'" class="form-content">
              <label class="input-label">Email Address</label>
              <div class="email-input-group">
                <input
                  v-model="email"
                  type="email"
                  class="custom-input"
                  placeholder="name@company.com"
                  @keyup.enter="handleSubmit"
                />
              </div>
               <div v-if="emailError" class="error-msg mt-1">{{ emailError }}</div>
            </div>

            <!-- Secure Login Notice -->
            <div class="secure-notice mt-6 mb-6">
              <v-icon color="#3b82f6" size="small" class="mr-2">mdi-shield-check</v-icon>
              <span class="notice-text">
                <span class="notice-bold">Secure Login:</span> We will send a One-Time Password (OTP) to your registered device. No password required.
              </span>
            </div>

            <!-- Submit Button -->
            <v-btn
              block
              height="56"
              color="#ef4444"
              class="submit-btn"
              :loading="loading || emailLoading"
              @click="handleSubmit"
            >
              Send Verification Code
              <v-icon end class="ml-2">mdi-arrow-right</v-icon>
            </v-btn>

            <!-- Footer -->
            <div class="footer-links mt-8 text-center">
              <p class="request-access">
                New to the system? <span class="link-text" @click="goToRegister">Sign Up</span>
              </p>
              <!-- <div class="legal-links mt-2">
                <span class="legal-link">Privacy Policy</span>
                <span class="divider">•</span>
                <span class="legal-link">Terms of Service</span>
              </div> -->
            </div>
          </div>
        </v-col>

        <!-- RIGHT SIDE: Content & Visuals -->
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
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";

const router = useRouter();
const mode = ref("phone");
const phoneRaw = ref("");
const phoneError = ref("");
const loading = ref(false);
const email = ref("");
const emailError = ref("");
const emailLoading = ref(false);

function setMode(next) {
  mode.value = next;
  phoneError.value = "";
  emailError.value = "";
}

function sanitizePhone() {
  phoneRaw.value = (phoneRaw.value || "").replace(/\D/g, "").slice(0, 10);
  if (phoneError.value) phoneError.value = "";
}

function validPhone(num) {
  return /^\d{10}$/.test(num);
}

function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

async function onPhoneSubmit() {
  phoneError.value = "";
  const digits = (phoneRaw.value || "").replace(/\D/g, "");

  if (!validPhone(digits)) {
    phoneError.value = "Please enter a valid 10-digit mobile number.";
    return;
  }

  loading.value = true;

  try {
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("fromOtp");

    const fullPhoneNumber = "+91" + digits;

    const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
    if (!phoneExists) {
      phoneError.value =
        "This phone number is not registered. Please sign up first.";
      return;
    }

    const isResigned = await authService.checkUserResigned(fullPhoneNumber);
    if (isResigned) {
      phoneError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    const user = await authService.getUserByPhone(fullPhoneNumber);
    const hasPin = user && user.userPin;

    const token = authService.getToken();
    const isTokenValid = token && authService.isAuthenticated();

    localStorage.setItem("userPhone", digits);

    if (!hasPin || (hasPin && !isTokenValid)) {
      await proceedToOtpVerification(fullPhoneNumber);
    } else if (hasPin && isTokenValid) {
      router.push({
        name: "PinVerification",
        params: { phoneNumber: digits },
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    let errorMessage =
      "An error occurred. Please try again or check the internet connection";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    phoneError.value = errorMessage;
  } finally {
    loading.value = false;
  }
}

async function proceedToOtpVerification(fullPhoneNumber) {
  try {
    let response = await authService.generateOtp(fullPhoneNumber);

    if (typeof response === "string") {
      try {
        response = JSON.parse(response);
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }
    }

    if (response && response.otp_session_uuid) {
      localStorage.setItem("sessionUuid", response.otp_session_uuid);
      localStorage.setItem("fromOtp", "true");
      localStorage.setItem("fullPhoneNumber", fullPhoneNumber);

      router.push({
        name: "Verification",
        params: { phoneNumber: fullPhoneNumber.slice(3) },
      });
    } else {
      let backendMessage = "Failed to generate OTP. Please try again.";

      if (response?.message) {
        backendMessage = response.message;
      } else if (response?.msg91Response?.message) {
        backendMessage = `${response.message || "OTP Error:"} ${response.msg91Response.message}`;
      }

      phoneError.value = backendMessage;
    }
  } catch (error) {
    console.error("Error generating OTP:", error);

    let errorMessage = "Failed to generate OTP. Please try again.";

    if (error.message === "RESIGNED_USER") {
      errorMessage =
        "Resigned Employee has No access. Please contact your Company Admin .";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data) {
      const data = error.response.data;
      if (data.message) {
        errorMessage = data.message;
      } else if (data.msg91Response?.message) {
        errorMessage = `${data.message || "OTP Error:"} ${data.msg91Response.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    phoneError.value = errorMessage;
  }
}

async function onEmailSubmit() {
  emailError.value = "";

  if (!validEmail(email.value)) {
    emailError.value = "Enter a valid email address.";
    return;
  }

  emailLoading.value = true;

  try {
    const emailExists = await authService.checkEmailExists(email.value);
    if (!emailExists) {
      emailError.value = "This email is not registered. Please sign up first.";
      return;
    }

    const isResigned = await authService.checkUserResignedByEmail(email.value);
    if (isResigned) {
      emailError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/emailLogin/generate-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value, userApp: "fieldeasy" }),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.otp_session_uuid) {
      throw new Error(
        data?.message || "Could not start email session. Try again.",
      );
    }

    localStorage.setItem("email", email.value);
    localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
    router.push({ name: "EmailVerification", params: { email: email.value } });
  } catch (err) {
    emailError.value =
      err?.message || "Something went wrong. Please try again.";
  } finally {
    emailLoading.value = false;
  }
}

function handleSubmit() {
  if (mode.value === "phone") {
    onPhoneSubmit();
  } else {
    onEmailSubmit();
  }
}

function goToRegister() {
  router.push({ name: "Register" });
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
}

.right-panel {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); /* Light orange gradient */
  position: relative;
  overflow: hidden;
  height: 100%;
}

.login-wrapper {
  max-width: 440px;
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

/* Tabs */
.tabs-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  background: #f9fafb;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
  cursor: pointer;
}

.tab-btn.active {
  background: #ffffff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Form Inputs */
.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.phone-input-group {
  display: flex;
  gap: 12px;
}

.country-flag {
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  gap: 8px;
}

.flag-icon {
  font-size: 20px;
}

.country-code {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.custom-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  color: #111827;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
  outline: none;
}

.custom-input:focus {
  background: #ffffff;
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.email-input-group .custom-input {
  width: 100%;
}

.error-msg {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
}

/* Secure Notice */
.secure-notice {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
}

.notice-text {
  font-size: 13px;
  color: #1e40af;
  line-height: 1.5;
}

.notice-bold {
  font-weight: 700;
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

.legal-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.legal-link {
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
}

.legal-link:hover {
  color: #6b7280;
}

.divider {
  color: #d1d5db;
  font-size: 10px;
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
  border-radius: 12px;
}

.confidence-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 8px;
}

.confidence-value {
  font-weight: 700;
  color: #111827;
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
  background: #2563eb;
  border-radius: 3px;
}

.security-badge {
  position: absolute;
  bottom: -40px;
  right: 0;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
}

/* Responsive */
@media (max-width: 960px) {
  .left-panel {
    padding: 24px;
  }
}
</style>
