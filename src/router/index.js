// /src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { authService } from "@/services/authService";

// Import authentication and layout components
import Login from "@/components/loginAuthentication/login.vue";
import Verification from "@/components/loginAuthentication/verification.vue";
import PinVerification from "@/components/loginAuthentication/pinVerification.vue";
import Register from "@/components/loginAuthentication/register.vue";
import DashboardLayout from "@/layouts/dashboardLayout.vue";

// All static imports at the top
import DeviceManagementTabs from "../pages/devicesManager/deviceManagerTabs.vue";
import UnapprovedDevices from "@/pages/devicesManager/unApprovedDevice/unApprovedDetails.vue";
import DoorManagement from "@/pages/devicesManager/doors/doorDetails.vue";
import Accesslevel from "@/pages/devicesManager/accesslevel/accesslevelCatagory.vue";
import CameraList from "@/pages/devicesManager/camera/cameraList.vue";

import MonitoringTabs from "@/pages/monitoring/monitoringTabs.vue";
import EventLogs from "@/pages/monitoring/eventLogs.vue";
import LiveFeed from "@/pages/monitoring/liveFeed.vue";

import AttendanceDeatils from "../pages/attendanceDetails/attendanceTabs.vue";
import LiveAttendance from "@/pages/attendanceDetails/liveAttendance/liveAttendanceDetails.vue";
import DailyAttendance from "@/pages/attendanceDetails/dailyAttendance/dailyAttendanceDetails.vue";
import AttendanceDashboard from "@/pages/attendanceDetails/attendanceDashboard/attendanceDashboardDetails.vue";
import roosteremployeelist from "@/pages/attendanceDetails/companyRoaster/roosterEmployees.vue";
import Profile from "@/pages/profile/profile.vue";
import MonthUserAttendance from "@/pages/attendanceDetails/attendanceDashboard/monthUserAttendance.vue";

import PayrollTab from "@/pages/payroll/payrolltab.vue";
import AttendanceVerification from "@/pages/payroll/payrollManagement/finalizePayroll/attendanceVerification.vue";
import SalaryVerification from "@/pages/payroll/payrollManagement/finalizePayroll/salaryVerification.vue";

import EmployeeDetails from "@/pages/employee/my-teams/myTeams.vue";
import EmployeeDetailsTab from "@/pages/employee/my-teams/personalDetails/employeeDetails.vue";
import EmployeeEditForm from "@/pages/employee/my-teams/personalDetails/employeeEditForm.vue";
import EmployeeAddForm from "@/pages/employee/my-teams/personalDetails/employeeForm.vue";
import LeaveManagement from "@/pages/leave/tab.vue";

import RegularisationManagement from "@/pages/regularisation/tab.vue";
import RegularisationRequest from "@/pages/regularisation/regularisationRequest.vue/table.vue";
import RegularisationPermission from "@/pages/regularisation/regularisationPermission.vue/table.vue";
import MyRequest from "@/pages/regularisation/myRequest.vue/table.vue";
import AddRegularisationRequest from "@/pages/regularisation/regularisationRequest.vue/add.vue";

import Attendance from "../pages/logs/logTab.vue";
import LogsTable from "@/pages/logs/log/logTable.vue";
import FaceEmbeddingTabs from "@/pages/faceEmbedding/faceEmbeddingTabs.vue";
import AiFaceEmbeddingDetails from "@/pages/faceEmbedding/aiFaceEmbedding/aiFaceEmbeddingDetails.vue";
import MobileFaceEmbeddingDetails from "@/pages/faceEmbedding/mobileFaceEmbedding/mobileFaceEmbeddingDetails.vue";
import FingerDataDetails from "@/pages/fingerData/fingerDataDetails.vue";

import Import from "@/pages/Imports/importsTabs.vue";
import importDetals from "@/pages/Imports/import/importTable.vue";

import Reports from "@/pages/report/reportTab.vue";
import CompanyReport from "@/pages/report/companyReport/company-reports.vue";
import AttendanceDetails from "@/pages/report/attendance/attendanceTable.vue";
import Workordergenerate from "@/pages/report/workordereport/workordergenerate.vue";

import VisitorFlow from "@/pages/flow/visitorFlow.vue";

import QrGenerateTabs from "@/pages/qrgenerate/qrgenerateTabs.vue";
import BulkQrGenerate from "@/pages/qrgenerate/bulkgenerate/qrgenerate.vue";
import EmployeeQrGenerate from "@/pages/qrgenerate/employeeqrgenerate/employeeQRgenerate.vue";

import SettingsTabs from "@/pages/settings/settingsTabs.vue";
import OrganizationSettingsTabs from "@/pages/settings/organizationSettings/organizationTabs.vue";
import OrganizationSettings from "@/pages/settings/organizationSettings/organizationSettings.vue";
import AttendanceCycle from "@/pages/settings/organizationSettings/attendanceCycle.vue";
import HolidaySettings from "@/pages/settings/holidays/holidayManagmnet.vue";
import ShiftSettings from "@/pages/settings/shifts/shiftsManagmnet.vue";
import LeaveSettings from "@/pages/settings/leaves/leaveManagmnet.vue";

