<!-- EmailVerification.vue -->
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="h-100">
      <!-- Full Background Image - EXACT SAME AS verification.vue -->
      <v-col cols="12" class="d-flex align-center justify-end pa-0">
        <div
          class="background-container d-flex align-center justify-end h-100"
          :style="backgroundStyle"
        >
          <!-- Right Panel - EMAIL VERIFICATION FORM (EXACT SAME LAYOUT) -->
          <div class="login-container">
            <!-- Redesigned verification card with EXACT SAME LAYOUT -->
            <v-card
              class="login-card"
              style="
                border: 2px solid #059669;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
              "
            >
              <!-- Logo and Tagline inside card header - SAME -->
              <div class="card-header">
                <div class="logo-section">
                  <img
                    src="/public/images/project.png"
                    alt="FieldsEasy"
                    class="logo-image"
                  />
                </div>
              </div>

              <!-- Sub Header with light green background - SAME -->
              <div class="card-subheader">
                <h2 class="subheader-title">Verify Your Email</h2>
              </div>

              <!-- Card content with improved spacing - SAME -->
              <div class="card-content">
                <!-- Error Alert - SAME POSITION -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ error }}
                </v-alert>

                <!-- Success Alert - SAME POSITION -->
                <v-alert
                  v-if="success"
                  type="success"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ success }}
                </v-alert>

                <!-- OTP Input - SAME FORM SECTION STYLE -->
                <div class="form-section">
                  <label class="form-label">Verification Code</label>
                  <div class="d-flex justify-center gap-2">
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
                  <div class="help-text">
                    Didn't receive?
                    <a
                      v-if="timer <= 0"
                      href="#"
                      @click.prevent="resendOtp"
                      class="signup-link"
                    >
                      {{ resendLoading ? "Sending..." : "Resend OTP" }}
                    </a>
                    <span v-else>Resend in {{ timer }}s</span>
                  </div>
                </div>

                <!-- Submit button with new styling - SAME -->
                <v-btn
                  @click="verifyCode"
                  :disabled="loading || !isValidOtp"
                  :loading="loading"
                  block
                  size="large"
                  class="submit-btn"
                >
                  {{ loading ? "Verifying..." : "Verify Code" }}
                </v-btn>

                <!-- Back link with improved styling - SAME -->
                <p class="signup-text">
                  <router-link to="/login" class="signup-link"
                    >Back to Login</router-link
                  >
                </p>
              </div>
            </v-card>

            <p class="footer-text">© 2025 Fieldseasy</p>
          </div>
        </div>
      </v-col>
    </v-row>
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
const userEmail = ref("");
const otpFields = ref([]);
const year = ref(new Date().getFullYear());
const timer = ref(30);
let timerInterval = null;

const isValidOtp = computed(() =>
  otpDigits.value.every((digit) => digit !== ""),
);
const displayEmail = computed(() => {
  return userEmail.value || localStorage.getItem("email") || "your email";
});

