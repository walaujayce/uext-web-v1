import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SimpleBackdrop from "./LoadingOverlay";
import api from "../api/apiClient";

function PatientRecord() {
  const { t, i18n } = useTranslation();

  const [searchParams] = useSearchParams();

  const macaddress = searchParams.get("macaddress") || "";

  const [loading, setLoading] = useState(false); //loading screen

  const [record, setRecord] = useState([]);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/7284/db/RecordData/analyse?mac=${macaddress}&timezone=Asia_Taipei`,
      );
      const result = response.data;
      const record = result.data;
      const meta = result.meta;
      setRecord(record);
      console.log("record: ", record);
      console.log("meta: ", meta);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching device data:", error.message, error);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [macaddress]);

  return (
    <>
      <SimpleBackdrop open={loading} />
      <div></div>
    </>
  );
}

export default PatientRecord;