import ConfigurationTabs from "@/pages/settings/configuration/configurationTab.vue";
import Branch from "@/pages/settings/configuration/branch/branchConfiguration.vue";
import AddBranch from "@/pages/settings/configuration/branch/branchAddForm.vue";
import EditBranch from "@/pages/settings/configuration/branch/branchEditForm.vue";
import Department from "@/pages/settings/configuration/department/departmentConfiguration.vue";
import AddDepartment from "@/pages/settings/configuration/department/departmentAddForm.vue";
import EditDepartment from "@/pages/settings/configuration/department/departmentEditForm.vue";

import Payroll from "@/pages/payroll/payrollManagement/payrollManagementDetails.vue";
import Benifits from "@/pages/payroll/benifits/benifitsDetails.vue";

import EmployeeSalaryTab from "@/pages/payroll/employeeSalary/employeeSalaryTab.vue";
import SalaryDetails from "@/pages/payroll/employeeSalary/salaryDetails/salaryDetails.vue";
import SalaryEditTab from "@/pages/payroll/employeeSalary/salaryDetails/salaryEditTab.vue";
import BankDetails from "@/pages/payroll/employeeSalary/bankDetails/bankDetails.vue";
import BankEditTabs from "@/pages/payroll/employeeSalary/bankDetails/bankEditTabs.vue";
import PolicyDetails from "@/pages/payroll/employeeSalary/policyConfig/policyDetails.vue";
import PolicyEditTab from "@/pages/payroll/employeeSalary/policyConfig/policyEditTab.vue";

import PolicyTab from "@/pages/payroll/policy/policyTab.vue";
import SalaryPolicyDetails from "@/pages/payroll/policy/salary/salaryPolicyDetails.vue";
import SalaryTemplate from "@/pages/payroll/policy/salary/salaryTemplate.vue";
import SalaryTemplateEdit from "@/pages/payroll/policy/salary/salaryTemplateEdit.vue";
import AttendancePolicy from "@/pages/payroll/policy/attendance/attendancePolicy.vue";

import AdvanceLoanTab from "@/pages/payroll/advanceLoan/advanceLoanTab.vue";
import Advance from "@/pages/payroll/advanceLoan/advance/advance.vue";
import Loan from "@/pages/payroll/advanceLoan/loan/loan.vue";

import BenifitsEditTabs from "@/pages/payroll/benifits/benifitsEditTabs.vue";

import TaskDashboard from "@/pages/taskManagement/taskcomponents/taskDashboard.vue";
import CompleteWorkOrderForm from "@/pages/taskManagement/taskcomponents/formTemplate/submitTaskForm/completeTaskForm.vue";
import ProductManagementScreen from "@/pages/taskManagement/productviews/ProductManagementScreen.vue";
import ProductDetailScreen from "@/pages/taskManagement/productviews/ProductDetailScreen.vue";
import ProductEditScreen from "@/pages/taskManagement/productviews/ProductEditScreen.vue";
import ManualEntryScreen from "@/pages/taskManagement/productviews/ManualEntryScreen.vue";
import BulkUploadScreen from "@/pages/taskManagement/productviews/BulkUploadScreen.vue";
import DeviceListScreen from "@/pages/taskManagement/productviews/devicelist.vue";
import Livetracking from "@/pages/taskManagement/Map/livetracking.vue";
import DeviceManagementScreen from "@/pages/taskManagement/productviews/deviceManagementScreen.vue";
import Reimbursement_card from "@/pages/reimbursement/reimbursement_card.vue";

import Orgmainui from "@/pages/organization/orgmainui.vue";
import Org_location from "@/pages/organization/org_location.vue";
import Org_addlocation from "@/pages/organization/org_addlocation.vue";
import Org_editlocation from "@/pages/organization/org_editlocation.vue";
import Workflow from "@/pages/taskManagement/taskcomponents/workflow.vue";
import Connector from "@/pages/connectors/connector.vue";
import Roleconfig from "@/pages/settings/roleConfigurator/roleconfig.vue";
import Manualdevice from "@/pages/taskManagement/productviews/manualdevice.vue";

import Overviewmaintab from "@/pages/taskManagement/overviewtab/overviewmaintab.vue";
import Kpi from "@/pages/taskManagement/overviewtab/kpi.vue";
import Reimbursementtab from "@/pages/reimbursement/reimbursementtab.vue";
import Reimbursement_settings from "@/pages/reimbursement/reimbursement_settings.vue";
import Reimbursementemp from "@/pages/reimbursement/reimbursementemp.vue";
import Tripview from "@/pages/reimbursement/tripview.vue";
import Locationtab from "@/pages/organization/locationtab.vue";
import Payrollsumary from "@/pages/payroll/payrollsumary.vue";

import TasksPage from "@/pages/taskManagement/taskcomponents/TasksPage.vue";
import WorkOrderTabs from "@/pages/taskManagement/taskcomponents/workOrderTabs.vue";
import FieldTrip from "@/pages/taskManagement/taskcomponents/fieldtrip.vue";
import Addreimbursement from "@/pages/reimbursement/addreimbursement.vue";
import Plans from "@/pages/settings/plans/plans.vue";

import locateTable from "@/pages/locate/locateTable.vue";
import Clientsadd from "@/pages/organization/clientsadd.vue";
import Clientsedit from "@/pages/organization/clientsedit.vue";

import Attendanceconfigtab from "@/pages/settings/attendanceconfigtab.vue";
import LeavePermissionTable from "@/pages/leave/leavePermission.vue/leavePermissionTable.vue";
import Table from "@/pages/leave/leaveRequest.vue/table.vue";
import ConfiguratorTab from "@/pages/configurator/configuratorTab.vue";

