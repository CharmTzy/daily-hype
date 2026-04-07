// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import CustomTable from "@/components/ui/table";

interface ICartListProps {
  cartData: [string, ...React.ReactNode[]][];
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  pageNo: number;
  setPageNo: React.Dispatch<React.SetStateAction<number>>;
  cartCount: number;
}

const columns = ["Cart ID", "Product Image", "User Name", "Product Name", "Colour", "Size", "Qty", "Status", "Action"];

export default function CartList({ cartData, setLimit, pageNo, setPageNo, cartCount }: ICartListProps) {
  return (
    <div className="w-full max-w-full px-4 py-2">
      <div className="py-4">
        <label className="text-large font-semibold">Cart List</label>
      </div>
      <div className="mb-5">
        <CustomTable columns={columns} rows={cartData} setRowsPerPage={setLimit} page={pageNo} setPage={setPageNo} totalCount={cartCount} />
      </div>
    </div>
  );
}
