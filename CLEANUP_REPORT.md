# Code Cleanup Report — src/

_Generated 2026-04-22 from ESLint baseline on `src/`._

## Summary

- **Files with issues:** 52 of 65 scanned (only files under `src/`).
- **Total ESLint issues (excluding vendored):** 784 errors, 29 warnings.
- **Auto-fixable issues:** 0. `eslint --fix` made no changes. The recommended ruleset enabled in `eslint.config.js` has no stylistic auto-fix rules; every finding below needs a judgment call.
- **Vendored/third-party files detected:** 3. These inflate the total (see below) and should be excluded from linting, not "cleaned".

## Recommended next actions (in order)

1. **Exclude vendored files from ESLint.** Add the files listed in "Vendored files" to `eslint.config.js`'s `ignores` array. That alone removes the vast majority of reported errors.
2. **Fix real bugs first.** React hook dependency warnings and `no-unreachable` / `no-redeclare` findings often point to actual bugs. Start there — see "Likely real bugs" below.
3. **Remove dead code.** The `no-unused-vars` list is safe dead-code removal: unused imports, unreferenced locals, unused destructured props. Go file-by-file; most are one-line deletions.
4. **Configure globals for your app code.** Many `no-undef` errors in `src/JS/*.js` are likely runtime globals (`cv`, jQuery-like `$`, etc.). Declare them in `languageOptions.globals` rather than deleting usages.
5. **Only then consider structural refactor.** The largest files (see "File size outliers") are candidates, but each one needs its own plan — don't batch.

## Vendored files — exclude from linting

These are third-party libraries checked into `src/JS/`. They produce hundreds of false-positive errors and should not be refactored:

- `src/JS/OpenCV.js` — 48 lines, 525 errors
- `src/JS/Chart.js` — 11455 lines, 24 errors
- `src/JS/Chart-datalabel.js` — 7 lines, 5 errors

Suggested change to `eslint.config.js` line 8:

```js
{ ignores: ['dist', 'src/JS/Chart.js', 'src/JS/Chart-datalabel.js', 'src/JS/OpenCV.js'] },
```

## Likely real bugs (fix these first)

### React hook dependency arrays (`react-hooks/exhaustive-deps`)

Missing deps can cause stale closures — components render with old values. Each one needs a review: either add the dep or explain why it's safe to omit.

**`src/components/OpenCVComponent.jsx`**
- L79: React Hook useEffect has missing dependencies: 'sensor_height' and 'sensor_width'. Either include them or remove the dependency array.
- L367: React Hook useEffect has missing dependencies: 'sensor_height' and 'sensor_width'. Either include them or remove the dependency array.
- L378: React Hook useEffect has a missing dependency: 'print_img'. Either include it or remove the dependency array.

**`src/components/OpenCVComponent2.jsx`**
- L79: React Hook useEffect has missing dependencies: 'sensor_height' and 'sensor_width'. Either include them or remove the dependency array.
- L377: React Hook useEffect has missing dependencies: 'sensor_height' and 'sensor_width'. Either include them or remove the dependency array.
- L388: React Hook useEffect has a missing dependency: 'print_img'. Either include it or remove the dependency array.

**`src/components/ChartComponent.jsx`**
- L397: React Hook useEffect has missing dependencies: 'canvasRef2', 'isStepped', 'xAxisData', and 'xAxisTitle'. Either include them or remove the dependency array.

**`src/components/PatientAlerts.jsx`**
- L137: React Hook useEffect has missing dependencies: 'handleAddAlertTimeSlot' and 'timeSlot.length'. Either include them or remove the dependency array.
- L485: React Hook useEffect has a missing dependency: 'fetchPatientProfile'. Either include it or remove the dependency array.
- L580: React Hook useEffect has a missing dependency: 'updateToggleStatesFromAlertController'. Either include it or remove the dependency array.

**`src/pages/DemoSD.jsx`**
- L73: React Hook useEffect has a missing dependency: 'postData'. Either include it or remove the dependency array.

**`src/components/PatientAnalysis.jsx`**
- L247: React Hook useEffect has missing dependencies: 'filterSelectedDate' and 'handleGetAlgoResult'. Either include them or remove the dependency array.

**`src/components/PatientMonitor.jsx`**
- L135: React Hook useEffect has a missing dependency: 'postData'. Either include it or remove the dependency array.
- L210: React Hook useEffect has a missing dependency: 'fetchPatientProfile'. Either include it or remove the dependency array.

