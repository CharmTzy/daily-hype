// Name: Thu Htet San

import CustomTable from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface IProductListProps {
  productData: [string, ...React.ReactNode[]][];
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  pageNo: number;
  setPageNo: React.Dispatch<React.SetStateAction<number>>;
  productCount: number;
}

const columns = ["Product ID", "Image", "Product Name", "Category", "Unit Price", "Rating", "Description", "Action"];

export default function ProductList({ productData, setLimit, pageNo, setPageNo, productCount }: IProductListProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-full px-4 py-2">
      <div className="py-4">
        <label className="text-large font-semibold">Product List</label>
      </div>
      <div className="mb-5">
        <CustomTable
          columns={columns}
          rows={productData}
          onClick={(clickedValue) => {
            alert(clickedValue);
            // router.push(URL.AdminOrderDetail + clickedValue);
          }}
          setRowsPerPage={setLimit}
          page={pageNo}
          setPage={setPageNo}
          totalCount={productCount}
        />
      </div>
    </div>
  );
}
