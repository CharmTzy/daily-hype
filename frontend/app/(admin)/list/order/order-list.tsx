// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import CustomTable from "@/components/ui/table";
import { URL } from "@/enums/global-enums";
import { useRouter } from "next/navigation";

interface IOrderListProps {
  orderData: [string, ...React.ReactNode[]][];
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  pageNo: number;
  setPageNo: React.Dispatch<React.SetStateAction<number>>;
  orderCount: number;
}

const columns = ["Order ID", "Order Date", "Order Amount", "Customer Name", "Payment Status", "Order Status", "Action"];

export default function OrderList({ orderData, setLimit, pageNo, setPageNo, orderCount }: IOrderListProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-full px-4 py-2">
      <div className="py-4">
        <label className="text-large font-semibold">Order List</label>
      </div>
      <div className="mb-5">
        <CustomTable
          columns={columns}
          rows={orderData}
          setRowsPerPage={setLimit}
          page={pageNo}
          setPage={setPageNo}
          totalCount={orderCount}
        />
      </div>
    </div>
  );
}