**`src/components/PatientProfile.jsx`**
- L29: React Hook useEffect has an unnecessary dependency: 'window.innerWidth'. Either exclude it or remove the dependency array. Outer scope values like 'window.innerWidth' aren't valid dependencies because mutating them doesn't re-render the component.
- L189: React Hook useEffect has a missing dependency: 'fetchPatientProfile'. Either include it or remove the dependency array.

**`src/components/PatientEngineer.jsx`**
- L101: React Hook useEffect has a missing dependency: 'postData'. Either include it or remove the dependency array.
- L275: React Hook useEffect has missing dependencies: 'edgeboxDropdown', 'edgeparDropdown', 'sitboxDropdown', and 'sitparDropdown'. Either include them or remove the dependency array.
- L364: React Hook useEffect has missing dependencies: 'fetchDeviceInfo' and 'macaddress'. Either include them or remove the dependency array.

**`src/components/AlertList.jsx`**
- L198: React Hook useEffect has missing dependencies: 'setNotificationChecked_PUT' and 'stopSound'. Either include them or remove the dependency array.
- L413: React Hook useEffect has a missing dependency: 'fetchNoticitionList'. Either include it or remove the dependency array.

**`src/components/DeviceSetting.jsx`**
- L266: React Hook useEffect has missing dependencies: 'dhcpDropdown', 'edgeboxDropdown', 'edgeparDropdown', 'floorDropdown', 'sectionDropdown', 'sitboxDropdown', and 'sitparDropdown'. Either include them or remove the dependency array.
- L395: React Hook useEffect has missing dependencies: 'fetchDeviceInfo' and 'macaddress'. Either include them or remove the dependency array.

**`src/components/Navbar.jsx`**
- L43: React Hook useEffect has a missing dependency: 'changeLanguage'. Either include it or remove the dependency array.

**`src/components/AccountSetting.jsx`**
- L136: React Hook useEffect has missing dependencies: 'fetchUserInfo', 'storedUserRole', and 'userid'. Either include them or remove the dependency array.

**`src/components/Footer.jsx`**
- L30: React Hook useEffect has a missing dependency: 'formattedTime'. Either include it or remove the dependency array.

**`src/components/ResetPassword.jsx`**
- L125: React Hook useEffect has missing dependencies: 'handleValidateEmailToken' and 'userid'. Either include them or remove the dependency array.

**`src/pages/Home.jsx`**
- L468: React Hook useEffect has a missing dependency: 'fetchDeviceList'. Either include it or remove the dependency array.

### Unreachable code (`no-unreachable`)

Code after a `return` / `throw` / `break` that can never execute — safe to delete, but worth confirming the logic above is correct first.

_None in your code._
### Variable redeclaration (`no-redeclare`)

_None in your code._
### Function reassignment (`no-func-assign`)

_None in your code._
## Dead code — unused variables & imports (`no-unused-vars`)

Safe to delete in almost every case. Grouped by file, sorted by file volume.

<details><summary><b>`src/components/ChartComponent.jsx`</b> — 32 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useRef' is defined but never used.
- L3: 'data' is defined but never used.
- L4: 'crosshairPlugin' is defined but never used.
- L5: 'id' is defined but never used.
- L9: 'dataType' is defined but never used.
- L110: 'hoverIndex' is assigned a value but never used.
- L114: 'args' is defined but never used.
- L114: 'plugins' is defined but never used.
- L118: 'bottom' is assigned a value but never used.
- L118: 'left' is assigned a value but never used.
- L118: 'right' is assigned a value but never used.
- L118: 'width' is assigned a value but never used.
- L119: 'y' is assigned a value but never used.
- L135: 'args' is defined but never used.
- L135: 'plugins' is defined but never used.
- L139: 'top' is assigned a value but never used.
- L139: 'width' is assigned a value but never used.
- L139: 'height' is assigned a value but never used.
- L226: 'ctx' is assigned a value but never used.
- L228: 'top' is assigned a value but never used.
- L228: 'bottom' is assigned a value but never used.
- L228: 'left' is assigned a value but never used.
- L228: 'right' is assigned a value but never used.
- L228: 'width' is assigned a value but never used.
- L228: 'height' is assigned a value but never used.
- L229: 'x' is assigned a value but never used.
- L229: 'y' is assigned a value but never used.
- L339: 'start' is defined but never used.
- L339: 'end' is defined but never used.
- L344: 'start' is defined but never used.
- L344: 'end' is defined but never used.

