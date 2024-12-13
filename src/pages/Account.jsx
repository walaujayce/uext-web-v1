import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";

function Account() {
  const [accounts, setAccount] = useState([]);

  const fetchAccountList = async () => {
    try {
      const response = await fetch("api/7284/User");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setAccount(data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };
  useEffect(() => {
    fetchAccountList();
    const interval = setInterval(fetchAccountList, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="wrap">
        <Alert />
        <div className="main">
          <div className="box">
            <h1>Account List</h1>
          </div>
          <div className="container">
            <div className="top-bar">
              {/* <FloorSectionBar/> */}
              <div className="input dropdown floor suffix"></div>
              <div className="input dropdown section suffix"></div>
              <div className="input search"></div>
              <div className="btn" id="addUser">
                <img src="" alt="" className="prefix" />
                <p className="btn-text">New User</p>
              </div>
            </div>
            <div className="pl">
              <div className="head">
                <h3 className="fg1">ID</h3>
                <h3 className="fg1">Name</h3>
                <h3 className="fg1">Password</h3>
                <h3 className="fg1">Role</h3>
                <h3 className="fg1">Email</h3>
                <h3 className="fg1">Last Login</h3>
              </div>
              <div className="item-list">
                <a className="item">
                  <h3 className="fg1">NUR-088465</h3>
                  <h3 className="fg1">Chan Tai Ming</h3>
                  <h3 className="fg1">D**********</h3>
                  <h3 className="fg1">Management</h3>
                  <h3 className="fg1">zoechan@gmail.com</h3>
                  <h3 className="fg1">2024-07-31</h3>
                </a>
                {accounts.map((account) => (
                  <a className="item" key={account.userid}>
                    <h3 className="fg1">{account.userid}</h3>
                    <h3 className="fg1">{account.username}</h3>
                    <h3 className="fg1">
                      {account.password[0] +
                        "*".repeat(account.password.length - 1)}
                    </h3>
                    <h3 className="fg1">
                      {account.role === 0
                        ? "Administrator"
                        : account.role === 1
                        ? "Engineer"
                        : "User"}
                    </h3>
                    <h3 className="fg1">{account.email}</h3>
                    <h3 className="fg1">
                      {dayjs(account.lastlogin).format("YYYY-MM-DD")}
                    </h3>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Account;
