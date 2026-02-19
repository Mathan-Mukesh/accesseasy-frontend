<!-- PinVerification.vue -->
<template>
  <v-container fluid class="fill-height pa-0 login-page-container">
    <div class="login-card">
      <v-row no-gutters class="h-100">
        <!-- LEFT SIDE: PIN Verification Form -->
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
              <h2 class="page-title">{{ pageHeader }}</h2>
              <p class="page-subtitle">
                {{ pageTitle }}
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
              v-if="successMessage"
              type="success"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              {{ successMessage }}
            </v-alert>

            <!-- ENTER PIN STEP -->
            <div v-if="currentStep === STEP.ENTER_PIN">
              <div v-if="!maxAttemptsReached" class="form-content">
                <label class="input-label">PIN</label>
                <div class="d-flex justify-center gap-2 pin-container mb-4">
                  <v-text-field
                    v-for="(digit, index) in 4"
                    :key="`enterpin-${index}`"
                    v-model="pinDigits[index]"
                    maxlength="1"
                    :type="showPin ? 'text' : 'password'"
                    density="comfortable"
                    variant="outlined"
                    class="pin-digit-input"
                    :class="{ filled: pinDigits[index] }"
                    @input="handlePinDigitInput(index)"
                    @keydown="handlePinKeydown($event, index)"
                    @focus="focusedIndex = index"
                    @blur="focusedIndex = -1"
                    ref="pinFields"
                  />
                  <!-- EYE ICON ON RIGHT SIDE -->
                  <v-icon
                    :icon="showPin ? 'mdi-eye' : 'mdi-eye-off'"
                    size="20"
                    :color="showPin ? '#059669' : '#666'"
                    class="pin-eye-icon-right"
                    @click="showPin = !showPin"
                  />
                </div>
              </div>

              <!-- MAX ATTEMPTS REACHED -->
              <div v-else class="form-content text-center">
                <v-icon size="48" color="#fc5354" class="mb-2">mdi-lock-alert</v-icon>
                <p class="page-subtitle mb-2" style="color: #fc5354; font-weight: 600;">Maximum Attempts Reached</p>
                <p class="page-subtitle mb-4">
                  Please reset your PIN to continue
                </p>

                <BaseButton
                  @click="startForgotPinFlow"
                  :disabled="loading"
                  :loading="loading"
                  block
                  size="lg"
                  variant="danger"
                  class="reset-btn"
                >
                  {{ loading ? "Sending..." : "Reset PIN" }}
                </BaseButton>
              </div>

              <!-- Buttons - ONLY FOR NORMAL ENTRY -->
              <BaseButton
                v-if="!maxAttemptsReached"
                @click="handlePinAction"
                :disabled="loading || !isValidPin"
                :loading="loading"
                block
                size="lg"
                variant="primary"
                class="submit-btn"
              >
                {{ loading ? "Verifying..." : "Verify PIN" }}
                <v-icon end class="ml-2">mdi-arrow-right</v-icon>
              </BaseButton>

              <!-- Reset PIN Link -->
              <div
                v-if="currentStep === STEP.ENTER_PIN && !maxAttemptsReached"
                class="text-center mt-4"
              >
                <a
                  href="#"
                  @click.prevent="startForgotPinFlow"
                  class="link-text"
                >
                  Reset PIN
                </a>
              </div>

              <!-- Switch Account Link -->
              <div v-if="!maxAttemptsReached" class="text-center mt-2">
                <a
                  href="#"
                  @click.prevent="goToAlternateLogin"
                  class="link-text"
                  style="color: #6b7280; font-weight: normal;"
                >
                  Switch Account
                </a>
              </div>
            </div>

            <!-- VERIFY OTP STEP -->
            <div v-else-if="currentStep === STEP.VERIFY_OTP" class="form-content">
              <label class="input-label">Enter OTP</label>
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
                  @input="handleOtpInput(index)"
                  @keydown="handleOtpKeydown($event, index)"
                  @focus="otpFocusedIndex = index"
                  @blur="otpFocusedIndex = -1"
                  ref="otpFields"
                />
              </div>
              <div class="page-subtitle mb-4">
                Didn't receive?
                <a
                  href="#"
                  @click.prevent="resendOtp"
                  class="link-text ml-1"
                >
                  {{ loading ? "Sending..." : "Send again" }}
                </a>
              </div>
            </div>

            <!-- CREATE PIN STEP -->
            <div v-else class="form-content">
              <label class="input-label">
                {{ isConfirmingPin ? "Confirm PIN" : "New PIN" }}
              </label>
              <div class="d-flex justify-center gap-2 pin-container mb-4">
                <v-text-field
                  v-for="(digit, index) in 4"
                  :key="`newpin-${index}`"
                  v-model="newPinDigits[index]"
                  maxlength="1"
                  :type="showPin ? 'text' : 'password'"
                  density="comfortable"
                  variant="outlined"
                  class="pin-digit-input"
                  :class="{ filled: newPinDigits[index] }"
                  @input="handleNewPinDigitInput(index)"
                  @keydown="handleNewPinKeydown($event, index)"
                  @focus="newPinFocusedIndex = index"
                  @blur="newPinFocusedIndex = -1"
                  ref="newPinFields"
                />
                <!-- EYE ICON ON RIGHT SIDE -->
                <v-icon
                  :icon="showPin ? 'mdi-eye' : 'mdi-eye-off'"
                  size="20"
                  :color="showPin ? '#059669' : '#666'"
                  class="pin-eye-icon-right"
                  @click="showPin = !showPin"
                />
              </div>
            </div>

            <!-- Submit Buttons for OTP/CREATE PIN -->
            <BaseButton
              v-if="currentStep !== STEP.ENTER_PIN"
              @click="
                currentStep === STEP.VERIFY_OTP
                  ? verifyForgotPinOtp()
                  : handleNewPinAction()
              "
              :disabled="
                loading ||
                (currentStep === STEP.VERIFY_OTP
                  ? !isValidOtp
                  : !isValidNewPin)
              "
              :loading="loading"
              block
              size="lg"
              variant="primary"
              class="submit-btn"
            >
              {{
                loading
                  ? "Processing..."
                  : currentStep === STEP.VERIFY_OTP
                    ? "Verify OTP"
                    : isConfirmingPin
                      ? "Confirm PIN"
                      : "Create PIN"
              }}
              <v-icon end class="ml-2">mdi-arrow-right</v-icon>
            </BaseButton>

            <!-- Back to PIN Link -->
            <div v-if="currentStep !== STEP.ENTER_PIN" class="text-center mt-4">
              <a
                href="#"
                @click.prevent="resetToPinEntry"
                class="link-text"
              >
                Back to PIN
              </a>
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import crypto from "crypto-js";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

