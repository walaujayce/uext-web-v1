import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";

export function Bed_disconnect(){
    return(
        <a href="#" className="bed disconnect">
            <div className="b-num">1001</div>
            <div className="name">Chan Tai Ming</div>
            <div className="tag">
                <img src="" alt="" />
                <p className="timer">02:14:42</p>
            </div>
            <div className="dis-tag">
                <img src="/src/assets/link-off.svg" alt="" />
                <p>Disconnected</p>
            </div>
            <img className="add" src="/src/assets/add.svg" alt="add icon" />
        </a>
    );
};


export function Bed_vacant(){
    return(
        <a href="#" className="bed vacant">
            <div className="b-num">1002</div>
            <div className="name">Click to add patient</div>
            <div className="tag">
                <img src="" alt="" />
                <p className="timer">02:14:42</p>
            </div>
            <div className="dis-tag">
                <img src="/src/assets/link-off.svg" alt="" />
                <p>Disconnected</p>
            </div>
            <img className="add" src="/src/assets/add.svg" alt="add icon" />
        </a>
    );
};


export function Bed_default(){
    return(
            <a className="bed default">
                <div className="b-num">1003</div>
                <div className="name">Chan Tai Ming</div>
                <div className="tag">
                    <img src="" alt="" />
                    <p className="timer">02:14:42</p>
                </div>
                <div className="dis-tag">
                    <img src="/src/assets/link-off.svg" alt="" />
                    <p>Disconnected</p>
                </div>
                <img className="add" src="/src/assets/add.svg" alt="add icon" />
            </a>
        );
};

export function Bed_attention(){
    return(
        <a href="patient-monitor.html" className="bed attention">
            <div className="b-num">1004</div>
            <div className="name">Chan Tai Ming</div>
            <div className="tag">
                <img src="" alt="" />
                <p className="timer">02:14:42</p>
            </div>
            <div className="dis-tag">
                <img src="/src/assets/link-off.svg" alt="" />
                <p>Disconnected</p>
            </div>
            <img className="add" src="/src/assets/add.svg" alt="add icon" />
        </a>
    );
};

export function Bed_alert({hold}){
    return(
        <a href="patient-monitor.html" className="bed alert">
            <div className="b-num">1005</div>
            <div className="name">Chan Tai Ming</div>
            <div className="tag">
                <img src="" alt="" />
                <p className="timer">{hold}</p>
            </div>
            <div className="dis-tag">
                <img src="/src/assets/link-off.svg" alt="" />
                <p>Disconnected</p>
            </div>
            <img className="add" src="/src/assets/add.svg" alt="add icon" />
        </a>
    );

};