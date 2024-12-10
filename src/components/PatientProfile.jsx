import React from 'react';
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";
import "/src/CSS/patient.css";

function PatientProfile(){
    return(
        <div className="pp">
            <h1>Patient Profile</h1>
            <div className="pfl">
                
                {/* Patient ID */}
                <div className="input g-c-6">
                    <label for="p-id" className="label-container">
                        <p>Patient ID</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="p-id" name="p-id" placeholder="FEX-003078" required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Patient Name */}
                <div className="input g-c-6">
                    <label for="name" className="label-container">
                        <p>Name</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="name" name="name" placeholder="Chan Tai Ming"
                            required autoComplete='off'/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                
                {/* Sex */}
                <div className="input g-c-3">
                    <label for="sex" className="label-container">
                        <p>Sex</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="sex" name="sex" placeholder="Male" required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Birthday Date */}
                <div className="input g-c-3">
                    <label for="arrival" className="label-container">
                        <p>Birthday</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="arrival" name="arrival" placeholder="2024/07/22"
                            required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Height */}
                <div className="input g-c-3">
                    <label for="height" className="label-container">
                        <p>Height</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="height" name="height" placeholder="178cm" required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Weight */}
                <div className="input g-c-3">
                    <label for="weight" className="label-container">
                        <p>Weight</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="weight" name="weight" placeholder="66kg" required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Bed */}
                <div className="input g-c-2">
                    <label for="p-id" className="label-container">
                        <p>Bed</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="p-id-bed" name="p-id" placeholder="1012" required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Section */}
                <div className="input g-c-2">
                    <label for="section" className="label-container">
                        <p>Section</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="section" name="section" placeholder="Zone B"
                            required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Floor */}
                <div className="input g-c-2">
                    <label for="floor" className="label-container">
                        <p>Floor</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="floor" name="floor" placeholder="7/F" required/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Device ID */}
                <div className="input g-c-3">
                    <label for="d-id" className="label-container">
                        <p>Device ID</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="d-id" name="d-id" placeholder="RRD42687891S" required
                            readonly/>
                        <img className="suffix" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text">Oops! Something went wrong.</div>
                </div>
                {/* Connection Status */}
                <div className="input g-c-3 suffix">
                    <label for="connection" className="label-container">
                        <p>Connection Status</p>
                        <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                    </label>
                    <div className="input-gp">
                        <input type="text" className="placeholder" id="connection" name="connection" value="Connected"
                            readonly/>
                        <img className="suffix active" src="" alt="dropdown icon"/>
                    </div>
                    <div className="assistive-text active">click to reconnect</div>
                </div>
            </div>
            <div className="btn-gp">
                <div className="btn text-only inactive">
                    <img src="" alt="" className="prefix"/>
                    <p className="btn-text">Save</p>
                </div>
                <div className="btn text-only outline" id="discharge">
                    <img src="" alt="" className="prefix"/>
                    <p className="btn-text">Discharge</p>
                </div>
            </div>
        </div>
    );
}

export default PatientProfile;