</details>

<details><summary><b>`src/components/PatientAlerts.jsx`</b> — 17 unused</summary>

- L1: 'React' is defined but never used.
- L9: 'useSessionStorageState' is defined but never used.
- L13: 'TimeScale' is defined but never used.
- L17: 'i18n' is assigned a value but never used.
- L23: 'currentState' is assigned a value but never used.
- L23: 'setCurrentState' is assigned a value but never used.
- L27: 'timeSlotTemplate' is assigned a value but never used.
- L140: 'isARTChecked' is assigned a value but never used.
- L141: 'handleARTCheckBox' is assigned a value but never used.
- L149: 'isEBRChecked' is assigned a value but never used.
- L150: 'handleEBRCheckBox' is assigned a value but never used.
- L205: 'isRnHBChecked3' is assigned a value but never used.
- L206: 'handleRnHBCheckBox3' is assigned a value but never used.
- L209: 'isRnHBChecked4' is assigned a value but never used.
- L210: 'handleRnHBCheckBox4' is assigned a value but never used.
- L763: 'alertguid' is assigned a value but never used.
- L832: 'alertguid' is assigned a value but never used.

</details>

<details><summary><b>`src/pages/DemoSD.jsx`</b> — 11 unused</summary>

- L1: 'React' is defined but never used.
- L9: 'Link' is defined but never used.
- L9: 'Outlet' is defined but never used.
- L14: 'he' is defined but never used.
- L19: 't' is assigned a value but never used.
- L19: 'i18n' is assigned a value but never used.
- L21: 'role' is assigned a value but never used.
- L23: 'searchParams' is assigned a value but never used.
- L26: 'handleBackBtnClick' is assigned a value but never used.
- L31: 'position' is assigned a value but never used.
- L32: 'duration' is assigned a value but never used.

</details>

<details><summary><b>`src/components/PatientAnalysis.jsx`</b> — 10 unused</summary>

- L1: 'React' is defined but never used.
- L2: 'useLocation' is defined but never used.
- L8: 'OpenCVComponent' is defined but never used.
- L14: 'set' is defined but never used.
- L18: 't' is assigned a value but never used.
- L18: 'i18n' is assigned a value but never used.
- L25: 'formatSecondsToDHMS' is assigned a value but never used.
- L49: 'useDynamicDropdownHeight' is assigned a value but never used.
- L73: 'compareDefaultValueReturnBorderStyle' is assigned a value but never used.
- L119: 'interval' is defined but never used.

</details>

<details><summary><b>`src/components/PatientMonitor.jsx`</b> — 9 unused</summary>

- L1: 'React' is defined but never used.
- L2: 'useLocation' is defined but never used.
- L10: 'Example' is defined but never used.
- L11: 'HeartBeatGraph' is defined but never used.
- L17: 'i18n' is assigned a value but never used.
- L24: 'position' is assigned a value but never used.
- L25: 'duration' is assigned a value but never used.
- L31: 'heartValue' is assigned a value but never used.
- L33: 'requestBody_Breathing' is assigned a value but never used.

</details>

<details><summary><b>`src/components/PatientProfile.jsx`</b> — 8 unused</summary>

