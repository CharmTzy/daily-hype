// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// this is taken from https://mui.com/joy-ui/react-accordion/#user-settings

"use client";

import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails, { accordionDetailsClasses } from "@mui/joy/AccordionDetails";
import AccordionSummary, { accordionSummaryClasses } from "@mui/joy/AccordionSummary";
import CategoryIcon from "@mui/icons-material/Category";
import PaletteIcon from "@mui/icons-material/Palette";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import Stack from "@mui/joy/Stack";
import SellIcon from "@mui/icons-material/Sell";
import Typography from "@mui/joy/Typography";
import Avatar from "@mui/joy/Avatar";
import FormControl from "@mui/joy/FormControl";
import ListItemContent from "@mui/joy/ListItemContent";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InventoryIcon from "@mui/icons-material/Inventory";
import TableViewIcon from "@mui/icons-material/TableView";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import StarRateIcon from "@mui/icons-material/StarRate";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import Link from "next/link";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import clsx from "clsx";

export default function AdminSideBar() {
  const { userInfo, currentActivePage } = useAppState();
  const isAdmin = userInfo ? (userInfo.role === "admin" ? true : false) : false;

  return (
    <div className="w-[250px] z-10 bg-slate-100 fixed h-screen min-w-[250px] flex flex-col pt-4">
      <Link href={URL.Dashboard} className="text-xl ms-5 font-bold my-2">
        DailyHype
      </Link>
      <div style={{ overflowY: "auto" }} className="px-4 mt-4 pb-4">
        <AccordionGroup
          variant="plain"
          transition="0.2s"
          sx={{
            maxWidth: 400,
            borderRadius: "md",
            [`& .${accordionDetailsClasses.content}.${accordionDetailsClasses.expanded}`]: {
              paddingBlock: "1rem",
            },
            [`& .${accordionSummaryClasses.button}`]: {
              paddingBlock: "0.7rem",
            },
          }}
        >
          <Accordion>
            <AccordionSummary>
              <Avatar size="sm" color="primary">
                <InsertDriveFileIcon />
              </Avatar>
              <ListItemContent>
                <Typography level="title-md">Forms</Typography>
              </ListItemContent>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                {isAdmin && (
                  <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                    <Link href={URL.UserForm} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.UserForm && "text-logo-color")}>
                      <PersonIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                      <label className="cursor-pointer text-[14px] font-medium">User</label>
                    </Link>
                  </FormControl>
                )}

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.CategoryForm} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.CategoryForm && "text-logo-color")}>
                    <CategoryIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Category</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.ColourForm} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.ColourForm && "text-logo-color")}>
                    <PaletteIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Colour</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.ProductForm} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.ProductForm && "text-logo-color")}>
                    <InventoryIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Product</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.SizeForm} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.SizeForm && "text-logo-color")}>
                    <AspectRatioIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Size</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.DeliveryInsert} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.DeliveryForm && "text-logo-color")}>
                    <LocalShippingIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Delivery</label>
                  </Link>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary>
              <Avatar size="sm" color="success">
                <TableViewIcon />
              </Avatar>
              <ListItemContent>
                <Typography level="title-md">Lists</Typography>
              </ListItemContent>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.UserList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.UserList && "text-logo-color")}>
                    <PersonIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">User</label>
                  </Link>
                </FormControl>
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.ProductList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.ProductList && "text-logo-color")}>
                    <InventoryIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Product</label>
                  </Link>
                </FormControl>
                {isAdmin && (
                  <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                    <Link href={URL.CartList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.CartList && "text-logo-color")}>
                      <ShoppingCartIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                      <label className="cursor-pointer text-[14px] font-medium">Cart</label>
                    </Link>
                  </FormControl>
                )}
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.OrderList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.OrderList && "text-logo-color")}>
                    <ListAltIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Order</label>
                  </Link>
                </FormControl>
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.RefundList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.RefundList && "text-logo-color")}>
                    <SellIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Refund</label>
                  </Link>
                </FormControl>
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.DeliveryList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.DeliveryList && "text-logo-color")}>
                    <LocalShippingIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Delivery</label>
                  </Link>
                </FormControl>
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.ReviewList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.ReviewList && "text-logo-color")}>
                    <StarRateIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Review</label>
                  </Link>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary>
              <Avatar size="sm" color="danger">
                <BarChartIcon />
              </Avatar>
              <ListItemContent>
                <Typography level="title-md">Stats</Typography>
              </ListItemContent>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.UserStat} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.UserStat && "text-logo-color")}>
                    <PersonIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">User</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.ProductStat} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.ProductStat && "text-logo-color")}>
                    <InventoryIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Product</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.OrderStat} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.OrderStat && "text-logo-color")}>
                    <ListAltIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Order</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.DeliveryStats} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.DeliveryStat && "text-logo-color")}>
                    <LocalShippingIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Delivery</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.OrderList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.ReviewStat && "text-logo-color")}>
                    <StarRateIcon fontSize="small" sx={{ mx: 2, marginRight: 3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Review</label>
                  </Link>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary>
              <Avatar size="sm" color="neutral">
                <SettingsIcon />
              </Avatar>
              <ListItemContent>
                <Typography level="title-md">Settings</Typography>
              </ListItemContent>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.OrderList} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.AdminProfile && "text-logo-color")}>
                    <PersonIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.1 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Profile</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.SignOut} className={clsx("flex items-center hover:text-logo-color", currentActivePage === CurrentActivePage.AdminSetting && "text-logo-color")}>
                    <SettingsIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.3 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Setting</label>
                  </Link>
                </FormControl>

                <FormControl orientation="horizontal" sx={{ gap: 1 }}>
                  <Link href={URL.SignOut} className="flex items-center hover:text-logo-color">
                    <LogoutIcon fontSize="small" sx={{ mx: 2, marginRight: 3, marginTop: 0.4 }} />
                    <label className="cursor-pointer text-[14px] font-medium">Sign Out</label>
                  </Link>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </div>
    </div>
  );
}
