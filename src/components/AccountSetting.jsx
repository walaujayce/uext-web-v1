import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "/src/CSS/account.css";

function AccountSetting() {
  const navigate = useNavigate();

  const handleBackBtnClick = () => {
    navigate("/account");
  };
  const [searchParams] = useSearchParams();
  const userid = searchParams.get("userid") || "";
  return (
    <>
      <div className="box">
        <h1>Account Settings</h1>
        <a className="btn frameless" onClick={handleBackBtnClick}>
          <img src="" alt="" className="prefix" />
          <p className="btn-text">Back</p>
        </a>
      </div>
      <div className="accSection">
        <div className="accSetting">
          <h2>User Profile</h2>
          <div className="opt-list">
            <div className="opt-grid">
              <div className="input g-col-3">
                <label for="d-id" className="label-container">
                  <p>Name</p>
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
                    id="d-id"
                    placeholder="ADPS-003078-S"
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-col-3">
                <label for="phone" className="label-container">
                  <p>Phone</p>
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
                    id="phone"
                    placeholder="0983255499"
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-col-3">
                <label for="email" className="label-container">
                  <p>Email</p>
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
                    id="email"
                    placeholder="zoechan@gmail.com"
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-col-3">
                <label for="u-id" className="label-container">
                  <p>User ID</p>
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
                    id="u-id"
                    placeholder="NQR-088465"
                    value={userid}
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
            </div>
            <div className="btn-gp">
              <div className="btn text-only">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
              <div className="btn text-only outline" id="deleteUser">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Delete User</p>
              </div>
            </div>
          </div>
        </div>
        <div className="accSetting">
          <h2>Role & Authority</h2>
          <div className="opt-list">
            <div className="opt-grid">
              <div className="input dropdown role g-col-3 suffix">
                <label for="role" className="label-container">
                  <p>Role</p>
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
                    id="role"
                    placeholder="Select"
                    readOnly
                  />
                  <img className="suffix active" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
                <div className="list">
                  <div className="item opt1">Administrator</div>
                  <div className="item opt2">Engineer</div>
                  <div className="item opt3">User</div>
                </div>
              </div>
            </div>
            <div className="opt-grid">
              <div className="opt-box g-col-3 user">
                <div className="opt on">
                  <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                  <div className="desc-box">
                    <p>Function 1</p>
                    <div className="desc">
                      <p>This is a brief description of the function above.</p>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
              <div className="opt-box g-col-3 user">
                <div className="opt on">
                  <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                  <div className="desc-box">
                    <p>Function 2</p>
                    <div className="desc">
                      <p>This is a brief description of the function above.</p>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
              <div className="opt-box g-col-3 engineer">
                <div className="opt on">
                  <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                  <div className="desc-box">
                    <p>Function 3</p>
                    <div className="desc">
                      <p>This is a brief description of the function above.</p>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
              <div className="opt-box g-col-3 engineer">
                <div className="opt on">
                  <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                  <div className="desc-box">
                    <p>Function 4</p>
                    <div className="desc">
                      <p>This is a brief description of the function above.</p>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
              <div className="opt-box g-col-3 admin">
                <div className="opt on">
                  <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                  <div className="desc-box">
                    <p>Function 5</p>
                    <div className="desc">
                      <p>This is a brief description of the function above.</p>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
              <div className="opt-box g-col-3 admin">
                <div className="opt on">
                  <img src="/src/assets/checkbox-blank-outline.svg" alt="" />
                  <div className="desc-box">
                    <p>Function 6</p>
                    <div className="desc">
                      <p>This is a brief description of the function above.</p>
                    </div>
                  </div>
                </div>
                <div className="assistive-text">This is a line of text</div>
              </div>
            </div>
            <div className="btn-gp">
              <div className="btn text-only">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Save</p>
              </div>
            </div>
          </div>
        </div>
        <div className="accSetting">
          <h2>User Profile</h2>
          <div className="opt-list">
            <div className="opt-grid">
              <div className="input g-col-3">
                <label for="login" className="label-container">
                  <p>Login</p>
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
                    id="login"
                    placeholder="********"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
              <div className="input g-col-3">
                <label for="pw" className="label-container">
                  <p>Password</p>
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
                    id="pw"
                    placeholder="********"
                    readOnly
                  />
                  <img className="suffix" src="" alt="dropdown icon" />
                </div>
                <div className="assistive-text">
                  this is a line of assistive text
                </div>
              </div>
            </div>
            <div className="btn-gp">
              <div className="btn text-only" id="changePassword-2">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">Change Password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountSetting;
