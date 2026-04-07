import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { ErrorMessage, URL } from "@/enums/global-enums";
import { getAdminUserMonthlyStat } from "@/functions/user-functions";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BarChart from "@/components/charts/bar-chart";

const LineChart = dynamic(() => import("@/components/charts/line-chart"));
const PieChart = dynamic(() => import("@/components/charts/pie-chart"));

const yearOptions: number[] = [];
for (let i = 0; i < 10; i++) {
  yearOptions.push(new Date().getFullYear() - i);
}

export default function UserReportMonthly() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [chart, setChart] = useState<"bar" | "line" | "pie">("bar");
  const router = useRouter();

  const [data, setData] = useState([
    { data: [0, 0, 0, 0], label: "Male" },
    { data: [0, 0, 0, 0], label: "Female" },
  ]);
  const [barChartData, setBarChartData] = useState([
    { data: [0, 0, 0, 0], label: "Male", backgroundColor: "rgba(255, 99, 132, 0.5)" },
    { data: [0, 0, 0, 0], label: "Female", backgroundColor: "rgba(53, 162, 235, 0.5)" },
  ]);
  const [lineChartData, setLineChartData] = useState([
    { data: [0, 0, 0, 0], label: "Male", backgroundColor: "rgba(255, 99, 132, 0.5)", borderColor: "rgb(255, 99, 132)" },
    { data: [0, 0, 0, 0], label: "Female", backgroundColor: "rgba(53, 162, 235, 0.5)", borderColor: "rgb(53, 162, 235)" },
  ]);
  const [pieChartData, setPieChartData] = useState([
    { data: [0, 0, 0, 0], label: "Male", backgroundColor: ["rgba(33, 150, 243, 0.2)", "rgba(244, 67, 54, 0.2)", "rgba(76, 175, 80, 0.2)", "rgba(255, 152, 0, 0.2)","rgba(1, 39, 176, 0.2)", "rgba(0, 188, 212, 0.2)", "rgba(121, 85, 72, 0.2)", "rgba(255, 235, 59, 0.2)","rgba(63, 81, 181, 0.2)", "rgba(233, 30, 99, 0.2)", "rgba(205, 220, 57, 0.2)", "rgba(96, 125, 139, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 },
    { data: [0, 0, 0, 0], label: "Female", backgroundColor: ["rgba(33, 150, 243, 0.2)", "rgba(244, 67, 54, 0.2)", "rgba(76, 175, 80, 0.2)", "rgba(255, 152, 0, 0.2)","rgba(1, 39, 176, 0.2)", "rgba(0, 188, 212, 0.2)", "rgba(121, 85, 72, 0.2)", "rgba(255, 235, 59, 0.2)","rgba(63, 81, 181, 0.2)", "rgba(233, 30, 99, 0.2)", "rgba(205, 220, 57, 0.2)", "rgba(96, 125, 139, 0.2)"], borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"], borderWidth: 1 },
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getAdminUserMonthlyStat(year).then((result) => {
        if (result.error) {
          if (result.error === ErrorMessage.UNAURHOTIZED) {
            alert(ErrorMessage.UNAURHOTIZED);
            router.push(URL.SignOut);
          }
        } else {
          const tempData = result.data || [];
          const tempData2 = [
            { data: [0, 0, 0, 0], label: "Male" },
            { data: [0, 0, 0, 0], label: "Female" },
          ];
          tempData.forEach((item) => {
            if (item.gender === "M") {
              tempData2[0].data[item.month - 1] = parseFloat(item.revenue);
            } else {
              tempData2[1].data[item.month - 1] = parseFloat(item.revenue);
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
      setBarChartData(data.map((d) => ({ ...d, backgroundColor: d.label === "Male" ? "rgba(255, 99, 132, 0.5)" : "rgba(53, 162, 235, 0.5)" })));
    } else if (chart === "pie") {
      setPieChartData(data.map((d) => ({ ...d, backgroundColor: ["rgba(33, 150, 243, 0.2)", "rgba(244, 67, 54, 0.2)", "rgba(76, 175, 80, 0.2)", "rgba(255, 152, 0, 0.2)","rgba(1, 39, 176, 0.2)", "rgba(0, 188, 212, 0.2)", "rgba(121, 85, 72, 0.2)", "rgba(255, 235, 59, 0.2)","rgba(63, 81, 181, 0.2)", "rgba(233, 30, 99, 0.2)", "rgba(205, 220, 57, 0.2)", "rgba(96, 125, 139, 0.2)"], borderColor: ["rgba(33, 150, 243, 0.2)", "rgba(244, 67, 54, 0.2)", "rgba(76, 175, 80, 0.2)", "rgba(255, 152, 0, 0.2)","rgba(156, 39, 176, 0.2)", "rgba(0, 188, 212, 0.2)", "rgba(121, 85, 72, 0.2)", "rgba(255, 235, 59, 0.2)","rgba(63, 81, 181, 0.2)", "rgba(233, 30, 99, 0.2)", "rgba(205, 220, 57, 0.2)", "rgba(96, 125, 139, 0.2)"], borderWidth: 1 })));
    } else {
      setLineChartData(data.map((d) => ({ ...d, backgroundColor: d.label === "Male" ? "rgba(255, 99, 132, 0.5)" : "rgba(53, 162, 235, 0.5)", borderColor: d.label === "Male" ? "rgb(255, 99, 132)" : "rgb(53, 162, 235)" })));
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
      {chart === "bar" && <BarChart className="mt-2" chartTitle="Revenue by Quarter" labels={["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November", "December"]} datasets={barChartData} onClick={(value) => alert(value)} />}
      {chart === "line" && <LineChart className="mt-2" chartTitle="Revenue by Quarter"labels={["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November", "December"]} datasets={lineChartData} onClick={(value) => alert(value)} />}
      {chart === "pie" && <PieChart chartTitle="Revenue by Quarter" labels={["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November", "December"]} datasets={pieChartData} onClick={(value) => alert(value)} />}
    </div>

    
  );
}
