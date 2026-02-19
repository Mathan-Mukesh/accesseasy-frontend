<!-- OtpVerification.vue -->
<template>
  <v-container fluid class="fill-height pa-0 login-page-container">
    <div class="login-card">
      <v-row no-gutters class="h-100">
        <!-- LEFT SIDE: Verification Form -->
        <v-col cols="12" md="6" class="d-flex flex-column justify-center align-center left-panel">
          <div class="login-wrapper">
            <!-- Logo -->
            <div class="logo-container mb-6">
              <img
                src="/images/accesseasylogo1.jpeg"
                alt="SafeGuard"
                class="logo-img"
              />
            </div>

            <!-- Header -->
            <div class="text-left mb-8">
              <h2 class="page-title">Verify Your Number</h2>
              <p class="page-subtitle">
                Enter the verification code sent to {{ displayContact }}
              </p>
            </div>

            <!-- Alerts -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ error }}
            </v-alert>

            <v-alert
              v-if="success"
              type="success"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ success }}
            </v-alert>

            <!-- OTP Input -->
            <div class="form-content">
              <label class="input-label">Verification Code</label>
              <div class="d-flex justify-center gap-2 mb-4">
                <v-text-field
                  v-for="(digit, index) in 6"
                  :key="index"
                  v-model="otpDigits[index]"
                  maxlength="1"
                  type="text"
                  density="comfortable"
                  variant="outlined"
                  class="otp-input-field"
                  :class="{ filled: otpDigits[index] }"
                  @input="handleInput(index)"
                  @keydown="handleKeydown($event, index)"
                  @focus="focusedIndex = index"
                  @blur="focusedIndex = -1"
                  ref="otpFields"
                />
              </div>
              <div class="page-subtitle mb-4">
                Didn't receive?
                <a
                  v-if="timer <= 0"
                  href="#"
                  @click.prevent="resendOtp"
                  class="link-text ml-1"
                >
                  {{ resendLoading ? "Sending..." : "Resend OTP" }}
                </a>
                <span v-else class="text-grey">Resend in {{ timer }}s</span>
              </div>
            </div>

            <!-- Submit Button -->
            <v-btn
              @click="verifyCode"
              :disabled="loading || !isValidOtp"
              :loading="loading"
              block
              height="56"
              color="#ef4444"
              class="submit-btn"
            >
              {{ loading ? "Verifying..." : "Verify Code" }}
              <v-icon end class="ml-2">mdi-arrow-right</v-icon>
            </v-btn>

            <!-- Back link -->
            <div class="text-center mt-4">
              <router-link to="/login" class="link-text"
                >Back to Login</router-link
              >
            </div>

            <!-- Footer -->
            <div class="footer-links mt-8 text-center">
              <p class="request-access" style="font-size: 12px;">
                © {{ year }} Fieldseasy
              </p>
            </div>
          </div>
        </v-col>

        <!-- RIGHT SIDE: Content & Visuals (Copied from login.vue) -->
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
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";

const router = useRouter();
const route = useRoute();

const otpDigits = ref(Array(6).fill(""));
const loading = ref(false);
const resendLoading = ref(false);
const error = ref("");
const success = ref("");
const focusedIndex = ref(-1);
const userPhone = ref("");
const userEmail = ref("");
const otpFields = ref([]);
const year = ref(new Date().getFullYear());
const timer = ref(30);
let timerInterval = null;

const isEmail = computed(() => !!route.params.email);
const isValidOtp = computed(() =>
  otpDigits.value.every((digit) => digit !== ""),
);
const displayContact = computed(() => {
  if (userEmail.value) return userEmail.value;
  const phone = userPhone.value || localStorage.getItem("userPhone");
  return phone ? `${phone}` : "your number";
});

// ALL EXISTING FUNCTIONS - 100% UNCHANGED
function startTimer() {
  timer.value = 30;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function clearSuccess() {
  success.value = "";
}

async function resendOtp() {
  resendLoading.value = true;
  error.value = "";
  success.value = "";

  try {
    const isEmail = route.params.email;
    if (isEmail) {
      const email = route.params.email;
      await authService.generateEmailOtp(email);
      success.value = `New OTP sent to ${email}`;
    } else {
      const phone = userPhone.value || localStorage.getItem("userPhone");
      if (!phone) {
        error.value = "Phone number not found.";
        return;
      }
      await authService.generateOtp(phone);
      success.value = `New OTP sent to ${displayContact.value}`;
    }

    setTimeout(() => clearSuccess(), 3000);
    startTimer();
    otpDigits.value = Array(6).fill("");
    nextTick(() => otpFields.value[0]?.focus());
  } catch (err) {
    error.value = err.message || "Failed to resend OTP";
  } finally {
    resendLoading.value = false;
  }
}

function handleInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => {
      otpFields.value[index + 1]?.focus();
    });
  }
}

