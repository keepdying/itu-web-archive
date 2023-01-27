import React, { useState } from "react";
import Select from "react-select";

const Dropdown = ({ options }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  return (
    <Select options={options} value={selectedOption} onChange={handleChange} />
  );
};
export default Dropdown;