// Background image style - EXACT SAME AS verification.vue
const backgroundStyle = computed(() => ({
  backgroundImage: `url('/public/images/loginimage.png')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
}));

// ALL EXISTING FUNCTIONS - 100% UNCHANGED
function startTimer() {
  timer.value = 30;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value -= 1;
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
    await onEmailSubmit(userEmail.value);
    success.value = "OTP sent successfully!";
    setTimeout(() => clearSuccess(), 3000);
    startTimer();
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      if (otpFields.value[0]) {
        otpFields.value[0].focus();
      }
    });
  } catch (err) {
    error.value = err?.message || "Failed to resend OTP. Please try again.";
  } finally {
    resendLoading.value = false;
  }
}

async function onEmailSubmit(email) {
  error.value = "";
  success.value = "";
  if (!validEmail(email)) {
    error.value = "Enter a valid email address.";
    return;
  }
  try {
    const emailExists = await authService.checkEmailExists(email);
    if (!emailExists) {
      error.value = "This email is not registered. Please sign up first.";
      return;
    }

    const isResigned = await authService.checkUserResignedByEmail(email);
    if (isResigned) {
      error.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/emailLogin/generate-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, userApp: "fieldeasy" }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.otp_session_uuid) {
      throw new Error(
        data?.message || "Could not start email session. Try again.",
      );
    }
    localStorage.setItem("email", email);
    localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
    router.push({ name: "EmailVerification", params: { email: email } });
  } catch (err) {
    throw err;
  }
}

function validEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
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
    const sessionUuid = localStorage.getItem("emailSessionUuid");
    const email = userEmail.value;

    if (!sessionUuid || !email) {
      error.value = "Session expired. Please go back to login.";
      loading.value = false;
      return;
    }

    const response = await authService.verifyEmailOtp(otp, sessionUuid, email);

    if (response && response.token) {
      success.value = "OTP verified successfully!";
      setTimeout(() => {
        clearSuccess();
        localStorage.setItem("fromEmailOtp", "true");
        router.push({
          name: "PinVerification",
          params: {
            contactType: "email",
            contactValue: email,
          },
          query: { fromEmail: true },
        });
      }, 2000);
    } else {
      error.value = "OTP is wrong, please enter correct OTP.";
      otpDigits.value = Array(6).fill("");
      nextTick(() => {
        if (otpFields.value[0]) {
          otpFields.value[0].focus();
        }
      });
    }
  } catch (err) {
    console.error("Email OTP verification error:", err);
    error.value =
      err?.response?.data?.message || "OTP is wrong, please enter correct OTP.";
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      if (otpFields.value[0]) {
        otpFields.value[0].focus();
      }
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  userEmail.value = localStorage.getItem("email") || route.params.email;
  if (!userEmail.value) {
    error.value = "Email not found. Please go back to login.";
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
/* emailVerification.css */
.h-100 {
  height: 100%;
}

.background-container {
  position: relative;
  width: 100%;
}

/* DESKTOP - Background Image */
@media (min-width: 961px) {
  .background-container {
    background-image: url("/public/images/loginimage.png") !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    min-height: 100vh !important;
  }
}

.login-container {
  max-width: 520px;
  width: 100%;
  z-index: 10;
  margin-right: 170px;
  position: relative;
}

/* Logo section styling - SAME */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-image {
  height: 130px;
  width: auto;
}

/* Card header styling - SAME */
.card-header {
  text-align: center;
}

/* Sub header styling - SAME */
.card-subheader {
  background: #abffb54d;
  padding: 14px 24px;
  text-align: center;
  border-bottom: 1px solid #5fb96e;
  border-top: 1px solid #5fb96e;
}

.subheader-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  letter-spacing: 0.3px;
}

/* Card content styling - SAME */
.card-content {
  padding: 20px 24px;
  background: white;
  margin-bottom: 250px;
}

/* Form section styling - SAME */
.form-section {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.gap-2 {
  gap: 8px;
}

.otp-input-field {
  flex: 0 0 50px !important;
  max-width: 50px !important;
  min-width: 40px !important;
}

.otp-input-field :deep(.v-field) {
  height: 40px !important;
  padding: 0 !important;
}

.otp-input-field :deep(.v-field__input) {
  text-align: center !important;
  font-size: 16px !important;
  padding: 0 4px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.otp-input-field.filled :deep(.v-field__outline) {
  border-color: #059669 !important;
}

.otp-input-field :deep(.v-field__outline) {
  border-width: 1px !important;
}

.help-text {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

/* Submit button styling - SAME */
.submit-btn {
  background: #059669 !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 12px 16px !important;
  margin-top: 16px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3) !important;
  transition: all 0.3s ease !important;
}

.submit-btn:hover:not(:disabled) {
  background: #0a7a73 !important;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4) !important;
}

/* Signup text styling - SAME */
.signup-text {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 16px;
  margin-bottom: 0;
}

.signup-link {
  color: #059669;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signup-link:hover {
  color: #0a7a73;
  text-decoration: underline;
}

.footer-text {
  text-align: center;
  font-size: 11px;
  color: #999;
  margin-top: 12px;
  margin-bottom: 0;
}

.login-card {
  transition: all 0.3s ease;
}

/* MOBILE - PLAIN WHITE BACKGROUND + CENTERED - SAME AS verification.vue */
@media (max-width: 960px) {
  .background-container {
    background: #ffffff !important;
    background-image: none !important;
  }

  .login-container {
    padding: 12px !important;
    margin: 0 auto !important;
    max-width: 480px;
    width: 90% !important;
  }

  .card-content {
    padding: 16px 20px;
    margin-bottom: 60px;
  }

  .otp-input-field {
    flex: 0 0 40px !important;
    max-width: 40px !important;
    min-width: 35px !important;
  }
}

@media (max-width: 768px) {
  .background-container {
    background: #ffffff !important;
    background-image: none !important;
  }

  .login-container {
    padding: 8px !important;
    margin: 0 auto !important;
    max-width: 100%;
    width: calc(100% - 16px) !important;
  }

  .card-content {
    padding: 16px 20px;
    margin-bottom: 40px;
  }

  .otp-input-field {
    flex: 0 0 35px !important;
    max-width: 35px !important;
    min-width: 30px !important;
  }
}

@media (max-width: 480px) {
  .background-container {
    background: #ffffff !important;
    background-image: none !important;
  }

  .login-container {
    padding: 8px !important;
    margin: 0 auto !important;
    max-width: 100%;
    width: calc(100% - 16px) !important;
  }

  .card-content {
    padding: 14px 16px;
    margin-bottom: 30px;
  }

  .subheader-title {
    font-size: 14px;
  }

  .form-label {
    font-size: 12px;
  }

  .otp-input-field {
    flex: 0 0 30px !important;
    max-width: 30px !important;
    min-width: 25px !important;
  }

  .otp-input-field :deep(.v-field__input) {
    font-size: 14px !important;
    padding: 0 2px !important;
  }

  .help-text {
    font-size: 11px;
  }

  .signup-text {
    font-size: 11px;
  }

  .footer-text {
    font-size: 10px;
  }
}
</style>