import DeviceDetails from "@/pages/device/devicedetails.vue";
import AddDeviceDetails from "@/pages/device/adddevicedetails.vue";
import Doordetails from "@/pages/door/doordetails.vue";
import AdddoorDetails from "@/pages/door/adddoordetails.vue";
import accessleveldetails from "@/pages/accesslevel/accessleveldetails.vue";
import acessleveladd from "@/pages/accesslevel/acessleveladd.vue";
import timerzone from "@/pages/accesslevel/timerzone.vue";
import antipassbackMode from "@/pages/globalConfigurator/antipassbackMode.vue";
import interlockMode from "@/pages/globalConfigurator/interlockMode.vue";

const routes = [
  {
    path: "/",
    redirect: (to) => {
      return authService.isAuthenticated()
        ? "/employee-details/employee"
        : "/login";
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: (to, from, next) => {
      if (authService.isAuthenticated()) {
        next("/employee-details/employee");
      } else {
        next();
      }
    },
  },
  {
    path: "/alternate-login",
    name: "AlternateLogin",
    component: () =>
      import("@/components/loginAuthentication/alternateLogin.vue").catch(
        () => Login
      ),
    requiresAuth: false,
    title: "Login with Another Account",
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/verification/:phoneNumber",
    name: "Verification",
    component: Verification,
    props: true,
  },
  {
    path: "/verify-email/:email?",
    name: "EmailVerification",
    component: () =>
      import("@/components/loginAuthentication/emailVerification.vue").catch(
        () => Login
      ),
  },
  {
    path: "/pin-verification/:contactType(phone|email)/:contactValue",
    name: "PinVerification",
    component: PinVerification,
    props: true,
  },
  {
    path: "/taskManagement/taskcomponents",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "/profile",
        name: "Profile",
        component: Profile,
        meta: { roles: ["Admin", "Manager", "Employee", "esslAdmin"] },
      },

      {
        path: "/leave/leavePermission",
        name: "leavePermission",
        component: LeavePermissionTable,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/leave/leaveRequest",
        name: "table",
        component: Table,
        meta: { roles: ["Employee"] },
      },

      {
        path: "/regularisation",
        name: "RegularisationManagement",
        component: RegularisationManagement,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          // {
          //   path: "", // Default route for /regularisation
          //   redirect: { name: "RegularisationRequest" },
          // },
          {
            path: "regularisationRequest",
            name: "RegularisationRequest",
            component: RegularisationRequest,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "regularisationPermission",
            name: "RegularisationPermission",
            component: RegularisationPermission,
            meta: {
              roles: [
                "Admin",
                "Manager",
                "Dealer",
                "accessManager",
                "Employee",
              ],
            },
          },
          {
            path: "requestFile",
            name: "RequestFile",
            component: MyRequest,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "regularisationRequest/add",
            name: "AddRegularisationRequest",
            component: AddRegularisationRequest,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
        ],
      },
      {
        path: "/qr-generate",
        name: "QrGenerate",
        component: QrGenerateTabs,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          {
            path: "",
            name: "qr-generate-default",
            redirect: { name: "bulk-qr-generate" },
          },
          {
            path: "bulk",
            name: "bulk-qr-generate",
            component: BulkQrGenerate,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "employee",
            name: "employee-qr-generate",
            component: EmployeeQrGenerate,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
        ],
      },
      {
        path: "/finger-data",
        name: "FingerData",
        component: FingerDataDetails,
        meta: { roles: ["Admin", "Manager", "Employee"] },
      },
      {
        path: "/settings/attendanceconfigtab",
        name: "attendanceconfigtab",
        component: Attendanceconfigtab,
        meta: { roles: ["Admin", "Dealer", "Manager"] },
        children: [],
      },

      {
        path: "/attendanceLog",
        name: "Attendance Logs",
        component: Attendance,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          {
            path: "",
            name: "attendance-logs-default",
            redirect: { name: "general-logs" },
          },
          // {
          //   path: "attendance",
          //   name: "attendance-logs",
          //   component: AttendanceTable,
          //   meta: { roles: ["Admin", "Manager", "Employee"] },
          // },
          {
            path: "general",
            name: "general-logs",
            component: LogsTable,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
        ],
      },
      {
        path: "/organization/locationtab",
        name: "LocationTabs",
        component: Locationtab,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        redirect: "/organization/orgmainui",
        children: [
          {
            path: "/organization/orgmainui",
            name: "orgmainui",
            component: Orgmainui,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "/organization/clientsadd",
            name: "AddClient",
            component: Clientsadd,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "organization/clientsedit/:id",
            name: "EditClient",
            component: Clientsedit,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "/organization/org_location",
            name: "org_location",
            component: Org_location,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "/organization/org_addlocation",
            name: "org_location-add",
            component: Org_addlocation,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "/organization/org_editlocation/:id",
            name: "org_location-edit",
            component: Org_editlocation,
            props: true,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "livetracking",
            name: "livetrack",
            component: Livetracking,
            meta: { roles: ["Admin", "Manager"] },
          },
        ],
      },
      {
        path: "/attendanceDeatils",
        name: "AttendanceDeatils",
        component: AttendanceDeatils,
        meta: { roles: ["Admin", "Employee", "Manager"] },
        children: [
          {
            path: "",
            name: "attendance-details-default",
            redirect: "/attendanceDeatils/dashboard",
          },
          {
            path: "live",
            name: "LiveAttendance",
            component: LiveAttendance,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "daily",
            name: "DailyAttendance",
            component: DailyAttendance,
            meta: { roles: ["Admin", "Employee", "Manager"] },
          },
          {
            path: "dashboard",
            name: "Attendance Dashboard",
            component: AttendanceDashboard,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "roster",
            name: "CompanyRoster",
            component: roosteremployeelist,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "monthlyUserAttendance",
            name: "monthlyUserAttendance",
            component: MonthUserAttendance,
            props: true,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
        ],
      },
      {
        path: "/card-management",
        name: "CardManagement",
        component: () => import("@/pages/cardManagement/cardManagementTab.vue"),
        meta: { roles: ["Admin", "Manager", "esslAdmin"] },
        children: [
          {
            path: "",
            name: "card-management-default",
            redirect: { name: "card-details" },
          },
          {
            path: "cards",
            name: "card-details",
            component: () =>
              import("@/pages/cardManagement/cardDetails/cardDetails.vue"),
            meta: { roles: ["Admin", "Manager", "esslAdmin"] },
          },
          {
            path: "import",
            name: "import-cards",
            component: () =>
              import(
                "@/pages/cardManagement/importCardDetails/importCardDetails.vue"
              ),
            meta: { roles: ["Admin", "esslAdmin"] },
          },
        ],
      },
      {
        path: "/locate",
        name: "Locate",
        component: locateTable,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/deviceManager",
        component: DeviceManagementTabs,
        meta: { roles: ["Admin", "esslAdmin"] },
        children: [
          {
            path: "",
            redirect: { name: "unapproved-devices" },
          },
          {
            path: "unapproved",
            name: "unapproved-devices",
            component: UnapprovedDevices,
            meta: { roles: ["Admin", "esslAdmin"] },
          },
          {
            path: "doors",
            name: "door-management",
            component: DoorManagement,
            meta: { roles: ["Admin"] },
          },
          {
            path: "accesslevelCatagory",
            name: "accessLvl-category",
            component: Accesslevel,
            meta: { roles: ["Admin"] },
          },
        ],
      },
      {
        path: "/monitoring",
        component: MonitoringTabs,
        meta: { roles: ["Admin", "Manager", "esslAdmin"] },
        children: [
          {
            path: "",
            redirect: { name: "event-logs" },
          },
          {
            path: "events",
            name: "event-logs",
            component: EventLogs,
            meta: { roles: ["Admin", "Manager", "esslAdmin"] },
          },
          {
            path: "live",
            name: "live-feed",
            component: LiveFeed,
            meta: { roles: ["Admin", "Manager", "esslAdmin"] },
          },
        ],
      },
      {
        path: "/employee-details",
        name: "EmployeeDetails",
        component: EmployeeDetails,
        meta: { roles: ["Admin", "Employee", "Manager", "esslAdmin"] },
        children: [
          {
            path: "",
            name: "employee-details-default",
            redirect: "/employee-details/employee",
          },
          {
            path: "employee",
            name: "EmployeeDetailsTab",
            component: EmployeeDetailsTab,
            children: [
              {
                path: "add/:module",
                name: "AddEmployeeForm",
                component: EmployeeAddForm,
                props: true,
                meta: { roles: ["Admin", "Manager", "esslAdmin"] },
              },
              {
                path: ":id/:module",
                name: "EmployeeForm",
                component: EmployeeEditForm,
                props: true,
                meta: { roles: ["Admin", "Manager", "Employee", "esslAdmin"] },
              },
            ],
          },
          {
            path: "leave",
            name: "LeaveBalanceTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/leaveDeatils/leaveDetails.vue"
              ).catch(() => EmployeeDetailsTab),
          },
          {
            path: "attendance",
            name: "AttendanceDetailsTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/attendanceDetails/attendanceDetails.vue"
              ).catch(() => EmployeeDetailsTab),
          },
          {
            path: "card",
            name: "CardManagementTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/cardManagement/cardManagementDetails.vue"
              ).catch(() => EmployeeDetailsTab),
          },
          {
            path: "otherDetails",
            name: "OtherDetailsTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/otherDetails/otherEmployeeDetails.vue"
              ).catch(() => EmployeeDetailsTab),
          },
        ],
      },
      {
        path: "/face-embedding",
        name: "FaceEmbedding",
        component: FaceEmbeddingTabs,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          {
            path: "",
            name: "face-embedding-default",
            redirect: { name: "ai-face-embedding" },
          },
          {
            path: "ai-face-embedding",
            name: "ai-face-embedding",
            component: AiFaceEmbeddingDetails,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "mobile-face-embedding",
            name: "mobile-face-embedding",
            component: MobileFaceEmbeddingDetails,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
        ],
      },
      {
        path: "/payroll",
        component: PayrollTab,
        meta: { roles: ["Admin"] },
        children: [
          {
            path: "employee-salary",
            name: "EmployeeSalary",
            component: EmployeeSalaryTab,
            children: [
              {
                path: "salary-details",
                name: "SalaryDetailsTab",
                component: SalaryDetails,
                children: [
                  {
                    path: ":id/salary-detailsedit",
                    name: "SalaryDetailsEdit",
                    component: SalaryEditTab,
                    props: true,
                  },
                ],
              },
              {
                path: "bank-details",
                name: "BankDetailsTab",
                component: BankDetails,
                children: [
                  {
                    path: ":id/bank-detailsedit",
                    name: "BankDetailsEdit",
                    component: BankEditTabs,
                    props: true,
                  },
                ],
              },
              {
                path: "policyDetails",
                name: "PolicyTab",
                component: PolicyDetails,
                children: [
                  {
                    path: ":id/policy-edit",
                    name: "PolicyEdit",
                    component: PolicyEditTab,
                    props: true,
                  },
                ],
              },
            ],
          },
          {
            path: "management",
            name: "PayrollManagement",
            component: () =>
              import(
                "@/pages/payroll/payrollManagement/payrollManagementDetails.vue"
              ).catch(() => PayrollTab),
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "attendance-verification",
            name: "attendance-verification",
            component: AttendanceVerification,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "salary-verification/:date?",
            name: "salary-verification",
            component: SalaryVerification,
            props: true,
            meta: { roles: ["Admin", "Dealer"] },
          },
          {
            path: "review",
            name: "review",
            component: () =>
              import(
                "@/pages/payroll/payrollManagement/finalizePayroll/review.vue"
              ).catch(() => PayrollTab),
            props: true,
            meta: { roles: ["Admin", "Dealer"] },
          },
          {
            path: "adhoc-payments",
            name: "AdhocPayments",
            component: Benifits,
          },
          {
            path: "adhoc-paymentsEdit",
            name: "AdhocPaymentsEdit",
            component: BenifitsEditTabs,
            props: true,
          },
          {
            path: "advance-loans",
            name: "AdvanceAndLoans",
            component: AdvanceLoanTab,
            meta: { roles: ["Admin"] },
            children: [
              {
                path: "advance",
                name: "Advance",
                component: Advance,
              },
              {
                path: "loan",
                name: "Loan",
                component: Loan,
              },
            ],
          },
          // {
          //   path: "policy",
          //   name: "Policy",
          //   component: PolicyTab,
          //   meta: { roles: ["Admin"] },
          //   children: [
          //     {
          //       path: "payroll-policy",
          //       name: "PayrollPolicy",
          //       component: SalaryPolicyDetails,
          //       meta: { roles: ["Admin", "Dealer", "Manager"] },
          //       children: [
          //         {
          //           path: "salary-template",
          //           name: "SalaryTemplate",
          //           component: SalaryTemplate,
          //         },
          //         {
          //           path: "salary-template-edit/:categoryData",
          //           name: "SalaryTemplateEdit",
          //           component: SalaryTemplateEdit,
          //           props: true,
          //         },
          //       ],
          //     },
          //     {
          //       path: "penalty-policy",
          //       name: "PenaltyPolicy",
          //       component: AttendancePolicy,
          //     },
          //   ],
          // },

          // {
          //   path: "",
          //   name: "PayrollList",
          //   component: PayrollSummary,
          // },

          // {
          //   path: "payroll-summary",
          //   name: "PayrollSummary",
          //   component: PayrollSummary,
          // },
        ],
      },
      // configurator
      {
        path: "/configuration",
        name: "configuration",
        component: () =>
          import("@/pages/configurator/configuratorTab.vue").catch(
            () => ConfiguratorTab
          ),
        children: [
          {
            path: "payroll-policy",
            name: "Payrollpolicy",
            component: () =>
              import(
                "@/pages/payroll/policy/salary/salaryPolicyDetails.vue"
              ).catch(() => TaskDashboard),
            meta: { roles: ["Admin", "Dealer", "Manager"] },
            children: [
              {
                path: "salary-template",
                name: "salary-template",
                component: () =>
                  import(
                    "@/pages/payroll/policy/salary/salaryTemplate.vue"
                  ).catch(() => TaskDashboard),
              },
              {
                path: "salary-templateEdit/:categoryData",
                name: "salary-templateEdit",
                component: () =>
                  import(
                    "@/pages/payroll/policy/salary/salaryTemplateEdit.vue"
                  ).catch(() => TaskDashboard),
              },
            ],
          },
          {
            path: "penalty-policy",
            name: "Penalitypolicy",
            component: () =>
              import(
                "@/pages/payroll/policy/attendance/attendancePolicies/penalityDetails.vue"
              ).catch(() => TaskDashboard),
          },
          {
            path: "configuration",
            name: "branches",
            component: Branch,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "branch/add",
            name: "branch-configuration-add",
            component: AddBranch,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "branch/edit/:id",
            name: "branch-configuration-edit",
            component: EditBranch,
            props: true,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "departement-configuration",
            name: "departments",
            component: Department,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "teams",
            name: "teams",
            component: () =>
              import(
                "@/pages/settings/configuration/team/teamConfiguration.vue"
              ),
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "designations",
            name: "designations",
            component: () =>
              import(
                "@/pages/settings/configuration/designation/designationConfiguration.vue"
              ),
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "reimbursement_settings",
            name: "expense",
            component: Reimbursement_settings,
          },
          {
            path: "attendanceCycle",
            name: "attendance-cycle",
            component: AttendanceCycle,
            meta: { roles: ["Admin", "Dealer"] },
          },
          {
            path: "holidays",
            name: "HolidaySettings",
            component: HolidaySettings,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "shifts",
            name: "ShiftSettings",
            component: ShiftSettings,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "/settings/leave-types",
            name: "LeaveSettings",
            component: LeaveSettings,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "device-configurator",
            name: "device-configurator",
            component: DeviceDetails,
            meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
            children: [
              {
                path: "add",
                name: "add-device",
                component: AddDeviceDetails,
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
              {
                path: "edit/:id",
                name: "edit-device",
                component: AddDeviceDetails, // Reuse form for edit
                props: true,
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
            ],
          },
          {
            path: "camera-management",
            name: "camera-management",
            component: CameraList,
            meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
          },
          {
            path: "door-configurator",
            name: "door-configurator",
            component: Doordetails,
            meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
            children: [
              {
                path: "add",
                name: "add-door",
                component: AdddoorDetails,
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
              {
                path: "edit/:id",
                name: "edit-door",
                component: AdddoorDetails, // Reuse form for edit
                props: true,
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
            ],
          },
          {
            path: "accesslevel-configurator",
            name: "accesslevel-configurator",
            component: accessleveldetails,
            meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
            children: [
              {
                path: "add",
                name: "add-acceslevel",
                component: acessleveladd,
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
              {
                path: "edit/:id",
                name: "edit-accesslevel",
                component: acessleveladd, // Reuse form for edit
                props: true,
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
            ],
          },
          {
            path: "timerzone-configuration",
            name: "timerzone",
            component: timerzone,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "antipassbackmode-configurator",
            name: "antipassbackmode-configurator",
            component: antipassbackMode,
            meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
          },
          {
            path: "interlockmode-configurator",
            name: "interlockmode-configurator",
            component: interlockMode,
            meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
          },
          {
            path: "zone-configurator",
            name: "zone-configurator",
            component: () => import("@/pages/zones/ZonesList.vue"),
            meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
            children: [
              {
                path: "add",
                name: "add-zone",
                component: () => import("@/pages/zones/ZoneForm.vue"),
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
              {
                path: "edit/:id",
                name: "edit-zone",
                component: () => import("@/pages/zones/ZoneForm.vue"),
                props: true,
                meta: { roles: ["Admin", "esslAdmin", "Dealer"] },
              },
            ],
          },
        ],
      },
      // {
      //   path: "/payroll-verification/:employeeId",
      //   name: "payroll-verification",
      //   component: PayrollVerification,
      //   props: true,
      // },
      // {
      //   path: "/attendance-verification",
      //   name: "attendance-verification",
      //   component: AttendanceVerification,
      //   meta: { roles: ["Admin"] },
      // },
      // {
      //   path: "/salary-verification/:date?",
      //   name: "salary-verification",
      //   component: SalaryVerification,
      //   props: true,
      //   meta: { roles: ["Admin"] },
      // },

      {
        path: "/import",
        name: "import",
        component: Import,
        meta: { roles: ["Admin", "Dealer"] },
        children: [
          {
            path: "",
            name: "imports",
            redirect: { name: "importDetails" },
          },
          {
            path: "importDetails",
            name: "importDetails",
            component: importDetals,
            meta: { roles: ["Admin", "Administrator", "Dealer"] },
          },
        ],
      },
      {
        path: "/reports",
        component: Reports,
        meta: { roles: ["Admin", "Manager"] },
        children: [
          {
            path: "",
            redirect: { name: "workordergenerate" },
          },
          {
            path: "workordergenerate",
            name: "workordergenerate",
            component: Workordergenerate,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "attendance",
            name: "attendance",
            component: AttendanceDetails,
            meta: { roles: ["Admin", "Manager"] },
          },

          {
            path: "companyReport",
            name: "CompanyReport",
            component: CompanyReport,
            meta: { roles: ["Admin", "Manager"] },
          },
        ],
      },
      {
        path: "/visitor",
        name: "Visitor",
        component: VisitorFlow,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/connectors/connector",
        name: "connector",
        component: Connector,
        meta: { roles: ["Admin", "Manager", "Employee"] },
      },
      {
        path: "/reimbursement/reimbursementtab",
        name: "reimbursementtab",
        component: Reimbursementtab,
        children: [
          {
            path: "reimbursement_card",
            name: "reimbursement_card",
            component: Reimbursement_card,
          },
          {
            path: "reimbursementemp",
            name: "reimbursementemp",
            component: Reimbursementemp,
          },
          {
            path: "addreimbursement",
            name: "addreimbursement",
            component: Addreimbursement,
          },
        ],
      },
      {
        path: "/reimbursement/tripview/:employeeId",
        name: "tripview",
        component: Tripview,
      },
      {
        path: "/settings",
        name: "Settings",
        component: SettingsTabs,
        meta: { roles: ["Admin", "Administrator", "Dealer", "Manager"] },
        children: [
          {
            path: "",
            name: "settings",
            redirect: "/settings/organization",
          },
          {
            path: "/settings/plans/plans",
            name: "plan",
            component: Plans,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "/settings",
            component: OrganizationSettingsTabs,
            meta: { roles: ["Admin", "Administrator", "Dealer"] },
            children: [],
          },
          // {
          //   path: "/payroll",
          //   component: PayrollTab,
          //   meta: { roles: ["Admin", "Dealer", "Employee"] },
          //   children: [
          //     {
          //       path: "",
          //       redirect: { name: "PayrollManagement" },
          //     },

          //     {
          //       path: "tds",
          //       name: "tds",
          //       component: () => import("@/pages/payroll/tds/tdsDetails.vue"),
          //       children: [
          //         {
          //           path: "deduction",
          //           component: () =>
          //             import(
          //               "@/pages/payroll/tds/taxDeduction/taxDeductionDetails.vue"
          //             ),
          //           meta: {
          //             roles: [
          //               "Admin",
          //               "Dealer",
          //               "Employee",
          //               "Manager",
          //               "accessManager",
          //             ],
          //           },
          //           children: [
          //             {
          //               path: "",
          //               name: "TdsDeductionRoot",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/taxDeductionDetails.vue"
          //                 ),
          //             },
          //             {
          //               path: ":id",
          //               name: "TdsDeductionDefault",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/taxDeductionRules.vue"
          //                 ),
          //             },
          //             {
          //               path: ":id/hraRent",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/hraRent.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/hraLoan",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/homeLoan.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/travelAllowence",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/leaveTravel.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/deduction",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/sectionDeduction.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/pastTds",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/pastTds.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: "regime",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxDeduction/pastTds.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //           ],
          //         },
          //         {
          //           path: "approval",
          //           component: () =>
          //             import(
          //               "@/pages/payroll/tds/taxApproval/taxApprovalDetails.vue"
          //             ),
          //           meta: { roles: ["Admin", "Dealer"] },
          //           children: [
          //             {
          //               path: "",
          //               name: "TdsApprovalRoot",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxApproval/taxApprovalDetails.vue"
          //                 ),
          //             },
          //             {
          //               path: ":id",
          //               name: "TdsDefault",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxApproval/taxApprovalRules.vue"
          //                 ),
          //               children: [
          //                 {
          //                   path: "tds-summary",
          //                   name: "Tds",
          //                   component: () =>
          //                     import(
          //                       "@/pages/payroll/tds/taxApproval/tdsSummary/tdsSummaryUi.vue"
          //                     ),
          //                 },
          //                 {
          //                   path: "declare",
          //                   name: "declare",
          //                   component: () =>
          //                     import(
          //                       "@/pages/payroll/tds/taxApproval/tdsDeclare/tdsDeclareUi.vue"
          //                     ),
          //                 },
          //               ],
          //             },
          //             // {
          //             //   path: "/tds-summary",
          //             //   name: "Tds",
          //             //   component: () =>
          //             //     import(
          //             //       "@/pages/payroll/tds/taxApproval/tdsSummary/tdsSummaryUi.vue"
          //             //     ),
          //             // },
          //             // {
          //             //   path: "/declare",
          //             //   name: "declare",
          //             //   component: () =>
          //             //     import(
          //             //       "@/pages/payroll/tds/taxApproval/tdsDeclare/tdsDeclareUi.vue"
          //             //     ),
          //             // },
          //             {
          //               path: ":id/hraRent",
          //               component: () =>
          //                 import("@/pages/payroll/tds/taxApproval/hraRent.vue"),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/pastTds",
          //               component: () =>
          //                 import("@/pages/payroll/tds/taxApproval/pastTds.vue"),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/hraLoan",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxApproval/homeLoan.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/travelAllowence",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxApproval/travelAllowence.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //             {
          //               path: ":id/deduction",
          //               component: () =>
          //                 import(
          //                   "@/pages/payroll/tds/taxApproval/deduction.vue"
          //                 ),
          //               meta: {
          //                 roles: [
          //                   "Admin",
          //                   "Dealer",
          //                   "Employee",
          //                   "Manager",
          //                   "accessManager",
          //                 ],
          //               },
          //             },
          //           ],
          //         },
          //         {
          //           path: "taxSetting",
          //           component: () =>
          //             import("@/pages/payroll/tds/taxSettings/taxSettings.vue"),
          //           meta: {
          //             roles: [
          //               "Admin",
          //               "Dealer",
          //               "Employee",
          //               "Manager",
          //               "accessManager",
          //             ],
          //           },
          //         },
          //       ],
          //     },
          //   ],
          // },
          {
            path: "/settings",
            component: ConfigurationTabs,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
            children: [
              {
                path: "organization",
                name: "organization-settings",
                component: OrganizationSettings,
                meta: { roles: ["Admin", "Administrator", "Dealer"] },
              },
            ],
          },
          {
            path: "/settings/roleConfigurator/roleconfig",
            name: "RoleConfigurator",
            component: Roleconfig,
          },
        ],
      },
      {
        path: "/taskManagement/kpi",
        name: "kpi",
        component: Kpi,
      },
      {
        path: "/taskManagement/productviews",
        name: "TaskManagement",
        component: ProductManagementScreen,
        meta: { roles: ["Admin"] },
        props: (route) => ({
          tenantId: "e988162f-6731-4b30-9c4f-f0790fdeb1e8" || "default-tenant",
        }),
      },
      {
        path: "/taskManagement/productviews/deviceManagementScreen",
        name: "deviceManagementScreen",
        component: DeviceManagementScreen,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/taskManagement/productviews/ProductDetailScreen:id",
        name: "ProductDetail",
        component: ProductDetailScreen,
        meta: { roles: ["Admin"] },
        props: true,
      },
      {
        path: "/taskManagement/productviews/edit/:id",
        name: "ProductEdit",
        component: ProductEditScreen,
        meta: { roles: ["Admin"] },
        props: (route) => ({
          tenantId: "e988162f-6731-4b30-9c4f-f0790fdeb1e8" || "default-tenant",
          userId: route.query.userId || "current-user",
          id: route.params.id,
        }),
      },
      {
        path: "/taskManagement/productviews/add",
        name: "ManualEntry",
        component: ManualEntryScreen,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/taskManagement/productviews/devicelist/:productId",
        name: "DeviceList",
        component: DeviceListScreen,
        props: (route) => ({
          productId: route.params.productId,
          productName: route.query.productName,
          initialDevices: JSON.parse(
            decodeURIComponent(route.query.devices || "[]")
          ),
          status: route.query.status,
        }),
      },
      {
        path: "/taskManagement/productviews/bulk-upload",
        name: "BulkUpload",
        component: BulkUploadScreen,
      },
      {
        path: "/taskManagement/productviews/manualdevice/:productId",
        name: "AddAssetManual",
        component: Manualdevice,
        props: true,
      },
      {
        path: "/taskManagement/taskcomponents",
        name: "Dashboard",
        component: TaskDashboard,
      },
      {
        path: "/taskManagement/taskcomponents/complete-work-order/:taskId/:assignFormId",
        name: "CompleteWorkOrder",
        component: CompleteWorkOrderForm,
        props: true,
        meta: { roles: ["Admin", "Employee", "Manager"] },
      },
      {
        path: "/taskManagement/taskcomponents",
        name: "WorkOrderTabs",
        component: WorkOrderTabs,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          {
            path: "",
            name: "WorkOrderTabsDefault",
            redirect: { name: "WorkOrderTasks" },
          },
          {
            path: "workorder",
            name: "WorkOrderTasks",
            component: TasksPage,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "fieldtrip",
            name: "WorkOrderFieldTrip",
            component: FieldTrip,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "workflow",
            name: "workflow",
            component: Workflow,
            meta: { roles: ["Admin", "Manager"] },
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const getRoleLandingPage = (role) => {
  switch (role) {
    case "Admin":
      return "/taskManagement/taskcomponents";
    case "Manager":
      return "/employee-details";
    case "Employee":
      return "/employee-details";
    case "esslAdmin":
      return "/employee-details";
    default:
      return "/login";
  }
};

router.beforeEach(async (to, from, next) => {
  if (typeof localStorage !== "undefined" && to.path !== "/login") {
    localStorage.setItem("lastActivityTime", Date.now().toString());
  }

  const lastActivity = Number.parseInt(
    localStorage.getItem("lastActivityTime") || "0"
  );
  const currentTime = Date.now();
  const inactiveTime = currentTime - lastActivity;
  const inactivityTimeout = 3600000;

  if (
    inactiveTime > inactivityTimeout &&
    to.path !== "/login" &&
    !to.path.startsWith("/pin-verification")
  ) {
    console.log("Inactive for 1hr, redirecting to login");
    localStorage.setItem("inactivityRedirect", "true");
    return next({ path: "/login", query: { timeout: true } });
  }

  if (
    to.path === "/login" ||
    to.path === "/register" ||
    to.path === "/verify" ||
    to.path.startsWith("/pin-verification")
  ) {
    return next();
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authService.isAuthenticated()) {
      return next({ path: "/login" });
    }

    try {
      const storedPhone = authService.getPhone();
      const storedEmail = authService.getEmail();
      let user;

      if (storedEmail) {
        user = await authService.getUserByEmail(storedEmail);
      } else if (storedPhone) {
        user = await authService.getUserByPhone(storedPhone);
      } else {
        return next({ path: "/login" });
      }

      if (user && user.userPin) {
        const pinVerified =
          localStorage.getItem("pinVerifiedInSession") === "true";
        if (!pinVerified && !to.path.startsWith("/pin-verification")) {
          console.log(
            "Redirecting to PIN verification - PIN not verified in this session"
          );

          const redirectPath = storedEmail
            ? `/pin-verification/email/${encodeURIComponent(storedEmail)}`
            : `/pin-verification/phone/${encodeURIComponent(storedPhone)}`;

          return next({
            path: redirectPath,
            query: { fromPinReset: false },
          });
        }
      } else if (user && !user.userPin) {
        const fromOtp =
          localStorage.getItem("fromOtp") === "true" ||
          localStorage.getItem("fromEmailOtp") === "true";
        if (!fromOtp) {
          return next({ path: "/login" });
        }
      }

      const lastActivityCheck = Number.parseInt(
        localStorage.getItem("lastActivityTime") || "0"
      );
      const currentTimeCheck = Date.now();
      const inactiveTimeCheck = currentTimeCheck - lastActivityCheck;
      if (inactiveTimeCheck > inactivityTimeout) {
        localStorage.removeItem("pinVerifiedInSession");
        return next({ path: "/login", query: { timeout: true } });
      }

      if (
        user &&
        user.role &&
        to.meta.roles &&
        !to.meta.roles.includes(user.role.name)
      ) {
        const landingPage = getRoleLandingPage(user.role.name);
        return next(landingPage);
      }

      return next();
    } catch (error) {
      console.error("Error in navigation guard:", error);
      return next("/login");
    }
  }

  next();
});

export default router;