- L1: 'React' is defined but never used.
- L2: 'useLocation' is defined but never used.
- L20: 'i18n' is assigned a value but never used.
- L24: 'windowWidth' is assigned a value but never used.
- L191: 'formatDOB' is assigned a value but never used.
- L282: 'data' is assigned a value but never used.
- L301: 'response' is assigned a value but never used.
- L339: 'response' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/ChangePassword.jsx`</b> — 8 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useEffect' is defined but never used.
- L1: 'useRef' is defined but never used.
- L12: 'i18n' is assigned a value but never used.
- L26: 'handleActiveStage2' is assigned a value but never used.
- L35: 'setPlaceholder' is assigned a value but never used.
- L117: 'lastlogin' is assigned a value but never used.
- L117: 'userid' is assigned a value but never used.

</details>

<details><summary><b>`src/components/OpenCVComponent2.jsx`</b> — 7 unused</summary>

- L1: 'React' is defined but never used.
- L4: 'deviceid' is defined but never used.
- L77: 'message' is assigned a value but never used.
- L317: 'sampleData' is assigned a value but never used.
- L342: 'sum' is assigned a value but never used.
- L348: 'maxValue' is assigned a value but never used.
- L350: 'minValue' is assigned a value but never used.

</details>

<details><summary><b>`src/components/FloorSectionBar.jsx`</b> — 7 unused</summary>

- L1: 'React' is defined but never used.
- L11: 'i18n' is assigned a value but never used.
- L106: 'ports' is assigned a value but never used.
- L107: 'isPortActive' is assigned a value but never used.
- L108: 'handlePortDropDownMenu' is assigned a value but never used.
- L112: 'placeholderPort' is assigned a value but never used.
- L114: 'handlePortItemClick' is assigned a value but never used.

</details>

<details><summary><b>`src/components/OpenCVComponent.jsx`</b> — 6 unused</summary>

- L1: 'React' is defined but never used.
- L5: 'deviceid' is defined but never used.
- L77: 'message' is assigned a value but never used.
- L332: 'sum' is assigned a value but never used.
- L338: 'maxValue' is assigned a value but never used.
- L340: 'minValue' is assigned a value but never used.

</details>

<details><summary><b>`src/components/PatientEngineer.jsx`</b> — 6 unused</summary>

- L1: 'React' is defined but never used.
- L2: 'useLocation' is defined but never used.
- L11: 'DatePicker' is defined but never used.
- L17: 'i18n' is assigned a value but never used.
- L23: 'position' is assigned a value but never used.
- L24: 'duration' is assigned a value but never used.

</details>

<details><summary><b>`src/components/AlertList.jsx`</b> — 6 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useRef' is defined but never used.
- L8: 'is' is defined but never used.
- L12: 'i18n' is assigned a value but never used.
- L56: 'saveToLocalStorage' is assigned a value but never used.
- L270: 'mac' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Navbar.jsx`</b> — 6 unused</summary>

- L1: 'React' is defined but never used.
- L2: 'Outlet' is defined but never used.
- L2: 'useNavigate' is defined but never used.
- L8: 'dayjs' is defined but never used.
- L20: 'theme' is assigned a value but never used.
- L20: 'setTheme' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Bed_Cards.jsx`</b> — 6 unused</summary>

- L5: 'React' is defined but never used.
- L9: 'macaddress' is defined but never used.
- L28: 'i18n' is assigned a value but never used.
- L70: 'macaddress' is defined but never used.
- L91: 'macaddress' is defined but never used.
- L112: 'macaddress' is defined but never used.

</details>

<details><summary><b>`src/pages/Patient.jsx`</b> — 6 unused</summary>

- L1: 'React' is defined but never used.
- L2: 'Outlet' is defined but never used.
- L3: 'dayjs' is defined but never used.
- L13: 'AddNewPatient' is defined but never used.
- L18: 'i18n' is assigned a value but never used.
- L201: 'handleAddPatientClick' is assigned a value but never used.

</details>

<details><summary><b>`src/components/DeviceSetting.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L4: 'useDropdownLogic' is defined but never used.
- L7: 'SignalRService' is defined but never used.
- L13: 'PatientMonitor' is defined but never used.
- L18: 'i18n' is assigned a value but never used.

</details>

<details><summary><b>`src/components/DeviceList.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useRef' is defined but never used.
- L2: 'Outlet' is defined but never used.
- L18: 'i18n' is assigned a value but never used.
- L27: 'handleSelectPort' is assigned a value but never used.

</details>

<details><summary><b>`src/components/AlertGanttChart.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L9: 'color' is defined but never used.
- L13: 'i18n' is assigned a value but never used.
- L14: 'role' is assigned a value but never used.
- L44: 'alertSettingListTemplate' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/AddNewDevice.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L12: 'i18n' is assigned a value but never used.
- L251: 'macError' is assigned a value but never used.
- L262: 'deviceid' is assigned a value but never used.
- L262: 'setDeviceId_POST' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/AlertBatchSetting.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useEffect' is defined but never used.
- L1: 'useRef' is defined but never used.
- L12: 'i18n' is assigned a value but never used.
- L14: 'setLoading' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/AlertConfirmOverlay.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useState' is defined but never used.
- L1: 'useEffect' is defined but never used.
- L1: 'useRef' is defined but never used.
- L14: 'i18n' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/CalibrationConfirmOverlay.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useState' is defined but never used.
- L1: 'useEffect' is defined but never used.
- L1: 'useRef' is defined but never used.
- L6: 'i18n' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/DisChargePatient.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useState' is defined but never used.
- L1: 'useEffect' is defined but never used.
- L1: 'useRef' is defined but never used.
- L6: 'i18n' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/LogOut.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useState' is defined but never used.
- L1: 'useEffect' is defined but never used.
- L1: 'useRef' is defined but never used.
- L11: 'i18n' is assigned a value but never used.

