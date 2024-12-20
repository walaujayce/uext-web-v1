import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";
import "/src/CSS/index.css";

export function Bed_disconnect({hold, macaddress, username}){
    return(
        <a className="bed disconnect">
            <div className="b-num">{macaddress}</div>
            <div className="name">{username}</div>
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


export function Bed_vacant({bed,macaddress}){
    return(
        <a className="bed vacant">
            <div className="b-num">{macaddress || "--"}</div>
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


export function Bed_default({hold, macaddress, username}){
    return(
            <a className="bed default">
                <div className="b-num">{macaddress}</div>
                <div className="name">{username}</div>
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

export function Bed_attention({hold, macaddress, username}){
    return(
        <a className="bed attention">
            <div className="b-num">{macaddress}</div>
            <div className="name">{username}</div>
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

export function Bed_alert({hold, macaddress, username, bed}){
    return(
        <a className="bed alert">
            <div className="b-num">{macaddress || "--"}</div>
            <div className="name">{username}</div>
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