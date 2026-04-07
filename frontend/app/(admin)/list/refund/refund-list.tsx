// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import CustomTable from "@/components/ui/table";

interface IRefundListProps {
  refundData: [string, ...React.ReactNode[]][];
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  pageNo: number;
  setPageNo: React.Dispatch<React.SetStateAction<number>>;
  refundCount: number;
}

const columns = ["Refund ID", "Product Image", "Order ID", "User Name", "Product Name", "Colour", "Size", "Qty", "Action"];

export default function RefundList({ refundData, setLimit, pageNo, setPageNo, refundCount }: IRefundListProps) {
  return (
    <div className="w-full max-w-full px-4 py-2">
      <div className="py-4">
        <label className="text-large font-semibold">Refund List</label>
      </div>
      <div className="mb-5">
        <CustomTable columns={columns} rows={refundData} setRowsPerPage={setLimit} page={pageNo} setPage={setPageNo} totalCount={refundCount} />
      </div>
    </div>
  );
}
