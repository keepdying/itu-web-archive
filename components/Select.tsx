import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

// Define a type for the selected value, which can be a string or an array of strings
type SelectValueType = string | string[];

export default function DropdownSelect<T extends SelectValueType>({
  options,
  label,
  selectedValue,
  setSelectedValue,
  disabled,
  isMulti,
}: {
  options: Array<{ label: string; value: string }>;
  label: string;
  selectedValue: T;
  setSelectedValue: Dispatch<SetStateAction<T>>;
  disabled?: boolean;
  isMulti?: boolean;
}) {
  const handleChange = (event: SelectChangeEvent<T>) => {
    const {
      target: { value },
    } = event;
    setSelectedValue(value as T);
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple={isMulti}
        value={selectedValue}
        label={label}
        onChange={handleChange}
        input={isMulti ? <OutlinedInput label={label} /> : undefined}
        renderValue={
          isMulti
            ? (selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const option = options.find((opt) => opt.value === value);
                    return (
                      <Chip
                        key={value}
                        label={option ? option.label : value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )
            : undefined
        }
      >
        {options.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
