import React, { useState, useRef, useEffect } from "react";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "../Modals/overlay.css";
import "/src/CSS/index.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "../LoadingOverlay";

const AddNewPatient = ({ mac, callback }) => {
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false); //loading screen

  {
    /* Handle Overlay Logic */
  }
  const handleOverlayClick = (e) => {
    // Close the modal when clicking outside the modal window
    callback(e);
  };

  const handleWindowClick = (e) => {
    // Prevent event propagation to the overlay
    e.stopPropagation();
  };

  {
    /* Handle Stage 1 Btn Logic */
  }
  const [isActive_Stage2, setActive_Stage2] = useState(false);

  const handleConfirm_S1_Click = () => {
    if (!patientid) {
      patientIdError.setErrorActive(true);
      return;
    }
    if (!patientname) {
      patientnameError.setErrorActive(true);
      return;
    }
    if (!height) {
      patientHeightError.setErrorActive(true);
      return;
    }
    if (!weight) {
      patientWeightError.setErrorActive(true);
      return;
    }
    if (!selectedDate || selectedDate === "") {
      patientDOBError.setErrorActive(true);
      return;
    }
    handleSubmit();
  };

  {
    /* Handle Sex Dropdown Menu */
  }
  const [isSexActive, setSexActive] = useState(false);
  const handleSexDropdown = () => {
    setSexActive((prev) => !prev);
  };
  {
    /* Handle Sex Placeholder */
  }
  const sexes = ["Female", "Male"];
  const [placeholderSex, setPlaceholderSex] = useState(sexes[0]); // Input placeholder

  const handleSexItemClick = (sex) => {
    setPlaceholderSex(sex);
    handleSexDropdown;
    setSex_POST(sex === sexes[0] ? 0 : 1);
  };

  {
    /* Handle Item Select */
  }
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSexActive(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const useDynamicDropdownHeight = (ref, isActive) => {
    useEffect(() => {
      if (ref.current) {
        if (isActive) {
          // Calculate the total height of items
          const items = ref.current.querySelectorAll(".item");
          const totalHeight = Array.from(items).reduce(
            (acc, item) => acc + item.offsetHeight,
            0
          );

          // Set the height dynamically
          ref.current.style.height = `${totalHeight}px`;
        } else {
          // Reset height when inactive
          ref.current.style.height = "0px";
        }
      }
    }, [ref, isActive]);
  };

  const dropdownSexStyleRef = useRef(null);
  useDynamicDropdownHeight(dropdownSexStyleRef, isSexActive);

  {
    /* handle submit logic */
  }
  const [patientname, setPatientName_POST] = useState("");
  const [patientid, setPatientId_POST] = useState("");
  const [height, setHeight_POST] = useState("");
  const [weight, setWeight_POST] = useState("");
  const [sex, setSex_POST] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSubmit = async () => {
    const requestBody = {
      patientname,
      patientid,
      sex,
      birthday: format(selectedDate, "yyyy-MM-dd"),
      height: parseInt(height, 10),
      weight: parseInt(weight, 10),
      deviceid: mac,
    };
    try {
      setLoading(true);
      const response = await fetch("/api/7284/db/Patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        setActive_Stage2(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error while submitting data:", error);
      alert("Error: Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  {
    /* HANDLE INPUT BOX ERROR LOGIC */
  }

  function useErrorState(bool) {
    const [isErrorActive, setErrorActive] = useState(bool);

    return {
      isErrorActive,
      setErrorActive,
    };
  }

  const patientnameError = useErrorState(false);
  const patientIdError = useErrorState(false);
  const patientHeightError = useErrorState(false);
  const patientWeightError = useErrorState(false);
  const patientDOBError = useErrorState(false);

  return (
    <>
      <SimpleBackdrop open={loading} />

      <div
        className="addPatient"
        style={{ display: "block" }}
        onClick={handleWindowClick}
      >
        <div
          className="window"
          style={{ justifyContent: isActive_Stage2 ? "center" : "flex" }}
        >
          <a onClick={callback}>
            <img
              src="/src/assets/close.svg"
              alt="close icon"
              className="close"
            />
          </a>
          <img
            src={`${isActive_Stage2 ? "/src/assets/check-active.svg" : ""}`}
            alt=""
            className="icon"
            style={{ display: isActive_Stage2 ? "block" : "none" }}
          />
          <div className="title-add">{`${
            isActive_Stage2
              ? t("AddPatientModal.AddNewPatient")
              : t("AddPatientModal.AddPatient-h1")
          }`}</div>
          <div
            className="tab-list"
            style={{ display: isActive_Stage2 ? "none" : "" }}
          >
            <a href="#" className="tab active tab-1">
              {t("AddPatientModal.AddPatient-h2")}
            </a>
            {/* <a href="#" className="tab tab-2">
              Bed Location
            </a> */}
          </div>
          {/* Stage 1 */}
          <form action="POST">
            <div
              className="grid st2 active"
              style={{
                display: isActive_Stage2 ? "none" : "",
              }}
            >
              {/* ID */}
              <div className="input g-c-3">
                <label htmlFor="id" className="label-container">
                  <p>{t("AddPatientModal.ID")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="id"
                    name="id"
                    placeholder="Enter here"
                    value={patientid}
                    onChange={(e) => setPatientId_POST(e.target.value)}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div
                  className={`assistive-text ${
                    patientIdError.isErrorActive ? "active" : ""
                  }`}
                >
                  Information Required!
                </div>
              </div>
              {/* Name */}
              <div className="input g-c-3">
                <label htmlFor="name" className="label-container">
                  <p>{t("AddPatientModal.Name")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="name"
                    name="name"
                    placeholder="Enter here"
                    value={patientname}
                    onChange={(e) => setPatientName_POST(e.target.value)}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div
                  className={`assistive-text ${
                    patientnameError.isErrorActive ? "active" : ""
                  }`}
                >
                  Information Required!
                </div>
              </div>
              {/* Height */}
              <div className="input g-c-3">
                <label htmlFor="height" className="label-container">
                  <p>{t("AddPatientModal.Height")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="height"
                    name="height"
                    placeholder="Enter here"
                    value={height}
                    onChange={(e) => setHeight_POST(e.target.value)}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div
                  className={`assistive-text ${
                    patientHeightError.isErrorActive ? "active" : ""
                  }`}
                >
                  Information Required!
                </div>
              </div>
              {/* Weight */}
              <div className="input g-c-3">
                <label htmlFor="weight" className="label-container">
                  <p>{t("AddPatientModal.Weight")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="weight"
                    name="weight"
                    placeholder="Enter here"
                    value={weight}
                    onChange={(e) => setWeight_POST(e.target.value)}
                    required
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div
                  className={`assistive-text ${
                    patientWeightError.isErrorActive ? "active" : ""
                  }`}
                >
                  Information Required!
                </div>
              </div>
              {/* Sex */}
              <div
                className="input dropdown suffix g-c-3"
                onClick={handleSexDropdown}
                ref={dropdownRef}
              >
                <label htmlFor="sex" className="label-container">
                  <p>{t("AddPatientModal.Sex")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div className="input-gp">
                  <input
                    type="text"
                    className="placeholder"
                    id="sex"
                    name="sex"
                    placeholder={placeholderSex}
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  Oops! Something went wrong.
                </div>
                <div
                  className={`list ${isSexActive ? "active" : ""}`}
                  ref={dropdownSexStyleRef}
                >
                  {sexes.map((a) => (
                    <div
                      className="item"
                      key={a}
                      onClick={() => handleSexItemClick(a)}
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </div>
              {/* DOB */}
              <div className="g-c-3">
                <label htmlFor="dob" className="label-container">
                  <p>{t("AddPatientModal.DOB")}</p>
                  <img
                    className="info"
                    src="/src/assets/information-outline.svg"
                    alt="gray outline information icon"
                  />
                </label>
                <div>
                  <DatePicker
                    dateFormat="yyyy/MM/dd"
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    // className="react-date-picker"
                  />
                </div>
                {/* <div
                  className={`assistive-text ${
                    patientDOBError.isErrorActive ? "active" : ""
                  }`}
                >
                  Information Required!
                </div> */}
              </div>
            </div>
            <div
              className="btn-gp st1"
              style={{ display: isActive_Stage2 ? "none" : "" }}
            >
              <div
                className="btn text-only pri"
                onClick={handleConfirm_S1_Click}
              >
                <img src="" alt="" className="prefix" />
                <p className="btn-text pri-text">
                  {t("AddPatientModal.Continue")}
                </p>
              </div>
              <div className="btn text-only outline sec" onClick={callback}>
                <img src="" alt="" className="prefix" />
                <p className="btn-text sec-text">
                  {t("AddPatientModal.Cancel")}
                </p>
              </div>
            </div>
          </form>

          {/* Stage 2 */}
          <div
            className="btn-gp st3"
            style={{ display: isActive_Stage2 ? "flex" : "none" }}
          >
            {/* <div className="btn text-only pri" onClick={callback}>
              <img src="" alt="" className="prefix" />
              <p className="btn-text pri-text">Okay</p>
            </div> */}
            {/* <div className="btn text-only outline sec" >
              <img src="" alt="" className="prefix" />
              <p className="btn-text sec-text">Link a device</p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewPatient;
