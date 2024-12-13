/* eslint-disable no-unused-vars */
import React, {useEffect,  useState} from 'react';
import { useNavigate } from 'react-router-dom';
import "/src/CSS/Login.css";
import "/src/CSS/btn.css";
import "/src/CSS/general.css";
import "/src/CSS/input.css";
import "/src/CSS/overlay.css";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);
  
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setError("User account and password are required");
        alert(error)
        return;
      }

      const response = await fetch('/api/User');
      if (!response.ok) {
        setError("User account not found");
        alert(error)
        return;
      }

      const data = await response.json();
      console.log(data);
      // Assuming `data.password` contains the stored password
      const user = data.find(user => user.userid === username);

      if (user) {
        console.log('Password:', user.password);
        if (user.password === password) {
          navigate('/home');
        } else {
          setError("Incorrect password");
          alert("Invalid User account or Password!");
        }
      }
      
    } catch (error) {     
      setError("An error occurred while logging in");
      console.error(error);
    }
  };

  return(
    <>
      <img className="background" src="/src/assets/login-bg.svg" alt=""/>
      <div className="login">   
          <img className="uextLogo" src="/src/assets/uext.svg" alt=""/>
          <div className="title">Exit Bed Alarm System</div>

          <form className="st1 active">
              {/* login input box */}
              <div className="input g-c-6">
                  <label for="login" className="label-container">
                      <p>Login</p>
                      <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon"/>
                  </label>
                  <div className="input-gp">
                      <input type="email" pattern="" className="placeholder" name="login" placeholder="Enter here"
                          required  value={username} onChange={(e=>setUsername(e.target.value))} autoComplete='off'/>
                      <img className="suffix" src="/src/assets/eye-off.svg" alt="eye icon" />
                  </div>
                  <div className="assistive-text">Must include one upper and one lower case alphabet.</div>
              </div>

              {/* password input box */}
              <div className="input g-c-6 suffix">
                  <label for="pw" className="label-container">
                      <p>Password</p>
                      <img className="info" src="/src/assets/information-outline.svg" alt="gray outline information icon" />
                  </label>
                  <div className="input-gp">
                      <input type="password" className="placeholder" name="pw" placeholder="Enter here" required 
                      value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete='off'/>
                      <img className="suffix hide" src="/src/assets/eye-off.svg" alt="eye icon" />
                  </div>
                  <div className="assistive-text">Must include one upper and one lower case alphabet.</div>
              </div>

              <div className="btn-gp">
                  {/* login button */}
                  <a className="btn text-only pri" onClick={handleLogin}>
                      <img src="" alt="" className="prefix" />
                      <p className="btn-text pri-text">Login</p>
                  </a>

                  {/* forget password button */}
                  <div className="btn text-only outline sec" id="forget-pw">
                      <img src="" alt="" className="prefix" />
                      <p className="btn-text sec-text">Forget Password</p>
                  </div>
              </div>
          </form>
      </div>
    </>
  );
}

export default Login;