</details>

<details><summary><b>`src/pages/Account.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L2: 'Outlet' is defined but never used.
- L3: 'dayjs' is defined but never used.
- L9: 'showAccountList' is assigned a value but never used.
- L11: 'handleHideAccountList' is assigned a value but never used.

</details>

<details><summary><b>`src/pages/Alert.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L1: 'useEffect' is defined but never used.
- L1: 'useState' is defined but never used.
- L2: 'Outlet' is defined but never used.
- L2: 'useLocation' is defined but never used.

</details>

<details><summary><b>`src/pages/Device.jsx`</b> — 5 unused</summary>

- L1: 'React' is defined but never used.
- L5: 'Outlet' is defined but never used.
- L6: 'DeviceSettings' is defined but never used.
- L9: 'showDeviceList' is assigned a value but never used.
- L11: 'handleHideDeviceList' is assigned a value but never used.

</details>

<details><summary><b>`src/components/AccountSetting.jsx`</b> — 4 unused</summary>

- L1: 'React' is defined but never used.
- L11: 'i18n' is assigned a value but never used.
- L184: 'lastlogin' is assigned a value but never used.
- L256: 'data' is assigned a value but never used.

</details>

<details><summary><b>`src/App.jsx`</b> — 3 unused</summary>

- L1: 'useState' is defined but never used.
- L2: 'ReactDOM' is defined but never used.
- L4: 'Router' is defined but never used.

</details>

<details><summary><b>`src/components/AccountList.jsx`</b> — 3 unused</summary>

- L1: 'React' is defined but never used.
- L15: 'i18n' is assigned a value but never used.
- L57: 'handleSendMessage' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/AddNewPatient.jsx`</b> — 3 unused</summary>

- L1: 'React' is defined but never used.
- L15: 'i18n' is assigned a value but never used.
- L22: 'handleOverlayClick' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Modals/AddNewUser.jsx`</b> — 3 unused</summary>

- L1: 'React' is defined but never used.
- L13: 'i18n' is assigned a value but never used.
- L19: 'handleOverlayClick' is assigned a value but never used.

</details>

<details><summary><b>`src/main.jsx`</b> — 3 unused</summary>

- L1: 'StrictMode' is defined but never used.
- L3: 'React' is defined but never used.
- L4: 'ReactDOM' is defined but never used.

</details>

<details><summary><b>`src/JS/AuthContext.jsx`</b> — 2 unused</summary>

- L1: 'React' is defined but never used.
- L32: 'isAudioAllowed' is assigned a value but never used.

</details>

<details><summary><b>`src/JS/GetFloorSectionAPI.jsx`</b> — 2 unused</summary>

- L1: 'useEffect' is defined but never used.
- L1: 'useRef' is defined but never used.

</details>

<details><summary><b>`src/pages/PatientDetail.jsx`</b> — 2 unused</summary>

- L1: 'React' is defined but never used.
- L15: 'i18n' is assigned a value but never used.

</details>

<details><summary><b>`src/components/Footer.jsx`</b> — 1 unused</summary>

- L1: 'React' is defined but never used.

</details>

<details><summary><b>`src/JS/PrivateRoute.jsx`</b> — 1 unused</summary>

- L1: 'React' is defined but never used.

</details>

<details><summary><b>`src/components/HeartRateGraph.jsx`</b> — 1 unused</summary>

- L1: 'React' is defined but never used.

</details>

<details><summary><b>`src/components/RespiratoryGraph.jsx`</b> — 1 unused</summary>

- L1: 'React' is defined but never used.

</details>

## Undefined references (`no-undef`)

**Read before editing:** most of these are *not* bugs in your code. They're runtime globals (`cv` from OpenCV, possibly `$`/jQuery, Node-style `module`/`define` in UMD wrappers) that ESLint doesn't know about. The right fix is almost always to declare them in `eslint.config.js` under `languageOptions.globals`, **not** to delete the usages.

<details><summary><b>`src/JS/overlay.js`</b> — 230 undef references</summary>

- `$` (×230): L1, L4, L7, L10, L12…

</details>

