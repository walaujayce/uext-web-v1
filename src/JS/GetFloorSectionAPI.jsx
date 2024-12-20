import { useState, useEffect, useRef } from "react";

export const useDropdownLogic = (placeholder) => {
  const [isActive, setActive] = useState(false);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState(placeholder);

  const handleDropdownToggle = () => {
    setActive((prev) => !prev);
  };

  const handleItemClick = (item) => {
    setSelectedPlaceholder(item);
    setActive(false);
  };

  return {
    isActive,
    selectedPlaceholder,
    handleDropdownToggle,
    handleItemClick,
  };
};

export const fetchList = async (url, setData) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const contentType = response.headers.get("Content-Type");
    if (!response.ok || !contentType?.includes("application/json")) {
      throw new Error(`Expected JSON, got: ${contentType}`);
    }
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