function handleKeydown(event, index) {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    otpFields.value[index - 1].focus();
  }
  if (event.key === "Enter" && index === 5 && isValidOtp.value) {
    verifyCode();
  }
}

function clearError() {
  error.value = "";
}

async function verifyCode() {
  error.value = "";
  success.value = "";
  loading.value = true;

  if (!isValidOtp.value) {
    error.value = "Please enter all 6 digits.";
    loading.value = false;
    return;
  }

  try {
    const otp = otpDigits.value.join("");
    const isEmail = route.params.email;

    if (isEmail) {
      const email = route.params.email;
      const sessionUuid = localStorage.getItem("emailSessionUuid");
      const response = await authService.verifyEmailOtp(
        otp,
        sessionUuid,
        email,
      );

      if (response && response.token) {
        clearInterval(timerInterval);
        localStorage.setItem("fromOtp", "true");
        router.push({
          name: "PinVerification",
          params: {
            contactType: "email",
            contactValue: email,
          },
          query: { fromOtp: true },
        });
      } else {
        error.value = response?.message || "Invalid OTP. Please try again.";
        if (response?.message === "Invalid OTP or session") {
          error.value = "Invalid OTP or session expired. Please resend OTP.";
        }
      }
    } else {
      const sessionUuid = localStorage.getItem("sessionUuid");
      const phone = userPhone.value || localStorage.getItem("userPhone");

      if (!sessionUuid || !phone) {
        error.value = "Session expired. Please go back to login.";
        loading.value = false;
        return;
      }

      const response = await authService.verifyOtp(otp, sessionUuid, phone);

      if (response && response.token) {
        clearInterval(timerInterval);
        localStorage.setItem("fromOtp", "true");
        router.push({
          name: "PinVerification",
          params: {
            contactType: "phone",
            contactValue: phone,
          },
          query: { fromOtp: true },
        });
      } else {
        error.value = response?.message || "Invalid OTP. Please try again.";
        if (response?.message === "Invalid OTP or session") {
          error.value = "Invalid OTP or session expired. Please resend OTP.";
        }
      }
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    const errorMessage =
      err?.response?.data?.message ||
      err.message ||
      "Invalid OTP. Please try again.";
    if (errorMessage === "Invalid OTP or session") {
      error.value = "Invalid OTP or session expired. Please resend OTP.";
    } else {
      error.value = errorMessage;
    }

    otpDigits.value = Array(6).fill("");
    nextTick(() => otpFields.value[0]?.focus());
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  userPhone.value =
    localStorage.getItem("userPhone") || route.params.phoneNumber;
  userEmail.value = route.params.email;

  if (!userPhone.value && !userEmail.value) {
    error.value = "Contact not found. Please go back to login.";
    return;
  }

  startTimer();
  nextTick(() => {
    if (otpFields.value[0]) {
      otpFields.value[0].focus();
    }
  });
});

onUnmounted(() => {
  clearInterval(timerInterval);
});
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

/* Form Inputs */
.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* OTP Specific Styles */
.otp-input-field {
  flex: 0 0 50px !important;
  max-width: 50px !important;
  min-width: 40px !important;
}

.otp-input-field :deep(.v-field) {
  height: 50px !important;
  padding: 0 !important;
  border-radius: 12px !important;
  background: #f9fafb !important;
  border-color: #e5e7eb !important;
}

.otp-input-field :deep(.v-field__input) {
  text-align: center !important;
  font-size: 20px !important;
  font-weight: 600 !important;
  padding: 0 !important;
  min-height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.otp-input-field.filled :deep(.v-field__outline) {
  border-color: #ef4444 !important;
}

/* Button */
.submit-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.15) !important;
  background-color: #ef4444 !important;
  color: white !important;
  margin-top: 24px !important;
}

/* Links */
.link-text {
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
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
  border-radius: 12px;
}

.confidence-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.confidence-value {
  color: #2563eb;
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
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
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
  }
}
</style>
