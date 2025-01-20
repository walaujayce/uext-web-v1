import React, {useState, useEffect} from 'react';
import "/src/CSS/Footer.css";


function Footer(){
    //date
    const [currentDate, setCurrentDate] = useState(new Date());
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now); 
        }
    }, 1000); 

    return () => clearInterval(timer);
    }, [currentDate]);

    //time
    const formattedTime = { hour: '2-digit', minute: '2-digit', hour12: false };
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString(undefined,formattedTime));

    useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString(undefined,formattedTime));
    }, 1000);
    return () => clearInterval(timer);
    }, []);

    return(
    <div className='Footer-container'>
        <img className='Footer-img' src="/src/assets/uneo-logo.png" alt="UNEO Logo" />
        <p className='Footer-copyright'>Copyright ©{currentDate.getFullYear()} Uneo Inc. All rights reserved.</p>
        <div className='Footer-datetime-container'>
            <p className='Footer-date'>{formattedDate}</p>
            <p className='Footer-time'>{currentTime}</p>
        </div>
    </div>
    );
}
export default Footer;