function Bed_Sort_by_Status() {
  return (
    <>
        {/* Alert Status */}
        <div className="status">
          <div className="title">Alerts</div>
          <div className="status-grid">
            <a href="patient-monitor.html" className="bed alert">
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
            
          </div>
        </div>
        {/* Attention Status */}
        <div className="status">
          <div className="title">Attention</div>
          <div className="status-grid">
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
            
          </div>
        </div>
        {/* Disconnected Status */}
        <div className="status">
          <div className="title">Disconnected</div>
          <div className="status-grid">
            <a href="patient-monitor.html" className="bed disconnect">
              <div className="b-num">1011</div>
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
          </div>
        </div>
        {/* Default Status */}
        <div className="status">
          <div className="title">Normal</div>
          <div className="status-grid">
            <a href="patient-monitor.html" className="bed">
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
            
          </div>
        </div>
        {/* Vacant Status */}
        <div className="status">
          <div className="title">Vacant</div>
          <div className="status-grid">
            <a href="patient-monitor.html" className="bed vacant">
              <div className="b-num">1028</div>
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
            
          </div>
        </div>
    </>
  );
}

export default Bed_Sort_by_Status;
