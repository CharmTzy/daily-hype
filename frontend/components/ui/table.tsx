// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// this is taken from https://mui.com/material-ui/react-table/#custom-pagination-actions

import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { TableHead } from "@mui/material";
import { useState } from "react";

interface ITableProps {
  columns?: string[];
  rows: [string, ...React.ReactNode[]][];
  totalCount?: number;
  rowsPerPage?: number;
  setRowsPerPage?: React.Dispatch<React.SetStateAction<number>>;
  page?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  onClick?: (clickedValue: string) => void;
  onDoubleClick?: (clickedValue: string) => void;
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

/**
 * mui table for admin panel
 * @param columns columns you want to show - (string[])
 * @param rows rows you want to show - (React.ReactNode[][])
 * @param totalCount the total number you want to show in pagination - (number)
 * @param setRowsPerpage set the current rows per page in your setstate function - (setRowsPerpage(number))
 * @param page current page no (this starts from 0) - (number)
 * @param setPage set the current page in your setstate function - (setPage(number))
 * @param onClick function you want to call when you click on row - (function)
 * @param onDoubleClick function you want to call when you double click on row - (function)
 */
export default function CustomTable({ rowsPerPage, columns, rows, totalCount, setRowsPerPage, page, setPage, onClick, onDoubleClick }: ITableProps) {
  const [localPage, setLocalPage] = useState(page ? page : 0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(rowsPerPage ?? 10);
  rows = rows.filter((r, index) => index < localRowsPerPage);

  if (typeof totalCount === "string") {
    totalCount = parseInt(totalCount);
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setLocalPage(newPage);
    if (setPage) {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (rowsPerPage === undefined) setLocalRowsPerPage(parseInt(event.target.value, 10));
    setLocalPage(0);
    if (setRowsPerPage) {
      setRowsPerPage(parseInt(event.target.value, 10));
    }
    if (setPage) {
      setPage(0);
    }
  };

  return (
    <TableContainer className="mb-4" component={Paper}>
      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
        {columns && columns.length > 0 && (
          <TableHead>
            <TableRow>
              {columns.map((item, index) => (
                <TableCell key={index} style={{ fontWeight: "bold" }} align="center">
                  {item}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              onClick={() => {
                if (onClick) {
                  onClick(row[0]);
                }
              }}
              onDoubleClick={() => {
                if (onDoubleClick) {
                  onDoubleClick(row[0]);
                }
              }}
              className="hover:bg-slate-100 cursor-pointer"
              key={index}
            >
              {row.map((item, index) => (
                <TableCell style={{ textAlign: "center" }} key={index}>
                  {item}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length <= 0 && (
            <TableRow>
              <TableCell colSpan={columns ? columns.length : 6} style={{ textAlign: "center" }} className="hover:bg-slate-100 cursor-pointer">
                No Data Available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15]}
              colSpan={columns && columns.length > 0 ? columns.length : 3}
              count={totalCount ? totalCount : rows.length > 0 ? rows.length : 1}
              rowsPerPage={localRowsPerPage}
              page={localPage}
              slotProps={{
                select: {
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