// PROPS
const props = defineProps({
  contactType: { type: String, required: true },
  contactValue: { type: String, required: true },
});

const route = useRoute();
const router = useRouter();

// CONSTANTS
const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const STEP = {
  ENTER_PIN: 1,
  VERIFY_OTP: 2,
  CREATE_PIN: 3,
};

// REACTIVE STATE
const pinDigits = ref(Array(4).fill(""));
const otpDigits = ref(Array(6).fill(""));
const newPinDigits = ref(Array(4).fill(""));
const currentPin = ref("");
const currentNewPin = ref("");
const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const currentStep = ref(STEP.ENTER_PIN);
const isConfirmingPin = ref(false);
const tempPin = ref("");
const attempts = ref(0);
const userPhone = ref("");
const userEmail = ref("");
const displayPhone = ref("");
const userId = ref(null);
const userPin = ref(null);
const showPin = ref(false);
const focusedIndex = ref(-1);
const otpFocusedIndex = ref(-1);
const newPinFocusedIndex = ref(-1);
const pinFields = ref([]);
const otpFields = ref([]);
const newPinFields = ref([]);
const year = ref(new Date().getFullYear());
const errorTimeout = ref(null);
const successTimeout = ref(null);
const isFirstTime = ref(false);
const maxAttemptsReached = ref(false);

// COMPUTED
const isValidPin = computed(() => pinDigits.value.every((d) => d !== ""));
const isValidOtp = computed(() => otpDigits.value.every((d) => d !== ""));
const isValidNewPin = computed(() => newPinDigits.value.every((d) => d !== ""));

const pageTitle = computed(() =>
  currentStep.value === STEP.ENTER_PIN
    ? maxAttemptsReached.value
      ? "Reset Your PIN"
      : "Secure PIN verification"
    : currentStep.value === STEP.VERIFY_OTP
      ? "Enter OTP"
      : "Create New PIN",
);
const pageHeader = computed(() =>
  currentStep.value === STEP.ENTER_PIN
    ? maxAttemptsReached.value
      ? "Reset PIN Required"
      : "Enter Your PIN"
    : currentStep.value === STEP.VERIFY_OTP
      ? "Verify OTP"
      : isConfirmingPin.value
        ? "Confirm PIN"
        : isFirstTime.value
          ? "Set Up Your PIN"
          : "Create Your PIN",
);
const visibleSteps = computed(() => [STEP.VERIFY_OTP, STEP.CREATE_PIN]);
const contactType = computed(() => (userEmail.value ? "Email" : "Phone"));
const userContact = computed(() => userEmail.value || userPhone.value);
const displayContact = computed(() =>
  userEmail.value ? userEmail.value : displayPhone.value,
);

