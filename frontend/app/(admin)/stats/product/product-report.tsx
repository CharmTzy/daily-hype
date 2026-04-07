// // Name: Thu Htet San
// // Admin No: 2235022
// // Class: DIT/FT/2B/02

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { ErrorMessage, URL } from "@/enums/global-enums";
import { getAdminProductQuarterStat } from "@/functions/admin-product-functions";
//import { getAdminOrderQuarterRevenueDetail, getAdminOrderQuarterRevenueStat } from "@/functions/order-functions";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BarChart from "@/components/charts/bar-chart";
import CustomTable from "@/components/ui/table";
import { formatDateByMonthDayYear24Hour, formatMoney } from "@/functions/formatter";

const LineChart = dynamic(() => import("@/components/charts/line-chart"));
const PieChart = dynamic(() => import("@/components/charts/pie-chart"));

const yearOptions: number[] = [];
for (let i = 0; i < 10; i++) {
  yearOptions.push(new Date().getFullYear() - i);
}

export default function ProductReport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [chart, setChart] = useState<"bar" | "line" | "pie">("bar");
  const [tableData, setTableData] = useState<[string, ...React.ReactNode[]][]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [tableDataCount, setTableCount] = useState<number>(1);
  const router = useRouter();

  const [data, setData] = useState([
    { data: [0, 0, 0, 0], label: "Man" },
    { data: [0, 0, 0, 0], label: "Woman" },
    { data: [0, 0, 0, 0], label: "Boy" },
    { data: [0, 0, 0, 0], label: "Girl" },
    { data: [0, 0, 0, 0], label: "Baby" },
  ]);
  const [barChartData, setBarChartData] = useState([
    { data: [0, 0, 0, 0], label: "Man", backgroundColor: "rgba(255, 99, 132, 0.5)" },
    { data: [0, 0, 0, 0], label: "Woman", backgroundColor: "rgba(53, 162, 235, 0.5)" },
    { data: [0, 0, 0, 0], label: "Boy", backgroundColor: "rgba(139, 0, 0, 0.5)" },
    { data: [0, 0, 0, 0], label: "Girl", backgroundColor: "rgba(245, 235, 145, 0.5)" },
    { data: [0, 0, 0, 0], label: "Baby", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  ]);
  const [lineChartData, setLineChartData] = useState([
    { data: [0, 0, 0, 0], label: "Man", backgroundColor: "rgba(255, 99, 132, 0.5)", borderColor: "rgb(255, 99, 132)" },
    { data: [0, 0, 0, 0], label: "Woman", backgroundColor: "rgba(53, 162, 235, 0.5)", borderColor: "rgb(53, 162, 235)" },
    { data: [0, 0, 0, 0], label: "Boy", backgroundColor: "rgba(255, 99, 132, 0.5)", borderColor: "rgb(255, 99, 132)" },
    { data: [0, 0, 0, 0], label: "Girl", backgroundColor: "rgba(53, 162, 235, 0.5)", borderColor: "rgb(53, 162, 235)" },
    { data: [0, 0, 0, 0], label: "Baby", backgroundColor: "rgba(255, 99, 132, 0.5)", borderColor: "rgb(255, 99, 132)" },
  ]);
  const [pieChartData, setPieChartData] = useState([
    { data: [0, 0, 0, 0], label: "Man", backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 },
    { data: [0, 0, 0, 0], label: "Woman", backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 },
    { data: [0, 0, 0, 0], label: "Boy", backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 },
    { data: [0, 0, 0, 0], label: "Girl", backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 },
    { data: [0, 0, 0, 0], label: "Baby", backgroundColor: ["rgba(0, 0, 0, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 },
  ]);

  // const generateTable = (quarter: string, type: string, year: number) => {
  //   let tempQuarter = 4;
  //   let tempType: "male" | "female" | "boy" | "girl" | "baby" = "baby";
  //   if (type === "Man") {
  //     tempType = "male";
  //   }else if(type === "Woman"){
  //     tempType = "female";
  //   }else if(type === "Boy"){
  //     tempType = "boy";
  //   }else if(type === "Girl"){
  //     tempType = "girl";
  //   }else{
  //     tempType = "baby";
  //   }
  //   if (quarter === "Quarter 1") {
  //     tempQuarter = 1;
  //   } else if (quarter === "Quarter 2") {
  //     tempQuarter = 2;
  //   } else if (quarter === "Quarter 3") {
  //     tempQuarter = 3;
  //   }
  //   getAdminOrderQuarterRevenueDetail(tempQuarter, tempType, year).then((result) => {
  //     if (result.error) {
  //     } else {
  //       console.log(result.data);
  //       const data = result.data || [];
  //       setColumns(["OrderID", "Order Date", "UserID", "Customer Name", "Gender", "Total Qty", "Total Amount", "Order Status"]);
  //       setTableData(
  //         data.map((item, index) => {
  //           return [
  //             item.orderid.toString(),
  //             <label key={index} className="text-[14px] flex justify-center text-center">
  //               {formatDateByMonthDayYear24Hour(item.createdat)}
  //             </label>,
  //             <label key={index} className="text-[14px] flex justify-center">
  //               {item.userid}
  //             </label>,
  //             <label key={index} className="text-[14px] flex justify-center">
  //               {item.name}
  //             </label>,
  //             <label key={index} className="text-[14px] flex justify-center">
  //               {item.gender === "M" ? "Man" : "Woman"}
  //             </label>,
  //             <label key={index} className="text-[14px] flex justify-center">
  //               {item.totalqty}
  //             </label>,
  //             <label key={index} className="text-[14px] flex justify-center">
  //               ${formatMoney(item.totalamount)}
  //             </label>,
  //             <label key={index} className="text-[14px] flex justify-center capitalize">
  //               {item.orderstatus}
  //             </label>,
  //           ];
  //         })
  //       );
  //     }
  //   });
  // };

  useEffect(() => {
    const timeout = setTimeout(() => {
      getAdminProductQuarterStat(year).then((result) => {
        if (result.error) {
          if (result.error === ErrorMessage.UNAURHOTIZED) {
            alert(ErrorMessage.UNAURHOTIZED);
            router.push(URL.SignOut);
          }
        } else {
          const tempData = result.data || [];
          const tempData2 = [
            { data: [0, 0, 0, 0], label: "Man" },
            { data: [0, 0, 0, 0], label: "Woman" },
            { data: [0, 0, 0, 0], label: "Boy" },
            { data: [0, 0, 0, 0], label: "Girl" },
            { data: [0, 0, 0, 0], label: "Baby" },
          ];
          tempData.forEach((item) => {
            if (item.type === "man") {
              tempData2[0].data[parseInt(item.quarter) - 1] = parseInt(item.soldqty);
            } else if (item.type === "woman") {
              tempData2[1].data[parseInt(item.quarter) - 1] = parseInt(item.soldqty);
            } else if (item.type === "boy") {
              tempData2[2].data[parseInt(item.quarter) - 1] = parseInt(item.soldqty);
            } else if (item.type === "girl") {
              tempData2[3].data[parseInt(item.quarter) - 1] = parseInt(item.soldqty);
            } else {
              tempData2[4].data[parseInt(item.quarter) - 1] = parseInt(item.soldqty);
            }
          });
          setData(tempData2);
        }
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [year]);

  useEffect(() => {
    if (chart === "bar") {
      setBarChartData(data.map((d) => ({
        ...d,
        backgroundColor: d.label === "Man" ? "rgba(255, 99, 132, 0.5)" :
          d.label === "Woman" ? "rgba(53, 162, 235, 0.5)" :
            d.label === "Boy" ? "rgba(139, 0, 0, 0.5)" :
              d.label === "Girl" ? "rgba(245, 235, 145, 0.5)" :
                d.label === "Kid" ? "rgba(48, 223, 145, 0.5)" : "rgba(48, 223, 145, 0.2)", // Default color if label doesn't match
      })));

    } else if (chart === "pie") {
      setPieChartData(data.map((d) => ({ ...d, backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 })));
    } else {setLineChartData(data.map((d) => ({
      ...d,
      backgroundColor: d.label === "Man" ? "rgba(255, 99, 132, 0.5)" :
                       d.label === "Woman" ? "rgba(53, 162, 235, 0.5)" :
                       d.label === "Boy" ? "rgba(139, 0, 0, 0.5)" :
                       d.label === "Girl" ? "rgba(245, 235, 145, 0.5)" :
                       d.label === "Kid" ? "rgba(48, 223, 145, 0.5)" : "rgba(48, 223, 145, 0.2)",
      borderColor: d.label === "Man" ? "rgb(255, 99, 132)" :
                   d.label === "Woman" ? "rgb(53, 162, 235)" :
                   d.label === "Boy" ? "rgb(139, 0, 0)" :
                   d.label === "Girl" ? "rgb(245, 235, 145)" :
                   d.label === "Kid" ? "rgb(48, 223, 145)" : "rgb(48, 223, 145)", 
    })));
    
    }
  }, [data, chart]);

  return (
    <div>
      <div className="flex justify-center mt-8">
        <div className="flex items-center mr-8">
          <label className="mr-4 text-[14px]">Year: </label>
          <Select
            indicator={<KeyboardArrowDown />}
            size="sm"
            value={year}
            onChange={(e, newValue) => {
              if (typeof newValue !== "number") {
                return;
              }
              setYear(newValue);
            }}
            sx={{
              width: "250px",
              [`& .${selectClasses.indicator}`]: {
                transition: "0.2s",
                [`&.${selectClasses.expanded}`]: {
                  transform: "rotate(-180deg)",
                },
              },
            }}
          >
            {yearOptions.map((item, index) => (
              <Option value={item} key={index}>
                {item}
              </Option>
            ))}
          </Select>
        </div>
        <div className="flex items-center ms-8">
          <label className="mr-4 text-[14px]">Chart: </label>
          <Select
            indicator={<KeyboardArrowDown />}
            size="sm"
            value={chart}
            onChange={(e, newValue) => {
              if (newValue === "bar" || newValue === "line" || newValue === "pie") setChart(newValue);
            }}
            sx={{
              width: "250px",
              [`& .${selectClasses.indicator}`]: {
                transition: "0.2s",
                [`&.${selectClasses.expanded}`]: {
                  transform: "rotate(-180deg)",
                },
              },
            }}
          >
            <Option value="bar">Bar Chart</Option>
            <Option value="line">Line Chart</Option>
            <Option value="pie">Pie Chart</Option>
          </Select>
        </div>
      </div>
      {chart === "bar" && <BarChart className="mt-2 mb-4" chartTitle="Sales by Quarter" labels={["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]} datasets={barChartData}
      // onClick={(x, y, label) => generateTable(x, label, year)} 
      />}
      {chart === "line" && <LineChart className="mt-2 mb-4" chartTitle="Sales by Quarter" labels={["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]} datasets={lineChartData} onClick={(value) => alert(value)} />}
      {chart === "pie" && <PieChart chartTitle="Sales by Quarter" labels={["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]} datasets={pieChartData} onClick={(value) => alert(value)} className="mb-4" />}
      {tableData && tableData.length > 0 && <CustomTable rowsPerPage={tableData.length} rows={tableData} columns={columns} totalCount={tableDataCount} onClick={() => alert("HELLO")} />}
    </div>
  );
}
