// Name: Zay Yar Tun
// Admin No: 235035
// Class: DIT/FT/2B/02
// this is taken from https://mui.com/material-ui/react-tabs/#forced-scroll-buttons

"use client";

import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

interface ITabProps {
  itemLabels: string[];
  setSelectedTabValue?: React.Dispatch<React.SetStateAction<number>>;
}

/**
 *
 * @param itemLabels the labels you want to set for tab items - (string[])
 * @param setSelectedTabValue set the selected tab value to your setstate function - (setState)
 * @returns
 */
export default function CustomTab({ itemLabels, setSelectedTabValue }: ITabProps) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (setSelectedTabValue) {
      setSelectedTabValue(newValue);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.paper" }}>
      <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons allowScrollButtonsMobile aria-label="scrollable force tabs example">
        {itemLabels.map((item, index) => (
          <Tab label={item} key={index} />
        ))}
      </Tabs>
    </Box>
  );
}