/* ------------------------------------------------------------------ */
/* INPUT HANDLERS – ONLY MOVE FOCUS, NO AUTO‑SUBMIT                     */
/* ------------------------------------------------------------------ */
function handlePinDigitInput(index) {
  pinDigits.value[index] = pinDigits.value[index].replace(/[^0-9]/g, "");
  currentPin.value = pinDigits.value.join("");

  if (pinDigits.value[index] && index < 3) {
    nextTick(() => pinFields.value[index + 1]?.focus());
  }
}

function handleOtpInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => otpFields.value[index + 1]?.focus());
  }
}

function handleNewPinDigitInput(index) {
  newPinDigits.value[index] = newPinDigits.value[index].replace(/[^0-9]/g, "");
  currentNewPin.value = newPinDigits.value.join("");

  if (newPinDigits.value[index] && index < 3) {
    nextTick(() => newPinFields.value[index + 1]?.focus());
  }
}

/* ------------------------------------------------------------------ */
/* KEYDOWN HANDLERS – SUBMIT ONLY ON ENTER (when form is valid)        */
/* ------------------------------------------------------------------ */
function handlePinKeydown(event, index) {
  if (event.key === "Backspace" && !pinDigits.value[index] && index > 0) {
    nextTick(() => pinFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidPin.value && !maxAttemptsReached.value) {
    handlePinAction();
  }
}

function handleOtpKeydown(event, index) {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    nextTick(() => otpFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidOtp.value) {
    verifyForgotPinOtp();
  }
}

function handleNewPinKeydown(event, index) {
  if (event.key === "Backspace" && !newPinDigits.value[index] && index > 0) {
    nextTick(() => newPinFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidNewPin.value) {
    handleNewPinAction();
  }
}

/* ------------------------------------------------------------------ */
/* SCROLL TO CARD (used after every button click)                     */
/* ------------------------------------------------------------------ */
function scrollToCard() {
  nextTick(() => {
    const card = document.querySelector(".login-card");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ------------------------------------------------------------------ */
/* UTILS (unchanged)                                                 */
/* ------------------------------------------------------------------ */
function formatPhoneForAPI(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  return clean.length === 10 ? `+91${clean}` : `+91${clean}`;
}
function formatPhoneForDisplay(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  return clean.length === 10
    ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`
    : `+91 ${clean}`;
}
function prepareForgotPinPayload() {
  return props.contactType === "email"
    ? { email: userEmail.value, userApp: "fieldeasy" }
    : { phone: formatPhoneForAPI(userPhone.value), userApp: "fieldeasy" };
}
function checkIfEncrypted(text) {
  if (!text || typeof text !== "string") return false;
  const [iv, ct] = text.split(":");
  const hex = /^[0-9a-fA-F]+$/;
  return iv && ct && hex.test(iv) && hex.test(ct);
}
function encryptData(plain) {
  const iv = crypto.lib.WordArray.random(16);
  const key = crypto.enc.Hex.parse(ENCRYPTION_KEY);
  const encrypted = crypto.AES.encrypt(plain, key, {
    iv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7,
  });
  return `${iv.toString(crypto.enc.Hex)}:${encrypted.ciphertext.toString(crypto.enc.Hex)}`;
}
function decryptData(enc) {
  try {
    if (!enc || typeof enc !== "string") return enc || "";
    if (!checkIfEncrypted(enc)) return enc;
    const [ivHex, ctHex] = enc.split(":");
    const iv = crypto.enc.Hex.parse(ivHex);
    const key = crypto.enc.Hex.parse(ENCRYPTION_KEY);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: crypto.enc.Hex.parse(ctHex),
    });
    return crypto.AES.decrypt(cipherParams, key, {
      iv,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7,
    }).toString(crypto.enc.Utf8);
  } catch (e) {
    console.error("Decrypt error:", e);
    return enc;
  }
}
function clearError() {
  error.value = "";
  if (errorTimeout.value) clearTimeout(errorTimeout.value);
}
function clearSuccessMessage() {
  successMessage.value = "";
  if (successTimeout.value) clearTimeout(successTimeout.value);
}
function setSuccessMessage(msg) {
  clearSuccessMessage();
  successMessage.value = msg;
  successTimeout.value = setTimeout(() => (successMessage.value = ""), 3000);
}
function setErrorMessage(msg) {
  clearError();
  error.value = msg;
  errorTimeout.value = setTimeout(() => (error.value = ""), 5000);
}
function goToAlternateLogin() {
  router.push("/alternate-login");
}
function goBack() {
  if (currentStep.value === STEP.CREATE_PIN && isConfirmingPin.value) {
    isConfirmingPin.value = false;
    newPinDigits.value = Array(4).fill("");
  } else if (currentStep.value === STEP.CREATE_PIN) {
    currentStep.value = STEP.VERIFY_OTP;
    otpDigits.value = Array(6).fill("");
    nextTick(() => otpFields.value[0]?.focus());
  } else if (currentStep.value === STEP.VERIFY_OTP) {
    resetToPinEntry();
  }
}
function resetPinOnlyMode() {
  maxAttemptsReached.value = false;
  attempts.value = 0;
  pinDigits.value = Array(4).fill("");
}

/* ------------------------------------------------------------------ */
/* API FLOWS (loading flag is set before each request)                */
/* ------------------------------------------------------------------ */
async function startForgotPinFlow() {
  loading.value = true;
  try {
    if (props.contactType === "email") {
      userEmail.value = props.contactValue;
      userPhone.value = "";
      displayPhone.value = "";
    } else {
      userPhone.value = props.contactValue;
      displayPhone.value = formatPhoneForDisplay(
        userPhone.value.replace("+91", ""),
      );
    }
    await authService.forgotPin(prepareForgotPinPayload());
    currentStep.value = STEP.VERIFY_OTP;
    setSuccessMessage(`OTP sent to ${displayContact.value}`);
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } catch (e) {
    setErrorMessage(e.response?.data?.message || "Failed to send OTP");
  } finally {
    loading.value = false;
  }
}

async function verifyForgotPinOtp() {
  loading.value = true;
  scrollToCard();
  try {
    const payload = prepareForgotPinPayload();
    payload.otp = otpDigits.value.join("");
    const res = await authService.verifyForgotPinOtp(payload);
    if (res.success) {
      setSuccessMessage("OTP verified! Create new PIN");
      currentStep.value = STEP.CREATE_PIN;
      isConfirmingPin.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
    }
  } catch (e) {
    setErrorMessage(e.response?.data?.message || "Invalid OTP");
    otpDigits.value = Array(6).fill("");
    await authService.forgotPin(prepareForgotPinPayload());
    setSuccessMessage(`New OTP sent to ${displayContact.value}`);
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } finally {
    loading.value = false;
  }
}

async function resendOtp() {
  loading.value = true;
  scrollToCard();
  try {
    await authService.forgotPin(prepareForgotPinPayload());
    setSuccessMessage(`New OTP sent to ${displayContact.value}`);
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } catch (e) {
    setErrorMessage("Failed to resend OTP");
  } finally {
    loading.value = false;
  }
}

async function handleNewPinAction() {
  loading.value = true;
  scrollToCard();
  try {
    if (!isConfirmingPin.value) {
      tempPin.value = newPinDigits.value.join("");
      isConfirmingPin.value = true;
      newPinDigits.value = Array(4).fill("");
      setSuccessMessage("Please re‑enter your PIN to confirm");
      loading.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
      return;
    }
    if (newPinDigits.value.join("") !== tempPin.value) {
      setErrorMessage("PINs do not match, please try again");
      newPinDigits.value = Array(4).fill("");
      isConfirmingPin.value = false;
      tempPin.value = "";
      loading.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
      return;
    }
    await savePin(newPinDigits.value.join(""));
    const userData =
      props.contactType === "email"
        ? await authService.getUserByEmail(userEmail.value)
        : await authService.getUserByPhone(userPhone.value);
    authService.setUserData(userData);
    authService.setPinVerified(true);
    setSuccessMessage(`PIN created successfully! Redirecting...`);
    setTimeout(() => router.push("/taskManagement/taskcomponents"), 2000);
  } catch (e) {
    setErrorMessage(e.message || "Failed to create PIN");
  } finally {
    loading.value = false;
  }
}

function resetToPinEntry() {
  currentStep.value = STEP.ENTER_PIN;
  pinDigits.value = Array(4).fill("");
  attempts.value = 0;
  otpDigits.value = Array(6).fill("");
  newPinDigits.value = Array(4).fill("");
  currentNewPin.value = "";
  maxAttemptsReached.value = false;
  nextTick(() => {
    pinFields.value[0]?.focus();
    scrollToCard();
  });
}

async function checkUserPin() {
  try {
    let user;
    if (props.contactType === "email") {
      userEmail.value = props.contactValue;
      user = await authService.getUserByEmail(userEmail.value);
    } else {
      userPhone.value = props.contactValue;
      displayPhone.value = formatPhoneForDisplay(
        userPhone.value.replace("+91", ""),
      );
      user = await authService.getUserByPhone(userPhone.value);
    }
    if (user) {
      userId.value = user.id;
      userPin.value = user.userPin;
      return !!user.userPin;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function handlePinAction() {
  loading.value = true;
  scrollToCard();

  try {
    await verifyPin();
  } finally {
    loading.value = false;
  }
}

async function verifyPin() {
  try {
    let dbPin = userPin.value || "";
    dbPin = checkIfEncrypted(dbPin)
      ? decryptData(dbPin).trim()
      : dbPin.toString().trim();

    if (currentPin.value === dbPin) {
      setSuccessMessage("PIN verified successfully");
      authService.setPinVerified(true);
      setTimeout(() => router.push("/taskManagement/taskcomponents"), 1500);
      return;
    }

    attempts.value++;
    if (attempts.value >= 3) {
      maxAttemptsReached.value = true;
      setErrorMessage("Maximum attempts reached. Please reset your PIN.");
      pinDigits.value = Array(4).fill("");
    } else {
      setErrorMessage(
        `Incorrect PIN. ${3 - attempts.value} attempts remaining.`,
      );
      pinDigits.value = Array(4).fill("");
    }
  } catch (e) {
    setErrorMessage("Failed to verify PIN. Please try again.");
    pinDigits.value = Array(4).fill("");
  }
}

async function savePin(pin) {
  if (!userId.value) throw new Error("User ID not found");
  const encrypted = encryptData(pin);
  const { status } = await authService.protectedApi.patch(
    `/users/${userId.value}`,
    { userPin: encrypted },
  );
  if (status !== 200) throw new Error("Failed to save PIN");
}

/* ------------------------------------------------------------------ */
/* LIFECYCLE                                                          */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  const fromReset = route.query.fromPinReset === true;
  if (fromReset) {
    authService.setPinVerified(true);
    await nextTick();
    router.push("/taskManagement/taskcomponents");
    return;
  }

  const hasPin = await checkUserPin();
  if (!hasPin) {
    isFirstTime.value = true;
    currentStep.value = STEP.CREATE_PIN;
    nextTick(() => {
      newPinFields.value[0]?.focus();
      scrollToCard();
    });
  } else {
    nextTick(() => {
      pinFields.value[0]?.focus();
      scrollToCard();
    });
  }
});

onBeforeUnmount(() => {
  if (errorTimeout.value) clearTimeout(errorTimeout.value);
  if (successTimeout.value) clearTimeout(successTimeout.value);
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

/* PIN/OTP Specific Styles */
.pin-container {
  gap: 8px !important;
  align-items: center !important;
}

.pin-digit-input, .otp-input-field {
  flex: 0 0 50px !important;
  max-width: 50px !important;
  min-width: 40px !important;
}

.pin-digit-input :deep(.v-field), .otp-input-field :deep(.v-field) {
  height: 50px !important;
  padding: 0 !important;
  border-radius: 12px !important;
  background: #f9fafb !important;
  border-color: #e5e7eb !important;
}

.pin-digit-input :deep(.v-field__input), .otp-input-field :deep(.v-field__input) {
  text-align: center !important;
  font-size: 20px !important;
  font-weight: 600 !important;
  padding: 0 !important;
  min-height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.pin-digit-input.filled :deep(.v-field__outline), .otp-input-field.filled :deep(.v-field__outline) {
  border-color: #ef4444 !important; /* Changed to match login theme color or keep green? Login uses red. I'll use red to match theme. */
}

/* Eye Icon */
.pin-eye-icon-right {
  cursor: pointer !important;
  transition: color 0.3s ease !important;
  flex-shrink: 0 !important;
  align-self: center !important;
}

.pin-eye-icon-right:hover {
  color: #ef4444 !important;
}

/* Button */
.submit-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.15) !important;
  background-color: #ef4444 !important; /* Matching login button color */
  color: white !important;
  margin-top: 24px !important;
}

.reset-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  text-transform: none !important;
  margin-top: 16px !important;
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
