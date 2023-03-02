import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";

export default function DropdownSelect({
    options,
    label, 
    selectedValue, 
    setSelectedValue, 
    handleChange,
  } : {
    options:Array<{label: string, value: string}>,
    label:string,
    selectedValue:string,
    setSelectedValue: Dispatch<SetStateAction<string>>,
    handleChange:any,
  }
  ) {

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedValue}
        label={label}
        onChange={(e) => {handleChange(e, setSelectedValue)}}
      >
        {
           options.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
            )
           )
        }
      </Select>
    </FormControl>
  );
}