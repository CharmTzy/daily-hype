"use client";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
interface ITabProps {
    itemLabels: string[];
    setSelectedTabValue?: React.Dispatch<React.SetStateAction<number>>;
}
export default function CustomTab({ itemLabels, setSelectedTabValue }: ITabProps) {
    const [value, setValue] = React.useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (setSelectedTabValue) {
            setSelectedTabValue(newValue);
        }
    };
    return (<Box sx={{ bgcolor: "background.paper" }}>
      <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons allowScrollButtonsMobile aria-label="scrollable force tabs example">
        {itemLabels.map((item, index) => (<Tab label={item} key={index}/>))}
      </Tabs>
    </Box>);
}