<details><summary><b>`src/JS/dropdown-menu.js`</b> — 68 undef references</summary>

- `$` (×68): L1, L4, L6, L7, L10…

</details>

<details><summary><b>`src/JS/general.js`</b> — 59 undef references</summary>

- `$` (×59): L1, L3, L4, L5, L6…

</details>

<details><summary><b>`src/components/OpenCVComponent.jsx`</b> — 40 undef references</summary>

- `cv` (×40): L187, L190, L197, L198, L201…

</details>

<details><summary><b>`src/components/OpenCVComponent2.jsx`</b> — 40 undef references</summary>

- `cv` (×40): L179, L182, L189, L190, L193…

</details>

<details><summary><b>`src/JS/login.js`</b> — 27 undef references</summary>

- `$` (×27): L1, L2, L5, L6, L7…

</details>

<details><summary><b>`src/JS/account.js`</b> — 26 undef references</summary>

- `$` (×26): L1, L4, L6, L7, L9…

</details>

<details><summary><b>`src/JS/index.js`</b> — 24 undef references</summary>

- `$` (×24): L1, L3, L5, L6, L8…

</details>

<details><summary><b>`src/JS/patient.js`</b> — 9 undef references</summary>

- `$` (×9): L1, L30, L32, L33, L34…

</details>

## Empty blocks (`no-empty`)

_None in your code._
## Other findings

**`src/components/OpenCVComponent.jsx`**
- `no-irregular-whitespace`: 26 occurrence(s) — likely a non-breaking space (U+00A0) from a paste. Find-replace to regular space.

**`src/components/DeviceList.jsx`**
- L462: [react/jsx-key] Missing "key" prop for element in iterator

**`src/JS/AuthContext.jsx`**
- `react-refresh/only-export-components`: L237: Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

## File size outliers — refactor candidates

Large files are hard to test and reason about. None of these are urgent, but if you want to refactor structure, start here. Do one at a time.

| Lines | File | Notes |
|------:|------|-------|
| 1909 | `src/components/DeviceSetting.jsx` | Very large — split by feature/tab/section. |
| 1609 | `src/components/PatientAlerts.jsx` | Very large — split by feature/tab/section. |
| 1223 | `src/components/PatientEngineer.jsx` | Large — look for extractable sub-components or hooks. |
| 1177 | `src/pages/Home.jsx` | Large — look for extractable sub-components or hooks. |
| 713 | `src/components/PatientProfile.jsx` | Moderate — check for duplicated blocks and long JSX returns. |
| 668 | `src/components/Modals/AddNewDevice.jsx` | Moderate — check for duplicated blocks and long JSX returns. |
| 647 | `src/components/AccountSetting.jsx` | Moderate — check for duplicated blocks and long JSX returns. |
| 604 | `src/components/AlertGanttChart.jsx` | Moderate — check for duplicated blocks and long JSX returns. |
| 584 | `src/components/AlertList.jsx` | Consider extracting one or two sub-components. |
| 534 | `src/JS/overlay.js` | Consider extracting one or two sub-components. |
| 512 | `src/components/DeviceList.jsx` | Consider extracting one or two sub-components. |
| 501 | `src/components/Navbar.jsx` | Consider extracting one or two sub-components. |
| 493 | `src/components/PatientAnalysis.jsx` | Consider extracting one or two sub-components. |
| 478 | `src/components/Modals/AddNewPatient.jsx` | Consider extracting one or two sub-components. |
| 434 | `src/components/Modals/AddNewUser.jsx` | Consider extracting one or two sub-components. |
| 407 | `src/components/ChartComponent.jsx` | Consider extracting one or two sub-components. |

**Also worth checking but not in issue list** (0 ESLint issues, but still candidates):
- `src/pages/Home.jsx` — 1,177 lines

## What I did not do

Per your direction (option 1), I did **not** modify any code. I ran `eslint --fix` to confirm there were no auto-fixable issues (there were none with the current ruleset), and produced this report. Nothing under `src/` was changed by me.

## Suggested next step

Pick one of these and tell me which:

- **"Add vendored files to eslint ignore"** — tiny, safe config change. Cuts ~1,100 errors from your lint output.
- **"Strip unused imports/vars in file X"** — I'll do one file at a time so you can review each diff.
- **"Fix hook deps in file X"** — judgment-required, one file at a time.
- **"Plan a refactor for `PatientAlerts.jsx` (or another large file)"** — I'll read it end-to-end and propose a split before touching anything.